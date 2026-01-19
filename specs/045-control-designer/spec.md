# Feature Specification: Control Designer Plugin Architecture

**Feature Branch**: `045-control-designer`
**Created**: 2026-01-19
**Status**: Draft
**Input**: User description: "Control Designer - Extensible plugin architecture for 3D control designers (knob, slider, on/off, switches, XY pad) with shared modal, lighting, materials, and presets. Starting with slider designer as first new control type."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Design a Slider Control (Priority: P1)

As an audio plugin developer, I want to design a slider control with customizable track, handle, and value fill so that I can generate filmstrip assets for my plugin's fader controls.

**Why this priority**: This is the primary deliverable - adding slider support is the core new functionality that validates the plugin architecture while providing immediate user value.

**Independent Test**: Can be fully tested by opening a slider bitmap in the designer, configuring track/handle/fill settings, and generating a filmstrip. Delivers a complete slider asset workflow.

**Acceptance Scenarios**:

1. **Given** I have a bitmap in my project, **When** I right-click and select "Design Slider", **Then** the Control Designer modal opens with Slider mode active and type-specific panels visible (Track, Handle, Fill).

2. **Given** I am in Slider Designer mode, **When** I adjust the track orientation, handle shape, and value fill mode, **Then** the 3D preview updates in real-time showing my slider design.

3. **Given** I have configured my slider design, **When** I click "Generate Filmstrip", **Then** the system generates frames showing the slider handle moving from minimum to maximum position along the track.

4. **Given** I am designing a slider, **When** I adjust material settings, **Then** I can target either the track, handle, or fill component by clicking on it in the 3D preview OR by using the dropdown selector in the MaterialPanel header; both methods stay synchronized.

---

### User Story 2 - Switch Between Control Types (Priority: P1)

As an audio plugin developer, I want to switch between different control type designers (knob, slider) within the same modal so that I can design various controls without navigating between different tools.

**Why this priority**: Essential for the plugin architecture - validates that the extensible design works and provides a unified workflow.

**Independent Test**: Can be tested by opening the designer, switching between Knob and Slider tabs, and verifying each loads the appropriate configuration panels.

**Acceptance Scenarios**:

1. **Given** the Control Designer modal is open, **When** I click on different control type tabs (Knob, Slider), **Then** the modal content switches to show the appropriate type-specific panels while preserving shared panels.

2. **Given** I am designing a knob, **When** I switch to Slider tab, **Then** the knob design is auto-saved to temporary state and I can return to it by switching back to the Knob tab.

3. **Given** I switch control types, **When** I observe the panel layout, **Then** shared panels (Lighting, Output) remain consistent while type-specific panels change.

---

### User Story 3 - Use Existing Knob Designer via Plugin (Priority: P2)

As an audio plugin developer, I want the existing knob designer functionality preserved and accessible through the new unified Control Designer interface so that my current workflow is not disrupted.

**Why this priority**: Critical for backward compatibility - existing users must not lose functionality.

**Independent Test**: Can be tested by opening a knob bitmap, designing a knob with layers/indicator, and generating a filmstrip. All existing features must work identically.

**Acceptance Scenarios**:

1. **Given** I right-click a bitmap and select "Design Knob", **When** the Control Designer opens, **Then** I see the same Layers, Indicator, Lighting, and Output panels as before.

2. **Given** I am designing a knob, **When** I use any existing feature (add layer, adjust geometry, configure indicator), **Then** it works exactly as it did before the refactor.

3. **Given** I have existing knob presets saved, **When** I open the Knob designer, **Then** all my presets are available and load correctly.

---

### User Story 4 - Apply Materials to Slider Components (Priority: P2)

As an audio plugin developer, I want to apply different materials to the track, handle, and fill of my slider so that I can create visually distinct and realistic-looking controls.

**Why this priority**: Material system reuse is a key architectural goal and provides significant visual customization.

**Independent Test**: Can be tested by selecting each slider component and applying different material types (solid, metallic, brushed) and verifying the preview updates correctly.

**Acceptance Scenarios**:

1. **Given** I am designing a slider, **When** I select the Track component in the material panel, **Then** I can adjust material type, color, shininess, and reflectivity for the track only.

2. **Given** I have applied materials, **When** I switch between Track and Handle targets, **Then** each component shows its independent material settings.

3. **Given** I apply a brushed metal material to the handle, **When** I view the preview, **Then** the handle shows the brush pattern while other components retain their materials.

---

### User Story 5 - Save and Load Slider Presets (Priority: P3)

As an audio plugin developer, I want to save my slider designs as presets so that I can reuse them across different bitmaps and projects.

**Why this priority**: Preset system reuse improves workflow efficiency but is not required for basic functionality.

