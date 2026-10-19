"""
app/db/models/bot.py
────────────────────
SQLAlchemy 2.0 ORM model for Bot entity.
"""

from __future__ import annotations

from datetime import datetime
from typing import TYPE_CHECKING, Any, Optional

from sqlalchemy import Boolean, DateTime, Float, ForeignKey, Integer, JSON, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base

if TYPE_CHECKING:
    from app.db.models.client import ClientModel
    from app.db.models.failure import FailureIncidentModel
    from app.db.models.recovery import RecoveryAttemptModel
    from app.db.models.approval import HumanApprovalModel


class BotModel(Base):
    __tablename__ = "bots"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    client_id: Mapped[str] = mapped_column(
        String(64), ForeignKey("clients.id", ondelete="CASCADE"), nullable=False, index=True
    )
    client_name: Mapped[str] = mapped_column(String(200), nullable=False)
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    identifier: Mapped[str] = mapped_column(String(64), unique=True, index=True, nullable=False)
    status: Mapped[str] = mapped_column(String(32), nullable=False, index=True)
    environment: Mapped[str] = mapped_column(String(32), nullable=False, index=True)
    current_workflow_id: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)
    current_workflow_name: Mapped[Optional[str]] = mapped_column(String(200), nullable=True)
    host_agent: Mapped[str] = mapped_column(String(100), nullable=False)
    version: Mapped[str] = mapped_column(String(32), nullable=False)
    last_run_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    next_scheduled_run_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    consecutive_failures: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    success_rate_24h: Mapped[float] = mapped_column(Float, nullable=False, default=100.0)
    total_executions: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    self_healing_eligible: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    history: Mapped[list[dict[str, Any]]] = mapped_column(JSON, nullable=False, default=list)
    bot_metadata: Mapped[dict[str, Any]] = mapped_column("bot_metadata", JSON, nullable=False, default=dict)

    # Relationships
    client: Mapped[ClientModel] = relationship("ClientModel", back_populates="bots")
    failures: Mapped[list[FailureIncidentModel]] = relationship(
        "FailureIncidentModel", back_populates="bot"
    )
    recoveries: Mapped[list[RecoveryAttemptModel]] = relationship(
        "RecoveryAttemptModel", back_populates="bot"
    )
    approvals: Mapped[list[HumanApprovalModel]] = relationship(
        "HumanApprovalModel", back_populates="bot"
    )

    def to_pydantic(self) -> Any:
        from app.models.bot import Bot
        return Bot(
            id=self.id,
            clientId=self.client_id,
            clientName=self.client_name,
            name=self.name,
            identifier=self.identifier,
            status=self.status,  # type: ignore[arg-type]
            environment=self.environment,  # type: ignore[arg-type]
            currentWorkflowId=self.current_workflow_id,
            currentWorkflowName=self.current_workflow_name,
            hostAgent=self.host_agent,
            version=self.version,
            lastRunAt=self.last_run_at,
            nextScheduledRunAt=self.next_scheduled_run_at,
            consecutiveFailures=self.consecutive_failures,
            successRate24h=self.success_rate_24h,
            totalExecutions=self.total_executions,
            selfHealingEligible=self.self_healing_eligible,
            history=self.history,  # type: ignore[arg-type]
            metadata=self.bot_metadata,  # type: ignore[arg-type]
        )
