"""
app/services/approval_service.py
────────────────────────────────
Database-backed asynchronous service for Human Approval queue and decision workflows.
"""

from __future__ import annotations

from datetime import datetime, timezone
from typing import Optional
import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models.approval import HumanApprovalModel
from app.db.models.recovery import RecoveryAttemptModel
from app.models.approval import (
    ApprovalAuditEntry,
    HumanApprovalItem,
    RecordDecisionRequest,
)


class ApprovalService:
    @staticmethod
    async def list_approvals(
        db: AsyncSession,
        client_id: Optional[str] = None,
        status: Optional[str] = None,
        risk_level: Optional[str] = None,
    ) -> list[HumanApprovalItem]:
        stmt = select(HumanApprovalModel)
        if client_id:
            stmt = stmt.where(HumanApprovalModel.client_id == client_id)
        if status:
            stmt = stmt.where(HumanApprovalModel.status.ilike(status.strip()))
        if risk_level:
            stmt = stmt.where(HumanApprovalModel.risk_level.ilike(risk_level.strip()))

        stmt = stmt.order_by(HumanApprovalModel.requested_at.desc())
        result = await db.execute(stmt)
        models = result.scalars().all()
        return [HumanApprovalItem.model_validate(m, from_attributes=True) for m in models]

    @staticmethod
    async def get_pending_approvals(db: AsyncSession) -> list[HumanApprovalItem]:
        stmt = (
            select(HumanApprovalModel)
            .where(HumanApprovalModel.status == "pending")
            .order_by(HumanApprovalModel.requested_at.desc())
        )
        result = await db.execute(stmt)
        models = result.scalars().all()
        return [HumanApprovalItem.model_validate(m, from_attributes=True) for m in models]

    @staticmethod
    async def get_approval(
        db: AsyncSession, approval_id: str
    ) -> Optional[HumanApprovalItem]:
        stmt = select(HumanApprovalModel).where(HumanApprovalModel.id == approval_id)
        result = await db.execute(stmt)
        model = result.scalar_one_or_none()
        if not model:
            return None
        return HumanApprovalItem.model_validate(model, from_attributes=True)

    @staticmethod
    async def record_decision(
        db: AsyncSession, approval_id: str, req: RecordDecisionRequest
    ) -> Optional[HumanApprovalItem]:
        stmt = select(HumanApprovalModel).where(HumanApprovalModel.id == approval_id)
        result = await db.execute(stmt)
        model = result.scalar_one_or_none()
        if not model:
            return None

        now = datetime.now(timezone.utc)
        audit_entry = ApprovalAuditEntry(
            id=f"aud-{uuid.uuid4().hex[:6]}",
            action=req.decision,
            performedBy=req.decided_by,
            role=req.role,
            timestamp=now,
            notes=req.notes,
        )

        model.status = req.decision
        model.decided_at = now
        model.decided_by = req.decided_by
        model.decision_notes = req.notes

        # Serialize to JSON-safe dict (convert datetime -> ISO 8601 string)
        entry_dict = audit_entry.model_dump(by_alias=True)
        ts = entry_dict.get("timestamp")
        if hasattr(ts, "isoformat"):
            entry_dict["timestamp"] = ts.isoformat()

        # Copy existing audit trail and append
        trail = list(model.audit_trail)
        trail.append(entry_dict)
        model.audit_trail = trail

        # Cascade update to linked recovery attempt
        if model.recovery_id:
            rec_stmt = select(RecoveryAttemptModel).where(
                RecoveryAttemptModel.id == model.recovery_id
            )
            rec_result = await db.execute(rec_stmt)
            recovery = rec_result.scalar_one_or_none()
            if recovery:
                if req.decision == "approved":
                    recovery.status = "approved"
                elif req.decision == "rejected":
                    recovery.status = "escalated"

        await db.flush()
        await db.refresh(model)
        return HumanApprovalItem.model_validate(model, from_attributes=True)
