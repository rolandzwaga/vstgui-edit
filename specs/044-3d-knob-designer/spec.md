# Feature Specification: 3D Knob Designer

**Feature Branch**: `044-3d-knob-designer`
**Created**: 2026-01-18
**Status**: Draft
**Input**: User description: "3D Knob Designer - A WebGL-based modal tool for designing symmetrical round knobs and generating filmstrip bitmaps for CAnimKnob"

## Clarifications

### Session 2026-01-18

- Q: Should presets be truly global (shared across all browser tabs/windows/projects using a single shared database) or scoped to prevent conflicts? → A: Database-scoped - each vstgui-edit instance has its own preset collection (prevents cross-tab conflicts)
- Q: Which WebGL library should be used for 3D rendering? → A: Three.js - industry-standard library with scene graph, materials, lighting, cameras, and extensive documentation
- Q: What method should be used for filmstrip generation? → A: Multi-pass rendering with WebGLRenderTarget tiling using setViewport() and setScissor() (NOTE: Original instancing approach was researched and found unsuitable - see research.md for technical rationale)
- Q: What level of geometry detail should layers use? → A: Adaptive detail - segment count scales with knob diameter and zoom level for optimal quality/performance balance
- Q: How should brushed metal textures be generated? → A: Custom fragment shader with procedural noise generation in GLSL for real-time quality brushed metal (best quality, GPU-accelerated)

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Design and Generate Basic Knob (Priority: P1)

A plugin developer opens the 3D Knob Designer modal, designs a simple single-layer knob with a material and indicator, previews the rotation animation in real-time, and generates a filmstrip that is automatically assigned to their current bitmap.

**Why this priority**: This is the core use case - without the ability to design a knob and generate output, the feature has no value. This story covers the complete happy path from launch to output.

**Independent Test**: Can be fully tested by launching the modal from a bitmap item, adjusting knob parameters, and confirming the generated filmstrip replaces the bitmap's image data. Delivers immediate value by eliminating the need for external 3D software.

**Acceptance Scenarios**:

1. **Given** a user has a project open with an existing bitmap, **When** they click "Design Knob" on that bitmap, **Then** the 3D Knob Designer modal opens with a real-time 3D preview of a default knob configuration.

2. **Given** the modal is open, **When** the user adjusts layer diameter or height parameters, **Then** the 3D preview updates immediately to reflect the changes.

3. **Given** the modal is open with a configured knob, **When** the user clicks "Generate", **Then** a filmstrip PNG is created and assigned to the current bitmap, and the modal closes.

4. **Given** the modal is open, **When** the user clicks "Cancel" or presses Escape, **Then** the modal closes without modifying the bitmap.

---

### User Story 2 - Multi-Layer Knob Design (Priority: P2)

A plugin developer creates a knob with multiple concentric layers (e.g., a center cap, middle ring, and outer rim) each with different materials and colors, and reorders layers to achieve the desired visual depth.

**Why this priority**: Multi-layer knobs are essential for realistic/professional designs but build upon the basic single-layer functionality.

**Independent Test**: Can be tested by adding, removing, and reordering layers, verifying each layer renders correctly in 3D with proper stacking and materials.

**Acceptance Scenarios**:

1. **Given** the modal is open with one layer, **When** the user clicks "Add Layer", **Then** a new layer is added to the layer list and appears in the 3D preview.

2. **Given** the modal has multiple layers, **When** the user drags a layer to reorder it, **Then** the layer order updates and the 3D preview shows the new stacking arrangement.

3. **Given** a layer exists, **When** the user deletes it, **Then** the layer is removed from the list and the 3D preview (minimum one layer must remain).

4. **Given** multiple layers exist, **When** the user adjusts per-layer diameter percentages, **Then** layers stack concentrically with proper relative sizing.

---

### User Story 3 - Save and Load Presets (Priority: P3)

A plugin developer saves their custom knob design as a named preset for reuse across projects, and can load both their saved presets and built-in starter templates.

**Why this priority**: Presets improve workflow efficiency but are not required for basic knob creation.

**Independent Test**: Can be tested by saving a preset, closing/reopening the modal, and loading the preset to verify all parameters restore correctly.

