import { type Component, createSignal, Show } from 'solid-js';
import type { BitmapDefinition } from '../../types/uidesc';
import { getBitmaps, updateBitmapName, updateBitmapProperty } from '../../stores/documentStore';
import { pushOperation } from '../../stores/historyStore';
import {
  createEditBitmapNameOperation,
  createEditBitmapPropertyOperation,
} from '../../domain/bitmaps/historyOperations';
import { validateBitmapName } from '../../domain/bitmaps/validation';
import { truncateBitmapName, formatBitmapForDisplay } from '../../domain/bitmaps/formatting';
import { normalizeBitmap, getBitmapPath } from '../../domain/bitmaps/thumbnail';
import { BitmapThumbnail } from './BitmapThumbnail';
import styles from './BitmapItem.module.css';

export interface BitmapItemProps {
  name: string;
  bitmap: string | BitmapDefinition;
  isReadOnly?: boolean;
  onDelete?: (name: string) => void;
  usageCount?: number;
  onUsageClick?: (name: string) => void;
}

export const BitmapItem: Component<BitmapItemProps> = (props) => {
  const [editingName, setEditingName] = createSignal(false);
  const [nameInput, setNameInput] = createSignal('');
  const [nameError, setNameError] = createSignal<string | null>(null);
  const [isHovered, setIsHovered] = createSignal(false);
  const [isExpanded, setIsExpanded] = createSignal(false);
  const [pathInput, setPathInput] = createSignal('');
  const [scaleFactorInput, setScaleFactorInput] = createSignal('');
  const [ninepartInput, setNinepartInput] = createSignal('');

  const displayName = () => truncateBitmapName(props.name);
  const pathDisplay = () => formatBitmapForDisplay(props.bitmap);
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

    const existingBitmaps = getBitmaps() ?? {};
    const otherNames = Object.keys(existingBitmaps).filter((n) => n !== props.name);
    const validation = validateBitmapName(newName, otherNames);

    if (!validation.valid) {
      setNameError(validation.error ?? 'Invalid name');
      return;
    }

    const success = updateBitmapName(props.name, newName);
    if (success) {
      pushOperation(createEditBitmapNameOperation(props.name, newName));
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
      const normalized = normalizeBitmap(props.bitmap);
      setPathInput(normalized.path);
      setScaleFactorInput(normalized['scale-factor'] ?? '');
      setNinepartInput(normalized['nineparttiled-offsets'] ?? '');
    }
  };

  const handlePathBlur = () => {
    const newValue = pathInput().trim();
    const currentPath = getBitmapPath(props.bitmap);
    if (newValue === currentPath || !newValue) {
      setPathInput(currentPath);
      return;
    }
    const oldValue = updateBitmapProperty(props.name, 'path', newValue);
    if (oldValue !== null) {
      pushOperation(
        createEditBitmapPropertyOperation(props.name, 'path', oldValue ?? '', newValue)
      );
    }
  };

  const handleScaleFactorBlur = () => {
    const newValue = scaleFactorInput().trim();
    const normalized = normalizeBitmap(props.bitmap);
    const oldValue = normalized['scale-factor'] ?? '';
    if (newValue === oldValue) {
      return;
    }
    const result = updateBitmapProperty(props.name, 'scale-factor', newValue);
    if (result !== null) {
      pushOperation(
        createEditBitmapPropertyOperation(props.name, 'scale-factor', oldValue, newValue)
      );
    }
  };

  const handleNinepartBlur = () => {
    const newValue = ninepartInput().trim();
    const normalized = normalizeBitmap(props.bitmap);
    const oldValue = normalized['nineparttiled-offsets'] ?? '';
    if (newValue === oldValue) {
      return;
    }
    const result = updateBitmapProperty(props.name, 'nineparttiled-offsets', newValue);
    if (result !== null) {
      pushOperation(
        createEditBitmapPropertyOperation(props.name, 'nineparttiled-offsets', oldValue, newValue)
      );
    }
  };

  return (
    <div
      class={`${styles.item} ${props.isReadOnly ? styles.readonly : ''} ${isExpanded() ? styles.expanded : ''}`}
      data-testid="bitmap-item"
      title={needsTooltip() ? props.name : undefined}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div class={styles.header} onClick={handleItemClick}>
        <BitmapThumbnail bitmap={props.bitmap} />
        <div class={styles.info}>
          <Show
            when={editingName()}
            fallback={
              <span
                class={styles.name}
                data-testid="bitmap-name"
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
                data-testid="bitmap-name-input"
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
                <span class={styles.error} data-testid="bitmap-name-error">
                  {nameError()}
                </span>
              </Show>
            </div>
          </Show>
          <span class={styles.path} data-testid="bitmap-path">
            {pathDisplay()}
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
            data-testid="delete-bitmap-button"
            aria-label={`Delete bitmap ${props.name}`}
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
        <div class={styles.properties} data-testid="bitmap-properties">
          <div class={styles.propertyRow}>
            <label class={styles.propertyLabel}>Path</label>
            <input
              type="text"
              class={styles.propertyInput}
              data-testid="bitmap-path-input"
              value={pathInput()}
              onInput={(e) => setPathInput(e.currentTarget.value)}
              onBlur={handlePathBlur}
            />
          </div>
          <div class={styles.propertyRow}>
            <label class={styles.propertyLabel}>Scale</label>
            <input
              type="text"
              class={`${styles.propertyInput} ${styles.shortInput}`}
              data-testid="bitmap-scale-input"
              placeholder="1"
              value={scaleFactorInput()}
              onInput={(e) => setScaleFactorInput(e.currentTarget.value)}
              onBlur={handleScaleFactorBlur}
            />
          </div>
          <div class={styles.propertyRow}>
            <label class={styles.propertyLabel}>9-part</label>
            <input
              type="text"
              class={styles.propertyInput}
              data-testid="bitmap-ninepart-input"
              placeholder="top, left, bottom, right"
              value={ninepartInput()}
              onInput={(e) => setNinepartInput(e.currentTarget.value)}
              onBlur={handleNinepartBlur}
            />
          </div>
        </div>
      </Show>
    </div>
  );
};
