/**
 * Control Designer Scene Utilities
 *
 * Utilities for creating and configuring the Three.js scene,
 * camera, and lighting for control rendering.
 * Migrated from knobDesigner/scene.ts for shared use.
 */

import {
  AmbientLight,
  DirectionalLight,
  HemisphereLight,
  OrthographicCamera,
  Scene,
  Spherical,
  Vector3,
} from 'three';
import type { CameraView, LightingConfig } from '../../types/controlDesigner';

// ============================================================================
// Constants
// ============================================================================

/** Default light intensity */
const MAIN_LIGHT_INTENSITY = 1.0;
const AMBIENT_LIGHT_INTENSITY = 0.3;
const HEMISPHERE_LIGHT_INTENSITY = 0.4;

/** Distance of main light from scene center */
const LIGHT_DISTANCE = 100;

// ============================================================================
// Scene Creation
// ============================================================================

/**
 * Creates and configures a Three.js scene.
 *
 * @returns Configured scene with transparent background
 */
export function createScene(): Scene {
  const scene = new Scene();
  scene.background = null; // Transparent background for PNG export
  return scene;
}

// ============================================================================
// Camera Creation
// ============================================================================

/**
 * Creates an orthographic camera for control rendering.
 * Orthographic camera ensures consistent control size regardless of distance.
 *
 * @param width - Viewport width in pixels
 * @param height - Viewport height in pixels
 * @param frustumSize - Size of the view frustum (defaults to 100)
 * @param view - Camera view angle ('top' or 'side', defaults to 'top')
 * @returns Configured orthographic camera
 */
export function createCamera(
  width: number,
  height: number,
  frustumSize = 100,
  view: CameraView = 'top'
): OrthographicCamera {
  const aspect = width / height;
  const halfHeight = frustumSize / 2;
  const halfWidth = halfHeight * aspect;

  const camera = new OrthographicCamera(
    -halfWidth, // left
    halfWidth, // right
    halfHeight, // top
    -halfHeight, // bottom
    0.1, // near
    1000 // far
  );

  // Position camera based on view angle
  setCameraView(camera, view);

  return camera;
}

/**
 * Sets the camera position and orientation based on view angle.
 *
 * @param camera - Camera to update
 * @param view - Camera view angle ('top' or 'side')
 */
export function setCameraView(camera: OrthographicCamera, view: CameraView): void {
  if (view === 'top') {
    // Top view: camera above looking down at the control
    // Using -Z as up so that lighting directions are intuitive:
    // - Azimuth 0 = front (bottom of screen, toward viewer)
    // - Azimuth 90 = right
    // - Azimuth 180 = back (top of screen)
    // - Azimuth 270 = left
    camera.position.set(0, 100, 0);
    camera.up.set(0, 0, -1);
    camera.lookAt(0, 0, 0);
  } else {
    // Side view: camera in front looking at the control from the side
    camera.position.set(0, 0, 100);
    camera.up.set(0, 1, 0); // Y-axis points up
    camera.lookAt(0, 0, 0);
  }
}

/**
 * Updates camera frustum for new viewport dimensions.
 *
 * @param camera - Camera to update
 * @param width - New viewport width
 * @param height - New viewport height
 * @param frustumSize - Size of the view frustum
 */
export function updateCameraAspect(
  camera: OrthographicCamera,
  width: number,
  height: number,
  frustumSize = 100
): void {
  const aspect = width / height;
  const halfHeight = frustumSize / 2;
  const halfWidth = halfHeight * aspect;

  camera.left = -halfWidth;
  camera.right = halfWidth;
  camera.top = halfHeight;
  camera.bottom = -halfHeight;
  camera.updateProjectionMatrix();
}

// ============================================================================
// Lighting
// ============================================================================

/**
 * Creates and positions the main directional light.
 * Position is calculated from spherical coordinates (azimuth, elevation).
 *
 * @param azimuth - Azimuth angle in degrees (0-360, 0 = front)
 * @param elevation - Elevation angle in degrees (0-90, 0 = horizon)
 * @param intensity - Light intensity (defaults to 1.0)
 * @returns Configured directional light
 */
export function createMainLight(
  azimuth: number,
  elevation: number,
  intensity = MAIN_LIGHT_INTENSITY
): DirectionalLight {
  const light = new DirectionalLight(0xffffff, intensity);

  // Position light using spherical coordinates
  updateLightPosition(light, azimuth, elevation);

  // Configure shadow mapping for higher quality
  light.castShadow = true;
  light.shadow.mapSize.width = 1024;
  light.shadow.mapSize.height = 1024;
  light.shadow.camera.near = 1;
  light.shadow.camera.far = 300;

  // Configure shadow camera frustum to cover the control scene
  const shadowSize = 30;
  light.shadow.camera.left = -shadowSize;
  light.shadow.camera.right = shadowSize;
  light.shadow.camera.top = shadowSize;
  light.shadow.camera.bottom = -shadowSize;

  // Reduce shadow bias to minimize artifacts
  light.shadow.bias = -0.001;

  return light;
}

/**
 * Creates the ambient fill light.
 *
 * @param intensity - Light intensity (0-1)
 * @returns Configured ambient light
 */
