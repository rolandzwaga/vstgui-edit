/**
 * Bitmap Service
 *
 * CRUD operations for bitmaps stored in IndexedDB.
 */

import type { Bitmap } from '../../domain/project/types';
import { STORES, INDEXES } from '../../domain/project/types';
import { getStore, promisifyRequest } from './database';

// ============================================================================
// Bitmap Service
// ============================================================================

export const bitmapService = {
  /**
   * Adds a bitmap to IndexedDB.
   *
   * @param bitmap - The bitmap to add
   */
  async add(bitmap: Bitmap): Promise<void> {
    const store = getStore(STORES.BITMAPS, 'readwrite');
    await promisifyRequest(store.put(bitmap));
  },

  /**
   * Gets a bitmap by ID.
   *
   * @param id - The bitmap ID
   * @returns The bitmap or undefined if not found
   */
  async get(id: string): Promise<Bitmap | undefined> {
    const store = getStore(STORES.BITMAPS, 'readonly');
    return promisifyRequest(store.get(id));
  },

  /**
   * Gets all bitmaps for a project using the projectId index.
   *
   * @param projectId - The project ID
   * @returns Array of bitmaps for the project
   */
  async getByProject(projectId: string): Promise<Bitmap[]> {
    const store = getStore(STORES.BITMAPS, 'readonly');
    const index = store.index(INDEXES.BITMAPS_BY_PROJECT);
    return promisifyRequest(index.getAll(projectId));
  },

  /**
   * Deletes a bitmap by ID.
   *
   * @param id - The bitmap ID to delete
   */
  async delete(id: string): Promise<void> {
    const store = getStore(STORES.BITMAPS, 'readwrite');
    await promisifyRequest(store.delete(id));
  },

  /**
   * Deletes all bitmaps for a project.
   * Uses a cursor to iterate and delete efficiently.
   *
   * @param projectId - The project ID
   */
  async deleteAllForProject(projectId: string): Promise<void> {
    const store = getStore(STORES.BITMAPS, 'readwrite');
    const index = store.index(INDEXES.BITMAPS_BY_PROJECT);
    const request = index.openCursor(IDBKeyRange.only(projectId));

    return new Promise((resolve, reject) => {
      request.onsuccess = () => {
        const cursor = request.result;
        if (cursor) {
          cursor.delete();
          cursor.continue();
        } else {
          resolve();
        }
      };
      request.onerror = () => reject(request.error);
    });
  },
};
