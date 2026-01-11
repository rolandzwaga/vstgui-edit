# VSTGUI-Edit Development Guidelines

Auto-generated from speckit templates. Last updated: 2026-01-07

---

## ⛔ CRITICAL RULES

### 1. BRANCH WORKFLOW - NEVER COMMIT TO MAIN
> **NEVER commit directly to main. ALWAYS use feature branches.**
> ```bash
> git branch --show-current       # 1. Verify not on main
> git checkout -b feature-name    # 2. Create+switch to branch
> git branch --show-current       # 3. Verify again before ANY edit
> ```
> ❌ Changes on main | ❌ Direct commits to main | ❌ Assuming correct branch
> **VIOLATION = POLLUTED MAIN BRANCH. IRREVERSIBLE AFTER PUSH.**

### 2. SOLIDJS ONLY - REACT FORBIDDEN
> ❌ `useState, useEffect, useMemo, useCallback, useRef` | ❌ `import from 'react'`
> ✅ `createSignal, createEffect, createMemo, createStore` | ✅ `import from 'solid-js'`
> - Components run ONCE. Signals are getters: `count()`
> - Props are reactive - DO NOT destructure
> - NO dependency arrays - tracking is automatic
> **VIOLATION = IMMEDIATE CODE REJECTION. ZERO TOLERANCE.**

### 3. STATIC IMPORTS ONLY - DYNAMIC IMPORTS FORBIDDEN
> ❌ `import()` for lazy loading/code splitting/conditional imports
> ✅ `import { x } from 'module'` (static imports at file top)
> **Only exception**: `vi.importActual()` inside `vi.mock()` in tests
> **VIOLATION = IMMEDIATE CODE REJECTION. ZERO TOLERANCE.**

---

## Tech Stack

**Core**: SolidJS 1.9.10, Vite 7.3.0, TypeScript 5.9.3 (strict), Vitest 4.0.16, Biome 2.3.11
**Dependencies**: @floating-ui/dom 1.7.4, AJV 8.17.1
**Storage**: All in-memory via SolidJS stores

## Project Overview

Visual editor for VSTGUI `.uidesc` files (JSON/XML UI descriptions for audio plugins).
**Target users**: Audio plugin developers (VST, AU, AAX)
**Key operations**: Load, visualize, edit, save uidesc files

**Essential References**:
- [UIDESC_GUIDE.md](UIDESC_GUIDE.md) - Complete format reference
- [vstgui-uidesc.schema.json](vstgui-uidesc.schema.json) - JSON Schema

## Project Structure

```
src/
├── components/    # UI components (panels, editors, controls)
├── domain/        # uidesc parsing, validation, data models
├── stores/        # SolidJS stores for state management
├── types/         # TypeScript type definitions
├── routes/        # Route/page components
├── services/      # File I/O, undo/redo management
├── styles/        # Global styles and design tokens
└── utils/         # Utility functions
```

## Commands

```bash
npm run dev|build|preview          # Development
npm test|test:watch|test:coverage  # Testing
npx biome check --write .          # Lint+format
npx tsc --noEmit                   # Type check
```

## Code Style

**TypeScript**: Strict mode, explicit types, no `any`, functional patterns
**Biome**: 2 spaces, 100 chars, single quotes, semicolons always, ES5 trailing commas
**CSS**: Modules only (`*.module.css`), tokens in `src/styles/tokens.css`, no hardcoded colors
**Components**: PascalCase files, `[Name]Props` interfaces, named exports, co-located tests (`.spec.tsx`)
**Imports**: External → Internal absolute → Relative

---

## Stores

### documentStore (`src/stores/documentStore.ts`)
**Purpose**: Upload & parse state for uidesc files

| Export | Description |
|--------|-------------|
| `documentStore` | State: `content`, `uploadState`, `parseState`, `document`, `parseErrors`, `detectedFormat` |
| `loadFile(file)` | Read file, store content, auto-parse |
| `reset()` | Clear to idle state |
| `setDragging(bool)` | Update drag state |

### canvasStore (`src/stores/canvasStore.ts`)
**Purpose**: Pan and zoom state

