/**
 * MaterialPanel Component
 *
 * Controls for layer material properties including type, color,
 * shininess, reflectivity, and brushed metal settings.
 */

import { Show } from 'solid-js';
import type { Component } from 'solid-js';
import type { KnobLayer, MaterialType, BrushDirection } from '../../types/knobDesigner';
import { updateLayerMaterial } from '../../stores/knobDesignerStore';
import { MATERIAL_CONSTRAINTS } from '../../domain/knobDesigner';
import styles from './MaterialPanel.module.css';

// ============================================================================
// Props Interface
// ============================================================================

export interface MaterialPanelProps {
  /** The layer to edit */
  layer: KnobLayer;
}

// ============================================================================
// Component
// ============================================================================

export const MaterialPanel: Component<MaterialPanelProps> = (props) => {
  const material = () => props.layer.material;

  // Convert hex color to input format (#RRGGBB without alpha)
  const colorForInput = () => {
    const hex = material().color;
    return hex.slice(0, 7); // Remove alpha
  };

  // Convert input color back to #RRGGBBAA format
  const handleColorChange = (color: string) => {
    // Keep existing alpha
    const existingAlpha = material().color.slice(7) || 'FF';
    updateLayerMaterial(props.layer.id, { color: `${color}${existingAlpha}` });
  };

  return (
    <div class={styles.container}>
      <h4 class={styles.sectionTitle}>Material</h4>

      {/* Material Type */}
      <div class={styles.field}>
        <label class={styles.label}>Type</label>
        <select
          class={styles.select}
          value={material().type}
          onChange={(e) => {
            updateLayerMaterial(props.layer.id, {
              type: e.currentTarget.value as MaterialType,
            });
          }}
        >
          <option value="solid">Solid Color</option>
          <option value="metallic">Metallic</option>
          <option value="matte">Matte</option>
          <option value="brushed">Brushed Metal</option>
        </select>
      </div>

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
            value={material().color}
            class={styles.colorText}
            placeholder="#RRGGBBAA"
            onInput={(e) => {
              const value = e.currentTarget.value;
              if (/^#[0-9A-Fa-f]{8}$/.test(value)) {
                updateLayerMaterial(props.layer.id, { color: value });
              }
            }}
          />
        </div>
      </div>

      {/* Metallic Properties */}
      <Show when={material().type === 'metallic' || material().type === 'brushed'}>
        {/* Shininess */}
        <div class={styles.field}>
          <label class={styles.label}>Shininess</label>
          <div class={styles.inputGroup}>
            <input
              type="range"
              min={MATERIAL_CONSTRAINTS.SHININESS.MIN}
              max={MATERIAL_CONSTRAINTS.SHININESS.MAX}
              value={material().shininess}
              class={styles.slider}
              onInput={(e) => {
                updateLayerMaterial(props.layer.id, {
                  shininess: parseInt(e.currentTarget.value, 10),
                });
              }}
            />
            <span class={styles.value}>{material().shininess}</span>
          </div>
        </div>

        {/* Reflectivity */}
        <div class={styles.field}>
          <label class={styles.label}>Reflectivity</label>
          <div class={styles.inputGroup}>
            <input
              type="range"
              min={MATERIAL_CONSTRAINTS.REFLECTIVITY.MIN}
              max={MATERIAL_CONSTRAINTS.REFLECTIVITY.MAX}
              value={material().reflectivity}
              class={styles.slider}
              onInput={(e) => {
                updateLayerMaterial(props.layer.id, {
                  reflectivity: parseInt(e.currentTarget.value, 10),
                });
              }}
            />
            <span class={styles.value}>{material().reflectivity}%</span>
          </div>
        </div>
      </Show>

      {/* Brushed Metal Properties */}
      <Show when={material().type === 'brushed'}>
        {/* Brush Direction */}
        <div class={styles.field}>
          <label class={styles.label}>Brush Direction</label>
          <div class={styles.buttonGroup}>
            <button
              type="button"
              class={`${styles.toggleButton} ${material().brushDirection === 'radial' ? styles.toggleActive : ''}`}
              onClick={() => {
                updateLayerMaterial(props.layer.id, { brushDirection: 'radial' });
              }}
            >
              Radial
            </button>
            <button
              type="button"
              class={`${styles.toggleButton} ${material().brushDirection === 'linear' ? styles.toggleActive : ''}`}
              onClick={() => {
                updateLayerMaterial(props.layer.id, { brushDirection: 'linear' });
              }}
            >
              Linear
            </button>
          </div>
        </div>

        {/* Brush Intensity */}
        <div class={styles.field}>
          <label class={styles.label}>Brush Intensity</label>
          <div class={styles.inputGroup}>
            <input
              type="range"
              min={MATERIAL_CONSTRAINTS.BRUSH_INTENSITY.MIN}
              max={MATERIAL_CONSTRAINTS.BRUSH_INTENSITY.MAX}
              value={material().brushIntensity}
              class={styles.slider}
              onInput={(e) => {
                updateLayerMaterial(props.layer.id, {
                  brushIntensity: parseInt(e.currentTarget.value, 10),
                });
              }}
            />
            <span class={styles.value}>{material().brushIntensity}%</span>
          </div>
        </div>
      </Show>
    </div>
  );
};

export default MaterialPanel;