**Independent Test**: Can be tested by designing a slider, saving it as a preset, then loading that preset in a new bitmap context.

**Acceptance Scenarios**:

1. **Given** I have designed a slider, **When** I click "Save Preset" and enter a name, **Then** my slider design is saved to the presets list.

2. **Given** I have saved slider presets, **When** I open the Slider designer for a new bitmap, **Then** I can select and load my saved presets.

3. **Given** I have both knob and slider presets, **When** I am in Slider mode, **Then** I only see slider presets (not knob presets).

---

### User Story 6 - Configure Slider Output Settings (Priority: P3)

As an audio plugin developer, I want to configure how many frames my slider filmstrip contains and in what layout so that I can balance smoothness with file size.

**Why this priority**: Output configuration reuse validates the shared panel architecture.

**Independent Test**: Can be tested by adjusting frame count, dimensions, and layout settings and verifying the output summary updates correctly.

**Acceptance Scenarios**:

1. **Given** I am designing a slider, **When** I adjust the frame count, **Then** the output summary shows the updated filmstrip dimensions and estimated file size.

2. **Given** I select horizontal layout, **When** I generate the filmstrip, **Then** frames are arranged in a single horizontal row.

3. **Given** I set specific frame dimensions, **When** I generate the filmstrip, **Then** each frame matches my specified width and height.

---

### Edge Cases

- **Narrow slider dimensions**: When the user has a very narrow slider (e.g., 10px track width), the system displays a non-blocking warning in the output panel but allows generation to proceed. Users are informed of potential rendering issues without being blocked from experimentation.
- **Slider orientation change mid-design**: The handle position recalculates relative to the new track orientation.
- **Cross-type preset loading**: The preset selector only shows compatible presets for the current control type. A user in Slider mode cannot see or load knob presets.
- **Value fill with rounded corners**: The fill follows the track's inner contour with the same corner radius (inset fill), creating visual cohesion where the fill appears as part of the track's internal space.
- **Generation cancellation**: When generation is cancelled mid-process, all partial renders are discarded and the system returns to the design state as if generation never started. No partial filmstrips are saved.

## Requirements *(mandatory)*

### Functional Requirements

#### Architecture & Plugin System

- **FR-001**: System MUST provide a plugin registration mechanism that allows control types to register themselves with type identifier, label, category, and geometry panels.
- **FR-002**: System MUST support control type categories: rotational (knob), linear (slider), binary (on/off), multiState (switches), and grid2D (XY pad) to determine frame generation logic.
- **FR-003**: System MUST allow each control type plugin to define its own geometry panels while sharing lighting, material, and output panels.
- **FR-004**: System MUST maintain separate design state per control type, auto-saving the current design to temporary state when switching tabs and restoring it when returning to that tab. Auto-save triggers immediately on tab switch (no debounce), stores to `controlDesignerStore.designs[controlType]` field in memory, and is discarded when the modal closes without explicit preset save.

#### Slider Control Type

- **FR-005**: Slider design MUST include track configuration: orientation (horizontal/vertical), length, width, depth, corner radius, and material.
- **FR-006**: Slider design MUST include handle configuration: shape (rectangle, rounded, circle, fader cap), width, height, grip lines, and material.
- **FR-007**: Slider design MUST include optional value fill configuration: mode (none, fromStart, fromCenter, segmented), color, and glow intensity.
- **FR-008**: Slider filmstrip generation MUST render frames showing handle positions from 0% to 100% of track travel. Value fill renders statically in each frame at the position corresponding to that frame's handle position (fill length matches handle position percentage).

#### Shared Components

- **FR-009**: LightingPanel MUST be reusable across all control types with azimuth, elevation, and ambient occlusion controls.
- **FR-010**: MaterialPanel MUST accept a target parameter to apply materials to specific control components (layers for knob, track/handle/fill for slider). Users can select the target by clicking components in the 3D preview OR using a dropdown selector in the MaterialPanel header; both methods stay synchronized. Panel receives: `selectedTarget: string`, `availableTargets: {id, label}[]`, `onTargetChange: (id) => void`, `onComponentClick?: (id) => void` (for preview-to-panel sync). When target changes, panel loads that component's material settings into the form fields.
- **FR-011**: OutputPanel MUST adapt frame count logic based on control type category (sweep angle for rotational, position percentage for linear). Panel receives `controlCategory: ControlCategory` prop. When category is 'rotational', show sweep angle/start/end angle controls. When category is 'linear', hide rotation controls and show only frame count/dimensions. Conditional rendering via `<Show when={category === 'rotational'}>` blocks.
- **FR-012**: System MUST provide a shared modal shell with control type tabs, preview area, and action buttons.

