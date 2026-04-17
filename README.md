# 영업 일일 보고 시스템

영업 사원의 일일 방문 기록·과제·계획을 작성하고, 상급자가 댓글로 피드백하는 웹 애플리케이션입니다.

## 기술 스택

| 분류       | 기술                           |
| ---------- | ------------------------------ |
| 프레임워크 | Next.js 15 (App Router)        |
| 언어       | TypeScript 5                   |
| UI         | shadcn/ui + Tailwind CSS v4    |
| 폼         | react-hook-form + Zod v4       |
| ORM        | Prisma 7 + @prisma/adapter-pg  |
| DB         | PostgreSQL                     |
| 인증       | JWT (jose) + bcryptjs          |
| 테스트     | Vitest + Testing Library + MSW |
| 배포       | Google Cloud Run + Cloud SQL   |

## 빠른 시작

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경변수 설정

```bash
cp .env.example .env
```

`.env`를 열어 실제 값으로 수정합니다.

| 변수                  | 필수 | 설명                                        |
| --------------------- | ---- | ------------------------------------------- |
| `DATABASE_URL`        | ✅   | PostgreSQL 연결 문자열                      |
| `JWT_SECRET`          | ✅   | JWT 서명 키 (32자 이상 권장)                |
| `JWT_ACCESS_EXPIRES`  | ✅   | Access Token 유효기간 (예: `2h`)            |
| `JWT_REFRESH_EXPIRES` | ✅   | Refresh Token 유효기간 (예: `7d`)           |
| `NEXT_PUBLIC_APP_URL` | —    | 앱 공개 URL (기본: `http://localhost:3000`) |

### 3. DB 마이그레이션 및 초기 데이터

```bash
# 마이그레이션 실행
npm run db:migrate

# 테스트 계정·고객 데이터 시드 (개발용)
npm run db:seed
```

시드 계정:

| 이름   | 이메일            | 비밀번호     | 역할    |
| ------ | ----------------- | ------------ | ------- |
| 홍길동 | sales1@test.com   | password1234 | SALES   |
| 김영업 | sales2@test.com   | password1234 | SALES   |
| 이부장 | manager1@test.com | password1234 | MANAGER |

### 4. 개발 서버 실행

```bash
npm run dev
```

`http://localhost:3000` 에서 확인합니다.

## 사용 가능한 명령

```bash
# 개발
npm run dev           # 개발 서버 실행
npm run build         # 프로덕션 빌드
npm run start         # 프로덕션 서버 실행

# 코드 품질
npm run lint          # ESLint 검사
npm run lint:fix      # ESLint 자동 수정
npm run format        # Prettier 포맷
npm run format:check  # Prettier 검사

# 테스트
npm run test          # 테스트 실행
npm run test:watch    # 테스트 감시 모드
npm run test:coverage # 커버리지 리포트

# DB
npm run db:migrate    # 마이그레이션 실행 (개발)
npm run db:migrate:prod  # 마이그레이션 실행 (프로덕션)
npm run db:seed       # 테스트 데이터 시드
npm run db:studio     # Prisma Studio 실행
npm run db:generate   # Prisma Client 재생성
```

## 프로젝트 구조

