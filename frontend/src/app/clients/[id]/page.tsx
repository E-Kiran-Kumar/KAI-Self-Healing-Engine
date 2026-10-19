'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { useAppState } from '@/context/app-state-context';
import { ClientService } from '@/lib/services/client-service';
import { BotService } from '@/lib/services/bot-service';
import { Client } from '@/types/client';
import { Bot } from '@/types/bot';
import { StatusBadge } from '@/components/ui/status-badge';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { ClientDialog } from '@/components/clients/client-dialog';
import {
  Building2,
  ArrowLeft,
  Bot as BotIcon,
  ShieldCheck,
  ShieldAlert,
  Edit,
  Mail,
  Globe,
  Activity,
  ArrowRight,
  Server,
} from 'lucide-react';
import { formatDateTime } from '@/lib/utils';

function ClientDetailContent() {
  const params = useParams<{ id: string }>();
  const id = params?.id || '';
  const { dataVersion, refreshData, addToast } = useAppState();
  const [client, setClient] = useState<Client | null>(null);
  const [clientBots, setClientBots] = useState<Bot[]>([]);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function loadClient() {
      if (!id) return;
      setIsLoading(true);
      try {
        const found = await ClientService.getById(id);
        if (!found) {
          router.push('/clients');
          return;
        }
        setClient(found);
        const bots = await BotService.getAll(found.id);
        setClientBots(bots);
      } finally {
        setIsLoading(false);
      }
    }
    loadClient();
  }, [id, dataVersion, router]);

  const handleUpdateClient = async (data: Partial<Client>) => {
    if (!client) return;
    await ClientService.update(client.id, data);
    addToast({
      title: 'Client Saved',
      description: `Updated configuration for "${client.name}".`,
      type: 'success',
    });
    refreshData();
  };

  if (isLoading || !client) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  const runningBots = clientBots.filter((b) => b.status === 'running').length;
  const failedBots = clientBots.filter((b) => b.status === 'failed').length;

  return (
    <div className="space-y-6">
      {/* Back button & Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/clients">
            <button className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 transition-colors">
              <ArrowLeft className="h-4 w-4" />
            </button>
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                {client.name}
              </h1>
              <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold">
                {client.code}
              </span>
              <StatusBadge status={client.status} />
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Organization ID: <span className="font-mono">{client.id}</span> • Registered on {formatDateTime(client.createdAt)}
            </p>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          className="gap-2"
          onClick={() => setIsEditDialogOpen(true)}
        >
          <Edit className="h-4 w-4" />
          <span>Edit Organization Profile</span>
        </Button>
      </div>

      {/* Client Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-5">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
            Tier & SLA Target
          </span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-xl font-bold text-slate-900 dark:text-slate-100">
              {client.tier}
            </span>
            <span className="font-mono text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              {client.slaUptime}% Uptime
            </span>
          </div>
          <span className="text-xs text-slate-400 mt-1 block">{client.region}</span>
        </Card>

        <Card className="p-5">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
            Bot Cluster Capacity
          </span>
          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-xl font-bold text-slate-900 dark:text-slate-100">
              {clientBots.length} / {client.maxConcurrentBots}
            </span>
            <span className="text-xs text-slate-500">Bots Provisioned</span>
          </div>
          <span className="text-xs text-slate-400 mt-1 block">
            {runningBots} running • {failedBots} failed
          </span>
        </Card>

        <Card className="p-5">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
            Self-Healing Policy
          </span>
          <div className="mt-2 flex items-center gap-2">
            {client.healingAutoRecoveryEnabled ? (
              <>
                <ShieldCheck className="h-5 w-5 text-emerald-500 shrink-0" />
                <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                  Autonomous Auto-Heal
                </span>
              </>
            ) : (
              <>
                <ShieldAlert className="h-5 w-5 text-amber-500 shrink-0" />
                <span className="text-sm font-semibold text-amber-600 dark:text-amber-400">
                  Human Approval Enforced
                </span>
              </>
            )}
          </div>
          <span className="text-xs text-slate-400 mt-1 block">
            {client.healingAutoRecoveryEnabled ? 'Low risk repairs execute without delay' : 'All repairs require sign-off'}
          </span>
        </Card>

        <Card className="p-5">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
            Primary Contact
          </span>
          <div className="mt-2">
            <span className="text-sm font-semibold text-slate-900 dark:text-slate-100 block truncate">
              {client.primaryContact.name}
            </span>
            <span className="text-xs text-slate-500 block truncate">
              {client.primaryContact.role}
            </span>
          </div>
          <span className="text-[11px] text-blue-600 dark:text-blue-400 flex items-center gap-1 mt-1 truncate">
            <Mail className="h-3 w-3" />
            {client.primaryContact.email}
          </span>
        </Card>
      </div>

      {/* Bots Belonging to this Client */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Assigned Bot Fleet ({clientBots.length})</CardTitle>
            <CardDescription>
              Automation workers allocated strictly to this client&apos;s workspace and credentials.
            </CardDescription>
          </div>
          <Link href="/bots">
            <Button variant="outline" size="sm" className="gap-1.5 text-xs">
              <BotIcon className="h-3.5 w-3.5" />
              <span>Deploy New Bot</span>
            </Button>
          </Link>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800 text-[11px] uppercase tracking-wider text-slate-400">
                <tr>
                  <th className="py-3 px-6 font-semibold">Bot Identifier</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                  <th className="py-3 px-4 font-semibold">Active Workflow</th>
                  <th className="py-3 px-4 font-semibold">Environment</th>
                  <th className="py-3 px-4 font-semibold">24h Reliability</th>
                  <th className="py-3 px-4 font-semibold">Host Agent</th>
                  <th className="py-3 px-6 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {clientBots.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400">
                      No bots currently assigned to this client.
                    </td>
                  </tr>
                ) : (
                  clientBots.map((bot) => (
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
                        <span className="font-mono text-[11px] text-slate-400">
                          {bot.identifier}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <StatusBadge status={bot.status} />
                      </td>

                      <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300">
                        {bot.currentWorkflowName || 'None'}
                      </td>

                      <td className="py-3.5 px-4 font-mono uppercase text-[11px]">
                        {bot.environment}
                      </td>

                      <td className="py-3.5 px-4 font-mono font-medium text-slate-900 dark:text-slate-100">
                        {bot.successRate24h}%
                      </td>

                      <td className="py-3.5 px-4 font-mono text-slate-500 text-[11px]">
                        {bot.hostAgent}
                      </td>

                      <td className="py-3.5 px-6 text-right">
                        <Link href={`/bots/${bot.id}`}>
                          <Button variant="outline" size="sm" className="h-7 px-2.5 text-xs gap-1">
                            <span>Inspect</span>
                            <ArrowRight className="h-3 w-3" />
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Edit Client Dialog */}
      <ClientDialog
        isOpen={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        onSubmit={handleUpdateClient}
        initialData={client}
      />
    </div>
  );
}

export default function ClientDetailPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-96 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
        </div>
      }
    >
      <ClientDetailContent />
    </Suspense>
  );
}
