# Tasks: 3D Knob Designer

**Input**: Design documents from `/specs/044-3d-knob-designer/`
**Prerequisites**: plan.md, spec.md, data-model.md, contracts/
**Tests**: Not explicitly requested in spec - implementing TDD for domain logic and components
**Testing Guide**: Use `/testing-guide` skill before writing tests
**SolidJS Guide**: Use `/solidjs-guide` skill before writing components or stores
**Organization**: Tasks grouped by implementation phases from plan.md, mapped to user stories

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1-US6)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Project Dependencies)

**Purpose**: Install Three.js dependency and initialize project structure

**CRITICAL**: Three.js dependency requires user approval per Constitution XI

- [ ] T001 **Verify User Approval** - Confirm Three.js dependency has been approved by user
- [ ] T002 Install Three.js dependency via `npm install three@latest --save`
- [ ] T003 Install Three.js TypeScript types via `npm install @types/three --save-dev`
- [ ] T004 Verify installation by checking package.json and node_modules
- [ ] T005 **Commit**: Stage and commit Phase 1 changes with message "Add Three.js dependency for 3D knob designer"

---

## Phase 2: Foundation - Types and Validation (Blocking Prerequisites)

**Purpose**: Core type definitions and validation logic that ALL user stories depend on

**CRITICAL**: No user story work can begin until this phase is complete

- [ ] T006 **Load SolidJS Guide** - Use `/solidjs-guide` skill before proceeding with stores
- [ ] T007 [P] Create type definitions in `src/types/knobDesigner.ts` (KnobDesign, KnobLayer, LayerGeometry, LayerMaterial, MaterialType, SkirtStyle, BrushDirection)
- [ ] T008 [P] Create indicator types in `src/types/knobDesigner.ts` (KnobIndicator, IndicatorType, IndicatorMaterial, IndicatorSize)
- [ ] T009 [P] Create configuration types in `src/types/knobDesigner.ts` (LightingConfig, OutputConfig, GenerationProgress, GenerationStage)
- [ ] T010 [P] Create preset types in `src/types/knobDesigner.ts` (KnobPreset, KnobDesignerStoreState)
- [ ] T011 Create validation constraints in `src/domain/knobDesigner/validation.ts` (layer, material, indicator, lighting, output constraints)
- [ ] T012 Implement validation functions in `src/domain/knobDesigner/validation.ts` (validateLayerGeometry, validateLayerMaterial, validateIndicator, validateLighting, validateOutput, validatePresetName)
- [ ] T013 **Commit**: Stage and commit Phase 2 changes with message "Add knob designer types and validation"

**Checkpoint**: Foundation ready - type system established, validation functions available

---

## Phase 3: Foundation - Store and IndexedDB (Blocking Prerequisites)

**Purpose**: State management and persistence infrastructure for ALL user stories

**CRITICAL**: Depends on Phase 2 completion; blocks all user story implementation

### IndexedDB Schema Migration

- [ ] T014 Modify `src/services/indexedDB/database.ts` - Bump DB_VERSION from 1 to 2
- [ ] T015 Add presets object store definition in `src/services/indexedDB/database.ts` (keyPath: 'id', indexes: name (unique), isBuiltIn)
- [ ] T016 Implement database migration logic in `src/services/indexedDB/database.ts` (create presets store on upgrade to v2)

### Preset Service Implementation

- [ ] T017 Create preset service in `src/services/indexedDB/presetService.ts` implementing PresetService interface
- [ ] T018 Implement presetService.add() - Insert preset with unique name validation
- [ ] T019 [P] Implement presetService.get() - Retrieve preset by ID
- [ ] T020 [P] Implement presetService.getByName() - Retrieve preset by name index
- [ ] T021 Implement presetService.getAll() - Return all presets sorted (built-in first, then alphabetical)
- [ ] T022 [P] Implement presetService.getBuiltIn() - Filter built-in presets only
- [ ] T023 [P] Implement presetService.getCustom() - Filter custom presets, sorted alphabetically
- [ ] T024 Implement presetService.update() - Update preset with built-in check
- [ ] T025 Implement presetService.delete() - Delete custom preset with built-in protection
- [ ] T026 [P] Implement presetService.isNameTaken() - Check name uniqueness with optional exclude ID
- [ ] T027 [P] Implement presetService.getCustomCount() - Count custom presets for limit enforcement
- [ ] T028 Implement presetService.seedBuiltInPresets() - Insert 5 built-in templates if not present

### Built-In Presets Definition

- [ ] T029 Create defaults file `src/domain/knobDesigner/defaults.ts` with DEFAULT_KNOB_DESIGN constant
- [ ] T030 [P] Define "Classic" preset in `src/domain/knobDesigner/defaults.ts` (silver metallic with line indicator)
- [ ] T031 [P] Define "Modern Flat" preset in `src/domain/knobDesigner/defaults.ts` (matte dark with minimal indicator)
- [ ] T032 [P] Define "Vintage Amp" preset in `src/domain/knobDesigner/defaults.ts` (cream/brown with notch indicator)
- [ ] T033 [P] Define "Tech/Industrial" preset in `src/domain/knobDesigner/defaults.ts` (brushed aluminum with groove indicator)
- [ ] T034 [P] Define "Minimalist" preset in `src/domain/knobDesigner/defaults.ts` (white solid with dot indicator)
- [ ] T035 Export BUILTIN_PRESETS array in `src/domain/knobDesigner/defaults.ts`

### Knob Designer Store

