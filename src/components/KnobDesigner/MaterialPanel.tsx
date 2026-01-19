/**
 * MaterialPanel Component
 *
 * Controls for layer material properties including type, color,
 * shininess, reflectivity, and brushed metal settings.
 *
 * Supports both knob layers and slider components via optional target selector.
 */

import { Show } from 'solid-js';
import type { Component } from 'solid-js';
import type { KnobLayer, MaterialType, BrushDirection, LayerMaterial } from '../../types/knobDesigner';
import { updateLayerMaterial } from '../../stores/knobDesignerStore';
import { MATERIAL_CONSTRAINTS } from '../../domain/knobDesigner';
import styles from './MaterialPanel.module.css';

// ============================================================================
// Types
// ============================================================================

/**
 * Target option for the component selector dropdown.
 */
export interface MaterialTargetOption {
  /** Unique identifier for the target */
  id: string;
  /** Display label for the target */
  label: string;
}

// ============================================================================
// Props Interface
// ============================================================================

export interface MaterialPanelProps {
  /** The layer to edit (for knob workflow) */
  layer: KnobLayer;

  /**
   * Available targets for component selection (optional).
   * When provided, shows a dropdown to select which component to edit.
   * Used for slider components (track, handle, fill).
   */
  availableTargets?: MaterialTargetOption[];

  /**
   * Currently selected target ID (optional).
   * Must be provided when availableTargets is set.
   */
  selectedTarget?: string;

  /**
   * Callback when target selection changes (optional).
   * Called when user selects a different component from dropdown.
   */
  onTargetChange?: (targetId: string) => void;

  /**
   * Custom material update handler (optional).
   * When provided, overrides the default updateLayerMaterial call.
   * Used by the unified control designer to update materials through its store.
   */
  onMaterialUpdate?: (material: Partial<LayerMaterial>) => void;
}

// ============================================================================
// Component
// ============================================================================

export const MaterialPanel: Component<MaterialPanelProps> = (props) => {
  const material = () => props.layer.material;

  // Helper to update material - uses custom handler if provided, else default store action
  const handleMaterialUpdate = (updates: Partial<LayerMaterial>) => {
    if (props.onMaterialUpdate) {
      props.onMaterialUpdate(updates);
    } else {
      updateLayerMaterial(props.layer.id, updates);
    }
  };

  // Convert hex color to input format (#RRGGBB without alpha)
  const colorForInput = () => {
    const hex = material().color;
    return hex.slice(0, 7); // Remove alpha
  };

  // Convert input color back to #RRGGBBAA format
  const handleColorChange = (color: string) => {
    // Keep existing alpha
    const existingAlpha = material().color.slice(7) || 'FF';
    handleMaterialUpdate({ color: `${color}${existingAlpha}` });
  };

  return (
    <div class={styles.container}>
      <h4 class={styles.sectionTitle}>Material</h4>

      {/* Target Selector - only shown when availableTargets is provided */}
      <Show when={props.availableTargets && props.availableTargets.length > 0}>
        <div class={styles.field}>
          <label class={styles.label}>Component</label>
          <select
            class={styles.select}
            value={props.selectedTarget ?? ''}
            onChange={(e) => {
              props.onTargetChange?.(e.currentTarget.value);
            }}
          >
            {props.availableTargets?.map((target) => (
              <option value={target.id}>{target.label}</option>
            ))}
          </select>
        </div>
      </Show>

      {/* Material Type */}
      <div class={styles.field}>
        <label class={styles.label}>Type</label>
        <select
          class={styles.select}
          value={material().type}
          onChange={(e) => {
            handleMaterialUpdate({
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
                handleMaterialUpdate({ color: value });
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
                handleMaterialUpdate({
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
                handleMaterialUpdate({
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
                handleMaterialUpdate({ brushDirection: 'radial' });
              }}
            >
              Radial
            </button>
            <button
              type="button"
              class={`${styles.toggleButton} ${material().brushDirection === 'linear' ? styles.toggleActive : ''}`}
              onClick={() => {
                handleMaterialUpdate({ brushDirection: 'linear' });
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
                handleMaterialUpdate({
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
