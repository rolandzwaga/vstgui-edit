/**
 * ControlPreview Component
 *
 * Generic 3D preview component that delegates rendering to the active plugin's renderer.
 * Handles canvas setup, resize, and cleanup while the plugin manages scene updates.
 */

import { createEffect, createSignal, onCleanup, onMount, Show } from 'solid-js';
import type { Component } from 'solid-js';
import type {
  BaseControlDesign,
  ControlRenderer,
  ControlTypePlugin,
} from '../../types/controlDesigner';
import styles from './ControlPreview.module.css';

// ============================================================================
// Props Interface
// ============================================================================

export interface ControlPreviewProps {
  /** Current control design to render */
  design: BaseControlDesign | null;

  /** Active plugin that provides the renderer */
  plugin: ControlTypePlugin | undefined;

  /** Callback when WebGL error occurs */
  onError?: (message: string) => void;

  /** Preview position for linear controls (0-1) */
  previewPosition?: number;
}

// ============================================================================
// WebGL Detection
// ============================================================================

/**
 * Checks if WebGL is available in the current browser.
 */
function isWebGLAvailable(): boolean {
  try {
    const canvas = document.createElement('canvas');
    return !!(
      window.WebGLRenderingContext &&
      (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
    );
  } catch (_e) {
    return false;
  }
}

// ============================================================================
// Component
// ============================================================================

export const ControlPreview: Component<ControlPreviewProps> = (props) => {
  let canvasRef: HTMLCanvasElement | undefined;
  let containerRef: HTMLDivElement | undefined;
  let resizeObserver: ResizeObserver | null = null;
  let currentRenderer: ControlRenderer | null = null;

  const [webglError, setWebglError] = createSignal<string | null>(null);
  const [isInitialized, setIsInitialized] = createSignal(false);
  const [isLoading, setIsLoading] = createSignal(true);

  // Initialize renderer on mount and when plugin changes
  const initializeRenderer = async () => {
    if (!canvasRef || !props.plugin || !props.design) return;

    // Check WebGL availability first
    if (!isWebGLAvailable()) {
      const errorMsg =
        'WebGL is not available in this browser. 3D preview requires WebGL support.';
      setWebglError(errorMsg);
      props.onError?.(errorMsg);
      setIsLoading(false);
      return;
    }

    // Dispose previous renderer if exists
    if (currentRenderer) {
      currentRenderer.dispose();
      currentRenderer = null;
      setIsInitialized(false);
    }

    setIsLoading(true);
    setWebglError(null);

    try {
      // Create new renderer from plugin
      currentRenderer = props.plugin.createRenderer();
      await currentRenderer.initialize(canvasRef);
      setIsInitialized(true);

      // Initial scene update
      if (props.design) {
        currentRenderer.updateScene(props.design);
        currentRenderer.renderPreview();
      }

      setIsLoading(false);
    } catch (error) {
      const errorMsg =
        error instanceof Error ? error.message : 'Failed to initialize 3D renderer';
      setWebglError(errorMsg);
      props.onError?.(errorMsg);
      setIsLoading(false);
    }
  };

  // Initialize on mount
  onMount(() => {
    initializeRenderer();
  });

  // Setup resize observer
  onMount(() => {
    if (!containerRef || !canvasRef) return;

    resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (width > 0 && height > 0 && isInitialized() && currentRenderer) {
          currentRenderer.resize?.(width, height);
          currentRenderer.renderPreview();
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

    if (currentRenderer) {
      currentRenderer.dispose();
      currentRenderer = null;
    }
  });

  // Reinitialize when plugin changes
  createEffect(() => {
    const _plugin = props.plugin;
    if (canvasRef && _plugin) {
      initializeRenderer();
    }
  });

  // Update scene when design changes
  createEffect(() => {
    const design = props.design;
    if (isInitialized() && currentRenderer && design) {
      currentRenderer.updateScene(design);
      currentRenderer.renderPreview();
    }
  });

  // Update preview position for linear controls
  createEffect(() => {
    const position = props.previewPosition;
    if (isInitialized() && currentRenderer && position !== undefined) {
      currentRenderer.setPosition(position);
      currentRenderer.renderPreview();
    }
  });

  return (
    <div ref={containerRef} class={styles.container}>
      <Show when={webglError()}>
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
      </Show>

      <Show when={isLoading() && !webglError()}>
        <div class={styles.loadingContainer}>
          <div class={styles.spinner} />
          <p class={styles.loadingText}>Initializing 3D preview...</p>
        </div>
      </Show>

      <Show when={!props.design && !isLoading()}>
        <div class={styles.emptyContainer}>
          <p class={styles.emptyText}>No design loaded</p>
        </div>
      </Show>

      <canvas
        ref={canvasRef}
        class={styles.canvas}
        style={{ display: webglError() || isLoading() ? 'none' : 'block' }}
      />
    </div>
  );
};
