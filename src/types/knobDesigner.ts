/**
 * Knob Designer Type Definitions
 *
 * TypeScript interfaces for the 3D Knob Designer feature.
 * Includes knob design configuration, layers, materials, presets, and store state.
 */

// ============================================================================
// Material Types
// ============================================================================

/**
 * Available material types for knob layers.
 */
export type MaterialType = 'solid' | 'metallic' | 'matte' | 'brushed';

/**
 * Brush direction options for brushed metal material.
 */
export type BrushDirection = 'radial' | 'linear';

/**
 * Skirt style options for layer edges.
 */
export type SkirtStyle = 'cylindrical' | 'tapered' | 'angled';

// ============================================================================
// Geometry Types
// ============================================================================

/**
 * Geometry configuration for a knob layer.
 */
export interface LayerGeometry {
  /** Diameter as percentage of knob size (10-100) */
  diameter: number;

  /** Height as percentage of total knob height (10-100) */
  height: number;

  /** Bevel radius in pixels (0-20) */
  bevelRadius: number;

  /** Skirt style for the layer edge */
  skirtStyle: SkirtStyle;
}

/**
 * Material configuration for a knob layer.
 */
export interface LayerMaterial {
  /** Material type */
  type: MaterialType;

  /** Base color in hex format (e.g., '#FF5500FF') */
  color: string;

  /** Shininess for metallic materials (0-128) */
  shininess: number;

  /** Reflectivity percentage for metallic materials (0-100) */
  reflectivity: number;

  /** Brush direction for brushed metal */
  brushDirection: BrushDirection;

  /** Brush pattern intensity (0-100) */
  brushIntensity: number;
}

// ============================================================================
// Layer Types
// ============================================================================

/**
 * A single concentric layer of the knob.
 * Layers stack from bottom (index 0) to top.
 */
export interface KnobLayer {
  /** Unique identifier */
  id: string;

  /** Display name for UI */
  name: string;

  /** Layer geometry configuration */
  geometry: LayerGeometry;

  /** Layer material configuration */
  material: LayerMaterial;
}

// ============================================================================
// Indicator Types
// ============================================================================

/**
 * Indicator shape types.
 */
export type IndicatorType = 'dot' | 'line' | 'notch' | 'groove';

/**
 * Indicator material configuration.
 */
export interface IndicatorMaterial {
  /** Indicator color in hex format */
  color: string;

  /** Whether indicator is metallic */
  metallic: boolean;
}

/**
 * Indicator size parameters.
 * Only relevant fields apply based on type.
 */
export interface IndicatorSize {
  /** Radius for dot type (pixels) */
  radius: number;

  /** Length for line type (pixels) */
  length: number;

  /** Width for line type (pixels) */
  width: number;

  /** Depth for notch/groove types (pixels) */
  depth: number;
}

/**
 * Indicator (dial marker) configuration.
 */
export interface KnobIndicator {
  /** Whether indicator is enabled */
  enabled: boolean;

  /** Indicator shape type */
  type: IndicatorType;

  /** Indicator material/appearance */
  material: IndicatorMaterial;

  /** Size parameters based on type */
  size: IndicatorSize;

  /** Radial position from center (percentage, 10-90) */
  radialPosition: number;
}

// ============================================================================
// Configuration Types
// ============================================================================

/**
 * Light source configuration.
 */
export interface LightingConfig {
  /** Azimuth angle in degrees (0-360, 0 = front) */
  azimuth: number;

  /** Elevation angle in degrees (0-90, 0 = horizon, 90 = directly above) */
  elevation: number;

  /** Ambient occlusion strength (0-100) */
  aoStrength: number;
}

/**
 * Filmstrip output configuration.
 */
export interface OutputConfig {
  /** Number of frames in the filmstrip (8-256) */
  frameCount: number;

  /** Frame width in pixels (16-512) */
  frameWidth: number;

  /** Frame height in pixels (16-512) */
  frameHeight: number;

  /** Rotation sweep angle in degrees (default 270) */
  sweepAngle: number;

  /** Start angle in degrees (default 225, 7 o'clock position) */
  startAngle: number;

  /** End angle in degrees (default 315, 5 o'clock position) */
  endAngle: number;
}

// ============================================================================
// Design Types
// ============================================================================

/**
 * Complete knob design configuration.
 * Represents the full state of a knob being designed.
 */
export interface KnobDesign {
  /** Unique identifier for this design instance */
  id: string;

  /** Display name (used when saving as preset) */
  name: string;

  /** Concentric layers (1-3, bottom to top) */
  layers: KnobLayer[];

  /** Optional indicator configuration */
  indicator: KnobIndicator | null;

  /** Light source configuration */
  lighting: LightingConfig;

  /** Filmstrip output configuration */
  output: OutputConfig;
}

// ============================================================================
// Generation Types
// ============================================================================

/**
 * Generation stages.
 */
export type GenerationStage = 'preparing' | 'rendering' | 'compositing' | 'complete';

/**
 * Filmstrip generation progress state.
 */
export interface GenerationProgress {
  /** Current generation stage */
  stage: GenerationStage;

  /** Current frame being rendered (0-based) */
  currentFrame: number;

  /** Total frames to render */
  totalFrames: number;

  /** Progress percentage (0-100) */
  percent: number;
}

// ============================================================================
// Preset Types
// ============================================================================

/**
 * A saved knob design preset stored in IndexedDB.
 */
export interface KnobPreset {
  /** Unique identifier (UUID) */
  id: string;

  /** User-provided display name (unique) */
  name: string;

  /** Whether this is a built-in template (cannot be deleted) */
  isBuiltIn: boolean;

  /** ISO 8601 creation timestamp */
  createdAt: string;

  /** ISO 8601 last update timestamp */
  updatedAt: string;

  /** Complete knob design configuration */
  design: KnobDesign;
}

// ============================================================================
// Store State Types
// ============================================================================

/**
 * Knob Designer modal store state.
 */
export interface KnobDesignerStoreState {
  /** Whether the modal is currently open */
  isOpen: boolean;

  /** Current working design */
  design: KnobDesign;

  /** Target bitmap name (from BitmapItem context) */
  targetBitmapName: string | null;

  /** Target project ID */
  targetProjectId: string | null;

  /** Current preset selection (null = custom/modified) */
  selectedPresetId: string | null;

  /** Whether design has been modified from preset */
  isModified: boolean;

  /** Generation progress (null = not generating) */
  generationProgress: GenerationProgress | null;

  /** Error message for display */
  errorMessage: string | null;

  /** Undo/redo state (managed by modal history) */
  canUndo: boolean;

  /** Whether redo is available */
  canRedo: boolean;

  /** Description of undo operation */
  undoDescription: string | null;

  /** Description of redo operation */
  redoDescription: string | null;
}

// ============================================================================
// History Types
// ============================================================================

/**
 * A history operation for the knob designer's internal undo/redo stack.
 */
export interface KnobDesignerHistoryOperation {
  /** Operation type for display purposes */
  type: string;

  /** Human-readable description */
  description: string;

  /** Function to undo the operation */
  undo: () => void;

  /** Function to redo the operation */
  redo: () => void;

  /** Timestamp when operation was performed */
  timestamp: number;
}
