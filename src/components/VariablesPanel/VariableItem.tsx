import { type Component, createSignal, Show } from 'solid-js';
import { getVariables, updateVariableName, updateVariableValue } from '../../stores/documentStore';
import { pushOperation } from '../../stores/historyStore';
import {
  createEditVariableNameOperation,
  createEditVariableValueOperation,
} from '../../domain/variables/historyOperations';
import { validateVariableName } from '../../domain/variables/validation';
import styles from './VariableItem.module.css';

export interface VariableItemProps {
  name: string;
  value: string;
  isReadOnly?: boolean;
  onDelete?: (name: string) => void;
  usageCount?: number;
  onUsageClick?: (name: string) => void;
}

export const VariableItem: Component<VariableItemProps> = (props) => {
  const [isHovered, setIsHovered] = createSignal(false);
  const [editingName, setEditingName] = createSignal(false);
  const [editingValue, setEditingValue] = createSignal(false);
  const [nameInput, setNameInput] = createSignal('');
  const [valueInput, setValueInput] = createSignal('');
  const [nameError, setNameError] = createSignal<string | null>(null);

  const handleDelete = (e: MouseEvent) => {
    e.stopPropagation();
    props.onDelete?.(props.name);
  };

  const handleNameDblClick = (e: MouseEvent) => {
    e.stopPropagation();
    if (props.isReadOnly) return;
    setNameInput(props.name);
    setNameError(null);
    setEditingName(true);
  };

  const handleValueClick = (e: MouseEvent) => {
    e.stopPropagation();
    if (props.isReadOnly) return;
    setValueInput(props.value);
    setEditingValue(true);
  };

  const saveName = () => {
    const newName = nameInput().trim();

    if (newName === props.name) {
      setEditingName(false);
      return;
    }

    const variables = getVariables() ?? {};
    const existingNames = Object.keys(variables);
    const validation = validateVariableName(newName, existingNames, props.name);

    if (!validation.valid) {
      setNameError(validation.error ?? 'Invalid name');
      return;
    }

    const success = updateVariableName(props.name, newName);
    if (success) {
      pushOperation(createEditVariableNameOperation(props.name, newName));
    }
    setEditingName(false);
    setNameError(null);
  };

  const saveValue = () => {
    const newValue = valueInput();

    if (newValue === props.value) {
      setEditingValue(false);
      return;
    }

    const oldValue = updateVariableValue(props.name, newValue);
    if (oldValue !== null) {
      pushOperation(createEditVariableValueOperation(props.name, oldValue, newValue));
    }
    setEditingValue(false);
  };

  const cancelNameEdit = () => {
    setEditingName(false);
    setNameError(null);
  };

  const cancelValueEdit = () => {
    setEditingValue(false);
  };

  const handleNameKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      saveName();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      cancelNameEdit();
    }
  };

  const handleValueKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      saveValue();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      cancelValueEdit();
    }
  };

  return (
    <div
      class={`${styles.item} ${props.isReadOnly ? styles.readonly : ''}`}
      data-testid="variable-item"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div class={styles.content}>
        <Show
          when={editingName()}
          fallback={
            <span
              class={styles.name}
              data-testid="variable-name"
              onDblClick={handleNameDblClick}
            >
              {props.name}
            </span>
          }
        >
          <div class={styles.editContainer}>
            <input
              type="text"
              class={`${styles.input} ${nameError() ? styles.inputError : ''}`}
              data-testid="variable-name-input"
              value={nameInput()}
              onInput={(e) => {
                setNameInput(e.currentTarget.value);
                setNameError(null);
              }}
              onKeyDown={handleNameKeyDown}
              onBlur={saveName}
              aria-invalid={!!nameError()}
              ref={(el) => setTimeout(() => el.focus(), 0)}
            />
            <Show when={nameError()}>
              <span class={styles.error} data-testid="variable-name-error">
                {nameError()}
              </span>
            </Show>
          </div>
        </Show>
        <Show
          when={editingValue()}
          fallback={
            <span
              class={styles.value}
              data-testid="variable-value"
              onClick={handleValueClick}
            >
              {props.value || <span class={styles.emptyValue}>(empty)</span>}
            </span>
          }
        >
          <div class={styles.editContainer}>
            <input
              type="text"
              class={styles.valueInput}
              data-testid="variable-value-input"
              value={valueInput()}
              onInput={(e) => setValueInput(e.currentTarget.value)}
              onKeyDown={handleValueKeyDown}
              onBlur={saveValue}
              ref={(el) => setTimeout(() => el.focus(), 0)}
            />
          </div>
        </Show>
      </div>
      <Show
        when={props.usageCount && props.usageCount > 0}
        fallback={
          <span class={styles.unusedBadge} data-testid="unused-badge" aria-label="Unused">
            0
          </span>
        }
      >
        <button
          type="button"
          class={styles.usageBadge}
          data-testid="usage-badge"
          aria-label={`${props.usageCount} ${props.usageCount === 1 ? 'usage' : 'usages'}`}
          onClick={(e) => {
            e.stopPropagation();
            props.onUsageClick?.(props.name);
          }}
        >
          {props.usageCount}
        </button>
      </Show>
      <Show when={isHovered() && !props.isReadOnly && props.onDelete}>
        <button
          type="button"
          class={styles.deleteButton}
          data-testid="delete-variable-button"
          aria-label={`Delete variable ${props.name}`}
          onClick={handleDelete}
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
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
  );
};