- [ ] T036 Create knob designer store in `src/stores/knobDesignerStore.ts` implementing KnobDesignerStore interface
- [ ] T037 Initialize store state with isOpen=false, design=DEFAULT_KNOB_DESIGN, targetBitmapName=null, targetProjectId=null
- [ ] T038 Implement openKnobDesigner(bitmapName, projectId) - Set targets, load default design, reset history
- [ ] T039 Implement closeKnobDesigner() - Clear state, dispose renderer, reset to initial state
- [ ] T040 [P] Implement layer operations (addLayer, removeLayer, reorderLayer, updateLayerGeometry, updateLayerMaterial)
- [ ] T041 [P] Implement indicator operations (toggleIndicator, setIndicatorType, updateIndicatorMaterial, updateIndicatorSize, setIndicatorPosition)
- [ ] T042 [P] Implement configuration operations (updateLighting, updateOutput)
- [ ] T043 Implement preset operations (loadPreset, savePreset, renamePreset, deletePreset, getAllPresets)
- [ ] T044 Implement history operations (undo, redo) with local undo/redo stacks (max 50 operations per SC-006)
- [ ] T045 Implement generation operations (generateFilmstrip, cancelGeneration) - stubs for now, will integrate renderer in Phase 5
- [ ] T046 [P] Implement utility operations (clearError, resetKnobDesignerStore)
- [ ] T047 **Commit**: Stage and commit Phase 3 changes with message "Add knob designer store and IndexedDB preset service"

**Checkpoint**: Foundational infrastructure complete - user story implementation can now begin

---

## Phase 4: User Story 1 - Design and Generate Basic Knob (Priority: P1) - Part A: Three.js Renderer Core

**Goal**: Enable real-time 3D preview of knob design with basic materials and lighting

**Independent Test**: Open modal, adjust layer parameters, verify 3D preview updates in real-time

### Three.js Scene Setup

- [ ] T048 **Load Testing Guide** - Use `/testing-guide` skill before writing tests
- [ ] T049 Create scene setup utilities in `src/domain/knobDesigner/scene.ts`
- [ ] T050 Implement createScene() in `src/domain/knobDesigner/scene.ts` - Return configured Three.js Scene with background
- [ ] T051 Implement createCamera(width, height) in `src/domain/knobDesigner/scene.ts` - Return OrthographicCamera with aspect ratio
- [ ] T052 Implement createMainLight(azimuth, elevation) in `src/domain/knobDesigner/scene.ts` - DirectionalLight with shadow map
- [ ] T053 Implement createAmbientLight(intensity) in `src/domain/knobDesigner/scene.ts` - AmbientLight for fill
- [ ] T054 Implement updateLightPosition(light, azimuth, elevation) in `src/domain/knobDesigner/scene.ts` - Convert spherical to Cartesian coordinates

### Geometry Generation

- [ ] T055 Create geometry utilities in `src/domain/knobDesigner/geometry.ts`
- [ ] T056 Implement calculateSegments(diameter) in `src/domain/knobDesigner/geometry.ts` - Adaptive segment count: clamp(floor(diameter * 0.4), 16, 128)
- [ ] T057 Implement createLayerProfile(geometry, overallDiameter, overallHeight) in `src/domain/knobDesigner/geometry.ts` - Generate 2D profile points for LatheGeometry
- [ ] T058 Implement handleSkirtStyle(points, skirtStyle) in `src/domain/knobDesigner/geometry.ts` - Modify profile for cylindrical/tapered/angled
- [ ] T059 Implement applyBevel(points, bevelRadius) in `src/domain/knobDesigner/geometry.ts` - Round corners with arc points
- [ ] T060 Implement createLayerGeometry(layer, overallDiameter, overallHeight, segments) in `src/domain/knobDesigner/geometry.ts` - Return LatheGeometry from profile

### Basic Materials (Non-Brushed)

- [ ] T061 Create material factory in `src/domain/knobDesigner/materials.ts`
- [ ] T062 Implement createSolidMaterial(color) in `src/domain/knobDesigner/materials.ts` - MeshBasicMaterial without specular
- [ ] T063 Implement createMetallicMaterial(color, shininess, reflectivity) in `src/domain/knobDesigner/materials.ts` - MeshStandardMaterial with metalness/roughness
- [ ] T064 Implement createMatteMaterial(color) in `src/domain/knobDesigner/materials.ts` - MeshStandardMaterial with high roughness
- [ ] T065 Implement createMaterial(material) in `src/domain/knobDesigner/materials.ts` - Factory function dispatching to type-specific creators (stub brushed metal for now)
- [ ] T066 Implement disposeAll() in `src/domain/knobDesigner/materials.ts` - Dispose cached materials

### Renderer Service

- [ ] T067 Create renderer service in `src/services/knobRenderer/index.ts` implementing KnobRendererService interface
- [ ] T068 Implement initialize(canvas) in `src/services/knobRenderer/index.ts` - Create WebGLRenderer, check WebGL availability (FR-042)
- [ ] T069 Implement dispose() in `src/services/knobRenderer/index.ts` - Dispose renderer, geometries, materials, stop animation
- [ ] T070 Implement isWebGLAvailable() in `src/services/knobRenderer/index.ts` - Feature detection for WebGL 2.0
- [ ] T071 Implement updateScene(design) in `src/services/knobRenderer/index.ts` - Clear scene, rebuild layers with geometry + materials
- [ ] T072 Implement setPreviewRotation(angle) in `src/services/knobRenderer/index.ts` - Rotate knob group around Y-axis
- [ ] T073 Implement renderPreview() in `src/services/knobRenderer/index.ts` - Render scene to canvas with current camera
- [ ] T074 Implement startPreviewAnimation() in `src/services/knobRenderer/index.ts` - requestAnimationFrame loop rotating through sweep range
- [ ] T075 Implement stopPreviewAnimation() in `src/services/knobRenderer/index.ts` - Cancel animation frame
- [ ] T076 Implement resize(width, height) in `src/services/knobRenderer/index.ts` - Update renderer and camera aspect ratio
- [ ] T077 Export singleton knobRendererService instance from `src/services/knobRenderer/index.ts`

### Preview Component

