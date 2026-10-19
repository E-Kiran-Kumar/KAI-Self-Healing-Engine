"""
app/db/models/approval.py
─────────────────────────
SQLAlchemy 2.0 ORM model for Human Approval items and audit trails.
"""

from __future__ import annotations

from datetime import datetime
from typing import TYPE_CHECKING, Any, Optional

from sqlalchemy import DateTime, Float, ForeignKey, JSON, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base

if TYPE_CHECKING:
    from app.db.models.client import ClientModel
    from app.db.models.bot import BotModel
    from app.db.models.recovery import RecoveryAttemptModel


class HumanApprovalModel(Base):
    __tablename__ = "human_approvals"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    approval_code: Mapped[str] = mapped_column(String(32), unique=True, index=True, nullable=False)
    recovery_id: Mapped[str] = mapped_column(
        String(64), ForeignKey("recovery_attempts.id", ondelete="CASCADE"), nullable=False, index=True
    )
    recovery_code: Mapped[str] = mapped_column(String(32), nullable=False)
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
    risk_level: Mapped[str] = mapped_column(String(32), nullable=False, index=True)
    impact_assessment: Mapped[dict[str, Any]] = mapped_column(JSON, nullable=False)
    proposed_actions: Mapped[list[dict[str, Any]]] = mapped_column(JSON, nullable=False, default=list)
    model_confidence_score: Mapped[float] = mapped_column(Float, nullable=False)
    status: Mapped[str] = mapped_column(String(32), nullable=False, index=True)
    requested_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    decided_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    decided_by: Mapped[Optional[str]] = mapped_column(String(200), nullable=True)
    decision_notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    audit_trail: Mapped[list[dict[str, Any]]] = mapped_column(JSON, nullable=False, default=list)

    # Relationships
    client: Mapped[ClientModel] = relationship("ClientModel", back_populates="approvals")
    bot: Mapped[BotModel] = relationship("BotModel", back_populates="approvals")
    recovery: Mapped[RecoveryAttemptModel] = relationship("RecoveryAttemptModel")
