# Implementation Plan: Fonts Panel

**Branch**: `023-fonts-panel` | **Date**: 2026-01-08 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/023-fonts-panel/spec.md`

## Summary

Implement a Fonts panel for viewing, adding, editing, and deleting font definitions in uidesc files. Fonts have complex properties (name, size, bold, italic, underline, strike-through, alternative-font-names) unlike the simple key-value colors. Follow the established Colors Panel pattern for UI/UX consistency while adapting for font-specific requirements including sample text preview and style indicators.

## Technical Context

**Language/Version**: TypeScript 5.9.3 with strict mode enabled
**Primary Dependencies**: SolidJS 1.9.10, solid-js/store (already installed - no new dependencies)
**Storage**: N/A (in-memory state via existing documentStore)
**Testing**: Vitest 4.x with @solidjs/testing-library
**Testing Guide**: `specs/TESTING-GUIDE.md` - MUST be consulted for all test tasks  
**Target Platform**: Web (modern browsers)
**Project Type**: SolidJS SPA
**Performance Goals**: Font list renders within 100ms, live preview updates within 50ms
**Constraints**: Follow existing Colors Panel pattern, integrate with existing undo/redo system
**Scale/Scope**: Typical uidesc files have 5-20 font definitions

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Gate | Requirement | Status |
|------|-------------|--------|
| I. Test-First | Tests written before implementation | ✅ Will follow TDD |
| II. Technology | SolidJS only, no React patterns | ✅ Using existing SolidJS patterns |
| IV. Code Quality | Run biome/stylelint/tsc after each task | ✅ Will enforce |
| XII. Framework | No React hooks, use createSignal/createEffect | ✅ Following existing code |
| XVIII. Zero Failing Tests | All tests must pass | ✅ Will enforce |
| XXI. Static Imports | No dynamic imports | ✅ Will use static imports only |
| XXII. Honest Completion | All FR/SC requirements verified | ✅ Will fill compliance table |
| XXIII. Quality Gates | npm run lint:css, check, typecheck pass | ✅ Will run before completion |

## Project Structure

### Documentation (this feature)

```text
specs/023-fonts-panel/
├── spec.md              # Feature specification
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output (N/A - no API endpoints)
└── tasks.md             # Phase 2 output (/speckit.tasks command)
```

### Source Code (repository root)

```text
src/
├── components/
│   └── FontsPanel/           # NEW - main feature component
│       ├── FontsPanel.tsx    # Main panel component
│       ├── FontsPanel.module.css
│       ├── FontItem.tsx      # Individual font row with editing
│       ├── FontItem.module.css
│       ├── FontPreview.tsx   # Sample text preview component
│       ├── FontPreview.module.css
│       ├── AddFontButton.tsx # Add font action button
│       ├── AddFontButton.module.css
│       ├── EmptyState.tsx    # Empty state display
│       ├── EmptyState.module.css
│       ├── index.ts          # Barrel export
│       └── __tests__/
│           ├── FontsPanel.spec.tsx
│           ├── FontsPanel.add.spec.tsx
│           ├── FontsPanel.history.spec.tsx
│           ├── FontItem.spec.tsx
│           ├── FontItem.edit.spec.tsx
│           ├── FontItem.delete.spec.tsx
│           ├── FontItem.usage.spec.tsx
│           ├── FontItem.validation.spec.tsx
│           ├── FontPreview.spec.tsx
│           ├── AddFontButton.spec.tsx
│           └── EmptyState.spec.tsx
│
├── domain/
│   └── fonts/                # NEW - font domain logic
│       ├── index.ts          # Barrel export
│       ├── validation.ts     # Font validation (name, size)
│       ├── formatting.ts     # Display formatting (truncate, summarize)
│       ├── usage.ts          # Find font usages in views
│       ├── historyOperations.ts # Undo/redo operations
│       └── __tests__/
│           ├── validation.spec.ts
│           ├── formatting.spec.ts
│           ├── usage.spec.ts
│           └── historyOperations.spec.ts
│
└── stores/
    └── documentStore.ts      # EXTEND - add font CRUD operations
```

**Structure Decision**: Following the established Colors Panel pattern with `src/components/FontsPanel/` for UI components and `src/domain/fonts/` for business logic. This maintains consistency with the existing codebase architecture.

## Reference Implementation

The Colors Panel (`src/components/ColorsPanel/`) provides the template pattern:

| Colors Panel | Fonts Panel |
|--------------|-------------|
| `ColorsPanel.tsx` | `FontsPanel.tsx` |
| `ColorItem.tsx` | `FontItem.tsx` |
| `ColorSwatch.tsx` | `FontPreview.tsx` |
| `AddColorButton.tsx` | `AddFontButton.tsx` |
| `EmptyState.tsx` | `EmptyState.tsx` |
| `domain/colors/*` | `domain/fonts/*` |

Key differences from Colors Panel:
1. **Multiple properties**: Fonts have 7 properties vs colors' 1 value
2. **Style indicators**: Show B/I badges for bold/italic
3. **Live preview**: Render sample text with actual font styling
4. **Complex validation**: Size must be positive, font-name required

## Font Schema (from vstgui-uidesc.schema.json)

```json
{
  "fontDefinition": {
    "type": "object",
    "required": ["font-name", "size"],
    "properties": {
      "font-name": { "type": "string", "description": "System font name" },
      "size": { "$ref": "#/$defs/numericValue", "description": "Font size in points" },
      "bold": { "$ref": "#/$defs/booleanValue" },
      "italic": { "$ref": "#/$defs/booleanValue" },
      "underline": { "$ref": "#/$defs/booleanValue" },
      "strike-through": { "$ref": "#/$defs/booleanValue" },
      "alternative-font-names": { "type": "string", "description": "Comma-separated fallbacks" }
    }
  }
}
```

## Document Store Extensions

Add to `documentStore.ts`:

```typescript
// Font CRUD operations
export function getFonts(): Record<string, FontDefinition> | undefined;
export function addFont(name: string, font: FontDefinition): void;
export function updateFontName(oldName: string, newName: string): boolean;
export function updateFontProperty(name: string, prop: keyof FontDefinition, value: string): string | null;
export function deleteFont(name: string): { removedReferences: RemovedFontReference[] } | null;
```

## Key Patterns from Colors Panel

### Usage Tracking Pattern
```typescript
// domain/fonts/usage.ts
const FONT_ATTRIBUTES = ['font'];  // Attributes that reference fonts

export function findFontUsages(fontName: string, doc: VSTGUIUIDescription | null): FontUsage[];
```

### History Operations Pattern
```typescript
// domain/fonts/historyOperations.ts
export function createAddFontOperation(name: string, font: FontDefinition): HistoryOperation;
export function createEditFontPropertyOperation(name: string, prop: string, oldValue: string, newValue: string): HistoryOperation;
export function createEditFontNameOperation(oldName: string, newName: string): HistoryOperation;
export function createDeleteFontOperation(name: string, font: FontDefinition, removedReferences: RemovedFontReference[]): HistoryOperation;
```

### Component State Pattern
```typescript
// FontItem.tsx - following ColorItem pattern
const [editingProperty, setEditingProperty] = createSignal<string | null>(null);
const [inputValue, setInputValue] = createSignal('');
const [error, setError] = createSignal<string | null>(null);
```

## Complexity Tracking

No constitution violations expected. Following established patterns throughout.
