# ────────────────────────────────────────────────────────────────
# Stage 1: 의존성 설치
# ────────────────────────────────────────────────────────────────
FROM node:20-alpine AS deps
WORKDIR /app

COPY package*.json ./
RUN npm ci

# ────────────────────────────────────────────────────────────────
# Stage 2: 빌드
# ────────────────────────────────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app

ENV NEXT_TELEMETRY_DISABLED=1

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npm run build

# ────────────────────────────────────────────────────────────────
# Stage 3: 실행 (standalone 번들만 복사 → 최소 이미지)
# ────────────────────────────────────────────────────────────────
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# 보안: root 가 아닌 전용 사용자로 실행
RUN addgroup --system --gid 1001 nodejs \
 && adduser  --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# standalone 출력 복사
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

# Cloud Run 은 PORT 환경변수로 포트를 주입
ENV PORT=3000
EXPOSE 3000

CMD ["node", "server.js"]
