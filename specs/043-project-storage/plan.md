# Implementation Plan: Project Storage

**Branch**: `043-project-storage` | **Date**: 2026-01-17 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/043-project-storage/spec.md`

## Summary

Add persistent project storage using IndexedDB to allow users to save uidesc files, bitmaps, editor state, and settings. Projects persist across browser sessions with auto-save support, export to JSON/XML/ZIP, and full offline capability. Falls back gracefully to session-only mode when IndexedDB is unavailable.

## Technical Context

**Language/Version**: TypeScript 5.9.x with strict mode
**Primary Dependencies**: SolidJS 1.9.x, fflate (ZIP), native IndexedDB API
**Storage**: IndexedDB with two object stores: `projects`, `bitmaps`
**Testing**: Vitest 4.x with @solidjs/testing-library, fake-indexeddb for tests
**Testing Guide**: `specs/TESTING-GUIDE.md` - MUST be consulted for all test tasks
**Target Platform**: Modern browsers (Chrome 89+, Firefox 78+, Safari 15+, Edge 89+)
**Project Type**: SolidJS web application (frontend-only)
**Performance Goals**: Project load <500ms, auto-save <200ms, export <1s for typical projects
**Constraints**: IndexedDB quota varies by browser (typically 50-60% of disk), individual bitmaps <10MB
**Scale/Scope**: Support 50+ projects, 50 bitmaps per project, 10MB total per project typical

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Pre-Design Check (Phase 0)

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Test-First Development | PASS | All new code will have tests written first |
| II. Technology Stack | PASS | Using SolidJS, TypeScript, Vitest as required |
| III. Security & Compliance | PASS | No sensitive data logged, validates all input |
| IV. Code Quality | PASS | Will run biome, stylelint, tsc after each task |
| V. GUI Editor Domain | PASS | Undo/redo preserved, data integrity maintained |
| VI. Testing Standards | PASS | Unit + integration tests, 80% coverage target |
| XI. Dependency Management | NEEDS APPROVAL | fflate dependency required for ZIP export |
| XII. Framework Restrictions | PASS | SolidJS only, no React patterns |
| XV. Styling Architecture | PASS | CSS Modules for new components |
| XVIII. Zero Failing Tests | PASS | All tests must pass before completion |
| XIX. Domain Knowledge | PASS | UIDESC_GUIDE.md consulted |
| XX. Technical Overview | PASS | CLAUDE.md consulted, will update after |
| XXI. Static Imports Only | PASS | No dynamic imports |
| XXIII. Quality Gates | PASS | lint:css, check, typecheck must pass |

### Post-Design Check (Phase 1 Complete)

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Test-First Development | PASS | quickstart.md defines test-first workflow per task |
| II. Technology Stack | PASS | No stack changes; fflate + fake-indexeddb additions justified |
| III. Security & Compliance | PASS | Data model validates all user input; no PII exposed |
| IV. Code Quality | PASS | All new code follows existing patterns |
| V. GUI Editor Domain | PASS | Undo/redo NOT persisted per FR-014; data integrity via validation |
| VI. Testing Standards | PASS | Test patterns in quickstart.md follow TESTING-GUIDE.md |
| XI. Dependency Management | NEEDS APPROVAL | fflate (8KB) and fake-indexeddb (dev only) |
| XII. Framework Restrictions | PASS | All patterns use SolidJS (createStore, signals, onCleanup) |
| XV. Styling Architecture | PASS | CSS Modules for all new components |
| XVIII. Zero Failing Tests | PASS | Test-first ensures coverage |
| XIX. Domain Knowledge | PASS | data-model.md aligns with uidesc schema |
| XX. Technical Overview | PASS | Agent context updated |
| XXI. Static Imports Only | PASS | No dynamic imports in design |
| XXIII. Quality Gates | PASS | Must pass before completion |

**Dependency Approval Required**:
- **fflate**: Lightweight ZIP library (8KB minified) for ZIP export functionality (FR-023)
- **fake-indexeddb**: Test-only dependency for mocking IndexedDB in Vitest

## Project Structure

### Documentation (this feature)

```text
specs/043-project-storage/
├── plan.md              # This file
├── research.md          # Phase 0 output - IndexedDB patterns, ZIP library comparison
├── data-model.md        # Phase 1 output - Project/Bitmap entities
├── quickstart.md        # Phase 1 output - Implementation guide
├── contracts/           # Phase 1 output - TypeScript interfaces
└── tasks.md             # Phase 2 output - Implementation tasks
```

### Source Code (repository root)

```text
src/
├── services/
│   └── indexedDB/
│       ├── database.ts          # Database initialization, versioning
│       ├── projectService.ts    # CRUD operations for projects
│       ├── bitmapService.ts     # CRUD operations for bitmaps
│       ├── storageQuota.ts      # Quota estimation and warnings
│       └── __tests__/
│           ├── database.spec.ts
│           ├── projectService.spec.ts
│           ├── bitmapService.spec.ts
│           └── storageQuota.spec.ts
├── stores/
│   ├── projectStore.ts          # Current project state, auto-save
│   └── __tests__/
│       └── projectStore.spec.ts
├── domain/
│   └── project/
│       ├── types.ts             # Project, EditorState, ProjectSettings
│       ├── validation.ts        # Project name validation
│       ├── serialization.ts     # State serialization/deserialization
│       ├── thumbnail.ts         # Thumbnail generation
│       ├── export.ts            # JSON/XML/ZIP export
│       └── __tests__/
│           ├── validation.spec.ts
│           ├── serialization.spec.ts
│           ├── thumbnail.spec.ts
│           └── export.spec.ts
├── components/
│   ├── ProjectList/
│   │   ├── ProjectList.tsx      # Modal with project grid
│   │   ├── ProjectCard.tsx      # Individual project card
│   │   ├── ProjectList.module.css
│   │   └── __tests__/
│   │       ├── ProjectList.spec.tsx
│   │       └── ProjectCard.spec.tsx
│   ├── ProjectNameDialog/
│   │   ├── ProjectNameDialog.tsx
│   │   ├── ProjectNameDialog.module.css
│   │   └── __tests__/
│   │       └── ProjectNameDialog.spec.tsx
│   ├── SaveIndicator/
│   │   ├── SaveIndicator.tsx
│   │   ├── SaveIndicator.module.css
│   │   └── __tests__/
│   │       └── SaveIndicator.spec.tsx
│   ├── ExportMenu/
│   │   ├── ExportMenu.tsx
│   │   ├── ExportMenu.module.css
│   │   └── __tests__/
│   │       └── ExportMenu.spec.tsx
│   └── StorageWarning/
│       ├── StorageWarning.tsx
│       ├── StorageWarning.module.css
│       └── __tests__/
│           └── StorageWarning.spec.tsx
└── types/
    └── project.ts               # Re-exports from domain/project/types.ts
