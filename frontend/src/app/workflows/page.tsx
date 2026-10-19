'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAppState } from '@/context/app-state-context';
import { WorkflowService } from '@/lib/services/workflow-service';
import { WorkflowDefinition } from '@/types/workflow';
import { StatusBadge } from '@/components/ui/status-badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Activity, Search, Clock, ArrowRight, Layers, Bot, Building2 } from 'lucide-react';
import { formatDateTime, formatDuration } from '@/lib/utils';

export default function WorkflowsPage() {
  const { dataVersion } = useAppState();
  const [workflows, setWorkflows] = useState<WorkflowDefinition[]>([]);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const list = await WorkflowService.getAll();
        setWorkflows(list);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [dataVersion]);

  const filteredWorkflows = workflows.filter((w) => {
    const matchesSearch =
      w.name.toLowerCase().includes(search.toLowerCase()) ||
      w.clientName.toLowerCase().includes(search.toLowerCase()) ||
      w.description.toLowerCase().includes(search.toLowerCase());
    const matchesCat = categoryFilter === 'ALL' || w.category === categoryFilter;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2.5">
            <Activity className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            <span>Workflow Monitoring</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Supervise multi-step robotic automation routines, step execution timelines, and failure isolation.
          </p>
        </div>
      </div>

      {/* Filter and Search */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search workflows by name, client, or keyword..."
              className="pl-9"
            />
          </div>

          <Select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full md:w-44"
          >
            <option value="ALL">All Categories</option>
            <option value="logistics">Logistics</option>
            <option value="finance">Finance & Banking</option>
            <option value="healthcare">Healthcare</option>
            <option value="procurement">Procurement</option>
          </Select>
        </div>
      </Card>

      {/* Workflow Grid / Table */}
      <Card>
        <CardHeader>
          <CardTitle>Cataloged Workflow Routines ({filteredWorkflows.length})</CardTitle>
          <CardDescription>
            Multi-step automation blueprints with execution step timelines and failure points.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800 text-[11px] uppercase tracking-wider text-slate-400">
                <tr>
                  <th className="py-3 px-6 font-semibold">Workflow Name</th>
                  <th className="py-3 px-4 font-semibold">Client</th>
                  <th className="py-3 px-4 font-semibold">Category</th>
                  <th className="py-3 px-4 font-semibold">Steps</th>
                  <th className="py-3 px-4 font-semibold">Avg Duration</th>
                  <th className="py-3 px-4 font-semibold">Success Rate</th>
                  <th className="py-3 px-6 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400">
                      Loading workflows...
                    </td>
                  </tr>
                ) : filteredWorkflows.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400">
                      No workflows match the specified criteria.
                    </td>
                  </tr>
                ) : (
                  filteredWorkflows.map((wf) => (
                    <tr
                      key={wf.id}
                      className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="py-3.5 px-6">
                        <Link
                          href={`/workflows/${wf.id}`}
                          className="font-semibold text-slate-900 dark:text-slate-100 hover:text-blue-600 dark:hover:text-blue-400 block"
                        >
                          {wf.name}
                        </Link>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-sm mt-0.5">
                          {wf.description}
                        </p>
                      </td>

                      <td className="py-3.5 px-4 font-medium text-slate-700 dark:text-slate-300">
                        {wf.clientName}
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 capitalize text-[11px]">
                          {wf.category}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 font-mono">
                        <span className="font-semibold text-slate-900 dark:text-slate-100">{wf.stepCount}</span> steps
                      </td>

                      <td className="py-3.5 px-4 font-mono text-slate-600 dark:text-slate-400">
                        {formatDuration(wf.averageDurationMs)}
                      </td>

                      <td className="py-3.5 px-4 font-mono font-medium text-slate-900 dark:text-slate-100">
                        {wf.successRate}%
                      </td>

                      <td className="py-3.5 px-6 text-right">
                        <Link href={`/workflows/${wf.id}`}>
                          <Button variant="outline" size="sm" className="h-7 px-2.5 text-xs gap-1">
                            <span>Inspect Timeline</span>
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
