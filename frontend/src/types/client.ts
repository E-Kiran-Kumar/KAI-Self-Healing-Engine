export type ClientTier = 'Enterprise' | 'Strategic' | 'Scale';
export type ClientStatus = 'active' | 'onboarding' | 'suspended';

export interface Client {
  id: string;
  name: string;
  code: string;
  tier: ClientTier;
  status: ClientStatus;
  primaryContact: {
    name: string;
    email: string;
    role: string;
  };
  region: string;
  industry: string;
  slaUptime: number; // e.g. 99.95
  maxConcurrentBots: number;
  activeBotsCount: number;
  totalWorkflowsCount: number;
  healingAutoRecoveryEnabled: boolean;
  createdAt: string;
  updatedAt: string;
  notes?: string;
}

export type CreateClientInput = Omit<Client, 'id' | 'createdAt' | 'updatedAt' | 'activeBotsCount' | 'totalWorkflowsCount'>;
