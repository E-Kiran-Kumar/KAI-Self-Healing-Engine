"""
tests/test_clients.py
─────────────────────
Automated tests for Client CRUD and filtering endpoints.
"""

import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_list_clients(client: AsyncClient) -> None:
    response = await client.get("/api/v1/clients")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 5
    ids = [c["id"] for c in data]
    assert "client-apex" in ids
    assert "client-fincorp" in ids


@pytest.mark.asyncio
async def test_filter_clients_by_tier(client: AsyncClient) -> None:
    response = await client.get("/api/v1/clients?tier=Enterprise")
    assert response.status_code == 200
    data = response.json()
    assert all(c["tier"] == "Enterprise" for c in data)
    assert len(data) >= 3


@pytest.mark.asyncio
async def test_search_clients(client: AsyncClient) -> None:
    response = await client.get("/api/v1/clients?search=Logistics")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 1
    assert data[0]["name"] == "Apex Global Logistics"


@pytest.mark.asyncio
async def test_get_client_by_id(client: AsyncClient) -> None:
    response = await client.get("/api/v1/clients/client-apex")
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == "client-apex"
    assert data["code"] == "APEX"
    assert data["primaryContact"]["email"] == "e.vance@apexlogistics.io"
    assert data["slaUptime"] == 99.98


@pytest.mark.asyncio
async def test_get_client_not_found(client: AsyncClient) -> None:
    response = await client.get("/api/v1/clients/client-unknown-404")
    assert response.status_code == 404
    data = response.json()
    assert data["errorCode"] == "HTTP_404"


@pytest.mark.asyncio
async def test_create_client(client: AsyncClient) -> None:
    payload = {
        "name": "Vanguard Robotics Corp",
        "code": "VGRD",
        "tier": "Enterprise",
        "status": "active",
        "primaryContact": {
            "name": "Sarah Connor",
            "email": "sarah@vanguard.io",
            "role": "Chief Automation Officer",
        },
        "region": "US-West",
        "industry": "Industrial Robotics",
        "slaUptime": 99.95,
        "maxConcurrentBots": 50,
        "healingAutoRecoveryEnabled": True,
        "notes": "Automated warehouse fleet.",
    }
    response = await client.post("/api/v1/clients", json=payload)
    assert response.status_code == 201
    created = response.json()
    assert created["id"] == "client-vgrd"
    assert created["name"] == "Vanguard Robotics Corp"
    assert created["code"] == "VGRD"

    # Verify retrievable via GET
    get_res = await client.get("/api/v1/clients/client-vgrd")
    assert get_res.status_code == 200
    assert get_res.json()["name"] == "Vanguard Robotics Corp"


@pytest.mark.asyncio
async def test_create_client_validation_error(client: AsyncClient) -> None:
    # Invalid email and missing required fields
    payload = {
        "name": "X",  # Too short (min_length=2)
        "code": "invalid-code!",  # Regex pattern violation
        "tier": "Enterprise",
        "primaryContact": {
            "name": "",
            "email": "not-an-email",
            "role": "",
        },
        "region": "",
    }
    response = await client.post("/api/v1/clients", json=payload)
    assert response.status_code == 422
    data = response.json()
    assert data["errorCode"] == "VALIDATION_ERROR"


@pytest.mark.asyncio
async def test_update_client(client: AsyncClient) -> None:
    patch_payload = {
        "slaUptime": 99.99,
        "notes": "Updated SLA agreement.",
    }
    response = await client.patch("/api/v1/clients/client-apex", json=patch_payload)
    assert response.status_code == 200
    updated = response.json()
    assert updated["slaUptime"] == 99.99
    assert updated["notes"] == "Updated SLA agreement."


@pytest.mark.asyncio
async def test_delete_client(client: AsyncClient) -> None:
    del_res = await client.delete("/api/v1/clients/client-apex")
    assert del_res.status_code == 204

    # Verify 404 after deletion
    get_res = await client.get("/api/v1/clients/client-apex")
    assert get_res.status_code == 404
