"""
app/models/approval.py
───────────────────────
Pydantic v2 models for the HumanApprovalItem domain.

Mirrors frontend/src/types/approval.ts.
"""

from __future__ import annotations

from datetime import datetime
from typing import Literal, Optional
from pydantic import BaseModel, Field


ApprovalStatus = Literal["pending", "approved", "rejected", "expired"]
RiskLevel = Literal["low", "medium", "high", "critical"]
AuditAction = Literal["requested", "approved", "rejected", "commented"]
RollbackFeasibility = Literal["instant", "manual-compensation", "irreversible"]


class ApprovalAuditEntry(BaseModel):
    id: str
    action: AuditAction
    performed_by: str = Field(alias="performedBy")
    role: str
    timestamp: datetime
    notes: Optional[str] = None

    model_config = {"populate_by_name": True, "from_attributes": True}


class ImpactAssessment(BaseModel):
    production_impact: str = Field(alias="productionImpact")
    affected_records_estimate: int = Field(alias="affectedRecordsEstimate", ge=0)
    financial_exposure_risk: str = Field(alias="financialExposureRisk")
    rollback_feasibility: RollbackFeasibility = Field(alias="rollbackFeasibility")

    model_config = {"populate_by_name": True, "from_attributes": True}


class ProposedAction(BaseModel):
    action_title: str = Field(alias="actionTitle")
    target_component: str = Field(alias="targetComponent")
    change_summary: str = Field(alias="changeSummary")
    safety_checks_passed: bool = Field(alias="safetyChecksPassed")

    model_config = {"populate_by_name": True, "from_attributes": True}


class HumanApprovalItem(BaseModel):
    id: str
    approval_code: str = Field(alias="approvalCode")
    recovery_id: str = Field(alias="recoveryId")
    recovery_code: str = Field(alias="recoveryCode")
    failure_id: str = Field(alias="failureId")
    incident_code: str = Field(alias="incidentCode")
    client_id: str = Field(alias="clientId")
    client_name: str = Field(alias="clientName")
    bot_id: str = Field(alias="botId")
    bot_name: str = Field(alias="botName")
    workflow_id: str = Field(alias="workflowId")
    workflow_name: str = Field(alias="workflowName")
    risk_level: RiskLevel = Field(alias="riskLevel")
    impact_assessment: ImpactAssessment = Field(alias="impactAssessment")
    proposed_actions: list[ProposedAction] = Field(
        alias="proposedActions", default_factory=list
    )
    model_confidence_score: float = Field(
        alias="modelConfidenceScore", ge=0.0, le=100.0
    )
    status: ApprovalStatus
    requested_at: datetime = Field(alias="requestedAt")
    decided_at: Optional[datetime] = Field(default=None, alias="decidedAt")
    decided_by: Optional[str] = Field(default=None, alias="decidedBy")
    decision_notes: Optional[str] = Field(default=None, alias="decisionNotes")
    audit_trail: list[ApprovalAuditEntry] = Field(
        alias="auditTrail", default_factory=list
    )

    model_config = {"populate_by_name": True, "from_attributes": True}


class RecordDecisionRequest(BaseModel):
    """Body for POST /approvals/{id}/decide"""

    decision: Literal["approved", "rejected"]
    decided_by: str = Field(alias="decidedBy", min_length=2, max_length=200)
    role: str = Field(default="Operations Manager", min_length=2, max_length=200)
    notes: Optional[str] = Field(default=None, max_length=2000)

    model_config = {"populate_by_name": True}
