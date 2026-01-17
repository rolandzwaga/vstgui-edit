import { type Component, createEffect, createSignal, For, Show } from 'solid-js';
import {
  validateDimension,
  validateDimensions,
  areDimensionsValid,
} from '../../domain/createNew/validation';
import { validateProjectName } from '../../domain/project/validation';
import {
  CONTAINER_CLASSES,
  DEFAULT_CONFIG,
  type ContainerClass,
  type CreateNewDialogProps,
} from '../../types/createNew';
import styles from './CreateNewDialog.module.css';

export const CreateNewDialog: Component<CreateNewDialogProps> = (props) => {
  const [projectName, setProjectName] = createSignal('');
  const [width, setWidth] = createSignal(String(DEFAULT_CONFIG.width));
  const [height, setHeight] = createSignal(String(DEFAULT_CONFIG.height));
  const [containerClass, setContainerClass] = createSignal<ContainerClass>(
    DEFAULT_CONFIG.containerClass
  );
  const [projectNameError, setProjectNameError] = createSignal<string | null>(null);
  const [widthError, setWidthError] = createSignal<string | null>(null);
  const [heightError, setHeightError] = createSignal<string | null>(null);

  let projectNameInputRef: HTMLInputElement | undefined;
  let widthInputRef: HTMLInputElement | undefined;

  // Reset form when dialog opens
  createEffect(() => {
    if (props.isOpen) {
      setProjectName('');
      setWidth(String(DEFAULT_CONFIG.width));
      setHeight(String(DEFAULT_CONFIG.height));
      setContainerClass(DEFAULT_CONFIG.containerClass);
      setProjectNameError(null);
      setWidthError(null);
      setHeightError(null);
      // Focus project name input if required, otherwise width input
      setTimeout(() => {
        if (props.requiresProjectName) {
          projectNameInputRef?.focus();
        } else {
          widthInputRef?.focus();
        }
      }, 0);
    }
  });

  const handleCreate = () => {
    let hasErrors = false;

    // Validate project name if required
    if (props.requiresProjectName) {
      const nameResult = validateProjectName(projectName());
      if (!nameResult.valid) {
        setProjectNameError(nameResult.error ?? 'Invalid project name');
        hasErrors = true;
      }
    }

    // Validate dimensions
    const results = validateDimensions(width(), height());

    if (!results.width.valid) {
      setWidthError(results.width.error ?? 'Invalid width');
      hasErrors = true;
    }
    if (!results.height.valid) {
      setHeightError(results.height.error ?? 'Invalid height');
      hasErrors = true;
    }

    if (hasErrors || !areDimensionsValid(results)) {
      return;
    }

    props.onCreate({
      width: results.width.value!,
      height: results.height.value!,
      containerClass: containerClass(),
      projectName: props.requiresProjectName ? projectName() : undefined,
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

  const handleProjectNameBlur = () => {
    if (props.requiresProjectName && projectName().trim()) {
      const result = validateProjectName(projectName());
      if (!result.valid) {
        setProjectNameError(result.error ?? 'Invalid project name');
      }
    }
  };

  const handleWidthBlur = () => {
    const result = validateDimension(width(), 'Width');
    if (!result.valid) {
      setWidthError(result.error ?? 'Invalid width');
    }
  };

  const handleHeightBlur = () => {
    const result = validateDimension(height(), 'Height');
    if (!result.valid) {
      setHeightError(result.error ?? 'Invalid height');
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
            <Show when={props.requiresProjectName}>
              <div class={styles.field}>
                <label class={styles.label} for="dialog-project-name">
                  Project Name
                </label>
                <input
                  id="dialog-project-name"
                  type="text"
                  class={`${styles.input} ${projectNameError() ? styles.inputError : ''}`}
                  data-testid="dialog-project-name-input"
                  value={projectName()}
                  onInput={(e) => {
                    setProjectName(e.currentTarget.value);
                    setProjectNameError(null);
                  }}
                  onBlur={handleProjectNameBlur}
                  onKeyDown={handleKeyDown}
                  ref={projectNameInputRef}
                  placeholder="Enter project name"
                />
                <Show when={projectNameError()}>
                  <span class={styles.error} data-testid="dialog-project-name-error">
                    {projectNameError()}
                  </span>
                </Show>
              </div>
            </Show>
            <div class={styles.field}>
              <label class={styles.label} for="dialog-width">
                Width
              </label>
              <input
                id="dialog-width"
                type="number"
                min="1"
                max="10000"
                class={`${styles.input} ${widthError() ? styles.inputError : ''}`}
                data-testid="dialog-width-input"
                value={width()}
                onInput={(e) => {
                  setWidth(e.currentTarget.value);
                  setWidthError(null);
                }}
                onBlur={handleWidthBlur}
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
                type="number"
                min="1"
                max="10000"
                class={`${styles.input} ${heightError() ? styles.inputError : ''}`}
                data-testid="dialog-height-input"
                value={height()}
                onInput={(e) => {
                  setHeight(e.currentTarget.value);
                  setHeightError(null);
                }}
                onBlur={handleHeightBlur}
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
