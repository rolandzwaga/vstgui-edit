/**
 * HandlePanel Component
 *
 * Controls for slider handle configuration including
 * shape, width, height, and grip lines.
 */

import { For } from 'solid-js';
import type { Component } from 'solid-js';
import type { BaseControlDesign } from '../../types/controlDesigner';
import type { HandleShape, SliderDesign } from '../../types/controlDesigner/slider';
import { HANDLE_CONSTRAINTS } from '../../domain/sliderDesigner/validation';
import styles from './HandlePanel.module.css';

// ============================================================================
// Constants
// ============================================================================

const HANDLE_SHAPES: { value: HandleShape; label: string }[] = [
  { value: 'rectangle', label: 'Rectangle' },
  { value: 'rounded', label: 'Rounded' },
  { value: 'circle', label: 'Circle' },
  { value: 'faderCap', label: 'Fader Cap' },
];

// ============================================================================
// Props Interface
// ============================================================================

export interface HandlePanelProps {
  /** Current slider design */
  design: BaseControlDesign;

  /** Callback to update design */
  onUpdate: (updates: Partial<SliderDesign>) => void;
}

// ============================================================================
// Component
// ============================================================================

export const HandlePanel: Component<HandlePanelProps> = (props) => {
  // Type guard to access slider-specific properties
  const handle = () => (props.design as SliderDesign).handle;

  const handleShapeChange = (shape: HandleShape) => {
    props.onUpdate({
      handle: {
        ...handle(),
        shape,
      },
    } as Partial<SliderDesign>);
  };

  const handleWidthChange = (width: number) => {
    props.onUpdate({
      handle: {
        ...handle(),
        width,
      },
    } as Partial<SliderDesign>);
  };

  const handleHeightChange = (height: number) => {
    props.onUpdate({
      handle: {
        ...handle(),
        height,
      },
    } as Partial<SliderDesign>);
  };

  const handleGripLinesChange = (gripLines: number) => {
    props.onUpdate({
      handle: {
        ...handle(),
        gripLines,
      },
    } as Partial<SliderDesign>);
  };

  return (
    <div class={styles.container}>
      <h4 class={styles.title}>Handle</h4>

      {/* Shape */}
      <div class={styles.field}>
        <label class={styles.label}>Shape</label>
        <select
          class={styles.select}
          value={handle().shape}
          onChange={(e) => handleShapeChange(e.currentTarget.value as HandleShape)}
        >
          <For each={HANDLE_SHAPES}>
            {(shape) => <option value={shape.value}>{shape.label}</option>}
          </For>
        </select>
      </div>

      {/* Width */}
      <div class={styles.field}>
        <label class={styles.label}>Width</label>
        <div class={styles.inputGroup}>
          <input
            type="range"
            min={HANDLE_CONSTRAINTS.WIDTH.MIN}
            max={HANDLE_CONSTRAINTS.WIDTH.MAX}
            value={handle().width}
            class={styles.slider}
            onInput={(e) => handleWidthChange(parseInt(e.currentTarget.value, 10))}
          />
          <span class={styles.value}>{handle().width}%</span>
        </div>
        <span class={styles.hint}>Relative to track width</span>
      </div>

      {/* Height */}
      <div class={styles.field}>
        <label class={styles.label}>Height</label>
        <div class={styles.inputGroup}>
          <input
            type="range"
            min={HANDLE_CONSTRAINTS.HEIGHT.MIN}
            max={HANDLE_CONSTRAINTS.HEIGHT.MAX}
            value={handle().height}
            class={styles.slider}
            onInput={(e) => handleHeightChange(parseInt(e.currentTarget.value, 10))}
          />
          <span class={styles.value}>{handle().height}%</span>
        </div>
        <span class={styles.hint}>Relative to track width</span>
      </div>

      {/* Grip Lines */}
      <div class={styles.field}>
        <label class={styles.label}>Grip Lines</label>
        <div class={styles.inputGroup}>
          <input
            type="range"
            min={HANDLE_CONSTRAINTS.GRIP_LINES.MIN}
            max={HANDLE_CONSTRAINTS.GRIP_LINES.MAX}
            value={handle().gripLines}
            class={styles.slider}
            onInput={(e) => handleGripLinesChange(parseInt(e.currentTarget.value, 10))}
          />
          <span class={styles.value}>{handle().gripLines}</span>
        </div>
      </div>
    </div>
  );
};
