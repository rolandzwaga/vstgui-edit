import { type Component, createEffect, createSignal, For, Show } from 'solid-js';
import { validateDimensions, areDimensionsValid } from '../../domain/createNew/validation';
import {
  CONTAINER_CLASSES,
  DEFAULT_CONFIG,
  type ContainerClass,
  type CreateNewDialogProps,
} from '../../types/createNew';
import styles from './CreateNewDialog.module.css';

export const CreateNewDialog: Component<CreateNewDialogProps> = (props) => {
  const [width, setWidth] = createSignal(String(DEFAULT_CONFIG.width));
  const [height, setHeight] = createSignal(String(DEFAULT_CONFIG.height));
  const [containerClass, setContainerClass] = createSignal<ContainerClass>(
    DEFAULT_CONFIG.containerClass
  );
  const [widthError, setWidthError] = createSignal<string | null>(null);
  const [heightError, setHeightError] = createSignal<string | null>(null);

  let widthInputRef: HTMLInputElement | undefined;

  // Reset form when dialog opens
  createEffect(() => {
    if (props.isOpen) {
      setWidth(String(DEFAULT_CONFIG.width));
      setHeight(String(DEFAULT_CONFIG.height));
      setContainerClass(DEFAULT_CONFIG.containerClass);
      setWidthError(null);
      setHeightError(null);
      // Focus width input after render
      setTimeout(() => widthInputRef?.focus(), 0);
    }
  });

  const handleCreate = () => {
    const results = validateDimensions(width(), height());

    if (!results.width.valid) {
      setWidthError(results.width.error ?? 'Invalid width');
    }
    if (!results.height.valid) {
      setHeightError(results.height.error ?? 'Invalid height');
    }

    if (!areDimensionsValid(results)) {
      return;
    }

    props.onCreate({
      width: results.width.value!,
      height: results.height.value!,
      containerClass: containerClass(),
    });
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      props.onClose();
    } else if (e.key === 'Enter') {
      handleCreate();
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
          role="dialog"
          aria-modal="true"
          aria-labelledby="create-new-dialog-title"
          data-testid="create-new-dialog"
          onKeyDown={handleKeyDown}
        >
          <div class={styles.header}>
            <span id="create-new-dialog-title" class={styles.title}>
              Create New Document
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
              <label class={styles.label} for="dialog-width">
                Width
              </label>
              <input
                id="dialog-width"
                type="text"
                class={`${styles.input} ${widthError() ? styles.inputError : ''}`}
                data-testid="dialog-width-input"
                value={width()}
                onInput={(e) => {
                  setWidth(e.currentTarget.value);
                  setWidthError(null);
                }}
                onKeyDown={handleKeyDown}
                ref={widthInputRef}
              />
              <Show when={widthError()}>
                <span class={styles.error} data-testid="dialog-width-error">
                  {widthError()}
                </span>
              </Show>
            </div>
            <div class={styles.field}>
              <label class={styles.label} for="dialog-height">
                Height
              </label>
              <input
                id="dialog-height"
                type="text"
                class={`${styles.input} ${heightError() ? styles.inputError : ''}`}
                data-testid="dialog-height-input"
                value={height()}
                onInput={(e) => {
                  setHeight(e.currentTarget.value);
                  setHeightError(null);
                }}
                onKeyDown={handleKeyDown}
              />
              <Show when={heightError()}>
                <span class={styles.error} data-testid="dialog-height-error">
                  {heightError()}
                </span>
              </Show>
            </div>
            <div class={styles.field}>
              <label class={styles.label} for="dialog-container-class">
                Container Class
              </label>
              <select
                id="dialog-container-class"
                class={styles.select}
                data-testid="dialog-container-class-select"
                value={containerClass()}
                onChange={(e) => setContainerClass(e.currentTarget.value as ContainerClass)}
              >
                <For each={CONTAINER_CLASSES}>
                  {(cls) => <option value={cls}>{cls}</option>}
                </For>
              </select>
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
              class={styles.createButton}
              data-testid="dialog-create-button"
              onClick={handleCreate}
            >
              Create
            </button>
          </div>
        </div>
      </div>
    </Show>
  );
};
