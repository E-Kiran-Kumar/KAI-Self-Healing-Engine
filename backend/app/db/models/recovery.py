"""
app/db/models/recovery.py
─────────────────────────
SQLAlchemy 2.0 ORM model for Recovery Attempts.
"""

from __future__ import annotations

from datetime import datetime
from typing import TYPE_CHECKING, Any, Optional

from sqlalchemy import Boolean, DateTime, Float, ForeignKey, Integer, JSON, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base

if TYPE_CHECKING:
    from app.db.models.client import ClientModel
    from app.db.models.bot import BotModel
    from app.db.models.failure import FailureIncidentModel


class RecoveryAttemptModel(Base):
    __tablename__ = "recovery_attempts"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    recovery_code: Mapped[str] = mapped_column(String(32), unique=True, index=True, nullable=False)
    failure_id: Mapped[str] = mapped_column(
        String(64), ForeignKey("failure_incidents.id", ondelete="CASCADE"), nullable=False, index=True
    )
    incident_code: Mapped[str] = mapped_column(String(32), nullable=False)
    client_id: Mapped[str] = mapped_column(
        String(64), ForeignKey("clients.id", ondelete="CASCADE"), nullable=False, index=True
    )
    client_name: Mapped[str] = mapped_column(String(200), nullable=False)
    bot_id: Mapped[str] = mapped_column(
        String(64), ForeignKey("bots.id", ondelete="CASCADE"), nullable=False, index=True
    )
    bot_name: Mapped[str] = mapped_column(String(200), nullable=False)
    workflow_id: Mapped[str] = mapped_column(
        String(64), ForeignKey("workflow_definitions.id", ondelete="CASCADE"), nullable=False, index=True
    )
    workflow_name: Mapped[str] = mapped_column(String(200), nullable=False)
    category: Mapped[str] = mapped_column(String(32), nullable=False)
    status: Mapped[str] = mapped_column(String(32), nullable=False, index=True)
    recovery_method: Mapped[str] = mapped_column(String(100), nullable=False)
    model_confidence_score: Mapped[float] = mapped_column(Float, nullable=False)
    confidence_rationale: Mapped[str] = mapped_column(Text, nullable=False)
    steps: Mapped[list[dict[str, Any]]] = mapped_column(JSON, nullable=False, default=list)
    before_state: Mapped[dict[str, Any]] = mapped_column(JSON, nullable=False)
    after_state: Mapped[dict[str, Any]] = mapped_column(JSON, nullable=False)
    verification: Mapped[Optional[dict[str, Any]]] = mapped_column(JSON, nullable=True)
    requires_human_approval: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    approval_id: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    completed_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    estimated_effort_saved_minutes: Mapped[int] = mapped_column(Integer, nullable=False, default=0)

    # Relationships
    client: Mapped[ClientModel] = relationship("ClientModel", back_populates="recoveries")
    bot: Mapped[BotModel] = relationship("BotModel", back_populates="recoveries")
    failure: Mapped[FailureIncidentModel] = relationship("FailureIncidentModel")