- [ ] T078 **Load SolidJS Guide** - Use `/solidjs-guide` skill before writing component
- [ ] T079 Create KnobPreview component in `src/components/KnobDesigner/KnobPreview.tsx`
- [ ] T080 Implement canvas ref and onMount initialization in `src/components/KnobDesigner/KnobPreview.tsx` - Call knobRendererService.initialize()
- [ ] T081 Implement onCleanup disposal in `src/components/KnobDesigner/KnobPreview.tsx` - Call knobRendererService.dispose()
- [ ] T082 Implement createEffect for design changes in `src/components/KnobDesigner/KnobPreview.tsx` - Call knobRendererService.updateScene() and renderPreview()
- [ ] T083 Implement ResizeObserver for canvas resizing in `src/components/KnobDesigner/KnobPreview.tsx` - Call knobRendererService.resize()
- [ ] T084 Create KnobPreview.module.css with canvas container styling (aspect ratio, border, background)
- [ ] T085 Add WebGL error handling in `src/components/KnobDesigner/KnobPreview.tsx` - Display error message if isWebGLAvailable() returns false (FR-042)

### US1 Tests (Domain Logic)

- [ ] T086 [P] [US1] Unit test for scene.ts createScene() in `src/domain/knobDesigner/__tests__/scene.spec.ts` - Verify Scene instance
- [ ] T087 [P] [US1] Unit test for scene.ts createCamera() in `src/domain/knobDesigner/__tests__/scene.spec.ts` - Verify OrthographicCamera with correct frustum
- [ ] T088 [P] [US1] Unit test for scene.ts updateLightPosition() in `src/domain/knobDesigner/__tests__/scene.spec.ts` - Verify spherical to Cartesian conversion
- [ ] T089 [P] [US1] Unit test for geometry.ts calculateSegments() in `src/domain/knobDesigner/__tests__/geometry.spec.ts` - Verify adaptive segment formula (16-128 range)
- [ ] T090 [P] [US1] Unit test for geometry.ts createLayerGeometry() in `src/domain/knobDesigner/__tests__/geometry.spec.ts` - Verify LatheGeometry creation
- [ ] T091 [P] [US1] Unit test for materials.ts createSolidMaterial() in `src/domain/knobDesigner/__tests__/materials.spec.ts` - Verify MeshBasicMaterial properties
- [ ] T092 [P] [US1] Unit test for materials.ts createMetallicMaterial() in `src/domain/knobDesigner/__tests__/materials.spec.ts` - Verify metalness/roughness mapping
- [ ] T093 [P] [US1] Unit test for validation.ts validateLayerGeometry() in `src/domain/knobDesigner/__tests__/validation.spec.ts` - Verify diameter/height/bevel bounds enforcement
- [ ] T094 **Commit**: Stage and commit US1 Part A changes with message "Add Three.js renderer core for knob preview"

**Checkpoint**: 3D preview functional with basic materials (solid, metallic, matte) - ready for UI integration

---

## Phase 5: User Story 1 - Design and Generate Basic Knob (Priority: P1) - Part B: Modal UI

**Goal**: Complete US1 by providing modal UI for parameter editing and filmstrip generation

**Independent Test**: Launch modal from bitmap, adjust parameters, generate filmstrip, verify it replaces bitmap

### Layer Panel

- [ ] T095 **Load SolidJS Guide** - Use `/solidjs-guide` skill before writing components
- [ ] T096 Create LayerItem component in `src/components/KnobDesigner/LayerItem.tsx`
- [ ] T097 Implement layer name display in `src/components/KnobDesigner/LayerItem.tsx`
- [ ] T098 Implement layer collapse/expand toggle in `src/components/KnobDesigner/LayerItem.tsx`
- [ ] T099 Implement delete button in `src/components/KnobDesigner/LayerItem.tsx` - Call removeLayer() with minimum 1 layer check
- [ ] T100 Create LayerItem.module.css with item styling (border, padding, hover state)
- [ ] T101 Create LayerPanel component in `src/components/KnobDesigner/LayerPanel.tsx`
- [ ] T102 Implement layer list rendering with <For> in `src/components/KnobDesigner/LayerPanel.tsx`
- [ ] T103 Implement "Add Layer" button in `src/components/KnobDesigner/LayerPanel.tsx` - Call addLayer() with max 3 layers check (FR-007)
- [ ] T104 Implement drag-to-reorder functionality in `src/components/KnobDesigner/LayerPanel.tsx` - Use HTML5 drag API, call reorderLayer()
- [ ] T105 Create LayerPanel.module.css with list styling (gap, scrollable container)

### Material Panel

- [ ] T106 Create MaterialPanel component in `src/components/KnobDesigner/MaterialPanel.tsx`
- [ ] T107 Implement material type selector (EnumEditor) in `src/components/KnobDesigner/MaterialPanel.tsx` - solid/metallic/matte/brushed
- [ ] T108 Implement color picker integration in `src/components/KnobDesigner/MaterialPanel.tsx` - Use AdvancedColorPicker with documentColors=[] (FR-018)
- [ ] T109 Implement shininess slider (NumberEditor) in `src/components/KnobDesigner/MaterialPanel.tsx` - 0-128 range, disabled for non-metallic
- [ ] T110 Implement reflectivity slider (NumberEditor) in `src/components/KnobDesigner/MaterialPanel.tsx` - 0-100 range, disabled for non-metallic
- [ ] T111 Implement brush direction selector (EnumEditor) in `src/components/KnobDesigner/MaterialPanel.tsx` - radial/linear, disabled for non-brushed
- [ ] T112 Implement brush intensity slider (NumberEditor) in `src/components/KnobDesigner/MaterialPanel.tsx` - 0-100 range, disabled for non-brushed
- [ ] T113 Create MaterialPanel.module.css with form layout (grid, label alignment, disabled states)

### Geometry Panel

- [ ] T114 Create GeometryPanel component in `src/components/KnobDesigner/GeometryPanel.tsx`
- [ ] T115 Implement diameter slider (NumberEditor) in `src/components/KnobDesigner/GeometryPanel.tsx` - 10-100% range
- [ ] T116 Implement height slider (NumberEditor) in `src/components/KnobDesigner/GeometryPanel.tsx` - 10-100% range
- [ ] T117 Implement bevel radius slider (NumberEditor) in `src/components/KnobDesigner/GeometryPanel.tsx` - 0-20 pixel range
- [ ] T118 Implement skirt style selector (EnumEditor) in `src/components/KnobDesigner/GeometryPanel.tsx` - cylindrical/tapered/angled
- [ ] T119 Create GeometryPanel.module.css with form layout

