import { describe, expect, test } from 'vitest';
import {
  isAbsolutePath,
  normalizeSeparators,
  getDirectoryFromPath,
  getFilenameFromPath,
  normalizeToRelativePath,
  ensureRelativePath,
} from '../pathUtils';

describe('pathUtils', () => {
  describe('isAbsolutePath', () => {
    test('returns false for empty string', () => {
      expect(isAbsolutePath('')).toBe(false);
    });

    test('detects Windows drive letter paths', () => {
      expect(isAbsolutePath('C:\\Users\\project\\file.png')).toBe(true);
      expect(isAbsolutePath('D:/project/file.png')).toBe(true);
      expect(isAbsolutePath('c:\\lowercase.png')).toBe(true);
    });

    test('detects Unix absolute paths', () => {
      expect(isAbsolutePath('/Users/dev/project/file.png')).toBe(true);
      expect(isAbsolutePath('/home/user/file.png')).toBe(true);
      expect(isAbsolutePath('/file.png')).toBe(true);
    });

    test('returns false for relative paths', () => {
      expect(isAbsolutePath('resources/file.png')).toBe(false);
      expect(isAbsolutePath('file.png')).toBe(false);
      expect(isAbsolutePath('./file.png')).toBe(false);
      expect(isAbsolutePath('../file.png')).toBe(false);
    });
  });

  describe('normalizeSeparators', () => {
    test('returns empty/falsy values unchanged', () => {
      expect(normalizeSeparators('')).toBe('');
    });

    test('converts backslashes to forward slashes', () => {
      expect(normalizeSeparators('path\\to\\file.png')).toBe('path/to/file.png');
      expect(normalizeSeparators('C:\\Users\\file.png')).toBe('C:/Users/file.png');
    });

    test('leaves forward slashes unchanged', () => {
      expect(normalizeSeparators('path/to/file.png')).toBe('path/to/file.png');
    });

    test('handles mixed separators', () => {
      expect(normalizeSeparators('path\\to/mixed\\file.png')).toBe('path/to/mixed/file.png');
    });
  });

  describe('getDirectoryFromPath', () => {
    test('returns empty string for empty path', () => {
      expect(getDirectoryFromPath('')).toBe('');
    });

    test('returns empty string for filename only', () => {
      expect(getDirectoryFromPath('file.png')).toBe('');
    });

    test('extracts directory from path with forward slashes', () => {
      expect(getDirectoryFromPath('resources/images/knob.png')).toBe('resources/images');
    });

    test('extracts directory from path with backslashes', () => {
      expect(getDirectoryFromPath('resources\\images\\knob.png')).toBe('resources/images');
    });

    test('handles single directory level', () => {
      expect(getDirectoryFromPath('resources/file.png')).toBe('resources');
    });
  });

  describe('getFilenameFromPath', () => {
    test('returns empty string for empty path', () => {
      expect(getFilenameFromPath('')).toBe('');
    });

    test('returns filename when no directory', () => {
      expect(getFilenameFromPath('file.png')).toBe('file.png');
    });

    test('extracts filename from path with forward slashes', () => {
      expect(getFilenameFromPath('resources/images/knob.png')).toBe('knob.png');
    });

    test('extracts filename from path with backslashes', () => {
      expect(getFilenameFromPath('C:\\project\\knob.png')).toBe('knob.png');
    });

    test('handles deep directory structure', () => {
      expect(getFilenameFromPath('a/b/c/d/e/file.png')).toBe('file.png');
    });
  });

  describe('normalizeToRelativePath', () => {
    test('returns empty/falsy values unchanged', () => {
      expect(normalizeToRelativePath('')).toBe('');
    });

    test('preserves path from resources folder', () => {
      expect(normalizeToRelativePath('C:\\project\\resources\\knob.png')).toBe('resources/knob.png');
      expect(normalizeToRelativePath('/Users/dev/resources/sub/file.png')).toBe(
        'resources/sub/file.png'
      );
    });

    test('preserves path from images folder', () => {
      expect(normalizeToRelativePath('/home/user/project/images/buttons/play.png')).toBe(
        'images/buttons/play.png'
      );
    });

    test('preserves path from bitmaps folder', () => {
      expect(normalizeToRelativePath('D:\\dev\\bitmaps\\control.png')).toBe('bitmaps/control.png');
    });

    test('preserves path from assets folder', () => {
      expect(normalizeToRelativePath('/app/assets/icons/icon.png')).toBe('assets/icons/icon.png');
    });

    test('returns filename only when no resource folder found', () => {
      expect(normalizeToRelativePath('D:\\random\\path\\file.png')).toBe('file.png');
      expect(normalizeToRelativePath('/tmp/unknown/structure/image.png')).toBe('image.png');
    });

    test('handles case-insensitive folder matching', () => {
      expect(normalizeToRelativePath('C:\\Project\\RESOURCES\\file.png')).toBe('RESOURCES/file.png');
      expect(normalizeToRelativePath('/path/Images/Sub/file.png')).toBe('Images/Sub/file.png');
    });
  });

  describe('ensureRelativePath', () => {
    test('returns empty/falsy values unchanged', () => {
      expect(ensureRelativePath('')).toBe('');
    });

    test('normalizes separators for relative paths', () => {
      expect(ensureRelativePath('path\\to\\file.png')).toBe('path/to/file.png');
    });

    test('converts absolute paths to relative', () => {
      expect(ensureRelativePath('C:\\project\\resources\\file.png')).toBe('resources/file.png');
      expect(ensureRelativePath('/Users/dev/images/file.png')).toBe('images/file.png');
    });

    test('returns relative paths with normalized separators', () => {
      expect(ensureRelativePath('resources/sub/file.png')).toBe('resources/sub/file.png');
    });
  });
});
