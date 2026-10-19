import { WorkflowDefinition, WorkflowExecutionRun } from '@/types/workflow';
import { StorageAdapter } from './storage-adapter';

export const WorkflowService = {
  async getAll(): Promise<WorkflowDefinition[]> {
    return StorageAdapter.getWorkflows();
  },

  async getById(id: string): Promise<WorkflowDefinition | null> {
    const list = StorageAdapter.getWorkflows();
    return list.find((w) => w.id === id) || null;
  },

  async getRuns(workflowId?: string): Promise<WorkflowExecutionRun[]> {
    const runs = StorageAdapter.getRuns();
    if (workflowId) {
      return runs.filter((r) => r.workflowId === workflowId);
    }
    return runs;
  },

  async getRunById(runId: string): Promise<WorkflowExecutionRun | null> {
    const runs = StorageAdapter.getRuns();
    return runs.find((r) => r.runId === runId) || null;
  },
};
