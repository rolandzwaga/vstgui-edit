/**
 * Knob Renderer Service
 *
 * Three.js rendering service for 3D knob preview and filmstrip generation.
 * Manages WebGL renderer, scene, camera, and lighting.
 */

import {
  WebGLRenderer,
  Scene,
  OrthographicCamera,
  DirectionalLight,
  AmbientLight,
  Group,
  Mesh,
  WebGLRenderTarget,
  LinearFilter,
  RGBAFormat,
} from 'three';
import type { KnobDesign, GenerationProgress } from '../../types/knobDesigner';
import {
  createScene,
  createCamera,
  createMainLight,
  createAmbientLight,
  updateLightPosition,
  updateCameraAspect,
} from '../../domain/knobDesigner/scene';
import {
  createLayerGeometry,
  createIndicatorGeometry,
  calculateSegments,
  calculateLayerYOffset,
} from '../../domain/knobDesigner/geometry';
import {
  createMaterial,
  createIndicatorMaterial,
  disposeAll as disposeMaterials,
} from '../../domain/knobDesigner/materials';

// ============================================================================
// Service State
// ============================================================================

let renderer: WebGLRenderer | null = null;
let scene: Scene | null = null;
let camera: OrthographicCamera | null = null;
let mainLight: DirectionalLight | null = null;
let ambientLight: AmbientLight | null = null;
let knobGroup: Group | null = null;

let animationFrameId: number | null = null;
let previewAngle = 0;
let currentDesign: KnobDesign | null = null;

// Generation cancellation
let generationCancelled = false;

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
// Initialization and Disposal
// ============================================================================

/**
 * Initializes the Three.js renderer and attaches to a canvas.
 *
 * @param canvas - Canvas element to render to
 * @throws If WebGL is not available
 */
export function initialize(canvas: HTMLCanvasElement): void {
  if (!isWebGLAvailable()) {
    throw new Error('WebGL is not available in this browser');
  }

  // Create renderer
  renderer = new WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
    preserveDrawingBuffer: true,
  });
  renderer.setClearColor(0x000000, 0);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  // Get canvas dimensions
  const rect = canvas.getBoundingClientRect();
  renderer.setSize(rect.width, rect.height);

  // Create scene and camera
  scene = createScene();
  camera = createCamera(rect.width, rect.height);

  // Create lighting
  mainLight = createMainLight(315, 45);
  ambientLight = createAmbientLight(0.3);
  scene.add(mainLight);
  scene.add(mainLight.target);
  scene.add(ambientLight);

  // Create knob group
  knobGroup = new Group();
  scene.add(knobGroup);
}

/**
 * Disposes of all Three.js resources.
 * Must be called when modal closes.
 */
export function dispose(): void {
  stopPreviewAnimation();

  // Dispose knob group contents
  if (knobGroup) {
    knobGroup.traverse(obj => {
      if (obj instanceof Mesh) {
        obj.geometry.dispose();
      }
    });
    knobGroup.clear();
    knobGroup = null;
  }

  // Dispose materials
  disposeMaterials();

  // Dispose lighting
  mainLight = null;
  ambientLight = null;

  // Dispose scene
  if (scene) {
    scene.clear();
    scene = null;
  }

  // Dispose renderer
  if (renderer) {
    renderer.dispose();
    renderer = null;
  }

  camera = null;
  currentDesign = null;
}

// ============================================================================
// Scene Updates
// ============================================================================

/**
 * Updates the 3D scene based on current design.
 * Call when any design parameter changes.
 *
 * @param design - Current knob design configuration
 */
