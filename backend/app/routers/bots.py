"""
app/routers/bots.py
───────────────────
Bot fleet management endpoints backed by persistent database.
"""

from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.models.bot import Bot, UpdateBotStatusRequest
from app.services.bot_service import BotService

router = APIRouter(prefix="/bots", tags=["Bots"])


@router.get("", response_model=list[Bot])
async def list_bots(
    client_id: Optional[str] = Query(None, alias="clientId", description="Filter by client ID"),
    status_filter: Optional[str] = Query(None, alias="status", description="Filter by status (running, idle, failed, paused, recovering)"),
    environment: Optional[str] = Query(None, description="Filter by environment (production, staging, uat)"),
    db: AsyncSession = Depends(get_db),
) -> list[Bot]:
    """Retrieve all bot agents across clients with optional filtering."""
    return await BotService.list_bots(
        db=db, client_id=client_id, status=status_filter, environment=environment
    )


@router.get("/{bot_id}", response_model=Bot)
async def get_bot(
    bot_id: str,
    db: AsyncSession = Depends(get_db),
) -> Bot:
    """Retrieve runtime telemetry and execution history for a specific bot."""
    bot = await BotService.get_bot(db=db, bot_id=bot_id)
    if not bot:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Bot '{bot_id}' not found.",
        )
    return bot


@router.patch("/{bot_id}/status", response_model=Bot)
async def update_bot_status(
    bot_id: str,
    body: UpdateBotStatusRequest,
    db: AsyncSession = Depends(get_db),
) -> Bot:
    """Update bot operational status (e.g. pause, resume, reset to idle)."""
    updated = await BotService.update_bot_status(db=db, bot_id=bot_id, data=body)
    if not updated:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Bot '{bot_id}' not found.",
        )
    return updated
