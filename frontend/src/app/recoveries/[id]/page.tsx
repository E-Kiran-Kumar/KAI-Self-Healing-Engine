'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { useAppState } from '@/context/app-state-context';
import { RecoveryService } from '@/lib/services/recovery-service';
import { RecoveryAttempt } from '@/types/recovery';
import { StatusBadge } from '@/components/ui/status-badge';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { ConfirmationModal } from '@/components/ui/confirmation-modal';
import {
  Sparkles,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Play,
  ShieldCheck,
  ShieldAlert,
  ArrowRight,
  Terminal,
  Activity,
  Layers,
  AlertTriangle,
} from 'lucide-react';
import { formatDateTime } from '@/lib/utils';
import { DisclaimerBanner } from '@/components/ui/disclaimer-banner';

function RecoveryDetailContent() {
  const params = useParams<{ id: string }>();
  const id = params?.id || '';
  const { dataVersion, refreshData, addToast } = useAppState();
  const [recovery, setRecovery] = useState<RecoveryAttempt | null>(null);
  const [isSimulateModalOpen, setIsSimulateModalOpen] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function loadRecovery() {
      if (!id) return;
      setIsLoading(true);
      try {
        const found = await RecoveryService.getById(id);
        if (!found) {
          router.push('/recoveries');
          return;
        }
        setRecovery(found);
      } finally {
        setIsLoading(false);
      }
    }
    loadRecovery();
  }, [id, dataVersion, router]);

  const handleRunSimulatedRecovery = async () => {
    if (!recovery) return;
    setIsExecuting(true);
    try {
      const updated = await RecoveryService.simulateExecute(recovery.id);
      addToast({
        title: 'Simulated Recovery Executed',
        description: `Recovery recipe completed with status: ${updated.status}. Modified local demo sandbox only.`,
        type: updated.status === 'simulated-success' ? 'success' : 'warning',
      });
      refreshData();
    } finally {
      setIsExecuting(false);
      setIsSimulateModalOpen(false);
    }
  };

  if (isLoading || !recovery) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Disclaimer */}
      <DisclaimerBanner
        label="Simulated Autonomous Recovery Recipe"
        subtext="Healing steps execute within local mock telemetry. No external client production processes are modified."
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/recoveries">
            <button className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 transition-colors">
              <ArrowLeft className="h-4 w-4" />
            </button>
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 font-mono">
                {recovery.recoveryCode}
              </h1>
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                {recovery.recoveryMethod}
              </span>
              <StatusBadge status={recovery.status} />
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Target Bot: <span className="font-semibold text-slate-700 dark:text-slate-300">{recovery.botName}</span> • Incident: <Link href={`/failures/${recovery.failureId}`} className="font-mono text-blue-500 hover:underline">{recovery.incidentCode}</Link> • Client: <span className="font-semibold text-slate-700 dark:text-slate-300">{recovery.clientName}</span>
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {recovery.approvalId && (
            <Link href={`/approvals/${recovery.approvalId}`}>
              <Button variant="danger" size="sm" className="gap-1.5">
                <ShieldAlert className="h-4 w-4" />
                <span>Review Approval Ticket</span>
              </Button>
            </Link>
          )}

          <Button
            size="sm"
            className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white"
            onClick={() => setIsSimulateModalOpen(true)}
            disabled={recovery.status === 'simulated-success'}
          >
            <Play className="h-4 w-4" />
            <span>Simulate Execution</span>
          </Button>
        </div>
      </div>

      {/* Confidence & Rationale Banner */}
      <Card className="p-5 border-blue-500/20 bg-blue-500/5 dark:bg-blue-950/20">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider block">
              Multi-Agent AI Model Confidence & Rationale
            </span>
            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed max-w-3xl">
              {recovery.confidenceRationale}
            </p>
          </div>

          <div className="shrink-0 text-right">
            <span className="text-3xl font-extrabold text-blue-600 dark:text-blue-400 font-mono">
              {recovery.modelConfidenceScore}%
            </span>
            <span className="text-[10px] text-slate-400 block font-mono">
              Illustrative AI Score
            </span>
          </div>
        </div>
      </Card>

      {/* Before / After Mock Comparison Interface */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Before State */}
        <Card className="border-rose-500/30">
          <CardHeader className="bg-rose-500/5 dark:bg-rose-950/20 border-b border-rose-500/20">
            <CardTitle className="text-sm flex items-center justify-between text-rose-600 dark:text-rose-400">
              <span className="flex items-center gap-2">
                <XCircle className="h-4 w-4" />
                <span>Before State: {recovery.beforeState.title}</span>
              </span>
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-rose-500/10">Broken</span>
            </CardTitle>
            <CardDescription>{recovery.beforeState.description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 pt-4">
            <div className="p-3 rounded-lg border border-dashed border-rose-500/30 bg-rose-500/5 text-xs font-mono text-rose-700 dark:text-rose-300">
              {recovery.beforeState.screenshotMockLabel}
            </div>
            <pre className="p-3 rounded-lg bg-slate-950 text-rose-300 font-mono text-[11px] overflow-x-auto border border-slate-800">
              {JSON.stringify(recovery.beforeState.dataSnapshot, null, 2)}
            </pre>
          </CardContent>
        </Card>

        {/* After State */}
        <Card className="border-emerald-500/30">
          <CardHeader className="bg-emerald-500/5 dark:bg-emerald-950/20 border-b border-emerald-500/20">
            <CardTitle className="text-sm flex items-center justify-between text-emerald-600 dark:text-emerald-400">
              <span className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                <span>After State: {recovery.afterState.title}</span>
              </span>
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-emerald-500/10">Healed</span>
            </CardTitle>
            <CardDescription>{recovery.afterState.description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 pt-4">
            <div className="p-3 rounded-lg border border-dashed border-emerald-500/30 bg-emerald-500/5 text-xs font-mono text-emerald-700 dark:text-emerald-300">
              {recovery.afterState.screenshotMockLabel}
            </div>
            <pre className="p-3 rounded-lg bg-slate-950 text-emerald-400 font-mono text-[11px] overflow-x-auto border border-slate-800">
              {JSON.stringify(recovery.afterState.dataSnapshot, null, 2)}
            </pre>
          </CardContent>
        </Card>
      </div>

      {/* Recovery Steps and Verification Results */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recovery Step Sequence */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Synthesized Recovery Action Steps</CardTitle>
            <CardDescription>Targeted repair payload to be applied in order.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {recovery.steps.map((st) => (
              <div
                key={st.stepIndex}
                className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1.5 bg-slate-50/50 dark:bg-slate-900/50"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-slate-700 dark:text-slate-300">
                    Step {st.stepIndex}: {st.description}
                  </span>
                  <StatusBadge status={st.executionStatus} />
                </div>
                <pre className="p-2 rounded bg-slate-900 text-blue-400 font-mono text-[11px] overflow-x-auto border border-slate-800">
                  {st.actionPayload}
                </pre>
                {st.simulatedOutput && (
                  <p className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 mt-1">
                    ↳ {st.simulatedOutput}
                  </p>
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Post-Repair Verification */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Automated Post-Repair Verification</CardTitle>
            <CardDescription>Automated criteria checks to guarantee clean resolution.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {recovery.verification ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3.5 rounded-xl border border-emerald-500/20 bg-emerald-500/5">
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
                    <div>
                      <span className="font-semibold text-xs text-slate-900 dark:text-slate-100 block">
                        Verification Status: {recovery.verification.passed ? 'PASSED' : 'FAILED'}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        Executed at {formatDateTime(recovery.verification.verifiedAt)}
                      </span>
                    </div>
                  </div>
                  <span className="text-lg font-bold font-mono text-emerald-600 dark:text-emerald-400">
                    {recovery.verification.score}%
                  </span>
                </div>

                <div className="space-y-2">
                  {recovery.verification.checks.map((chk, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-lg border border-slate-100 dark:border-slate-800 text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-800 dark:text-slate-200">
                          {chk.checkName}
                        </span>
                        <span className={chk.passed ? 'text-emerald-600 font-semibold' : 'text-rose-500 font-semibold'}>
                          {chk.passed ? 'PASS' : 'FAIL'}
                        </span>
                      </div>
                      <p className="text-slate-500 text-[11px] font-mono">{chk.evidence}</p>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="p-8 text-center text-xs text-slate-400">
                Recovery has not been executed yet. Click &quot;Simulate Execution&quot; to test.
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={isSimulateModalOpen}
        onClose={() => setIsSimulateModalOpen(false)}
        onConfirm={handleRunSimulatedRecovery}
        title="Execute Simulated Recovery"
        message={`Execute simulated repair recipe "${recovery.recoveryMethod}" for ${recovery.botName}? This updates local mock state and records synthetic verification telemetry.`}
        confirmLabel="Run Simulated Execution"
        variant="success"
        isLoading={isExecuting}
      />
    </div>
  );
}

export default function RecoveryDetailPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-96 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
        </div>
      }
    >
      <RecoveryDetailContent />
    </Suspense>
  );
}
