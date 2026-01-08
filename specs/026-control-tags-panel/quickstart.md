# Quick Start: Control Tags Panel

## Overview

The Control Tags Panel manages VSTGUI control-tag resources. Control tags map named identifiers to numeric parameter IDs for plugin parameter binding.

## Key Concepts

### What is a Control Tag?

A control tag is a named reference to a numeric parameter ID:

```json
{
  "control-tags": {
    "Volume": "0",
    "Pan": "1",
    "Bypass": "2"
  }
}
```

Views reference tags by name in their `control-tag` attribute:

```json
{
  "class": "CSlider",
  "control-tag": "Volume"
}
```

### Why Use Control Tags?

1. **Readable code**: "Volume" is clearer than "0"
2. **Refactoring**: Change the numeric ID in one place
3. **Consistency**: Same tag name across multiple views

## File Structure

```
src/
├── components/ControlTagsPanel/
│   ├── ControlTagsPanel.tsx      # Main panel
│   ├── ControlTagItem.tsx        # Individual tag row
│   ├── AddControlTagButton.tsx   # Add button
│   ├── EmptyState.tsx            # No tags message
│   └── __tests__/                # Component tests
├── domain/controlTags/
│   ├── validation.ts             # Name/ID validation
│   ├── usage.ts                  # Find tag usages
│   ├── historyOperations.ts      # Undo/redo
│   └── __tests__/                # Domain tests
└── stores/documentStore.ts       # CRUD functions
```

## Implementation Guide

### 1. Domain Layer First

Start with pure functions that have no UI dependencies:

```typescript
// src/domain/controlTags/validation.ts
export function validateTagName(
  name: string,
  existingNames: string[],
  currentName?: string
): ValidationResult;

export function validateTagId(
  id: string,
  existingIds: string[],
  currentId?: string
): ValidationResult;

export function getNextAvailableTagId(
  existingTags: Record<string, string>
): string;
```

### 2. Store Functions

Extend documentStore.ts with control tag operations:

```typescript
// Getters
export function getControlTags(): Record<string, string> | undefined;

// Mutations
export function addControlTag(name: string, tagId: string): boolean;
export function updateControlTagName(oldName: string, newName: string): boolean;
export function updateControlTagId(name: string, newTagId: string): string | null;
export function deleteControlTag(name: string): { ... } | null;
```

### 3. UI Components

Follow ColorsPanel pattern:

```tsx
// ControlTagsPanel.tsx
export const ControlTagsPanel: Component = () => {
  const tags = createMemo(() => {
    const tagMap = getControlTags();
    if (!tagMap) return [];
    return Object.entries(tagMap).map(([name, tagId]) => ({ name, tagId }));
  });

  return (
    <CollapsibleSection title="Control Tags" headerActions={<AddControlTagButton />}>
      <Show when={tags().length > 0} fallback={<EmptyState />}>
        <For each={tags()}>
          {(tag) => <ControlTagItem name={tag.name} tagId={tag.tagId} />}
        </For>
      </Show>
    </CollapsibleSection>
  );
};
```

## Testing Patterns

### Domain Tests

```typescript
// validation.spec.ts
describe('validateTagName', () => {
  it('should reject empty names', () => {
    const result = validateTagName('', ['Volume']);
    expect(result.valid).toBe(false);
    expect(result.error).toContain('empty');
  });
});
```

### Component Tests

```tsx
// ControlTagsPanel.spec.tsx
import { render, screen } from '@solidjs/testing-library';
import { ControlTagsPanel } from '../ControlTagsPanel';

describe('ControlTagsPanel', () => {
  beforeEach(() => {
    reset();  // Reset documentStore
  });

  it('should display empty state when no tags exist', () => {
    render(() => <ControlTagsPanel />);
    expect(screen.getByText(/no control tags/i)).toBeInTheDocument();
  });
});
```

## Common Patterns

### Auto-Generated Names

```typescript
function generateUniqueTagName(existing: Record<string, string>): string {
  const baseName = 'New Tag';
  if (!(baseName in existing)) return baseName;
  let counter = 2;
  while (`${baseName} ${counter}` in existing) counter++;
  return `${baseName} ${counter}`;
}
```

### Finding Next Available ID

```typescript
function getNextAvailableTagId(existing: Record<string, string>): string {
  const usedIds = new Set(Object.values(existing).map(id => parseInt(id, 10)));
  let nextId = 0;
  while (usedIds.has(nextId)) nextId++;
  return String(nextId);
}
```

### Usage Tracking

```typescript
function findControlTagUsages(
  tagName: string,
  document: VSTGUIUIDescription | null
): ControlTagUsage[] {
  if (!document) return [];
  // Traverse templates, find views with control-tag === tagName
}
```

## Quality Checklist

Before marking complete:

- [ ] All tests written FIRST (TDD)
- [ ] `npm run lint:css` passes
- [ ] `npm run check` passes
- [ ] `npm run typecheck` passes
- [ ] 80%+ code coverage
- [ ] All FR-xxx and SC-xxx verified
