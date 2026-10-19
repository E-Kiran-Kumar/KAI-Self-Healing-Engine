'use client';

import React from 'react';
import { useAppState } from '@/context/app-state-context';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export function ToastContainer() {
  const { toasts, removeToast } = useAppState();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((t) => {
        const icon = {
          success: <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />,
          error: <AlertCircle className="h-4 w-4 text-rose-500 shrink-0" />,
          warning: <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0" />,
          info: <Info className="h-4 w-4 text-blue-500 shrink-0" />,
        }[t.type || 'info'];

        return (
          <div
            key={t.id}
            className={cn(
              'pointer-events-auto flex items-start gap-3 p-3.5 rounded-xl border shadow-lg bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 transition-all duration-200 animate-in fade-in slide-in-from-bottom-2'
            )}
          >
            <div className="pt-0.5">{icon}</div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-slate-900 dark:text-slate-100">{t.title}</p>
              {t.description && (
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                  {t.description}
                </p>
              )}
            </div>
            <button
              onClick={() => removeToast(t.id)}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
