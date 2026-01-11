/**
 * SettingSlider Component
 *
 * A slider for numeric preferences with min/max constraints.
 */

import type { Component, JSX } from 'solid-js';
import { Show } from 'solid-js';
import styles from './controls.module.css';

export interface SettingSliderProps {
  /** Unique ID for the input */
  id: string;

  /** Label text */
  label: string;

  /** Current value */
  value: number;

  /** Minimum value */
  min: number;

  /** Maximum value */
  max: number;

  /** Change handler */
  onChange: (value: number) => void;

  /** Optional step value (default: 1) */
  step?: number;

  /** Optional unit to display (e.g., "px", "%") */
  unit?: string;

  /** Whether the slider is disabled */
  disabled?: boolean;
}

export const SettingSlider: Component<SettingSliderProps> = (props) => {
  const step = () => props.step ?? 1;

  const handleInput: JSX.EventHandler<HTMLInputElement, Event> = (e) => {
    const value = Number(e.currentTarget.value);
    props.onChange(value);
  };

  const displayValue = () => {
    if (props.unit) {
      return `${props.value} ${props.unit}`;
    }
    return String(props.value);
  };

  return (
    <div class={styles.settingRow}>
      <div class={styles.settingInfo}>
        <label for={props.id} class={styles.settingLabel}>
          {props.label}
        </label>
      </div>
      <div class={styles.sliderWrapper}>
        <input
          type="range"
          id={props.id}
          class={styles.slider}
          value={props.value}
          min={props.min}
          max={props.max}
          step={step()}
          onInput={handleInput}
          disabled={props.disabled}
          aria-valuemin={props.min}
          aria-valuemax={props.max}
          aria-valuenow={props.value}
        />
        <span class={styles.sliderValue}>{displayValue()}</span>
      </div>
    </div>
  );
};
