import type { BitmapDefinition } from '../../types/uidesc';

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
