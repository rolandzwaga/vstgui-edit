# Implementation Plan: Control Designer Plugin Architecture

**Branch**: `045-control-designer` | **Date**: 2026-01-19 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/045-control-designer/spec.md`

## Summary

Transform the existing knob-specific 3D designer into an extensible plugin architecture that supports multiple control types (knobs, sliders, switches, etc.). The refactoring introduces a registry-based plugin system where each control type registers itself with type-specific panels, geometry generators, and renderers while sharing common infrastructure (lighting, materials, output, presets).

The slider control type is the first new plugin implementation, featuring a track-handle-fill component model with Three.js geometry using RoundedBoxGeometry for the track and handle, and linear (position-based) filmstrip generation.

## Technical Context

**Language/Version**: TypeScript 5.9.3 (strict mode)
**Primary Dependencies**: SolidJS 1.9.10, Three.js (existing), Vite 7.3.0, Vitest 4.0.16
**Storage**: IndexedDB (existing `presets` store - extend schema to support control type discriminator)
**Testing**: Vitest with @solidjs/testing-library 0.8.10
**Testing Guide**: Use `/testing-guide` skill - MUST be consulted for all test tasks
**SolidJS Guide**: Use `/solidjs-guide` skill - MUST be consulted for component/store implementation
**Target Platform**: Web browser (desktop-first, WebGL required)
**Project Type**: Single SPA (SolidJS web application)
**Performance Goals**: 60fps preview animation, <200ms tab switching, same filmstrip generation performance as knob
**Preview Update Contract**: Updates via requestAnimationFrame targeting 60fps. Renderer.updateScene() called on design changes. Heavy geometry rebuilds (add/remove components) debounced to 100ms.
**Constraints**: WebGL availability required, max 8192x8192 filmstrip texture, existing knob functionality preserved
**Scale/Scope**: 2 control types (knob, slider) initially, architecture supports 5+ types

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Test-First Development | PASS | All new code requires tests first |
| II. Technology Stack | PASS | Using SolidJS, TypeScript, Three.js (existing) |
| III. Security | PASS | No new external inputs; existing validation patterns |
| IV. Code Quality | PASS | Biome, Stylelint, TypeScript strict |
| VI. Testing Standards | PASS | 80% coverage target, co-located tests |
| XII. SolidJS Only | PASS | No React patterns; createSignal/createStore |
| XIX. VSTGUI Domain | N/A | Designer generates assets, doesn't parse uidesc |
| XX. Technical Overview | PASS | Consulted CLAUDE.md for patterns |
| XXI. Static Imports | PASS | No dynamic imports needed |
| XXII. Honest Completion | PASS | Compliance table required |
| XXIII. Quality Gates | PASS | lint:css, check, typecheck gates |

## Project Structure

### Documentation (this feature)

```text
specs/045-control-designer/
├── plan.md              # This file
├── research.md          # Phase 0 output - technology research
├── data-model.md        # Phase 1 output - type definitions
├── quickstart.md        # Phase 1 output - developer guide
├── contracts/           # Phase 1 output - API contracts
│   ├── plugin-registry.ts
│   ├── control-design-types.ts
│   └── slider-types.ts
└── tasks.md             # Phase 2 output (created by /speckit.tasks)
```

### Source Code (repository root)

```text
src/
├── types/
│   ├── controlDesigner/           # NEW: Shared type definitions
│   │   ├── index.ts               # Re-exports
│   │   ├── base.ts                # Base design, plugin, material, lighting types
│   │   ├── knob.ts                # Knob-specific types (migrate from knobDesigner.ts)
│   │   └── slider.ts              # NEW: Slider-specific types
│   └── knobDesigner.ts            # DEPRECATE: Migrate to controlDesigner/
│
├── domain/
│   ├── controlDesigner/           # NEW: Shared domain logic
│   │   ├── index.ts               # Re-exports
│   │   ├── registry.ts            # Plugin registration and lookup
│   │   ├── materials.ts           # Shared material creation (migrate)
│   │   ├── scene.ts               # Shared Three.js scene setup (migrate)
│   │   ├── filmstrip.ts           # Shared filmstrip utilities (migrate)
│   │   ├── validation.ts          # Shared validation (migrate)
│   │   └── defaults.ts            # Default values factory
│   │
│   ├── knobDesigner/              # REFACTOR: Knob-specific domain
│   │   ├── index.ts               # Re-exports
│   │   ├── plugin.ts              # NEW: Knob plugin definition
│   │   ├── geometry.ts            # Knob geometry (existing)
│   │   ├── defaults.ts            # Knob defaults (existing, refactor)
│   │   └── validation.ts          # Knob validation constraints
│   │
│   └── sliderDesigner/            # NEW: Slider-specific domain
│       ├── index.ts               # Re-exports
│       ├── plugin.ts              # Slider plugin definition
│       ├── geometry.ts            # Slider geometry (RoundedBoxGeometry)
│       ├── defaults.ts            # Slider default designs
│       └── validation.ts          # Slider validation constraints
│
├── stores/
│   ├── controlDesignerStore.ts    # NEW: Unified store with plugin dispatch
│   └── knobDesignerStore.ts       # DEPRECATE: Migrate to controlDesignerStore
│
├── services/
│   ├── controlRenderer/           # NEW: Unified renderer service
│   │   ├── index.ts               # Service exports
│   │   ├── base.ts                # Base renderer (scene, camera, lighting)
│   │   ├── knobRenderer.ts        # Knob-specific rendering (migrate)
│   │   └── sliderRenderer.ts      # NEW: Slider-specific rendering
│   │
│   ├── knobRenderer/              # DEPRECATE: Migrate to controlRenderer/
│   │   └── index.ts
│   │
│   └── indexedDB/
│       └── presetService.ts       # MODIFY: Add controlType discriminator
│
├── components/
│   ├── ControlDesigner/           # NEW: Unified modal and shared panels
│   │   ├── index.ts               # Re-exports
│   │   ├── ControlDesignerModal.tsx    # NEW: Unified modal shell with tabs
│   │   ├── ControlDesignerModal.module.css
│   │   ├── ControlPreview.tsx     # NEW: Unified preview component
│   │   ├── ControlPreview.module.css
│   │   ├── ControlTypeTabs.tsx    # NEW: Tab bar for control type switching
│   │   ├── ControlTypeTabs.module.css
│   │   ├── LightingPanel.tsx      # MIGRATE: From KnobDesigner (make generic)
│   │   ├── LightingPanel.module.css
│   │   ├── MaterialPanel.tsx      # MODIFY: Add target selector dropdown
│   │   ├── MaterialPanel.module.css
│   │   ├── OutputPanel.tsx        # MODIFY: Conditional rotation/position settings
│   │   ├── OutputPanel.module.css
│   │   ├── PresetSelector.tsx     # MODIFY: Filter by control type
│   │   └── PresetSelector.module.css
│   │
│   ├── KnobDesigner/              # KEEP: Knob-specific panels only
│   │   ├── index.ts               # Re-exports
│   │   ├── LayerPanel.tsx         # Knob layers (existing)
│   │   ├── LayerPanel.module.css
│   │   ├── IndicatorPanel.tsx     # Knob indicator (existing)
│   │   └── IndicatorPanel.module.css
│   │
│   └── SliderDesigner/            # NEW: Slider-specific panels
│       ├── index.ts               # Re-exports
│       ├── TrackPanel.tsx         # Track configuration
│       ├── TrackPanel.module.css
│       ├── HandlePanel.tsx        # Handle configuration
│       ├── HandlePanel.module.css
│       ├── ValueFillPanel.tsx     # Value fill configuration
│       └── ValueFillPanel.module.css
```

**Structure Decision**: Single SPA with feature-based organization. Control types are plugins that register themselves with the central registry. Shared components live in `ControlDesigner/`, type-specific panels in `KnobDesigner/` and `SliderDesigner/`.

## Complexity Tracking

No constitution violations requiring justification. Architecture uses established patterns (factory registry, plugin system) that are well-documented in TypeScript best practices.

---

## Phase 0: Research Summary

**See [research.md](./research.md) for detailed research findings.**

### Key Decisions (Summary)

| ID | Topic | Decision |
|----|-------|----------|
| R1 | Slider geometry | Use `RoundedBoxGeometry` addon from Three.js |
| R2 | Click-to-select | Use Three.js Raycaster with userData.componentId |
| R3 | Plugin pattern | Factory Registry with TypeScript type safety |
| R4 | Multi-type store | SolidJS createStore with designs indexed by control type |
| R5 | Frame generation | Linear position interpolation (0% to 100%) |

---

## Phase 1: Data Model

### Core Types (src/types/controlDesigner/base.ts)

```typescript
// Control type identifiers
export type ControlTypeId = 'knob' | 'slider';