```
daily-report/
├── prisma/
│   ├── schema.prisma      # DB 스키마 정의
│   ├── seed.ts            # 개발용 초기 데이터
│   └── migrations/        # 마이그레이션 파일
├── prisma.config.ts       # Prisma 7 설정 (datasource URL)
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   └── login/     # SCR-001 로그인
│   │   ├── (dashboard)/
│   │   │   ├── reports/   # SCR-002~004 보고서
│   │   │   ├── customers/ # SCR-005~006 고객 마스터
│   │   │   └── users/     # SCR-007~008 사용자 마스터
│   │   └── api/
│   │       ├── auth/      # 로그인·로그아웃·토큰 갱신
│   │       ├── reports/   # 보고서 CRUD
│   │       ├── customers/ # 고객 CRUD
│   │       ├── users/     # 사용자 CRUD
│   │       ├── problems/  # Problem 댓글
│   │       └── plans/     # Plan 댓글
│   ├── components/
│   │   ├── ui/            # shadcn/ui 자동 생성 컴포넌트
│   │   └── common/        # 공통 레이아웃·내비게이션 등
│   ├── lib/
│   │   ├── api-response.ts  # 공통 API 응답 헬퍼
│   │   ├── env.ts           # 환경변수 검증
│   │   ├── utils.ts         # cn() 유틸리티
│   │   ├── auth/            # JWT 생성·검증, 세션 헬퍼
│   │   ├── db/
│   │   │   └── prisma.ts    # Prisma Client 싱글톤
│   │   └── schemas/         # Zod 입력 스키마
│   │       ├── auth.ts
│   │       ├── report.ts
│   │       ├── comment.ts
│   │       ├── customer.ts
│   │       └── user.ts
│   ├── types/
│   │   ├── index.ts         # 공통 타입 (JWT, Session, Pagination 등)
│   │   ├── api.ts           # API 응답 데이터 타입
│   │   └── form.ts          # 폼 입력 타입
│   └── tests/
│       ├── mocks/           # MSW 핸들러
│       ├── tests/           # 테스트 파일
│       ├── setup.ts         # Vitest 전역 설정
│       └── utils.tsx        # renderWithProviders 헬퍼
├── components.json          # shadcn/ui 설정
├── postcss.config.mjs       # PostCSS (Tailwind v4)
└── docs/
    ├── er-diagram.md
    ├── screen-definition.md
    ├── api-specification.md
    └── test-specification.md
```

## 화면 구성

| 화면 ID | URL                                     | 접근                 |
| ------- | --------------------------------------- | -------------------- |
| SCR-001 | `/login`                                | 전체                 |
| SCR-002 | `/reports`                              | SALES, MANAGER       |
| SCR-003 | `/reports/:id`                          | SALES(본인), MANAGER |
| SCR-004 | `/reports/new`, `/reports/:id/edit`     | SALES                |
| SCR-005 | `/customers`                            | SALES, MANAGER       |
| SCR-006 | `/customers/new`, `/customers/:id/edit` | MANAGER              |
| SCR-007 | `/users`                                | MANAGER              |
| SCR-008 | `/users/new`, `/users/:id/edit`         | MANAGER              |

## API 엔드포인트 요약

| 메서드         | 경로                         | 설명                  | 권한                  |
| -------------- | ---------------------------- | --------------------- | --------------------- |
| POST           | `/api/auth/login`            | 로그인                | 전체                  |
| POST           | `/api/auth/refresh`          | 토큰 갱신             | 전체                  |
| POST           | `/api/auth/logout`           | 로그아웃              | 인증                  |
| GET/POST       | `/api/reports`               | 보고서 목록·작성      | SALES, MANAGER        |
| GET/PUT/DELETE | `/api/reports/:id`           | 보고서 상세·수정·삭제 | SALES(본인), MANAGER  |
| POST           | `/api/problems/:id/comments` | Problem 댓글 등록     | MANAGER               |
| POST           | `/api/plans/:id/comments`    | Plan 댓글 등록        | MANAGER               |
| DELETE         | `/api/comments/:id`          | 댓글 삭제             | MANAGER(본인)         |
| GET/POST       | `/api/customers`             | 고객 목록·등록        | SALES·MANAGER/MANAGER |
| GET/PUT/DELETE | `/api/customers/:id`         | 고객 상세·수정·삭제   | SALES·MANAGER/MANAGER |
| GET/POST       | `/api/users`                 | 사용자 목록·등록      | MANAGER               |
| GET/PUT/DELETE | `/api/users/:id`             | 사용자 상세·수정·삭제 | MANAGER               |

## 배포 (Google Cloud Run)

```bash
# Docker 이미지 빌드
docker build -t daily-report .

# Cloud Run 배포 (GitHub Actions CD로 자동화)
gcloud run deploy daily-report \
  --image gcr.io/PROJECT_ID/daily-report \
  --platform managed \
  --region asia-northeast3 \
  --add-cloudsql-instances PROJECT_ID:REGION:INSTANCE
```

자세한 CI/CD 설정은 `.github/workflows/` 참조.

## 라이선스

Private
