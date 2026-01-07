/**
 * Type definitions for the uidesc file upload and parsing features
 */

import type { FormatType, ParseState, ValidationError } from './parser';
import type { VSTGUIUIDescription } from './uidesc';

// Re-export hierarchy types
export type {
  DropInfo,
  DropPosition,
  GroupOperation,
  HierarchyDragState,
  ReorderOperation,
  ReparentOperation,
  TreeNode,
  UngroupOperation,
} from './hierarchy';
// Re-export history types
export type {
  ConstraintAxis,
  DragState,
  HistoryOperation,
  MoveOperationData,
} from './history';
export {
  AXIS_LOCK_THRESHOLD,
  CLICK_TOLERANCE,
  HISTORY_STACK_LIMIT,
  NUDGE_DISTANCE,
  NUDGE_DISTANCE_FAST,
} from './history';
// Re-export parser types for convenience
export type { FormatType, ParseResult, ParseState, ValidationError } from './parser';
// Re-export resize types
export type {
  CreateResizeOperationFn,
  ResizeBounds,
  ResizeOperationData,
  ResizeOptions,
  ResizeState,
} from './resize';
export { MIN_VIEW_SIZE, RESIZE_CLICK_TOLERANCE } from './resize';
// Re-export smart guides types
export type {
  EdgeType,
  GuideMatch,
  GuideOrientation,
  GuideType,
  SmartGuide,
  SmartGuidesState,
  SpacingGuide,
  ViewBounds,
} from './smartGuides';
export { isSpacingGuide } from './smartGuides';

/**
 * State machine for upload process
 * - idle: No file loaded, waiting for user action
 * - dragging: File is being dragged over the drop zone
 * - loading: File is being read
 * - success: File successfully loaded
 * - error: An error occurred during upload
 */
export type UploadState = 'idle' | 'dragging' | 'loading' | 'success' | 'error';

/**
 * Discriminated union for upload error types
 */
export type UploadError =
  | { type: 'invalid-extension'; filename: string; message: string }
  | { type: 'empty-file'; message: string };

/**
 * Metadata about the loaded document
 */
export interface DocumentMetadata {
  filename: string;
  fileSize: number;
  loadedAt: Date;
}

/**
 * Global store state for the document
 */
export interface DocumentStoreState {
  // From 001-uidesc-upload
  content: string | null;
  metadata: DocumentMetadata | null;
  uploadState: UploadState;
  error: UploadError | null;

  // From 002-uidesc-parsing
  document: VSTGUIUIDescription | null;
  parseState: ParseState;
  parseErrors: ValidationError[] | null;
  detectedFormat: FormatType | null;
}
