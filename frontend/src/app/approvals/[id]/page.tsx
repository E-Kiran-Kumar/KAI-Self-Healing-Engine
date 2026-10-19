'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { useAppState } from '@/context/app-state-context';
import { ApprovalService } from '@/lib/services/approval-service';
import { HumanApprovalItem } from '@/types/approval';
import { StatusBadge } from '@/components/ui/status-badge';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { ConfirmationModal } from '@/components/ui/confirmation-modal';
import {
  ShieldAlert,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  Sparkles,
  UserCheck,
  History,
  Shield,
  FileCheck,
} from 'lucide-react';
import { formatDateTime } from '@/lib/utils';
import { DisclaimerBanner } from '@/components/ui/disclaimer-banner';

function ApprovalDetailContent() {
  const params = useParams<{ id: string }>();
  const id = params?.id || '';
  const { dataVersion, refreshData, addToast } = useAppState();
  const [approval, setApproval] = useState<HumanApprovalItem | null>(null);
  const [decisionModal, setDecisionModal] = useState<'approved' | 'rejected' | null>(null);
  const [decisionNotes, setDecisionNotes] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function loadApproval() {
      if (!id) return;
      setIsLoading(true);
      try {
        const found = await ApprovalService.getById(id);
        if (!found) {
          router.push('/approvals');
          return;
        }
        setApproval(found);
      } finally {
        setIsLoading(false);
      }
    }
    loadApproval();
  }, [id, dataVersion, router]);

  const handleConfirmDecision = async () => {
    if (!approval || !decisionModal) return;

    await ApprovalService.recordDecision(
      approval.id,
      decisionModal,
      'Site Admin (Demo Supervisor)',
      decisionNotes || `Operator confirmed ${decisionModal} in local demo state.`
    );

    addToast({
      title: `Approval Ticket ${decisionModal.toUpperCase()}`,
      description: `Decision logged to audit trail in local demo state.`,
      type: decisionModal === 'approved' ? 'success' : 'error',
    });

    setDecisionModal(null);
    setDecisionNotes('');
    refreshData();
  };

  if (isLoading || !approval) {
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
        label="Audited Human Governance Workflow"
        subtext="Supervisory approvals authorise simulated workflow repair parameters. All decisions are immutably logged to the local audit trail."
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/approvals">
            <button className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 transition-colors">
              <ArrowLeft className="h-4 w-4" />
            </button>
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 font-mono">
                {approval.approvalCode}
              </h1>
              <StatusBadge status={approval.riskLevel} />
              <StatusBadge status={approval.status} />
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Bot: <span className="font-semibold text-slate-700 dark:text-slate-300">{approval.botName}</span> • Client: <span className="font-semibold text-slate-700 dark:text-slate-300">{approval.clientName}</span> • Requested on {formatDateTime(approval.requestedAt)}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        {approval.status === 'pending' ? (
          <div className="flex items-center gap-2">
            <Button
              variant="success"
              size="sm"
              className="gap-1.5"
              onClick={() => setDecisionModal('approved')}
            >
              <CheckCircle2 className="h-4 w-4" />
              <span>Approve Remediation</span>
            </Button>
            <Button
              variant="danger"
              size="sm"
              className="gap-1.5"
              onClick={() => setDecisionModal('rejected')}
            >
              <XCircle className="h-4 w-4" />
              <span>Reject Remediation</span>
            </Button>
          </div>
        ) : (
          <div className="p-2 px-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-xs text-slate-600 dark:text-slate-400 font-mono">
            Decided by: <strong className="text-slate-900 dark:text-slate-100">{approval.decidedBy}</strong> ({formatDateTime(approval.decidedAt || '')})
          </div>
        )}
      </div>

      {/* Impact Assessment Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-5">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
            Production Impact
          </span>
          <p className="mt-2 text-xs font-medium text-slate-900 dark:text-slate-100 leading-snug">
            {approval.impactAssessment.productionImpact}
          </p>
        </Card>

        <Card className="p-5">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
            Affected Records
          </span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-2xl font-bold font-mono text-slate-900 dark:text-slate-100">
              {approval.impactAssessment.affectedRecordsEstimate}
            </span>
            <span className="text-xs text-slate-400">Transactions</span>
          </div>
        </Card>

        <Card className="p-5">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
            Financial Exposure Risk
          </span>
          <p className="mt-2 text-xs font-medium text-slate-900 dark:text-slate-100 leading-snug">
            {approval.impactAssessment.financialExposureRisk}
          </p>
        </Card>

        <Card className="p-5">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
            Rollback Feasibility
          </span>
          <div className="mt-2 flex items-center gap-2">
            <Shield className="h-4 w-4 text-emerald-500" />
            <span className="text-xs font-bold uppercase font-mono text-slate-900 dark:text-slate-100">
              {approval.impactAssessment.rollbackFeasibility}
            </span>
          </div>
        </Card>
      </div>

      {/* Proposed Recovery Actions & Audit Trail */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Proposed Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <FileCheck className="h-4 w-4 text-blue-500" />
              <span>Proposed Recovery Actions Requiring Sign-Off</span>
            </CardTitle>
            <CardDescription>
              Changes generated by AI reasoning agent pending supervisor authorization.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {approval.proposedActions.map((act, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2 bg-slate-50/50 dark:bg-slate-900/50"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                    {act.actionTitle}
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                    Safety Checks Passed
                  </span>
                </div>
                <div className="text-xs font-mono text-blue-500">{act.targetComponent}</div>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  {act.changeSummary}
                </p>
              </div>
            ))}

            <div className="p-3 rounded-lg bg-blue-500/5 border border-blue-500/20 text-xs text-slate-600 dark:text-slate-300 flex items-center justify-between">
              <span>Linked Autonomous Recovery Recipe:</span>
              <Link href={`/recoveries/${approval.recoveryId}`} className="font-mono text-blue-600 dark:text-blue-400 font-semibold hover:underline">
                {approval.recoveryCode}
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Audit Trail */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <History className="h-4 w-4 text-amber-500" />
              <span>Immutable Local Audit Trail</span>
            </CardTitle>
            <CardDescription>Complete event history for compliance verification.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {approval.auditTrail.map((entry) => (
              <div
                key={entry.id}
                className="p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 text-xs space-y-1 bg-slate-50/50 dark:bg-slate-900/50"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-900 dark:text-slate-100">
                    {entry.performedBy} ({entry.role})
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">
                    {formatDateTime(entry.timestamp)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono uppercase text-[10px] px-1.5 py-0.2 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                    {entry.action}
                  </span>
                </div>
                {entry.notes && (
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 italic">
                    &quot;{entry.notes}&quot;
                  </p>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Confirmation Modal */}
      {decisionModal && (
        <ConfirmationModal
          isOpen={true}
          onClose={() => setDecisionModal(null)}
          onConfirm={handleConfirmDecision}
          title={`Confirm ${decisionModal.toUpperCase()}`}
          message={`Are you sure you want to ${decisionModal} approval ticket ${approval.approvalCode}? This updates the local demo audit trail.`}
          confirmLabel={`Confirm ${decisionModal}`}
          variant={decisionModal === 'approved' ? 'success' : 'danger'}
        />
      )}
    </div>
  );
}

export default function ApprovalDetailPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-96 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
        </div>
      }
    >
      <ApprovalDetailContent />
    </Suspense>
  );
}
