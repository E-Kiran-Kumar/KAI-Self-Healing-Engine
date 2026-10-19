import { AppNotification } from '@/types/notification';

export const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif-1',
    title: 'High Risk Recovery Awaiting Approval',
    message: 'BOT-FINC-002 encountered gateway timeout on sanctions screening. Approval required before rerouting.',
    level: 'warning',
    timestamp: '2026-10-19T09:58:45Z',
    read: false,
    link: '/approvals/apr-finc-01',
    category: 'approval',
  },
  {
    id: 'notif-2',
    title: 'DOM Selector Recalibration Suggested',
    message: 'Vision model synthesized replacement selector for BOT-APEX-002 with 94.6% confidence.',
    level: 'info',
    timestamp: '2026-10-19T10:12:30Z',
    read: false,
    link: '/recoveries/rec-apex-01',
    category: 'recovery',
  },
  {
    id: 'notif-3',
    title: 'Simulated Recovery Succeeded',
    message: 'BOT-RPUL-002 resolved PostgreSQL lock contention via jittered exponential backoff.',
    level: 'success',
    timestamp: '2026-10-19T09:16:10Z',
    read: true,
    link: '/recoveries/rec-rpul-01',
    category: 'recovery',
  },
  {
    id: 'notif-4',
    title: 'Unrecoverable Incident Detected',
    message: 'BOT-NXE-001 negative price spike outside automated safety clamps. Human review needed.',
    level: 'error',
    timestamp: '2026-10-19T06:15:00Z',
    read: true,
    link: '/failures/inc-nxe-01',
    category: 'failure',
  },
];
