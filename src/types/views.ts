/**
 * View Creation Types
 * Types for view class registry, palette, and clipboard operations
 */

import type { Point, Size } from './canvas';

/**
 * View category for palette organization.
 * More specific than canvas.ViewCategory for palette display purposes.
 */
export type PaletteCategoryId = 'containers' | 'controls' | 'displays' | 'text-input' | 'animation';

/**
 * Represents a VSTGUI view class that can be instantiated.
 */
export interface ViewClass {
  /** The class name (e.g., "CTextButton") */
  name: string;
  /** Category for palette grouping */
  category: PaletteCategoryId;
  /** Default size when creating new instances */
  defaultSize: Size;
  /** Optional default attributes for new instances */
  defaultAttributes?: Record<string, string>;
}

/**
 * Represents a collapsible category in the view palette.
 */
export interface PaletteCategory {
  /** Unique identifier for the category */
  id: PaletteCategoryId;
  /** Display label */
  label: string;
  /** Class names in this category */
  viewClasses: string[];
}

/**
 * Serialized view for clipboard and history operations.
 * Minimal representation that can recreate a view.
 */
export interface SerializedView {
  /** Original view ID (used for reference, not reused on paste) */
  originalId: string;
  /** View class name */
  class: string;
  /** All view attributes */
  attributes: Record<string, string>;
  /** Serialized children (for containers) */
  children?: SerializedView[];
}

/**
 * Internal clipboard storage format.
 */
export interface ClipboardData {
  /** Serialized view hierarchies */
  views: SerializedView[];
  /** Original positions by view ID */
  sourceOrigins: Record<string, Point>;
  /** Timestamp when copied */
  copyTimestamp: number;
  /** Number of times pasted (for incremental offset) */
  pasteCount: number;
}