| Export | Description |
|--------|-------------|
| `canvasStore` | State: `panOffset`, `isPanning`, `panStart`, `zoomLevel` |
| `startPan/updatePan/endPan/resetPan` | Pan gesture lifecycle |
| `setZoom/resetZoom/zoomIn/zoomOut` | Zoom controls (0.1-5.0 range) |
| `applyZoom(x, y, rect, deltaY)` | Cursor-centered wheel zoom |
| `fitToView(viewport, template)` | Fit template with 5% padding |
| `resetCanvas()` | Reset pan and zoom |

### gridStore (`src/stores/gridStore.ts`)
**Purpose**: Grid overlay and snap-to-grid state

| Export | Description |
|--------|-------------|
| `gridStore` | State: `isVisible`, `size`, `style`, `isSnapEnabled`, `snapThreshold` |
| `toggleVisibility/toggleSnap` | Toggle grid/snap (G / Shift+G keys) |
| `setGridSize/setGridStyle` | Size presets: [5,8,10,12,16,20], styles: lines/dots/crosshairs |
| `setSnapThreshold(1-20)` | Snap distance in pixels |
| `GRID_SIZE_PRESETS`, `MAJOR_LINE_INTERVAL` | Constants: [5,8,10,12,16,20], 5 |

### selectionStore (`src/stores/selectionStore.ts`)
**Purpose**: View selection and hover state

| Export | Description |
|--------|-------------|
| `selectionStore` | State: `selectedIds` (Set), `hoveredId` |
| `select(id)` | Single select, clear others |
| `toggleSelect(id)` | Add/remove from multi-selection (Shift+click) |
| `selectAll(ids)` | Select all (Ctrl+A) |
| `clearSelection/setHovered/isSelected` | Utility functions |

### hierarchyStore (`src/stores/hierarchyStore.ts`)
**Purpose**: Hierarchy panel expand/collapse state

| Export | Description |
|--------|-------------|
| `hierarchyStore` | State: `expandedIds` (Set) |
| `toggleExpanded/expandNode/collapseNode` | Node state control |
| `expandAll(ids)/isExpanded(id)` | Batch expand, check state |

### propertiesStore (`src/stores/propertiesStore.ts`)
**Purpose**: Properties panel group expand/collapse state

| Export | Description |
|--------|-------------|
| `propertiesStore` | State: `expandedGroups` (Set) |
| `toggleGroup/expandGroup/collapseGroup` | Group state (no-op for 'identity') |
| `isGroupExpanded(id)` | Always true for 'identity' |

### smartGuidesStore (`src/stores/smartGuidesStore.ts`)
**Purpose**: Smart alignment guides during drag

| Export | Description |
|--------|-------------|
| `smartGuidesStore` | State: `isEnabled`, `activeGuides` |
| `toggleSmartGuides` | Toggle on/off (S key) |
| `setActiveGuides/clearActiveGuides` | Set during drag, clear on end |

### historyStore (`src/stores/historyStore.ts`)
**Purpose**: Undo/redo stack (max 100 operations)

| Export | Description |
|--------|-------------|
| `historyStore` | State: `canUndo`, `canRedo`, `undoDescription`, `redoDescription` |
| `pushOperation(op)` | Add to undo stack, clear redo |
| `undo()/redo()` | Execute and move between stacks |
| `clearHistory()` | Clear both stacks |

### dragStore (`src/stores/dragStore.ts`)
**Purpose**: Transient drag-to-move state

| Export | Description |
|--------|-------------|
| `dragStore` | State: `isDragging`, `startPoint`, `currentPoint`, `originalOrigins`, `constrainedAxis`, `delta` |
| `startDrag(point, origins)` | Begin drag with original positions |
| `updateDrag(point, shiftHeld)` | Update, detect axis constraint |
| `endDrag/cancelDrag` | Complete or cancel |

### resizeStore (`src/stores/resizeStore.ts`)
**Purpose**: Transient resize operation state

| Export | Description |
|--------|-------------|
| `resizeStore` | State: `isResizing`, `activeHandle`, `viewId`, points, origins, sizes |
| `startResize(handle, id, point, origin, size)` | Begin resize |
| `updateResize(point, shift, alt)` | Shift=aspect ratio, Alt=center resize |
| `endResize/cancelResize` | Complete or cancel |

### marqueeStore (`src/stores/marqueeStore.ts`)
**Purpose**: Rubber-band selection state

