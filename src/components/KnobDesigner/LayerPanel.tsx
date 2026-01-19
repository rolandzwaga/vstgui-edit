/**
 * LayerPanel Component
 *
 * Displays the layer list and add/remove controls.
 * Allows selecting, reordering, and managing knob layers.
 */

import { For, Show } from 'solid-js';
import type { Component } from 'solid-js';
import {
  knobDesignerStore,
  addLayer,
  removeLayer,
  reorderLayer,
  updateLayerGeometry,
} from '../../stores/knobDesignerStore';
import { LAYER_CONSTRAINTS } from '../../domain/knobDesigner';
import styles from './LayerPanel.module.css';

// ============================================================================
// Props Interface
// ============================================================================

export interface LayerPanelProps {
  /** Currently selected layer ID */
  selectedLayerId: string | null;

  /** Callback when a layer is selected */
  onSelectLayer: (layerId: string | null) => void;
}

// ============================================================================
// Component
// ============================================================================

export const LayerPanel: Component<LayerPanelProps> = (props) => {
  const layers = () => knobDesignerStore.design.layers;
  const canAddLayer = () => layers().length < LAYER_CONSTRAINTS.MAX_LAYERS;
  const canRemoveLayer = () => layers().length > LAYER_CONSTRAINTS.MIN_LAYERS;

  const handleMoveUp = (layerId: string, currentIndex: number) => {
    if (currentIndex < layers().length - 1) {
      reorderLayer(layerId, currentIndex + 1);
    }
  };

  const handleMoveDown = (layerId: string, currentIndex: number) => {
    if (currentIndex > 0) {
      reorderLayer(layerId, currentIndex - 1);
    }
  };

  return (
    <div class={styles.container}>
      {/* Header */}
      <div class={styles.header}>
        <h3 class={styles.title}>Layers</h3>
        <button
          type="button"
          class={styles.addButton}
          onClick={() => addLayer()}
          disabled={!canAddLayer()}
          title={canAddLayer() ? 'Add layer' : `Maximum ${LAYER_CONSTRAINTS.MAX_LAYERS} layers`}
        >
          <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
            <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
          </svg>
          Add Layer
        </button>
      </div>

      {/* Layer List */}
      <div class={styles.layerList}>
        <For each={[...layers()].reverse()}>
          {(layer, index) => {
            const actualIndex = () => layers().length - 1 - index();
            const isSelected = () => layer.id === props.selectedLayerId;

            return (
              <div
                class={`${styles.layerItem} ${isSelected() ? styles.layerItemSelected : ''}`}
                onClick={() => props.onSelectLayer(layer.id)}
              >
                {/* Layer Info */}
                <div class={styles.layerInfo}>
                  <span class={styles.layerName}>{layer.name}</span>
                  <span class={styles.layerDetails}>
                    {layer.geometry.diameter}% dia, {layer.material.type}
                  </span>
                </div>

                {/* Layer Actions */}
                <div class={styles.layerActions}>
                  {/* Move Up */}
                  <button
                    type="button"
                    class={styles.iconButton}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleMoveUp(layer.id, actualIndex());
                    }}
                    disabled={actualIndex() >= layers().length - 1}
                    title="Move up"
                  >
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                      <path d="M7.41 15.41L12 10.83l4.59 4.58L18 14l-6-6-6 6z" />
                    </svg>
                  </button>

                  {/* Move Down */}
                  <button
                    type="button"
                    class={styles.iconButton}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleMoveDown(layer.id, actualIndex());
                    }}
                    disabled={actualIndex() <= 0}
                    title="Move down"
                  >
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                      <path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6z" />
                    </svg>
                  </button>

                  {/* Delete */}
                  <button
                    type="button"
                    class={`${styles.iconButton} ${styles.deleteButton}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      removeLayer(layer.id);
                      if (props.selectedLayerId === layer.id && layers().length > 1) {
                        const remaining = layers().filter(l => l.id !== layer.id);
                        props.onSelectLayer(remaining[0]?.id ?? null);
                      }
                    }}
                    disabled={!canRemoveLayer()}
                    title={canRemoveLayer() ? 'Remove layer' : 'At least one layer required'}
                  >
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                      <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
                    </svg>
                  </button>
                </div>
              </div>
            );
          }}
        </For>
      </div>

      {/* Selected Layer Geometry */}
      <Show when={props.selectedLayerId}>
        {(layerId) => {
          const layer = () => layers().find(l => l.id === layerId());
          return (
            <Show when={layer()}>
              <div class={styles.geometrySection}>
                <h4 class={styles.sectionTitle}>Geometry</h4>

                {/* Diameter */}
                <div class={styles.field}>
                  <label class={styles.label}>Diameter</label>
                  <div class={styles.inputGroup}>
                    <input
                      type="range"
                      min={LAYER_CONSTRAINTS.DIAMETER.MIN}
                      max={LAYER_CONSTRAINTS.DIAMETER.MAX}
                      value={layer()!.geometry.diameter}
                      class={styles.slider}
                      onInput={(e) => {
                        updateLayerGeometry(layerId(), {
                          diameter: parseInt(e.currentTarget.value, 10),
                        });
                      }}
                    />
                    <span class={styles.value}>{layer()!.geometry.diameter}%</span>
                  </div>
                </div>

                {/* Height */}
                <div class={styles.field}>
                  <label class={styles.label}>Height</label>
                  <div class={styles.inputGroup}>
                    <input
                      type="range"
                      min={LAYER_CONSTRAINTS.HEIGHT.MIN}
                      max={LAYER_CONSTRAINTS.HEIGHT.MAX}
                      value={layer()!.geometry.height}
                      class={styles.slider}
                      onInput={(e) => {
                        updateLayerGeometry(layerId(), {
                          height: parseInt(e.currentTarget.value, 10),
                        });
                      }}
                    />
                    <span class={styles.value}>{layer()!.geometry.height}%</span>
                  </div>
                </div>

                {/* Bevel Radius */}
                <div class={styles.field}>
                  <label class={styles.label}>Bevel</label>
                  <div class={styles.inputGroup}>
                    <input
                      type="range"
                      min={LAYER_CONSTRAINTS.BEVEL_RADIUS.MIN}
                      max={LAYER_CONSTRAINTS.BEVEL_RADIUS.MAX}
                      value={layer()!.geometry.bevelRadius}
                      class={styles.slider}
                      onInput={(e) => {
                        updateLayerGeometry(layerId(), {
                          bevelRadius: parseInt(e.currentTarget.value, 10),
                        });
                      }}
                    />
                    <span class={styles.value}>{layer()!.geometry.bevelRadius}px</span>
                  </div>
                </div>

                {/* Skirt Style */}
                <div class={styles.field}>
                  <label class={styles.label}>Skirt Style</label>
                  <select
                    class={styles.select}
                    value={layer()!.geometry.skirtStyle}
                    onChange={(e) => {
                      updateLayerGeometry(layerId(), {
                        skirtStyle: e.currentTarget.value as 'cylindrical' | 'tapered' | 'angled',
                      });
                    }}
                  >
                    <option value="cylindrical">Cylindrical</option>
                    <option value="tapered">Tapered</option>
                    <option value="angled">Angled</option>
                  </select>
                </div>
              </div>
            </Show>
          );
        }}
      </Show>
    </div>
  );
};
