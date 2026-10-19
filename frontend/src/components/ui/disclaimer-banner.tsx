'use client';

import React from 'react';
import { ShieldCheck, Info } from 'lucide-react';

interface DisclaimerBannerProps {
  label?: string;
  subtext?: string;
  compact?: boolean;
}

export function DisclaimerBanner({
  label = 'Phase 1 Frontend Architecture & Interactive Mock Environment',
  subtext = 'Autonomous recovery simulations, model confidence telemetry, and savings metrics are illustrative demo calculations. Real external execution is disabled.',
  compact = false,
}: DisclaimerBannerProps) {
  if (compact) {
    return (
      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-500/10 border border-blue-500/20 text-xs text-blue-600 dark:text-blue-400">
        <Info className="h-3.5 w-3.5 shrink-0" />
        <span>{label}</span>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 dark:bg-blue-950/20 p-3.5 text-xs text-slate-700 dark:text-slate-300 flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="rounded-lg p-2 bg-blue-500/10 text-blue-600 dark:text-blue-400 shrink-0">
          <ShieldCheck className="h-4 w-4" />
        </div>
        <div>
          <span className="font-semibold text-blue-600 dark:text-blue-400 block">{label}</span>
          <span className="text-slate-500 dark:text-slate-400 text-[11px]">{subtext}</span>
        </div>
      </div>
      <span className="shrink-0 text-[11px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
        Phase 1 Mock Engine
      </span>
    </div>
  );
}
