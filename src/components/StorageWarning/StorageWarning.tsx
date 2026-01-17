import type { Component } from 'solid-js';
import { createSignal, createEffect, onCleanup, Show } from 'solid-js';
import { checkQuotaWarning } from '../../services/indexedDB/storageQuota';
import type { StorageQuota } from '../../domain/project/types';
import styles from './StorageWarning.module.css';

export interface StorageWarningProps {
  /** Callback when warning is dismissed */
  onDismiss?: () => void;

  /** Interval in ms to recheck quota (default: no recheck) */
  recheckInterval?: number;
}

/**
 * Formats bytes into human-readable size string.
 */
function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  if (bytes === Infinity) return 'Unlimited';

  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const k = 1024;
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const value = bytes / Math.pow(k, i);

  // Use 1 decimal place for GB and above, whole numbers otherwise
  const decimals = i >= 3 ? 1 : 0;
  return `${value.toFixed(decimals)} ${units[i]}`;
}

/**
 * StorageWarning - Displays a warning banner when storage quota exceeds threshold.
 *
 * Shows used/available space, percentage bar, and dismiss button.
 * Per FR-032, warns at 80% capacity.
 */
export const StorageWarning: Component<StorageWarningProps> = (props) => {
  const [quota, setQuota] = createSignal<StorageQuota | null>(null);
  const [shouldWarn, setShouldWarn] = createSignal(false);
  const [isDismissed, setIsDismissed] = createSignal(false);

  const checkQuota = async () => {
    const result = await checkQuotaWarning();
    setQuota(result.quota);
    setShouldWarn(result.shouldWarn);
  };

  // Initial check and optional interval
  createEffect(() => {
    checkQuota();

    if (props.recheckInterval && props.recheckInterval > 0) {
      const interval = setInterval(checkQuota, props.recheckInterval);
      onCleanup(() => clearInterval(interval));
    }
  });

  const handleDismiss = () => {
    setIsDismissed(true);
    props.onDismiss?.();
  };

  const showWarning = () => shouldWarn() && !isDismissed() && quota() !== null;

  return (
    <Show when={showWarning()}>
      <div class={styles.banner} role="alert">
        <div class={styles.content}>
          <div class={styles.icon}>
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fill-rule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clip-rule="evenodd"
              />
            </svg>
          </div>
          <div class={styles.text}>
            <span class={styles.title}>Storage Almost Full</span>
            <span class={styles.description}>
              You are using {Math.round(quota()!.percentUsed)}% of available storage (
              {formatBytes(quota()!.used)} of {formatBytes(quota()!.available)}).
              Consider exporting and deleting old projects.
            </span>
          </div>
          <div class={styles.progressContainer}>
            <div
              class={styles.progressBar}
              role="progressbar"
              aria-valuenow={Math.round(quota()!.percentUsed)}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <div
                class={styles.progressFill}
                style={{ width: `${Math.round(quota()!.percentUsed)}%` }}
              />
            </div>
          </div>
        </div>
        <button
          type="button"
          class={styles.dismissButton}
          onClick={handleDismiss}
          aria-label="Dismiss"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fill-rule="evenodd"
              d="M4.28 3.22a.75.75 0 00-1.06 1.06L6.94 8l-3.72 3.72a.75.75 0 101.06 1.06L8 9.06l3.72 3.72a.75.75 0 101.06-1.06L9.06 8l3.72-3.72a.75.75 0 00-1.06-1.06L8 6.94 4.28 3.22z"
              clip-rule="evenodd"
            />
          </svg>
        </button>
      </div>
    </Show>
  );
};
