/**
 * LightingPanel Component
 *
 * Controls for light source position and ambient occlusion.
 */

import type { Component } from 'solid-js';
import { knobDesignerStore, updateLighting } from '../../stores/knobDesignerStore';
import { LIGHTING_CONSTRAINTS } from '../../domain/knobDesigner';
import styles from './LightingPanel.module.css';

// ============================================================================
// Component
// ============================================================================

export const LightingPanel: Component = () => {
  const lighting = () => knobDesignerStore.design.lighting;

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
              value={lighting().azimuth}
              class={styles.slider}
              onInput={(e) => {
                updateLighting({ azimuth: parseInt(e.currentTarget.value, 10) });
              }}
            />
            <span class={styles.value}>{lighting().azimuth}deg</span>
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
              value={lighting().elevation}
              class={styles.slider}
              onInput={(e) => {
                updateLighting({ elevation: parseInt(e.currentTarget.value, 10) });
              }}
            />
            <span class={styles.value}>{lighting().elevation}deg</span>
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
                transform: `rotate(${lighting().azimuth}deg) translateY(${-30 * Math.cos((lighting().elevation * Math.PI) / 180)}px)`,
              }}
            />
            <div class={styles.previewCenter} />
          </div>
          <div class={styles.previewLabels}>
            <span class={styles.previewLabel} style={{ top: '0', left: '50%', transform: 'translateX(-50%)' }}>Front</span>
            <span class={styles.previewLabel} style={{ top: '50%', right: '0', transform: 'translateY(-50%)' }}>Right</span>
            <span class={styles.previewLabel} style={{ bottom: '0', left: '50%', transform: 'translateX(-50%)' }}>Back</span>
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
              value={lighting().aoStrength}
              class={styles.slider}
              onInput={(e) => {
                updateLighting({ aoStrength: parseInt(e.currentTarget.value, 10) });
              }}
            />
            <span class={styles.value}>{lighting().aoStrength}%</span>
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
            onClick={() => updateLighting({ azimuth: 315, elevation: 45 })}
          >
            Top-Left
          </button>
          <button
            type="button"
            class={styles.presetButton}
            onClick={() => updateLighting({ azimuth: 45, elevation: 45 })}
          >
            Top-Right
          </button>
          <button
            type="button"
            class={styles.presetButton}
            onClick={() => updateLighting({ azimuth: 0, elevation: 60 })}
          >
            Front-High
          </button>
          <button
            type="button"
            class={styles.presetButton}
            onClick={() => updateLighting({ azimuth: 270, elevation: 30 })}
          >
            Side-Low
          </button>
        </div>
      </div>
    </div>
  );
};

export default LightingPanel;
