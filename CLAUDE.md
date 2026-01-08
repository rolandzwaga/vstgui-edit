# VSTGUI-Edit Development Guidelines

Auto-generated from speckit templates. Last updated: 2026-01-07

---

## ⛔️⛔️⛔️ CRITICAL: BRANCH WORKFLOW - NEVER COMMIT TO MAIN ⛔️⛔️⛔️

```
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃                                                                              ┃
┃   NEVER COMMIT DIRECTLY TO MAIN BRANCH. ALWAYS USE FEATURE BRANCHES.         ┃
┃                                                                              ┃
┃   BEFORE ANY CODE CHANGE:                                                    ┃
┃   1. Check current branch: git branch --show-current                         ┃
┃   2. If on main, CREATE AND SWITCH to feature branch FIRST                   ┃
┃   3. VERIFY you are on the feature branch before ANY edit                    ┃
┃                                                                              ┃
┃   WORKFLOW:                                                                  ┃
┃   git checkout -b feature-name    # Create AND switch to branch              ┃
┃   git branch --show-current       # VERIFY: must NOT show 'main'             ┃
┃   # NOW you can make changes                                                 ┃
┃                                                                              ┃
┃   ❌ NEVER: Make changes while on main                                       ┃
┃   ❌ NEVER: Commit to main directly                                          ┃
┃   ❌ NEVER: Assume you're on the right branch - ALWAYS verify                ┃
┃                                                                              ┃
┃   VIOLATION = POLLUTED MAIN BRANCH. THIS IS IRREVERSIBLE AFTER PUSH.         ┃
┃                                                                              ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
```

---

## ⛔️⛔️⛔️ CRITICAL: SOLIDJS ONLY - REACT IS FORBIDDEN ⛔️⛔️⛔️

```
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃                                                                              ┃
┃   THIS IS A SOLIDJS PROJECT. REACT IS ABSOLUTELY FORBIDDEN.                 ┃
┃                                                                              ┃
┃   ❌ NEVER use: useState, useEffect, useMemo, useCallback, useRef           ┃
┃   ❌ NEVER import from 'react' or '@types/react'                            ┃
┃   ❌ NEVER use React patterns, lifecycle methods, or virtual DOM concepts   ┃
┃                                                                              ┃
┃   ✅ ALWAYS use: createSignal, createEffect, createMemo, createStore        ┃
┃   ✅ ALWAYS import from 'solid-js' and 'solid-js/store'                     ┃
┃   ✅ ALWAYS use SolidJS fine-grained reactivity patterns                    ┃
┃                                                                              ┃
┃   SolidJS components run ONCE. Signals are getter functions: count()        ┃
┃   Props are reactive - DO NOT destructure them.                             ┃
┃   There are NO dependency arrays - tracking is automatic.                   ┃
┃                                                                              ┃
┃   VIOLATION = IMMEDIATE CODE REJECTION. NO EXCEPTIONS. ZERO TOLERANCE.      ┃
┃                                                                              ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
```

---

## ⛔️⛔️⛔️ CRITICAL: STATIC IMPORTS ONLY - DYNAMIC IMPORTS FORBIDDEN ⛔️⛔️⛔️

```
┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃                                                                              ┃
┃   ALWAYS USE STATIC IMPORTS. DYNAMIC IMPORTS ARE ABSOLUTELY FORBIDDEN.      ┃
┃                                                                              ┃
┃   ❌ NEVER use: import() for lazy loading                                   ┃
┃   ❌ NEVER use: import() for code splitting                                 ┃
┃   ❌ NEVER use: import() for conditional imports                            ┃
┃   ❌ NEVER use: await import() anywhere in application code                 ┃
┃                                                                              ┃
┃   ✅ ALWAYS use: import { x } from 'module' (static imports at top)         ┃
┃   ✅ ONLY exception: vi.importActual() inside vi.mock() in tests            ┃
┃                                                                              ┃
┃   FORBIDDEN:                                                                 ┃
┃     const module = await import('./module');                                ┃
┃     lazy(() => import('./Component'));                                      ┃
┃                                                                              ┃
┃   REQUIRED:                                                                  ┃
┃     import { something } from './module';                                   ┃
┃     import { Component } from './Component';                                ┃
┃                                                                              ┃
┃   VIOLATION = IMMEDIATE CODE REJECTION. NO EXCEPTIONS. ZERO TOLERANCE.      ┃
┃                                                                              ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛
```

---

## Active Technologies
- In-memory state via existing documentStore (027-variables-panel)
- SolidJS 1.9.x, solid-js/store (already installed - no new dependencies) (026-control-tags-panel)
- N/A (in-memory document model) (022-schema-driven-properties)
- SolidJS 1.9.x, Vite 7.x, existing JSON schema (`vstgui-uidesc.schema.json`) (022-schema-driven-properties)
- N/A (in-memory state via existing documentStore) (018-hierarchy-reparenting)
- SolidJS 1.9.10, solid-js/store (already installed) (018-hierarchy-reparenting)
- In-memory SolidJS store (extends existing documentStore) (016-property-editing)
- SolidJS 1.9.10, solid-js/store, @floating-ui/dom 1.7.4 (for picker dropdowns) (016-property-editing)
- N/A (in-memory state via SolidJS signals) (015-smart-guides)
- In-memory SolidJS signals (extends gridStore for snap state) (014-snap-to-grid)
- N/A (extends existing documentStore for view size mutations) (013-view-resize)
- In-memory SolidJS store (documentStore for view origins, new historyStore for undo/redo) (012-view-move)
- N/A (reads from existing documentStore and selectionStore) (011-properties-panel)
- SolidJS 1.9.10, solid-js/store (already installed - no new dependencies) (011-properties-panel)
- TypeScript 5.9.x with strict mode + SolidJS 1.9.x (001-uidesc-upload)
- In-memory SolidJS store for document state (001-uidesc-upload)
- TypeScript 5.9.3 with strict mode enabled + SolidJS 1.9.10, AJV 8.17.1 (already installed), json-schema-to-typescript (dev) (002-uidesc-parsing)
- In-memory SolidJS store (extends existing documentStore from 001-uidesc-upload) (002-uidesc-parsing)
- TypeScript 5.9.3 with strict mode + SolidJS 1.9.10 (no additional dependencies required) (003-canvas-rendering)
- N/A (reads from existing documentStore) (003-canvas-rendering)
- TypeScript 5.9.3 with strict mode enabled + SolidJS 1.9.10 (createSignal for pan state) (004-canvas-pan)
- N/A (pan state is transient, not persisted) (004-canvas-pan)
- TypeScript 5.9.3 with strict mode + SolidJS 1.9.10 (createSignal for zoom state) (005-canvas-zoom)
- N/A (in-memory state only) (005-canvas-zoom)
- TypeScript 5.9.3 with strict mode enabled + SolidJS 1.9.10 (createSignal for component state, createMemo for derived values) (006-zoom-controls)
- N/A (in-memory state via canvasStore) (006-zoom-controls)
- TypeScript 5.9.3 with strict mode enabled + SolidJS 1.9.10 + solid-js, solid-js/store (already installed - no new dependencies) (007-canvas-grid)
- N/A (grid settings are session-only, in-memory via SolidJS signals) (007-canvas-grid)
- TypeScript 5.9.3 with strict mode enabled + SolidJS 1.9.10, @floating-ui/dom 1.7.4 (tooltips) (008-view-selection)
- In-memory SolidJS store (selectionStore) (008-view-selection)
- TypeScript 5.9.3 with strict mode enabled + SolidJS 1.9.10 + solid-js, solid-js/store (already installed - no new dependencies required) (009-marquee-selection)
- N/A (marquee state is transient, in-memory via SolidJS signals) (009-marquee-selection)

**[This section is auto-populated by speckit from feature plans]**

- SolidJS 1.9.10 - Reactive UI framework
- Vite 7.3.0 - Build tool and dev server
- Vitest 4.0.16 - Testing framework
- Biome 2.3.11 - Linting and formatting
- TypeScript 5.9.3 - Type system

## Project Overview

VSTGUI-Edit is a visual editor for VSTGUI UI description files (`.uidesc`). VSTGUI is a cross-platform UI framework commonly used in audio plugin development (VST, AU, AAX).

### Domain Context

- **uidesc files**: JSON/XML UI descriptions defining views, controls, colors, fonts, bitmaps
- **Target users**: Audio plugin developers
- **Key operations**: Load, visualize, edit, and save uidesc files

### Essential Domain Reference

**CRITICAL**: Before working on any uidesc-related functionality, consult:

- **[UIDESC_GUIDE.md](UIDESC_GUIDE.md)** - Comprehensive guide to the VSTGUI UIDescription format
- **[vstgui-uidesc.schema.json](vstgui-uidesc.schema.json)** - JSON Schema for validation

The UIDESC_GUIDE.md covers:
- File format (JSON preferred, XML deprecated)
- All resource definitions (colors, fonts, bitmaps, gradients, control-tags, variables)
- Complete view hierarchy and all 30+ view classes
- Attribute reference for every view type
- VST3 integration and parameter binding
- Best practices for uidesc file design

