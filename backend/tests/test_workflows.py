"""
tests/test_workflows.py
───────────────────────
Automated tests for Workflow definitions and Execution run traces.
"""

import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_list_all_workflow_definitions(client: AsyncClient) -> None:
    response = await client.get("/api/v1/workflows")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 5
    ids = [w["id"] for w in data]
    assert "wf-apex-ocr" in ids
    assert "wf-finc-sanctions" in ids


@pytest.mark.asyncio
async def test_filter_workflows_by_category(client: AsyncClient) -> None:
    response = await client.get("/api/v1/workflows?category=logistics")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 2
    assert all(w["category"] == "logistics" for w in data)


@pytest.mark.asyncio
async def test_get_workflow_definition_by_id(client: AsyncClient) -> None:
    response = await client.get("/api/v1/workflows/wf-apex-ocr")
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == "wf-apex-ocr"
    assert data["stepCount"] == 6
    assert "bot-apex-02" in data["assignedBotIds"]


@pytest.mark.asyncio
async def test_list_workflow_runs(client: AsyncClient) -> None:
    response = await client.get("/api/v1/workflows/runs")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 3
    run_ids = [r["runId"] for r in data]
    assert "run-apex-204" in run_ids


@pytest.mark.asyncio
async def test_get_workflow_run_detail(client: AsyncClient) -> None:
    response = await client.get("/api/v1/workflows/runs/run-apex-204")
    assert response.status_code == 200
    data = response.json()
    assert data["runId"] == "run-apex-204"
    assert data["status"] == "failed"
    assert len(data["steps"]) == 6
    assert data["steps"][3]["actionType"] == "click"
    assert data["steps"][3]["status"] == "failed"


@pytest.mark.asyncio
async def test_workflow_definition_not_found(client: AsyncClient) -> None:
    response = await client.get("/api/v1/workflows/wf-nonexistent")
    assert response.status_code == 404


@pytest.mark.asyncio
async def test_workflow_run_not_found(client: AsyncClient) -> None:
    response = await client.get("/api/v1/workflows/runs/run-nonexistent")
    assert response.status_code == 404
