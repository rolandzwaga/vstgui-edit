import { type Component, createSignal, createEffect, Show } from 'solid-js';
import { validateTagName, validateTagId } from '../../domain/controlTags/validation';
import styles from './AddControlTagDialog.module.css';

export interface AddControlTagDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (name: string, tagId: string) => void;
  existingTags: Record<string, string>;
  suggestedName: string;
  suggestedId: string;
}

export const AddControlTagDialog: Component<AddControlTagDialogProps> = (props) => {
  const [name, setName] = createSignal('');
  const [tagId, setTagId] = createSignal('');
  const [nameError, setNameError] = createSignal<string | null>(null);
  const [idError, setIdError] = createSignal<string | null>(null);

  createEffect(() => {
    if (props.isOpen) {
      setName(props.suggestedName);
      setTagId(props.suggestedId);
      setNameError(null);
      setIdError(null);
    }
  });

  const handleAdd = () => {
    const trimmedName = name().trim();
    const trimmedId = tagId().trim();

    const existingNames = Object.keys(props.existingTags);
    const existingIds = Object.values(props.existingTags);

    const nameValidation = validateTagName(trimmedName, existingNames);
    const idValidation = validateTagId(trimmedId, existingIds);

    if (!nameValidation.valid) {
      setNameError(nameValidation.error ?? 'Invalid name');
      return;
    }

    if (!idValidation.valid) {
      setIdError(idValidation.error ?? 'Invalid ID');
      return;
    }

    props.onAdd(trimmedName, trimmedId);
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      props.onClose();
    } else if (e.key === 'Enter') {
      handleAdd();
    }
  };

  const handleBackdropClick = (e: MouseEvent) => {
    if (e.target === e.currentTarget) {
      props.onClose();
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
          data-testid="add-control-tag-dialog"
          onKeyDown={handleKeyDown}
        >
          <div class={styles.header}>
            <span class={styles.title}>Add Control Tag</span>
            <button
              type="button"
              class={styles.closeButton}
              onClick={props.onClose}
              aria-label="Close"
            >
              ×
            </button>
          </div>
          <div class={styles.body}>
            <div class={styles.field}>
              <label class={styles.label} for="dialog-name">Name</label>
              <input
                id="dialog-name"
                type="text"
                class={`${styles.input} ${nameError() ? styles.inputError : ''}`}
                data-testid="dialog-name-input"
                value={name()}
                onInput={(e) => {
                  setName(e.currentTarget.value);
                  setNameError(null);
                }}
                onKeyDown={handleKeyDown}
                ref={(el) => setTimeout(() => el.focus(), 0)}
              />
              <Show when={nameError()}>
                <span class={styles.error} data-testid="dialog-name-error">
                  {nameError()}
                </span>
              </Show>
            </div>
            <div class={styles.field}>
              <label class={styles.label} for="dialog-id">Tag ID</label>
              <input
                id="dialog-id"
                type="number"
                min="0"
                class={`${styles.input} ${idError() ? styles.inputError : ''}`}
                data-testid="dialog-id-input"
                value={tagId()}
                onInput={(e) => {
                  setTagId(e.currentTarget.value);
                  setIdError(null);
                }}
                onKeyDown={handleKeyDown}
              />
              <Show when={idError()}>
                <span class={styles.error} data-testid="dialog-id-error">
                  {idError()}
                </span>
              </Show>
            </div>
          </div>
          <div class={styles.footer}>
            <button
              type="button"
              class={styles.cancelButton}
              data-testid="dialog-cancel-button"
              onClick={props.onClose}
            >
              Cancel
            </button>
            <button
              type="button"
              class={styles.addButton}
              data-testid="dialog-add-button"
              onClick={handleAdd}
            >
              Add
            </button>
          </div>
        </div>
      </div>
    </Show>
  );
};