## Project Structure

```
src/
├── components/       # UI components (panels, editors, controls)
├── domain/          # uidesc parsing, validation, data models
├── lib/             # Core utilities and helpers
├── routes/          # Route/page components
├── services/        # File I/O, undo/redo management
├── stores/          # SolidJS stores for state management
├── styles/          # Global styles and design tokens
├── types/           # TypeScript type definitions
└── utils/           # Utility functions
```

## Commands

```bash
# Development
npm run dev          # Start development server
npm run build        # Production build
npm run preview      # Preview production build

# Testing
npm test             # Run tests once
npm run test:watch   # Run tests in watch mode
npm run test:coverage # Generate coverage report

# Code Quality
npx biome check --write .           # Lint and format
npx stylelint "**/*.css" --fix      # Lint CSS
npx tsc --noEmit                    # TypeScript type checking
```

## Code Style

### General TypeScript Guidelines

- Use TypeScript with strict mode enabled (`"strict": true`)
- Follow Biome rules for code style
- Prefer functional patterns over imperative
- Use explicit types for function parameters and return values
- Avoid `any` type - use proper type narrowing

### Biome Configuration

- **Indent**: 2 spaces
- **Line width**: 100 characters
- **Quotes**: Single quotes
- **Semicolons**: Always
- **Trailing commas**: ES5 style
- **Arrow parens**: As needed

### Styling Guidelines

- Every component uses CSS Modules (`*.module.css`)
- Import styles: `import styles from './Component.module.css'`
- Reference classes: `class={styles.button}`
- Centralized design tokens in `src/styles/tokens.css`
- Use CSS custom properties for theming: `var(--color-primary)`
- Never hardcode color values - use design tokens
- All CSS must pass Stylelint checks

### Component Guidelines

- Component file naming: PascalCase (e.g., `Button.tsx`)
- Utility file naming: camelCase (e.g., `formatDate.ts`)
- Co-locate tests with components (e.g., `Button.spec.tsx`)
- Props interface named `[ComponentName]Props`
- Export components as named exports
- Use SolidJS primitives only (createSignal, createEffect, createMemo)

### Testing Guidelines

- Test files use `.spec.ts` or `.spec.tsx` extension
- Test location: Co-located with source files
- Use descriptive test names (Given-When-Then format)
- Mock external dependencies
- Aim for 80%+ code coverage
- Test edge cases and error paths

### Import Organization

```typescript
// 1. External dependencies
import { createSignal, createEffect } from 'solid-js';
import { useNavigate } from '@solidjs/router';

// 2. Internal absolute imports (if configured)
import { parseUidesc } from '~/domain/parser';

// 3. Relative imports
import { Button } from '../Button';
import styles from './Component.module.css';
```

## Utility Modules

### Document Store (`src/stores/documentStore.ts`)

Global store for uploaded uidesc file content with automatic parsing:

- `documentStore` - Reactive store with upload and parse state
- `loadFile(file: File)` - Read file, store content, and auto-parse
- `reset()` - Clear content and return to idle state
- `setDragging(isDragging: boolean)` - Update drag state

```typescript
import { documentStore, loadFile, reset } from './stores/documentStore';

// Access upload state
console.log(documentStore.content);
console.log(documentStore.uploadState); // 'idle' | 'dragging' | 'loading' | 'success' | 'error'

// Access parse state (auto-populated after upload)
console.log(documentStore.parseState); // 'idle' | 'parsing' | 'valid' | 'invalid'
console.log(documentStore.document); // VSTGUIUIDescription | null
console.log(documentStore.parseErrors); // ValidationError[] | null
console.log(documentStore.detectedFormat); // 'json' | 'xml' | 'unknown' | null

// Load a file (auto-parses on success)
await loadFile(file);

// Reset to initial state
reset();
```

### Canvas Store (`src/stores/canvasStore.ts`)

Global store for canvas pan and zoom state management:

- `canvasStore` - Reactive store with pan offset, panning state, pan start position, and zoom level
- `startPan(x, y)` - Start pan gesture at given mouse position
- `updatePan(x, y)` - Update pan offset by delta from panStart
- `endPan()` - End pan gesture (preserves panOffset)
- `resetPan()` - Reset all pan state to initial values
- `setZoom(level)` - Set zoom level (clamped to 0.1-5.0)
- `resetZoom()` - Reset zoom to 1.0 (100%)
- `zoomIn()` - Zoom in by one step (multiply by ZOOM_FACTOR)
- `zoomOut()` - Zoom out by one step (divide by ZOOM_FACTOR)
- `applyZoom(cursorX, cursorY, wrapperRect, deltaY)` - Apply cursor-centered zoom from wheel
- `fitToView(viewportSize, templateSize)` - Fit template to viewport with 5% padding
- `resetCanvas()` - Reset both pan and zoom to initial values

```typescript
import { canvasStore, startPan, updatePan, endPan, resetPan, setZoom, resetZoom, zoomIn, zoomOut, applyZoom, fitToView, resetCanvas } from './stores/canvasStore';

// Access pan state
console.log(canvasStore.panOffset); // { x: number, y: number }
console.log(canvasStore.isPanning); // boolean
console.log(canvasStore.panStart); // { x: number, y: number } | null

// Access zoom state
console.log(canvasStore.zoomLevel); // number (0.1 to 5.0)

// Pan gesture flow
startPan(100, 100);   // Begin pan at mouse position
updatePan(150, 120);  // Update: panOffset += delta, panStart = current pos
endPan();             // End pan, preserve offset for next gesture

// Zoom operations
setZoom(2.0);         // Set zoom to 200%
zoomIn();             // Zoom in by 10% (ZOOM_FACTOR)
zoomOut();            // Zoom out by 10%
applyZoom(400, 300, rect, -100);  // Zoom in centered on cursor
fitToView({ width: 800, height: 600 }, { width: 400, height: 300 });  // Fit and center

// Reset operations
resetPan();           // Reset pan only
resetZoom();          // Reset zoom only
resetCanvas();        // Reset both pan and zoom
```

### Grid Store (`src/stores/gridStore.ts`)

Global store for canvas grid overlay and snap-to-grid state management:

- `gridStore` - Reactive store with visibility, size, style, and snap state
- `toggleVisibility()` - Toggle grid visibility on/off
- `setGridSize(size)` - Set grid size to a preset value
- `setGridStyle(style)` - Set grid style (lines, dots, crosshairs)
- `toggleSnap()` - Toggle snap-to-grid on/off
- `setSnapThreshold(threshold)` - Set snap threshold (clamped 1-20px)
- `resetGrid()` - Reset all grid and snap settings to defaults
- `GRID_SIZE_PRESETS` - Available size presets: [5, 8, 10, 12, 16, 20]
- `DEFAULT_GRID_SIZE` - Default grid size (10px)
- `DEFAULT_GRID_STYLE` - Default grid style ('lines')
- `MAJOR_LINE_INTERVAL` - Interval for major grid lines (5)

```typescript
import { gridStore, toggleVisibility, setGridSize, setGridStyle, toggleSnap, setSnapThreshold, resetGrid, GRID_SIZE_PRESETS, MAJOR_LINE_INTERVAL } from './stores/gridStore';

// Access grid state
console.log(gridStore.isVisible);     // boolean (default: true)
console.log(gridStore.size);          // GridSizePreset (default: 10)
console.log(gridStore.style);         // GridStyle (default: 'lines')
console.log(gridStore.isSnapEnabled); // boolean (default: true)
console.log(gridStore.snapThreshold); // number (default: 5)

// Toggle visibility
toggleVisibility();  // Toggle grid on/off (also: G key on canvas)

// Toggle snap
toggleSnap();  // Toggle snap on/off (also: Shift+G key on canvas)

// Change grid appearance
setGridSize(20);           // Set to 20px spacing
setGridStyle('dots');      // Options: 'lines', 'dots', 'crosshairs'

// Change snap threshold
setSnapThreshold(8);  // Views within 8px of grid line will snap

// Reset to defaults
resetGrid();  // Visibility: true, Size: 10, Style: 'lines', Snap: true, Threshold: 5
```

### Smart Guides Store (`src/stores/smartGuidesStore.ts`)

Global store for smart guides feature state management:

- `smartGuidesStore` - Reactive store with isEnabled and activeGuides
- `toggleSmartGuides()` - Toggle smart guides on/off
- `setActiveGuides(guides)` - Set currently active guide lines (during drag)
- `clearActiveGuides()` - Clear all active guides (on drag end)
- `resetSmartGuides()` - Reset to default state (enabled, no guides)
- `DEFAULT_GUIDES_ENABLED` - Default enabled state (true)

```typescript
import { smartGuidesStore, toggleSmartGuides, setActiveGuides, clearActiveGuides, resetSmartGuides } from './stores/smartGuidesStore';

// Access smart guides state
console.log(smartGuidesStore.isEnabled);    // boolean (default: true)
console.log(smartGuidesStore.activeGuides); // SmartGuide[]

// Toggle visibility (also: S key on canvas)
toggleSmartGuides();

// Set guides during drag operation
setActiveGuides([
  { id: 'v-1', orientation: 'vertical', position: 100, type: 'edge', participatingViewIds: ['a', 'b'] }
]);

// Clear guides on drag end
clearActiveGuides();

// Reset for testing
resetSmartGuides();
```