**Acceptance Scenarios**:

1. **Given** the user has configured a knob design, **When** they click "Save Preset" and enter a name, **Then** the preset is stored in the database and appears in the preset list.

2. **Given** saved presets exist, **When** the user opens the preset dropdown, **Then** they see both built-in templates and their custom presets.

3. **Given** a preset is selected from the list, **When** the user clicks "Load", **Then** all knob parameters are restored to match the preset configuration.

4. **Given** a custom preset exists, **When** the user deletes it, **Then** the preset is removed from the list (built-in templates cannot be deleted).

---

### User Story 4 - Configure Indicator (Priority: P3)

A plugin developer adds an indicator (dial marker) to their knob and configures its type, size, color, and position to clearly show the knob's rotational position.

**Why this priority**: Indicators are important for usability but can be omitted for certain knob styles.

**Independent Test**: Can be tested by enabling an indicator, changing its type and parameters, and verifying it appears correctly in the 3D preview and rotates with the knob.

**Acceptance Scenarios**:

1. **Given** the modal is open, **When** the user enables the indicator toggle, **Then** an indicator appears on the knob cap in the 3D preview.

2. **Given** an indicator is enabled, **When** the user selects a different indicator type (dot, line, notch, groove), **Then** the indicator shape changes in the 3D preview.

3. **Given** an indicator is enabled, **When** the user adjusts size, color, or radial position, **Then** the changes are reflected immediately in the 3D preview.

---

### User Story 5 - Undo/Redo Within Designer (Priority: P4)

A plugin developer experiments with different designs and uses undo/redo to revert or restore changes within the modal, independent of the main editor's history.

**Why this priority**: Important for iterative design but the modal can be used without it by adjusting parameters manually.

**Independent Test**: Can be tested by making changes, pressing Ctrl+Z to undo, and Ctrl+Y to redo, verifying parameter and preview state changes.

**Acceptance Scenarios**:

1. **Given** the user has made changes to knob parameters, **When** they press Ctrl+Z, **Then** the most recent change is reverted and the 3D preview updates.

2. **Given** the user has undone a change, **When** they press Ctrl+Y, **Then** the change is restored.

3. **Given** the user has an undo history, **When** they click "Cancel" and reopen the modal, **Then** the undo history is cleared (fresh start).

---

### User Story 6 - Adjust Lighting (Priority: P4)

A plugin developer adjusts the light source position to achieve desired highlights and shadows on their knob design.

**Why this priority**: Lighting enhances realism but default lighting produces acceptable results.

**Independent Test**: Can be tested by adjusting azimuth and elevation sliders and observing highlight/shadow changes in real-time.

**Acceptance Scenarios**:

1. **Given** the modal is open, **When** the user adjusts the light azimuth angle, **Then** the highlight position moves around the knob in the 3D preview.

2. **Given** the modal is open, **When** the user adjusts the light elevation, **Then** the shadow depth and highlight intensity change in the 3D preview.

---

### Edge Cases

- What happens when the user tries to generate a filmstrip with 0 frame count? System enforces minimum frame count of 8.
- What happens when knob diameter is larger than output frame dimensions? System scales the 3D model to fit within the frame with padding.
- What happens when IndexedDB is unavailable for preset storage? System displays a warning and operates in session-only mode for presets.
- What happens when a layer has 0% diameter? System enforces minimum diameter of 10%.
- What happens when the user closes the modal while generation is in progress? Generation completes before modal closes, or cancellation is confirmed.
- How does the system handle WebGL unavailability? System displays an error message explaining WebGL is required.
- What happens when preset name already exists? System prompts to overwrite or choose a different name.
- What happens when trying to delete the last remaining layer? System prevents deletion and shows a message that at least one layer is required.
- What happens when custom GLSL shader fails to compile on older browsers? System falls back to basic metallic material type and displays a warning that brushed metal effects are unavailable.

## Requirements *(mandatory)*

### Functional Requirements

**Modal & Integration**

