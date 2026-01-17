# Bitmap Upload Feature Implementation Plan

## Overview

Enable users to upload image files as bitmaps, store them in IndexedDB, display thumbnails in the BitmapsPanel, and include them in ZIP exports.

---

## Architecture Decisions

| Decision | Choice |
|----------|--------|
| **Duplicate handling** | Ask user: replace existing or add under new name |
| **Undo behavior** | Full undo - also deletes blob from IndexedDB |
| **ZIP export** | Include uploaded bitmaps as `.png` files in `bitmaps/` folder |
| **Storage strategy** | Dual: IndexedDB (blob for display) + uidesc (path = filename) |

---

## Current State (What Exists)

| Component | Location | Status |
|-----------|----------|--------|
| `Bitmap` type | `src/domain/project/types.ts:54-81` | Complete schema with blob, dimensions, mimeType |
| `bitmapService` | `src/services/indexedDB/bitmapService.ts` | CRUD operations ready |
| `BitmapsPanel` | `src/components/BitmapsPanel/` | UI for listing/editing bitmaps |
| `BitmapItem` | `src/components/BitmapsPanel/BitmapItem.tsx` | Editable row with path input |
| `BitmapThumbnail` | `src/components/BitmapsPanel/BitmapThumbnail.tsx` | Displays path/base64 images |
| `exportAsZIP` | `src/domain/project/export.ts` | Already accepts `ExportBitmap[]` parameter |
| History operations | `src/domain/bitmaps/historyOperations.ts` | Add/delete/rename operations |

---

## Implementation Plan

### Phase 1: Domain Layer - File Handling

**New file: `src/domain/bitmaps/fileHandling.ts`**

```typescript
// Constants
export const MAX_BITMAP_SIZE = 10 * 1024 * 1024; // 10MB
export const SUPPORTED_FORMATS = ['image/png', 'image/jpeg', 'image/gif', 'image/bmp'];

// Validation
export interface FileValidationResult {
  valid: boolean;
  error?: string;
}
export function validateImageFile(file: File): FileValidationResult;

// Read image and extract dimensions
export interface ImageFileData {
  blob: Blob;
  width: number;
  height: number;
  mimeType: string;
  filename: string;
}
export function readImageFile(file: File): Promise<ImageFileData>;

// Check if name already exists
export function checkBitmapNameConflict(
  filename: string,
  existingNames: string[]
): { hasConflict: boolean; suggestedName: string };

// Generate unique name from filename
export function generateUniqueBitmapName(
  filename: string,
  existingNames: string[]
): string;
```

**Tests: `src/domain/bitmaps/fileHandling.spec.ts`**

---

### Phase 2: History Operations for Upload

**Update: `src/domain/bitmaps/historyOperations.ts`**

Add new operation type for bitmap upload with full undo support:

```typescript
export interface UploadBitmapData {
  bitmapName: string;
  bitmapDefinition: BitmapDefinition;
  indexedDBBitmap: Bitmap;
}

export function createUploadBitmapOperation(
  data: UploadBitmapData,
  addBitmapFn: (name: string, def: BitmapDefinition) => void,
  deleteBitmapFn: (name: string) => void
): HistoryOperation;
// undo: delete from uidesc + delete from IndexedDB
// redo: add to uidesc + add to IndexedDB
```

---

### Phase 3: Thumbnail Resolution from IndexedDB

**Update: `src/domain/bitmaps/thumbnail.ts`**

Add async thumbnail resolution that checks IndexedDB:

```typescript
// New: Get thumbnail URL from IndexedDB blob
export async function getThumbnailUrlAsync(
  bitmapName: string,
  bitmap: string | BitmapDefinition,
  projectId: string | null
): Promise<string | null>;
// 1. If embedded base64, return data URL
// 2. If projectId exists, check IndexedDB for stored blob by name
// 3. If found, create object URL from blob
// 4. Fall back to path string (external reference)

// Manage object URLs to prevent memory leaks
export function revokeThumbnailUrl(url: string): void;
```

---

### Phase 4: Store Updates

**Update: `src/stores/documentStore.ts`**

Add bitmap upload function:

```typescript
export interface UploadResult {
  success: boolean;
  bitmapName?: string;
  error?: string;
  conflictAction?: 'replace' | 'rename' | 'cancelled';
}

export async function uploadBitmap(
  file: File,
  conflictResolution?: 'replace' | 'rename'
): Promise<UploadResult>;
// 1. Validate file (size, format)
// 2. Read image dimensions
// 3. Check for name conflict
// 4. If conflict and no resolution provided, return for user decision
// 5. Add to uidesc: { path: filename }
// 6. Store blob in IndexedDB via bitmapService
// 7. Create and push history operation
// 8. Mark document dirty, schedule save
```

---

### Phase 5: UI Components

#### 5a. Conflict Resolution Dialog

**New file: `src/components/BitmapsPanel/BitmapConflictDialog.tsx`**

```tsx
export interface BitmapConflictDialogProps {
  filename: string;
  suggestedName: string;
  onReplace: () => void;
  onAddNew: () => void;
  onCancel: () => void;
}

// Dialog content:
// "A bitmap named '{filename}' already exists."
// [Replace] [Add as '{suggestedName}'] [Cancel]
```

**Styles: `src/components/BitmapsPanel/BitmapConflictDialog.module.css`**

---

#### 5b. Upload Button in BitmapItem

**Update: `src/components/BitmapsPanel/BitmapItem.tsx`**

Add upload button next to path input in expanded properties:

```tsx
// In properties section, replace path input row:
<div class={styles.propertyRow}>
  <label class={styles.propertyLabel}>Path</label>
  <div class={styles.pathInputGroup}>
    <input type="text" ... />
    <input
      type="file"
      accept="image/png,image/jpeg,image/gif,image/bmp"
      class={styles.hiddenFileInput}
      ref={fileInputRef}
      onChange={handleFileSelect}
    />
    <button
      type="button"
      class={styles.uploadButton}
      onClick={() => fileInputRef?.click()}
      title="Upload image file"
    >
      <UploadIcon />
    </button>
  </div>
</div>
```

**Update styles: `src/components/BitmapsPanel/BitmapItem.module.css`**

---

#### 5c. Update BitmapThumbnail for IndexedDB

**Update: `src/components/BitmapsPanel/BitmapThumbnail.tsx`**

```tsx
export interface BitmapThumbnailProps {
  bitmap: string | BitmapDefinition;
  bitmapName: string;        // NEW: for IndexedDB lookup
  projectId: string | null;  // NEW: for IndexedDB lookup
}

// Use createResource for async thumbnail loading
// Manage object URL lifecycle with onCleanup
```

---

#### 5d. Update BitmapsPanel

**Update: `src/components/BitmapsPanel/BitmapsPanel.tsx`**

- Pass `projectId` from `projectStore.currentProject?.id` to BitmapItem
- Add conflict dialog state and handlers
- Handle upload results from BitmapItem

---

### Phase 6: ZIP Export Integration

**Update: Export flow in toolbar/menu**

When exporting as ZIP:

```typescript
// In ExportMenu or wherever export is triggered
async function handleExportZip() {
  const projectId = projectStore.currentProject?.id;
  if (!projectId) return;

  // Get all stored bitmaps for this project
  const storedBitmaps = await bitmapService.getByProject(projectId);

  // Convert to ExportBitmap format
  const exportBitmaps: ExportBitmap[] = await Promise.all(
    storedBitmaps.map(async (bitmap) => ({
      name: bitmap.name,
      data: new Uint8Array(await bitmap.blob.arrayBuffer()),
    }))
  );

  // Export with bitmaps
  const zipData = await exportAsZIP(document, projectName, exportBitmaps);
  // ... trigger download
}
```

---

## File Changes Summary

