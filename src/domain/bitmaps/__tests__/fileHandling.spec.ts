import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  checkBitmapNameConflict,
  generateUniqueBitmapName,
  getBaseName,
  getFileExtension,
  getImageDimensions,
  getMimeTypeFromExtension,
  MAX_BITMAP_SIZE,
  readImageFile,
  SUPPORTED_EXTENSIONS,
  SUPPORTED_FORMATS,
  validateImageFile,
} from '../fileHandling';

// ============================================================================
// Test Utilities
// ============================================================================

function createMockFile(
  name: string,
  size: number,
  type: string,
  content?: ArrayBuffer
): File {
  const buffer = content || new ArrayBuffer(size);
  const file = new File([buffer], name, { type });

  // Add arrayBuffer method if not present (for test environments)
  if (!file.arrayBuffer) {
    (file as File & { arrayBuffer: () => Promise<ArrayBuffer> }).arrayBuffer = () =>
      Promise.resolve(buffer);
  }

  return file;
}

function createMockImageBlob(): Blob {
  // 1x1 transparent PNG
  const pngData = new Uint8Array([
    0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d,
    0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
    0x08, 0x06, 0x00, 0x00, 0x00, 0x1f, 0x15, 0xc4, 0x89, 0x00, 0x00, 0x00,
    0x0a, 0x49, 0x44, 0x41, 0x54, 0x78, 0x9c, 0x63, 0x00, 0x01, 0x00, 0x00,
    0x05, 0x00, 0x01, 0x0d, 0x0a, 0x2d, 0xb4, 0x00, 0x00, 0x00, 0x00, 0x49,
    0x45, 0x4e, 0x44, 0xae, 0x42, 0x60, 0x82,
  ]);
  const blob = new Blob([pngData], { type: 'image/png' });

  // Add arrayBuffer method if not present (for test environments)
  if (!blob.arrayBuffer) {
    (blob as Blob & { arrayBuffer: () => Promise<ArrayBuffer> }).arrayBuffer = () =>
      Promise.resolve(pngData.buffer as ArrayBuffer);
  }

  return blob;
}

// ============================================================================
// Constants Tests
// ============================================================================

describe('Constants', () => {
  it('MAX_BITMAP_SIZE is 10MB', () => {
    expect(MAX_BITMAP_SIZE).toBe(10 * 1024 * 1024);
  });

  it('SUPPORTED_FORMATS includes expected formats', () => {
    expect(SUPPORTED_FORMATS).toContain('image/png');
    expect(SUPPORTED_FORMATS).toContain('image/jpeg');
    expect(SUPPORTED_FORMATS).toContain('image/gif');
    expect(SUPPORTED_FORMATS).toContain('image/bmp');
  });

  it('SUPPORTED_EXTENSIONS includes expected extensions', () => {
    expect(SUPPORTED_EXTENSIONS).toContain('.png');
    expect(SUPPORTED_EXTENSIONS).toContain('.jpg');
    expect(SUPPORTED_EXTENSIONS).toContain('.jpeg');
    expect(SUPPORTED_EXTENSIONS).toContain('.gif');
    expect(SUPPORTED_EXTENSIONS).toContain('.bmp');
  });
});

// ============================================================================
// validateImageFile Tests
// ============================================================================

describe('validateImageFile', () => {
  it('returns invalid for null/undefined file', () => {
    const result = validateImageFile(null as unknown as File);
    expect(result.valid).toBe(false);
    expect(result.error).toBe('No file provided');
  });

  it('returns invalid for empty file', () => {
    const file = createMockFile('test.png', 0, 'image/png');
    const result = validateImageFile(file);
    expect(result.valid).toBe(false);
    expect(result.error).toBe('File is empty');
  });

  it('returns invalid for file exceeding size limit', () => {
    const file = createMockFile('large.png', MAX_BITMAP_SIZE + 1, 'image/png');
    const result = validateImageFile(file);
    expect(result.valid).toBe(false);
    expect(result.error).toContain('exceeds maximum allowed');
  });

  it('returns valid for file at exactly size limit', () => {
    const file = createMockFile('exact.png', MAX_BITMAP_SIZE, 'image/png');
    const result = validateImageFile(file);
    expect(result.valid).toBe(true);
  });

  it('returns valid for PNG file', () => {
    const file = createMockFile('test.png', 1000, 'image/png');
    const result = validateImageFile(file);
    expect(result.valid).toBe(true);
  });

  it('returns valid for JPEG file', () => {
    const file = createMockFile('test.jpg', 1000, 'image/jpeg');
    const result = validateImageFile(file);
    expect(result.valid).toBe(true);
  });

  it('returns valid for GIF file', () => {
    const file = createMockFile('test.gif', 1000, 'image/gif');
    const result = validateImageFile(file);
    expect(result.valid).toBe(true);
  });

  it('returns valid for BMP file', () => {
    const file = createMockFile('test.bmp', 1000, 'image/bmp');
    const result = validateImageFile(file);
    expect(result.valid).toBe(true);
  });

  it('returns invalid for unsupported format', () => {
    const file = createMockFile('test.webp', 1000, 'image/webp');
    const result = validateImageFile(file);
    expect(result.valid).toBe(false);
    expect(result.error).toContain('Unsupported file format');
  });

  it('uses extension as fallback when MIME type is missing', () => {
    const file = createMockFile('test.png', 1000, '');
    const result = validateImageFile(file);
    expect(result.valid).toBe(true);
  });

  it('uses extension as fallback for unrecognized MIME type', () => {
    const file = createMockFile('test.jpg', 1000, 'application/octet-stream');
    const result = validateImageFile(file);
    expect(result.valid).toBe(true);
  });
});

