import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createMockUidescFile } from '../../__tests__/helpers/fixtures';
import { documentStore, loadFile, reset, setDragging } from '../documentStore';

describe('documentStore', () => {
  beforeEach(() => {
    reset();
  });

  describe('initial state', () => {
    it('should have idle upload state with null content', () => {
      expect(documentStore.uploadState).toBe('idle');
      expect(documentStore.content).toBeNull();
      expect(documentStore.metadata).toBeNull();
      expect(documentStore.error).toBeNull();
    });
  });

  describe('loadFile', () => {
    it('should read file and store raw string content', async () => {
      const content = '<?xml version="1.0"?><root/>';
      const file = createMockUidescFile(content);

      await loadFile(file);

      expect(documentStore.content).toBe(content);
    });

    it('should set metadata with filename, fileSize, and loadedAt', async () => {
      const content = 'test content';
      const file = createMockUidescFile(content, 'myfile.uidesc');

      await loadFile(file);

      expect(documentStore.metadata).not.toBeNull();
      expect(documentStore.metadata?.filename).toBe('myfile.uidesc');
      expect(documentStore.metadata?.fileSize).toBe(content.length);
      expect(documentStore.metadata?.loadedAt).toBeInstanceOf(Date);
    });

    it('should transition through loading → success states', async () => {
      const states: string[] = [];
      const content = 'test content';
      const file = createMockUidescFile(content);

      // We'll track state changes by checking before and after
      expect(documentStore.uploadState).toBe('idle');

      const loadPromise = loadFile(file);

      // During loading
      expect(documentStore.uploadState).toBe('loading');
      states.push(documentStore.uploadState);

      await loadPromise;

      // After loading
      expect(documentStore.uploadState).toBe('success');
      states.push(documentStore.uploadState);

      expect(states).toEqual(['loading', 'success']);
    });

    it('should set error state for empty file', async () => {
      const file = new File([''], 'empty.uidesc', { type: 'text/plain' });

      await loadFile(file);

      expect(documentStore.uploadState).toBe('error');
      expect(documentStore.error).not.toBeNull();
      expect(documentStore.error?.type).toBe('empty-file');
    });

    it('should set error state for invalid extension', async () => {
      const file = new File(['content'], 'test.txt', { type: 'text/plain' });

      await loadFile(file);

      expect(documentStore.uploadState).toBe('error');
      expect(documentStore.error).not.toBeNull();
      expect(documentStore.error?.type).toBe('invalid-extension');
      if (documentStore.error?.type === 'invalid-extension') {
        expect(documentStore.error.filename).toBe('test.txt');
      }
    });

    it('should handle case-insensitive .uidesc extension', async () => {
      const content = 'test content';
      const file = createMockUidescFile(content, 'Test.UIDESC');

      await loadFile(file);

      expect(documentStore.uploadState).toBe('success');
      expect(documentStore.content).toBe(content);
    });
  });

  describe('reset', () => {
    it('should clear content and return to idle', async () => {
      const content = 'test content';
      const file = createMockUidescFile(content);
      await loadFile(file);

      expect(documentStore.content).not.toBeNull();

      reset();

      expect(documentStore.content).toBeNull();
      expect(documentStore.metadata).toBeNull();
      expect(documentStore.uploadState).toBe('idle');
      expect(documentStore.error).toBeNull();
    });
  });

  describe('setDragging', () => {
    it('should update uploadState to dragging when true', () => {
      setDragging(true);
      expect(documentStore.uploadState).toBe('dragging');
    });

    it('should update uploadState to idle when false', () => {
      setDragging(true);
      expect(documentStore.uploadState).toBe('dragging');

      setDragging(false);
      expect(documentStore.uploadState).toBe('idle');
    });

    it('should not change state from success when setDragging(false)', async () => {
      const content = 'test content';
      const file = createMockUidescFile(content);
      await loadFile(file);

      expect(documentStore.uploadState).toBe('success');

      setDragging(false);

      // Should remain in success state, not go back to idle
      expect(documentStore.uploadState).toBe('success');
    });
  });
});
