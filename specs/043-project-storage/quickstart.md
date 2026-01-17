# Quickstart: Project Storage Implementation

**Feature**: 043-project-storage
**Date**: 2026-01-17

## Overview

This guide provides step-by-step implementation instructions for the project storage feature. Follow the phases in order, completing tests before implementation code.

---

## Prerequisites

Before starting, ensure:

1. Feature branch created: `git checkout -b 043-project-storage`
2. Dependencies approved and installed (see Dependency Setup below)
3. `specs/TESTING-GUIDE.md` loaded in context
4. `CLAUDE.md` consulted for existing patterns

---

## Dependency Setup

### Required New Dependencies

```bash
# Production dependency for ZIP export
npm install fflate

# Test dependency for IndexedDB mocking
npm install -D fake-indexeddb
```

### Vitest Configuration Update

Add fake-indexeddb to test setup in `vitest.config.ts`:

```typescript
export default defineConfig({
  test: {
    setupFiles: ['./src/__tests__/setup.ts'],
    // ... existing config
  },
});
```

Update `src/__tests__/setup.ts`:

```typescript
import 'fake-indexeddb/auto';
// ... existing setup
```

---

## Phase 1: Core Infrastructure

### Task 1.1: Project Types and Validation

**Test first**: `src/domain/project/__tests__/types.spec.ts`

```typescript
import { describe, it, expect } from 'vitest';
import {
  validateProjectName,
  sanitizeProjectName,
  PROJECT_NAME_REGEX,
  LIMITS,
} from '../validation';

describe('validateProjectName', () => {
  it('accepts valid alphanumeric name', () => {
    const result = validateProjectName('My Project 123');
    expect(result.valid).toBe(true);
  });

  it('accepts hyphens and underscores', () => {
    const result = validateProjectName('my-project_v2');
    expect(result.valid).toBe(true);
  });

  it('rejects empty name', () => {
    const result = validateProjectName('');
    expect(result.valid).toBe(false);
    expect(result.error).toContain('required');
  });

  it('rejects name over 100 characters', () => {
    const result = validateProjectName('a'.repeat(101));
    expect(result.valid).toBe(false);
    expect(result.error).toContain('100');
  });

  it('rejects special characters', () => {
    const result = validateProjectName('my@project!');
    expect(result.valid).toBe(false);
  });
});

describe('sanitizeProjectName', () => {
  it('removes invalid characters', () => {
    expect(sanitizeProjectName('my@project!')).toBe('myproject');
  });

  it('trims whitespace', () => {
    expect(sanitizeProjectName('  My Project  ')).toBe('My Project');
  });

  it('truncates to max length', () => {
    const result = sanitizeProjectName('a'.repeat(150));
    expect(result.length).toBe(100);
  });
});
```

**Implementation**: `src/domain/project/validation.ts`

### Task 1.2: IndexedDB Database Service

**Test first**: `src/services/indexedDB/__tests__/database.spec.ts`

```typescript
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { openDatabase, closeDatabase, getStore, promisifyRequest } from '../database';
import { DB_NAME, STORES, INDEXES } from '../../../domain/project/types';

describe('database', () => {
  afterEach(async () => {
    await closeDatabase();
    indexedDB.deleteDatabase(DB_NAME);
  });

  describe('openDatabase', () => {
    it('creates database with correct version', async () => {
      const db = await openDatabase();
      expect(db.name).toBe(DB_NAME);
      expect(db.version).toBe(1);
    });

    it('creates projects object store', async () => {
      const db = await openDatabase();
      expect(db.objectStoreNames.contains(STORES.PROJECTS)).toBe(true);
    });

    it('creates bitmaps object store with index', async () => {
      const db = await openDatabase();
      expect(db.objectStoreNames.contains(STORES.BITMAPS)).toBe(true);

      const tx = db.transaction(STORES.BITMAPS, 'readonly');
      const store = tx.objectStore(STORES.BITMAPS);
      expect(store.indexNames.contains(INDEXES.BITMAPS_BY_PROJECT)).toBe(true);
    });

    it('returns same instance on subsequent calls', async () => {
      const db1 = await openDatabase();
      const db2 = await openDatabase();
      expect(db1).toBe(db2);
    });
  });

  describe('getStore', () => {
    it('throws if database not initialized', () => {
      expect(() => getStore(STORES.PROJECTS)).toThrow('not initialized');
    });

    it('returns object store after initialization', async () => {
      await openDatabase();
      const store = getStore(STORES.PROJECTS, 'readonly');
      expect(store.name).toBe(STORES.PROJECTS);
    });
  });
});
```

