# Implementation Plan: Control Tags Panel

**Branch**: `026-control-tags-panel` | **Date**: 2026-01-08 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/026-control-tags-panel/spec.md`

## Summary

Implement a Control Tags Panel in the left sidebar for managing VSTGUI control-tag resources. Control tags map named identifiers to numeric tag IDs used for plugin parameter binding. The panel follows established patterns from ColorsPanel and GradientsPanel with view/add/edit/delete functionality and usage tracking.

## Technical Context

**Language/Version**: TypeScript 5.9.x with strict mode enabled
**Primary Dependencies**: SolidJS 1.9.x, solid-js/store (already installed - no new dependencies)
**Storage**: N/A (in-memory state via existing documentStore)
**Testing**: Vitest 4.x with @solidjs/testing-library
**Testing Guide**: `specs/TESTING-GUIDE.md` - MUST be consulted for all test tasks
**Target Platform**: Web browser (Vite dev server / production build)
**Project Type**: Single SPA
**Performance Goals**: Panel renders all tags within 100ms, operations complete within 100ms
**Constraints**: No new dependencies, follow existing panel patterns
**Scale/Scope**: Typical uidesc files have 10-50 control tags

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Test-First Development | ✅ WILL COMPLY | All code will have tests written first |
| II. Technology Stack | ✅ COMPLIANT | SolidJS 1.9.x, no new dependencies |
| IV. Code Quality | ✅ WILL COMPLY | Biome, Stylelint, TypeScript checks |
| V. GUI Editor Domain | ✅ WILL COMPLY | Undo/redo for all mutations |
| VI. Testing Standards | ✅ WILL COMPLY | Unit + component tests, 80% coverage |
| XII. SolidJS Only | ✅ WILL COMPLY | No React patterns |
| XVIII. Zero Failing Tests | ✅ WILL COMPLY | All tests must pass |
| XXI. Static Imports | ✅ WILL COMPLY | No dynamic imports |
| XXII. Honest Completion | ✅ WILL COMPLY | All FR/SC verified |
| XXIII. Quality Gates | ✅ WILL COMPLY | lint:css, check, typecheck |

## Project Structure

### Documentation (this feature)

```text
specs/026-control-tags-panel/
├── spec.md              # Feature specification
├── plan.md              # This file
├── research.md          # Phase 0 output (N/A - no unknowns)
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output (N/A - no API)
└── tasks.md             # Phase 2 output (/speckit.tasks command)
```

### Source Code (repository root)

```text
src/
├── components/
│   └── ControlTagsPanel/
│       ├── ControlTagsPanel.tsx       # Main panel component
│       ├── ControlTagsPanel.module.css
│       ├── ControlTagItem.tsx         # Individual tag item
│       ├── ControlTagItem.module.css
│       ├── AddControlTagButton.tsx    # Add button
│       ├── AddControlTagButton.module.css
│       ├── EmptyState.tsx             # Empty state display
│       ├── EmptyState.module.css
│       ├── index.ts                   # Barrel exports
│       └── __tests__/
│           ├── ControlTagsPanel.spec.tsx
│           ├── ControlTagsPanel.add.spec.tsx
│           ├── ControlTagsPanel.history.spec.tsx
│           ├── ControlTagItem.spec.tsx
│           ├── ControlTagItem.edit.spec.tsx
│           ├── ControlTagItem.delete.spec.tsx
│           ├── ControlTagItem.usage.spec.tsx
│           ├── ControlTagItem.validation.spec.tsx
│           ├── AddControlTagButton.spec.tsx
│           └── EmptyState.spec.tsx
├── domain/
│   └── controlTags/
│       ├── validation.ts              # Name/ID validation
│       ├── usage.ts                   # Find control tag usages
│       ├── historyOperations.ts       # Undo/redo operations
│       ├── index.ts                   # Barrel exports
│       └── __tests__/
│           ├── validation.spec.ts
│           ├── usage.spec.ts
│           └── historyOperations.spec.ts
└── stores/
    └── documentStore.ts               # Add control tag CRUD functions
```

**Structure Decision**: Single project structure, extending existing components/ and domain/ patterns.

## Complexity Tracking

> No violations - feature follows established patterns with no new dependencies.

## Data Model

### Control Tag Definition

```typescript
// Already exists in src/types/uidesc.ts
export type ControlTagsDefinition = Record<string, string>;
// Key: tag name (e.g., "Volume")
// Value: tag ID as string (e.g., "0")
```

### Control Tag Reference in Views

```typescript
// In view attributes
{
  "class": "CSlider",
  "control-tag": "Volume"  // References tag by name
}
```

### Domain Types (new)

```typescript
// src/domain/controlTags/types.ts (if needed, or inline)
export interface ControlTagUsage {
  viewId: string;
  viewClass: string;
  templateName: string;
}

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

