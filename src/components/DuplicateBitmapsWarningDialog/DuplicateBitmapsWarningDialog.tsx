import type { Component } from 'solid-js';
import { For, Show } from 'solid-js';
import type { DuplicateBitmapInfo } from '../../domain/bitmaps/missingBitmaps';
import styles from './DuplicateBitmapsWarningDialog.module.css';

export interface DuplicateBitmapsWarningDialogProps {
  /** Whether the dialog is open */
  isOpen: boolean;

  /** List of duplicate bitmap infos */
  duplicateBitmaps: DuplicateBitmapInfo[];

  /** Called when user acknowledges the warning and proceeds */
  onConfirm: () => void;
}

/**
 * DuplicateBitmapsWarningDialog - Shows a warning when duplicate bitmap names are detected.
 *
 * Displays a list of bitmap names that appear multiple times in the imported uidesc,
 * along with their paths. Only the last occurrence will be preserved.
 */
export const DuplicateBitmapsWarningDialog: Component<DuplicateBitmapsWarningDialogProps> = (props) => {
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape' || e.key === 'Enter') {
      props.onConfirm();
    }
  };

  const handleBackdropClick = (e: MouseEvent) => {
    if (e.target === e.currentTarget) {
      props.onConfirm();
    }
  };

  return (
    <Show when={props.isOpen}>
      <div
        class={styles.backdrop}
        data-testid="duplicate-warning-backdrop"
        onClick={handleBackdropClick}
      >
        <div
          class={styles.dialog}
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="duplicate-warning-title"
          aria-describedby="duplicate-warning-desc"
          onKeyDown={handleKeyDown}
          tabIndex={0}
          ref={(el) => el?.focus()}
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
            <span id="duplicate-warning-title" class={styles.title}>
              Duplicate Bitmap Names Detected
            </span>
          </div>

          <div class={styles.body}>
            <p id="duplicate-warning-desc" class={styles.explanation}>
              The imported file contains bitmap entries with duplicate names.
              Only the last occurrence of each name will be preserved.
              Consider fixing this in your source file.
            </p>

            <div class={styles.bitmapList}>
              <For each={props.duplicateBitmaps}>
                {(bitmap) => (
                  <div class={styles.bitmapItem}>
                    <div class={styles.bitmapInfo}>
                      <span class={styles.bitmapName}>{bitmap.name}</span>
                      <span class={styles.occurrences}>
                        {bitmap.count} occurrences
                      </span>
                    </div>
                    <Show when={bitmap.paths.length > 0}>
                      <div class={styles.pathList}>
                        <For each={bitmap.paths}>
                          {(path) => (
                            <span class={styles.path}>{path}</span>
                          )}
                        </For>
                      </div>
                    </Show>
                  </div>
                )}
              </For>
            </div>
          </div>

          <div class={styles.footer}>
            <button
              type="button"
              class={styles.confirmButton}
              onClick={props.onConfirm}
            >
              I Understand
            </button>
          </div>
        </div>
      </div>
    </Show>
  );
};
