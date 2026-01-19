/**
 * OutputPanel Component
 *
 * Controls for filmstrip output configuration including
 * frame count, dimensions, and rotation/position range.
 *
 * Supports both rotational controls (knobs) and linear controls (sliders).
 * Rotation settings are hidden for linear controls.
 */

import { Show } from 'solid-js';
import type { Component } from 'solid-js';
import type { ControlCategory, BaseOutputConfig, RotationalOutputConfig } from '../../types/controlDesigner';
import type { OutputConfig } from '../../types/knobDesigner';
import {
  OUTPUT_CONSTRAINTS,
  calculateFilmstripDimensions,
  estimateFilmstripSize,
  formatFileSize,
  validateFilmstripSize,
} from '../../domain/knobDesigner';
import styles from './OutputPanel.module.css';

// ============================================================================
// Props Interface
// ============================================================================

export interface OutputPanelProps {
  /**
   * Control category.
   * Determines whether rotation settings are shown.
   */
  category: ControlCategory;

  /**
   * Output configuration from the control designer store.
   */
  output: BaseOutputConfig | RotationalOutputConfig;

  /**
   * Handler for output updates.
   */
  onOutputUpdate: (updates: Partial<BaseOutputConfig | RotationalOutputConfig>) => void;
}

// ============================================================================
// Type Guards
// ============================================================================

/**
 * Type guard to check if output config is rotational (has rotation settings).
 */
function isRotationalOutput(output: BaseOutputConfig | RotationalOutputConfig): output is RotationalOutputConfig {
  return 'sweepAngle' in output;
}

// ============================================================================
// Component
// ============================================================================

