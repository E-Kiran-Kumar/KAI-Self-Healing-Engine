import { RecoveryAttempt, RecoveryStatus } from '@/types/recovery';
import { StorageAdapter } from './storage-adapter';

export const RecoveryService = {
  async getAll(): Promise<RecoveryAttempt[]> {
    return StorageAdapter.getRecoveries();
  },

  async getById(id: string): Promise<RecoveryAttempt | null> {
    const list = StorageAdapter.getRecoveries();
    return list.find((r) => r.id === id || r.recoveryCode.toLowerCase() === id.toLowerCase()) || null;
  },

  /**
   * Executes a simulated local recovery run.
   * Explicitly updates local demo state only. Does NOT execute real external actions.
   */
  async simulateExecute(id: string): Promise<RecoveryAttempt> {
    const list = StorageAdapter.getRecoveries();
    const index = list.findIndex((r) => r.id === id || r.recoveryCode.toLowerCase() === id.toLowerCase());
    if (index === -1) throw new Error(`Recovery ${id} not found`);

    const item = list[index];
    const isSuccess = item.modelConfidenceScore > 70;
    const newStatus: RecoveryStatus = isSuccess ? 'simulated-success' : 'simulated-failure';

    const updatedSteps = item.steps.map((st) => ({
      ...st,
      executionStatus: (isSuccess ? 'verified' : 'failed') as 'verified' | 'failed',
      simulatedOutput: st.simulatedOutput || (isSuccess ? 'Simulated verification completed successfully.' : 'Simulated execution timed out.'),
    }));

    const updated: RecoveryAttempt = {
      ...item,
      status: newStatus,
      steps: updatedSteps,
      completedAt: new Date().toISOString(),
      verification: {
        passed: isSuccess,
        score: isSuccess ? Math.round(item.modelConfidenceScore) : 25,
        checks: [
          {
            checkName: 'Simulated Sandbox Validation',
            passed: isSuccess,
            evidence: isSuccess ? 'Execution verified in sandbox DOM container.' : 'Target DOM response failed criteria.',
          },
        ],
        verifiedAt: new Date().toISOString(),
      },
    };

    list[index] = updated;
    StorageAdapter.setRecoveries([...list]);
    return updated;
  },
};
