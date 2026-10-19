"""
tests/test_analytics.py
───────────────────────
Automated tests for aggregated analytics, dynamic calculations, and category distribution.
"""

import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_get_analytics_summary_default(client: AsyncClient) -> None:
    response = await client.get("/api/v1/analytics/summary")
    assert response.status_code == 200
    data = response.json()

    assert data["timeRange"] == "7d"

    # 1. Overview metrics
    overview = data["overview"]
    assert overview["totalRegisteredBots"] == 12
    assert overview["runningBots"] > 0
    assert overview["failedBots"] > 0
    assert overview["totalRecoveriesAttempted"] == 5
    assert overview["successfulRecoveriesDemo"] > 0
    assert 0 <= overview["recoverySuccessRate"] <= 100
    assert overview["manualEffortSavedHours"] > 0
    assert overview["pendingApprovalsCount"] == 2
    assert overview["activeClientsCount"] == 4

    # 2. Category distribution
    categories = [c["category"] for c in data["categoryBreakdown"]]
    expected_categories = [
        "UI",
        "API",
        "timeout",
        "network",
        "database",
        "validation",
        "authentication",
    ]
    for cat in expected_categories:
        assert cat in categories

    # 3. Client performance
    assert len(data["clientPerformance"]) == 5
    apex = next(
        (c for c in data["clientPerformance"] if "Apex" in c["clientName"]), None
    )
    assert apex is not None
    assert apex["totalBots"] == 3
    assert apex["successRate"] > 0

    # 4. Trends
    assert len(data["trends"]) == 7


@pytest.mark.asyncio
async def test_get_analytics_summary_time_ranges(client: AsyncClient) -> None:
    res_24h = await client.get("/api/v1/analytics/summary?timeRange=24h")
    assert res_24h.status_code == 200
    assert len(res_24h.json()["trends"]) == 1

    res_30d = await client.get("/api/v1/analytics/summary?timeRange=30d")
    assert res_30d.status_code == 200
    assert len(res_30d.json()["trends"]) == 14
