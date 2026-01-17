/**
 * Storage Quota Service
 *
 * Monitors IndexedDB storage usage and provides warnings when quota is low.
 */

import type { StorageQuota } from '../../domain/project/types';
import { LIMITS } from '../../domain/project/types';

// ============================================================================
// Constants
// ============================================================================

/** Storage warning threshold (percentage) - warn when usage exceeds this */
export const QUOTA_WARNING_THRESHOLD = LIMITS.QUOTA_WARNING_THRESHOLD;

// ============================================================================
// Quota Estimation
// ============================================================================

/**
 * Estimates current storage quota and usage.
 *
 * Uses the Storage API if available. Falls back to safe defaults
 * when the API is unavailable (e.g., older browsers, some mobile contexts).
 *
 * @returns Promise with quota information
 */
export async function estimateStorageQuota(): Promise<StorageQuota> {
  // Check if Storage API is available
  if (!navigator?.storage?.estimate) {
    return {
      used: 0,
      available: Infinity,
      percentUsed: 0,
    };
  }

  const estimate = await navigator.storage.estimate();
  const used = estimate.usage ?? 0;
  const available = estimate.quota ?? Infinity;
  const percentUsed = available === Infinity ? 0 : (used / available) * 100;

  return {
    used,
    available,
    percentUsed,
  };
}

// ============================================================================
// Warning Check
// ============================================================================

/**
 * Result of quota warning check.
 */
export interface QuotaWarningResult {
  /** Whether a warning should be displayed */
  shouldWarn: boolean;
  /** Current quota information */
  quota: StorageQuota;
}

/**
 * Checks if storage usage exceeds the warning threshold.
 *
 * Per FR-032, warns at 80% capacity.
 *
 * @returns Promise with warning status and quota info
 */
export async function checkQuotaWarning(): Promise<QuotaWarningResult> {
  const quota = await estimateStorageQuota();
  const shouldWarn = quota.percentUsed > QUOTA_WARNING_THRESHOLD;

  return {
    shouldWarn,
    quota,
  };
}
