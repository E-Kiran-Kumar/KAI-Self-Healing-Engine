'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAppState } from '@/context/app-state-context';
import { RecoveryService } from '@/lib/services/recovery-service';
import { RecoveryAttempt, RecoveryStatus } from '@/types/recovery';
import { StatusBadge } from '@/components/ui/status-badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Sparkles, Search, ArrowRight, ShieldCheck, CheckCircle2, ShieldAlert } from 'lucide-react';
import { formatDateTime } from '@/lib/utils';
import { DisclaimerBanner } from '@/components/ui/disclaimer-banner';

export default function RecoveriesPage() {
  const { dataVersion } = useAppState();
  const [recoveries, setRecoveries] = useState<RecoveryAttempt[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const list = await RecoveryService.getAll();
        setRecoveries(list);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [dataVersion]);

  const filteredRecoveries = recoveries.filter((r) => {
    const matchesSearch =
      r.recoveryCode.toLowerCase().includes(search.toLowerCase()) ||
      r.recoveryMethod.toLowerCase().includes(search.toLowerCase()) ||
      r.botName.toLowerCase().includes(search.toLowerCase()) ||
      r.incidentCode.toLowerCase().includes(search.toLowerCase()) ||
      r.clientName.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || r.status === statusFilter;
    const matchesCategory = categoryFilter === 'ALL' || r.category === categoryFilter;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* Disclaimer */}
      <DisclaimerBanner
        label="Autonomous Self-Healing Simulation Center"
        subtext="All recovery actions execute against isolated simulated environments. Model confidence percentages are illustrative AI estimates."
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2.5">
            <Sparkles className="h-6 w-6 text-emerald-500" />
            <span>Autonomous Recovery Center</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Browse proposed and executed self-healing recipes with verification metrics and before/after states.
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
              placeholder="Search by recovery code (e.g. REC-3012), bot, or healing recipe..."
              className="pl-9"
            />
          </div>

          <div className="grid grid-cols-2 gap-2 w-full md:w-auto">
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full md:w-44"
            >
              <option value="ALL">All Statuses</option>
              <option value="suggested">Suggested</option>
              <option value="approved">Approved</option>
              <option value="simulated-success">Simulated Success</option>
              <option value="simulated-failure">Simulated Failure</option>
              <option value="escalated">Escalated</option>
            </Select>

            <Select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full md:w-36"
            >
              <option value="ALL">All Domains</option>
              <option value="UI">UI</option>
              <option value="API">API</option>
              <option value="timeout">Timeout</option>
              <option value="network">Network</option>
              <option value="database">Database</option>
              <option value="authentication">Auth</option>
            </Select>
          </div>
        </div>
      </Card>

      {/* Recoveries Table */}
      <Card>
        <CardHeader>
          <CardTitle>Self-Healing Records ({filteredRecoveries.length})</CardTitle>
          <CardDescription>
            Autonomous recovery attempts synthesized from failure diagnostics and computer vision.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800 text-[11px] uppercase tracking-wider text-slate-400">
                <tr>
                  <th className="py-3 px-6 font-semibold">Recovery ID</th>
                  <th className="py-3 px-4 font-semibold">Incident / Bot</th>
                  <th className="py-3 px-4 font-semibold">Healing Recipe</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                  <th className="py-3 px-4 font-semibold">Model Confidence</th>
                  <th className="py-3 px-4 font-semibold">Verification Score</th>
                  <th className="py-3 px-6 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400">
                      Loading recovery records...
                    </td>
                  </tr>
                ) : filteredRecoveries.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400">
                      No recovery plans match the selected criteria.
                    </td>
                  </tr>
                ) : (
                  filteredRecoveries.map((rec) => (
                    <tr
                      key={rec.id}
                      className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="py-3.5 px-6 font-mono font-semibold text-slate-900 dark:text-slate-100">
                        <Link href={`/recoveries/${rec.id}`} className="hover:text-blue-500">
                          {rec.recoveryCode}
                        </Link>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-900 dark:text-slate-100">{rec.botName}</div>
                        <div className="text-[11px] text-slate-400">
                          {rec.incidentCode} ({rec.clientName})
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-medium text-slate-800 dark:text-slate-200">
                        {rec.recoveryMethod}
                      </td>

                      <td className="py-3.5 px-4">
                        <StatusBadge status={rec.status} />
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-slate-900 dark:text-slate-100">
                            {rec.modelConfidenceScore}%
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">(illustrative)</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-mono">
                        {rec.verification ? (
                          <span className={rec.verification.passed ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-rose-500 font-bold'}>
                            {rec.verification.score}%
                          </span>
                        ) : (
                          <span className="text-slate-400 italic">Pending Execution</span>
                        )}
                      </td>

                      <td className="py-3.5 px-6 text-right">
                        <Link href={`/recoveries/${rec.id}`}>
                          <Button variant="outline" size="sm" className="h-7 px-2.5 text-xs gap-1">
                            <span>Inspect Recipe</span>
                            <ArrowRight className="h-3 w-3" />
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
