# Gost-Simple-Panel Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement CRUD APIs for rule management and a React-based "Geek" style frontend.

**Architecture:** Backend uses Gin for REST APIs and WebSocket log streaming. Frontend uses Vite + React + Tailwind. Auth is via a simple header check.

**Tech Stack:** Go (Gin), React (TypeScript), Tailwind CSS, Lucide React (Icons).

---

### Task 1: Backend - Auth Middleware & Login API

**Files:**
- Modify: `main.go`
- Modify: `config/storage.go`

- [ ] **Step 1: Add Auth Middleware to `main.go`**
Add a middleware that checks the `X-Admin-Password` header.

- [ ] **Step 2: Implement `/api/login` endpoint**
A simple check against `AdminPassword`.

- [ ] **Step 3: Test Auth**
Run `go run main.go` and use `curl` to verify:
`curl -X POST http://localhost:8080/api/login -H "X-Admin-Password: admin"`

- [ ] **Step 4: Commit**
`git commit -m "feat(backend): add auth middleware and login api"`

### Task 2: Backend - Rules CRUD APIs

**Files:**
- Modify: `main.go`

- [ ] **Step 1: Implement `GET /api/rules`**
Return all rules from `data.json`.

- [ ] **Step 2: Implement `POST /api/rules`**
Add a new rule with a generated UUID.

- [ ] **Step 3: Implement `DELETE /api/rules/:id`**
Remove a rule by ID.

- [ ] **Step 4: Test CRUD**
Verify with `curl` for each endpoint.

- [ ] **Step 5: Commit**
`git commit -m "feat(backend): add rules crud apis"`

### Task 3: Frontend - Scaffolding & Theme

**Files:**
- Create: `frontend/` (Vite project)
- Modify: `frontend/tailwind.config.js`
- Modify: `frontend/src/index.css`

- [ ] **Step 1: Scaffold Vite Project**
`npm create vite@latest frontend -- --template react-ts`

- [ ] **Step 2: Install Dependencies**
`cd frontend && npm install && npm install -D tailwindcss postcss autoprefixer lucide-react clsx tailwind-merge`
`npx tailwindcss init -p`

- [ ] **Step 3: Configure Tailwind & Geek Theme**
Set background to black and primary colors to terminal green/cyber blue.

- [ ] **Step 4: Commit**
`git commit -m "feat(frontend): scaffold project and setup geek theme"`

### Task 4: Frontend - Auth & API Layer

**Files:**
- Create: `frontend/src/lib/api.ts`
- Create: `frontend/src/components/Login.tsx`

- [ ] **Step 1: Create API helper**
A fetch wrapper that automatically adds the `X-Admin-Password` header from `localStorage`.

- [ ] **Step 2: Implement Login Page**
Minimalistic terminal-like login form.

- [ ] **Step 3: Commit**
`git commit -m "feat(frontend): add auth and api layer"`

### Task 5: Frontend - Dashboard & Rule Management

**Files:**
- Create: `frontend/src/components/Dashboard.tsx`
- Create: `frontend/src/components/RuleTable.tsx`
- Create: `frontend/src/components/AddRuleDialog.tsx`

- [ ] **Step 1: Implement Rule Table**
Display name, protocol, ports, and delete button.

- [ ] **Step 2: Implement Add Rule Dialog**
Form to create new rules.

- [ ] **Step 3: Implement Apply Button**
Trigger `/api/apply` and show status.

- [ ] **Step 4: Commit**
`git commit -m "feat(frontend): add dashboard and rule management"`

### Task 6: Frontend - Real-time Logs Terminal

**Files:**
- Create: `frontend/src/components/LogTerminal.tsx`

- [ ] **Step 1: Implement WebSocket Connection**
Connect to `/ws` and buffer logs.

- [ ] **Step 2: Implement Terminal UI**
Auto-scrolling, monospace font, green text on black.

- [ ] **Step 3: Commit**
`git commit -m "feat(frontend): add real-time log terminal"`

### Task 7: Integration - Serving Frontend from Go

**Files:**
- Modify: `main.go`

- [ ] **Step 1: Build Frontend**
`cd frontend && npm run build`

- [ ] **Step 2: Update `main.go` to serve static files**
Use `r.Static("/assets", "./frontend/dist/assets")` and `r.NoRoute` to serve `index.html`.

- [ ] **Step 3: Final Verification**
Run `go run main.go` and access `http://localhost:8080`.

- [ ] **Step 4: Commit**
`git commit -m "feat: serve frontend from go backend"`
