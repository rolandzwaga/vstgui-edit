import type { ViewCategory } from '../../types/canvas';

/**
 * Format a view class name for display as a label.
 *
 * @param className - The view class name (e.g., 'CTextButton')
 * @param category - Optional view category, used to add [Custom] indicator
 * @returns The formatted label, or 'Unknown' if the class name is undefined/empty
 */
export function formatLabel(className: string | undefined, category?: ViewCategory): string {
  if (!className || className.trim() === '') {
    return 'Unknown';
  }

  if (category === 'custom') {
    return `${className} [Custom]`;
  }

  return className;
}
