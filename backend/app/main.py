"""
app/main.py
───────────
FastAPI application factory for KAI Self-Healing AI Engine (Phase 2).

Includes:
- Lifespan context manager for in-memory store initialization
- CORS middleware configured for Next.js frontend
- API v1 routers for all platform domains
- Custom exception handlers returning structured error envelopes
- Health check endpoints
"""

from contextlib import asynccontextmanager
from typing import AsyncGenerator

from fastapi import FastAPI, HTTPException, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.core.config import settings
from app.data.store import store
from app.db.session import close_db, init_db
from app.routers import (
    analytics,
    approvals,
    bots,
    clients,
    failures,
    health,
    recoveries,
    workflows,
)


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """Lifespan context manager handling startup and shutdown hooks."""
    # Ensure database schema is created and seeded
    await init_db()
    if settings.reset_store_on_startup:
        store.reset()
    yield
    # Dispose connection pools on graceful shutdown
    await close_db()


app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description=(
        "Enterprise automation reliability, self-healing diagnostics, "
        "and human-in-the-loop recovery engine API."
    ),
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

# ── CORS Middleware ────────────────────────────────────────────────────────────
# Allows frontend Next.js dev server on http://localhost:3000 to interact seamlessly.
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Root & Health Endpoints ───────────────────────────────────────────────────
app.include_router(health.router)  # Mounted at root: /health


@app.get("/", tags=["Root"])
def root() -> dict[str, str]:
    """Platform root information and documentation link."""
    return {
        "name": settings.app_name,
        "version": settings.app_version,
        "phase": "Phase 2: Backend Development",
        "docs": "/docs",
        "health": "/health",
        "apiPrefix": settings.api_prefix,
    }


# ── API v1 Routers ────────────────────────────────────────────────────────────
api_v1_router = FastAPI()
app.include_router(health.router, prefix=settings.api_prefix)
app.include_router(clients.router, prefix=settings.api_prefix)
app.include_router(bots.router, prefix=settings.api_prefix)
app.include_router(failures.router, prefix=settings.api_prefix)
app.include_router(recoveries.router, prefix=settings.api_prefix)
app.include_router(approvals.router, prefix=settings.api_prefix)
app.include_router(workflows.router, prefix=settings.api_prefix)
app.include_router(analytics.router, prefix=settings.api_prefix)


# ── Global Exception Handlers ─────────────────────────────────────────────────
@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException) -> JSONResponse:
    """Format HTTP errors with standard envelope."""
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "errorCode": f"HTTP_{exc.status_code}",
            "message": str(exc.detail),
            "detail": None,
        },
    )


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(
    request: Request, exc: RequestValidationError
) -> JSONResponse:
    """Format request validation errors with field-level details."""
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
        content={
            "errorCode": "VALIDATION_ERROR",
            "message": "Input validation failed. Check request payload and parameters.",
            "detail": exc.errors(),
        },
    )
