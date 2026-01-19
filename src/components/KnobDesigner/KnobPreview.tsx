/**
 * KnobPreview Component
 *
 * Three.js canvas wrapper for rendering the 3D knob preview.
 * Handles initialization, cleanup, and reactive updates.
 */

import { createEffect, createSignal, onCleanup, onMount } from 'solid-js';
import type { Component } from 'solid-js';
import type { KnobDesign } from '../../types/knobDesigner';
import { knobRendererService, isWebGLAvailable } from '../../services/knobRenderer';
import styles from './KnobPreview.module.css';

// ============================================================================
// Props Interface
// ============================================================================

export interface KnobPreviewProps {
  /** Current knob design to render */
  design: KnobDesign;

  /** Callback when WebGL error occurs */
  onError?: (message: string) => void;
}

// ============================================================================
// Component
// ============================================================================

export const KnobPreview: Component<KnobPreviewProps> = (props) => {
  let canvasRef: HTMLCanvasElement | undefined;
  let containerRef: HTMLDivElement | undefined;
  let resizeObserver: ResizeObserver | null = null;

  const [webglError, setWebglError] = createSignal<string | null>(null);
  const [isInitialized, setIsInitialized] = createSignal(false);

  // Initialize renderer on mount
  onMount(() => {
    if (!canvasRef) return;

    // Check WebGL availability first
    if (!isWebGLAvailable()) {
      const errorMsg = 'WebGL is not available in this browser. 3D preview requires WebGL support.';
      setWebglError(errorMsg);
      props.onError?.(errorMsg);
      return;
    }

    // Initialize renderer asynchronously (environment map loading)
    const initRenderer = async () => {
      try {
        await knobRendererService.initialize(canvasRef!);
        setIsInitialized(true);

        // Initial scene update
        knobRendererService.updateScene(props.design);
        knobRendererService.startPreviewAnimation();
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Failed to initialize 3D renderer';
        setWebglError(errorMsg);
        props.onError?.(errorMsg);
      }
    };

    initRenderer();
  });

  // Setup resize observer
  onMount(() => {
    if (!containerRef || !canvasRef) return;

    resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (width > 0 && height > 0 && isInitialized()) {
          knobRendererService.resize(width, height);
          knobRendererService.renderPreview();
        }
      }
    });

    resizeObserver.observe(containerRef);
  });

  // Cleanup on unmount
  onCleanup(() => {
    if (resizeObserver) {
      resizeObserver.disconnect();
      resizeObserver = null;
    }

    if (isInitialized()) {
      knobRendererService.dispose();
    }
  });

  // Update scene when design changes
  createEffect(() => {
    const design = props.design;
    if (isInitialized()) {
      knobRendererService.updateScene(design);
    }
  });

  return (
    <div ref={containerRef} class={styles.container}>
      {webglError() ? (
        <div class={styles.errorContainer}>
          <div class={styles.errorIcon}>
            <svg viewBox="0 0 24 24" width="48" height="48" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
            </svg>
          </div>
          <p class={styles.errorMessage}>{webglError()}</p>
          <p class={styles.errorHint}>
            Please ensure your browser supports WebGL and hardware acceleration is enabled.
          </p>
        </div>
      ) : (
        <canvas ref={canvasRef} class={styles.canvas} />
      )}
    </div>
  );
};
