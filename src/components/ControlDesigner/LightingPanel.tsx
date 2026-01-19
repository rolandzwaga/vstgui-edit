/**
 * LightingPanel Component (Shared)
 *
 * Controls for light source position and ambient occlusion.
 * This is a shared panel used by all control types in the Control Designer.
 * Accepts lighting state and callbacks via props instead of reading from store directly.
 */

import type { Component } from 'solid-js';
import type { LightingConfig } from '../../types/controlDesigner';
import { LIGHTING_CONSTRAINTS } from '../../domain/knobDesigner';
import styles from './LightingPanel.module.css';

// ============================================================================
// Props Interface
// ============================================================================

export interface LightingPanelProps {
  /** Current lighting configuration */
  lighting: LightingConfig;

  /** Callback to update lighting configuration */
  onUpdate: (updates: Partial<LightingConfig>) => void;
}

// ============================================================================
// Component
// ============================================================================

export const LightingPanel: Component<LightingPanelProps> = (props) => {
  return (
    <div class={styles.container}>
      <h3 class={styles.title}>Lighting</h3>

      {/* Light Position */}
      <div class={styles.section}>
        <h4 class={styles.sectionTitle}>Light Position</h4>

        {/* Azimuth */}
        <div class={styles.field}>
          <label class={styles.label}>Azimuth</label>
          <div class={styles.inputGroup}>
            <input
              type="range"
              min={LIGHTING_CONSTRAINTS.AZIMUTH.MIN}
              max={LIGHTING_CONSTRAINTS.AZIMUTH.MAX}
              value={props.lighting.azimuth}
              class={styles.slider}
              onInput={(e) => {
                props.onUpdate({ azimuth: parseInt(e.currentTarget.value, 10) });
              }}
            />
            <span class={styles.value}>{props.lighting.azimuth}deg</span>
          </div>
          <span class={styles.hint}>0 = front, 90 = right, 180 = back, 270 = left</span>
        </div>

        {/* Elevation */}
        <div class={styles.field}>
          <label class={styles.label}>Elevation</label>
          <div class={styles.inputGroup}>
            <input
              type="range"
              min={LIGHTING_CONSTRAINTS.ELEVATION.MIN}
              max={LIGHTING_CONSTRAINTS.ELEVATION.MAX}
              value={props.lighting.elevation}
              class={styles.slider}
              onInput={(e) => {
                props.onUpdate({ elevation: parseInt(e.currentTarget.value, 10) });
              }}
            />
            <span class={styles.value}>{props.lighting.elevation}deg</span>
          </div>
          <span class={styles.hint}>0 = horizon, 90 = directly above</span>
        </div>
      </div>

      {/* Light Preview */}
      <div class={styles.section}>
        <h4 class={styles.sectionTitle}>Light Direction Preview</h4>
        <div class={styles.previewContainer}>
          <div class={styles.previewCircle}>
            <div
              class={styles.previewDot}
              style={{
                // Convert azimuth to CSS rotation: in our 3D scene, azimuth 0 deg = front (bottom of screen)
                // CSS rotation: 0 deg = top. So CSS angle = 180 - azimuth
                transform: `rotate(${180 - props.lighting.azimuth}deg) translateY(${-30 * Math.cos((props.lighting.elevation * Math.PI) / 180)}px)`,
              }}
            />
            <div class={styles.previewCenter} />
          </div>
          <div class={styles.previewLabels}>
            <span class={styles.previewLabel} style={{ top: '0', left: '50%', transform: 'translateX(-50%)' }}>Back</span>
            <span class={styles.previewLabel} style={{ top: '50%', right: '0', transform: 'translateY(-50%)' }}>Right</span>
            <span class={styles.previewLabel} style={{ bottom: '0', left: '50%', transform: 'translateX(-50%)' }}>Front</span>
            <span class={styles.previewLabel} style={{ top: '50%', left: '0', transform: 'translateY(-50%)' }}>Left</span>
          </div>
        </div>
      </div>

      {/* Ambient Occlusion */}
      <div class={styles.section}>
        <h4 class={styles.sectionTitle}>Ambient Occlusion</h4>
        <div class={styles.field}>
          <label class={styles.label}>Strength</label>
          <div class={styles.inputGroup}>
            <input
              type="range"
              min={LIGHTING_CONSTRAINTS.AO_STRENGTH.MIN}
              max={LIGHTING_CONSTRAINTS.AO_STRENGTH.MAX}
              value={props.lighting.aoStrength}
              class={styles.slider}
              onInput={(e) => {
                props.onUpdate({ aoStrength: parseInt(e.currentTarget.value, 10) });
              }}
            />
            <span class={styles.value}>{props.lighting.aoStrength}%</span>
          </div>
          <span class={styles.hint}>Darkens crevices and edges</span>
        </div>
      </div>

      {/* Quick Presets */}
      <div class={styles.section}>
        <h4 class={styles.sectionTitle}>Quick Presets</h4>
        <div class={styles.presetGrid}>
          <button
            type="button"
            class={styles.presetButton}
            onClick={() => props.onUpdate({ azimuth: 315, elevation: 45 })}
          >
            Top-Left
          </button>
          <button
            type="button"
            class={styles.presetButton}
            onClick={() => props.onUpdate({ azimuth: 45, elevation: 45 })}
          >
            Top-Right
          </button>
          <button
            type="button"
            class={styles.presetButton}
            onClick={() => props.onUpdate({ azimuth: 0, elevation: 60 })}
          >
            Front-High
          </button>
          <button
            type="button"
            class={styles.presetButton}
            onClick={() => props.onUpdate({ azimuth: 270, elevation: 30 })}
          >
            Side-Low
          </button>
        </div>
      </div>
    </div>
  );
};
