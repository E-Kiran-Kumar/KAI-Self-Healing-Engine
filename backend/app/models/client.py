"""
app/models/client.py
─────────────────────
Pydantic v2 models for the Client domain.

Mirrors the TypeScript types in frontend/src/types/client.ts so that
the frontend can swap its mock service layer for real fetch() calls
without changing any page-level components.

Phase 3 note: these models will also serve as the basis for the
SQLAlchemy ORM table definitions.
"""

from __future__ import annotations

from datetime import datetime
from typing import Literal, Optional
from pydantic import BaseModel, EmailStr, Field, field_validator


ClientTier = Literal["Enterprise", "Strategic", "Scale"]
ClientStatus = Literal["active", "onboarding", "suspended"]


class PrimaryContact(BaseModel):
    name: str = Field(..., min_length=1, max_length=200)
    email: EmailStr
    role: str = Field(..., min_length=1, max_length=200)


# ── Read model (full object returned by GET) ──────────────────────────────────

class Client(BaseModel):
    id: str
    name: str
    code: str
    tier: ClientTier
    status: ClientStatus
    primary_contact: PrimaryContact = Field(alias="primaryContact")
    region: str
    industry: str
    sla_uptime: float = Field(alias="slaUptime", ge=0.0, le=100.0)
    max_concurrent_bots: int = Field(alias="maxConcurrentBots", ge=1)
    active_bots_count: int = Field(alias="activeBotsCount", ge=0)
    total_workflows_count: int = Field(alias="totalWorkflowsCount", ge=0)
    healing_auto_recovery_enabled: bool = Field(alias="healingAutoRecoveryEnabled")
    created_at: datetime = Field(alias="createdAt")
    updated_at: datetime = Field(alias="updatedAt")
    notes: Optional[str] = None

    model_config = {"populate_by_name": True, "from_attributes": True}


# ── Write model (body of POST /clients) ──────────────────────────────────────

class CreateClientRequest(BaseModel):
    """Validated input for registering a new client.  IDs and timestamps are
    generated server-side so they are absent here."""

    name: str = Field(..., min_length=2, max_length=200)
    code: str = Field(..., min_length=2, max_length=8, pattern=r"^[A-Z0-9]+$")
    tier: ClientTier
    status: ClientStatus = "active"
    primary_contact: PrimaryContact = Field(alias="primaryContact")
    region: str = Field(..., min_length=2, max_length=200)
    industry: str = Field(default="Technology & Services", min_length=2, max_length=200)
    sla_uptime: float = Field(default=99.9, alias="slaUptime", ge=90.0, le=100.0)
    max_concurrent_bots: int = Field(default=10, alias="maxConcurrentBots", ge=1, le=500)
    healing_auto_recovery_enabled: bool = Field(default=True, alias="healingAutoRecoveryEnabled")
    notes: Optional[str] = Field(default=None, max_length=2000)

    model_config = {"populate_by_name": True}

    @field_validator("code", mode="before")
    @classmethod
    def uppercase_code(cls, v: str) -> str:
        return v.upper()


# ── Partial update model (body of PATCH /clients/{id}) ───────────────────────

class UpdateClientRequest(BaseModel):
    name: Optional[str] = Field(default=None, min_length=2, max_length=200)
    tier: Optional[ClientTier] = None
    status: Optional[ClientStatus] = None
    primary_contact: Optional[PrimaryContact] = Field(default=None, alias="primaryContact")
    region: Optional[str] = Field(default=None, min_length=2, max_length=200)
    industry: Optional[str] = Field(default=None, min_length=2, max_length=200)
    sla_uptime: Optional[float] = Field(default=None, alias="slaUptime", ge=90.0, le=100.0)
    max_concurrent_bots: Optional[int] = Field(default=None, alias="maxConcurrentBots", ge=1, le=500)
    healing_auto_recovery_enabled: Optional[bool] = Field(default=None, alias="healingAutoRecoveryEnabled")
    notes: Optional[str] = Field(default=None, max_length=2000)

    model_config = {"populate_by_name": True}