- **FR-001**: System MUST display a "Design Knob" button alongside "Upload Image" in the bitmap item expanded view.
- **FR-002**: System MUST open a modal dialog when "Design Knob" is clicked.
- **FR-003**: Modal MUST display a real-time 3D preview of the knob that updates as parameters change.
- **FR-004**: Modal MUST provide "Generate" and "Cancel" action buttons.
- **FR-005**: System MUST generate a filmstrip PNG on "Generate" and assign it to the current bitmap.
- **FR-006**: System MUST close the modal without changes when "Cancel" is clicked or Escape is pressed.

**Layer System**

- **FR-007**: System MUST support 1-3 concentric layers per knob design (minimum 1 layer required).
- **FR-008**: Each layer MUST have configurable: diameter (10-100% of knob size), height, bevel radius, and skirt style.
- **FR-009**: System MUST support skirt styles: cylindrical, tapered inward, and angled.
- **FR-010**: Users MUST be able to add, remove, and reorder layers (minimum 1 layer required).
- **FR-011**: Layers MUST stack vertically in 3D space, rendering from bottom to top.
- **FR-012**: Layer geometry MUST use adaptive detail where radial segment count scales with output frame diameter using formula: `segments = clamp(floor(diameter * 0.4), 16, 128)` where diameter is frame width in pixels.

**Materials**

- **FR-013**: Each layer MUST support material types: solid color, metallic, matte, and brushed metal.
- **FR-014**: Solid color material MUST render as flat color without specular highlights.
- **FR-015**: Metallic material MUST provide shininess (0-128) and reflectivity (0-100%) controls.
- **FR-016**: Matte material MUST render without specular highlights.
- **FR-017**: Brushed metal material MUST generate procedural texture using custom GLSL fragment shader with configurable direction (radial or linear).
- **FR-018**: System MUST integrate with existing ColorPicker component for layer color selection (pass `documentColors={[]}` to hide swatches).

**Indicator**

- **FR-019**: System MUST support optional indicator (dial marker) on the knob.
- **FR-020**: Indicator MUST support types: dot, line, notch (on cap edge), and groove (on top surface).
- **FR-021**: Indicator MUST have separate color/material configuration from the cap.
- **FR-022**: Indicator MUST have configurable size (length for line, radius for dot, depth for notch/groove).
- **FR-023**: Indicator MUST have configurable radial position (distance from center).

**Lighting**

- **FR-024**: System MUST provide a single light source with adjustable position.
- **FR-025**: Light position MUST be configurable via spherical coordinates (azimuth angle and elevation).
- **FR-026**: System MUST apply ambient occlusion for enhanced depth perception during filmstrip generation (preview uses simplified lighting for performance).

**Rotation & Output**

- **FR-027**: System MUST support configurable rotation sweep angle (default 270 degrees).
- **FR-028**: System MUST support configurable start and end angles (default 225 to 315 degrees, 7 o'clock to 5 o'clock).
- **FR-029**: System MUST support configurable frame count with auto-suggest heuristic: `frameCount = clamp(frameWidth * 0.8, 32, 128)` where frameWidth is output frame width in pixels.
- **FR-030**: Output frame dimensions MUST be configurable by the user (width x height in pixels).
- **FR-031**: 3D model MUST scale to fit within the configured frame dimensions.
- **FR-032**: Output MUST be transparent PNG with clean cutout (no shadows outside knob bounds).
- **FR-033**: Filmstrip generation MUST use multi-pass rendering to a WebGLRenderTarget with setViewport() and setScissor() tiling to capture all frames efficiently (NOTE: Original instancing approach was researched and found unsuitable for frame-by-frame capture - see research.md).

**Undo/Redo**

- **FR-034**: Modal MUST provide dedicated undo/redo functionality independent of the main editor history.
- **FR-035**: Undo history MUST be cleared when the modal is closed.
- **FR-036**: System MUST support Ctrl+Z for undo and Ctrl+Y for redo within the modal (Cmd+Z/Cmd+Y on macOS, following existing project shortcut patterns).

**Presets**

- **FR-037**: System MUST provide 5 built-in starter templates: "Classic", "Modern Flat", "Vintage Amp", "Tech/Industrial", "Minimalist".
- **FR-038**: Users MUST be able to save custom presets with user-defined names.
- **FR-039**: Presets MUST be stored in IndexedDB with database-scoped isolation (each vstgui-edit instance has its own preset collection to prevent cross-tab conflicts).
- **FR-040**: Users MUST be able to load, rename, and delete custom presets.
- **FR-041**: Built-in templates MUST NOT be deleted, renamed, or have their design modified.

