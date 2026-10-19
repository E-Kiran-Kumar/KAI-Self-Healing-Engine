"""
app/routers/approvals.py
────────────────────────
Human-in-the-loop approval queue and decision endpoints backed by database.
"""

from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.models.approval import HumanApprovalItem, RecordDecisionRequest
from app.services.approval_service import ApprovalService

router = APIRouter(prefix="/approvals", tags=["Approvals"])


@router.get("", response_model=list[HumanApprovalItem])
async def list_approvals(
    client_id: Optional[str] = Query(None, alias="clientId", description="Filter by client ID"),
    status_filter: Optional[str] = Query(None, alias="status", description="Filter by approval status (pending, approved, rejected)"),
    risk_level: Optional[str] = Query(None, alias="riskLevel", description="Filter by risk level (critical, high, medium, low)"),
    db: AsyncSession = Depends(get_db),
) -> list[HumanApprovalItem]:
    """Retrieve all human approval items with optional filtering."""
    return await ApprovalService.list_approvals(
        db=db, client_id=client_id, status=status_filter, risk_level=risk_level
    )


@router.get("/pending", response_model=list[HumanApprovalItem])
async def get_pending_approvals(
    db: AsyncSession = Depends(get_db),
) -> list[HumanApprovalItem]:
    """Retrieve only items currently awaiting human operator decision."""
    return await ApprovalService.get_pending_approvals(db=db)


@router.get("/{approval_id}", response_model=HumanApprovalItem)
async def get_approval(
    approval_id: str,
    db: AsyncSession = Depends(get_db),
) -> HumanApprovalItem:
    """Retrieve detailed impact assessment, proposed actions, and audit trail for an approval item."""
    approval = await ApprovalService.get_approval(db=db, approval_id=approval_id)
    if not approval:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Approval item '{approval_id}' not found.",
        )
    return approval


@router.post("/{approval_id}/decide", response_model=HumanApprovalItem)
async def record_decision(
    approval_id: str,
    body: RecordDecisionRequest,
    db: AsyncSession = Depends(get_db),
) -> HumanApprovalItem:
    """Record an operator approval or rejection decision with audit log entry and recovery cascade."""
    updated = await ApprovalService.record_decision(
        db=db, approval_id=approval_id, req=body
    )
    if not updated:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Approval item '{approval_id}' not found.",
        )
    return updated
