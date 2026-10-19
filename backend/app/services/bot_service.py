"""
app/services/bot_service.py
───────────────────────────
Database-backed asynchronous service for Bot fleet management.
"""

from __future__ import annotations

from datetime import datetime, timezone
from typing import Optional

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models.bot import BotModel
from app.models.bot import Bot, UpdateBotStatusRequest


class BotService:
    @staticmethod
    async def list_bots(
        db: AsyncSession,
        client_id: Optional[str] = None,
        status: Optional[str] = None,
        environment: Optional[str] = None,
    ) -> list[Bot]:
        stmt = select(BotModel)
        if client_id:
            stmt = stmt.where(BotModel.client_id == client_id)
        if status:
            stmt = stmt.where(BotModel.status.ilike(status.strip()))
        if environment:
            stmt = stmt.where(BotModel.environment.ilike(environment.strip()))

        stmt = stmt.order_by(BotModel.identifier.asc())
        result = await db.execute(stmt)
        models = result.scalars().all()
        return [m.to_pydantic() for m in models]

    @staticmethod
    async def get_bot(db: AsyncSession, bot_id: str) -> Optional[Bot]:
        stmt = select(BotModel).where(BotModel.id == bot_id)
        result = await db.execute(stmt)
        model = result.scalar_one_or_none()
        if not model:
            return None
        return model.to_pydantic()

    @staticmethod
    async def update_bot_status(
        db: AsyncSession, bot_id: str, data: UpdateBotStatusRequest
    ) -> Optional[Bot]:
        stmt = select(BotModel).where(BotModel.id == bot_id)
        result = await db.execute(stmt)
        model = result.scalar_one_or_none()
        if not model:
            return None

        model.status = data.status
        # Update heartbeat in metadata
        curr_meta = dict(model.bot_metadata)
        curr_meta["heartbeatTimestamp"] = datetime.now(timezone.utc).isoformat()
        model.bot_metadata = curr_meta

        await db.flush()
        await db.refresh(model)
        return model.to_pydantic()
