"""
tests/test_bots.py
──────────────────
Automated tests for Bot fleet querying, filtering, and status updates.
"""

import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_list_all_bots(client: AsyncClient) -> None:
    response = await client.get("/api/v1/bots")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 12
    identifiers = [b["identifier"] for b in data]
    assert "BOT-APEX-001" in identifiers
    assert "BOT-FINC-001" in identifiers


@pytest.mark.asyncio
async def test_filter_bots_by_client(client: AsyncClient) -> None:
    response = await client.get("/api/v1/bots?clientId=client-apex")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 3
    assert all(b["clientId"] == "client-apex" for b in data)


@pytest.mark.asyncio
async def test_filter_bots_by_status(client: AsyncClient) -> None:
    response = await client.get("/api/v1/bots?status=failed")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 2
    assert all(b["status"] == "failed" for b in data)


@pytest.mark.asyncio
async def test_get_bot_by_id(client: AsyncClient) -> None:
    response = await client.get("/api/v1/bots/bot-apex-01")
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == "bot-apex-01"
    assert data["name"] == "Customs Declaration Auto-Filer"
    assert data["selfHealingEligible"] is True
    assert "Chromium" in data["metadata"]["browserVersion"]


@pytest.mark.asyncio
async def test_update_bot_status(client: AsyncClient) -> None:
    payload = {"status": "paused", "reason": "Scheduled maintenance"}
    response = await client.patch("/api/v1/bots/bot-apex-01/status", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "paused"

    # Confirm status persisted
    get_res = await client.get("/api/v1/bots/bot-apex-01")
    assert get_res.json()["status"] == "paused"


@pytest.mark.asyncio
async def test_get_bot_not_found(client: AsyncClient) -> None:
    response = await client.get("/api/v1/bots/bot-not-exist")
    assert response.status_code == 404
