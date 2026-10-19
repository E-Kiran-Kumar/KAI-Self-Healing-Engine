'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { useAppState } from '@/context/app-state-context';
import { BotService } from '@/lib/services/bot-service';
import { Bot, BotStatus } from '@/types/bot';
import { StatusBadge } from '@/components/ui/status-badge';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { ConfirmationModal } from '@/components/ui/confirmation-modal';
import {
  Bot as BotIcon,
  ArrowLeft,
  Play,
  Pause,
  Square,
  Zap,
  Building2,
  Activity,
  Server,
  Cpu,
  Clock,
  History,
  ShieldCheck,
  ShieldAlert,
} from 'lucide-react';
import { formatDateTime, formatDuration } from '@/lib/utils';

function BotDetailContent() {
  const params = useParams<{ id: string }>();
  const id = params?.id || '';
  const { dataVersion, refreshData, addToast } = useAppState();
  const [bot, setBot] = useState<Bot | null>(null);
  const [pendingAction, setPendingAction] = useState<BotStatus | 'trigger' | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function loadBot() {
      if (!id) return;
      setIsLoading(true);
      try {
        const found = await BotService.getById(id);
        if (!found) {
          router.push('/bots');
          return;
        }
        setBot(found);
      } finally {
        setIsLoading(false);
      }
    }
    loadBot();
  }, [id, dataVersion, router]);

  const handleExecuteAction = async () => {
    if (!bot || !pendingAction) return;

    try {
      if (pendingAction === 'trigger') {
        await BotService.triggerSimulatedRun(bot.id);
        addToast({
          title: 'Simulated Execution Triggered',
          description: `Spawned local demo cycle for ${bot.identifier}.`,
          type: 'success',
        });
      } else {
        await BotService.updateSimulatedStatus(bot.id, pendingAction);
        addToast({
          title: `Simulated Status: ${pendingAction.toUpperCase()}`,
          description: `Updated local demo state for ${bot.identifier}.`,
          type: 'info',
        });
      }
      refreshData();
    } finally {
      setPendingAction(null);
    }
  };

  if (isLoading || !bot) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/bots">
            <button className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 transition-colors">
              <ArrowLeft className="h-4 w-4" />
            </button>
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                {bot.name}
              </h1>
              <span className="font-mono text-xs px-2 py-0.5 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400 font-semibold">
                {bot.identifier}
              </span>
              <StatusBadge status={bot.status} />
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-2">
              <Building2 className="h-3.5 w-3.5 text-slate-400" />
              <span>Assigned Client:</span>
              <Link href={`/clients/${bot.clientId}`} className="text-blue-600 dark:text-blue-400 font-medium hover:underline">
                {bot.clientName}
              </Link>
              <span>• Host: <span className="font-mono">{bot.hostAgent}</span></span>
            </p>
          </div>
        </div>

        {/* Demo Simulated Control Buttons */}
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            className="gap-1.5 bg-blue-600 hover:bg-blue-700 text-white"
            onClick={() => setPendingAction('trigger')}
          >
            <Zap className="h-4 w-4" />
            <span>Simulate Run</span>
          </Button>

          {bot.status === 'running' ? (
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 border-amber-500/40 text-amber-600 hover:bg-amber-500/10"
              onClick={() => setPendingAction('paused')}
            >
              <Pause className="h-4 w-4" />
              <span>Simulate Pause</span>
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 border-emerald-500/40 text-emerald-600 hover:bg-emerald-500/10"
              onClick={() => setPendingAction('running')}
            >
              <Play className="h-4 w-4" />
              <span>Simulate Start</span>
            </Button>
          )}

          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 text-rose-600 hover:bg-rose-500/10 border-rose-500/30"
            onClick={() => setPendingAction('idle')}
          >
            <Square className="h-4 w-4" />
            <span>Simulate Stop</span>
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-5">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
            Current Workflow
          </span>
          <div className="mt-2">
            <span className="text-sm font-bold text-slate-900 dark:text-slate-100 block truncate">
              {bot.currentWorkflowName || 'None Assigned'}
            </span>
            <span className="text-xs text-slate-400 block mt-0.5">
              Environment: <span className="uppercase font-mono">{bot.environment}</span>
            </span>
          </div>
        </Card>

        <Card className="p-5">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
            24h Reliability Score
          </span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-xl font-bold text-slate-900 dark:text-slate-100">
              {bot.successRate24h}%
            </span>
            <span className="text-xs text-slate-500 font-mono">
              {bot.totalExecutions} total runs
            </span>
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            Consecutive failures: {bot.consecutiveFailures}
          </span>
        </Card>

        <Card className="p-5">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
            Schedule Timers
          </span>
          <div className="mt-2 space-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500">Last run:</span>
              <span className="font-mono text-slate-900 dark:text-slate-100">
                {formatDateTime(bot.lastRunAt)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Next run:</span>
              <span className="font-mono text-blue-600 dark:text-blue-400">
                {bot.nextScheduledRunAt ? formatDateTime(bot.nextScheduledRunAt) : 'On Demand / Event'}
              </span>
            </div>
          </div>
        </Card>

        <Card className="p-5">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
            Host Diagnostics
          </span>
          <div className="mt-2 space-y-1 text-xs font-mono text-slate-600 dark:text-slate-300">
            <div>OS: {bot.metadata.os}</div>
            <div>IP: {bot.metadata.ipAddress}</div>
            <div className="text-[10px] text-slate-400 truncate">
              Heartbeat: {formatDateTime(bot.metadata.heartbeatTimestamp)}
            </div>
          </div>
        </Card>
      </div>

      {/* Execution History */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <History className="h-4 w-4 text-blue-500" />
              <span>Simulated Execution History</span>
            </CardTitle>
            <CardDescription>
              Recent automated workflow cycles, duration profiles, and completion status.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800 text-[11px] uppercase tracking-wider text-slate-400">
                <tr>
                  <th className="py-3 px-6 font-semibold">Run ID</th>
                  <th className="py-3 px-4 font-semibold">Workflow</th>
                  <th className="py-3 px-4 font-semibold">Trigger</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                  <th className="py-3 px-4 font-semibold">Steps</th>
                  <th className="py-3 px-4 font-semibold">Duration</th>
                  <th className="py-3 px-6 font-semibold text-right">Started At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {bot.history.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400">
                      No historical execution telemetry stored for this bot.
                    </td>
                  </tr>
                ) : (
                  bot.history.map((run) => (
                    <tr
                      key={run.runId}
                      className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="py-3.5 px-6 font-mono font-medium text-slate-900 dark:text-slate-100">
                        {run.runId}
                      </td>

                      <td className="py-3.5 px-4 font-medium text-slate-700 dark:text-slate-300">
                        {run.workflowName}
                      </td>

                      <td className="py-3.5 px-4 font-mono uppercase text-[11px] text-slate-500">
                        {run.trigger}
                      </td>

                      <td className="py-3.5 px-4">
                        <StatusBadge status={run.status} />
                      </td>

                      <td className="py-3.5 px-4 font-mono text-slate-600 dark:text-slate-400">
                        {run.stepsCompleted} / {run.stepsTotal}
                      </td>

                      <td className="py-3.5 px-4 font-mono text-slate-600 dark:text-slate-400">
                        {formatDuration(run.durationMs)}
                      </td>

                      <td className="py-3.5 px-6 text-right font-mono text-slate-400 text-[11px]">
                        {formatDateTime(run.startedAt)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Confirmation Modal */}
      {pendingAction && (
        <ConfirmationModal
          isOpen={true}
          onClose={() => setPendingAction(null)}
          onConfirm={handleExecuteAction}
          title={`Simulate Action: ${pendingAction.toUpperCase()}`}
          message={`Confirm simulated transition of ${bot.identifier} to state "${pendingAction}". This modifies local demo state only.`}
          confirmLabel={`Apply Simulated ${pendingAction}`}
          variant={pendingAction === 'idle' ? 'danger' : 'primary'}
        />
      )}
    </div>
  );
}

export default function BotDetailPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-96 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
        </div>
      }
    >
      <BotDetailContent />
    </Suspense>
  );
}
