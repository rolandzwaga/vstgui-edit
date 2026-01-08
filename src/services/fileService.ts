import type { FormatType } from '../types/parser';

export type SaveResult = { success: true } | { success: false; error: string };

export function hasFileSystemAccess(): boolean {
  return typeof window !== 'undefined' && 'showSaveFilePicker' in window;
}

export async function saveToFileHandle(
  handle: FileSystemFileHandle,
  content: string
): Promise<SaveResult> {
  try {
    const writable = await handle.createWritable();
    await writable.write(content);
    await writable.close();
    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function showSaveFilePicker(
  suggestedName: string
): Promise<FileSystemFileHandle | null> {
  if (!window.showSaveFilePicker) {
    throw new Error('File System Access API not supported');
  }

  try {
    const handle = await window.showSaveFilePicker({
      suggestedName,
      types: [
        {
          description: 'VSTGUI UI Description',
          accept: { 'application/json': ['.uidesc'] },
        },
      ],
    });
    return handle;
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      return null;
    }
    throw error;
  }
}

export function downloadDocument(content: string, filename: string, format: FormatType): void {
  const mimeType = format === 'xml' ? 'application/xml' : 'application/json';
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);

  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;

  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);

  URL.revokeObjectURL(url);
}
