"""
app/db/session.py
─────────────────
Asynchronous database engine, session factory, dependency injection,
and lifecycle management.
"""

from __future__ import annotations

import copy
from datetime import datetime
from typing import Any, AsyncGenerator

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import (
    AsyncEngine,
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)

from app.core.config import settings
from app.data.seed import (
    INITIAL_APPROVALS,
    INITIAL_BOTS,
    INITIAL_CLIENTS,
    INITIAL_FAILURES,
    INITIAL_RECOVERIES,
    INITIAL_WORKFLOWS,
    INITIAL_WORKFLOW_RUNS,
)
from app.db.base import Base
from app.db.models.approval import HumanApprovalModel
from app.db.models.bot import BotModel
from app.db.models.client import ClientModel
from app.db.models.failure import FailureIncidentModel
from app.db.models.recovery import RecoveryAttemptModel
from app.db.models.workflow import (
    WorkflowDefinitionModel,
    WorkflowExecutionRunModel,
)


def create_engine_for_url(url: str) -> AsyncEngine:
    """Create an asynchronous SQLAlchemy engine tailored to SQLite or PostgreSQL."""
    if url.startswith("sqlite"):
        return create_async_engine(
            url,
            echo=settings.db_echo,
            connect_args={"check_same_thread": False},
        )
    return create_async_engine(
        url,
        echo=settings.db_echo,
        pool_size=settings.db_pool_size,
        max_overflow=settings.db_max_overflow,
        pool_recycle=settings.db_pool_recycle,
        pool_pre_ping=settings.db_pool_pre_ping,
    )


# Application-level engine and sessionmaker singleton
engine = create_engine_for_url(settings.database_url)
async_session_factory = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autoflush=False,
)


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """FastAPI route dependency yielding an AsyncSession with automatic transaction management."""
    async with async_session_factory() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise


def _parse_dt(val: Any) -> Any:
    """Convert ISO datetime strings to Python datetime objects for DB storage."""
    if isinstance(val, str) and ("T" in val or "-" in val):
        try:
            return datetime.fromisoformat(val.replace("Z", "+00:00"))
        except ValueError:
            return val
    return val