| Export | Description |
|--------|-------------|
| `marqueeStore` | State: `isActive`, `startPoint`, `currentPoint`, `isAdditive`, `previousSelection` |
| `startMarquee(point, additive, currentSel)` | Begin at point |
| `updateMarquee/completeMarquee/cancelMarquee` | Gesture lifecycle |

### saveFormatStore (`src/stores/saveFormatStore.ts`)
**Purpose**: Save format selection and confirmation dialog state

| Export | Description |
|--------|-------------|
| `saveFormatStore` | State: `selectedFormat`, `isDropdownOpen`, `isConfirmDialogOpen`, `pendingFormat`, `originalFormat` |
| `initializeFormat(originalFormat)` | Set format from file, localStorage, or default to 'json' |
| `openDropdown/closeDropdown` | Toggle format dropdown visibility |
| `selectFormat(format)` | Select format, triggers confirmation if different from original |
| `confirmFormatChange()` | Confirm pending format change, persist to localStorage |
| `cancelFormatChange()` | Cancel pending change, close dialog |
| `resetSaveFormatStore()` | Reset to initial state |

### rulerStore (`src/stores/rulerStore.ts`)
**Purpose**: Cursor position state for ruler indicators

| Export | Description |
|--------|-------------|
| `rulerStore` | State: `cursorPosition` (Point or null) |
| `setCursorPosition(point)` | Set cursor position when mouse is over canvas |
| `clearCursorPosition()` | Clear cursor position when mouse leaves canvas |
| `resetRulerStore()` | Reset to initial state |

### guidesStore (`src/stores/guidesStore.ts`)
**Purpose**: Custom guide lines for precise alignment

| Export | Description |
|--------|-------------|
| `guidesStore` | State: `guides`, `isVisible`, `isSnapEnabled`, `creationDrag`, `repositionDrag` |
| `addGuide(orientation, position)` | Add guide without history |
| `addGuideWithHistory(orientation, position)` | Add guide with undo support |
| `deleteGuide(id)/deleteGuideWithHistory(id)` | Delete guide by ID |
| `repositionGuide(id, position)` | Move guide without history |
| `repositionGuideWithHistory(id, position)` | Move guide with undo support |
| `clearAllGuides()/clearAllGuidesWithHistory()` | Remove all guides |
| `toggleGuidesVisibility()` | Toggle guide visibility (Ctrl+;) |
| `toggleGuidesSnap()` | Toggle snap-to-guides |
| `startCreationDrag/completeCreationDrag/cancelCreationDrag` | Guide creation lifecycle |
| `startRepositionDrag/updateRepositionDrag/completeRepositionDrag` | Guide reposition lifecycle |
| `resetGuidesStore()` | Reset to initial state |

### alignmentToolbarStore (`src/stores/alignmentToolbarStore.ts`)
**Purpose**: Alignment toolbar docked/floating state

| Export | Description |
|--------|-------------|
| `alignmentToolbarStore` | State: `isDocked`, `floatingPosition` |
| `dock()` | Dock toolbar back to main toolbar |
| `undock(position)` | Float toolbar at given position |
| `updateFloatingPosition(pos)` | Update position while dragging |
| `loadAlignmentToolbarState()` | Load from localStorage |
| `saveAlignmentToolbarState()` | Save to localStorage |
| `resetAlignmentToolbarStore()` | Reset to initial docked state |
| `STORAGE_KEY` | localStorage key: `'vstgui-edit:alignment-toolbar'` |

### lockHideStore (`src/stores/lockHideStore.ts`)
**Purpose**: Lock and hide state for views (editor-only, not persisted)

| Export | Description |
|--------|-------------|
| `lockHideStore` | State: `lockedIds` (Set), `hiddenIds` (Set) |
| `isLocked(id)` | Check if view is locked |
| `isHidden(id)` | Check if view is hidden |
| `isViewOrAncestorHidden(id, getParentId)` | Check if view or ancestor is hidden |
| `getLockStateInfo(ids)` | Get lock state for selection (allLocked, anyLocked, noneLocked) |
| `getHideStateInfo(ids)` | Get hide state for selection (allHidden, anyHidden, noneHidden) |
| `lockViews(ids)/unlockViews(ids)` | Lock/unlock without history |
| `hideViews(ids)/showViews(ids)` | Hide/show without history |
| `showAllViews()` | Show all hidden views |
| `lockSelectedWithHistory(ids)` | Lock with undo support (Ctrl+L) |
| `unlockSelectedWithHistory(ids)` | Unlock with undo support |
| `toggleHideSelectedWithHistory(ids)` | Toggle hide with undo support (Ctrl+H) |
| `showAllWithHistory()` | Show all with undo support (Ctrl+Shift+H) |
| `resetLockHideStore()` | Reset on document load |

