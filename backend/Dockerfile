# ── Stage 1: install dependencies ───────────────────────────────────────────────
FROM node:22-alpine AS deps
WORKDIR /app

# Copy package files dan prisma schema SEBELUM npm ci
# karena postinstall script menjalankan "prisma generate" yang butuh schema
COPY package.json package-lock.json ./
COPY prisma ./prisma

RUN npm ci

# ── Stage 2: production image ───────────────────────────────────────────────────
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# Copy deps (sudah include node_modules + prisma client yang sudah di-generate)
COPY --from=deps /app/node_modules ./node_modules

# Copy source code dan prisma
COPY package.json ./
COPY prisma ./prisma
COPY src ./src

EXPOSE 4000

# Jalankan migration lalu start server
CMD ["sh", "-c", "npx prisma migrate deploy && node src/index.js"]