| File | Change Type | Description |
|------|-------------|-------------|
| `src/domain/bitmaps/fileHandling.ts` | **NEW** | File validation, reading, name generation |
| `src/domain/bitmaps/fileHandling.spec.ts` | **NEW** | Tests for file handling |
| `src/domain/bitmaps/thumbnail.ts` | **UPDATE** | Add async IndexedDB lookup |
| `src/domain/bitmaps/thumbnail.spec.ts` | **UPDATE** | Tests for async thumbnail |
| `src/domain/bitmaps/historyOperations.ts` | **UPDATE** | Add upload operation |
| `src/domain/bitmaps/historyOperations.spec.ts` | **UPDATE** | Tests for upload undo/redo |
| `src/stores/documentStore.ts` | **UPDATE** | Add uploadBitmap function |
| `src/stores/documentStore.spec.ts` | **UPDATE** | Tests for upload flow |
| `src/components/BitmapsPanel/BitmapConflictDialog.tsx` | **NEW** | Conflict resolution UI |
| `src/components/BitmapsPanel/BitmapConflictDialog.module.css` | **NEW** | Dialog styles |
| `src/components/BitmapsPanel/BitmapConflictDialog.spec.tsx` | **NEW** | Dialog tests |
| `src/components/BitmapsPanel/BitmapItem.tsx` | **UPDATE** | Add file input + upload button |
| `src/components/BitmapsPanel/BitmapItem.module.css` | **UPDATE** | Upload button styles |
| `src/components/BitmapsPanel/BitmapItem.spec.tsx` | **UPDATE** | Upload interaction tests |
| `src/components/BitmapsPanel/BitmapThumbnail.tsx` | **UPDATE** | Async IndexedDB resolution |
| `src/components/BitmapsPanel/BitmapThumbnail.spec.tsx` | **UPDATE** | Async thumbnail tests |
| `src/components/BitmapsPanel/BitmapsPanel.tsx` | **UPDATE** | Pass projectId, conflict dialog |
| `src/components/BitmapsPanel/BitmapsPanel.spec.tsx` | **UPDATE** | Integration tests |
| `src/components/ExportMenu/ExportMenu.tsx` | **UPDATE** | Include bitmaps in ZIP |

---

## Data Flow

```
User clicks upload button
         │
         ▼
    File selected
         │
         ▼
┌─────────────────────────┐
│  validateImageFile()    │
│  - Check size < 10MB    │
│  - Check format         │
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────┐
│  readImageFile()        │
│  - FileReader → Blob    │
│  - Image → dimensions   │
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────┐
│  checkBitmapNameConflict│
└───────────┬─────────────┘
            │
    ┌───────┴───────┐
    │               │
No conflict    Has conflict
    │               │
    │               ▼
    │      ┌─────────────────┐
    │      │ ConflictDialog  │
    │      │ Replace/AddNew  │
    │      └────────┬────────┘
    │               │
    └───────┬───────┘
            │
            ▼
┌─────────────────────────┐
│  documentStore:         │
│  addBitmap(name, {path})│
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────┐
│  bitmapService.add()    │
│  Store blob in IndexedDB│
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────┐
│  pushOperation()        │
│  History with undo      │
└───────────┬─────────────┘
            │
            ▼
   Thumbnail displays
   from IndexedDB blob
```

---

## Undo/Redo Flow

```
UNDO uploadBitmap:
1. documentStore.deleteBitmap(name)  → Remove from uidesc
2. bitmapService.delete(bitmapId)    → Remove blob from IndexedDB
3. Thumbnail falls back to path (shows broken/placeholder)

REDO uploadBitmap:
1. documentStore.addBitmap(name, definition) → Add back to uidesc
2. bitmapService.add(bitmap)                 → Re-store blob in IndexedDB
3. Thumbnail resolves from IndexedDB again
```

**Note**: The redo operation needs to retain the original Blob reference in the history operation closure to re-store it.

---

## Testing Strategy

1. **Unit tests** (domain layer):
   - File validation (size limits, format checks)
   - Image dimension extraction
   - Name conflict detection
   - Unique name generation

2. **Integration tests** (store layer):
   - Full upload flow with IndexedDB mocking
   - Undo/redo with blob cleanup verification
   - Conflict resolution paths

3. **Component tests** (UI layer):
   - File input triggers
   - Conflict dialog interactions
   - Thumbnail loading states
   - Error states (invalid file, too large)

4. **E2E considerations**:
   - Upload → thumbnail appears
   - Upload → undo → thumbnail gone
   - Export ZIP → contains bitmap file

---

## Implementation Order

1. **Domain: fileHandling.ts** - Foundation for file operations
2. **Domain: thumbnail.ts update** - Async IndexedDB resolution
3. **Domain: historyOperations.ts update** - Upload undo/redo
4. **Store: documentStore.ts update** - Upload function
5. **UI: BitmapConflictDialog** - Conflict resolution
6. **UI: BitmapThumbnail update** - Async loading
7. **UI: BitmapItem update** - Upload button
8. **UI: BitmapsPanel update** - Wire everything together
9. **Export: ZIP integration** - Include stored bitmaps

---

## Estimated Scope

- **New files**: 4 (fileHandling.ts, fileHandling.spec.ts, BitmapConflictDialog.tsx, BitmapConflictDialog.module.css)
- **Updated files**: ~14
- **New tests**: ~50-80 test cases