### searchStore (`src/stores/searchStore.ts`)
**Purpose**: Find/Replace panel state and search results

| Export | Description |
|--------|-------------|
| `searchStore` | State: `isOpen`, `mode`, `rawQuery`, `parsedQuery`, `results`, `currentIndex`, `categoryFilters`, `scope`, `scopeContainerId`, `replaceValue`, `highlightedIds`, `isSearching` |
| `openFindPanel()/openReplacePanel()` | Open panel in find/replace mode (Ctrl+F / Ctrl+H) |
| `closeFindPanel()` | Close panel (Escape) |
| `setRawQuery(query)` | Set raw search input |
| `setParsedQuery(query)` | Set parsed query object |
| `setSearchResults(results)` | Set search results array |
| `navigateToNext()/navigateToPrevious()` | Navigate results (F3 / Shift+F3) |
| `selectResultAtIndex(index)` | Select specific result |
| `setCategoryFilter(category, enabled)` | Toggle category filter |
| `setAllCategoryFilters(enabled)` | Enable/disable all categories |
| `setSearchScope(scope, containerId?)` | Set search scope (all/selection) |
| `setMode(mode)` | Switch between find/replace mode |
| `setReplaceValue(value)` | Set replacement value |
| `resetSearchStore()` | Reset to initial state |

---

## Domain Utilities

### Parser (`src/domain/parser/`)

| Function | Description |
|----------|-------------|
| `parseUidesc(content)` | Auto-detect format, parse, validate → `ParseResult` |
| `detectFormat(content)` | Returns `'json' \| 'xml' \| 'unknown'` |
| `validateUidesc(doc)` | AJV validation → `{valid, errors}` |

### Canvas (`src/domain/canvas/`)

| Module | Key Functions |
|--------|---------------|
| `index.ts` | `parsePoint("x,y")`, `parseSize("w,h")`, `flattenHierarchy(root)`, `getViewCategory(class)` |
| `zoom.ts` | `clampZoom`, `calculateNewZoom`, `formatZoomPercent`, `calculateZoomPanAdjustment` |
| `fitToView.ts` | `calculateFitZoom(template, viewport, padding?)` → `{zoom, panX, panY}` |
| `grid.ts` | `isMajorLine(idx)`, `calculateLineCount`, `isValidGridSize` |
| `snap.ts` | `snapToGrid(val, grid, thresh)`, `snapPoint`, `applySnapToMove`, `applySnapToResize` |
| `smartGuides.ts` | `getViewBounds`, `calculateSmartGuides`, `findEdge/Center/SpacingGuides` |
| `move.ts` | `calculateDelta`, `applyDelta`, `formatOrigin`, `createMoveOperation` |
| `resize.ts` | `formatSize`, `calculateResizeBounds`, `clampToMinimumSize`, `createResizeOperation` |
| `constrainAxis.ts` | `determineConstraintAxis(delta)`, `constrainDelta(delta, axis)` |
| `marquee.ts` | `normalizeRect`, `isMinimumSize`, `rectIntersect`, `findIntersectingViews` |
| `ancestors.ts` | `getAncestorIds(id, views)`, `isAncestorOfSelected` |

### Hierarchy (`src/domain/hierarchy/`)

| Function | Description |
|----------|-------------|
| `buildTree(view, id)` | ViewNode → TreeNode for rendering |
| `getContainerIds(tree)` | IDs of nodes with children |
| `getTreeAncestorIds(id, tree)` | Path from root to target's parent |

### Properties (`src/domain/properties/`)

| Module | Key Exports |
|--------|-------------|
| `grouping.ts` | `ATTRIBUTE_GROUP_MAP`, `getAttributeGroup`, `groupAttributes`, `mergeSelections` |
| `attributeTypes.ts` | `ATTRIBUTE_TYPE_MAP`, `getAttributeType` → point/color/font/enum/boolean/text |
| `validation.ts` | `validatePoint/Size/Number/Boolean/Color` → `{valid, error?}` |
| `historyOperations.ts` | `createPropertyEditOperation(data, updateFn)` |

