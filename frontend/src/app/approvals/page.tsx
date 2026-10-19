'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAppState } from '@/context/app-state-context';
import { ApprovalService } from '@/lib/services/approval-service';
import { HumanApprovalItem, RiskLevel } from '@/types/approval';
import { StatusBadge } from '@/components/ui/status-badge';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { ConfirmationModal } from '@/components/ui/confirmation-modal';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import {
  ShieldAlert,
  Search,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Building2,
  Clock,
  UserCheck,
} from 'lucide-react';
import { formatDateTime } from '@/lib/utils';
import { DisclaimerBanner } from '@/components/ui/disclaimer-banner';

export default function ApprovalsPage() {
  const { dataVersion, refreshData, addToast } = useAppState();
  const [approvals, setApprovals] = useState<HumanApprovalItem[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('pending');
  const [riskFilter, setRiskFilter] = useState('ALL');
  const [actionItem, setActionItem] = useState<{
    item: HumanApprovalItem;
    decision: 'approved' | 'rejected';
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const list = await ApprovalService.getAll();
        setApprovals(list);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [dataVersion]);

  const handleDecision = async () => {
    if (!actionItem) return;
    const { item, decision } = actionItem;

    await ApprovalService.recordDecision(
      item.id,
      decision,
      'Site Admin (Demo Supervisor)',
      `Manual decision recorded via Approval Center interface in simulated mode.`
    );

    addToast({
      title: `Approval Ticket ${decision.toUpperCase()}`,
      description: `${item.approvalCode} for ${item.botName} has been ${decision}. Audit trail updated in local demo state.`,
      type: decision === 'approved' ? 'success' : 'error',
    });

    setActionItem(null);
    refreshData();
  };

  const filteredApprovals = approvals.filter((a) => {
    const matchesSearch =
      a.approvalCode.toLowerCase().includes(search.toLowerCase()) ||
      a.botName.toLowerCase().includes(search.toLowerCase()) ||
      a.clientName.toLowerCase().includes(search.toLowerCase()) ||
      a.incidentCode.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || a.status === statusFilter;
    const matchesRisk = riskFilter === 'ALL' || a.riskLevel === riskFilter;

    return matchesSearch && matchesStatus && matchesRisk;
  });

  return (
    <div className="space-y-6">
      {/* Disclaimer */}
      <DisclaimerBanner
        label="Human-in-the-Loop Governance Queue"
        subtext="Supervisory controls manage simulated autonomous self-healing authorization. Never executes real external actions."
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2.5">
            <ShieldAlert className="h-6 w-6 text-amber-500" />
            <span>Human Approval Center</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Review proposed AI remediation recipes flagged for high risk or strict client compliance policies.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search approval code, bot identifier, or client..."
              className="pl-9"
            />
          </div>

          <div className="grid grid-cols-2 gap-2 w-full md:w-auto">
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full md:w-40"
            >
              <option value="ALL">All Statuses</option>
              <option value="pending">Pending Queue</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </Select>

            <Select
              value={riskFilter}
              onChange={(e) => setRiskFilter(e.target.value)}
              className="w-full md:w-36"
            >
              <option value="ALL">All Risks</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </Select>
          </div>
        </div>
      </Card>

      {/* Approvals Table */}
      <Card>
        <CardHeader>
          <CardTitle>Approval Queue ({filteredApprovals.length})</CardTitle>
          <CardDescription>
            Pending and completed remediation authorizations with impact assessments and audit records.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800 text-[11px] uppercase tracking-wider text-slate-400">
                <tr>
                  <th className="py-3 px-6 font-semibold">Approval Ticket</th>
                  <th className="py-3 px-4 font-semibold">Bot / Incident</th>
                  <th className="py-3 px-4 font-semibold">Risk Tier</th>
                  <th className="py-3 px-4 font-semibold">Impact Assessment</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                  <th className="py-3 px-4 font-semibold">Model Confidence</th>
                  <th className="py-3 px-6 font-semibold text-right">Decision / Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400">
                      Loading approvals queue...
                    </td>
                  </tr>
                ) : filteredApprovals.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400">
                      No approvals match the selected filters.
                    </td>
                  </tr>
                ) : (
                  filteredApprovals.map((app) => (
                    <tr
                      key={app.id}
                      className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="py-3.5 px-6 font-mono font-semibold text-slate-900 dark:text-slate-100">
                        <Link href={`/approvals/${app.id}`} className="hover:text-blue-500">
                          {app.approvalCode}
                        </Link>
                        <span className="text-[10px] text-slate-400 block font-normal">
                          {formatDateTime(app.requestedAt)}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-900 dark:text-slate-100">{app.botName}</div>
                        <div className="text-[11px] text-slate-400">{app.clientName}</div>
                      </td>

                      <td className="py-3.5 px-4">
                        <StatusBadge status={app.riskLevel} />
                      </td>

                      <td className="py-3.5 px-4 max-w-xs truncate text-slate-600 dark:text-slate-400">
                        {app.impactAssessment.productionImpact}
                      </td>

                      <td className="py-3.5 px-4">
                        <StatusBadge status={app.status} />
                      </td>

                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900 dark:text-slate-100">
                        {app.modelConfidenceScore}%
                      </td>

                      <td className="py-3.5 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {app.status === 'pending' ? (
                            <>
                              <Button
                                size="sm"
                                variant="success"
                                className="h-7 px-2.5 text-xs gap-1"
                                onClick={() => setActionItem({ item: app, decision: 'approved' })}
                              >
                                <CheckCircle2 className="h-3 w-3" />
                                <span>Approve</span>
                              </Button>
                              <Button
                                size="sm"
                                variant="danger"
                                className="h-7 px-2.5 text-xs gap-1"
                                onClick={() => setActionItem({ item: app, decision: 'rejected' })}
                              >
                                <XCircle className="h-3 w-3" />
                                <span>Reject</span>
                              </Button>
                            </>
                          ) : (
                            <Link href={`/approvals/${app.id}`}>
                              <Button variant="outline" size="sm" className="h-7 px-2.5 text-xs gap-1">
                                <span>Audit Log</span>
                                <ArrowRight className="h-3 w-3" />
                              </Button>
                            </Link>
                          )}
                        </div>
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
      {actionItem && (
        <ConfirmationModal
          isOpen={true}
          onClose={() => setActionItem(null)}
          onConfirm={handleDecision}
          title={`Confirm ${actionItem.decision.toUpperCase()}: ${actionItem.item.approvalCode}`}
          message={`Are you sure you want to record an ${actionItem.decision.toUpperCase()} decision for ${actionItem.item.botName}? This updates local demo state only and logs to the audit trail.`}
          confirmLabel={`Confirm ${actionItem.decision}`}
          variant={actionItem.decision === 'approved' ? 'success' : 'danger'}
        />
      )}
    </div>
  );
}
