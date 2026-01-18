/**
 * Knob Material Factory
 *
 * Creates Three.js materials for knob layers and indicators.
 * Supports solid, metallic, matte, and brushed metal materials.
 */

import type { Material } from 'three';
import { Color, DoubleSide, MeshBasicMaterial, MeshStandardMaterial } from 'three';
import type { IndicatorMaterial, LayerMaterial } from '../../types/knobDesigner';

// ============================================================================
// Material Cache
// ============================================================================

/**
 * Cache of created materials for efficient reuse.
 * Key is a hash of material parameters.
 */
const materialCache = new Map<string, Material>();

/**
 * Generates a cache key from material properties.
 */
function getMaterialCacheKey(
  material: LayerMaterial | IndicatorMaterial,
  isIndicator: boolean
): string {
  if (isIndicator) {
    const ind = material as IndicatorMaterial;
    return `ind_${ind.color}_${ind.metallic}`;
  }
  const mat = material as LayerMaterial;
  return `layer_${mat.type}_${mat.color}_${mat.shininess}_${mat.reflectivity}_${mat.brushDirection}_${mat.brushIntensity}`;
}

// ============================================================================
// Color Parsing
// ============================================================================

/**
 * Parses a hex color string to Three.js Color and alpha.
 *
 * @param hex - Color in #RRGGBBAA format
 * @returns Object with color and alpha
 */
function parseColor(hex: string): { color: Color; alpha: number } {
  // Remove # if present
  const cleanHex = hex.startsWith('#') ? hex.slice(1) : hex;

  // Extract RGB and alpha
  const r = parseInt(cleanHex.slice(0, 2), 16) / 255;
  const g = parseInt(cleanHex.slice(2, 4), 16) / 255;
  const b = parseInt(cleanHex.slice(4, 6), 16) / 255;
  const a = cleanHex.length >= 8 ? parseInt(cleanHex.slice(6, 8), 16) / 255 : 1;

  return {
    color: new Color(r, g, b),
    alpha: a,
  };
}

// ============================================================================
// Solid Material
// ============================================================================

/**
 * Creates a solid color material without specular highlights.
 * Uses MeshBasicMaterial for flat unlit appearance.
 *
 * @param color - Hex color string (#RRGGBBAA)
 * @returns MeshBasicMaterial configured for solid color
 */
export function createSolidMaterial(color: string): MeshBasicMaterial {
  const { color: threeColor, alpha } = parseColor(color);

  return new MeshBasicMaterial({
    color: threeColor,
    transparent: alpha < 1,
    opacity: alpha,
    side: DoubleSide,
  });
}

// ============================================================================
// Metallic Material
// ============================================================================

/**
 * Creates a metallic material with configurable shininess and reflectivity.
 * Maps user-friendly shininess (0-128) to PBR roughness (1-0).
 *
 * @param color - Hex color string (#RRGGBBAA)
 * @param shininess - Shininess value (0-128)
 * @param reflectivity - Reflectivity percentage (0-100)
 * @returns MeshStandardMaterial configured for metallic appearance
 */
export function createMetallicMaterial(
  color: string,
  shininess: number,
  reflectivity: number
): MeshStandardMaterial {
  const { color: threeColor, alpha } = parseColor(color);

  // Map shininess to roughness (inverse relationship)
  // shininess 0 = roughness 1 (matte)
  // shininess 128 = roughness 0 (mirror-like)
  const roughness = 1 - shininess / 128;

  // Metalness is always 1 for metallic materials
  // Reflectivity affects environment map intensity (not directly used in basic setup)
  const metalness = 1.0;

  return new MeshStandardMaterial({
    color: threeColor,
    metalness,
    roughness,
    transparent: alpha < 1,
    opacity: alpha,
    side: DoubleSide,
    envMapIntensity: reflectivity / 100,
  });
}

// ============================================================================
// Matte Material
// ============================================================================

