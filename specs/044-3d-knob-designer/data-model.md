# Data Model: 3D Knob Designer

**Feature**: 044-3d-knob-designer
**Date**: 2026-01-18

## Overview

This document defines the TypeScript interfaces for the 3D Knob Designer feature, including the knob design configuration, layer system, materials, presets, and store state.

---

## Core Entities

### KnobDesign

Complete knob configuration serving as the working state within the modal and the structure saved as presets.

```typescript
/**
 * Complete knob design configuration.
 * Represents the full state of a knob being designed.
 */
interface KnobDesign {
  /** Unique identifier for this design instance */
  id: string;

  /** Display name (used when saving as preset) */
  name: string;

  /** Concentric layers (1-3, bottom to top) */
  layers: KnobLayer[];

  /** Optional indicator configuration */
  indicator: KnobIndicator | null;

  /** Light source configuration */
  lighting: LightingConfig;

  /** Filmstrip output configuration */
  output: OutputConfig;
}
```

### KnobLayer

A single concentric layer with geometry and material properties.

```typescript
/**
 * A single concentric layer of the knob.
 * Layers stack from bottom (index 0) to top.
 */
interface KnobLayer {
  /** Unique identifier */
  id: string;

  /** Display name for UI */
  name: string;

  /** Layer geometry configuration */
  geometry: LayerGeometry;

  /** Layer material configuration */
  material: LayerMaterial;
}

/**
 * Geometry configuration for a knob layer.
 */
interface LayerGeometry {
  /** Diameter as percentage of knob size (10-100) */
  diameter: number;

  /** Height as percentage of total knob height (10-100) */
  height: number;

  /** Bevel radius in pixels (0-20) */
  bevelRadius: number;

  /** Skirt style for the layer edge */
  skirtStyle: SkirtStyle;
}

/**
 * Skirt style options for layer edges.
 */
type SkirtStyle = 'cylindrical' | 'tapered' | 'angled';

/**
 * Material configuration for a knob layer.
 */
interface LayerMaterial {
  /** Material type */
  type: MaterialType;

  /** Base color in hex format (e.g., '#FF5500FF') */
  color: string;

  /** Shininess for metallic materials (0-128) */
  shininess: number;

  /** Reflectivity percentage for metallic materials (0-100) */
  reflectivity: number;

  /** Brush direction for brushed metal */
  brushDirection: BrushDirection;

  /** Brush pattern intensity (0-100) */
  brushIntensity: number;
}

/**
 * Available material types.
 */
type MaterialType = 'solid' | 'metallic' | 'matte' | 'brushed';

/**
 * Brush direction options for brushed metal.
 */
type BrushDirection = 'radial' | 'linear';
```

### KnobIndicator

Optional dial marker configuration.

```typescript
/**
 * Indicator (dial marker) configuration.
 */
interface KnobIndicator {
  /** Whether indicator is enabled */
  enabled: boolean;

  /** Indicator shape type */
  type: IndicatorType;

  /** Indicator material/appearance */
  material: IndicatorMaterial;

  /** Size parameters based on type */
  size: IndicatorSize;

  /** Radial position from center (percentage, 10-90) */
  radialPosition: number;
}

/**
 * Indicator shape types.
 */
type IndicatorType = 'dot' | 'line' | 'notch' | 'groove';

/**
 * Indicator material configuration.
 */
interface IndicatorMaterial {
  /** Indicator color in hex format */
  color: string;

  /** Whether indicator is metallic */
  metallic: boolean;
}

/**
 * Indicator size parameters.
 * Only relevant fields apply based on type.
 */
interface IndicatorSize {
  /** Radius for dot type (pixels) */
  radius: number;

  /** Length for line type (pixels) */
  length: number;

  /** Width for line type (pixels) */
  width: number;

  /** Depth for notch/groove types (pixels) */
  depth: number;
}
```

### LightingConfig

Light source configuration.

```typescript
/**
 * Light source configuration.
 */
interface LightingConfig {
  /** Azimuth angle in degrees (0-360, 0 = front) */
  azimuth: number;

  /** Elevation angle in degrees (0-90, 0 = horizon, 90 = directly above) */
  elevation: number;

  /** Ambient occlusion strength (0-100) */
  aoStrength: number;
}
```

### OutputConfig

Filmstrip generation settings.

```typescript
/**
 * Filmstrip output configuration.
 */
interface OutputConfig {
  /** Number of frames in the filmstrip (8-256) */
  frameCount: number;

  /** Frame width in pixels (16-512) */
  frameWidth: number;

  /** Frame height in pixels (16-512) */
  frameHeight: number;

  /** Rotation sweep angle in degrees (default 270) */
  sweepAngle: number;

  /** Start angle in degrees (default 225, 7 o'clock position) */
  startAngle: number;

  /** End angle in degrees (default 315, 5 o'clock position) */
  endAngle: number;
}
```

---

## Preset Entity

```typescript
/**
 * A saved knob design preset stored in IndexedDB.
 */
interface KnobPreset {
  /** Unique identifier (UUID) */
  id: string;

  /** User-provided display name (unique) */
  name: string;

  /** Whether this is a built-in template (cannot be deleted) */
  isBuiltIn: boolean;

  /** ISO 8601 creation timestamp */
  createdAt: string;

  /** ISO 8601 last update timestamp */
  updatedAt: string;

  /** Complete knob design configuration */
  design: KnobDesign;
}
```

