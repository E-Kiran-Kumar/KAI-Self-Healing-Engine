'use client';

import React from 'react';
import { useAppState } from '@/context/app-state-context';
import { cn } from '@/lib/utils';

export function MainContentWrapper({ children }: { children: React.ReactNode }) {
  const { isSidebarCollapsed } = useAppState();

  return (
    <div
      className={cn(
        'transition-all duration-200 p-6 md:p-8 min-h-[calc(100vh-4rem)]',
        isSidebarCollapsed ? 'ml-18' : 'ml-64'
      )}
    >
      <div className="max-w-7xl mx-auto space-y-6">
        {children}
      </div>
    </div>
  );
}