// Control categories (determines frame generation logic)
export type ControlCategory = 'rotational' | 'linear' | 'binary' | 'multiState' | 'grid2D';

// Base design interface (all control types extend this)
export interface BaseControlDesign {
  id: string;
  name: string;
  controlType: ControlTypeId;
  lighting: LightingConfig;
  output: BaseOutputConfig;
  cameraView: CameraView;
}

// Shared lighting config (unchanged from knobDesigner)
export interface LightingConfig {
  azimuth: number;
  elevation: number;
  aoStrength: number;
}

// Base output config (shared fields)
export interface BaseOutputConfig {
  frameCount: number;
  frameWidth: number;
  frameHeight: number;
  layout: FilmstripLayout;
}

// Rotational output extends base (for knobs)
export interface RotationalOutputConfig extends BaseOutputConfig {
  sweepAngle: number;
  startAngle: number;
  endAngle: number;
  rotationOffset: number;
}

// Linear output (for sliders) - no additional fields needed
export interface LinearOutputConfig extends BaseOutputConfig {
  // Position calculated from 0-100% automatically
}

// Material target types
export type MaterialTargetKnob = { type: 'layer'; layerId: string };
export type MaterialTargetSlider = { type: 'component'; componentId: 'track' | 'handle' | 'fill' };
export type MaterialTarget = MaterialTargetKnob | MaterialTargetSlider;
```

### Slider Types (src/types/controlDesigner/slider.ts)

```typescript
export type SliderOrientation = 'horizontal' | 'vertical';
export type HandleShape = 'rectangle' | 'rounded' | 'circle' | 'faderCap';
export type ValueFillMode = 'none' | 'fromStart' | 'fromCenter' | 'segmented';

