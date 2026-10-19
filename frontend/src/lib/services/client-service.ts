import { Client, CreateClientInput } from '@/types/client';
import { StorageAdapter } from './storage-adapter';

export const ClientService = {
  async getAll(): Promise<Client[]> {
    return StorageAdapter.getClients();
  },

  async getById(id: string): Promise<Client | null> {
    const list = StorageAdapter.getClients();
    return list.find((c) => c.id === id) || null;
  },

  async create(input: CreateClientInput): Promise<Client> {
    const list = StorageAdapter.getClients();
    const newClient: Client = {
      ...input,
      id: `client-${input.code.toLowerCase()}-${Date.now().toString(36)}`,
      activeBotsCount: 0,
      totalWorkflowsCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const updated = [newClient, ...list];
    StorageAdapter.setClients(updated);
    return newClient;
  },

  async update(id: string, updates: Partial<Client>): Promise<Client> {
    const list = StorageAdapter.getClients();
    const index = list.findIndex((c) => c.id === id);
    if (index === -1) throw new Error(`Client ${id} not found`);

    const updatedClient: Client = {
      ...list[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    list[index] = updatedClient;
    StorageAdapter.setClients([...list]);
    return updatedClient;
  },
};
