/**
 * ColorPicker Component
 *
 * Two-level color picker:
 * 1. Simple dropdown with document color swatches + "Custom Color..." button
 * 2. Advanced picker popup (opened from "Custom Color..." button)
 */

import type { Component, JSX } from 'solid-js';
import { createSignal, createMemo, Show, For, createEffect, on } from 'solid-js';
import type { ColorValue, ColorSource } from '../../../types/colorPicker';
import {
  createColorValue,
  parseHexToRgba,
  rgbaToHex,
  getPredefinedColorHex,
  isPredefinedColorRef,
  addRecentColor,
} from '../../../domain/colorPicker';
import {
  isColorPickerOpen,
  openColorPicker,
  closeColorPicker,
  getOriginalColorValue,
} from '../../../stores/colorPickerOpenStore';
import { FloatingDropdown } from '../../common/FloatingDropdown';
import { ColorPickerCore } from './ColorPickerCore';
import styles from './ColorPicker.module.css';

export interface AdvancedColorPickerProps {
  /** Current value (hex color, document color name, or predefined color ref) */
  value: string;
  /** Called on every value change (for live preview) */
  onChange: (newValue: string) => void;
  /** Called when edit is committed (Enter, blur, selection) */
  onCommit: () => void;
  /** Called when edit is cancelled (Escape) */
  onCancel: () => void;
  /** Whether the picker is disabled */
  disabled?: boolean;
  /** Validation error message to display */
  error?: string | null;
  /** Placeholder text */
  placeholder?: string;
  /** Available color names from document colors */
  documentColors: string[];
  /** Resolved hex values for document colors (for swatch preview) */
  documentColorValues?: Record<string, string>;
  /** Unique identifier for this picker instance (typically the attribute name) */
  attributeName?: string;
}

/**
 * Parse a value (hex, document color, or predefined) to ColorValue
 */
function parseValueToColorValue(
  value: string,
  documentColorValues?: Record<string, string>
): ColorValue {
  if (!value) {
    // Default to red (#FF0000FF) instead of black
    // Black/white have s=0 which makes hue slider changes invisible
    // Red at full saturation ensures all sliders start at meaningful positions
    return createColorValue(255, 0, 0, 255);
  }

  if (isPredefinedColorRef(value)) {
    const hex = getPredefinedColorHex(value);
    if (hex) {
      const rgba = parseHexToRgba(hex);
      if (rgba) {
        return createColorValue(rgba.r, rgba.g, rgba.b, rgba.a);
      }
    }
  }

  if (documentColorValues && documentColorValues[value]) {
    const rgba = parseHexToRgba(documentColorValues[value]);
    if (rgba) {
      return createColorValue(rgba.r, rgba.g, rgba.b, rgba.a);
    }
  }

  if (value.startsWith('#') || /^[0-9A-Fa-f]{6,8}$/.test(value)) {
    const rgba = parseHexToRgba(value.startsWith('#') ? value : `#${value}`);
    if (rgba) {
      return createColorValue(rgba.r, rgba.g, rgba.b, rgba.a);
    }
  }

  // Fallback to red for unparseable values
  return createColorValue(255, 0, 0, 255);
}

