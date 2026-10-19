import { FailureIncident, FailureInvestigationStatus } from '@/types/failure';
import { StorageAdapter } from './storage-adapter';

export const FailureService = {
  async getAll(): Promise<FailureIncident[]> {
    return StorageAdapter.getFailures();
  },

  async getById(id: string): Promise<FailureIncident | null> {
    const list = StorageAdapter.getFailures();
    return list.find((f) => f.id === id || f.incidentCode.toLowerCase() === id.toLowerCase()) || null;
  },

  async updateStatus(id: string, newStatus: FailureInvestigationStatus): Promise<FailureIncident> {
    const list = StorageAdapter.getFailures();
    const index = list.findIndex((f) => f.id === id || f.incidentCode.toLowerCase() === id.toLowerCase());
    if (index === -1) throw new Error(`Incident ${id} not found`);

    const updated: FailureIncident = {
      ...list[index],
      status: newStatus,
      resolvedAt: newStatus === 'resolved' ? new Date().toISOString() : list[index].resolvedAt,
    };

    list[index] = updated;
    StorageAdapter.setFailures([...list]);
    return updated;
  },
};
