'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppState } from '@/context/app-state-context';
import { StorageAdapter } from '@/lib/services/storage-adapter';
import { Search, Bot as BotIcon, Building2, AlertTriangle, ShieldAlert, Cpu, ArrowRight, X } from 'lucide-react';

export function CommandSearchDialog() {
  const { isSearchOpen, setSearchOpen } = useAppState();
  const [query, setQuery] = useState('');
  const router = useRouter();

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (!isSearchOpen) setQuery('');
  }, [isSearchOpen]);

  if (!isSearchOpen) return null;

  const clients = StorageAdapter.getClients();
  const bots = StorageAdapter.getBots();
  const failures = StorageAdapter.getFailures();
  const approvals = StorageAdapter.getApprovals();
  const workflows = StorageAdapter.getWorkflows();

  const q = query.trim().toLowerCase();

  const filteredClients = q
    ? clients.filter((c) => c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q))
    : [];

  const filteredBots = q
    ? bots.filter((b) => b.name.toLowerCase().includes(q) || b.identifier.toLowerCase().includes(q) || b.clientName.toLowerCase().includes(q))
    : [];

  const filteredFailures = q
    ? failures.filter((f) => f.incidentCode.toLowerCase().includes(q) || f.errorMessage.toLowerCase().includes(q) || f.category.toLowerCase().includes(q))
    : [];

  const filteredApprovals = q
    ? approvals.filter((a) => a.approvalCode.toLowerCase().includes(q) || a.botName.toLowerCase().includes(q))
    : [];

  const filteredWorkflows = q
    ? workflows.filter((w) => w.name.toLowerCase().includes(q))
    : [];

  const hasResults =
    filteredClients.length > 0 ||
    filteredBots.length > 0 ||
    filteredFailures.length > 0 ||
    filteredApprovals.length > 0 ||
    filteredWorkflows.length > 0;

  const handleSelect = (url: string) => {
    setSearchOpen(false);
    router.push(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4">
      <div
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity"
        onClick={() => setSearchOpen(false)}
      />

      <div className="relative w-full max-w-xl rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl z-10 overflow-hidden">
        {/* Search Input Bar */}
        <div className="flex items-center px-4 border-b border-slate-100 dark:border-slate-800">
          <Search className="h-4 w-4 text-slate-400 shrink-0 mr-3" />
          <input
            autoFocus
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search bots, clients, incidents, approvals, or workflows... (e.g. 'BOT-APEX', 'INC-8942')"
            className="w-full h-12 bg-transparent text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none"
          />
          <button
            onClick={() => setSearchOpen(false)}
            className="rounded p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Results Body */}
        <div className="max-h-96 overflow-y-auto p-3 divide-y divide-slate-100 dark:divide-slate-800">
          {!query && (
            <div className="p-4 text-center text-xs text-slate-400">
              Type keywords or IDs like <span className="font-mono text-blue-500">APEX</span>, <span className="font-mono text-blue-500">BOT-001</span>, or <span className="font-mono text-blue-500">timeout</span> to jump instantly.
            </div>
          )}

          {query && !hasResults && (
            <div className="p-6 text-center text-xs text-slate-400">
              No demo records matched &quot;{query}&quot;.
            </div>
          )}

          {filteredBots.length > 0 && (
            <div className="py-2">
              <span className="text-[10px] font-semibold tracking-wider text-slate-400 uppercase px-2 mb-1 block">
                Bots ({filteredBots.length})
              </span>
              {filteredBots.map((b) => (
                <div
                  key={b.id}
                  onClick={() => handleSelect(`/bots/${b.id}`)}
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <BotIcon className="h-4 w-4 text-blue-500" />
                    <div>
                      <span className="font-medium text-slate-900 dark:text-slate-100 mr-2">{b.name}</span>
                      <span className="font-mono text-[11px] text-slate-400">{b.identifier}</span>
                    </div>
                  </div>
                  <ArrowRight className="h-3.5 w-3.5 text-slate-400" />
                </div>
              ))}
            </div>
          )}

          {filteredFailures.length > 0 && (
            <div className="py-2">
              <span className="text-[10px] font-semibold tracking-wider text-slate-400 uppercase px-2 mb-1 block">
                Failures & Incidents ({filteredFailures.length})
              </span>
              {filteredFailures.map((f) => (
                <div
                  key={f.id}
                  onClick={() => handleSelect(`/failures/${f.id}`)}
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <AlertTriangle className="h-4 w-4 text-amber-500" />
                    <div>
                      <span className="font-mono font-medium text-slate-900 dark:text-slate-100 mr-2">{f.incidentCode}</span>
                      <span className="text-slate-500 dark:text-slate-400 truncate max-w-xs">{f.category} - {f.botName}</span>
                    </div>
                  </div>
                  <ArrowRight className="h-3.5 w-3.5 text-slate-400" />
                </div>
              ))}
            </div>
          )}

          {filteredApprovals.length > 0 && (
            <div className="py-2">
              <span className="text-[10px] font-semibold tracking-wider text-slate-400 uppercase px-2 mb-1 block">
                Pending Approvals ({filteredApprovals.length})
              </span>
              {filteredApprovals.map((a) => (
                <div
                  key={a.id}
                  onClick={() => handleSelect(`/approvals/${a.id}`)}
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <ShieldAlert className="h-4 w-4 text-rose-500" />
                    <div>
                      <span className="font-mono font-medium text-slate-900 dark:text-slate-100 mr-2">{a.approvalCode}</span>
                      <span className="text-slate-500 dark:text-slate-400">{a.botName} (Risk: {a.riskLevel})</span>
                    </div>
                  </div>
                  <ArrowRight className="h-3.5 w-3.5 text-slate-400" />
                </div>
              ))}
            </div>
          )}

          {filteredClients.length > 0 && (
            <div className="py-2">
              <span className="text-[10px] font-semibold tracking-wider text-slate-400 uppercase px-2 mb-1 block">
                Clients ({filteredClients.length})
              </span>
              {filteredClients.map((c) => (
                <div
                  key={c.id}
                  onClick={() => handleSelect(`/clients/${c.id}`)}
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <Building2 className="h-4 w-4 text-indigo-500" />
                    <div>
                      <span className="font-medium text-slate-900 dark:text-slate-100 mr-2">{c.name}</span>
                      <span className="font-mono text-[11px] text-slate-400">{c.code}</span>
                    </div>
                  </div>
                  <ArrowRight className="h-3.5 w-3.5 text-slate-400" />
                </div>
              ))}
            </div>
          )}

          {filteredWorkflows.length > 0 && (
            <div className="py-2">
              <span className="text-[10px] font-semibold tracking-wider text-slate-400 uppercase px-2 mb-1 block">
                Workflows ({filteredWorkflows.length})
              </span>
              {filteredWorkflows.map((w) => (
                <div
                  key={w.id}
                  onClick={() => handleSelect(`/workflows/${w.id}`)}
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <Cpu className="h-4 w-4 text-slate-500" />
                    <span className="font-medium text-slate-900 dark:text-slate-100">{w.name}</span>
                  </div>
                  <ArrowRight className="h-3.5 w-3.5 text-slate-400" />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="px-4 py-2.5 bg-slate-50 dark:bg-slate-950/40 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
          <span>Navigation: Select to jump directly</span>
          <span>Esc to exit</span>
        </div>
      </div>
    </div>
  );
}
