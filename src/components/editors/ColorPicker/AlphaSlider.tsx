/**
 * AlphaSlider Component
 *
 * A horizontal slider for selecting alpha/opacity (0-255).
 * Displays a checkerboard pattern with a color gradient overlay.
 */

import type { Component, JSX } from 'solid-js';
import { createMemo, createSignal, onCleanup } from 'solid-js';
import { clamp, rgbaToHex } from '../../../domain/colorPicker';
import styles from './ColorPicker.module.css';

export interface AlphaSliderProps {
  /** Current alpha value (0-255) */
  value: number;
  /** Current RGB color (for gradient preview) */
  color: { r: number; g: number; b: number };
  /** Called when alpha changes */
  onChange: (value: number) => void;
  /** Called when editing is complete */
  onCommit: () => void;
  /** Disabled state */
  disabled?: boolean;
}

export const AlphaSlider: Component<AlphaSliderProps> = (props) => {
  const [isDragging, setIsDragging] = createSignal(false);
  let containerRef: HTMLDivElement | undefined;

  // Calculate alpha from mouse position
  const calculateFromPosition = (clientX: number): number => {
    if (!containerRef) return props.value;

    const rect = containerRef.getBoundingClientRect();
    const x = clamp(clientX - rect.left, 0, rect.width);
    return Math.round((x / rect.width) * 255);
  };

  // Handle mouse down - start dragging
  const handleMouseDown = (e: MouseEvent) => {
    if (props.disabled || e.button !== 0) return;
    e.preventDefault();

    const alpha = calculateFromPosition(e.clientX);
    props.onChange(alpha);
    setIsDragging(true);

    // Add document listeners for drag
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  // Handle mouse move during drag
  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging() || !containerRef) return;

    const alpha = calculateFromPosition(e.clientX);
    props.onChange(alpha);
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
  // 1% of 255 = 2.55 (round to 3), 10% = 25.5 (round to 26)
  const handleKeyDown: JSX.EventHandler<HTMLDivElement, KeyboardEvent> = (e) => {
    if (props.disabled) return;

    const step = e.shiftKey ? 26 : 3; // ~10% or ~1% of 255
    let newValue = props.value;

    switch (e.key) {
      case 'ArrowRight':
      case 'ArrowUp':
        e.preventDefault();
        newValue = clamp(props.value + step, 0, 255);
        break;
      case 'ArrowLeft':
      case 'ArrowDown':
        e.preventDefault();
        newValue = clamp(props.value - step, 0, 255);
        break;
      default:
        return;
    }

    props.onChange(newValue);
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
  const thumbPosition = createMemo(() => `${(props.value / 255) * 100}%`);

  // Get the opaque color for the gradient endpoint - must be a memo for reactivity
  const colorHex = createMemo(() => rgbaToHex(props.color.r, props.color.g, props.color.b, 255));

  return (
    <div
      ref={(el) => (containerRef = el)}
      data-testid="alpha-slider"
      class={styles.sliderContainer}
      role="slider"
      tabindex={props.disabled ? -1 : 0}
      aria-label="Alpha (opacity)"
      aria-valuemin={0}
      aria-valuemax={255}
      aria-valuenow={props.value}
      aria-valuetext={`${Math.round((props.value / 255) * 100)}% opacity`}
      aria-disabled={props.disabled ? 'true' : undefined}
      onMouseDown={handleMouseDown}
      onKeyDown={handleKeyDown}
      onKeyUp={handleKeyUp}
    >
      <div
        data-testid="alpha-track"
        class={`${styles.sliderTrack} ${styles.alphaTrack}`}
      >
        <div
          data-testid="alpha-gradient"
          class={styles.alphaGradient}
          style={{ '--alpha-color': colorHex() }}
        />
      </div>
      <div
        data-testid="alpha-thumb"
        class={styles.sliderThumb}
        style={{ left: thumbPosition() }}
      />
    </div>
  );
};
