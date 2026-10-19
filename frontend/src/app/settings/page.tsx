'use client';

import React, { useState } from 'react';
import { useTheme } from '@/context/theme-context';
import { useAppState } from '@/context/app-state-context';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { DisclaimerBanner } from '@/components/ui/disclaimer-banner';
import {
  Settings as SettingsIcon,
  User,
  Bell,
  Building,
  KeyRound,
  Lock,
  Moon,
  Sun,
  Laptop,
  CheckCircle2,
  RotateCcw,
} from 'lucide-react';
import { StorageAdapter } from '@/lib/services/storage-adapter';

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { addToast, refreshData } = useAppState();

  // Local preferences state
  const [profileName, setProfileName] = useState('Alex Mercer');
  const [profileEmail, setProfileEmail] = useState('alex.mercer@kai-engine.enterprise');
  const [profileRole, setProfileRole] = useState('Senior Reliability Architect');

  const [emailAlerts, setEmailAlerts] = useState(true);
  const [slackAlerts, setSlackAlerts] = useState(false);
  const [highRiskOnly, setHighRiskOnly] = useState(true);

  const [orgName, setOrgName] = useState('KAI Enterprise Platform Global');
  const [clusterRegion, setClusterRegion] = useState('us-east-4 (N. Virginia)');

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    addToast({
      title: 'Preferences Saved',
      description: 'User profile and notification settings updated in local demo state.',
      type: 'success',
    });
  };

  const handleResetDemoData = () => {
    StorageAdapter.resetAllToSeed();
    addToast({
      title: 'Demo Data Restored',
      description: 'Restored all clients, bots, failures, and approvals to original seed dataset.',
      type: 'info',
    });
    refreshData();
  };

  return (
    <div className="space-y-6">
      {/* Disclaimer */}
      <DisclaimerBanner
        label="System Preferences & Configuration"
        subtext="Settings modify local demo state and theme preferences. External integration webhooks and API credentials will be connected in Phase 2."
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2.5">
            <SettingsIcon className="h-6 w-6 text-slate-500" />
            <span>Settings & Preferences</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Manage administrative profile, theme options, telemetry notifications, and future integration stubs.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          className="gap-2 text-rose-600 dark:text-rose-400 border-rose-500/20 hover:bg-rose-500/10"
          onClick={handleResetDemoData}
        >
          <RotateCcw className="h-4 w-4" />
          <span>Reset Demo Data to Seed</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Profile & Organization */}
        <div className="lg:col-span-2 space-y-6">
          {/* User Profile */}
          <form onSubmit={handleSaveProfile}>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <User className="h-4 w-4 text-blue-500" />
                  <span>Administrator Profile</span>
                </CardTitle>
                <CardDescription>
                  Your identity when signing off on Human Approval queue items.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                      Full Name
                    </label>
                    <Input
                      value={profileName}
                      onChange={(e) => setProfileName(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                      Work Email
                    </label>
                    <Input
                      type="email"
                      value={profileEmail}
                      onChange={(e) => setProfileEmail(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Job Title / Role
                  </label>
                  <Input
                    value={profileRole}
                    onChange={(e) => setProfileRole(e.target.value)}
                  />
                </div>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button type="submit" size="sm">
                  Save Profile Changes
                </Button>
              </CardFooter>
            </Card>
          </form>

          {/* Organization Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Building className="h-4 w-4 text-indigo-500" />
                <span>Organization & Primary Cluster</span>
              </CardTitle>
              <CardDescription>
                Primary tenant environment hosting bot telemetry orchestrators.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Organization Name
                  </label>
                  <Input
                    value={orgName}
                    onChange={(e) => setOrgName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Default Orchestrator Region
                  </label>
                  <Input
                    value={clusterRegion}
                    onChange={(e) => setClusterRegion(e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Future Integrations Section (Disabled Controls) */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <KeyRound className="h-4 w-4 text-slate-400" />
                <span>External Integration Connectors (Phase 2 Roadmap)</span>
              </CardTitle>
              <CardDescription>
                FastAPI endpoints and webhook triggers will link directly in Phase 2.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-xs font-mono font-bold text-slate-600 dark:text-slate-300">
                    API
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-slate-900 dark:text-slate-100 block">
                      FastAPI Backend Core Bridge
                    </span>
                    <span className="text-[11px] text-slate-400">
                      REST & WebSocket telemetry broker (Scheduled for Phase 2).
                    </span>
                  </div>
                </div>
                <Button size="sm" variant="outline" disabled className="gap-1 text-xs">
                  <Lock className="h-3 w-3" />
                  <span>Phase 2</span>
                </Button>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-xs font-mono font-bold text-slate-600 dark:text-slate-300">
                    CV
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-slate-900 dark:text-slate-100 block">
                      Computer Vision OCR & Multi-Modal Engine
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Visual DOM regression and bounding box diff models.
                    </span>
                  </div>
                </div>
                <Button size="sm" variant="outline" disabled className="gap-1 text-xs">
                  <Lock className="h-3 w-3" />
                  <span>Phase 3</span>
                </Button>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-xs font-mono font-bold text-slate-600 dark:text-slate-300">
                    LG
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-slate-900 dark:text-slate-100 block">
                      LangGraph Autonomous Recovery Agents
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Multi-agent self-healing loop with memory recall.
                    </span>
                  </div>
                </div>
                <Button size="sm" variant="outline" disabled className="gap-1 text-xs">
                  <Lock className="h-3 w-3" />
                  <span>Phase 4</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Theme & Notifications */}
        <div className="space-y-6">
          {/* Appearance & Theme Preference */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Sun className="h-4 w-4 text-amber-500" />
                <span>Theme & Appearance</span>
              </CardTitle>
              <CardDescription>
                Customize dashboard appearance with high-contrast modes.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setTheme('dark')}
                  className={`p-4 rounded-xl border text-center transition-all flex flex-col items-center gap-2 ${
                    theme === 'dark'
                      ? 'border-blue-500 bg-blue-500/10 text-blue-600 dark:text-blue-400'
                      : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-850'
                  }`}
                >
                  <Moon className="h-5 w-5" />
                  <span className="text-xs font-semibold">Dark Mode</span>
                </button>

                <button
                  type="button"
                  onClick={() => setTheme('light')}
                  className={`p-4 rounded-xl border text-center transition-all flex flex-col items-center gap-2 ${
                    theme === 'light'
                      ? 'border-blue-500 bg-blue-500/10 text-blue-600'
                      : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-850'
                  }`}
                >
                  <Sun className="h-5 w-5" />
                  <span className="text-xs font-semibold">Light Mode</span>
                </button>
              </div>
            </CardContent>
          </Card>

          {/* Notification Preferences */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <Bell className="h-4 w-4 text-indigo-500" />
                <span>Telemetry Notifications</span>
              </CardTitle>
              <CardDescription>Configure in-app alert triggers in local state.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <label className="flex items-start gap-3 p-3 rounded-lg border border-slate-100 dark:border-slate-800 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-850">
                <input
                  type="checkbox"
                  checked={emailAlerts}
                  onChange={(e) => setEmailAlerts(e.target.checked)}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 h-4 w-4 mt-0.5"
                />
                <div className="text-xs">
                  <span className="font-semibold text-slate-800 dark:text-slate-200 block">
                    Critical Incident Alerts
                  </span>
                  <span className="text-slate-400 text-[11px]">
                    Notify when bot failures exceed severity thresholds.
                  </span>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3 rounded-lg border border-slate-100 dark:border-slate-800 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-850">
                <input
                  type="checkbox"
                  checked={highRiskOnly}
                  onChange={(e) => setHighRiskOnly(e.target.checked)}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 h-4 w-4 mt-0.5"
                />
                <div className="text-xs">
                  <span className="font-semibold text-slate-800 dark:text-slate-200 block">
                    Human Approval Required
                  </span>
                  <span className="text-slate-400 text-[11px]">
                    Alert immediately when recovery recipe enters approval queue.
                  </span>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3 rounded-lg border border-slate-100 dark:border-slate-800 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-850">
                <input
                  type="checkbox"
                  checked={slackAlerts}
                  onChange={(e) => setSlackAlerts(e.target.checked)}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 h-4 w-4 mt-0.5"
                />
                <div className="text-xs">
                  <span className="font-semibold text-slate-800 dark:text-slate-200 block">
                    Daily Fleet Digest
                  </span>
                  <span className="text-slate-400 text-[11px]">
                    Consolidated 24h reliability summary across all clients.
                  </span>
                </div>
              </label>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
