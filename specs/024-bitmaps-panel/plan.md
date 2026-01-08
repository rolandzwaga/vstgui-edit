# Implementation Plan: Bitmaps Panel

**Branch**: `024-bitmaps-panel` | **Date**: 2026-01-08 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/024-bitmaps-panel/spec.md`

## Summary

Implement a Bitmaps panel for viewing, adding, editing, and deleting bitmap definitions in uidesc files. Bitmaps are referenced by views for backgrounds, buttons, and other graphical elements. Follow the established Colors/Fonts Panel pattern for UI/UX consistency while adapting for bitmap-specific requirements including thumbnail previews and async image loading.

## Technical Context

**Language/Version**: TypeScript 5.9.3 with strict mode enabled
**Primary Dependencies**: SolidJS 1.9.10, solid-js/store (already installed - no new dependencies)
**Storage**: N/A (in-memory state via existing documentStore)
**Testing**: Vitest 4.x with @solidjs/testing-library
**Testing Guide**: `specs/TESTING-GUIDE.md` - MUST be consulted for all test tasks  
**Target Platform**: Web (modern browsers)
**Project Type**: SolidJS SPA
**Performance Goals**: Panel renders within 1 second, thumbnails load async to avoid blocking UI
**Constraints**: Follow existing Colors/Fonts Panel pattern, integrate with existing undo/redo system
**Scale/Scope**: Typical uidesc files have 10-50 bitmap definitions

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
specs/024-bitmaps-panel/
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
│   └── BitmapsPanel/          # NEW - main feature component
│       ├── BitmapsPanel.tsx   # Main panel component
│       ├── BitmapsPanel.module.css
│       ├── BitmapItem.tsx     # Individual bitmap row with editing
│       ├── BitmapItem.module.css
│       ├── BitmapThumbnail.tsx # Async thumbnail with fallback
│       ├── BitmapThumbnail.module.css
│       ├── AddBitmapButton.tsx # Add bitmap action button
│       ├── AddBitmapButton.module.css
│       ├── EmptyState.tsx     # Empty state display
│       ├── EmptyState.module.css
│       ├── index.ts           # Barrel export
│       └── __tests__/
│           ├── BitmapsPanel.spec.tsx
│           ├── BitmapsPanel.add.spec.tsx
│           ├── BitmapsPanel.history.spec.tsx
│           ├── BitmapItem.spec.tsx
│           ├── BitmapItem.edit.spec.tsx
│           ├── BitmapItem.delete.spec.tsx
│           ├── BitmapItem.usage.spec.tsx
│           ├── BitmapItem.validation.spec.tsx
│           ├── BitmapThumbnail.spec.tsx
│           ├── AddBitmapButton.spec.tsx
│           └── EmptyState.spec.tsx
│
├── domain/
│   └── bitmaps/               # NEW - bitmap domain logic
│       ├── index.ts           # Barrel export
│       ├── validation.ts      # Bitmap validation (name)
│       ├── formatting.ts      # Display formatting (truncate path)
│       ├── usage.ts           # Find bitmap usages in views
│       ├── historyOperations.ts # Undo/redo operations
│       ├── thumbnail.ts       # Thumbnail URL generation
│       └── __tests__/
│           ├── validation.spec.ts
│           ├── formatting.spec.ts
│           ├── usage.spec.ts
│           ├── historyOperations.spec.ts
│           └── thumbnail.spec.ts
│
└── stores/
    └── documentStore.ts       # EXTEND - add bitmap CRUD operations
```

**Structure Decision**: Following the established Colors/Fonts Panel pattern with `src/components/BitmapsPanel/` for UI components and `src/domain/bitmaps/` for business logic.

## Reference Implementation

The Colors Panel and Fonts Panel provide the template patterns:

| Colors/Fonts Panel | Bitmaps Panel |
|-------------------|---------------|
| `ColorsPanel.tsx` / `FontsPanel.tsx` | `BitmapsPanel.tsx` |
| `ColorItem.tsx` / `FontItem.tsx` | `BitmapItem.tsx` |
| `ColorSwatch.tsx` / `FontPreview.tsx` | `BitmapThumbnail.tsx` |
| `AddColorButton.tsx` / `AddFontButton.tsx` | `AddBitmapButton.tsx` |
| `EmptyState.tsx` | `EmptyState.tsx` |
| `domain/colors/*` / `domain/fonts/*` | `domain/bitmaps/*` |

