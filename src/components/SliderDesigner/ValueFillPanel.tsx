/**
 * ValueFillPanel Component (Stub)
 *
 * Controls for slider value fill configuration including
 * mode, color, and glow intensity.
 *
 * This is an initial stub implementation for Phase 4.
 * Full implementation will be completed in Phase 5.
 */

import { For } from 'solid-js';
import type { Component } from 'solid-js';
import type { BaseControlDesign } from '../../types/controlDesigner';
import type { SliderDesign, ValueFillMode } from '../../types/controlDesigner/slider';
import { VALUE_FILL_CONSTRAINTS } from '../../domain/sliderDesigner/validation';
import styles from './ValueFillPanel.module.css';

// ============================================================================
// Constants
// ============================================================================

const VALUE_FILL_MODES: { value: ValueFillMode; label: string; description: string }[] = [
  { value: 'none', label: 'None', description: 'No value fill' },
  { value: 'fromStart', label: 'From Start', description: 'Fill from beginning to handle' },
  { value: 'fromCenter', label: 'From Center', description: 'Fill from center to handle' },
  { value: 'segmented', label: 'Segmented', description: 'LED-style segments' },
];

// ============================================================================
// Props Interface
// ============================================================================

export interface ValueFillPanelProps {
  /** Current slider design */
  design: BaseControlDesign;

  /** Callback to update design */
  onUpdate: (updates: Partial<SliderDesign>) => void;
}

// ============================================================================
// Component
// ============================================================================

export const ValueFillPanel: Component<ValueFillPanelProps> = (props) => {
  // Type guard to access slider-specific properties
  const valueFill = () => (props.design as SliderDesign).valueFill;

  const handleModeChange = (mode: ValueFillMode) => {
    props.onUpdate({
      valueFill: {
        ...valueFill(),
        mode,
      },
    } as Partial<SliderDesign>);
  };

  const handleColorChange = (color: string) => {
    // Ensure color is in #RRGGBBAA format
    const fullColor = color.length === 7 ? `${color}FF` : color;
    props.onUpdate({
      valueFill: {
        ...valueFill(),
        color: fullColor,
      },
    } as Partial<SliderDesign>);
  };

  const handleGlowChange = (glowIntensity: number) => {
    props.onUpdate({
      valueFill: {
        ...valueFill(),
        glowIntensity,
      },
    } as Partial<SliderDesign>);
  };

  // Convert hex color to input format (#RRGGBB without alpha)
  const colorForInput = () => {
    const hex = valueFill().color;
    return hex.slice(0, 7);
  };

  return (
    <div class={styles.container}>
      <h4 class={styles.title}>Value Fill</h4>

      {/* Mode */}
      <div class={styles.field}>
        <label class={styles.label}>Display Mode</label>
        <select
          class={styles.select}
          value={valueFill().mode}
          onChange={(e) => handleModeChange(e.currentTarget.value as ValueFillMode)}
        >
          <For each={VALUE_FILL_MODES}>
            {(mode) => <option value={mode.value}>{mode.label}</option>}
          </For>
        </select>
        <span class={styles.hint}>
          {VALUE_FILL_MODES.find((m) => m.value === valueFill().mode)?.description}
        </span>
      </div>

      {/* Color (only show if mode is not 'none') */}
      {valueFill().mode !== 'none' && (
        <>
          <div class={styles.field}>
            <label class={styles.label}>Fill Color</label>
            <div class={styles.colorInput}>
              <input
                type="color"
                value={colorForInput()}
                class={styles.colorPicker}
                onInput={(e) => handleColorChange(e.currentTarget.value)}
              />
              <input
                type="text"
                value={valueFill().color}
                class={styles.colorText}
                placeholder="#RRGGBBAA"
                onInput={(e) => {
                  const value = e.currentTarget.value;
                  if (/^#[0-9A-Fa-f]{8}$/.test(value)) {
                    props.onUpdate({
                      valueFill: {
                        ...valueFill(),
                        color: value,
                      },
                    } as Partial<SliderDesign>);
                  }
                }}
              />
            </div>
          </div>

          {/* Glow Intensity */}
          <div class={styles.field}>
            <label class={styles.label}>Glow Intensity</label>
            <div class={styles.inputGroup}>
              <input
                type="range"
                min={VALUE_FILL_CONSTRAINTS.GLOW_INTENSITY.MIN}
                max={VALUE_FILL_CONSTRAINTS.GLOW_INTENSITY.MAX}
                value={valueFill().glowIntensity}
                class={styles.slider}
                onInput={(e) => handleGlowChange(parseInt(e.currentTarget.value, 10))}
              />
              <span class={styles.value}>{valueFill().glowIntensity}%</span>
            </div>
            <span class={styles.hint}>Brightness of the fill glow effect</span>
          </div>
        </>
      )}
    </div>
  );
};
