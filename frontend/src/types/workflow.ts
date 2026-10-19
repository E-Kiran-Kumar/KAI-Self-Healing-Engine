export type WorkflowExecutionStatus = 'running' | 'completed' | 'failed' | 'recovered' | 'waiting-approval';

export interface WorkflowStep {
  id: string;
  stepNumber: number;
  name: string;
  actionType: 'click' | 'type' | 'api-call' | 'query' | 'ocr-extract' | 'validate' | 'export';
  targetSelector?: string;
  status: 'passed' | 'failed' | 'skipped' | 'running' | 'pending';
  startedAt?: string;
  durationMs?: number;
  errorMessage?: string;
  screenshotUrl?: string; // UI placeholder
  tracePayload?: Record<string, unknown>;
}

export interface WorkflowExecutionRun {
  runId: string;
  botId: string;
  botName: string;
  clientId: string;
  clientName: string;
  workflowId: string;
  workflowName: string;
  status: WorkflowExecutionStatus;
  startedAt: string;
  completedAt?: string;
  durationMs: number;
  steps: WorkflowStep[];
  failureId?: string;
  recoveryId?: string;
  traceSnapshotId?: string;
}

export interface WorkflowDefinition {
  id: string;
  name: string;
  description: string;
  clientId: string;
  clientName: string;
  assignedBotIds: string[];
  category: 'finance' | 'procurement' | 'logistics' | 'healthcare' | 'hr';
  averageDurationMs: number;
  successRate: number;
  lastExecutionAt: string;
  stepCount: number;
}
