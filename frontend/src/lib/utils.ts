import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  const seconds = (ms / 1000).toFixed(1);
  if (Number(seconds) < 60) return `${seconds}s`;
  const minutes = Math.floor(ms / 60000);
  const remainingSecs = Math.floor((ms % 60000) / 1000);
  return `${minutes}m ${remainingSecs}s`;
}

export function formatDateTime(isoString: string): string {
  try {
    const d = new Date(isoString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    }).format(d);
  } catch {
    return isoString;
  }
}

export function formatDateOnly(isoString: string): string {
  try {
    const d = new Date(isoString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(d);
  } catch {
    return isoString;
  }
}

export function getStatusTone(status: string): {
  badge: string;
  dot: string;
  border: string;
} {
  const s = status.toLowerCase();
  if (['running', 'active', 'completed', 'approved', 'simulated-success', 'resolved', 'passed'].includes(s)) {
    return {
      badge: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
      dot: 'bg-emerald-500',
      border: 'border-l-emerald-500',
    };
  }
  if (['failed', 'critical', 'rejected', 'simulated-failure', 'unrecoverable'].includes(s)) {
    return {
      badge: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
      dot: 'bg-rose-500',
      border: 'border-l-rose-500',
    };
  }
  if (['high', 'awaiting-approval', 'pending', 'waiting-approval', 'diagnosing'].includes(s)) {
    return {
      badge: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
      dot: 'bg-amber-500',
      border: 'border-l-amber-500',
    };
  }
  if (['recovering', 'suggested', 'onboarding'].includes(s)) {
    return {
      badge: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20',
      dot: 'bg-indigo-500',
      border: 'border-l-indigo-500',
    };
  }
  // default / idle / low / medium / suspended
  return {
    badge: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20',
    dot: 'bg-slate-400',
    border: 'border-l-slate-400',
  };
}
