# ── Stage 1: build Vite ─────────────────────────────────────────────────────────
FROM node:22-alpine AS builder
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
# Vite build menghasilkan static files di /app/dist
RUN npm run build

# ── Stage 2: serve dengan Nginx ─────────────────────────────────────────────────
FROM nginx:1.27-alpine AS runner

# Hapus default config Nginx
RUN rm /etc/nginx/conf.d/default.conf

# Copy hasil build
COPY --from=builder /app/dist /usr/share/nginx/html

# Nginx config untuk SPA (React Router) — injected dari docker-compose via volume
# atau langsung di-copy di sini sebagai default
COPY nginx-spa.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