export interface SliderTrack {
  orientation: SliderOrientation;
  length: number;       // % of frame dimension (10-100)
  width: number;        // % of frame dimension (5-50)
  depth: number;        // Depth in world units (1-20)
  cornerRadius: number; // Corner radius (0-10)
  material: LayerMaterial;
}

export interface SliderHandle {
  shape: HandleShape;
  width: number;        // % of track width (50-150)
  height: number;       // % of track width (50-200)
  gripLines: number;    // Number of grip lines (0-5)
  material: LayerMaterial;
}

export interface SliderValueFill {
  mode: ValueFillMode;
  color: string;        // Hex color
  glowIntensity: number; // 0-100
}

export interface SliderDesign extends BaseControlDesign {
  controlType: 'slider';
  track: SliderTrack;
  handle: SliderHandle;
  valueFill: SliderValueFill;
  output: LinearOutputConfig;
}
```

### Preset Schema Update

```typescript
// Extend existing KnobPreset type
export interface ControlPreset<T extends BaseControlDesign = BaseControlDesign> {
  id: string;
  name: string;
  controlType: ControlTypeId; // NEW: Discriminator
  isBuiltIn: boolean;
  createdAt: string;
  updatedAt: string;
  design: T;
}

// IndexedDB migration: Add controlType index
// DB_VERSION bump from 3 to 4 (current version verified in domain/project/types.ts)
// Add index: presetStore.createIndex('controlType', 'controlType', { unique: false });
```

---

## Phase 1: API Contracts

### Plugin Registry Contract (contracts/plugin-registry.ts)

```typescript
// Panel definition for UI rendering
export interface PanelDefinition {
  id: string;
  label: string;
  component: Component<PanelProps>;
  icon?: Component;
}

