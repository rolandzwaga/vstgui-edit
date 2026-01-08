# Quickstart: Bitmaps Panel Implementation

**Branch**: `024-bitmaps-panel` | **Date**: 2026-01-08

## Prerequisites

- Review research.md for bitmap attribute names and patterns
- Review data-model.md for type definitions
- Reference ColorsPanel and FontsPanel implementations

## Implementation Order

### 1. Domain Layer (src/domain/bitmaps/)

Create files in this order:

1. **validation.ts** - Name validation (unique, non-empty)
2. **formatting.ts** - Path truncation, display formatting
3. **usage.ts** - Find bitmap references in views
4. **thumbnail.ts** - URL generation for previews
5. **historyOperations.ts** - Undo/redo operations
6. **index.ts** - Barrel export

### 2. Store Extensions (src/stores/documentStore.ts)

Add after existing font functions:

```typescript
// Bitmap CRUD operations
export function getBitmaps(): Record<string, string | BitmapDefinition> | undefined;
export function addBitmap(name: string, bitmap: BitmapDefinition): boolean;
export function updateBitmapName(oldName: string, newName: string): boolean;
export function updateBitmapProperty(name: string, prop: string, value: string): string | null | undefined;
export function deleteBitmap(name: string): { bitmap, removedReferences } | null;
```

### 3. UI Components (src/components/BitmapsPanel/)

Create files:

1. **BitmapThumbnail.tsx** - Async image with loading/error states
2. **BitmapItem.tsx** - Individual bitmap row
3. **BitmapsPanel.tsx** - Main panel using CollapsibleSection
4. **index.ts** - Barrel export

### 4. Wire to App

In App.tsx, add BitmapsPanel to sidebar after FontsPanel.

## Key Patterns to Follow

### Async Thumbnail Loading

```tsx
const BitmapThumbnail: Component<Props> = (props) => {
  const [state, setState] = createSignal<'loading' | 'loaded' | 'error'>('loading');
  const url = createMemo(() => getThumbnailUrl(props.bitmap));
  
  return (
    <Show when={url()} fallback={<PlaceholderIcon />}>
      <img
        src={url()!}
        onLoad={() => setState('loaded')}
        onError={() => setState('error')}
      />
      <Show when={state() === 'error'}>
        <PlaceholderIcon />
      </Show>
    </Show>
  );
};
```

### History Operation with DI

```typescript
let storeAddBitmap: AddBitmapFn;
// ...

export function initBitmapHistoryOperations(/* functions */) {
  storeAddBitmap = addBitmap;
  // ...
}

export function createAddBitmapOperation(name: string, bitmap: BitmapDefinition): HistoryOperation {
  let removedReferences: RemovedBitmapReference[] = [];
  return {
    type: 'add-bitmap',
    description: `Add bitmap "${name}"`,
    timestamp: Date.now(),
    undo: () => { /* ... */ },
    redo: () => { /* ... */ },
  };
}
```

### Usage Tracking

```typescript
const BITMAP_ATTRIBUTES = [
  'bitmap', 'disabled-bitmap', 'handle-bitmap',
  'off-bitmap', 'icon', 'icon-highlighted', 'splash-bitmap',
];

export function findBitmapUsages(bitmapName: string, doc: VSTGUIUIDescription | null): BitmapUsage[] {
  // Same pattern as findColorUsages/findFontUsages
}
```

## Test Files to Create

Domain tests:
- `src/domain/bitmaps/__tests__/validation.spec.ts`
- `src/domain/bitmaps/__tests__/formatting.spec.ts`
- `src/domain/bitmaps/__tests__/usage.spec.ts`
- `src/domain/bitmaps/__tests__/thumbnail.spec.ts`
- `src/domain/bitmaps/__tests__/historyOperations.spec.ts`

Component tests:
- `src/components/BitmapsPanel/__tests__/BitmapsPanel.spec.tsx`
- `src/components/BitmapsPanel/__tests__/BitmapItem.spec.tsx`
- `src/components/BitmapsPanel/__tests__/BitmapThumbnail.spec.tsx`

## Quality Gates

Run before completion:
```bash
npm run lint:css
npm run check
npm run typecheck
npm test
```