/**
 * Creates a matte material without specular highlights.
 * Uses MeshStandardMaterial with high roughness.
 *
 * @param color - Hex color string (#RRGGBBAA)
 * @returns MeshStandardMaterial configured for matte appearance
 */
export function createMatteMaterial(color: string): MeshStandardMaterial {
  const { color: threeColor, alpha } = parseColor(color);

  return new MeshStandardMaterial({
    color: threeColor,
    metalness: 0,
    roughness: 1.0,
    transparent: alpha < 1,
    opacity: alpha,
    side: DoubleSide,
  });
}

// ============================================================================
// Brushed Metal Material (Stub for Phase 11)
// ============================================================================

/**
 * Creates a brushed metal material with procedural texture.
 * This is a placeholder that returns a metallic material.
 * Full GLSL shader implementation is in Phase 11.
 *
 * @param color - Base color hex string
 * @param direction - Brush direction ('radial' or 'linear')
 * @param intensity - Brush pattern intensity (0-100)
 * @param shininess - Shininess value (0-128)
 * @param reflectivity - Reflectivity percentage (0-100)
 * @returns MeshStandardMaterial (will be replaced with shader material in Phase 11)
 */
export function createBrushedMetalMaterial(
  color: string,
  direction: 'radial' | 'linear',
  intensity: number,
  shininess: number,
  reflectivity: number
): MeshStandardMaterial {
  // Stub: For now, return a metallic material
  // Phase 11 will implement the custom GLSL shader
  const material = createMetallicMaterial(color, shininess, reflectivity);

  // Store brush parameters for later shader integration
  material.userData = {
    brushDirection: direction,
    brushIntensity: intensity,
  };

  return material;
}

// ============================================================================
// Material Factory
// ============================================================================

/**
 * Creates a material based on type and parameters.
 * Factory function that dispatches to type-specific creators.
 *
 * @param material - Material configuration
 * @returns Three.js Material
 */
export function createMaterial(material: LayerMaterial): Material {
  const cacheKey = getMaterialCacheKey(material, false);

  // Check cache first
  const cached = materialCache.get(cacheKey);
  if (cached) {
    return cached;
  }

  let result: Material;

  switch (material.type) {
    case 'solid':
      result = createSolidMaterial(material.color);
      break;

    case 'metallic':
      result = createMetallicMaterial(material.color, material.shininess, material.reflectivity);
      break;

    case 'matte':
      result = createMatteMaterial(material.color);
      break;

    case 'brushed':
      result = createBrushedMetalMaterial(
        material.color,
        material.brushDirection,
        material.brushIntensity,
        material.shininess,
        material.reflectivity
      );
      break;

    default:
      // Fallback to matte
      result = createMatteMaterial(material.color);
  }

  // Cache the result
  materialCache.set(cacheKey, result);

  return result;
}

// ============================================================================
// Indicator Material
// ============================================================================

/**
 * Creates a material for an indicator.
 * Returns basic or metallic based on the metallic flag.
 *
 * @param material - Indicator material configuration
 * @returns Three.js Material
 */
export function createIndicatorMaterial(material: IndicatorMaterial): Material {
  const cacheKey = getMaterialCacheKey(material, true);

  const cached = materialCache.get(cacheKey);
  if (cached) {
    return cached;
  }

  let result: Material;

  if (material.metallic) {
    result = createMetallicMaterial(material.color, 80, 50);
  } else {
    result = createSolidMaterial(material.color);
  }

  materialCache.set(cacheKey, result);

  return result;
}

// ============================================================================
// Disposal
// ============================================================================

/**
 * Disposes of all cached materials.
 * Should be called when modal closes to free GPU memory.
 */
export function disposeAll(): void {
  for (const material of materialCache.values()) {
    material.dispose();
  }
  materialCache.clear();
}

/**
 * Clears the material cache without disposing.
 * Useful for testing.
 */
export function clearCache(): void {
  materialCache.clear();
}
