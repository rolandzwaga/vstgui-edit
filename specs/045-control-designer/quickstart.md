# Quickstart: Control Designer Plugin Architecture

**Feature**: 001-control-designer
**Date**: 2026-01-19
**Audience**: Developers implementing new control types

## Overview

The Control Designer uses a plugin architecture to support multiple control types (knobs, sliders, switches, etc.) while sharing common infrastructure for materials, lighting, presets, and filmstrip generation.

This guide explains how to add a new control type to the system.

---

## Architecture Summary

```
┌─────────────────────────────────────────────────────────────────────┐
│                    ControlDesignerModal                              │
│  ┌──────────────┐  ┌────────────────────────────────────────────┐  │
│  │ControlType   │  │ Panel Area                                  │  │
│  │Tabs          │  │  ┌─────────────────────────────────────┐   │  │
│  │              │  │  │ Type-Specific Panels                │   │  │
│  │ [Knob]       │  │  │ (from plugin.geometryPanels)        │   │  │
│  │ [Slider]     │  │  └─────────────────────────────────────┘   │  │
│  │ [Switch]     │  │  ┌─────────────────────────────────────┐   │  │
│  │              │  │  │ Shared Panels                       │   │  │
│  └──────────────┘  │  │ - LightingPanel                     │   │  │
│                    │  │ - MaterialPanel                     │   │  │
│  ┌──────────────┐  │  │ - OutputPanel                       │   │  │
│  │ControlPreview│  │  │ - PresetSelector                    │   │  │
│  │ (3D canvas)  │  │  └─────────────────────────────────────┘   │  │
│  └──────────────┘  └────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
                              │
                              ▼
            ┌─────────────────────────────────┐
            │   controlTypeRegistry           │
            │   ┌──────────┐ ┌──────────┐    │
            │   │knobPlugin│ │sliderPl..│    │
            │   └──────────┘ └──────────┘    │
            └─────────────────────────────────┘
```

---

## Step-by-Step: Adding a New Control Type

### Step 1: Define Types

Create `src/types/controlDesigner/yourcontrol.ts`:

```typescript
import type { BaseControlDesign, LinearOutputConfig, LayerMaterial } from './base';

// Define your control-specific types
export type YourControlOption = 'optionA' | 'optionB' | 'optionC';

export interface YourControlComponent {
  enabled: boolean;
  width: number;  // % of frame
  height: number; // % of frame
  material: LayerMaterial;
}

// Define the complete design interface
export interface YourControlDesign extends BaseControlDesign {
  controlType: 'yourcontrol'; // Must match ControlTypeId
  componentA: YourControlComponent;
  componentB: YourControlComponent;
  option: YourControlOption;
  output: LinearOutputConfig; // or RotationalOutputConfig
}
```

### Step 2: Add Type ID

Update `src/types/controlDesigner/base.ts`:

```typescript
// Add to the union type
export type ControlTypeId = 'knob' | 'slider' | 'yourcontrol';

// Add type guard
export function isYourControlDesign(design: BaseControlDesign): design is YourControlDesign {
  return design.controlType === 'yourcontrol';
}
```

### Step 3: Create Domain Module

Create `src/domain/yourcontrolDesigner/`:

```
src/domain/yourcontrolDesigner/
├── index.ts        # Re-exports
├── plugin.ts       # Plugin definition
├── geometry.ts     # Three.js geometry creation
├── defaults.ts     # Default design and presets
└── validation.ts   # Design validation rules
```

#### plugin.ts

