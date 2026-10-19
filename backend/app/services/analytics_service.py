"""
app/services/analytics_service.py
─────────────────────────────────
Database-backed asynchronous service for platform analytics and reliability benchmarks.
"""

from __future__ import annotations

from datetime import datetime, timedelta, timezone
from typing import get_args

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.models.approval import HumanApprovalModel
from app.db.models.bot import BotModel
from app.db.models.client import ClientModel
from app.db.models.failure import FailureIncidentModel
from app.db.models.recovery import RecoveryAttemptModel
from app.models.analytics import (
    AnalyticsSummary,
    CategoryDistribution,
    ClientBotPerformance,
    OverviewMetrics,
    TimeRange,
    TrendDataPoint,
)
from app.models.failure import FailureCategory


class AnalyticsService:
    @staticmethod
    async def get_summary(
        db: AsyncSession, time_range: TimeRange = "7d"
    ) -> AnalyticsSummary:
        clients = (await db.execute(select(ClientModel))).scalars().all()
        bots = (await db.execute(select(BotModel))).scalars().all()
        failures = (await db.execute(select(FailureIncidentModel))).scalars().all()
        recoveries = (await db.execute(select(RecoveryAttemptModel))).scalars().all()
        approvals = (await db.execute(select(HumanApprovalModel))).scalars().all()

        # 1. Overview Metrics
        total_registered_bots = len(bots)
        running_bots = sum(1 for b in bots if b.status == "running")
        failed_bots = sum(1 for b in bots if b.status == "failed")
        idle_bots = sum(1 for b in bots if b.status in ("idle", "paused"))

        total_recoveries_attempted = len(recoveries)
        successful_recoveries_demo = sum(
            1 for r in recoveries if r.status in ("simulated-success", "approved")
        )
        recovery_success_rate = (
            round((successful_recoveries_demo / total_recoveries_attempted) * 100.0, 1)
            if total_recoveries_attempted > 0
            else 0.0
        )

        total_saved_minutes = sum(
            r.estimated_effort_saved_minutes for r in recoveries
        )
        manual_effort_saved_hours = round(total_saved_minutes / 60.0, 1)

        pending_approvals_count = sum(1 for a in approvals if a.status == "pending")
        active_clients_count = sum(1 for c in clients if c.status == "active")

        overview = OverviewMetrics(
            totalRegisteredBots=total_registered_bots,
            runningBots=running_bots,
            failedBots=failed_bots,
            idleBots=idle_bots,
            totalRecoveriesAttempted=total_recoveries_attempted,
            successfulRecoveriesDemo=successful_recoveries_demo,
            recoverySuccessRate=recovery_success_rate,
            manualEffortSavedHours=manual_effort_saved_hours,
            pendingApprovalsCount=pending_approvals_count,
            activeClientsCount=active_clients_count,
        )

        # 2. Category Distribution covering all 7 failure domains
        all_categories = list(get_args(FailureCategory))
        cat_default_minutes = {
            "UI": 45.0,
            "API": 15.0,
            "timeout": 30.0,
            "network": 20.0,
            "database": 35.0,
            "validation": 25.0,
            "authentication": 10.0,
        }
        cat_counts = {cat: 0 for cat in all_categories}
        for f in failures:
            if f.category in cat_counts:
                cat_counts[f.category] += 1

        total_incidents = len(failures) or 1
        category_breakdown = [
            CategoryDistribution(
                category=cat,  # type: ignore[arg-type]
                count=cat_counts[cat],
                percentage=round((cat_counts[cat] / total_incidents) * 100.0, 1),
                avgResolutionTimeMinutes=cat_default_minutes.get(cat, 20.0),
            )
            for cat in all_categories
        ]
        category_breakdown.sort(key=lambda x: x.count, reverse=True)

        # 3. Trends depending on time_range
        days_count = 1 if time_range == "24h" else 7 if time_range == "7d" else 14 if time_range == "30d" else 30
        trends: list[TrendDataPoint] = []
        now = datetime.now(timezone.utc)

        for i in range(days_count - 1, -1, -1):
            d = now - timedelta(days=i)
            date_str = d.strftime("%m-%d")
            base_exec = 300 + (i % 3) * 50
            day_failures = len(failures) if i == 0 else (2 + (i % 4))
            day_recoveries = (
                successful_recoveries_demo if i == 0 else max(1, day_failures - 1)
            )
            success_rate = round(
                ((base_exec - day_failures) / base_exec) * 100.0, 1
            )
            trends.append(
                TrendDataPoint(
                    date=date_str,
                    totalExecutions=base_exec,
                    failures=day_failures,
                    simulatedRecoveries=day_recoveries,
                    successRate=success_rate,
                )
            )

        # 4. Client Bot Performance
        client_performance: list[ClientBotPerformance] = []
        for cl in clients:
            client_bots = [b for b in bots if b.client_id == cl.id]
            active_bots = sum(1 for b in client_bots if b.status == "running")
            client_incidents = sum(1 for f in failures if f.client_id == cl.id)
            avg_rate = (
                round(
                    sum(b.success_rate_24h for b in client_bots) / len(client_bots), 1
                )
                if client_bots
                else 95.0
            )
            client_recs = [r for r in recoveries if r.client_id == cl.id]
            effort_saved = round(
                sum(r.estimated_effort_saved_minutes for r in client_recs) / 60.0, 1
            )
            client_performance.append(
                ClientBotPerformance(
                    clientId=cl.id,
                    clientName=cl.name,
                    totalBots=len(client_bots),
                    activeBots=active_bots,
                    successRate=avg_rate,
                    incidentsCount=client_incidents,
                    effortSavedHours=effort_saved,
                )
            )

        return AnalyticsSummary(
            timeRange=time_range,
            overview=overview,
            trends=trends,
            categoryBreakdown=category_breakdown,
            clientPerformance=client_performance,
        )
