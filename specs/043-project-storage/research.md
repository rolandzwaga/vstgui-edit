# Research: Project Storage

**Feature**: 043-project-storage
**Date**: 2026-01-17

## Research Tasks

This document consolidates research findings for all technical unknowns identified during planning.

---

## 1. IndexedDB Best Practices for Modern Web Apps

### Decision: Use native IndexedDB API with typed wrappers

### Rationale

- **No additional dependencies** - Native API is well-supported across all target browsers
- **Full control** over database versioning and migrations
- **Smaller bundle size** compared to wrapper libraries like idb (~2KB saved)
- **TypeScript integration** via our own typed interfaces

### Alternatives Considered

| Library | Size | Pros | Cons |
|---------|------|------|------|
| Native API | 0KB | Full control, no deps | Verbose callback API |
| idb | 2KB | Promise-based, clean API | Extra dependency |
| Dexie | 16KB | Feature-rich, query builder | Overkill for simple schema |
| localForage | 8KB | Fallback support | Abstracts too much |

### Implementation Pattern

```typescript
// database.ts - Promisified wrapper
const DB_NAME = 'vstgui-edit-projects';
const DB_VERSION = 1;

let dbInstance: IDBDatabase | null = null;

export function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // Projects store
      if (!db.objectStoreNames.contains('projects')) {
        db.createObjectStore('projects', { keyPath: 'id' });
      }

      // Bitmaps store with index
      if (!db.objectStoreNames.contains('bitmaps')) {
        const bitmapStore = db.createObjectStore('bitmaps', { keyPath: 'id' });
        bitmapStore.createIndex('projectId', 'projectId', { unique: false });
      }
    };

    request.onsuccess = () => {
      dbInstance = request.result;
      resolve(dbInstance);
    };

    request.onerror = () => reject(request.error);
  });
}

// Generic CRUD helpers
export function getStore(
  storeName: string,
  mode: IDBTransactionMode = 'readonly'
): IDBObjectStore {
  if (!dbInstance) throw new Error('Database not initialized');
  return dbInstance.transaction(storeName, mode).objectStore(storeName);
}

export function promisifyRequest<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}
```

### References