**Implementation**: `src/services/indexedDB/database.ts`

### Task 1.3: Project Service

**Test first**: `src/services/indexedDB/__tests__/projectService.spec.ts`

```typescript
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { openDatabase, closeDatabase } from '../database';
import { projectService } from '../projectService';
import { DB_NAME } from '../../../domain/project/types';

describe('projectService', () => {
  beforeEach(async () => {
    await openDatabase();
  });

  afterEach(async () => {
    await closeDatabase();
    indexedDB.deleteDatabase(DB_NAME);
  });

  describe('create and get', () => {
    it('creates and retrieves a project', async () => {
      const project = createMockProject({ name: 'Test Project' });

      await projectService.create(project);
      const retrieved = await projectService.get(project.id);

      expect(retrieved).toEqual(project);
    });
  });

  describe('getAll', () => {
    it('returns projects sorted by updatedAt descending', async () => {
      const older = createMockProject({ updatedAt: '2026-01-01T00:00:00Z' });
      const newer = createMockProject({ updatedAt: '2026-01-02T00:00:00Z' });

      await projectService.create(older);
      await projectService.create(newer);

      const all = await projectService.getAll();

      expect(all[0].id).toBe(newer.id);
      expect(all[1].id).toBe(older.id);
    });

    it('returns empty array when no projects', async () => {
      const all = await projectService.getAll();
      expect(all).toEqual([]);
    });
  });

  describe('update', () => {
    it('updates existing project', async () => {
      const project = createMockProject({ name: 'Original' });
      await projectService.create(project);

      project.name = 'Updated';
      await projectService.update(project);

      const retrieved = await projectService.get(project.id);
      expect(retrieved?.name).toBe('Updated');
    });
  });

  describe('delete', () => {
    it('removes project', async () => {
      const project = createMockProject();
      await projectService.create(project);

      await projectService.delete(project.id);

      const retrieved = await projectService.get(project.id);
      expect(retrieved).toBeUndefined();
    });
  });
});

// Test helper
function createMockProject(overrides = {}) {
  return {
    id: crypto.randomUUID(),
    name: 'Mock Project',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    uidescContent: '{}',
    uidescFormat: 'json' as const,
    editorState: {
      panOffset: { x: 0, y: 0 },
      zoomLevel: 1,
      expandedHierarchyNodes: [],
      expandedPropertyGroups: [],
      selectedTemplateId: null,
    },
    settings: DEFAULT_PROJECT_SETTINGS,
    thumbnailDataUrl: null,
    ...overrides,
  };
}
```

**Implementation**: `src/services/indexedDB/projectService.ts`

### Task 1.4: Bitmap Service

**Test first**: `src/services/indexedDB/__tests__/bitmapService.spec.ts`

**Implementation**: `src/services/indexedDB/bitmapService.ts`

---

## Phase 2: Project Lifecycle

### Task 2.1: Project Store (Basic)

**Test first**: `src/stores/__tests__/projectStore.spec.ts`

