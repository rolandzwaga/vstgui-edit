# Data Model: Project Storage

**Feature**: 043-project-storage
**Date**: 2026-01-17

## Entity Overview

```text
┌─────────────────────────────────────────────────────────────────┐
│                          Project                                 │
│  - id: UUID (primary key)                                       │
│  - name: string                                                  │
│  - createdAt: ISO timestamp                                     │
│  - updatedAt: ISO timestamp                                     │
│  - uidescContent: string (raw JSON/XML)                         │
│  - uidescFormat: 'json' | 'xml'                                 │
│  - editorState: EditorState                                     │
│  - settings: ProjectSettings                                    │
│  - thumbnailDataUrl: string | null                              │
└───────────────────────────┬─────────────────────────────────────┘
                            │ 1
                            │
                            │ *
┌───────────────────────────┴─────────────────────────────────────┐
│                          Bitmap                                  │
│  - id: UUID (primary key)                                       │
│  - projectId: UUID (foreign key, indexed)                       │
│  - name: string                                                  │
│  - blob: Blob                                                    │
│  - mimeType: string                                              │
│  - width: number                                                 │
│  - height: number                                                │
│  - size: number (bytes)                                          │
│  - addedAt: ISO timestamp                                        │
└─────────────────────────────────────────────────────────────────┘
```

## Entities

### Project

Represents a complete editing session including uidesc content, editor state, settings, and thumbnail.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | `string` | UUID, primary key | Unique identifier |
| `name` | `string` | 1-100 chars, alphanumeric + space/hyphen/underscore | User-provided display name |
| `createdAt` | `string` | ISO 8601 timestamp | When project was created |
| `updatedAt` | `string` | ISO 8601 timestamp | Last modification time |
| `uidescContent` | `string` | Valid JSON or XML | Raw uidesc file content |
| `uidescFormat` | `'json' \| 'xml'` | Enum | Original file format |
| `editorState` | `EditorState` | Embedded object | Canvas and panel states |
| `settings` | `ProjectSettings` | Embedded object | Project-specific preferences |
| `thumbnailDataUrl` | `string \| null` | Base64 data URL or null | Preview image for project list |

**Validation Rules**:
- `name` must pass `validateProjectName()` before save
- `uidescContent` must be parseable by `parseUidesc()`
- `createdAt` is immutable after creation
- `updatedAt` is automatically updated on every save

**State Transitions**:
- Created -> Active (on load)
- Active -> Dirty (on edit)
- Dirty -> Clean (on save)
- Active -> Closed (on close/delete)

### EditorState

Embedded within Project. Captures the visual state of the editor for session restoration.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `panOffset` | `{ x: number; y: number }` | Finite numbers | Canvas pan position |
| `zoomLevel` | `number` | 0.1-5.0 | Canvas zoom level |
| `expandedHierarchyNodes` | `string[]` | Valid view IDs | Expanded nodes in hierarchy panel |
| `expandedPropertyGroups` | `string[]` | Valid group IDs | Expanded groups in properties panel |
| `selectedTemplateId` | `string \| null` | Valid template name or null | Currently active template |

**Serialization Notes**:
- Sets are converted to arrays for JSON storage
- Deserialization reconstructs Sets in stores

### ProjectSettings

Embedded within Project. Contains all configurable preferences that apply to the project.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `grid.size` | `number` | 5, 8, 10, 12, 16, or 20 | Grid spacing in pixels |
| `grid.style` | `'lines' \| 'dots' \| 'crosshairs'` | Enum | Grid visual style |
| `grid.visibleByDefault` | `boolean` | - | Show grid on document load |
| `snap.enabledByDefault` | `boolean` | - | Enable snap on document load |
| `snap.threshold` | `number` | 1-20 | Snap distance in pixels |
| `smartGuides.enabledByDefault` | `boolean` | - | Enable smart guides on document load |
| `customGuides.snapEnabledByDefault` | `boolean` | - | Enable guide snap on document load |
| `customGuides.guides` | `Guide[]` | Max 50 guides | Saved guide positions |
| `theme.mode` | `'light' \| 'dark' \| 'system'` | Enum | Theme preference |
| `autoSave.enabled` | `boolean` | Default: true | Auto-save enabled |

