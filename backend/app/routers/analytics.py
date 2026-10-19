"""
app/routers/analytics.py
────────────────────────
Aggregated analytics, telemetry metrics, and performance benchmarks backed by database.
"""

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.models.analytics import AnalyticsSummary, TimeRange
from app.services.analytics_service import AnalyticsService

router = APIRouter(prefix="/analytics", tags=["Analytics"])


@router.get("/summary", response_model=AnalyticsSummary)
async def get_analytics_summary(
    time_range: TimeRange = Query("7d", alias="timeRange", description="Time window for trends (24h, 7d, 30d, 90d)"),
    db: AsyncSession = Depends(get_db),
) -> AnalyticsSummary:
    """Retrieve high-level overview metrics, trends, category distributions, and client benchmarks."""
    return await AnalyticsService.get_summary(db=db, time_range=time_range)
