"""
tests/test_failures.py
──────────────────────
Automated tests for Failure Incident diagnostics and query endpoints.
"""

import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_list_all_failures(client: AsyncClient) -> None:
    response = await client.get("/api/v1/failures")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 6
    codes = [f["incidentCode"] for f in data]
    assert "INC-8942" in codes
    assert "INC-8941" in codes


@pytest.mark.asyncio
async def test_filter_failures_by_category(client: AsyncClient) -> None:
    response = await client.get("/api/v1/failures?category=UI")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 1
    assert all(f["category"] == "UI" for f in data)


@pytest.mark.asyncio
async def test_filter_failures_by_severity(client: AsyncClient) -> None:
    response = await client.get("/api/v1/failures?severity=critical")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 1
    assert all(f["severity"] == "critical" for f in data)


@pytest.mark.asyncio
async def test_get_failure_detail(client: AsyncClient) -> None:
    response = await client.get("/api/v1/failures/inc-apex-01")
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == "inc-apex-01"
    assert data["incidentCode"] == "INC-8942"
    assert data["failedStepNumber"] == 4
    assert data["screenshotComparison"] is not None
    assert data["screenshotComparison"]["visualDeltaScore"] == 0.38
    assert len(data["logs"]) >= 3


@pytest.mark.asyncio
async def test_get_failure_not_found(client: AsyncClient) -> None:
    response = await client.get("/api/v1/failures/inc-not-found")
    assert response.status_code == 404
