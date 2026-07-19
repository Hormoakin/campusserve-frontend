# CampusServe - Frontend

CampusServe is a University Maintenance Service Request Management System. This repository contains the React + TypeScript frontend SPA that provides role-based dashboards for students, maintenance officers, and administrators.

---

## 🌐 Live URLs

| Resource | URL |
|---|---|
| **Live Application** | https://campusserve-frontend.vercel.app |
| **Backend API** | https://campusserve-backend-production.up.railway.app/api/ |
| **API Documentation** | https://campusserve-backend-production.up.railway.app/api/schema/swagger-ui/ |

### Test Credentials

| Role | Email | Password |
|---|---|---|
| Administrator | admin@campusserve.edu | Admin1234! |
| Student | student@uni.edu | Test1234! |
| Maintenance Officer | officer@uni.edu | Test1234! |
| Staff | staff@uni.edu | Test1234! |

---

## 📋 Table of Contents

- [About the Project](#about-the-project)
- [Tech Stack](#tech-stack)
- [Application Features](#application-features)
- [User Roles & Pages](#user-roles--pages)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Running Tests](#running-tests)
- [Deployment](#deployment)
- [Academic Context](#academic-context)

---

## About the Project

CampusServe's frontend is a fully responsive Single Page Application built with React 18 and TypeScript. It provides three distinct role-based interfaces:

- **Students / Staff** can submit maintenance requests, upload evidence photos, and track request status with a full activity log
- **Maintenance Officers** can view assigned requests, update status, and mark jobs as completed
- **Administrators** can assign requests to officers, manage users, view system-wide analytics, and export CSV reports

All API calls are authenticated via JWT tokens with automatic silent refresh. Navigation is fully protected by role-based guards.

---

## Tech Stack

| Technology | Version | Purpose |
|---|---|---|
| React | 18.3.1 | Component-based UI framework |
| TypeScript | 5.5.3 | Type-safe development across all components |
| Vite | 5.4.x | Build toolchain with lightning-fast HMR |
| Tailwind CSS | 3.4.x | Utility-first CSS for rapid responsive design |
| TanStack Query (React Query) | 5.56.x | Server-state management, caching, background refetching |
| React Router v6 | 6.26.x | Client-side routing with protected role-based guards |
| React Hook Form | 7.53.x | Performant form state management |
| Zod | 3.23.x | Schema-based form validation |
| Axios | 1.7.x | HTTP client with JWT interceptors for auto-refresh |
| React Hot Toast | 2.4.x | Accessible toast notification system |
| Lucide React | 0.447.x | Consistent SVG icon library |
| date-fns | 3.6.x | Date formatting and relative time display |
| Vitest | 2.1.x | Vite-native unit test runner |
| React Testing Library | 16.x | Component testing utilities |

---

## Application Features

### 🔐 Authentication
- Email + password login with JWT access token (24h) and refresh token (7d)
- Silent auto-refresh via Axios response interceptor — users never get logged out unexpectedly
- Role-based redirect after login (student → `/student/dashboard`, officer → `/officer/dashboard`, admin → `/admin/dashboard`)
- Protected routes — unauthenticated users redirected to `/login`

### 🎓 Student / Staff Features
- **Dashboard** — statistics cards (total, pending, in progress, completed) + recent requests list
- **Submit Request** — form with title, category (10 options), priority (low/medium/high/urgent), description, location, building, room, and optional evidence photo upload
- **My Requests** — paginated list with search, status filter, priority filter; expandable rows showing full description, metadata, and activity log timeline

### 🔧 Maintenance Officer Features
- **Dashboard** — assigned requests count, in-progress, pending, completed stats + recent assigned list
- **Assigned Requests** — expandable list; update status (assigned → in_progress → completed) with comment

### 👑 Administrator Features
- **Dashboard** — 6 stat cards + pending requests panel + requests-by-category bar chart
- **All Requests** — full table with search, filter, pagination, Export CSV button; click "Manage →" to open detail
- **Request Detail** — full request info, assignment history, activity log; Assign Officer panel (officer dropdown, expected date, notes); Update Status panel
- **User Management** — role summary cards; user table with avatar, role badge, department, join date, status; Activate/Deactivate button
- **Reports** — KPI cards (total, completion rate, pending, total users); Requests by Status chart; Requests by Category chart; Export CSV Report

### 🔔 Notifications
- Bell icon in Navbar polls the API every 30 seconds
- Unread count badge (red, shows 9+ for overflow)
- Dropdown panel with read/unread indicator dots, title, message, timestamp
- Mark All Read action

---

## User Roles & Pages

```
/login                        → Public (all users)
/register                     → Public (student/staff self-registration)

/student/dashboard            → Student/Staff only
/student/requests             → Student/Staff only
/student/new-request          → Student/Staff only

/officer/dashboard            → Maintenance Officer only
/officer/requests             → Maintenance Officer only

/admin/dashboard              → Administrator only
/admin/requests               → Administrator only
/admin/requests/:id           → Administrator only
/admin/users                  → Administrator only
/admin/reports                → Administrator only
```

---

## Project Structure

```
campusserve-frontend/
├── src/
│   ├── api/
│   │   ├── api.ts                # Axios instance + JWT request/response interceptors
│   │   ├── authApi.ts            # login, register, me, maintenanceOfficers,
│   │   │                         #   userStats, toggleActive, listUsers, categories
│   │   ├── requestsApi.ts        # list, get, create, updateStatus, assign, stats, exportCsv
│   │   └── notificationsApi.ts   # list, unreadCount, markAllRead, markRead, delete
│   ├── context/
│   │   └── AuthContext.tsx       # Global auth state: user, isAuthenticated, login, logout
│   ├── components/
│   │   └── layout/
│   │       ├── Layout.tsx        # Shell: Sidebar + Navbar + <Outlet />
│   │       ├── Sidebar.tsx       # Role-adaptive navigation with active link highlighting
│   │       └── Navbar.tsx        # Top bar: notification bell + dropdown + user avatar
│   ├── pages/
│   │   ├── auth/
│   │   │   ├── Login.tsx         # Split-panel login (branding + form)
│   │   │   └── Register.tsx      # Student/staff self-registration form
│   │   ├── student/
│   │   │   ├── StudentDashboard.tsx  # Stats cards + recent requests
│   │   │   ├── NewRequest.tsx        # Request submission form with file upload
│   │   │   └── MyRequests.tsx        # Filtered, paginated, expandable request list
│   │   ├── officer/
│   │   │   ├── OfficerDashboard.tsx  # Stats + assigned requests preview
│   │   │   └── AssignedRequests.tsx  # Expandable list with status update form
│   │   └── admin/
│   │       ├── AdminDashboard.tsx    # 6 stat cards + pending panel + category chart
│   │       ├── AllRequests.tsx       # Full table with search, filter, CSV export
│   │       ├── RequestDetail.tsx     # Detail view with assign + status update panels
│   │       ├── UserManagement.tsx    # User table with activate/deactivate
│   │       └── Reports.tsx           # Analytics charts + CSV export
│   ├── types/
│   │   └── index.ts              # All TypeScript interfaces: User, ServiceRequest,
│   │                             #   Assignment, Notification, RequestStats, etc.
│   ├── utils/
│   │   ├── formatDate.ts         # formatDate(), formatRelative()
│   │   └── statusColors.ts       # statusStyles, statusLabels, priorityStyles maps
│   ├── test/
│   │   └── setup.ts              # @testing-library/jest-dom import
│   ├── __tests__/
│   │   ├── AuthContext.test.tsx  # 3 tests: unauthenticated / login / logout
│   │   ├── Login.test.tsx        # 6 tests: all UI elements rendered
│   │   ├── StatusBadge.test.tsx  # 6 tests: all 6 status labels
│   │   ├── formatDate.test.ts    # 2 tests: formatDate, formatRelative
│   │   └── statusColors.test.ts  # 4 tests: styles, labels, priority styles
│   ├── App.tsx                   # Router + ProtectedRoute + DashboardRedirect
│   ├── main.tsx                  # React root, QueryClientProvider, AuthProvider
│   └── index.css                 # Tailwind base/components/utilities
├── public/
├── vercel.json                   # SPA rewrite: all routes → index.html
├── vite.config.ts                # Vite build config
├── vitest.config.ts              # Vitest test config (jsdom, globals, setup)
├── tailwind.config.js            # Custom colours: primary (#1F3864), secondary (#1ABC9C)
├── postcss.config.js
├── tsconfig.json
└── package.json
```

---

## Getting Started

### Prerequisites

- Node.js 20+
- npm 10+
- The [CampusServe backend](https://github.com/Hormoakin/campusserve-backend) running locally or deployed

### 1. Clone the repository

```bash
git clone https://github.com/Hormoakin/campusserve-frontend.git
cd campusserve-frontend
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

```bash
cp .env.example .env
```

Edit `.env`:

```env
VITE_API_URL=http://127.0.0.1:8000/api
```

For production:

```env
VITE_API_URL=https://campusserve-backend-production.up.railway.app/api
```

### 4. Start the development server

```bash
npm run dev
```

The app is now running at `http://localhost:5173`

---

## Environment Variables

| Variable | Development Value | Production Value |
|---|---|---|
| `VITE_API_URL` | `http://127.0.0.1:8000/api` | `https://your-railway-url.up.railway.app/api` |

> **Note:** All variables prefixed with `VITE_` are exposed to the browser at build time. Never put secrets in frontend environment variables.

---

## Available Scripts

```bash
# Start development server (localhost:5173)
npm run dev

# Build for production (outputs to /dist)
npm run build

# Preview production build locally
npm run preview

# Run all tests
npm run test:run

# Run tests in watch mode
npm test

# Lint the codebase
npm run lint
```

---

## Running Tests

```bash
npm run test:run
```

### Test Results

```
RUN  v2.1.9 /campusserve-frontend

✓ src/__tests__/AuthContext.test.tsx (3)
  ✓ starts unauthenticated
  ✓ authenticates after login
  ✓ clears state after logout

✓ src/__tests__/Login.test.tsx (6)
  ✓ renders CampusServe brand text
  ✓ renders email input
  ✓ renders password input
  ✓ renders sign in button
  ✓ renders register link
  ✓ renders available roles section

✓ src/__tests__/StatusBadge.test.tsx (6)
  ✓ renders label for status: pending
  ✓ renders label for status: assigned
  ✓ renders label for status: in_progress
  ✓ renders label for status: completed
  ✓ renders label for status: rejected
  ✓ renders label for status: cancelled

✓ src/__tests__/formatDate.test.ts (2)
  ✓ formats ISO string to readable date
  ✓ returns a relative time string

✓ src/__tests__/statusColors.test.ts (4)
  ✓ has an entry for every status
  ✓ returns In Progress for in_progress
  ✓ returns Completed for completed
  ✓ has an entry for every priority

 Test Files  5 passed (5)
      Tests  21 passed (21)
   Duration  1.39s
```

---

## Deployment

CampusServe frontend is deployed on **Vercel** with automatic deployments triggered on every push to `main`.

### Deploy to Vercel

1. Push this repository to GitHub
2. Go to [vercel.com](https://vercel.com) → **Add New Project** → import `campusserve-frontend`
3. Framework Preset: **Vite** (auto-detected)
4. Add environment variable:
   ```
   VITE_API_URL = https://your-railway-backend-url.up.railway.app/api
   ```
5. Click **Deploy**

> **Important:** The `vercel.json` file already contains the SPA rewrite rule. Do not set a Root Directory in Vercel settings — leave it empty.

### vercel.json

```json
{
  "buildCommand": "vite build",
  "outputDirectory": "dist",
  "installCommand": "npm install",
  "framework": "vite",
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

---

## Design System

### Colour Palette

| Token | Hex | Usage |
|---|---|---|
| `primary` | `#1F3864` | Sidebar, buttons, headings |
| `primary-light` | `#2C4F9E` | Hover states |
| `secondary` | `#1ABC9C` | Accent, links, success actions |
| `secondary-dark` | `#16A085` | Hover states for accent |

### Status Badge Colours

| Status | Background | Text |
|---|---|---|
| Pending | `yellow-100` | `yellow-800` |
| Assigned | `blue-100` | `blue-800` |
| In Progress | `orange-100` | `orange-800` |
| Completed | `green-100` | `green-800` |
| Rejected | `red-100` | `red-800` |
| Cancelled | `gray-100` | `gray-600` |

### Priority Badge Colours

| Priority | Background | Text |
|---|---|---|
| Low | `green-100` | `green-800` |
| Medium | `blue-100` | `blue-800` |
| High | `yellow-100` | `yellow-800` |
| Urgent | `red-100` | `red-800` |

---

## Academic Context

| Field | Detail |
|---|---|
| **Course** | MIT 8333 — Advanced Web Application Development (Virtual Lab) |
| **Programme** | Master of Information Technology (Software Engineering) |
| **Institution** | Miva Open University |
| **Student** | Ahmed Salman |
| **Student ID** | 2025/A/MIT/0365 |
| **Supervisor** | Dr. Augustine |
| **Academic Session** | 2026/2027 |

---

## Related Repository

- **Backend:** [github.com/Hormoakin/campusserve-backend](https://github.com/Hormoakin/campusserve-backend)

---

<p align="center">Built with ❤️ by Ahmed Salman — CampusServe 2026</p>
