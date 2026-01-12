/**
 * Editor Types
 * Types for property editor components
 */

/**
 * Editor type classification for selecting appropriate input controls.
 */
export type EditorType =
  | 'text' // Free-form string input
  | 'point' // "x, y" coordinate pair
  | 'number' // Numeric input with optional range
  | 'boolean' // Checkbox toggle
  | 'enum' // Dropdown with fixed options
  | 'color' // Color picker (document resources + hex)
  | 'font' // Font picker (document resources)
  | 'bitmap' // Bitmap picker (document resources)
  | 'gradient' // Gradient picker (document resources)
  | 'control-tag' // Control tag picker (document resources)
  | 'readonly'; // Display only, not editable

/**
 * Configuration for an attribute defining its editor type and validation rules.
 */
export interface AttributeTypeConfig {
  /** Editor type to render */
  editorType: EditorType;
  /** Options for enum type */
  options?: string[];
  /** Minimum value for number type */
  min?: number;
  /** Maximum value for number type */
  max?: number;
  /** Step increment for number type */
  step?: number;
  /** Multi-select flags for autosize-style attributes */
  flags?: string[];
}

/**
 * Result of validating an attribute value.
 */
export interface ValidationResult {
  /** Whether the value is valid */
  valid: boolean;
  /** Human-readable error message if invalid */
  error?: string;
  /** Normalized/cleaned value if valid (optional) */
  normalizedValue?: string;
}

/**
 * Base props interface for all editor components.
 */
export interface EditorProps {
  /** Current value */
  value: string;
  /** Called on every input change (for live preview) */
  onChange: (newValue: string) => void;
  /** Called when edit is committed (Enter, blur) */
  onCommit: () => void;
  /** Called when edit is cancelled (Escape) */
  onCancel: () => void;
  /** Whether the editor is disabled */
  disabled?: boolean;
  /** Validation error message to display */
  error?: string | null;
  /** Placeholder text (e.g., "Mixed" for batch edits) */
  placeholder?: string;
}

/**
 * Props for NumberEditor with range constraints.
 */
export interface NumberEditorProps extends EditorProps {
  /** Minimum allowed value */
  min?: number;
  /** Maximum allowed value */
  max?: number;
  /** Step increment for arrow keys / buttons */
  step?: number;
}

/**
 * Props for EnumEditor with fixed options.
 */
export interface EnumEditorProps extends EditorProps {
  /** Available options */
  options: string[];
}

/**
 * Props for multi-flag enum editor (like autosize).
 */
export interface FlagsEditorProps extends EditorProps {
  /** Available flags */
  flags: string[];
}

/**
 * Props for resource pickers (color, font, bitmap).
 */
export interface ResourcePickerProps extends EditorProps {
  /** Available resource names from document */
  resources: string[];
}

/**
 * Props for ColorPicker component.
 */
export interface ColorPickerProps extends EditorProps {
  /** Available color names from document colors */
  documentColors: string[];
}

/**
 * Props for FontPicker component.
 */
export interface FontPickerProps extends EditorProps {
  /** Available font names from document fonts */
  documentFonts: string[];
}

/**
 * Props for BitmapPicker component.
 */
export interface BitmapPickerProps extends EditorProps {
  /** Available bitmap names from document bitmaps */
  documentBitmaps: string[];
}

/**
 * Props for ControlTagPicker component.
 */
export interface ControlTagPickerProps extends EditorProps {
  /** Available control tag names from document control-tags */
  documentControlTags: string[];
}

/**
 * Internal state for tracking an edit session.
 */
export interface EditorState {
  /** Whether currently editing */
  isEditing: boolean;
  /** Original value captured at edit start (for cancel) */
  originalValue: string;
  /** Current value during editing */
  currentValue: string;
  /** Current validation error */
  validationError: string | null;
}

/**
 * History operation type for property changes.
 */
export type PropertyChangeOperationType = 'property-change';

/**
 * Data for a property edit operation (for creating history entry).
 */
export interface PropertyEditData {
  /** View IDs affected */
  viewIds: string[];
  /** Attribute name that was changed */
  attributeName: string;
  /** Previous values keyed by view ID */
  previousValues: Record<string, string | undefined>;
  /** New value applied to all views */
  newValue: string;
}
