/**
 * Base Control Renderer
 *
 * Shared Three.js scene, camera, and lighting setup extracted from knobRenderer.
 * Provides common rendering infrastructure for all control type renderers.
 */

import {
  ACESFilmicToneMapping,
  type AmbientLight,
  type DirectionalLight,
  Group,
  type HemisphereLight,
  LinearFilter,
  Mesh,
  NoToneMapping,
  type OrthographicCamera,
  RGBAFormat,
  type Scene,
  type Texture,
  WebGLRenderer,
  WebGLRenderTarget,
} from 'three';
import UPNG from 'upng-js';
import { disposeAllMaterials } from '../../domain/controlDesigner/materials';
import {
  createAmbientLight,
  createCamera,
  createHemisphereLight,
  createMainLight,
  createScene,
  setCameraView,
  updateCameraAspect,
  updateLightPosition,
} from '../../domain/controlDesigner/scene';
import type { CameraView, GenerationProgress, LightingConfig } from '../../types/controlDesigner';

// ============================================================================
// Base Renderer State Interface
// ============================================================================

/**
 * Shared state for control renderers.
 */
export interface BaseRendererState {
  renderer: WebGLRenderer | null;
  scene: Scene | null;
  camera: OrthographicCamera | null;
  mainLight: DirectionalLight | null;
  ambientLight: AmbientLight | null;
  hemisphereLight: HemisphereLight | null;
  controlGroup: Group | null;
  environmentTexture: Texture | null;
  animationFrameId: number | null;
  generationCancelled: boolean;
}

/**
 * Creates initial renderer state.
 */
export function createInitialState(): BaseRendererState {
  return {
    renderer: null,
    scene: null,
    camera: null,
    mainLight: null,
    ambientLight: null,
    hemisphereLight: null,
    controlGroup: null,
    environmentTexture: null,
    animationFrameId: null,
    generationCancelled: false,
  };
}

// ============================================================================
// WebGL Availability Check
// ============================================================================

/**
 * Checks if WebGL is available in the browser.
 *
 * @returns True if WebGL 2.0 is supported
 */
export function isWebGLAvailable(): boolean {
  try {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('webgl2') || canvas.getContext('webgl');
    return context !== null;
  } catch {
    return false;
  }
}

// ============================================================================
// Initialization
// ============================================================================

/**
 * Initializes the Three.js renderer and base scene.
 *
 * @param state - Renderer state to initialize
 * @param canvas - Canvas element to render to
 * @param initEnvironment - Optional function to initialize environment map
 * @throws If WebGL is not available
 */
export async function initializeRenderer(
  state: BaseRendererState,
  canvas: HTMLCanvasElement,
  initEnvironment?: (renderer: WebGLRenderer) => Promise<Texture | null>
): Promise<void> {
  if (!isWebGLAvailable()) {
    throw new Error('WebGL is not available in this browser');
  }

  // Create renderer
  state.renderer = new WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
    preserveDrawingBuffer: true,
  });
  state.renderer.setClearColor(0x000000, 0);
  state.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  // Enable shadow mapping
  state.renderer.shadowMap.enabled = true;

  // Configure tone mapping for HDR environment
  state.renderer.toneMapping = ACESFilmicToneMapping;
  state.renderer.toneMappingExposure = 1.0;

  // Get canvas dimensions
  const rect = canvas.getBoundingClientRect();
  state.renderer.setSize(rect.width, rect.height);

  // Create scene and camera
  state.scene = createScene();
  state.camera = createCamera(rect.width, rect.height);

  // Initialize environment map if provided
  if (initEnvironment) {
    try {
      state.environmentTexture = await initEnvironment(state.renderer);
      if (state.environmentTexture && state.scene) {
        state.scene.environment = state.environmentTexture;
        state.scene.environmentIntensity = 0.8;
      }
    } catch (error) {
      console.warn('[BaseRenderer] Failed to initialize environment map:', error);
    }
  }

  // Create lighting
  state.mainLight = createMainLight(315, 45);
  state.ambientLight = createAmbientLight(0.3);
  state.hemisphereLight = createHemisphereLight(0.4);
  state.scene.add(state.mainLight);
  state.scene.add(state.mainLight.target);
  state.scene.add(state.ambientLight);
  state.scene.add(state.hemisphereLight);

  // Create control group
  state.controlGroup = new Group();
  state.scene.add(state.controlGroup);
}