```typescript
import type { ControlTypePlugin } from '../controlDesigner/registry';
import type { YourControlDesign } from '../../types/controlDesigner/yourcontrol';
import { createDefaultYourControlDesign, BUILTIN_PRESETS } from './defaults';
import { validateYourControlDesign } from './validation';
import { YourControlIcon } from '../../components/icons/YourControlIcon';

// Panel imports
import { ComponentAPanel } from '../../components/YourControlDesigner/ComponentAPanel';
import { ComponentBPanel } from '../../components/YourControlDesigner/ComponentBPanel';

export const yourControlPlugin: ControlTypePlugin<YourControlDesign> = {
  id: 'yourcontrol',
  label: 'Your Control',
  category: 'linear', // or 'rotational', 'binary', etc.
  icon: YourControlIcon,

  createDefaultDesign: createDefaultYourControlDesign,

  geometryPanels: [
    {
      id: 'componentA',
      label: 'Component A',
      component: ComponentAPanel,
    },
    {
      id: 'componentB',
      label: 'Component B',
      component: ComponentBPanel,
    },
  ],

  validateDesign: validateYourControlDesign,

  constraints: {
    'componentA.width': { min: 10, max: 100 },
    'componentA.height': { min: 10, max: 100 },
    // ... other constraints
  },
};
```

#### geometry.ts

```typescript
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import type { BufferGeometry } from 'three';
import type { YourControlDesign, YourControlComponent } from '../../types/controlDesigner';

/**
 * Creates geometry for component A.
 */
export function createComponentAGeometry(
  component: YourControlComponent,
  frameWidth: number,
  frameHeight: number
): BufferGeometry {
  const width = (component.width / 100) * frameWidth;
  const height = (component.height / 100) * frameHeight;
  const depth = 5; // world units

  return new RoundedBoxGeometry(width, depth, height, 2, 1);
}

/**
 * Creates geometry for component B.
 */
export function createComponentBGeometry(
  component: YourControlComponent,
  frameWidth: number,
  frameHeight: number
): BufferGeometry {
  // Similar implementation
}
```

#### defaults.ts

```typescript
import type { YourControlDesign } from '../../types/controlDesigner';
import type { ControlPreset } from '../../types/controlDesigner/base';

export const DEFAULT_YOURCONTROL_DESIGN: Omit<YourControlDesign, 'id'> = {
  name: 'New Your Control',
  controlType: 'yourcontrol',
  componentA: {
    enabled: true,
    width: 80,
    height: 20,
    material: {
      type: 'metallic',
      color: '#888888FF',
      shininess: 80,
      reflectivity: 50,
      brushDirection: 'horizontal',
      brushIntensity: 0,
    },
  },
  componentB: {
    enabled: true,
    width: 40,
    height: 40,
    material: {
      type: 'solid',
      color: '#CCCCCCFF',
      shininess: 60,
      reflectivity: 30,
      brushDirection: 'horizontal',
      brushIntensity: 0,
    },
  },
  option: 'optionA',
  lighting: {
    azimuth: 315,
    elevation: 45,
    aoStrength: 50,
  },
  output: {
    frameCount: 64,
    frameWidth: 100,
    frameHeight: 100,
    layout: 'vertical',
  },
  cameraView: 'top',
};

export function createDefaultYourControlDesign(): YourControlDesign {
  return {
    ...DEFAULT_YOURCONTROL_DESIGN,
    id: crypto.randomUUID(),
  };
}

export const BUILTIN_PRESETS: Omit<ControlPreset<YourControlDesign>, 'id' | 'createdAt' | 'updatedAt'>[] = [
  {
    name: 'Classic',
    controlType: 'yourcontrol',
    isBuiltIn: true,
    design: { ...DEFAULT_YOURCONTROL_DESIGN, id: '', name: 'Classic' },
  },
  // ... more presets
];
```

### Step 4: Create Renderer

Create `src/services/controlRenderer/yourcontrolRenderer.ts`:

```typescript
import { Mesh, Group } from 'three';
import type { ControlRenderer } from '../../domain/controlDesigner/registry';
import type { YourControlDesign } from '../../types/controlDesigner';
import { createComponentAGeometry, createComponentBGeometry } from '../../domain/yourcontrolDesigner/geometry';
import { createMaterial } from '../../domain/controlDesigner/materials';
import { BaseRenderer } from './base';

export class YourControlRenderer extends BaseRenderer implements ControlRenderer<YourControlDesign> {
  private controlGroup: Group;
  private componentAMesh: Mesh | null = null;
  private componentBMesh: Mesh | null = null;

  constructor() {
    super();
    this.controlGroup = new Group();
  }

  async initialize(canvas: HTMLCanvasElement): Promise<void> {
    await super.initialize(canvas);
    this.scene.add(this.controlGroup);
  }

  updateScene(design: YourControlDesign): void {
    // Clear existing meshes
    this.controlGroup.clear();

    // Create component A
    if (design.componentA.enabled) {
      const geometry = createComponentAGeometry(
        design.componentA,
        design.output.frameWidth,
        design.output.frameHeight
      );
      const material = createMaterial(design.componentA.material);
      this.componentAMesh = new Mesh(geometry, material);
      this.componentAMesh.userData.componentId = 'componentA';
      this.controlGroup.add(this.componentAMesh);
    }

    // Create component B
    if (design.componentB.enabled) {
      const geometry = createComponentBGeometry(
        design.componentB,
        design.output.frameWidth,
        design.output.frameHeight
      );
      const material = createMaterial(design.componentB.material);
      this.componentBMesh = new Mesh(geometry, material);
      this.componentBMesh.userData.componentId = 'componentB';
      this.controlGroup.add(this.componentBMesh);
    }

    // Update lighting
    this.updateLighting(design.lighting);
  }

  /**
   * Set position for filmstrip frame (0-1 normalized).
   */
  setPosition(position: number): void {
    if (!this.componentBMesh) return;

    // Calculate component B position based on normalized value
    // Example: move along Y axis
    const travel = 20; // world units of travel
    this.componentBMesh.position.y = (position - 0.5) * travel;
  }

  async generateFilmstrip(
    design: YourControlDesign,
    onProgress: (progress: GenerationProgress) => void
  ): Promise<string> {
    // Use base class filmstrip generation with linear frame calculation
    return this.generateLinearFilmstrip(design, onProgress);
  }

  setSelectedComponent(componentId: string | null): void {
    // Highlight selected component for material editing
    // Implementation depends on visual feedback design
  }
}
```

### Step 5: Create UI Panels

Create `src/components/YourControlDesigner/`:

```
src/components/YourControlDesigner/
├── index.ts
├── ComponentAPanel.tsx
├── ComponentAPanel.module.css
├── ComponentBPanel.tsx
└── ComponentBPanel.module.css
```

#### ComponentAPanel.tsx

```typescript
import type { Component } from 'solid-js';
import type { PanelProps } from '../../domain/controlDesigner/registry';
import type { YourControlDesign } from '../../types/controlDesigner';
import styles from './ComponentAPanel.module.css';

export const ComponentAPanel: Component<PanelProps<YourControlDesign>> = (props) => {
  const handleWidthChange = (value: number) => {
    props.onUpdate({
      componentA: {
        ...props.design.componentA,
        width: value,
      },
    });
  };

  const handleHeightChange = (value: number) => {
    props.onUpdate({
      componentA: {
        ...props.design.componentA,
        height: value,
      },
    });
  };

  return (
    <div class={styles.panel}>
      <div class={styles.header}>
        <h3>Component A</h3>
        <label class={styles.toggle}>
          <input
            type="checkbox"
            checked={props.design.componentA.enabled}
            onChange={(e) => props.onUpdate({
              componentA: {
                ...props.design.componentA,
                enabled: e.currentTarget.checked,
              },
            })}
          />
          Enabled
        </label>
      </div>

      <div class={styles.field}>
        <label>Width (%)</label>
        <input
          type="range"
          min="10"
          max="100"
          value={props.design.componentA.width}
          onInput={(e) => handleWidthChange(Number(e.currentTarget.value))}
        />
        <span>{props.design.componentA.width}%</span>
      </div>

      <div class={styles.field}>
        <label>Height (%)</label>
        <input
          type="range"
          min="10"
          max="100"
          value={props.design.componentA.height}
          onInput={(e) => handleHeightChange(Number(e.currentTarget.value))}
        />
        <span>{props.design.componentA.height}%</span>
      </div>
    </div>
  );
};
```