```typescript
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  projectStore,
  createProject,
  openProject,
  closeProject,
  resetProjectStore,
} from '../projectStore';
import { openDatabase, closeDatabase } from '../../services/indexedDB/database';

describe('projectStore', () => {
  beforeEach(async () => {
    resetProjectStore();
    await openDatabase();
  });

  afterEach(async () => {
    await closeDatabase();
    indexedDB.deleteDatabase('vstgui-edit-projects');
  });

  describe('initial state', () => {
    it('has no current project', () => {
      expect(projectStore.currentProject).toBeNull();
    });

    it('is not dirty', () => {
      expect(projectStore.isDirty).toBe(false);
    });

    it('has idle save status', () => {
      expect(projectStore.saveStatus).toBe('idle');
    });
  });

  describe('createProject', () => {
    it('creates project and sets as current', async () => {
      await createProject('Test Project', '{"vstgui-ui-description":{}}', 'json');

      expect(projectStore.currentProject).not.toBeNull();
      expect(projectStore.currentProject?.name).toBe('Test Project');
    });

    it('generates UUID for new project', async () => {
      await createProject('Test', '{}', 'json');

      expect(projectStore.currentProject?.id).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/
      );
    });
  });

  describe('openProject', () => {
    it('loads project from IndexedDB', async () => {
      await createProject('Original', '{}', 'json');
      const id = projectStore.currentProject!.id;

      resetProjectStore();
      await openProject(id);

      expect(projectStore.currentProject?.id).toBe(id);
      expect(projectStore.currentProject?.name).toBe('Original');
    });
  });

  describe('closeProject', () => {
    it('clears current project', async () => {
      await createProject('Test', '{}', 'json');
      closeProject();

      expect(projectStore.currentProject).toBeNull();
    });
  });
});
```

**Implementation**: `src/stores/projectStore.ts`

### Task 2.2: Session-Only Fallback

**Test first**: Test IndexedDB unavailability handling

**Implementation**: Add `isSessionOnly` flag and conditional persistence

### Task 2.3: ProjectNameDialog Component

**Test first**: `src/components/ProjectNameDialog/__tests__/ProjectNameDialog.spec.tsx`

**Implementation**: `src/components/ProjectNameDialog/ProjectNameDialog.tsx`

### Task 2.4: ProjectList Component

**Test first**: `src/components/ProjectList/__tests__/ProjectList.spec.tsx`

**Implementation**: `src/components/ProjectList/ProjectList.tsx`

### Task 2.5: UploadZone Integration

**Modify**: `src/components/UploadZone/UploadZone.tsx`
- Add "Open Project" button
- Integrate with ProjectNameDialog for new project creation

---

## Phase 3: Auto-Save & State

### Task 3.1: Auto-Save Engine

**Test first**: Test dual debounce timers

```typescript
describe('auto-save', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('saves document after 2 second debounce', async () => {
    await createProject('Test', '{}', 'json');
    markProjectDirty('document');

    await vi.advanceTimersByTimeAsync(1999);
    expect(projectStore.saveStatus).not.toBe('saved');

    await vi.advanceTimersByTimeAsync(1);
    expect(projectStore.saveStatus).toBe('saved');
  });

  it('saves state after 10 second debounce', async () => {
    await createProject('Test', '{}', 'json');
    markProjectDirty('state');

    await vi.advanceTimersByTimeAsync(9999);
    // State save should not have triggered yet

    await vi.advanceTimersByTimeAsync(1);
    // Now it should have saved
  });

  it('resets timer on subsequent changes', async () => {
    await createProject('Test', '{}', 'json');

    markProjectDirty('document');
    await vi.advanceTimersByTimeAsync(1000);

    markProjectDirty('document');
    await vi.advanceTimersByTimeAsync(1000);

    // Should not have saved yet (1000 + 1000 = 2000, but timer reset)
    expect(projectStore.saveStatus).not.toBe('saved');

    await vi.advanceTimersByTimeAsync(1000);
    expect(projectStore.saveStatus).toBe('saved');
  });
});
```

**Implementation**: Add debounced save timers to projectStore

### Task 3.2: Editor State Serialization

**Test first**: `src/domain/project/__tests__/serialization.spec.ts`

**Implementation**: `src/domain/project/serialization.ts`

### Task 3.3: SaveIndicator Component

**Test first**: `src/components/SaveIndicator/__tests__/SaveIndicator.spec.tsx`

**Implementation**: `src/components/SaveIndicator/SaveIndicator.tsx`