### Output Panel

- [ ] T120 Create OutputPanel component in `src/components/KnobDesigner/OutputPanel.tsx`
- [ ] T121 Implement frame count input (NumberEditor) in `src/components/KnobDesigner/OutputPanel.tsx` - 8-256 range with auto-suggest heuristic (FR-029)
- [ ] T122 Implement frame width/height inputs (NumberEditor) in `src/components/KnobDesigner/OutputPanel.tsx` - 16-512 pixel range
- [ ] T123 Implement sweep angle slider (NumberEditor) in `src/components/KnobDesigner/OutputPanel.tsx` - 90-360 degree range
- [ ] T124 Implement start/end angle inputs (NumberEditor) in `src/components/KnobDesigner/OutputPanel.tsx` - 0-360 degree range
- [ ] T125 Create OutputPanel.module.css with form layout

### Modal Container

- [ ] T126 Create KnobDesignerModal component in `src/components/KnobDesigner/KnobDesignerModal.tsx`
- [ ] T127 Implement modal open/close state binding in `src/components/KnobDesigner/KnobDesignerModal.tsx` - Read knobDesignerStore.isOpen
- [ ] T128 Implement modal layout in `src/components/KnobDesigner/KnobDesignerModal.tsx` - Split: left sidebar (layers/material/geometry), center (preview), right sidebar (indicator/lighting/output)
- [ ] T129 Integrate KnobPreview component in `src/components/KnobDesigner/KnobDesignerModal.tsx` - Center panel
- [ ] T130 Integrate LayerPanel in `src/components/KnobDesigner/KnobDesignerModal.tsx` - Left sidebar
- [ ] T131 Integrate MaterialPanel in `src/components/KnobDesigner/KnobDesignerModal.tsx` - Left sidebar below layers
- [ ] T132 Integrate GeometryPanel in `src/components/KnobDesigner/KnobDesignerModal.tsx` - Left sidebar below material
- [ ] T133 Integrate OutputPanel in `src/components/KnobDesigner/KnobDesignerModal.tsx` - Right sidebar
- [ ] T134 Implement "Generate" button in `src/components/KnobDesigner/KnobDesignerModal.tsx` - Call generateFilmstrip() (FR-005)
- [ ] T135 Implement "Cancel" button in `src/components/KnobDesigner/KnobDesignerModal.tsx` - Call closeKnobDesigner() (FR-006)
- [ ] T136 Implement Escape key handler in `src/components/KnobDesigner/KnobDesignerModal.tsx` - Close modal (FR-006)
- [ ] T137 Implement generation progress display in `src/components/KnobDesigner/KnobDesignerModal.tsx` - Show stage/percent from generationProgress state
- [ ] T138 Implement error display in `src/components/KnobDesigner/KnobDesignerModal.tsx` - Show errorMessage with dismiss button
- [ ] T139 Create KnobDesignerModal.module.css with modal styling (overlay, container, panels, responsive layout)

### BitmapItem Integration

- [ ] T140 Modify BitmapItem component in `src/components/BitmapsPanel/BitmapItem.tsx`
- [ ] T141 Add "Design Knob" button alongside "Upload Image" in `src/components/BitmapsPanel/BitmapItem.tsx` (FR-001)
- [ ] T142 Implement "Design Knob" click handler in `src/components/BitmapsPanel/BitmapItem.tsx` - Call openKnobDesigner(bitmapName, projectId) (FR-002)
- [ ] T143 Update BitmapItem.module.css for button layout (flex, gap)

### Filmstrip Generation (Stub Implementation)

**NOTE**: Filmstrip generation in US1 (Phase 5) captures basic knobs without indicators. When US4 (Phase 6) adds indicator support via T165-T166, subsequent filmstrip generations will automatically include indicators since updateScene() will be updated to render them. This ordering is intentional for MVP delivery.

- [ ] T144 Create filmstrip utilities in `src/domain/knobDesigner/filmstrip.ts`
- [ ] T145 Implement calculateFramesPerRow(frameCount) in `src/domain/knobDesigner/filmstrip.ts` - Return optimal power-of-2 layout
- [ ] T146 Implement createRenderTarget(frameWidth, frameHeight, frameCount, framesPerRow) in `src/domain/knobDesigner/filmstrip.ts` - Return sized WebGLRenderTarget
- [ ] T147 Implement getFrameViewport(frameIndex, frameWidth, frameHeight, framesPerRow) in `src/domain/knobDesigner/filmstrip.ts` - Calculate viewport/scissor rect
- [ ] T148 Implement extractPng(renderer, target) in `src/domain/knobDesigner/filmstrip.ts` - Read pixels, create Canvas, export to PNG data URL
- [ ] T149 Implement generateFilmstrip(design, onProgress) in `src/services/knobRenderer/index.ts` - Multi-pass render loop with progress callbacks (FR-033)
- [ ] T150 Integrate generateFilmstrip() in knobDesignerStore - Call renderer, convert to blob, store via bitmapService.add(), set multiframe properties (FR-005)

### US1 Tests (Components)

- [ ] T151 **Load Testing Guide** - Use `/testing-guide` skill before writing component tests
- [ ] T152 [P] [US1] Component test for LayerPanel in `src/components/KnobDesigner/__tests__/LayerPanel.spec.tsx` - Add/remove/reorder layers
- [ ] T153 [P] [US1] Component test for MaterialPanel in `src/components/KnobDesigner/__tests__/MaterialPanel.spec.tsx` - Change material type, verify conditional inputs
- [ ] T154 [P] [US1] Component test for GeometryPanel in `src/components/KnobDesigner/__tests__/GeometryPanel.spec.tsx` - Adjust sliders, verify validation
- [ ] T155 [P] [US1] Component test for OutputPanel in `src/components/KnobDesigner/__tests__/OutputPanel.spec.tsx` - Frame count auto-suggest
- [ ] T156 [US1] Component test for KnobDesignerModal in `src/components/KnobDesigner/__tests__/KnobDesignerModal.spec.tsx` - Open/close, Escape key, Generate/Cancel buttons
- [ ] T157 [US1] Integration test for BitmapItem in `src/components/BitmapsPanel/__tests__/BitmapItem.spec.tsx` - "Design Knob" button opens modal
- [ ] T158 **Commit**: Stage and commit US1 Part B changes with message "Add knob designer modal UI and bitmap integration"

