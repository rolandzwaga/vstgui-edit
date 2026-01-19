/**
 * Environment Map Generation
 *
 * Creates procedural studio-style environment maps for realistic
 * metallic reflections using PMREMGenerator.
 *
 * Based on Three.js PMREMGenerator.fromScene() technique which renders
 * a scene with light-forming meshes to create an environment cubemap.
 *
 * @see https://threejs.org/docs/#api/en/extras/PMREMGenerator
 * @see https://discourse.threejs.org/t/live-envmaps-and-getting-realistic-studio-lighting-almost-for-free/35627
 */

import {
  BackSide,
  BoxGeometry,
  Color,
  EquirectangularReflectionMapping,
  FloatType,
  Mesh,
  MeshBasicMaterial,
  PlaneGeometry,
  PMREMGenerator,
  Scene,
  SphereGeometry,
  type Texture,
  type WebGLRenderer,
  type WebGLRenderTarget,
} from 'three';
import { HDRLoader } from 'three/addons/loaders/HDRLoader.js';

// ============================================================================
// Types
// ============================================================================

/** Environment map configuration */
export interface EnvironmentConfig {
  /** Intensity multiplier for the environment (0-2) */
  intensity: number;
  /** Whether to use procedural or loaded HDRI */
  type: 'procedural' | 'hdri';
  /** URL to HDRI file (if type is 'hdri') */
  hdriUrl?: string;
}

/** Default environment configuration */
export const DEFAULT_ENVIRONMENT_CONFIG: EnvironmentConfig = {
  intensity: 1.0,
  type: 'procedural',
};

// ============================================================================
// Module State
// ============================================================================

let currentEnvironmentTexture: Texture | null = null;
let environmentRenderTarget: WebGLRenderTarget | null = null;

// ============================================================================
// Procedural Environment Creation
// ============================================================================

/**
 * Creates a simple studio lighting scene for environment map generation.
 * Uses meshes with emissive-like bright colors that act as soft light sources.
 *
 * The scene includes:
 * - A dark backdrop (like a photography studio)
 * - Large soft key light (top-front)
 * - Fill light (side)
 * - Rim/accent lights (back corners)
 * - Ground reflection plane
 *
 * @returns Scene configured for PMREM generation
 */
function createStudioLightingScene(): Scene {
  const scene = new Scene();

  // Dark studio backdrop - large sphere with inside-facing normals
  const backdropGeometry = new SphereGeometry(50, 32, 32);
  const backdropMaterial = new MeshBasicMaterial({
    color: new Color(0x1a1a2e), // Very dark blue-gray
    side: BackSide,
  });
  const backdrop = new Mesh(backdropGeometry, backdropMaterial);
  scene.add(backdrop);

  // Key light - large soft panel (top-front, slightly right)
  // Using bright white with high intensity for strong specular highlights
  const keyLightGeometry = new PlaneGeometry(30, 20);
  const keyLightMaterial = new MeshBasicMaterial({
    color: new Color(4, 4, 4), // HDR value > 1 for bright light
  });
  const keyLight = new Mesh(keyLightGeometry, keyLightMaterial);
  keyLight.position.set(10, 25, 20);
  keyLight.lookAt(0, 0, 0);
  scene.add(keyLight);

  // Fill light - softer panel (left side)
  const fillLightGeometry = new PlaneGeometry(25, 15);
  const fillLightMaterial = new MeshBasicMaterial({
    color: new Color(2, 2, 2.2), // Slightly cooler fill
  });
  const fillLight = new Mesh(fillLightGeometry, fillLightMaterial);
  fillLight.position.set(-25, 10, 10);
  fillLight.lookAt(0, 0, 0);
  scene.add(fillLight);

  // Rim light 1 - accent from back-right
  const rimLight1Geometry = new PlaneGeometry(15, 10);
  const rimLight1Material = new MeshBasicMaterial({
    color: new Color(3, 2.8, 2.5), // Warm accent
  });
  const rimLight1 = new Mesh(rimLight1Geometry, rimLight1Material);
  rimLight1.position.set(20, 5, -25);
  rimLight1.lookAt(0, 0, 0);
  scene.add(rimLight1);

  // Rim light 2 - accent from back-left
  const rimLight2Geometry = new PlaneGeometry(12, 8);
  const rimLight2Material = new MeshBasicMaterial({
    color: new Color(2.5, 2.8, 3), // Cool accent
  });
  const rimLight2 = new Mesh(rimLight2Geometry, rimLight2Material);
  rimLight2.position.set(-18, 8, -20);
  rimLight2.lookAt(0, 0, 0);
  scene.add(rimLight2);

  // Ground plane - subtle reflection from below
  const groundGeometry = new PlaneGeometry(60, 60);
  const groundMaterial = new MeshBasicMaterial({
    color: new Color(0.15, 0.15, 0.18), // Dark gray with slight blue tint
  });
  const ground = new Mesh(groundGeometry, groundMaterial);
  ground.position.set(0, -20, 0);
  ground.rotation.x = -Math.PI / 2;
  scene.add(ground);

  // Top ambient glow - very large soft overhead
  const topGlowGeometry = new BoxGeometry(80, 2, 80);
  const topGlowMaterial = new MeshBasicMaterial({
    color: new Color(0.8, 0.85, 1.0), // Soft cool white
  });
  const topGlow = new Mesh(topGlowGeometry, topGlowMaterial);
  topGlow.position.set(0, 35, 0);
  scene.add(topGlow);

  return scene;
}