export function createAmbientLight(intensity = AMBIENT_LIGHT_INTENSITY): AmbientLight {
  return new AmbientLight(0xffffff, intensity);
}

/**
 * Creates a hemisphere light for better metallic reflections.
 * The gradient between sky and ground colors gives metallic surfaces
 * more variation and a more realistic appearance.
 *
 * @param intensity - Light intensity (0-1)
 * @returns Configured hemisphere light
 */
export function createHemisphereLight(
  intensity = HEMISPHERE_LIGHT_INTENSITY
): HemisphereLight {
  // Sky color (warm white from above) and ground color (cool blue from below)
  const skyColor = 0xffffff;
  const groundColor = 0x444466;
  return new HemisphereLight(skyColor, groundColor, intensity);
}

/**
 * Updates light position from spherical coordinates.
 * Converts spherical (radius, phi, theta) to Cartesian (x, y, z).
 *
 * Coordinate system:
 * - Azimuth (theta): 0 = front (+Z), 90 = right (+X), 180 = back (-Z), 270 = left (-X)
 * - Elevation (phi): 0 = horizon, 90 = directly above (zenith)
 *
 * @param light - Light to update
 * @param azimuth - Azimuth angle in degrees (0-360)
 * @param elevation - Elevation angle in degrees (0-90)
 */
export function updateLightPosition(
  light: DirectionalLight,
  azimuth: number,
  elevation: number
): void {
  // Convert degrees to radians
  const azimuthRad = (azimuth * Math.PI) / 180;
  // Phi in Three.js Spherical is angle from Y-axis (zenith), so we convert from elevation
  const phiRad = ((90 - elevation) * Math.PI) / 180;

  // Create spherical coordinates and convert to Cartesian
  const spherical = new Spherical(LIGHT_DISTANCE, phiRad, azimuthRad);
  const position = new Vector3().setFromSpherical(spherical);

  light.position.copy(position);
  light.target.position.set(0, 0, 0);
}

/**
 * Updates lighting based on a lighting configuration.
 *
 * @param light - The directional light to update
 * @param config - Lighting configuration
 */
export function applyLightingConfig(light: DirectionalLight, config: LightingConfig): void {
  updateLightPosition(light, config.azimuth, config.elevation);
  // AO strength is typically handled by post-processing or ambient occlusion maps
  // For now, we can adjust ambient light intensity based on AO strength
}

// ============================================================================
// Scene Setup
// ============================================================================

/**
 * Complete scene setup configuration.
 */
export interface SceneSetup {
  scene: Scene;
  camera: OrthographicCamera;
  mainLight: DirectionalLight;
  ambientLight: AmbientLight;
  hemisphereLight: HemisphereLight;
}

/**
 * Creates a complete scene setup with camera and lights.
 *
 * @param width - Viewport width in pixels
 * @param height - Viewport height in pixels
 * @param frustumSize - Size of the view frustum
 * @param view - Initial camera view
 * @param lighting - Initial lighting configuration
 * @returns Complete scene setup
 */
export function createSceneSetup(
  width: number,
  height: number,
  frustumSize = 100,
  view: CameraView = 'top',
  lighting?: LightingConfig
): SceneSetup {
  const scene = createScene();
  const camera = createCamera(width, height, frustumSize, view);

  const defaultLighting = lighting ?? {
    azimuth: 315,
    elevation: 45,
    aoStrength: 50,
  };

  const mainLight = createMainLight(defaultLighting.azimuth, defaultLighting.elevation);
  const ambientLight = createAmbientLight(0.3);
  const hemisphereLight = createHemisphereLight(0.4);

  scene.add(mainLight);
  scene.add(mainLight.target);
  scene.add(ambientLight);
  scene.add(hemisphereLight);

  return {
    scene,
    camera,
    mainLight,
    ambientLight,
    hemisphereLight,
  };
}

// ============================================================================
// Coordinate Conversion Helpers
// ============================================================================

/**
 * Converts spherical coordinates to Cartesian.
 * Useful for positioning objects or debugging.
 *
 * @param azimuth - Azimuth angle in degrees
 * @param elevation - Elevation angle in degrees
 * @param distance - Distance from origin
 * @returns Cartesian position vector
 */
export function sphericalToCartesian(
  azimuth: number,
  elevation: number,
  distance = LIGHT_DISTANCE
): Vector3 {
  const azimuthRad = (azimuth * Math.PI) / 180;
  const phiRad = ((90 - elevation) * Math.PI) / 180;
  const spherical = new Spherical(distance, phiRad, azimuthRad);
  return new Vector3().setFromSpherical(spherical);
}

/**
 * Converts Cartesian coordinates to spherical angles.
 *
 * @param position - Cartesian position
 * @returns Object with azimuth and elevation in degrees
 */
export function cartesianToSpherical(position: Vector3): { azimuth: number; elevation: number } {
  const spherical = new Spherical().setFromVector3(position);
  const azimuth = (spherical.theta * 180) / Math.PI;
  const elevation = 90 - (spherical.phi * 180) / Math.PI;
  return { azimuth, elevation };
}
