import { FailureCategory } from './failure';

export type RecoveryStatus =
  | 'suggested'
  | 'approved'
  | 'simulated-success'
  | 'simulated-failure'
  | 'escalated';

export type RecoveryMethod =
  | 'DOM Selector Recalibration'
  | 'Exponential API Backoff & Token Refresh'
  | 'OCR Fuzzy Anchor Remapping'
  | 'Transient Network Retry with Payload Re-sign'
  | 'Schema Coercion & Field Fallback'
  | 'Session Invalidation & Re-authentication'
  | 'Connection Pool Reset';

export interface RecoveryActionStep {
  stepIndex: number;
  description: string;
  actionPayload: string;
  simulatedOutput?: string;
  executionStatus: 'pending' | 'running' | 'verified' | 'failed';
}

export interface VerificationResult {
  passed: boolean;
  score: number; // 0 to 100
  checks: {
    checkName: string;
    passed: boolean;
    evidence: string;
  }[];
  verifiedAt: string;
}

export interface RecoveryAttempt {
  id: string;
  recoveryCode: string; // e.g. "REC-3012"
  failureId: string;
  incidentCode: string;
  clientId: string;
  clientName: string;
  botId: string;
  botName: string;
  workflowId: string;
  workflowName: string;
  category: FailureCategory;
  status: RecoveryStatus;
  recoveryMethod: RecoveryMethod;
  modelConfidenceScore: number; // e.g. 94.6 (illustrative model output)
  confidenceRationale: string;
  steps: RecoveryActionStep[];
  beforeState: {
    title: string;
    description: string;
    screenshotMockLabel: string;
    dataSnapshot: Record<string, unknown>;
  };
  afterState: {
    title: string;
    description: string;
    screenshotMockLabel: string;
    dataSnapshot: Record<string, unknown>;
  };
  verification?: VerificationResult;
  requiresHumanApproval: boolean;
  approvalId?: string;
  createdAt: string;
  completedAt?: string;
  estimatedEffortSavedMinutes: number; // illustrative
}
