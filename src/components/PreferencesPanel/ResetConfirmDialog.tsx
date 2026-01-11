/**
 * ResetConfirmDialog Component
 *
 * Confirmation dialog for resetting preferences to defaults.
 */

import { type Component, createEffect, onCleanup, Show } from 'solid-js';
import {
  preferencesStore,
  closeResetDialog,
  resetToDefaults,
} from '../../stores/preferencesStore';
import styles from './ResetConfirmDialog.module.css';

const DIALOG_ID = 'reset-confirm-dialog';
const HEADING_ID = `${DIALOG_ID}-heading`;

export const ResetConfirmDialog: Component = () => {
  let confirmButtonRef: HTMLButtonElement | undefined;

  // Handle Escape key
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && preferencesStore.isResetDialogOpen) {
      e.preventDefault();
      e.stopPropagation();
      closeResetDialog();
    }
  };

  // Focus management and keyboard handling
  createEffect(() => {
    if (preferencesStore.isResetDialogOpen) {
      document.addEventListener('keydown', handleKeyDown);

      // Focus confirm button after render
      requestAnimationFrame(() => {
        confirmButtonRef?.focus();
      });
    } else {
      document.removeEventListener('keydown', handleKeyDown);
    }
  });

  onCleanup(() => {
    document.removeEventListener('keydown', handleKeyDown);
  });

  const handleConfirm = () => {
    resetToDefaults();
  };

  return (
    <Show when={preferencesStore.isResetDialogOpen}>
      <div class={styles.overlay} onClick={closeResetDialog}>
        <div
          class={styles.dialog}
          role="dialog"
          aria-modal="true"
          aria-labelledby={HEADING_ID}
          onClick={(e) => e.stopPropagation()}
        >
          <h2 id={HEADING_ID} class={styles.heading}>
            Reset to Defaults?
          </h2>

          <p class={styles.message}>
            This will reset all preferences to their default values. This action cannot be undone.
          </p>

          <div class={styles.actions}>
            <button
              type="button"
              class={styles.cancelButton}
              onClick={closeResetDialog}
            >
              Cancel
            </button>
            <button
              ref={confirmButtonRef}
              type="button"
              class={styles.confirmButton}
              onClick={handleConfirm}
            >
              Reset
            </button>
          </div>
        </div>
      </div>
    </Show>
  );
};