#### Preset System

- **FR-013**: Presets MUST be stored with a control type discriminator so knob presets are distinct from slider presets.
- **FR-014**: Preset selector MUST filter presets by the current control type.
- **FR-015**: Existing knob presets MUST remain accessible after the refactor.

#### Preview & Generation

- **FR-016**: 3D preview MUST update in real-time as users adjust design parameters. Updates target 60fps via requestAnimationFrame. Renderer.updateScene() called with latest design state on each change. Heavy geometry rebuilds (adding/removing components) debounced to 100ms to maintain smooth interaction.
- **FR-017**: Each control type MUST provide its own Three.js renderer implementation.
- **FR-018**: Generation progress MUST show stage and frame progress during filmstrip creation.

#### Knob Backward Compatibility

- **FR-019**: All existing knob designer functionality (layers, geometry, indicator, lighting, output) MUST continue working after refactor.
- **FR-020**: Existing knob presets stored in IndexedDB MUST be migrated to include the control type discriminator.

### Key Entities

- **ControlTypePlugin**: Defines a control type with identifier, category, default design factory, geometry panels, and renderer factory. Registered at application startup.

- **ControlDesign (Base)**: Common design properties shared across all control types including lighting configuration, camera view, and name.

- **KnobDesign**: Extends ControlDesign with layers array, indicator configuration, and rotational output settings (sweep angle, start/end angles).

- **SliderDesign**: Extends ControlDesign with track settings, handle settings, value fill settings, and linear output settings.

- **ControlPreset**: Stored preset with control type discriminator, design data, creation timestamp, and user-provided name.

- **MaterialSettings**: Shared material configuration (type, color, shininess, reflectivity, brush settings) applicable to any control component.

- **LightingSettings**: Scene-wide lighting configuration (azimuth, elevation, AO strength) shared across all control types.

- **OutputConfig (Base)**: Common output settings (frame count, frame dimensions, layout) with type-specific extensions.

## Existing Functionality to Reuse

The following existing code can be reused with minimal changes:

1. **LightingPanel** (`src/components/KnobDesigner/LightingPanel.tsx`): Currently reads from `knobDesignerStore`. Should be refactored to accept lighting state and callbacks via props.

2. **MaterialPanel** (`src/components/KnobDesigner/MaterialPanel.tsx`): Currently accepts a `KnobLayer`. Should be generalized to accept material settings and a target identifier.

3. **OutputPanel** (`src/components/KnobDesigner/OutputPanel.tsx`): Currently displays rotational-specific settings. The base functionality (frame count, dimensions, layout) can be shared; rotation settings should be conditional.

4. **PresetSelector** (`src/components/KnobDesigner/PresetSelector.tsx`): Can be reused with a control type filter parameter.

5. **IndexedDB preset service** (`src/services/indexedDB/presetService.ts`): Can be extended to query by control type.

6. **Validation utilities** (`src/domain/knobDesigner/validation.ts`): Material and lighting constraints can be shared; geometry constraints are type-specific.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can design and generate a slider filmstrip in under 5 minutes from opening the designer to having the asset saved.

- **SC-002**: All existing knob designer features work identically after the refactor with no regressions in functionality or performance.

- **SC-003**: Switching between Knob and Slider tabs completes in under 200ms with no visible flicker or layout shift.

- **SC-004**: At least 70% of existing panel code (LightingPanel, MaterialPanel, OutputPanel) is reused for the slider implementation.

- **SC-005**: The plugin architecture supports adding a new control type with fewer than 500 lines of type-specific code (excluding tests).

- **SC-006**: Slider filmstrip generation completes at the same performance level as knob generation (similar frame render time).

- **SC-007**: Users can save, load, rename, and delete slider presets with the same workflow as knob presets.

---

## Assumptions

1. **Slider orientation**: Horizontal and vertical sliders will share the same underlying geometry with a rotation transform, rather than being modeled as separate shapes.

2. **Material application**: Each slider component (track, handle) has independent material settings. Value fill uses a simplified material (color + glow only).

3. **Frame count logic**: Linear controls use position percentage (0-100%) divided evenly across frame count. A 64-frame slider shows handle at positions 0%, ~1.6%, ~3.2%, ..., 100%.

4. **Preset migration**: Existing knob presets will be migrated by adding `controlType: 'knob'` field on first access after the update.

5. **3D rendering**: Slider renderer will use Three.js like the knob renderer, with appropriate geometry (extruded rectangles, cylinders).

6. **Control type tabs**: The modal will have tabs at the top showing available control types. The active tab determines which panels are visible.

7. **Design state preservation**: Each control type has its own design state signal. When switching tabs, the current design is auto-saved to temporary state and restored when returning to that tab. Closing the modal discards all temporary states.

