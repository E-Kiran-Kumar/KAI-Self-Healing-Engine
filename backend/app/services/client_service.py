"""
app/services/client_service.py
──────────────────────────────
Database-backed asynchronous service for Client management.
"""

from __future__ import annotations

from datetime import datetime, timezone
import re
from typing import Optional

from sqlalchemy import or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models.client import ClientModel
from app.models.client import Client, CreateClientRequest, UpdateClientRequest


class ClientService:
    @staticmethod
    async def list_clients(
        db: AsyncSession,
        search: Optional[str] = None,
        tier: Optional[str] = None,
        status: Optional[str] = None,
    ) -> list[Client]:
        stmt = select(ClientModel)

        if tier:
            stmt = stmt.where(ClientModel.tier.ilike(tier.strip()))
        if status:
            stmt = stmt.where(ClientModel.status.ilike(status.strip()))
        if search:
            q = f"%{search.strip()}%"
            stmt = stmt.where(
                or_(
                    ClientModel.name.ilike(q),
                    ClientModel.code.ilike(q),
                    ClientModel.industry.ilike(q),
                    ClientModel.region.ilike(q),
                )
            )

        stmt = stmt.order_by(ClientModel.created_at.desc())
        result = await db.execute(stmt)
        models = result.scalars().all()
        return [Client.model_validate(m, from_attributes=True) for m in models]

    @staticmethod
    async def get_client(db: AsyncSession, client_id: str) -> Optional[Client]:
        stmt = select(ClientModel).where(ClientModel.id == client_id)
        result = await db.execute(stmt)
        model = result.scalar_one_or_none()
        if not model:
            return None
        return Client.model_validate(model, from_attributes=True)

    @staticmethod
    async def create_client(db: AsyncSession, data: CreateClientRequest) -> Client:
        # Generate clean slug ID
        clean_code = re.sub(r"[^a-zA-Z0-9]", "", data.code).lower()
        client_id = f"client-{clean_code}"
        suffix = 1
        base_id = client_id

        # Ensure ID uniqueness
        while True:
            existing = await db.execute(
                select(ClientModel.id).where(ClientModel.id == client_id)
            )
            if existing.scalar_one_or_none() is None:
                break
            client_id = f"{base_id}-{suffix}"
            suffix += 1

        now = datetime.now(timezone.utc)
        model = ClientModel(
            id=client_id,
            name=data.name,
            code=data.code,
            tier=data.tier,
            status=data.status,
            primary_contact=data.primary_contact.model_dump(by_alias=True),
            region=data.region,
            industry=data.industry,
            sla_uptime=data.sla_uptime,
            max_concurrent_bots=data.max_concurrent_bots,
            active_bots_count=0,
            total_workflows_count=0,
            healing_auto_recovery_enabled=data.healing_auto_recovery_enabled,
            created_at=now,
            updated_at=now,
            notes=data.notes,
        )
        db.add(model)
        await db.flush()
        await db.refresh(model)
        return Client.model_validate(model, from_attributes=True)

    @staticmethod
    async def update_client(
        db: AsyncSession, client_id: str, data: UpdateClientRequest
    ) -> Optional[Client]:
        stmt = select(ClientModel).where(ClientModel.id == client_id)
        result = await db.execute(stmt)
        model = result.scalar_one_or_none()
        if not model:
            return None

        update_dict = data.model_dump(exclude_unset=True)
        if "name" in update_dict and update_dict["name"] is not None:
            model.name = update_dict["name"]
        if "tier" in update_dict and update_dict["tier"] is not None:
            model.tier = update_dict["tier"]
        if "status" in update_dict and update_dict["status"] is not None:
            model.status = update_dict["status"]
        if "primary_contact" in update_dict and update_dict["primary_contact"] is not None:
            model.primary_contact = update_dict["primary_contact"]
        if "region" in update_dict and update_dict["region"] is not None:
            model.region = update_dict["region"]
        if "industry" in update_dict and update_dict["industry"] is not None:
            model.industry = update_dict["industry"]
        if "sla_uptime" in update_dict and update_dict["sla_uptime"] is not None:
            model.sla_uptime = update_dict["sla_uptime"]
        if "max_concurrent_bots" in update_dict and update_dict["max_concurrent_bots"] is not None:
            model.max_concurrent_bots = update_dict["max_concurrent_bots"]
        if "healing_auto_recovery_enabled" in update_dict and update_dict["healing_auto_recovery_enabled"] is not None:
            model.healing_auto_recovery_enabled = update_dict["healing_auto_recovery_enabled"]
        if "notes" in update_dict:
            model.notes = update_dict["notes"]

        model.updated_at = datetime.now(timezone.utc)
        await db.flush()
        await db.refresh(model)
        return Client.model_validate(model, from_attributes=True)

    @staticmethod
    async def delete_client(db: AsyncSession, client_id: str) -> bool:
        stmt = select(ClientModel).where(ClientModel.id == client_id)
        result = await db.execute(stmt)
        model = result.scalar_one_or_none()
        if not model:
            return False

        await db.delete(model)
        await db.flush()
        return True
