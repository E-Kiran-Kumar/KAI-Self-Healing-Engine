# KAI Self-Healing AI Engine — Frontend

> Enterprise AI Automation Reliability Platform | Phase 1 Frontend

[![Phase 1](https://img.shields.io/badge/Phase-1%20Complete-green)](./PHASE1_REPORT.md)
[![Next.js](https://img.shields.io/badge/Next.js-16.4-black)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://typescriptlang.org)

---

## Overview

KAI is a multi-client enterprise platform for AI bot automation reliability. It monitors client automation bots, detects failures, diagnoses errors, safely repairs recoverable workflows, and remembers successful solutions.

**Phase 1** is the frontend-only interactive demonstration environment — production-ready UI architecture backed by typed mock data, ready for FastAPI backend integration in Phase 2.

---

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server (Turbopack) |
| `npm run build` | Production build |
| `npm run start` | Serve production build |
| `npm run lint` | ESLint check |
| `npm run test` | Run unit tests (Vitest) |

---

## Pages

| Route | Page | Description |
|---|---|---|
| `/` | Overview Dashboard | KPI metrics, trend charts, incident log, activity stream |
| `/clients` | Client Management | Enterprise tenant directory with add/edit forms |
| `/bots` | Bot Fleet Catalog | Multi-client bot monitoring with status filters |
| `/failures` | Failure Monitoring | Incident log with severity, category, diagnosis |
| `/recoveries` | Recovery Center | Autonomous self-healing attempt tracking |
| `/approvals` | Approval Queue | Human-in-the-loop governance for risky actions |
| `/analytics` | Platform Analytics | 7-day reliability trends and leaderboards |
| `/settings` | Settings | Admin profile, preferences, demo data management |
| `/workflows` | Workflow Monitoring | Multi-step automation routine tracking |

---

## Tech Stack

- **Framework:** Next.js 16.4 (App Router, Turbopack)
- **Language:** TypeScript 5 — strict mode
- **Styling:** Tailwind CSS v4
- **Charts:** Recharts 3.10
- **Icons:** Lucide React
- **Forms:** React Hook Form + Zod
- **Testing:** Vitest + Testing Library

---

## Architecture

```
src/
├── app/                # Next.js App Router pages (9 modules + detail routes)
├── components/
│   ├── layout/         # Sidebar, Topbar, Command Search, Notifications
│   ├── dashboard/      # KPI cards, charts, timelines
│   ├── clients/        # Client form dialog
│   └── ui/             # Design system primitives
├── context/            # ThemeContext, AppStateContext
├── lib/
│   ├── mock-data/      # Typed domain datasets (7 files)
│   ├── services/       # Async service layer (API-ready abstraction)
│   └── utils.ts        # Shared utilities
└── types/              # TypeScript domain types
```

### Backend Readiness

The service layer (`src/lib/services/`) exposes async functions that currently return mock data. To connect a real backend, replace `StorageAdapter.get*()` calls in each service file with `fetch()` calls to your FastAPI endpoints — no page-level changes required.

---

## Phase 1 Report

See [PHASE1_REPORT.md](./PHASE1_REPORT.md) for full verification results including build, TypeScript, lint, and browser test outcomes.

---

## 10-Phase Roadmap

| Phase | Focus |
|---|---|
| **1 ✅** | Frontend architecture & interactive mock environment |
| 2 | FastAPI backend — auth, data models, REST APIs |
| 3 | LangGraph AI multi-agent failure diagnosis |
| 4 | Computer vision for UI error detection |
| 5 | Autonomous workflow repair engine |
| 6 | Recovery memory & knowledge base |
| 7 | Human approval governance workflows |
| 8 | Multi-client isolation & RBAC |
| 9 | Enterprise analytics & SLA reporting |
| 10 | Production hardening & deployment |
