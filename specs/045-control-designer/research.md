# Research: Control Designer Plugin Architecture

**Feature**: 045-control-designer
**Date**: 2026-01-19
**Status**: Complete

## Research Questions

1. How to create slider/fader 3D geometry with Three.js (rounded rectangles, bevels)?
2. How to implement click-to-select material target in Three.js preview?
3. What is the best plugin/registry pattern for SolidJS extensible components?
4. How to design a type-safe multi-type store in SolidJS?
5. How to calculate linear filmstrip frame positions for slider controls?

---

## R1: Three.js Slider/Fader 3D Geometry

### Question
What is the best approach for creating slider track and handle geometries with rounded corners in Three.js?

### Research Sources

- [Three.js RoundedBoxGeometry Documentation](https://threejs.org/docs/pages/RoundedBoxGeometry.html)
- [Three.js Forum: Round-edged box](https://discourse.threejs.org/t/round-edged-box/1402)
- [GitHub Gist: Rounded rectangle geometry](https://gist.github.com/saitonakamura/bba32e34358dcae8e01f3900fea2107e)

### Findings

Three.js provides `RoundedBoxGeometry` as an official addon geometry. It creates a box with rounded corners and edges, which is ideal for slider tracks and handles.

**Constructor**:
```typescript
new RoundedBoxGeometry(width, height, depth, segments, radius);
```

**Parameters**:
- `width`: Length parallel to X axis (default 1)
- `height`: Length parallel to Y axis (default 1)
- `depth`: Length parallel to Z axis (default 1)
- `segments`: Number of segments forming rounded corners (default 2)
- `radius`: Radius of rounded corners (default 0.1)

**Import** (addon, not core):
```typescript
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
```

### Alternatives Considered

1. **ExtrudeGeometry with THREE.Shape**: More flexible for complex shapes but requires manual UV mapping and is overkill for rectangular geometry.

2. **three-rounded-box npm package**: External dependency that adds maintenance burden; RoundedBoxGeometry is already in Three.js.

3. **Manual BufferGeometry**: Maximum control but excessive complexity for a solved problem.

4. **RoundedRectangle BufferGeometry (Gist)**: Good for 2D extruded shapes but less suitable for 3D boxes with all edges rounded.

### Decision

**Use RoundedBoxGeometry from Three.js addons.**

**Rationale**:
- Official Three.js addon with documentation
- Direct control over corner radius
- No external dependencies
- Consistent with existing geometry patterns in the codebase
- Proper UV mapping out of the box

### Implementation Pattern

```typescript
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { Mesh, MeshStandardMaterial } from 'three';

// Track geometry (long, thin box for slider track)
function createTrackGeometry(
  length: number,
  width: number,
  depth: number,
  cornerRadius: number
): RoundedBoxGeometry {
  // For vertical slider: length is Z, width is X, depth is Y
  return new RoundedBoxGeometry(
    width,        // X dimension (track width)
    depth,        // Y dimension (track thickness)
    length,       // Z dimension (track length)
    2,            // segments (2 is sufficient for smooth corners)
    cornerRadius  // corner radius
  );
}

// Handle geometry (cap-shaped for fader)
function createHandleGeometry(
  width: number,
  height: number,
  depth: number,
  cornerRadius: number
): RoundedBoxGeometry {
  return new RoundedBoxGeometry(
    width,
    height,
    depth,
    2,
    cornerRadius
  );
}
```

---

## R2: Three.js Material Selection via Raycasting

### Question
How to implement click-to-select functionality in the 3D preview to select slider components (track, handle, fill) for material editing?

### Research Sources

- [Three.js Manual: Picking](https://threejs.org/manual/en/picking.html)
- [Three.js Docs: Raycaster](https://threejs.org/docs/api/en/core/Raycaster.html)
- [Tutorial: Object picking / Raycasting](https://riptutorial.com/three-js/example/17088/object-picking---raycasting)
- [Three.js Forum: Raycasting and object selection](https://discourse.threejs.org/t/raycasting-and-object-selection/67860)

### Findings

Three.js Raycaster is the standard solution for object picking. It casts a ray from the camera through a point on the screen and returns intersections with scene objects.

**Key Concepts**:
1. Convert mouse coordinates to normalized device coordinates (NDC): -1 to +1 for both axes
2. Use `raycaster.setFromCamera()` to set ray direction
3. Use `raycaster.intersectObjects()` to get intersections
4. Intersections are sorted by distance (closest first)

**Intersection Result Properties**:
- `object`: The intersected mesh
- `distance`: Distance from camera
- `point`: Intersection point (Vector3)
- `face`: Intersected face
- `uv`: UV coordinates at intersection

### Decision

**Use Three.js Raycaster with userData for component identification.**

**Rationale**:
- Standard Three.js pattern
- Built-in distance sorting
- Works with orthographic camera (used in our preview)
- Can store component ID in mesh.userData

### Implementation Pattern

```typescript
import { Raycaster, Vector2, type Mesh, type Camera, type Group } from 'three';

// Store component ID in mesh userData during creation
function createSliderMeshes(design: SliderDesign, group: Group): void {
  const trackMesh = new Mesh(trackGeometry, trackMaterial);
  trackMesh.userData.componentId = 'track';

  const handleMesh = new Mesh(handleGeometry, handleMaterial);
  handleMesh.userData.componentId = 'handle';

  const fillMesh = new Mesh(fillGeometry, fillMaterial);
  fillMesh.userData.componentId = 'fill';

  group.add(trackMesh, handleMesh, fillMesh);
}

// Raycasting for selection
const raycaster = new Raycaster();
const mouse = new Vector2();

function getClickedComponent(
  event: MouseEvent,
  canvas: HTMLCanvasElement,
  camera: Camera,
  group: Group
): 'track' | 'handle' | 'fill' | null {
  const rect = canvas.getBoundingClientRect();

  // Convert to NDC (-1 to +1)
  mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);

  // Check intersections with group children
  const intersects = raycaster.intersectObjects(group.children, true);

  if (intersects.length > 0) {
    const clickedObject = intersects[0].object as Mesh;
    return clickedObject.userData.componentId || null;
  }

  return null;
}

// In preview component
function handleCanvasClick(event: MouseEvent): void {
  const componentId = getClickedComponent(event, canvas, camera, sliderGroup);
  if (componentId) {
    setSelectedMaterialTarget({ type: 'component', componentId });
  }
}
```

---

## R3: Plugin Registry Pattern for TypeScript

### Question
What is the best pattern for implementing an extensible control type plugin system with TypeScript type safety?

### Research Sources

- [Refactoring Guru: Factory Method in TypeScript](https://refactoring.guru/design-patterns/factory-method/typescript/example)
- [Medium: Factory Registry Pattern in TypeScript](https://medium.com/@lalitpradhan306/factory-registry-pattern-96c97408c971)
- [Medium: Factory Pattern with Type Map](https://medium.com/codex/factory-pattern-type-script-implementation-with-type-map-ea422f38862)
- [Fireship: 10 Design Patterns in TypeScript](https://fireship.io/lessons/typescript-design-patterns/)

### Findings

The **Factory Registry Pattern** combines the Factory pattern with a registry for dynamic plugin registration. Key benefits:

1. **Loose coupling**: Plugins register themselves; core code doesn't know about specific implementations
2. **Extensibility**: Add new control types without modifying core
3. **Type safety**: TypeScript generics and discriminated unions maintain type safety
4. **Runtime flexibility**: Plugins can be registered at startup

**Pattern Structure**:
```
Registry (Map<ControlTypeId, Plugin>)
  ├── register(plugin)
  ├── get(id): Plugin
  └── getAll(): Plugin[]

Plugin Interface
  ├── id: ControlTypeId
  ├── createDefaultDesign(): TDesign
  ├── createRenderer(): ControlRenderer<TDesign>
  └── validateDesign(design): ValidationResult
```

### Decision

**Use Factory Registry Pattern with TypeScript generics.**

**Rationale**:
- Well-documented pattern for plugin systems
- Type-safe via generics (`ControlTypePlugin<TDesign>`)
- Supports runtime registration
- Aligns with TypeScript best practices

### Implementation Pattern

```typescript
// Types
export type ControlTypeId = 'knob' | 'slider';

export interface BaseControlDesign {
  id: string;
  controlType: ControlTypeId;
  // ... shared fields
}

// Plugin interface with generic for type-specific design
export interface ControlTypePlugin<TDesign extends BaseControlDesign = BaseControlDesign> {
  id: ControlTypeId;
  label: string;
  createDefaultDesign(): TDesign;
  createRenderer(): ControlRenderer<TDesign>;
  validateDesign(design: TDesign): ValidationResult;
  geometryPanels: PanelDefinition[];
}

// Registry implementation
class ControlTypeRegistry {
  private plugins = new Map<ControlTypeId, ControlTypePlugin>();

  register<T extends BaseControlDesign>(plugin: ControlTypePlugin<T>): void {
    if (this.plugins.has(plugin.id)) {
      console.warn(`Plugin ${plugin.id} already registered, overwriting`);
    }
    this.plugins.set(plugin.id, plugin as ControlTypePlugin);
  }

  get(id: ControlTypeId): ControlTypePlugin | undefined {
    return this.plugins.get(id);
  }

  getAll(): ControlTypePlugin[] {
    return Array.from(this.plugins.values());
  }

  isRegistered(id: ControlTypeId): boolean {
    return this.plugins.has(id);
  }
}

// Singleton export
export const controlTypeRegistry = new ControlTypeRegistry();

// Plugin registration (at app startup)
import { knobPlugin } from '../knobDesigner/plugin';
import { sliderPlugin } from '../sliderDesigner/plugin';

controlTypeRegistry.register(knobPlugin);
controlTypeRegistry.register(sliderPlugin);
```

---

## R4: SolidJS Store Pattern for Multi-Type State

### Question
How to manage state for multiple control types in SolidJS with type safety and support for tab switching with design preservation?

### Research Sources

- [SolidJS Documentation: Stores](https://www.solidjs.com/docs/latest/api#stores)
- [SolidJS Guide](/.claude/skills/solidjs-guide) (project skill)
- Existing `knobDesignerStore.ts` in codebase

### Findings

SolidJS `createStore` provides fine-grained reactivity for nested objects. Key patterns:

1. **Nested stores**: Use path-based updates for nested objects
2. **Discriminated unions**: Use `controlType` field to discriminate
3. **Separate design signals**: Store each control type's design separately
4. **Type narrowing**: Use TypeScript type guards for type-safe access

**Codebase Pattern** (from existing knobDesignerStore):
```typescript
const [design, setDesign] = createSignal<KnobDesign>(createDefaultDesign());
```

### Decision

**Use createStore with indexed designs object and discriminated access.**

**Rationale**:
- Maintains SolidJS fine-grained reactivity
- Type-safe via discriminated union
- Supports design preservation during tab switching
- Consistent with existing codebase patterns

### Implementation Pattern

```typescript
import { createStore, produce } from 'solid-js/store';
import type { ControlTypeId, BaseControlDesign, KnobDesign, SliderDesign } from '../types';

// State interface
interface ControlDesignerState {
  isOpen: boolean;
  activeControlType: ControlTypeId;
  designs: {
    knob: KnobDesign | null;
    slider: SliderDesign | null;
  };
  targetBitmapName: string | null;
  targetProjectId: string | null;
  selectedMaterialTarget: MaterialTarget | null;
  // ... other shared state
}

// Store creation
const [state, setState] = createStore<ControlDesignerState>({
  isOpen: false,
  activeControlType: 'knob',
  designs: {
    knob: null,
    slider: null,
  },
  targetBitmapName: null,
  targetProjectId: null,
  selectedMaterialTarget: null,
});

// Type-safe design accessor
function getCurrentDesign(): BaseControlDesign | null {
  const type = state.activeControlType;
  return state.designs[type];
}

// Type-safe design update
function updateCurrentDesign(updates: Partial<BaseControlDesign>): void {
  const type = state.activeControlType;
  setState(
    produce((s) => {
      if (s.designs[type]) {
        Object.assign(s.designs[type]!, updates);
      }
    })
  );
}

// Tab switching with design preservation
function switchControlType(newType: ControlTypeId): void {
  if (newType === state.activeControlType) return;

  // Current design is already in state.designs[oldType]
  // Just switch active type
  setState('activeControlType', newType);

  // Initialize design for new type if not exists
  if (!state.designs[newType]) {
    const plugin = controlTypeRegistry.get(newType);
    if (plugin) {
      setState('designs', newType, plugin.createDefaultDesign());
    }
  }

  // Clear material target (type-specific)
  setState('selectedMaterialTarget', null);
}
```

---

## R5: Linear Filmstrip Frame Calculation

### Question
How to calculate handle positions for slider filmstrip frames (linear interpolation vs rotational)?

### Research Sources

- Feature specification (spec.md)
- Existing `filmstrip.ts` in codebase

### Findings

Per spec: "Linear controls use position percentage (0-100%) divided evenly across frame count."

**Existing Knob Pattern** (rotational):
```typescript
function calculateFrameAngle(
  frameIndex: number,
  frameCount: number,
  startAngle: number,
  sweepAngle: number
): number {
  if (frameCount <= 1) return startAngle;
  const progress = frameIndex / (frameCount - 1);
  return startAngle + progress * sweepAngle;
}
```

**Slider Pattern** (linear):
- Frame 0: 0% position (handle at bottom/left)
- Frame N-1: 100% position (handle at top/right)
- Intermediate frames: Linear interpolation

### Decision

**Use normalized position (0-1) for slider frame calculation.**

**Rationale**:
- Simpler than rotational (no angle conversion)
- Consistent with spec requirements
- Position maps directly to handle offset

### Implementation Pattern

```typescript
/**
 * Calculates normalized position for a slider frame.
 *
 * @param frameIndex - Current frame index (0-based)
 * @param frameCount - Total frame count
 * @returns Position from 0 (min) to 1 (max)
 */
export function calculateSliderFramePosition(
  frameIndex: number,
  frameCount: number
): number {
  if (frameCount <= 1) return 0;
  return frameIndex / (frameCount - 1);
}

/**
 * Calculates handle offset in world units for a given position.
 *
 * @param position - Normalized position (0-1)
 * @param trackLength - Track length in world units
 * @param handleHeight - Handle height in world units (for centering)
 * @returns Y offset for handle mesh position
 */
export function calculateHandleOffset(
  position: number,
  trackLength: number,
  handleHeight: number
): number {
  const travelDistance = trackLength - handleHeight; // Usable travel
  const trackStart = -trackLength / 2 + handleHeight / 2;
  return trackStart + position * travelDistance;
}

// Usage in filmstrip generation
for (let i = 0; i < frameCount; i++) {
  const position = calculateSliderFramePosition(i, frameCount);
  const handleY = calculateHandleOffset(position, trackLength, handleHeight);
  handleMesh.position.y = handleY;
  // Render frame...
}
```

---

## Summary of Decisions

| Topic | Decision | Key Rationale |
|-------|----------|---------------|
| Slider Geometry | RoundedBoxGeometry | Official addon, proper UV mapping |
| Click Selection | Raycaster + userData | Standard pattern, works with ortho camera |
| Plugin Registry | Factory Registry Pattern | Type-safe, extensible, runtime registration |
| Store Pattern | createStore with indexed designs | SolidJS reactivity, tab switching support |
| Frame Calculation | Linear interpolation (0-1) | Simple, matches spec requirements |

## No New Dependencies Required

All research confirms that the required functionality can be implemented with existing dependencies:
- Three.js (RoundedBoxGeometry is in addons, not external)
- SolidJS (createStore, createSignal)
- TypeScript (generics, discriminated unions)
