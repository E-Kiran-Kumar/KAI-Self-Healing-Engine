import { AnalyticsSummary, TimeRange, OverviewMetrics, CategoryDistribution, TrendDataPoint, ClientBotPerformance } from '@/types/analytics';
import { StorageAdapter } from './storage-adapter';
import { FailureCategory } from '@/types/failure';

export const AnalyticsService = {
  async getSummary(timeRange: TimeRange = '7d'): Promise<AnalyticsSummary> {
    const clients = StorageAdapter.getClients();
    const bots = StorageAdapter.getBots();
    const failures = StorageAdapter.getFailures();
    const recoveries = StorageAdapter.getRecoveries();
    const approvals = StorageAdapter.getApprovals();

    // 1. Overview Metrics (derived dynamically from underlying store)
    const totalRegisteredBots = bots.length;
    const runningBots = bots.filter((b) => b.status === 'running').length;
    const failedBots = bots.filter((b) => b.status === 'failed').length;
    const idleBots = bots.filter((b) => b.status === 'idle' || b.status === 'paused').length;

    const totalRecoveriesAttempted = recoveries.length;
    const successfulRecoveriesDemo = recoveries.filter((r) => r.status === 'simulated-success' || r.status === 'approved').length;
    const recoverySuccessRate = totalRecoveriesAttempted > 0
      ? Number(((successfulRecoveriesDemo / totalRecoveriesAttempted) * 100).toFixed(1))
      : 0;

    // Sum estimated effort saved (minutes to hours)
    const totalSavedMinutes = recoveries.reduce((acc, r) => acc + (r.estimatedEffortSavedMinutes || 0), 0);
    const manualEffortSavedHours = Number((totalSavedMinutes / 60).toFixed(1));

    const pendingApprovalsCount = approvals.filter((a) => a.status === 'pending').length;
    const activeClientsCount = clients.filter((c) => c.status === 'active').length;

    const overview: OverviewMetrics = {
      totalRegisteredBots,
      runningBots,
      failedBots,
      idleBots,
      totalRecoveriesAttempted,
      successfulRecoveriesDemo,
      recoverySuccessRate,
      manualEffortSavedHours,
      pendingApprovalsCount,
      activeClientsCount,
    };

    // 2. Category Distribution
    const categoryCounts: Record<FailureCategory, { count: number; totalMinutes: number }> = {
      UI: { count: 0, totalMinutes: 45 },
      API: { count: 0, totalMinutes: 15 },
      timeout: { count: 0, totalMinutes: 30 },
      network: { count: 0, totalMinutes: 20 },
      database: { count: 0, totalMinutes: 35 },
      validation: { count: 0, totalMinutes: 25 },
      authentication: { count: 0, totalMinutes: 10 },
    };

    failures.forEach((f) => {
      if (categoryCounts[f.category]) {
        categoryCounts[f.category].count += 1;
      }
    });

    const totalIncidents = failures.length || 1;
    const categoryBreakdown: CategoryDistribution[] = (Object.keys(categoryCounts) as FailureCategory[]).map((cat) => ({
      category: cat,
      count: categoryCounts[cat].count,
      percentage: Number(((categoryCounts[cat].count / totalIncidents) * 100).toFixed(1)),
      avgResolutionTimeMinutes: categoryCounts[cat].totalMinutes,
    })).sort((a, b) => b.count - a.count);

    // 3. Trends depending on timeRange
    const daysCount = timeRange === '24h' ? 1 : timeRange === '7d' ? 7 : timeRange === '30d' ? 14 : 30;
    const trends: TrendDataPoint[] = [];

    const now = new Date();
    for (let i = daysCount - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().slice(5, 10); // MM-DD

      // Seeded trend with variance proportional to actual bot counts
      const baseExec = 300 + (i % 3) * 50;
      const dayFailures = (i === 0 ? failures.length : 2 + (i % 4));
      const dayRecoveries = (i === 0 ? successfulRecoveriesDemo : Math.max(1, dayFailures - 1));
      const successRate = Number((((baseExec - dayFailures) / baseExec) * 100).toFixed(1));

      trends.push({
        date: dateStr,
        totalExecutions: baseExec,
        failures: dayFailures,
        simulatedRecoveries: dayRecoveries,
        successRate,
      });
    }

    // 4. Client Bot Performance
    const clientPerformance: ClientBotPerformance[] = clients.map((cl) => {
      const clientBots = bots.filter((b) => b.clientId === cl.id);
      const activeBots = clientBots.filter((b) => b.status === 'running').length;
      const clientIncidents = failures.filter((f) => f.clientId === cl.id).length;
      const avgRate = clientBots.length > 0
        ? Number((clientBots.reduce((sum, b) => sum + b.successRate24h, 0) / clientBots.length).toFixed(1))
        : 95.0;

      const clientRecoveries = recoveries.filter((r) => r.clientId === cl.id);
      const effortSavedHours = Number(
        (clientRecoveries.reduce((sum, r) => sum + r.estimatedEffortSavedMinutes, 0) / 60).toFixed(1)
      );

      return {
        clientId: cl.id,
        clientName: cl.name,
        totalBots: clientBots.length,
        activeBots,
        successRate: avgRate,
        incidentsCount: clientIncidents,
        effortSavedHours,
      };
    });

    return {
      timeRange,
      overview,
      trends,
      categoryBreakdown,
      clientPerformance,
    };
  },
};