export const AdvancedColorPicker: Component<AdvancedColorPickerProps> = (props) => {
  // Level 1: Simple dropdown with swatches
  const [isDropdownOpen, setIsDropdownOpen] = createSignal(false);
  // Level 2: Advanced picker popup - use store to persist across remounts
  const isAdvancedOpen = () => {
    const attrName = props.attributeName ?? '__default__';
    return isColorPickerOpen(attrName);
  };
  // Working color state - maintains local state while picker is open
  const [workingColor, setWorkingColor] = createSignal<ColorValue | null>(null);
  // Track the pending commit value (color name for document/predefined colors, null for hex)
  const [pendingCommitString, setPendingCommitString] = createSignal<string | null>(null);

  let triggerRef: HTMLButtonElement | undefined;
  let customColorButtonRef: HTMLButtonElement | undefined;

  // Parse current value to ColorValue (for advanced picker)
  const currentColor = createMemo(() =>
    parseValueToColorValue(props.value, props.documentColorValues)
  );

  // Get original value from store (persists across remounts)
  const originalValue = createMemo(() => {
    const storedOriginal = getOriginalColorValue();
    if (storedOriginal) {
      return parseValueToColorValue(storedOriginal, props.documentColorValues);
    }
    return currentColor();
  });

  // Active color is working color (if set) or current color from props
  const activeColor = createMemo(() => workingColor() ?? currentColor());

  // Initialize working color when opening advanced picker
  createEffect(on(
    isAdvancedOpen,
    (open) => {
      if (open) {
        // Initialize working color from current value
        setWorkingColor(currentColor());
      } else {
        // Clear working color when closed
        setWorkingColor(null);
      }
    }
  ));

  // Get display value for trigger button
  const displayValue = createMemo(() => {
    if (props.placeholder && !props.value) {
      return props.placeholder;
    }
    return props.value || '';
  });

  // Get swatch color for trigger
  const swatchColor = createMemo(() => {
    const color = currentColor();
    return rgbaToHex(color.r, color.g, color.b, color.a);
  });

  // Check if value is a hex color (for display)
  const isHexValue = createMemo(() => {
    const val = props.value;
    return val && (val.startsWith('#') || /^[0-9A-Fa-f]{6,8}$/.test(val));
  });

  // === Level 1: Simple Dropdown Handlers ===

  const openDropdown = () => {
    // Don't open dropdown if disabled or advanced picker is already open
    if (props.disabled || isAdvancedOpen()) return;
    setIsDropdownOpen(true);
  };

  const closeDropdown = () => {
    setIsDropdownOpen(false);
  };

  const handleTriggerClick = () => {
    if (props.disabled) return;
    if (isDropdownOpen()) {
      closeDropdown();
    } else {
      openDropdown();
    }
  };

  const handleTriggerKeyDown: JSX.EventHandler<HTMLButtonElement, KeyboardEvent> = (e) => {
    if (props.disabled) return;

    switch (e.key) {
      case 'Enter':
      case ' ':
      case 'ArrowDown':
        e.preventDefault();
        openDropdown();
        break;
      case 'Escape':
        if (isDropdownOpen()) {
          e.preventDefault();
          closeDropdown();
        } else {
          props.onCancel();
        }
        break;
    }
  };

  // Select a document color from the dropdown
  const selectDocumentColor = (colorName: string) => {
    props.onChange(colorName);
    props.onCommit();
    closeDropdown();
  };

  // === Level 2: Advanced Picker Handlers ===

  const openAdvancedPicker = () => {
    closeDropdown(); // Close the simple dropdown first
    const attrName = props.attributeName ?? '__default__';
    openColorPicker(attrName, props.value);
  };

  const closeAdvancedPicker = () => {
    closeColorPicker();
  };

  // Handle color change from ColorPickerCore
  // IMPORTANT: We do NOT call props.onChange here to avoid triggering document updates
  // during drag operations. The document is only updated at commit time.
  const handleAdvancedColorChange = (color: ColorValue, source: ColorSource, originalString?: string) => {
    // Update local working color immediately for responsive UI
    setWorkingColor(color);

    // Track original string for document/predefined colors (to preserve color name on commit)
    if (originalString && (source === 'document-color' || source === 'predefined-color')) {
      setPendingCommitString(originalString);
    } else {
      setPendingCommitString(null);
    }
    // Don't call props.onChange - this prevents document updates during drag
  };

  // Handle commit from advanced picker
  const handleAdvancedCommit = () => {
    const color = workingColor() ?? currentColor();
    const hex = rgbaToHex(color.r, color.g, color.b, color.a);
    addRecentColor(hex);

    // Update document with either the original string (color name) or hex value
    const commitValue = pendingCommitString() ?? hex;
    props.onChange(commitValue);
    props.onCommit();

    // Reset and close
    setPendingCommitString(null);
    closeAdvancedPicker();
  };

  // Handle cancel from advanced picker
  const handleAdvancedCancel = () => {
    if (originalValue()) {
      const orig = originalValue()!;
      const hex = rgbaToHex(orig.r, orig.g, orig.b, orig.a);
      props.onChange(hex);
    }
    props.onCancel();
    closeAdvancedPicker();
  };

  return (
    <div class={styles.wrapper}>
      {/* Trigger Button */}
      <button
        ref={triggerRef}
        type="button"
        class={styles.trigger}
        onClick={handleTriggerClick}
        onKeyDown={handleTriggerKeyDown}
        disabled={props.disabled}
        aria-expanded={isDropdownOpen()}
        aria-haspopup="listbox"
        data-testid="color-picker-trigger"
      >
        <Show when={isHexValue()}>
          <span
            class={styles.dropdownTriggerSwatch}
            style={{ 'background-color': swatchColor() }}
          />
        </Show>
        <span class={styles.value}>{displayValue()}</span>
        <span class={styles.indicator}>&#9662;</span>
      </button>

      {/* Level 1: Simple Dropdown with Swatches */}
      <FloatingDropdown
        isOpen={isDropdownOpen}
        onClose={closeDropdown}
        triggerRef={triggerRef}
        class={styles.dropdown}
      >
        {/* Custom Color Button - First Item */}
        <button
          ref={customColorButtonRef}
          type="button"
          class={styles.customColorButton}
          onClick={openAdvancedPicker}
          data-testid="custom-color-button"
        >
          <span class={styles.customColorIcon}>&#127912;</span>
          <span>Custom Color...</span>
        </button>

        <Show when={props.documentColors.length > 0}>
          <div class={styles.divider} />

          {/* Document Color List */}
          <div role="listbox" class={styles.colorList}>
            <For each={props.documentColors}>
              {(colorName) => {
                const hexValue = () => props.documentColorValues?.[colorName];
                const isSelected = () => props.value === colorName;

                return (
                  <div
                    role="option"
                    class={`${styles.colorOption} ${isSelected() ? styles.selected : ''}`}
                    aria-selected={isSelected()}
                    onClick={() => selectDocumentColor(colorName)}
                    data-testid={`color-option-${colorName}`}
                  >
                    <Show when={hexValue()}>
                      <span
                        class={styles.optionSwatch}
                        style={{ 'background-color': hexValue() }}
                      />
                    </Show>
                    <span class={styles.optionName}>{colorName}</span>
                  </div>
                );
              }}
            </For>
          </div>
        </Show>
      </FloatingDropdown>

      {/* Level 2: Advanced Color Picker Popup */}
      <FloatingDropdown
        isOpen={isAdvancedOpen}
        onClose={handleAdvancedCancel}
        triggerRef={triggerRef}
        class={styles.advancedPickerDropdown}
      >
        <ColorPickerCore
          value={activeColor()}
          originalValue={originalValue() ?? currentColor()}
          onChange={handleAdvancedColorChange}
          onCommit={handleAdvancedCommit}
          documentColors={props.documentColors}
          documentColorValues={props.documentColorValues}
          disabled={props.disabled}
        />
      </FloatingDropdown>
    </div>
  );
};

// Export as ColorPicker for backward compatibility
export { AdvancedColorPicker as ColorPicker };