// ============================================================================
// readImageFile Tests
// ============================================================================

describe('readImageFile', () => {
  beforeEach(() => {
    // Mock Image for dimension extraction
    vi.stubGlobal('Image', class MockImage {
      naturalWidth = 100;
      naturalHeight = 100;
      onload: (() => void) | null = null;
      onerror: (() => void) | null = null;
      private _src = '';

      get src() {
        return this._src;
      }

      set src(value: string) {
        this._src = value;
        // Simulate async load
        setTimeout(() => {
          if (this.onload) {
            this.onload();
          }
        }, 0);
      }
    });

    vi.stubGlobal('URL', {
      createObjectURL: vi.fn().mockReturnValue('blob:mock-url'),
      revokeObjectURL: vi.fn(),
    });
  });

  it('reads file and returns ImageFileData', async () => {
    const blob = createMockImageBlob();
    const buffer = await blob.arrayBuffer();
    const file = createMockFile('test.png', buffer.byteLength, 'image/png', buffer);

    const result = await readImageFile(file);

    expect(result.filename).toBe('test.png');
    expect(result.mimeType).toBe('image/png');
    expect(result.width).toBe(100);
    expect(result.height).toBe(100);
    expect(result.blob).toBeInstanceOf(Blob);
  });

  it('determines MIME type from extension when type is empty', async () => {
    const blob = createMockImageBlob();
    const buffer = await blob.arrayBuffer();
    const file = createMockFile('test.jpg', buffer.byteLength, '', buffer);

    const result = await readImageFile(file);

    expect(result.mimeType).toBe('image/jpeg');
  });
});

// ============================================================================
// getImageDimensions Tests
// ============================================================================

describe('getImageDimensions', () => {
  beforeEach(() => {
    vi.stubGlobal('URL', {
      createObjectURL: vi.fn().mockReturnValue('blob:mock-url'),
      revokeObjectURL: vi.fn(),
    });
  });

  it('returns dimensions for valid image', async () => {
    vi.stubGlobal('Image', class MockImage {
      naturalWidth = 200;
      naturalHeight = 150;
      onload: (() => void) | null = null;

      set src(_: string) {
        setTimeout(() => this.onload?.(), 0);
      }
    });

    const blob = createMockImageBlob();
    const result = await getImageDimensions(blob);

    expect(result.width).toBe(200);
    expect(result.height).toBe(150);
  });

  it('rejects for invalid image', async () => {
    vi.stubGlobal('Image', class MockImage {
      onerror: (() => void) | null = null;

      set src(_: string) {
        setTimeout(() => this.onerror?.(), 0);
      }
    });

    const blob = new Blob(['invalid'], { type: 'image/png' });

    await expect(getImageDimensions(blob)).rejects.toThrow('Failed to load image');
  });

  it('revokes object URL after load', async () => {
    const revokeObjectURL = vi.fn();
    vi.stubGlobal('URL', {
      createObjectURL: vi.fn().mockReturnValue('blob:test-url'),
      revokeObjectURL,
    });

    vi.stubGlobal('Image', class MockImage {
      naturalWidth = 100;
      naturalHeight = 100;
      onload: (() => void) | null = null;

      set src(_: string) {
        setTimeout(() => this.onload?.(), 0);
      }
    });

    const blob = createMockImageBlob();
    await getImageDimensions(blob);

    expect(revokeObjectURL).toHaveBeenCalledWith('blob:test-url');
  });
});

// ============================================================================
// checkBitmapNameConflict Tests
// ============================================================================

