# syntax=docker/dockerfile:1
# Builds the SPA and serves it from NGINX, which also proxies /api to the API.
FROM node:22-alpine AS build

WORKDIR /app

COPY frontend/package.json frontend/package-lock.json* ./
RUN npm ci --no-audit --no-fund || npm install --no-audit --no-fund

COPY frontend/ ./
# Baked at build time: Vite inlines VITE_* variables.
ARG VITE_API_URL=/api
ARG VITE_SITE_URL=http://localhost:8080
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_SITE_URL=$VITE_SITE_URL
RUN npm run build


FROM nginx:1.27-alpine AS runtime

RUN rm /etc/nginx/conf.d/default.conf
COPY docker/nginx.conf /etc/nginx/nginx.conf
COPY --from=build /app/dist /usr/share/nginx/html

RUN touch /var/run/nginx.pid \
    && chown -R nginx:nginx /var/run/nginx.pid /var/cache/nginx /usr/share/nginx/html

USER nginx
EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=5s --retries=5 \
    CMD wget -q --spider http://localhost:8080/healthz || exit 1

CMD ["nginx", "-g", "daemon off;"]
