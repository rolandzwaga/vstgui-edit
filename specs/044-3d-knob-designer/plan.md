# Implementation Plan: 3D Knob Designer

**Branch**: `044-3d-knob-designer` | **Date**: 2026-01-18 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/044-3d-knob-designer/spec.md`

## Summary

Implement a WebGL-based modal tool for designing symmetrical round knobs and generating filmstrip bitmaps for CAnimKnob. The feature uses Three.js for 3D rendering, supports up to 3 concentric layers with configurable materials (including procedural brushed metal), adjustable lighting, and filmstrip output generation. Presets are stored in IndexedDB with database-scoped isolation.

**Key Technical Decisions from Research**:
1. **Filmstrip Generation**: Multi-pass rendering with single WebGLRenderTarget (NOT instancing - see research.md for rationale)
2. **Brushed Metal**: Custom GLSL via `MeshStandardMaterial.onBeforeCompile` injection
3. **Ambient Occlusion**: Built-in Three.js SAO for generation only (performance balance)
4. **Camera**: OrthographicCamera for consistent knob sizing
5. **New Dependency**: Three.js (requires user approval per constitution XI)

## Technical Context

**Language/Version**: TypeScript 5.9.3 (strict mode)
**Primary Dependencies**:
- Existing: SolidJS 1.9.10, Vite 7.3.1, AJV 8.17.1, fflate 0.8.2
- New (REQUIRES APPROVAL): Three.js r160+ for WebGL rendering

**Storage**: IndexedDB (extend existing infrastructure with `presets` store, bump DB_VERSION to 2)
**Testing**: Vitest 4.0.17 with @solidjs/testing-library 0.8.10
**Testing Guide**: Use `/testing-guide` skill - MUST be consulted for all test tasks
**SolidJS Guide**: Use `/solidjs-guide` skill - MUST be consulted for component/store implementation
**Target Platform**: Modern browsers with WebGL 2.0 support (Chrome, Firefox, Edge, Safari)
**Project Type**: SolidJS web application (existing structure)

**Performance Goals**:
- 3D preview updates: <100ms after parameter changes (SC-002)
- Filmstrip generation: <10 seconds for 64 frames at 100x100px (SC-003)
- Preview rendering: 30+ FPS on mid-range 2020+ devices

**Constraints**:
- WebGL 2.0 required (no WebGL 1.0 fallback per assumption #1)
- Maximum 3 layers per knob design
- Maximum 100 custom presets
- Frame count: 8-256 frames
- Frame dimensions: 16-512 pixels

**Scale/Scope**:
- Single modal component with multiple panels
- ~15-20 new source files
- ~500-700 lines of Three.js rendering code
- ~300-400 lines of GLSL shader code

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Test-First Development | WILL COMPLY | All domain logic and components will have tests first |
| II. Technology Stack | REQUIRES APPROVAL | Three.js is a new dependency (FR-045 mandates it) |
| III. Security | COMPLIANT | No sensitive data; input validation enforced |
| IV. Code Quality | WILL COMPLY | Biome, Stylelint, TypeScript strict |
| V. GUI Editor Domain | COMPLIANT | Undo/redo, real-time feedback, data integrity |
| VI. Testing Standards | WILL COMPLY | Unit + component tests, 80% coverage target |
| XI. Dependency Management | REQUIRES APPROVAL | Three.js dependency requires explicit approval |
| XII. Framework-Specific | COMPLIANT | SolidJS patterns only |
| XV. Styling Architecture | WILL COMPLY | CSS Modules with design tokens |
| XVIII. Zero Failing Tests | WILL COMPLY | All tests must pass |
| XIX. Domain Knowledge | COMPLIANT | Integrates with existing uidesc/bitmap handling |
| XXI. Static Imports Only | WILL COMPLY | No dynamic imports |
| XXII. Honest Completion | WILL COMPLY | FR-033 revised based on research findings |
| XXIII. Quality Gates | WILL COMPLY | lint:css, check, typecheck must pass |

### Dependency Approval Required

**Package**: `three` (npm)
**Purpose**: WebGL 3D rendering, scene graph, materials, lighting (specified in FR-045)
**Size**: ~150KB minified+gzipped
**Justification**: Industry-standard library explicitly required by spec. No viable alternative for WebGL abstraction at this complexity level.

**ACTION REQUIRED**: User must approve Three.js installation before implementation begins.

### FR-033 Revision Note

The original FR-033 specified "single-pass multi-viewport rendering with WebGL instancing." Research (see research.md section 1) determined this approach is **technically incorrect** for filmstrip generation because:
- Instancing renders multiple copies with different transforms in the **same frame**
- Filmstrip requires different camera angles/rotations as **separate frames**

**Revised approach**: Multi-pass rendering to a single large WebGLRenderTarget using viewport/scissor tiling. This is the standard industry approach for sprite sheet generation and meets performance targets.

## Project Structure

### Documentation (this feature)

```text
specs/044-3d-knob-designer/
├── plan.md              # This file
├── research.md          # Phase 0 output (complete)
├── data-model.md        # Phase 1 output (complete)
├── quickstart.md        # Phase 1 output (complete)
├── contracts/           # Phase 1 output (complete)
│   ├── store-api.ts
│   ├── preset-service-api.ts
│   └── renderer-api.ts
└── tasks.md             # Phase 2 output (to be generated)
```

### Source Code (repository root)

```text
src/
├── components/
│   └── KnobDesigner/                 # NEW - Modal and panels
│       ├── KnobDesignerModal.tsx
│       ├── KnobDesignerModal.module.css
│       ├── KnobPreview.tsx           # Three.js canvas wrapper
│       ├── KnobPreview.module.css
│       ├── LayerPanel.tsx
│       ├── LayerPanel.module.css
│       ├── LayerItem.tsx
│       ├── LayerItem.module.css
│       ├── MaterialPanel.tsx
│       ├── MaterialPanel.module.css
│       ├── IndicatorPanel.tsx
│       ├── IndicatorPanel.module.css
│       ├── LightingPanel.tsx
│       ├── LightingPanel.module.css
│       ├── OutputPanel.tsx
│       ├── OutputPanel.module.css
│       ├── PresetSelector.tsx
│       ├── PresetSelector.module.css
│       ├── index.ts
│       └── __tests__/
│           ├── KnobDesignerModal.spec.tsx
│           ├── LayerPanel.spec.tsx
│           ├── MaterialPanel.spec.tsx
│           ├── IndicatorPanel.spec.tsx
│           ├── LightingPanel.spec.tsx
│           ├── OutputPanel.spec.tsx
│           └── PresetSelector.spec.tsx
│
├── domain/
│   └── knobDesigner/                 # NEW - Domain logic
│       ├── defaults.ts               # Default values, built-in presets
│       ├── validation.ts             # Input validation
│       ├── geometry.ts               # LatheGeometry calculations
│       ├── materials.ts              # Material factory (incl. brushed metal)
│       ├── scene.ts                  # Three.js scene setup
│       ├── filmstrip.ts              # Filmstrip generation
│       ├── historyOperations.ts      # Undo/redo operations
│       ├── index.ts
│       └── __tests__/
│           ├── defaults.spec.ts
│           ├── validation.spec.ts
│           ├── geometry.spec.ts
│           ├── materials.spec.ts
│           ├── scene.spec.ts
│           ├── filmstrip.spec.ts
│           └── historyOperations.spec.ts
│
├── services/
│   └── indexedDB/
│       ├── database.ts               # MODIFY - Add presets store
│       └── presetService.ts          # NEW - Preset CRUD
│
├── stores/
│   └── knobDesignerStore.ts          # NEW - Modal state
│
├── types/
│   └── knobDesigner.ts               # NEW - Type definitions
│
└── components/BitmapsPanel/
    └── BitmapItem.tsx                # MODIFY - Add "Design Knob" button