async def seed_db(session: AsyncSession, force_reset: bool = False) -> None:
    """Populate database tables with seed fixtures if empty or force reset requested."""
    # Check if clients already exist
    client_count_res = await session.execute(select(func.count(ClientModel.id)))
    count = client_count_res.scalar_one()

    if count > 0 and not force_reset:
        return

    if force_reset:
        # Delete children in dependency order
        await session.execute(HumanApprovalModel.__table__.delete())
        await session.execute(RecoveryAttemptModel.__table__.delete())
        await session.execute(FailureIncidentModel.__table__.delete())
        await session.execute(WorkflowExecutionRunModel.__table__.delete())
        await session.execute(WorkflowDefinitionModel.__table__.delete())
        await session.execute(BotModel.__table__.delete())
        await session.execute(ClientModel.__table__.delete())
        await session.flush()

    # 1. Clients
    for raw in INITIAL_CLIENTS:
        c = copy.deepcopy(raw)
        model = ClientModel(
            id=c["id"],
            name=c["name"],
            code=c["code"],
            tier=c["tier"],
            status=c["status"],
            primary_contact=c["primaryContact"],
            region=c["region"],
            industry=c["industry"],
            sla_uptime=c["slaUptime"],
            max_concurrent_bots=c["maxConcurrentBots"],
            active_bots_count=c["activeBotsCount"],
            total_workflows_count=c["totalWorkflowsCount"],
            healing_auto_recovery_enabled=c["healingAutoRecoveryEnabled"],
            created_at=_parse_dt(c["createdAt"]),
            updated_at=_parse_dt(c["updatedAt"]),
            notes=c.get("notes"),
        )
        session.add(model)
    await session.flush()

    # 2. Bots
    for raw in INITIAL_BOTS:
        b = copy.deepcopy(raw)
        bot_model = BotModel(
            id=b["id"],
            client_id=b["clientId"],
            client_name=b["clientName"],
            name=b["name"],
            identifier=b["identifier"],
            status=b["status"],
            environment=b["environment"],
            current_workflow_id=b.get("currentWorkflowId"),
            current_workflow_name=b.get("currentWorkflowName"),
            host_agent=b["hostAgent"],
            version=b["version"],
            last_run_at=_parse_dt(b["lastRunAt"]),
            next_scheduled_run_at=_parse_dt(b.get("nextScheduledRunAt")),
            consecutive_failures=b["consecutiveFailures"],
            success_rate_24h=b["successRate24h"],
            total_executions=b["totalExecutions"],
            self_healing_eligible=b["selfHealingEligible"],
            history=b.get("history", []),
            bot_metadata=b["metadata"],
        )
        session.add(bot_model)
    await session.flush()

    # 3. Workflows
    for raw in INITIAL_WORKFLOWS:
        w = copy.deepcopy(raw)
        wf_model = WorkflowDefinitionModel(
            id=w["id"],
            name=w["name"],
            description=w["description"],
            client_id=w["clientId"],
            client_name=w["clientName"],
            assigned_bot_ids=w["assignedBotIds"],
            category=w["category"],
            average_duration_ms=w["averageDurationMs"],
            success_rate=w["successRate"],
            last_execution_at=_parse_dt(w["lastExecutionAt"]),
            step_count=w["stepCount"],
        )
        session.add(wf_model)
    await session.flush()

    # 4. Failures
    for raw in INITIAL_FAILURES:
        f = copy.deepcopy(raw)
        fail_model = FailureIncidentModel(
            id=f["id"],
            incident_code=f["incidentCode"],
            client_id=f["clientId"],
            client_name=f["clientName"],
            bot_id=f["botId"],
            bot_name=f["botName"],
            workflow_id=f["workflowId"],
            workflow_name=f["workflowName"],
            run_id=f["runId"],
            category=f["category"],
            severity=f["severity"],
            status=f["status"],
            failed_step_number=f["failedStepNumber"],
            failed_step_name=f["failedStepName"],
            error_message=f["errorMessage"],
            stack_trace=f["stackTrace"],
            detected_at=_parse_dt(f["detectedAt"]),
            resolved_at=_parse_dt(f.get("resolvedAt")),
            screenshot_comparison=f.get("screenshotComparison"),
            logs=f.get("logs", []),
            failure_metadata=f["metadata"],
            recovery_id=f.get("recoveryId"),
        )
        session.add(fail_model)
    await session.flush()

    # 5. Recoveries
    for raw in INITIAL_RECOVERIES:
        r = copy.deepcopy(raw)
        rec_model = RecoveryAttemptModel(
            id=r["id"],
            recovery_code=r["recoveryCode"],
            failure_id=r["failureId"],
            incident_code=r["incidentCode"],
            client_id=r["clientId"],
            client_name=r["clientName"],
            bot_id=r["botId"],
            bot_name=r["botName"],
            workflow_id=r["workflowId"],
            workflow_name=r["workflowName"],
            category=r["category"],
            status=r["status"],
            recovery_method=r["recoveryMethod"],
            model_confidence_score=r["modelConfidenceScore"],
            confidence_rationale=r["confidenceRationale"],
            steps=r.get("steps", []),
            before_state=r["beforeState"],
            after_state=r["afterState"],
            verification=r.get("verification"),
            requires_human_approval=r["requiresHumanApproval"],
            approval_id=r.get("approvalId"),
            created_at=_parse_dt(r["createdAt"]),
            completed_at=_parse_dt(r.get("completedAt")),
            estimated_effort_saved_minutes=r.get("estimatedEffortSavedMinutes", 0),
        )
        session.add(rec_model)
    await session.flush()

    # 6. Approvals
    for raw in INITIAL_APPROVALS:
        a = copy.deepcopy(raw)
        appr_model = HumanApprovalModel(
            id=a["id"],
            approval_code=a["approvalCode"],
            recovery_id=a["recoveryId"],
            recovery_code=a["recoveryCode"],
            failure_id=a["failureId"],
            incident_code=a["incidentCode"],
            client_id=a["clientId"],
            client_name=a["clientName"],
            bot_id=a["botId"],
            bot_name=a["botName"],
            workflow_id=a["workflowId"],
            workflow_name=a["workflowName"],
            risk_level=a["riskLevel"],
            impact_assessment=a["impactAssessment"],
            proposed_actions=a.get("proposedActions", []),
            model_confidence_score=a["modelConfidenceScore"],
            status=a["status"],
            requested_at=_parse_dt(a["requestedAt"]),
            decided_at=_parse_dt(a.get("decidedAt")),
            decided_by=a.get("decidedBy"),
            decision_notes=a.get("decisionNotes"),
            audit_trail=a.get("auditTrail", []),
        )
        session.add(appr_model)
    await session.flush()

    # 7. Workflow Execution Runs
    for raw in INITIAL_WORKFLOW_RUNS:
        wr = copy.deepcopy(raw)
        run_model = WorkflowExecutionRunModel(
            run_id=wr["runId"],
            workflow_id=wr["workflowId"],
            workflow_name=wr["workflowName"],
            bot_id=wr["botId"],
            bot_name=wr["botName"],
            client_id=wr["clientId"],
            client_name=wr["clientName"],
            status=wr["status"],
            started_at=_parse_dt(wr["startedAt"]),
            completed_at=_parse_dt(wr.get("completedAt")),
            duration_ms=wr["durationMs"],
            steps=wr.get("steps", []),
            failure_id=wr.get("failureId"),
            recovery_id=wr.get("recoveryId"),
            trace_snapshot_id=wr.get("traceSnapshotId"),
        )
        session.add(run_model)
    await session.commit()


async def init_db() -> None:
    """Ensure database schema is created and seeded on application startup."""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with async_session_factory() as session:
        await seed_db(session, force_reset=settings.reset_store_on_startup)


async def close_db() -> None:
    """Dispose of the database engine and all active connection pools on shutdown."""
    await engine.dispose()