// ============================================================================
// Disposal
// ============================================================================

/**
 * Disposes of all Three.js resources.
 *
 * @param state - Renderer state to dispose
 * @param disposeEnvironment - Optional function to dispose environment resources
 */
export function disposeRenderer(state: BaseRendererState, disposeEnvironment?: () => void): void {
  // Stop animation
  if (state.animationFrameId !== null) {
    cancelAnimationFrame(state.animationFrameId);
    state.animationFrameId = null;
  }

  // Dispose control group contents
  if (state.controlGroup) {
    state.controlGroup.traverse(obj => {
      if (obj instanceof Mesh) {
        obj.geometry.dispose();
      }
    });
    state.controlGroup.clear();
    state.controlGroup = null;
  }

  // Dispose materials
  disposeAllMaterials();

  // Dispose environment
  if (disposeEnvironment) {
    disposeEnvironment();
  }
  state.environmentTexture = null;

  // Dispose lighting
  state.mainLight = null;
  state.ambientLight = null;
  state.hemisphereLight = null;

  // Dispose scene
  if (state.scene) {
    state.scene.clear();
    state.scene = null;
  }

  // Dispose renderer
  if (state.renderer) {
    state.renderer.dispose();
    state.renderer = null;
  }

  state.camera = null;
}

// ============================================================================
// Scene Updates
// ============================================================================

/**
 * Updates lighting based on configuration.
 *
 * @param state - Renderer state
 * @param lighting - Lighting configuration
 */
export function updateLighting(state: BaseRendererState, lighting: LightingConfig): void {
  if (state.mainLight) {
    updateLightPosition(state.mainLight, lighting.azimuth, lighting.elevation);
  }
}

/**
 * Updates camera view angle.
 *
 * @param state - Renderer state
 * @param view - Camera view ('top' or 'side')
 */
export function updateCameraView(state: BaseRendererState, view: CameraView): void {
  if (state.camera) {
    setCameraView(state.camera, view);
  }
}

/**
 * Renders a single frame to the preview canvas.
 *
 * @param state - Renderer state
 */
export function renderPreview(state: BaseRendererState): void {
  if (!state.renderer || !state.scene || !state.camera) return;
  state.renderer.setRenderTarget(null);
  state.renderer.render(state.scene, state.camera);
}

/**
 * Resizes the renderer to fit container.
 *
 * @param state - Renderer state
 * @param width - New width in pixels
 * @param height - New height in pixels
 */
export function resizeRenderer(state: BaseRendererState, width: number, height: number): void {
  if (!state.renderer || !state.camera) return;

  state.renderer.setSize(width, height);
  updateCameraAspect(state.camera, width, height);
}

// ============================================================================
// Filmstrip Generation
// ============================================================================

/**
 * Configuration for filmstrip generation.
 */
export interface FilmstripConfig {
  frameCount: number;
  frameWidth: number;
  frameHeight: number;
  framesPerRow: number;
  totalWidth: number;
  totalHeight: number;
  frustumSize: number;
  cameraView: CameraView;
}

/**
 * Generates a filmstrip by rendering multiple frames.
 *
 * @param state - Renderer state
 * @param config - Filmstrip configuration
 * @param setFrameValue - Function to set the control value for each frame
 * @param onProgress - Progress callback
 * @returns PNG data URL of the filmstrip
 */
