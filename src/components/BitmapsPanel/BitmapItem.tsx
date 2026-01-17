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
import { normalizeBitmap } from '../../domain/bitmaps/thumbnail';
import { BitmapThumbnail } from './BitmapThumbnail';
import { NinepartEditor } from '../editors/NinepartEditor';
import styles from './BitmapItem.module.css';

export interface BitmapItemProps {
  name: string;
  bitmap: string | BitmapDefinition;
  /** Project ID for IndexedDB thumbnail lookup */
  projectId: string | null;
  isReadOnly?: boolean;
  onDelete?: (name: string) => void;
  usageCount?: number;
  onUsageClick?: (name: string) => void;
  /** Called when user selects a file to upload for this bitmap */
  onUpload?: (name: string, file: File) => void;
}

export const BitmapItem: Component<BitmapItemProps> = (props) => {
  let fileInputRef: HTMLInputElement | undefined;

  const [editingName, setEditingName] = createSignal(false);
  const [nameInput, setNameInput] = createSignal('');
  const [nameError, setNameError] = createSignal<string | null>(null);
  const [isHovered, setIsHovered] = createSignal(false);
  const [isExpanded, setIsExpanded] = createSignal(false);
  const [pathInput, setPathInput] = createSignal('');
  const [scaleFactorInput, setScaleFactorInput] = createSignal('');
  const [ninepartInput, setNinepartInput] = createSignal('');
  const [ninepartOriginal, setNinepartOriginal] = createSignal('');
  const [isUploading, setIsUploading] = createSignal(false);

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
      const ninepartValue = normalized['nineparttiled-offsets'] ?? '';
      setNinepartInput(ninepartValue);
      setNinepartOriginal(ninepartValue);
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

  const handleNinepartChange = (value: string) => {
    setNinepartInput(value);
    // Apply the change immediately for live preview
    updateBitmapProperty(props.name, 'nineparttiled-offsets', value);
  };

  const handleNinepartCommit = () => {
    const newValue = ninepartInput().trim();
    const oldValue = ninepartOriginal();
    if (newValue === oldValue) {
      return;
    }
    // Value already applied via onChange, just push the history operation
    pushOperation(
      createEditBitmapPropertyOperation(props.name, 'nineparttiled-offsets', oldValue, newValue)
    );
    // Update original for next edit
    setNinepartOriginal(newValue);
  };

  const handleNinepartCancel = () => {
    const oldValue = ninepartOriginal();
    setNinepartInput(oldValue);
    // Revert to original value
    updateBitmapProperty(props.name, 'nineparttiled-offsets', oldValue);
  };

  const handleUploadClick = (e: MouseEvent) => {
    e.stopPropagation();
    fileInputRef?.click();
  };

  const handleFileSelect = (e: Event) => {
    const input = e.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file && props.onUpload) {
      setIsUploading(true);
      props.onUpload(props.name, file);
      // Reset uploading state will be handled by parent after upload completes
      setIsUploading(false);
    }
    // Reset input so same file can be selected again
    input.value = '';
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
        <BitmapThumbnail
          bitmap={props.bitmap}
          bitmapName={props.name}
          projectId={props.projectId}
        />
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
          <div class={styles.uploadRow}>
            <input
              type="file"
              accept="image/png,image/jpeg,image/gif,image/bmp"
              class={styles.hiddenFileInput}
              ref={fileInputRef}
              onChange={handleFileSelect}
              data-testid="bitmap-file-input"
            />
            <button
              type="button"
              class={styles.uploadButton}
              onClick={handleUploadClick}
              disabled={props.isReadOnly || isUploading()}
              data-testid="bitmap-upload-button"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <path
                  d="M7 1v9M4 4l3-3 3 3M2 10v2h10v-2"
                  stroke="currentColor"
                  stroke-width="1.5"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
              <span>Upload Image</span>
            </button>
          </div>
          <div class={styles.propertyRow}>
            <label class={styles.propertyLabel}>Path</label>
            <span class={styles.pathValue} data-testid="bitmap-path-value" title={pathInput()}>
              {pathInput() || '(no file)'}
            </span>
          </div>
          <div class={styles.propertyRow}>
            <label class={styles.propertyLabel}>Scale</label>
            <input
              type="number"
              class={`${styles.propertyInput} ${styles.shortInput}`}
              data-testid="bitmap-scale-input"
              placeholder="1"
              min="1"
              step="1"
              value={scaleFactorInput()}
              onInput={(e) => setScaleFactorInput(e.currentTarget.value)}
              onBlur={handleScaleFactorBlur}
            />
          </div>
          <div class={styles.propertyRow}>
            <label class={styles.propertyLabel}>9-part</label>
            <div class={styles.ninepartEditorContainer} onClick={(e) => e.stopPropagation()}>
              <NinepartEditor
                value={ninepartInput()}
                onChange={handleNinepartChange}
                onCommit={handleNinepartCommit}
                onCancel={handleNinepartCancel}
                disabled={props.isReadOnly}
                attributeName={`bitmap-${props.name}-ninepart`}
              />
            </div>
          </div>
        </div>
      </Show>
    </div>
  );
};