```

**Structure Decision**: Follows existing project patterns with:
- Components in `src/components/KnobDesigner/`
- Domain logic in `src/domain/knobDesigner/`
- Types in `src/types/knobDesigner.ts`
- Store in `src/stores/knobDesignerStore.ts`
- IndexedDB service in `src/services/indexedDB/presetService.ts`

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| New dependency (Three.js) | Required by FR-045 for WebGL rendering | No simpler alternative exists for 3D scene graph, materials, lighting. Canvas 2D cannot achieve required visual quality. |
| Custom GLSL shader | FR-017 requires procedural brushed metal texture | Pre-baked textures would not be parametric; CSS gradients cannot achieve metal grain effect |
| IndexedDB schema change | FR-039 requires preset storage | localStorage insufficient for structured preset data with unique name constraints |

## Implementation Phases

### Phase 1: Foundation (Types, Store, IndexedDB)
- Type definitions
- Knob designer store
- IndexedDB schema migration
- Preset service
- Built-in preset templates

### Phase 2: Three.js Rendering Core
- WebGL renderer setup
- Scene, camera, lighting
- LatheGeometry for layers
- Basic material factory
- Preview canvas component

### Phase 3: Brushed Metal Shader
- Custom GLSL noise functions
- onBeforeCompile injection
- Radial and linear brush directions
- Material parameter binding

### Phase 4: UI Panels
- Modal container
- Layer panel with drag reorder
- Material panel with ColorPicker integration
- Indicator panel
- Lighting panel
- Output panel
- Preset selector

### Phase 5: Filmstrip Generation
- Multi-pass render target tiling
- Pixel extraction and PNG encoding
- Progress reporting
- Canvas export to bitmap service

### Phase 6: Integration
- BitmapItem "Design Knob" button
- Modal undo/redo
- Keyboard shortcuts (Ctrl+Z/Y, Escape)
- Error handling and edge cases

### Phase 7: Polish and Testing
- Performance optimization
- Accessibility review
- Test coverage completion
- Quality gates

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| WebGL not available | Detect early, show clear error message (FR-042) |
| IndexedDB unavailable | Fall back to session-only mode (FR-043) |
| Three.js bundle size | Tree-shake unused modules; lazy load only when modal opens |
| Shader compilation failures | Test on multiple browsers; provide fallback materials |
| Memory leaks | Strict dispose() calls on modal close; monitor with DevTools |

## Success Criteria Mapping

| SC | Target | Verification Method |
|----|--------|---------------------|
| SC-001 | First-use under 5 min | Manual testing with new users |
| SC-002 | Preview update <100ms | Performance profiling |
| SC-003 | Generation <10s (64 frames, 100px) | Automated performance test |
| SC-004 | 5 templates render correctly | Unit tests for each template |
| SC-005 | Presets persist across sessions | Integration test with IndexedDB |
| SC-006 | 50 undo operations | Unit test on history store |
| SC-007 | Filmstrips display in CAnimKnob | Manual verification in canvas |
| SC-008 | 95% input validation coverage | Unit tests for all validators |

---

## References

- [research.md](research.md) - Detailed technical research findings
- [data-model.md](data-model.md) - Entity definitions and constraints
- [quickstart.md](quickstart.md) - Implementation patterns and code examples
- [contracts/](contracts/) - API contracts for stores and services
