"""
tests/test_health.py
────────────────────
Automated tests for health check and root endpoints.
"""

import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_root_endpoint(client: AsyncClient) -> None:
    response = await client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert "KAI Self-Healing AI Engine" in data["name"]
    assert data["docs"] == "/docs"
    assert data["health"] == "/health"
    assert data["apiPrefix"] == "/api/v1"


@pytest.mark.asyncio
async def test_health_check(client: AsyncClient) -> None:
    response = await client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "Phase 2" in data["phase"]


@pytest.mark.asyncio
async def test_health_check_prefixed(client: AsyncClient) -> None:
    response = await client.get("/api/v1/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
