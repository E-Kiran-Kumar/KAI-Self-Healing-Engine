"""
app/models/workflow.py
───────────────────────
Pydantic v2 models for the Workflow domain.

Mirrors frontend/src/types/workflow.ts.
"""

from __future__ import annotations

from datetime import datetime
from typing import Any, Literal, Optional
from pydantic import BaseModel, Field


WorkflowExecutionStatus = Literal[
    "running", "completed", "failed", "recovered", "waiting-approval"
]
WorkflowCategory = Literal[
    "finance", "procurement", "logistics", "healthcare", "hr"
]
StepActionType = Literal[
    "click", "type", "api-call", "query", "ocr-extract", "validate", "export"
]
StepStatus = Literal["passed", "failed", "skipped", "running", "pending"]


class WorkflowStep(BaseModel):
    id: str
    step_number: int = Field(alias="stepNumber", ge=1)
    name: str
    action_type: StepActionType = Field(alias="actionType")
    target_selector: Optional[str] = Field(default=None, alias="targetSelector")
    status: StepStatus
    started_at: Optional[datetime] = Field(default=None, alias="startedAt")
    duration_ms: Optional[int] = Field(default=None, alias="durationMs", ge=0)
    error_message: Optional[str] = Field(default=None, alias="errorMessage")
    screenshot_url: Optional[str] = Field(default=None, alias="screenshotUrl")
    trace_payload: Optional[dict[str, Any]] = Field(default=None, alias="tracePayload")

    model_config = {"populate_by_name": True, "from_attributes": True}


class WorkflowExecutionRun(BaseModel):
    run_id: str = Field(alias="runId")
    bot_id: str = Field(alias="botId")
    bot_name: str = Field(alias="botName")
    client_id: str = Field(alias="clientId")
    client_name: str = Field(alias="clientName")
    workflow_id: str = Field(alias="workflowId")
    workflow_name: str = Field(alias="workflowName")
    status: WorkflowExecutionStatus
    started_at: datetime = Field(alias="startedAt")
    completed_at: Optional[datetime] = Field(default=None, alias="completedAt")
    duration_ms: int = Field(alias="durationMs", ge=0)
    steps: list[WorkflowStep] = Field(default_factory=list)
    failure_id: Optional[str] = Field(default=None, alias="failureId")
    recovery_id: Optional[str] = Field(default=None, alias="recoveryId")
    trace_snapshot_id: Optional[str] = Field(default=None, alias="traceSnapshotId")

    model_config = {"populate_by_name": True, "from_attributes": True}


class WorkflowDefinition(BaseModel):
    id: str
    name: str
    description: str
    client_id: str = Field(alias="clientId")
    client_name: str = Field(alias="clientName")
    assigned_bot_ids: list[str] = Field(alias="assignedBotIds", default_factory=list)
    category: WorkflowCategory
    average_duration_ms: int = Field(alias="averageDurationMs", ge=0)
    success_rate: float = Field(alias="successRate", ge=0.0, le=100.0)
    last_execution_at: datetime = Field(alias="lastExecutionAt")
    step_count: int = Field(alias="stepCount", ge=1)

    model_config = {"populate_by_name": True, "from_attributes": True}