### Save (`src/domain/save/`)

| Function | Description |
|----------|-------------|
| `getFormatPreference()` | Get saved format from localStorage, returns `'json' \| 'xml' \| null` |
| `setFormatPreference(format)` | Save format preference to localStorage |
| `clearFormatPreference()` | Remove format preference from localStorage |
| `isValidSaveFormat(value)` | Type guard for SaveFormat |
| `STORAGE_KEY` | localStorage key: `'vstgui-edit:save-format'` |

### Guides (`src/domain/guides/`)

| Module | Key Functions |
|--------|---------------|
| `guideOperations.ts` | `generateGuideId`, `createGuide`, `addGuideToCollection`, `removeGuideFromCollection`, `updateGuidePosition`, `canAddGuide`, `MAX_GUIDES` (50) |
| `guideSnap.ts` | `snapToGuide`, `snapToNearest`, `snapPointWithGuides`, `applySnapToMoveWithGuides`, `applySnapToResizeWithGuides` |
| `historyOperations.ts` | `createGuideCreateOperation`, `createGuideDeleteOperation`, `createGuideRepositionOperation`, `createGuideClearAllOperation` |

### Lock/Hide (`src/domain/lockHide/`)

| Module | Key Functions |
|--------|---------------|
| `lockOperations.ts` | `calculateLockStateInfo`, `filterUnlockedViews`, `areAllLocked`, `isAnyLocked`, `getLockMenuItem` |
| `hideOperations.ts` | `calculateHideStateInfo`, `shouldViewBeHidden`, `filterVisibleViews`, `getHideMenuItem` |
| `historyOperations.ts` | `createLockOperation`, `createUnlockOperation`, `createHideOperation`, `createShowAllOperation` |

### Rulers (`src/domain/rulers/`)

| Module | Key Functions |
|--------|---------------|
| `tickCalculation.ts` | `calculateTickIntervals(zoom)`, `alignIntervalToGrid(interval, gridSize, enabled)`, `DEFAULT_TICK_CONFIG` |
| `tickGeneration.ts` | `calculateVisibleRange(viewport, pan, zoom)`, `formatTickLabel(value)`, `generateTicks(range, intervals)` |
| `coordinateMapping.ts` | `screenToCanvasCoordinates(x, y, pan, zoom)`, `canvasToScreenPosition(canvas, pan, zoom)`, `calculateTemplateBoundsPosition(extent, pan, zoom)`, `RULER_THICKNESS` (20px) |

### Alignment (`src/domain/alignment/`)

| Module | Key Functions |
|--------|---------------|
| `calculateBounds.ts` | `viewToBounds(view)`, `calculateSelectionBounds(ids, getView)`, `calculateParentBounds(id, getParentId, getView)` |
| `alignViews.ts` | `alignViews(ids, type, getView, getParentId)`, `getAlignmentReference(bounds, type)`, `calculateAlignedPosition(view, ref, type, origin)` |
| `distributeViews.ts` | `distributeViews(ids, direction, getView)`, `calculateEqualGap(views, direction)` |
| `historyOperations.ts` | `createAlignmentOperation(results, desc, updateFn)`, `getAlignmentDescription(count, type, isParent)`, `getDistributionDescription(count, dir)` |
| `shortcuts.ts` | `handleAlignmentShortcut(event, selectedIds, onAlign?)` |

### Search (`src/domain/search/`)

| Module | Key Functions |
|--------|---------------|
| `searchQuery.ts` | `parseSearchQuery(input)`, `isClassNameLike(input)`, `escapeSearchTerm(term)`, `unescapeValue(value)`, `CLASS_PREFIXES` |
| `searchEngine.ts` | `prepareViewForSearch(id, class, category, attrs, path)`, `matchesQuery(view, query)`, `passesCategoryFilter(view, filters)`, `isDescendantOf(viewId, containerId)`, `executeSearch(views, query, filters, scope)`, `buildDisplayPath(id, viewMap)` |
| `replaceOperations.ts` | `validateReplaceValue(attr, value)`, `replaceAttribute(id, attr, value)`, `replaceAll(ids, attr, value)`, `READ_ONLY_ATTRIBUTES` |
| `historyOperations.ts` | `createReplaceOperation(change)`, `createReplaceAllOperation(changes, attr)` |
| `shortcuts.ts` | `handleSearchShortcut(event)` (Ctrl+F, Ctrl+H, F3, Shift+F3, Escape) |