export async function generateFilmstrip(
  state: BaseRendererState,
  config: FilmstripConfig,
  setFrameValue: (frameIndex: number, frameCount: number) => void,
  onProgress: (progress: GenerationProgress) => void
): Promise<string> {
  if (!state.renderer || !state.scene || !state.camera || !state.controlGroup) {
    throw new Error('Renderer not initialized');
  }

  state.generationCancelled = false;

  const {
    frameCount,
    frameWidth,
    frameHeight,
    framesPerRow,
    totalWidth,
    totalHeight,
    frustumSize,
  } = config;

  // Report preparing stage
  onProgress({
    stage: 'preparing',
    currentFrame: 0,
    totalFrames: frameCount,
    percent: 0,
  });

  // Store original state
  const originalPixelRatio = state.renderer.getPixelRatio();
  const originalToneMapping = state.renderer.toneMapping;
  const originalToneMappingExposure = state.renderer.toneMappingExposure;

  // Set pixel ratio to 1 for render target operations
  state.renderer.setPixelRatio(1);
  state.renderer.toneMapping = NoToneMapping;

  // Create camera for filmstrip with calculated frustum
  const filmstripCamera = createCamera(frameWidth, frameHeight, frustumSize, config.cameraView);

  // Create single-frame render target
  const frameTarget = new WebGLRenderTarget(frameWidth, frameHeight, {
    minFilter: LinearFilter,
    magFilter: LinearFilter,
    format: RGBAFormat,
  });

  // Allocate pixel buffers
  const finalPixels = new Uint8Array(totalWidth * totalHeight * 4);
  const framePixels = new Uint8Array(frameWidth * frameHeight * 4);

  const _rows = Math.ceil(frameCount / framesPerRow);

  try {
    // Reset WebGL state
    state.renderer.setRenderTarget(null);
    state.renderer.setScissorTest(false);

    // Render each frame
    for (let i = 0; i < frameCount && !state.generationCancelled; i++) {
      const col = i % framesPerRow;
      const row = Math.floor(i / framesPerRow);

      // Set the value for this frame
      setFrameValue(i, frameCount);

      // Render to frame target
      state.renderer.setRenderTarget(frameTarget);
      state.renderer.setViewport(0, 0, frameWidth, frameHeight);
      state.renderer.setClearColor(0x000000, 0);
      state.renderer.clear(true, true, true);
      state.renderer.render(state.scene, filmstripCamera);

      // Read pixels
      state.renderer.readRenderTargetPixels(
        frameTarget,
        0,
        0,
        frameWidth,
        frameHeight,
        framePixels
      );

      // Copy to final buffer with Y-flip
      for (let srcY = 0; srcY < frameHeight; srcY++) {
        const flippedSrcY = frameHeight - 1 - srcY;
        const destY = row * frameHeight + srcY;
        const srcOffset = flippedSrcY * frameWidth * 4;
        const destOffset = destY * totalWidth * 4 + col * frameWidth * 4;

        for (let x = 0; x < frameWidth * 4; x++) {
          finalPixels[destOffset + x] = framePixels[srcOffset + x];
        }
      }

      // Report progress
      onProgress({
        stage: 'rendering',
        currentFrame: i,
        totalFrames: frameCount,
        percent: Math.round(((i + 1) / frameCount) * 90),
      });

      // Yield to UI every 4 frames
      if (i % 4 === 0) {
        await new Promise(resolve => setTimeout(resolve, 0));
      }
    }

    frameTarget.dispose();

    if (state.generationCancelled) {
      throw new Error('Generation cancelled');
    }

    // Report compositing stage
    onProgress({
      stage: 'compositing',
      currentFrame: frameCount,
      totalFrames: frameCount,
      percent: 95,
    });

    // Create canvas from pixels
    const canvas = document.createElement('canvas');
    canvas.width = totalWidth;
    canvas.height = totalHeight;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      throw new Error('Failed to create 2D context');
    }

    const imageData = new ImageData(new Uint8ClampedArray(finalPixels), totalWidth, totalHeight);
    ctx.putImageData(imageData, 0, 0);

    // Compress with UPNG
    const pngBuffer = UPNG.encode([imageData.data.buffer], totalWidth, totalHeight, 0);

    // Convert to data URL
    const base64 = btoa(
      new Uint8Array(pngBuffer).reduce((data, byte) => data + String.fromCharCode(byte), '')
    );

    // Report complete
    onProgress({
      stage: 'complete',
      currentFrame: frameCount,
      totalFrames: frameCount,
      percent: 100,
    });

    return `data:image/png;base64,${base64}`;
  } finally {
    // Restore state
    if (state.renderer) {
      state.renderer.setPixelRatio(originalPixelRatio);
      state.renderer.setRenderTarget(null);
      state.renderer.setScissorTest(false);
      state.renderer.toneMapping = originalToneMapping;
      state.renderer.toneMappingExposure = originalToneMappingExposure;
    }
  }
}

/**
 * Cancels ongoing filmstrip generation.
 *
 * @param state - Renderer state
 */
export function cancelGeneration(state: BaseRendererState): void {
  state.generationCancelled = true;
}
