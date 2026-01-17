import type { Component } from 'solid-js';
import styles from './BitmapConflictDialog.module.css';

export interface BitmapConflictDialogProps {
  /** The original filename that conflicts */
  filename: string;
  /** The suggested alternative name */
  suggestedName: string;
  /** Called when user chooses to replace the existing bitmap */
  onReplace: () => void;
  /** Called when user chooses to add under the suggested new name */
  onAddNew: () => void;
  /** Called when user cancels the operation */
  onCancel: () => void;
}

/**
 * Dialog shown when uploading a bitmap with a name that already exists.
 * Gives the user three options: replace, add with new name, or cancel.
 */
export const BitmapConflictDialog: Component<BitmapConflictDialogProps> = (props) => {
  return (
    <div class={styles.overlay} data-testid="bitmap-conflict-dialog">
      <div class={styles.dialog} role="alertdialog" aria-labelledby="conflict-title">
        <h3 id="conflict-title" class={styles.title}>
          Bitmap Already Exists
        </h3>
        <p class={styles.message}>
          A bitmap named "<strong>{props.filename}</strong>" already exists.
        </p>
        <p class={styles.question}>What would you like to do?</p>
        <div class={styles.actions}>
          <button
            type="button"
            class={styles.cancelButton}
            onClick={props.onCancel}
            data-testid="conflict-cancel"
          >
            Cancel
          </button>
          <button
            type="button"
            class={styles.addNewButton}
            onClick={props.onAddNew}
            data-testid="conflict-add-new"
          >
            Add as "{props.suggestedName}"
          </button>
          <button
            type="button"
            class={styles.replaceButton}
            onClick={props.onReplace}
            data-testid="conflict-replace"
          >
            Replace
          </button>
        </div>
      </div>
    </div>
  );
};
