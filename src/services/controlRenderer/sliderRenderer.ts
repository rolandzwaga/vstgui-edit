/**
 * Slider Control Renderer
 *
 * Three.js renderer implementation for slider controls.
 * Implements the ControlRenderer interface with full 3D rendering
 * using RoundedBoxGeometry for track and handle components.
 */

import {
  ACESFilmicToneMapping,
  type AmbientLight,
  Color,
  type DirectionalLight,
  Group,
  type HemisphereLight,
  LinearFilter,
  Mesh,
  MeshPhysicalMaterial,
  MeshStandardMaterial,
  NoToneMapping,
  type OrthographicCamera,
  RGBAFormat,
  type Scene,
  type Texture,
  WebGLRenderer,
  WebGLRenderTarget,
} from 'three';
import UPNG from 'upng-js';
import { createMaterial } from '../../domain/controlDesigner/materials';
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
import { disposeEnvironment, initializeEnvironment } from '../../domain/knobDesigner/environment';
import {
  calculateGripLinePositions,
  calculateHandlePosition,
  calculateSegments,
  calculateSliderGeometry,
  calculateTrackDimensions,
  calculateValueFillPosition,
  createGripLinesGeometry,
  createHandleGeometry,
  createTrackGeometry,
  createValueFillGeometry,
} from '../../domain/sliderDesigner/geometry';
import type {
  BaseControlDesign,
  ControlRenderer,
  GenerationProgress,
} from '../../types/controlDesigner';
import type { SliderDesign } from '../../types/controlDesigner/slider';

// ============================================================================
// Constants
// ============================================================================

/** World units for slider rendering */
const FRAME_WORLD_SIZE = 40; // Reference size in world units

/** Component IDs for raycasting */
export const COMPONENT_IDS = {
  TRACK: 'track',
  HANDLE: 'handle',
  FILL: 'fill',
} as const;

// ============================================================================
// Slider Renderer Class
// ============================================================================

/**
 * Three.js renderer for slider controls.
 * Handles 3D preview rendering and filmstrip generation.
 */
export class SliderRenderer implements ControlRenderer<SliderDesign> {
  private renderer: WebGLRenderer | null = null;
  private scene: Scene | null = null;
  private camera: OrthographicCamera | null = null;
  private mainLight: DirectionalLight | null = null;
  private ambientLight: AmbientLight | null = null;
  private hemisphereLight: HemisphereLight | null = null;
  private sliderGroup: Group | null = null;
  private environmentTexture: Texture | null = null;

  private trackMesh: Mesh | null = null;
  private handleMesh: Mesh | null = null;
  private fillMesh: Mesh | null = null;
  private gripLineMeshes: Mesh[] = [];

  private currentDesign: SliderDesign | null = null;
  private currentPosition = 0.5;
  private selectedComponentId: string | null = null;
  private generationCancelled = false;

  // ============================================================================
  // Initialization
  // ============================================================================