**Error Handling**

- **FR-042**: System MUST display an error if WebGL is not available in the browser.
- **FR-043**: System MUST fall back to session-only preset storage if IndexedDB is unavailable.
- **FR-044**: System MUST validate all numeric inputs and enforce defined bounds.

**Technology Stack**

- **FR-045**: System MUST use Three.js library for WebGL rendering, scene graph management, materials, lighting, and camera controls.

### Key Entities

- **KnobDesign**: Complete knob configuration including all layers, indicator settings, lighting, and output parameters. Serves as the working state within the modal and the structure saved as presets.

- **KnobLayer**: A single concentric layer of the knob with geometry (diameter, height, bevel, skirt style) and material (type, color, shininess, reflectivity, brush direction) properties. Geometry uses adaptive mesh detail scaling with diameter.

- **KnobIndicator**: Optional dial marker with type (dot/line/notch/groove), material properties, size parameters, and radial position.

- **LightingConfig**: Light source configuration with azimuth angle, elevation, and ambient occlusion strength.

- **OutputConfig**: Filmstrip generation settings including frame count, frame dimensions, rotation sweep, and start/end angles. Generation uses multi-pass WebGLRenderTarget tiling approach.

- **KnobPreset**: Named saved configuration stored in database-scoped IndexedDB, containing a complete KnobDesign plus metadata (name, creation date, built-in flag).

## Existing Functionality Re-use

The following existing components and patterns can be leveraged:

1. **IndexedDB Services** (`src/services/indexedDB/`): The existing database infrastructure can be extended with a new `presets` object store for database-scoped preset storage (each vstgui-edit instance maintains its own preset collection). Follow the pattern established by `bitmapService.ts` and `projectService.ts`.

2. **ColorPicker Component** (`src/components/editors/ColorPicker/`): The `AdvancedColorPicker` component can be used for layer and indicator color selection. Pass `documentColors={[]}` to hide swatches as specified.

3. **Modal Pattern**: Follow the existing modal implementation patterns (e.g., `ConfirmDialog`, `ProjectNameDialog`) for consistent styling and behavior.

4. **History Pattern** (`src/stores/historyStore.ts`): The undo/redo implementation can follow a similar pattern but with a local store scoped to the modal instance.

5. **Bitmap Service** (`src/services/indexedDB/bitmapService.ts`): Use `bitmapService.add()` to store the generated filmstrip PNG after generation.

6. **Multi-Frame Bitmap Handling** (`src/components/BitmapsPanel/BitmapItem.tsx`): The generated filmstrip should set `multiframe-num-frames` and `multiframe-size` properties automatically based on the output configuration.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can design a basic knob and generate a filmstrip in under 5 minutes on first use.
- **SC-002**: 3D preview updates within 100ms of parameter changes for responsive feedback.
- **SC-003**: Filmstrip generation completes within 10 seconds for typical configurations (64 frames at 100x100 pixels).
- **SC-004**: All 5 built-in templates render correctly and produce usable filmstrips.
- **SC-005**: Presets persist across browser sessions and are available in new projects.
- **SC-006**: Modal undo/redo supports at least 50 operations without performance degradation.
- **SC-007**: Generated filmstrips display correctly in the CAnimKnob preview on the canvas.
- **SC-008**: 95% of numeric inputs accept valid values and reject invalid values with clear feedback.

## Assumptions

The following reasonable defaults have been assumed:

1. **WebGL Support**: Target browsers (Chrome, Firefox, Edge, Safari) all support WebGL 2.0. No WebGL 1.0 fallback is required.

2. **Performance Baseline**: A modern mid-range device (2020+) can render the 3D preview at 30+ FPS.

3. **Knob Dimensions**: Default output frame size is 100x100 pixels, suitable for most plugin UI designs.

4. **Material Bounds**: Metallic shininess range 0-128, reflectivity range 0-100%.

