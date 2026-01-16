/**
 * AutosizeEditor Component
 *
 * A specialized editor for the VSTGUI autosize multi-flag property.
 * Shows a visual anchor diagram in a dropdown with clickable edge buttons.
 * Displays abbreviated flags (L R T B Row Col) when closed.
 */

import type { Component, JSX } from 'solid-js';
import { createMemo } from 'solid-js';
import type { EditorProps } from '../../../types/editors';
import { FloatingDropdown } from '../../common/FloatingDropdown';
import { AUTOSIZE_FLAGS } from '../../../domain/properties/attributeTypes';
import {
  isAutosizeEditorOpen,
  openAutosizeEditorDropdown,
  closeAutosizeEditorDropdown,
} from '../../../stores/autosizeEditorStore';
import styles from './AutosizeEditor.module.css';

/** Flag abbreviations for compact display */
const FLAG_ABBREV: Record<string, string> = {
  left: 'L',
  right: 'R',
  top: 'T',
  bottom: 'B',
  row: 'Row',
  column: 'Col',
};

/** Parse space-separated flags into a Set */
const parseFlags = (value: string): Set<string> =>
  new Set(value.split(/\s+/).filter(Boolean));

/** Serialize a Set of flags back to a space-separated string */
const serializeFlags = (flags: Set<string>): string =>
  AUTOSIZE_FLAGS.filter((f) => flags.has(f)).join(' ');

/** Get abbreviated display for current flags */
const getDisplayValue = (value: string): string => {
  const flags = parseFlags(value);
  if (flags.size === 0) return '(none)';
  return AUTOSIZE_FLAGS.filter((f) => flags.has(f))
    .map((f) => FLAG_ABBREV[f])
    .join(' ');
};

export interface AutosizeEditorProps extends EditorProps {
  /** Attribute name for tracking open state across remounts */
  attributeName?: string;
}

export const AutosizeEditor: Component<AutosizeEditorProps> = (props) => {
  let triggerRef: HTMLButtonElement | undefined;

  // Use store-based open state to survive component remounts
  const attrName = () => props.attributeName ?? 'autosize';
  const isOpen = () => isAutosizeEditorOpen(attrName());

  // Parse current value to set of flags
  const currentFlags = createMemo(() => parseFlags(props.value));

  // Get display text for trigger
  const displayValue = createMemo(() => {
    if (props.placeholder && !props.value) {
      return props.placeholder;
    }
    return getDisplayValue(props.value);
  });

  const openDropdown = () => {
    if (props.disabled) return;
    openAutosizeEditorDropdown(attrName());
  };

  const closeDropdown = () => {
    closeAutosizeEditorDropdown();
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

  // Toggle a flag (don't commit yet - wait for Done button)
  const toggleFlag = (flag: string) => {
    const flags = new Set(currentFlags());
    if (flags.has(flag)) {
      flags.delete(flag);
    } else {
      flags.add(flag);
    }
    const newValue = serializeFlags(flags);
    props.onChange(newValue);
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

  // Check if a flag is currently active
  const isActive = (flag: string) => currentFlags().has(flag);

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
        data-testid="autosize-editor-trigger"
      >
        <span class={styles.value}>{displayValue()}</span>
        <span class={styles.indicator}>&#9662;</span>
      </button>

      {/* Visual Anchor Diagram Dropdown */}
      <FloatingDropdown
        isOpen={isOpen}
        onClose={handleClose}
        triggerRef={triggerRef}
        class={styles.dropdown}
      >
        <div
          class={styles.diagram}
          data-testid="autosize-diagram"
          onMouseDown={(e) => e.stopPropagation()}
        >
          {/* Top edge button */}
          <div class={styles.edgeRow}>
            <button
              type="button"
              class={styles.edgeButton}
              classList={{ [styles.active]: isActive('top') }}
              onClick={() => toggleFlag('top')}
              aria-pressed={isActive('top')}
              data-testid="autosize-top"
              title="Top anchor"
            >
              T
            </button>
          </div>

          {/* Middle row: Left + Rectangle + Right */}
          <div class={styles.middleRow}>
            <button
              type="button"
              class={styles.edgeButton}
              classList={{ [styles.active]: isActive('left') }}
              onClick={() => toggleFlag('left')}
              aria-pressed={isActive('left')}
              data-testid="autosize-left"
              title="Left anchor"
            >
              L
            </button>
            <div class={styles.rectangle} />
            <button
              type="button"
              class={styles.edgeButton}
              classList={{ [styles.active]: isActive('right') }}
              onClick={() => toggleFlag('right')}
              aria-pressed={isActive('right')}
              data-testid="autosize-right"
              title="Right anchor"
            >
              R
            </button>
          </div>

          {/* Bottom edge button */}
          <div class={styles.edgeRow}>
            <button
              type="button"
              class={styles.edgeButton}
              classList={{ [styles.active]: isActive('bottom') }}
              onClick={() => toggleFlag('bottom')}
              aria-pressed={isActive('bottom')}
              data-testid="autosize-bottom"
              title="Bottom anchor"
            >
              B
            </button>
          </div>

          {/* Stretch options: Row and Column */}
          <div class={styles.stretchGroup}>
            <button
              type="button"
              class={styles.stretchButton}
              classList={{ [styles.active]: isActive('row') }}
              onClick={() => toggleFlag('row')}
              aria-pressed={isActive('row')}
              data-testid="autosize-row"
              title="Stretch horizontally"
            >
              Row
            </button>
            <button
              type="button"
              class={styles.stretchButton}
              classList={{ [styles.active]: isActive('column') }}
              onClick={() => toggleFlag('column')}
              aria-pressed={isActive('column')}
              data-testid="autosize-column"
              title="Stretch vertically"
            >
              Col
            </button>
          </div>

          {/* Done button */}
          <button
            type="button"
            class={styles.doneButton}
            onClick={handleDone}
            data-testid="autosize-done"
          >
            Done
          </button>
        </div>
      </FloatingDropdown>
    </div>
  );
};
