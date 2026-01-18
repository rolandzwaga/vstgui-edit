/**
 * OutputPanel Component
 *
 * Controls for filmstrip output configuration including
 * frame count, dimensions, and rotation range.
 */

import type { Component } from 'solid-js';
import { knobDesignerStore, updateOutput } from '../../stores/knobDesignerStore';
import {
  OUTPUT_CONSTRAINTS,
  calculateFilmstripDimensions,
  estimateFilmstripSize,
  formatFileSize,
  validateFilmstripSize,
} from '../../domain/knobDesigner';
import styles from './OutputPanel.module.css';

// ============================================================================
// Component
// ============================================================================

export const OutputPanel: Component = () => {
  const output = () => knobDesignerStore.design.output;

  // Calculate filmstrip info
  const filmstripInfo = () => {
    const config = output();
    const dimensions = calculateFilmstripDimensions(config);
    const estimatedSize = estimateFilmstripSize(config);
    const validation = validateFilmstripSize(config);
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
                updateOutput({ frameCount: parseInt(e.currentTarget.value, 10) });
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
                  updateOutput({ frameCount: value });
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
                    updateOutput({ frameWidth: value });
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
                    updateOutput({ frameHeight: value });
                  }
                }}
              />
              <span class={styles.unit}>px</span>
            </div>
          </div>
        </div>

        {/* Quick Size Presets */}
        <div class={styles.presetRow}>
          <button type="button" class={styles.sizePreset} onClick={() => updateOutput({ frameWidth: 50, frameHeight: 50 })}>
            50x50
          </button>
          <button type="button" class={styles.sizePreset} onClick={() => updateOutput({ frameWidth: 100, frameHeight: 100 })}>
            100x100
          </button>
          <button type="button" class={styles.sizePreset} onClick={() => updateOutput({ frameWidth: 150, frameHeight: 150 })}>
            150x150
          </button>
          <button type="button" class={styles.sizePreset} onClick={() => updateOutput({ frameWidth: 200, frameHeight: 200 })}>
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
            onClick={() => updateOutput({ layout: 'vertical' })}
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
            onClick={() => updateOutput({ layout: 'horizontal' })}
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
            onClick={() => updateOutput({ layout: 'grid' })}
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

      {/* Rotation Range */}
      <div class={styles.section}>
        <h4 class={styles.sectionTitle}>Rotation Range</h4>

        <div class={styles.field}>
          <label class={styles.label}>Sweep Angle</label>
          <div class={styles.inputGroup}>
            <input
              type="range"
              min={OUTPUT_CONSTRAINTS.SWEEP_ANGLE.MIN}
              max={OUTPUT_CONSTRAINTS.SWEEP_ANGLE.MAX}
              value={output().sweepAngle}
              class={styles.slider}
              onInput={(e) => {
                updateOutput({ sweepAngle: parseInt(e.currentTarget.value, 10) });
              }}
            />
            <span class={styles.value}>{output().sweepAngle}deg</span>
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
              value={output().startAngle}
              class={styles.slider}
              onInput={(e) => {
                updateOutput({ startAngle: parseInt(e.currentTarget.value, 10) });
              }}
            />
            <span class={styles.value}>{output().startAngle}deg</span>
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
              value={output().endAngle}
              class={styles.slider}
              onInput={(e) => {
                updateOutput({ endAngle: parseInt(e.currentTarget.value, 10) });
              }}
            />
            <span class={styles.value}>{output().endAngle}deg</span>
          </div>
          <span class={styles.hint}>Maximum position (typical: 315deg = 5 o'clock)</span>
        </div>
      </div>

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
        {!filmstripInfo().validation.valid && (
          <div class={styles.warningBox}>
            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
              <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z" />
            </svg>
            <span>{filmstripInfo().validation.error}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default OutputPanel;