export function updateScene(design: KnobDesign): void {
  if (!scene || !knobGroup || !mainLight) return;

  currentDesign = design;

  // Clear existing knob geometry
  knobGroup.traverse(obj => {
    if (obj instanceof Mesh) {
      obj.geometry.dispose();
    }
  });
  knobGroup.clear();

  // Calculate parameters
  const overallDiameter = 40; // World units
  const overallHeight = 25; // World units
  const segments = calculateSegments(design.output.frameWidth);

  // Create layer meshes
  design.layers.forEach((layer, index) => {
    const geometry = createLayerGeometry(layer, overallDiameter, overallHeight, segments);
    const material = createMaterial(layer.material);
    const mesh = new Mesh(geometry, material);

    // Position layer based on cumulative heights
    const yOffset = calculateLayerYOffset(design.layers, index, overallHeight);
    mesh.position.y = yOffset - overallHeight / 2; // Center vertically

    knobGroup?.add(mesh);
  });

  // Create indicator if enabled
  if (design.indicator && design.indicator.enabled) {
    const topLayer = design.layers[design.layers.length - 1];
    const layerRadius = (topLayer.geometry.diameter / 100) * (overallDiameter / 2);

    const indicatorGeometry = createIndicatorGeometry(design.indicator, layerRadius, segments);
    const indicatorMaterial = createIndicatorMaterial(design.indicator.material);
    const indicatorMesh = new Mesh(indicatorGeometry, indicatorMaterial);

    // Position indicator on top surface
    const indicatorRadius = (design.indicator.radialPosition / 100) * layerRadius;
    const topY = calculateLayerYOffset(design.layers, design.layers.length, overallHeight);
    indicatorMesh.position.set(0, topY - overallHeight / 2, indicatorRadius);

    knobGroup?.add(indicatorMesh);
  }

  // Update lighting
  updateLightPosition(mainLight, design.lighting.azimuth, design.lighting.elevation);
}

/**
 * Sets the preview rotation angle.
 *
 * @param angle - Rotation angle in degrees
 */
export function setPreviewRotation(angle: number): void {
  if (!knobGroup) return;
  knobGroup.rotation.y = (angle * Math.PI) / 180;
}

/**
 * Renders a single frame to the preview canvas.
 */
export function renderPreview(): void {
  if (!renderer || !scene || !camera) return;
  renderer.setRenderTarget(null);
  renderer.render(scene, camera);
}

// ============================================================================
// Preview Animation
// ============================================================================

/**
 * Starts the preview animation loop.
 * Rotates the knob through the full sweep range.
 */
export function startPreviewAnimation(): void {
  if (animationFrameId !== null) return;

  const animate = () => {
    if (!currentDesign) return;

    // Calculate rotation based on sweep
    const { startAngle, sweepAngle } = currentDesign.output;

    // Oscillate through sweep range
    const time = Date.now() * 0.001; // Time in seconds
    const progress = (Math.sin(time * 0.5) + 1) / 2; // 0-1 oscillation
    const angle = startAngle + progress * sweepAngle;

    setPreviewRotation(angle);
    renderPreview();

    animationFrameId = requestAnimationFrame(animate);
  };

  animate();
}

/**
 * Stops the preview animation loop.
 */
export function stopPreviewAnimation(): void {
  if (animationFrameId !== null) {
    cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
  }
}

// ============================================================================
// Resize Handling
// ============================================================================

/**
 * Resizes the renderer to fit container.
 *
 * @param width - New width in pixels
 * @param height - New height in pixels
 */
export function resize(width: number, height: number): void {
  if (!renderer || !camera) return;

  renderer.setSize(width, height);
  updateCameraAspect(camera, width, height);
}

// ============================================================================
// Filmstrip Generation
// ============================================================================

/**
 * Calculates optimal frames per row for filmstrip layout.
 *
 * @param frameCount - Total number of frames
 * @returns Optimal frames per row (power of 2 preferred)
 */
function calculateFramesPerRow(frameCount: number): number {
  const sqrt = Math.sqrt(frameCount);
  const candidates = [8, 16, 32, 64];
  return candidates.find(c => c >= sqrt) ?? 64;
}

/**
 * Generates a filmstrip image from the current design.
 *
 * @param design - Knob design configuration
 * @param onProgress - Progress callback
 * @returns PNG data URL of the filmstrip
 * @throws If generation fails
 */
