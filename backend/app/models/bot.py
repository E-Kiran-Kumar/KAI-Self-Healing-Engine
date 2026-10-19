"""
app/models/bot.py
──────────────────
Pydantic v2 models for the Bot domain.

Mirrors frontend/src/types/bot.ts.
"""

from __future__ import annotations

from datetime import datetime
from typing import Literal, Optional
from pydantic import AliasChoices, BaseModel, Field


BotStatus = Literal["running", "idle", "failed", "paused", "recovering"]
BotEnvironment = Literal["production", "staging", "uat"]
RunStatus = Literal["completed", "failed", "recovered", "running"]
RunTrigger = Literal["scheduled", "event", "manual", "healing-retry"]


class BotExecutionHistoryItem(BaseModel):
    run_id: str = Field(alias="runId")
    workflow_id: str = Field(alias="workflowId")
    workflow_name: str = Field(alias="workflowName")
    status: RunStatus
    started_at: datetime = Field(alias="startedAt")
    duration_ms: int = Field(alias="durationMs", ge=0)
    steps_total: int = Field(alias="stepsTotal", ge=0)
    steps_completed: int = Field(alias="stepsCompleted", ge=0)
    trigger: RunTrigger

    model_config = {"populate_by_name": True, "from_attributes": True}


class BotMetadata(BaseModel):
    os: str
    browser_version: Optional[str] = Field(default=None, alias="browserVersion")
    ip_address: str = Field(alias="ipAddress")
    heartbeat_timestamp: datetime = Field(alias="heartbeatTimestamp")

    model_config = {"populate_by_name": True, "from_attributes": True}


class Bot(BaseModel):
    id: str
    client_id: str = Field(alias="clientId")
    client_name: str = Field(alias="clientName")
    name: str
    identifier: str           # e.g. BOT-APEX-001
    status: BotStatus
    environment: BotEnvironment
    current_workflow_id: Optional[str] = Field(default=None, alias="currentWorkflowId")
    current_workflow_name: Optional[str] = Field(default=None, alias="currentWorkflowName")
    host_agent: str = Field(alias="hostAgent")
    version: str
    last_run_at: datetime = Field(alias="lastRunAt")
    next_scheduled_run_at: Optional[datetime] = Field(default=None, alias="nextScheduledRunAt")
    consecutive_failures: int = Field(alias="consecutiveFailures", ge=0)
    success_rate_24h: float = Field(alias="successRate24h", ge=0.0, le=100.0)
    total_executions: int = Field(alias="totalExecutions", ge=0)
    self_healing_eligible: bool = Field(alias="selfHealingEligible")
    history: list[BotExecutionHistoryItem] = Field(default_factory=list)
    metadata: BotMetadata = Field(
        validation_alias=AliasChoices("metadata", "bot_metadata")
    )

    model_config = {"populate_by_name": True, "from_attributes": True}


class UpdateBotStatusRequest(BaseModel):
    """Patch endpoint body — used to pause/resume/reset a bot."""
    status: BotStatus
    reason: Optional[str] = Field(default=None, max_length=500)
