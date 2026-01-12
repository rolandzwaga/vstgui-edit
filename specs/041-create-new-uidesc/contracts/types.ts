/**
 * Type definitions for Create New uidesc feature
 *
 * NOTE: This is a contract/design file, not actual source code.
 * Source will be created in src/types/createNew.ts
 */

// =============================================================================
// Container Classes
// =============================================================================

/**
 * Container classes available for new document templates.
 * These are VSTGUI view classes that can contain child views.
 */
export type ContainerClass =
  | 'CViewContainer'
  | 'CScrollView'
  | 'CRowColumnView'
  | 'CSplitView'
  | 'CLayeredViewContainer'
  | 'UIViewSwitchContainer'
  | 'CShadowViewContainer';

/**
 * Ordered list of container classes for the dropdown.
 * CViewContainer first as default, others in order of typical usage.
 */
export const CONTAINER_CLASSES: readonly ContainerClass[] = [
  'CViewContainer',
  'CScrollView',
  'CRowColumnView',
  'CSplitView',
  'CLayeredViewContainer',
  'UIViewSwitchContainer',
  'CShadowViewContainer',
] as const;

/**
 * Default container class for new documents.
 */
export const DEFAULT_CONTAINER_CLASS: ContainerClass = 'CViewContainer';

// =============================================================================
// Document Configuration
// =============================================================================

/**
 * Configuration for creating a new uidesc document.
 */
export interface NewDocumentConfig {
  /** Width in pixels (1-10000) */
  width: number;
  /** Height in pixels (1-10000) */
  height: number;
  /** Container class for root template view */
  containerClass: ContainerClass;
}

/**
 * Default configuration values for new documents.
 */
export const DEFAULT_CONFIG: NewDocumentConfig = {
  width: 400,
  height: 300,
  containerClass: 'CViewContainer',
};

// =============================================================================
// Validation
// =============================================================================

/**
 * Validation result for dimension inputs.
 */
export interface DimensionValidationResult {
  /** Whether the value is valid */
  valid: boolean;
  /** Error message if invalid */
  error?: string;
  /** Parsed and rounded value if valid */
  value?: number;
}

/**
 * Dimension constraints.
 */
export const DIMENSION_CONSTRAINTS = {
  MIN: 1,
  MAX: 10000,
} as const;

// =============================================================================
// Dialog Props
// =============================================================================

/**
 * Props for the CreateNewDialog component.
 */
export interface CreateNewDialogProps {
  /** Whether the dialog is open */
  isOpen: boolean;
  /** Called when dialog should close (cancel, escape, backdrop click) */
  onClose: () => void;
  /** Called when user confirms creation with valid config */
  onCreate: (config: NewDocumentConfig) => void;
}