export interface RemovedControlTagReference {
  viewId: string;
  attribute: string;  // Always 'control-tag'
  value: string;      // The tag name
}
```

## Store Functions (documentStore extensions)

Following the pattern from colors and gradients:

```typescript
// Getters
export function getControlTags(): Record<string, string> | undefined;

// Mutations
export function addControlTag(name: string, tagId: string): boolean;
export function updateControlTagName(oldName: string, newName: string): boolean;
export function updateControlTagId(name: string, newTagId: string): string | null;  // Returns old ID
export function deleteControlTag(name: string): { tagId: string; removedReferences: RemovedControlTagReference[] } | null;
export function restoreControlTagReference(viewId: string, value: string): boolean;
```

## Component Design

### ControlTagsPanel

Main panel wrapping CollapsibleSection with list of ControlTagItems.

```typescript
interface Props {
  // No props - reads from documentStore
}
```

### ControlTagItem

Individual tag item with inline editing for name and ID.

```typescript
interface ControlTagItemProps {
  name: string;
  tagId: string;
  onDelete: (name: string) => void;
  usageCount: number;
  onUsageClick: (name: string) => void;
}
```

### AddControlTagButton

Button to add new control tag.

```typescript
interface AddControlTagButtonProps {
  onClick: () => void;
  disabled: boolean;
}
```

## Key Implementation Details

### Auto-Generated Name

```typescript
function generateUniqueTagName(existingTags: Record<string, string>): string {
  const baseName = 'New Tag';
  if (!(baseName in existingTags)) return baseName;
  let counter = 2;
  while (`${baseName} ${counter}` in existingTags) counter++;
  return `${baseName} ${counter}`;
}
```

### Auto-Assigned Tag ID (FR-007)

Find lowest available non-negative integer:

```typescript
function getNextAvailableTagId(existingTags: Record<string, string>): string {
  const usedIds = new Set(Object.values(existingTags).map(id => Number.parseInt(id, 10)));
  let nextId = 0;
  while (usedIds.has(nextId)) nextId++;
  return String(nextId);
}
```

### Validation Rules

- **Name**: Non-empty, unique among existing tags
- **Tag ID**: Valid integer (including negative), unique among existing tags

```typescript
function validateTagName(name: string, existingNames: string[], currentName?: string): ValidationResult;
function validateTagId(id: string, existingIds: string[], currentId?: string): ValidationResult;
```

### Usage Tracking

Find views with `control-tag` attribute matching the tag name:

```typescript
function findControlTagUsages(tagName: string, document: VSTGUIUIDescription | null): ControlTagUsage[];
```

## Implementation Phases

### Phase 1: Domain Layer
1. Create `src/domain/controlTags/` directory
2. Implement validation.ts with tests
3. Implement usage.ts with tests
4. Implement historyOperations.ts with tests

### Phase 2: Store Layer
1. Add getControlTags() to documentStore
2. Add addControlTag() with tests
3. Add updateControlTagName() with tests
4. Add updateControlTagId() with tests
5. Add deleteControlTag() with tests
6. Add restoreControlTagReference() with tests

### Phase 3: UI Components
1. Create ControlTagsPanel with CollapsibleSection
2. Create ControlTagItem with name display
3. Create AddControlTagButton
4. Create EmptyState
5. Wire up add functionality
6. Implement inline name editing
7. Implement inline ID editing
8. Implement delete with confirmation
9. Implement usage badge and popover

### Phase 4: Integration & Polish
1. Add ControlTagsPanel to LeftSidebar
2. Verify undo/redo for all operations
3. Run quality gates
4. Verify all FR/SC requirements

## Reusable Patterns from Existing Panels

| Pattern | Source | Reuse |
|---------|--------|-------|
| Panel structure | ColorsPanel | CollapsibleSection wrapper |
| Item component | ColorItem | Name display, hover delete |
| Inline editing | ColorItem | Double-click to edit |
| Delete confirmation | ColorsPanel | Dialog for used resources |
| Usage badge | ColorsPanel | Badge + popover |
| History operations | colors/historyOperations | Operation factory pattern |
| Validation | colors/validation | ValidationResult type |
| Usage tracking | colors/usage | View tree traversal |

## Dependencies

No new dependencies required. Uses:
- solid-js (createSignal, createMemo, createEffect, For, Show)
- solid-js/store (via documentStore)
- @floating-ui/dom (if usage popover needs positioning - already installed)

## Testing Strategy

Following constitution principles:
1. Write tests FIRST (TDD)
2. Co-locate tests with source (\_\_tests\_\_ directories)
3. Follow TESTING-GUIDE.md for SolidJS patterns
4. Target 80%+ coverage for business logic
5. Test edge cases (duplicate names, negative IDs, non-integer validation)
