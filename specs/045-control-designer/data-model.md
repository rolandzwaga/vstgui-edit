# Data Model: Control Designer

**Feature**: 001-control-designer
**Date**: 2026-01-19
**Location**: `src/types/controlDesigner/`

## Overview

The Control Designer data model uses TypeScript discriminated unions to support multiple control types while maintaining type safety. All control types share a common base interface for shared functionality (lighting, output, presets) while defining type-specific interfaces for their geometry configurations.

---

## Type Hierarchy

```
BaseControlDesign (interface)
├── KnobDesign (extends BaseControlDesign)
│   ├── layers: KnobLayer[]
│   ├── indicator: KnobIndicator | null
│   └── output: RotationalOutputConfig
│
└── SliderDesign (extends BaseControlDesign)
    ├── track: SliderTrack
    ├── handle: SliderHandle
    ├── valueFill: SliderValueFill
    └── output: LinearOutputConfig
```

---

## Core Types (base.ts)

### Control Type Identifiers

```typescript
/**
 * Unique identifiers for control types.
 * Used as discriminator in unions and registry keys.
 */
export type ControlTypeId = 'knob' | 'slider';

/**
 * Control categories determine frame generation logic.
 * - rotational: Uses angle-based frames (knobs)
 * - linear: Uses position-based frames (sliders, faders)
 * - binary: Two-state controls (switches, on/off)
 * - multiState: N discrete states (multi-position switches)
 * - grid2D: X/Y position based (XY pads)
 */
export type ControlCategory = 'rotational' | 'linear' | 'binary' | 'multiState' | 'grid2D';
```

### Camera and View

```typescript
/**
 * Camera view angle for 3D preview.
 */
export type CameraView = 'top' | 'side';

/**
 * Filmstrip layout options.
 */
export type FilmstripLayout = 'vertical' | 'horizontal' | 'grid';
```

### Lighting Configuration

```typescript
/**
 * Lighting configuration shared by all control types.
 * Defines main directional light position using spherical coordinates.
 */
export interface LightingConfig {
  /**
   * Azimuth angle in degrees (0-360).
   * 0 = front, 90 = right, 180 = back, 270 = left.
   */
  azimuth: number;

  /**
   * Elevation angle in degrees (0-90).
   * 0 = horizon, 90 = directly above.
   */
  elevation: number;

  /**
   * Ambient occlusion strength (0-100).
   * Higher values create stronger shadows in crevices.
   */
  aoStrength: number;
}
```

### Output Configurations

```typescript
/**
 * Base output configuration shared by all control types.
 */
export interface BaseOutputConfig {
  /** Number of frames in filmstrip (1-256) */
  frameCount: number;

  /** Width of each frame in pixels (16-512) */
  frameWidth: number;

  /** Height of each frame in pixels (16-512) */
  frameHeight: number;

  /** Filmstrip layout arrangement */
  layout: FilmstripLayout;
}

/**
 * Output configuration for rotational controls (knobs).
 * Extends base with angle-based parameters.
 */
export interface RotationalOutputConfig extends BaseOutputConfig {
  /** Total rotation sweep in degrees (1-360) */
  sweepAngle: number;

  /** Start angle in degrees (0-360) */
  startAngle: number;

  /** End angle in degrees (computed: startAngle + sweepAngle) */
  endAngle: number;

  /** Additional rotation offset in degrees (-180 to 180) */
  rotationOffset: number;
}

/**
 * Output configuration for linear controls (sliders/faders).
 * Base config is sufficient - position calculated from 0-100%.
 */
export interface LinearOutputConfig extends BaseOutputConfig {
  // No additional fields needed
  // Frame position = frameIndex / (frameCount - 1)
}
```

### Material System

```typescript
/**
 * Material types supported by the designer.
 */
export type MaterialType = 'solid' | 'metallic' | 'matte' | 'brushed';

/**
 * Brush direction for brushed metal materials.
 */
export type BrushDirection = 'horizontal' | 'vertical' | 'radial' | 'circular';

/**
 * Material configuration for layers and components.
 */
export interface LayerMaterial {
  /** Material type determines rendering properties */
  type: MaterialType;

  /** Base color in hex format with alpha (#RRGGBBAA) */
  color: string;

  /** Specular highlight intensity (0-100) */
  shininess: number;

  /** Environment reflection intensity (0-100) */
  reflectivity: number;

  /** Direction of brushed metal texture */
  brushDirection: BrushDirection;

  /** Intensity of brush effect (0-100) */
  brushIntensity: number;
}
```

### Material Target Selection

