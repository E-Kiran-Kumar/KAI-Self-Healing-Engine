"""
tests/test_recoveries.py
────────────────────────
Automated tests for Recovery Attempt inspection endpoints.
"""

import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_list_all_recoveries(client: AsyncClient) -> None:
    response = await client.get("/api/v1/recoveries")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 5
    codes = [r["recoveryCode"] for r in data]
    assert "REC-3012" in codes
    assert "REC-3011" in codes


@pytest.mark.asyncio
async def test_filter_recoveries_by_status(client: AsyncClient) -> None:
    response = await client.get("/api/v1/recoveries?status=simulated-success")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 2
    assert all(r["status"] == "simulated-success" for r in data)


@pytest.mark.asyncio
async def test_get_recovery_detail(client: AsyncClient) -> None:
    response = await client.get("/api/v1/recoveries/rec-apex-01")
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == "rec-apex-01"
    assert data["recoveryMethod"] == "DOM Selector Recalibration"
    assert data["modelConfidenceScore"] == 94.6
    assert data["beforeState"]["title"] == "Broken Target Selector"
    assert data["afterState"]["title"] == "Recalibrated Resilient Selector"
    assert len(data["steps"]) == 3


@pytest.mark.asyncio
async def test_get_recovery_not_found(client: AsyncClient) -> None:
    response = await client.get("/api/v1/recoveries/rec-nonexistent")
    assert response.status_code == 404
