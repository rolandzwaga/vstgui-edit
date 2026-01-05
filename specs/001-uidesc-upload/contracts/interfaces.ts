/**
 * Internal interfaces for uidesc file upload feature
 * Feature: 001-uidesc-upload
 *
 * NOTE: This is a contract specification file, not runtime code.
 * Actual implementation should be in src/domain/uidesc/types.ts
 */

// ============================================================================
// Parser Contract
// ============================================================================

/**
 * Parse raw file content into a UidescDocument.
 *
 * @param content - Raw file content as string
 * @returns Parsed document or parse error
 */
export interface ParseResult {
  success: true;
  document: UidescDocument;
} | {
  success: false;
  error: ParseError;
}

export interface ParseError {
  type: 'parse-error';
  message: string;
  line?: number;
  column?: number;
}

// ============================================================================
// Validator Contract
// ============================================================================

/**
 * Validate a parsed document against the VSTGUI schema.
 *
 * @param document - Parsed JSON object
 * @returns Validation result with errors if invalid
 */
export interface ValidationResult {
  valid: true;
} | {
  valid: false;
  errors: ValidationError[];
}

export interface ValidationError {
  path: string;
  message: string;
  keyword: string;
}

// ============================================================================
// Document Store Contract
// ============================================================================

export interface DocumentStore {
  /** Current upload state */
  readonly uploadState: () => UploadState;

  /** Current error, if any */
  readonly error: () => UploadError | null;

  /** Loaded document, if any */
  readonly document: UidescDocument | null;

  /** Document metadata, if loaded */
  readonly metadata: DocumentMetadata | null;

  /** Load a file into the store */
  loadFile(file: File): Promise<void>;

  /** Reset store to initial state */
  reset(): void;

  /** Set dragging state */
  setDragging(isDragging: boolean): void;
}

// ============================================================================
// Upload Zone Component Contract
// ============================================================================

export interface UploadZoneProps {
  /** Called when document is successfully loaded */
  onUpload?: (document: UidescDocument, metadata: DocumentMetadata) => void;

  /** Called when an error occurs */
  onError?: (error: UploadError) => void;

  /** Additional CSS class */
  class?: string;
}

// ============================================================================
// Shared Types
// ============================================================================

export type UploadState = 'idle' | 'dragging' | 'loading' | 'success' | 'error';

export type UploadError =
  | { type: 'invalid-extension'; filename: string }
  | { type: 'parse-error'; message: string }
  | { type: 'validation-error'; errors: string[] }
  | { type: 'empty-file' };

export interface DocumentMetadata {
  filename: string;
  loadedAt: Date;
  fileSize: number;
}

export interface UidescDocument {
  'vstgui-ui-description': {
    version: '1';
    colors?: Record<string, string>;
    fonts?: Record<string, FontDefinition>;
    bitmaps?: Record<string, BitmapDefinition>;
    gradients?: Record<string, GradientColorStop[]>;
    'control-tags'?: Record<string, string>;
    variables?: Record<string, string>;
    templates?: Record<string, ViewDefinition>;
    custom?: Record<string, unknown>;
  };
}

export interface FontDefinition {
  'font-name': string;
  size: string;
  bold?: string;
  italic?: string;
  underline?: string;
  'strike-through'?: string;
  'alternative-font-names'?: string;
}

export interface BitmapDefinition {
  path: string;
  'scale-factor'?: string;
  'nineparttiled-offsets'?: string;
  data?: {
    encoding: 'base64';
    data: string;
  };
}

export interface GradientColorStop {
  rgba: string;
  start: string;
}

export interface ViewDefinition {
  attributes: ViewAttributes;
  children?: Record<string, ViewDefinition>;
}

export interface ViewAttributes {
  class?: string;
  origin?: string;
  size?: string;
  [key: string]: string | undefined;
}
