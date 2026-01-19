# VSTGUI-Edit Architecture Overview

A visual editor for VSTGUI `.uidesc` files (JSON/XML UI descriptions for audio plugins).

**Tech Stack:** SolidJS 1.9.10, Vite 7.3.0, TypeScript 5.9.3 (strict), Vitest 4.0.16, Biome 2.3.11

---

## Directory Structure

```
src/
├── components/       # UI components (panels, editors, canvas, dialogs)
├── domain/           # Business logic organized by functional domain
├── stores/           # SolidJS stores for reactive state management
├── services/         # External services (IndexedDB, Three.js renderer)
├── hooks/            # Custom SolidJS hooks for canvas & hierarchy
├── types/            # Shared TypeScript type definitions
├── styles/           # Global CSS design tokens
└── App.tsx           # Root component
```

---

## Functional Domains

The application is organized into distinct functional domains, each handling a specific area of responsibility.

### 1. Document Processing

| Domain | Location | Purpose |
|--------|----------|---------|
| **Parser** | `domain/parser/` | Parse JSON/XML uidesc files with format auto-detection and AJV schema validation |
| **Serializer** | `domain/serializer/` | Convert documents back to JSON/XML for saving |
| **Create New** | `domain/createNew/` | Factory functions for creating new uidesc documents from templates |

**Key files:**
- `parser/formatDetector.ts` - Detect JSON vs XML format
- `parser/jsonParser.ts`, `parser/xmlParser.ts` - Format-specific parsing
- `parser/validator.ts` - AJV schema validation

### 2. Project Management

| Domain | Location | Purpose |
|--------|----------|---------|
| **Project** | `domain/project/` | Project lifecycle (create, load, save, rename, delete), export, thumbnails |

**Key files:**
- `project/types.ts` - Project, EditorState, SaveStatus types
- `project/export.ts` - Export to JSON/XML/ZIP
- `project/thumbnail.ts` - Generate project thumbnails
- `project/validation.ts` - Project name validation

**Store:** `stores/projectStore.ts` - IndexedDB persistence, auto-save (2s document, 10s state)

### 3. Canvas & Rendering

| Domain | Location | Purpose |
|--------|----------|---------|
| **Canvas** | `domain/canvas/` | Low-level canvas utilities for rendering and interaction |
| **View Mode** | `domain/viewMode/` | Wireframe vs styled rendering modes |
| **Rulers** | `domain/rulers/` | Ruler tick calculations and coordinate mapping |

**Canvas utilities (`domain/canvas/`):**
- `zoom.ts` - Zoom clamping and calculations
- `grid.ts` - Grid overlay logic
- `snap.ts` - Snap-to-grid calculations
- `smartGuides.ts` - Alignment guides during drag
- `move.ts` - View movement calculations
- `resize.ts` - View resize operations
- `marquee.ts` - Rubber-band selection
- `flattenHierarchy.ts` - Convert tree to flat renderable views
- `hitTest.ts` - Click/selection hit testing
- `constrainAxis.ts` - Shift-constrained movement

**Stores:**
- `canvasStore.ts` - Pan offset, zoom level
- `gridStore.ts` - Grid visibility, size, snap settings
- `dragStore.ts` - Transient drag state
- `resizeStore.ts` - Transient resize state
- `marqueeStore.ts` - Rubber-band selection state
- `viewModeStore.ts` - Wireframe/styled toggle

### 4. View Hierarchy & Organization

| Domain | Location | Purpose |
|--------|----------|---------|
| **Hierarchy** | `domain/hierarchy/` | Tree structure, group/ungroup, reorder/reparent |
| **Views** | `domain/views/` | View class definitions and defaults |
| **Templates** | `domain/templates/` | Template management |

**Key files:**
- `hierarchy/buildTree.ts` - Build TreeNode from ViewNode
- `hierarchy/group.ts` - Group/ungroup operations
- `hierarchy/reorder.ts` - Reorder views within parent
- `hierarchy/reparent.ts` - Move views between containers

**Stores:**
- `hierarchyStore.ts` - Expand/collapse state
- `templateStore.ts` - Active template tracking

### 5. Selection & Interaction

| Domain | Location | Purpose |
|--------|----------|---------|
| **Selection** | Handled in stores/hooks | View selection and hover state |
| **Lock/Hide** | `domain/lockHide/` | Lock and hide views (editor-only, not persisted) |

**Stores:**
- `selectionStore.ts` - Selected IDs (Set), hovered ID
- `lockHideStore.ts` - Locked/hidden IDs (Sets)

**Hooks (`hooks/canvas/`):**
- `useCanvasInteractions.ts` - Click/selection/marquee logic
- `useCanvasKeyboard.ts` - Arrow keys, Delete, modifiers
- `useCanvasPan.ts` - Middle-drag & Space+drag
- `useCanvasZoom.ts` - Mouse wheel zoom

### 6. Alignment & Guides

