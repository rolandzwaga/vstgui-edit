# VSTGUI-Edit Development Guidelines

Auto-generated from speckit templates. Last updated: 2026-01-05

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
- 006-zoom-controls: Added TypeScript 5.9.3 with strict mode enabled + SolidJS 1.9.10 (createSignal for component state, createMemo for derived values)
- 005-canvas-zoom: Added TypeScript 5.9.3 with strict mode + SolidJS 1.9.10 (createSignal for zoom state)
- 004-canvas-pan: Added TypeScript 5.9.3 with strict mode enabled + SolidJS 1.9.10 (createSignal for pan state)

**[Track feature additions here]**

- 2026-01-05: Implemented 006-zoom-controls feature
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
