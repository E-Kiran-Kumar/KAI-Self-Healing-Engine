"""
app/db/models/failure.py
────────────────────────
SQLAlchemy 2.0 ORM model for Failure Incidents.
"""

from __future__ import annotations

from datetime import datetime
from typing import TYPE_CHECKING, Any, Optional

from sqlalchemy import DateTime, ForeignKey, Integer, JSON, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base

if TYPE_CHECKING:
    from app.db.models.client import ClientModel
    from app.db.models.bot import BotModel
    from app.db.models.recovery import RecoveryAttemptModel


class FailureIncidentModel(Base):
    __tablename__ = "failure_incidents"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    incident_code: Mapped[str] = mapped_column(String(32), unique=True, index=True, nullable=False)
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
    run_id: Mapped[str] = mapped_column(String(64), index=True, nullable=False)
    category: Mapped[str] = mapped_column(String(32), nullable=False, index=True)
    severity: Mapped[str] = mapped_column(String(32), nullable=False, index=True)
    status: Mapped[str] = mapped_column(String(32), nullable=False, index=True)
    failed_step_number: Mapped[int] = mapped_column(Integer, nullable=False)
    failed_step_name: Mapped[str] = mapped_column(String(200), nullable=False)
    error_message: Mapped[str] = mapped_column(Text, nullable=False)
    stack_trace: Mapped[str] = mapped_column(Text, nullable=False)
    detected_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    resolved_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    screenshot_comparison: Mapped[Optional[dict[str, Any]]] = mapped_column(JSON, nullable=True)
    logs: Mapped[list[dict[str, Any]]] = mapped_column(JSON, nullable=False, default=list)
    failure_metadata: Mapped[dict[str, Any]] = mapped_column(
        "failure_metadata", JSON, nullable=False, default=dict
    )
    recovery_id: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)

    # Relationships
    client: Mapped[ClientModel] = relationship("ClientModel", back_populates="failures")
    bot: Mapped[BotModel] = relationship("BotModel", back_populates="failures")

    def to_pydantic(self) -> Any:
        from app.models.failure import FailureIncident
        return FailureIncident(
            id=self.id,
            incidentCode=self.incident_code,
            clientId=self.client_id,
            clientName=self.client_name,
            botId=self.bot_id,
            botName=self.bot_name,
            workflowId=self.workflow_id,
            workflowName=self.workflow_name,
            runId=self.run_id,
            category=self.category,  # type: ignore[arg-type]
            severity=self.severity,  # type: ignore[arg-type]
            status=self.status,  # type: ignore[arg-type]
            failedStepNumber=self.failed_step_number,
            failedStepName=self.failed_step_name,
            errorMessage=self.error_message,
            stackTrace=self.stack_trace,
            detectedAt=self.detected_at,
            resolvedAt=self.resolved_at,
            screenshotComparison=self.screenshot_comparison,  # type: ignore[arg-type]
            logs=self.logs,  # type: ignore[arg-type]
            metadata=self.failure_metadata,  # type: ignore[arg-type]
            recoveryId=self.recovery_id,
        )
