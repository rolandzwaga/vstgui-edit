/**
 * Missing bitmap detection utilities.
 * Detects bitmaps referenced in uidesc that are not stored in IndexedDB.
 * Also detects duplicate bitmap names in raw content before parsing.
 */

import type { BitmapDefinition, VSTGUIUIDescription } from '../../types/uidesc';
import type { Bitmap } from '../project/types';
import { getFilenameFromPath } from './pathUtils';

/**
 * Information about a duplicate bitmap name.
 */
export interface DuplicateBitmapInfo {
  /** The duplicate bitmap name */
  name: string;
  /** Number of times this name appears */
  count: number;
  /** The paths associated with each occurrence (if available) */
  paths: string[];
}

/**
 * Information about a missing bitmap.
 */
export interface MissingBitmapInfo {
  /** Bitmap name from uidesc */
  name: string;
  /** Original path from uidesc */
  path: string;
}

/**
 * Extracts the path from a bitmap definition.
 * Handles both string paths and object definitions.
 */
export function getBitmapPath(bitmap: string | BitmapDefinition): string {
  if (typeof bitmap === 'string') {
    return bitmap;
  }
  return bitmap.path || '';
}

/**
 * Extracts all bitmap names from a parsed uidesc document.
 * Returns an array of bitmap names defined in the bitmaps section.
 */
export function extractBitmapNamesFromDocument(doc: VSTGUIUIDescription | null): string[] {
  if (!doc) return [];

  const uidesc = doc['vstgui-ui-description'];
  if (!uidesc) return [];

  const bitmaps = uidesc.bitmaps;
  if (!bitmaps) return [];

  return Object.keys(bitmaps);
}

/**
 * Extracts bitmap info (name and path) from a parsed uidesc document.
 */
export function extractBitmapInfoFromDocument(
  doc: VSTGUIUIDescription | null
): MissingBitmapInfo[] {
  if (!doc) return [];

  const uidesc = doc['vstgui-ui-description'];
  if (!uidesc) return [];

  const bitmaps = uidesc.bitmaps;
  if (!bitmaps) return [];

  return Object.entries(bitmaps).map(([name, bitmap]) => ({
    name,
    path: getBitmapPath(bitmap),
  }));
}

/**
 * Finds bitmap names that are in the uidesc but not stored in IndexedDB.
 *
 * @param bitmapNames - Names of bitmaps defined in uidesc
 * @param storedBitmaps - Bitmaps stored in IndexedDB for the project
 * @returns Array of bitmap names that are missing from storage
 */
export function findMissingBitmaps(bitmapNames: string[], storedBitmaps: Bitmap[]): string[] {
  const storedNames = new Set(storedBitmaps.map(b => b.name));
  return bitmapNames.filter(name => !storedNames.has(name));
}

/**
 * Finds bitmap info for missing bitmaps (includes path information).
 */
export function findMissingBitmapInfos(
  bitmapInfos: MissingBitmapInfo[],
  storedBitmaps: Bitmap[]
): MissingBitmapInfo[] {
  const storedNames = new Set(storedBitmaps.map(b => b.name));
  return bitmapInfos.filter(info => !storedNames.has(info.name));
}

/**
 * Matches an uploaded file to a missing bitmap by comparing the uploaded filename
 * against the filename portion of the bitmap's path property.
 *
 * @param filename - The uploaded file's name (e.g., "button.png")
 * @param missingBitmaps - Array of missing bitmap infos to match against
 * @returns The matching bitmap name, or null if no match
 */
export function matchUploadedFile(
  filename: string,
  missingBitmaps: MissingBitmapInfo[]
): string | null {
  // Extract just the filename without path from the uploaded file
  const uploadedFilename = getFilenameFromPath(filename);

  // Match against the filename portion of each bitmap's path
  for (const bitmap of missingBitmaps) {
    const pathFilename = getFilenameFromPath(bitmap.path);

    // Exact match with filename from path
    if (pathFilename === uploadedFilename) {
      return bitmap.name;
    }
  }

  return null;
}

/**
 * Matches multiple uploaded files to missing bitmaps by path filename.
 * Returns a map of matched bitmap names to their corresponding files.
 *
 * @param files - Array of uploaded files
 * @param missingBitmaps - Array of missing bitmap infos
 * @returns Map of bitmap name -> File for matched files
 */
export function matchUploadedFiles(
  files: File[],
  missingBitmaps: MissingBitmapInfo[]
): Map<string, File> {
  const matches = new Map<string, File>();
  const remainingMissing = [...missingBitmaps];

  for (const file of files) {
    const matchedName = matchUploadedFile(file.name, remainingMissing);
    if (matchedName) {
      matches.set(matchedName, file);
      // Remove matched bitmap to prevent duplicate matches
      const index = remainingMissing.findIndex(b => b.name === matchedName);
      if (index !== -1) {
        remainingMissing.splice(index, 1);
      }
    }
  }

  return matches;
}

