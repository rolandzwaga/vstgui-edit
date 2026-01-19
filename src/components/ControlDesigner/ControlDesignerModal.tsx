/**
 * ControlDesignerModal Component
 *
 * Unified modal dialog for the multi-type Control Designer.
 * Contains control type tabs, preview canvas, parameter panels, and action buttons.
 * Uses a plugin system to render type-specific geometry panels.
 */

import { createEffect, createSignal, onCleanup, Show, For } from 'solid-js';
import type { Component } from 'solid-js';
import {
  controlDesignerStore,
  closeControlDesigner,
  switchControlType,
  generateFilmstrip,
  cancelGeneration,
  undo,
  redo,
  updateLighting,
  updateOutput,
  loadPreset,
  savePreset,
  deletePreset,
} from '../../stores/controlDesignerStore';
import type { CameraView } from '../../types/controlDesigner';
import { ControlTypeTabs } from './ControlTypeTabs';
import { ControlPreview } from './ControlPreview';
import { LightingPanel } from './LightingPanel';
import { PresetSelector } from '../KnobDesigner/PresetSelector';
import { OutputPanel } from '../KnobDesigner/OutputPanel';
import styles from './ControlDesignerModal.module.css';

// ============================================================================
// Component
// ============================================================================

export const ControlDesignerModal: Component = () => {
  const [activeTab, setActiveTab] = createSignal<'geometry' | 'lighting' | 'output'>('geometry');
  const [previewPosition, setPreviewPosition] = createSignal(0.5);

  // Keyboard shortcut handler
  const handleKeyDown = (e: KeyboardEvent) => {
    // Only handle when modal is open
    if (!controlDesignerStore.isOpen) return;

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
      if (controlDesignerStore.generationProgress) {
        cancelGeneration();
      } else {
        closeControlDesigner();
      }
    }
  };

  // Attach/detach keyboard listener
  createEffect(() => {
    if (controlDesignerStore.isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }
  });

  onCleanup(() => {
    document.removeEventListener('keydown', handleKeyDown);
  });

  // Handle generate button
  const handleGenerate = async () => {
    await generateFilmstrip();
  };

  // Get the active plugin's geometry panels
  const geometryPanels = () => {
    const plugin = controlDesignerStore.activePlugin;
    return plugin?.geometryPanels ?? [];
  };

  // Camera view control
  const handleCameraViewChange = (view: CameraView) => {
    // TODO: Dispatch camera view change to active design
    // For now, this is a placeholder
    console.log('Camera view change:', view);
  };

  return (
    <Show when={controlDesignerStore.isOpen}>
      <div
        class={styles.overlay}
        role="dialog"
        aria-modal="true"
        aria-labelledby="control-designer-title"
      >
        <div class={styles.modal} onClick={(e) => e.stopPropagation()}>
          {/* Header */}
          <div class={styles.header}>
            <h2 id="control-designer-title" class={styles.title}>
              Design Control: {controlDesignerStore.targetBitmapName}
            </h2>
            <div class={styles.headerActions}>
              <PresetSelector
                controlType={controlDesignerStore.activeControlType}
                selectedPresetId={controlDesignerStore.selectedPresetId}
                isModified={controlDesignerStore.isModified}
                onLoadPreset={loadPreset}
                onSavePreset={savePreset}
                onDeletePreset={deletePreset}
              />
              <button
                type="button"
                class={styles.closeButton}
                onClick={() => closeControlDesigner()}
                aria-label="Close"
              >
                <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                  <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                </svg>
              </button>
            </div>
          </div>

          {/* Control Type Tabs */}
          <ControlTypeTabs
            activeType={controlDesignerStore.activeControlType}
            plugins={controlDesignerStore.registeredPlugins}
            onTabChange={switchControlType}
          />

          {/* Main Content */}
          <div class={styles.content}>
            {/* Preview Section */}
            <div class={styles.previewSection}>
              <ControlPreview
                design={controlDesignerStore.activeDesign}
                plugin={controlDesignerStore.activePlugin}
                previewPosition={previewPosition()}
                onError={(msg) => console.error('WebGL Error:', msg)}
              />

              {/* Camera View Toggle */}
              <div class={styles.viewToggle} role="group" aria-label="Camera view">
                <button
                  type="button"
                  class={`${styles.viewToggleButton} ${controlDesignerStore.activeDesign?.cameraView === 'top' ? styles.viewToggleActive : ''}`}
                  onClick={() => handleCameraViewChange('top')}
                  title="Top view (looking down at control)"
                >
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                    <circle
                      cx="12"
                      cy="12"
                      r="8"
                      stroke="currentColor"
                      stroke-width="2"
                      fill="none"
                    />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                  Top
                </button>
                <button
                  type="button"
                  class={`${styles.viewToggleButton} ${controlDesignerStore.activeDesign?.cameraView === 'side' ? styles.viewToggleActive : ''}`}
                  onClick={() => handleCameraViewChange('side')}
                  title="Side view (looking at control from front)"
                >
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                    <rect
                      x="4"
                      y="8"
                      width="16"
                      height="8"
                      rx="2"
                      stroke="currentColor"
                      stroke-width="2"
                      fill="none"
                    />
                    <line x1="12" y1="8" x2="12" y2="4" stroke="currentColor" stroke-width="2" />
                  </svg>
                  Side
                </button>
              </div>

              {/* Preview Position Slider (for linear controls) */}
              <Show when={controlDesignerStore.activePlugin?.category === 'linear'}>
                <div class={styles.positionSlider}>
                  <label class={styles.positionLabel}>Preview Position</label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={previewPosition()}
                    class={styles.positionInput}
                    onInput={(e) => setPreviewPosition(parseFloat(e.currentTarget.value))}
                  />
                  <span class={styles.positionValue}>{Math.round(previewPosition() * 100)}%</span>
                </div>
              </Show>
            </div>

            {/* Control Section */}
            <div class={styles.controlSection}>
              {/* Tab Bar */}
              <div class={styles.tabBar} role="tablist" aria-label="Control design settings">
                <button
                  type="button"
                  id="tab-geometry"
                  role="tab"
                  aria-selected={activeTab() === 'geometry'}
                  aria-controls="panel-geometry"
                  class={`${styles.tab} ${activeTab() === 'geometry' ? styles.tabActive : ''}`}
                  onClick={() => setActiveTab('geometry')}
                >
                  Geometry
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
                {/* Geometry Tab - Plugin-specific panels */}
                <Show when={activeTab() === 'geometry'}>
                  <div id="panel-geometry" role="tabpanel" aria-labelledby="tab-geometry">
                    <For each={geometryPanels()}>
                      {(panel) => {
                        const Panel = panel.component;
                        return (
                          <div class={styles.panelSection}>
                            <Panel
                              design={controlDesignerStore.activeDesign!}
                              onUpdate={(updates) => {
                                // TODO: Dispatch to appropriate update function
                                console.log('Panel update:', updates);
                              }}
                            />
                          </div>
                        );
                      }}
                    </For>

                    {/* Fallback when no geometry panels */}
                    <Show when={geometryPanels().length === 0}>
                      <div class={styles.emptyPanel}>
                        <p>No geometry panels available for this control type.</p>
                      </div>
                    </Show>
                  </div>
                </Show>

                {/* Lighting Tab */}
                <Show when={activeTab() === 'lighting'}>
                  <div id="panel-lighting" role="tabpanel" aria-labelledby="tab-lighting">
                    <Show when={controlDesignerStore.activeDesign}>
                      <LightingPanel
                        lighting={controlDesignerStore.activeDesign!.lighting}
                        onUpdate={updateLighting}
                      />
                    </Show>
                  </div>
                </Show>

                {/* Output Tab */}
                <Show when={activeTab() === 'output'}>
                  <div id="panel-output" role="tabpanel" aria-labelledby="tab-output">
                    <Show when={controlDesignerStore.activeDesign}>
                      <OutputPanel
                        category={controlDesignerStore.activePlugin?.category}
                        output={controlDesignerStore.activeDesign!.output}
                        onOutputUpdate={updateOutput}
                      />
                    </Show>
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
                disabled={!controlDesignerStore.canUndo}
                title={controlDesignerStore.undoDescription ?? 'Undo'}
              >
                <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                  <path d="M12.5 8c-2.65 0-5.05.99-6.9 2.6L2 7v9h9l-3.62-3.62c1.39-1.16 3.16-1.88 5.12-1.88 3.54 0 6.55 2.31 7.6 5.5l2.37-.78C21.08 11.03 17.15 8 12.5 8z" />
                </svg>
              </button>
              <button
                type="button"
                class={styles.historyButton}
                onClick={() => redo()}
                disabled={!controlDesignerStore.canRedo}
                title={controlDesignerStore.redoDescription ?? 'Redo'}
              >
                <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                  <path d="M18.4 10.6C16.55 8.99 14.15 8 11.5 8c-4.65 0-8.58 3.03-9.96 7.22L3.9 16c1.05-3.19 4.05-5.5 7.6-5.5 1.95 0 3.73.72 5.12 1.88L13 16h9V7l-3.6 3.6z" />
                </svg>
              </button>
            </div>

            {/* Error Message */}
            <Show when={controlDesignerStore.errorMessage}>
              <div class={styles.errorMessage}>{controlDesignerStore.errorMessage}</div>
            </Show>

            {/* Generation Progress */}
            <Show when={controlDesignerStore.generationProgress}>
              <div class={styles.progressContainer}>
                <div class={styles.progressBar}>
                  <div
                    class={styles.progressFill}
                    style={{ width: `${controlDesignerStore.generationProgress?.percent ?? 0}%` }}
                  />
                </div>
                <span class={styles.progressText}>
                  {controlDesignerStore.generationProgress?.stage === 'preparing' && 'Preparing...'}
                  {controlDesignerStore.generationProgress?.stage === 'rendering' &&
                    `Rendering frame ${controlDesignerStore.generationProgress.currentFrame + 1} of ${controlDesignerStore.generationProgress.totalFrames}`}
                  {controlDesignerStore.generationProgress?.stage === 'compositing' &&
                    'Compositing...'}
                  {controlDesignerStore.generationProgress?.stage === 'complete' && 'Complete!'}
                </span>
              </div>
            </Show>

            {/* Action Buttons */}
            <div class={styles.actionButtons}>
              <button
                type="button"
                class={styles.cancelButton}
                onClick={() => {
                  if (controlDesignerStore.generationProgress) {
                    cancelGeneration();
                  } else {
                    closeControlDesigner();
                  }
                }}
              >
                {controlDesignerStore.generationProgress ? 'Cancel' : 'Close'}
              </button>
              <button
                type="button"
                class={styles.generateButton}
                onClick={handleGenerate}
                disabled={!!controlDesignerStore.generationProgress}
              >
                {controlDesignerStore.generationProgress ? 'Generating...' : 'Generate Filmstrip'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Show>
  );
};
