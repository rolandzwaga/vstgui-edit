/**
 * HueSlider Component
 *
 * A horizontal slider for selecting hue (0-360 degrees).
 * Displays a rainbow gradient background.
 */

import type { Component, JSX } from 'solid-js';
import { createMemo, createSignal, onCleanup } from 'solid-js';
import { clamp } from '../../../domain/colorPicker';
import styles from './ColorPicker.module.css';

export interface HueSliderProps {
  /** Current hue value (0-360) */
  value: number;
  /** Called when hue changes */
  onChange: (value: number) => void;
  /** Called when editing is complete */
  onCommit: () => void;
  /** Disabled state */
  disabled?: boolean;
}

export const HueSlider: Component<HueSliderProps> = (props) => {
  const [isDragging, setIsDragging] = createSignal(false);
  let containerRef: HTMLDivElement | undefined;

  // Calculate hue from mouse position
  const calculateFromPosition = (clientX: number): number => {
    if (!containerRef) return props.value;

    const rect = containerRef.getBoundingClientRect();
    const x = clamp(clientX - rect.left, 0, rect.width);
    return Math.round((x / rect.width) * 360);
  };

  // Handle mouse down - start dragging
  const handleMouseDown = (e: MouseEvent) => {
    if (props.disabled || e.button !== 0) return;
    e.preventDefault();

    const hue = calculateFromPosition(e.clientX);
    props.onChange(hue);
    setIsDragging(true);

    // Add document listeners for drag
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  // Handle mouse move during drag
  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging() || !containerRef) return;

    const hue = calculateFromPosition(e.clientX);
    props.onChange(hue);
  };

  // Handle mouse up - end dragging
  const handleMouseUp = () => {
    if (isDragging()) {
      setIsDragging(false);
      props.onCommit();
    }
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  };

  // Handle keyboard navigation
  // 1% of 360 = 3.6 degrees, 10% = 36 degrees
  const handleKeyDown: JSX.EventHandler<HTMLDivElement, KeyboardEvent> = (e) => {
    if (props.disabled) return;

    const step = e.shiftKey ? 36 : 3.6; // 10% or 1% of 360
    let newValue = props.value;

    switch (e.key) {
      case 'ArrowRight':
      case 'ArrowUp':
        e.preventDefault();
        newValue = clamp(props.value + step, 0, 360);
        break;
      case 'ArrowLeft':
      case 'ArrowDown':
        e.preventDefault();
        newValue = clamp(props.value - step, 0, 360);
        break;
      default:
        return;
    }

    props.onChange(Math.round(newValue * 10) / 10);
  };

  const handleKeyUp: JSX.EventHandler<HTMLDivElement, KeyboardEvent> = (e) => {
    if (props.disabled) return;

    if (['ArrowRight', 'ArrowLeft', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
      props.onCommit();
    }
  };

  // Cleanup on unmount
  onCleanup(() => {
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  });

  // Calculate thumb position - must be a memo for reactivity
  const thumbPosition = createMemo(() => `${(props.value / 360) * 100}%`);

  return (
    <div
      ref={(el) => (containerRef = el)}
      data-testid="hue-slider"
      class={styles.sliderContainer}
      role="slider"
      tabindex={props.disabled ? -1 : 0}
      aria-label="Hue"
      aria-valuemin={0}
      aria-valuemax={360}
      aria-valuenow={Math.round(props.value)}
      aria-valuetext={`${Math.round(props.value)} degrees`}
      aria-disabled={props.disabled ? 'true' : undefined}
      onMouseDown={handleMouseDown}
      onKeyDown={handleKeyDown}
      onKeyUp={handleKeyUp}
    >
      <div
        data-testid="hue-track"
        class={`${styles.sliderTrack} ${styles.hueTrack}`}
      />
      <div
        data-testid="hue-thumb"
        class={styles.sliderThumb}
        style={{ left: thumbPosition() }}
      />
    </div>
  );
};