```

**Structure Decision**: Single frontend application structure. New services directory for IndexedDB layer, new domain/project for project-specific business logic. Components follow existing pattern with co-located tests.

## Complexity Tracking

| Aspect | Decision | Rationale |
|--------|----------|-----------|
| IndexedDB vs localStorage | IndexedDB | localStorage 5MB limit insufficient for bitmaps |
| Wrapper library (idb) vs native | Native API | Reduces dependencies, full control over versioning |
| fflate vs JSZip | fflate | 8KB vs 95KB, faster, better tree-shaking |
| Dual debounce timers | Yes | Spec requirement: 2s doc, 10s editor state |
| Session-only fallback | Yes | Graceful degradation when IndexedDB unavailable |

## Architecture Overview

### Data Flow

```text
┌─────────────────────────────────────────────────────────────────┐
│                         User Actions                             │
└─────────────────────────┬───────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                      projectStore                                │
│  - currentProject: Project | null                               │
│  - isDirty: boolean                                             │
│  - saveStatus: 'idle' | 'saving' | 'saved' | 'error'           │
│  - lastSavedAt: Date | null                                     │
│  - isSessionOnly: boolean (no IndexedDB)                        │
└─────────────────────────┬───────────────────────────────────────┘
                          │
          ┌───────────────┴───────────────┐
          │                               │
          ▼                               ▼
┌─────────────────────┐     ┌─────────────────────────────────────┐
│   Auto-Save Engine  │     │        Existing Stores              │
│                     │     │  - documentStore (uidesc content)   │
│  docTimer: 2000ms   │     │  - canvasStore (pan, zoom)          │
│  stateTimer: 10000ms│     │  - hierarchyStore (expanded)        │
└─────────────────────┘     │  - propertiesStore (expanded)       │
          │                 │  - templateStore (active template)  │
          │                 └─────────────────────────────────────┘
          ▼