- [MDN IndexedDB API](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API)
- [Storage Quotas and Eviction](https://developer.mozilla.org/en-US/docs/Web/API/Storage_API/Storage_quotas_and_eviction_criteria)

---

## 2. Blob Storage in IndexedDB

### Decision: Store Blobs directly in IndexedDB

### Rationale

- IndexedDB natively supports Blob storage without encoding
- More efficient than base64 encoding (~33% smaller)
- Browser handles memory management and streaming
- Blob retrieval creates object URLs for display

### Key Findings

1. **No per-object size limit** - Only constrained by total quota
2. **Quota varies by browser**:
   - Chrome/Edge: Up to 60% of disk space
   - Firefox: Up to 10GB or 10% of disk
   - Safari: ~1GB without prompt, user approval for more
3. **Use `navigator.storage.estimate()`** to check available space

### Implementation Pattern

```typescript
// Storing a bitmap
async function storeBitmap(projectId: string, file: File): Promise<BitmapRecord> {
  const id = crypto.randomUUID();

  // Get dimensions from image
  const dimensions = await getImageDimensions(file);

  const record: BitmapRecord = {
    id,
    projectId,
    name: file.name,
    blob: file, // Store Blob directly
    mimeType: file.type,
    width: dimensions.width,
    height: dimensions.height,
    size: file.size,
    addedAt: new Date().toISOString(),
  };

  const store = getStore('bitmaps', 'readwrite');
  await promisifyRequest(store.put(record));

  return record;
}

// Retrieving and displaying
async function getBitmapUrl(bitmapId: string): Promise<string> {
  const store = getStore('bitmaps', 'readonly');
  const record = await promisifyRequest(store.get(bitmapId));

  if (!record) throw new Error('Bitmap not found');

  return URL.createObjectURL(record.blob);
}

// Clean up object URLs when done
function revokeBitmapUrl(url: string): void {
  URL.revokeObjectURL(url);
}
```

### Storage Quota Monitoring

```typescript
async function checkStorageQuota(): Promise<{
  used: number;
  available: number;
  percentUsed: number;
}> {
  if (!navigator.storage?.estimate) {
    return { used: 0, available: Infinity, percentUsed: 0 };
  }

  const estimate = await navigator.storage.estimate();
  const used = estimate.usage ?? 0;
  const available = estimate.quota ?? Infinity;
  const percentUsed = available === Infinity ? 0 : (used / available) * 100;

  return { used, available, percentUsed };
}

// Warn at 80% capacity per spec FR-032
const QUOTA_WARNING_THRESHOLD = 80;
```

---

## 3. SolidJS Integration with IndexedDB

### Decision: Async initialization with fallback state

### Rationale

- IndexedDB operations are inherently async
- SolidJS stores work well with initial loading states
- Clean separation: services handle IndexedDB, stores handle reactivity

### Key Patterns

1. **Initialize storage before rendering main app**
2. **Use signals for storage availability state**
3. **Debounced effects for auto-save**
4. **Cleanup timers in `onCleanup`**

### Implementation Pattern

```typescript
// projectStore.ts
import { createStore } from 'solid-js/store';
import { onCleanup } from 'solid-js';

interface ProjectStoreState {
  currentProject: Project | null;
  isDirty: boolean;
  saveStatus: 'idle' | 'saving' | 'saved' | 'error';
  lastSavedAt: Date | null;
  isSessionOnly: boolean;
}

const [store, setStore] = createStore<ProjectStoreState>({
  currentProject: null,
  isDirty: false,
  saveStatus: 'idle',
  lastSavedAt: null,
  isSessionOnly: false,
});

// Auto-save with debounced timers
let docTimer: ReturnType<typeof setTimeout> | null = null;
let stateTimer: ReturnType<typeof setTimeout> | null = null;

export function scheduleDocumentSave(): void {
  if (store.isSessionOnly || !store.currentProject) return;

  if (docTimer) clearTimeout(docTimer);
  docTimer = setTimeout(async () => {
    await performSave('document');
  }, 2000);

  setStore({ isDirty: true });
}

export function scheduleStateSave(): void {
  if (store.isSessionOnly || !store.currentProject) return;

  if (stateTimer) clearTimeout(stateTimer);
  stateTimer = setTimeout(async () => {
    await performSave('state');
  }, 10000);
}

// Cleanup in App.tsx
onCleanup(() => {
  if (docTimer) clearTimeout(docTimer);
  if (stateTimer) clearTimeout(stateTimer);
});
```

### Integrating with Existing Stores

```typescript
// In documentStore.ts - add change notification
import { scheduleDocumentSave } from './projectStore';

export function markDirty(): void {
  if (!store.isDirty) {
    setStore({ isDirty: true });
  }
  // Notify projectStore for auto-save
  scheduleDocumentSave();
}
```

---

## 4. ZIP File Generation in Browser

### Decision: Use fflate library

### Rationale

- **Smallest size**: 8KB minified (vs 95KB for JSZip)
- **Fastest performance**: Uses WASM where available
- **Tree-shakeable**: Only import what you need
- **Modern API**: Stream-friendly for large files

### Alternatives Considered

| Library | Size (min) | Performance | API Style |
|---------|------------|-------------|-----------|
| fflate | 8KB | Fastest | Modern, streaming |
| JSZip | 95KB | Good | Promise-based |
| zip.js | 45KB | Good | Worker-based |
| archiver | N/A | N/A | Node.js only |

### Implementation Pattern

```typescript
import { zip } from 'fflate';

interface ZipEntry {
  name: string;
  data: Uint8Array;
}

async function createProjectZip(
  project: Project,
  bitmaps: BitmapRecord[]
): Promise<Uint8Array> {
  const entries: Record<string, Uint8Array> = {};

  // Add uidesc file
  const uidescContent = new TextEncoder().encode(project.uidescContent);
  entries[`${project.name}.uidesc`] = uidescContent;

  // Add bitmaps
  for (const bitmap of bitmaps) {
    const arrayBuffer = await bitmap.blob.arrayBuffer();
    entries[`bitmaps/${bitmap.name}`] = new Uint8Array(arrayBuffer);
  }

  // Create ZIP
  return new Promise((resolve, reject) => {
    zip(entries, { level: 6 }, (err, data) => {
      if (err) reject(err);
      else resolve(data);
    });
  });
}

// Download helper
function downloadZip(filename: string, data: Uint8Array): void {
  const blob = new Blob([data], { type: 'application/zip' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();

  URL.revokeObjectURL(url);
}
```

### References

- [fflate GitHub](https://github.com/101arrowz/fflate)
- [fflate Documentation](https://github.com/101arrowz/fflate#readme)

---

## 5. Thumbnail Generation

### Decision: Canvas-based SVG rendering with fixed dimensions

### Rationale

- Existing app uses SVG for view rendering
- Canvas API can render SVG to bitmap
- Fixed 200x150 dimensions per spec assumption
- Base64 data URL for easy storage in IndexedDB

### Implementation Pattern

```typescript
const THUMBNAIL_WIDTH = 200;
const THUMBNAIL_HEIGHT = 150;

async function generateThumbnail(
  templateElement: SVGElement
): Promise<string> {
  // Create canvas
  const canvas = document.createElement('canvas');
  canvas.width = THUMBNAIL_WIDTH;
  canvas.height = THUMBNAIL_HEIGHT;
  const ctx = canvas.getContext('2d');

  if (!ctx) throw new Error('Canvas context unavailable');

  // Convert SVG to data URL
  const svgString = new XMLSerializer().serializeToString(templateElement);
  const svgBlob = new Blob([svgString], { type: 'image/svg+xml' });
  const svgUrl = URL.createObjectURL(svgBlob);

  // Load and draw to canvas
  const img = new Image();
  await new Promise((resolve, reject) => {
    img.onload = resolve;
    img.onerror = reject;
    img.src = svgUrl;
  });

  // Scale to fit
  const scale = Math.min(
    THUMBNAIL_WIDTH / img.naturalWidth,
    THUMBNAIL_HEIGHT / img.naturalHeight
  );
  const x = (THUMBNAIL_WIDTH - img.naturalWidth * scale) / 2;
  const y = (THUMBNAIL_HEIGHT - img.naturalHeight * scale) / 2;

  ctx.fillStyle = '#1a1a1a'; // Dark background
  ctx.fillRect(0, 0, THUMBNAIL_WIDTH, THUMBNAIL_HEIGHT);
  ctx.drawImage(img, x, y, img.naturalWidth * scale, img.naturalHeight * scale);

  URL.revokeObjectURL(svgUrl);

  // Return as data URL
  return canvas.toDataURL('image/png');
}
```

---

## 6. Session-Only Fallback Mode

### Decision: Feature-complete in-memory mode

### Rationale

- Per spec: "Full editing functionality works in memory"
- Required for private browsing and disabled IndexedDB
- Same UX except no persistence warning

### Detection Pattern

```typescript
async function checkIndexedDBAvailability(): Promise<boolean> {
  // Check if API exists
  if (!window.indexedDB) return false;

  // Try to open a test database
  try {
    const testDb = await new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open('__test__', 1);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    testDb.close();
    indexedDB.deleteDatabase('__test__');
    return true;
  } catch {
    return false;
  }
}
```

### Session-Only Behavior

When IndexedDB is unavailable:
1. Show warning banner (dismissible)
2. Disable "Open Project" button (no projects to open)
3. Import/Create works normally (in memory)
4. Export works normally
5. No auto-save (nothing to save to)
6. "Save" becomes "Export" only

---

## 7. Project Name Validation

### Decision: Alphanumeric + spaces + hyphens + underscores, 1-100 chars

### Rationale

- Per spec assumption
- Duplicate names allowed (UUID is primary key)
- Compatible with filesystem export

### Implementation

```typescript
const PROJECT_NAME_REGEX = /^[a-zA-Z0-9 _-]+$/;
const PROJECT_NAME_MIN = 1;
const PROJECT_NAME_MAX = 100;

interface ValidationResult {
  valid: boolean;
  error?: string;
}

function validateProjectName(name: string): ValidationResult {
  const trimmed = name.trim();

  if (trimmed.length < PROJECT_NAME_MIN) {
    return { valid: false, error: 'Project name is required' };
  }

  if (trimmed.length > PROJECT_NAME_MAX) {
    return { valid: false, error: `Name must be ${PROJECT_NAME_MAX} characters or less` };
  }

  if (!PROJECT_NAME_REGEX.test(trimmed)) {
    return {
      valid: false,
      error: 'Name can only contain letters, numbers, spaces, hyphens, and underscores'
    };
  }

  return { valid: true };
}

function sanitizeProjectName(name: string): string {
  return name
    .trim()
    .replace(/[^a-zA-Z0-9 _-]/g, '')
    .slice(0, PROJECT_NAME_MAX);
}
```

---

## 8. Concurrent Tab Handling

### Decision: Last-write-wins with warning

### Rationale

- Per spec assumption: "Last-write-wins strategy"
- Full locking is complex and error-prone
- Warning informs users of potential conflicts

### Detection Pattern

```typescript
// Use BroadcastChannel API for tab coordination
const channel = new BroadcastChannel('vstgui-edit-project');

let lastKnownUpdate: string | null = null;

channel.onmessage = (event) => {
  if (event.data.type === 'project-updated' &&
      event.data.projectId === currentProjectId &&
      event.data.timestamp !== lastKnownUpdate) {
    showConflictWarning(
      'This project was modified in another tab. Your changes may overwrite those changes.'
    );
  }
};

// On save
function broadcastUpdate(projectId: string): void {
  lastKnownUpdate = new Date().toISOString();
  channel.postMessage({
    type: 'project-updated',
    projectId,
    timestamp: lastKnownUpdate,
  });
}
```

---

## Test Infrastructure

### fake-indexeddb Setup

```typescript
// vitest.setup.ts
import 'fake-indexeddb/auto';

// Or manual setup for more control
import { indexedDB, IDBKeyRange } from 'fake-indexeddb';

beforeEach(() => {
  global.indexedDB = indexedDB;
  global.IDBKeyRange = IDBKeyRange;
});

afterEach(async () => {
  // Clean up databases between tests
  const databases = await indexedDB.databases();
  for (const db of databases) {
    if (db.name) {
      indexedDB.deleteDatabase(db.name);
    }
  }
});
```

### Storage Quota Mocking

```typescript
// Mock navigator.storage.estimate
vi.stubGlobal('navigator', {
  ...navigator,
  storage: {
    estimate: vi.fn().mockResolvedValue({
      usage: 5 * 1024 * 1024, // 5MB used
      quota: 100 * 1024 * 1024, // 100MB quota
    }),
    persist: vi.fn().mockResolvedValue(true),
  },
});
```
