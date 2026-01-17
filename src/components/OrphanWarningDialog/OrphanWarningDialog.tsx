import type { Component } from 'solid-js';
import { For, Show } from 'solid-js';
import type { OrphanedBitmap } from '../../domain/project/types';
import styles from './OrphanWarningDialog.module.css';

export interface OrphanWarningDialogProps {
  /** Whether the dialog is open */
  isOpen: boolean;

  /** List of orphaned bitmaps */
  orphanedBitmaps: OrphanedBitmap[];

  /** Called when user confirms to proceed */
  onConfirm: () => void;

  /** Called when user cancels */
  onCancel: () => void;
}

/**
 * Formats bytes into human-readable size string.
 */
function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';

  const units = ['B', 'KB', 'MB', 'GB'];
  const k = 1024;
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const value = bytes / Math.pow(k, i);

  // Use 1 decimal place for larger values
  const decimals = i >= 2 ? 1 : 0;
  return `${value.toFixed(decimals)} ${units[i]}`;
}

/**
 * OrphanWarningDialog - Shows a warning when replacing uidesc will orphan bitmaps.
 *
 * Displays a list of bitmaps that will no longer be referenced by the new uidesc,
 * allowing the user to decide whether to proceed.
 */
export const OrphanWarningDialog: Component<OrphanWarningDialogProps> = (props) => {
  const totalSize = () =>
    props.orphanedBitmaps.reduce((sum, bitmap) => sum + bitmap.size, 0);

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      props.onCancel();
    }
  };

  const handleBackdropClick = (e: MouseEvent) => {
    if (e.target === e.currentTarget) {
      props.onCancel();
    }
  };

  return (
    <Show when={props.isOpen}>
      <div
        class={styles.backdrop}
        data-testid="dialog-backdrop"
        onClick={handleBackdropClick}
      >
        <div
          class={styles.dialog}
          role="dialog"
          aria-modal="true"
          aria-labelledby="orphan-warning-title"
          onKeyDown={handleKeyDown}
        >
          <div class={styles.header}>
            <div class={styles.iconContainer}>
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="currentColor"
                class={styles.warningIcon}
                aria-hidden="true"
              >
                <path
                  fill-rule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clip-rule="evenodd"
                />
              </svg>
            </div>
            <span id="orphan-warning-title" class={styles.title}>
              Orphaned Bitmaps Detected
            </span>
          </div>

          <div class={styles.body}>
            <p class={styles.explanation}>
              The following bitmaps are no longer referenced by the new uidesc file
              and will become orphaned. They will remain stored but unused.
            </p>

            <div class={styles.bitmapList}>
              <For each={props.orphanedBitmaps}>
                {(bitmap) => (
                  <div class={styles.bitmapItem}>
                    <span class={styles.bitmapName}>{bitmap.name}</span>
                    <span class={styles.bitmapSize}>{formatBytes(bitmap.size)}</span>
                  </div>
                )}
              </For>
            </div>

            <p class={styles.totalSize}>
              Total size: {formatBytes(totalSize())}
            </p>
          </div>

          <div class={styles.footer}>
            <button
              type="button"
              class={styles.cancelButton}
              onClick={props.onCancel}
            >
              Cancel
            </button>
            <button
              type="button"
              class={styles.confirmButton}
              onClick={props.onConfirm}
            >
              Continue Anyway
            </button>
          </div>
        </div>
      </div>
    </Show>
  );
};
