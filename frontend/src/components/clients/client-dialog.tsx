'use client';

import React, { useState, useEffect } from 'react';
import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Client, CreateClientInput, ClientTier, ClientStatus } from '@/types/client';

interface ClientDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateClientInput | Partial<Client>) => Promise<void>;
  initialData?: Client | null;
}

export function ClientDialog({
  isOpen,
  onClose,
  onSubmit,
  initialData,
}: ClientDialogProps) {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [tier, setTier] = useState<ClientTier>('Enterprise');
  const [status, setStatus] = useState<ClientStatus>('active');
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactRole, setContactRole] = useState('');
  const [region, setRegion] = useState('North America (US-East)');
  const [industry, setIndustry] = useState('');
  const [slaUptime, setSlaUptime] = useState('99.95');
  const [maxBots, setMaxBots] = useState('20');
  const [autoRecovery, setAutoRecovery] = useState(true);
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialData) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setName(initialData.name);
      setCode(initialData.code);
      setTier(initialData.tier);
      setStatus(initialData.status);
      setContactName(initialData.primaryContact.name);
      setContactEmail(initialData.primaryContact.email);
      setContactRole(initialData.primaryContact.role);
      setRegion(initialData.region);
      setIndustry(initialData.industry);
      setSlaUptime(String(initialData.slaUptime));
      setMaxBots(String(initialData.maxConcurrentBots));
      setAutoRecovery(initialData.healingAutoRecoveryEnabled);
      setNotes(initialData.notes || '');
    } else {
      setName('');
      setCode('');
      setTier('Enterprise');
      setStatus('active');
      setContactName('');
      setContactEmail('');
      setContactRole('');
      setRegion('North America (US-East)');
      setIndustry('');
      setSlaUptime('99.95');
      setMaxBots('20');
      setAutoRecovery(true);
      setNotes('');
    }
    setError('');
  }, [initialData, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !code.trim() || !contactEmail.trim()) {
      setError('Please provide client name, identifier code, and primary contact email.');
      return;
    }

    setIsLoading(true);
    setError('');
    try {
      await onSubmit({
        name,
        code: code.toUpperCase(),
        tier,
        status,
        primaryContact: {
          name: contactName || 'Enterprise Administrator',
          email: contactEmail,
          role: contactRole || 'Operations Lead',
        },
        region,
        industry: industry || 'Technology & Services',
        slaUptime: parseFloat(slaUptime) || 99.9,
        maxConcurrentBots: parseInt(maxBots, 10) || 10,
        healingAutoRecoveryEnabled: autoRecovery,
        notes,
      });
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to save client');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? `Edit Client: ${initialData.name}` : 'Register New Enterprise Client'}
      description="Define cluster configuration, SLA tiers, and autonomous recovery governance."
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 text-xs bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 rounded-lg">
            {error}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Client Organization Name *
            </label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Acme Logistics Corp"
              required
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Client Code (Short ID) *
            </label>
            <Input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="e.g. ACME"
              maxLength={8}
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Tier Level
            </label>
            <Select
              value={tier}
              onChange={(e) => setTier(e.target.value as ClientTier)}
            >
              <option value="Enterprise">Enterprise</option>
              <option value="Strategic">Strategic</option>
              <option value="Scale">Scale</option>
            </Select>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Account Status
            </label>
            <Select
              value={status}
              onChange={(e) => setStatus(e.target.value as ClientStatus)}
            >
              <option value="active">Active</option>
              <option value="onboarding">Onboarding</option>
              <option value="suspended">Suspended</option>
            </Select>
          </div>
        </div>

        <div className="border-t border-slate-100 dark:border-slate-800 pt-3">
          <span className="text-xs font-semibold text-slate-900 dark:text-slate-100 block mb-2">
            Primary Contact & Operations
          </span>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-[11px] text-slate-500 block mb-1">Contact Name</label>
              <Input
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                placeholder="Full Name"
              />
            </div>
            <div>
              <label className="text-[11px] text-slate-500 block mb-1">Work Email *</label>
              <Input
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                placeholder="email@company.com"
                required
              />
            </div>
            <div>
              <label className="text-[11px] text-slate-500 block mb-1">Role / Title</label>
              <Input
                value={contactRole}
                onChange={(e) => setContactRole(e.target.value)}
                placeholder="VP of Tech"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Region
            </label>
            <Input
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              placeholder="e.g. US-East"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              Industry
            </label>
            <Input
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              placeholder="e.g. Banking"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
              SLA Uptime (%)
            </label>
            <Input
              type="number"
              step="0.01"
              value={slaUptime}
              onChange={(e) => setSlaUptime(e.target.value)}
            />
          </div>
        </div>

        <div className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
          <input
            type="checkbox"
            id="chk-autorecovery"
            checked={autoRecovery}
            onChange={(e) => setAutoRecovery(e.target.checked)}
            className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
          />
          <label htmlFor="chk-autorecovery" className="text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
            <span className="font-semibold block">Enable Autonomous AI Self-Healing</span>
            <span className="text-slate-400 text-[11px]">Allow low/medium risk failures to heal without manual intervention.</span>
          </label>
        </div>

        <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-100 dark:border-slate-800">
          <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" size="sm" isLoading={isLoading}>
            {initialData ? 'Update Client' : 'Register Client'}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
