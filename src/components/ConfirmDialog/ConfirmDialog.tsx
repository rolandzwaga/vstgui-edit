import type { Component, JSX } from 'solid-js';
import { Show, createUniqueId } from 'solid-js';
import styles from './ConfirmDialog.module.css';

export interface ConfirmDialogProps {
  /** Whether the dialog is open */
  isOpen: boolean;
  /** Dialog title */
  title: string;
  /** Confirmation message */
  message: string | JSX.Element;
  /** Text for confirm button */
  confirmText?: string;
  /** Text for cancel button */
  cancelText?: string;
  /** Visual variant */
  variant?: 'default' | 'destructive';
  /** Called when user confirms */
  onConfirm: () => void;
  /** Called when user cancels */
  onCancel: () => void;
}

/**
 * ConfirmDialog - A modal dialog for confirmation actions.
 *
 * Used for destructive actions like deleting projects.
 * Supports keyboard navigation (Escape to cancel).
 */
export const ConfirmDialog: Component<ConfirmDialogProps> = (props) => {
  const titleId = createUniqueId();

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
        data-testid="confirm-dialog-backdrop"
        onClick={handleBackdropClick}
      >
        <div
          class={styles.dialog}
          role="alertdialog"
          aria-modal="true"
          aria-labelledby={titleId}
          onKeyDown={handleKeyDown}
          tabIndex={-1}
        >
          <h2 id={titleId} class={styles.title}>
            {props.title}
          </h2>
          <p class={styles.message}>{props.message}</p>
          <div class={styles.actions}>
            <button
              type="button"
              class={styles.cancelButton}
              onClick={props.onCancel}
            >
              {props.cancelText ?? 'Cancel'}
            </button>
            <button
              type="button"
              class={styles.confirmButton}
              classList={{ [styles.danger]: props.variant === 'destructive' }}
              onClick={props.onConfirm}
            >
              {props.confirmText ?? 'Confirm'}
            </button>
          </div>
        </div>
      </div>
    </Show>
  );
};
