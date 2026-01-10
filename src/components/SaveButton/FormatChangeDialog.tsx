import { type Component, createEffect, onCleanup, Show } from 'solid-js';
import type { SaveFormat } from '../../domain/serializer/types';
import styles from './FormatChangeDialog.module.css';

export interface FormatChangeDialogProps {
  isOpen: boolean;
  originalFormat: SaveFormat;
  newFormat: SaveFormat;
  onConfirm: () => void;
  onCancel: () => void;
}

const DIALOG_ID = 'format-change-dialog';
const HEADING_ID = `${DIALOG_ID}-heading`;

export const FormatChangeDialog: Component<FormatChangeDialogProps> = (props) => {
  let dialogRef: HTMLDivElement | undefined;
  let confirmButtonRef: HTMLButtonElement | undefined;

  // Handle Escape key
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && props.isOpen) {
      e.preventDefault();
      props.onCancel();
    }
  };

  // Focus management and keyboard handling
  createEffect(() => {
    if (props.isOpen) {
      document.addEventListener('keydown', handleKeyDown);

      // Focus confirm button after a short delay to ensure dialog is rendered
      requestAnimationFrame(() => {
        confirmButtonRef?.focus();
      });
    }
  });

  onCleanup(() => {
    document.removeEventListener('keydown', handleKeyDown);
  });

  const formatName = (format: SaveFormat) => format.toUpperCase();

  return (
    <Show when={props.isOpen}>
      <div class={styles.overlay} onClick={props.onCancel}>
        <div
          ref={dialogRef}
          class={styles.dialog}
          role="dialog"
          aria-modal="true"
          aria-labelledby={HEADING_ID}
          onClick={(e) => e.stopPropagation()}
        >
          <h2 id={HEADING_ID} class={styles.heading}>
            Change Save Format?
          </h2>

          <p class={styles.message}>
            You are about to change the save format from{' '}
            <strong>{formatName(props.originalFormat)}</strong> to{' '}
            <strong>{formatName(props.newFormat)}</strong>.
          </p>

          <p class={styles.warning}>
            Converting between formats may result in minor formatting differences.
            The document content will be preserved.
          </p>

          <div class={styles.actions}>
            <button
              type="button"
              class={styles.cancelButton}
              onClick={props.onCancel}
            >
              Cancel
            </button>
            <button
              ref={confirmButtonRef}
              type="button"
              class={styles.confirmButton}
              onClick={props.onConfirm}
            >
              Change Format
            </button>
          </div>
        </div>
      </div>
    </Show>
  );
};
