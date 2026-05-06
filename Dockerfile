# syntax=docker/dockerfile:1.7

# --- Stage 1: Build Frontend ---
FROM --platform=$BUILDPLATFORM node:20-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# --- Stage 2: Build Backend ---
FROM --platform=$BUILDPLATFORM golang:1.25-alpine AS backend-builder
WORKDIR /app
ARG TARGETOS
ARG TARGETARCH
COPY . .
RUN CGO_ENABLED=0 GOOS=${TARGETOS:-linux} GOARCH=${TARGETARCH:-amd64} go build -o gost-manager main.go

# --- Stage 3: Final Image ---
FROM alpine:latest
WORKDIR /app
ARG GOST_VERSION=3.0.0-rc10
ARG TARGETOS
ARG TARGETARCH

# Install dependencies (curl for healthcheck/debugging)
RUN apk add --no-cache curl ca-certificates

COPY scripts ./scripts
RUN chmod +x ./scripts/*.sh && \
    TARGETOS=${TARGETOS:-linux} TARGETARCH=${TARGETARCH:-amd64} ./scripts/install-gost-engine.sh "$GOST_VERSION" /app/gost-engine && \
    rm -rf ./scripts

# Copy built assets from previous stages
COPY --from=backend-builder /app/gost-manager ./
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist
COPY entrypoint.sh ./

# Expose the panel port
EXPOSE 8081

# Expose a range of ports for forwarding (optional, can be expanded via docker run)
EXPOSE 8000-8100

ENTRYPOINT ["./entrypoint.sh"]
