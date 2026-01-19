/**
 * Knob Designer Defaults
 *
 * Default values and built-in preset definitions for the 3D Knob Designer.
 */

import type { KnobDesign, KnobPreset } from '../../types/knobDesigner';

// ============================================================================
// Default Knob Design
// ============================================================================

/**
 * Default knob design used when opening the modal.
 */
export const DEFAULT_KNOB_DESIGN: KnobDesign = {
  id: '',
  name: 'New Knob',
  layers: [
    {
      id: 'layer-1',
      name: 'Cap',
      geometry: {
        diameter: 100,
        height: 100,
        bevelRadius: 4,
        skirtStyle: 'cylindrical',
      },
      material: {
        type: 'metallic',
        color: '#888888FF',
        shininess: 80,
        reflectivity: 50,
        brushDirection: 'radial',
        brushIntensity: 0,
      },
    },
  ],
  indicator: {
    enabled: true,
    type: 'line',
    material: {
      color: '#FFFFFFFF',
      metallic: false,
    },
    size: {
      radius: 3,
      length: 15,
      width: 2,
      height: 2,
      depth: 2,
    },
    radialPosition: 75,
  },
  lighting: {
    azimuth: 315,
    elevation: 45,
    aoStrength: 50,
  },
  output: {
    frameCount: 64,
    frameWidth: 100,
    frameHeight: 100,
    sweepAngle: 270,
    startAngle: 225,
    endAngle: 315,
    layout: 'vertical',
    rotationOffset: 0,
  },
  cameraView: 'top',
};

// ============================================================================
// Built-in Preset Definitions
// ============================================================================

/**
 * Classic - Silver metallic with line indicator.
 * Traditional professional audio knob style.
 */
const CLASSIC_PRESET: Omit<KnobPreset, 'id' | 'createdAt' | 'updatedAt'> = {
  name: 'Classic',
  controlType: 'knob',
  isBuiltIn: true,
  design: {
    id: '',
    name: 'Classic',
    layers: [
      {
        id: 'layer-1',
        name: 'Cap',
        geometry: {
          diameter: 100,
          height: 100,
          bevelRadius: 6,
          skirtStyle: 'cylindrical',
        },
        material: {
          type: 'metallic',
          color: '#C0C0C0FF',
          shininess: 100,
          reflectivity: 60,
          brushDirection: 'radial',
          brushIntensity: 0,
        },
      },
    ],
    indicator: {
      enabled: true,
      type: 'line',
      material: {
        color: '#FFFFFFFF',
        metallic: false,
      },
      size: {
        radius: 3,
        length: 18,
        width: 3,
        height: 2,
        depth: 2,
      },
      radialPosition: 70,
    },
    lighting: {
      azimuth: 315,
      elevation: 45,
      aoStrength: 50,
    },
    output: {
      frameCount: 64,
      frameWidth: 100,
      frameHeight: 100,
      sweepAngle: 270,
      startAngle: 225,
      endAngle: 315,
      layout: 'vertical',
      rotationOffset: 0,
    },
    cameraView: 'top',
  },
};

/**
 * Modern Flat - Matte dark with minimal indicator.
 * Contemporary flat design aesthetic.
 */
const MODERN_FLAT_PRESET: Omit<KnobPreset, 'id' | 'createdAt' | 'updatedAt'> = {
  name: 'Modern Flat',
  controlType: 'knob',
  isBuiltIn: true,
  design: {
    id: '',
    name: 'Modern Flat',
    layers: [
      {
        id: 'layer-1',
        name: 'Body',
        geometry: {
          diameter: 100,
          height: 100,
          bevelRadius: 2,
          skirtStyle: 'cylindrical',
        },
        material: {
          type: 'matte',
          color: '#2A2A2AFF',
          shininess: 0,
          reflectivity: 0,
          brushDirection: 'radial',
          brushIntensity: 0,
        },
      },
    ],
    indicator: {
      enabled: true,
      type: 'dot',
      material: {
        color: '#00AAFFFF',
        metallic: false,
      },
      size: {
        radius: 4,
        length: 15,
        width: 2,
        height: 2,
        depth: 2,
      },
      radialPosition: 65,
    },
    lighting: {
      azimuth: 315,
      elevation: 60,
      aoStrength: 30,
    },
    output: {
      frameCount: 64,
      frameWidth: 100,
      frameHeight: 100,
      sweepAngle: 270,
      startAngle: 225,
      endAngle: 315,
      layout: 'vertical',
      rotationOffset: 0,
    },
    cameraView: 'top',
  },
};

