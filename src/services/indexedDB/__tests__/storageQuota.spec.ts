import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { LIMITS } from '../../../domain/project/types';
import { checkQuotaWarning, estimateStorageQuota, QUOTA_WARNING_THRESHOLD } from '../storageQuota';

describe('storageQuota', () => {
  const originalNavigator = global.navigator;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    // Restore navigator
    Object.defineProperty(global, 'navigator', {
      value: originalNavigator,
      writable: true,
    });
  });

  describe('estimateStorageQuota', () => {
    test('returns quota information when API is available', async () => {
      Object.defineProperty(global, 'navigator', {
        value: {
          storage: {
            estimate: vi.fn().mockResolvedValue({
              usage: 50 * 1024 * 1024, // 50MB used
              quota: 100 * 1024 * 1024, // 100MB quota
            }),
          },
        },
        writable: true,
      });

      const result = await estimateStorageQuota();

      expect(result.used).toBe(50 * 1024 * 1024);
      expect(result.available).toBe(100 * 1024 * 1024);
      expect(result.percentUsed).toBe(50);
    });

    test('returns fallback values when API is unavailable', async () => {
      Object.defineProperty(global, 'navigator', {
        value: {},
        writable: true,
      });

      const result = await estimateStorageQuota();

      expect(result.used).toBe(0);
      expect(result.available).toBe(Infinity);
      expect(result.percentUsed).toBe(0);
    });

    test('returns fallback when storage.estimate is missing', async () => {
      Object.defineProperty(global, 'navigator', {
        value: {
          storage: {},
        },
        writable: true,
      });

      const result = await estimateStorageQuota();

      expect(result.used).toBe(0);
      expect(result.available).toBe(Infinity);
      expect(result.percentUsed).toBe(0);
    });

    test('handles undefined usage in estimate', async () => {
      Object.defineProperty(global, 'navigator', {
        value: {
          storage: {
            estimate: vi.fn().mockResolvedValue({
              quota: 100 * 1024 * 1024,
            }),
          },
        },
        writable: true,
      });

      const result = await estimateStorageQuota();

      expect(result.used).toBe(0);
    });

    test('handles undefined quota in estimate', async () => {
      Object.defineProperty(global, 'navigator', {
        value: {
          storage: {
            estimate: vi.fn().mockResolvedValue({
              usage: 50 * 1024 * 1024,
            }),
          },
        },
        writable: true,
      });

      const result = await estimateStorageQuota();

      expect(result.available).toBe(Infinity);
      expect(result.percentUsed).toBe(0);
    });

    test('calculates percentUsed correctly', async () => {
      Object.defineProperty(global, 'navigator', {
        value: {
          storage: {
            estimate: vi.fn().mockResolvedValue({
              usage: 80 * 1024 * 1024,
              quota: 100 * 1024 * 1024,
            }),
          },
        },
        writable: true,
      });

      const result = await estimateStorageQuota();

      expect(result.percentUsed).toBe(80);
    });
  });

  describe('checkQuotaWarning', () => {
    test('returns true when usage exceeds 80% threshold', async () => {
      Object.defineProperty(global, 'navigator', {
        value: {
          storage: {
            estimate: vi.fn().mockResolvedValue({
              usage: 85 * 1024 * 1024,
              quota: 100 * 1024 * 1024,
            }),
          },
        },
        writable: true,
      });

      const result = await checkQuotaWarning();

      expect(result.shouldWarn).toBe(true);
      expect(result.quota.percentUsed).toBe(85);
    });

    test('returns false when usage is below 80% threshold', async () => {
      Object.defineProperty(global, 'navigator', {
        value: {
          storage: {
            estimate: vi.fn().mockResolvedValue({
              usage: 50 * 1024 * 1024,
              quota: 100 * 1024 * 1024,
            }),
          },
        },
        writable: true,
      });

      const result = await checkQuotaWarning();

      expect(result.shouldWarn).toBe(false);
    });

    test('returns false when usage is exactly at 80% threshold', async () => {
      Object.defineProperty(global, 'navigator', {
        value: {
          storage: {
            estimate: vi.fn().mockResolvedValue({
              usage: 80 * 1024 * 1024,
              quota: 100 * 1024 * 1024,
            }),
          },
        },
        writable: true,
      });

      const result = await checkQuotaWarning();

      expect(result.shouldWarn).toBe(false);
    });

    test('returns false when API is unavailable (fallback)', async () => {
      Object.defineProperty(global, 'navigator', {
        value: {},
        writable: true,
      });

      const result = await checkQuotaWarning();

      expect(result.shouldWarn).toBe(false);
    });
  });

  describe('QUOTA_WARNING_THRESHOLD', () => {
    test('is set to 80%', () => {
      expect(QUOTA_WARNING_THRESHOLD).toBe(LIMITS.QUOTA_WARNING_THRESHOLD);
      expect(QUOTA_WARNING_THRESHOLD).toBe(80);
    });
  });
});
