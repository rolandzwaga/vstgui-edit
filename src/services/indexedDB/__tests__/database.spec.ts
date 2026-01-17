import { afterEach, beforeEach, describe, expect, test } from 'vitest';

import { DB_NAME, DB_VERSION, INDEXES, STORES } from '../../../domain/project/types';
import {
  closeDatabase,
  getDatabaseInstance,
  getStore,
  openDatabase,
  promisifyRequest,
} from '../database';

describe('database', () => {
  beforeEach(async () => {
    // Ensure database is closed before each test
    closeDatabase();

    // Delete any existing database
    await new Promise<void>((resolve, reject) => {
      const deleteRequest = indexedDB.deleteDatabase(DB_NAME);
      deleteRequest.onsuccess = () => resolve();
      deleteRequest.onerror = () => reject(deleteRequest.error);
    });
  });

  afterEach(() => {
    closeDatabase();
  });

  describe('openDatabase', () => {
    test('opens database with correct name and version', async () => {
      const db = await openDatabase();
      expect(db.name).toBe(DB_NAME);
      expect(db.version).toBe(DB_VERSION);
    });

    test('creates projects object store', async () => {
      const db = await openDatabase();
      expect(db.objectStoreNames.contains(STORES.PROJECTS)).toBe(true);
    });

    test('creates bitmaps object store', async () => {
      const db = await openDatabase();
      expect(db.objectStoreNames.contains(STORES.BITMAPS)).toBe(true);
    });

    test('creates projectId index on bitmaps store', async () => {
      const db = await openDatabase();
      const tx = db.transaction(STORES.BITMAPS, 'readonly');
      const store = tx.objectStore(STORES.BITMAPS);
      expect(store.indexNames.contains(INDEXES.BITMAPS_BY_PROJECT)).toBe(true);
    });

    test('returns same instance on subsequent calls', async () => {
      const db1 = await openDatabase();
      const db2 = await openDatabase();
      expect(db1).toBe(db2);
    });
  });

  describe('closeDatabase', () => {
    test('closes database connection', async () => {
      await openDatabase();
      closeDatabase();
      expect(getDatabaseInstance()).toBeNull();
    });

    test('does nothing if database not open', () => {
      expect(() => closeDatabase()).not.toThrow();
    });
  });

  describe('getStore', () => {
    test('returns projects store in readonly mode', async () => {
      await openDatabase();
      const store = getStore(STORES.PROJECTS, 'readonly');
      expect(store.name).toBe(STORES.PROJECTS);
    });

    test('returns bitmaps store in readwrite mode', async () => {
      await openDatabase();
      const store = getStore(STORES.BITMAPS, 'readwrite');
      expect(store.name).toBe(STORES.BITMAPS);
    });

    test('throws if database not initialized', () => {
      closeDatabase();
      expect(() => getStore(STORES.PROJECTS, 'readonly')).toThrow('Database not initialized');
    });

    test('defaults to readonly mode', async () => {
      await openDatabase();
      const store = getStore(STORES.PROJECTS);
      expect(store.transaction.mode).toBe('readonly');
    });
  });

  describe('promisifyRequest', () => {
    test('resolves with result on success', async () => {
      await openDatabase();
      const store = getStore(STORES.PROJECTS, 'readwrite');

      const testProject = {
        id: 'test-id',
        name: 'Test Project',
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
        settings: {
          grid: { size: 10 as const, style: 'lines' as const, visibleByDefault: false },
          snap: { enabledByDefault: false, threshold: 5 },
          smartGuides: { enabledByDefault: true },
          customGuides: { snapEnabledByDefault: true, guides: [] },
          theme: { mode: 'system' as const },
          autoSave: { enabled: true },
        },
        thumbnailDataUrl: null,
      };

      await promisifyRequest(store.put(testProject));

      const readStore = getStore(STORES.PROJECTS, 'readonly');
      const result = await promisifyRequest(readStore.get('test-id'));
      expect(result).toEqual(testProject);
    });

    test('resolves with undefined for non-existent key', async () => {
      await openDatabase();
      const store = getStore(STORES.PROJECTS, 'readonly');
      const result = await promisifyRequest(store.get('non-existent'));
      expect(result).toBeUndefined();
    });
  });

  describe('schema creation', () => {
    test('projects store uses id as keyPath', async () => {
      const db = await openDatabase();
      const tx = db.transaction(STORES.PROJECTS, 'readonly');
      const store = tx.objectStore(STORES.PROJECTS);
      expect(store.keyPath).toBe('id');
    });

    test('bitmaps store uses id as keyPath', async () => {
      const db = await openDatabase();
      const tx = db.transaction(STORES.BITMAPS, 'readonly');
      const store = tx.objectStore(STORES.BITMAPS);
      expect(store.keyPath).toBe('id');
    });

    test('bitmaps projectId index is not unique', async () => {
      const db = await openDatabase();
      const tx = db.transaction(STORES.BITMAPS, 'readonly');
      const store = tx.objectStore(STORES.BITMAPS);
      const index = store.index(INDEXES.BITMAPS_BY_PROJECT);
      expect(index.unique).toBe(false);
    });
  });
});
