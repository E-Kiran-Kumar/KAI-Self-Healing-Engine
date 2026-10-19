"""
app/db/models/workflow.py
─────────────────────────
SQLAlchemy 2.0 ORM models for Workflow Definitions and Execution Run Traces.
"""

from __future__ import annotations

from datetime import datetime
from typing import TYPE_CHECKING, Any, Optional

from sqlalchemy import DateTime, Float, ForeignKey, Integer, JSON, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base

if TYPE_CHECKING:
    from app.db.models.client import ClientModel


class WorkflowDefinitionModel(Base):
    __tablename__ = "workflow_definitions"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    client_id: Mapped[str] = mapped_column(
        String(64), ForeignKey("clients.id", ondelete="CASCADE"), nullable=False, index=True
    )
    client_name: Mapped[str] = mapped_column(String(200), nullable=False)
    assigned_bot_ids: Mapped[list[str]] = mapped_column(JSON, nullable=False, default=list)
    category: Mapped[str] = mapped_column(String(32), nullable=False, index=True)
    average_duration_ms: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    success_rate: Mapped[float] = mapped_column(Float, nullable=False, default=100.0)
    last_execution_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    step_count: Mapped[int] = mapped_column(Integer, nullable=False, default=1)

    # Relationships
    client: Mapped[ClientModel] = relationship("ClientModel", back_populates="workflows")
    runs: Mapped[list[WorkflowExecutionRunModel]] = relationship(
        "WorkflowExecutionRunModel", back_populates="workflow", cascade="all, delete-orphan"
    )


class WorkflowExecutionRunModel(Base):
    __tablename__ = "workflow_execution_runs"

    run_id: Mapped[str] = mapped_column(String(64), primary_key=True)
    workflow_id: Mapped[str] = mapped_column(
        String(64), ForeignKey("workflow_definitions.id", ondelete="CASCADE"), nullable=False, index=True
    )
    workflow_name: Mapped[str] = mapped_column(String(200), nullable=False)
    bot_id: Mapped[str] = mapped_column(
        String(64), ForeignKey("bots.id", ondelete="CASCADE"), nullable=False, index=True
    )
    bot_name: Mapped[str] = mapped_column(String(200), nullable=False)
    client_id: Mapped[str] = mapped_column(
        String(64), ForeignKey("clients.id", ondelete="CASCADE"), nullable=False, index=True
    )
    client_name: Mapped[str] = mapped_column(String(200), nullable=False)
    status: Mapped[str] = mapped_column(String(32), nullable=False, index=True)
    started_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    completed_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True), nullable=True
    )
    duration_ms: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    steps: Mapped[list[dict[str, Any]]] = mapped_column(JSON, nullable=False, default=list)
    failure_id: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)
    recovery_id: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)
    trace_snapshot_id: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)

    # Relationships
    workflow: Mapped[WorkflowDefinitionModel] = relationship(
        "WorkflowDefinitionModel", back_populates="runs"
    )
