import { type Component, createEffect, createSignal, Show } from 'solid-js';

import { validateProjectName } from '../../domain/project/validation';
import type { NameDialogMode } from '../../domain/project/types';

import styles from './ProjectNameDialog.module.css';

export interface ProjectNameDialogProps {
  /** Whether the dialog is open */
  isOpen: boolean;

  /** Dialog mode (create, rename, duplicate) */
  mode: NameDialogMode;

  /** Initial name for rename/duplicate modes */
  initialName?: string;

  /** Custom dialog title (overrides mode-based title) */
  title?: string;

  /** Custom confirm button text (overrides mode-based text) */
  confirmText?: string;

  /** Called with the confirmed name */
  onConfirm: (name: string) => void;

  /** Called when dialog is closed/cancelled */
  onClose: () => void;
}

const MODE_TITLES: Record<NameDialogMode, string> = {
  create: 'Create Project',
  rename: 'Rename Project',
  duplicate: 'Duplicate Project',
};

const MODE_BUTTONS: Record<NameDialogMode, string> = {
  create: 'Create',
  rename: 'Rename',
  duplicate: 'Duplicate',
};

export const ProjectNameDialog: Component<ProjectNameDialogProps> = (props) => {
  const [name, setName] = createSignal('');
  const [error, setError] = createSignal<string | null>(null);

  let inputRef: HTMLInputElement | undefined;

  // Reset form when dialog opens
  createEffect(() => {
    if (props.isOpen) {
      setName(props.initialName ?? '');
      setError(null);
      // Focus input after render
      setTimeout(() => inputRef?.focus(), 0);
    }
  });

  const handleConfirm = () => {
    const trimmedName = name().trim();
    const result = validateProjectName(trimmedName);

    if (!result.valid) {
      setError(result.error ?? 'Invalid name');
      return;
    }

    props.onConfirm(trimmedName);
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      props.onClose();
    } else if (e.key === 'Enter') {
      handleConfirm();
    }
  };

  const handleBackdropClick = (e: MouseEvent) => {
    if (e.target === e.currentTarget) {
      props.onClose();
    }
  };

  const handleInput = (value: string) => {
    setName(value);
    // Clear error on input
    if (error()) {
      setError(null);
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
          aria-labelledby="project-name-dialog-title"
          data-testid="project-name-dialog"
          onKeyDown={handleKeyDown}
        >
          <div class={styles.header}>
            <span id="project-name-dialog-title" class={styles.title}>
              {props.title ?? MODE_TITLES[props.mode]}
            </span>
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
              <label class={styles.label} for="project-name-input">
                Project Name
              </label>
              <input
                id="project-name-input"
                type="text"
                class={`${styles.input} ${error() ? styles.inputError : ''}`}
                data-testid="project-name-input"
                value={name()}
                onInput={(e) => handleInput(e.currentTarget.value)}
                onKeyDown={handleKeyDown}
                ref={inputRef}
                placeholder="Enter project name"
                maxLength={100}
              />
              <Show when={error()}>
                <span class={styles.error} data-testid="project-name-error">
                  {error()}
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
              class={styles.confirmButton}
              data-testid="dialog-confirm-button"
              onClick={handleConfirm}
            >
              {props.confirmText ?? MODE_BUTTONS[props.mode]}
            </button>
          </div>
        </div>
      </div>
    </Show>
  );
};
