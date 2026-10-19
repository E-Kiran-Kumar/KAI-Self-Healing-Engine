"""
app/routers/workflows.py
────────────────────────
Workflow definitions and execution trace run endpoints backed by database.
"""

from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.models.workflow import WorkflowDefinition, WorkflowExecutionRun
from app.services.workflow_service import WorkflowService

router = APIRouter(prefix="/workflows", tags=["Workflows"])


@router.get("", response_model=list[WorkflowDefinition])
async def list_workflows(
    client_id: Optional[str] = Query(None, alias="clientId", description="Filter by client ID"),
    category: Optional[str] = Query(None, description="Filter by category (finance, procurement, logistics, healthcare, hr)"),
    db: AsyncSession = Depends(get_db),
) -> list[WorkflowDefinition]:
    """Retrieve catalog of automated workflow definitions across enterprise clients."""
    return await WorkflowService.list_definitions(
        db=db, client_id=client_id, category=category
    )


@router.get("/runs", response_model=list[WorkflowExecutionRun])
async def list_workflow_runs(
    workflow_id: Optional[str] = Query(None, alias="workflowId", description="Filter by workflow ID"),
    client_id: Optional[str] = Query(None, alias="clientId", description="Filter by client ID"),
    status_filter: Optional[str] = Query(None, alias="status", description="Filter by run status"),
    db: AsyncSession = Depends(get_db),
) -> list[WorkflowExecutionRun]:
    """Retrieve historical and live workflow execution runs."""
    return await WorkflowService.list_runs(
        db=db, workflow_id=workflow_id, client_id=client_id, status=status_filter
    )


@router.get("/runs/{run_id}", response_model=WorkflowExecutionRun)
async def get_workflow_run(
    run_id: str,
    db: AsyncSession = Depends(get_db),
) -> WorkflowExecutionRun:
    """Retrieve full step execution traces and payload snapshots for a specific run."""
    run = await WorkflowService.get_run(db=db, run_id=run_id)
    if not run:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Workflow run '{run_id}' not found.",
        )
    return run


@router.get("/{workflow_id}", response_model=WorkflowDefinition)
async def get_workflow(
    workflow_id: str,
    db: AsyncSession = Depends(get_db),
) -> WorkflowDefinition:
    """Retrieve metadata and assigned bot mappings for a workflow definition."""
    workflow = await WorkflowService.get_definition(db=db, workflow_id=workflow_id)
    if not workflow:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Workflow definition '{workflow_id}' not found.",
        )
    return workflow
