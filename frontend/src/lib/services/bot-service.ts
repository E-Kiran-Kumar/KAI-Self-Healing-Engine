import { Bot, BotStatus } from '@/types/bot';
import { StorageAdapter } from './storage-adapter';

export const BotService = {
  async getAll(clientId?: string): Promise<Bot[]> {
    const list = StorageAdapter.getBots();
    if (clientId) {
      return list.filter((b) => b.clientId === clientId);
    }
    return list;
  },

  async getById(id: string): Promise<Bot | null> {
    const list = StorageAdapter.getBots();
    return list.find((b) => b.id === id) || null;
  },

  /**
   * Updates simulated local bot state (Start / Pause / Stop)
   * Explicitly labeled as simulated local demo state only.
   */
  async updateSimulatedStatus(id: string, newStatus: BotStatus): Promise<Bot> {
    const list = StorageAdapter.getBots();
    const index = list.findIndex((b) => b.id === id);
    if (index === -1) throw new Error(`Bot ${id} not found`);

    const updatedBot: Bot = {
      ...list[index],
      status: newStatus,
      lastRunAt: new Date().toISOString(),
      metadata: {
        ...list[index].metadata,
        heartbeatTimestamp: new Date().toISOString(),
      },
    };

    list[index] = updatedBot;
    StorageAdapter.setBots([...list]);
    return updatedBot;
  },

  async triggerSimulatedRun(id: string): Promise<Bot> {
    const list = StorageAdapter.getBots();
    const index = list.findIndex((b) => b.id === id);
    if (index === -1) throw new Error(`Bot ${id} not found`);

    const bot = list[index];
    const newRun = {
      runId: `run-${bot.id.slice(0, 8)}-${Date.now().toString(36)}`,
      workflowId: bot.currentWorkflowId || 'wf-default',
      workflowName: bot.currentWorkflowName || 'Default Telemetry Cycle',
      status: 'completed' as const,
      startedAt: new Date().toISOString(),
      durationMs: Math.floor(15000 + Math.random() * 25000),
      stepsTotal: 6,
      stepsCompleted: 6,
      trigger: 'manual' as const,
    };

    const updatedBot: Bot = {
      ...bot,
      status: 'running',
      lastRunAt: new Date().toISOString(),
      totalExecutions: bot.totalExecutions + 1,
      history: [newRun, ...(bot.history || [])],
    };

    list[index] = updatedBot;
    StorageAdapter.setBots([...list]);
    return updatedBot;
  },
};
