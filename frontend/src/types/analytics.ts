import { FailureCategory } from './failure';

export type TimeRange = '24h' | '7d' | '30d' | '90d';

export interface OverviewMetrics {
  totalRegisteredBots: number;
  runningBots: number;
  failedBots: number;
  idleBots: number;
  totalRecoveriesAttempted: number;
  successfulRecoveriesDemo: number; // explicitly demo data only
  recoverySuccessRate: number; // percentage
  manualEffortSavedHours: number; // illustrative
  pendingApprovalsCount: number;
  activeClientsCount: number;
}

export interface TrendDataPoint {
  date: string;
  totalExecutions: number;
  failures: number;
  simulatedRecoveries: number;
  successRate: number;
}

export interface CategoryDistribution {
  category: FailureCategory;
  count: number;
  percentage: number;
  avgResolutionTimeMinutes: number;
}

export interface ClientBotPerformance {
  clientId: string;
  clientName: string;
  totalBots: number;
  activeBots: number;
  successRate: number;
  incidentsCount: number;
  effortSavedHours: number;
}

export interface AnalyticsSummary {
  timeRange: TimeRange;
  overview: OverviewMetrics;
  trends: TrendDataPoint[];
  categoryBreakdown: CategoryDistribution[];
  clientPerformance: ClientBotPerformance[];
}
