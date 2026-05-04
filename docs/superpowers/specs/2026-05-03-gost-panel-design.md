# Gost-Simple-Panel Design Spec

## Overview
A minimal web-based control panel for managing GOST (Go Simple Tunnel) rules. It features a "Geek/Terminal" aesthetic and real-time log streaming.

## Backend Architecture
- **Language:** Go (Gin Framework)
- **Data Storage:** `data.json` (Flat file)
- **Authentication:** Header-based (`X-Admin-Password`)

### API Endpoints
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/login` | Validates password | No |
| GET | `/api/rules` | List all rules | Yes |
| POST | `/api/rules` | Create a new rule | Yes |
| DELETE | `/api/rules/:id` | Delete a rule by ID | Yes |
| POST | `/api/apply` | Apply rules to GOST | Yes |
| GET | `/ws` | WebSocket for logs | No (for simplicity) |

### Middleware
- `AuthRequired`: Checks if `X-Admin-Password` header matches the `AdminPassword` in `data.json`.

## Frontend Architecture
- **Framework:** Vite + React (TypeScript)
- **Styling:** Tailwind CSS (Vanilla CSS approach where possible)
- **State Management:** React Hooks (useState/useEffect)
- **Real-time:** WebSocket for log streaming.

### UI Design (Geek Style)
- **Background:** `#0a0a0a` (Deep black/gray)
- **Primary Accent:** `#00ff00` (Terminal Green)
- **Secondary Accent:** `#00d1ff` (Cyber Blue)
- **Font:** Monospace (JetBrains Mono, Fira Code, or generic monospace)
- **Layout:**
  - Sidebar: Branding and navigation.
  - Main Area: Rule table with "Add" and "Delete" actions.
  - Bottom Pane: Terminal-style log viewer.
  - Global: "Apply Changes" button.

## Data Flow
1. User logs in (password saved in `localStorage` or session state).
2. Frontend requests `/api/rules` with auth header.
3. User adds/deletes rules -> Backend updates `data.json`.
4. User clicks "Apply" -> Backend generates GOST config and reloads service.
5. Backend streams logs via `/ws` -> Frontend displays in terminal pane.

## Error Handling
- Backend: Return 401 for invalid auth, 400 for bad input, 500 for storage errors.
- Frontend: Display error messages in a "terminal error" style (red text in logs or toast).
