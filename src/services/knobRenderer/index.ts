/**
 * Knob Renderer Service
 *
 * Three.js rendering service for 3D knob preview and filmstrip generation.
 * Manages WebGL renderer, scene, camera, and lighting.
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
import { disposeEnvironment, initializeEnvironment } from '../../domain/knobDesigner/environment';
import {
  calculateLayerYOffset,
  calculateSegments,
  createIndicatorGeometry,
  createLayerGeometry,
} from '../../domain/knobDesigner/geometry';
import {
  createIndicatorMaterial,
  createMaterial,
  disposeAll as disposeMaterials,
} from '../../domain/knobDesigner/materials';
import {
  createAmbientLight,
  createCamera,
  createHemisphereLight,
  createMainLight,
  createScene,
  setCameraView as setCameraViewPosition,
  updateCameraAspect,
  updateLightPosition,
} from '../../domain/knobDesigner/scene';
import type { CameraView, GenerationProgress, KnobDesign } from '../../types/knobDesigner';

// ============================================================================
// Service State
// ============================================================================

let renderer: WebGLRenderer | null = null;
let scene: Scene | null = null;
let camera: OrthographicCamera | null = null;
let mainLight: DirectionalLight | null = null;
let ambientLight: AmbientLight | null = null;
let hemisphereLight: HemisphereLight | null = null;
let knobGroup: Group | null = null;
let environmentTexture: Texture | null = null;

let animationFrameId: number | null = null;
const _previewAngle = 0;
let currentDesign: KnobDesign | null = null;
let currentRotationOffset = 0; // User-configurable rotation offset in radians

// Generation cancellation
let generationCancelled = false;

// ============================================================================
// Frustum Calculation
// ============================================================================

// World units used for knob geometry (must match updateScene)
const OVERALL_DIAMETER = 40;

/**
 * Calculates the optimal frustum size for filmstrip rendering.
 * Ensures the entire knob (body + indicator) fits without clipping.
 *
 * @param design - Current knob design
 * @returns Frustum size in world units (diameter of visible area)
 */
function calculateFrustumSize(design: KnobDesign): number {
  // 1. Calculate maximum knob body radius (considering skirt styles)
  let maxBodyRadius = 0;
  for (const layer of design.layers) {
    const layerRadius = (layer.geometry.diameter / 100) * (OVERALL_DIAMETER / 2);
    // Apply skirt multiplier
    const skirtMultiplier = layer.geometry.skirtStyle === 'tapered' ? 1.1 : 1.0;
    const effectiveRadius = layerRadius * skirtMultiplier;
    maxBodyRadius = Math.max(maxBodyRadius, effectiveRadius);
  }

  // 2. Calculate indicator maximum extent (if enabled)
  let indicatorMaxExtent = 0;
  if (design.indicator?.enabled) {
    // Get top layer radius for indicator positioning
    const topLayer = design.layers[design.layers.length - 1];
    const topLayerRadius = (topLayer.geometry.diameter / 100) * (OVERALL_DIAMETER / 2);

    // Indicator radial position from center
    const indicatorCenterRadius = (design.indicator.radialPosition / 100) * topLayerRadius;

    // Add indicator size based on type
    let indicatorExtension = 0;
    switch (design.indicator.type) {
      case 'dot':
        indicatorExtension = design.indicator.size.radius;
        break;
      case 'line':
        indicatorExtension = design.indicator.size.length / 2;
        break;
      case 'notch':
      case 'groove':
        // These are cut into the knob, don't extend past body
        indicatorExtension = 0;
        break;
    }

    indicatorMaxExtent = indicatorCenterRadius + indicatorExtension;
  }

  // 3. Use the larger of body or indicator extent
  const maxRadius = Math.max(maxBodyRadius, indicatorMaxExtent);

  // Return diameter (frustum size is the full width/height of visible area)
  return maxRadius * 2;
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
// Initialization and Disposal
// ============================================================================

/**
 * Initializes the Three.js renderer and attaches to a canvas.
 *
 * @param canvas - Canvas element to render to
 * @throws If WebGL is not available
 */
export async function initialize(canvas: HTMLCanvasElement): Promise<void> {
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

  // Enable shadow mapping for realistic indicator shadows
  renderer.shadowMap.enabled = true;

  // Configure tone mapping for HDR environment
  // ACES Filmic provides good contrast and color grading for metallic materials
  renderer.toneMapping = ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;

  // Get canvas dimensions
  const rect = canvas.getBoundingClientRect();
  renderer.setSize(rect.width, rect.height);

  // Create scene and camera
  scene = createScene();
  camera = createCamera(rect.width, rect.height);

  // Initialize environment map for metallic reflections
  // Uses a procedural studio lighting setup for realistic PBR materials
  try {
    environmentTexture = await initializeEnvironment(renderer);
    scene.environment = environmentTexture;
    // Control environment intensity (affects PBR material reflections)
    scene.environmentIntensity = 0.8;
  } catch (error) {
    console.warn('[KnobRenderer] Failed to initialize environment map:', error);
  }

  // Create lighting
  mainLight = createMainLight(315, 45);
  ambientLight = createAmbientLight(0.3);
  hemisphereLight = createHemisphereLight(0.4);
  scene.add(mainLight);
  scene.add(mainLight.target);
  scene.add(ambientLight);
  scene.add(hemisphereLight);

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

  // Dispose environment map
  disposeEnvironment();
  environmentTexture = null;

  // Dispose lighting
  mainLight = null;
  ambientLight = null;
  hemisphereLight = null;

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

  // Store the user's rotation offset (convert from degrees to radians)
  currentRotationOffset = ((design.output.rotationOffset ?? 0) * Math.PI) / 180;

  // Apply base 180° rotation + user rotation offset
  // Base rotation compensates for camera flip, offset rotates the knob like a clock face
  knobGroup.rotation.y = Math.PI + currentRotationOffset;

  // Calculate parameters
  const overallDiameter = OVERALL_DIAMETER; // World units
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

    // Enable shadows - layers cast and receive shadows
    mesh.castShadow = true;
    mesh.receiveShadow = true;

    knobGroup?.add(mesh);
  });

  // Create indicator if enabled
  if (design.indicator?.enabled) {
    const topLayer = design.layers[design.layers.length - 1];
    const layerRadius = (topLayer.geometry.diameter / 100) * (overallDiameter / 2);

    const indicatorGeometry = createIndicatorGeometry(design.indicator, layerRadius, segments);
    const indicatorMaterial = createIndicatorMaterial(design.indicator.material);
    const indicatorMesh = new Mesh(indicatorGeometry, indicatorMaterial);

    // Position indicator on top surface, raised by half its height
    const indicatorRadius = (design.indicator.radialPosition / 100) * layerRadius;
    const topY = calculateLayerYOffset(design.layers, design.layers.length, overallHeight);
    const indicatorHeight = design.indicator.size.height ?? 2;
    indicatorMesh.position.set(0, topY - overallHeight / 2 + indicatorHeight / 2, indicatorRadius);

    // Enable shadows - indicator casts and receives shadows
    indicatorMesh.castShadow = true;
    indicatorMesh.receiveShadow = true;

    knobGroup?.add(indicatorMesh);
  }

  // Update lighting
  updateLightPosition(mainLight, design.lighting.azimuth, design.lighting.elevation);

  // Update camera view
  if (camera) {
    setCameraViewPosition(camera, design.cameraView);
  }
}

/**
 * Updates the camera view angle.
 *
 * @param view - Camera view ('top' or 'side')
 */
export function setCameraView(view: CameraView): void {
  if (!camera) return;
  setCameraViewPosition(camera, view);
  renderPreview();
}

/**
 * Sets the preview rotation angle.
 * Includes the base 180° offset to compensate for camera flip,
 * plus the user's rotation offset.
 *
 * Rotation direction: positive angles rotate clockwise (to the right)
 * This matches the natural knob behavior where turning right increases value.
 *
 * @param angle - Rotation angle in degrees
 */
export function setPreviewRotation(angle: number): void {
  if (!knobGroup) return;
  // Base offset + user rotation offset - preview angle (negated for clockwise rotation)
  knobGroup.rotation.y = Math.PI + currentRotationOffset - (angle * Math.PI) / 180;
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
 * Calculates optimal frames per row for grid filmstrip layout.
 *
 * @param frameCount - Total number of frames
 * @returns Optimal frames per row (power of 2 preferred)
 */
function calculateFramesPerRowForGrid(frameCount: number): number {
  const sqrt = Math.sqrt(frameCount);
  const candidates = [8, 16, 32, 64];
  return candidates.find(c => c >= sqrt) ?? 64;
}

/**
 * Calculates filmstrip dimensions based on layout type.
 *
 * @param frameCount - Total number of frames
 * @param frameWidth - Width of each frame
 * @param frameHeight - Height of each frame
 * @param layout - Filmstrip layout type
 * @returns Object with framesPerRow, rows, totalWidth, totalHeight
 */
function calculateFilmstripDimensions(
  frameCount: number,
  frameWidth: number,
  frameHeight: number,
  layout: 'grid' | 'vertical' | 'horizontal'
): { framesPerRow: number; rows: number; totalWidth: number; totalHeight: number } {
  let framesPerRow: number;
  let rows: number;

  switch (layout) {
    case 'vertical':
      // Single column, all frames stacked vertically
      framesPerRow = 1;
      rows = frameCount;
      break;
    case 'horizontal':
      // Single row, all frames side by side
      framesPerRow = frameCount;
      rows = 1;
      break;
    default:
      // Grid layout (default) with optimal distribution
      framesPerRow = calculateFramesPerRowForGrid(frameCount);
      rows = Math.ceil(frameCount / framesPerRow);
      break;
  }

  return {
    framesPerRow,
    rows,
    totalWidth: frameWidth * framesPerRow,
    totalHeight: frameHeight * rows,
  };
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

  const { frameCount, frameWidth, frameHeight, startAngle, sweepAngle, layout } = design.output;
  const {
    framesPerRow,
    rows: _rows,
    totalWidth,
    totalHeight,
  } = calculateFilmstripDimensions(frameCount, frameWidth, frameHeight, layout ?? 'vertical');

  // Report preparing stage
  onProgress({
    stage: 'preparing',
    currentFrame: 0,
    totalFrames: frameCount,
    percent: 0,
  });

  // Store original state for restoration after rendering
  const originalWidth = renderer.domElement.width;
  const originalHeight = renderer.domElement.height;
  const originalPixelRatio = renderer.getPixelRatio();
  const originalToneMapping = renderer.toneMapping;
  const originalToneMappingExposure = renderer.toneMappingExposure;

  // CRITICAL: Set pixel ratio to 1 for render target operations
  // Device pixel ratio can cause viewport coordinate issues on high-DPI displays
  renderer.setPixelRatio(1);

  // CRITICAL: Disable tone mapping when rendering to render target
  // Tone mapping is meant for final display, not offscreen rendering
  renderer.toneMapping = NoToneMapping;

  // Calculate frustum size based on actual design to ensure nothing clips
  const frustumSize = calculateFrustumSize(design);

  console.log(
    '[Filmstrip] Generating',
    frameCount,
    'frames at',
    frameWidth,
    'x',
    frameHeight,
    '- frustum:',
    frustumSize.toFixed(1),
    '- layout:',
    layout ?? 'vertical',
    '- framesPerRow:',
    framesPerRow,
    '- totalSize:',
    totalWidth,
    'x',
    totalHeight
  );

  // Create a FRESH camera for filmstrip rendering with the calculated frustum
  const filmstripCamera = createCamera(frameWidth, frameHeight, frustumSize, design.cameraView);

  // Create a SINGLE-FRAME render target (more reliable than viewport/scissor approach)
  const frameTarget = new WebGLRenderTarget(frameWidth, frameHeight, {
    minFilter: LinearFilter,
    magFilter: LinearFilter,
    format: RGBAFormat,
  });

  // Allocate the final composited pixel buffer
  const finalPixels = new Uint8Array(totalWidth * totalHeight * 4);
  const framePixels = new Uint8Array(frameWidth * frameHeight * 4);

  console.log(`[Filmstrip] Using per-frame render target: ${frameWidth}x${frameHeight}`);

  try {
    // CRITICAL: Reset ALL WebGL state before filmstrip generation
    renderer.setRenderTarget(null);
    renderer.setScissorTest(false);

    // Render each frame to its own render target, then copy pixels to final buffer
    for (let i = 0; i < frameCount && !generationCancelled; i++) {
      const col = i % framesPerRow;
      const row = Math.floor(i / framesPerRow);

      // Debug logging for first 3 frames and last frame
      if (i < 3 || i === frameCount - 1) {
        console.log(`[Filmstrip] Rendering frame ${i} at row=${row}, col=${col}`);
      }

      // Calculate rotation angle for this frame
      const angle = startAngle + (i / (frameCount - 1)) * sweepAngle;
      setPreviewRotation(angle);

      // Render this frame to the single-frame render target
      renderer.setRenderTarget(frameTarget);
      renderer.setViewport(0, 0, frameWidth, frameHeight);
      renderer.setClearColor(0x000000, 0);
      renderer.clear(true, true, true);
      renderer.render(scene, filmstripCamera);

      // Read pixels from this frame
      renderer.readRenderTargetPixels(frameTarget, 0, 0, frameWidth, frameHeight, framePixels);

      // Copy frame pixels to the correct position in the final buffer
      // WebGL Y is inverted, so we need to flip each frame vertically as we copy
      // Frame 0 should be at the TOP of the final image (y=0 in image coordinates)
      for (let srcY = 0; srcY < frameHeight; srcY++) {
        // Flip each frame vertically: bottom row of WebGL becomes top row of image
        const flippedSrcY = frameHeight - 1 - srcY;
        // Destination Y: frame i goes at row i (frame 0 at top)
        const destY = row * frameHeight + srcY;

        const srcOffset = flippedSrcY * frameWidth * 4;
        const destOffset = destY * totalWidth * 4 + col * frameWidth * 4;

        // Copy one row of pixels
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

    // Dispose the frame render target
    frameTarget.dispose();

    if (generationCancelled) {
      throw new Error('Generation cancelled');
    }

    console.log('[Filmstrip] Finished rendering all frames');

    // Reset render state
    renderer.setRenderTarget(null);

    // Report compositing stage
    onProgress({
      stage: 'compositing',
      currentFrame: frameCount,
      totalFrames: frameCount,
      percent: 95,
    });

    // Create canvas directly from the pre-composited pixels (no flipping needed)
    const canvas = document.createElement('canvas');
    canvas.width = totalWidth;
    canvas.height = totalHeight;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      throw new Error('Failed to create 2D context');
    }

    const imageData = new ImageData(new Uint8ClampedArray(finalPixels), totalWidth, totalHeight);
    ctx.putImageData(imageData, 0, 0);

    // Report compression stage
    onProgress({
      stage: 'compositing',
      currentFrame: frameCount,
      totalFrames: frameCount,
      percent: 97,
    });

    // Compress with UPNG (0 = best compression)
    // Use the imageData directly since we already handled Y-flip during pixel copy
    const pngBuffer = UPNG.encode(
      [imageData.data.buffer],
      totalWidth,
      totalHeight,
      0 // 0 colors = lossless, 0 compression level = best compression
    );

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

    // Return as data URL
    return `data:image/png;base64,${base64}`;
  } finally {
    // Reset render state
    if (renderer) {
      renderer.setPixelRatio(originalPixelRatio);
      renderer.setViewport(0, 0, renderer.domElement.width, renderer.domElement.height);
      renderer.setScissorTest(false);
      renderer.setRenderTarget(null);
      // Restore tone mapping for preview rendering
      renderer.toneMapping = originalToneMapping;
      renderer.toneMappingExposure = originalToneMappingExposure;
    }
    // Restore camera frustum to match original preview canvas dimensions
    if (camera) {
      updateCameraAspect(camera, originalWidth, originalHeight);
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
  setCameraView,
  setPreviewRotation,
  renderPreview,
  startPreviewAnimation,
  stopPreviewAnimation,
  resize,
  generateFilmstrip,
  cancelGeneration,
};
