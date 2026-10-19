'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAppState } from '@/context/app-state-context';
import {
  LayoutDashboard,
  Building2,
  Bot,
  Activity,
  AlertTriangle,
  Sparkles,
  ShieldAlert,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { StorageAdapter } from '@/lib/services/storage-adapter';

export function Sidebar() {
  const pathname = usePathname();
  const { isSidebarCollapsed, toggleSidebar } = useAppState();

  const pendingApprovalsCount = StorageAdapter.getApprovals().filter((a) => a.status === 'pending').length;
  const failedBotsCount = StorageAdapter.getBots().filter((b) => b.status === 'failed').length;

  const navItems = [
    { label: 'Overview', href: '/', icon: LayoutDashboard },
    { label: 'Clients', href: '/clients', icon: Building2 },
    { label: 'Bot Management', href: '/bots', icon: Bot, badge: failedBotsCount > 0 ? `${failedBotsCount} failed` : undefined, badgeColor: 'bg-rose-500/10 text-rose-500' },
    { label: 'Workflow Monitoring', href: '/workflows', icon: Activity },
    { label: 'Failure Monitoring', href: '/failures', icon: AlertTriangle },
    { label: 'Recovery Center', href: '/recoveries', icon: Sparkles },
    {
      label: 'Human Approvals',
      href: '/approvals',
      icon: ShieldAlert,
      badge: pendingApprovalsCount > 0 ? `${pendingApprovalsCount}` : undefined,
      badgeColor: 'bg-amber-500 text-white font-bold',
    },
    { label: 'Analytics', href: '/analytics', icon: BarChart3 },
    { label: 'Settings', href: '/settings', icon: Settings },
  ];

  return (
    <aside
      className={cn(
        'fixed top-0 left-0 bottom-0 z-40 flex flex-col border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 transition-all duration-200 select-none',
        isSidebarCollapsed ? 'w-18' : 'w-64'
      )}
    >
      {/* Brand Header */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-slate-100 dark:border-slate-800">
        <Link href="/" className="flex items-center gap-3 min-w-0">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-black tracking-wider shadow-md shrink-0">
            K
          </div>
          {!isSidebarCollapsed && (
            <div className="min-w-0">
              <span className="font-bold text-sm text-slate-900 dark:text-slate-100 tracking-tight block truncate">
                KAI Engine
              </span>
              <span className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold uppercase tracking-wider block">
                Self-Healing AI
              </span>
            </div>
          )}
        </Link>
        <button
          onClick={toggleSidebar}
          className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isSidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>

      {/* Navigation List */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const isActive = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'group flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-colors relative',
                isActive
                  ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400 font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200'
              )}
              title={isSidebarCollapsed ? item.label : undefined}
            >
              <Icon
                className={cn(
                  'h-4 w-4 shrink-0 transition-colors',
                  isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300'
                )}
              />

              {!isSidebarCollapsed && (
                <>
                  <span className="truncate flex-1">{item.label}</span>
                  {item.badge && (
                    <span
                      className={cn(
                        'px-1.5 py-0.5 rounded-full text-[10px] shrink-0',
                        item.badgeColor
                      )}
                    >
                      {item.badge}
                    </span>
                  )}
                </>
              )}

              {isSidebarCollapsed && item.badge && (
                <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-amber-500" />
              )}
            </Link>
          );
        })}
      </div>

      {/* System Status Footer */}
      {!isSidebarCollapsed && (
        <div className="p-3 border-t border-slate-100 dark:border-slate-800 m-2 rounded-xl bg-slate-50/80 dark:bg-slate-800/40">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-emerald-500 shrink-0" />
            <div className="min-w-0">
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 block truncate">
                Phase 1 Prototype
              </span>
              <span className="text-[10px] text-slate-400 block truncate">
                FastAPI Mock Layer Active
              </span>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
