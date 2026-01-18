/**
 * Missing Bitmaps Store
 *
 * Manages state for missing bitmaps detection and the upload modal.
 * Tracks which bitmaps are missing from IndexedDB and which have been uploaded.
 * Also tracks duplicate bitmap names detected during import.
 */

import { createSignal } from 'solid-js';
import type { DuplicateBitmapInfo, MissingBitmapInfo } from '../domain/bitmaps/missingBitmaps';

// Modal visibility state
const [isModalOpen, setIsModalOpen] = createSignal(false);

// List of missing bitmap infos (name + path)
const [missingBitmaps, setMissingBitmapsInternal] = createSignal<MissingBitmapInfo[]>([]);

// Set of bitmap names that have been uploaded in this session
const [uploadedBitmaps, setUploadedBitmaps] = createSignal<Set<string>>(new Set());

// Duplicate bitmaps warning dialog state
const [isDuplicateWarningOpen, setIsDuplicateWarningOpen] = createSignal(false);

// List of duplicate bitmap infos detected during import
const [duplicateBitmaps, setDuplicateBitmapsInternal] = createSignal<DuplicateBitmapInfo[]>([]);

/**
 * Store object with reactive getters.
 */
export const missingBitmapsStore = {
  /** Whether the missing bitmaps modal is open */
  get isModalOpen() {
    return isModalOpen();
  },

  /** List of missing bitmap infos */
  get missingBitmaps() {
    return missingBitmaps();
  },

  /** Set of bitmap names that have been uploaded */
  get uploadedBitmaps() {
    return uploadedBitmaps();
  },

  /** Whether the duplicate bitmaps warning dialog is open */
  get isDuplicateWarningOpen() {
    return isDuplicateWarningOpen();
  },

  /** List of duplicate bitmap infos */
  get duplicateBitmaps() {
    return duplicateBitmaps();
  },
};

/**
 * Opens the missing bitmaps modal.
 */
export function openMissingBitmapsModal(): void {
  setIsModalOpen(true);
}

/**
 * Closes the missing bitmaps modal.
 */
export function closeMissingBitmapsModal(): void {
  setIsModalOpen(false);
}

/**
 * Sets the list of missing bitmaps.
 * Clears the uploaded set when new missing bitmaps are detected.
 */
export function setMissingBitmaps(bitmaps: MissingBitmapInfo[]): void {
  setMissingBitmapsInternal(bitmaps);
  setUploadedBitmaps(new Set<string>());
}

/**
 * Marks a bitmap as uploaded.
 * The bitmap will still be in the missing list but shown as uploaded in the UI.
 */
export function markBitmapUploaded(name: string): void {
  const current = uploadedBitmaps();
  if (!current.has(name)) {
    const newSet = new Set(current);
    newSet.add(name);
    setUploadedBitmaps(newSet);
  }
}

/**
 * Marks multiple bitmaps as uploaded.
 */
export function markBitmapsUploaded(names: string[]): void {
  const current = uploadedBitmaps();
  const newSet = new Set(current);
  for (const name of names) {
    newSet.add(name);
  }
  setUploadedBitmaps(newSet);
}

/**
 * Clears the uploaded bitmaps set.
 */
export function clearUploadedBitmaps(): void {
  setUploadedBitmaps(new Set<string>());
}

/**
 * Removes a bitmap from the missing list.
 * Used when a bitmap is successfully uploaded and stored.
 */
export function removeMissingBitmap(name: string): void {
  const current = missingBitmaps();
  setMissingBitmapsInternal(current.filter(b => b.name !== name));
}

/**
 * Resets the missing bitmaps store to initial state.
 */
export function resetMissingBitmapsStore(): void {
  setIsModalOpen(false);
  setMissingBitmapsInternal([]);
  setUploadedBitmaps(new Set<string>());
  setIsDuplicateWarningOpen(false);
  setDuplicateBitmapsInternal([]);
}

// Derived helpers

/**
 * Returns true if there are any missing bitmaps that haven't been uploaded yet.
 */
export function hasMissingBitmaps(): boolean {
  const missing = missingBitmaps();
  const uploaded = uploadedBitmaps();
  return missing.some(b => !uploaded.has(b.name));
}

/**
 * Returns the count of missing bitmaps that haven't been uploaded yet.
 */
export function getMissingCount(): number {
  const missing = missingBitmaps();
  const uploaded = uploadedBitmaps();
  return missing.filter(b => !uploaded.has(b.name)).length;
}

/**
 * Returns the total count of bitmaps in the missing list.
 */
export function getTotalMissingCount(): number {
  return missingBitmaps().length;
}

/**
 * Checks if a specific bitmap is missing (not yet uploaded).
 */
export function isBitmapMissing(name: string): boolean {
  const missing = missingBitmaps();
  const uploaded = uploadedBitmaps();
  return missing.some(b => b.name === name) && !uploaded.has(name);
}

/**
 * Gets the path for a missing bitmap by name.
 */
export function getMissingBitmapPath(name: string): string | undefined {
  const missing = missingBitmaps();
  const info = missing.find(b => b.name === name);
  return info?.path;
}

/**
 * Gets the list of bitmap names that are still missing (not uploaded).
 */
export function getRemainingMissingNames(): string[] {
  const missing = missingBitmaps();
  const uploaded = uploadedBitmaps();
  return missing.filter(b => !uploaded.has(b.name)).map(b => b.name);
}

/**
 * Gets the list of missing bitmap infos that are still missing (not uploaded).
 * Returns the full MissingBitmapInfo objects including path information.
 */
export function getRemainingMissingBitmaps(): MissingBitmapInfo[] {
  const missing = missingBitmaps();
  const uploaded = uploadedBitmaps();
  return missing.filter(b => !uploaded.has(b.name));
}

// =============================================================================
// Duplicate Bitmaps Warning
// =============================================================================

/**
 * Opens the duplicate bitmaps warning dialog.
 */
export function openDuplicateWarning(): void {
  setIsDuplicateWarningOpen(true);
}

/**
 * Closes the duplicate bitmaps warning dialog.
 */
export function closeDuplicateWarning(): void {
  setIsDuplicateWarningOpen(false);
}

/**
 * Sets the list of duplicate bitmaps and opens the warning dialog.
 */
export function setDuplicateBitmaps(duplicates: DuplicateBitmapInfo[]): void {
  setDuplicateBitmapsInternal(duplicates);
  if (duplicates.length > 0) {
    setIsDuplicateWarningOpen(true);
  }
}

/**
 * Clears the duplicate bitmaps list.
 */
export function clearDuplicateBitmaps(): void {
  setDuplicateBitmapsInternal([]);
  setIsDuplicateWarningOpen(false);
}

/**
 * Returns true if there are duplicate bitmaps.
 */
export function hasDuplicateBitmaps(): boolean {
  return duplicateBitmaps().length > 0;
}
