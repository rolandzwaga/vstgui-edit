/**
 * IndexedDB Database Service
 *
 * Provides database initialization, versioning, and low-level helpers
 * for IndexedDB operations.
 */

import { DB_NAME, DB_VERSION, INDEXES, STORES } from '../../domain/project/types';

// ============================================================================
// Module State
// ============================================================================

let dbInstance: IDBDatabase | null = null;

// ============================================================================
// Database Initialization
// ============================================================================

/**
 * Opens the IndexedDB database, creating it if necessary.
 *
 * Database schema versions:
 * - v1: projects, bitmaps stores
 * - v2: (intermediate - may or may not have presets)
 * - v3: projects, bitmaps, presets stores (guaranteed)
 * - v4: added controlType index to presets store
 *
 * @returns Promise resolving to the database instance
 */
export function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    // Return existing instance if available
    if (dbInstance) {
      resolve(dbInstance);
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = event => {
      const db = (event.target as IDBOpenDBRequest).result;
      const transaction = (event.target as IDBOpenDBRequest).transaction!;
      const oldVersion = event.oldVersion;

      // Migration from v0 (fresh install) or v1
      if (oldVersion < 1) {
        // Create projects store
        db.createObjectStore(STORES.PROJECTS, { keyPath: 'id' });
        // Create bitmaps store with projectId index
        const bitmapStore = db.createObjectStore(STORES.BITMAPS, { keyPath: 'id' });
        bitmapStore.createIndex(INDEXES.BITMAPS_BY_PROJECT, 'projectId', { unique: false });
      }

      // Migration to v3: ensure presets store exists
      // This handles both:
      // - Users upgrading from v1 (never had presets)
      // - Users upgrading from v2 (may or may not have presets)
      if (oldVersion < 3) {
        if (!db.objectStoreNames.contains(STORES.PRESETS)) {
          const presetStore = db.createObjectStore(STORES.PRESETS, { keyPath: 'id' });
          presetStore.createIndex(INDEXES.PRESETS_BY_NAME, 'name', { unique: true });
          presetStore.createIndex(INDEXES.PRESETS_BY_BUILTIN, 'isBuiltIn', { unique: false });
        }
      }

      // Migration to v4: add controlType index to presets store
      // Handles users upgrading from v3 with existing presets
      if (oldVersion < 4) {
        const presetStore = transaction.objectStore(STORES.PRESETS);

        // Add the controlType index if it doesn't exist
        if (!presetStore.indexNames.contains(INDEXES.PRESETS_BY_CONTROL_TYPE)) {
          presetStore.createIndex(INDEXES.PRESETS_BY_CONTROL_TYPE, 'controlType', {
            unique: false,
          });
        }

        // Migrate existing presets to have controlType: 'knob'
        // This is done using a cursor to update each record
        const cursorRequest = presetStore.openCursor();
        cursorRequest.onsuccess = cursorEvent => {
          const cursor = (cursorEvent.target as IDBRequest<IDBCursorWithValue>).result;
          if (cursor) {
            const preset = cursor.value;
            // Add controlType if missing (existing presets are all knob presets)
            if (!preset.controlType) {
              preset.controlType = 'knob';
              cursor.update(preset);
            }
            cursor.continue();
          }
        };
      }
    };

    request.onsuccess = () => {
      dbInstance = request.result;
      resolve(dbInstance);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
}

/**
 * Closes the database connection.
 * Safe to call even if database is not open.
 */
export function closeDatabase(): void {
  if (dbInstance) {
    dbInstance.close();
    dbInstance = null;
  }
}

/**
 * Gets the current database instance (for testing).
 * @returns The database instance or null if not open
 */
export function getDatabaseInstance(): IDBDatabase | null {
  return dbInstance;
}

// ============================================================================
// Transaction Helpers
// ============================================================================

/**
 * Gets an object store from the database.
 *
 * @param storeName - Name of the object store
 * @param mode - Transaction mode (defaults to 'readonly')
 * @returns The object store
 * @throws Error if database is not initialized
 */
export function getStore(storeName: string, mode: IDBTransactionMode = 'readonly'): IDBObjectStore {
  if (!dbInstance) {
    throw new Error('Database not initialized');
  }
  return dbInstance.transaction(storeName, mode).objectStore(storeName);
}

/**
 * Wraps an IDBRequest in a Promise.
 *
 * @param request - The IndexedDB request to promisify
 * @returns Promise resolving to the request result
 */
export function promisifyRequest<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}