5. **Layer Heights**: Layer height is relative to overall knob height (percentage), with default 100% for cap and configurable for additional layers.

6. **Ambient Occlusion**: Default AO strength is 0.5 (50%), providing subtle depth without heavy shadows.

7. **Preset Limit**: Maximum 100 custom presets to prevent storage bloat.

8. **Frame Count Bounds**: Minimum 8 frames, maximum 256 frames for filmstrip generation.

9. **Adaptive Geometry Detail**: Segment count formula scales linearly with diameter: `segments = clamp(Math.floor(diameter * 0.4), 16, 128)` where diameter is in pixels.

10. **Three.js Integration**: Three.js library (r160+) provides sufficient material system extensibility for custom brushed metal shaders and multi-viewport instanced rendering.

---

## Implementation Completion Checklist

### Requirement Compliance Table (MANDATORY)

| Requirement | Status | Evidence |
|-------------|--------|----------|
| FR-001 | PENDING | [Test or file that verifies this] |
| FR-002 | PENDING | [Test or file that verifies this] |
| FR-003 | PENDING | [Test or file that verifies this] |
| FR-004 | PENDING | [Test or file that verifies this] |
| FR-005 | PENDING | [Test or file that verifies this] |
| FR-006 | PENDING | [Test or file that verifies this] |
| FR-007 | PENDING | [Test or file that verifies this] |
| FR-008 | PENDING | [Test or file that verifies this] |
| FR-009 | PENDING | [Test or file that verifies this] |
| FR-010 | PENDING | [Test or file that verifies this] |
| FR-011 | PENDING | [Test or file that verifies this] |
| FR-012 | PENDING | [Test or file that verifies this] |
| FR-013 | PENDING | [Test or file that verifies this] |
| FR-014 | PENDING | [Test or file that verifies this] |
| FR-015 | PENDING | [Test or file that verifies this] |
| FR-016 | PENDING | [Test or file that verifies this] |
| FR-017 | PENDING | [Test or file that verifies this] |
| FR-018 | PENDING | [Test or file that verifies this] |
| FR-019 | PENDING | [Test or file that verifies this] |
| FR-020 | PENDING | [Test or file that verifies this] |
| FR-021 | PENDING | [Test or file that verifies this] |
| FR-022 | PENDING | [Test or file that verifies this] |
| FR-023 | PENDING | [Test or file that verifies this] |
| FR-024 | PENDING | [Test or file that verifies this] |
| FR-025 | PENDING | [Test or file that verifies this] |
| FR-026 | PENDING | [Test or file that verifies this] |
| FR-027 | PENDING | [Test or file that verifies this] |
| FR-028 | PENDING | [Test or file that verifies this] |
| FR-029 | PENDING | [Test or file that verifies this] |
| FR-030 | PENDING | [Test or file that verifies this] |
| FR-031 | PENDING | [Test or file that verifies this] |
| FR-032 | PENDING | [Test or file that verifies this] |
| FR-033 | PENDING | [Test or file that verifies this] |
| FR-034 | PENDING | [Test or file that verifies this] |
| FR-035 | PENDING | [Test or file that verifies this] |
| FR-036 | PENDING | [Test or file that verifies this] |
| FR-037 | PENDING | [Test or file that verifies this] |
| FR-038 | PENDING | [Test or file that verifies this] |
| FR-039 | PENDING | [Test or file that verifies this] |
| FR-040 | PENDING | [Test or file that verifies this] |
| FR-041 | PENDING | [Test or file that verifies this] |
| FR-042 | PENDING | [Test or file that verifies this] |
| FR-043 | PENDING | [Test or file that verifies this] |
| FR-044 | PENDING | [Test or file that verifies this] |
| FR-045 | PENDING | [Test or file that verifies this] |
| SC-001 | PENDING | [Measurement or test result] |
| SC-002 | PENDING | [Measurement or test result] |
| SC-003 | PENDING | [Measurement or test result] |
| SC-004 | PENDING | [Measurement or test result] |
| SC-005 | PENDING | [Measurement or test result] |
| SC-006 | PENDING | [Measurement or test result] |
| SC-007 | PENDING | [Measurement or test result] |
| SC-008 | PENDING | [Measurement or test result] |

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
