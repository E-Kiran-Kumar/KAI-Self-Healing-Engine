"""
app/services/failure_service.py
───────────────────────────────
Database-backed asynchronous service for Failure Incidents.
"""

from __future__ import annotations

from typing import Optional

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models.failure import FailureIncidentModel
from app.models.failure import FailureIncident


class FailureService:
    @staticmethod
    async def list_failures(
        db: AsyncSession,
        client_id: Optional[str] = None,
        bot_id: Optional[str] = None,
        category: Optional[str] = None,
        severity: Optional[str] = None,
        status: Optional[str] = None,
    ) -> list[FailureIncident]:
        stmt = select(FailureIncidentModel)
        if client_id:
            stmt = stmt.where(FailureIncidentModel.client_id == client_id)
        if bot_id:
            stmt = stmt.where(FailureIncidentModel.bot_id == bot_id)
        if category:
            stmt = stmt.where(FailureIncidentModel.category.ilike(category.strip()))
        if severity:
            stmt = stmt.where(FailureIncidentModel.severity.ilike(severity.strip()))
        if status:
            stmt = stmt.where(FailureIncidentModel.status.ilike(status.strip()))

        stmt = stmt.order_by(FailureIncidentModel.detected_at.desc())
        result = await db.execute(stmt)
        models = result.scalars().all()
        return [m.to_pydantic() for m in models]

    @staticmethod
    async def get_failure(db: AsyncSession, failure_id: str) -> Optional[FailureIncident]:
        stmt = select(FailureIncidentModel).where(FailureIncidentModel.id == failure_id)
        result = await db.execute(stmt)
        model = result.scalar_one_or_none()
        if not model:
            return None
        return model.to_pydantic()
