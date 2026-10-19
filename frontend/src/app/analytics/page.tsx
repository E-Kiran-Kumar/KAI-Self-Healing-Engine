'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAppState } from '@/context/app-state-context';
import { AnalyticsService } from '@/lib/services/analytics-service';
import { AnalyticsSummary, TimeRange } from '@/types/analytics';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DisclaimerBanner } from '@/components/ui/disclaimer-banner';
import { TrendChart } from '@/components/dashboard/trend-chart';
import { CategoryDonutChart } from '@/components/dashboard/category-donut-chart';
import {
  BarChart3,
  Clock,
  Sparkles,
  AlertTriangle,
  Building2,
  TrendingUp,
  Percent,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

export default function AnalyticsPage() {
  const { dataVersion } = useAppState();
  const [timeRange, setTimeRange] = useState<TimeRange>('7d');
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadAnalytics() {
      setIsLoading(true);
      try {
        const data = await AnalyticsService.getSummary(timeRange);
        setSummary(data);
      } finally {
        setIsLoading(false);
      }
    }
    loadAnalytics();
  }, [timeRange, dataVersion]);

  if (isLoading || !summary) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  const { overview, trends, categoryBreakdown, clientPerformance } = summary;

  return (
    <div className="space-y-6">
      {/* Disclaimer */}
      <DisclaimerBanner
        label="Derived Enterprise Intelligence Telemetry"
        subtext="All metrics, recovery success trends, and manual hours saved are computed deterministically from mock data records. Model confidence is illustrative."
      />

      {/* Header and Time-Range Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2.5">
            <BarChart3 className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            <span>Platform Reliability Analytics</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Historical failure patterns, autonomous healing efficiency, and client cluster benchmarking.
          </p>
        </div>

        {/* Time-Range Selector */}
        <div className="flex items-center p-1 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
          {(['24h', '7d', '30d', '90d'] as TimeRange[]).map((tr) => (
            <button
              key={tr}
              onClick={() => setTimeRange(tr)}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                timeRange === tr
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              {tr.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Recovery Success Rate
            </span>
            <Sparkles className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold font-mono text-slate-900 dark:text-slate-100">
              {overview.recoverySuccessRate}%
            </span>
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
              {overview.successfulRecoveriesDemo} of {overview.totalRecoveriesAttempted} Healed
            </span>
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            Across active incident recoveries
          </span>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Est. Manual Effort Saved
            </span>
            <Clock className="h-4 w-4 text-amber-500" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold font-mono text-slate-900 dark:text-slate-100">
              {overview.manualEffortSavedHours} hrs
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 font-semibold">
              Illustrative Demo Metric
            </span>
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            Estimated engineer triage avoidance
          </span>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Active Bot Fleet Health
            </span>
            <TrendingUp className="h-4 w-4 text-blue-500" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold font-mono text-slate-900 dark:text-slate-100">
              {Math.round(((overview.totalRegisteredBots - overview.failedBots) / overview.totalRegisteredBots) * 100)}%
            </span>
            <span className="text-xs text-slate-500">
              {overview.runningBots} Active Workers
            </span>
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            {overview.failedBots} bots currently isolated
          </span>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Pending Human Sign-Offs
            </span>
            <AlertTriangle className="h-4 w-4 text-rose-500" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-3xl font-extrabold font-mono text-slate-900 dark:text-slate-100">
              {overview.pendingApprovalsCount}
            </span>
            <Link href="/approvals" className="text-xs text-blue-600 dark:text-blue-400 font-medium hover:underline">
              Review Queue
            </Link>
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            Awaiting supervisor authorization
          </span>
        </Card>
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Autonomous Execution & Healing Trajectory ({timeRange})</CardTitle>
            <CardDescription>
              Telemetry comparing routine executions, detected failures, and simulated recovery events.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <TrendChart data={trends} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Most Common Failure Categories</CardTitle>
            <CardDescription>
              Root-cause frequency across the 7 diagnostic domains.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CategoryDonutChart data={categoryBreakdown} />
          </CardContent>
        </Card>
      </div>

      {/* Client Performance Benchmark Table */}
      <Card>
        <CardHeader>
          <CardTitle>Client Cluster Reliability Benchmark</CardTitle>
          <CardDescription>
            Comparative performance, incident density, and estimated effort saved grouped by enterprise organization.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800 text-[11px] uppercase tracking-wider text-slate-400">
                <tr>
                  <th className="py-3 px-6 font-semibold">Client Organization</th>
                  <th className="py-3 px-4 font-semibold">Allocated Bots</th>
                  <th className="py-3 px-4 font-semibold">Active Fleet</th>
                  <th className="py-3 px-4 font-semibold">24h Reliability</th>
                  <th className="py-3 px-4 font-semibold">Incidents Logged</th>
                  <th className="py-3 px-4 font-semibold">Est. Effort Saved (Demo)</th>
                  <th className="py-3 px-6 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {clientPerformance.map((cp) => (
                  <tr
                    key={cp.clientId}
                    className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="py-3.5 px-6 font-semibold text-slate-900 dark:text-slate-100">
                      <Link href={`/clients/${cp.clientId}`} className="hover:text-blue-500">
                        {cp.clientName}
                      </Link>
                    </td>

                    <td className="py-3.5 px-4 font-mono font-medium">
                      {cp.totalBots} bots
                    </td>

                    <td className="py-3.5 px-4 font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
                      {cp.activeBots} running
                    </td>

                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900 dark:text-slate-100">
                      {cp.successRate}%
                    </td>

                    <td className="py-3.5 px-4 font-mono">
                      <span className={cp.incidentsCount > 0 ? 'text-amber-500 font-semibold' : 'text-slate-400'}>
                        {cp.incidentsCount}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 font-mono text-slate-700 dark:text-slate-300">
                      {cp.effortSavedHours} hrs
                    </td>

                    <td className="py-3.5 px-6 text-right">
                      <Link href={`/clients/${cp.clientId}`}>
                        <Button variant="outline" size="sm" className="h-7 px-2.5 text-xs gap-1">
                          <span>Inspect Client</span>
                          <ArrowRight className="h-3 w-3" />
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
