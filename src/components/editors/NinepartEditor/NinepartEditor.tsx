/**
 * NinepartEditor Component
 *
 * A specialized editor for the VSTGUI nineparttiled-offsets property.
 * Shows a visual diagram in a dropdown with four numeric inputs
 * positioned around a central rectangle representing the 9-part grid.
 * Format: "top, left, bottom, right" (comma-separated integers)
 */

import type { Component, JSX } from 'solid-js';
import { createMemo, createSignal } from 'solid-js';
import type { EditorProps } from '../../../types/editors';
import { FloatingDropdown } from '../../common/FloatingDropdown';
import {
  isNinepartEditorOpen,
  openNinepartEditorDropdown,
  closeNinepartEditorDropdown,
} from '../../../stores/ninepartEditorStore';
import styles from './NinepartEditor.module.css';

/** Parse comma-separated offsets into an object */
interface NinepartOffsets {
  top: number;
  left: number;
  bottom: number;
  right: number;
}

const parseOffsets = (value: string): NinepartOffsets => {
  const parts = value.split(',').map((s) => s.trim());
  return {
    top: parseInt(parts[0], 10) || 0,
    left: parseInt(parts[1], 10) || 0,
    bottom: parseInt(parts[2], 10) || 0,
    right: parseInt(parts[3], 10) || 0,
  };
};

/** Serialize offsets back to comma-separated string (empty if all zeros) */
const serializeOffsets = (offsets: NinepartOffsets): string => {
  if (offsets.top === 0 && offsets.left === 0 && offsets.bottom === 0 && offsets.right === 0) {
    return '';
  }
  return `${offsets.top}, ${offsets.left}, ${offsets.bottom}, ${offsets.right}`;
};

/** Get compact display value for trigger */
const getDisplayValue = (value: string): string => {
  if (!value || !value.trim()) return '(none)';
  const offsets = parseOffsets(value);
  // Show as T L B R for compactness
  return `${offsets.top}, ${offsets.left}, ${offsets.bottom}, ${offsets.right}`;
};

export interface NinepartEditorProps extends EditorProps {
  /** Attribute name for tracking open state across remounts */
  attributeName?: string;
}

export const NinepartEditor: Component<NinepartEditorProps> = (props) => {
  let triggerRef: HTMLButtonElement | undefined;

  // Use store-based open state to survive component remounts
  const attrName = () => props.attributeName ?? 'nineparttiled-offsets';
  const isOpen = () => isNinepartEditorOpen(attrName());

  // Parse current value to offsets object
  const currentOffsets = createMemo(() => parseOffsets(props.value));

  // Local input states for controlled inputs
  const [topInput, setTopInput] = createSignal('');
  const [leftInput, setLeftInput] = createSignal('');
  const [bottomInput, setBottomInput] = createSignal('');
  const [rightInput, setRightInput] = createSignal('');

  // Sync inputs when dropdown opens or value changes externally
  const syncInputs = () => {
    const offsets = currentOffsets();
    setTopInput(String(offsets.top));
    setLeftInput(String(offsets.left));
    setBottomInput(String(offsets.bottom));
    setRightInput(String(offsets.right));
  };

  // Get display text for trigger
  const displayValue = createMemo(() => {
    if (props.placeholder && !props.value) {
      return props.placeholder;
    }
    return getDisplayValue(props.value);
  });

  const openDropdown = () => {
    if (props.disabled) return;
    syncInputs();
    openNinepartEditorDropdown(attrName());
  };

  const closeDropdown = () => {
    closeNinepartEditorDropdown();
  };

  const handleTriggerClick = () => {
    if (props.disabled) return;
    if (isOpen()) {
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
        if (isOpen()) {
          e.preventDefault();
          closeDropdown();
        } else {
          props.onCancel();
        }
        break;
    }
  };

  // Update a specific offset and notify parent
  const updateOffset = (key: keyof NinepartOffsets, value: string) => {
    const numValue = parseInt(value, 10) || 0;
    const offsets = { ...currentOffsets(), [key]: Math.max(0, numValue) };
    props.onChange(serializeOffsets(offsets));
  };

  // Handle input change for a specific field
  const handleInputChange = (key: keyof NinepartOffsets, value: string) => {
    // Update local input state
    switch (key) {
      case 'top':
        setTopInput(value);
        break;
      case 'left':
        setLeftInput(value);
        break;
      case 'bottom':
        setBottomInput(value);
        break;
      case 'right':
        setRightInput(value);
        break;
    }
    // Update parent with parsed value
    updateOffset(key, value);
  };

  // Commit changes and close dropdown
  const handleDone = () => {
    props.onCommit();
    closeDropdown();
  };

  // When clicking outside, also commit any changes
  const handleClose = () => {
    props.onCommit();
    closeDropdown();
  };

  return (
    <div class={styles.wrapper}>
      {/* Trigger Button */}
      <button
        ref={triggerRef}
        type="button"
        class={styles.trigger}
        classList={{ [styles.error]: !!props.error }}
        onClick={handleTriggerClick}
        onKeyDown={handleTriggerKeyDown}
        disabled={props.disabled}
        aria-expanded={isOpen()}
        aria-haspopup="dialog"
        data-testid="ninepart-editor-trigger"
      >
        <span class={styles.value}>{displayValue()}</span>
        <span class={styles.indicator}>&#9662;</span>
      </button>

      {/* Visual 9-Part Diagram Dropdown */}
      <FloatingDropdown
        isOpen={isOpen}
        onClose={handleClose}
        triggerRef={triggerRef}
        class={styles.dropdown}
      >
        <div
          class={styles.diagram}
          data-testid="ninepart-diagram"
          onMouseDown={(e) => e.stopPropagation()}
        >
          {/* Top input */}
          <div class={styles.inputRow}>
            <input
              type="number"
              class={styles.offsetInput}
              value={topInput()}
              onInput={(e) => handleInputChange('top', e.currentTarget.value)}
              min="0"
              placeholder="0"
              aria-label="Top offset"
              data-testid="ninepart-top"
            />
          </div>

          {/* Middle row: Left + Rectangle + Right */}
          <div class={styles.middleRow}>
            <input
              type="number"
              class={styles.offsetInput}
              value={leftInput()}
              onInput={(e) => handleInputChange('left', e.currentTarget.value)}
              min="0"
              placeholder="0"
              aria-label="Left offset"
              data-testid="ninepart-left"
            />
            <div class={styles.gridPreview}>
              <div class={styles.gridCenter} />
            </div>
            <input
              type="number"
              class={styles.offsetInput}
              value={rightInput()}
              onInput={(e) => handleInputChange('right', e.currentTarget.value)}
              min="0"
              placeholder="0"
              aria-label="Right offset"
              data-testid="ninepart-right"
            />
          </div>

          {/* Bottom input */}
          <div class={styles.inputRow}>
            <input
              type="number"
              class={styles.offsetInput}
              value={bottomInput()}
              onInput={(e) => handleInputChange('bottom', e.currentTarget.value)}
              min="0"
              placeholder="0"
              aria-label="Bottom offset"
              data-testid="ninepart-bottom"
            />
          </div>

          {/* Done button */}
          <button
            type="button"
            class={styles.doneButton}
            onClick={handleDone}
            data-testid="ninepart-done"
          >
            Done
          </button>
        </div>
      </FloatingDropdown>
    </div>
  );
};