**Keyboard Shortcuts** (Ctrl+Shift+...):
- `L`: Align Left | `C`: Align Center | `R`: Align Right
- `T`: Align Top | `M`: Align Middle | `B`: Align Bottom

---

## Editor Components (`src/components/editors/`)

| Component | Purpose | Props |
|-----------|---------|-------|
| `TextEditor` | Free-form string | `value, onChange, onCommit` |
| `PointEditor` | "x, y" with validation | `value, onChange, onCommit` |
| `BooleanEditor` | Checkbox toggle | `value, onChange, onCommit` |
| `NumberEditor` | Numeric +/- buttons | `value, min, max, step, onChange, onCommit` |
| `EnumEditor` | Dropdown options | `value, options[], onChange, onCommit` |
| `ColorPicker` | Doc colors + hex + presets | `value, documentColors, onChange, onCommit` |
| `FontPicker` | Document fonts dropdown | `value, documentFonts, onChange, onCommit` |
| `BitmapPicker` | Document bitmaps dropdown | `value, documentBitmaps, onChange, onCommit` |

**Behavior**: `onChange`=live preview, `onCommit`=blur/Enter creates history, Escape reverts, invalid=red border

---

## Canvas Components (`src/components/Canvas/`)

| Component | Purpose |
|-----------|---------|
| `Canvas` | Main SVG canvas, integrates with documentStore |
| `ViewRectangle` | Individual view rect with label |
| `TemplateBounds` | Template boundary (dashed border) |
| `EmptyState` | Shown when no template loaded |
| `SelectionOverlay` | Selection border + 8 resize handles |
| `ResizePreview` | Ghost preview during resize |
| `DragPreview` | Ghost preview during drag |
| `MarqueeRectangle` | Rubber-band selection rectangle |

---

## Types

### `src/types/canvas.ts`
```typescript
type ViewCategory = 'container' | 'control' | 'display' | 'custom';
interface Point { x: number; y: number; }
interface Size { width: number; height: number; }
interface RenderableView { id, absoluteX, absoluteY, width, height, label, category, zIndex }
```

### `src/types/parser.ts`
```typescript
type FormatType = 'json' | 'xml' | 'unknown';
type ParseState = 'idle' | 'parsing' | 'valid' | 'invalid';
interface ValidationError { type, message, path?, xmlPath?, line?, column? }
type ParseResult = { success: true; document; format } | { success: false; errors; format }
```

### `src/types/uidesc.ts`
`VSTGUIUIDescription`, `TemplateDefinition`, `ViewNode`

---

## Common Pitfalls

### Selection Tests
❌ `fireEvent.click()` → ✅ `fireEvent.mouseDown({button:0}) + mouseUp(document)`

### Type Imports
✅ `import type { VSTGUIUIDescription } from '../../types/uidesc'`
❌ `import from '../../types/parser'` (only has ParseResult, ValidationError)

### BitmapDefinition Union
```typescript
const bitmap = bitmaps?.MyBitmap;
const path = typeof bitmap === 'object' ? bitmap.path : bitmap; // Narrow first!
```

### ViewNode.children
```typescript
Object.values(view.children ?? {}).forEach(...)  // Record, not array!
```

---

## Architecture Decisions

### View Resize (013)
8 handles, Shift=aspect ratio, Alt=center, Shift+Alt=both, Escape=cancel, full undo/redo

### Selection Unified to MouseUp
All selection (click, shift+click, marquee) in `handleMarqueeUp`, not onClick.
**Why**: Click fires AFTER mouseup, was overwriting marquee selection.

### Toggleable Single-Click
Click selected view → deselect. Click unselected → select+clear others.

---

## State Management Patterns

**Signals**: Simple reactive state - `const [val, setVal] = createSignal(init)`
**Stores**: Complex nested state - `const [doc, setDoc] = createStore({...})`

```typescript
// Reactive property editing
const [value, setValue] = createSignal(initial);
createEffect(() => documentStore.updateProperty(id, 'value', value()));

// View tree selection
const selectedView = createMemo(() => selectedId() ? store.getView(selectedId()!) : null);
```