/**
 * Generates a procedural studio environment map.
 *
 * Uses PMREMGenerator.fromScene() to render a scene with light-forming
 * meshes into a prefiltered environment cubemap suitable for PBR materials.
 *
 * @param renderer - The WebGL renderer
 * @returns PMREM texture for scene.environment
 */
export function generateProceduralEnvironment(renderer: WebGLRenderer): Texture {
  // Create a fresh PMREMGenerator for this operation
  const generator = new PMREMGenerator(renderer);

  // Create studio lighting scene
  const studioScene = createStudioLightingScene();

  // Generate PMREM from the scene
  // Using sigma=0 for sharp reflections, size=256 is default and good for performance
  environmentRenderTarget = generator.fromScene(studioScene, 0, 0.1, 100);
  currentEnvironmentTexture = environmentRenderTarget.texture;

  // CRITICAL: Dispose the PMREMGenerator immediately after use
  // PMREMGenerator holds internal WebGL state (render targets, viewports) that
  // can interfere with subsequent render operations like filmstrip generation
  generator.dispose();

  // Dispose the temporary scene
  studioScene.traverse(obj => {
    if (obj instanceof Mesh) {
      obj.geometry.dispose();
      if (obj.material instanceof MeshBasicMaterial) {
        obj.material.dispose();
      }
    }
  });

  return currentEnvironmentTexture;
}

// ============================================================================
// HDRI Loading
// ============================================================================

/**
 * Loads an HDRI environment map from a URL.
 *
 * Uses HDRLoader (Three.js r179+, formerly RGBELoader) to load the HDR file,
 * then PMREMGenerator to convert it to a prefiltered environment map.
 *
 * @param renderer - The WebGL renderer
 * @param url - URL to the .hdr file (typically in /public/hdri/)
 * @returns Promise resolving to PMREM texture for scene.environment
 */
export async function loadHDRIEnvironment(renderer: WebGLRenderer, url: string): Promise<Texture> {
  return new Promise((resolve, reject) => {
    const loader = new HDRLoader();
    loader.setDataType(FloatType);

    loader.load(
      url,
      texture => {
        // Set mapping for equirectangular HDR
        texture.mapping = EquirectangularReflectionMapping;

        // Create a fresh PMREMGenerator for this operation
        const generator = new PMREMGenerator(renderer);
        generator.compileEquirectangularShader();

        // Generate PMREM from the loaded texture
        environmentRenderTarget = generator.fromEquirectangular(texture);
        currentEnvironmentTexture = environmentRenderTarget.texture;

        // CRITICAL: Dispose the PMREMGenerator immediately after use
        // PMREMGenerator holds internal WebGL state that can interfere with
        // subsequent render operations like filmstrip generation
        generator.dispose();

        // Dispose the original texture (we only need the PMREM version)
        texture.dispose();

        resolve(currentEnvironmentTexture);
      },
      undefined,
      error => {
        console.error('[Environment] Failed to load HDRI:', url, error);
        reject(error);
      }
    );
  });
}

// ============================================================================
// Environment Setup
// ============================================================================

/**
 * Initializes the environment map system.
 * Creates a procedural environment by default, or loads HDRI if configured.
 *
 * @param renderer - The WebGL renderer
 * @param config - Environment configuration
 * @returns Promise resolving to the environment texture
 */
export async function initializeEnvironment(
  renderer: WebGLRenderer,
  config: EnvironmentConfig = DEFAULT_ENVIRONMENT_CONFIG
): Promise<Texture> {
  // Dispose any existing environment
  disposeEnvironment();

  try {
    if (config.type === 'hdri' && config.hdriUrl) {
      // Try to load HDRI
      return await loadHDRIEnvironment(renderer, config.hdriUrl);
    }
  } catch {
    console.warn('[Environment] HDRI load failed, falling back to procedural');
  }

  // Default to procedural environment
  return generateProceduralEnvironment(renderer);
}

/**
 * Gets the current environment texture.
 *
 * @returns Current environment texture, or null if not initialized
 */
export function getEnvironmentTexture(): Texture | null {
  return currentEnvironmentTexture;
}

// ============================================================================
// Cleanup
// ============================================================================

/**
 * Disposes of environment map resources.
 * Should be called when the renderer is disposed.
 */
export function disposeEnvironment(): void {
  if (environmentRenderTarget) {
    environmentRenderTarget.dispose();
    environmentRenderTarget = null;
  }

  currentEnvironmentTexture = null;
}
