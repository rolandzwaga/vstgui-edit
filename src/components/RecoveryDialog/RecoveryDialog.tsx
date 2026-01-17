import type { Component } from 'solid-js';
import { Show, createUniqueId } from 'solid-js';
import styles from './RecoveryDialog.module.css';

export interface RecoveryDialogProps {
  /** Whether the dialog is open */
  isOpen: boolean;
  /** Name of the corrupted project */
  projectName: string;
  /** Validation errors describing what's wrong */
  errors: string[];
  /** Whether the project can be restored (has some valid state) */
  canRestore: boolean;
  /** Called when user confirms deletion */
  onDelete: () => void;
  /** Called when user attempts restoration */
  onRestore: () => void;
  /** Called when user cancels */
  onCancel: () => void;
}

/**
 * RecoveryDialog - Modal for handling corrupted projects.
 *
 * Displays validation errors and offers options to delete or restore
 * (if possible) a corrupted project.
 */
export const RecoveryDialog: Component<RecoveryDialogProps> = (props) => {
  const titleId = createUniqueId();
  const descId = createUniqueId();

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
        data-testid="recovery-dialog-backdrop"
        onClick={handleBackdropClick}
      >
        <div
          class={styles.dialog}
          role="alertdialog"
          aria-modal="true"
          aria-labelledby={titleId}
          aria-describedby={descId}
          onKeyDown={handleKeyDown}
          tabIndex={-1}
        >
          <div class={styles.iconContainer}>
            <svg class={styles.warningIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          </div>

          <h2 id={titleId} class={styles.title}>
            Project Recovery
          </h2>

          <div id={descId} class={styles.content}>
            <p class={styles.message}>
              The project <strong>"{props.projectName}"</strong> appears to be corrupted or has invalid data.
            </p>

            <Show when={props.errors.length > 0}>
              <div class={styles.errorsSection}>
                <h3 class={styles.errorsTitle}>Issues found:</h3>
                <ul class={styles.errorsList}>
                  {props.errors.map((error) => (
                    <li>{error}</li>
                  ))}
                </ul>
              </div>
            </Show>

            <p class={styles.explanation}>
              <Show
                when={props.canRestore}
                fallback="This project cannot be restored. You can delete it to remove it from your project list."
              >
                You can attempt to restore this project with default values for missing data, or delete it permanently.
              </Show>
            </p>
          </div>

          <div class={styles.actions}>
            <button
              type="button"
              class={styles.cancelButton}
              onClick={props.onCancel}
            >
              Cancel
            </button>
            <button
              type="button"
              class={styles.deleteButton}
              onClick={props.onDelete}
            >
              Delete Project
            </button>
            <Show when={props.canRestore}>
              <button
                type="button"
                class={styles.restoreButton}
                onClick={props.onRestore}
              >
                Restore Project
              </button>
            </Show>
          </div>
        </div>
      </div>
    </Show>
  );
};
