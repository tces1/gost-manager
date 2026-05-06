# GOST Manager 🚀

[![Go Version](https://img.shields.io/badge/Go-1.21+-00ADD8?style=flat-square&logo=go)](https://golang.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![Docker](https://img.shields.io/badge/Docker-Supported-2496ED?style=flat-square&logo=docker)](https://www.docker.com/)

**GOST Manager** is a modern, high-end web control panel designed for the [GOST](https://github.com/go-gost/gost) proxy engine. It provides an intuitive interface to manage port forwarding rules with real-time feedback and a professional aesthetic.

[English | [中文说明](#中文说明)]

![GOST Manager dashboard](docs/assets/gost-manager-dashboard.png)

Supported Docker image platforms:
- `linux/amd64`
- `linux/arm64`
- `linux/arm/v7` for common ARM routers and edge devices

---

## Features

- **Elegant UI**: A polished dashboard with a modern glassmorphism style and a clean operations-focused layout.
- **Auto Sync**: Adding or deleting a rule regenerates config and reloads the GOST engine automatically.
- **Real-time Metrics**:
  - **CPU Usage**: High-frequency polling for quick system feedback.
  - **Live Logs**: WebSocket-based live log streaming in the UI.
- **Security**:
  - Password-protected login.
  - In-app admin password updates.
- **Responsive**: Usable on desktop, tablet, and mobile.
- **One-Container Deployment**: Docker image includes the GOST engine and the web panel.

---

## Quick Start

### Docker Deployment

Run the container with:

```bash
docker run -d \
  --name gost-manager \
  -p 8080:8081 \
  -p 8000-8100:8000-8100 \
  -v ./data:/app/config \
  --restart always \
  tces1/gost-manager
```
`8080` is the panel port. `8000-8100` is the reserved forwarding port range.

### Local Build

For local development on the current machine, the project provides a cross-platform build script that will:

- build `gost-manager` for the current architecture
- download the matching `gost-engine` binary for the current OS and architecture
- build the frontend assets

```bash
./scripts/build-local.sh
./gost-manager
```

Open `http://localhost:8081`. The default password is `admin`.

If you prefer to run the steps manually:

1. **Build the frontend**:
   ```bash
   cd frontend
   npm ci
   npm run build
   ```

2. **Build the backend**:
   ```bash
   cd ..
   go build -o gost-manager main.go
   ```

3. **Download the matching GOST engine**:
   ```bash
   ./scripts/install-gost-engine.sh
   ```

4. **Start the panel**:
   ```bash
   ./gost-manager
   ```
   Open `http://localhost:8081`. The default password is `admin`.

---

## Tech Stack

- **Backend**: Go (Gin Framework)
- **Frontend**: React 19 + TypeScript + Vite
- **Styling**: Tailwind CSS 4.0
- **Icons**: Lucide React
- **Engine**: GOST v3 (Integrated)

---

## Structure

```text
.
├── main.go            # Backend entrypoint and API routes
├── config/            # Persistence and storage
├── gost/              # GOST process management and config generation
├── ws/                # WebSocket hub
├── frontend/          # React frontend source
├── Dockerfile         # Multi-stage image build
└── entrypoint.sh      # Container startup script
```

---

## Contribution

Issues and pull requests are welcome.

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push the branch (`git push origin feature/AmazingFeature`)
5. Open a pull request

---

## License

This project is released under the [MIT License](LICENSE).

---

<a name="中文说明"></a>
## 中文说明

**GOST Manager** 是一个面向 [GOST](https://github.com/go-gost/gost) 的现代化 Web 控制面板，支持通过图形界面管理端口转发规则，并提供实时日志、系统状态和自动同步能力。

- 支持 `linux/amd64`、`linux/arm64`、`linux/arm/v7` Docker 镜像
- 支持本机构建脚本，自动下载匹配平台的 `gost-engine`
- 默认访问地址：`http://localhost:8081`
- 默认密码：`admin`
