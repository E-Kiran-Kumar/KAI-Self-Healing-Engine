'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { useAppState } from '@/context/app-state-context';
import { WorkflowService } from '@/lib/services/workflow-service';
import { WorkflowDefinition, WorkflowExecutionRun, WorkflowStep } from '@/types/workflow';
import { StatusBadge } from '@/components/ui/status-badge';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import {
  Activity,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Clock,
  Code,
  Image as ImageIcon,
  AlertTriangle,
  Play,
  SkipForward,
  ChevronRight,
  Terminal,
} from 'lucide-react';
import { formatDateTime, formatDuration } from '@/lib/utils';

function WorkflowDetailContent() {
  const params = useParams<{ id: string }>();
  const id = params?.id || '';
  const { dataVersion } = useAppState();
  const [workflow, setWorkflow] = useState<WorkflowDefinition | null>(null);
  const [runs, setRuns] = useState<WorkflowExecutionRun[]>([]);
  const [selectedRun, setSelectedRun] = useState<WorkflowExecutionRun | null>(null);
  const [selectedStep, setSelectedStep] = useState<WorkflowStep | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function loadData() {
      if (!id) return;
      setIsLoading(true);
      try {
        const wf = await WorkflowService.getById(id);
        if (!wf) {
          router.push('/workflows');
          return;
        }
        setWorkflow(wf);
        const wfRuns = await WorkflowService.getRuns(wf.id);
        setRuns(wfRuns);
        if (wfRuns.length > 0) {
          setSelectedRun(wfRuns[0]);
          const failedStep = wfRuns[0].steps.find((s) => s.status === 'failed');
          setSelectedStep(failedStep || wfRuns[0].steps[0]);
        }
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [id, dataVersion, router]);

  if (isLoading || !workflow) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/workflows">
          <button className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 transition-colors">
            <ArrowLeft className="h-4 w-4" />
          </button>
        </Link>
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              {workflow.name}
            </h1>
            <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 capitalize">
              {workflow.category}
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Client: <span className="font-semibold text-slate-700 dark:text-slate-300">{workflow.clientName}</span> • Success Rate: <span className="font-mono text-emerald-600 dark:text-emerald-400 font-semibold">{workflow.successRate}%</span>
          </p>
        </div>
      </div>

      {/* Execution Run Selector Banner */}
      {runs.length > 0 && selectedRun && (
        <Card className="p-4 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Execution Run Telemetry:
              </span>
              <span className="font-mono text-xs font-bold text-slate-900 dark:text-slate-100">
                {selectedRun.runId}
              </span>
              <StatusBadge status={selectedRun.status} />
              <span className="text-xs text-slate-400">
                Executed by <span className="font-medium text-slate-700 dark:text-slate-300">{selectedRun.botName}</span>
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-slate-500">
                Duration: <strong className="text-slate-900 dark:text-slate-100">{formatDuration(selectedRun.durationMs)}</strong>
              </span>
              {selectedRun.failureId && (
                <Link href={`/failures/${selectedRun.failureId}`}>
                  <Button variant="danger" size="sm" className="h-7 text-xs gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    <span>View Incident Diagnostic</span>
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </Card>
      )}

      {/* Main Step Timeline and Trace Inspector */}
      {selectedRun && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Step Timeline Column */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="text-sm">Execution Step Timeline</CardTitle>
              <CardDescription>
                Chronological actions executed in this run. Select a step to inspect traces.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 space-y-2">
              {selectedRun.steps.map((step) => {
                const isSelected = selectedStep?.id === step.id;
                const isFailed = step.status === 'failed';

                const icon = {
                  passed: <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />,
                  failed: <XCircle className="h-4 w-4 text-rose-500 shrink-0" />,
                  skipped: <SkipForward className="h-4 w-4 text-slate-400 shrink-0" />,
                  running: <Clock className="h-4 w-4 text-blue-500 animate-spin shrink-0" />,
                  pending: <Clock className="h-4 w-4 text-slate-300 shrink-0" />,
                }[step.status];

                return (
                  <div
                    key={step.id}
                    onClick={() => setSelectedStep(step)}
                    className={`p-3 rounded-lg border transition-all cursor-pointer flex items-start gap-3 ${
                      isSelected
                        ? 'border-blue-500 bg-blue-500/5 dark:bg-blue-950/30'
                        : isFailed
                        ? 'border-rose-500/30 bg-rose-500/5 hover:bg-rose-500/10'
                        : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                    }`}
                  >
                    <div className="pt-0.5">{icon}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="font-mono text-[11px] font-semibold text-slate-400">
                          Step {step.stepNumber}
                        </span>
                        <span className="text-[10px] font-mono uppercase px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">
                          {step.actionType}
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 mt-0.5 truncate">
                        {step.name}
                      </p>
                      {step.durationMs && (
                        <span className="text-[10px] font-mono text-slate-400 mt-1 block">
                          Took {formatDuration(step.durationMs)}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Trace, Log & Screenshot Placeholder Column */}
          <Card className="lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Terminal className="h-4 w-4 text-blue-500" />
                  <span>Step Diagnostic Inspector</span>
                </CardTitle>
                <CardDescription>
                  {selectedStep ? `Step ${selectedStep.stepNumber}: ${selectedStep.name}` : 'Select a step'}
                </CardDescription>
              </div>
              {selectedStep && <StatusBadge status={selectedStep.status} />}
            </CardHeader>
            <CardContent className="space-y-4">
              {selectedStep ? (
                <>
                  {/* Error Callout if Failed */}
                  {selectedStep.status === 'failed' && (
                    <div className="p-4 rounded-xl border border-rose-500/30 bg-rose-500/10 text-rose-700 dark:text-rose-300 space-y-2">
                      <div className="flex items-center gap-2 font-semibold text-xs">
                        <AlertTriangle className="h-4 w-4 text-rose-500" />
                        <span>Execution Aborted at this Step</span>
                      </div>
                      <p className="font-mono text-xs leading-relaxed">
                        {selectedStep.errorMessage}
                      </p>
                    </div>
                  )}

                  {/* Step Selector & Target */}
                  {selectedStep.targetSelector && (
                    <div className="space-y-1">
                      <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                        Target DOM Selector / Endpoint
                      </span>
                      <pre className="p-3 rounded-lg bg-slate-900 text-slate-200 font-mono text-xs overflow-x-auto border border-slate-800">
                        {selectedStep.targetSelector}
                      </pre>
                    </div>
                  )}

                  {/* Screenshot Placeholder Frame */}
                  <div className="space-y-2">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                      Runtime Optical Frame Snapshot (Placeholder)
                    </span>
                    <div className="h-56 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-800 bg-slate-100/50 dark:bg-slate-950/40 flex flex-col items-center justify-center p-6 text-center">
                      <ImageIcon className="h-10 w-10 text-slate-400 mb-2 opacity-50" />
                      <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        Step Execution Buffer Snapshot
                      </span>
                      <span className="text-[11px] text-slate-400 max-w-sm mt-1">
                        Computer Vision optical frame captured at timestamp {formatDateTime(selectedRun.startedAt)}.
                        Target element highlighted in Phase 2 computer vision pipeline.
                      </span>
                    </div>
                  </div>

                  {/* Trace Payload Placeholder */}
                  <div className="space-y-1">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                      Telemetry Execution Trace (JSON)
                    </span>
                    <pre className="p-3 rounded-lg bg-slate-950 text-emerald-400 font-mono text-[11px] overflow-x-auto border border-slate-800">
                      {JSON.stringify(
                        {
                          stepId: selectedStep.id,
                          stepNumber: selectedStep.stepNumber,
                          action: selectedStep.actionType,
                          status: selectedStep.status,
                          durationMs: selectedStep.durationMs || 0,
                          simulatedHost: 'agent-us-east-worker-02',
                          sandboxEnvironment: 'headless-chromium-v129',
                        },
                        null,
                        2
                      )}
                    </pre>
                  </div>
                </>
              ) : (
                <div className="p-8 text-center text-xs text-slate-400">
                  Select a workflow step from the left timeline to inspect diagnostics.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

export default function WorkflowDetailPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-96 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
        </div>
      }
    >
      <WorkflowDetailContent />
    </Suspense>
  );
}