### Step 6: Register the Plugin

In app initialization (e.g., `src/App.tsx` or dedicated init file):

```typescript
import { controlTypeRegistry } from './domain/controlDesigner/registry';
import { knobPlugin } from './domain/knobDesigner/plugin';
import { sliderPlugin } from './domain/sliderDesigner/plugin';
import { yourControlPlugin } from './domain/yourcontrolDesigner/plugin';

// Register all plugins at app startup
controlTypeRegistry.register(knobPlugin);
controlTypeRegistry.register(sliderPlugin);
controlTypeRegistry.register(yourControlPlugin);
```

### Step 7: Add Built-in Presets

The preset service will automatically seed built-in presets on first use. Ensure your `BUILTIN_PRESETS` array in `defaults.ts` is complete.

---

## Key Interfaces Reference

### ControlTypePlugin

```typescript
interface ControlTypePlugin<TDesign extends BaseControlDesign> {
  id: ControlTypeId;
  label: string;
  category: ControlCategory;
  icon: Component;
  createDefaultDesign(): TDesign;
  geometryPanels: PanelDefinition[];
  validateDesign(design: TDesign): ValidationResult;
  constraints: Record<string, ConstraintRange>;
}
```

### ControlRenderer

```typescript
interface ControlRenderer<TDesign extends BaseControlDesign> {
  initialize(canvas: HTMLCanvasElement): Promise<void>;
  updateScene(design: TDesign): void;
  setPosition(position: number): void; // 0-1 normalized
  renderPreview(): void;
  generateFilmstrip(design: TDesign, onProgress: Function): Promise<string>;
  dispose(): void;
  setSelectedComponent?(componentId: string | null): void;
}
```

### PanelProps

```typescript
interface PanelProps<TDesign extends BaseControlDesign> {
  design: TDesign;
  onUpdate: (updates: Partial<TDesign>) => void;
}
```

---

## Frame Generation Categories

| Category | Frame Calculation | Example Controls |
|----------|-------------------|------------------|
| `rotational` | Angle from startAngle through sweepAngle | Knobs, rotary encoders |
| `linear` | Position from 0% to 100% | Sliders, faders |
| `binary` | Two states (0, 1) | Switches, toggles |
| `multiState` | N discrete states | Multi-position switches |
| `grid2D` | X,Y positions | XY pads |

---

## Testing Your Plugin

### Unit Tests

1. Test geometry creation with various parameters
2. Test default design creation
3. Test validation with valid and invalid designs
4. Test constraint enforcement

### Integration Tests

1. Test renderer initialization and scene updates
2. Test filmstrip generation produces correct frame count
3. Test preset save/load roundtrip

### Component Tests

1. Test panel renders with design props
2. Test onUpdate callback with correct partial updates
3. Test input constraints are enforced

---

## Checklist

Before submitting your new control type:

- [ ] Types defined in `src/types/controlDesigner/yourcontrol.ts`
- [ ] Type ID added to `ControlTypeId` union
- [ ] Type guard function added
- [ ] Plugin defined in `src/domain/yourcontrolDesigner/plugin.ts`
- [ ] Geometry functions in `geometry.ts`
- [ ] Default design and presets in `defaults.ts`
- [ ] Validation rules in `validation.ts`
- [ ] Renderer in `src/services/controlRenderer/yourcontrolRenderer.ts`
- [ ] UI panels in `src/components/YourControlDesigner/`
- [ ] Plugin registered in app initialization
- [ ] Unit tests for domain logic
- [ ] Component tests for panels
- [ ] Integration tests for renderer
- [ ] Manual testing of full workflow
