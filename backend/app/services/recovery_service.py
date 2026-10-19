"""
app/services/recovery_service.py
────────────────────────────────
Database-backed asynchronous service for Recovery Attempts.
"""

from __future__ import annotations

from typing import Optional

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models.recovery import RecoveryAttemptModel
from app.models.recovery import RecoveryAttempt


class RecoveryService:
    @staticmethod
    async def list_recoveries(
        db: AsyncSession,
        client_id: Optional[str] = None,
        failure_id: Optional[str] = None,
        status: Optional[str] = None,
    ) -> list[RecoveryAttempt]:
        stmt = select(RecoveryAttemptModel)
        if client_id:
            stmt = stmt.where(RecoveryAttemptModel.client_id == client_id)
        if failure_id:
            stmt = stmt.where(RecoveryAttemptModel.failure_id == failure_id)
        if status:
            stmt = stmt.where(RecoveryAttemptModel.status.ilike(status.strip()))

        stmt = stmt.order_by(RecoveryAttemptModel.created_at.desc())
        result = await db.execute(stmt)
        models = result.scalars().all()
        return [RecoveryAttempt.model_validate(m, from_attributes=True) for m in models]

    @staticmethod
    async def get_recovery(
        db: AsyncSession, recovery_id: str
    ) -> Optional[RecoveryAttempt]:
        stmt = select(RecoveryAttemptModel).where(RecoveryAttemptModel.id == recovery_id)
        result = await db.execute(stmt)
        model = result.scalar_one_or_none()
        if not model:
            return None
        return RecoveryAttempt.model_validate(model, from_attributes=True)
