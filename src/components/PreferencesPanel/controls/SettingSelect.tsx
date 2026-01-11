/**
 * SettingSelect Component
 *
 * A dropdown select for enum preferences.
 * Uses @floating-ui/dom for dropdown positioning.
 */

import type { Component, JSX } from 'solid-js';
import { createSignal, createEffect, onCleanup, For, Show } from 'solid-js';
import { computePosition, flip, shift, offset } from '@floating-ui/dom';
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

export const SettingSelect: Component<SettingSelectProps> = (props) => {
  const [isOpen, setIsOpen] = createSignal(false);
  const [highlightedIndex, setHighlightedIndex] = createSignal(-1);

  let buttonRef: HTMLButtonElement | undefined;
  let dropdownRef: HTMLUListElement | undefined;

  // Get display label for current value
  const currentLabel = () => {
    const option = props.options.find(o => o.value === props.value);
    return option?.label ?? String(props.value);
  };

  // Position dropdown using floating-ui
  const updatePosition = async () => {
    if (!buttonRef || !dropdownRef || !isOpen()) return;

    const { x, y } = await computePosition(buttonRef, dropdownRef, {
      placement: 'bottom-start',
      middleware: [offset(4), flip(), shift({ padding: 8 })],
    });

    Object.assign(dropdownRef.style, {
      left: `${x}px`,
      top: `${y}px`,
    });
  };

  createEffect(() => {
    if (isOpen()) {
      updatePosition();
      // Reset highlight to current value
      const currentIndex = props.options.findIndex(o => o.value === props.value);
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
        setIsOpen(false);
        buttonRef?.focus();
        break;
      case 'ArrowDown':
        e.preventDefault();
        if (!isOpen()) {
          setIsOpen(true);
        } else {
          setHighlightedIndex(i => Math.min(i + 1, props.options.length - 1));
        }
        break;
      case 'ArrowUp':
        e.preventDefault();
        if (isOpen()) {
          setHighlightedIndex(i => Math.max(i - 1, 0));
        }
        break;
    }
  };

  const handleDropdownKeyDown: JSX.EventHandler<HTMLUListElement, KeyboardEvent> = (e) => {
    switch (e.key) {
      case 'Enter':
      case ' ':
        e.preventDefault();
        if (highlightedIndex() >= 0) {
          selectOption(props.options[highlightedIndex()].value);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        buttonRef?.focus();
        break;
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(i => Math.min(i + 1, props.options.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(i => Math.max(i - 1, 0));
        break;
    }
  };

  const selectOption = (value: typeof props.value) => {
    props.onChange(value);
    setIsOpen(false);
    buttonRef?.focus();
  };

  // Close dropdown when clicking outside
  const handleClickOutside = (e: MouseEvent) => {
    if (
      isOpen() &&
      buttonRef &&
      dropdownRef &&
      !buttonRef.contains(e.target as Node) &&
      !dropdownRef.contains(e.target as Node)
    ) {
      setIsOpen(false);
    }
  };

  createEffect(() => {
    if (isOpen()) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
  });

  onCleanup(() => {
    document.removeEventListener('mousedown', handleClickOutside);
  });

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

        <Show when={isOpen()}>
          <ul
            ref={dropdownRef}
            role="listbox"
            class={styles.selectDropdown}
            aria-labelledby={`${props.id}-label`}
            onKeyDown={handleDropdownKeyDown}
            tabIndex={-1}
          >
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
        </Show>
      </div>
    </div>
  );
};
