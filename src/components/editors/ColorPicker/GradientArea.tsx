/**
 * GradientArea Component
 *
 * A 2D gradient picker for saturation and brightness selection.
 * X-axis: Saturation (0-100, left to right)
 * Y-axis: Brightness (100-0, top to bottom)
 */

import type { Component, JSX } from 'solid-js';
import { createSignal, onCleanup } from 'solid-js';
import { hsvToRgb, rgbaToHex, clamp } from '../../../domain/colorPicker';
import { KEYBOARD_STEP } from '../../../types/colorPicker';
import styles from './ColorPicker.module.css';

export interface GradientAreaProps {
  /** Current hue (0-360) */
  hue: number;
  /** Current saturation (0-100) */
  saturation: number;
  /** Current brightness (0-100) */
  brightness: number;
  /** Called when saturation/brightness changes */
  onChange: (saturation: number, brightness: number) => void;
  /** Called when editing is complete */
  onCommit: () => void;
  /** Disabled state */
  disabled?: boolean;
}

export const GradientArea: Component<GradientAreaProps> = (props) => {
  const [isDragging, setIsDragging] = createSignal(false);
  let areaRef: HTMLDivElement | undefined;

  // Calculate the hue color for the gradient background
  const getHueColor = (): string => {
    const rgb = hsvToRgb(props.hue, 100, 100);
    return rgbaToHex(rgb.r, rgb.g, rgb.b, 255);
  };

  // Calculate saturation/brightness from mouse position
  const calculateFromPosition = (clientX: number, clientY: number) => {
    if (!areaRef) return { saturation: props.saturation, brightness: props.brightness };

    const rect = areaRef.getBoundingClientRect();
    const x = clamp(clientX - rect.left, 0, rect.width);
    const y = clamp(clientY - rect.top, 0, rect.height);

    const saturation = Math.round((x / rect.width) * 100);
    const brightness = Math.round(100 - (y / rect.height) * 100);

    return { saturation, brightness };
  };

  // Handle mouse down - start dragging
  const handleMouseDown: JSX.EventHandler<HTMLDivElement, MouseEvent> = (e) => {
    if (props.disabled || e.button !== 0) return;
    e.preventDefault();

    const { saturation, brightness } = calculateFromPosition(e.clientX, e.clientY);
    props.onChange(saturation, brightness);
    setIsDragging(true);

    // Add document listeners for drag
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  // Handle mouse move during drag
  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging() || !areaRef) return;

    const rect = areaRef.getBoundingClientRect();
    const { saturation, brightness } = calculateFromPosition(e.clientX, e.clientY);
    props.onChange(saturation, brightness);
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
  const handleKeyDown: JSX.EventHandler<HTMLDivElement, KeyboardEvent> = (e) => {
    if (props.disabled) return;

    const step = e.shiftKey ? KEYBOARD_STEP.shift : KEYBOARD_STEP.normal;
    let newSaturation = props.saturation;
    let newBrightness = props.brightness;

    switch (e.key) {
      case 'ArrowRight':
        e.preventDefault();
        newSaturation = clamp(props.saturation + step, 0, 100);
        break;
      case 'ArrowLeft':
        e.preventDefault();
        newSaturation = clamp(props.saturation - step, 0, 100);
        break;
      case 'ArrowUp':
        e.preventDefault();
        newBrightness = clamp(props.brightness + step, 0, 100);
        break;
      case 'ArrowDown':
        e.preventDefault();
        newBrightness = clamp(props.brightness - step, 0, 100);
        break;
      default:
        return;
    }

    props.onChange(newSaturation, newBrightness);
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

  // Calculate thumb position
  const thumbLeft = () => `${props.saturation}%`;
  const thumbTop = () => `${100 - props.brightness}%`;

  return (
    <div
      ref={areaRef}
      data-testid="gradient-area"
      class={styles.gradientArea}
      role="slider"
      tabindex={props.disabled ? -1 : 0}
      aria-label="Color saturation and brightness picker"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={props.saturation}
      aria-valuetext={`Saturation ${props.saturation}%, Brightness ${props.brightness}%`}
      aria-disabled={props.disabled ? 'true' : undefined}
      style={{ '--hue-color': getHueColor() }}
      onMouseDown={handleMouseDown}
      onKeyDown={handleKeyDown}
      onKeyUp={handleKeyUp}
    >
      {/* Saturation gradient (white to hue color) */}
      <div class={styles.gradientSaturation} />

      {/* Brightness gradient (transparent to black) */}
      <div class={styles.gradientBrightness} />

      {/* Thumb indicator */}
      <div
        data-testid="gradient-thumb"
        class={styles.gradientThumb}
        style={{
          left: thumbLeft(),
          top: thumbTop(),
          'background-color': rgbaToHex(
            ...Object.values(hsvToRgb(props.hue, props.saturation, props.brightness)) as [number, number, number]
          ),
        }}
      />
    </div>
  );
};