**Checkpoint**: User Story 1 complete - users can design a basic knob and generate filmstrip

---

## Phase 6: User Story 4 - Configure Indicator (Priority: P3)

**Goal**: Add indicator (dial marker) with configurable type, size, color, and position

**Independent Test**: Enable indicator, change type, adjust parameters, verify rendering in preview and filmstrip

### Indicator Geometry

- [ ] T159 Implement createDotGeometry(radius, segments) in `src/domain/knobDesigner/geometry.ts` - SphereGeometry
- [ ] T160 Implement createLineGeometry(length, width) in `src/domain/knobDesigner/geometry.ts` - BoxGeometry
- [ ] T161 Implement createNotchGeometry(depth, width) in `src/domain/knobDesigner/geometry.ts` - BoxGeometry for edge marker
- [ ] T162 Implement createGrooveGeometry(depth, width, radius) in `src/domain/knobDesigner/geometry.ts` - TorusGeometry for top surface groove
- [ ] T163 Implement createIndicatorGeometry(indicator, layerRadius, segments) in `src/domain/knobDesigner/geometry.ts` - Factory dispatching to type-specific creators

### Indicator Material

- [ ] T164 Implement createIndicatorMaterial(material) in `src/domain/knobDesigner/materials.ts` - Return basic or metallic based on material.metallic flag

### Renderer Integration

- [ ] T165 Update updateScene() in `src/services/knobRenderer/index.ts` - Add indicator mesh if enabled, position based on radialPosition
- [ ] T166 Update setPreviewRotation() in `src/services/knobRenderer/index.ts` - Rotate indicator with knob

### Indicator Panel UI

- [ ] T167 Create IndicatorPanel component in `src/components/KnobDesigner/IndicatorPanel.tsx`
- [ ] T168 Implement enabled toggle (BooleanEditor) in `src/components/KnobDesigner/IndicatorPanel.tsx` - Call toggleIndicator()
- [ ] T169 Implement type selector (EnumEditor) in `src/components/KnobDesigner/IndicatorPanel.tsx` - dot/line/notch/groove, call setIndicatorType()
- [ ] T170 Implement color picker in `src/components/KnobDesigner/IndicatorPanel.tsx` - Use AdvancedColorPicker, call updateIndicatorMaterial()
- [ ] T171 Implement metallic toggle in `src/components/KnobDesigner/IndicatorPanel.tsx` - Call updateIndicatorMaterial()
- [ ] T172 Implement size inputs in `src/components/KnobDesigner/IndicatorPanel.tsx` - radius/length/width/depth (NumberEditor), type-conditional
- [ ] T173 Implement radial position slider in `src/components/KnobDesigner/IndicatorPanel.tsx` - 10-90 range, call setIndicatorPosition()
- [ ] T174 Create IndicatorPanel.module.css with form layout
- [ ] T175 Integrate IndicatorPanel in `src/components/KnobDesigner/KnobDesignerModal.tsx` - Right sidebar

### US4 Tests

- [ ] T176 **Load Testing Guide** - Use `/testing-guide` skill before writing tests
- [ ] T177 [P] [US4] Unit test for geometry.ts createIndicatorGeometry() in `src/domain/knobDesigner/__tests__/geometry.spec.ts` - Verify all 4 types
- [ ] T178 [P] [US4] Unit test for materials.ts createIndicatorMaterial() in `src/domain/knobDesigner/__tests__/materials.spec.ts` - Verify metallic flag handling
- [ ] T179 [US4] Component test for IndicatorPanel in `src/components/KnobDesigner/__tests__/IndicatorPanel.spec.tsx` - Toggle enabled, change type, verify conditional inputs
- [ ] T180 **Commit**: Stage and commit US4 changes with message "Add indicator configuration support"

**Checkpoint**: User Story 4 complete - indicators functional and customizable

---

## Phase 7: User Story 6 - Adjust Lighting (Priority: P4)

**Goal**: Provide lighting controls for adjustable highlights and shadows

**Independent Test**: Adjust azimuth and elevation sliders, observe real-time lighting changes

### Lighting Panel UI

- [ ] T181 Create LightingPanel component in `src/components/KnobDesigner/LightingPanel.tsx`
- [ ] T182 Implement azimuth slider (NumberEditor) in `src/components/KnobDesigner/LightingPanel.tsx` - 0-360 degree range, call updateLighting()
- [ ] T183 Implement elevation slider (NumberEditor) in `src/components/KnobDesigner/LightingPanel.tsx` - 0-90 degree range, call updateLighting()
- [ ] T184 Implement AO strength slider (NumberEditor) in `src/components/KnobDesigner/LightingPanel.tsx` - 0-100 range, call updateLighting()
- [ ] T185 Create LightingPanel.module.css with form layout
- [ ] T186 Integrate LightingPanel in `src/components/KnobDesigner/KnobDesignerModal.tsx` - Right sidebar

### Renderer Integration

- [ ] T187 Update updateScene() in `src/services/knobRenderer/index.ts` - Update main light position when lighting config changes

### US6 Tests

- [ ] T188 [US6] Component test for LightingPanel in `src/components/KnobDesigner/__tests__/LightingPanel.spec.tsx` - Adjust sliders, verify updateLighting() calls
- [ ] T189 **Commit**: Stage and commit US6 changes with message "Add lighting adjustment controls"

**Checkpoint**: User Story 6 complete - lighting controls functional

---

