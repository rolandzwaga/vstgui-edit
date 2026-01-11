# Research: Find/Replace Feature

**Date**: 2026-01-11

## 1. Debounce Implementation in SolidJS

### Decision
Implement custom debounce using `setTimeout`/`clearTimeout` with SolidJS signals.

### Rationale
- No external dependency needed (lodash.debounce, use-debounce)
- Simple pattern well-suited to SolidJS reactivity model
- Full control over behavior (cancel, flush, leading/trailing)

### Implementation Pattern

```typescript
import { createSignal, onCleanup } from 'solid-js';

function createDebouncedSignal<T>(initialValue: T, delay: number) {
  const [value, setValue] = createSignal(initialValue);
  const [debouncedValue, setDebouncedValue] = createSignal(initialValue);
  let timeoutId: number | undefined;

  const updateValue = (newValue: T) => {
    setValue(() => newValue);
    if (timeoutId !== undefined) {
      clearTimeout(timeoutId);
    }
    timeoutId = window.setTimeout(() => {
      setDebouncedValue(() => newValue);
    }, delay);
  };

  onCleanup(() => {
    if (timeoutId !== undefined) {
      clearTimeout(timeoutId);
    }
  });

  return { value, debouncedValue, setValue: updateValue };
}
```

### Alternatives Considered
- **lodash.debounce**: Rejected - adds dependency, not SolidJS-aware
- **use-debounce**: Rejected - React library, incompatible
- **createEffect with setTimeout**: Less clean than dedicated signal

## 2. Floating Panel Positioning

### Decision
Use fixed CSS positioning at top-right, similar to VS Code's find widget.

### Rationale
- Simpler than @floating-ui for fixed position (no anchor element)
- VS Code style familiar to users
- Matches existing AlignmentToolbar floating panel pattern
- @floating-ui reserved for anchor-relative positioning (tooltips, dropdowns)

### Implementation Pattern

```css
.findPanel {
  position: fixed;
  top: var(--spacing-lg); /* 16px below toolbar */
  right: var(--spacing-lg);
  width: 320px;
  max-height: 400px;
  z-index: var(--z-floating-panel);
  background: var(--color-panel-bg);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-lg);
}
```

### Alternatives Considered
- **@floating-ui**: Rejected for fixed panels - adds complexity without benefit
- **Portal with absolute positioning**: More complex, not needed
- **Draggable panel**: Future enhancement, not MVP

## 3. Substring Matching Algorithm

### Decision
Case-insensitive substring search using `String.toLowerCase().includes()`.

### Rationale
- Native JS method, highly optimized
- Meets FR-010 (case-insensitive by default)
- Simple and maintainable
- Sufficient performance for ~200 views with ~30 attributes each

### Implementation Pattern

```typescript
interface SearchableView {
  id: string;
  className: string;
  attributes: Record<string, string>;
  parentPath: string;
}

function matchesQuery(view: SearchableView, query: SearchQuery): boolean {
  const searchTerm = query.term.toLowerCase();

  if (query.type === 'class') {
    // Substring match on class name
    return view.className.toLowerCase().includes(searchTerm);
  }

  if (query.type === 'attribute') {
    // Exact attribute:value match
    const attrValue = view.attributes[query.attributeName];
    if (attrValue === undefined) return false;
    return attrValue.toLowerCase().includes(query.value!.toLowerCase());
  }

  // Global search: match class OR any attribute value
  if (view.className.toLowerCase().includes(searchTerm)) return true;
  return Object.values(view.attributes).some(
    val => typeof val === 'string' && val.toLowerCase().includes(searchTerm)
  );
}
```

### Alternatives Considered
- **Fuzzy search (fuse.js)**: Rejected - adds dependency, over-engineered for exact substring
- **Regex search**: Rejected - user complexity, security concerns
- **Web Worker**: Rejected - 200 views too small to benefit, adds complexity

## 4. Result List Keyboard Navigation

### Decision
Focus management with `tabIndex` and arrow key handlers on list container.

### Rationale
- Standard pattern for listbox navigation
- WCAG 2.1 compliant with proper ARIA attributes
- Matches existing keyboard patterns in hierarchy panel

### Implementation Pattern

```typescript
const handleKeyDown = (e: KeyboardEvent) => {
  const { results, currentIndex } = searchStore;

  switch (e.key) {
    case 'ArrowDown':
      e.preventDefault();
      setCurrentIndex(Math.min(currentIndex + 1, results.length - 1));
      break;
    case 'ArrowUp':
      e.preventDefault();
      setCurrentIndex(Math.max(currentIndex - 1, 0));
      break;
    case 'Enter':
      e.preventDefault();
      selectCurrentResult();
      break;
    case 'Escape':
      e.preventDefault();
      closeFindPanel();
      break;
  }
};
```

### ARIA Pattern

```html
<div role="listbox" aria-label="Search results" tabIndex={0} onKeyDown={handleKeyDown}>
  <For each={results()}>
    {(result, index) => (
      <div
        role="option"
        aria-selected={index() === currentIndex()}
        tabIndex={-1}
      >
        {result.displayText}
      </div>
    )}
  </For>
</div>
```