/**
 * Vintage Amp - Cream/brown with notch indicator.
 * Retro guitar amplifier knob style.
 */
const VINTAGE_AMP_PRESET: Omit<KnobPreset, 'id' | 'createdAt' | 'updatedAt'> = {
  name: 'Vintage Amp',
  controlType: 'knob',
  isBuiltIn: true,
  design: {
    id: '',
    name: 'Vintage Amp',
    layers: [
      {
        id: 'layer-1',
        name: 'Skirt',
        geometry: {
          diameter: 100,
          height: 40,
          bevelRadius: 3,
          skirtStyle: 'tapered',
        },
        material: {
          type: 'solid',
          color: '#4A3520FF',
          shininess: 20,
          reflectivity: 10,
          brushDirection: 'radial',
          brushIntensity: 0,
        },
      },
      {
        id: 'layer-2',
        name: 'Cap',
        geometry: {
          diameter: 70,
          height: 60,
          bevelRadius: 8,
          skirtStyle: 'cylindrical',
        },
        material: {
          type: 'solid',
          color: '#F5DEB3FF',
          shininess: 40,
          reflectivity: 20,
          brushDirection: 'radial',
          brushIntensity: 0,
        },
      },
    ],
    indicator: {
      enabled: true,
      type: 'notch',
      material: {
        color: '#1A1A1AFF',
        metallic: false,
      },
      size: {
        radius: 3,
        length: 15,
        width: 4,
        height: 2,
        depth: 3,
      },
      radialPosition: 80,
    },
    lighting: {
      azimuth: 300,
      elevation: 50,
      aoStrength: 60,
    },
    output: {
      frameCount: 64,
      frameWidth: 100,
      frameHeight: 100,
      sweepAngle: 270,
      startAngle: 225,
      endAngle: 315,
      layout: 'vertical',
      rotationOffset: 0,
    },
    cameraView: 'top',
  },
};

/**
 * Tech/Industrial - Brushed aluminum with groove indicator.
 * Modern professional audio equipment style.
 */
const TECH_INDUSTRIAL_PRESET: Omit<KnobPreset, 'id' | 'createdAt' | 'updatedAt'> = {
  name: 'Tech/Industrial',
  controlType: 'knob',
  isBuiltIn: true,
  design: {
    id: '',
    name: 'Tech/Industrial',
    layers: [
      {
        id: 'layer-1',
        name: 'Base',
        geometry: {
          diameter: 100,
          height: 30,
          bevelRadius: 1,
          skirtStyle: 'angled',
        },
        material: {
          type: 'metallic',
          color: '#3A3A3AFF',
          shininess: 60,
          reflectivity: 40,
          brushDirection: 'radial',
          brushIntensity: 0,
        },
      },
      {
        id: 'layer-2',
        name: 'Cap',
        geometry: {
          diameter: 85,
          height: 70,
          bevelRadius: 3,
          skirtStyle: 'cylindrical',
        },
        material: {
          type: 'brushed',
          color: '#A8A8A8FF',
          shininess: 90,
          reflectivity: 70,
          brushDirection: 'radial',
          brushIntensity: 50,
        },
      },
    ],
    indicator: {
      enabled: true,
      type: 'groove',
      material: {
        color: '#1A1A1AFF',
        metallic: false,
      },
      size: {
        radius: 3,
        length: 15,
        width: 2,
        height: 2,
        depth: 2,
      },
      radialPosition: 75,
    },
    lighting: {
      azimuth: 315,
      elevation: 40,
      aoStrength: 45,
    },
    output: {
      frameCount: 64,
      frameWidth: 100,
      frameHeight: 100,
      sweepAngle: 270,
      startAngle: 225,
      endAngle: 315,
      layout: 'vertical',
      rotationOffset: 0,
    },
    cameraView: 'top',
  },
};

