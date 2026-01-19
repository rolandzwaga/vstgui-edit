/**
 * KnobDesignerModal Component
 *
 * Main modal dialog for the 3D Knob Designer.
 * Contains the preview canvas, parameter panels, and action buttons.
 */

import { createEffect, createSignal, onCleanup, Show } from 'solid-js';
import type { Component } from 'solid-js';
import {
  knobDesignerStore,
  closeKnobDesigner,
  generateFilmstrip,
  cancelGeneration,
  undo,
  redo,
  setCameraView,
} from '../../stores/knobDesignerStore';
import { KnobPreview } from './KnobPreview';
import { LayerPanel } from './LayerPanel';
import { MaterialPanel } from './MaterialPanel';
import { IndicatorPanel } from './IndicatorPanel';
import { LightingPanel } from './LightingPanel';
import { OutputPanel } from './OutputPanel';
import { PresetSelector } from './PresetSelector';
import styles from './KnobDesignerModal.module.css';

// ============================================================================
// Component
// ============================================================================

export const KnobDesignerModal: Component = () => {
  const [activeTab, setActiveTab] = createSignal<'layers' | 'indicator' | 'lighting' | 'output'>('layers');
  const [selectedLayerId, setSelectedLayerId] = createSignal<string | null>(null);

  // Keyboard shortcut handler
  const handleKeyDown = (e: KeyboardEvent) => {
    // Only handle when modal is open
    if (!knobDesignerStore.isOpen) return;

    // Prevent default for our shortcuts
    if (e.ctrlKey || e.metaKey) {
      if (e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
      } else if (e.key === 'y' || (e.key === 'z' && e.shiftKey)) {
        e.preventDefault();
        redo();
      }
    }

    // Escape to close or cancel
    if (e.key === 'Escape') {
      e.preventDefault();
      if (knobDesignerStore.generationProgress) {
        cancelGeneration();
      } else {
        closeKnobDesigner();
      }
    }
  };

  // Attach/detach keyboard listener
  createEffect(() => {
    if (knobDesignerStore.isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }
  });

  onCleanup(() => {
    document.removeEventListener('keydown', handleKeyDown);
  });

  // Auto-select first layer on open
  createEffect(() => {
    if (knobDesignerStore.isOpen && knobDesignerStore.design.layers.length > 0) {
      if (!selectedLayerId()) {
        setSelectedLayerId(knobDesignerStore.design.layers[0].id);
      }
    }
  });

  // Get selected layer
  const selectedLayer = () => {
    const id = selectedLayerId();
    if (!id) return null;
    return knobDesignerStore.design.layers.find(l => l.id === id) ?? null;
  };

  // Handle generate button
  const handleGenerate = async () => {
    await generateFilmstrip();
  };

  return (
    <Show when={knobDesignerStore.isOpen}>
      <div
        class={styles.overlay}
        role="dialog"
        aria-modal="true"
        aria-labelledby="knob-designer-title"
      >
        <div class={styles.modal} onClick={(e) => e.stopPropagation()}>
          {/* Header */}
          <div class={styles.header}>
            <h2 id="knob-designer-title" class={styles.title}>
              Design Knob: {knobDesignerStore.targetBitmapName}
            </h2>
            <div class={styles.headerActions}>
              <PresetSelector />
              <button
                type="button"
                class={styles.closeButton}
                onClick={() => closeKnobDesigner()}
                aria-label="Close"
              >
                <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                  <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                </svg>
              </button>
            </div>
          </div>

          {/* Main Content */}
          <div class={styles.content}>
            {/* Preview Section */}
            <div class={styles.previewSection}>
              <KnobPreview
                design={knobDesignerStore.design}
                onError={(msg) => console.error('WebGL Error:', msg)}
              />
              {/* Camera View Toggle */}
              <div class={styles.viewToggle} role="group" aria-label="Camera view">
                <button
                  type="button"
                  class={`${styles.viewToggleButton} ${knobDesignerStore.design.cameraView === 'top' ? styles.viewToggleActive : ''}`}
                  onClick={() => setCameraView('top')}
                  title="Top view (looking down at knob)"
                >
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                    <circle cx="12" cy="12" r="8" stroke="currentColor" stroke-width="2" fill="none" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                  Top
                </button>
                <button
                  type="button"
                  class={`${styles.viewToggleButton} ${knobDesignerStore.design.cameraView === 'side' ? styles.viewToggleActive : ''}`}
                  onClick={() => setCameraView('side')}
                  title="Side view (looking at knob from front)"
                >
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                    <rect x="4" y="8" width="16" height="8" rx="2" stroke="currentColor" stroke-width="2" fill="none" />
                    <line x1="12" y1="8" x2="12" y2="4" stroke="currentColor" stroke-width="2" />
                  </svg>
                  Side
                </button>
              </div>
            </div>

            {/* Control Section */}
            <div class={styles.controlSection}>
              {/* Tab Bar */}
              <div class={styles.tabBar} role="tablist" aria-label="Knob design settings">
                <button
                  type="button"
                  id="tab-layers"
                  role="tab"
                  aria-selected={activeTab() === 'layers'}
                  aria-controls="panel-layers"
                  class={`${styles.tab} ${activeTab() === 'layers' ? styles.tabActive : ''}`}
                  onClick={() => setActiveTab('layers')}
                >
                  Layers
                </button>
                <button
                  type="button"
                  id="tab-indicator"
                  role="tab"
                  aria-selected={activeTab() === 'indicator'}
                  aria-controls="panel-indicator"
                  class={`${styles.tab} ${activeTab() === 'indicator' ? styles.tabActive : ''}`}
                  onClick={() => setActiveTab('indicator')}
                >
                  Indicator
                </button>
                <button
                  type="button"
                  id="tab-lighting"
                  role="tab"
                  aria-selected={activeTab() === 'lighting'}
                  aria-controls="panel-lighting"
                  class={`${styles.tab} ${activeTab() === 'lighting' ? styles.tabActive : ''}`}
                  onClick={() => setActiveTab('lighting')}
                >
                  Lighting
                </button>
                <button
                  type="button"
                  id="tab-output"
                  role="tab"
                  aria-selected={activeTab() === 'output'}
                  aria-controls="panel-output"
                  class={`${styles.tab} ${activeTab() === 'output' ? styles.tabActive : ''}`}
                  onClick={() => setActiveTab('output')}
                >
                  Output
                </button>
              </div>

              {/* Tab Content */}
              <div class={styles.tabContent}>
                <Show when={activeTab() === 'layers'}>
                  <div id="panel-layers" role="tabpanel" aria-labelledby="tab-layers" class={styles.layersTab}>
                    <LayerPanel
                      selectedLayerId={selectedLayerId()}
                      onSelectLayer={setSelectedLayerId}
                    />
                    <Show when={selectedLayer()}>
                      <MaterialPanel layer={selectedLayer()!} />
                    </Show>
                  </div>
                </Show>

                <Show when={activeTab() === 'indicator'}>
                  <div id="panel-indicator" role="tabpanel" aria-labelledby="tab-indicator">
                    <IndicatorPanel />
                  </div>
                </Show>

                <Show when={activeTab() === 'lighting'}>
                  <div id="panel-lighting" role="tabpanel" aria-labelledby="tab-lighting">
                    <LightingPanel />
                  </div>
                </Show>

                <Show when={activeTab() === 'output'}>
                  <div id="panel-output" role="tabpanel" aria-labelledby="tab-output">
                    <OutputPanel />
                  </div>
                </Show>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div class={styles.footer}>
            {/* Undo/Redo */}
            <div class={styles.historyButtons}>
              <button
                type="button"
                class={styles.historyButton}
                onClick={() => undo()}
                disabled={!knobDesignerStore.canUndo}
                title={knobDesignerStore.undoDescription ?? 'Undo'}
              >
                <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                  <path d="M12.5 8c-2.65 0-5.05.99-6.9 2.6L2 7v9h9l-3.62-3.62c1.39-1.16 3.16-1.88 5.12-1.88 3.54 0 6.55 2.31 7.6 5.5l2.37-.78C21.08 11.03 17.15 8 12.5 8z" />
                </svg>
              </button>
              <button
                type="button"
                class={styles.historyButton}
                onClick={() => redo()}
                disabled={!knobDesignerStore.canRedo}
                title={knobDesignerStore.redoDescription ?? 'Redo'}
              >
                <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                  <path d="M18.4 10.6C16.55 8.99 14.15 8 11.5 8c-4.65 0-8.58 3.03-9.96 7.22L3.9 16c1.05-3.19 4.05-5.5 7.6-5.5 1.95 0 3.73.72 5.12 1.88L13 16h9V7l-3.6 3.6z" />
                </svg>
              </button>
            </div>

            {/* Error Message */}
            <Show when={knobDesignerStore.errorMessage}>
              <div class={styles.errorMessage}>
                {knobDesignerStore.errorMessage}
              </div>
            </Show>

            {/* Generation Progress */}
            <Show when={knobDesignerStore.generationProgress}>
              <div class={styles.progressContainer}>
                <div class={styles.progressBar}>
                  <div
                    class={styles.progressFill}
                    style={{ width: `${knobDesignerStore.generationProgress?.percent ?? 0}%` }}
                  />
                </div>
                <span class={styles.progressText}>
                  {knobDesignerStore.generationProgress?.stage === 'preparing' && 'Preparing...'}
                  {knobDesignerStore.generationProgress?.stage === 'rendering' &&
                    `Rendering frame ${knobDesignerStore.generationProgress.currentFrame + 1} of ${knobDesignerStore.generationProgress.totalFrames}`}
                  {knobDesignerStore.generationProgress?.stage === 'compositing' && 'Compositing...'}
                  {knobDesignerStore.generationProgress?.stage === 'complete' && 'Complete!'}
                </span>
              </div>
            </Show>

            {/* Action Buttons */}
            <div class={styles.actionButtons}>
              <button
                type="button"
                class={styles.cancelButton}
                onClick={() => {
                  if (knobDesignerStore.generationProgress) {
                    cancelGeneration();
                  } else {
                    closeKnobDesigner();
                  }
                }}
              >
                {knobDesignerStore.generationProgress ? 'Cancel' : 'Close'}
              </button>
              <button
                type="button"
                class={styles.generateButton}
                onClick={handleGenerate}
                disabled={!!knobDesignerStore.generationProgress}
              >
                {knobDesignerStore.generationProgress ? 'Generating...' : 'Generate Filmstrip'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Show>
  );
};

export default KnobDesignerModal;
