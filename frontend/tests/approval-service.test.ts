import { describe, it, expect } from 'vitest';
import { ApprovalService } from '@/lib/services/approval-service';

describe('ApprovalService Governance & Audit Trail', () => {
  it('retrieves pending approvals queue', async () => {
    const list = await ApprovalService.getAll();
    expect(list.length).toBeGreaterThan(0);

    const pending = await ApprovalService.getPending();
    expect(pending.every((p) => p.status === 'pending')).toBe(true);
  });

  it('records human supervisor decisions and updates audit trail in local state', async () => {
    const pending = await ApprovalService.getPending();
    if (pending.length > 0) {
      const itemToApprove = pending[0];
      const initialAuditCount = itemToApprove.auditTrail.length;

      const result = await ApprovalService.recordDecision(
        itemToApprove.id,
        'approved',
        'Senior QA Operator',
        'Verified in mock staging sandbox'
      );

      expect(result.status).toBe('approved');
      expect(result.decidedBy).toBe('Senior QA Operator');
      expect(result.auditTrail.length).toBe(initialAuditCount + 1);
      expect(result.auditTrail[0].action).toBe('approved');
      expect(result.auditTrail[0].performedBy).toBe('Senior QA Operator');
    }
  });
});
