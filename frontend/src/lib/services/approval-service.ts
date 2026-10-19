import { HumanApprovalItem, ApprovalStatus, ApprovalAuditEntry } from '@/types/approval';
import { StorageAdapter } from './storage-adapter';

export const ApprovalService = {
  async getAll(): Promise<HumanApprovalItem[]> {
    return StorageAdapter.getApprovals();
  },

  async getPending(): Promise<HumanApprovalItem[]> {
    const list = StorageAdapter.getApprovals();
    return list.filter((a) => a.status === 'pending');
  },

  async getById(id: string): Promise<HumanApprovalItem | null> {
    const list = StorageAdapter.getApprovals();
    return list.find((a) => a.id === id || a.approvalCode.toLowerCase() === id.toLowerCase()) || null;
  },

  async recordDecision(
    id: string,
    decision: 'approved' | 'rejected',
    operatorName: string,
    notes?: string
  ): Promise<HumanApprovalItem> {
    const list = StorageAdapter.getApprovals();
    const index = list.findIndex((a) => a.id === id || a.approvalCode.toLowerCase() === id.toLowerCase());
    if (index === -1) throw new Error(`Approval item ${id} not found`);

    const item = list[index];
    const newStatus: ApprovalStatus = decision;

    const auditEntry: ApprovalAuditEntry = {
      id: `aud-${Date.now().toString(36)}`,
      action: decision,
      performedBy: operatorName || 'Demo Supervisor',
      role: 'Enterprise Operator',
      timestamp: new Date().toISOString(),
      notes: notes || `Operator ${decision} the proposed recovery actions in simulated mode.`,
    };

    const updated: HumanApprovalItem = {
      ...item,
      status: newStatus,
      decidedAt: new Date().toISOString(),
      decidedBy: operatorName || 'Demo Supervisor',
      decisionNotes: notes,
      auditTrail: [auditEntry, ...item.auditTrail],
    };

    list[index] = updated;
    StorageAdapter.setApprovals([...list]);

    // Also update associated recovery status in demo state if approved
    if (item.recoveryId) {
      const recoveries = StorageAdapter.getRecoveries();
      const recIndex = recoveries.findIndex((r) => r.id === item.recoveryId);
      if (recIndex !== -1) {
        recoveries[recIndex] = {
          ...recoveries[recIndex],
          status: decision === 'approved' ? 'approved' : 'escalated',
        };
        StorageAdapter.setRecoveries([...recoveries]);
      }
    }

    return updated;
  },
};
