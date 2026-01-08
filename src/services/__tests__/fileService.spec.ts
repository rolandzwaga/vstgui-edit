import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import {
  downloadDocument,
  hasFileSystemAccess,
  saveToFileHandle,
  showSaveFilePicker,
} from '../fileService';

describe('fileService', () => {
  describe('hasFileSystemAccess', () => {
    const originalShowSaveFilePicker = window.showSaveFilePicker;

    afterEach(() => {
      if (originalShowSaveFilePicker) {
        window.showSaveFilePicker = originalShowSaveFilePicker;
      } else {
        delete window.showSaveFilePicker;
      }
    });

    test('returns true when showSaveFilePicker is available', () => {
      window.showSaveFilePicker = vi.fn();
      expect(hasFileSystemAccess()).toBe(true);
    });

    test('returns false when showSaveFilePicker is not available', () => {
      delete window.showSaveFilePicker;
      expect(hasFileSystemAccess()).toBe(false);
    });
  });

  describe('saveToFileHandle', () => {
    test('writes content to file handle and returns success', async () => {
      const mockWritable = {
        write: vi.fn().mockResolvedValue(undefined),
        close: vi.fn().mockResolvedValue(undefined),
      };
      const mockHandle = {
        createWritable: vi.fn().mockResolvedValue(mockWritable),
      } as unknown as FileSystemFileHandle;

      const result = await saveToFileHandle(mockHandle, '{"test": true}');

      expect(mockHandle.createWritable).toHaveBeenCalled();
      expect(mockWritable.write).toHaveBeenCalledWith('{"test": true}');
      expect(mockWritable.close).toHaveBeenCalled();
      expect(result).toEqual({ success: true });
    });

    test('returns error when write fails', async () => {
      const mockWritable = {
        write: vi.fn().mockRejectedValue(new Error('Write failed')),
        close: vi.fn().mockResolvedValue(undefined),
      };
      const mockHandle = {
        createWritable: vi.fn().mockResolvedValue(mockWritable),
      } as unknown as FileSystemFileHandle;

      const result = await saveToFileHandle(mockHandle, 'content');

      expect(result.success).toBe(false);
      expect((result as { success: false; error: string }).error).toContain('Write failed');
    });

    test('returns error when createWritable fails', async () => {
      const mockHandle = {
        createWritable: vi.fn().mockRejectedValue(new Error('Permission denied')),
      } as unknown as FileSystemFileHandle;

      const result = await saveToFileHandle(mockHandle, 'content');

      expect(result.success).toBe(false);
      expect((result as { success: false; error: string }).error).toContain('Permission denied');
    });
  });

  describe('showSaveFilePicker', () => {
    const originalShowSaveFilePicker = window.showSaveFilePicker;

    afterEach(() => {
      if (originalShowSaveFilePicker) {
        window.showSaveFilePicker = originalShowSaveFilePicker;
      } else {
        delete window.showSaveFilePicker;
      }
    });

    test('returns file handle on success', async () => {
      const mockHandle = { name: 'test.uidesc' } as FileSystemFileHandle;
      window.showSaveFilePicker = vi.fn().mockResolvedValue(mockHandle);

      const result = await showSaveFilePicker('test.uidesc');

      expect(result).toBe(mockHandle);
      expect(window.showSaveFilePicker).toHaveBeenCalledWith({
        suggestedName: 'test.uidesc',
        types: [
          {
            description: 'VSTGUI UI Description',
            accept: { 'application/json': ['.uidesc'] },
          },
        ],
      });
    });

    test('returns null when user cancels', async () => {
      const abortError = new Error('User cancelled');
      abortError.name = 'AbortError';
      window.showSaveFilePicker = vi.fn().mockRejectedValue(abortError);

      const result = await showSaveFilePicker('test.uidesc');

      expect(result).toBeNull();
    });

    test('throws on other errors', async () => {
      window.showSaveFilePicker = vi.fn().mockRejectedValue(new Error('Unknown error'));

      await expect(showSaveFilePicker('test.uidesc')).rejects.toThrow('Unknown error');
    });
  });

  describe('downloadDocument', () => {
    let createObjectURLSpy: ReturnType<typeof vi.spyOn>;
    let revokeObjectURLSpy: ReturnType<typeof vi.spyOn>;
    let appendChildSpy: ReturnType<typeof vi.spyOn>;
    let removeChildSpy: ReturnType<typeof vi.spyOn>;
    let clickSpy: ReturnType<typeof vi.fn>;

    beforeEach(() => {
      createObjectURLSpy = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:test-url');
      revokeObjectURLSpy = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});
      appendChildSpy = vi.spyOn(document.body, 'appendChild').mockImplementation((node) => node);
      removeChildSpy = vi.spyOn(document.body, 'removeChild').mockImplementation((node) => node);
      clickSpy = vi.fn();

      vi.spyOn(document, 'createElement').mockImplementation((tagName: string) => {
        if (tagName === 'a') {
          return {
            href: '',
            download: '',
            click: clickSpy,
          } as unknown as HTMLAnchorElement;
        }
        return document.createElement(tagName);
      });
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    test('creates blob with correct content and type for JSON', () => {
      downloadDocument('{"test": true}', 'test.uidesc', 'json');

      expect(createObjectURLSpy).toHaveBeenCalledWith(expect.any(Blob));
      const blob = createObjectURLSpy.mock.calls[0][0] as Blob;
      expect(blob.type).toBe('application/json');
    });

    test('creates blob with correct content and type for XML', () => {
      downloadDocument('<xml/>', 'test.uidesc', 'xml');

      expect(createObjectURLSpy).toHaveBeenCalledWith(expect.any(Blob));
      const blob = createObjectURLSpy.mock.calls[0][0] as Blob;
      expect(blob.type).toBe('application/xml');
    });

    test('creates anchor with correct attributes and triggers click', () => {
      downloadDocument('content', 'myfile.uidesc', 'json');

      expect(appendChildSpy).toHaveBeenCalled();
      expect(clickSpy).toHaveBeenCalled();
      expect(removeChildSpy).toHaveBeenCalled();
      expect(revokeObjectURLSpy).toHaveBeenCalledWith('blob:test-url');
    });
  });
});
