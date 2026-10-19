"""
app/models/failure.py
──────────────────────
Pydantic v2 models for the FailureIncident domain.

Mirrors frontend/src/types/failure.ts.
"""

from __future__ import annotations

from datetime import datetime
from typing import Literal, Optional
from pydantic import AliasChoices, BaseModel, Field


FailureCategory = Literal[
    "UI", "API", "timeout", "network", "database", "validation", "authentication"
]
FailureSeverity = Literal["critical", "high", "medium", "low"]
FailureInvestigationStatus = Literal[
    "detected", "diagnosing", "awaiting-approval",
    "recovering", "resolved", "unrecoverable",
]
LogLevel = Literal["info", "warn", "error", "fatal"]


class FailureLogEntry(BaseModel):
    timestamp: datetime
    level: LogLevel
    message: str
    source_module: str = Field(alias="sourceModule")

    model_config = {"populate_by_name": True, "from_attributes": True}


class BoundingBox(BaseModel):
    x: float
    y: float
    width: float
    height: float
    label: str


class ScreenshotComparison(BaseModel):
    expected_label: str = Field(alias="expectedLabel")
    expected_timestamp: datetime = Field(alias="expectedTimestamp")
    actual_label: str = Field(alias="actualLabel")
    actual_timestamp: datetime = Field(alias="actualTimestamp")
    visual_delta_score: float = Field(alias="visualDeltaScore", ge=0.0, le=1.0)
    highlight_bounding_box: Optional[BoundingBox] = Field(
        default=None, alias="highlightBoundingBox"
    )

    model_config = {"populate_by_name": True, "from_attributes": True}


class FailureMetadata(BaseModel):
    host_agent: str = Field(alias="hostAgent")
    target_url_or_endpoint: Optional[str] = Field(default=None, alias="targetUrlOrEndpoint")
    http_status_code: Optional[int] = Field(default=None, alias="httpStatusCode")
    dom_element_query: Optional[str] = Field(default=None, alias="domElementQuery")
    retry_attempts: int = Field(alias="retryAttempts", ge=0)

    model_config = {"populate_by_name": True, "from_attributes": True}


class FailureIncident(BaseModel):
    id: str
    incident_code: str = Field(alias="incidentCode")
    client_id: str = Field(alias="clientId")
    client_name: str = Field(alias="clientName")
    bot_id: str = Field(alias="botId")
    bot_name: str = Field(alias="botName")
    workflow_id: str = Field(alias="workflowId")
    workflow_name: str = Field(alias="workflowName")
    run_id: str = Field(alias="runId")
    category: FailureCategory
    severity: FailureSeverity
    status: FailureInvestigationStatus
    failed_step_number: int = Field(alias="failedStepNumber", ge=1)
    failed_step_name: str = Field(alias="failedStepName")
    error_message: str = Field(alias="errorMessage")
    stack_trace: str = Field(alias="stackTrace")
    detected_at: datetime = Field(alias="detectedAt")
    resolved_at: Optional[datetime] = Field(default=None, alias="resolvedAt")
    screenshot_comparison: Optional[ScreenshotComparison] = Field(
        default=None, alias="screenshotComparison"
    )
    logs: list[FailureLogEntry] = Field(default_factory=list)
    metadata: FailureMetadata = Field(
        validation_alias=AliasChoices("metadata", "failure_metadata")
    )
    recovery_id: Optional[str] = Field(default=None, alias="recoveryId")

    model_config = {"populate_by_name": True, "from_attributes": True}
