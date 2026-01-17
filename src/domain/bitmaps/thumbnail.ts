import { bitmapService } from '../../services/indexedDB/bitmapService';
import type { BitmapDefinition } from '../../types/uidesc';
import type { Bitmap } from '../project/types';

// ============================================================================
// Object URL Management
// ============================================================================

/**
 * Cache of object URLs created for IndexedDB blobs.
 * Maps projectId:bitmapName to the created object URL.
 */
const objectUrlCache = new Map<string, string>();

/**
 * Creates a cache key for a bitmap.
 */
function getCacheKey(projectId: string, bitmapName: string): string {
  return `${projectId}:${bitmapName}`;
}

/**
 * Revokes an object URL and removes it from the cache.
 *
 * @param url - The object URL to revoke
 */
export function revokeThumbnailUrl(url: string): void {
  if (url.startsWith('blob:')) {
    URL.revokeObjectURL(url);
    // Remove from cache
    for (const [key, cachedUrl] of objectUrlCache.entries()) {
      if (cachedUrl === url) {
        objectUrlCache.delete(key);
        break;
      }
    }
  }
}

/**
 * Revokes all cached object URLs for a project.
 * Call this when a project is closed.
 *
 * @param projectId - The project ID
 */
export function revokeProjectThumbnailUrls(projectId: string): void {
  for (const [key, url] of objectUrlCache.entries()) {
    if (key.startsWith(`${projectId}:`)) {
      URL.revokeObjectURL(url);
      objectUrlCache.delete(key);
    }
  }
}

/**
 * Clears all cached object URLs.
 * Call this when the application is closed or for testing.
 */
export function clearThumbnailUrlCache(): void {
  for (const url of objectUrlCache.values()) {
    URL.revokeObjectURL(url);
  }
  objectUrlCache.clear();
}

// ============================================================================
// Synchronous Functions (existing)
// ============================================================================

export function normalizeBitmap(bitmap: string | BitmapDefinition): BitmapDefinition {
  return typeof bitmap === 'string' ? { path: bitmap } : bitmap;
}

export function getBitmapPath(bitmap: string | BitmapDefinition): string {
  return typeof bitmap === 'string' ? bitmap : bitmap.path;
}

export function isEmbeddedBitmap(bitmap: string | BitmapDefinition): boolean {
  if (typeof bitmap === 'string') return false;
  return bitmap.data?.encoding === 'base64';
}

function getMimeType(path: string): string {
  const ext = path.split('.').pop()?.toLowerCase() || 'png';
  switch (ext) {
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg';
    case 'bmp':
      return 'image/bmp';
    case 'gif':
      return 'image/gif';
    default:
      return 'image/png';
  }
}

export function getThumbnailUrl(bitmap: string | BitmapDefinition): string | null {
  const normalized = normalizeBitmap(bitmap);

  if (normalized.data?.encoding === 'base64') {
    const mime = getMimeType(normalized.path);
    return `data:${mime};base64,${normalized.data.data}`;
  }

  if (!normalized.path) {
    return null;
  }

  return normalized.path;
}

// ============================================================================
// Async Functions (IndexedDB lookup)
// ============================================================================

/**
 * Finds a stored bitmap by name within a project.
 *
 * @param projectId - The project ID
 * @param bitmapName - The bitmap name to find
 * @returns The bitmap record or undefined if not found
 */
async function findStoredBitmap(
  projectId: string,
  bitmapName: string
): Promise<Bitmap | undefined> {
  const bitmaps = await bitmapService.getByProject(projectId);
  return bitmaps.find(b => b.name === bitmapName);
}

/**
 * Gets a thumbnail URL, checking IndexedDB for stored blobs.
 *
 * Resolution order:
 * 1. If bitmap has embedded base64 data, returns data URL
 * 2. If projectId provided and bitmap found in IndexedDB, returns object URL from blob
 * 3. Falls back to path string (for external file references)
 *
 * @param bitmapName - The name of the bitmap (used for IndexedDB lookup)
 * @param bitmap - The bitmap definition from uidesc
 * @param projectId - The project ID for IndexedDB lookup (null for no lookup)
 * @returns Promise resolving to thumbnail URL or null
 */
export async function getThumbnailUrlAsync(
  bitmapName: string,
  bitmap: string | BitmapDefinition,
  projectId: string | null
): Promise<string | null> {
  const normalized = normalizeBitmap(bitmap);

  // 1. Check for embedded base64 data
  if (normalized.data?.encoding === 'base64') {
    const mime = getMimeType(normalized.path);
    return `data:${mime};base64,${normalized.data.data}`;
  }

  // 2. Check IndexedDB for stored blob
  if (projectId) {
    const cacheKey = getCacheKey(projectId, bitmapName);

    // Return cached URL if available
    const cachedUrl = objectUrlCache.get(cacheKey);
    if (cachedUrl) {
      return cachedUrl;
    }

    // Look up in IndexedDB
    const storedBitmap = await findStoredBitmap(projectId, bitmapName);
    if (storedBitmap) {
      const url = URL.createObjectURL(storedBitmap.blob);
      objectUrlCache.set(cacheKey, url);
      return url;
    }
  }

  // 3. Fall back to path string
  if (!normalized.path) {
    return null;
  }

  return normalized.path;
}

/**
 * Invalidates the cached thumbnail URL for a specific bitmap.
 * Call this when a bitmap is updated or deleted.
 *
 * @param projectId - The project ID
 * @param bitmapName - The bitmap name
 */
export function invalidateThumbnailCache(projectId: string, bitmapName: string): void {
  const cacheKey = getCacheKey(projectId, bitmapName);
  const cachedUrl = objectUrlCache.get(cacheKey);
  if (cachedUrl) {
    URL.revokeObjectURL(cachedUrl);
    objectUrlCache.delete(cacheKey);
  }
}
