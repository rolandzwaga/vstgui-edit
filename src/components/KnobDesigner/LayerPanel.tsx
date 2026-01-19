/**
 * LayerPanel Component
 *
 * Displays the layer list and geometry controls.
 * Allows selecting, reordering, and managing knob layers.
 * Uses props-based approach for the unified Control Designer.
 */

import { createSignal, For, Show } from 'solid-js';
import type { Component } from 'solid-js';
import type { BaseControlDesign } from '../../types/controlDesigner';
import type { KnobDesign, KnobLayer, LayerGeometry } from '../../types/knobDesigner';
import { LAYER_CONSTRAINTS } from '../../domain/knobDesigner';
import styles from './LayerPanel.module.css';

// ============================================================================
// Props Interface
// ============================================================================

export interface LayerPanelProps {
  /** Current knob design */
  design: BaseControlDesign;

  /** Callback to update design */
  onUpdate: (updates: Partial<KnobDesign>) => void;
}

// ============================================================================
// Component
// ============================================================================

export const LayerPanel: Component<LayerPanelProps> = (props) => {
  // Local state for selected layer
  const [selectedLayerId, setSelectedLayerId] = createSignal<string | null>(null);

  // Type-safe accessor for knob design
  const knobDesign = () => props.design as KnobDesign;
  const layers = () => knobDesign().layers;
  const canAddLayer = () => layers().length < LAYER_CONSTRAINTS.MAX_LAYERS;
  const canRemoveLayer = () => layers().length > LAYER_CONSTRAINTS.MIN_LAYERS;

  // Auto-select first layer if none selected
  const effectiveSelectedId = () => {
    const id = selectedLayerId();
    if (id && layers().find((l) => l.id === id)) {
      return id;
    }
    return layers()[0]?.id ?? null;
  };

  const addLayer = () => {
    const currentLayers = layers();
    if (currentLayers.length >= LAYER_CONSTRAINTS.MAX_LAYERS) return;

    const newLayer: KnobLayer = {
      id: crypto.randomUUID(),
      name: `Layer ${currentLayers.length + 1}`,
      geometry: {
        diameter: Math.max(10, 80 - currentLayers.length * 20),
        height: 30,
        bevelRadius: 2,
        skirtStyle: 'cylindrical',
      },
      material: {
        type: 'metallic',
        color: '#808080FF',
        shininess: 64,
        reflectivity: 50,
        brushDirection: 'radial',
        brushIntensity: 0,
      },
    };

    props.onUpdate({
      layers: [...currentLayers, newLayer],
    });
    setSelectedLayerId(newLayer.id);
  };

  const removeLayer = (layerId: string) => {
    const currentLayers = layers();
    if (currentLayers.length <= LAYER_CONSTRAINTS.MIN_LAYERS) return;

    const newLayers = currentLayers.filter((l) => l.id !== layerId);
    props.onUpdate({ layers: newLayers });

    // Select another layer if the removed one was selected
    if (selectedLayerId() === layerId) {
      setSelectedLayerId(newLayers[0]?.id ?? null);
    }
  };

  const reorderLayer = (layerId: string, newIndex: number) => {
    const currentLayers = [...layers()];
    const currentIndex = currentLayers.findIndex((l) => l.id === layerId);
    if (currentIndex === -1) return;

    const [layer] = currentLayers.splice(currentIndex, 1);
    currentLayers.splice(newIndex, 0, layer);
    props.onUpdate({ layers: currentLayers });
  };

  const updateLayerGeometry = (layerId: string, updates: Partial<LayerGeometry>) => {
    const newLayers = layers().map((layer) => {
      if (layer.id === layerId) {
        return {
          ...layer,
          geometry: { ...layer.geometry, ...updates },
        };
      }
      return layer;
    });
    props.onUpdate({ layers: newLayers });
  };

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
          onClick={addLayer}
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
            const isSelected = () => layer.id === effectiveSelectedId();

            return (
              <div
                class={`${styles.layerItem} ${isSelected() ? styles.layerItemSelected : ''}`}
                onClick={() => setSelectedLayerId(layer.id)}
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
      <Show when={effectiveSelectedId()}>
        {(layerId) => {
          const layer = () => layers().find((l) => l.id === layerId());
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