### Task 3.4: Store Change Hooks

**Modify**: Existing stores to call projectStore on state changes
- documentStore: `markDirty()` calls `scheduleDocumentSave()`
- canvasStore: pan/zoom changes call `scheduleStateSave()`
- hierarchyStore: expand/collapse calls `scheduleStateSave()`
- propertiesStore: expand/collapse calls `scheduleStateSave()`
- templateStore: template change calls `scheduleStateSave()`
- guidesStore: guide changes call `scheduleStateSave()`

---

## Phase 4: Advanced Features

### Task 4.1: JSON/XML Export

**Test first**: `src/domain/project/__tests__/export.spec.ts`

**Implementation**: `src/domain/project/export.ts`

### Task 4.2: ZIP Export with Bitmaps

**Test first**: Test ZIP creation with fflate

**Implementation**: Add ZIP export to export.ts using fflate

### Task 4.3: Rename/Delete Project

**Test first**: Test projectService.update and delete

**Implementation**: Add UI for rename (inline edit) and delete (confirmation)

### Task 4.4: Duplicate (Save As)

**Test first**: Test project duplication

**Implementation**: Add "Save As" menu option

---

## Phase 5: Polish & Edge Cases

### Task 5.1: Thumbnail Generation

**Test first**: `src/domain/project/__tests__/thumbnail.spec.ts`

**Implementation**: `src/domain/project/thumbnail.ts`

### Task 5.2: Storage Quota Warnings

**Test first**: `src/services/indexedDB/__tests__/storageQuota.spec.ts`

**Implementation**: `src/services/indexedDB/storageQuota.ts`

### Task 5.3: StorageWarning Component

**Test first**: `src/components/StorageWarning/__tests__/StorageWarning.spec.tsx`

**Implementation**: `src/components/StorageWarning/StorageWarning.tsx`

### Task 5.4: Replace uidesc Flow

**Test first**: Test uidesc replacement with orphan warning

**Implementation**: Add "Replace uidesc" menu option

### Task 5.5: Corrupted Project Recovery

**Test first**: Test recovery dialog behavior

**Implementation**: Add validation on load and recovery options

---

## Integration Checklist

After completing all phases:

1. [ ] Run `npm test` - all tests pass
2. [ ] Run `npm run lint:css` - no errors
3. [ ] Run `npm run check` - no errors
4. [ ] Run `npm run typecheck` - no errors
5. [ ] Test manually:
   - [ ] Create project from import
   - [ ] Create new empty project
   - [ ] Open existing project
   - [ ] Auto-save works (check IndexedDB in DevTools)
   - [ ] Export JSON/XML/ZIP
   - [ ] Rename project
   - [ ] Delete project
   - [ ] Close browser, reopen, project persists
6. [ ] Update CLAUDE.md with new stores/services/components
7. [ ] Commit to feature branch

---

## Key Files Reference

| File | Purpose |
|------|---------|
| `src/domain/project/types.ts` | TypeScript interfaces |
| `src/domain/project/validation.ts` | Name validation |
| `src/domain/project/serialization.ts` | State serialization |
| `src/domain/project/export.ts` | Export functions |
| `src/domain/project/thumbnail.ts` | Thumbnail generation |
| `src/services/indexedDB/database.ts` | Database initialization |
| `src/services/indexedDB/projectService.ts` | Project CRUD |
| `src/services/indexedDB/bitmapService.ts` | Bitmap CRUD |
| `src/services/indexedDB/storageQuota.ts` | Quota management |
| `src/stores/projectStore.ts` | Reactive project state |
| `src/components/ProjectList/ProjectList.tsx` | Project grid modal |
| `src/components/ProjectNameDialog/ProjectNameDialog.tsx` | Name input dialog |
| `src/components/SaveIndicator/SaveIndicator.tsx` | Save status display |
| `src/components/ExportMenu/ExportMenu.tsx` | Export format dropdown |
| `src/components/StorageWarning/StorageWarning.tsx` | Quota warning |