```typescript
/**
 * Material target for knob control (layer-based).
 */
export interface MaterialTargetKnob {
  type: 'layer';
  layerId: string;
}

/**
 * Material target for slider control (component-based).
 */
export interface MaterialTargetSlider {
  type: 'component';
  componentId: 'track' | 'handle' | 'fill';
}

/**
 * Union type for all material target types.
 * Used to identify which element's material is being edited.
 */
export type MaterialTarget = MaterialTargetKnob | MaterialTargetSlider;
```

### Base Control Design

```typescript
/**
 * Base interface for all control type designs.
 * Defines shared fields that all control types must have.
 */
export interface BaseControlDesign {
  /** Unique identifier (UUID) */
  id: string;

  /** User-provided display name */
  name: string;

  /** Control type discriminator */
  controlType: ControlTypeId;

  /** Lighting configuration */
  lighting: LightingConfig;

  /** Output configuration (type-specific extension) */
  output: BaseOutputConfig;

  /** Camera view angle */
  cameraView: CameraView;
}
```

---

## Knob Types (knob.ts)

### Knob-Specific Types

```typescript
/**
 * Skirt style for knob layers.
 * Defines the profile of the layer's side surface.
 */
export type SkirtStyle = 'cylindrical' | 'tapered' | 'angled';

/**
 * Indicator types for knob position marking.
 */
export type IndicatorType = 'line' | 'dot' | 'notch' | 'groove';
```

### Knob Layer

```typescript
/**
 * Geometry configuration for a knob layer.
 */
export interface KnobLayerGeometry {
  /** Diameter as percentage of frame (1-100) */
  diameter: number;

  /** Height as percentage of total knob height (1-100) */
  height: number;

  /** Bevel radius for top edge (0-20) */
  bevelRadius: number;

  /** Skirt profile style */
  skirtStyle: SkirtStyle;
}

/**
 * A single layer in the knob design.
 * Knobs can have multiple stacked layers.
 */
export interface KnobLayer {
  /** Unique layer identifier */
  id: string;

  /** User-provided layer name */
  name: string;

  /** Geometry configuration */
  geometry: KnobLayerGeometry;

  /** Material configuration */
  material: LayerMaterial;
}
```

### Knob Indicator

```typescript
/**
 * Size configuration for indicator types.
 */
export interface IndicatorSize {
  /** Radius for dot indicators (1-20) */
  radius: number;

  /** Length for line indicators (1-50) */
  length: number;

  /** Width for line/notch indicators (1-10) */
  width: number;

  /** Height (extrusion depth) (0.5-10) */
  height: number;

  /** Depth for groove/notch indicators (0.5-10) */
  depth: number;
}

/**
 * Material configuration for indicators.
 */
export interface IndicatorMaterial {
  /** Indicator color in hex format (#RRGGBBAA) */
  color: string;

  /** Whether indicator has metallic finish */
  metallic: boolean;
}

/**
 * Position indicator configuration.
 * Shows the current rotational position of the knob.
 */
export interface KnobIndicator {
  /** Whether indicator is visible */
  enabled: boolean;

  /** Indicator shape type */
  type: IndicatorType;

  /** Material configuration */
  material: IndicatorMaterial;

  /** Size dimensions */
  size: IndicatorSize;

  /** Radial position as percentage of layer radius (0-100) */
  radialPosition: number;
}
```

### Complete Knob Design

```typescript
/**
 * Complete knob design configuration.
 * Extends BaseControlDesign with knob-specific properties.
 */
export interface KnobDesign extends BaseControlDesign {
  /** Control type discriminator (always 'knob') */
  controlType: 'knob';

  /** Stack of knob layers (bottom to top) */
  layers: KnobLayer[];

  /** Position indicator configuration */
  indicator: KnobIndicator | null;

  /** Rotational output configuration */
  output: RotationalOutputConfig;
}
```

---

## Slider Types (slider.ts)

### Slider-Specific Types

```typescript
/**
 * Slider orientation (direction of travel).
 */
export type SliderOrientation = 'horizontal' | 'vertical';

/**
 * Handle shape options.
 */
export type HandleShape = 'rectangle' | 'rounded' | 'circle' | 'faderCap';

/**
 * Value fill display mode.
 * - none: No fill visualization
 * - fromStart: Fill from minimum to current value
 * - fromCenter: Fill from center, expands both directions
 * - segmented: Discrete LED-style segments
 */
export type ValueFillMode = 'none' | 'fromStart' | 'fromCenter' | 'segmented';
```

### Slider Track

```typescript
/**
 * Track configuration for slider control.
 * The track is the stationary guide along which the handle moves.
 */
export interface SliderTrack {
  /** Track orientation (direction of travel) */
  orientation: SliderOrientation;

  /**
   * Track length as percentage of frame dimension (10-100).
   * For vertical: percentage of frame height.
   * For horizontal: percentage of frame width.
   */
  length: number;

  /**
   * Track width as percentage of frame dimension (5-50).
   * For vertical: percentage of frame width.
   * For horizontal: percentage of frame height.
   */
  width: number;

  /** Track depth in world units (1-20) */
  depth: number;

  /** Corner radius for rounded edges (0-10) */
  cornerRadius: number;

  /** Track material configuration */
  material: LayerMaterial;
}
```