## Phase 8: User Story 2 - Multi-Layer Knob Design (Priority: P2)

**Goal**: Support up to 3 concentric layers with drag reordering

**Independent Test**: Add layers, reorder via drag, adjust per-layer parameters, verify stacking in preview

**Note**: Most infrastructure already implemented in Phase 4-5 (LayerPanel, addLayer, removeLayer, reorderLayer)

### Layer Stacking Logic

- [ ] T190 Update updateScene() in `src/services/knobRenderer/index.ts` - Stack layers vertically based on cumulative heights, bottom to top (FR-011)
- [ ] T191 Implement calculateLayerYOffset(layers, currentIndex) in `src/domain/knobDesigner/geometry.ts` - Return vertical offset for layer stacking

### US2 Tests

- [ ] T192 [P] [US2] Unit test for geometry.ts calculateLayerYOffset() in `src/domain/knobDesigner/__tests__/geometry.spec.ts` - Verify cumulative height stacking
- [ ] T193 [US2] Integration test for multi-layer rendering in `src/services/knobRenderer/__tests__/index.spec.ts` - Add 3 layers, verify mesh count and positions
- [ ] T194 **Commit**: Stage and commit US2 changes with message "Add multi-layer stacking support"

**Checkpoint**: User Story 2 complete - multi-layer knobs render correctly

---

## Phase 9: User Story 3 - Save and Load Presets (Priority: P3)

**Goal**: Save custom presets, load built-in and custom presets, manage preset library

**Independent Test**: Save preset, close/reopen modal, load preset, verify all parameters restore

### Preset Selector UI

- [ ] T195 Create PresetSelector component in `src/components/KnobDesigner/PresetSelector.tsx`
- [ ] T196 Implement preset dropdown in `src/components/KnobDesigner/PresetSelector.tsx` - Display built-in + custom presets, grouped
- [ ] T197 Implement "Load" button in `src/components/KnobDesigner/PresetSelector.tsx` - Call loadPreset(selectedPresetId)
- [ ] T198 Implement "Save" button with name input in `src/components/KnobDesigner/PresetSelector.tsx` - Call savePreset(name)
- [ ] T199 Implement "Rename" button in `src/components/KnobDesigner/PresetSelector.tsx` - Call renamePreset(id, newName), disabled for built-in
- [ ] T200 Implement "Delete" button in `src/components/KnobDesigner/PresetSelector.tsx` - Call deletePreset(id), disabled for built-in (FR-041)
- [ ] T201 Implement preset count limit check in `src/components/KnobDesigner/PresetSelector.tsx` - Disable save if custom count >= 100
- [ ] T202 Implement modified indicator in `src/components/KnobDesigner/PresetSelector.tsx` - Show asterisk when isModified=true
- [ ] T203 Create PresetSelector.module.css with dropdown and button styling
- [ ] T204 Integrate PresetSelector in `src/components/KnobDesigner/KnobDesignerModal.tsx` - Top toolbar

### Preset Seeding

- [ ] T205 Call presetService.seedBuiltInPresets() on database initialization in `src/services/indexedDB/database.ts` - Ensure 5 built-in presets exist (FR-037)

### US3 Tests

- [ ] T206 [P] [US3] Unit test for presetService.savePreset() in `src/services/indexedDB/__tests__/presetService.spec.ts` - Verify unique name enforcement
- [ ] T207 [P] [US3] Unit test for presetService.loadPreset() in `src/services/indexedDB/__tests__/presetService.spec.ts` - Verify design restoration
- [ ] T208 [P] [US3] Unit test for presetService.delete() in `src/services/indexedDB/__tests__/presetService.spec.ts` - Verify built-in protection
- [ ] T209 [US3] Component test for PresetSelector in `src/components/KnobDesigner/__tests__/PresetSelector.spec.tsx` - Save, load, rename, delete operations
- [ ] T210 [US3] Integration test for preset persistence in `src/stores/__tests__/knobDesignerStore.spec.tsx` - Save preset, reset store, load preset, verify state
- [ ] T211 **Commit**: Stage and commit US3 changes with message "Add preset save/load functionality"

**Checkpoint**: User Story 3 complete - preset management functional

---

## Phase 10: User Story 5 - Undo/Redo Within Designer (Priority: P4)

**Goal**: Independent undo/redo stack for modal operations

**Independent Test**: Make changes, Ctrl+Z to undo, Ctrl+Y to redo, verify state changes

**Note**: Undo/redo infrastructure already implemented in Phase 3 (T044)

### History Operations

- [ ] T212 Create history operations file in `src/domain/knobDesigner/historyOperations.ts`
- [ ] T213 Implement createLayerAddOperation(layer) in `src/domain/knobDesigner/historyOperations.ts` - Return undo/redo functions
- [ ] T214 Implement createLayerRemoveOperation(layer, index) in `src/domain/knobDesigner/historyOperations.ts`
- [ ] T215 Implement createLayerReorderOperation(layerId, oldIndex, newIndex) in `src/domain/knobDesigner/historyOperations.ts`
- [ ] T216 Implement createLayerGeometryUpdateOperation(layerId, oldGeometry, newGeometry) in `src/domain/knobDesigner/historyOperations.ts`
- [ ] T217 Implement createLayerMaterialUpdateOperation(layerId, oldMaterial, newMaterial) in `src/domain/knobDesigner/historyOperations.ts`
- [ ] T218 Implement createIndicatorToggleOperation(oldState, newState) in `src/domain/knobDesigner/historyOperations.ts`
- [ ] T219 Implement createIndicatorUpdateOperation(oldIndicator, newIndicator) in `src/domain/knobDesigner/historyOperations.ts`
- [ ] T220 Implement createLightingUpdateOperation(oldLighting, newLighting) in `src/domain/knobDesigner/historyOperations.ts`
- [ ] T221 Implement createOutputUpdateOperation(oldOutput, newOutput) in `src/domain/knobDesigner/historyOperations.ts`

### Store Integration