---

## Routing

```
/           # Home / file upload
/editor     # Main editor
/editor/:id # Edit specific view
/settings   # Settings
```

---

## Guidelines

**Performance**: `createMemo` for expensive computations, `<For>` for lists, virtual scroll for 100+ items
**Accessibility**: WCAG 2.1 AA, keyboard nav, ARIA labels, 4.5:1 contrast
**Security**: Validate file inputs, no eval(), sanitize before render, no user paths in logs

---

## uidesc Format Quick Reference

```json
{ "vstgui-ui-description": { "version": "1", "colors": {}, "fonts": {}, "bitmaps": {},
  "gradients": {}, "control-tags": {}, "variables": {}, "templates": {}, "custom": {} }}
```

| Category | Classes |
|----------|---------|
| Containers | CViewContainer, CScrollView, CRowColumnView, UIViewSwitchContainer |
| Buttons | COnOffButton, CTextButton, CKickButton, CCheckBox |
| Knobs/Sliders | CKnob, CAnimKnob, CSlider, CVerticalSwitch, CHorizontalSwitch |
| Text | CTextLabel, CTextEdit, CParamDisplay |
| Special | CVuMeter, COptionMenu, CGradientView, CXYPad |

| Type | Format | Example |
|------|--------|---------|
| Color | Hex RGBA | `#FF5500FF` |
| Point | "x, y" | `"10, 20"` |
| Size | "w, h" | `"100, 50"` |
| Boolean | String | `"true"` / `"false"` |

---

## External Docs

- [SolidJS](https://www.solidjs.com/docs) | [SolidJS Router](https://docs.solidjs.com/solid-router)
- [Vitest](https://vitest.dev/) | [Vite](https://vite.dev/)
- [VSTGUI](https://steinbergmedia.github.io/vst3_doc/vstgui/html/index.html) | [GitHub](https://github.com/steinbergmedia/vstgui)

---

## Recent Changes

| Date | Feature | Summary |
|------|---------|---------|
| 01-11 | 035-find-replace | Find/Replace panel (Ctrl+F/Ctrl+H), class/attribute search, category/scope filters, replace with undo, F3 navigation, ~265 tests |
| 01-11 | 034-lock-hide-views | Lock views (Ctrl+L), hide views (Ctrl+H), context menu, hierarchy icons, canvas filtering |
| 01-10 | 033-custom-guides | Drag-from-ruler guides, snap-to-guides, Ctrl+; toggle, context menu positioning |
| 01-10 | 032-rulers | Canvas rulers with tick marks, cursor indicator, template bounds, ~140 tests |
| 01-10 | 031-alignment-tools | Alignment toolbar, L/C/R/T/M/B alignment, H/V distribution, shortcuts, ~130 tests |
| 01-10 | 030-json-save-format | Split save button, JSON/XML dropdown, confirmation dialog, 90 tests |
| 01-07 | 016-property-editing | 8 editors, validation, history, 1622 tests |
| 01-06 | 013-view-resize | 8 handles, Shift/Alt modifiers, 63 tests |
| 01-06 | 012-view-move | Drag/nudge, Shift-constrain, history, 1105 tests |
| 01-06 | 011-properties-panel | Grouped attrs, multi-select, copy, 956 tests |
| 01-06 | 009-marquee-selection | Rubber-band, Shift-additive, Escape cancel |
| 01-06 | 008-view-selection | Click/Shift+click, tooltips, parent highlight, 654 tests |
| 01-06 | 007-canvas-grid | SVG patterns, G toggle, major lines, 537 tests |
| 01-06 | 006-zoom-controls | Toolbar, shortcuts, fit-to-view, 416 tests |
| 01-06 | 005-canvas-zoom | Wheel zoom, cursor-centered, 356 tests |
| 01-06 | 004-canvas-pan | Middle-drag, Space+drag, 323 tests |
| 01-06 | 003-canvas-rendering | SVG views, hierarchy flattening, 275 tests |
| 01-06 | 002-uidesc-parsing | JSON/XML, AJV validation, 149 tests |
| 01-06 | 001-uidesc-upload | Drag-drop, documentStore, 28 tests |

---

**Maintainer Notes**: Update after each feature. Sections: Tech Stack, Stores, Domain, Recent Changes.
