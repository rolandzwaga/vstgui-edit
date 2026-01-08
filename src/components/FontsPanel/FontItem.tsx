import { type Component, createSignal, Show } from 'solid-js';
import type { FontDefinition } from '../../types/uidesc';
import { getFonts, updateFontName } from '../../stores/documentStore';
import { pushOperation } from '../../stores/historyStore';
import { createEditFontNameOperation } from '../../domain/fonts/historyOperations';
import { validateFontName } from '../../domain/fonts/validation';
import { truncateFontName, summarizeFontProperties } from '../../domain/fonts/formatting';
import { FontPreview } from './FontPreview';
import styles from './FontItem.module.css';

export interface FontItemProps {
  name: string;
  fontDef: FontDefinition;
  isReadOnly?: boolean;
  onDelete?: (name: string) => void;
  usageCount?: number;
  onUsageClick?: (name: string) => void;
}

export const FontItem: Component<FontItemProps> = (props) => {
  const [editingName, setEditingName] = createSignal(false);
  const [nameInput, setNameInput] = createSignal('');
  const [nameError, setNameError] = createSignal<string | null>(null);
  const [isHovered, setIsHovered] = createSignal(false);

  const displayName = () => truncateFontName(props.name);
  const summary = () => summarizeFontProperties(props.fontDef);
  const needsTooltip = () => props.name.length > 30;

  const handleNameDblClick = () => {
    if (props.isReadOnly) return;
    setNameInput(props.name);
    setNameError(null);
    setEditingName(true);
  };

  const saveName = () => {
    const newName = nameInput().trim();

    if (newName === props.name) {
      setEditingName(false);
      return;
    }

    const existingFonts = getFonts() ?? {};
    const otherNames = Object.keys(existingFonts).filter((n) => n !== props.name);
    const validation = validateFontName(newName, otherNames);

    if (!validation.valid) {
      setNameError(validation.error ?? 'Invalid name');
      return;
    }

    const success = updateFontName(props.name, newName);
    if (success) {
      pushOperation(createEditFontNameOperation(props.name, newName));
    }
    setEditingName(false);
    setNameError(null);
  };

  const cancelNameEdit = () => {
    setEditingName(false);
    setNameError(null);
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

  const handleDelete = () => {
    props.onDelete?.(props.name);
  };

  return (
    <div
      class={`${styles.item} ${props.isReadOnly ? styles.readonly : ''}`}
      data-testid="font-item"
      title={needsTooltip() ? props.name : undefined}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <FontPreview
        fontName={props.fontDef['font-name']}
        fontSize={props.fontDef.size}
        bold={props.fontDef.bold === 'true'}
        italic={props.fontDef.italic === 'true'}
      />
      <div class={styles.info}>
        <Show
          when={editingName()}
          fallback={
            <span
              class={styles.name}
              data-testid="font-name"
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
              data-testid="font-name-input"
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
              <span class={styles.error} data-testid="font-name-error">
                {nameError()}
              </span>
            </Show>
          </div>
        </Show>
        <span class={styles.summary} data-testid="font-summary">
          {summary()}
        </span>
      </div>
      <Show when={props.usageCount && props.usageCount > 0}>
        <button
          type="button"
          class={styles.usageBadge}
          data-testid="usage-badge"
          aria-label={`${props.usageCount} ${props.usageCount === 1 ? 'usage' : 'usages'}`}
          onClick={() => props.onUsageClick?.(props.name)}
        >
          {props.usageCount}
        </button>
      </Show>
      <Show when={isHovered() && !props.isReadOnly && props.onDelete}>
        <button
          type="button"
          class={styles.deleteButton}
          data-testid="delete-font-button"
          aria-label={`Delete font ${props.name}`}
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
