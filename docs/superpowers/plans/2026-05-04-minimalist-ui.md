# Minimalist UI Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement a Claude-inspired minimalist UI for the Gost-Simple-Panel project.

**Architecture:** A React 19 frontend with Tailwind CSS 4 for styling. It uses a fixed sidebar layout, clean typography (Serif/Sans/Mono), and a warm terracotta accent. Communications are handled via Axios for REST APIs and a WebSocket for real-time logs.

**Tech Stack:** React 19, Tailwind CSS 4, Lucide React, Axios, TypeScript.

---

### Task 1: Update Tailwind Configuration and Base Styles

**Files:**
- Modify: `frontend/src/index.css`

- [ ] **Step 1: Update `index.css` with the new theme and variables**

```css
@import "tailwindcss";

@theme {
  --color-brand: #d97757;
  --color-bg-main: #F9F9F8;
  --color-bg-sidebar: #F3F3F2;
  --color-text-primary: #1d1d1b;
  --color-text-secondary: #6b7280;
  --color-border-subtle: #e5e5e0;
}

@layer base {
  body {
    @apply bg-bg-main text-text-primary font-sans antialiased;
  }
  
  h1, h2, h3, h4, h5, h6 {
    @apply font-serif;
  }
}

/* Custom Scrollbar */
::-webkit-scrollbar {
  width: 6px;
}

::-webkit-scrollbar-track {
  @apply bg-transparent;
}

::-webkit-scrollbar-thumb {
  @apply bg-border-subtle rounded-full;
}

::-webkit-scrollbar-thumb:hover {
  @apply bg-gray-300;
}
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/index.css
git commit -m "style: update tailwind theme and base styles for minimalist UI"
```

### Task 2: Implement Layout Components

**Files:**
- Modify: `frontend/src/App.tsx` (Complete rewrite of the UI structure)

- [ ] **Step 1: Implement the Sidebar and Main Layout structure**

- [ ] **Step 2: Implement the Login Page**

- [ ] **Step 3: Commit**

```bash
git add frontend/src/App.tsx
git commit -m "feat: implement minimalist layout and login page"
```

### Task 3: Implement Dashboard and Rule Management

**Files:**
- Modify: `frontend/src/App.tsx`

- [ ] **Step 1: Implement the Dashboard view with the Rules table**

- [ ] **Step 2: Commit**

```bash
git add frontend/src/App.tsx
git commit -m "feat: implement minimalist dashboard and rules table"
```

### Task 4: Final Integration and Build

**Files:**
- Modify: `frontend/src/App.tsx` (Final assembly)
- Build: `npm run build`

- [ ] **Step 1: Integrate Modal for adding rules and Logs view**
- [ ] **Step 2: Run build and verify**

```bash
cd frontend
npm run build
```

- [ ] **Step 3: Commit**

```bash
git add frontend/src/App.tsx
git commit -m "feat: final UI assembly and integration"
```
