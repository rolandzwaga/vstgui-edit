import { type Component, createSignal, createMemo, Show } from 'solid-js';
import { getColors, updateColorName, updateColorValue } from '../../stores/documentStore';
import { pushOperation } from '../../stores/historyStore';
import {
  isColorPickerOpen,
  openColorPicker,
  closeColorPicker,
} from '../../stores/colorPickerOpenStore';
import {
  createEditColorNameOperation,
  createEditColorValueOperation,
} from '../../domain/colors/historyOperations';
import { validateColorName } from '../../domain/colors/validation';
import {
  createColorValue,
  parseHexToRgba,
  rgbaToHex,
  addRecentColor,
} from '../../domain/colorPicker';
import type { ColorValue, ColorSource } from '../../types/colorPicker';
import { FloatingDropdown } from '../common/FloatingDropdown';
import { ColorPickerCore } from '../editors/ColorPicker/ColorPickerCore';
import { ColorSwatch } from './ColorSwatch';
import { truncateColorName, formatColorForDisplay } from '../../domain/colors';
import styles from './ColorItem.module.css';
import pickerStyles from '../editors/ColorPicker/ColorPicker.module.css';

export interface ColorItemProps {
  name: string;
  value: string;
  isReadOnly?: boolean;
  onDelete?: (name: string) => void;
  usageCount?: number;
  onUsageClick?: (name: string) => void;
}

export const ColorItem: Component<ColorItemProps> = (props) => {
  const [editingName, setEditingName] = createSignal(false);
  const [nameInput, setNameInput] = createSignal('');
  const [nameError, setNameError] = createSignal<string | null>(null);
  const [isHovered, setIsHovered] = createSignal(false);

  // Color picker state
  const [workingColor, setWorkingColor] = createSignal<ColorValue | null>(null);
  let valueRef: HTMLSpanElement | undefined;

  // Use color name as unique identifier for picker store
  const pickerKey = () => `colors-panel-${props.name}`;
  const isPickerOpen = () => isColorPickerOpen(pickerKey());

  // Helper to parse hex to ColorValue
  const parseHexToColorValue = (hex: string): ColorValue => {
    const rgba = parseHexToRgba(hex);
    if (rgba) {
      return createColorValue(rgba.r, rgba.g, rgba.b, rgba.a);
    }
    // Default to red if parsing fails
    return createColorValue(255, 0, 0, 255);
  };

  // Current color as ColorValue
  const currentColorValue = createMemo(() => parseHexToColorValue(props.value));

  // Active color for picker (working color or current)
  const activeColorValue = createMemo(() => workingColor() ?? currentColorValue());

  const displayName = () => truncateColorName(props.name);
  const displayValue = () => formatColorForDisplay(props.value);
  const needsTooltip = () => props.name.length > 30;

  const previewColor = () => {
    // Show working color when picker is open
    if (isPickerOpen() && workingColor()) {
      const wc = workingColor()!;
      return rgbaToHex(wc.r, wc.g, wc.b, wc.a);
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
    // Open color picker instead of text input
    setWorkingColor(currentColorValue());
    openColorPicker(pickerKey(), props.value);
  };

  // === Color Picker Handlers ===

  const handlePickerChange = (color: ColorValue, _source: ColorSource) => {
    // Update working color for live preview
    setWorkingColor(color);
  };

  const handlePickerCommit = () => {
    const color = workingColor() ?? currentColorValue();
    const newValue = rgbaToHex(color.r, color.g, color.b, color.a);

    // Add to recent colors
    addRecentColor(newValue);

    // Save if changed
    if (newValue !== props.value) {
      const oldValue = updateColorValue(props.name, newValue);
      if (oldValue !== null) {
        pushOperation(createEditColorValueOperation(props.name, oldValue, newValue));
      }
    }

    // Close and reset
    setWorkingColor(null);
    closeColorPicker();
  };

  const handlePickerCancel = () => {
    // Close without saving
    setWorkingColor(null);
    closeColorPicker();
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
        <span
          ref={valueRef}
          class={styles.value}
          data-testid="color-value"
          onDblClick={handleValueDblClick}
        >
          {displayValue()}
        </span>

        {/* Color Picker Dropdown */}
        <FloatingDropdown
          isOpen={isPickerOpen}
          onClose={handlePickerCancel}
          triggerRef={valueRef}
          class={pickerStyles.advancedPickerDropdown}
        >
          <ColorPickerCore
            value={activeColorValue()}
            originalValue={currentColorValue()}
            onChange={handlePickerChange}
            onCommit={handlePickerCommit}
            documentColors={[]}
            documentColorValues={{}}
            disabled={props.isReadOnly}
          />
        </FloatingDropdown>
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
