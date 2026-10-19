"""
tests/test_db_models.py
───────────────────────
Unit tests for SQLAlchemy 2.0 ORM models, relationships, cascading, and JSON columns.
"""

from datetime import datetime, timezone
import pytest
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.db.models.approval import HumanApprovalModel
from app.db.models.bot import BotModel
from app.db.models.client import ClientModel
from app.db.models.failure import FailureIncidentModel
from app.db.models.recovery import RecoveryAttemptModel
from app.db.models.workflow import WorkflowDefinitionModel


@pytest.mark.asyncio
async def test_client_model_crud(db_session: AsyncSession) -> None:
    now = datetime.now(timezone.utc)
    new_client = ClientModel(
        id="client-test-corp",
        name="Test Robotics Corp",
        code="TRC",
        tier="Enterprise",
        status="active",
        primary_contact={"name": "Alice Smith", "email": "alice@test.corp", "role": "CTO"},
        region="US-East",
        industry="Automated Logistics",
        sla_uptime=99.95,
        max_concurrent_bots=10,
        active_bots_count=0,
        total_workflows_count=0,
        healing_auto_recovery_enabled=True,
        created_at=now,
        updated_at=now,
        notes="Automated test fixture",
    )
    db_session.add(new_client)
    await db_session.commit()

    # Query back
    stmt = select(ClientModel).where(ClientModel.id == "client-test-corp")
    queried = (await db_session.execute(stmt)).scalar_one_or_none()
    assert queried is not None
    assert queried.name == "Test Robotics Corp"
    assert queried.code == "TRC"
    assert queried.primary_contact["email"] == "alice@test.corp"

    # Update
    queried.notes = "Updated notes"
    await db_session.commit()

    stmt2 = select(ClientModel).where(ClientModel.id == "client-test-corp")
    updated = (await db_session.execute(stmt2)).scalar_one()
    assert updated.notes == "Updated notes"

    # Delete
    await db_session.delete(updated)
    await db_session.commit()

    stmt3 = select(ClientModel).where(ClientModel.id == "client-test-corp")
    deleted = (await db_session.execute(stmt3)).scalar_one_or_none()
    assert deleted is None


@pytest.mark.asyncio
async def test_client_code_unique_constraint(db_session: AsyncSession) -> None:
    now = datetime.now(timezone.utc)
    # Attempt to insert a client with duplicate code 'APEX' (which exists in seed)
    dup_client = ClientModel(
        id="client-dup-apex",
        name="Duplicate Apex Logistics",
        code="APEX",  # Duplicate code
        tier="Scale",
        status="active",
        primary_contact={"name": "Bob", "email": "bob@dup.io", "role": "Ops"},
        region="US-East",
        industry="Logistics",
        sla_uptime=99.0,
        max_concurrent_bots=5,
        active_bots_count=0,
        total_workflows_count=0,
        healing_auto_recovery_enabled=False,
        created_at=now,
        updated_at=now,
    )
    db_session.add(dup_client)
    with pytest.raises(IntegrityError):
        await db_session.commit()
    await db_session.rollback()


@pytest.mark.asyncio
async def test_orm_relationships_and_foreign_keys(db_session: AsyncSession) -> None:
    stmt = (
        select(ClientModel)
        .where(ClientModel.id == "client-apex")
        .options(
            selectinload(ClientModel.bots),
            selectinload(ClientModel.workflows),
        )
    )
    result = await db_session.execute(stmt)
    apex = result.scalar_one()

    # Client -> Bots relationship
    assert len(apex.bots) >= 3
    bot_identifiers = [b.identifier for b in apex.bots]
    assert "BOT-APEX-001" in bot_identifiers

    # Client -> Workflows relationship
    assert len(apex.workflows) >= 2
    wf_ids = [w.id for w in apex.workflows]
    assert "wf-apex-ocr" in wf_ids


@pytest.mark.asyncio
async def test_approval_recovery_relationship(db_session: AsyncSession) -> None:
    stmt = (
        select(HumanApprovalModel)
        .where(HumanApprovalModel.id == "apr-finc-01")
        .options(selectinload(HumanApprovalModel.recovery))
    )
    result = await db_session.execute(stmt)
    approval = result.scalar_one()

    assert approval.recovery_id == "rec-finc-01"
    assert approval.recovery is not None
    assert approval.recovery.recovery_code == "REC-3011"
    assert approval.recovery.category == "timeout"


@pytest.mark.asyncio
async def test_cascade_delete_client_removes_bots(db_session: AsyncSession) -> None:
    # Query client-cloudscale bots - verify they exist
    bot_stmt = select(BotModel).where(BotModel.client_id == "client-cloudscale")
    bots_before = (await db_session.execute(bot_stmt)).scalars().all()
    assert len(bots_before) >= 2

    # Load the client WITH all child relationships eagerly so SQLAlchemy ORM cascade fires
    # (SQLite doesn't enforce FK constraints by default, so we rely on ORM-level cascade)
    client_stmt = (
        select(ClientModel)
        .where(ClientModel.id == "client-cloudscale")
        .options(
            selectinload(ClientModel.bots),
            selectinload(ClientModel.workflows),
            selectinload(ClientModel.failures),
            selectinload(ClientModel.recoveries),
            selectinload(ClientModel.approvals),
        )
    )
    client = (await db_session.execute(client_stmt)).scalar_one()

    # ORM cascade="all, delete-orphan" will DELETE children tracked in identity map
    await db_session.delete(client)
    await db_session.commit()

    # Bots belonging to client-cloudscale should have been cascade-deleted by ORM
    bots_after = (await db_session.execute(bot_stmt)).scalars().all()
    assert len(bots_after) == 0
