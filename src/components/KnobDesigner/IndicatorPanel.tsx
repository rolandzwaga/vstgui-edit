/**
 * IndicatorPanel Component
 *
 * Controls for the knob indicator (position marker).
 * Includes type selection, material, size, and position.
 */

import { Show } from 'solid-js';
import type { Component } from 'solid-js';
import type { IndicatorType } from '../../types/knobDesigner';
import {
  knobDesignerStore,
  toggleIndicator,
  setIndicatorType,
  updateIndicatorMaterial,
  updateIndicatorSize,
  setIndicatorPosition,
} from '../../stores/knobDesignerStore';
import { INDICATOR_CONSTRAINTS } from '../../domain/knobDesigner';
import styles from './IndicatorPanel.module.css';

// ============================================================================
// Component
// ============================================================================

export const IndicatorPanel: Component = () => {
  const indicator = () => knobDesignerStore.design.indicator;

  // Convert hex color to input format (#RRGGBB without alpha)
  const colorForInput = () => {
    const color = indicator()?.material.color ?? '#FFFFFFFF';
    return color.slice(0, 7);
  };

  // Convert input color back to #RRGGBBAA format
  const handleColorChange = (color: string) => {
    const existingAlpha = indicator()?.material.color.slice(7) || 'FF';
    updateIndicatorMaterial({ color: `${color}${existingAlpha}` });
  };

  return (
    <div class={styles.container}>
      {/* Enable Toggle */}
      <div class={styles.toggleRow}>
        <label class={styles.toggleLabel}>
          <input
            type="checkbox"
            checked={indicator()?.enabled ?? false}
            onChange={() => toggleIndicator()}
            class={styles.checkbox}
          />
          <span>Enable Indicator</span>
        </label>
      </div>

      <Show when={indicator()?.enabled}>
        {/* Indicator Type */}
        <div class={styles.field}>
          <label class={styles.label}>Type</label>
          <div class={styles.typeGrid}>
            <button
              type="button"
              class={`${styles.typeButton} ${indicator()?.type === 'dot' ? styles.typeActive : ''}`}
              onClick={() => setIndicatorType('dot')}
            >
              <span class={styles.typeIcon}>
                <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                  <circle cx="12" cy="12" r="6" />
                </svg>
              </span>
              Dot
            </button>
            <button
              type="button"
              class={`${styles.typeButton} ${indicator()?.type === 'line' ? styles.typeActive : ''}`}
              onClick={() => setIndicatorType('line')}
            >
              <span class={styles.typeIcon}>
                <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                  <rect x="10" y="4" width="4" height="16" />
                </svg>
              </span>
              Line
            </button>
            <button
              type="button"
              class={`${styles.typeButton} ${indicator()?.type === 'notch' ? styles.typeActive : ''}`}
              onClick={() => setIndicatorType('notch')}
            >
              <span class={styles.typeIcon}>
                <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                  <path d="M9 4h6v8H9z" />
                </svg>
              </span>
              Notch
            </button>
            <button
              type="button"
              class={`${styles.typeButton} ${indicator()?.type === 'groove' ? styles.typeActive : ''}`}
              onClick={() => setIndicatorType('groove')}
            >
              <span class={styles.typeIcon}>
                <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                  <path d="M4 11h16v2H4z" />
                </svg>
              </span>
              Groove
            </button>
          </div>
        </div>

        {/* Material */}
        <div class={styles.section}>
          <h4 class={styles.sectionTitle}>Material</h4>

          {/* Color */}
          <div class={styles.field}>
            <label class={styles.label}>Color</label>
            <div class={styles.colorInput}>
              <input
                type="color"
                value={colorForInput()}
                class={styles.colorPicker}
                onInput={(e) => handleColorChange(e.currentTarget.value)}
              />
              <input
                type="text"
                value={indicator()?.material.color ?? '#FFFFFFFF'}
                class={styles.colorText}
                placeholder="#RRGGBBAA"
                onInput={(e) => {
                  const value = e.currentTarget.value;
                  if (/^#[0-9A-Fa-f]{8}$/.test(value)) {
                    updateIndicatorMaterial({ color: value });
                  }
                }}
              />
            </div>
          </div>

          {/* Metallic Toggle */}
          <div class={styles.toggleRow}>
            <label class={styles.toggleLabel}>
              <input
                type="checkbox"
                checked={indicator()?.material.metallic ?? false}
                onChange={(e) => updateIndicatorMaterial({ metallic: e.currentTarget.checked })}
                class={styles.checkbox}
              />
              <span>Metallic</span>
            </label>
          </div>
        </div>

        {/* Size - Type-specific */}
        <div class={styles.section}>
          <h4 class={styles.sectionTitle}>Size</h4>

          <Show when={indicator()?.type === 'dot'}>
            <div class={styles.field}>
              <label class={styles.label}>Radius</label>
              <div class={styles.inputGroup}>
                <input
                  type="range"
                  min={INDICATOR_CONSTRAINTS.RADIUS.MIN}
                  max={INDICATOR_CONSTRAINTS.RADIUS.MAX}
                  value={indicator()?.size.radius ?? 3}
                  class={styles.slider}
                  onInput={(e) => {
                    updateIndicatorSize({ radius: parseInt(e.currentTarget.value, 10) });
                  }}
                />
                <span class={styles.value}>{indicator()?.size.radius ?? 3}px</span>
              </div>
            </div>
          </Show>

          <Show when={indicator()?.type === 'line'}>
            <div class={styles.field}>
              <label class={styles.label}>Length</label>
              <div class={styles.inputGroup}>
                <input
                  type="range"
                  min={INDICATOR_CONSTRAINTS.LENGTH.MIN}
                  max={INDICATOR_CONSTRAINTS.LENGTH.MAX}
                  value={indicator()?.size.length ?? 15}
                  class={styles.slider}
                  onInput={(e) => {
                    updateIndicatorSize({ length: parseInt(e.currentTarget.value, 10) });
                  }}
                />
                <span class={styles.value}>{indicator()?.size.length ?? 15}px</span>
              </div>
            </div>
            <div class={styles.field}>
              <label class={styles.label}>Width</label>
              <div class={styles.inputGroup}>
                <input
                  type="range"
                  min={INDICATOR_CONSTRAINTS.WIDTH.MIN}
                  max={INDICATOR_CONSTRAINTS.WIDTH.MAX}
                  value={indicator()?.size.width ?? 2}
                  class={styles.slider}
                  onInput={(e) => {
                    updateIndicatorSize({ width: parseInt(e.currentTarget.value, 10) });
                  }}
                />
                <span class={styles.value}>{indicator()?.size.width ?? 2}px</span>
              </div>
            </div>
          </Show>

          <Show when={indicator()?.type === 'notch' || indicator()?.type === 'groove'}>
            <div class={styles.field}>
              <label class={styles.label}>Depth</label>
              <div class={styles.inputGroup}>
                <input
                  type="range"
                  min={INDICATOR_CONSTRAINTS.DEPTH.MIN}
                  max={INDICATOR_CONSTRAINTS.DEPTH.MAX}
                  value={indicator()?.size.depth ?? 2}
                  class={styles.slider}
                  onInput={(e) => {
                    updateIndicatorSize({ depth: parseInt(e.currentTarget.value, 10) });
                  }}
                />
                <span class={styles.value}>{indicator()?.size.depth ?? 2}px</span>
              </div>
            </div>
            <div class={styles.field}>
              <label class={styles.label}>Width</label>
              <div class={styles.inputGroup}>
                <input
                  type="range"
                  min={INDICATOR_CONSTRAINTS.WIDTH.MIN}
                  max={INDICATOR_CONSTRAINTS.WIDTH.MAX}
                  value={indicator()?.size.width ?? 2}
                  class={styles.slider}
                  onInput={(e) => {
                    updateIndicatorSize({ width: parseInt(e.currentTarget.value, 10) });
                  }}
                />
                <span class={styles.value}>{indicator()?.size.width ?? 2}px</span>
              </div>
            </div>
          </Show>
        </div>

        {/* Position */}
        <div class={styles.section}>
          <h4 class={styles.sectionTitle}>Position</h4>
          <div class={styles.field}>
            <label class={styles.label}>Radial Position</label>
            <div class={styles.inputGroup}>
              <input
                type="range"
                min={INDICATOR_CONSTRAINTS.RADIAL_POSITION.MIN}
                max={INDICATOR_CONSTRAINTS.RADIAL_POSITION.MAX}
                value={indicator()?.radialPosition ?? 75}
                class={styles.slider}
                onInput={(e) => {
                  setIndicatorPosition(parseInt(e.currentTarget.value, 10));
                }}
              />
              <span class={styles.value}>{indicator()?.radialPosition ?? 75}%</span>
            </div>
            <span class={styles.hint}>Distance from center to edge</span>
          </div>
        </div>
      </Show>
    </div>
  );
};