### Slider Handle

```typescript
/**
 * Handle configuration for slider control.
 * The handle is the movable element the user drags.
 */
export interface SliderHandle {
  /** Handle shape */
  shape: HandleShape;

  /**
   * Handle width as percentage of track width (50-150).
   * Can be wider than track for "cap" style handles.
   */
  width: number;

  /**
   * Handle height as percentage of track width (50-200).
   * Controls the "thickness" of the handle along travel axis.
   */
  height: number;

  /** Corner radius for rounded shapes (0-10) */
  cornerRadius: number;

  /**
   * Number of horizontal grip lines on handle (0-5).
   * 0 = no grip lines, 1-5 = number of lines.
   */
  gripLines: number;

  /** Handle material configuration */
  material: LayerMaterial;
}
```

### Slider Value Fill

```typescript
/**
 * Value fill visualization configuration.
 * Optional colored region showing current value.
 */
export interface SliderValueFill {
  /** Fill display mode */
  mode: ValueFillMode;

  /** Fill color in hex format (#RRGGBBAA) */
  color: string;

  /**
   * Glow/emission intensity (0-100).
   * Higher values create a luminous effect.
   */
  glowIntensity: number;

  /**
   * Number of segments for segmented mode (2-20).
   * Only used when mode is 'segmented'.
   */
  segmentCount?: number;

  /**
   * Gap between segments as percentage of segment height (0-50).
   * Only used when mode is 'segmented'.
   */
  segmentGap?: number;
}
```

### Complete Slider Design

```typescript
/**
 * Complete slider design configuration.
 * Extends BaseControlDesign with slider-specific properties.
 */
export interface SliderDesign extends BaseControlDesign {
  /** Control type discriminator (always 'slider') */
  controlType: 'slider';

  /** Track configuration */
  track: SliderTrack;

  /** Handle configuration */
  handle: SliderHandle;

  /** Value fill configuration */
  valueFill: SliderValueFill;

  /** Linear output configuration */
  output: LinearOutputConfig;
}
```

---

## Preset Types

### Control Preset

```typescript
/**
 * A saved preset for any control type.
 * Generic over the design type for type safety.
 */
export interface ControlPreset<T extends BaseControlDesign = BaseControlDesign> {
  /** Unique identifier (UUID) */
  id: string;

  /** User-provided preset name */
  name: string;

  /** Control type discriminator for filtering */
  controlType: ControlTypeId;

  /** Whether this is a built-in preset */
  isBuiltIn: boolean;

  /** ISO 8601 timestamp of creation */
  createdAt: string;

  /** ISO 8601 timestamp of last modification */
  updatedAt: string;

  /** The complete design configuration */
  design: T;
}

/**
 * Type alias for knob-specific presets.
 */
export type KnobPreset = ControlPreset<KnobDesign>;

/**
 * Type alias for slider-specific presets.
 */
export type SliderPreset = ControlPreset<SliderDesign>;
```

---

## Type Guards

```typescript
/**
 * Type guard to check if design is a knob design.
 */
export function isKnobDesign(design: BaseControlDesign): design is KnobDesign {
  return design.controlType === 'knob';
}

/**
 * Type guard to check if design is a slider design.
 */
export function isSliderDesign(design: BaseControlDesign): design is SliderDesign {
  return design.controlType === 'slider';
}

/**
 * Type guard to check if material target is for knob.
 */
export function isKnobMaterialTarget(target: MaterialTarget): target is MaterialTargetKnob {
  return target.type === 'layer';
}

/**
 * Type guard to check if material target is for slider.
 */
export function isSliderMaterialTarget(target: MaterialTarget): target is MaterialTargetSlider {
  return target.type === 'component';
}
```

---

## Validation Constraints

### Shared Constraints

```typescript
export const SHARED_CONSTRAINTS = {
  lighting: {
    azimuth: { min: 0, max: 360 },
    elevation: { min: 0, max: 90 },
    aoStrength: { min: 0, max: 100 },
  },
  output: {
    frameCount: { min: 1, max: 256 },
    frameWidth: { min: 16, max: 512 },
    frameHeight: { min: 16, max: 512 },
  },
  material: {
    shininess: { min: 0, max: 100 },
    reflectivity: { min: 0, max: 100 },
    brushIntensity: { min: 0, max: 100 },
  },
} as const;
```

### Knob Constraints

