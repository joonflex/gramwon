# Stage 1: Dependencies
FROM node:20-alpine@sha256:2f46fd49c767554c089a5eb219115313b72748d8f62f5eccb58ef52bc36db4ad AS deps

# 보안 업데이트 설치
RUN apk update && apk upgrade --no-cache && \
    apk add --no-cache libc6-compat dumb-init && \
    rm -rf /var/cache/apk/*

WORKDIR /app

# package 파일 복사 및 의존성 설치 (devDependencies 포함 - 빌드에 필요)
COPY package.json package-lock.json* ./
RUN npm ci --ignore-scripts && \
    npm cache clean --force

# Stage 2: Builder
FROM node:20-alpine@sha256:2f46fd49c767554c089a5eb219115313b72748d8f62f5eccb58ef52bc36db4ad AS builder

# 보안 업데이트
RUN apk update && apk upgrade --no-cache && \
    rm -rf /var/cache/apk/*

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1

# 빌드
RUN npm run build

# Stage 3: Runner (최종 실행 이미지)
FROM node:20-alpine@sha256:2f46fd49c767554c089a5eb219115313b72748d8f62f5eccb58ef52bc36db4ad AS runner

# 보안 업데이트 및 필수 도구만 설치
RUN apk update && apk upgrade --no-cache && \
    apk add --no-cache dumb-init wget && \
    rm -rf /var/cache/apk/* /tmp/* /var/tmp/*

WORKDIR /app

# 환경변수
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# 비root 사용자 생성
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs && \
    chown -R nextjs:nodejs /app

# 필요한 파일만 복사
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# 쓰기 가능한 디렉토리 생성 (tmpfs와 함께 사용)
RUN mkdir -p /app/.next/cache && \
    chown -R nextjs:nodejs /app/.next/cache

# 비root 사용자로 전환
USER nextjs

EXPOSE 3000

# dumb-init으로 프로세스 관리
ENTRYPOINT ["dumb-init", "--"]

# Healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000 || exit 1

CMD ["node", "server.js"]
