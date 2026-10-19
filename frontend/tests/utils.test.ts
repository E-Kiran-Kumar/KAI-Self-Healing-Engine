import { describe, it, expect } from 'vitest';
import { formatDuration, getStatusTone } from '@/lib/utils';

describe('UI Utilities', () => {
  it('formats milliseconds into human readable durations', () => {
    expect(formatDuration(450)).toBe('450ms');
    expect(formatDuration(15200)).toBe('15.2s');
    expect(formatDuration(65000)).toBe('1m 5s');
    expect(formatDuration(125000)).toBe('2m 5s');
  });

  it('computes correct enterprise status tones for badges and dots', () => {
    const runningTone = getStatusTone('running');
    expect(runningTone.badge).toContain('emerald');
    expect(runningTone.dot).toBe('bg-emerald-500');

    const failedTone = getStatusTone('failed');
    expect(failedTone.badge).toContain('rose');
    expect(failedTone.dot).toBe('bg-rose-500');

    const pendingTone = getStatusTone('pending');
    expect(pendingTone.badge).toContain('amber');

    const recoveringTone = getStatusTone('recovering');
    expect(recoveringTone.badge).toContain('indigo');
  });
});
