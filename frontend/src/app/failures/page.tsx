'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAppState } from '@/context/app-state-context';
import { FailureService } from '@/lib/services/failure-service';
import { FailureIncident, FailureCategory, FailureSeverity, FailureInvestigationStatus } from '@/types/failure';
import { StatusBadge } from '@/components/ui/status-badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { AlertTriangle, Search, ArrowRight, Sparkles, Filter } from 'lucide-react';
import { formatDateTime } from '@/lib/utils';

export default function FailuresPage() {
  const { dataVersion } = useAppState();
  const [failures, setFailures] = useState<FailureIncident[]>([]);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [severityFilter, setSeverityFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const list = await FailureService.getAll();
        setFailures(list);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [dataVersion]);

  const filteredFailures = failures.filter((f) => {
    const matchesSearch =
      f.incidentCode.toLowerCase().includes(search.toLowerCase()) ||
      f.errorMessage.toLowerCase().includes(search.toLowerCase()) ||
      f.botName.toLowerCase().includes(search.toLowerCase()) ||
      f.clientName.toLowerCase().includes(search.toLowerCase()) ||
      f.failedStepName.toLowerCase().includes(search.toLowerCase());

    const matchesCat = categoryFilter === 'ALL' || f.category === categoryFilter;
    const matchesSev = severityFilter === 'ALL' || f.severity === severityFilter;
    const matchesStat = statusFilter === 'ALL' || f.status === statusFilter;

    return matchesSearch && matchesCat && matchesSev && matchesStat;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2.5">
            <AlertTriangle className="h-6 w-6 text-rose-500" />
            <span>Failure Monitoring & Diagnostics</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Real-time incident capture across all 7 diagnostic domains with optical trace forensics.
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
              placeholder="Search by incident code, error message, or bot..."
              className="pl-9"
            />
          </div>

          <div className="grid grid-cols-3 gap-2 w-full md:w-auto">
            <Select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full md:w-36"
            >
              <option value="ALL">All Categories</option>
              <option value="UI">UI</option>
              <option value="API">API</option>
              <option value="timeout">Timeout</option>
              <option value="network">Network</option>
              <option value="database">Database</option>
              <option value="validation">Validation</option>
              <option value="authentication">Auth</option>
            </Select>

            <Select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="w-full md:w-32"
            >
              <option value="ALL">All Severities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </Select>

            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full md:w-36"
            >
              <option value="ALL">All Statuses</option>
              <option value="detected">Detected</option>
              <option value="diagnosing">Diagnosing</option>
              <option value="awaiting-approval">Awaiting Approval</option>
              <option value="recovering">Recovering</option>
              <option value="resolved">Resolved</option>
              <option value="unrecoverable">Unrecoverable</option>
            </Select>
          </div>
        </div>
      </Card>

      {/* Incidents Table */}
      <Card>
        <CardHeader>
          <CardTitle>Captured Failure Incidents ({filteredFailures.length})</CardTitle>
          <CardDescription>
            Categorized bot failures with root-cause traces and linked recovery proposals.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800 text-[11px] uppercase tracking-wider text-slate-400">
                <tr>
                  <th className="py-3 px-6 font-semibold">Incident Code</th>
                  <th className="py-3 px-4 font-semibold">Bot / Client</th>
                  <th className="py-3 px-4 font-semibold">Category</th>
                  <th className="py-3 px-4 font-semibold">Severity</th>
                  <th className="py-3 px-4 font-semibold">Investigation Status</th>
                  <th className="py-3 px-4 font-semibold">Detected At</th>
                  <th className="py-3 px-6 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400">
                      Loading failure incidents...
                    </td>
                  </tr>
                ) : filteredFailures.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400">
                      No failure incidents found for the selected filter set.
                    </td>
                  </tr>
                ) : (
                  filteredFailures.map((inc) => (
                    <tr
                      key={inc.id}
                      className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="py-3.5 px-6 font-mono font-semibold text-slate-900 dark:text-slate-100">
                        <Link href={`/failures/${inc.id}`} className="hover:text-blue-500">
                          {inc.incidentCode}
                        </Link>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-900 dark:text-slate-100">{inc.botName}</div>
                        <div className="text-[11px] text-slate-400">{inc.clientName}</div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono text-[11px]">
                          {inc.category}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <StatusBadge status={inc.severity} />
                      </td>

                      <td className="py-3.5 px-4">
                        <StatusBadge status={inc.status} />
                      </td>

                      <td className="py-3.5 px-4 font-mono text-slate-500 text-[11px]">
                        {formatDateTime(inc.detectedAt)}
                      </td>

                      <td className="py-3.5 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {inc.recoveryId && (
                            <Link href={`/recoveries/${inc.recoveryId}`}>
                              <Button variant="outline" size="sm" className="h-7 px-2 text-xs gap-1 border-emerald-500/30 text-emerald-600 hover:bg-emerald-500/10">
                                <Sparkles className="h-3 w-3" />
                                <span className="hidden sm:inline">Recovery Plan</span>
                              </Button>
                            </Link>
                          )}
                          <Link href={`/failures/${inc.id}`}>
                            <Button variant="outline" size="sm" className="h-7 px-2.5 text-xs gap-1">
                              <span>Investigate</span>
                              <ArrowRight className="h-3 w-3" />
                            </Button>
                          </Link>
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
    </div>
  );
}
