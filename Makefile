# ────────────────────────────────────────────────────────────────
# 설정값 (필요 시 환경변수로 override 가능)
# ────────────────────────────────────────────────────────────────
PROJECT_ID  := ai-chat-492509
REGION      := asia-northeast3
SERVICE     := daily-report
REGISTRY    := $(REGION)-docker.pkg.dev
REPO        := $(REGISTRY)/$(PROJECT_ID)/$(SERVICE)
IMAGE       := $(REPO)/app
TAG         := $(shell git rev-parse --short HEAD 2>/dev/null || echo "latest")

.PHONY: help build push deploy logs open describe rollback \
        setup-apis setup-repo setup-wif setup

# ────────────────────────────────────────────────────────────────
# help
# ────────────────────────────────────────────────────────────────
help: ## 사용 가능한 명령 목록 출력
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) \
	  | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-18s\033[0m %s\n", $$1, $$2}'

# ────────────────────────────────────────────────────────────────
# 로컬 빌드 / 푸시 / 배포
# ────────────────────────────────────────────────────────────────
build: ## Docker 이미지 빌드
	docker build \
	  -t $(IMAGE):$(TAG) \
	  -t $(IMAGE):latest \
	  .
	@echo "Built: $(IMAGE):$(TAG)"

push: ## Artifact Registry 에 이미지 푸시
	docker push $(IMAGE):$(TAG)
	docker push $(IMAGE):latest
	@echo "Pushed: $(IMAGE):$(TAG)"

deploy: ## Cloud Run 에 현재 TAG 배포
	gcloud run deploy $(SERVICE) \
	  --image          $(IMAGE):$(TAG) \
	  --region         $(REGION) \
	  --project        $(PROJECT_ID) \
	  --allow-unauthenticated \
	  --min-instances  0 \
	  --max-instances  10 \
	  --memory         512Mi \
	  --cpu            1 \
	  --port           3000 \
	  --concurrency    80 \
	  --set-secrets    DATABASE_URL=DATABASE_URL:latest,JWT_SECRET=JWT_SECRET:latest
	@echo "Deployed: $(SERVICE) ($(TAG))"

release: build push deploy ## build → push → deploy 순서로 일괄 실행

# ────────────────────────────────────────────────────────────────
# 운영
# ────────────────────────────────────────────────────────────────
logs: ## Cloud Run 실시간 로그 출력
	gcloud run services logs tail $(SERVICE) \
	  --region  $(REGION) \
	  --project $(PROJECT_ID)

open: ## 배포된 서비스 URL 을 기본 브라우저로 열기
	@URL=$$(gcloud run services describe $(SERVICE) \
	  --region $(REGION) --project $(PROJECT_ID) \
	  --format 'value(status.url)'); \
	echo "Opening $$URL"; \
	xdg-open "$$URL" 2>/dev/null || open "$$URL"

describe: ## Cloud Run 서비스 상세 정보 출력
	gcloud run services describe $(SERVICE) \
	  --region  $(REGION) \
	  --project $(PROJECT_ID)

rollback: ## 직전 리비전으로 트래픽 100% 전환
	@PREV=$$(gcloud run revisions list \
	  --service $(SERVICE) --region $(REGION) --project $(PROJECT_ID) \
	  --sort-by ~deployTime --limit 2 \
	  --format 'value(name)' | tail -1); \
	echo "Rolling back to $$PREV"; \
	gcloud run services update-traffic $(SERVICE) \
	  --region $(REGION) --project $(PROJECT_ID) \
	  --to-revisions "$$PREV=100"

# ────────────────────────────────────────────────────────────────
# 초기 GCP 환경 세팅 (최초 1회 실행)
# ────────────────────────────────────────────────────────────────
setup-apis: ## 필요한 GCP API 활성화
	gcloud services enable \
	  run.googleapis.com \
	  artifactregistry.googleapis.com \
	  cloudbuild.googleapis.com \
	  secretmanager.googleapis.com \
	  iamcredentials.googleapis.com \
	  --project $(PROJECT_ID)

setup-repo: ## Artifact Registry Docker 저장소 생성
	gcloud artifacts repositories create $(SERVICE) \
	  --repository-format docker \
	  --location $(REGION) \
	  --project  $(PROJECT_ID) \
	  --description "daily-report app images"

setup-wif: ## GitHub Actions 용 Workload Identity Federation 구성
	$(eval GITHUB_REPO := $(shell git remote get-url origin | sed 's|.*github.com[:/]||;s|\.git$$||'))
	$(eval SA := github-actions@$(PROJECT_ID).iam.gserviceaccount.com)
	$(eval POOL := github-pool)
	$(eval PROVIDER := github-provider)

	@echo "=== Service Account 생성 ==="
	gcloud iam service-accounts create github-actions \
	  --display-name "GitHub Actions" \
	  --project $(PROJECT_ID)

	@echo "=== Cloud Run / Artifact Registry / Secret Manager 권한 부여 ==="
	gcloud projects add-iam-policy-binding $(PROJECT_ID) \
	  --member  "serviceAccount:$(SA)" \
	  --role    "roles/run.admin"
	gcloud projects add-iam-policy-binding $(PROJECT_ID) \
	  --member  "serviceAccount:$(SA)" \
	  --role    "roles/artifactregistry.writer"
	gcloud projects add-iam-policy-binding $(PROJECT_ID) \
	  --member  "serviceAccount:$(SA)" \
	  --role    "roles/secretmanager.secretAccessor"
	gcloud projects add-iam-policy-binding $(PROJECT_ID) \
	  --member  "serviceAccount:$(SA)" \
	  --role    "roles/iam.serviceAccountUser"

	@echo "=== Workload Identity Pool 생성 ==="
	gcloud iam workload-identity-pools create $(POOL) \
	  --location global \
	  --project  $(PROJECT_ID) \
	  --display-name "GitHub Actions Pool"

	@echo "=== Workload Identity Provider 생성 ==="
	gcloud iam workload-identity-pools providers create-oidc $(PROVIDER) \
	  --location                 global \
	  --workload-identity-pool   $(POOL) \
	  --project                  $(PROJECT_ID) \
	  --display-name             "GitHub Provider" \
	  --issuer-uri               "https://token.actions.githubusercontent.com" \
	  --attribute-mapping        "google.subject=assertion.sub,attribute.repository=assertion.repository" \
	  --attribute-condition      "assertion.repository=='$(GITHUB_REPO)'"

	$(eval POOL_ID := $$(gcloud iam workload-identity-pools describe $(POOL) \
	  --location global --project $(PROJECT_ID) --format 'value(name)'))

	@echo "=== Service Account に IAM バインディング ==="
	gcloud iam service-accounts add-iam-policy-binding $(SA) \
	  --project $(PROJECT_ID) \
	  --role    "roles/iam.workloadIdentityUser" \
	  --member  "principalSet://iam.googleapis.com/$(POOL_ID)/attribute.repository/$(GITHUB_REPO)"

	@echo ""
	@echo "=== GitHub Secrets に登録する値 ==="
	@echo "WIF_PROVIDER:"
	@gcloud iam workload-identity-pools providers describe $(PROVIDER) \
	  --location global \
	  --workload-identity-pool $(POOL) \
	  --project $(PROJECT_ID) \
	  --format 'value(name)'
	@echo "WIF_SERVICE_ACCOUNT: $(SA)"

setup: setup-apis setup-repo setup-wif ## GCP 환경 전체 초기화 (최초 1회)