/**
 * Detects duplicate bitmap names in XML content.
 * Scans for all <bitmap name="..."> elements and counts occurrences.
 *
 * @param content - Raw XML content
 * @returns Array of duplicate bitmap info (only names that appear more than once)
 */
export function detectDuplicateBitmapsInXml(content: string): DuplicateBitmapInfo[] {
  const duplicates: DuplicateBitmapInfo[] = [];
  const nameCountMap = new Map<string, { count: number; paths: string[] }>();

  // Match all <bitmap ... /> or <bitmap ...>...</bitmap> elements
  // Capture the name and path attributes
  const bitmapPattern = /<bitmap\s+([^>]*?)(?:\/>|>)/gi;
  let match: RegExpExecArray | null = bitmapPattern.exec(content);

  while (match !== null) {
    const attrs = match[1];

    // Extract name attribute
    const nameMatch = attrs.match(/name\s*=\s*["']([^"']+)["']/i);
    if (!nameMatch) continue;
    const name = nameMatch[1];

    // Extract path attribute if present
    const pathMatch = attrs.match(/path\s*=\s*["']([^"']+)["']/i);
    const path = pathMatch ? pathMatch[1] : '';

    const existing = nameCountMap.get(name);
    if (existing) {
      existing.count++;
      if (path) existing.paths.push(path);
    } else {
      nameCountMap.set(name, { count: 1, paths: path ? [path] : [] });
    }

    match = bitmapPattern.exec(content);
  }

  // Return only duplicates (count > 1)
  for (const [name, info] of nameCountMap) {
    if (info.count > 1) {
      duplicates.push({
        name,
        count: info.count,
        paths: info.paths,
      });
    }
  }

  return duplicates;
}

/**
 * Detects duplicate bitmap names in JSON content.
 * Scans for duplicate keys in the bitmaps section.
 *
 * Note: This is a heuristic approach since JSON parsers discard duplicate keys.
 * We scan the raw content for the bitmaps object and count key occurrences.
 *
 * @param content - Raw JSON content
 * @returns Array of duplicate bitmap info (only names that appear more than once)
 */
export function detectDuplicateBitmapsInJson(content: string): DuplicateBitmapInfo[] {
  const duplicates: DuplicateBitmapInfo[] = [];
  const nameCountMap = new Map<string, { count: number; paths: string[] }>();

  // Find the bitmaps section in the JSON
  // This is a simplified approach that works for typical uidesc structure
  const bitmapsMatch = content.match(/"bitmaps"\s*:\s*\{([^}]*(?:\{[^}]*\}[^}]*)*)\}/);
  if (!bitmapsMatch) {
    return duplicates;
  }

  const bitmapsContent = bitmapsMatch[1];

  // Match all bitmap keys (quoted strings followed by colon)
  // Handle both simple string values and object values
  const keyPattern = /"([^"]+)"\s*:/g;
  let match: RegExpExecArray | null = keyPattern.exec(bitmapsContent);

  while (match !== null) {
    const name = match[1];

    // Skip common object properties that aren't bitmap names
    if (name === 'path' || name === 'nineparttiledoffsets') {
      continue;
    }

    // Try to extract path value after this key
    const afterKey = bitmapsContent.slice(match.index + match[0].length);
    let path = '';

    // Check if value is a simple string (path)
    const simplePathMatch = afterKey.match(/^\s*"([^"]+)"/);
    if (simplePathMatch) {
      path = simplePathMatch[1];
    } else {
      // Check if value is an object with path property
      const objPathMatch = afterKey.match(/^\s*\{\s*"path"\s*:\s*"([^"]+)"/);
      if (objPathMatch) {
        path = objPathMatch[1];
      }
    }

    const existing = nameCountMap.get(name);
    if (existing) {
      existing.count++;
      if (path) existing.paths.push(path);
    } else {
      nameCountMap.set(name, { count: 1, paths: path ? [path] : [] });
    }

    match = keyPattern.exec(bitmapsContent);
  }

  // Return only duplicates (count > 1)
  for (const [name, info] of nameCountMap) {
    if (info.count > 1) {
      duplicates.push({
        name,
        count: info.count,
        paths: info.paths,
      });
    }
  }

  return duplicates;
}

/**
 * Detects duplicate bitmap names in uidesc content.
 * Automatically detects format (XML or JSON) and scans accordingly.
 *
 * @param content - Raw uidesc content (XML or JSON)
 * @returns Array of duplicate bitmap info (only names that appear more than once)
 */
export function detectDuplicateBitmaps(content: string): DuplicateBitmapInfo[] {
  const trimmed = content.trim();

  // Detect format based on first character
  if (trimmed.startsWith('<')) {
    return detectDuplicateBitmapsInXml(content);
  } else if (trimmed.startsWith('{')) {
    return detectDuplicateBitmapsInJson(content);
  }

  // Unknown format
  return [];
}
