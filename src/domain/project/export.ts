/**
 * Export functions for project data
 *
 * Supports exporting uidesc documents as JSON, XML, or ZIP archives.
 */

import { zip } from 'fflate';
import type { VSTGUIUIDescription } from '../../types/uidesc';
import { serializeToJson, serializeToXml } from '../serializer';

/**
 * Bitmap data for ZIP export
 */
export interface ExportBitmap {
  /** Bitmap filename (e.g., "knob.png") */
  name: string;
  /** Binary bitmap data */
  data: Uint8Array;
}

/**
 * Export format type
 */
export type ExportFormatType = 'json' | 'xml' | 'zip';

/**
 * Export the document as formatted JSON.
 *
 * @param document - The uidesc document to export
 * @returns Formatted JSON string with 2-space indentation
 */
export function exportAsJSON(document: VSTGUIUIDescription): string {
  return serializeToJson(document, { pretty: true });
}

/**
 * Export the document as XML.
 *
 * @param document - The uidesc document to export
 * @returns XML string with declaration
 */
export function exportAsXML(document: VSTGUIUIDescription): string {
  return serializeToXml(document);
}

/**
 * Export the document as a ZIP archive.
 *
 * Creates an archive containing:
 * - {projectName}.uidesc (JSON format)
 * - bitmaps/ subfolder with all bitmap files (if provided)
 *
 * @param document - The uidesc document to export
 * @param projectName - The project name (used for uidesc filename)
 * @param bitmaps - Optional array of bitmap files to include
 * @returns Promise resolving to ZIP archive as Uint8Array
 */
export function exportAsZIP(
  document: VSTGUIUIDescription,
  projectName: string,
  bitmaps?: ExportBitmap[]
): Promise<Uint8Array> {
  return new Promise((resolve, reject) => {
    // Create the files to include in the archive
    const files: Record<string, Uint8Array> = {};

    // Add the uidesc file (as JSON)
    const uidescContent = exportAsJSON(document);
    const uidescFilename = `${sanitizeFilename(projectName)}.uidesc`;
    files[uidescFilename] = new TextEncoder().encode(uidescContent);

    // Add bitmap files if provided
    if (bitmaps && bitmaps.length > 0) {
      for (const bitmap of bitmaps) {
        const bitmapPath = `bitmaps/${sanitizeFilename(bitmap.name)}`;
        files[bitmapPath] = bitmap.data;
      }
    }

    // Create the ZIP archive
    zip(files, { level: 6 }, (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
}

/**
 * Create a downloadable Blob from content.
 *
 * @param content - The content to create a blob from
 * @param format - The export format
 * @returns Blob with appropriate MIME type
 */
export function createDownloadBlob(content: string | Uint8Array, format: ExportFormatType): Blob {
  const mimeTypes: Record<ExportFormatType, string> = {
    json: 'application/json',
    xml: 'application/xml',
    zip: 'application/zip',
  };

  const mimeType = mimeTypes[format];

  if (content instanceof Uint8Array) {
    // Create a copy as ArrayBuffer to avoid SharedArrayBuffer issues
    return new Blob([new Uint8Array(content)], { type: mimeType });
  }

  return new Blob([content], { type: mimeType });
}

/**
 * Trigger a file download in the browser.
 *
 * @param blob - The blob to download
 * @param filename - The filename for the download
 */
export function triggerDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Get the appropriate file extension for an export format.
 *
 * @param format - The export format
 * @returns File extension with dot (e.g., ".uidesc")
 */
export function getFileExtension(format: ExportFormatType): string {
  switch (format) {
    case 'json':
    case 'xml':
      return '.uidesc';
    case 'zip':
      return '.zip';
  }
}

/**
 * Sanitize a filename by removing invalid characters.
 *
 * @param filename - The filename to sanitize
 * @returns Sanitized filename
 */
function sanitizeFilename(filename: string): string {
  // Remove or replace characters that are invalid in filenames
  return filename
    .replace(/[<>:"/\\|?*]/g, '_')
    .replace(/\s+/g, '_')
    .replace(/_{2,}/g, '_')
    .trim();
}
