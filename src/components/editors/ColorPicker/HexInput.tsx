/**
 * HexInput Component
 *
 * A text input for entering hex color values.
 * Validates input, normalizes format, and provides error feedback.
 */

import type { Component, JSX } from 'solid-js';
import { createSignal, createEffect, createMemo, Show } from 'solid-js';
import { validateHexInput } from '../../../domain/colorPicker';
import styles from './ColorPicker.module.css';

export interface HexInputProps {
  /** Current hex value */
  value: string;
  /** Called when value changes (for live preview) */
  onChange: (value: string) => void;
  /** Called when edit is committed (Enter, blur) */
  onCommit: () => void;
  /** Called when edit is cancelled (Escape) */
  onCancel?: () => void;
  /** Disabled state */
  disabled?: boolean;
  /** External error message */
  error?: string | null;
  /** Placeholder text */
  placeholder?: string;
}

export const HexInput: Component<HexInputProps> = (props) => {
  const [localError, setLocalError] = createSignal<string | null>(null);
  const errorId = `hex-error-${Math.random().toString(36).slice(2, 9)}`;

  // Combined error: external error takes precedence
  const displayError = createMemo(() => props.error ?? localError());

  // Validate and normalize on commit
  const validateAndCommit = () => {
    const validation = validateHexInput(props.value);

    if (!validation.valid) {
      setLocalError(validation.error ?? 'Invalid color');
      return false;
    }

    setLocalError(null);

    // If normalized value differs, update it
    if (validation.normalized && validation.normalized !== props.value) {
      props.onChange(validation.normalized);
    }

    props.onCommit();
    return true;
  };

  // Handle input changes
  const handleInput: JSX.EventHandler<HTMLInputElement, InputEvent> = (e) => {
    if (props.disabled) return;

    const value = e.currentTarget.value;
    setLocalError(null);
    props.onChange(value);
  };

  // Handle key down
  const handleKeyDown: JSX.EventHandler<HTMLInputElement, KeyboardEvent> = (e) => {
    if (props.disabled) return;

    switch (e.key) {
      case 'Enter':
        e.preventDefault();
        validateAndCommit();
        break;
      case 'Escape':
        e.preventDefault();
        props.onCancel?.();
        break;
    }
  };

  // Handle blur
  const handleBlur: JSX.EventHandler<HTMLInputElement, FocusEvent> = () => {
    if (props.disabled) return;

    // Only commit if value is valid
    if (props.value) {
      validateAndCommit();
    }
  };

  return (
    <div class={styles.inputPanel}>
      <input
        type="text"
        class={`${styles.hexInput} ${displayError() ? styles.inputError : ''}`}
        value={props.value}
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        disabled={props.disabled}
        placeholder={props.placeholder ?? '#RRGGBBAA'}
        aria-label="Hex color value"
        aria-invalid={displayError() ? 'true' : undefined}
        aria-describedby={displayError() ? errorId : undefined}
        spellcheck={false}
        autocomplete="off"
      />
      <Show when={displayError()}>
        <span id={errorId} class={styles.errorMessage}>
          {displayError()}
        </span>
      </Show>
    </div>
  );
};