**Default Values**:
```typescript
const DEFAULT_PROJECT_SETTINGS: ProjectSettings = {
  grid: {
    size: 10,
    style: 'lines',
    visibleByDefault: false,
  },
  snap: {
    enabledByDefault: false,
    threshold: 5,
  },
  smartGuides: {
    enabledByDefault: true,
  },
  customGuides: {
    snapEnabledByDefault: true,
    guides: [],
  },
  theme: {
    mode: 'system',
  },
  autoSave: {
    enabled: true,
  },
};
```

### Bitmap

Represents an image asset stored as a Blob. Linked to exactly one Project.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | `string` | UUID, primary key | Unique identifier |
| `projectId` | `string` | UUID, indexed | Parent project reference |
| `name` | `string` | Matches uidesc bitmap reference | Display name and reference key |
| `blob` | `Blob` | Max 10MB | Actual image data |
| `mimeType` | `string` | image/* MIME types | File type |
| `width` | `number` | Positive integer | Image width in pixels |
| `height` | `number` | Positive integer | Image height in pixels |
| `size` | `number` | Positive integer | File size in bytes |
| `addedAt` | `string` | ISO 8601 timestamp | When bitmap was added |

**Validation Rules**:
- `blob.size` must be <= 10MB (10 * 1024 * 1024 bytes)
- `mimeType` must start with `image/`
- `name` should be unique within a project (for reference matching)

### Guide (Embedded in ProjectSettings)

Represents a custom alignment guide line.

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | `string` | UUID | Unique identifier |
| `orientation` | `'horizontal' \| 'vertical'` | Enum | Guide direction |
| `position` | `number` | Finite number | Position in pixels |

## IndexedDB Schema

### Database Configuration

```typescript
const DB_NAME = 'vstgui-edit-projects';
const DB_VERSION = 1;

// Object Stores
const STORES = {
  PROJECTS: 'projects',
  BITMAPS: 'bitmaps',
} as const;

// Indexes
const INDEXES = {
  BITMAPS_BY_PROJECT: 'projectId',
} as const;
```

### Schema Definition

```typescript
// On upgradeneeded (version 1)
function upgradeDatabase(db: IDBDatabase): void {
  // Projects store - simple key-value by id
  if (!db.objectStoreNames.contains(STORES.PROJECTS)) {
    db.createObjectStore(STORES.PROJECTS, { keyPath: 'id' });
  }

  // Bitmaps store - with projectId index for queries
  if (!db.objectStoreNames.contains(STORES.BITMAPS)) {
    const bitmapStore = db.createObjectStore(STORES.BITMAPS, { keyPath: 'id' });
    bitmapStore.createIndex(INDEXES.BITMAPS_BY_PROJECT, 'projectId', { unique: false });
  }
}
```

### Query Patterns

| Operation | Store | Method | Notes |
|-----------|-------|--------|-------|
| List all projects | projects | `getAll()` | Sorted client-side by updatedAt |
| Get project by ID | projects | `get(id)` | Single lookup |
| Create project | projects | `put(project)` | Insert or update |
| Update project | projects | `put(project)` | Same as create |
| Delete project | projects | `delete(id)` | Also cascade delete bitmaps |
| Get bitmaps for project | bitmaps | `index('projectId').getAll(projectId)` | Uses index |
| Get bitmap by ID | bitmaps | `get(id)` | Single lookup |
| Add bitmap | bitmaps | `put(bitmap)` | Insert |
| Delete bitmap | bitmaps | `delete(id)` | Single delete |
| Delete all project bitmaps | bitmaps | `index('projectId').openCursor()` | Iterate and delete |

## Relationships

### Project -> Bitmap (1:N)

- Each project can have 0 to many bitmaps
- Each bitmap belongs to exactly one project
- Deleting a project cascades to delete all its bitmaps
- Bitmaps are queried by projectId index

### Not Persisted

The following are explicitly NOT stored in IndexedDB per spec (FR-014):

| Data | Reason |
|------|--------|
| Selection state (`selectedIds`) | Transient UI state |
| Hover state (`hoveredId`) | Transient UI state |
| Undo/redo history | Session-only, would be stale on reload |
| Drag/resize state | Transient interaction state |
| Marquee state | Transient interaction state |

## Data Lifecycle

### Create Project

```text
1. User imports file or clicks "Create New"
2. Parse uidesc content (existing flow)
3. Show ProjectNameDialog
4. User enters name, clicks Create
5. Generate UUID for project
6. Create Project record with:
   - id: new UUID
   - name: user input
   - createdAt: now
   - updatedAt: now
   - uidescContent: parsed content serialized
   - uidescFormat: detected format
   - editorState: default state
   - settings: DEFAULT_PROJECT_SETTINGS
   - thumbnailDataUrl: null (generated later)
7. Insert into IndexedDB
8. Set as current project in projectStore
```

### Load Project

```text
1. User clicks project in ProjectList
2. Fetch Project record from IndexedDB
3. Parse uidescContent to restore document
4. Restore editor state to stores:
   - canvasStore: panOffset, zoomLevel
   - hierarchyStore: expandedHierarchyNodes
   - propertiesStore: expandedPropertyGroups
   - templateStore: selectedTemplateId
5. Apply project settings to stores
6. Fetch bitmaps for project (lazy or eager)
7. Set as current project in projectStore
```

### Auto-Save

```text
Document changes (2s debounce):
1. User edits view/property
2. documentStore marks dirty
3. projectStore.scheduleDocumentSave() called
4. Timer starts/resets to 2000ms
5. On timeout:
   - Serialize current documentStore.document
   - Update project.uidescContent
   - Update project.updatedAt
   - Put to IndexedDB
   - Update projectStore.lastSavedAt
   - Clear isDirty flag

Editor state changes (10s debounce):
1. User pans/zooms/expands
2. Respective store calls projectStore.scheduleStateSave()
3. Timer starts/resets to 10000ms
4. On timeout:
   - Serialize current editor state from all stores
   - Update project.editorState
   - Update project.updatedAt
   - Put to IndexedDB
```

### Delete Project

```text
1. User right-clicks project, selects Delete
2. Show confirmation dialog
3. User confirms
4. Get all bitmap IDs for project
5. Delete all bitmaps in transaction
6. Delete project record
7. If current project was deleted:
   - Clear projectStore
   - Show ProjectList or UploadZone
```

## Migration Strategy

### Version 1 (Initial)

No migration needed - this is the initial schema.

### Future Versions

Schema changes will be handled in `onupgradeneeded`:

```typescript
request.onupgradeneeded = (event) => {
  const db = (event.target as IDBOpenDBRequest).result;
  const oldVersion = event.oldVersion;

  if (oldVersion < 1) {
    // Create initial schema
    upgradeToV1(db);
  }

  if (oldVersion < 2) {
    // Future: add new stores or indexes
    // upgradeToV2(db, event.target.transaction);
  }
};
```

### localStorage Cleanup

Per spec clarification, existing localStorage preferences are discarded:

```typescript
// On first project creation or app startup
function cleanupLegacyStorage(): void {
  const legacyKeys = [
    'vstgui-edit:preferences',
    'vstgui-edit:alignment-toolbar',
    'vstgui-edit:save-format',
    'vstgui-edit:recent-colors',
  ];

  for (const key of legacyKeys) {
    localStorage.removeItem(key);
  }
}
```