- [ ] T222 Update all store actions in `src/stores/knobDesignerStore.ts` - Push history operations when changes occur (depends on T213-T221 completion)
- [ ] T223 Implement history limit enforcement in `src/stores/knobDesignerStore.ts` - Cap undo stack at 50 operations (SC-006)

### Keyboard Shortcuts

- [ ] T224 Implement Ctrl+Z handler in `src/components/KnobDesigner/KnobDesignerModal.tsx` - Call undo()
- [ ] T225 Implement Ctrl+Y handler in `src/components/KnobDesigner/KnobDesignerModal.tsx` - Call redo()
- [ ] T226 Implement undo/redo button UI in `src/components/KnobDesigner/KnobDesignerModal.tsx` - Toolbar buttons with disabled states

### US5 Tests

- [ ] T227 [P] [US5] Unit test for historyOperations in `src/domain/knobDesigner/__tests__/historyOperations.spec.ts` - Verify all operation types
- [ ] T228 [US5] Store test for undo/redo in `src/stores/__tests__/knobDesignerStore.spec.tsx` - Make changes, undo, redo, verify state
- [ ] T229 [US5] Component test for keyboard shortcuts in `src/components/KnobDesigner/__tests__/KnobDesignerModal.spec.tsx` - Ctrl+Z, Ctrl+Y events
- [ ] T230 **Commit**: Stage and commit US5 changes with message "Add undo/redo support to knob designer"

**Checkpoint**: User Story 5 complete - undo/redo functional

---

## Phase 11: Brushed Metal Shader (Advanced Material)

**Goal**: Implement procedural brushed metal material with GLSL shader

**Independent Test**: Select brushed material type, adjust brush direction and intensity, verify grain effect in preview

### Custom GLSL Shader

- [ ] T231 Create shader utilities file in `src/domain/knobDesigner/shaders.ts`
- [ ] T232 Implement noise2D(vec2 uv) GLSL function in `src/domain/knobDesigner/shaders.ts` - Simplex or Perlin noise
- [ ] T233 Implement radialBrush(vec2 uv, float intensity) GLSL function in `src/domain/knobDesigner/shaders.ts` - Noise along radial direction
- [ ] T234 Implement linearBrush(vec2 uv, float intensity, float angle) GLSL function in `src/domain/knobDesigner/shaders.ts` - Noise along linear direction
- [ ] T235 Define vertex shader in `src/domain/knobDesigner/shaders.ts` - Pass vUv to fragment
- [ ] T236 Define fragment shader in `src/domain/knobDesigner/shaders.ts` - Apply brush noise to base color, output to gl_FragColor

### Material Factory Integration

- [ ] T237 Implement createBrushedMetalMaterial(color, direction, intensity, roughness) in `src/domain/knobDesigner/materials.ts`
- [ ] T238 Use MeshStandardMaterial.onBeforeCompile() in `src/domain/knobDesigner/materials.ts` - Inject custom shader code
- [ ] T239 Update createMaterial() in `src/domain/knobDesigner/materials.ts` - Dispatch to createBrushedMetalMaterial for 'brushed' type

### Brushed Metal Tests

- [ ] T240 [P] Unit test for shaders.ts noise functions in `src/domain/knobDesigner/__tests__/shaders.spec.ts` - Verify GLSL compilation (mock Three.js ShaderMaterial)
- [ ] T241 [P] Unit test for materials.ts createBrushedMetalMaterial() in `src/domain/knobDesigner/__tests__/materials.spec.ts` - Verify onBeforeCompile injection
- [ ] T242 **Commit**: Stage and commit brushed metal shader with message "Add procedural brushed metal material shader"

**Checkpoint**: Brushed metal material functional with radial and linear grain patterns

---

## Phase 12: Polish & Cross-Cutting Concerns

**Purpose**: Refinements affecting multiple user stories

### Performance Optimization

- [ ] T243 Implement debouncing for preview updates in `src/components/KnobDesigner/KnobPreview.tsx` - Avoid excessive re-renders (target <100ms per SC-002)
- [ ] T244 Optimize geometry caching in `src/domain/knobDesigner/geometry.ts` - Reuse geometries with same parameters
- [ ] T245 Profile filmstrip generation in `src/domain/knobDesigner/filmstrip.ts` - Ensure <10s for 64 frames at 100px (SC-003)

### Error Handling

- [ ] T246 Add IndexedDB fallback in `src/stores/knobDesignerStore.ts` - Session-only mode if IndexedDB unavailable (FR-043)
- [ ] T247 Add input validation error display in all editor panels - Show validation errors inline
- [ ] T248 Add generation error recovery in `src/stores/knobDesignerStore.ts` - Display error message, allow retry

### Accessibility

- [ ] T249 Add ARIA labels to all interactive controls in modal components
- [ ] T250 Add keyboard navigation to preset dropdown in `src/components/KnobDesigner/PresetSelector.tsx`
- [ ] T251 Add focus management for modal open/close in `src/components/KnobDesigner/KnobDesignerModal.tsx`

### Documentation

- [ ] T252 Update CLAUDE.md with knobDesignerStore API documentation
- [ ] T253 Update CLAUDE.md with knobRenderer service usage patterns
- [ ] T254 Add JSDoc comments to all public functions in domain modules

### Additional Tests

- [ ] T255 [P] Unit test for defaults.ts built-in presets in `src/domain/knobDesigner/__tests__/defaults.spec.ts` - Verify all 5 templates validate
- [ ] T256 [P] Unit test for validation.ts all validators in `src/domain/knobDesigner/__tests__/validation.spec.ts` - Achieve 95% input validation coverage (SC-008)
- [ ] T256b [P] Comprehensive validation test for all 8+ numeric input types in `src/domain/knobDesigner/__tests__/validation.spec.ts` - diameter, height, bevel, shininess, reflectivity, brush intensity, frame count, frame dimensions (FR-044)
- [ ] T257 Integration test for complete knob workflow in `src/__tests__/knobDesigner.integration.spec.ts` - Open modal, modify design, generate filmstrip, verify bitmap update
- [ ] T257b Manual verification for SC-007: Verify generated filmstrips display correctly in CAnimKnob preview on canvas - document test procedure and expected result
- [ ] T258 **Commit**: Stage and commit polish phase with message "Polish knob designer: performance, errors, accessibility, docs"