## 5. Replace Operations with Undo

### Decision
Batch replace as single history operation using existing `historyStore.pushOperation()`.

### Rationale
- Matches existing history patterns (move, resize, property-change)
- Single Ctrl+Z undoes entire Replace All
- Uses existing `updateViewAttribute()` from documentStore

### Implementation Pattern

```typescript
interface ReplaceOperation {
  type: 'replace';
  description: string;
  changes: Array<{
    viewId: string;
    attributeName: string;
    oldValue: string;
    newValue: string;
  }>;
}

function createReplaceOperation(
  changes: ReplaceOperation['changes'],
  updateFn: (viewId: string, attr: string, value: string) => void
): HistoryOperation {
  return {
    type: 'property-change', // Reuse existing type
    description: `Replace ${changes.length} attribute${changes.length > 1 ? 's' : ''}`,
    timestamp: Date.now(),
    undo: () => {
      for (const { viewId, attributeName, oldValue } of changes) {
        updateFn(viewId, attributeName, oldValue);
      }
    },
    redo: () => {
      for (const { viewId, attributeName, newValue } of changes) {
        updateFn(viewId, attributeName, newValue);
      }
    },
  };
}
```

## 6. Search Query Parsing

### Decision
Simple colon-separated syntax for attribute searches: `attribute:value`.

### Rationale
- Intuitive for users familiar with VS Code, GitHub search
- Easy to parse with `string.split(':')`
- Escape colon with backslash for literal `:` in values

### Query Types

| Input | Type | Term | Attribute | Value |
|-------|------|------|-----------|-------|
| `CKnob` | class | CKnob | - | - |
| `Knob` | class | Knob | - | - |
| `background-color:#FF0000` | attribute | - | background-color | #FF0000 |
| `origin:10, 20` | attribute | - | origin | 10, 20 |
| `font:MyFont` | attribute | - | font | MyFont |
| `#FF0000` | global | #FF0000 | - | - |

### Parsing Logic

```typescript
interface SearchQuery {
  type: 'class' | 'attribute' | 'global';
  term: string;
  attributeName?: string;
  value?: string;
}

function parseSearchQuery(input: string): SearchQuery {
  const trimmed = input.trim();
  if (!trimmed) return { type: 'global', term: '' };

  // Check for attribute:value syntax
  // Handle escaped colons by using regex
  const colonMatch = trimmed.match(/^([^:\\]+):(.+)$/);
  if (colonMatch) {
    return {
      type: 'attribute',
      term: trimmed,
      attributeName: colonMatch[1],
      value: colonMatch[2].replace(/\\:/g, ':'),
    };
  }

  // Check if looks like a class name (starts with C and PascalCase)
  if (/^C[A-Z]/.test(trimmed) || KNOWN_CLASS_PREFIXES.some(p => trimmed.startsWith(p))) {
    return { type: 'class', term: trimmed };
  }

  // Default to global search
  return { type: 'global', term: trimmed };
}
```

## 7. Canvas Highlighting During Search

### Decision
Add `searchHighlightIds` signal to searchStore, render highlight overlay in Canvas.

### Rationale
- Separates search highlight from selection
- Can show all matches while one is "current"
- Reuses existing SelectionOverlay styling pattern

### Visual Distinction

| State | Border Style | Border Color |
|-------|--------------|--------------|
| Selected (current) | 2px solid | --color-selection |
| Search match | 2px dashed | --color-search-highlight |

## 8. Integration Points

### Existing Code to Reuse

1. **selectionStore.select()** - Select result on canvas
2. **canvasStore.fitToView() / setPanOffset()** - Pan to selected result
3. **flattenHierarchy()** - Get searchable view list
4. **getViewCategory()** - Category filtering
5. **isLocked()** - Skip locked views in Replace
6. **updateViewAttribute()** - Apply replacements
7. **pushOperation()** - History integration
8. **ATTRIBUTE_GROUP_MAP** - Known attribute names

### New Exports to Add

1. **searchStore** - Search state management
2. **FindPanel** - Main component
3. **keyboard shortcuts** - Ctrl+F, Ctrl+Shift+F, F3, Shift+F3, Escape

## 9. Performance Considerations

### Search Performance

With ~200 views and ~30 attributes each:
- Total attributes to search: ~6,000
- String comparison cost: ~1ms for 6,000 comparisons
- Well under 50ms target for search portion

### Optimization Strategies (if needed later)

1. **Index class names**: Pre-build Set of unique class names
2. **Lazy attribute extraction**: Only extract attributes when searching attributes
3. **Web Worker**: Move search to background thread (unlikely needed)
4. **Virtual scrolling**: For >100 results (use existing pattern)

## 10. Test Strategy

### Unit Tests (domain/)
- Query parsing edge cases
- Substring matching accuracy
- Category filtering
- Replace validation

### Component Tests
- Debounced input behavior
- Keyboard navigation
- Result selection
- Panel open/close

### Integration Tests
- Full search flow: Ctrl+F -> type -> click result -> verify selection
- Replace flow: search -> replace -> undo -> verify restoration
- Filter combination testing