---

## Store State

### KnobDesignerStore

Modal-scoped store state.

```typescript
/**
 * Knob Designer modal store state.
 */
interface KnobDesignerStoreState {
  /** Whether the modal is currently open */
  isOpen: boolean;

  /** Current working design */
  design: KnobDesign;

  /** Target bitmap name (from BitmapItem context) */
  targetBitmapName: string | null;

  /** Target project ID */
  targetProjectId: string | null;

  /** Current preset selection (null = custom/modified) */
  selectedPresetId: string | null;

  /** Whether design has been modified from preset */
  isModified: boolean;

  /** Generation progress (null = not generating) */
  generationProgress: GenerationProgress | null;

  /** Error message for display */
  errorMessage: string | null;

  /** Undo/redo state (managed by modal history) */
  canUndo: boolean;
  canRedo: boolean;
}

/**
 * Filmstrip generation progress state.
 */
interface GenerationProgress {
  /** Current generation stage */
  stage: GenerationStage;

  /** Current frame being rendered (0-based) */
  currentFrame: number;

  /** Total frames to render */
  totalFrames: number;

  /** Progress percentage (0-100) */
  percent: number;
}

/**
 * Generation stages.
 */
type GenerationStage = 'preparing' | 'rendering' | 'compositing' | 'complete';
```

---

## Default Values

### Default Design

```typescript
const DEFAULT_KNOB_DESIGN: KnobDesign = {
  id: '', // Generated at runtime
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
      depth: 2,
    },
    radialPosition: 75,
  },
  lighting: {
    azimuth: 315, // Top-left
    elevation: 45, // 45 degrees from horizon
    aoStrength: 50,
  },
  output: {
    frameCount: 64,
    frameWidth: 100,
    frameHeight: 100,
    sweepAngle: 270,
    startAngle: 225,
    endAngle: 315,
  },
};
```

### Built-In Presets

```typescript
const BUILTIN_PRESETS: Omit<KnobPreset, 'id' | 'createdAt' | 'updatedAt'>[] = [
  {
    name: 'Classic',
    isBuiltIn: true,
    design: {
      /* Classic silver knob with line indicator */
    },
  },
  {
    name: 'Modern Flat',
    isBuiltIn: true,
    design: {
      /* Matte dark knob with minimal indicator */
    },
  },
  {
    name: 'Vintage Amp',
    isBuiltIn: true,
    design: {
      /* Cream/brown knob with notch indicator */
    },
  },
  {
    name: 'Tech/Industrial',
    isBuiltIn: true,
    design: {
      /* Brushed aluminum with groove indicator */
    },
  },
  {
    name: 'Minimalist',
    isBuiltIn: true,
    design: {
      /* Simple white knob with dot indicator */
    },
  },
];
```

---

## Validation Constraints

### Layer Constraints
- Minimum layers: 1
- Maximum layers: 3
- Diameter: 10-100 (percentage)
- Height: 10-100 (percentage)
- Bevel radius: 0-20 (pixels)

### Material Constraints
- Shininess: 0-128
- Reflectivity: 0-100 (percentage)
- Brush intensity: 0-100 (percentage)
- Color: Valid hex with alpha (#RRGGBBAA)

### Indicator Constraints
- Radial position: 10-90 (percentage from center)
- Radius (dot): 1-20 (pixels)
- Length (line): 5-50 (pixels)
- Width (line): 1-10 (pixels)
- Depth (notch/groove): 1-10 (pixels)

### Lighting Constraints
- Azimuth: 0-360 (degrees)
- Elevation: 0-90 (degrees)
- AO strength: 0-100 (percentage)

### Output Constraints
- Frame count: 8-256
- Frame width/height: 16-512 (pixels)
- Sweep angle: 90-360 (degrees)
- Start/end angles: 0-360 (degrees)

### Preset Constraints
- Maximum custom presets: 100
- Name length: 1-50 characters
- Name characters: Alphanumeric, spaces, hyphens, underscores

---

## Entity Relationships

```
KnobDesign
├── layers: KnobLayer[] (1-3)
│   ├── geometry: LayerGeometry
│   └── material: LayerMaterial
├── indicator: KnobIndicator | null
│   ├── material: IndicatorMaterial
│   └── size: IndicatorSize
├── lighting: LightingConfig
└── output: OutputConfig

KnobPreset
└── design: KnobDesign

KnobDesignerStoreState
├── design: KnobDesign
└── generationProgress: GenerationProgress | null
```

---

## IndexedDB Schema

### Store: presets

```typescript
// Object store configuration
{
  keyPath: 'id',
  indexes: [
    { name: 'name', keyPath: 'name', unique: true },
    { name: 'isBuiltIn', keyPath: 'isBuiltIn', unique: false },
  ]
}
```

### Record Structure

```typescript
interface PresetRecord {
  id: string;              // Primary key (UUID)
  name: string;            // Indexed (unique)
  isBuiltIn: boolean;      // Indexed
  createdAt: string;       // ISO 8601
  updatedAt: string;       // ISO 8601
  design: string;          // JSON-serialized KnobDesign
}
```

---

## Type File Location

All types should be defined in:
- `src/types/knobDesigner.ts` - All type definitions
- `src/domain/knobDesigner/defaults.ts` - Default values and built-in presets
- `src/domain/knobDesigner/validation.ts` - Validation functions and constraints
