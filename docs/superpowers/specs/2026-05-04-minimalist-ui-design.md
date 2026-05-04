# Design Doc: Claude-Inspired Minimalist UI for Gost-Simple-Panel

## 1. Overview
The goal is to replace the current "Geek/Terminal" aesthetic with a clean, light-themed, "Claude-inspired" UI. This design prioritizes readability, elegant typography, and a minimalist color palette.

## 2. Design Specifications

### 2.1 Color Palette
- **Background**: `#F9F9F8` (Off-white, main background)
- **Sidebar Background**: `#F3F3F2` (Light grey, sidebar and containers)
- **Accent/Branding**: `#d97757` (Terracotta, primary brand color)
- **Text (Primary)**: `#1d1d1b` (Near black, main text)
- **Text (Secondary)**: `#6b7280` (Muted grey, labels and secondary info)
- **Border Color**: `#e5e5e0` (Light grey, separators)
- **Success**: `#10b981` (Green)
- **Error**: `#ef4444` (Red)

### 2.2 Typography
- **Headers/Titles**: Serif font (e.g., `font-serif` / Playfair Display) - for an elegant, literary feel.
- **Body/Data**: Sans-serif font (e.g., `font-sans` / Inter) - for clarity and modern feel.
- **Logs/Code**: Monospace font (e.g., `font-mono` / JetBrains Mono) - for technical data and logs.

### 2.3 Layout
- **Sidebar**: Fixed left sidebar (240px) containing the brand logo ("G" in terracotta square) and navigation links.
- **Main View**: A scrollable area with a maximum width of 1200px, centered.
- **Header**: Contains the current section title (Serif) and global actions like "Apply Config".

## 3. Component Details

### 3.1 Login Page
- Centered card on `#F9F9F8` background.
- "G" logo square.
- Minimalist password input with subtle border.
- Primary button in `#1d1d1b` or terracotta.

### 3.2 Dashboard (Active Services)
- **Header**: "Active Services" (Serif) with a "+ New Rule" button.
- **Table**: 
  - Columns: Name, Protocol, Mapping (e.g., "8080 -> 127.0.0.1:80"), Action.
  - Minimalist styling: horizontal borders only, subtle hover state.
- **Add Rule Modal**: A clean modal for entry.

### 3.3 Logs View
- Dedicated section or integrated into dashboard.
- Background: `#F3F3F2`.
- Text: `#1d1d1b` in `font-mono`.
- Auto-scroll to bottom.

### 3.4 Apply Changes Button
- Fixed at the top-right or bottom-right.
- State-aware (Applying, Applied, Failed).

## 4. Technical Implementation
- **Framework**: React 19 (TypeScript).
- **Styling**: Tailwind CSS 4.
- **Icons**: Lucide React.
- **API**: Axios for CRUD, WebSocket for logs.

## 5. Success Criteria
- UI matches the color palette and typography specified.
- Responsive layout works on mobile and desktop.
- Build command `npm run build` completes without errors.
