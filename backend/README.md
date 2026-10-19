# KAI Self-Healing AI Engine — Backend (Phase 2)

Independent Python FastAPI backend service powering the KAI Self-Healing automation reliability platform.

## Architecture

- **Framework**: [FastAPI](https://fastapi.tiangolo.com/) with asynchronous ASGI runtime
- **Data Validation & Serialization**: [Pydantic v2](https://docs.pydantic.dev/latest/) with camelCase aliases for exact frontend TypeScript compatibility
- **Configuration**: `pydantic-settings` reading from `.env` or system environment variables
- **Data Access Pattern**: Decoupled `DataStore` in-memory collection layer cleanly separated from service business logic, designed for frictionless swap to PostgreSQL/SQLAlchemy in Phase 3
- **CORS Support**: Preconfigured for Next.js frontend on `http://localhost:3000`
- **Testing**: `pytest` + `pytest-asyncio` with `httpx.AsyncClient`

---

## Directory Structure

```text
backend/
├── app/
│   ├── core/
│   │   ├── __init__.py
│   │   └── config.py               # Central Settings & CORS configuration
│   ├── data/
│   │   ├── __init__.py
│   │   ├── seed.py                 # Seed fixtures matching frontend mock IDs
│   │   └── store.py                # In-memory thread-safe DataStore
│   ├── models/
│   │   ├── __init__.py
│   │   ├── common.py               # PaginatedResponse, APIError, HealthResponse
│   │   ├── client.py               # Client, CreateClientRequest, UpdateClientRequest
│   │   ├── bot.py                  # Bot, BotMetadata, UpdateBotStatusRequest
│   │   ├── failure.py              # FailureIncident, ScreenshotComparison, logs
│   │   ├── recovery.py             # RecoveryAttempt, StateSnapshot, VerificationResult
│   │   ├── approval.py             # HumanApprovalItem, RecordDecisionRequest
│   │   ├── workflow.py             # WorkflowDefinition, WorkflowExecutionRun
│   │   └── analytics.py            # OverviewMetrics, CategoryDistribution, AnalyticsSummary
│   ├── routers/
│   │   ├── __init__.py
│   │   ├── health.py               # GET /health & /api/v1/health
│   │   ├── clients.py              # CRUD /api/v1/clients
│   │   ├── bots.py                 # Fleet /api/v1/bots, PATCH /api/v1/bots/{id}/status
│   │   ├── failures.py             # Triage & diagnostics /api/v1/failures
│   │   ├── recoveries.py           # Self-healing plans & diffs /api/v1/recoveries
│   │   ├── approvals.py            # Human queue & decisions /api/v1/approvals
│   │   ├── workflows.py            # Definitions & run traces /api/v1/workflows
│   │   └── analytics.py            # Aggregated telemetry /api/v1/analytics/summary
│   ├── services/
│   │   ├── __init__.py
│   │   ├── client_service.py
│   │   ├── bot_service.py
│   │   ├── failure_service.py
│   │   ├── recovery_service.py
│   │   ├── approval_service.py
│   │   ├── workflow_service.py
│   │   └── analytics_service.py
│   └── main.py                     # FastAPI application factory & lifespan
├── tests/
│   ├── __init__.py
│   ├── conftest.py                 # Fixtures: isolated store reset & async client
│   ├── test_health.py              # Health check verification
│   ├── test_clients.py             # Client CRUD & validation tests
│   ├── test_bots.py                # Bot fleet querying & status updates
│   ├── test_failures.py            # Incident filtering & diagnostic traces
│   ├── test_recoveries.py          # Recovery states & action plans
│   ├── test_approvals.py           # Decision approval/rejection cascade tests
│   ├── test_workflows.py           # Workflow catalog & execution steps
│   └── test_analytics.py           # Metrics calculation & category breakdown
├── .env.example
├── pytest.ini
├── requirements.txt
└── PHASE2_REPORT.md
```

---

## Getting Started

### 1. Installation

```bash
cd backend
pip install -r requirements.txt
```

### 2. Configuration

Copy the example environment file:
```bash
cp .env.example .env
```

### 3. Run Development Server

```bash
uvicorn app.main:app --reload --port 8000
```

The interactive API documentation is accessible at:
- **Swagger UI**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **ReDoc**: [http://localhost:8000/redoc](http://localhost:8000/redoc)
- **Health Check**: [http://localhost:8000/health](http://localhost:8000/health)

---

## Running the Automated Test Suite

```bash
cd backend
python -m pytest tests/ -v
```

All 42 automated tests execute asynchronously and verify:
- Response status codes and envelope formatting
- Automatic camelCase serialization
- In-memory store isolation between tests
- Human approval decision cascading to linked recovery attempts
- Query parameter filtering across all domains