export async function generateFilmstrip(
  design: KnobDesign,
  onProgress: (progress: GenerationProgress) => void
): Promise<string> {
  if (!renderer || !scene || !camera || !knobGroup) {
    throw new Error('Renderer not initialized');
  }

  generationCancelled = false;

  // Stop any running preview animation
  stopPreviewAnimation();

  // Update scene with design
  updateScene(design);

  const { frameCount, frameWidth, frameHeight, startAngle, sweepAngle } = design.output;
  const framesPerRow = calculateFramesPerRow(frameCount);
  const rows = Math.ceil(frameCount / framesPerRow);
  const totalWidth = frameWidth * framesPerRow;
  const totalHeight = frameHeight * rows;

  // Create render target
  const target = new WebGLRenderTarget(totalWidth, totalHeight, {
    minFilter: LinearFilter,
    magFilter: LinearFilter,
    format: RGBAFormat,
  });

  // Report preparing stage
  onProgress({
    stage: 'preparing',
    currentFrame: 0,
    totalFrames: frameCount,
    percent: 0,
  });

  try {
    // Render each frame
    for (let i = 0; i < frameCount && !generationCancelled; i++) {
      const col = i % framesPerRow;
      const row = Math.floor(i / framesPerRow);

      // WebGL Y-axis is inverted
      const x = col * frameWidth;
      const y = (rows - 1 - row) * frameHeight;

      // Set viewport and scissor
      renderer.setViewport(x, y, frameWidth, frameHeight);
      renderer.setScissor(x, y, frameWidth, frameHeight);
      renderer.setScissorTest(true);

      // Calculate rotation angle for this frame
      const angle = startAngle + (i / (frameCount - 1)) * sweepAngle;
      setPreviewRotation(angle);

      // Render to target
      renderer.setRenderTarget(target);
      renderer.render(scene, camera);

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

    if (generationCancelled) {
      target.dispose();
      throw new Error('Generation cancelled');
    }

    // Reset render state
    renderer.setViewport(0, 0, renderer.domElement.width, renderer.domElement.height);
    renderer.setScissorTest(false);
    renderer.setRenderTarget(null);

    // Report compositing stage
    onProgress({
      stage: 'compositing',
      currentFrame: frameCount,
      totalFrames: frameCount,
      percent: 95,
    });

    // Extract pixels
    const pixels = new Uint8Array(totalWidth * totalHeight * 4);
    renderer.readRenderTargetPixels(target, 0, 0, totalWidth, totalHeight, pixels);

    // Create canvas and flip Y-axis
    const canvas = document.createElement('canvas');
    canvas.width = totalWidth;
    canvas.height = totalHeight;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      throw new Error('Failed to create 2D context');
    }

    // Flip the image vertically (WebGL Y is inverted)
    const imageData = new ImageData(new Uint8ClampedArray(pixels), totalWidth, totalHeight);

    // Create a temp canvas for flipping
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = totalWidth;
    tempCanvas.height = totalHeight;
    const tempCtx = tempCanvas.getContext('2d');

    if (!tempCtx) {
      throw new Error('Failed to create temp 2D context');
    }

    tempCtx.putImageData(imageData, 0, 0);

    // Flip by drawing inverted
    ctx.scale(1, -1);
    ctx.drawImage(tempCanvas, 0, -totalHeight);

    // Cleanup render target
    target.dispose();

    // Report complete
    onProgress({
      stage: 'complete',
      currentFrame: frameCount,
      totalFrames: frameCount,
      percent: 100,
    });

    // Return as data URL
    return canvas.toDataURL('image/png');
  } finally {
    // Reset render state
    if (renderer) {
      renderer.setViewport(0, 0, renderer.domElement.width, renderer.domElement.height);
      renderer.setScissorTest(false);
      renderer.setRenderTarget(null);
    }
  }
}

/**
 * Cancels ongoing filmstrip generation.
 */
export function cancelGeneration(): void {
  generationCancelled = true;
}

// ============================================================================
// Service Export
// ============================================================================

export const knobRendererService = {
  initialize,
  dispose,
  isWebGLAvailable,
  updateScene,
  setPreviewRotation,
  renderPreview,
  startPreviewAnimation,
  stopPreviewAnimation,
  resize,
  generateFilmstrip,
  cancelGeneration,
};

export default knobRendererService;
