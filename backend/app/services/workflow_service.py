"""
app/services/workflow_service.py
────────────────────────────────
Database-backed asynchronous service for Workflow Definitions and Execution Runs.
"""

from __future__ import annotations

from typing import Optional

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models.workflow import (
    WorkflowDefinitionModel,
    WorkflowExecutionRunModel,
)
from app.models.workflow import WorkflowDefinition, WorkflowExecutionRun


class WorkflowService:
    @staticmethod
    async def list_definitions(
        db: AsyncSession,
        client_id: Optional[str] = None,
        category: Optional[str] = None,
    ) -> list[WorkflowDefinition]:
        stmt = select(WorkflowDefinitionModel)
        if client_id:
            stmt = stmt.where(WorkflowDefinitionModel.client_id == client_id)
        if category:
            stmt = stmt.where(WorkflowDefinitionModel.category.ilike(category.strip()))

        stmt = stmt.order_by(WorkflowDefinitionModel.name.asc())
        result = await db.execute(stmt)
        models = result.scalars().all()
        return [WorkflowDefinition.model_validate(m, from_attributes=True) for m in models]

    @staticmethod
    async def get_definition(
        db: AsyncSession, workflow_id: str
    ) -> Optional[WorkflowDefinition]:
        stmt = select(WorkflowDefinitionModel).where(WorkflowDefinitionModel.id == workflow_id)
        result = await db.execute(stmt)
        model = result.scalar_one_or_none()
        if not model:
            return None
        return WorkflowDefinition.model_validate(model, from_attributes=True)

    @staticmethod
    async def list_runs(
        db: AsyncSession,
        workflow_id: Optional[str] = None,
        client_id: Optional[str] = None,
        status: Optional[str] = None,
    ) -> list[WorkflowExecutionRun]:
        stmt = select(WorkflowExecutionRunModel)
        if workflow_id:
            stmt = stmt.where(WorkflowExecutionRunModel.workflow_id == workflow_id)
        if client_id:
            stmt = stmt.where(WorkflowExecutionRunModel.client_id == client_id)
        if status:
            stmt = stmt.where(WorkflowExecutionRunModel.status.ilike(status.strip()))

        stmt = stmt.order_by(WorkflowExecutionRunModel.started_at.desc())
        result = await db.execute(stmt)
        models = result.scalars().all()
        return [WorkflowExecutionRun.model_validate(m, from_attributes=True) for m in models]

    @staticmethod
    async def get_run(
        db: AsyncSession, run_id: str
    ) -> Optional[WorkflowExecutionRun]:
        stmt = select(WorkflowExecutionRunModel).where(WorkflowExecutionRunModel.run_id == run_id)
        result = await db.execute(stmt)
        model = result.scalar_one_or_none()
        if not model:
            return None
        return WorkflowExecutionRun.model_validate(model, from_attributes=True)
