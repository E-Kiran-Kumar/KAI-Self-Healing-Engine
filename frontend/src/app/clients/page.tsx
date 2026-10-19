'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAppState } from '@/context/app-state-context';
import { ClientService } from '@/lib/services/client-service';
import { BotService } from '@/lib/services/bot-service';
import { Client, CreateClientInput } from '@/types/client';
import { Bot } from '@/types/bot';
import { ClientDialog } from '@/components/clients/client-dialog';
import { StatusBadge } from '@/components/ui/status-badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Building2, Plus, Search, Bot as BotIcon, ArrowRight, ShieldCheck, Edit, ShieldAlert } from 'lucide-react';

export default function ClientsPage() {
  const { dataVersion, refreshData, addToast } = useAppState();
  const [clients, setClients] = useState<Client[]>([]);
  const [bots, setBots] = useState<Bot[]>([]);
  const [search, setSearch] = useState('');
  const [tierFilter, setTierFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const [cList, bList] = await Promise.all([
          ClientService.getAll(),
          BotService.getAll(),
        ]);
        setClients(cList);
        setBots(bList);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [dataVersion]);

  const handleSaveClient = async (data: CreateClientInput | Partial<Client>) => {
    if (editingClient) {
      await ClientService.update(editingClient.id, data);
      addToast({
        title: 'Client Updated',
        description: `Client record for "${editingClient.name}" has been updated in local demo state.`,
        type: 'success',
      });
    } else {
      await ClientService.create(data as CreateClientInput);
      addToast({
        title: 'Client Registered',
        description: `New organization "${data.name}" added to enterprise roster.`,
        type: 'success',
      });
    }
    refreshData();
  };

  const filteredClients = clients.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.code.toLowerCase().includes(search.toLowerCase()) ||
      c.industry.toLowerCase().includes(search.toLowerCase());
    const matchesTier = tierFilter === 'ALL' || c.tier === tierFilter;
    const matchesStatus = statusFilter === 'ALL' || c.status === statusFilter;
    return matchesSearch && matchesTier && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2.5">
            <Building2 className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            <span>Enterprise Client Management</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Provision client organizations, configure autonomy tiers, and supervise isolated bot clusters.
          </p>
        </div>

        <Button
          size="sm"
          className="gap-2"
          onClick={() => {
            setEditingClient(null);
            setIsDialogOpen(true);
          }}
        >
          <Plus className="h-4 w-4" />
          <span>Register New Client</span>
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by client name, code, or industry..."
              className="pl-9"
            />
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <Select
              value={tierFilter}
              onChange={(e) => setTierFilter(e.target.value)}
              className="w-full md:w-36"
            >
              <option value="ALL">All Tiers</option>
              <option value="Enterprise">Enterprise</option>
              <option value="Strategic">Strategic</option>
              <option value="Scale">Scale</option>
            </Select>

            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full md:w-36"
            >
              <option value="ALL">All Statuses</option>
              <option value="active">Active</option>
              <option value="onboarding">Onboarding</option>
              <option value="suspended">Suspended</option>
            </Select>
          </div>
        </div>
      </Card>

      {/* Clients Table */}
      <Card>
        <CardHeader>
          <CardTitle>Registered Client Organizations ({filteredClients.length})</CardTitle>
          <CardDescription>
            Multi-tenant isolated organizations with customized SLA uptime guarantees.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800 text-[11px] uppercase tracking-wider text-slate-400">
                <tr>
                  <th className="py-3 px-6 font-semibold">Client Name & Code</th>
                  <th className="py-3 px-4 font-semibold">Tier</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                  <th className="py-3 px-4 font-semibold">Registered Bots</th>
                  <th className="py-3 px-4 font-semibold">Autonomous Recovery</th>
                  <th className="py-3 px-4 font-semibold">SLA Target</th>
                  <th className="py-3 px-6 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400">
                      Loading client roster...
                    </td>
                  </tr>
                ) : filteredClients.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400">
                      No client organizations match the selected criteria.
                    </td>
                  </tr>
                ) : (
                  filteredClients.map((client) => {
                    const clientBots = bots.filter((b) => b.clientId === client.id);
                    const runningCount = clientBots.filter((b) => b.status === 'running').length;
                    const failedCount = clientBots.filter((b) => b.status === 'failed').length;

                    return (
                      <tr
                        key={client.id}
                        className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
                      >
                        <td className="py-4 px-6">
                          <Link
                            href={`/clients/${client.id}`}
                            className="font-semibold text-sm text-slate-900 dark:text-slate-100 hover:text-blue-600 dark:hover:text-blue-400 transition-colors block"
                          >
                            {client.name}
                          </Link>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="font-mono text-[11px] px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 font-semibold">
                              {client.code}
                            </span>
                            <span className="text-[11px] text-slate-400">{client.industry}</span>
                          </div>
                        </td>

                        <td className="py-4 px-4">
                          <span className="font-medium text-slate-700 dark:text-slate-300">
                            {client.tier}
                          </span>
                          <span className="text-[10px] text-slate-400 block">{client.region}</span>
                        </td>

                        <td className="py-4 px-4">
                          <StatusBadge status={client.status} />
                        </td>

                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2">
                            <BotIcon className="h-3.5 w-3.5 text-slate-400" />
                            <span className="font-semibold text-slate-900 dark:text-slate-100">
                              {clientBots.length}
                            </span>
                            <span className="text-slate-400 text-[11px]">
                              ({runningCount} running{failedCount > 0 ? `, ${failedCount} failed` : ''})
                            </span>
                          </div>
                        </td>

                        <td className="py-4 px-4">
                          {client.healingAutoRecoveryEnabled ? (
                            <span className="inline-flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                              <ShieldCheck className="h-3.5 w-3.5" />
                              <span>Autonomous</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400 font-medium">
                              <ShieldAlert className="h-3.5 w-3.5" />
                              <span>Human Sign-Off</span>
                            </span>
                          )}
                        </td>

                        <td className="py-4 px-4 font-mono font-medium text-slate-700 dark:text-slate-300">
                          {client.slaUptime}%
                        </td>

                        <td className="py-4 px-6 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => {
                                setEditingClient(client);
                                setIsDialogOpen(true);
                              }}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                              title="Edit Client"
                            >
                              <Edit className="h-3.5 w-3.5" />
                            </button>
                            <Link href={`/clients/${client.id}`}>
                              <Button variant="outline" size="sm" className="h-7 px-2.5 text-xs gap-1">
                                <span>Manage</span>
                                <ArrowRight className="h-3 w-3" />
                              </Button>
                            </Link>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Add / Edit Dialog */}
      <ClientDialog
        isOpen={isDialogOpen}
        onClose={() => {
          setIsDialogOpen(false);
          setEditingClient(null);
        }}
        onSubmit={handleSaveClient}
        initialData={editingClient}
      />
    </div>
  );
}
