"""
app/db/models/client.py
───────────────────────
SQLAlchemy 2.0 ORM model for Client entity.
"""

from __future__ import annotations

from datetime import datetime
from typing import TYPE_CHECKING, Any, Optional

from sqlalchemy import Boolean, DateTime, Float, Integer, JSON, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base

if TYPE_CHECKING:
    from app.db.models.bot import BotModel
    from app.db.models.workflow import WorkflowDefinitionModel
    from app.db.models.failure import FailureIncidentModel
    from app.db.models.recovery import RecoveryAttemptModel
    from app.db.models.approval import HumanApprovalModel


class ClientModel(Base):
    __tablename__ = "clients"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    code: Mapped[str] = mapped_column(String(16), unique=True, index=True, nullable=False)
    tier: Mapped[str] = mapped_column(String(32), nullable=False, index=True)
    status: Mapped[str] = mapped_column(String(32), nullable=False, default="active", index=True)
    primary_contact: Mapped[dict[str, Any]] = mapped_column(JSON, nullable=False)
    region: Mapped[str] = mapped_column(String(100), nullable=False)
    industry: Mapped[str] = mapped_column(String(100), nullable=False)
    sla_uptime: Mapped[float] = mapped_column(Float, nullable=False, default=99.9)
    max_concurrent_bots: Mapped[int] = mapped_column(Integer, nullable=False, default=10)
    active_bots_count: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    total_workflows_count: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    healing_auto_recovery_enabled: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    # Relationships
    bots: Mapped[list[BotModel]] = relationship(
        "BotModel",
        back_populates="client",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )
    workflows: Mapped[list[WorkflowDefinitionModel]] = relationship(
        "WorkflowDefinitionModel",
        back_populates="client",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )
    failures: Mapped[list[FailureIncidentModel]] = relationship(
        "FailureIncidentModel",
        back_populates="client",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )
    recoveries: Mapped[list[RecoveryAttemptModel]] = relationship(
        "RecoveryAttemptModel",
        back_populates="client",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )
    approvals: Mapped[list[HumanApprovalModel]] = relationship(
        "HumanApprovalModel",
        back_populates="client",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )
