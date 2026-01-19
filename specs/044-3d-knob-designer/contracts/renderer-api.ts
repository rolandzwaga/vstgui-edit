/**
 * Knob Renderer API Contract
 *
 * Defines the Three.js rendering service interface for the 3D knob preview
 * and filmstrip generation.
 */

import type { KnobDesign, GenerationProgress } from '../../../src/types/knobDesigner';

// ============================================================================
// Renderer Service Interface
// ============================================================================

export interface KnobRendererService {
  /**
   * Initializes the Three.js renderer and attaches to a canvas.
   *
   * @param canvas - Canvas element to render to
   * @throws If WebGL is not available
   */
  initialize(canvas: HTMLCanvasElement): void;

  /**
   * Disposes of all Three.js resources.
   * Must be called when modal closes.
   */
  dispose(): void;

  /**
   * Updates the 3D scene based on current design.
   * Call when any design parameter changes.
   *
   * @param design - Current knob design configuration
   */
  updateScene(design: KnobDesign): void;

  /**
   * Sets the preview rotation angle (for animation preview).
   *
   * @param angle - Rotation angle in degrees
   */
  setPreviewRotation(angle: number): void;

  /**
   * Renders a single frame to the preview canvas.
   */
  renderPreview(): void;

  /**
   * Starts the preview animation loop.
   * Rotates the knob through the full sweep range.
   */
  startPreviewAnimation(): void;

  /**
   * Stops the preview animation loop.
   */
  stopPreviewAnimation(): void;

  /**
   * Generates a filmstrip image from the current design.
   *
   * @param design - Knob design configuration
   * @param onProgress - Progress callback
   * @returns PNG data URL of the filmstrip
   * @throws If generation fails
   */
  generateFilmstrip(
    design: KnobDesign,
    onProgress: (progress: GenerationProgress) => void
  ): Promise<string>;

  /**
   * Cancels ongoing filmstrip generation.
   */
  cancelGeneration(): void;

  /**
   * Resizes the renderer to fit container.
   *
   * @param width - New width in pixels
   * @param height - New height in pixels
   */
  resize(width: number, height: number): void;

  /**
   * Checks if WebGL is available in the browser.
   *
   * @returns True if WebGL is supported
   */
  isWebGLAvailable(): boolean;
}

// ============================================================================
// Geometry Builder Interface
// ============================================================================

export interface KnobGeometryBuilder {
  /**
   * Creates geometry for a knob layer.
   *
   * @param layer - Layer configuration
   * @param overallDiameter - Overall knob diameter in pixels
   * @param overallHeight - Overall knob height in pixels
   * @param segments - Number of radial segments (adaptive)
   * @returns Three.js BufferGeometry
   */
  createLayerGeometry(
    layer: import('../../../src/types/knobDesigner').KnobLayer,
    overallDiameter: number,
    overallHeight: number,
    segments: number
  ): import('three').BufferGeometry;

  /**
   * Creates geometry for an indicator.
   *
   * @param indicator - Indicator configuration
   * @param layerRadius - Radius of the top layer
   * @param segments - Number of segments for curved indicators
   * @returns Three.js BufferGeometry
   */
  createIndicatorGeometry(
    indicator: import('../../../src/types/knobDesigner').KnobIndicator,
    layerRadius: number,
    segments: number
  ): import('three').BufferGeometry;

  /**
   * Calculates adaptive segment count based on output size.
   *
   * @param diameter - Output frame diameter in pixels
   * @returns Recommended segment count (16-128)
   */
  calculateSegments(diameter: number): number;
}

// ============================================================================
// Material Factory Interface
// ============================================================================

export interface KnobMaterialFactory {
  /**
   * Creates a material based on type and parameters.
   *
   * @param material - Material configuration
   * @returns Three.js Material
   */
  createMaterial(
    material: import('../../../src/types/knobDesigner').LayerMaterial
  ): import('three').Material;

