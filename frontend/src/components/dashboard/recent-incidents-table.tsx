'use client';

import React from 'react';
import Link from 'next/link';
import { FailureIncident } from '@/types/failure';
import { StatusBadge } from '@/components/ui/status-badge';
import { formatDateTime } from '@/lib/utils';
import { ArrowUpRight } from 'lucide-react';

interface RecentIncidentsTableProps {
  incidents: FailureIncident[];
}

export function RecentIncidentsTable({ incidents }: RecentIncidentsTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-xs">
        <thead className="border-b border-slate-100 dark:border-slate-800 text-[11px] uppercase tracking-wider text-slate-400">
          <tr>
            <th className="pb-3 font-semibold">Incident</th>
            <th className="pb-3 font-semibold">Bot / Client</th>
            <th className="pb-3 font-semibold">Category</th>
            <th className="pb-3 font-semibold">Severity</th>
            <th className="pb-3 font-semibold">Status</th>
            <th className="pb-3 font-semibold">Detected</th>
            <th className="pb-3 font-semibold text-right">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
          {incidents.slice(0, 5).map((inc) => (
            <tr key={inc.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
              <td className="py-3 font-mono font-medium text-slate-900 dark:text-slate-100">
                {inc.incidentCode}
              </td>
              <td className="py-3">
                <div className="font-medium text-slate-900 dark:text-slate-100">{inc.botName}</div>
                <div className="text-[11px] text-slate-400">{inc.clientName}</div>
              </td>
              <td className="py-3">
                <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono text-[11px]">
                  {inc.category}
                </span>
              </td>
              <td className="py-3">
                <StatusBadge status={inc.severity} />
              </td>
              <td className="py-3">
                <StatusBadge status={inc.status} />
              </td>
              <td className="py-3 text-slate-500 font-mono text-[11px]">
                {formatDateTime(inc.detectedAt)}
              </td>
              <td className="py-3 text-right">
                <Link
                  href={`/failures/${inc.id}`}
                  className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:underline font-medium"
                >
                  <span>Review</span>
                  <ArrowUpRight className="h-3 w-3" />
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
