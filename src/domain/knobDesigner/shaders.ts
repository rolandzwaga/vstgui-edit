/**
 * Knob Designer GLSL Shaders
 *
 * Custom shaders for brushed metal material effect.
 * Uses procedural noise to simulate brushed grain patterns.
 */

// ============================================================================
// GLSL Noise Functions
// ============================================================================

/**
 * Simplex 2D noise GLSL function.
 * Returns a pseudo-random value based on 2D coordinates.
 */
export const NOISE_2D_GLSL = `
  // Permutation polynomial: (34x^2 + x) mod 289
  vec3 permute(vec3 x) {
    return mod(((x * 34.0) + 1.0) * x, 289.0);
  }

  // Simplex 2D noise
  float noise2D(vec2 v) {
    const vec4 C = vec4(
      0.211324865405187,  // (3.0 - sqrt(3.0)) / 6.0
      0.366025403784439,  // 0.5 * (sqrt(3.0) - 1.0)
      -0.577350269189626, // -1.0 + 2.0 * C.x
      0.024390243902439   // 1.0 / 41.0
    );

    // First corner
    vec2 i = floor(v + dot(v, C.yy));
    vec2 x0 = v - i + dot(i, C.xx);

    // Other corners
    vec2 i1;
    i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;

    // Permutations
    i = mod(i, 289.0);
    vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));

    vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);
    m = m * m;
    m = m * m;

    // Gradients
    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;

    m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);

    // Compute final noise value
    vec3 g;
    g.x = a0.x * x0.x + h.x * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
  }
`;

// ============================================================================
// Brush Pattern Functions
// ============================================================================

/**
 * GLSL function for radial brush pattern.
 * Creates concentric circular grain pattern.
 */
export const RADIAL_BRUSH_GLSL = `
  float radialBrush(vec2 uv, float intensity) {
    // Convert UV to polar coordinates
    vec2 centered = uv - 0.5;
    float angle = atan(centered.y, centered.x);
    float radius = length(centered);

    // Create noise along angular direction
    float scale = 50.0;
    float noise = noise2D(vec2(angle * scale, radius * 2.0));

    // Apply intensity
    return noise * intensity * 0.01;
  }
`;

/**
 * GLSL function for linear brush pattern.
 * Creates parallel grain pattern at a specified angle.
 */
export const LINEAR_BRUSH_GLSL = `
  float linearBrush(vec2 uv, float intensity, float angle) {
    // Rotate UV coordinates
    float c = cos(angle);
    float s = sin(angle);
    vec2 rotated = vec2(
      uv.x * c - uv.y * s,
      uv.x * s + uv.y * c
    );

    // Create noise along rotated direction
    float scale = 100.0;
    float noise = noise2D(vec2(rotated.x * scale, rotated.y * 2.0));

    // Apply intensity
    return noise * intensity * 0.01;
  }
`;

// ============================================================================
// Vertex Shader
// ============================================================================

/**
 * Vertex shader for brushed metal material.
 * Passes UV coordinates and normals to fragment shader.
 */
export const BRUSHED_METAL_VERTEX_SHADER = `
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vViewPosition;

  void main() {
    vUv = uv;
    vNormal = normalize(normalMatrix * normal);
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    vViewPosition = -mvPosition.xyz;
    gl_Position = projectionMatrix * mvPosition;
  }
`;

// ============================================================================
// Fragment Shader
// ============================================================================

/**
 * Fragment shader for brushed metal material.
 * Applies brush noise to base color for grain effect.
 */
export const BRUSHED_METAL_FRAGMENT_SHADER = `
  uniform vec3 baseColor;
  uniform float metalness;
  uniform float roughness;
  uniform float brushIntensity;
  uniform int brushDirection; // 0 = radial, 1 = linear
  uniform float brushAngle;

  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vViewPosition;

  ${NOISE_2D_GLSL}
  ${RADIAL_BRUSH_GLSL}
  ${LINEAR_BRUSH_GLSL}

  void main() {
    // Calculate brush pattern
    float brush = 0.0;
    if (brushDirection == 0) {
      brush = radialBrush(vUv, brushIntensity);
    } else {
      brush = linearBrush(vUv, brushIntensity, brushAngle);
    }

    // Apply brush to color (slight variation)
    vec3 color = baseColor * (1.0 + brush * 0.5);

    // Simple lighting (will be replaced by Three.js lighting)
    vec3 normal = normalize(vNormal);
    vec3 viewDir = normalize(vViewPosition);

    // Fresnel-like reflection boost at grazing angles
    float fresnel = pow(1.0 - abs(dot(normal, viewDir)), 2.0);
    color += vec3(fresnel * metalness * 0.2);

    // Clamp final color
    color = clamp(color, 0.0, 1.0);

    gl_FragColor = vec4(color, 1.0);
  }
`;

// ============================================================================
// Shader Chunk Injection
// ============================================================================

/**
 * Returns the GLSL code to inject into MeshStandardMaterial.onBeforeCompile
 * for brushed metal effect.
 *
 * @param direction - Brush direction ('radial' or 'linear')
 * @param intensity - Brush intensity (0-100)
 * @returns Object with vertex and fragment shader modifications
 */
export function getBrushedMetalShaderChunks(
  direction: 'radial' | 'linear',
  intensity: number
): { vertexShader: string; fragmentShader: string } {
  const _brushDirectionValue = direction === 'radial' ? 0 : 1;

  return {
    vertexShader: `
      varying vec2 vBrushUv;
    `,
    fragmentShader: `
      ${NOISE_2D_GLSL}
      ${direction === 'radial' ? RADIAL_BRUSH_GLSL : LINEAR_BRUSH_GLSL}

      float getBrushNoise(vec2 uv) {
        ${
          direction === 'radial'
            ? `return radialBrush(uv, ${intensity.toFixed(1)});`
            : `return linearBrush(uv, ${intensity.toFixed(1)}, 0.0);`
        }
      }
    `,
  };
}

/**
 * Validates that shader code compiles correctly.
 * This is a stub that always returns true - actual validation
 * requires a WebGL context.
 *
 * @param shaderCode - GLSL shader code
 * @returns True if shader compiles successfully
 */
export function validateShaderCode(shaderCode: string): boolean {
  // Basic syntax validation - check for required keywords
  const hasMain = shaderCode.includes('void main()');
  const hasGlPosition = shaderCode.includes('gl_Position') || shaderCode.includes('gl_FragColor');

  return hasMain || hasGlPosition || shaderCode.includes('float ');
}
