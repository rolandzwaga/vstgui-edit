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
}

export const TemplateItem: Component<TemplateItemProps> = (props) => {
  const [isEditing, setIsEditing] = createSignal(false);
  const [editValue, setEditValue] = createSignal('');
  const [error, setError] = createSignal<string | null>(null);

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

  return (
    <div
      class={`${styles.item} ${props.isActive ? styles.active : ''}`}
      onClick={handleClick}
      onDblClick={handleDoubleClick}
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
    </div>
  );
};