```typescript
export const KNOB_CONSTRAINTS = {
  layer: {
    diameter: { min: 1, max: 100 },
    height: { min: 1, max: 100 },
    bevelRadius: { min: 0, max: 20 },
  },
  indicator: {
    radialPosition: { min: 0, max: 100 },
    radius: { min: 1, max: 20 },
    length: { min: 1, max: 50 },
    width: { min: 1, max: 10 },
    height: { min: 0.5, max: 10 },
    depth: { min: 0.5, max: 10 },
  },
  output: {
    sweepAngle: { min: 1, max: 360 },
    startAngle: { min: 0, max: 360 },
    rotationOffset: { min: -180, max: 180 },
  },
} as const;
```

### Slider Constraints

```typescript
export const SLIDER_CONSTRAINTS = {
  track: {
    length: { min: 10, max: 100 },
    width: { min: 5, max: 50 },
    depth: { min: 1, max: 20 },
    cornerRadius: { min: 0, max: 10 },
  },
  handle: {
    width: { min: 50, max: 150 },
    height: { min: 50, max: 200 },
    cornerRadius: { min: 0, max: 10 },
    gripLines: { min: 0, max: 5 },
  },
  valueFill: {
    glowIntensity: { min: 0, max: 100 },
    segmentCount: { min: 2, max: 20 },
    segmentGap: { min: 0, max: 50 },
  },
} as const;
```

---

## IndexedDB Schema Update

```typescript
// In src/domain/project/types.ts

/** IndexedDB database version - increment when schema changes */
export const DB_VERSION = 4; // Bumped from 3

/** Object store names */
export const STORES = {
  PROJECTS: 'projects',
  BITMAPS: 'bitmaps',
  PRESETS: 'presets',
} as const;

/** Index names */
export const INDEXES = {
  BITMAPS_BY_PROJECT: 'projectId',
  PRESETS_BY_NAME: 'name',
  PRESETS_BY_BUILTIN: 'isBuiltIn',
  PRESETS_BY_CONTROL_TYPE: 'controlType', // NEW
} as const;
```

```typescript
// Migration in src/services/indexedDB/database.ts

if (oldVersion < 4) {
  // Add controlType index to presets store
  const presetStore = transaction.objectStore(STORES.PRESETS);
  if (!presetStore.indexNames.contains(INDEXES.PRESETS_BY_CONTROL_TYPE)) {
    presetStore.createIndex(
      INDEXES.PRESETS_BY_CONTROL_TYPE,
      'controlType',
      { unique: false }
    );
  }

  // Backfill existing presets with controlType: 'knob'
  presetStore.openCursor().onsuccess = (event) => {
    const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
    if (cursor) {
      const preset = cursor.value;
      if (!preset.controlType) {
        preset.controlType = 'knob'; // Default for existing presets
        cursor.update(preset);
      }
      cursor.continue();
    }
  };
}
```

---

## Re-exports (index.ts)

```typescript
// src/types/controlDesigner/index.ts

// Base types
export type {
  ControlTypeId,
  ControlCategory,
  CameraView,
  FilmstripLayout,
  LightingConfig,
  BaseOutputConfig,
  RotationalOutputConfig,
  LinearOutputConfig,
  MaterialType,
  BrushDirection,
  LayerMaterial,
  MaterialTargetKnob,
  MaterialTargetSlider,
  MaterialTarget,
  BaseControlDesign,
} from './base';

// Knob types
export type {
  SkirtStyle,
  IndicatorType,
  KnobLayerGeometry,
  KnobLayer,
  IndicatorSize,
  IndicatorMaterial,
  KnobIndicator,
  KnobDesign,
} from './knob';

// Slider types
export type {
  SliderOrientation,
  HandleShape,
  ValueFillMode,
  SliderTrack,
  SliderHandle,
  SliderValueFill,
  SliderDesign,
} from './slider';

// Preset types
export type {
  ControlPreset,
  KnobPreset,
  SliderPreset,
} from './base';

// Type guards
export {
  isKnobDesign,
  isSliderDesign,
  isKnobMaterialTarget,
  isSliderMaterialTarget,
} from './base';

// Constraints
export {
  SHARED_CONSTRAINTS,
  KNOB_CONSTRAINTS,
  SLIDER_CONSTRAINTS,
} from './constraints';
```

---

## Relationships

```
ControlPreset 1:1 BaseControlDesign
  └── discriminated by: controlType

KnobDesign 1:N KnobLayer
  └── ordered by: array index (bottom to top)

KnobDesign 0:1 KnobIndicator
  └── optional: enabled flag controls visibility

SliderDesign 1:1 SliderTrack
SliderDesign 1:1 SliderHandle
SliderDesign 1:1 SliderValueFill

All designs share:
  - LightingConfig
  - MaterialTarget selection (type-specific)
  - BaseOutputConfig (type-extended)
```
