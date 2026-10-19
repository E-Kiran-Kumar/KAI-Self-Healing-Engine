"""
app/models/recovery.py
───────────────────────
Pydantic v2 models for the RecoveryAttempt domain.

Mirrors frontend/src/types/recovery.ts.
"""

from __future__ import annotations

from datetime import datetime
from typing import Any, Literal, Optional
from pydantic import BaseModel, Field

from app.models.failure import FailureCategory


RecoveryStatus = Literal[
    "suggested", "approved", "simulated-success", "simulated-failure", "escalated"
]
RecoveryMethod = Literal[
    "DOM Selector Recalibration",
    "Exponential API Backoff & Token Refresh",
    "OCR Fuzzy Anchor Remapping",
    "Transient Network Retry with Payload Re-sign",
    "Schema Coercion & Field Fallback",
    "Session Invalidation & Re-authentication",
    "Connection Pool Reset",
]
ActionStepStatus = Literal["pending", "running", "verified", "failed"]


class RecoveryActionStep(BaseModel):
    step_index: int = Field(alias="stepIndex", ge=0)
    description: str
    action_payload: str = Field(alias="actionPayload")
    simulated_output: Optional[str] = Field(default=None, alias="simulatedOutput")
    execution_status: ActionStepStatus = Field(alias="executionStatus")

    model_config = {"populate_by_name": True, "from_attributes": True}


class VerificationCheck(BaseModel):
    check_name: str = Field(alias="checkName")
    passed: bool
    evidence: str

    model_config = {"populate_by_name": True, "from_attributes": True}


class VerificationResult(BaseModel):
    passed: bool
    score: float = Field(ge=0.0, le=100.0)
    checks: list[VerificationCheck] = Field(default_factory=list)
    verified_at: datetime = Field(alias="verifiedAt")

    model_config = {"populate_by_name": True, "from_attributes": True}


class StateSnapshot(BaseModel):
    title: str
    description: str
    screenshot_mock_label: str = Field(alias="screenshotMockLabel")
    data_snapshot: dict[str, Any] = Field(alias="dataSnapshot", default_factory=dict)

    model_config = {"populate_by_name": True, "from_attributes": True}


class RecoveryAttempt(BaseModel):
    id: str
    recovery_code: str = Field(alias="recoveryCode")
    failure_id: str = Field(alias="failureId")
    incident_code: str = Field(alias="incidentCode")
    client_id: str = Field(alias="clientId")
    client_name: str = Field(alias="clientName")
    bot_id: str = Field(alias="botId")
    bot_name: str = Field(alias="botName")
    workflow_id: str = Field(alias="workflowId")
    workflow_name: str = Field(alias="workflowName")
    category: FailureCategory
    status: RecoveryStatus
    recovery_method: RecoveryMethod = Field(alias="recoveryMethod")
    model_confidence_score: float = Field(
        alias="modelConfidenceScore", ge=0.0, le=100.0
    )
    confidence_rationale: str = Field(alias="confidenceRationale")
    steps: list[RecoveryActionStep] = Field(default_factory=list)
    before_state: StateSnapshot = Field(alias="beforeState")
    after_state: StateSnapshot = Field(alias="afterState")
    verification: Optional[VerificationResult] = None
    requires_human_approval: bool = Field(alias="requiresHumanApproval")
    approval_id: Optional[str] = Field(default=None, alias="approvalId")
    created_at: datetime = Field(alias="createdAt")
    completed_at: Optional[datetime] = Field(default=None, alias="completedAt")
    estimated_effort_saved_minutes: int = Field(
        alias="estimatedEffortSavedMinutes", ge=0
    )

    model_config = {"populate_by_name": True, "from_attributes": True}
