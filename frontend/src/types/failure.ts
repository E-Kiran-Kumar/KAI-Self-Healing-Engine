export type FailureCategory =
  | 'UI'
  | 'API'
  | 'timeout'
  | 'network'
  | 'database'
  | 'validation'
  | 'authentication';

export type FailureSeverity = 'critical' | 'high' | 'medium' | 'low';

export type FailureInvestigationStatus =
  | 'detected'
  | 'diagnosing'
  | 'awaiting-approval'
  | 'recovering'
  | 'resolved'
  | 'unrecoverable';

export interface FailureLogEntry {
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'fatal';
  message: string;
  sourceModule: string;
}

export interface ScreenshotComparison {
  expectedLabel: string;
  expectedTimestamp: string;
  actualLabel: string;
  actualTimestamp: string;
  visualDeltaScore: number; // e.g. 0.42 (42% difference)
  highlightBoundingBox?: {
    x: number;
    y: number;
    width: number;
    height: number;
    label: string;
  };
}

export interface FailureIncident {
  id: string;
  incidentCode: string; // e.g. "INC-8942"
  clientId: string;
  clientName: string;
  botId: string;
  botName: string;
  workflowId: string;
  workflowName: string;
  runId: string;
  category: FailureCategory;
  severity: FailureSeverity;
  status: FailureInvestigationStatus;
  failedStepNumber: number;
  failedStepName: string;
  errorMessage: string;
  stackTrace: string;
  detectedAt: string;
  resolvedAt?: string;
  screenshotComparison?: ScreenshotComparison;
  logs: FailureLogEntry[];
  metadata: {
    hostAgent: string;
    targetUrlOrEndpoint?: string;
    httpStatusCode?: number;
    domElementQuery?: string;
    retryAttempts: number;
  };
  recoveryId?: string;
}