---

## Clarifications (from user Q&A)

The following items were clarified during specification review:

1. **Tab switching with unsaved changes**: When switching control type tabs, the current design is auto-saved to temporary state and restored when returning to that tab. This preserves work-in-progress without requiring explicit save dialogs.

2. **Material target selection**: Users can select which slider component (track, handle, fill) to apply materials to using EITHER method: (a) clicking the component in the 3D preview, or (b) using a dropdown selector in the MaterialPanel header. Both methods stay synchronized.

3. **Narrow dimension handling**: When slider dimensions are very narrow (e.g., 10px track width), the system displays a non-blocking warning in the output panel but allows generation to proceed. This respects user intent while providing guidance.

4. **Generation cancellation cleanup**: When filmstrip generation is cancelled mid-process, all partial renders are discarded and the system returns to the design state as if generation never started. No partial or incomplete filmstrips are saved.

5. **Value fill with rounded corners**: The value fill follows the track's inner contour with the same corner radius (inset fill), creating visual cohesion where the fill appears as part of the track's internal space rather than overlapping or ignoring the track shape.

---

## Implementation Completion Checklist

### Requirement Compliance Table (MANDATORY)

| Requirement | Status     | Evidence                          |
| ----------- | ---------- | --------------------------------- |
| FR-001      | ⬜ PENDING | [Test or file that verifies this] |
| FR-002      | ⬜ PENDING | [Test or file that verifies this] |
| FR-003      | ⬜ PENDING | [Test or file that verifies this] |
| FR-004      | ⬜ PENDING | [Test or file that verifies this] |
| FR-005      | ⬜ PENDING | [Test or file that verifies this] |
| FR-006      | ⬜ PENDING | [Test or file that verifies this] |
| FR-007      | ⬜ PENDING | [Test or file that verifies this] |
| FR-008      | ⬜ PENDING | [Test or file that verifies this] |
| FR-009      | ⬜ PENDING | [Test or file that verifies this] |
| FR-010      | ⬜ PENDING | [Test or file that verifies this] |
| FR-011      | ⬜ PENDING | [Test or file that verifies this] |
| FR-012      | ⬜ PENDING | [Test or file that verifies this] |
| FR-013      | ⬜ PENDING | [Test or file that verifies this] |
| FR-014      | ⬜ PENDING | [Test or file that verifies this] |
| FR-015      | ⬜ PENDING | [Test or file that verifies this] |
| FR-016      | ⬜ PENDING | [Test or file that verifies this] |
| FR-017      | ⬜ PENDING | [Test or file that verifies this] |
| FR-018      | ⬜ PENDING | [Test or file that verifies this] |
| FR-019      | ⬜ PENDING | [Test or file that verifies this] |
| FR-020      | ⬜ PENDING | [Test or file that verifies this] |
| SC-001      | ⬜ PENDING | [Measurement or test result]      |
| SC-002      | ⬜ PENDING | [Measurement or test result]      |
| SC-003      | ⬜ PENDING | [Measurement or test result]      |
| SC-004      | ⬜ PENDING | [Measurement or test result]      |
| SC-005      | ⬜ PENDING | [Measurement or test result]      |
| SC-006      | ⬜ PENDING | [Measurement or test result]      |
| SC-007      | ⬜ PENDING | [Measurement or test result]      |

**CRITICAL**: Any NOT MET requires explicit user approval before claiming completion.

### Final Verification

- [ ] **Compliance Table Complete**: All FR-xxx and SC-xxx requirements verified with MET status
- [ ] **Tests at Spec Thresholds**: No test thresholds were relaxed to pass
- [ ] **No Placeholders**: No TODOs or "needs proper design" markers in deliverables
- [ ] **Quality Gate - CSS**: Run `npm run lint:css` - MUST pass with zero errors/warnings
- [ ] **Quality Gate - Code**: Run `npm run check` - MUST pass with zero errors/warnings
- [ ] **Quality Gate - Types**: Run `npm run typecheck` - MUST pass with zero errors/warnings
- [ ] **Git Status Check**: Run `git status` to verify all changes are committed
- [ ] **Commit Any Remaining Work**: If uncommitted changes exist, stage and commit with descriptive message
- [ ] **Confirm Clean Working Tree**: Verify `git status` shows "nothing to commit, working tree clean"
- [ ] **Update Documentation**: Ensure CLAUDE.md or relevant docs are updated with new utilities/patterns

**CRITICAL**: The feature is NOT complete until:

1. All quality gates pass (lint:css, check, typecheck) with zero errors/warnings
2. All work is committed to the feature branch
3. The compliance table shows all requirements MET
