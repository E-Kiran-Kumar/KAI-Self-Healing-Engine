'use client';

import React from 'react';
import { Breadcrumbs } from './breadcrumbs';
import { ThemeToggle } from './theme-toggle';
import { NotificationPopover } from './notification-popover';
import { useAppState } from '@/context/app-state-context';
import { Search, UserCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Topbar() {
  const { isSidebarCollapsed, setSearchOpen } = useAppState();

  return (
    <header
      className={cn(
        'sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md px-6 transition-all duration-200',
        isSidebarCollapsed ? 'ml-18' : 'ml-64'
      )}
    >
      {/* Left: Breadcrumbs */}
      <div className="flex items-center gap-4 min-w-0">
        <Breadcrumbs />
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-3">
        {/* Global Search Button */}
        <button
          onClick={() => setSearchOpen(true)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
        >
          <Search className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Search platform...</span>
          <kbd className="hidden sm:inline-block rounded bg-slate-200 dark:bg-slate-700 px-1.5 py-0.5 text-[10px] font-mono text-slate-600 dark:text-slate-300">
            Ctrl+K
          </kbd>
        </button>

        {/* Notifications */}
        <NotificationPopover />

        {/* Theme Toggle */}
        <ThemeToggle />

        {/* User Profile Avatar / Org Indicator */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-800">
          <div className="h-8 w-8 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-200 font-semibold text-xs border border-slate-300 dark:border-slate-700">
            SA
          </div>
          <div className="hidden lg:block text-left">
            <span className="text-xs font-semibold text-slate-900 dark:text-slate-100 block leading-tight">
              Site Admin
            </span>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1 leading-tight">
              <UserCheck className="h-2.5 w-2.5" />
              Secured Session
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
