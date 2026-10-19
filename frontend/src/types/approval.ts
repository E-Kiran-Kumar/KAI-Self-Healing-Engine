export type ApprovalStatus = 'pending' | 'approved' | 'rejected' | 'expired';
export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

export interface ApprovalAuditEntry {
  id: string;
  action: 'requested' | 'approved' | 'rejected' | 'commented';
  performedBy: string;
  role: string;
  timestamp: string;
  notes?: string;
}

export interface HumanApprovalItem {
  id: string;
  approvalCode: string; // e.g. "APR-1049"
  recoveryId: string;
  recoveryCode: string;
  failureId: string;
  incidentCode: string;
  clientId: string;
  clientName: string;
  botId: string;
  botName: string;
  workflowId: string;
  workflowName: string;
  riskLevel: RiskLevel;
  impactAssessment: {
    productionImpact: string;
    affectedRecordsEstimate: number;
    financialExposureRisk: string;
    rollbackFeasibility: 'instant' | 'manual-compensation' | 'irreversible';
  };
  proposedActions: {
    actionTitle: string;
    targetComponent: string;
    changeSummary: string;
    safetyChecksPassed: boolean;
  }[];
  modelConfidenceScore: number; // illustrative
  status: ApprovalStatus;
  requestedAt: string;
  decidedAt?: string;
  decidedBy?: string;
  decisionNotes?: string;
  auditTrail: ApprovalAuditEntry[];
}