| Domain | Location | Purpose |
|--------|----------|---------|
| **Alignment** | `domain/alignment/` | Align and distribute views |
| **Guides** | `domain/guides/` | Custom guide lines for precise alignment |
| **Smart Guides** | `domain/canvas/smartGuides.ts` | Dynamic alignment guides during drag |

**Key files:**
- `alignment/alignViews.ts` - Align left/center/right/top/middle/bottom
- `alignment/distributeViews.ts` - Distribute horizontally/vertically
- `guides/guideOperations.ts` - Create, delete, reposition guides
- `guides/guideSnap.ts` - Snap to custom guides

**Stores:**
- `guidesStore.ts` - Custom guides, visibility, snap settings
- `smartGuidesStore.ts` - Active alignment guides during drag
- `alignmentToolbarStore.ts` - Docked/floating toolbar state

### 7. Asset Management

| Domain | Location | Purpose |
|--------|----------|---------|
| **Bitmaps** | `domain/bitmaps/` | Bitmap upload, validation, duplicate detection |
| **Colors** | `domain/colors/` | Color definitions, parsing, validation |
| **Fonts** | `domain/fonts/` | Font definitions |
| **Gradients** | `domain/gradients/` | Gradient definitions |
| **Control Tags** | `domain/controlTags/` | Control tag mappings |
| **Variables** | `domain/variables/` | Variable definitions |

**Key files:**
- `bitmaps/fileHandling.ts` - Upload processing
- `bitmaps/duplicateDetection.ts` - Detect duplicate bitmaps
- `colors/parsing.ts` - Parse color strings
- `colors/formatting.ts` - Format colors for display

### 8. Property Editing

| Domain | Location | Purpose |
|--------|----------|---------|
| **Properties** | `domain/properties/` | Property editor metadata and validation |
| **Color Picker** | `domain/colorPicker/` | Advanced color editing utilities |

**Key files:**
- `properties/attributeTypes.ts` - Map attributes to editor types
- `properties/grouping.ts` - Group attributes for display
- `properties/validation.ts` - Validate property values
- `colorPicker/colorConversion.ts` - Hex/RGB/HSL/HSV conversion
- `colorPicker/recentColors.ts` - Recent colors with localStorage

**Store:** `propertiesStore.ts` - Expanded groups state

### 9. Search & Replace

| Domain | Location | Purpose |
|--------|----------|---------|
| **Search** | `domain/search/` | Find/replace with query parsing and filtering |

**Key files:**
- `search/searchQuery.ts` - Parse search input (class names, key:value)
- `search/searchEngine.ts` - Execute search across views
- `search/replaceOperations.ts` - Replace attribute values

**Store:** `searchStore.ts` - Query, results, filters, scope

### 10. History (Undo/Redo)

| Domain | Location | Purpose |
|--------|----------|---------|
| **History** | Various `historyOperations.ts` files | Create immutable operation objects |

**Store:** `historyStore.ts` - Undo/redo stacks (max 100 operations)

Operations are created in domain logic and pushed to history:
- `domain/canvas/move.ts` → `createMoveOperation`
- `domain/canvas/resize.ts` → `createResizeOperation`
- `domain/alignment/historyOperations.ts` → `createAlignmentOperation`
- `domain/guides/historyOperations.ts` → `createGuideCreateOperation`
- `domain/properties/historyOperations.ts` → `createPropertyEditOperation`

### 11. 3D Knob Designer

| Domain | Location | Purpose |
|--------|----------|---------|
| **Knob Designer** | `domain/knobDesigner/` | 3D knob design with Three.js |
| **Knob Renderer** | `services/knobRenderer/` | Three.js rendering service |

**Key files:**
- `knobDesigner/defaults.ts` - Built-in presets (Classic, Modern Flat, Vintage Amp, etc.)
- `knobDesigner/geometry.ts` - Three.js geometry (layers, indicators)
- `knobDesigner/materials.ts` - Materials (solid, metallic, matte, brushed)
- `knobDesigner/scene.ts` - Scene, camera, lighting setup
- `knobDesigner/shaders.ts` - GLSL brushed metal shaders
- `knobDesigner/validation.ts` - Parameter constraints
- `knobDesigner/filmstrip.ts` - Export to filmstrip format

**Store:** `knobDesignerStore.ts` - Design state, presets, generation progress

### 12. AnimKnob Preview

| Domain | Location | Purpose |
|--------|----------|---------|
| **AnimKnob** | `domain/animknob/` | CAnimKnob filmstrip preview |

**Key files:**
- `animknob/bitmapInfo.ts` - Extract bitmap dimensions
- `animknob/frameCalculation.ts` - Calculate frame positions

**Store:** `knobPreviewStore.ts` - Frame index, bitmap info

### 13. Preferences & Settings

| Domain | Location | Purpose |
|--------|----------|---------|
| **Preferences** | `domain/preferences/` | User settings with localStorage persistence |
| **Theme** | `domain/theme/` | Light/dark/system theme management |
| **Shortcuts** | `domain/shortcuts/` | Keyboard shortcuts registry |

