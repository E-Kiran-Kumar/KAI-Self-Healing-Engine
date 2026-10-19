"""
app/routers/clients.py
──────────────────────
Client domain REST endpoints with full database-backed CRUD support.
"""

from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.models.client import Client, CreateClientRequest, UpdateClientRequest
from app.services.client_service import ClientService

router = APIRouter(prefix="/clients", tags=["Clients"])


@router.get("", response_model=list[Client])
async def list_clients(
    search: Optional[str] = Query(None, description="Search by name, code, region, or industry"),
    tier: Optional[str] = Query(None, description="Filter by client tier (Enterprise, Strategic, Scale)"),
    status_filter: Optional[str] = Query(None, alias="status", description="Filter by client status"),
    db: AsyncSession = Depends(get_db),
) -> list[Client]:
    """Retrieve all clients matching optional search and filter criteria."""
    return await ClientService.list_clients(
        db=db, search=search, tier=tier, status=status_filter
    )


@router.post("", response_model=Client, status_code=status.HTTP_201_CREATED)
async def create_client(
    body: CreateClientRequest,
    db: AsyncSession = Depends(get_db),
) -> Client:
    """Register a new enterprise client."""
    return await ClientService.create_client(db=db, data=body)


@router.get("/{client_id}", response_model=Client)
async def get_client(
    client_id: str,
    db: AsyncSession = Depends(get_db),
) -> Client:
    """Retrieve client details by unique ID."""
    client = await ClientService.get_client(db=db, client_id=client_id)
    if not client:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Client '{client_id}' not found.",
        )
    return client


@router.patch("/{client_id}", response_model=Client)
async def update_client(
    client_id: str,
    body: UpdateClientRequest,
    db: AsyncSession = Depends(get_db),
) -> Client:
    """Update configurable attributes for an existing client."""
    updated = await ClientService.update_client(db=db, client_id=client_id, data=body)
    if not updated:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Client '{client_id}' not found.",
        )
    return updated


@router.delete("/{client_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_client(
    client_id: str,
    db: AsyncSession = Depends(get_db),
) -> None:
    """Remove a client from the registry."""
    success = await ClientService.delete_client(db=db, client_id=client_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Client '{client_id}' not found.",
        )
