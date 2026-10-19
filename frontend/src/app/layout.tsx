import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/context/theme-context';
import { AppStateProvider } from '@/context/app-state-context';
import { Sidebar } from '@/components/layout/sidebar';
import { Topbar } from '@/components/layout/topbar';
import { CommandSearchDialog } from '@/components/layout/command-search-dialog';
import { ToastContainer } from '@/components/ui/toast-container';

import React, { Suspense } from 'react';
import { MainContentWrapper } from '@/components/layout/main-content-wrapper';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'KAI Self-Healing AI Engine | Enterprise Dashboard',
  description: 'Enterprise AI Automation Reliability Platform for Multi-Client Bot Monitoring, Failure Diagnosis & Workflow Recovery.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} min-h-screen antialiased bg-slate-50 dark:bg-[#090d16] text-slate-900 dark:text-slate-100`}>
        <ThemeProvider>
          <AppStateProvider>
            <Suspense fallback={null}>
              <div className="min-h-screen flex flex-col">
                <Sidebar />
                <div className="flex-1 flex flex-col min-w-0">
                  <Topbar />
                  <MainContentWrapper>
                    {children}
                  </MainContentWrapper>
                </div>
              </div>
              <CommandSearchDialog />
              <ToastContainer />
            </Suspense>
          </AppStateProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
