'use client';

import React from 'react';
import Link from 'next/link';
import { FailureIncident } from '@/types/failure';
import { RecoveryAttempt } from '@/types/recovery';
import { HumanApprovalItem } from '@/types/approval';
import { formatDateTime } from '@/lib/utils';
import { AlertTriangle, Sparkles, ShieldAlert, ArrowRight } from 'lucide-react';

interface RecentActivityTimelineProps {
  failures: FailureIncident[];
  recoveries: RecoveryAttempt[];
  approvals: HumanApprovalItem[];
}

export function RecentActivityTimeline({
  failures,
  recoveries,
  approvals,
}: RecentActivityTimelineProps) {
  // Combine into unified chronological stream
  const stream = [
    ...failures.map((f) => ({
      id: f.id,
      type: 'failure' as const,
      title: `${f.incidentCode}: ${f.category} failure detected`,
      subtitle: `${f.botName} (${f.clientName})`,
      timestamp: f.detectedAt,
      link: `/failures/${f.id}`,
    })),
    ...recoveries.map((r) => ({
      id: r.id,
      type: 'recovery' as const,
      title: `${r.recoveryCode}: ${r.recoveryMethod} (${r.status})`,
      subtitle: `${r.botName} • Model confidence: ${r.modelConfidenceScore}% (illustrative)`,
      timestamp: r.createdAt,
      link: `/recoveries/${r.id}`,
    })),
    ...approvals.map((a) => ({
      id: a.id,
      type: 'approval' as const,
      title: `${a.approvalCode}: ${a.status.toUpperCase()} (${a.riskLevel} risk)`,
      subtitle: `${a.botName} • ${a.decidedBy || 'Awaiting operator decision'}`,
      timestamp: a.requestedAt,
      link: `/approvals/${a.id}`,
    })),
  ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 5);

  return (
    <div className="space-y-4">
      {stream.map((item, idx) => {
        const icon = {
          failure: <AlertTriangle className="h-4 w-4 text-rose-500" />,
          recovery: <Sparkles className="h-4 w-4 text-emerald-500" />,
          approval: <ShieldAlert className="h-4 w-4 text-amber-500" />,
        }[item.type];

        return (
          <div key={`${item.id}-${idx}`} className="flex items-start gap-3 relative pb-4 last:pb-0">
            {idx < stream.length - 1 && (
              <span className="absolute left-4 top-8 -bottom-1 w-px bg-slate-200 dark:bg-slate-800" />
            )}
            <div className="h-8 w-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 border border-slate-200 dark:border-slate-700 z-10">
              {icon}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate">
                  {item.title}
                </span>
                <span className="text-[10px] text-slate-400 shrink-0">
                  {formatDateTime(item.timestamp)}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                {item.subtitle}
              </p>
              <Link
                href={item.link}
                className="inline-flex items-center gap-1 text-[11px] text-blue-600 dark:text-blue-400 mt-1 hover:underline font-medium"
              >
                <span>View telemetry</span>
                <ArrowRight className="h-2.5 w-2.5" />
              </Link>
            </div>
          </div>
        );
      })}
    </div>
  );
}
