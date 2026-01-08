import { type Component, createSignal, Show } from 'solid-js';
import { isValidTemplateName } from '../../domain/templates/validation';
import { getTemplateNames, renameTemplate } from '../../stores/documentStore';
import { pushOperation } from '../../stores/historyStore';
import { createRenameTemplateOperation } from '../../domain/templates/historyOperations';
import styles from './TemplateItem.module.css';

export interface TemplateItemProps {
  name: string;
  isActive: boolean;
  onClick: () => void;
  onDuplicate?: () => void;
  onDelete?: () => void;
  canDelete?: boolean;
}

export const TemplateItem: Component<TemplateItemProps> = (props) => {
  const [isEditing, setIsEditing] = createSignal(false);
  const [editValue, setEditValue] = createSignal('');
  const [error, setError] = createSignal<string | null>(null);
  const [isHovered, setIsHovered] = createSignal(false);

  const startEditing = () => {
    setEditValue(props.name);
    setError(null);
    setIsEditing(true);
  };

  const validateName = (value: string): string | null => {
    if (!value.trim()) return 'Name cannot be empty';
    if (!isValidTemplateName(value)) return 'Invalid name format';
    const existingNames = getTemplateNames();
    if (value !== props.name && existingNames.includes(value)) {
      return 'Name already exists';
    }
    return null;
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      commitEdit();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      cancelEdit();
    }
  };

  const commitEdit = () => {
    const newName = editValue().trim();
    const validationError = validateName(newName);

    if (validationError) {
      setError(validationError);
      return;
    }

    if (newName !== props.name) {
      const success = renameTemplate(props.name, newName);
      if (success) {
        pushOperation(createRenameTemplateOperation(props.name, newName));
      }
    }

    setIsEditing(false);
    setError(null);
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setError(null);
  };

  const handleBlur = () => {
    commitEdit();
  };

  const handleDoubleClick = (e: MouseEvent) => {
    e.stopPropagation();
    startEditing();
  };

  const handleClick = () => {
    if (!isEditing()) {
      props.onClick();
    }
  };

  const handleDuplicate = (e: MouseEvent) => {
    e.stopPropagation();
    props.onDuplicate?.();
  };

  const handleDelete = (e: MouseEvent) => {
    e.stopPropagation();
    props.onDelete?.();
  };

  return (
    <div
      class={`${styles.item} ${props.isActive ? styles.active : ''}`}
      onClick={handleClick}
      onDblClick={handleDoubleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      data-testid={`template-item-${props.name}`}
      role="option"
      aria-selected={props.isActive}
    >
      <Show
        when={isEditing()}
        fallback={<span class={styles.name}>{props.name}</span>}
      >
        <div class={styles.editContainer}>
          <input
            type="text"
            class={`${styles.input} ${error() ? styles.inputError : ''}`}
            value={editValue()}
            onInput={(e) => {
              setEditValue(e.currentTarget.value);
              setError(validateName(e.currentTarget.value));
            }}
            onKeyDown={handleKeyDown}
            onBlur={handleBlur}
            ref={(el) => setTimeout(() => el.focus(), 0)}
            data-testid="template-name-input"
          />
          <Show when={error()}>
            <span class={styles.error}>{error()}</span>
          </Show>
        </div>
      </Show>
      <Show when={isHovered() && !isEditing()}>
        <div class={styles.actions}>
          <Show when={props.onDuplicate}>
            <button
              type="button"
              class={styles.actionButton}
              data-testid="duplicate-template-button"
              aria-label={`Duplicate template ${props.name}`}
              onClick={handleDuplicate}
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 14 14"
                fill="none"
                aria-hidden="true"
              >
                <rect x="1" y="3" width="8" height="10" rx="1" stroke="currentColor" stroke-width="1.5" fill="none" />
                <path d="M5 3V2a1 1 0 011-1h6a1 1 0 011 1v8a1 1 0 01-1 1h-1" stroke="currentColor" stroke-width="1.5" fill="none" />
              </svg>
            </button>
          </Show>
          <Show when={props.onDelete && props.canDelete}>
            <button
              type="button"
              class={`${styles.actionButton} ${styles.deleteButton}`}
              data-testid="delete-template-button"
              aria-label={`Delete template ${props.name}`}
              onClick={handleDelete}
            >
              <svg
                width="12"
                height="12"
                viewBox="0 0 12 12"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M2 2l8 8M10 2l-8 8"
                  stroke="currentColor"
                  stroke-width="1.5"
                  stroke-linecap="round"
                />
              </svg>
            </button>
          </Show>
        </div>
      </Show>
    </div>
  );
};
