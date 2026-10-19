import React from 'react';
import { cn, getStatusTone } from '@/lib/utils';

interface StatusBadgeProps {
  status: string;
  showDot?: boolean;
  className?: string;
  label?: string;
}

export function StatusBadge({ status, showDot = true, className, label }: StatusBadgeProps) {
  const tone = getStatusTone(status);

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize tracking-wide',
        tone.badge,
        className
      )}
    >
      {showDot && (
        <span
          className={cn('h-1.5 w-1.5 rounded-full', tone.dot, {
            'animate-pulse': ['running', 'recovering', 'diagnosing'].includes(status.toLowerCase()),
          })}
        />
      )}
      {label || status.replace(/-/g, ' ')}
    </span>
  );
}
