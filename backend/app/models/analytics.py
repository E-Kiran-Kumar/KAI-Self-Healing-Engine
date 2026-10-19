"""
app/models/analytics.py
───────────────────────
Pydantic v2 models for Analytics and Reporting domain.

Mirrors frontend/src/types/analytics.ts.
"""

from __future__ import annotations

from typing import Literal
from pydantic import BaseModel, Field

from app.models.failure import FailureCategory

TimeRange = Literal["24h", "7d", "30d", "90d"]


class OverviewMetrics(BaseModel):
    total_registered_bots: int = Field(alias="totalRegisteredBots")
    running_bots: int = Field(alias="runningBots")
    failed_bots: int = Field(alias="failedBots")
    idle_bots: int = Field(alias="idleBots")
    total_recoveries_attempted: int = Field(alias="totalRecoveriesAttempted")
    successful_recoveries_demo: int = Field(alias="successfulRecoveriesDemo")
    recovery_success_rate: float = Field(alias="recoverySuccessRate")
    manual_effort_saved_hours: float = Field(alias="manualEffortSavedHours")
    pending_approvals_count: int = Field(alias="pendingApprovalsCount")
    active_clients_count: int = Field(alias="activeClientsCount")

    model_config = {"populate_by_name": True}


class TrendDataPoint(BaseModel):
    date: str
    total_executions: int = Field(alias="totalExecutions")
    failures: int
    simulated_recoveries: int = Field(alias="simulatedRecoveries")
    success_rate: float = Field(alias="successRate")

    model_config = {"populate_by_name": True}


class CategoryDistribution(BaseModel):
    category: FailureCategory
    count: int
    percentage: float
    avg_resolution_time_minutes: float = Field(alias="avgResolutionTimeMinutes")

    model_config = {"populate_by_name": True}


class ClientBotPerformance(BaseModel):
    client_id: str = Field(alias="clientId")
    client_name: str = Field(alias="clientName")
    total_bots: int = Field(alias="totalBots")
    active_bots: int = Field(alias="activeBots")
    success_rate: float = Field(alias="successRate")
    incidents_count: int = Field(alias="incidentsCount")
    effort_saved_hours: float = Field(alias="effortSavedHours")

    model_config = {"populate_by_name": True}


class AnalyticsSummary(BaseModel):
    time_range: TimeRange = Field(alias="timeRange")
    overview: OverviewMetrics
    trends: list[TrendDataPoint] = Field(default_factory=list)
    category_breakdown: list[CategoryDistribution] = Field(
        alias="categoryBreakdown", default_factory=list
    )
    client_performance: list[ClientBotPerformance] = Field(
        alias="clientPerformance", default_factory=list
    )

    model_config = {"populate_by_name": True}
