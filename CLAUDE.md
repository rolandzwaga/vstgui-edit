# VSGUI-Edit Development Guidelines

Auto-generated from speckit templates. Last updated: 2026-01-05

## Active Technologies
- TypeScript 5.9.x with strict mode + SolidJS 1.9.x (001-uidesc-upload)
- In-memory SolidJS store for document state (001-uidesc-upload)

**[This section is auto-populated by speckit from feature plans]**

- SolidJS 1.9.10 - Reactive UI framework
- Vite 7.3.0 - Build tool and dev server
- Vitest 4.0.16 - Testing framework
- Biome 2.3.11 - Linting and formatting
- TypeScript 5.9.3 - Type system

## Project Overview

VSGUI-Edit is a visual editor for VSTGUI UI description files (`.uidesc`). VSTGUI is a cross-platform UI framework commonly used in audio plugin development (VST, AU, AAX).

### Domain Context

- **uidesc files**: XML-based UI descriptions defining views, controls, colors, fonts, bitmaps
- **Target users**: Audio plugin developers
- **Key operations**: Load, visualize, edit, and save uidesc files

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

Global store for uploaded uidesc file content:

- `documentStore` - Reactive store with `content`, `metadata`, `uploadState`, `error`
- `loadFile(file: File)` - Read file and store raw string content
- `reset()` - Clear content and return to idle state
- `setDragging(isDragging: boolean)` - Update drag state

```typescript
import { documentStore, loadFile, reset } from './stores/documentStore';

// Access store state
console.log(documentStore.content);
console.log(documentStore.uploadState); // 'idle' | 'dragging' | 'loading' | 'success' | 'error'

// Load a file
await loadFile(file);

// Reset to initial state
reset();
```

### Domain Utilities (Future)

- `parseUidesc(content: string)` - Parse uidesc content (XML or JSON) to data model
- `serializeUidesc(model: UidescDocument)` - Serialize model back to XML/JSON
- `validateUidesc(model: UidescDocument)` - Validate uidesc structure

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
VITE_APP_TITLE=VSGUI-Edit
VITE_DEBUG_MODE=false
```

## VSTGUI uidesc Schema

Reference schema files in project root:
- `vstgui-uidesc.schema.json` - JSON Schema for validation
- `vstgui-uidesc.xsd` - XML Schema Definition

### Key uidesc Elements

- **views**: UI view hierarchy (CViewContainer, CControl, etc.)
- **colors**: Named color definitions
- **fonts**: Named font definitions
- **bitmaps**: Image resource references
- **gradients**: Gradient definitions
- **control-tags**: Control identifier mappings

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

**[Track feature additions here]**

- 2026-01-05: Implemented 001-uidesc-upload feature
  - UploadZone component with drag-drop and file selector
  - documentStore for global state management
  - Design tokens in `src/styles/tokens.css`
  - 28 passing tests
- 2026-01-05: Initial project setup with constitution and CLAUDE.md

## Additional Resources

- [SolidJS Documentation](https://www.solidjs.com/docs)
- [SolidJS Router](https://docs.solidjs.com/solid-router)
- [Vitest Documentation](https://vitest.dev/)
- [Vite Documentation](https://vite.dev/)
- [VSTGUI Documentation](https://steinbergmedia.github.io/vstgui/)

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
