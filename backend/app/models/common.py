"""
app/models/common.py
─────────────────────
Shared response envelope models used across all routers.
"""

from __future__ import annotations

from typing import Any, Generic, Optional, TypeVar
from pydantic import BaseModel, Field

T = TypeVar("T")


class PaginatedResponse(BaseModel, Generic[T]):
    """Standard paginated list wrapper."""
    items: list[T]
    total: int = Field(ge=0)
    page: int = Field(ge=1)
    page_size: int = Field(alias="pageSize", ge=1, le=200)
    has_next: bool = Field(alias="hasNext")

    model_config = {"populate_by_name": True}


class APIError(BaseModel):
    """Structured error body returned on 4xx / 5xx responses."""
    error_code: str = Field(alias="errorCode")
    message: str
    detail: Optional[Any] = None

    model_config = {"populate_by_name": True}


class HealthResponse(BaseModel):
    status: str
    version: str
    phase: str
    note: str
