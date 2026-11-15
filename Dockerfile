# syntax=docker/dockerfile:1
FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginxinc/nginx-unprivileged:alpine AS runtime
# Refresh Alpine packages to patched repository versions before shipping the runtime image.
USER root
RUN apk upgrade --no-cache
COPY --from=build --chown=101:101 /app/dist /usr/share/nginx/html
COPY --chown=101:101 docker/nginx.conf /etc/nginx/conf.d/default.conf
USER 101
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -q -O /dev/null http://127.0.0.1:8080/ || exit 1
