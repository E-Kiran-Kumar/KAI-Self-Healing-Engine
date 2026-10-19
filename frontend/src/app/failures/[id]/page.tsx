'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { useAppState } from '@/context/app-state-context';
import { FailureService } from '@/lib/services/failure-service';
import { FailureIncident, FailureInvestigationStatus } from '@/types/failure';
import { StatusBadge } from '@/components/ui/status-badge';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Select } from '@/components/ui/select';
import {
  AlertTriangle,
  ArrowLeft,
  Terminal,
  Image as ImageIcon,
  Sparkles,
  Server,
  Layers,
  Clock,
  CheckCircle2,
  Cpu,
} from 'lucide-react';
import { formatDateTime } from '@/lib/utils';

function FailureDetailContent() {
  const params = useParams<{ id: string }>();
  const id = params?.id || '';
  const { dataVersion, refreshData, addToast } = useAppState();
  const [incident, setIncident] = useState<FailureIncident | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function loadIncident() {
      if (!id) return;
      setIsLoading(true);
      try {
        const found = await FailureService.getById(id);
        if (!found) {
          router.push('/failures');
          return;
        }
        setIncident(found);
      } finally {
        setIsLoading(false);
      }
    }
    loadIncident();
  }, [id, dataVersion, router]);

  const handleUpdateStatus = async (newStatus: FailureInvestigationStatus) => {
    if (!incident) return;
    await FailureService.updateStatus(incident.id, newStatus);
    addToast({
      title: 'Investigation Status Updated',
      description: `Incident ${incident.incidentCode} status set to "${newStatus}".`,
      type: 'info',
    });
    refreshData();
  };

  if (isLoading || !incident) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/failures">
            <button className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 transition-colors">
              <ArrowLeft className="h-4 w-4" />
            </button>
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 font-mono">
                {incident.incidentCode}
              </h1>
              <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                {incident.category}
              </span>
              <StatusBadge status={incident.severity} />
              <StatusBadge status={incident.status} />
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Bot: <span className="font-semibold text-slate-700 dark:text-slate-300">{incident.botName}</span> • Client: <span className="font-semibold text-slate-700 dark:text-slate-300">{incident.clientName}</span> • Detected at {formatDateTime(incident.detectedAt)}
            </p>
          </div>
        </div>

        {/* Status updater & Recovery link */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-medium">Status:</span>
            <Select
              value={incident.status}
              onChange={(e) => handleUpdateStatus(e.target.value as FailureInvestigationStatus)}
              className="h-8 text-xs w-40"
            >
              <option value="detected">Detected</option>
              <option value="diagnosing">Diagnosing</option>
              <option value="awaiting-approval">Awaiting Approval</option>
              <option value="recovering">Recovering</option>
              <option value="resolved">Resolved</option>
              <option value="unrecoverable">Unrecoverable</option>
            </Select>
          </div>

          {incident.recoveryId && (
            <Link href={`/recoveries/${incident.recoveryId}`}>
              <Button size="sm" className="h-8 gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Open Recovery Plan</span>
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Primary Error Statement */}
      <Card className="border-rose-500/30 bg-rose-500/5 dark:bg-rose-950/20 p-5">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-rose-500 shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <span className="text-xs font-semibold uppercase tracking-wider text-rose-600 dark:text-rose-400 block">
              Failed Execution Step {incident.failedStepNumber}: {incident.failedStepName}
            </span>
            <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-slate-100 font-mono leading-relaxed">
              {incident.errorMessage}
            </p>
          </div>
        </div>
      </Card>

      {/* Screenshot Comparison Placeholder */}
      {incident.screenshotComparison && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center justify-between">
              <span className="flex items-center gap-2">
                <ImageIcon className="h-4 w-4 text-blue-500" />
                <span>Computer Vision Frame Comparison (Visual Drift)</span>
              </span>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400">
                Visual Delta: {Math.round(incident.screenshotComparison.visualDeltaScore * 100)}%
              </span>
            </CardTitle>
            <CardDescription>
              Side-by-side comparison between healthy baseline screenshot and current failure optical snapshot.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Expected Frame Placeholder */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  {incident.screenshotComparison.expectedLabel}
                </span>
                <div className="h-52 rounded-xl border border-emerald-500/30 bg-slate-100 dark:bg-slate-950/60 p-4 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="h-4 w-1/3 bg-slate-300 dark:bg-slate-800 rounded animate-pulse" />
                    <div className="h-20 w-full bg-slate-200 dark:bg-slate-850 rounded border border-slate-300 dark:border-slate-800 flex items-center justify-center text-[11px] text-slate-400 font-mono">
                      Expected Selector Target: #tbl-container-manifest
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">
                    Baseline: {incident.screenshotComparison.expectedTimestamp}
                  </span>
                </div>
              </div>

              {/* Actual Frame Placeholder */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-semibold text-rose-600 dark:text-rose-400 flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  {incident.screenshotComparison.actualLabel}
                </span>
                <div className="h-52 rounded-xl border border-rose-500/30 bg-slate-100 dark:bg-slate-950/60 p-4 flex flex-col justify-between relative overflow-hidden">
                  <div className="space-y-2">
                    <div className="h-4 w-1/3 bg-slate-300 dark:bg-slate-800 rounded animate-pulse" />
                    <div className="h-20 w-full bg-rose-500/10 rounded border-2 border-dashed border-rose-500 flex flex-col items-center justify-center text-[11px] text-rose-500 font-mono p-2 text-center">
                      <span>Shift Detected in Target Component</span>
                      <span className="text-[10px] opacity-75">
                        {incident.screenshotComparison.highlightBoundingBox?.label || 'UI Mutation Drift'}
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">
                    Snapshot: {incident.screenshotComparison.actualTimestamp}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stack Trace and Forensic Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Stack Trace */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Terminal className="h-4 w-4 text-slate-400" />
              <span>Runtime Exception Stack Trace</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="p-3.5 rounded-xl bg-slate-950 text-rose-400 font-mono text-xs overflow-x-auto border border-slate-800 leading-relaxed max-h-64">
              {incident.stackTrace}
            </pre>
          </CardContent>
        </Card>

        {/* Forensic Logs */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Execution Event Log Stream</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 max-h-64 overflow-y-auto">
            {incident.logs.map((log, idx) => (
              <div
                key={idx}
                className="p-2.5 rounded-lg border border-slate-100 dark:border-slate-800 text-xs font-mono space-y-0.5 bg-slate-50/50 dark:bg-slate-900/50"
              >
                <div className="flex items-center justify-between text-[10px] text-slate-400">
                  <span className="font-semibold text-slate-600 dark:text-slate-300">
                    [{log.sourceModule}]
                  </span>
                  <span>{formatDateTime(log.timestamp)}</span>
                </div>
                <p className={log.level === 'error' || log.level === 'fatal' ? 'text-rose-500 font-medium' : 'text-slate-700 dark:text-slate-300'}>
                  {log.message}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function FailureDetailPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-96 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
        </div>
      }
    >
      <FailureDetailContent />
    </Suspense>
  );
}