┌─────────────────────────────────────────────────────────────────┐
│                    IndexedDB Services                            │
│                                                                  │
│  ┌─────────────────────┐    ┌──────────────────────┐           │
│  │   projectService    │    │    bitmapService     │           │
│  │                     │    │                      │           │
│  │  - create()         │    │  - add()             │           │
│  │  - read()           │    │  - get()             │           │
│  │  - update()         │    │  - delete()          │           │
│  │  - delete()         │    │  - getByProject()    │           │
│  │  - list()           │    │                      │           │
│  └─────────────────────┘    └──────────────────────┘           │
│                                                                  │
│  ┌──────────────────────────────────────────────────┐          │
│  │              IndexedDB Database                   │          │
│  │  vstgui-edit-projects (v1)                        │          │
│  │                                                   │          │
│  │  Object Stores:                                   │          │
│  │  - projects: { id, name, uidescContent, ... }    │          │
│  │  - bitmaps: { id, projectId, blob, ... }         │          │
│  └──────────────────────────────────────────────────┘          │
└─────────────────────────────────────────────────────────────────┘
```

### State Synchronization

1. **On Import/Create**:
   - Parse uidesc content (existing flow)
   - Prompt for project name
   - Create project in IndexedDB
   - Initialize projectStore with new project
   - Serialize initial editor state

2. **On Edit**:
   - Existing stores update (documentStore, etc.)
   - Mark projectStore dirty
   - Start/reset appropriate debounce timer
   - On debounce complete: serialize and save to IndexedDB

3. **On Load**:
   - Fetch project from IndexedDB
   - Restore documentStore with uidesc content
   - Restore editor state to respective stores
   - Clear dirty flag

4. **On Export**:
   - Serialize current state
   - Generate file in selected format (JSON/XML/ZIP)
   - Trigger browser download

### localStorage Migration Strategy

Per spec clarification: **Discard all existing localStorage preferences**. Users start fresh with factory defaults when opening a project.

- Remove `initializePreferences()` call from App.tsx
- Project settings become source of truth
- No migration code needed (simplifies implementation)

## Key Design Decisions

### 1. IndexedDB Schema (v1)

```typescript
// Database: vstgui-edit-projects
// Version: 1

// Object Store: projects
interface ProjectRecord {
  id: string;                    // UUID, keyPath
  name: string;                  // User-provided name
  createdAt: Date;               // ISO string in DB
  updatedAt: Date;               // ISO string in DB
  uidescContent: string;         // Raw uidesc JSON/XML string
  uidescFormat: 'json' | 'xml';  // Original format
  editorState: EditorStateRecord;
  settings: ProjectSettingsRecord;
  thumbnailDataUrl: string | null;
}

// Object Store: bitmaps
interface BitmapRecord {
  id: string;                    // UUID, keyPath
  projectId: string;             // Index for project lookup
  name: string;                  // Bitmap reference name
  blob: Blob;                    // Actual image data
  mimeType: string;              // e.g., 'image/png'
  width: number;
  height: number;
  size: number;                  // Bytes
  addedAt: Date;                 // ISO string in DB
}
```

### 2. Editor State Serialization

```typescript
interface EditorStateRecord {
  panOffset: { x: number; y: number };
  zoomLevel: number;
  expandedHierarchyNodes: string[];  // Array for JSON serialization
  expandedPropertyGroups: string[];
  selectedTemplateId: string | null;
}
```

### 3. Project Settings Structure

```typescript
interface ProjectSettingsRecord {
  grid: {
    size: number;
    style: 'lines' | 'dots' | 'crosshairs';
    visibleByDefault: boolean;
  };
  snap: {
    enabledByDefault: boolean;
    threshold: number;
  };
  smartGuides: {
    enabledByDefault: boolean;
  };
  customGuides: {
    snapEnabledByDefault: boolean;
    guides: Array<{ id: string; orientation: 'horizontal' | 'vertical'; position: number }>;
  };
  theme: {
    mode: 'light' | 'dark' | 'system';
  };
  autoSave: {
    enabled: boolean;
  };
}
```

### 4. Auto-Save Implementation

```typescript
// Two independent debounce timers
let docSaveTimer: number | null = null;
let stateSaveTimer: number | null = null;