describe('checkBitmapNameConflict', () => {
  it('returns no conflict when name does not exist', () => {
    const result = checkBitmapNameConflict('newbitmap.png', ['existing', 'other']);
    expect(result.hasConflict).toBe(false);
    expect(result.suggestedName).toBe('newbitmap');
  });

  it('returns conflict when name exists', () => {
    const result = checkBitmapNameConflict('existing.png', ['existing', 'other']);
    expect(result.hasConflict).toBe(true);
    expect(result.suggestedName).toBe('existing-2');
  });

  it('handles names without extension', () => {
    const result = checkBitmapNameConflict('mybitmap', ['mybitmap']);
    expect(result.hasConflict).toBe(true);
    expect(result.suggestedName).toBe('mybitmap-2');
  });

  it('suggests higher number when -2 exists', () => {
    const result = checkBitmapNameConflict('test.png', ['test', 'test-2']);
    expect(result.hasConflict).toBe(true);
    expect(result.suggestedName).toBe('test-3');
  });
});

// ============================================================================
// generateUniqueBitmapName Tests
// ============================================================================

describe('generateUniqueBitmapName', () => {
  it('returns original name when not in list', () => {
    const result = generateUniqueBitmapName('newname', ['existing']);
    expect(result).toBe('newname');
  });

  it('appends -2 when name exists', () => {
    const result = generateUniqueBitmapName('test', ['test']);
    expect(result).toBe('test-2');
  });

  it('increments counter until unique', () => {
    const result = generateUniqueBitmapName('test', ['test', 'test-2', 'test-3']);
    expect(result).toBe('test-4');
  });

  it('handles empty existing list', () => {
    const result = generateUniqueBitmapName('test', []);
    expect(result).toBe('test');
  });

  it('handles large counter values', () => {
    const existing = ['test', ...Array.from({ length: 99 }, (_, i) => `test-${i + 2}`)];
    const result = generateUniqueBitmapName('test', existing);
    expect(result).toBe('test-101');
  });
});

// ============================================================================
// getBaseName Tests
// ============================================================================

describe('getBaseName', () => {
  it('removes .png extension', () => {
    expect(getBaseName('image.png')).toBe('image');
  });

  it('removes .jpg extension', () => {
    expect(getBaseName('photo.jpg')).toBe('photo');
  });

  it('removes .jpeg extension', () => {
    expect(getBaseName('photo.jpeg')).toBe('photo');
  });

  it('handles multiple dots in filename', () => {
    expect(getBaseName('my.image.file.png')).toBe('my.image.file');
  });

  it('handles no extension', () => {
    expect(getBaseName('noextension')).toBe('noextension');
  });

  it('removes path prefix with forward slashes', () => {
    expect(getBaseName('path/to/image.png')).toBe('image');
  });

  it('removes path prefix with backslashes', () => {
    expect(getBaseName('path\\to\\image.png')).toBe('image');
  });

  it('handles hidden files (starting with dot)', () => {
    expect(getBaseName('.hidden.png')).toBe('.hidden');
  });

  it('preserves filename that is just an extension', () => {
    expect(getBaseName('.png')).toBe('.png');
  });
});

// ============================================================================
// getFileExtension Tests
// ============================================================================

describe('getFileExtension', () => {
  it('returns .png extension', () => {
    expect(getFileExtension('image.png')).toBe('.png');
  });

  it('returns .jpg extension', () => {
    expect(getFileExtension('photo.jpg')).toBe('.jpg');
  });

  it('returns last extension for multiple dots', () => {
    expect(getFileExtension('my.file.jpeg')).toBe('.jpeg');
  });

  it('returns empty string for no extension', () => {
    expect(getFileExtension('noextension')).toBe('');
  });

  it('returns empty for hidden file without extension', () => {
    expect(getFileExtension('.hidden')).toBe('');
  });

  it('preserves case', () => {
    expect(getFileExtension('IMAGE.PNG')).toBe('.PNG');
  });
});

// ============================================================================
// getMimeTypeFromExtension Tests
// ============================================================================

describe('getMimeTypeFromExtension', () => {
  it('returns image/png for .png', () => {
    expect(getMimeTypeFromExtension('file.png')).toBe('image/png');
  });

  it('returns image/jpeg for .jpg', () => {
    expect(getMimeTypeFromExtension('file.jpg')).toBe('image/jpeg');
  });

  it('returns image/jpeg for .jpeg', () => {
    expect(getMimeTypeFromExtension('file.jpeg')).toBe('image/jpeg');
  });

  it('returns image/gif for .gif', () => {
    expect(getMimeTypeFromExtension('file.gif')).toBe('image/gif');
  });

  it('returns image/bmp for .bmp', () => {
    expect(getMimeTypeFromExtension('file.bmp')).toBe('image/bmp');
  });

  it('returns image/png as default', () => {
    expect(getMimeTypeFromExtension('file.unknown')).toBe('image/png');
  });

  it('handles uppercase extensions', () => {
    expect(getMimeTypeFromExtension('FILE.JPG')).toBe('image/jpeg');
  });

  it('returns image/png for no extension', () => {
    expect(getMimeTypeFromExtension('noext')).toBe('image/png');
  });
});
