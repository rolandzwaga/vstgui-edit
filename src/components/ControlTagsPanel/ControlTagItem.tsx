import { type Component, createSignal, Show } from 'solid-js';
import { getControlTags, updateControlTagName, updateControlTagId } from '../../stores/documentStore';
import { pushOperation } from '../../stores/historyStore';
import {
  createEditControlTagNameOperation,
  createEditControlTagIdOperation,
} from '../../domain/controlTags/historyOperations';
import { validateTagName, validateTagId } from '../../domain/controlTags/validation';
import styles from './ControlTagItem.module.css';

export interface ControlTagItemProps {
  name: string;
  tagId: string;
  isReadOnly?: boolean;
  onDelete?: (name: string) => void;
  usageCount?: number;
  onUsageClick?: (name: string) => void;
}

export const ControlTagItem: Component<ControlTagItemProps> = (props) => {
  const [isHovered, setIsHovered] = createSignal(false);
  const [editingName, setEditingName] = createSignal(false);
  const [editingId, setEditingId] = createSignal(false);
  const [nameInput, setNameInput] = createSignal('');
  const [idInput, setIdInput] = createSignal('');
  const [nameError, setNameError] = createSignal<string | null>(null);
  const [idError, setIdError] = createSignal<string | null>(null);

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

  const handleIdClick = (e: MouseEvent) => {
    e.stopPropagation();
    if (props.isReadOnly) return;
    setIdInput(props.tagId);
    setIdError(null);
    setEditingId(true);
  };

  const saveName = () => {
    const newName = nameInput().trim();

    if (newName === props.name) {
      setEditingName(false);
      return;
    }

    const tags = getControlTags() ?? {};
    const existingNames = Object.keys(tags);
    const validation = validateTagName(newName, existingNames, props.name);

    if (!validation.valid) {
      setNameError(validation.error ?? 'Invalid name');
      return;
    }

    const success = updateControlTagName(props.name, newName);
    if (success) {
      pushOperation(createEditControlTagNameOperation(props.name, newName));
    }
    setEditingName(false);
    setNameError(null);
  };

  const saveId = () => {
    const newId = idInput().trim();

    if (newId === props.tagId) {
      setEditingId(false);
      return;
    }

    const tags = getControlTags() ?? {};
    const existingIds = Object.values(tags);
    const validation = validateTagId(newId, existingIds, props.tagId);

    if (!validation.valid) {
      setIdError(validation.error ?? 'Invalid ID');
      return;
    }

    const oldId = updateControlTagId(props.name, newId);
    if (oldId !== null) {
      pushOperation(createEditControlTagIdOperation(props.name, oldId, newId));
    }
    setEditingId(false);
    setIdError(null);
  };

  const cancelNameEdit = () => {
    setEditingName(false);
    setNameError(null);
  };

  const cancelIdEdit = () => {
    setEditingId(false);
    setIdError(null);
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

  const handleIdKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      saveId();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      cancelIdEdit();
    }
  };

  return (
    <div
      class={`${styles.item} ${props.isReadOnly ? styles.readonly : ''}`}
      data-testid="control-tag-item"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div class={styles.content}>
        <Show
          when={editingName()}
          fallback={
            <span
              class={styles.name}
              data-testid="control-tag-name"
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
              data-testid="control-tag-name-input"
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
              <span class={styles.error} data-testid="control-tag-name-error">
                {nameError()}
              </span>
            </Show>
          </div>
        </Show>
        <Show
          when={editingId()}
          fallback={
            <span
              class={styles.tagId}
              data-testid="control-tag-id"
              onClick={handleIdClick}
            >
              {props.tagId}
            </span>
          }
        >
          <div class={styles.editContainer}>
            <input
              type="text"
              class={`${styles.idInput} ${idError() ? styles.inputError : ''}`}
              data-testid="control-tag-id-input"
              value={idInput()}
              onInput={(e) => {
                setIdInput(e.currentTarget.value);
                setIdError(null);
              }}
              onKeyDown={handleIdKeyDown}
              onBlur={saveId}
              aria-invalid={!!idError()}
              ref={(el) => setTimeout(() => el.focus(), 0)}
            />
            <Show when={idError()}>
              <span class={styles.error} data-testid="control-tag-id-error">
                {idError()}
              </span>
            </Show>
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
          data-testid="delete-control-tag-button"
          aria-label={`Delete control tag ${props.name}`}
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
