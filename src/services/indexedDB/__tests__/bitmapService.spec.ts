import { afterEach, beforeEach, describe, expect, test } from 'vitest';

import { DB_NAME } from '../../../domain/project/types';
import type { Bitmap } from '../../../domain/project/types';
import { openDatabase, closeDatabase } from '../database';
import { bitmapService } from '../bitmapService';

function createTestBitmap(overrides: Partial<Bitmap> = {}): Bitmap {
  return {
    id: crypto.randomUUID(),
    projectId: 'project-1',
    name: 'test-bitmap.png',
    blob: new Blob(['test data'], { type: 'image/png' }),
    mimeType: 'image/png',
    width: 100,
    height: 100,
    size: 9,
    addedAt: new Date().toISOString(),
    ...overrides,
  };
}

describe('bitmapService', () => {
  beforeEach(async () => {
    closeDatabase();
    await new Promise<void>((resolve, reject) => {
      const deleteRequest = indexedDB.deleteDatabase(DB_NAME);
      deleteRequest.onsuccess = () => resolve();
      deleteRequest.onerror = () => reject(deleteRequest.error);
    });
    await openDatabase();
  });

  afterEach(() => {
    closeDatabase();
  });

  describe('add', () => {
    test('adds a new bitmap', async () => {
      const bitmap = createTestBitmap();
      await bitmapService.add(bitmap);

      const retrieved = await bitmapService.get(bitmap.id);
      expect(retrieved?.id).toBe(bitmap.id);
      expect(retrieved?.name).toBe(bitmap.name);
      expect(retrieved?.projectId).toBe(bitmap.projectId);
    });

    test('stores bitmap with all metadata', async () => {
      const bitmap = createTestBitmap({
        name: 'detailed-bitmap.png',
        mimeType: 'image/jpeg',
        width: 200,
        height: 300,
        size: 12345,
      });

      await bitmapService.add(bitmap);
      const retrieved = await bitmapService.get(bitmap.id);

      expect(retrieved?.mimeType).toBe('image/jpeg');
      expect(retrieved?.width).toBe(200);
      expect(retrieved?.height).toBe(300);
      expect(retrieved?.size).toBe(12345);
    });

    test('stores blob reference', async () => {
      const blobContent = 'PNG binary data here';
      const bitmap = createTestBitmap({
        blob: new Blob([blobContent], { type: 'image/png' }),
        size: blobContent.length,
      });

      await bitmapService.add(bitmap);
      const retrieved = await bitmapService.get(bitmap.id);

      // Verify bitmap is stored (fake-indexeddb may serialize blob differently)
      expect(retrieved).toBeDefined();
      expect(retrieved?.size).toBe(blobContent.length);
      // The blob field should be present
      expect(retrieved).toHaveProperty('blob');
    });
  });

  describe('get', () => {
    test('returns bitmap by id', async () => {
      const bitmap = createTestBitmap();
      await bitmapService.add(bitmap);

      const retrieved = await bitmapService.get(bitmap.id);
      expect(retrieved?.id).toBe(bitmap.id);
    });

    test('returns undefined for non-existent id', async () => {
      const retrieved = await bitmapService.get('non-existent-id');
      expect(retrieved).toBeUndefined();
    });
  });

  describe('getByProject', () => {
    test('returns empty array when no bitmaps for project', async () => {
      const bitmaps = await bitmapService.getByProject('empty-project');
      expect(bitmaps).toEqual([]);
    });

    test('returns all bitmaps for a project', async () => {
      const bitmap1 = createTestBitmap({ projectId: 'project-1', name: 'bitmap1.png' });
      const bitmap2 = createTestBitmap({ projectId: 'project-1', name: 'bitmap2.png' });
      const bitmap3 = createTestBitmap({ projectId: 'project-1', name: 'bitmap3.png' });

      await bitmapService.add(bitmap1);
      await bitmapService.add(bitmap2);
      await bitmapService.add(bitmap3);

      const bitmaps = await bitmapService.getByProject('project-1');
      expect(bitmaps).toHaveLength(3);
    });

    test('only returns bitmaps for specified project (uses index)', async () => {
      const bitmap1 = createTestBitmap({ projectId: 'project-1', name: 'bitmap1.png' });
      const bitmap2 = createTestBitmap({ projectId: 'project-2', name: 'bitmap2.png' });
      const bitmap3 = createTestBitmap({ projectId: 'project-1', name: 'bitmap3.png' });

      await bitmapService.add(bitmap1);
      await bitmapService.add(bitmap2);
      await bitmapService.add(bitmap3);

      const project1Bitmaps = await bitmapService.getByProject('project-1');
      expect(project1Bitmaps).toHaveLength(2);
      expect(project1Bitmaps.every((b) => b.projectId === 'project-1')).toBe(true);

      const project2Bitmaps = await bitmapService.getByProject('project-2');
      expect(project2Bitmaps).toHaveLength(1);
      expect(project2Bitmaps[0].name).toBe('bitmap2.png');
    });
  });

  describe('delete', () => {
    test('deletes bitmap by id', async () => {
      const bitmap = createTestBitmap();
      await bitmapService.add(bitmap);

      await bitmapService.delete(bitmap.id);

      const retrieved = await bitmapService.get(bitmap.id);
      expect(retrieved).toBeUndefined();
    });

    test('does not throw when deleting non-existent bitmap', async () => {
      await expect(bitmapService.delete('non-existent-id')).resolves.not.toThrow();
    });
  });

  describe('deleteAllForProject', () => {
    test('deletes all bitmaps for a project', async () => {
      const bitmap1 = createTestBitmap({ projectId: 'project-1', name: 'bitmap1.png' });
      const bitmap2 = createTestBitmap({ projectId: 'project-1', name: 'bitmap2.png' });

      await bitmapService.add(bitmap1);
      await bitmapService.add(bitmap2);

      await bitmapService.deleteAllForProject('project-1');

      const bitmaps = await bitmapService.getByProject('project-1');
      expect(bitmaps).toHaveLength(0);
    });

    test('only deletes bitmaps for specified project', async () => {
      const bitmap1 = createTestBitmap({ projectId: 'project-1' });
      const bitmap2 = createTestBitmap({ projectId: 'project-2' });

      await bitmapService.add(bitmap1);
      await bitmapService.add(bitmap2);

      await bitmapService.deleteAllForProject('project-1');

      const project1Bitmaps = await bitmapService.getByProject('project-1');
      expect(project1Bitmaps).toHaveLength(0);

      const project2Bitmaps = await bitmapService.getByProject('project-2');
      expect(project2Bitmaps).toHaveLength(1);
    });

    test('does not throw when project has no bitmaps', async () => {
      await expect(bitmapService.deleteAllForProject('empty-project')).resolves.not.toThrow();
    });
  });
});