### Grid Utilities (`src/domain/canvas/grid.ts`)

Grid calculation utilities:

- `isMajorLine(index)` - Check if line index is a major line
- `calculateLineCount(dimension, gridSize)` - Calculate number of grid lines
- `getPatternId(style, size)` - Generate unique SVG pattern ID
- `isValidGridSize(size)` - Type guard for GridSizePreset

```typescript
import { isMajorLine, calculateLineCount, isValidGridSize } from './domain/canvas/grid';

const isMajor = isMajorLine(5);  // true (every 5th line)
const lines = calculateLineCount(500, 10);  // 50 lines
const valid = isValidGridSize(10);  // true
```

### Snap Utilities (`src/domain/canvas/snap.ts`)

Snap-to-grid calculation utilities for move and resize operations:

- `getEffectiveThreshold(threshold, gridSize)` - Clamps threshold to gridSize/2
- `snapToGrid(value, gridSize, threshold)` - Snaps coordinate to nearest grid line
- `snapPoint(point, gridSize, threshold)` - Snaps 2D point (x, y independently)
- `snapEdges(bounds, handle, gridSize, threshold)` - Snaps view edges during resize
- `applySnapToMove(origins, anchorId, gridSize, threshold)` - Snaps multi-view move
- `applySnapToResize(origin, size, handle, gridSize, threshold)` - Snaps resize bounds

```typescript
import { snapToGrid, snapPoint, applySnapToMove, applySnapToResize, getEffectiveThreshold } from './domain/canvas/snap';

// Snap single coordinate
const result = snapToGrid(23, 10, 5);
// result: { snapped: true, value: 20, snapDelta: -3, gridLine: 20 }

// Snap 2D point
const pointResult = snapPoint({ x: 23, y: 47 }, 10, 5);
// pointResult.point: { x: 20, y: 50 }

// Snap multi-view move (anchor view snaps, others follow)
const moveResult = applySnapToMove(
  { anchor: { x: 23, y: 47 }, other: { x: 100, y: 150 } },
  'anchor', 10, 5
);
// moveResult.snappedOrigins: { anchor: { x: 20, y: 50 }, other: { x: 97, y: 153 } }

// Snap resize edges
const resizeResult = applySnapToResize({ x: 50, y: 50 }, { width: 103, height: 78 }, 'se', 10, 5);
// resizeResult: { origin: { x: 50, y: 50 }, size: { width: 100, height: 80 }, didSnap: true }

// Get effective threshold (clamped to gridSize/2)
const threshold = getEffectiveThreshold(10, 16);  // 8 (clamped)
```

**Snap Behavior**:
- Snap only applies when `gridStore.isSnapEnabled` is true AND grid is visible
- Alt key temporarily disables snap during drag/resize
- Multi-view moves: anchor view snaps, all others maintain relative positions
- Resize: edges being dragged snap, minimum view size (10px) takes precedence

### Smart Guides Utilities (`src/domain/canvas/smartGuides.ts`)

Utilities for calculating alignment and spacing guides during drag operations:

- `GUIDE_THRESHOLD` - Alignment threshold (5 pixels)
- `getViewBounds(view)` - Convert RenderableView to ViewBounds with edges and centers
- `isWithinThreshold(distance)` - Check if distance is within guide threshold
- `createGuide(orientation, position, type, viewIds)` - Factory for SmartGuide objects
- `findEdgeAlignments(dragged, siblings)` - Find edge-to-edge alignments
- `findCenterAlignments(dragged, siblings)` - Find center-to-center alignments
- `findParentCenterGuides(dragged, parent)` - Find alignment with parent center
- `findSpacingGuides(dragged, siblings)` - Find equal spacing between views
- `calculateSmartGuides(dragged, siblings, parentBounds?)` - Orchestrate all guide calculations

```typescript
import { getViewBounds, calculateSmartGuides, findSpacingGuides, GUIDE_THRESHOLD } from './domain/canvas/smartGuides';

// Convert RenderableView to bounds
const bounds = getViewBounds(view);
// bounds: { id, left, right, top, bottom, centerX, centerY }

// Calculate all guides for a dragged view
const guides = calculateSmartGuides(draggedBounds, siblingBounds, parentBounds);
// Returns: SmartGuide[] with edge, center, parent-center, and spacing guides

// Find spacing guides (equal gaps)
const spacingGuides = findSpacingGuides(draggedBounds, siblingBounds);
// Returns: SpacingGuide[] with distance, measureStart, measureEnd
```

**Guide Types**:
- `edge` - View edge aligns with sibling edge (left/right/top/bottom)
- `center` - View center aligns with sibling center (horizontal/vertical)
- `parent-center` - View center aligns with parent container center
- `spacing` - Equal gap between view and two adjacent siblings

### Selection Store (`src/stores/selectionStore.ts`)

Global store for view selection and hover state management:

- `selectionStore` - Reactive store with selectedIds and hoveredId
- `select(viewId)` - Select a single view, clearing previous selection
- `clearSelection()` - Deselect all views
- `toggleSelect(viewId)` - Add/remove view from multi-selection (Shift+click)
- `selectAll(viewIds)` - Select all views (Ctrl+A)
- `setHovered(viewId)` - Set hovered view for tooltip display
- `isSelected(viewId)` - Check if a view is selected
- `resetSelection()` - Reset all selection state

```typescript
import { selectionStore, select, clearSelection, toggleSelect, selectAll, setHovered, isSelected, resetSelection } from './stores/selectionStore';

// Access selection state
console.log(selectionStore.selectedIds); // Set<string>
console.log(selectionStore.hoveredId);   // string | null

// Single selection
select('view-1');              // Select one view, clear others
clearSelection();              // Deselect all

// Multi-selection (Shift+click behavior)
select('view-1');              // Select first
toggleSelect('view-2');        // Add second
toggleSelect('view-2');        // Remove second (toggle off)

// Select all (Ctrl+A)
selectAll(['view-1', 'view-2', 'view-3']);

// Hover tracking (for tooltips)
setHovered('view-1');          // Set hover
setHovered(null);              // Clear hover

// Check selection
if (isSelected('view-1')) {
  // View is selected
}

// Reset for testing
resetSelection();
```

### Hierarchy Store (`src/stores/hierarchyStore.ts`)

Global store for hierarchy panel expand/collapse state:

- `hierarchyStore` - Reactive store with expandedIds
- `toggleExpanded(nodeId)` - Toggle expand/collapse for a node
- `expandNode(nodeId)` - Expand a node (no-op if already expanded)
- `collapseNode(nodeId)` - Collapse a node (no-op if already collapsed)
- `expandAll(nodeIds)` - Expand multiple nodes at once
- `isExpanded(nodeId)` - Check if a node is expanded
- `resetHierarchy()` - Reset all state (collapse all nodes)

```typescript
import { hierarchyStore, toggleExpanded, expandNode, collapseNode, expandAll, isExpanded, resetHierarchy } from './stores/hierarchyStore';

// Access expand state
console.log(hierarchyStore.expandedIds); // Set<string>

// Toggle expand/collapse
toggleExpanded('node-1');  // Expand if collapsed, collapse if expanded

// Expand/collapse specific nodes
expandNode('node-1');      // Expand (no-op if already expanded)
collapseNode('node-1');    // Collapse (no-op if already collapsed)

// Expand all containers on initial load
expandAll(['root', 'child-1', 'child-2']);

// Check if expanded
if (isExpanded('node-1')) {
  // Node is expanded
}

// Reset for testing
resetHierarchy();
```

### Properties Store (`src/stores/propertiesStore.ts`)

Global store for properties panel group expand/collapse state:

- `propertiesStore` - Reactive store with expandedGroups
- `toggleGroup(groupId)` - Toggle expand/collapse for a group (no-op for identity)
- `expandGroup(groupId)` - Expand a group (no-op if already expanded or identity)
- `collapseGroup(groupId)` - Collapse a group (no-op if already collapsed or identity)
- `isGroupExpanded(groupId)` - Check if a group is expanded (always true for identity)
- `resetProperties()` - Reset all groups to default expanded state

```typescript
import { propertiesStore, toggleGroup, expandGroup, collapseGroup, isGroupExpanded, resetProperties } from './stores/propertiesStore';

// Access expand state
console.log(propertiesStore.expandedGroups); // Set<AttributeGroupId>

// Toggle expand/collapse
toggleGroup('geometry');  // Toggle (no-op for 'identity')

// Expand/collapse specific groups
expandGroup('appearance');  // Expand
collapseGroup('behavior');  // Collapse

// Check if expanded
if (isGroupExpanded('text')) {
  // Group is expanded
}

// Reset for testing (expands all except identity which is always shown)
resetProperties();
```

### Properties Domain (`src/domain/properties/`)

Utilities for attribute grouping, multi-selection merging, type classification, validation, and history operations:

