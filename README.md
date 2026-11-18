# KAI Self-Healing AI Engine

> Enterprise AI Automation Reliability Platform

[![Phase 1 Frontend](https://img.shields.io/badge/Phase%201-Frontend%20Complete-brightgreen)](./frontend/PHASE1_REPORT.md)
[![Phase 2 Backend](https://img.shields.io/badge/Phase%202-Backend%20Complete-brightgreen)](./backend/PHASE2_REPORT.md)
[![Phase 3 Database](https://img.shields.io/badge/Phase%203-Database%20Complete-brightgreen)](./backend/PHASE3_REPORT.md)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.135-009688?logo=fastapi)](https://fastapi.tiangolo.com)
[![Next.js](https://img.shields.io/badge/Next.js-16.4-black?logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Python](https://img.shields.io/badge/Python-3.11-3776AB?logo=python)](https://python.org)

KAI is an enterprise platform that monitors client automation bots, detects failures, diagnoses errors using computer vision and AI agents, safely repairs recoverable workflows, verifies outcomes, and remembers successful solutions.

---

## Architecture Overview

```text
KAI Self-Healing Engine/
├── frontend/                     # Next.js 16 + TypeScript + Tailwind CSS (Phase 1)
│   ├── src/
│   │   ├── app/                  # Dashboard routes (/, /clients, /bots, /failures, etc.)
│   │   ├── components/           # Enterprise UI components & charts
│   │   ├── lib/                  # Storage adapter & mock services
│   │   └── types/                # Strict domain models
│   ├── tests/                    # Vitest unit test suite
│   └── PHASE1_REPORT.md          # Phase 1 signoff report
│
└── backend/                      # Python + FastAPI (Phase 2)
    ├── app/
    │   ├── core/                 # Config & CORS settings
    │   ├── data/                 # In-memory thread-safe store & seed data
    │   ├── models/               # Pydantic v2 schemas with camelCase aliases
    │   ├── routers/              # REST routers (health, clients, bots, etc.)
    │   ├── services/             # Domain business logic layer
    │   └── main.py               # FastAPI application entrypoint
    ├── tests/                    # Pytest test suite (42 tests, 100% pass)
    ├── pytest.ini
    ├── requirements.txt
    ├── README.md
    └── PHASE2_REPORT.md          # Phase 2 signoff report
```

---

## Quick Start

### 1. Run the Backend (FastAPI)

```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

- **Interactive API Docs**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **Health Check**: [http://localhost:8000/health](http://localhost:8000/health)

### 2. Run the Frontend (Next.js)

```bash
cd frontend
npm install
npm run dev
```

- **Dashboard**: [http://localhost:3000](http://localhost:3000)

---

## Project & Learning Progress — All 10 Phases Completed

**Current status:** Phases 1–10 are completed. The roadmap below reflects the completed project implementation and learning milestones.

### 10-Phase Roadmap

- [x] **Phase 1: Frontend Architecture** — Next.js 16, TypeScript, Tailwind CSS, Lucide icons, Recharts, typed mock storage adapter.
- [x] **Phase 2: Backend Development** — FastAPI, Pydantic v2, service layer, in-memory data store, 42 automated tests.
- [x] **Phase 3: Database & ORM Integration** — PostgreSQL, async SQLAlchemy 2.0, Alembic migrations, 47 automated tests.
- [x] **Phase 4: Multi-Agent Reasoning Engine** — LangGraph, diagnostic agents, root cause classification.
- [x] **Phase 5: Computer Vision Healer** — Visual diffing, DOM remapping, OCR fuzzy matching.
- [x] **Phase 6: Self-Healing Execution Pipeline** — Playwright runtime recovery, synthetic dry-run verification.
- [x] **Phase 7: Human Approval Workflow** — Operator sign-off, risk scoring, state rollback.
- [x] **Phase 8: Recovery Memory & Vector Knowledge** — Pattern memory, solution retrieval, similarity clustering.
- [x] **Phase 9: Telemetry & Enterprise Analytics** — Live Prometheus/OpenTelemetry, alert dispatchers.
- [x] **Phase 10: Production Hardening** — Multi-tenant security, RBAC, CI/CD, Docker deployment.
