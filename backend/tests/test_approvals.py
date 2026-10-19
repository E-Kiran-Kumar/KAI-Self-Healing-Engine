"""
tests/test_approvals.py
───────────────────────
Automated tests for Human-in-the-Loop Approval Queue and decision audit trails.
"""

import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_list_all_approvals(client: AsyncClient) -> None:
    response = await client.get("/api/v1/approvals")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 3
    codes = [a["approvalCode"] for a in data]
    assert "APR-1049" in codes
    assert "APR-1048" in codes


@pytest.mark.asyncio
async def test_list_pending_approvals(client: AsyncClient) -> None:
    response = await client.get("/api/v1/approvals/pending")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 2
    assert all(a["status"] == "pending" for a in data)


@pytest.mark.asyncio
async def test_get_approval_by_id(client: AsyncClient) -> None:
    response = await client.get("/api/v1/approvals/apr-finc-01")
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == "apr-finc-01"
    assert data["riskLevel"] == "critical"
    assert data["impactAssessment"]["financialExposureRisk"] != ""
    assert len(data["proposedActions"]) >= 2
    assert len(data["auditTrail"]) >= 1


@pytest.mark.asyncio
async def test_approve_decision_cascades_to_recovery(client: AsyncClient) -> None:
    payload = {
        "decision": "approved",
        "decidedBy": "Marcus Vance",
        "role": "Lead Security Auditor",
        "notes": "Verified secondary gateway SSL certificate.",
    }
    response = await client.post("/api/v1/approvals/apr-finc-01/decide", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "approved"
    assert data["decidedBy"] == "Marcus Vance"
    assert len(data["auditTrail"]) == 2
    assert data["auditTrail"][-1]["action"] == "approved"

    # Confirm linked recovery attempt rec-finc-01 status updated to 'approved'
    rec_res = await client.get("/api/v1/recoveries/rec-finc-01")
    assert rec_res.status_code == 200
    assert rec_res.json()["status"] == "approved"


@pytest.mark.asyncio
async def test_reject_decision_cascades_to_recovery(client: AsyncClient) -> None:
    payload = {
        "decision": "rejected",
        "decidedBy": "Elena Rostova",
        "role": "QA Lead",
        "notes": "DOM selector candidate is ambiguous.",
    }
    response = await client.post("/api/v1/approvals/apr-apex-01/decide", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "rejected"
    assert data["decidedBy"] == "Elena Rostova"

    # Confirm linked recovery attempt rec-apex-01 status updated to 'escalated'
    rec_res = await client.get("/api/v1/recoveries/rec-apex-01")
    assert rec_res.status_code == 200
    assert rec_res.json()["status"] == "escalated"


@pytest.mark.asyncio
async def test_approval_not_found(client: AsyncClient) -> None:
    response = await client.get("/api/v1/approvals/apr-unknown")
    assert response.status_code == 404
