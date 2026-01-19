/**
 * Knob Control Renderer
 *
 * Three.js renderer implementation for knob controls.
 * Implements the ControlRenderer interface by wrapping the existing knobRenderer service.
 */

import type { ControlRenderer, GenerationProgress } from '../../types/controlDesigner';
import type { KnobDesign } from '../../types/knobDesigner';

// Re-export the existing knobRenderer service
// This module provides a typed wrapper that implements the ControlRenderer interface
import {
  cancelGeneration as cancelGenerationBase,
  dispose as disposeBase,
  generateFilmstrip as generateFilmstripBase,
  initialize as initializeBase,
  isWebGLAvailable,
  renderPreview as renderPreviewBase,
  resize as resizeBase,
  setCameraView as setCameraViewBase,
  setPreviewRotation,
  startPreviewAnimation as startAnimationBase,
  stopPreviewAnimation as stopAnimationBase,
  updateScene as updateSceneBase,
} from '../knobRenderer';

/**
 * KnobDesign type with required controlType for plugin compatibility.
 */
type KnobDesignWithType = KnobDesign & { controlType: 'knob' };

// ============================================================================
// Knob Renderer Implementation
// ============================================================================

/**
 * Creates a knob renderer that implements the ControlRenderer interface.
 * Wraps the existing knobRendererService for compatibility.
 *
 * @returns ControlRenderer implementation for knobs
 */
export function createKnobRenderer(): ControlRenderer<KnobDesignWithType> {
  let currentDesign: KnobDesign | null = null;

  return {
    async initialize(canvas: HTMLCanvasElement): Promise<void> {
      await initializeBase(canvas);
    },

    updateScene(design: KnobDesignWithType): void {
      // Defensive check: ensure we're receiving a knob design
      if (design.controlType !== 'knob') {
        console.warn('[KnobRenderer] Received non-knob design, ignoring', design.controlType);
        return;
      }
      currentDesign = design;
      updateSceneBase(design);
    },

    setPosition(position: number): void {
      // For knobs, position (0-1) maps to rotation angle
      if (currentDesign) {
        const { startAngle, sweepAngle } = currentDesign.output;
        const angle = startAngle + position * sweepAngle;
        setPreviewRotation(angle);
      }
    },

    renderPreview(): void {
      renderPreviewBase();
    },

    async generateFilmstrip(
      design: KnobDesignWithType,
      onProgress: (progress: GenerationProgress) => void
    ): Promise<string> {
      return generateFilmstripBase(design, onProgress);
    },

    dispose(): void {
      currentDesign = null;
      disposeBase();
    },

    resize(width: number, height: number): void {
      resizeBase(width, height);
    },
  };
}

// ============================================================================
// Re-exports for direct usage
// ============================================================================

export {
  cancelGenerationBase as cancelGeneration,
  disposeBase as dispose,
  generateFilmstripBase as generateFilmstrip,
  initializeBase as initialize,
  isWebGLAvailable,
  renderPreviewBase as renderPreview,
  resizeBase as resize,
  setCameraViewBase as setCameraView,
  setPreviewRotation,
  startAnimationBase as startPreviewAnimation,
  stopAnimationBase as stopPreviewAnimation,
  updateSceneBase as updateScene,
};

/**
 * Knob renderer service singleton.
 * Provides both direct access and ControlRenderer factory.
 */
export const knobRendererService = {
  initialize: initializeBase,
  dispose: disposeBase,
  isWebGLAvailable,
  updateScene: updateSceneBase,
  setCameraView: setCameraViewBase,
  setPreviewRotation,
  renderPreview: renderPreviewBase,
  startPreviewAnimation: startAnimationBase,
  stopPreviewAnimation: stopAnimationBase,
  resize: resizeBase,
  generateFilmstrip: generateFilmstripBase,
  cancelGeneration: cancelGenerationBase,
  createRenderer: createKnobRenderer,
};
