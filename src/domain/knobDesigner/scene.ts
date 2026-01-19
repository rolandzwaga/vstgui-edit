/**
 * Three.js Scene Setup
 *
 * Utilities for creating and configuring the Three.js scene,
 * camera, and lighting for knob rendering.
 */

import {
  AmbientLight,
  DirectionalLight,
  OrthographicCamera,
  Scene,
  Spherical,
  Vector3,
} from 'three';
import type { CameraView } from '../../types/knobDesigner';

// ============================================================================
// Constants
// ============================================================================

/** Default background color (transparent) */
const _TRANSPARENT_BACKGROUND = 0x000000;

/** Default light intensity */
const MAIN_LIGHT_INTENSITY = 1.0;
const AMBIENT_LIGHT_INTENSITY = 0.3;

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
 * Creates an orthographic camera for knob rendering.
 * Orthographic camera ensures consistent knob size regardless of distance.
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
  frustumSize: number = 100,
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
    // Top view: camera above looking down at the knob
    camera.position.set(0, 100, 0);
    camera.up.set(0, 0, 1); // Positive Z-axis points "up" in screen space
    camera.lookAt(0, 0, 0);
  } else {
    // Side view: camera in front looking at the knob from the side
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
  frustumSize: number = 100
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
  intensity: number = MAIN_LIGHT_INTENSITY
): DirectionalLight {
  const light = new DirectionalLight(0xffffff, intensity);

  // Position light using spherical coordinates
  updateLightPosition(light, azimuth, elevation);

  // Configure shadow mapping for higher quality
  light.castShadow = true;
  light.shadow.mapSize.width = 512;
  light.shadow.mapSize.height = 512;
  light.shadow.camera.near = 0.5;
  light.shadow.camera.far = 500;

  return light;
}

/**
 * Creates the ambient fill light.
 *
 * @param intensity - Light intensity (0-1)
 * @returns Configured ambient light
 */
export function createAmbientLight(intensity: number = AMBIENT_LIGHT_INTENSITY): AmbientLight {
  return new AmbientLight(0xffffff, intensity);
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
  distance: number = LIGHT_DISTANCE
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
