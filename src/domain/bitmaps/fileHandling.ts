/**
 * Bitmap file handling utilities
 *
 * Functions for validating, reading, and processing image files
 * for bitmap upload functionality.
 */

// ============================================================================
// Constants
// ============================================================================

/** Maximum file size in bytes (10MB) */
export const MAX_BITMAP_SIZE = 10 * 1024 * 1024;

/** Supported image MIME types */
export const SUPPORTED_FORMATS = ['image/png', 'image/jpeg', 'image/gif', 'image/bmp'] as const;

/** Supported file extensions */
export const SUPPORTED_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.gif', '.bmp'] as const;

// ============================================================================
// Types
// ============================================================================

export interface FileValidationResult {
  valid: boolean;
  error?: string;
}

export interface ImageFileData {
  blob: Blob;
  width: number;
  height: number;
  mimeType: string;
  filename: string;
}

export interface NameConflictResult {
  hasConflict: boolean;
  suggestedName: string;
}

// ============================================================================
// Validation
// ============================================================================

/**
 * Validates an image file for upload.
 *
 * Checks:
 * - File exists and has content
 * - File size is within limits
 * - File type is supported
 *
 * @param file - The file to validate
 * @returns Validation result with error message if invalid
 */
export function validateImageFile(file: File): FileValidationResult {
  if (!file) {
    return { valid: false, error: 'No file provided' };
  }

  if (file.size === 0) {
    return { valid: false, error: 'File is empty' };
  }

  if (file.size > MAX_BITMAP_SIZE) {
    const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
    return {
      valid: false,
      error: `File size (${sizeMB}MB) exceeds maximum allowed (10MB)`,
    };
  }

  // Check MIME type
  if (!SUPPORTED_FORMATS.includes(file.type as (typeof SUPPORTED_FORMATS)[number])) {
    // Also check extension as fallback (some systems don't set MIME type correctly)
    const ext = getFileExtension(file.name).toLowerCase();
    if (!SUPPORTED_EXTENSIONS.includes(ext as (typeof SUPPORTED_EXTENSIONS)[number])) {
      return {
        valid: false,
        error: `Unsupported file format. Supported: PNG, JPEG, GIF, BMP`,
      };
    }
  }

  return { valid: true };
}

// ============================================================================
// File Reading
// ============================================================================

/**
 * Reads an image file and extracts its data and dimensions.
 *
 * @param file - The image file to read
 * @returns Promise resolving to image data including dimensions
 * @throws Error if file cannot be read or is not a valid image
 */
export async function readImageFile(file: File): Promise<ImageFileData> {
  // Read file as blob
  const blob = new Blob([await file.arrayBuffer()], { type: file.type || 'image/png' });

  // Determine MIME type
  let mimeType = file.type;
  if (!mimeType || !SUPPORTED_FORMATS.includes(mimeType as (typeof SUPPORTED_FORMATS)[number])) {
    mimeType = getMimeTypeFromExtension(file.name);
  }

  // Get image dimensions
  const { width, height } = await getImageDimensions(blob);

  return {
    blob,
    width,
    height,
    mimeType,
    filename: file.name,
  };
}

/**
 * Gets image dimensions by loading it into an Image element.
 *
 * @param blob - The image blob
 * @returns Promise resolving to width and height
 */
export function getImageDimensions(blob: Blob): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(blob);

    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image. The file may be corrupted or not a valid image.'));
    };

    img.src = url;
  });
}

// ============================================================================
// Name Handling
// ============================================================================

/**
 * Checks if a bitmap name already exists and suggests an alternative.
 *
 * @param filename - The filename to check (with or without extension)
 * @param existingNames - Array of existing bitmap names
 * @returns Conflict result with suggested unique name
 */
export function checkBitmapNameConflict(
  filename: string,
  existingNames: string[]
): NameConflictResult {
  const baseName = getBaseName(filename);
  const hasConflict = existingNames.includes(baseName);

  return {
    hasConflict,
    suggestedName: hasConflict ? generateUniqueBitmapName(baseName, existingNames) : baseName,
  };
}

/**
 * Generates a unique bitmap name by appending a number suffix.
 *
 * @param baseName - The base name to make unique
 * @param existingNames - Array of existing bitmap names
 * @returns A unique name not in existingNames
 */
export function generateUniqueBitmapName(baseName: string, existingNames: string[]): string {
  if (!existingNames.includes(baseName)) {
    return baseName;
  }

  let counter = 2;
  let candidate = `${baseName}-${counter}`;

  while (existingNames.includes(candidate)) {
    counter++;
    candidate = `${baseName}-${counter}`;
  }

  return candidate;
}

/**
 * Extracts the base name from a filename (without extension).
 *
 * @param filename - The filename to process
 * @returns The base name without extension
 */
export function getBaseName(filename: string): string {
  // Remove path if present
  const nameOnly = filename.split(/[/\\]/).pop() || filename;

  // Remove extension
  const lastDot = nameOnly.lastIndexOf('.');
  if (lastDot > 0) {
    return nameOnly.substring(0, lastDot);
  }

  return nameOnly;
}

/**
 * Extracts the file extension from a filename.
 *
 * @param filename - The filename to process
 * @returns The extension including the dot (e.g., ".png")
 */
export function getFileExtension(filename: string): string {
  const lastDot = filename.lastIndexOf('.');
  if (lastDot > 0) {
    return filename.substring(lastDot);
  }
  return '';
}

/**
 * Gets MIME type from file extension.
 *
 * @param filename - The filename to check
 * @returns MIME type string, defaults to 'image/png'
 */
export function getMimeTypeFromExtension(filename: string): string {
  const ext = getFileExtension(filename).toLowerCase();

  switch (ext) {
    case '.jpg':
    case '.jpeg':
      return 'image/jpeg';
    case '.gif':
      return 'image/gif';
    case '.bmp':
      return 'image/bmp';
    default:
      return 'image/png';
  }
}
