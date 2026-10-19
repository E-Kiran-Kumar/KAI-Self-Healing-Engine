export type BotStatus = 'running' | 'idle' | 'failed' | 'paused' | 'recovering';
export type BotEnvironment = 'production' | 'staging' | 'uat';

export interface BotExecutionHistoryItem {
  runId: string;
  workflowId: string;
  workflowName: string;
  status: 'completed' | 'failed' | 'recovered' | 'running';
  startedAt: string;
  durationMs: number;
  stepsTotal: number;
  stepsCompleted: number;
  trigger: 'scheduled' | 'event' | 'manual' | 'healing-retry';
}

export interface Bot {
  id: string;
  clientId: string;
  clientName: string;
  name: string;
  identifier: string; // e.g. BOT-APEX-001
  status: BotStatus;
  environment: BotEnvironment;
  currentWorkflowId?: string;
  currentWorkflowName?: string;
  hostAgent: string; // e.g. "vm-us-east-4a"
  version: string; // e.g. "v2.8.4"
  lastRunAt: string;
  nextScheduledRunAt?: string;
  consecutiveFailures: number;
  successRate24h: number; // percentage, e.g. 96.8
  totalExecutions: number;
  selfHealingEligible: boolean;
  history: BotExecutionHistoryItem[];
  metadata: {
    os: string;
    browserVersion?: string;
    ipAddress: string;
    heartbeatTimestamp: string;
  };
}