  /**
   * Creates a brushed metal material with procedural noise.
   *
   * @param color - Base color hex string
   * @param direction - Brush direction (radial/linear)
   * @param intensity - Noise intensity (0-100)
   * @param roughness - Surface roughness (0-1)
   * @returns Three.js Material with custom shader
   */
  createBrushedMetalMaterial(
    color: string,
    direction: 'radial' | 'linear',
    intensity: number,
    roughness: number
  ): import('three').Material;

  /**
   * Disposes of all cached materials.
   */
  disposeAll(): void;
}

// ============================================================================
// Scene Setup Interface
// ============================================================================

export interface KnobSceneSetup {
  /**
   * Creates and configures the Three.js scene.
   *
   * @returns Configured scene
   */
  createScene(): import('three').Scene;

  /**
   * Creates an orthographic camera for knob rendering.
   *
   * @param width - Viewport width
   * @param height - Viewport height
   * @returns Configured camera
   */
  createCamera(width: number, height: number): import('three').OrthographicCamera;

  /**
   * Creates and positions the main directional light.
   *
   * @param azimuth - Azimuth angle in degrees
   * @param elevation - Elevation angle in degrees
   * @returns Configured directional light
   */
  createMainLight(azimuth: number, elevation: number): import('three').DirectionalLight;

  /**
   * Creates the ambient fill light.
   *
   * @param intensity - Light intensity (0-1)
   * @returns Configured ambient light
   */
  createAmbientLight(intensity: number): import('three').AmbientLight;

  /**
   * Updates light position from spherical coordinates.
   *
   * @param light - Light to update
   * @param azimuth - Azimuth angle in degrees
   * @param elevation - Elevation angle in degrees
   */
  updateLightPosition(
    light: import('three').DirectionalLight,
    azimuth: number,
    elevation: number
  ): void;
}

// ============================================================================
// Filmstrip Compositor Interface
// ============================================================================

export interface FilmstripCompositor {
  /**
   * Creates a render target sized for the complete filmstrip.
   *
   * @param frameWidth - Single frame width
   * @param frameHeight - Single frame height
   * @param frameCount - Total number of frames
   * @param framesPerRow - Frames per row in the filmstrip
   * @returns WebGLRenderTarget sized for all frames
   */
  createRenderTarget(
    frameWidth: number,
    frameHeight: number,
    frameCount: number,
    framesPerRow: number
  ): import('three').WebGLRenderTarget;

  /**
   * Calculates optimal frames per row for the filmstrip layout.
   *
   * @param frameCount - Total frames
   * @returns Optimal frames per row (power of 2 preferred)
   */
  calculateFramesPerRow(frameCount: number): number;

  /**
   * Gets viewport/scissor rect for a specific frame.
   *
   * @param frameIndex - Frame index (0-based)
   * @param frameWidth - Single frame width
   * @param frameHeight - Single frame height
   * @param framesPerRow - Frames per row
   * @returns Rectangle {x, y, width, height}
   */
  getFrameViewport(
    frameIndex: number,
    frameWidth: number,
    frameHeight: number,
    framesPerRow: number
  ): { x: number; y: number; width: number; height: number };

  /**
   * Extracts pixels from render target and creates PNG data URL.
   *
   * @param renderer - WebGL renderer
   * @param target - Render target with rendered frames
   * @returns PNG data URL
   */
  extractPng(
    renderer: import('three').WebGLRenderer,
    target: import('three').WebGLRenderTarget
  ): string;
}

// ============================================================================
// Service Singleton Exports
// ============================================================================

/**
 * Singleton renderer service instance.
 */
export declare const knobRendererService: KnobRendererService;

/**
 * Geometry builder utility.
 */
export declare const knobGeometryBuilder: KnobGeometryBuilder;

/**
 * Material factory utility.
 */
export declare const knobMaterialFactory: KnobMaterialFactory;

/**
 * Scene setup utility.
 */
export declare const knobSceneSetup: KnobSceneSetup;

/**
 * Filmstrip compositor utility.
 */
export declare const filmstripCompositor: FilmstripCompositor;