// Panel props interface
export interface PanelProps<TDesign extends BaseControlDesign = BaseControlDesign> {
  design: TDesign;
  onUpdate: (updates: Partial<TDesign>) => void;
}

// MaterialPanel-specific props (extends PanelProps)
export interface MaterialPanelProps extends PanelProps {
  selectedTarget: string;                          // Currently selected component ID
  availableTargets: { id: string; label: string }[]; // Available components for selection
  onTargetChange: (targetId: string) => void;      // Dropdown selection change
  onComponentClick?: (componentId: string) => void; // Called when preview component clicked (for sync)
}

// Renderer interface for control types
export interface ControlRenderer<TDesign extends BaseControlDesign = BaseControlDesign> {
  initialize(canvas: HTMLCanvasElement): Promise<void>;
  updateScene(design: TDesign): void;
  setPosition(position: number): void; // 0-1 normalized position
  renderPreview(): void;
  generateFilmstrip(
    design: TDesign,
    onProgress: (progress: GenerationProgress) => void
  ): Promise<string>;
  dispose(): void;
  setSelectedComponent?(componentId: string | null): void; // For click selection
}

// Plugin registration
export interface ControlTypePlugin<TDesign extends BaseControlDesign = BaseControlDesign> {
  id: ControlTypeId;
  label: string;
  category: ControlCategory;
  icon: Component;

  // Factory methods
  createDefaultDesign(): TDesign;
  createRenderer(webglRenderer: WebGLRenderer): ControlRenderer<TDesign>;

  // Panel definitions
  geometryPanels: PanelDefinition[];  // Type-specific panels

  // Validation
  validateDesign(design: TDesign): ValidationResult;

  // Constraints
  constraints: Record<string, ConstraintRange>;
}

// Registry API
export const controlTypeRegistry: {
  register<T extends BaseControlDesign>(plugin: ControlTypePlugin<T>): void;
  get(id: ControlTypeId): ControlTypePlugin | undefined;
  getAll(): ControlTypePlugin[];
  isRegistered(id: ControlTypeId): boolean;
};
```

### Store Contract

```typescript
// Store state
export interface ControlDesignerStoreState {
  isOpen: boolean;
  activeControlType: ControlTypeId;
  designs: Record<ControlTypeId, BaseControlDesign | null>;
  targetBitmapName: string | null;
  targetProjectId: string | null;
  selectedPresetId: string | null;
  isModified: boolean;
  generationProgress: GenerationProgress | null;
  errorMessage: string | null;
  canUndo: boolean;
  canRedo: boolean;
  undoDescription: string | null;
  redoDescription: string | null;
  selectedMaterialTarget: MaterialTarget | null;
}

// Store actions
export interface ControlDesignerActions {
  // Modal lifecycle
  openDesigner(bitmapName: string, projectId: string, controlType?: ControlTypeId): void;
  closeDesigner(): void;

  // Tab switching
  switchControlType(controlType: ControlTypeId): void;

  // Design updates (dispatched to active plugin)
  updateDesign(updates: Partial<BaseControlDesign>): void;
  updateLighting(lighting: Partial<LightingConfig>): void;
  updateOutput(output: Partial<BaseOutputConfig>): void;

  // Material target selection
  setMaterialTarget(target: MaterialTarget | null): void;
  updateMaterial(material: Partial<LayerMaterial>): void;

