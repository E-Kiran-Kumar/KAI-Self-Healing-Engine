/**
 * Storage adapter for KAI Phase 1 frontend.
 * Manages deterministic seeded data with client-side localStorage mutations.
 * In Phase 2, this adapter will be substituted with Axios/Fetch calls to the FastAPI backend.
 */

import { INITIAL_CLIENTS } from '../mock-data/clients';
import { INITIAL_BOTS } from '../mock-data/bots';
import { INITIAL_WORKFLOWS, INITIAL_WORKFLOW_RUNS } from '../mock-data/workflows';
import { INITIAL_FAILURES } from '../mock-data/failures';
import { INITIAL_RECOVERIES } from '../mock-data/recoveries';
import { INITIAL_APPROVALS } from '../mock-data/approvals';
import { INITIAL_NOTIFICATIONS } from '../mock-data/notifications';

const KEYS = {
  CLIENTS: 'kai_demo_clients_v1',
  BOTS: 'kai_demo_bots_v1',
  WORKFLOWS: 'kai_demo_workflows_v1',
  RUNS: 'kai_demo_runs_v1',
  FAILURES: 'kai_demo_failures_v1',
  RECOVERIES: 'kai_demo_recoveries_v1',
  APPROVALS: 'kai_demo_approvals_v1',
  NOTIFICATIONS: 'kai_demo_notifications_v1',
};

function safeGet<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function safeSet<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.warn(`[KAI StorageAdapter] Failed saving ${key}:`, err);
  }
}

export const StorageAdapter = {
  getClients: () => safeGet(KEYS.CLIENTS, INITIAL_CLIENTS),
  setClients: (val: typeof INITIAL_CLIENTS) => safeSet(KEYS.CLIENTS, val),

  getBots: () => safeGet(KEYS.BOTS, INITIAL_BOTS),
  setBots: (val: typeof INITIAL_BOTS) => safeSet(KEYS.BOTS, val),

  getWorkflows: () => safeGet(KEYS.WORKFLOWS, INITIAL_WORKFLOWS),
  setWorkflows: (val: typeof INITIAL_WORKFLOWS) => safeSet(KEYS.WORKFLOWS, val),

  getRuns: () => safeGet(KEYS.RUNS, INITIAL_WORKFLOW_RUNS),
  setRuns: (val: typeof INITIAL_WORKFLOW_RUNS) => safeSet(KEYS.RUNS, val),

  getFailures: () => safeGet(KEYS.FAILURES, INITIAL_FAILURES),
  setFailures: (val: typeof INITIAL_FAILURES) => safeSet(KEYS.FAILURES, val),

  getRecoveries: () => safeGet(KEYS.RECOVERIES, INITIAL_RECOVERIES),
  setRecoveries: (val: typeof INITIAL_RECOVERIES) => safeSet(KEYS.RECOVERIES, val),

  getApprovals: () => safeGet(KEYS.APPROVALS, INITIAL_APPROVALS),
  setApprovals: (val: typeof INITIAL_APPROVALS) => safeSet(KEYS.APPROVALS, val),

  getNotifications: () => safeGet(KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS),
  setNotifications: (val: typeof INITIAL_NOTIFICATIONS) => safeSet(KEYS.NOTIFICATIONS, val),

  resetAllToSeed: () => {
    if (typeof window === 'undefined') return;
    Object.values(KEYS).forEach((k) => localStorage.removeItem(k));
  },
};
