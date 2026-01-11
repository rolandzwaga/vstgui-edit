/**
 * SettingSelect Component
 *
 * A dropdown select for enum preferences.
 * Uses FloatingDropdown for positioning.
 */

import type { JSX } from 'solid-js';
import { createSignal, createEffect, For } from 'solid-js';
import { FloatingDropdown } from '../../common/FloatingDropdown';
import styles from './controls.module.css';

export interface SelectOption<T = string> {
  /** Option value */
  value: T;

  /** Display label */
  label: string;
}

export interface SettingSelectProps<T = string> {
  /** Unique ID for the select */
  id: string;

  /** Label text */
  label: string;

  /** Current value */
  value: T;

  /** Available options */
  options: SelectOption<T>[];

  /** Change handler */
  onChange: (value: T) => void;

  /** Whether the select is disabled */
  disabled?: boolean;
}

export const SettingSelect = <T extends string | number>(props: SettingSelectProps<T>) => {
  const [isOpen, setIsOpen] = createSignal(false);
  const [highlightedIndex, setHighlightedIndex] = createSignal(-1);
  let buttonRef: HTMLButtonElement | undefined;

  // Get display label for current value
  const currentLabel = () => {
    const option = props.options.find((o) => o.value === props.value);
    return option?.label ?? String(props.value);
  };

  const closeDropdown = () => {
    setIsOpen(false);
    buttonRef?.focus();
  };

  createEffect(() => {
    if (isOpen()) {
      // Reset highlight to current value
      const currentIndex = props.options.findIndex((o) => o.value === props.value);
      setHighlightedIndex(currentIndex);
    }
  });

  // Handle keyboard navigation
  const handleKeyDown: JSX.EventHandler<HTMLButtonElement, KeyboardEvent> = (e) => {
    if (props.disabled) return;

    switch (e.key) {
      case 'Enter':
      case ' ':
        e.preventDefault();
        if (!isOpen()) {
          setIsOpen(true);
        } else if (highlightedIndex() >= 0) {
          selectOption(props.options[highlightedIndex()].value);
        }
        break;
      case 'Escape':
        e.preventDefault();
        closeDropdown();
        break;
      case 'ArrowDown':
        e.preventDefault();
        if (!isOpen()) {
          setIsOpen(true);
        } else {
          setHighlightedIndex((i) => Math.min(i + 1, props.options.length - 1));
        }
        break;
      case 'ArrowUp':
        e.preventDefault();
        if (isOpen()) {
          setHighlightedIndex((i) => Math.max(i - 1, 0));
        }
        break;
    }
  };

  const selectOption = (value: typeof props.value) => {
    props.onChange(value);
    closeDropdown();
  };

  return (
    <div class={styles.settingRow}>
      <div class={styles.settingInfo}>
        <label id={`${props.id}-label`} class={styles.settingLabel}>
          {props.label}
        </label>
      </div>
      <div class={styles.selectWrapper}>
        <button
          ref={buttonRef}
          type="button"
          id={props.id}
          class={styles.selectButton}
          aria-haspopup="listbox"
          aria-expanded={isOpen()}
          aria-labelledby={`${props.id}-label`}
          disabled={props.disabled}
          onClick={() => !props.disabled && setIsOpen(!isOpen())}
          onKeyDown={handleKeyDown}
        >
          <span>{currentLabel()}</span>
          <svg
            class={`${styles.selectIcon} ${isOpen() ? styles.selectIconOpen : ''}`}
            viewBox="0 0 10 6"
            fill="none"
            stroke="currentColor"
            stroke-width="1.5"
          >
            <path d="M1 1l4 4 4-4" />
          </svg>
        </button>

        <FloatingDropdown
          isOpen={isOpen}
          onClose={closeDropdown}
          triggerRef={buttonRef}
          class={styles.selectDropdown}
        >
          <ul role="listbox" aria-labelledby={`${props.id}-label`}>
            <For each={props.options}>
              {(option, index) => (
                <li
                  role="option"
                  class={`${styles.selectOption} ${
                    option.value === props.value ? styles.selectOptionSelected : ''
                  } ${index() === highlightedIndex() ? styles.selectOptionHighlighted : ''}`}
                  aria-selected={option.value === props.value}
                  onClick={() => selectOption(option.value)}
                  onMouseEnter={() => setHighlightedIndex(index())}
                >
                  {option.label}
                </li>
              )}
            </For>
          </ul>
        </FloatingDropdown>
      </div>
    </div>
  );
};
