'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAppState } from '@/context/app-state-context';
import { BotService } from '@/lib/services/bot-service';
import { ClientService } from '@/lib/services/client-service';
import { Bot, BotStatus } from '@/types/bot';
import { Client } from '@/types/client';
import { StatusBadge } from '@/components/ui/status-badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { ConfirmationModal } from '@/components/ui/confirmation-modal';
import {
  Bot as BotIcon,
  Search,
  Play,
  Pause,
  Square,
  ArrowRight,
  Sparkles,
  Zap,
} from 'lucide-react';
import { formatDateTime } from '@/lib/utils';

export default function BotsPage() {
  const { dataVersion, refreshData, addToast } = useAppState();
  const [bots, setBots] = useState<Bot[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [clientFilter, setClientFilter] = useState('ALL');
  const [envFilter, setEnvFilter] = useState('ALL');
  const [selectedBotForAction, setSelectedBotForAction] = useState<{
    bot: Bot;
    action: BotStatus | 'trigger';
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const [bList, cList] = await Promise.all([
          BotService.getAll(),
          ClientService.getAll(),
        ]);
        setBots(bList);
        setClients(cList);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [dataVersion]);

  const handleConfirmAction = async () => {
    if (!selectedBotForAction) return;
    const { bot, action } = selectedBotForAction;

    try {
      if (action === 'trigger') {
        await BotService.triggerSimulatedRun(bot.id);
        addToast({
          title: 'Simulated Execution Triggered',
          description: `Spawned local simulated run cycle for ${bot.identifier}. No external systems contacted.`,
          type: 'success',
        });
      } else {
        await BotService.updateSimulatedStatus(bot.id, action);
        addToast({
          title: `Simulated State Updated: ${action.toUpperCase()}`,
          description: `Updated local demo state for ${bot.identifier} to "${action}".`,
          type: 'info',
        });
      }
      refreshData();
    } finally {
      setSelectedBotForAction(null);
    }
  };

  const filteredBots = bots.filter((b) => {
    const matchesSearch =
      b.name.toLowerCase().includes(search.toLowerCase()) ||
      b.identifier.toLowerCase().includes(search.toLowerCase()) ||
      b.clientName.toLowerCase().includes(search.toLowerCase()) ||
      (b.currentWorkflowName && b.currentWorkflowName.toLowerCase().includes(search.toLowerCase()));

    const matchesStatus = statusFilter === 'ALL' || b.status === statusFilter;
    const matchesClient = clientFilter === 'ALL' || b.clientId === clientFilter;
    const matchesEnv = envFilter === 'ALL' || b.environment === envFilter;

    return matchesSearch && matchesStatus && matchesClient && matchesEnv;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2.5">
            <BotIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            <span>Enterprise Bot Fleet Management</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Supervise active automation bots across clients. All control actions modify local simulated state.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono uppercase tracking-wider px-2.5 py-1 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
            Simulated Controls Active
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search bot name, ID (e.g. BOT-APEX-001), client, or workflow..."
              className="pl-9"
            />
          </div>

          <div className="grid grid-cols-3 gap-2 w-full md:w-auto">
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full md:w-32"
            >
              <option value="ALL">All Statuses</option>
              <option value="running">Running</option>
              <option value="idle">Idle</option>
              <option value="failed">Failed</option>
              <option value="paused">Paused</option>
              <option value="recovering">Recovering</option>
            </Select>

            <Select
              value={clientFilter}
              onChange={(e) => setClientFilter(e.target.value)}
              className="w-full md:w-36"
            >
              <option value="ALL">All Clients</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Select>

            <Select
              value={envFilter}
              onChange={(e) => setEnvFilter(e.target.value)}
              className="w-full md:w-28"
            >
              <option value="ALL">All Envs</option>
              <option value="production">Prod</option>
              <option value="staging">Staging</option>
              <option value="uat">UAT</option>
            </Select>
          </div>
        </div>
      </Card>

      {/* Bots Roster Table */}
      <Card>
        <CardHeader>
          <CardTitle>Bot Fleet Catalog ({filteredBots.length})</CardTitle>
          <CardDescription>
            Live status, current workflow binding, host agent VM, and simulated telemetry controls.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800 text-[11px] uppercase tracking-wider text-slate-400">
                <tr>
                  <th className="py-3 px-6 font-semibold">Bot Identifier</th>
                  <th className="py-3 px-4 font-semibold">Client</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                  <th className="py-3 px-4 font-semibold">Workflow Target</th>
                  <th className="py-3 px-4 font-semibold">Last Execution</th>
                  <th className="py-3 px-4 font-semibold">24h Reliability</th>
                  <th className="py-3 px-6 font-semibold text-right">Simulated Control</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400">
                      Loading bot records...
                    </td>
                  </tr>
                ) : filteredBots.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400">
                      No bots match the selected filters.
                    </td>
                  </tr>
                ) : (
                  filteredBots.map((bot) => (
                    <tr
                      key={bot.id}
                      className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="py-3.5 px-6">
                        <Link
                          href={`/bots/${bot.id}`}
                          className="font-semibold text-slate-900 dark:text-slate-100 hover:text-blue-600 dark:hover:text-blue-400 block"
                        >
                          {bot.name}
                        </Link>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="font-mono text-[11px] text-blue-600 dark:text-blue-400 font-medium">
                            {bot.identifier}
                          </span>
                          <span className="font-mono text-[10px] text-slate-400 uppercase">
                            ({bot.environment})
                          </span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <Link
                          href={`/clients/${bot.clientId}`}
                          className="font-medium text-slate-700 dark:text-slate-300 hover:underline"
                        >
                          {bot.clientName}
                        </Link>
                      </td>

                      <td className="py-3.5 px-4">
                        <StatusBadge status={bot.status} />
                      </td>

                      <td className="py-3.5 px-4">
                        {bot.currentWorkflowName ? (
                          <span className="text-slate-800 dark:text-slate-200">
                            {bot.currentWorkflowName}
                          </span>
                        ) : (
                          <span className="text-slate-400 italic">None Assigned</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px]">
                        {formatDateTime(bot.lastRunAt)}
                      </td>

                      <td className="py-3.5 px-4 font-mono font-medium text-slate-900 dark:text-slate-100">
                        {bot.successRate24h}%
                      </td>

                      <td className="py-3.5 px-6 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {bot.status === 'running' ? (
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 px-2 text-xs gap-1 border-amber-500/30 text-amber-600 hover:bg-amber-500/10"
                              title="Simulate Pause"
                              onClick={() => setSelectedBotForAction({ bot, action: 'paused' })}
                            >
                              <Pause className="h-3 w-3" />
                              <span className="hidden sm:inline">Pause</span>
                            </Button>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 px-2 text-xs gap-1 border-emerald-500/30 text-emerald-600 hover:bg-emerald-500/10"
                              title="Simulate Start"
                              onClick={() => setSelectedBotForAction({ bot, action: 'running' })}
                            >
                              <Play className="h-3 w-3" />
                              <span className="hidden sm:inline">Start</span>
                            </Button>
                          )}

                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 px-2 text-xs gap-1 border-slate-300 dark:border-slate-700 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                            title="Simulate Stop"
                            onClick={() => setSelectedBotForAction({ bot, action: 'idle' })}
                          >
                            <Square className="h-3 w-3" />
                          </Button>

                          <Link href={`/bots/${bot.id}`}>
                            <Button variant="outline" size="sm" className="h-7 px-2 text-xs">
                              <ArrowRight className="h-3 w-3" />
                            </Button>
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Confirmation Modal for Simulated Control */}
      {selectedBotForAction && (
        <ConfirmationModal
          isOpen={true}
          onClose={() => setSelectedBotForAction(null)}
          onConfirm={handleConfirmAction}
          title={`Simulate Action: ${selectedBotForAction.action.toUpperCase()}`}
          message={`Are you sure you want to change simulated status for "${selectedBotForAction.bot.identifier}" (${selectedBotForAction.bot.name}) to "${selectedBotForAction.action}"? This updates local demo state only.`}
          confirmLabel={`Apply Simulated ${selectedBotForAction.action}`}
          variant={selectedBotForAction.action === 'idle' ? 'danger' : 'primary'}
        />
      )}
    </div>
  );
}
