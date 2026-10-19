"""
app/routers/recoveries.py
─────────────────────────
Self-healing recovery attempt endpoints backed by database.
"""

from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.models.recovery import RecoveryAttempt
from app.services.recovery_service import RecoveryService

router = APIRouter(prefix="/recoveries", tags=["Recoveries"])


@router.get("", response_model=list[RecoveryAttempt])
async def list_recoveries(
    client_id: Optional[str] = Query(None, alias="clientId", description="Filter by client ID"),
    failure_id: Optional[str] = Query(None, alias="failureId", description="Filter by incident ID"),
    status_filter: Optional[str] = Query(None, alias="status", description="Filter by recovery status"),
    db: AsyncSession = Depends(get_db),
) -> list[RecoveryAttempt]:
    """Retrieve all autonomous and human-supervised recovery attempts."""
    return await RecoveryService.list_recoveries(
        db=db, client_id=client_id, failure_id=failure_id, status=status_filter
    )


@router.get("/{recovery_id}", response_model=RecoveryAttempt)
async def get_recovery(
    recovery_id: str,
    db: AsyncSession = Depends(get_db),
) -> RecoveryAttempt:
    """Retrieve before/after state diff, action steps, and verification results for a recovery."""
    recovery = await RecoveryService.get_recovery(db=db, recovery_id=recovery_id)
    if not recovery:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Recovery attempt '{recovery_id}' not found.",
        )
    return recovery
