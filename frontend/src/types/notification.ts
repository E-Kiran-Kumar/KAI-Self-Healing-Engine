export type NotificationLevel = 'info' | 'warning' | 'error' | 'success';

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  level: NotificationLevel;
  timestamp: string;
  read: boolean;
  link?: string;
  category: 'approval' | 'failure' | 'bot' | 'recovery' | 'system';
}
