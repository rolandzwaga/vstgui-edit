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
// Brushed Metal Material
// ============================================================================

/**
 * Creates a brushed metal material with procedural texture.
 * Uses onBeforeCompile to inject custom GLSL noise for brush grain effect.
 *
 * @param color - Base color hex string
 * @param direction - Brush direction ('radial' or 'linear')
 * @param intensity - Brush pattern intensity (0-100)
 * @param shininess - Shininess value (0-128)
 * @param reflectivity - Reflectivity percentage (0-100)
 * @returns MeshStandardMaterial with custom shader modifications
 */
export function createBrushedMetalMaterial(
  color: string,
  direction: 'radial' | 'linear',
  intensity: number,
  shininess: number,
  reflectivity: number
): MeshStandardMaterial {
  const { color: threeColor, alpha } = parseColor(color);

  // Map shininess to roughness
  const roughness = 1 - shininess / 128;

  const material = new MeshStandardMaterial({
    color: threeColor,
    metalness: 1.0,
    roughness,
    transparent: alpha < 1,
    opacity: alpha,
    side: DoubleSide,
    envMapIntensity: reflectivity / 100,
  });

  // Store brush parameters for reference
  material.userData = {
    brushDirection: direction,
    brushIntensity: intensity,
    isBrushedMetal: true,
  };

  // Inject custom shader code for brush grain effect
  material.onBeforeCompile = shader => {
    // Add varying for UV coordinates
    shader.vertexShader = shader.vertexShader.replace(
      '#include <common>',
      `
      #include <common>
      varying vec2 vBrushUv;
      `
    );

    shader.vertexShader = shader.vertexShader.replace(
      '#include <uv_vertex>',
      `
      #include <uv_vertex>
      vBrushUv = uv;
      `
    );

    // Add noise function and brush modulation to fragment shader
    shader.fragmentShader = shader.fragmentShader.replace(
      '#include <common>',
      `
      #include <common>
      varying vec2 vBrushUv;

      // Simplex noise permutation
      vec3 permute(vec3 x) {
        return mod(((x * 34.0) + 1.0) * x, 289.0);
      }

      // 2D noise function
      float brushNoise(vec2 v) {
        const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
        vec2 i = floor(v + dot(v, C.yy));
        vec2 x0 = v - i + dot(i, C.xx);
        vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
        vec4 x12 = x0.xyxy + C.xxzz;
        x12.xy -= i1;
        i = mod(i, 289.0);
        vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
        vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);
        m = m * m * m * m;
        vec3 x = 2.0 * fract(p * C.www) - 1.0;
        vec3 h = abs(x) - 0.5;
        vec3 ox = floor(x + 0.5);
        vec3 a0 = x - ox;
        m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
        vec3 g;
        g.x = a0.x * x0.x + h.x * x0.y;
        g.yz = a0.yz * x12.xz + h.yz * x12.yw;
        return 130.0 * dot(m, g);
      }
      `
    );

    // Apply brush pattern to diffuse color
    const brushScale = direction === 'radial' ? 50.0 : 100.0;
    const intensityFactor = intensity * 0.01 * 0.15;

    shader.fragmentShader = shader.fragmentShader.replace(
      '#include <color_fragment>',
      `
      #include <color_fragment>
      // Apply brush grain pattern
      ${
        direction === 'radial'
          ? `
        vec2 centered = vBrushUv - 0.5;
        float angle = atan(centered.y, centered.x);
        float radius = length(centered);
        float grain = brushNoise(vec2(angle * ${brushScale.toFixed(1)}, radius * 2.0));
      `
          : `
        float grain = brushNoise(vBrushUv * ${brushScale.toFixed(1)});
      `
      }
      diffuseColor.rgb *= (1.0 + grain * ${intensityFactor.toFixed(4)});
      `
    );
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
 * Returns metallic or matte (lit) material based on the metallic flag.
 * Non-metallic indicators now use matte material to respond to scene lighting.
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
    // Metallic indicator with high shininess
    result = createMetallicMaterial(material.color, 80, 50);
  } else {
    // Use matte material so indicator responds to scene lighting
    // This gives the indicator proper shading and makes it look 3D
    result = createMatteMaterial(material.color);
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
