# Data Model: Bitmaps Panel

**Branch**: `024-bitmaps-panel` | **Date**: 2026-01-08

## Core Types

### BitmapData (Embedded Image)
```typescript
interface BitmapData {
  encoding: 'base64';
  data: string;
}
```

### BitmapDefinition
```typescript
interface BitmapDefinition {
  path: string;
  'scale-factor'?: string;
  'nineparttiled-offsets'?: string;
  data?: BitmapData;
}
```

### BitmapsDefinition
```typescript
type BitmapsDefinition = Record<string, string | BitmapDefinition>;
```
Note: Supports both string shorthand (`"myBitmap": "path/to/file.png"`) and full object format.

## Domain Types

### BitmapUsage (from usage.ts)
```typescript
interface BitmapUsage {
  viewId: string;
  viewClass: string;
  attribute: string;
}
```

### RemovedBitmapReference (from store)
```typescript
interface RemovedBitmapReference {
  viewId: string;
  attribute: string;
  value: string;
}
```

## Store Operations

### getBitmaps
```typescript
function getBitmaps(): Record<string, string | BitmapDefinition> | undefined
```

### addBitmap
```typescript
function addBitmap(name: string, bitmap: BitmapDefinition): boolean
```

### updateBitmapName
```typescript
function updateBitmapName(oldName: string, newName: string): boolean
```

### updateBitmapProperty
```typescript
function updateBitmapProperty(
  name: string,
  prop: keyof BitmapDefinition,
  value: string
): string | null | undefined
```

### deleteBitmap
```typescript
function deleteBitmap(name: string): {
  bitmap: string | BitmapDefinition;
  removedReferences: RemovedBitmapReference[];
} | null
```

## Bitmap Attributes in Views

Views reference bitmaps using these attribute names:

| Attribute | Description |
|-----------|-------------|
| `bitmap` | Background/main bitmap |
| `disabled-bitmap` | Disabled state bitmap |
| `handle-bitmap` | Handle/thumb bitmap |
| `off-bitmap` | Off/empty state bitmap |
| `icon` | Normal icon bitmap |
| `icon-highlighted` | Highlighted icon bitmap |
| `splash-bitmap` | Splash screen bitmap |

## Helper Functions

### normalizeBitmap
```typescript
function normalizeBitmap(bitmap: string | BitmapDefinition): BitmapDefinition {
  return typeof bitmap === 'string' ? { path: bitmap } : bitmap;
}
```

### getBitmapPath
```typescript
function getBitmapPath(bitmap: string | BitmapDefinition): string {
  return typeof bitmap === 'string' ? bitmap : bitmap.path;
}
```

### getThumbnailUrl
```typescript
function getThumbnailUrl(bitmap: string | BitmapDefinition): string | null {
  const normalized = normalizeBitmap(bitmap);
  
  // Embedded base64 data takes priority
  if (normalized.data?.encoding === 'base64') {
    const ext = normalized.path.split('.').pop()?.toLowerCase() || 'png';
    const mime = ext === 'jpg' || ext === 'jpeg' ? 'image/jpeg' : `image/${ext}`;
    return `data:${mime};base64,${normalized.data.data}`;
  }
  
  // Path-based bitmap
  if (normalized.path) {
    return normalized.path;
  }
  
  return null;
}
```

### isEmbeddedBitmap
```typescript
function isEmbeddedBitmap(bitmap: string | BitmapDefinition): boolean {
  if (typeof bitmap === 'string') return false;
  return bitmap.data?.encoding === 'base64';
}
```
