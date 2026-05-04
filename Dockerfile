# --- Stage 1: Build Frontend ---
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# --- Stage 2: Build Backend ---
FROM golang:1.21-alpine AS backend-builder
WORKDIR /app
COPY . .
RUN go build -o gost-manager main.go

# --- Stage 3: Final Image ---
FROM alpine:latest
WORKDIR /app

# Install dependencies (curl for healthcheck/debugging)
RUN apk add --no-cache curl ca-certificates

# Download GOST engine (v3)
RUN ARCH=$(uname -m) && \
    if [ "$ARCH" = "x86_64" ]; then GOST_ARCH="amd64"; \
    elif [ "$ARCH" = "aarch64" ]; then GOST_ARCH="arm64"; \
    else GOST_ARCH="amd64"; fi && \
    curl -LO https://github.com/go-gost/gost/releases/download/v3.0.0-rc10/gost_3.0.0-rc10_linux_${GOST_ARCH}.tar.gz && \
    mkdir -p tmp_gost && \
    tar -zxvf gost_3.0.0-rc10_linux_${GOST_ARCH}.tar.gz -C tmp_gost && \
    mv tmp_gost/gost ./gost-engine && \
    chmod +x gost-engine && \
    rm -rf tmp_gost gost_3.0.0-rc10_linux_${GOST_ARCH}.tar.gz

# Copy built assets from previous stages
COPY --from=backend-builder /app/gost-manager ./
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist
COPY entrypoint.sh ./

# Expose the panel port
EXPOSE 8080

# Expose a range of ports for forwarding (optional, can be expanded via docker run)
EXPOSE 8000-8100

ENTRYPOINT ["./entrypoint.sh"]