  // Presets
  loadPreset(presetId: string): Promise<void>;
  savePreset(name: string): Promise<string>;
  deletePreset(presetId: string): Promise<void>;

  // History
  undo(): void;
  redo(): void;

  // Generation
  generateFilmstrip(): Promise<void>;
  cancelGeneration(): void;
}
```

---

## Migration Strategy

### Phase A: Preparation (non-breaking)

1. Create new type files in `src/types/controlDesigner/`
2. Create new domain files in `src/domain/controlDesigner/`
3. Create new components in `src/components/ControlDesigner/`
4. All new code - existing code unchanged

### Phase B: Knob Plugin Extraction (backward compatible)

1. Create `src/domain/knobDesigner/plugin.ts` that wraps existing functionality
2. Register knob plugin with registry
3. Create `controlDesignerStore.ts` that delegates to existing `knobDesignerStore` for knob type
4. Existing knob workflow continues to work

### Phase C: Slider Plugin Implementation (additive)

1. Create `src/domain/sliderDesigner/` with slider-specific logic
2. Create `src/components/SliderDesigner/` panels
3. Create `src/services/controlRenderer/sliderRenderer.ts`
4. Register slider plugin

### Phase D: Unified Modal (switchover)

1. Replace `KnobDesignerModal` with `ControlDesignerModal`
2. Update context menu to use new modal
3. Deprecate old store (keep for compatibility)
4. Update preset service with controlType queries

### Phase E: Cleanup (breaking, optional)

1. Remove deprecated `KnobDesignerModal`
2. Remove deprecated `knobDesignerStore`
3. Consolidate duplicate code

---

## File Change Summary

### New Files (35 files)

| File | Purpose |
|------|---------|
| `src/types/controlDesigner/index.ts` | Re-exports |
| `src/types/controlDesigner/base.ts` | Base types |
| `src/types/controlDesigner/knob.ts` | Knob types (migrated) |
| `src/types/controlDesigner/slider.ts` | Slider types |
| `src/domain/controlDesigner/index.ts` | Re-exports |
| `src/domain/controlDesigner/registry.ts` | Plugin registry |
| `src/domain/controlDesigner/materials.ts` | Shared materials |
| `src/domain/controlDesigner/scene.ts` | Shared scene setup |
| `src/domain/controlDesigner/filmstrip.ts` | Shared filmstrip utils |
| `src/domain/controlDesigner/validation.ts` | Shared validation |
| `src/domain/controlDesigner/defaults.ts` | Default value factory |
| `src/domain/knobDesigner/plugin.ts` | Knob plugin definition |
| `src/domain/sliderDesigner/index.ts` | Re-exports |
| `src/domain/sliderDesigner/plugin.ts` | Slider plugin definition |
| `src/domain/sliderDesigner/geometry.ts` | Slider geometry |
| `src/domain/sliderDesigner/defaults.ts` | Slider defaults |
| `src/domain/sliderDesigner/validation.ts` | Slider validation |
| `src/stores/controlDesignerStore.ts` | Unified store |
| `src/services/controlRenderer/index.ts` | Service exports |
| `src/services/controlRenderer/base.ts` | Base renderer |
| `src/services/controlRenderer/knobRenderer.ts` | Knob renderer (migrated) |
| `src/services/controlRenderer/sliderRenderer.ts` | Slider renderer |
| `src/components/ControlDesigner/index.ts` | Re-exports |
| `src/components/ControlDesigner/ControlDesignerModal.tsx` | Unified modal |
| `src/components/ControlDesigner/ControlDesignerModal.module.css` | Modal styles |
| `src/components/ControlDesigner/ControlPreview.tsx` | Preview component |
| `src/components/ControlDesigner/ControlPreview.module.css` | Preview styles |
| `src/components/ControlDesigner/ControlTypeTabs.tsx` | Tab bar |
| `src/components/ControlDesigner/ControlTypeTabs.module.css` | Tab styles |
| `src/components/SliderDesigner/index.ts` | Re-exports |
| `src/components/SliderDesigner/TrackPanel.tsx` | Track config |
| `src/components/SliderDesigner/TrackPanel.module.css` | Track styles |
| `src/components/SliderDesigner/HandlePanel.tsx` | Handle config |
| `src/components/SliderDesigner/HandlePanel.module.css` | Handle styles |
| `src/components/SliderDesigner/ValueFillPanel.tsx` | Fill config |

### Modified Files (8 files)

| File | Changes |
|------|---------|
| `src/services/indexedDB/database.ts` | Bump DB_VERSION to 4, add controlType index |
| `src/services/indexedDB/presetService.ts` | Add controlType filter queries |
| `src/components/KnobDesigner/LightingPanel.tsx` | Accept props instead of reading store directly |
| `src/components/KnobDesigner/MaterialPanel.tsx` | Add target selector dropdown |
| `src/components/KnobDesigner/OutputPanel.tsx` | Conditional rotation settings |
| `src/components/KnobDesigner/PresetSelector.tsx` | Add controlType filter prop |
| `src/domain/project/types.ts` | Add INDEXES.PRESETS_BY_CONTROL_TYPE |
| Context menu component (bitmap right-click) | Add "Design Slider" option |

### Deprecated Files (2 files)

| File | Replacement |
|------|-------------|
| `src/stores/knobDesignerStore.ts` | `src/stores/controlDesignerStore.ts` |
| `src/services/knobRenderer/index.ts` | `src/services/controlRenderer/` |

---

## Testing Approach

### Unit Tests

1. **Registry tests**: Plugin registration, lookup, type safety
2. **Type guard tests**: Control type discrimination
3. **Geometry tests**: Slider track/handle geometry generation
4. **Filmstrip tests**: Linear position calculation
5. **Validation tests**: Slider-specific constraints

### Integration Tests

1. **Store tests**: Tab switching, design auto-save, history
2. **Renderer tests**: Slider scene updates, filmstrip generation
3. **Preset tests**: Control type filtering, migration

### Component Tests

1. **ControlDesignerModal**: Tab rendering, panel switching
2. **ControlTypeTabs**: Tab selection, active state
3. **TrackPanel/HandlePanel/ValueFillPanel**: Input binding, validation
4. **MaterialPanel**: Target selector synchronization
5. **PresetSelector**: Filtered preset list

### E2E Scenarios (manual)

1. Design slider, generate filmstrip
2. Switch between knob and slider tabs
3. Save/load slider presets
4. Click component in preview to select material target

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Breaking existing knob functionality | Phase B ensures backward compatibility before switchover |
| IndexedDB migration errors | DB version bump with graceful migration |
| WebGL RoundedBoxGeometry not available | RoundedBoxGeometry is in Three.js addons (not external) |
| Performance degradation | Shared renderer infrastructure, same generation pipeline |
| Complex store state | Discriminated unions with TypeScript narrowing |

---

## Dependencies

**No new external dependencies required.**

All functionality uses existing packages:
- Three.js (RoundedBoxGeometry is an addon, not external package)
- SolidJS stores and signals
- IndexedDB (native browser API)

**Existing dependencies confirmed sufficient:**
- three (RoundedBoxGeometry from three/addons)
- solid-js (createStore, createSignal)
- @solidjs/testing-library (component tests)
- vitest (unit tests)

---

## Success Metrics Verification Plan

| Metric | Verification Method |
|--------|---------------------|
| SC-001: Slider design <5 min | Manual timing test |
| SC-002: Knob functionality preserved | Run existing knob tests, manual verification |
| SC-003: Tab switching <200ms | Performance.now() measurement in integration test |
| SC-004: 70% panel code reuse | LOC comparison before/after |
| SC-005: <500 LOC per new type | LOC count of sliderDesigner/ |
| SC-006: Same generation performance | Benchmark filmstrip generation time |
| SC-007: Preset workflow identical | Manual test of save/load/rename/delete |