export const OutputPanel: Component<OutputPanelProps> = (props) => {
  // Whether this is a rotational control type
  const isRotational = () => props.category === 'rotational';

  // Get output config from props
  const output = () => props.output;

  // Get rotational output (with type safety) - returns undefined for linear controls
  const rotationalOutput = () => {
    const out = output();
    return isRotationalOutput(out) ? out : undefined;
  };

  // Helper to update output
  const handleOutputUpdate = (updates: Partial<BaseOutputConfig | RotationalOutputConfig>) => {
    props.onOutputUpdate(updates);
  };

  // Calculate filmstrip info - use a compatible config format
  const filmstripInfo = () => {
    const config = output();
    // Build a compatible OutputConfig for the knob domain functions
    const outputConfig: OutputConfig = {
      frameCount: config.frameCount,
      frameWidth: config.frameWidth,
      frameHeight: config.frameHeight,
      layout: config.layout,
      sweepAngle: isRotationalOutput(config) ? config.sweepAngle : 270,
      startAngle: isRotationalOutput(config) ? config.startAngle : 225,
      endAngle: isRotationalOutput(config) ? config.endAngle : 315,
      rotationOffset: isRotationalOutput(config) ? config.rotationOffset : 0,
    };
    const dimensions = calculateFilmstripDimensions(outputConfig);
    const estimatedSize = estimateFilmstripSize(outputConfig);
    const validation = validateFilmstripSize(outputConfig);
    return { dimensions, estimatedSize, validation };
  };

  return (
    <div class={styles.container}>
      <h3 class={styles.title}>Output Settings</h3>

      {/* Frame Count */}
      <div class={styles.section}>
        <h4 class={styles.sectionTitle}>Frame Count</h4>
        <div class={styles.field}>
          <label class={styles.label}>Number of Frames</label>
          <div class={styles.inputGroup}>
            <input
              type="range"
              min={OUTPUT_CONSTRAINTS.FRAME_COUNT.MIN}
              max={OUTPUT_CONSTRAINTS.FRAME_COUNT.MAX}
              step="8"
              value={output().frameCount}
              class={styles.slider}
              onInput={(e) => {
                handleOutputUpdate({ frameCount: parseInt(e.currentTarget.value, 10) });
              }}
            />
            <input
              type="number"
              min={OUTPUT_CONSTRAINTS.FRAME_COUNT.MIN}
              max={OUTPUT_CONSTRAINTS.FRAME_COUNT.MAX}
              value={output().frameCount}
              class={styles.numberInput}
              onChange={(e) => {
                const value = parseInt(e.currentTarget.value, 10);
                if (value >= OUTPUT_CONSTRAINTS.FRAME_COUNT.MIN && value <= OUTPUT_CONSTRAINTS.FRAME_COUNT.MAX) {
                  handleOutputUpdate({ frameCount: value });
                }
              }}
            />
          </div>
          <span class={styles.hint}>More frames = smoother animation but larger file</span>
        </div>
      </div>

      {/* Frame Dimensions */}
      <div class={styles.section}>
        <h4 class={styles.sectionTitle}>Frame Dimensions</h4>

        <div class={styles.dimensionRow}>
          <div class={styles.field}>
            <label class={styles.label}>Width</label>
            <div class={styles.inputWithUnit}>
              <input
                type="number"
                min={OUTPUT_CONSTRAINTS.FRAME_SIZE.MIN}
                max={OUTPUT_CONSTRAINTS.FRAME_SIZE.MAX}
                value={output().frameWidth}
                class={styles.dimensionInput}
                onChange={(e) => {
                  const value = parseInt(e.currentTarget.value, 10);
                  if (value >= OUTPUT_CONSTRAINTS.FRAME_SIZE.MIN && value <= OUTPUT_CONSTRAINTS.FRAME_SIZE.MAX) {
                    handleOutputUpdate({ frameWidth: value });
                  }
                }}
              />
              <span class={styles.unit}>px</span>
            </div>
          </div>

          <span class={styles.dimensionSeparator}>x</span>

          <div class={styles.field}>
            <label class={styles.label}>Height</label>
            <div class={styles.inputWithUnit}>
              <input
                type="number"
                min={OUTPUT_CONSTRAINTS.FRAME_SIZE.MIN}
                max={OUTPUT_CONSTRAINTS.FRAME_SIZE.MAX}
                value={output().frameHeight}
                class={styles.dimensionInput}
                onChange={(e) => {
                  const value = parseInt(e.currentTarget.value, 10);
                  if (value >= OUTPUT_CONSTRAINTS.FRAME_SIZE.MIN && value <= OUTPUT_CONSTRAINTS.FRAME_SIZE.MAX) {
                    handleOutputUpdate({ frameHeight: value });
                  }
                }}
              />
              <span class={styles.unit}>px</span>
            </div>
          </div>
        </div>

        {/* Quick Size Presets */}
        <div class={styles.presetRow}>
          <button type="button" class={styles.sizePreset} onClick={() => handleOutputUpdate({ frameWidth: 50, frameHeight: 50 })}>
            50x50
          </button>
          <button type="button" class={styles.sizePreset} onClick={() => handleOutputUpdate({ frameWidth: 100, frameHeight: 100 })}>
            100x100
          </button>
          <button type="button" class={styles.sizePreset} onClick={() => handleOutputUpdate({ frameWidth: 150, frameHeight: 150 })}>
            150x150
          </button>
          <button type="button" class={styles.sizePreset} onClick={() => handleOutputUpdate({ frameWidth: 200, frameHeight: 200 })}>
            200x200
          </button>
        </div>
      </div>

      {/* Filmstrip Layout */}
      <div class={styles.section}>
        <h4 class={styles.sectionTitle}>Filmstrip Layout</h4>
        <div class={styles.layoutButtons}>
          <button
            type="button"
            class={`${styles.layoutButton} ${output().layout === 'vertical' ? styles.layoutButtonActive : ''}`}
            onClick={() => handleOutputUpdate({ layout: 'vertical' })}
            title="Single column, all frames stacked vertically"
          >
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="8" y="2" width="8" height="4" rx="1" />
              <rect x="8" y="8" width="8" height="4" rx="1" />
              <rect x="8" y="14" width="8" height="4" rx="1" />
              <rect x="8" y="20" width="8" height="2" rx="1" />
            </svg>
            Vertical
          </button>
          <button
            type="button"
            class={`${styles.layoutButton} ${output().layout === 'horizontal' ? styles.layoutButtonActive : ''}`}
            onClick={() => handleOutputUpdate({ layout: 'horizontal' })}
            title="Single row, all frames side by side"
          >
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="2" y="8" width="4" height="8" rx="1" />
              <rect x="8" y="8" width="4" height="8" rx="1" />
              <rect x="14" y="8" width="4" height="8" rx="1" />
              <rect x="20" y="8" width="2" height="8" rx="1" />
            </svg>
            Horizontal
          </button>
          <button
            type="button"
            class={`${styles.layoutButton} ${output().layout === 'grid' ? styles.layoutButtonActive : ''}`}
            onClick={() => handleOutputUpdate({ layout: 'grid' })}
            title="Grid layout with optimal distribution"
          >
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="3" width="7" height="7" rx="1" />
              <rect x="14" y="3" width="7" height="7" rx="1" />
              <rect x="3" y="14" width="7" height="7" rx="1" />
              <rect x="14" y="14" width="7" height="7" rx="1" />
            </svg>
            Grid
          </button>
        </div>
      </div>

      {/* Rotation Range - Only shown for rotational controls */}
      <Show when={isRotational() && rotationalOutput()}>
        {(rotOutput) => (
          <div class={styles.section}>
            <h4 class={styles.sectionTitle}>Rotation Range</h4>

            <div class={styles.field}>
              <label class={styles.label}>Sweep Angle</label>
              <div class={styles.inputGroup}>
                <input
                  type="range"
                  min={OUTPUT_CONSTRAINTS.SWEEP_ANGLE.MIN}
                  max={OUTPUT_CONSTRAINTS.SWEEP_ANGLE.MAX}
                  value={rotOutput().sweepAngle}
                  class={styles.slider}
                  onInput={(e) => {
                    handleOutputUpdate({ sweepAngle: parseInt(e.currentTarget.value, 10) });
                  }}
                />
                <span class={styles.value}>{rotOutput().sweepAngle}deg</span>
              </div>
              <span class={styles.hint}>Total rotation range (typical: 270deg for audio knobs)</span>
            </div>

            <div class={styles.field}>
              <label class={styles.label}>Start Angle</label>
              <div class={styles.inputGroup}>
                <input
                  type="range"
                  min={OUTPUT_CONSTRAINTS.ANGLE.MIN}
                  max={OUTPUT_CONSTRAINTS.ANGLE.MAX}
                  value={rotOutput().startAngle}
                  class={styles.slider}
                  onInput={(e) => {
                    handleOutputUpdate({ startAngle: parseInt(e.currentTarget.value, 10) });
                  }}
                />
                <span class={styles.value}>{rotOutput().startAngle}deg</span>
              </div>
              <span class={styles.hint}>Minimum position (typical: 225deg = 7 o'clock)</span>
            </div>

            <div class={styles.field}>
              <label class={styles.label}>End Angle</label>
              <div class={styles.inputGroup}>
                <input
                  type="range"
                  min={OUTPUT_CONSTRAINTS.ANGLE.MIN}
                  max={OUTPUT_CONSTRAINTS.ANGLE.MAX}
                  value={rotOutput().endAngle}
                  class={styles.slider}
                  onInput={(e) => {
                    handleOutputUpdate({ endAngle: parseInt(e.currentTarget.value, 10) });
                  }}
                />
                <span class={styles.value}>{rotOutput().endAngle}deg</span>
              </div>
              <span class={styles.hint}>Maximum position (typical: 315deg = 5 o'clock)</span>
            </div>

            <div class={styles.field}>
              <label class={styles.label}>Rotation Offset</label>
              <div class={styles.inputGroup}>
                <input
                  type="range"
                  min={OUTPUT_CONSTRAINTS.ROTATION_OFFSET.MIN}
                  max={OUTPUT_CONSTRAINTS.ROTATION_OFFSET.MAX}
                  value={rotOutput().rotationOffset ?? 0}
                  class={styles.slider}
                  onInput={(e) => {
                    handleOutputUpdate({ rotationOffset: parseInt(e.currentTarget.value, 10) });
                  }}
                />
                <span class={styles.value}>{rotOutput().rotationOffset ?? 0}deg</span>
              </div>
              <div class={styles.presetRow}>
                <button type="button" class={styles.sizePreset} onClick={() => handleOutputUpdate({ rotationOffset: 0 })}>
                  0deg
                </button>
                <button type="button" class={styles.sizePreset} onClick={() => handleOutputUpdate({ rotationOffset: 90 })}>
                  90deg
                </button>
                <button type="button" class={styles.sizePreset} onClick={() => handleOutputUpdate({ rotationOffset: 180 })}>
                  180deg
                </button>
                <button type="button" class={styles.sizePreset} onClick={() => handleOutputUpdate({ rotationOffset: 270 })}>
                  270deg
                </button>
              </div>
              <span class={styles.hint}>Rotates the knob like a clock face (0 = default orientation)</span>
            </div>
          </div>
        )}
      </Show>

      {/* Position Info - Only shown for linear controls */}
      <Show when={!isRotational()}>
        <div class={styles.section}>
          <h4 class={styles.sectionTitle}>Position Range</h4>
          <div class={styles.field}>
            <span class={styles.hint}>
              Linear controls automatically generate frames from 0% to 100% position.
              Frame count determines the number of intermediate positions.
            </span>
          </div>
        </div>
      </Show>

      {/* Output Summary */}
      <div class={styles.section}>
        <h4 class={styles.sectionTitle}>Output Summary</h4>
        <div class={styles.summaryGrid}>
          <div class={styles.summaryItem}>
            <span class={styles.summaryLabel}>Filmstrip Size</span>
            <span class={styles.summaryValue}>
              {filmstripInfo().dimensions.totalWidth} x {filmstripInfo().dimensions.totalHeight} px
            </span>
          </div>
          <div class={styles.summaryItem}>
            <span class={styles.summaryLabel}>Layout</span>
            <span class={styles.summaryValue}>
              {filmstripInfo().dimensions.framesPerRow} cols x {filmstripInfo().dimensions.rows} rows
            </span>
          </div>
          <div class={styles.summaryItem}>
            <span class={styles.summaryLabel}>Estimated Size</span>
            <span class={styles.summaryValue}>
              ~{formatFileSize(filmstripInfo().estimatedSize)}
            </span>
          </div>
        </div>

        {/* Validation Warning */}
        <Show when={!filmstripInfo().validation.valid}>
          <div class={styles.warningBox}>
            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
              <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z" />
            </svg>
            <span>{filmstripInfo().validation.error}</span>
          </div>
        </Show>
      </div>
    </div>
  );
};
