import { describe, it, expect } from 'vitest';
import { AnalyticsService } from '@/lib/services/analytics-service';

describe('AnalyticsService Dynamic Calculation', () => {
  it('correctly calculates overview metrics derived from underlying records', async () => {
    const summary = await AnalyticsService.getSummary('7d');

    expect(summary).toBeDefined();
    expect(summary.overview.totalRegisteredBots).toBeGreaterThan(0);
    expect(summary.overview.runningBots + summary.overview.failedBots + summary.overview.idleBots).toBeLessThanOrEqual(
      summary.overview.totalRegisteredBots
    );
    expect(summary.overview.recoverySuccessRate).toBeGreaterThanOrEqual(0);
    expect(summary.overview.recoverySuccessRate).toBeLessThanOrEqual(100);
    expect(summary.overview.manualEffortSavedHours).toBeGreaterThan(0);
    expect(summary.overview.activeClientsCount).toBeGreaterThan(0);
  });

  it('aggregates category distribution covering all 7 failure domains', async () => {
    const summary = await AnalyticsService.getSummary('7d');
    const categories = summary.categoryBreakdown.map((c) => c.category);

    expect(categories).toContain('UI');
    expect(categories).toContain('API');
    expect(categories).toContain('timeout');
    expect(categories).toContain('network');
    expect(categories).toContain('database');
    expect(categories).toContain('validation');
    expect(categories).toContain('authentication');
  });

  it('computes client bot benchmarks with non-empty stats', async () => {
    const summary = await AnalyticsService.getSummary('7d');

    expect(summary.clientPerformance.length).toBeGreaterThan(0);
    const apex = summary.clientPerformance.find((c) => c.clientName.includes('Apex'));
    expect(apex).toBeDefined();
    expect(apex?.totalBots).toBeGreaterThan(0);
    expect(apex?.successRate).toBeGreaterThan(0);
  });
});