**Key files:**
- `preferences/defaults.ts` - Default preference values
- `preferences/persistence.ts` - Load/save to localStorage
- `preferences/migration.ts` - Migrate from legacy keys
- `theme/themeService.ts` - Apply theme, detect OS preference
- `shortcuts/registry.ts` - 44 shortcuts across 10 categories

**Stores:**
- `preferencesStore.ts` - All user preferences
- `shortcutsPanelStore.ts` - Shortcuts panel UI state

---

## Services

### IndexedDB (`services/indexedDB/`)

Persistent storage layer for projects and assets:

| Service | Purpose |
|---------|---------|
| `database.ts` | DB initialization, versioning (v3) |
| `projectService.ts` | CRUD for projects |
| `bitmapService.ts` | Store/retrieve bitmap blobs |
| `presetService.ts` | Store 3D knob designer presets |
| `storageQuota.ts` | Monitor storage usage |

### Knob Renderer (`services/knobRenderer/`)

Three.js rendering service for 3D knob preview and filmstrip generation.

---

## Component Categories

### Layout
- **Canvas** - Main SVG rendering with overlays
- **MainToolbar** - Top toolbar (undo/redo, zoom, project actions)
- **PropertiesPanel** - Right sidebar for property editing
- **ViewPalette** - Left sidebar for view insertion

### Data Panels (Left Sidebar)
- **TemplatesPanel** - Template management
- **HierarchyPanel** - View tree with drag-to-reorder
- **ColorsPanel**, **FontsPanel**, **BitmapsPanel**, **GradientsPanel**
- **ControlTagsPanel**, **VariablesPanel**

### Editors
- **TextEditor**, **PointEditor**, **NumberEditor**, **BooleanEditor**, **EnumEditor**
- **ColorPicker** - HSV gradient, RGB/HSL/HEX inputs, swatches
- **FontPicker**, **BitmapPicker**, **ControlTagPicker**
- **NinepartEditor**, **AutosizeEditor**, **MultiframeEditor**

### Canvas Overlays
- **ViewRectangle**, **SelectionOverlay**, **DragPreview**, **ResizePreview**
- **MarqueeRectangle**, **SmartGuideLines**, **HoverTooltip**
- **GuideLine**, **GuidePreview**, **GuidesOverlay**

### Rulers
- **HorizontalRuler**, **VerticalRuler**, **CursorIndicator**, **TemplateBounds**

### Dialogs
- **ProjectList**, **ProjectNameDialog**, **CreateNewDialog**
- **ConfirmDialog**, **KnobDesignerModal**, **PreferencesPanel**
- **FindPanel**, **MissingBitmapsModal**, **OrphanWarningDialog**

---

## Key Architectural Patterns

### State Management
- **Complex state** → SolidJS `createStore` (documentStore, projectStore)
- **Simple values** → `createSignal`
- **Derived values** → `createMemo`

### History Pattern
- Immutable operation objects with `undo()` and `redo()` functions
- Operations created by domain logic, pushed to `historyStore`
- Max 100 operations in stack

### Selection Pattern
- All selection (click, shift+click, marquee) resolved in `handleMarqueeUp`
- Prevents race conditions between click and marquee events

### Auto-Save Pattern
- Document changes: 2 second debounce
- Editor state: 10 second debounce
- Persists to IndexedDB via `projectStore`

### Modal-Based UI
- Single-page app with no routing
- State controls visibility of modals and panels
- `App.tsx` handles main layout switching

---

## Data Flow

### Document Loading
1. User uploads file → `documentStore.loadFile()`
2. Parser detects format → validates with AJV
3. Document populated in `documentStore`
4. Stores reset (template, canvas, selection)
5. Preferences applied (grid, guides visibility)

### View Editing
1. Canvas interaction → `useCanvasInteractions`
2. `selectionStore` updated
3. `PropertiesPanel` watches selection
4. Editor `onChange` → live preview
5. Editor `onCommit` → history + `documentStore` update
6. `isDirty` triggers auto-save

### Canvas Transformations
- Pan: `canvasStore.updatePan()`
- Zoom: `canvasStore.setZoom()` or `applyZoom()`
- Grid/Snap: `gridStore` settings applied in calculations
- Guides: `guidesStore` for custom, `smartGuidesStore` for dynamic

---

## Type Definitions (`src/types/`)

| File | Purpose |
|------|---------|
| `uidesc.ts` | VSTGUI UIDescription schema types |
| `canvas.ts` | Point, Size, RenderableView, ViewCategory |
| `parser.ts` | ParseResult, ValidationError, FormatType |
| `hierarchy.ts` | TreeNode, DropPosition, GroupOperation |
| `history.ts` | HistoryOperation, DragState |
| `editors.ts` | Editor input types |
| `colorPicker.ts` | ColorValue, ColorFormat, PickerMode |
| `knobDesigner.ts` | 3D knob design types |

---

## Testing

- **Framework:** Vitest 4.0.16
- **Pattern:** Co-located tests (`*.spec.tsx`)
- **Coverage:** ~298 test files, 4000+ tests
- **Style:** Unit tests for domain logic, component tests with Testing Library