const DOC_DEBOUNCE_MS = 2000;
const STATE_DEBOUNCE_MS = 10000;

function onDocumentChange(): void {
  if (docSaveTimer) clearTimeout(docSaveTimer);
  docSaveTimer = setTimeout(() => saveDocument(), DOC_DEBOUNCE_MS);
  markDirty();
}

function onEditorStateChange(): void {
  if (stateSaveTimer) clearTimeout(stateSaveTimer);
  stateSaveTimer = setTimeout(() => saveEditorState(), STATE_DEBOUNCE_MS);
}
```

### 5. Session-Only Fallback

```typescript
// On app initialization
async function initializeStorage(): Promise<void> {
  try {
    await openDatabase();
    setSessionOnly(false);
  } catch (error) {
    console.warn('IndexedDB unavailable, using session-only mode');
    setSessionOnly(true);
    showWarning('Storage unavailable - changes will not persist after closing');
  }
}
```

### 6. Export Flow

```typescript
async function exportProject(format: 'json' | 'xml' | 'zip'): Promise<void> {
  const project = getCurrentProject();

  if (format === 'json' || format === 'xml') {
    const content = serializeUidesc(project.document, format);
    downloadFile(`${project.name}.uidesc`, content);
  } else {
    // ZIP export
    const bitmaps = await bitmapService.getByProject(project.id);
    const zipData = await createZip(project, bitmaps);
    downloadFile(`${project.name}.zip`, zipData);
  }
}
```

## Integration Points

### Modified Files

| File | Changes |
|------|---------|
| `src/stores/documentStore.ts` | Add `onDocumentChange` callback hook |
| `src/stores/canvasStore.ts` | Add `onStateChange` callback hook |
| `src/stores/hierarchyStore.ts` | Add `onStateChange` callback hook |
| `src/stores/propertiesStore.ts` | Add `onStateChange` callback hook |
| `src/stores/templateStore.ts` | Add `onStateChange` callback hook |
| `src/stores/guidesStore.ts` | Add `onStateChange` callback hook |
| `src/components/UploadZone/UploadZone.tsx` | Add "Open Project" button, integrate with ProjectNameDialog |
| `src/components/Toolbar/Toolbar.tsx` | Add SaveIndicator, ExportMenu |
| `src/App.tsx` | Initialize project storage, show ProjectList on startup |
| `CLAUDE.md` | Document new stores, services, domain utilities |

### New Exports

```typescript
// src/stores/projectStore.ts
export {
  projectStore,
  openProject,
  saveProject,
  createProject,
  closeProject,
  renameProject,
  deleteProject,
  duplicateProject,
  exportProject,
  replaceUidesc,
  markProjectDirty,
  setAutoSave,
};

// src/services/indexedDB/
export { openDatabase, closeDatabase } from './database';
export { projectService } from './projectService';
export { bitmapService } from './bitmapService';
export { estimateStorageQuota, checkQuotaWarning } from './storageQuota';
```

## Testing Strategy

### Unit Tests
- IndexedDB services with fake-indexeddb
- Serialization/deserialization roundtrips
- Validation functions
- Export format generation

### Integration Tests
- Full project lifecycle (create, edit, save, load)
- Auto-save timing behavior
- Editor state restoration
- Bitmap storage and retrieval

### Component Tests
- ProjectList rendering and interaction
- ProjectNameDialog validation
- SaveIndicator state display
- ExportMenu format selection

### Edge Case Tests
- IndexedDB unavailable (session-only mode)
- Quota exceeded handling
- Corrupted project recovery
- Concurrent tab detection
- Large bitmap handling

## Implementation Phases

### Phase 1: Core Infrastructure
1. IndexedDB service layer (database, projectService, bitmapService)
2. Project types and validation
3. Basic projectStore (no auto-save)

### Phase 2: Project Lifecycle
4. Create project flow (from import)
5. Open project flow (project list)
6. Save/load project
7. Session-only fallback

### Phase 3: Auto-Save & State
8. Auto-save with dual timers
9. Editor state serialization
10. SaveIndicator component
11. Dirty state tracking

### Phase 4: Advanced Features
12. Export (JSON/XML)
13. ZIP export with bitmaps
14. Rename/delete project
15. Duplicate (Save As)

### Phase 5: Polish & Edge Cases
16. Thumbnail generation
17. Storage quota warnings
18. Corrupted project recovery
19. Replace uidesc flow
