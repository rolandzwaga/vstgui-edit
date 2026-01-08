# Research: Bitmaps Panel

**Branch**: `024-bitmaps-panel` | **Date**: 2026-01-08

## Summary

Research completed for Bitmaps Panel implementation. This feature follows established patterns from ColorsPanel and FontsPanel with bitmap-specific adaptations for async thumbnail loading and path-based image references.

## Key Findings

### 1. Bitmap Attribute Names in Views

From `vstgui-uidesc.schema.json`, views reference bitmaps using these attributes:

| Attribute | Description | Used By |
|-----------|-------------|---------|
| `bitmap` | Background bitmap reference | Most views (CView, CControl, etc.) |
| `disabled-bitmap` | Disabled state bitmap | CControl derivatives |
| `handle-bitmap` | Handle/thumb bitmap | CKnob, CSlider |
| `off-bitmap` | Off/empty state bitmap | CVuMeter |
| `icon` | Normal icon bitmap | CTextButton, CSegmentButton |
| `icon-highlighted` | Highlighted icon bitmap | CTextButton, CSegmentButton |
| `splash-bitmap` | Splash bitmap | CAnimationSplashScreen |

**BITMAP_ATTRIBUTES constant for usage tracking:**
```typescript
const BITMAP_ATTRIBUTES = [
  'bitmap',
  'disabled-bitmap',
  'handle-bitmap',
  'off-bitmap',
  'icon',
  'icon-highlighted',
  'splash-bitmap',
];
```

### 2. Type Discrepancy: uidesc.ts vs uidesc.d.ts

**Current uidesc.ts (incomplete):**
```typescript
interface BitmapDefinition {
  path: string;
  'nine-part-tiled-offsets'?: string;  // Wrong property name!
}
type BitmapsDefinition = Record<string, string | BitmapDefinition>;
```

**Schema/uidesc.d.ts (correct):**
```typescript
interface BitmapDefinition {
  path: string;
  'scale-factor'?: string;
  'nineparttiled-offsets'?: string;  // Correct property name
  data?: BitmapData;
}
interface BitmapData {
  encoding: 'base64';
  data: string;
}
// Note: In uidesc.d.ts, BitmapsDefinition does NOT support string shorthand
```

**Action Required**: Update `uidesc.ts` to match schema:
1. Add `scale-factor` property
2. Fix property name: `nine-part-tiled-offsets` → `nineparttiled-offsets`
3. Add `data?: BitmapData` property
4. Keep union type `string | BitmapDefinition` for backward compatibility

### 3. Pattern Analysis: Colors vs Fonts vs Bitmaps

| Aspect | Colors | Fonts | Bitmaps |
|--------|--------|-------|---------|
| Definition Type | `string` (hex/name) | `FontDefinition` object | `string \| BitmapDefinition` union |
| Preview | ColorSwatch (CSS) | FontPreview (text sample) | BitmapThumbnail (async img) |
| Attributes | 9 color attrs | 1 font attr | 7 bitmap attrs |
| Properties | value only | font-name, size, bold, etc. | path, scale-factor, nineparttiled-offsets, data |
| Special Handling | Hex parsing | None | Async loading, base64 embedded |

### 4. Store Pattern Analysis

From `documentStore.ts`:

**Colors API:**
- `getColors()` → `Record<string, string>`
- `addColor(name, value)` → `boolean`
- `updateColorName(oldName, newName)` → `boolean`
- `updateColorValue(name, value)` → `string | null`
- `deleteColor(name)` → `{ oldValue, removedReferences }`

**Fonts API:**
- `getFonts()` → `Record<string, FontDefinition>`
- `addFont(name, font)` → `boolean`
- `updateFontName(oldName, newName)` → `boolean`
- `updateFontProperty(name, prop, value)` → `string | null | undefined`
- `deleteFont(name)` → `{ font, removedReferences }`

**Bitmaps API (to implement):**
- `getBitmaps()` → `Record<string, string | BitmapDefinition>`
- `addBitmap(name, bitmap)` → `boolean`
- `updateBitmapName(oldName, newName)` → `boolean`
- `updateBitmapProperty(name, prop, value)` → `string | null | undefined`
- `deleteBitmap(name)` → `{ bitmap, removedReferences }`

### 5. History Operations Pattern

From `domain/fonts/historyOperations.ts`:

Uses dependency injection pattern to avoid circular imports:
```typescript
let storeAddFont: AddFontFn;
// ... other store functions

export function initFontHistoryOperations(
  addFont: AddFontFn,
  deleteFont: DeleteFontFn,
  // ...
): void { /* inject functions */ }
```

**Bitmaps will use the same pattern.**

### 6. Thumbnail Generation Strategy

**For path-based bitmaps:**
- Return the path string directly
- Browser will attempt to load from relative path
- Show placeholder on load error

**For embedded base64 bitmaps:**
- Check if `data?.encoding === 'base64'`
- Return `data:image/png;base64,${bitmap.data.data}`
- Detect MIME type from path extension or default to PNG

**For string shorthand:**
- Treat as path: `typeof bitmap === 'string' ? { path: bitmap } : bitmap`

### 7. Component Structure

Following FontsPanel pattern:
```
src/components/BitmapsPanel/
├── BitmapsPanel.tsx       # Main panel with CollapsibleSection
├── BitmapsPanel.module.css
├── BitmapItem.tsx         # Individual bitmap row (name + thumbnail + expand)
├── BitmapItem.module.css
├── BitmapThumbnail.tsx    # Async image with loading/error states
├── BitmapThumbnail.module.css
├── index.ts               # Barrel export
└── __tests__/
    └── *.spec.tsx
```

### 8. No Unknowns Remaining

All patterns are established in the codebase. Implementation is straightforward following existing conventions.

## Type Updates Required

### uidesc.ts Changes

```typescript
// Add BitmapData interface
export interface BitmapData {
  encoding: 'base64';
  data: string;
}

// Update BitmapDefinition
export interface BitmapDefinition {
  path: string;
  'scale-factor'?: string;
  'nineparttiled-offsets'?: string;
  data?: BitmapData;
}

// BitmapsDefinition stays the same (supports string shorthand)
export type BitmapsDefinition = Record<string, string | BitmapDefinition>;
```

## Implementation Dependencies

1. **Phase 1**: Update `uidesc.ts` types first
2. **Phase 2**: Domain layer (`src/domain/bitmaps/`)
3. **Phase 3**: Store extensions (`documentStore.ts`)
4. **Phase 4**: UI components (`src/components/BitmapsPanel/`)
5. **Phase 5**: Wire to App.tsx sidebar

## Test File References

- `src/domain/colors/__tests__/*.spec.ts` - Domain test patterns
- `src/domain/fonts/__tests__/*.spec.ts` - Domain test patterns
- `src/components/ColorsPanel/__tests__/*.spec.tsx` - UI test patterns
- `src/components/FontsPanel/__tests__/*.spec.tsx` - UI test patterns