- `ATTRIBUTE_GROUP_MAP` - Map of attribute names to group categories
- `getAttributeGroup(name)` - Get group ID for an attribute name
- `groupAttributes(attrs)` - Group single view's attributes by category
- `mergeSelections(viewAttrs, classNames)` - Merge attributes from multiple views
- `ATTRIBUTE_TYPE_MAP` - Map of attribute names to editor types
- `getAttributeType(name)` - Get editor type for an attribute
- `validatePoint(value)` - Validate "x, y" format
- `validateSize(value)` - Validate "w, h" format
- `validateNumber(value, min?, max?)` - Validate numeric string
- `validateBoolean(value)` - Validate "true"/"false" string
- `validateColor(value)` - Validate hex color (#RRGGBB or #RRGGBBAA)
- `createPropertyEditOperation(data, updateFn)` - Create HistoryOperation for property edits

```typescript
import { ATTRIBUTE_GROUP_MAP, getAttributeGroup, groupAttributes, mergeSelections } from './domain/properties';

// Get group for attribute
const group = getAttributeGroup('origin'); // 'geometry'
const group = getAttributeGroup('custom-attr'); // 'other'

// Group single view's attributes
const groups = groupAttributes({ class: 'CView', origin: '0, 0' });
// Returns: AttributeGroup[] sorted by priority

// Merge multi-selection attributes
const result = mergeSelections(
  [{ class: 'CView', origin: '0, 0' }, { class: 'CView', origin: '10, 10' }],
  ['CView', 'CView']
);
// Returns: GroupedAttributes with shared values and 'Mixed' indicators
```

```typescript
import { getAttributeType, ATTRIBUTE_TYPE_MAP } from './domain/properties/attributeTypes';
import { validatePoint, validateColor, validateNumber } from './domain/properties/validation';
import { createPropertyEditOperation } from './domain/properties/historyOperations';

// Get editor type for attribute
getAttributeType('origin');         // 'point'
getAttributeType('background-color'); // 'color'
getAttributeType('font');           // 'font'
getAttributeType('autosize');       // 'enum'
getAttributeType('visible');        // 'boolean'
getAttributeType('title');          // 'text' (default)

// Validate attribute values
validatePoint('10, 20');      // { valid: true }
validatePoint('invalid');     // { valid: false, error: 'Invalid point...' }
validateColor('#FF5500FF');   // { valid: true }
validateNumber('42', 0, 100); // { valid: true }

// Create undo/redo operation for property edit
const operation = createPropertyEditOperation(
  { viewId: 'view-1', attribute: 'origin', oldValue: '0, 0', newValue: '10, 20' },
  updateViewAttribute
);
pushOperation(operation);
```

### Editor Components (`src/components/editors/`)

Property editor components for the PropertiesPanel:

- `TextEditor` - Free-form string input (title, tooltip, etc.)
- `PointEditor` - "x, y" coordinate pairs with validation
- `BooleanEditor` - Checkbox toggle for boolean attributes
- `NumberEditor` - Numeric input with +/-, min/max/step, ArrowUp/ArrowDown keys
- `EnumEditor` - Dropdown for fixed options (uses @floating-ui/dom)
- `ColorPicker` - Document colors + hex input + predefined colors (~)
- `FontPicker` - Dropdown for document fonts
- `BitmapPicker` - Dropdown for document bitmaps

```typescript
import { TextEditor } from './components/editors/TextEditor';
import { PointEditor } from './components/editors/PointEditor';
import { BooleanEditor } from './components/editors/BooleanEditor';
import { NumberEditor } from './components/editors/NumberEditor';
import { EnumEditor } from './components/editors/EnumEditor';
import { ColorPicker } from './components/editors/ColorPicker';
import { FontPicker } from './components/editors/FontPicker';
import { BitmapPicker } from './components/editors/BitmapPicker';

// TextEditor - for strings
<TextEditor value="Hello" onChange={setValue} onCommit={commitValue} />

// PointEditor - validates "x, y" format
<PointEditor value="10, 20" onChange={setValue} onCommit={commitValue} />

// BooleanEditor - checkbox toggle
<BooleanEditor value="true" onChange={handleToggle} onCommit={commitValue} />

// NumberEditor - with constraints
<NumberEditor
  value="50"
  min={0}
  max={100}
  step={1}
  onChange={setValue}
  onCommit={commitValue}
/>

// EnumEditor - dropdown for fixed options
<EnumEditor
  value="left"
  options={[
    { value: 'left', label: 'Left' },
    { value: 'center', label: 'Center' },
    { value: 'right', label: 'Right' }
  ]}
  onChange={setValue}
  onCommit={commitValue}
/>

// ColorPicker - document colors + hex + predefined
<ColorPicker
  value="#FF5500FF"
  documentColors={{ Background: '#000000FF', Highlight: '#FF0000FF' }}
  onChange={setValue}
  onCommit={commitValue}
/>

// FontPicker - document fonts
<FontPicker
  value="~ NormalFont"
  documentFonts={{ NormalFont: { ... }, BoldFont: { ... } }}
  onChange={setValue}
  onCommit={commitValue}
/>

// BitmapPicker - document bitmaps
<BitmapPicker
  value="background.png"
  documentBitmaps={{ 'background.png': '...', 'icon.png': '...' }}
  onChange={setValue}
  onCommit={commitValue}
/>
```

**Editor Behavior**:
- `onChange` fires on each keystroke/interaction (live preview)
- `onCommit` fires on blur/Enter (creates undo history entry)
- Invalid values show red border but don't commit
- Escape key reverts to last committed value
- All editors support keyboard navigation

### Hierarchy Utilities (`src/domain/hierarchy/buildTree.ts`)

Utilities for building and traversing the view tree:

- `buildTree(view, id, depth?)` - Transform ViewNode to TreeNode for rendering
- `getContainerIds(tree)` - Get IDs of all nodes with children (for expandAll)
- `getTreeAncestorIds(targetId, tree)` - Get ancestor IDs from root to target

```typescript
import { buildTree, getContainerIds, getTreeAncestorIds } from './domain/hierarchy';

// Build tree from ViewNode (from uidesc document)
const tree = buildTree(templateView, 'root');
// Returns: TreeNode with id, label, category, hasChildren, depth, children[]

// Get all container IDs for expanding all
const containerIds = getContainerIds(tree);
// Returns: ['root', 'container-1', 'container-2']

// Get ancestors for auto-expand on selection
const ancestors = getTreeAncestorIds('deep-child', tree);
// Returns: ['root', 'parent-1'] - path from root to parent of target
```

### Marquee Store (`src/stores/marqueeStore.ts`)

Global store for marquee (rubber-band) selection state:

- `marqueeStore` - Reactive store with active state, points, additive mode, and previous selection
- `startMarquee(point, additive, currentSelection)` - Begin marquee at point, capture current selection
- `updateMarquee(point)` - Update current point during drag (no-op if inactive)
- `completeMarquee()` - End marquee and reset state
- `cancelMarquee()` - Cancel marquee and reset state
- `resetMarquee()` - Reset all state to initial values

```typescript
import { marqueeStore, startMarquee, updateMarquee, completeMarquee, cancelMarquee, resetMarquee } from './stores/marqueeStore';

// Access marquee state
console.log(marqueeStore.isActive);           // boolean
console.log(marqueeStore.startPoint);         // CanvasPoint | null
console.log(marqueeStore.currentPoint);       // CanvasPoint | null
console.log(marqueeStore.isAdditive);         // boolean (Shift held)
console.log(marqueeStore.previousSelection);  // Set<string> (for cancel restore)

// Marquee gesture flow
startMarquee({ x: 10, y: 10 }, false, selectionStore.selectedIds);  // Begin
updateMarquee({ x: 100, y: 100 });  // Update during drag
completeMarquee();                   // End and reset

// Cancel (restore previous selection)
cancelMarquee();

// Reset for testing
resetMarquee();
```

### History Store (`src/stores/historyStore.ts`)

Global store for undo/redo history management:

- `historyStore` - Reactive store with canUndo, canRedo, undoDescription, redoDescription
- `pushOperation(op)` - Push operation to undo stack, clear redo stack
- `undo()` - Pop from undo stack, execute undo, push to redo stack
- `redo()` - Pop from redo stack, execute redo, push to undo stack
- `clearHistory()` - Clear both stacks
- `resetHistory()` - Alias for clearHistory (testing)
- `HISTORY_STACK_LIMIT` - Maximum 100 operations (oldest dropped when exceeded)

```typescript
import { historyStore, pushOperation, undo, redo, clearHistory, resetHistory } from './stores/historyStore';
import type { HistoryOperation } from './types/history';

// Access history state
console.log(historyStore.canUndo);         // boolean
console.log(historyStore.canRedo);         // boolean
console.log(historyStore.undoDescription); // string | null
console.log(historyStore.redoDescription); // string | null

// Push a move operation
const op: HistoryOperation = {
  type: 'move',
  description: 'Move view',
  timestamp: Date.now(),
  undo: () => { /* restore original positions */ },
  redo: () => { /* apply new positions */ },
};
pushOperation(op);

// Undo/redo
undo();  // Calls op.undo(), moves to redo stack
redo();  // Calls op.redo(), moves back to undo stack

// Clear all history
clearHistory();
```

### Drag Store (`src/stores/dragStore.ts`)

Global store for drag-to-move operation state (transient):

- `dragStore` - Reactive store with isDragging, startPoint, currentPoint, originalOrigins, constrainedAxis, delta
- `startDrag(point, origins)` - Begin drag at canvas point with original view origins
- `updateDrag(point, shiftHeld)` - Update current point, detect axis constraint if Shift held
- `endDrag()` - End drag (keeps state for commit)
- `cancelDrag()` - Cancel and reset all state
- `resetDrag()` - Reset all state to initial values

```typescript
import { dragStore, startDrag, updateDrag, endDrag, cancelDrag, resetDrag } from './stores/dragStore';

// Access drag state
console.log(dragStore.isDragging);       // boolean
console.log(dragStore.startPoint);       // Point | null
console.log(dragStore.currentPoint);     // Point | null
console.log(dragStore.originalOrigins);  // Record<string, Point>
console.log(dragStore.constrainedAxis);  // 'horizontal' | 'vertical' | null
console.log(dragStore.delta);            // Point (computed: currentPoint - startPoint, constrained)

// Drag gesture flow
const origins = { 'view-1': { x: 50, y: 50 } };
startDrag({ x: 100, y: 100 }, origins);  // Begin drag
updateDrag({ x: 150, y: 120 }, false);   // Move (delta: {x: 50, y: 20})
updateDrag({ x: 160, y: 125 }, true);    // Move with Shift (locks axis after 5px)
endDrag();                               // End drag, commit position

// Cancel drag (restores original positions)
cancelDrag();

// Reset for testing
resetDrag();
```

### Resize Store (`src/stores/resizeStore.ts`)

Global store for resize operation state (transient):

- `resizeStore` - Reactive store with isResizing, activeHandle, viewId, startPoint, currentPoint, originalOrigin, originalSize, newOrigin, newSize
- `startResize(handle, viewId, point, origin, size)` - Begin resize at canvas point with original view bounds
- `updateResize(point, shiftHeld, altHeld)` - Update current point, apply aspect ratio (Shift) or center resize (Alt)
- `endResize()` - End resize (keeps state for commit)
- `cancelResize()` - Cancel and reset all state
- `resetResize()` - Reset all state to initial values

```typescript
import { resizeStore, startResize, updateResize, endResize, cancelResize, resetResize } from './stores/resizeStore';

// Access resize state
console.log(resizeStore.isResizing);     // boolean
console.log(resizeStore.activeHandle);   // HandlePosition | null ('nw', 'n', 'ne', etc.)
console.log(resizeStore.viewId);         // string | null
console.log(resizeStore.startPoint);     // Point | null
console.log(resizeStore.currentPoint);   // Point | null
console.log(resizeStore.originalOrigin); // Point | null
console.log(resizeStore.originalSize);   // Size | null
console.log(resizeStore.newOrigin);      // Point (computed during resize)
console.log(resizeStore.newSize);        // Size (computed during resize)

// Resize gesture flow
startResize('se', 'view-1', { x: 200, y: 200 }, { x: 100, y: 100 }, { width: 100, height: 100 });
updateResize({ x: 220, y: 220 }, false, false);  // Normal resize
updateResize({ x: 240, y: 240 }, true, false);   // Shift: maintain aspect ratio
updateResize({ x: 260, y: 260 }, false, true);   // Alt: resize from center
updateResize({ x: 280, y: 280 }, true, true);    // Shift+Alt: both
endResize();

// Cancel resize (restores original size)
cancelResize();

// Reset for testing
resetResize();
```

### Resize Utilities (`src/domain/canvas/resize.ts`)

Utilities for calculating resize bounds with modifier key support:

- `formatSize(size)` - Format size as "w, h" string for uidesc
- `clampToMinimumSize(bounds, handle, minSize?)` - Clamp bounds to minimum 10x10
- `calculateResizeBounds(handle, origin, size, delta, options?)` - Calculate new bounds
- `createResizeOperation(data, updateOrigin, updateSize)` - Create HistoryOperation for resize

```typescript
import { formatSize, clampToMinimumSize, calculateResizeBounds, createResizeOperation } from './domain/canvas/resize';

// Format for uidesc attribute
const sizeStr = formatSize({ width: 200, height: 150 });
// "200, 150"

// Calculate resize bounds
const bounds = calculateResizeBounds(
  'se',                           // handle position
  { x: 100, y: 100 },            // original origin
  { width: 100, height: 100 },   // original size
  { x: 20, y: 10 },              // delta from drag
  { maintainAspectRatio: true, resizeFromCenter: false }
);
// bounds.origin: { x: 100, y: 100 }, bounds.size: { width: 120, height: 120 }

// Clamp to minimum size
const clamped = clampToMinimumSize(bounds, 'se');
// Ensures width >= 10 and height >= 10

// Create history operation
const operation = createResizeOperation(
  { viewId, originalOrigin, originalSize, newOrigin, newSize },
  updateViewOrigin,
  updateViewSize
);
pushOperation(operation);
```

### Move Utilities (`src/domain/canvas/move.ts`)

Utilities for calculating and applying move deltas:

- `calculateDelta(start, current)` - Calculate delta between two points
- `applyDelta(origin, delta)` - Apply delta to a point
- `applyDeltaToAll(origins, delta)` - Apply delta to multiple origins
- `formatOrigin(point)` - Format point as "x, y" string for uidesc
- `createMoveOperation(data, updateViewOrigin)` - Create HistoryOperation for move

```typescript
import { calculateDelta, applyDelta, applyDeltaToAll, formatOrigin, createMoveOperation } from './domain/canvas/move';

// Calculate delta between start and current position
const delta = calculateDelta({ x: 100, y: 100 }, { x: 150, y: 120 });
// { x: 50, y: 20 }

// Apply delta to single origin
const newOrigin = applyDelta({ x: 50, y: 50 }, delta);
// { x: 100, y: 70 }

// Apply delta to multiple origins
const newOrigins = applyDeltaToAll({ 'view-1': { x: 50, y: 50 } }, delta);
// { 'view-1': { x: 100, y: 70 } }

// Format for uidesc attribute
const originStr = formatOrigin({ x: 100, y: 70 });
// "100, 70"

// Create history operation
const operation = createMoveOperation(
  { viewIds: ['view-1'], originalOrigins, newOrigins },
  updateViewOrigin
);
pushOperation(operation);
```

### Constrain Axis Utilities (`src/domain/canvas/constrainAxis.ts`)

Utilities for shift-constrained axis movement:

- `AXIS_LOCK_THRESHOLD` - Minimum 5px movement before axis locks
- `determineConstraintAxis(delta)` - Determine axis based on initial movement direction
- `constrainDelta(delta, axis)` - Zero out perpendicular axis component

```typescript
import { AXIS_LOCK_THRESHOLD, determineConstraintAxis, constrainDelta } from './domain/canvas/constrainAxis';

// Determine axis from initial movement
const axis = determineConstraintAxis({ x: 10, y: 2 });  // 'horizontal'
const axis = determineConstraintAxis({ x: 2, y: 10 });  // 'vertical'
const axis = determineConstraintAxis({ x: 3, y: 2 });   // null (below threshold)

// Apply constraint to delta
const constrained = constrainDelta({ x: 50, y: 30 }, 'horizontal');
// { x: 50, y: 0 }
```

### Ancestor Utilities (`src/domain/canvas/ancestors.ts`)

Utilities for traversing view hierarchy to find ancestors:

- `getAncestorIds(viewId, allViews)` - Get all ancestor IDs from immediate parent to root
- `isAncestorOfSelected(viewId, selectedIds, allViews)` - Check if view is ancestor of any selected view

```typescript
import { getAncestorIds, isAncestorOfSelected } from './domain/canvas/ancestors';

// Get ancestors for parent highlighting
const ancestors = getAncestorIds('leaf-view', allViews);
// Returns: ['parent-view', 'root-view'] - ordered from immediate parent to root

// Check if view should show parent highlight
const shouldHighlight = isAncestorOfSelected('parent-view', selectedIds, allViews);
```

### Marquee Utilities (`src/domain/canvas/marquee.ts`)

Utilities for marquee (rubber-band) selection:

- `MIN_MARQUEE_SIZE` - Minimum size threshold (5px)
- `normalizeRect(start, current)` - Normalize drag points to positive-dimension rectangle
- `isMinimumSize(start, current)` - Check if drag exceeds minimum threshold
- `rectIntersect(a, b)` - Check if two rectangles intersect
- `findIntersectingViews(marqueeRect, views)` - Get IDs of views that intersect marquee

```typescript
import { MIN_MARQUEE_SIZE, normalizeRect, isMinimumSize, rectIntersect, findIntersectingViews } from './domain/canvas/marquee';

// Normalize any drag direction to positive rectangle
const rect = normalizeRect({ x: 100, y: 100 }, { x: 50, y: 50 });
// { x: 50, y: 50, width: 50, height: 50 }

// Check if drag is large enough to be a marquee (not a click)
const isMarquee = isMinimumSize(start, current);  // true if >= 5x5

// Check rectangle intersection
const intersects = rectIntersect(rectA, rectB);

// Find views within marquee
const selectedIds = findIntersectingViews(marqueeRect, renderableViews);
```

### Zoom Utilities (`src/domain/canvas/zoom.ts`)

Zoom calculation utilities for cursor-centered zooming:

- `MIN_ZOOM` - Minimum zoom level (0.1 = 10%)
- `MAX_ZOOM` - Maximum zoom level (5.0 = 500%)
- `ZOOM_FACTOR` - Zoom factor per wheel tick (1.1 = 10%)
- `clampZoom(zoom)` - Clamp zoom to valid range
- `calculateNewZoom(current, deltaY)` - Calculate new zoom from wheel delta
- `calculateZoomPanAdjustment(cursorX, cursorY, rect, pan, oldZoom, newZoom)` - Calculate pan offset for cursor-centered zoom
- `formatZoomPercent(zoom)` - Format zoom level as percentage string (e.g., "150%")

```typescript
import { MIN_ZOOM, MAX_ZOOM, clampZoom, calculateNewZoom, formatZoomPercent } from './domain/canvas/zoom';

const newZoom = calculateNewZoom(1.0, -100); // 1.1 (zoom in)
const clamped = clampZoom(10.0); // 5.0 (max)
const display = formatZoomPercent(1.5); // "150%"
```

### Fit-to-View Utilities (`src/domain/canvas/fitToView.ts`)

Calculates zoom and pan to fit a template within a viewport:

- `calculateFitZoom(templateSize, viewportSize, padding?)` - Calculate zoom and pan to fit template
- `DEFAULT_PADDING` - Default padding (0.05 = 5%)

```typescript
import { calculateFitZoom, DEFAULT_PADDING } from './domain/canvas/fitToView';

const result = calculateFitZoom(
  { width: 800, height: 600 },   // template size
  { width: 1200, height: 800 },  // viewport size
  0.05                            // optional padding (default 5%)
);
// result: { zoom: 0.9, panX: 240, panY: 130 }

// Note: zoom is capped at 1.0 (100%) for small templates
```

### Parser Module (`src/domain/parser/`)

Parses and validates uidesc files in JSON or XML format:

- `parseUidesc(content: string)` - Auto-detect format and parse content
- `detectFormat(content: string)` - Detect 'json', 'xml', or 'unknown'
- `validateUidesc(document: unknown)` - Validate against JSON schema with AJV
- `parseJson(content: string)` - Parse and validate JSON content
- `parseXml(content: string)` - Parse XML and convert to JSON structure
- `xmlToJson(doc: Document)` - Convert XML DOM to JSON with path mapping

```typescript
import { parseUidesc, detectFormat, validateUidesc } from './domain/parser';

// Parse any uidesc content (auto-detects format)
const result = parseUidesc(content);
if (result.success) {
  console.log(result.document); // VSTGUIUIDescription
  console.log(result.format); // 'json' | 'xml'
} else {
  console.log(result.errors); // ValidationError[]
}

// Detect format only
const format = detectFormat(content); // 'json' | 'xml' | 'unknown'

// Validate a parsed document
const validation = validateUidesc(jsonObject);
if (!validation.valid) {
  console.log(validation.errors); // ValidationError[]
}
```

### Parser Types (`src/types/parser.ts`)

```typescript
type FormatType = 'json' | 'xml' | 'unknown';
type ParseState = 'idle' | 'parsing' | 'valid' | 'invalid';

interface ValidationError {
  type: 'syntax' | 'schema' | 'format';
  message: string;
  path?: string;      // JSON path (e.g., '/vstgui-ui-description/colors/Background')
  xmlPath?: string;   // Original XML location for converted files
  line?: number;
  column?: number;
}

type ParseResult =
  | { success: true; document: VSTGUIUIDescription; format: FormatType }
  | { success: false; errors: ValidationError[]; format: FormatType };
```

### Canvas Domain Module (`src/domain/canvas/`)

Renderer-agnostic utilities for transforming uidesc view data into renderable structures:

- `parsePoint(origin: string | undefined)` - Parse "x, y" origin string to Point
- `parseSize(size: string | undefined)` - Parse "w, h" size string to Size
- `flattenHierarchy(root, rootId?)` - Flatten view tree to RenderableView array
- `formatLabel(className, category?)` - Format view class name for display
- `getViewCategory(className)` - Classify view by category (container/control/display/custom)

```typescript
import {
  parsePoint,
  parseSize,
  flattenHierarchy,
  formatLabel,
  getViewCategory,
} from './domain/canvas';

// Parse coordinate strings
const point = parsePoint('50, 100'); // { x: 50, y: 100 }
const size = parseSize('200, 80');   // { width: 200, height: 80 }

// Flatten view hierarchy for rendering
const views = flattenHierarchy(templateView, 'MainView');
// Returns: RenderableView[] with absoluteX, absoluteY, zIndex

// Format labels with [Custom] indicator
formatLabel('CTextButton', 'control');    // 'CTextButton'
formatLabel('MyCustomView', 'custom');    // 'MyCustomView [Custom]'

// Classify views by category
getViewCategory('CViewContainer'); // 'container'
getViewCategory('CTextButton');    // 'control'
getViewCategory('CTextLabel');     // 'display'
getViewCategory('UnknownClass');   // 'custom'
```

### Canvas Types (`src/types/canvas.ts`)

```typescript
type ViewCategory = 'container' | 'control' | 'display' | 'custom';

interface Point { x: number; y: number; }
interface Size { width: number; height: number; }

interface RenderableView {
  id: string;
  absoluteX: number;
  absoluteY: number;
  width: number;
  height: number;
  label: string;
  category: ViewCategory;
  zIndex: number;
}

interface TemplateBounds { width: number; height: number; }
```

### Canvas Components (`src/components/Canvas/`)

SVG-based canvas for rendering uidesc templates:

- `Canvas` - Main canvas component, integrates with documentStore
- `ViewRectangle` - Renders individual view as SVG rect with label
- `TemplateBounds` - Renders template boundary indicator (dashed border)
- `EmptyState` - Displays when no template is loaded

```typescript
import { Canvas, ViewRectangle, TemplateBounds, EmptyState } from './components/Canvas';

// Canvas reads from documentStore and renders automatically
<Canvas />

// ViewRectangle for custom rendering
<ViewRectangle view={renderableView} />

// TemplateBounds for template border
<TemplateBounds bounds={{ width: 400, height: 300 }} />
```

### File Utilities (Future)

- `readFile(path: string)` - Read file contents
- `writeFile(path: string, content: string)` - Write file contents

## State Management

### SolidJS Signals and Stores

Use signals for simple reactive state:

```typescript
const [selectedView, setSelectedView] = createSignal<string | null>(null);
const [isModified, setIsModified] = createSignal(false);
```

Use stores for complex nested state:

```typescript
import { createStore } from 'solid-js/store';

const [document, setDocument] = createStore<UidescDocument>({
  views: [],
  colors: {},
  fonts: {},
  bitmaps: {},
});
```

### Global State Pattern

```typescript
// src/stores/documentStore.ts
const [document, setDocument] = createStore<UidescDocument>(initialDocument);

export const documentStore = {
  document,
  setView: (id: string, updates: Partial<View>) => {
    setDocument('views', view => view.id === id, updates);
  },
  addView: (view: View) => {
    setDocument('views', views => [...views, view]);
  },
};
```

## API/Service Layer

### File Operations

```typescript
// src/services/fileService.ts
export async function loadDocument(path: string): Promise<UidescDocument> {
  const xml = await readFile(path);
  return parseUidesc(xml);
}

export async function saveDocument(path: string, doc: UidescDocument): Promise<void> {
  const xml = serializeUidesc(doc);
  await writeFile(path, xml);
}
```

### Undo/Redo Service

```typescript
// src/services/historyService.ts
export const historyService = {
  push: (action: HistoryAction) => { /* ... */ },
  undo: () => { /* ... */ },
  redo: () => { /* ... */ },
  canUndo: () => boolean,
  canRedo: () => boolean,
};
```

## Testing Helpers

**[Document helpers as they are created]**

### Rendering Utilities

```typescript
import { render } from '@solidjs/testing-library';

// Render with router context
export function renderWithRouter(component: Component) {
  return render(() => (
    <Router>
      {component}
    </Router>
  ));
}
```

### Fixture Factories

```typescript
// src/__tests__/fixtures/uidesc.ts
export function createMockView(overrides?: Partial<View>): View {
  return {
    id: 'test-view',
    class: 'CViewContainer',
    origin: { x: 0, y: 0 },
    size: { width: 100, height: 100 },
    ...overrides,
  };
}
```

## Routing

Using @solidjs/router:

```
/                    # Home / file open dialog
/editor              # Main editor view
/editor/:id          # Edit specific view
/settings            # Application settings
```

### Route Structure

```typescript
// src/routes/index.tsx
<Router>
  <Route path="/" component={Home} />
  <Route path="/editor" component={Editor}>
    <Route path="/:viewId" component={ViewEditor} />
  </Route>
  <Route path="/settings" component={Settings} />
</Router>
```

## Error Handling

### Component Error Boundaries

```typescript
import { ErrorBoundary } from 'solid-js';

<ErrorBoundary fallback={(err) => <ErrorDisplay error={err} />}>
  <RiskyComponent />
</ErrorBoundary>
```

### Service Error Handling

```typescript
try {
  const doc = await loadDocument(path);
  setDocument(doc);
} catch (error) {
  if (error instanceof ParseError) {
    showNotification('Invalid uidesc file format');
  } else {
    showNotification('Failed to load file');
  }
  console.error('Load error:', error);
}
```

## Performance Guidelines

- Lazy load routes and heavy components
- Use `createMemo` for computed values that are expensive
- Avoid unnecessary signal reads in JSX (signals are already fine-grained)
- Use `<For>` component for list rendering (optimized keyed updates)
- Implement virtual scrolling for view trees with 100+ items
- Bundle splitting for editor features

## Accessibility Guidelines

- Follow WCAG 2.1 AA standards
- Ensure keyboard navigation works for all controls
- Use semantic HTML elements
- Include ARIA labels for icon-only buttons
- Maintain 4.5:1 color contrast for text
- Support screen readers for view tree navigation

## Security Guidelines

- Validate all file inputs before parsing
- Sanitize uidesc data before rendering previews
- No eval() or dynamic code execution
- Handle malformed XML gracefully
- Never log file paths containing user data

## Environment Variables

```bash
# Vite environment variables (prefix with VITE_)
VITE_APP_TITLE=VSTGUI-Edit
VITE_DEBUG_MODE=false
```

## VSTGUI uidesc Format Reference

> **Full documentation**: See [UIDESC_GUIDE.md](UIDESC_GUIDE.md) for comprehensive format reference.

### Reference Files

- `vstgui-uidesc.schema.json` - JSON Schema for validation (used by parser)
- `UIDESC_GUIDE.md` - Complete format documentation

### Document Structure (JSON)

```json
{
  "vstgui-ui-description": {
    "version": "1",
    "colors": { /* named color definitions */ },
    "fonts": { /* named font definitions */ },
    "bitmaps": { /* image resource references */ },
    "gradients": { /* gradient definitions */ },
    "control-tags": { /* parameter ID mappings */ },
    "variables": { /* reusable values */ },
    "templates": { /* view definitions */ },
    "custom": { /* editor metadata */ }
  }
}
```

### Key View Classes

| Category | Classes |
|----------|---------|
| Containers | CViewContainer, CScrollView, CRowColumnView, UIViewSwitchContainer |
| Buttons | COnOffButton, CTextButton, CKickButton, CCheckBox |
| Knobs | CKnob, CAnimKnob |
| Sliders | CSlider, CVerticalSwitch, CHorizontalSwitch |
| Text | CTextLabel, CTextEdit, CParamDisplay |
| Special | CVuMeter, COptionMenu, CGradientView, CXYPad |

### Value Formats

| Type | Format | Example |
|------|--------|---------|
| Color | Hex RGBA | `#FF5500FF` |
| Point | "x, y" | `"10, 20"` |
| Size | "w, h" | `"100, 50"` |
| Boolean | String | `"true"` or `"false"` |
| Autosize | Flags | `"left right top"` |

## Common Pitfalls

### Selection Tests Must Use mouseDown + mouseUp

Selection is unified to the mouseup handler. Tests using `fireEvent.click()` will NOT work.

```typescript
// ❌ WRONG - click events don't trigger selection
fireEvent.click(element);
fireEvent.click(element, { shiftKey: true });

// ✅ CORRECT - selection happens on mouseup
fireEvent.mouseDown(element, { button: 0 });
fireEvent.mouseUp(document);

// ✅ CORRECT - Shift+click for multi-select
fireEvent.mouseDown(element, { button: 0, shiftKey: true });
fireEvent.mouseUp(document);
```

### Type Imports for uidesc Types

Always import uidesc types from the correct location:

```typescript
// ✅ CORRECT
import type { VSTGUIUIDescription, TemplateDefinition, ViewNode } from '../../types/uidesc';

// ❌ WRONG - this file doesn't exist
import type { ... } from '../../types/parser'; // Only has ParseResult, ValidationError
```

### BitmapDefinition is a Union Type

Bitmaps can be either a string path or an object with `path` property:

```typescript
// ❌ WRONG - will fail typecheck
const path = bitmaps?.MyBitmap.path;

// ✅ CORRECT - narrow the type first
const bitmap = bitmaps?.MyBitmap;
const path = typeof bitmap === 'object' ? bitmap.path : bitmap;
```

### ViewNode.children Type

Children is `Record<string, ViewNode> | undefined`, NOT an array:

```typescript
// ❌ WRONG
view.children?.forEach(child => ...)

// ✅ CORRECT
Object.values(view.children ?? {}).forEach(child => ...)
```

---

## Architecture Decisions

### View Resize Feature (2026-01-06)

**Feature 013-view-resize**: Drag resize handles to resize selected views.

**Functionality**:
- 8 resize handles on selected views (corners and edges)
- Drag any handle to resize the view
- Shift key: maintain aspect ratio (corner handles only)
- Alt key: resize from center (symmetric)
- Shift+Alt: both aspect ratio and center resize
- Escape key: cancel resize and restore original size
- Full undo/redo support via historyStore

**Components**:
- `SelectionOverlay`: Renders handles with `onResizeStart` callback
- `ResizePreview`: Semi-transparent ghost preview during resize
- `resizeStore`: Transient state for resize operations

**Tests**: 63 new tests for resize functionality

---

### Selection Unified to MouseUp (2026-01-06)

**Decision**: All selection (click, shift+click, marquee) is handled in `handleMarqueeUp`, not via onClick.

**Why**: The browser fires click events AFTER mouseup. When marquee selection called `selectAll()` on mouseup, the subsequent click event would overwrite it by calling `select()` on the root template.

**Implementation**: 
- Removed `onClick` handler from Canvas SVG
- All selection logic moved to `handleMarqueeUp`
- Two-phase tracking: mousedown starts pending state, 5px movement activates marquee mode
- If no movement (click), selection happens based on `clickTarget` captured at mousedown

### Toggleable Single-Click Selection (2026-01-06)

**Decision**: Clicking an already-selected view deselects it (toggle behavior).

**Behavior**:
- Click unselected view → select it, clear others
- Click selected view → deselect it (clear selection)
- Click selected view in multi-selection → clear entire selection
- Shift+click → explicit toggle (add/remove from selection)

---

## Common Patterns

### Pattern: Reactive Property Editing

```typescript
const [value, setValue] = createSignal(initialValue);

createEffect(() => {
  // Sync to external store when local value changes
  documentStore.updateProperty(id, 'value', value());
});

return (
  <input
    value={value()}
    onInput={(e) => setValue(e.currentTarget.value)}
  />
);
```

### Pattern: View Tree Selection

```typescript
const [selectedId, setSelectedId] = createSignal<string | null>(null);

const selectedView = createMemo(() =>
  selectedId() ? documentStore.getView(selectedId()!) : null
);
```

### Pattern: Command Pattern for Undo/Redo

```typescript
interface Command {
  execute(): void;
  undo(): void;
  description: string;
}

class SetPropertyCommand implements Command {
  constructor(
    private viewId: string,
    private property: string,
    private newValue: unknown,
    private oldValue: unknown
  ) {}

  execute() {
    documentStore.setProperty(this.viewId, this.property, this.newValue);
  }

  undo() {
    documentStore.setProperty(this.viewId, this.property, this.oldValue);
  }

  get description() {
    return `Set ${this.property}`;
  }
}
```

## Recent Changes
- 028-template-management: Added SolidJS 1.9.x, solid-js/store (already installed - no new dependencies)
- 027-variables-panel: Added SolidJS 1.9.x, solid-js/store (already installed - no new dependencies)
- 026-control-tags-panel: Added SolidJS 1.9.x, solid-js/store (already installed - no new dependencies)
- 025-gradients-panel: Added SolidJS 1.9.10, solid-js/store (already installed)
- 022-schema-driven-properties: Added SolidJS 1.9.x, Vite 7.x, existing JSON schema (`vstgui-uidesc.schema.json`)
- 021-colors-panel: Added SolidJS 1.9.10, solid-js/store (already installed)
- 018-hierarchy-reparenting: Added SolidJS 1.9.10, solid-js/store (already installed)
- 016-property-editing: Added SolidJS 1.9.10, solid-js/store, @floating-ui/dom 1.7.4 (for picker dropdowns)
- 015-smart-guides: Added SolidJS 1.9.10, solid-js/store (already installed - no new dependencies)
- 014-snap-to-grid: Added SolidJS 1.9.10, solid-js/store (already installed - no new dependencies)
- 013-view-resize: Added SolidJS 1.9.10, solid-js/store (already installed - no new dependencies)
- 012-view-move: Added SolidJS 1.9.10, solid-js/store (already installed - no new dependencies)
- 011-properties-panel: Added SolidJS 1.9.10, solid-js/store (already installed - no new dependencies)
- 009-marquee-selection: Added TypeScript 5.9.3 with strict mode enabled + SolidJS 1.9.10 + solid-js, solid-js/store (already installed - no new dependencies required)
- 008-view-selection: Added TypeScript 5.9.3 with strict mode enabled + SolidJS 1.9.10, @floating-ui/dom 1.7.4 (tooltips)

**[Track feature additions here]**

- 2026-01-07: Implemented 016-property-editing feature
  - 8 specialized editor components for property editing
  - TextEditor: free-form string input with undo/redo support
  - PointEditor: "x, y" coordinate pairs with validation
  - BooleanEditor: checkbox toggle for boolean attributes
  - NumberEditor: numeric input with +/- buttons, min/max/step, ArrowUp/ArrowDown keys
  - EnumEditor: dropdown for fixed options using @floating-ui/dom
  - ColorPicker: document colors + hex input + predefined colors (~)
  - FontPicker: dropdown for document fonts
  - BitmapPicker: dropdown for document bitmaps
  - Domain utilities: attributeTypes.ts, validation.ts, historyOperations.ts
  - Attribute type classification for 50+ attributes
  - Validation functions: validatePoint, validateSize, validateNumber, validateBoolean, validateColor
  - createPropertyEditOperation for undo/redo integration
  - documentStore: getViewAttribute(), updateViewAttribute()
  - All editors: onChange (live preview) + onCommit (history entry)
  - Escape key reverts to last committed value
  - Invalid values show red border, prevent commit
  - 1622 passing tests (111 new + 1511 existing)

- 2026-01-06: Implemented 012-view-move feature
  - Drag selected views to move them on canvas
  - Multi-view drag maintains relative positions
  - Undo/Redo with Ctrl+Z, Ctrl+Y, Ctrl+Shift+Z keyboard shortcuts
  - historyStore for undo/redo stack management (max 100 operations)
  - Arrow key nudge: 1px default, 10px with Shift held
  - Shift-constrained movement: locks to horizontal/vertical axis after 5px
  - Ghost preview during drag (50% opacity, dashed stroke)
  - dragStore for transient drag operation state
  - Domain utilities: move.ts, constrainAxis.ts
  - DragPreview component for visual feedback
  - Move cursor during drag operations (FR-013)
  - Click tolerance (3px) prevents accidental micro-moves (FR-014)
  - All nudge operations recorded in history (FR-015)
  - 1105 passing tests (39 new + 1066 existing)

- 2026-01-06: Implemented 011-properties-panel feature
  - PropertiesPanel component in right sidebar (280px width)
  - Display attributes of selected view(s) grouped by category
  - Groups: Identity (class), Geometry, Appearance, Text, Behavior, Other
  - Multi-selection shows shared values or "Mixed" indicators
  - Click-to-copy attribute values via Clipboard API
  - Collapsible groups with expand/collapse state preservation
  - propertiesStore for group expand/collapse state management
  - Domain utilities: groupAttributes, mergeSelections, ATTRIBUTE_GROUP_MAP
  - ARIA labels and keyboard navigation for accessibility
  - 956 passing tests (52 new + 904 existing)

- 2026-01-06: Added toggleable single-click selection
  - Click on selected view now deselects it (toggle off)
  - Click on unselected view selects it (clears others)
  - Multi-selection cleared when clicking any selected view without Shift

- 2026-01-06: Fixed marquee selection race condition
  - Unified all selection (click, shift+click, marquee) to mouseup handler
  - Removed onClick handler that was overwriting marquee selection
  - Added two-phase tracking: pending → active based on 5px movement threshold

- 2026-01-06: Added src/types/uidesc.ts
  - VSTGUIUIDescription, TemplateDefinition, ViewNode types
  - Fixed TypeScript errors across codebase (typecheck now passes)

- 2026-01-06: Implemented 009-marquee-selection feature
  - marqueeStore for marquee (rubber-band) selection state management
  - Click+drag on empty canvas draws selection rectangle
  - Views intersecting marquee are selected on mouse release
  - Shift+drag for additive selection (merge with existing)
  - Escape key and right-click cancel marquee, restore previous selection
  - Minimum 5x5 pixel threshold (smaller drags treated as clicks)
  - Semi-transparent fill and solid stroke styling via design tokens
  - MarqueeRectangle component with normalized coordinates
  - Domain utilities: normalizeRect, isMinimumSize, rectIntersect, findIntersectingViews

- 2026-01-06: Implemented 008-view-selection feature
  - selectionStore for selection and hover state management
  - Single click to select view with visual border and 8 resize handles
  - Shift+click for multi-selection (toggle add/remove)
  - Keyboard shortcuts: Ctrl+A (select all), Escape (deselect)
  - Hover tooltip with class name and dimensions after 500ms delay
  - Parent highlight when child is selected (dashed border)
  - Cursor change on resize handles (nwse-resize, ns-resize, etc.)
  - Hit testing for coordinate-based view selection
  - 654 passing tests (120+ new + existing)

  - Grid component with SVG pattern-based rendering (lines, dots, crosshairs styles)
  - gridStore for visibility, size, and style state management
  - GridToolbar with visibility toggle, size presets, and style selector
  - MainToolbar container combining ZoomToolbar and GridToolbar
  - G key toggle for grid visibility (with keyboard filter for text inputs)
  - Major grid lines every 5th interval with distinct color
  - Theme-adaptive grid colors (light/dark mode via CSS custom properties)
  - 537 passing tests (119 new + 418 existing)

  - ZoomToolbar component with +/- buttons, 100% reset, and Fit button
  - Zoom percentage display with formatZoomPercent utility
  - Keyboard shortcuts: +/= (zoom in), - (zoom out), 0 (reset), F (fit)
  - Fit-to-view with 5% padding and 100% cap for small templates
  - Disabled button states at zoom limits (10% and 500%)
  - Keyboard filter to ignore shortcuts in text inputs (FR-013)
  - 416 passing tests (62 new + 354 existing)

  - Mouse wheel zoom in/out (deltaY < 0 = zoom in, deltaY > 0 = zoom out)
  - Cursor-centered zooming (point under cursor stays stationary)
  - Zoom limits: 10% (0.1) to 500% (5.0)
  - Zoom factor: 10% per wheel tick (1.1 multiplier)
  - State persistence in canvasStore (zoomLevel signal)
  - Auto-reset zoom/pan on new document load (FR-009)
  - 356 passing tests (30 new + 326 existing)

  - Canvas pan via middle-mouse drag (FR-001)
  - Canvas pan via Space+left-drag (FR-002)
  - 1:1 mouse movement to pan offset (FR-003)
  - Pan offset preserved between gestures (FR-004)
  - Cursor feedback: grab/grabbing (FR-005, FR-006)
  - canvasStore with reactive signals for pan state
  - 323 passing tests (50 new + 273 existing)

  - Canvas component with SVG rendering for uidesc templates
  - Recursive view hierarchy flattening with absolute position calculation
  - View labels with class names and [Custom] indicator
  - Category-based color coding (container/control/display/custom)
  - Template bounds indicator with dashed border
  - Z-ordering via DOM order (parents before children)
  - 275 passing tests (108 new canvas tests + 167 existing)
  - Auto-detect JSON/XML format from file content
  - JSON Schema validation with AJV (allErrors mode, strict)
  - XML parsing with DOMParser and conversion to JSON
  - Path mapping for XML error locations
  - Auto-parse on successful file upload
  - 149 passing tests (121 new + 28 existing)
  - UploadZone component with drag-drop and file selector
  - documentStore for global state management
  - Design tokens in `src/styles/tokens.css`
  - 28 passing tests

## Additional Resources

### Project Documentation
- [UIDESC_GUIDE.md](UIDESC_GUIDE.md) - **CRITICAL**: Complete VSTGUI UIDescription format reference
- [vstgui-uidesc.schema.json](vstgui-uidesc.schema.json) - JSON Schema for validation

### External Documentation
- [SolidJS Documentation](https://www.solidjs.com/docs)
- [SolidJS Router](https://docs.solidjs.com/solid-router)
- [Vitest Documentation](https://vitest.dev/)
- [Vite Documentation](https://vite.dev/)
- [VSTGUI Official Documentation](https://steinbergmedia.github.io/vst3_doc/vstgui/html/index.html)
- [VSTGUI GitHub Repository](https://github.com/steinbergmedia/vstgui)
- [VST3 Developer Portal](https://steinbergmedia.github.io/vst3_dev_portal/)

---

## Notes for Maintainers

This file is a **living document** that should be updated as:
- New utilities are created
- New patterns are established
- Technology stack changes
- Best practices evolve

**Update frequency**: After each feature is completed

**Sections to maintain**:
- Active Technologies (auto-updated by speckit)
- Utility Modules (add new utilities)
- Common Patterns (document recurring patterns)
- Recent Changes (track feature additions)

<!-- MANUAL ADDITIONS START -->
<!-- Add any project-specific guidelines that don't fit above categories here -->
<!-- MANUAL ADDITIONS END -->
