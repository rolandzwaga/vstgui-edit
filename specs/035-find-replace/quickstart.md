# Quickstart: Find/Replace Implementation

**Feature**: 035-find-replace
**Branch**: `035-find-replace`
**Estimated Effort**: ~3-4 days

## Prerequisites

1. Read the spec: `/specs/035-find-replace/spec.md`
2. Review the data model: `/specs/035-find-replace/data-model.md`
3. Review existing patterns:
   - `src/stores/selectionStore.ts` - Signal-based store pattern
   - `src/components/AlignmentToolbar/` - Floating panel with Portal
   - `src/domain/alignment/` - Domain utility pattern
4. Read `specs/TESTING-GUIDE.md` before writing tests

## Implementation Order

### Phase 1: Types and Store (Foundation)

1. **Create types** (`src/types/search.ts`)
   - Copy interfaces from `data-model.md`
   - Export all types

2. **Create searchStore** (`src/stores/searchStore.ts`)
   - Follow pattern from `selectionStore.ts`
   - Signal per state property
   - Getter-based reactive store object
   - Action functions for all operations

3. **Tests first**
   - `src/stores/__tests__/searchStore.spec.ts`
   - Test open/close, query updates, navigation, filters

### Phase 2: Domain Logic (Pure Functions)

4. **Query parsing** (`src/domain/search/searchQuery.ts`)
   - `parseSearchQuery()` - Main parsing function
   - `isClassNameLike()` - Class detection
   - Test edge cases: colons, escaping, empty input

5. **Search engine** (`src/domain/search/searchEngine.ts`)
   - `matchesQuery()` - Core matching logic
   - `passesCategoryFilter()` - Filter application
   - `isDescendantOf()` - Scope filtering
   - `executeSearch()` - Full search flow
   - Test with mock views

6. **Replace operations** (`src/domain/search/replaceOperations.ts`)
   - `validateReplaceValue()` - Validation logic
   - `replaceAttribute()` - Single replace
   - `replaceAll()` - Batch replace
   - Test locked view skipping

7. **History operations** (`src/domain/search/historyOperations.ts`)
   - `createReplaceOperation()` - Single undo/redo
   - `createReplaceAllOperation()` - Batch undo/redo
   - Test undo restores original values

### Phase 3: UI Components

8. **SearchInput** (`src/components/FindPanel/SearchInput.tsx`)
   - Debounced input with 150ms delay
   - Auto-focus on mount
   - Keyboard handling (Enter, Escape)

9. **ModeToggle** (`src/components/FindPanel/ModeToggle.tsx`)
   - Toggle between Find and Replace modes
   - Tab-like appearance

10. **ResultItem** (`src/components/FindPanel/ResultItem.tsx`)
    - Single result row
    - Class name, path, matched attribute

11. **ResultsList** (`src/components/FindPanel/ResultsList.tsx`)
    - Scrollable container
    - Keyboard navigation (Arrow Up/Down, Enter)
    - Current selection highlighting

12. **NavigationButtons** (`src/components/FindPanel/NavigationButtons.tsx`)
    - Find Next/Previous buttons
    - "N of M" counter
    - F3/Shift+F3 shortcuts

13. **CategoryFilter** (`src/components/FindPanel/CategoryFilter.tsx`)
    - Checkbox per category
    - Collapsible section

14. **ReplaceControls** (`src/components/FindPanel/ReplaceControls.tsx`)
    - Replace value input
    - Replace/Replace All buttons
    - Validation error display

15. **FindPanel** (`src/components/FindPanel/FindPanel.tsx`)
    - Main container with Portal
    - Mode toggle (Find/Replace)
    - Compose all sub-components
    - Fixed position top-right

### Phase 4: Integration

16. **Canvas highlighting** (`src/components/Canvas/SearchHighlight.tsx`)
    - SVG overlay for search matches
    - Different style for current vs others

17. **Editor keyboard shortcuts**
    - Ctrl+F - Open Find panel
    - Ctrl+Shift+F - Open Replace panel
    - F3 - Find Next
    - Shift+F3 - Find Previous
    - Escape - Close panel

18. **Pan to selected result**
    - Use existing `canvasStore` pan functions
    - Center selected view in viewport

### Phase 5: Polish and Testing

19. **Edge cases**
    - Empty document
    - No results
    - Special characters in search
    - Locked views in replace

20. **Performance verification**
    - Search under 200ms
    - Replace All under 1s for 100 views

21. **Quality gates**
    - `npm run lint:css`
    - `npm run check`
    - `npm run typecheck`
    - `npm run test`

## Key Patterns to Follow

### Debounced Signal Pattern

```typescript
// In SearchInput.tsx
const [rawValue, setRawValue] = createSignal(props.value);
let timeoutId: number | undefined;

const handleInput = (e: Event) => {
  const value = (e.target as HTMLInputElement).value;
  setRawValue(value);
  props.onInput(value);

  if (timeoutId !== undefined) {
    clearTimeout(timeoutId);
  }

  timeoutId = window.setTimeout(() => {
    props.onDebouncedInput(value);
  }, props.debounceMs ?? 150);
};

onCleanup(() => {
  if (timeoutId !== undefined) {
    clearTimeout(timeoutId);
  }
});
```

### Floating Panel Pattern

```typescript
// In FindPanel.tsx
import { Portal } from 'solid-js/web';

<Portal>
  <div
    class={styles.panel}
    style={{
      position: 'fixed',
      top: '60px', // Below toolbar
      right: '16px',
      width: '320px',
    }}
    role="dialog"
    aria-label="Find and Replace"
  >
    {/* Panel content */}
  </div>
</Portal>
```

