"""
app/routers/failures.py
───────────────────────
Failure Incident triage and diagnostic endpoints backed by database.
"""

from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.models.failure import FailureIncident
from app.services.failure_service import FailureService

router = APIRouter(prefix="/failures", tags=["Failures"])


@router.get("", response_model=list[FailureIncident])
async def list_failures(
    client_id: Optional[str] = Query(None, alias="clientId", description="Filter by client ID"),
    bot_id: Optional[str] = Query(None, alias="botId", description="Filter by bot ID"),
    category: Optional[str] = Query(None, description="Filter by category (UI, API, timeout, network, database, validation, authentication)"),
    severity: Optional[str] = Query(None, description="Filter by severity (critical, high, medium, low)"),
    status_filter: Optional[str] = Query(None, alias="status", description="Filter by investigation status"),
    db: AsyncSession = Depends(get_db),
) -> list[FailureIncident]:
    """Retrieve failure incidents with diagnostics, visual diffs, and stack traces."""
    return await FailureService.list_failures(
        db=db,
        client_id=client_id,
        bot_id=bot_id,
        category=category,
        severity=severity,
        status=status_filter,
    )


@router.get("/{failure_id}", response_model=FailureIncident)
async def get_failure(
    failure_id: str,
    db: AsyncSession = Depends(get_db),
) -> FailureIncident:
    """Retrieve deep diagnostic data and visual comparison for a failure incident."""
    failure = await FailureService.get_failure(db=db, failure_id=failure_id)
    if not failure:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Failure incident '{failure_id}' not found.",
        )
    return failure
