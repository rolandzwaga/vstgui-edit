/**
 * AdvancedColorPicker Component
 *
 * The main color picker component that replaces the existing ColorPicker.
 * Supports popup and inline modes.
 */

import type { Component, JSX } from 'solid-js';
import { createSignal, createMemo, Show, createEffect, on } from 'solid-js';
import type { ColorValue, PickerMode, ColorSource } from '../../../types/colorPicker';
import {
  createColorValue,
  parseHexToRgba,
  rgbaToHex,
  getPredefinedColorHex,
  isPredefinedColorRef,
  addRecentColor,
} from '../../../domain/colorPicker';
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
  /** Display mode (default: 'popup') */
  mode?: PickerMode;
}

/**
 * Parse a value (hex, document color, or predefined) to ColorValue
 */
function parseValueToColorValue(
  value: string,
  documentColorValues?: Record<string, string>
): ColorValue {
  // Default to black if no value
  if (!value) {
    return createColorValue(0, 0, 0, 255);
  }

  // Check if it's a predefined color reference
  if (isPredefinedColorRef(value)) {
    const hex = getPredefinedColorHex(value);
    if (hex) {
      const rgba = parseHexToRgba(hex);
      if (rgba) {
        return createColorValue(rgba.r, rgba.g, rgba.b, rgba.a);
      }
    }
  }

  // Check if it's a document color name
  if (documentColorValues && documentColorValues[value]) {
    const rgba = parseHexToRgba(documentColorValues[value]);
    if (rgba) {
      return createColorValue(rgba.r, rgba.g, rgba.b, rgba.a);
    }
  }

  // Try to parse as hex
  if (value.startsWith('#') || /^[0-9A-Fa-f]{6,8}$/.test(value)) {
    const rgba = parseHexToRgba(value.startsWith('#') ? value : `#${value}`);
    if (rgba) {
      return createColorValue(rgba.r, rgba.g, rgba.b, rgba.a);
    }
  }

  // Default to black
  return createColorValue(0, 0, 0, 255);
}

export const AdvancedColorPicker: Component<AdvancedColorPickerProps> = (props) => {
  const [isOpen, setIsOpen] = createSignal(false);
  const [originalValue, setOriginalValue] = createSignal<ColorValue | null>(null);
  let buttonRef: HTMLButtonElement | undefined;

  // Parse current value to ColorValue
  const currentColor = createMemo(() =>
    parseValueToColorValue(props.value, props.documentColorValues)
  );

  // Store original value when opening
  createEffect(on(
    () => isOpen(),
    (open) => {
      if (open) {
        setOriginalValue(currentColor());
      }
    }
  ));

  // Get display value (what shows in the trigger button)
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

  // Handle color change from core
  const handleColorChange = (color: ColorValue, source: ColorSource) => {
    // Output as 8-digit hex
    const hex = rgbaToHex(color.r, color.g, color.b, color.a);
    props.onChange(hex);
  };

  // Handle commit
  const handleCommit = () => {
    // Add to recent colors
    const color = currentColor();
    const hex = rgbaToHex(color.r, color.g, color.b, color.a);
    addRecentColor(hex);

    props.onCommit();
    setIsOpen(false);
  };

  // Handle cancel
  const handleCancel = () => {
    // Revert to original value
    if (originalValue()) {
      const orig = originalValue()!;
      const hex = rgbaToHex(orig.r, orig.g, orig.b, orig.a);
      props.onChange(hex);
    }
    props.onCancel();
    setIsOpen(false);
  };

  // Handle trigger click
  const handleTriggerClick = () => {
    if (props.disabled) return;
    setIsOpen(!isOpen());
  };

  // Handle key down on trigger
  const handleTriggerKeyDown: JSX.EventHandler<HTMLButtonElement, KeyboardEvent> = (e) => {
    if (props.disabled) return;

    switch (e.key) {
      case 'Enter':
      case ' ':
      case 'ArrowDown':
        e.preventDefault();
        setIsOpen(true);
        break;
      case 'Escape':
        if (isOpen()) {
          e.preventDefault();
          handleCancel();
        } else {
          props.onCancel();
        }
        break;
    }
  };

  // Inline mode
  if (props.mode === 'inline') {
    return (
      <ColorPickerCore
        value={currentColor()}
        originalValue={originalValue() ?? currentColor()}
        onChange={handleColorChange}
        onCommit={handleCommit}
        documentColors={props.documentColors}
        documentColorValues={props.documentColorValues}
        disabled={props.disabled}
      />
    );
  }

  // Popup mode (default)
  return (
    <div class={styles.wrapper}>
      <button
        ref={buttonRef}
        type="button"
        class={styles.popupTrigger}
        onClick={handleTriggerClick}
        onKeyDown={handleTriggerKeyDown}
        disabled={props.disabled}
        aria-expanded={isOpen()}
        aria-haspopup="dialog"
        data-testid="color-picker-trigger"
      >
        <div class={styles.triggerSwatch}>
          <div
            class={styles.triggerColor}
            style={{ 'background-color': swatchColor() }}
          />
        </div>
        <span class={styles.triggerValue}>{displayValue()}</span>
      </button>

      <FloatingDropdown
        isOpen={isOpen}
        onClose={handleCancel}
        triggerRef={buttonRef}
        class={styles.popupDropdown}
      >
        <ColorPickerCore
          value={currentColor()}
          originalValue={originalValue() ?? currentColor()}
          onChange={handleColorChange}
          onCommit={handleCommit}
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
