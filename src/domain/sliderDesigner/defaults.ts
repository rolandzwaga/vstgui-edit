/**
 * Slider Designer Defaults
 *
 * Factory functions and default values for creating new slider designs.
 * Provides sensible starting values for track, handle, and value fill configurations.
 */

import type {
  LayerMaterial,
  LightingConfig,
  LinearOutputConfig,
} from '../../types/controlDesigner';
import type {
  SliderDesign,
  SliderHandle,
  SliderTrack,
  SliderValueFill,
} from '../../types/controlDesigner/slider';

// ============================================================================
// Default Material Values
// ============================================================================

/**
 * Default track material - dark matte finish.
 */
export const DEFAULT_TRACK_MATERIAL: LayerMaterial = {
  type: 'matte',
  color: '#333333FF',
  shininess: 20,
  reflectivity: 10,
  brushDirection: 'linear',
  brushIntensity: 0,
};

/**
 * Default handle material - metallic silver.
 */
export const DEFAULT_HANDLE_MATERIAL: LayerMaterial = {
  type: 'metallic',
  color: '#C0C0C0FF',
  shininess: 80,
  reflectivity: 60,
  brushDirection: 'linear',
  brushIntensity: 0,
};

// ============================================================================
// Default Component Configurations
// ============================================================================

/**
 * Creates a default track configuration.
 */
export function createDefaultTrack(): SliderTrack {
  return {
    orientation: 'vertical',
    length: 80,
    width: 15,
    depth: 3,
    cornerRadius: 2,
    material: { ...DEFAULT_TRACK_MATERIAL },
  };
}

/**
 * Creates a default handle configuration.
 */
export function createDefaultHandle(): SliderHandle {
  return {
    shape: 'rounded',
    width: 100,
    height: 80,
    gripLines: 3,
    material: { ...DEFAULT_HANDLE_MATERIAL },
  };
}

/**
 * Creates a default value fill configuration.
 */
export function createDefaultValueFill(): SliderValueFill {
  return {
    mode: 'fromStart',
    color: '#00FF80FF',
    glowIntensity: 30,
  };
}

// ============================================================================
// Default Lighting Configuration
// ============================================================================

/**
 * Default lighting configuration for sliders.
 * Front-high lighting works well for linear controls.
 */
export const DEFAULT_SLIDER_LIGHTING: LightingConfig = {
  azimuth: 0,
  elevation: 60,
  aoStrength: 35,
};

// ============================================================================
// Default Output Configuration
// ============================================================================

/**
 * Default output configuration for sliders.
 * Linear controls generate frames based on position percentage.
 */
export const DEFAULT_SLIDER_OUTPUT: LinearOutputConfig = {
  frameCount: 64,
  frameWidth: 40,
  frameHeight: 150,
  layout: 'vertical',
};

// ============================================================================
// Slider Design Factory
// ============================================================================

/**
 * Creates a complete default slider design.
 *
 * @returns A new SliderDesign with all default values
 */
export function createDefaultSliderDesign(): SliderDesign {
  return {
    id: crypto.randomUUID(),
    name: 'New Slider',
    controlType: 'slider',
    cameraView: 'top',
    lighting: { ...DEFAULT_SLIDER_LIGHTING },
    track: createDefaultTrack(),
    handle: createDefaultHandle(),
    valueFill: createDefaultValueFill(),
    output: { ...DEFAULT_SLIDER_OUTPUT },
  };
}

// ============================================================================
// Preset Templates
// ============================================================================

/**
 * Built-in slider preset templates.
 */
export const BUILTIN_SLIDER_PRESETS = [
  {
    name: 'Fader',
    isBuiltIn: true,
    design: {
      ...createDefaultSliderDesign(),
      name: 'Fader',
      track: {
        ...createDefaultTrack(),
        orientation: 'vertical',
        length: 90,
        width: 12,
        depth: 4,
      },
      handle: {
        ...createDefaultHandle(),
        shape: 'faderCap',
        width: 120,
        height: 60,
        gripLines: 5,
      },
      valueFill: {
        mode: 'fromStart',
        color: '#00AAFFFF',
        glowIntensity: 40,
      },
    },
  },
  {
    name: 'Horizontal Slider',
    isBuiltIn: true,
    design: {
      ...createDefaultSliderDesign(),
      name: 'Horizontal Slider',
      track: {
        ...createDefaultTrack(),
        orientation: 'horizontal',
        length: 80,
        width: 10,
        depth: 3,
      },
      handle: {
        ...createDefaultHandle(),
        shape: 'circle',
        width: 100,
        height: 100,
        gripLines: 0,
      },
      output: {
        ...DEFAULT_SLIDER_OUTPUT,
        frameWidth: 150,
        frameHeight: 40,
        layout: 'horizontal',
      },
    },
  },
  {
    name: 'LED Meter',
    isBuiltIn: true,
    design: {
      ...createDefaultSliderDesign(),
      name: 'LED Meter',
      track: {
        ...createDefaultTrack(),
        orientation: 'vertical',
        length: 85,
        width: 8,
        depth: 2,
        material: {
          ...DEFAULT_TRACK_MATERIAL,
          color: '#1A1A1AFF',
        },
      },
      handle: {
        ...createDefaultHandle(),
        shape: 'rectangle',
        width: 100,
        height: 40,
        gripLines: 0,
        material: {
          ...DEFAULT_HANDLE_MATERIAL,
          type: 'solid',
          color: '#00FF00FF',
        },
      },
      valueFill: {
        mode: 'segmented',
        color: '#00FF00FF',
        glowIntensity: 60,
      },
    },
  },
] as const;
