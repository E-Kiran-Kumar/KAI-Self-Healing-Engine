'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAppState } from '@/context/app-state-context';
import { AnalyticsService } from '@/lib/services/analytics-service';
import { FailureService } from '@/lib/services/failure-service';
import { RecoveryService } from '@/lib/services/recovery-service';
import { ApprovalService } from '@/lib/services/approval-service';
import { AnalyticsSummary } from '@/types/analytics';
import { FailureIncident } from '@/types/failure';
import { RecoveryAttempt } from '@/types/recovery';
import { HumanApprovalItem } from '@/types/approval';
import { MetricCard } from '@/components/dashboard/metric-card';
import { TrendChart } from '@/components/dashboard/trend-chart';
import { CategoryDonutChart } from '@/components/dashboard/category-donut-chart';
import { RecentActivityTimeline } from '@/components/dashboard/recent-activity-timeline';
import { RecentIncidentsTable } from '@/components/dashboard/recent-incidents-table';
import { DisclaimerBanner } from '@/components/ui/disclaimer-banner';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Bot,
  Activity,
  AlertTriangle,
  Sparkles,
  Percent,
  Clock,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';

export default function OverviewDashboardPage() {
  const { dataVersion } = useAppState();
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [recentFailures, setRecentFailures] = useState<FailureIncident[]>([]);
  const [recentRecoveries, setRecentRecoveries] = useState<RecoveryAttempt[]>([]);
  const [recentApprovals, setRecentApprovals] = useState<HumanApprovalItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      setIsLoading(true);
      try {
        const [sum, fList, rList, aList] = await Promise.all([
          AnalyticsService.getSummary('7d'),
          FailureService.getAll(),
          RecoveryService.getAll(),
          ApprovalService.getAll(),
        ]);
        setSummary(sum);
        setRecentFailures(fList);
        setRecentRecoveries(rList);
        setRecentApprovals(aList);
      } finally {
        setIsLoading(false);
      }
    }
    loadDashboard();
  }, [dataVersion]);

  if (isLoading || !summary) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
          <span className="text-xs text-slate-500">Aggregating telemetry from client clusters...</span>
        </div>
      </div>
    );
  }

  const { overview } = summary;

  return (
    <div className="space-y-6">
      {/* Top Banner / Disclaimer */}
      <DisclaimerBanner />

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Autonomous Reliability Overview
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Real-time bot fleet monitoring, self-healing diagnostics, and human approval queues.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {overview.pendingApprovalsCount > 0 && (
            <Link href="/approvals">
              <Button variant="danger" size="sm" className="gap-2">
                <ShieldAlert className="h-4 w-4" />
                <span>{overview.pendingApprovalsCount} Approvals Pending</span>
              </Button>
            </Link>
          )}
          <Link href="/bots">
            <Button variant="outline" size="sm" className="gap-2">
              <Bot className="h-4 w-4" />
              <span>Manage Fleet</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <MetricCard
          title="Total Bots"
          value={overview.totalRegisteredBots}
          subtitle={`${overview.activeClientsCount} active clients`}
          icon={Bot}
          tone="blue"
        />
        <MetricCard
          title="Running Bots"
          value={overview.runningBots}
          subtitle="Healthy executions"
          icon={Activity}
          tone="emerald"
          badge="Active"
          badgeTone="emerald"
        />
        <MetricCard
          title="Failed Bots"
          value={overview.failedBots}
          subtitle={overview.failedBots > 0 ? 'Requires attention' : 'All systems normal'}
          icon={AlertTriangle}
          tone={overview.failedBots > 0 ? 'rose' : 'slate'}
          badge={overview.failedBots > 0 ? 'Alert' : undefined}
          badgeTone="rose"
        />
        <MetricCard
          title="Recoveries (Demo)"
          value={overview.successfulRecoveriesDemo}
          subtitle="Simulated auto-heals"
          icon={Sparkles}
          tone="emerald"
        />
        <MetricCard
          title="Success Rate"
          value={`${overview.recoverySuccessRate}%`}
          subtitle="Recovery efficacy"
          icon={Percent}
          tone="indigo"
        />
        <MetricCard
          title="Effort Saved"
          value={`${overview.manualEffortSavedHours}h`}
          subtitle="Illustrative model estimate"
          icon={Clock}
          tone="amber"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Workflow Execution & Recovery Trends</CardTitle>
              <CardDescription>
                7-day rolling telemetry comparing total runs, detected incidents, and recoveries.
              </CardDescription>
            </div>
            <Link
              href="/analytics"
              className="text-xs text-blue-600 dark:text-blue-400 font-medium hover:underline flex items-center gap-1"
            >
              <span>Detailed analytics</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </CardHeader>
          <CardContent>
            <TrendChart data={summary.trends} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Failure Categories Breakdown</CardTitle>
            <CardDescription>
              Incidents classified across all 7 diagnostic domains.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CategoryDonutChart data={summary.categoryBreakdown} />
          </CardContent>
        </Card>
      </div>

      {/* Tables and Stream Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Incident Log</CardTitle>
              <CardDescription>
                Live failure telemetry and automated diagnostics from monitored client bots.
              </CardDescription>
            </div>
            <Link
              href="/failures"
              className="text-xs text-blue-600 dark:text-blue-400 font-medium hover:underline flex items-center gap-1"
            >
              <span>All failures ({recentFailures.length})</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </CardHeader>
          <CardContent>
            <RecentIncidentsTable incidents={recentFailures} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Live Activity Stream</CardTitle>
            <CardDescription>Chronological events across recovery and approval cycles.</CardDescription>
          </CardHeader>
          <CardContent>
            <RecentActivityTimeline
              failures={recentFailures}
              recoveries={recentRecoveries}
              approvals={recentApprovals}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
