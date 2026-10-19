"""
app/routers/health.py
─────────────────────
Health check endpoint providing runtime operational status and API version.
"""

from fastapi import APIRouter
from app.core.config import settings
from app.models.common import HealthResponse

router = APIRouter(tags=["Health"])


@router.get("/health", response_model=HealthResponse)
def get_health() -> HealthResponse:
    """Return platform operational status and active development phase."""
    return HealthResponse(
        status="healthy",
        version=settings.app_version,
        phase="Phase 2: Backend Development (FastAPI + In-Memory Store)",
        note="Decoupled service layer ready for Phase 3 PostgreSQL integration.",
    )
