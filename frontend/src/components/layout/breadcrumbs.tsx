'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight, Home } from 'lucide-react';

const ROUTE_LABELS: Record<string, string> = {
  clients: 'Client Management',
  bots: 'Bot Management',
  workflows: 'Workflow Monitoring',
  failures: 'Failure Monitoring',
  recoveries: 'Recovery Center',
  approvals: 'Human Approval Center',
  analytics: 'Platform Analytics',
  settings: 'System Settings',
};

export function Breadcrumbs() {
  const pathname = usePathname();
  const segments = pathname.split('/').filter(Boolean);

  if (segments.length === 0) {
    return (
      <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-medium">
        <Home className="h-3.5 w-3.5 text-slate-400" />
        <span>Enterprise Dashboard</span>
      </div>
    );
  }

  return (
    <nav className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 font-medium">
      <Link
        href="/"
        className="flex items-center gap-1 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
      >
        <Home className="h-3.5 w-3.5" />
        <span>Dashboard</span>
      </Link>

      {segments.map((segment, index) => {
        const href = `/${segments.slice(0, index + 1).join('/')}`;
        const isLast = index === segments.length - 1;
        const label = ROUTE_LABELS[segment] || segment.toUpperCase();

        return (
          <React.Fragment key={href}>
            <ChevronRight className="h-3.5 w-3.5 text-slate-400 dark:text-slate-600 shrink-0" />
            {isLast ? (
              <span className="text-slate-900 dark:text-slate-100 font-semibold truncate max-w-[200px]">
                {label}
              </span>
            ) : (
              <Link
                href={href}
                className="hover:text-slate-800 dark:hover:text-slate-200 transition-colors truncate max-w-[150px]"
              >
                {label}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}