### Keyboard Navigation Pattern

```typescript
// In ResultsList.tsx
const handleKeyDown = (e: KeyboardEvent) => {
  switch (e.key) {
    case 'ArrowDown':
      e.preventDefault();
      props.onNavigate('down');
      break;
    case 'ArrowUp':
      e.preventDefault();
      props.onNavigate('up');
      break;
    case 'Enter':
      e.preventDefault();
      // Select current result
      if (props.currentIndex >= 0) {
        props.onSelect(props.currentIndex);
      }
      break;
  }
};
```

### History Operation Pattern

```typescript
// In historyOperations.ts
export function createReplaceAllOperation(
  changes: ReplaceChange[],
  updateFn: (viewId: string, attr: string, value: string) => void
): HistoryOperation {
  return {
    type: 'property-change',
    description: `Replace ${changes.length} values`,
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

## Files to Create

```
src/
├── types/
│   └── search.ts                    # Type definitions
├── stores/
│   ├── searchStore.ts               # Search state
│   └── __tests__/
│       └── searchStore.spec.ts      # Store tests
├── domain/
│   └── search/
│       ├── index.ts                 # Barrel export
│       ├── searchQuery.ts           # Query parsing
│       ├── searchEngine.ts          # Search logic
│       ├── replaceOperations.ts     # Replace logic
│       ├── historyOperations.ts     # Undo/redo
│       └── __tests__/
│           ├── searchQuery.spec.ts
│           ├── searchEngine.spec.ts
│           ├── replaceOperations.spec.ts
│           └── historyOperations.spec.ts
└── components/
    └── FindPanel/
        ├── FindPanel.tsx            # Main component
        ├── FindPanel.module.css     # Styles
        ├── SearchInput.tsx          # Debounced input
        ├── ResultsList.tsx          # Results container
        ├── ResultItem.tsx           # Result row
        ├── NavigationButtons.tsx    # Next/Previous
        ├── CategoryFilter.tsx       # Category toggles
        ├── ReplaceControls.tsx      # Replace UI
        └── __tests__/
            ├── FindPanel.spec.tsx
            ├── SearchInput.spec.tsx
            ├── ResultsList.spec.tsx
            ├── ResultItem.spec.tsx
            ├── NavigationButtons.spec.tsx
            ├── CategoryFilter.spec.tsx
            └── ReplaceControls.spec.tsx
```

## CSS Tokens to Use

```css
/* From src/styles/tokens.css */
--color-panel-bg: var(--color-surface-1);
--color-border: var(--color-border-subtle);
--color-selection: var(--color-accent);
--color-text-primary: var(--color-text);
--color-text-secondary: var(--color-text-muted);
--spacing-sm: 4px;
--spacing-md: 8px;
--spacing-lg: 16px;
--radius-md: 4px;
--shadow-lg: 0 4px 16px rgba(0, 0, 0, 0.2);
--z-floating-panel: 1000;
```

## Existing Code to Import

```typescript
// Selection
import { select, selectionStore } from '../../stores/selectionStore';

// Canvas panning
import { canvasStore, setPanOffset } from '../../stores/canvasStore';

// Document data
import {
  documentStore,
  getView,
  getViewAttribute,
  updateViewAttribute,
} from '../../stores/documentStore';

// View data
import { flattenHierarchy, getViewCategory } from '../../domain/canvas';

// History
import { pushOperation } from '../../stores/historyStore';

// Lock check
import { isLocked } from '../../stores/lockHideStore';

// Types
import type { ViewCategory, RenderableView } from '../../types/canvas';
import type { HistoryOperation } from '../../types/history';
```

## Test Setup Template

```typescript
// Component test template
import { cleanup, render, screen, fireEvent } from '@solidjs/testing-library';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { SearchInput } from '../SearchInput';

describe('SearchInput', () => {
  beforeEach(() => {
    vi.useFakeTimers({
      toFake: ['setTimeout', 'clearTimeout'],
    });
  });

  afterEach(() => {
    vi.useRealTimers();
    cleanup();
  });

  it('should call onDebouncedInput after delay', async () => {
    const onInput = vi.fn();
    const onDebouncedInput = vi.fn();

    render(() => (
      <SearchInput
        value=""
        onInput={onInput}
        onDebouncedInput={onDebouncedInput}
        debounceMs={150}
      />
    ));

    const input = screen.getByRole('textbox');
    fireEvent.input(input, { target: { value: 'test' } });

    expect(onInput).toHaveBeenCalledWith('test');
    expect(onDebouncedInput).not.toHaveBeenCalled();

    await vi.advanceTimersByTimeAsync(150);
    await Promise.resolve(); // Flush microtasks

    expect(onDebouncedInput).toHaveBeenCalledWith('test');
  });
});
```

## Checklist Before PR

- [ ] All tests pass (`npm test`)
- [ ] All quality gates pass (`npm run lint:css && npm run check && npm run typecheck`)
- [ ] Coverage >= 80% for new code
- [ ] Keyboard shortcuts work (Ctrl+F, F3, Shift+F3, Escape)
- [ ] Debounce delay is 150ms
- [ ] Replace operations are undoable
- [ ] Locked views are skipped during replace
- [ ] Panel closes on Escape
- [ ] Results list has keyboard navigation
- [ ] Canvas highlights all matches
- [ ] Current result has distinct highlighting
- [ ] Canvas pans to selected result
- [ ] CLAUDE.md updated with new store/domain exports
