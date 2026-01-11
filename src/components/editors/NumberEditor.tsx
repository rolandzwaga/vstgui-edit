import type { Component, JSX } from 'solid-js';
import { Show, createMemo } from 'solid-js';
import type { NumberEditorProps } from '../../types/editors';
import sharedStyles from './editors.module.css';
import styles from './NumberEditor.module.css';

function getDecimalPlaces(step: number): number {
  const str = step.toString();
  const decimalIndex = str.indexOf('.');
  return decimalIndex === -1 ? 0 : str.length - decimalIndex - 1;
}

function roundToStep(value: number, step: number): number {
  const decimalPlaces = getDecimalPlaces(step);
  return Number(value.toFixed(decimalPlaces));
}

export const NumberEditor: Component<NumberEditorProps> = (props) => {
  const step = createMemo(() => props.step ?? 1);
  const numericValue = createMemo(() => Number.parseFloat(props.value) || 0);

  const isAtMax = createMemo(
    () => props.max !== undefined && numericValue() >= props.max
  );

  const isAtMin = createMemo(
    () => props.min !== undefined && numericValue() <= props.min
  );

  const incrementDisabled = createMemo(() => props.disabled || isAtMax());
  const decrementDisabled = createMemo(() => props.disabled || isAtMin());

  const adjustValue = (delta: number): string | null => {
    const current = numericValue();
    let newValue = roundToStep(current + delta, step());

    if (props.max !== undefined && newValue > props.max) {
      newValue = props.max;
    }
    if (props.min !== undefined && newValue < props.min) {
      newValue = props.min;
    }

    if (newValue === current) {
      return null;
    }

    return String(newValue);
  };

  const handleIncrement = () => {
    const newValue = adjustValue(step());
    if (newValue !== null) {
      props.onChange(newValue);
      props.onCommit();
    }
  };

  const handleDecrement = () => {
    const newValue = adjustValue(-step());
    if (newValue !== null) {
      props.onChange(newValue);
      props.onCommit();
    }
  };

  const handleInput: JSX.EventHandler<HTMLInputElement, InputEvent> = (e) => {
    props.onChange(e.currentTarget.value);
  };

  const handleKeyDown: JSX.EventHandler<HTMLInputElement, KeyboardEvent> = (e) => {
    if (e.key === 'Enter') {
      props.onCommit();
    } else if (e.key === 'Escape') {
      props.onCancel();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const newValue = adjustValue(step());
      if (newValue !== null) {
        props.onChange(newValue);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      const newValue = adjustValue(-step());
      if (newValue !== null) {
        props.onChange(newValue);
      }
    }
  };

  const handleBlur = () => {
    props.onCancel();
  };

  return (
    <div class={styles.wrapper}>
      <div class={styles.inputGroup}>
        <button
          type="button"
          class={styles.spinButton}
          onClick={handleDecrement}
          disabled={decrementDisabled()}
          aria-label="Decrement"
        >
          −
        </button>
        <input
          type="number"
          class={`${sharedStyles.editorInput} ${styles.numberInput} ${props.error ? sharedStyles.editorInputError : ''}`}
          value={props.value}
          onInput={handleInput}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          disabled={props.disabled}
          placeholder={props.placeholder}
          min={props.min}
          max={props.max}
          step={step()}
          aria-invalid={props.error ? 'true' : undefined}
          autofocus
        />
        <button
          type="button"
          class={styles.spinButton}
          onClick={handleIncrement}
          disabled={incrementDisabled()}
          aria-label="Increment"
        >
          +
        </button>
      </div>
      <Show when={props.error}>
        <span class={sharedStyles.errorMessage}>{props.error}</span>
      </Show>
    </div>
  );
};
