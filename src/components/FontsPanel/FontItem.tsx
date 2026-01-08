import { type Component, createSignal, Show } from 'solid-js';
import type { FontDefinition } from '../../types/uidesc';
import { getFonts, updateFontName, updateFontProperty } from '../../stores/documentStore';
import { pushOperation } from '../../stores/historyStore';
import {
  createEditFontNameOperation,
  createEditFontPropertyOperation,
} from '../../domain/fonts/historyOperations';
import { validateFontName, validateFontSize } from '../../domain/fonts/validation';
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
  const [isExpanded, setIsExpanded] = createSignal(false);
  const [fontNameInput, setFontNameInput] = createSignal('');
  const [sizeInput, setSizeInput] = createSignal('');
  const [sizeError, setSizeError] = createSignal<string | null>(null);

  const displayName = () => truncateFontName(props.name);
  const summary = () => summarizeFontProperties(props.fontDef);
  const needsTooltip = () => props.name.length > 30;

  const handleNameDblClick = (e: MouseEvent) => {
    e.stopPropagation();
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

  const handleDelete = (e: MouseEvent) => {
    e.stopPropagation();
    props.onDelete?.(props.name);
  };

  const handleItemClick = () => {
    if (props.isReadOnly) return;
    if (editingName()) return;
    const newExpanded = !isExpanded();
    setIsExpanded(newExpanded);
    if (newExpanded) {
      setFontNameInput(props.fontDef['font-name']);
      setSizeInput(props.fontDef.size);
      setSizeError(null);
    }
  };

  const handleFontNameBlur = () => {
    const newValue = fontNameInput().trim();
    if (newValue === props.fontDef['font-name'] || !newValue) {
      setFontNameInput(props.fontDef['font-name']);
      return;
    }
    const oldValue = updateFontProperty(props.name, 'font-name', newValue);
    if (oldValue !== null) {
      pushOperation(
        createEditFontPropertyOperation(props.name, 'font-name', oldValue ?? '', newValue)
      );
    }
  };

  const handleSizeBlur = () => {
    const newValue = sizeInput().trim();
    if (newValue === props.fontDef.size) {
      return;
    }
    const validation = validateFontSize(newValue);
    if (!validation.valid) {
      setSizeError(validation.error ?? 'Invalid size');
      return;
    }
    setSizeError(null);
    const oldValue = updateFontProperty(props.name, 'size', newValue);
    if (oldValue !== null) {
      pushOperation(createEditFontPropertyOperation(props.name, 'size', oldValue ?? '', newValue));
    }
  };

  const handleSizeKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSizeBlur();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setSizeInput(props.fontDef.size);
      setSizeError(null);
    }
  };

  const handleBoldToggle = () => {
    const oldValue = props.fontDef.bold ?? 'false';
    const newValue = oldValue === 'true' ? 'false' : 'true';
    updateFontProperty(props.name, 'bold', newValue);
    pushOperation(createEditFontPropertyOperation(props.name, 'bold', oldValue, newValue));
  };

  const handleItalicToggle = () => {
    const oldValue = props.fontDef.italic ?? 'false';
    const newValue = oldValue === 'true' ? 'false' : 'true';
    updateFontProperty(props.name, 'italic', newValue);
    pushOperation(createEditFontPropertyOperation(props.name, 'italic', oldValue, newValue));
  };

  const handleUnderlineToggle = () => {
    const oldValue = props.fontDef.underline ?? 'false';
    const newValue = oldValue === 'true' ? 'false' : 'true';
    updateFontProperty(props.name, 'underline', newValue);
    pushOperation(createEditFontPropertyOperation(props.name, 'underline', oldValue, newValue));
  };

  const handleStrikeThroughToggle = () => {
    const oldValue = props.fontDef['strike-through'] ?? 'false';
    const newValue = oldValue === 'true' ? 'false' : 'true';
    updateFontProperty(props.name, 'strike-through', newValue);
    pushOperation(
      createEditFontPropertyOperation(props.name, 'strike-through', oldValue, newValue)
    );
  };

  return (
    <div
      class={`${styles.item} ${props.isReadOnly ? styles.readonly : ''} ${isExpanded() ? styles.expanded : ''}`}
      data-testid="font-item"
      title={needsTooltip() ? props.name : undefined}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div class={styles.header} onClick={handleItemClick}>
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
            <div class={styles.editContainer} onClick={(e) => e.stopPropagation()}>
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
        <span class={styles.expandIcon} data-testid="expand-icon">
          {isExpanded() ? '▲' : '▼'}
        </span>
      </div>

      <Show when={isExpanded()}>
        <div class={styles.properties} data-testid="font-properties">
          <div class={styles.propertyRow}>
            <label class={styles.propertyLabel}>Font</label>
            <input
              type="text"
              class={styles.propertyInput}
              data-testid="font-family-input"
              value={fontNameInput()}
              onInput={(e) => setFontNameInput(e.currentTarget.value)}
              onBlur={handleFontNameBlur}
            />
          </div>
          <div class={styles.propertyRow}>
            <label class={styles.propertyLabel}>Size</label>
            <div class={styles.sizeInputContainer}>
              <input
                type="text"
                class={`${styles.propertyInput} ${styles.sizeInput} ${sizeError() ? styles.inputError : ''}`}
                data-testid="font-size-input"
                value={sizeInput()}
                onInput={(e) => {
                  setSizeInput(e.currentTarget.value);
                  setSizeError(null);
                }}
                onBlur={handleSizeBlur}
                onKeyDown={handleSizeKeyDown}
              />
              <span class={styles.sizeUnit}>pt</span>
            </div>
            <Show when={sizeError()}>
              <span class={styles.error} data-testid="font-size-error">
                {sizeError()}
              </span>
            </Show>
          </div>
          <div class={styles.propertyRow}>
            <label class={styles.propertyLabel}>Style</label>
            <div class={styles.styleButtons}>
              <button
                type="button"
                class={`${styles.styleButton} ${props.fontDef.bold === 'true' ? styles.styleActive : ''}`}
                data-testid="bold-toggle"
                aria-pressed={props.fontDef.bold === 'true'}
                onClick={handleBoldToggle}
                title="Bold"
              >
                B
              </button>
              <button
                type="button"
                class={`${styles.styleButton} ${styles.italicButton} ${props.fontDef.italic === 'true' ? styles.styleActive : ''}`}
                data-testid="italic-toggle"
                aria-pressed={props.fontDef.italic === 'true'}
                onClick={handleItalicToggle}
                title="Italic"
              >
                I
              </button>
              <button
                type="button"
                class={`${styles.styleButton} ${styles.underlineButton} ${props.fontDef.underline === 'true' ? styles.styleActive : ''}`}
                data-testid="underline-toggle"
                aria-pressed={props.fontDef.underline === 'true'}
                onClick={handleUnderlineToggle}
                title="Underline"
              >
                U
              </button>
              <button
                type="button"
                class={`${styles.styleButton} ${styles.strikeButton} ${props.fontDef['strike-through'] === 'true' ? styles.styleActive : ''}`}
                data-testid="strike-toggle"
                aria-pressed={props.fontDef['strike-through'] === 'true'}
                onClick={handleStrikeThroughToggle}
                title="Strikethrough"
              >
                S
              </button>
            </div>
          </div>
        </div>
      </Show>
    </div>
  );
};