  /**
   * Initializes the renderer with a canvas element.
   */
  async initialize(canvas: HTMLCanvasElement): Promise<void> {
    if (!this.isWebGLAvailable()) {
      throw new Error('WebGL is not available in this browser');
    }

    // Create renderer
    this.renderer = new WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      preserveDrawingBuffer: true,
    });
    this.renderer.setClearColor(0x000000, 0);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.toneMapping = ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.0;

    // Get canvas dimensions
    const rect = canvas.getBoundingClientRect();
    this.renderer.setSize(rect.width, rect.height);

    // Create scene and camera
    this.scene = createScene();
    this.camera = createCamera(rect.width, rect.height);

    // Initialize environment map
    try {
      this.environmentTexture = await initializeEnvironment(this.renderer);
      if (this.environmentTexture && this.scene) {
        this.scene.environment = this.environmentTexture;
        this.scene.environmentIntensity = 0.8;
      }
    } catch (error) {
      console.warn('[SliderRenderer] Failed to initialize environment map:', error);
    }

    // Create lighting
    this.mainLight = createMainLight(0, 60);
    this.ambientLight = createAmbientLight(0.3);
    this.hemisphereLight = createHemisphereLight(0.4);
    this.scene.add(this.mainLight);
    this.scene.add(this.mainLight.target);
    this.scene.add(this.ambientLight);
    this.scene.add(this.hemisphereLight);

    // Create slider group
    this.sliderGroup = new Group();
    this.scene.add(this.sliderGroup);
  }

  /**
   * Checks if WebGL is available.
   */
  private isWebGLAvailable(): boolean {
    try {
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('webgl2') || canvas.getContext('webgl');
      return context !== null;
    } catch {
      return false;
    }
  }

  // ============================================================================
  // Scene Updates
  // ============================================================================

  /**
   * Updates the 3D scene based on design changes.
   */
  updateScene(design: BaseControlDesign): void {
    if (!this.scene || !this.sliderGroup || !this.mainLight || !this.camera) return;

    // Defensive check: ensure we're receiving a slider design
    if (design.controlType !== 'slider') {
      console.warn('[SliderRenderer] Received non-slider design, ignoring', design.controlType);
      return;
    }

    const sliderDesign = design as SliderDesign;
    this.currentDesign = sliderDesign;

    // Clear existing geometry
    this.clearSliderGroup();

    // Calculate world dimensions
    const frameWidth = FRAME_WORLD_SIZE;
    const frameHeight =
      FRAME_WORLD_SIZE * (sliderDesign.output.frameHeight / sliderDesign.output.frameWidth);

    // Get calculated dimensions
    const sliderGeom = calculateSliderGeometry(sliderDesign, frameWidth, frameHeight);
    const isVertical = sliderDesign.track.orientation === 'vertical';

    // Create track mesh
    const trackGeometry = createTrackGeometry(sliderDesign.track, frameWidth, frameHeight);
    const trackMaterial = createMaterial(sliderDesign.track.material);
    this.trackMesh = new Mesh(trackGeometry, trackMaterial);
    this.trackMesh.userData.componentId = COMPONENT_IDS.TRACK;
    this.trackMesh.castShadow = true;
    this.trackMesh.receiveShadow = true;
    this.sliderGroup.add(this.trackMesh);

    // Create handle mesh
    const handleGeometry = createHandleGeometry(
      sliderDesign.handle,
      sliderGeom.track.width,
      calculateSegments(Math.max(sliderDesign.output.frameWidth, sliderDesign.output.frameHeight))
    );
    const handleMaterial = createMaterial(sliderDesign.handle.material);
    this.handleMesh = new Mesh(handleGeometry, handleMaterial);
    this.handleMesh.userData.componentId = COMPONENT_IDS.HANDLE;
    this.handleMesh.castShadow = true;
    this.handleMesh.receiveShadow = true;

    // Position handle above track
    const handleZ = sliderGeom.track.depth / 2 + sliderGeom.handle.depth / 2 + 0.5;
    this.handleMesh.position.z = handleZ;

    // Apply current position
    this.updateHandlePosition(this.currentPosition);

    this.sliderGroup.add(this.handleMesh);

    // Create grip lines if needed
    this.createGripLines(sliderDesign, sliderGeom.track.width, isVertical, handleZ);

    // Create value fill if enabled
    this.createValueFill(sliderDesign, frameWidth, frameHeight);

    // Update lighting
    updateLightPosition(
      this.mainLight,
      sliderDesign.lighting.azimuth,
      sliderDesign.lighting.elevation
    );

    // Update camera view
    setCameraView(this.camera, sliderDesign.cameraView);

    // Apply selection highlight if any
    if (this.selectedComponentId) {
      this.applySelectionHighlight(this.selectedComponentId);
    }
  }

  /**
   * Clears all meshes from the slider group.
   */
  private clearSliderGroup(): void {
    if (!this.sliderGroup) return;

    this.sliderGroup.traverse(obj => {
      if (obj instanceof Mesh) {
        obj.geometry.dispose();
        if (
          obj.material instanceof MeshStandardMaterial ||
          obj.material instanceof MeshPhysicalMaterial
        ) {
          obj.material.dispose();
        }
      }
    });
    this.sliderGroup.clear();

    this.trackMesh = null;
    this.handleMesh = null;
    this.fillMesh = null;
    this.gripLineMeshes = [];
  }

  /**
   * Creates grip line meshes on the handle.
   */
  private createGripLines(
    design: SliderDesign,
    trackWidth: number,
    isVertical: boolean,
    handleZ: number
  ): void {
    if (design.handle.gripLines === 0 || !this.sliderGroup) return;

    const geometries = createGripLinesGeometry(design.handle, trackWidth, isVertical);
    const positions = calculateGripLinePositions(design.handle, trackWidth, isVertical, handleZ);

    // Create dark material for grip lines
    const gripMaterial = new MeshStandardMaterial({
      color: new Color(0x333333),
      roughness: 0.9,
      metalness: 0.1,
    });

    this.gripLineMeshes = [];

    for (let i = 0; i < geometries.length; i++) {
      const mesh = new Mesh(geometries[i], gripMaterial.clone());
      mesh.position.set(positions[i].x, positions[i].y, positions[i].z);
      mesh.userData.componentId = COMPONENT_IDS.HANDLE;
      this.gripLineMeshes.push(mesh);
      this.sliderGroup.add(mesh);
    }
  }

  /**
   * Creates the value fill mesh.
   */
  private createValueFill(design: SliderDesign, frameWidth: number, frameHeight: number): void {
    if (design.valueFill.mode === 'none' || !this.sliderGroup) return;

    const fillGeometry = createValueFillGeometry(
      design.valueFill,
      design.track,
      frameWidth,
      frameHeight,
      this.currentPosition
    );

    if (!fillGeometry) return;

    // Parse fill color
    const fillColor = new Color(design.valueFill.color.slice(0, 7));

    // Create emissive material for glow effect
    const fillMaterial = new MeshStandardMaterial({
      color: fillColor,
      emissive: fillColor,
      emissiveIntensity: design.valueFill.glowIntensity / 100,
      roughness: 0.3,
      metalness: 0.1,
      transparent: true,
      opacity: 0.9,
    });

    this.fillMesh = new Mesh(fillGeometry, fillMaterial);
    this.fillMesh.userData.componentId = COMPONENT_IDS.FILL;

    // Position fill behind track (lower Z)
    const { depth: trackDepth } = calculateTrackDimensions(design.track, frameWidth, frameHeight);
    this.fillMesh.position.z = trackDepth / 2 + 0.5;

    // Update fill position based on current value
    this.updateValueFillPosition(this.currentPosition);

    this.sliderGroup.add(this.fillMesh);
  }

  /**
   * Updates handle position based on normalized value.
   */
  private updateHandlePosition(position: number): void {
    if (!this.handleMesh || !this.currentDesign) return;

    const frameWidth = FRAME_WORLD_SIZE;
    const frameHeight =
      FRAME_WORLD_SIZE *
      (this.currentDesign.output.frameHeight / this.currentDesign.output.frameWidth);

    const handlePos = calculateHandlePosition(
      position,
      this.currentDesign.track,
      this.currentDesign.handle,
      frameWidth,
      frameHeight
    );

    this.handleMesh.position.x = handlePos.x;
    this.handleMesh.position.y = handlePos.y;

    // Also update grip line positions
    for (const gripMesh of this.gripLineMeshes) {
      gripMesh.position.x =
        handlePos.x +
        (this.currentDesign.track.orientation === 'vertical'
          ? 0
          : (gripMesh.userData.offsetX ?? 0));
      gripMesh.position.y =
        handlePos.y +
        (this.currentDesign.track.orientation === 'vertical'
          ? (gripMesh.userData.offsetY ?? 0)
          : 0);
    }
  }

  /**
   * Updates value fill position and size.
   */
  private updateValueFillPosition(position: number): void {
    if (!this.fillMesh || !this.currentDesign) return;

    const frameWidth = FRAME_WORLD_SIZE;
    const frameHeight =
      FRAME_WORLD_SIZE *
      (this.currentDesign.output.frameHeight / this.currentDesign.output.frameWidth);

    // Recreate fill geometry for new position
    const newGeometry = createValueFillGeometry(
      this.currentDesign.valueFill,
      this.currentDesign.track,
      frameWidth,
      frameHeight,
      position
    );

    if (newGeometry) {
      this.fillMesh.geometry.dispose();
      this.fillMesh.geometry = newGeometry;
    }

    const fillPos = calculateValueFillPosition(
      position,
      this.currentDesign.track,
      this.currentDesign.valueFill,
      frameWidth,
      frameHeight
    );

    this.fillMesh.position.x = fillPos.x;
    this.fillMesh.position.y = fillPos.y;
  }

  // ============================================================================
  // Position Control
  // ============================================================================

  /**
   * Sets the preview position for the slider (0-1).
   */
  setPosition(position: number): void {
    this.currentPosition = Math.max(0, Math.min(1, position));
    this.updateHandlePosition(this.currentPosition);
    this.updateValueFillPosition(this.currentPosition);
  }

  // ============================================================================
  // Component Selection
  // ============================================================================

  /**
   * Sets the selected component for highlighting.
   */
  setSelectedComponent(componentId: string | null): void {
    // Clear previous selection
    if (this.selectedComponentId) {
      this.clearSelectionHighlight(this.selectedComponentId);
    }

    this.selectedComponentId = componentId;

    // Apply new selection
    if (componentId) {
      this.applySelectionHighlight(componentId);
    }
  }

  /**
   * Applies selection highlight to a component.
   */
  private applySelectionHighlight(componentId: string): void {
    const mesh = this.getMeshByComponentId(componentId);
    if (!mesh) return;

    // Store original emissive for restoration
    const material = mesh.material as MeshStandardMaterial;
    if (material.emissive) {
      mesh.userData.originalEmissive = material.emissive.clone();
      mesh.userData.originalEmissiveIntensity = material.emissiveIntensity;
      material.emissive.set(0x4488ff);
      material.emissiveIntensity = 0.3;
    }
  }

  /**
   * Clears selection highlight from a component.
   */
  private clearSelectionHighlight(componentId: string): void {
    const mesh = this.getMeshByComponentId(componentId);
    if (!mesh) return;

    const material = mesh.material as MeshStandardMaterial;
    if (mesh.userData.originalEmissive) {
      material.emissive.copy(mesh.userData.originalEmissive);
      material.emissiveIntensity = mesh.userData.originalEmissiveIntensity ?? 0;
    }
  }

  /**
   * Gets mesh by component ID.
   */
  private getMeshByComponentId(componentId: string): Mesh | null {
    switch (componentId) {
      case COMPONENT_IDS.TRACK:
        return this.trackMesh;
      case COMPONENT_IDS.HANDLE:
        return this.handleMesh;
      case COMPONENT_IDS.FILL:
        return this.fillMesh;
      default:
        return null;
    }
  }

  // ============================================================================
  // Rendering
  // ============================================================================

  /**
   * Renders a single preview frame.
   */
  renderPreview(): void {
    if (!this.renderer || !this.scene || !this.camera) return;
    this.renderer.setRenderTarget(null);
    this.renderer.render(this.scene, this.camera);
  }

  /**
   * Resizes the renderer.
   */
  resize(width: number, height: number): void {
    if (!this.renderer || !this.camera) return;
    this.renderer.setSize(width, height);
    updateCameraAspect(this.camera, width, height);
  }

  // ============================================================================
  // Filmstrip Generation
  // ============================================================================

  /**
   * Generates a filmstrip image from the slider design.
   */
  async generateFilmstrip(
    design: BaseControlDesign,
    onProgress: (progress: GenerationProgress) => void
  ): Promise<string> {
    if (!this.renderer || !this.scene || !this.camera || !this.sliderGroup) {
      throw new Error('Renderer not initialized');
    }

    this.generationCancelled = false;

    const sliderDesign = design as SliderDesign;
    this.updateScene(sliderDesign);

    const { frameCount, frameWidth, frameHeight, layout } = sliderDesign.output;

    // Calculate filmstrip dimensions
    let framesPerRow: number;
    let rows: number;

    switch (layout ?? 'vertical') {
      case 'vertical':
        framesPerRow = 1;
        rows = frameCount;
        break;
      case 'horizontal':
        framesPerRow = frameCount;
        rows = 1;
        break;
      default: {
        const sqrt = Math.sqrt(frameCount);
        const candidates = [8, 16, 32, 64];
        framesPerRow = candidates.find(c => c >= sqrt) ?? 64;
        rows = Math.ceil(frameCount / framesPerRow);
        break;
      }
    }

    const totalWidth = frameWidth * framesPerRow;
    const totalHeight = frameHeight * rows;

    // Report preparing stage
    onProgress({
      stage: 'preparing',
      currentFrame: 0,
      totalFrames: frameCount,
      percent: 0,
    });

    // Store original state
    const originalPixelRatio = this.renderer.getPixelRatio();
    const originalToneMapping = this.renderer.toneMapping;

    // Configure for filmstrip rendering
    this.renderer.setPixelRatio(1);
    this.renderer.toneMapping = NoToneMapping;

    // Calculate frustum size for filmstrip
    const frustumSize = this.calculateFrustumSize(sliderDesign);
    const filmstripCamera = createCamera(
      frameWidth,
      frameHeight,
      frustumSize,
      sliderDesign.cameraView
    );

    // Create render target
    const frameTarget = new WebGLRenderTarget(frameWidth, frameHeight, {
      minFilter: LinearFilter,
      magFilter: LinearFilter,
      format: RGBAFormat,
    });

    // Allocate pixel buffers
    const finalPixels = new Uint8Array(totalWidth * totalHeight * 4);
    const framePixels = new Uint8Array(frameWidth * frameHeight * 4);

    try {
      this.renderer.setRenderTarget(null);
      this.renderer.setScissorTest(false);

      // Render each frame
      for (let i = 0; i < frameCount && !this.generationCancelled; i++) {
        const col = i % framesPerRow;
        const row = Math.floor(i / framesPerRow);

        // Calculate position for this frame (linear interpolation 0 to 1)
        const position = frameCount > 1 ? i / (frameCount - 1) : 0.5;
        this.setPosition(position);

        // Render frame
        this.renderer.setRenderTarget(frameTarget);
        this.renderer.setViewport(0, 0, frameWidth, frameHeight);
        this.renderer.setClearColor(0x000000, 0);
        this.renderer.clear(true, true, true);
        this.renderer.render(this.scene, filmstripCamera);

        // Read pixels
        this.renderer.readRenderTargetPixels(
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

        // Yield to UI
        if (i % 4 === 0) {
          await new Promise(resolve => setTimeout(resolve, 0));
        }
      }

      frameTarget.dispose();

      if (this.generationCancelled) {
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
      if (this.renderer) {
        this.renderer.setPixelRatio(originalPixelRatio);
        this.renderer.setRenderTarget(null);
        this.renderer.setScissorTest(false);
        this.renderer.toneMapping = originalToneMapping;
      }
    }
  }

  /**
   * Calculates the frustum size for filmstrip rendering.
   */
  private calculateFrustumSize(design: SliderDesign): number {
    const frameWidth = FRAME_WORLD_SIZE;
    const frameHeight = FRAME_WORLD_SIZE * (design.output.frameHeight / design.output.frameWidth);

    const { track, handle, isVertical } = calculateSliderGeometry(design, frameWidth, frameHeight);

    // Calculate maximum extent
    const trackExtent = isVertical
      ? Math.max(track.length, track.width + handle.width)
      : Math.max(track.length + handle.width, track.width);

    // Add padding
    return trackExtent * 1.2;
  }

  /**
   * Cancels ongoing generation.
   */
  cancelGeneration(): void {
    this.generationCancelled = true;
  }

  // ============================================================================
  // Disposal
  // ============================================================================

  /**
   * Disposes of all Three.js resources.
   */
  dispose(): void {
    this.clearSliderGroup();

    // Dispose environment
    disposeEnvironment();
    this.environmentTexture = null;

    // Dispose lighting
    this.mainLight = null;
    this.ambientLight = null;
    this.hemisphereLight = null;

    // Dispose scene
    if (this.scene) {
      this.scene.clear();
      this.scene = null;
    }

    // Dispose renderer
    if (this.renderer) {
      this.renderer.dispose();
      this.renderer = null;
    }

    this.camera = null;
    this.sliderGroup = null;
    this.currentDesign = null;
  }
}

// ============================================================================
// Factory Function
// ============================================================================

/**
 * Creates a new slider renderer instance.
 */
export function createSliderRenderer(): ControlRenderer<SliderDesign> {
  return new SliderRenderer();
}

/**
 * Slider renderer service singleton.
 */
export const sliderRendererService = {
  createRenderer: createSliderRenderer,
};