/**
 * Minimalist - Simple white knob with dot indicator.
 * Clean, modern minimal design.
 */
const MINIMALIST_PRESET: Omit<KnobPreset, 'id' | 'createdAt' | 'updatedAt'> = {
  name: 'Minimalist',
  controlType: 'knob',
  isBuiltIn: true,
  design: {
    id: '',
    name: 'Minimalist',
    layers: [
      {
        id: 'layer-1',
        name: 'Body',
        geometry: {
          diameter: 100,
          height: 100,
          bevelRadius: 10,
          skirtStyle: 'cylindrical',
        },
        material: {
          type: 'solid',
          color: '#F0F0F0FF',
          shininess: 10,
          reflectivity: 5,
          brushDirection: 'radial',
          brushIntensity: 0,
        },
      },
    ],
    indicator: {
      enabled: true,
      type: 'dot',
      material: {
        color: '#2A2A2AFF',
        metallic: false,
      },
      size: {
        radius: 5,
        length: 15,
        width: 2,
        height: 2,
        depth: 2,
      },
      radialPosition: 60,
    },
    lighting: {
      azimuth: 315,
      elevation: 55,
      aoStrength: 35,
    },
    output: {
      frameCount: 64,
      frameWidth: 100,
      frameHeight: 100,
      sweepAngle: 270,
      startAngle: 225,
      endAngle: 315,
      layout: 'vertical',
      rotationOffset: 0,
    },
    cameraView: 'top',
  },
};

// ============================================================================
// Exported Built-in Presets Array
// ============================================================================

/**
 * Array of built-in preset templates.
 * These are seeded into IndexedDB on first use.
 */
export const BUILTIN_PRESETS: Omit<KnobPreset, 'id' | 'createdAt' | 'updatedAt'>[] = [
  CLASSIC_PRESET,
  MODERN_FLAT_PRESET,
  VINTAGE_AMP_PRESET,
  TECH_INDUSTRIAL_PRESET,
  MINIMALIST_PRESET,
];

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Creates a deep copy of the default knob design with a new ID.
 *
 * @returns A new copy of the default design
 */
export function createDefaultDesign(): KnobDesign {
  const id = crypto.randomUUID();
  return {
    ...DEFAULT_KNOB_DESIGN,
    id,
    layers: DEFAULT_KNOB_DESIGN.layers.map(layer => ({
      ...layer,
      id: `layer-${crypto.randomUUID().slice(0, 8)}`,
      geometry: { ...layer.geometry },
      material: { ...layer.material },
    })),
    indicator: DEFAULT_KNOB_DESIGN.indicator
      ? {
          ...DEFAULT_KNOB_DESIGN.indicator,
          material: { ...DEFAULT_KNOB_DESIGN.indicator.material },
          size: { ...DEFAULT_KNOB_DESIGN.indicator.size },
        }
      : null,
    lighting: { ...DEFAULT_KNOB_DESIGN.lighting },
    output: { ...DEFAULT_KNOB_DESIGN.output },
    cameraView: DEFAULT_KNOB_DESIGN.cameraView,
  };
}

/**
 * Creates a deep copy of a knob design.
 *
 * @param design - Design to copy
 * @param newId - Optional new ID (generates if not provided)
 * @returns Deep copy of the design
 */
export function copyDesign(design: KnobDesign, newId?: string): KnobDesign {
  const id = newId ?? crypto.randomUUID();
  return {
    ...design,
    id,
    layers: design.layers.map(layer => ({
      ...layer,
      geometry: { ...layer.geometry },
      material: { ...layer.material },
    })),
    indicator: design.indicator
      ? {
          ...design.indicator,
          material: { ...design.indicator.material },
          size: { ...design.indicator.size },
        }
      : null,
    lighting: { ...design.lighting },
    output: {
      ...design.output,
      layout: design.output.layout ?? 'vertical',
      rotationOffset: design.output.rotationOffset ?? 0,
    },
    cameraView: design.cameraView ?? 'top',
  };
}
