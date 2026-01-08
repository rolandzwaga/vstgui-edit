import type { BitmapDefinition } from '../../types/uidesc';

export function truncateBitmapName(name: string, maxLength = 30): string {
  if (name.length <= maxLength) {
    return name;
  }
  return `${name.slice(0, maxLength - 1)}…`;
}

export function truncatePath(path: string, maxLength = 40): string {
  if (path.length <= maxLength) {
    return path;
  }
  return `${path.slice(0, maxLength - 1)}…`;
}

export function formatBitmapForDisplay(bitmap: string | BitmapDefinition): string {
  if (typeof bitmap === 'string') {
    return bitmap;
  }

  if (bitmap.data?.encoding === 'base64') {
    return '[embedded]';
  }

  return bitmap.path;
}