Key differences from Colors/Fonts Panel:
1. **Async loading**: Thumbnails load asynchronously with loading/error states
2. **Path-based**: Bitmaps reference external files via path
3. **Embedded data**: Bitmaps can have inline base64 data
4. **Fallback icon**: Show placeholder when image fails to load

## Bitmap Schema (from vstgui-uidesc.schema.json / uidesc.d.ts)

```typescript
interface BitmapDefinition {
  path: string;                    // File path relative to uidesc
  'scale-factor'?: string;         // DPI scale (1, 1.5, 2, etc.)
  'nineparttiled-offsets'?: string; // "top, left, bottom, right"
  data?: BitmapData;               // Optional embedded base64 data
}

interface BitmapData {
  encoding: 'base64';
  data: string;                    // Base64-encoded image data
}

// Note: BitmapsDefinition in uidesc.ts is union type:
type BitmapsDefinition = Record<string, string | BitmapDefinition>;
// Simple format: "bitmapName": "path/to/file.png"
// Full format: "bitmapName": { "path": "...", ... }
```

## Document Store Extensions

Add to `documentStore.ts`:

```typescript
// Bitmap CRUD operations
export function getBitmaps(): Record<string, string | BitmapDefinition> | undefined;
export function addBitmap(name: string, bitmap: BitmapDefinition): void;
export function updateBitmapName(oldName: string, newName: string): boolean;
export function updateBitmapProperty(name: string, prop: keyof BitmapDefinition, value: string): string | null;
export function deleteBitmap(name: string): { removedReferences: RemovedBitmapReference[] } | null;
```

## Key Patterns from Colors/Fonts Panel

### Usage Tracking Pattern
```typescript
// domain/bitmaps/usage.ts
const BITMAP_ATTRIBUTES = ['bitmap', 'background-bitmap', 'disabled-bitmap', 'hover-bitmap'];

export function findBitmapUsages(bitmapName: string, doc: VSTGUIUIDescription | null): BitmapUsage[];
```

### History Operations Pattern
```typescript
// domain/bitmaps/historyOperations.ts
export function createAddBitmapOperation(name: string, bitmap: BitmapDefinition): HistoryOperation;
export function createEditBitmapPropertyOperation(name: string, prop: string, oldValue: string, newValue: string): HistoryOperation;
export function createEditBitmapNameOperation(oldName: string, newName: string): HistoryOperation;
export function createDeleteBitmapOperation(name: string, bitmap: BitmapDefinition | string, removedReferences: RemovedBitmapReference[]): HistoryOperation;
```

### Thumbnail URL Generation
```typescript
// domain/bitmaps/thumbnail.ts
export function getThumbnailUrl(bitmap: BitmapDefinition | string): string | null;
// Returns:
// - data:image/png;base64,... for embedded bitmaps
// - relative path for path-based bitmaps (limited to same-origin files)
// - null for invalid/missing paths

export function isEmbeddedBitmap(bitmap: BitmapDefinition | string): boolean;
```

### Async Thumbnail Component Pattern
```typescript
// BitmapThumbnail.tsx
const BitmapThumbnail: Component<{ bitmap: BitmapDefinition | string }> = (props) => {
  const [state, setState] = createSignal<'loading' | 'loaded' | 'error'>('loading');
  
  const url = createMemo(() => getThumbnailUrl(props.bitmap));
  
  return (
    <Show when={url()} fallback={<PlaceholderIcon />}>
      <img 
        src={url()!}
        class={styles.thumbnail}
        onLoad={() => setState('loaded')}
        onError={() => setState('error')}
        alt=""
      />
      <Show when={state() === 'error'}>
        <PlaceholderIcon />
      </Show>
    </Show>
  );
};
```

## BitmapDefinition Type Union Handling

Since `BitmapsDefinition = Record<string, string | BitmapDefinition>`, code must handle both formats:

```typescript
// Helper to normalize bitmap to BitmapDefinition
export function normalizeBitmap(bitmap: string | BitmapDefinition): BitmapDefinition {
  return typeof bitmap === 'string' ? { path: bitmap } : bitmap;
}

// Helper to get path from either format
export function getBitmapPath(bitmap: string | BitmapDefinition): string {
  return typeof bitmap === 'string' ? bitmap : bitmap.path;
}
```

## Complexity Tracking

No constitution violations expected. Following established patterns throughout.
