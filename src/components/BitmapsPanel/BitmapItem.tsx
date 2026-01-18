import { type Component, createSignal, Show } from 'solid-js';
import type { BitmapDefinition, BitmapType } from '../../types/uidesc';
import { getBitmapType } from '../../types/uidesc';
import { getBitmaps, updateBitmapName, updateBitmapProperty } from '../../stores/documentStore';
import { pushOperation } from '../../stores/historyStore';
import {
  createEditBitmapNameOperation,
  createEditBitmapPropertyOperation,
  createBitmapTypeChangeOperation,
  getPropertiesToClearForTypeChange,
} from '../../domain/bitmaps/historyOperations';
import { validateBitmapName } from '../../domain/bitmaps/validation';
import { truncateBitmapName, formatBitmapForDisplay } from '../../domain/bitmaps/formatting';
import { normalizeBitmap } from '../../domain/bitmaps/thumbnail';
import { bitmapService } from '../../services/indexedDB/bitmapService';
import { BitmapThumbnail } from './BitmapThumbnail';
import { NinepartEditor } from '../editors/NinepartEditor';
import { MultiframeEditor } from '../editors/MultiframeEditor';
import styles from './BitmapItem.module.css';

/** Options for the bitmap type selector */
const BITMAP_TYPE_OPTIONS: { value: BitmapType; label: string }[] = [
  { value: 'standard', label: 'Standard' },
  { value: 'ninepart', label: '9-Part' },
  { value: 'multiframe', label: 'Multi-Frame' },
];

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
  /** Whether this bitmap is missing from IndexedDB storage */
  isMissing?: boolean;
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

  // Bitmap type state
  const [bitmapType, setBitmapType] = createSignal<BitmapType>('standard');

  // Multiframe state
  const [numFramesInput, setNumFramesInput] = createSignal('');
  const [numFramesOriginal, setNumFramesOriginal] = createSignal('');
  const [frameSizeInput, setFrameSizeInput] = createSignal('');
  const [frameSizeOriginal, setFrameSizeOriginal] = createSignal('');
  const [framesPerRowInput, setFramesPerRowInput] = createSignal('');
  const [framesPerRowOriginal, setFramesPerRowOriginal] = createSignal('');

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

      // Detect and set bitmap type
      const detectedType = getBitmapType(props.bitmap);
      setBitmapType(detectedType);

      // Set ninepart values
      const ninepartValue = normalized['nineparttiled-offsets'] ?? '';
      setNinepartInput(ninepartValue);
      setNinepartOriginal(ninepartValue);

      // Set multiframe values
      const numFrames = normalized['multiframe-num-frames'] ?? '';
      const frameSize = normalized['multiframe-size'] ?? '';
      const framesPerRow = normalized['mulitframe-frames-per-row'] ?? '';
      setNumFramesInput(numFrames);
      setNumFramesOriginal(numFrames);
      setFrameSizeInput(frameSize);
      setFrameSizeOriginal(frameSize);
      setFramesPerRowInput(framesPerRow);
      setFramesPerRowOriginal(framesPerRow);
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

  // Handle bitmap type change
  const handleTypeChange = async (newType: BitmapType) => {
    const currentType = bitmapType();
    if (currentType === newType) return;

    const normalized = normalizeBitmap(props.bitmap);
    const propertiesToClear = getPropertiesToClearForTypeChange(currentType, newType);
    const clearedProperties: Record<string, string> = {};

    // Capture and clear old type's properties
    for (const prop of propertiesToClear) {
      const value = normalized[prop as keyof typeof normalized];
      if (value && typeof value === 'string' && value.trim()) {
        clearedProperties[prop] = value;
        updateBitmapProperty(props.name, prop, '');
      }
    }

    // Create history operation if anything was cleared
    if (Object.keys(clearedProperties).length > 0) {
      pushOperation(
        createBitmapTypeChangeOperation({
          bitmapName: props.name,
          fromType: currentType,
          toType: newType,
          clearedProperties,
        })
      );
    }

    // Update local state
    setBitmapType(newType);

    // Clear local inputs for the old type
    if (currentType === 'ninepart') {
      setNinepartInput('');
      setNinepartOriginal('');
    } else if (currentType === 'multiframe') {
      setNumFramesInput('');
      setNumFramesOriginal('');
      setFrameSizeInput('');
      setFrameSizeOriginal('');
      setFramesPerRowInput('');
      setFramesPerRowOriginal('');
    }

    // Auto-calculate multiframe values when switching to multiframe type
    if (newType === 'multiframe' && props.projectId) {
      try {
        const storedBitmaps = await bitmapService.getByProject(props.projectId);
        const storedBitmap = storedBitmaps.find((b) => b.name === props.name);
        if (storedBitmap && storedBitmap.width > 0) {
          // Assume square frames based on bitmap width
          const frameWidth = storedBitmap.width;
          const frameHeight = frameWidth;
          const numFrames = Math.floor(storedBitmap.height / frameHeight);

          if (numFrames > 0) {
            const frameSizeValue = `${frameWidth}, ${frameHeight}`;
            const numFramesValue = String(numFrames);

            // Update local state
            setFrameSizeInput(frameSizeValue);
            setNumFramesInput(numFramesValue);

            // Apply to document
            updateBitmapProperty(props.name, 'multiframe-size', frameSizeValue);
            updateBitmapProperty(props.name, 'multiframe-num-frames', numFramesValue);
          }
        }
      } catch {
        // IndexedDB lookup failed, leave fields empty for manual entry
      }
    }
  };

  // Multiframe handlers
  const handleNumFramesChange = (value: string) => {
    setNumFramesInput(value);
    updateBitmapProperty(props.name, 'multiframe-num-frames', value);
  };

  const handleFrameSizeChange = (value: string) => {
    setFrameSizeInput(value);
    updateBitmapProperty(props.name, 'multiframe-size', value);
  };

  const handleFramesPerRowChange = (value: string) => {
    setFramesPerRowInput(value);
    updateBitmapProperty(props.name, 'mulitframe-frames-per-row', value);
  };

  const handleMultiframeCommit = () => {
    // Check each multiframe property for changes and push history operations
    const numFramesNew = numFramesInput().trim();
    const numFramesOld = numFramesOriginal();
    if (numFramesNew !== numFramesOld) {
      pushOperation(
        createEditBitmapPropertyOperation(
          props.name,
          'multiframe-num-frames',
          numFramesOld,
          numFramesNew
        )
      );
      setNumFramesOriginal(numFramesNew);
    }

    const frameSizeNew = frameSizeInput().trim();
    const frameSizeOld = frameSizeOriginal();
    if (frameSizeNew !== frameSizeOld) {
      pushOperation(
        createEditBitmapPropertyOperation(props.name, 'multiframe-size', frameSizeOld, frameSizeNew)
      );
      setFrameSizeOriginal(frameSizeNew);
    }

    const framesPerRowNew = framesPerRowInput().trim();
    const framesPerRowOld = framesPerRowOriginal();
    if (framesPerRowNew !== framesPerRowOld) {
      pushOperation(
        createEditBitmapPropertyOperation(
          props.name,
          'mulitframe-frames-per-row',
          framesPerRowOld,
          framesPerRowNew
        )
      );
      setFramesPerRowOriginal(framesPerRowNew);
    }
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
      class={`${styles.item} ${props.isReadOnly ? styles.readonly : ''} ${isExpanded() ? styles.expanded : ''} ${props.isMissing ? styles.missing : ''}`}
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
              <div class={styles.nameRow}>
                <span
                  class={styles.name}
                  data-testid="bitmap-name"
                  onDblClick={handleNameDblClick}
                >
                  {displayName()}
                </span>
                <Show when={props.isMissing}>
                  <span class={styles.missingBadge} data-testid="missing-badge">
                    Missing
                  </span>
                </Show>
              </div>
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
            <label class={styles.propertyLabel}>Type</label>
            <select
              class={styles.typeSelect}
              value={bitmapType()}
              onChange={(e) => handleTypeChange(e.currentTarget.value as BitmapType)}
              disabled={props.isReadOnly}
              onClick={(e) => e.stopPropagation()}
              data-testid="bitmap-type-selector"
            >
              {BITMAP_TYPE_OPTIONS.map((option) => (
                <option value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>
          <Show when={bitmapType() === 'ninepart'}>
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
          </Show>
          <Show when={bitmapType() === 'multiframe'}>
            <div class={styles.multiframeEditorContainer} onClick={(e) => e.stopPropagation()}>
              <MultiframeEditor
                numFrames={numFramesInput()}
                frameSize={frameSizeInput()}
                framesPerRow={framesPerRowInput()}
                onNumFramesChange={handleNumFramesChange}
                onFrameSizeChange={handleFrameSizeChange}
                onFramesPerRowChange={handleFramesPerRowChange}
                onCommit={handleMultiframeCommit}
                disabled={props.isReadOnly}
              />
            </div>
          </Show>
        </div>
      </Show>
    </div>
  );
};