---

## Phase 13: Quality Gates (MANDATORY)

**Purpose**: Verify code quality before marking feature complete

**CRITICAL**: ALL three quality gate commands MUST pass with ZERO errors and ZERO warnings before proceeding.

- [ ] TQG-1 **CSS Linting**: Run `npm run lint:css` - Fix ALL errors and warnings
- [ ] TQG-2 **Code Quality**: Run `npm run check` - Fix ALL errors and warnings
- [ ] TQG-3 **Type Safety**: Run `npm run typecheck` - Fix ALL errors and warnings
- [ ] TQG-4 **Verify Clean**: Re-run all three commands to confirm zero issues remain

**If Quality Gates Fail**:
1. STOP - do not proceed to Git Verification
2. FIX all reported errors and warnings
3. RE-RUN the failing command(s)
4. REPEAT until all three commands pass cleanly

**NO EXCEPTIONS**: Even "pre-existing" issues MUST be resolved. The spec is NOT complete until all quality gates pass.

---

## Phase 14: Git Verification (FINAL)

**Purpose**: Ensure all work is committed before marking feature complete

- [ ] TFINAL-1 **Verify Git Status**: Run `git status` to check for uncommitted changes
- [ ] TFINAL-2 **Commit Remaining**: If any unstaged/uncommitted changes exist, stage and commit them with message "Final cleanup for 3D knob designer feature"
- [ ] TFINAL-3 **Confirm Clean**: Verify working tree is clean (nothing to commit)

**CRITICAL**: Do NOT mark the feature as complete until this phase confirms all work is committed.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately after user approval
- **Foundation Types (Phase 2)**: Depends on Phase 1 - BLOCKS Phase 3 and all user stories
- **Foundation Store (Phase 3)**: Depends on Phase 2 - BLOCKS all user stories
- **US1 Part A (Phase 4)**: Depends on Phases 2-3 - Renderer core
- **US1 Part B (Phase 5)**: Depends on Phase 4 - Modal UI
- **US4 (Phase 6)**: Depends on US1 completion - Builds on renderer
- **US6 (Phase 7)**: Depends on US1 completion - Adds lighting controls
- **US2 (Phase 8)**: Depends on US1 completion - Multi-layer support
- **US3 (Phase 9)**: Depends on Phase 3 - Preset management
- **US5 (Phase 10)**: Depends on Phase 3 - Undo/redo
- **Brushed Metal (Phase 11)**: Depends on Phase 4 - Advanced material
- **Polish (Phase 12)**: Depends on all desired user stories
- **Quality Gates (Phase 13)**: Depends on all implementation complete
- **Git Verification (Phase 14)**: Depends on quality gates passing

### User Story Completion Order

1. **US1 (P1)**: MUST complete first - foundational for all others
2. **US2 (P2)**, **US3 (P3)**, **US4 (P3)**: Can proceed in parallel after US1
3. **US5 (P4)**, **US6 (P4)**: Can proceed in parallel after Phase 3

### Parallel Opportunities

**Within Phases**:
- Phase 2: T007-T010 (type definitions) can run in parallel
- Phase 3: T019-T020, T022-T023, T026-T027, T030-T034 can run in parallel
- Phase 4: Scene, geometry, materials tests (T086-T093) can run in parallel
- Phase 5: Component tests (T152-T155) can run in parallel
- Phase 12: T240-T241, T249-T251, T255-T256 can run in parallel

**Between User Stories** (after US1):
- US2, US3, US4 can be implemented in parallel by different developers
- US5, US6 can be implemented in parallel after Phase 3

---

## Parallel Example: Phase 3 (Preset Service)

```bash
# Launch all getter implementations together:
Task: "Implement presetService.get() - Retrieve preset by ID"
Task: "Implement presetService.getByName() - Retrieve preset by name index"
Task: "Implement presetService.getBuiltIn() - Filter built-in presets only"
Task: "Implement presetService.getCustom() - Filter custom presets, sorted"
Task: "Implement presetService.isNameTaken() - Check name uniqueness"
Task: "Implement presetService.getCustomCount() - Count custom presets"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phases 1-3: Setup + Foundation
2. Complete Phases 4-5: User Story 1 (basic knob design + generation)
3. **STOP and VALIDATE**: Test US1 end-to-end
4. Deploy/demo if ready

**Estimated Effort**: ~40-50 tasks for MVP (T001-T158)

### Incremental Delivery

1. Phases 1-3 → Foundation ready
2. Phases 4-5 → US1 complete (MVP!)
3. Phase 6 → US4 (indicators) → Deploy/Demo
4. Phase 7 → US6 (lighting) → Deploy/Demo
5. Phase 8 → US2 (multi-layer) → Deploy/Demo
6. Phase 9 → US3 (presets) → Deploy/Demo
7. Phase 10 → US5 (undo/redo) → Deploy/Demo
8. Phase 11 → Brushed metal → Deploy/Demo
9. Phases 12-14 → Polish and finalize

### Parallel Team Strategy

With 3 developers after US1 completion:
- Developer A: US2 (multi-layer) + US5 (undo/redo)
- Developer B: US3 (presets) + US6 (lighting)
- Developer C: US4 (indicators) + Brushed Metal (Phase 11)

---

## Notes

- [P] tasks = different files, no dependencies within phase
- [Story] label maps task to spec.md user story for traceability
- **Testing Guide**: Use `/testing-guide` skill before writing any test
- **SolidJS Guide**: Use `/solidjs-guide` skill before writing components/stores
- Commit after each major phase completion
- Three.js dependency MUST be approved before Phase 1
- WebGL availability check required at runtime (FR-042)
- IndexedDB fallback to session-only mode (FR-043)
- **IMPORTANT**: Complete Phase 14 Git Verification before marking feature complete
