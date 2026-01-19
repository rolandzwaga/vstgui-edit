/**
 * TrackPanel Component (Stub)
 *
 * Controls for slider track configuration including
 * orientation, length, width, depth, and corner radius.
 *
 * This is an initial stub implementation for Phase 4.
 * Full implementation will be completed in Phase 5.
 */

import { Show } from 'solid-js';
import type { Component } from 'solid-js';
import type { BaseControlDesign } from '../../types/controlDesigner';
import type { SliderDesign, SliderOrientation } from '../../types/controlDesigner/slider';
import { TRACK_CONSTRAINTS } from '../../domain/sliderDesigner/validation';
import styles from './TrackPanel.module.css';

// ============================================================================
// Props Interface
// ============================================================================

export interface TrackPanelProps {
  /** Current slider design */
  design: BaseControlDesign;

  /** Callback to update design */
  onUpdate: (updates: Partial<SliderDesign>) => void;
}

// ============================================================================
// Component
// ============================================================================

export const TrackPanel: Component<TrackPanelProps> = (props) => {
  // Type guard to access slider-specific properties
  const track = () => (props.design as SliderDesign).track;

  const handleOrientationChange = (orientation: SliderOrientation) => {
    props.onUpdate({
      track: {
        ...track(),
        orientation,
      },
    } as Partial<SliderDesign>);
  };

  const handleLengthChange = (length: number) => {
    props.onUpdate({
      track: {
        ...track(),
        length,
      },
    } as Partial<SliderDesign>);
  };

  const handleWidthChange = (width: number) => {
    props.onUpdate({
      track: {
        ...track(),
        width,
      },
    } as Partial<SliderDesign>);
  };

  const handleDepthChange = (depth: number) => {
    props.onUpdate({
      track: {
        ...track(),
        depth,
      },
    } as Partial<SliderDesign>);
  };

  const handleCornerRadiusChange = (cornerRadius: number) => {
    props.onUpdate({
      track: {
        ...track(),
        cornerRadius,
      },
    } as Partial<SliderDesign>);
  };

  return (
    <div class={styles.container}>
      <h4 class={styles.title}>Track</h4>

      {/* Orientation */}
      <div class={styles.field}>
        <label class={styles.label}>Orientation</label>
        <div class={styles.buttonGroup}>
          <button
            type="button"
            class={`${styles.toggleButton} ${track().orientation === 'vertical' ? styles.toggleActive : ''}`}
            onClick={() => handleOrientationChange('vertical')}
          >
            Vertical
          </button>
          <button
            type="button"
            class={`${styles.toggleButton} ${track().orientation === 'horizontal' ? styles.toggleActive : ''}`}
            onClick={() => handleOrientationChange('horizontal')}
          >
            Horizontal
          </button>
        </div>
      </div>

      {/* Length */}
      <div class={styles.field}>
        <label class={styles.label}>Length</label>
        <div class={styles.inputGroup}>
          <input
            type="range"
            min={TRACK_CONSTRAINTS.LENGTH.MIN}
            max={TRACK_CONSTRAINTS.LENGTH.MAX}
            value={track().length}
            class={styles.slider}
            onInput={(e) => handleLengthChange(parseInt(e.currentTarget.value, 10))}
          />
          <span class={styles.value}>{track().length}%</span>
        </div>
      </div>

      {/* Width */}
      <div class={styles.field}>
        <label class={styles.label}>Width</label>
        <div class={styles.inputGroup}>
          <input
            type="range"
            min={TRACK_CONSTRAINTS.WIDTH.MIN}
            max={TRACK_CONSTRAINTS.WIDTH.MAX}
            value={track().width}
            class={styles.slider}
            onInput={(e) => handleWidthChange(parseInt(e.currentTarget.value, 10))}
          />
          <span class={styles.value}>{track().width}%</span>
        </div>
      </div>

      {/* Depth */}
      <div class={styles.field}>
        <label class={styles.label}>Depth</label>
        <div class={styles.inputGroup}>
          <input
            type="range"
            min={TRACK_CONSTRAINTS.DEPTH.MIN}
            max={TRACK_CONSTRAINTS.DEPTH.MAX}
            value={track().depth}
            class={styles.slider}
            onInput={(e) => handleDepthChange(parseInt(e.currentTarget.value, 10))}
          />
          <span class={styles.value}>{track().depth}</span>
        </div>
      </div>

      {/* Corner Radius */}
      <div class={styles.field}>
        <label class={styles.label}>Corner Radius</label>
        <div class={styles.inputGroup}>
          <input
            type="range"
            min={TRACK_CONSTRAINTS.CORNER_RADIUS.MIN}
            max={TRACK_CONSTRAINTS.CORNER_RADIUS.MAX}
            value={track().cornerRadius}
            class={styles.slider}
            onInput={(e) => handleCornerRadiusChange(parseInt(e.currentTarget.value, 10))}
          />
          <span class={styles.value}>{track().cornerRadius}</span>
        </div>
      </div>

      {/* Stub Notice */}
      <Show when={true}>
        <div class={styles.stubNotice}>
          Material controls coming in Phase 5
        </div>
      </Show>
    </div>
  );
};
