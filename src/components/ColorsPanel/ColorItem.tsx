import { type Component, createSignal, Show } from 'solid-js';
import { getColors, updateColorName, updateColorValue } from '../../stores/documentStore';
import { pushOperation } from '../../stores/historyStore';
import {
  createEditColorNameOperation,
  createEditColorValueOperation,
} from '../../domain/colors/historyOperations';
import { validateHexColor, validateColorName } from '../../domain/colors/validation';
import { ColorSwatch } from './ColorSwatch';
import { truncateColorName, formatColorForDisplay } from '../../domain/colors';
import styles from './ColorItem.module.css';

export interface ColorItemProps {
  name: string;
  value: string;
  isReadOnly?: boolean;
  onDelete?: (name: string) => void;
}

export const ColorItem: Component<ColorItemProps> = (props) => {
  const [editingName, setEditingName] = createSignal(false);
  const [editingValue, setEditingValue] = createSignal(false);
  const [nameInput, setNameInput] = createSignal('');
  const [valueInput, setValueInput] = createSignal('');
  const [nameError, setNameError] = createSignal<string | null>(null);
  const [valueError, setValueError] = createSignal<string | null>(null);
  const [isHovered, setIsHovered] = createSignal(false);

  const displayName = () => truncateColorName(props.name);
  const displayValue = () => formatColorForDisplay(props.value);
  const needsTooltip = () => props.name.length > 30;

  const previewColor = () => {
    if (editingValue()) {
      const validation = validateHexColor(valueInput());
      return validation.valid ? valueInput() : props.value;
    }
    return props.value;
  };

  const handleNameDblClick = () => {
    if (props.isReadOnly) return;
    setNameInput(props.name);
    setNameError(null);
    setEditingName(true);
  };

  const handleValueDblClick = () => {
    if (props.isReadOnly) return;
    setValueInput(props.value);
    setValueError(null);
    setEditingValue(true);
  };

  const saveName = () => {
    const newName = nameInput().trim();

    if (newName === props.name) {
      setEditingName(false);
      return;
    }

    const existingColors = getColors() ?? {};
    const otherNames = Object.keys(existingColors).filter((n) => n !== props.name);
    const validation = validateColorName(newName, otherNames);

    if (!validation.valid) {
      setNameError(validation.error ?? 'Invalid name');
      return;
    }

    const success = updateColorName(props.name, newName);
    if (success) {
      pushOperation(createEditColorNameOperation(props.name, newName));
    }
    setEditingName(false);
    setNameError(null);
  };

  const saveValue = () => {
    const newValue = valueInput().trim();

    if (newValue === props.value) {
      setEditingValue(false);
      return;
    }

    const validation = validateHexColor(newValue);
    if (!validation.valid) {
      setValueError(validation.error ?? 'Invalid hex color');
      return;
    }

    const oldValue = updateColorValue(props.name, newValue);
    if (oldValue !== null) {
      pushOperation(createEditColorValueOperation(props.name, oldValue, newValue));
    }
    setEditingValue(false);
    setValueError(null);
  };

  const cancelNameEdit = () => {
    setEditingName(false);
    setNameError(null);
  };

  const cancelValueEdit = () => {
    setEditingValue(false);
    setValueError(null);
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

  const handleDelete = () => {
    props.onDelete?.(props.name);
  };

  return (
    <div
      class={`${styles.item} ${props.isReadOnly ? styles.readonly : ''}`}
      data-testid="color-item"
      title={needsTooltip() ? props.name : undefined}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <ColorSwatch color={previewColor()} size="sm" />
      <div class={styles.info}>
        <Show
          when={editingName()}
          fallback={
            <span
              class={styles.name}
              data-testid="color-name"
              onDblClick={handleNameDblClick}
            >
              {displayName()}
            </span>
          }
        >
          <div class={styles.editContainer}>
            <input
              type="text"
              class={`${styles.input} ${nameError() ? styles.inputError : ''}`}
              data-testid="color-name-input"
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
              <span class={styles.error} data-testid="color-name-error">
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
              data-testid="color-value"
              onDblClick={handleValueDblClick}
            >
              {displayValue()}
            </span>
          }
        >
          <div class={styles.editContainer}>
            <input
              type="text"
              class={`${styles.input} ${styles.valueInput} ${valueError() ? styles.inputError : ''}`}
              data-testid="color-value-input"
              value={valueInput()}
              onInput={(e) => {
                setValueInput(e.currentTarget.value);
                setValueError(null);
              }}
              onKeyDown={handleValueKeyDown}
              onBlur={saveValue}
              aria-invalid={!!valueError()}
              ref={(el) => setTimeout(() => el.focus(), 0)}
            />
            <Show when={valueError()}>
              <span class={styles.error} data-testid="color-value-error">
                {valueError()}
              </span>
            </Show>
          </div>
        </Show>
      </div>
      <Show when={isHovered() && !props.isReadOnly && props.onDelete}>
        <button
          type="button"
          class={styles.deleteButton}
          data-testid="delete-color-button"
          aria-label={`Delete color ${props.name}`}
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
  );
};
