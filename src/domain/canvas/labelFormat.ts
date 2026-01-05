/**
 * Format a view class name for display as a label.
 *
 * @param className - The view class name (e.g., 'CTextButton')
 * @returns The formatted label, or 'Unknown' if the class name is undefined/empty
 */
export function formatLabel(className: string | undefined): string {
  if (!className || className.trim() === '') {
    return 'Unknown';
  }

  return className;
}
