/**
 * Control Designer Base Types
 *
 * Shared type definitions for the extensible control designer plugin system.
 * These types define the common interface for all control types (knobs, sliders, etc.).
 */

import type { Component } from 'solid-js';

// ============================================================================
// Control Type Identifiers
// ============================================================================

/**
 * Unique identifiers for each control type.
 * Extend this union as new control types are added.
 */
export type ControlTypeId = 'knob' | 'slider';

/**
 * Control categories determine frame generation logic.
 * - rotational: Angle-based (knobs) - frames show rotation through sweep angle
 * - linear: Position-based (sliders) - frames show position from 0-100%
 * - binary: Two-state (on/off buttons) - two frames
 * - multiState: Discrete states (switches) - N frames for N states
 * - grid2D: XY position (XY pads) - frames for X*Y grid positions
 */
export type ControlCategory = 'rotational' | 'linear' | 'binary' | 'multiState' | 'grid2D';

// ============================================================================
// Camera and Layout Types
// ============================================================================

/**
 * Camera view angle options for the 3D preview.
 */
export type CameraView = 'top' | 'side';

/**
 * Filmstrip layout options for output.
 */
export type FilmstripLayout = 'grid' | 'vertical' | 'horizontal';

// ============================================================================
// Material Types
// ============================================================================

/**
 * Available material types for control components.
 */
export type MaterialType = 'solid' | 'metallic' | 'matte' | 'brushed';

/**
 * Brush direction options for brushed metal material.
 */
export type BrushDirection = 'radial' | 'linear';

/**
 * Material configuration for a control component.
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
// Lighting Configuration
// ============================================================================

/**
 * Light source configuration shared across all control types.
 */
export interface LightingConfig {
  /** Azimuth angle in degrees (0-360, 0 = front) */
  azimuth: number;

  /** Elevation angle in degrees (0-90, 0 = horizon, 90 = directly above) */
  elevation: number;

  /** Ambient occlusion strength (0-100) */
  aoStrength: number;
}

// ============================================================================
// Output Configuration
// ============================================================================

/**
 * Base output configuration shared by all control types.
 */
export interface BaseOutputConfig {
  /** Number of frames in the filmstrip (8-256) */
  frameCount: number;

  /** Frame width in pixels (16-512) */
  frameWidth: number;

  /** Frame height in pixels (16-512) */
  frameHeight: number;

  /** Filmstrip layout (default 'vertical') */
  layout: FilmstripLayout;
}

/**
 * Rotational output extends base with angle settings (for knobs).
 */
export interface RotationalOutputConfig extends BaseOutputConfig {
  /** Rotation sweep angle in degrees (default 270) */
  sweepAngle: number;

  /** Start angle in degrees (default 225, 7 o'clock position) */
  startAngle: number;

  /** End angle in degrees (default 315, 5 o'clock position) */
  endAngle: number;

  /** Geometry rotation offset in degrees (0-360, default 0) */
  rotationOffset: number;
}

/**
 * Linear output for sliders - position calculated from 0-100% automatically.
 */
export interface LinearOutputConfig extends BaseOutputConfig {
  // Position calculated from 0-100% automatically based on frameCount
  // No additional fields needed
}

// ============================================================================
// Base Design Interface
// ============================================================================

/**
 * Base design interface that all control types extend.
 * Contains common properties shared across all control designs.
 */
export interface BaseControlDesign {
  /** Unique identifier for this design instance */
  id: string;

  /** Display name (used when saving as preset) */
  name: string;

  /** Control type identifier */
  controlType: ControlTypeId;

  /** Light source configuration */
  lighting: LightingConfig;

  /** Filmstrip output configuration */
  output: BaseOutputConfig;

  /** Camera view angle for preview */
  cameraView: CameraView;
}

// ============================================================================
// Material Target Types
// ============================================================================

/**
 * Material target for knob layers.
 */
export interface MaterialTargetKnob {
  type: 'layer';
  layerId: string;
}

/**
 * Material target for slider components.
 */
export interface MaterialTargetSlider {
  type: 'component';
  componentId: 'track' | 'handle' | 'fill';
}

/**
 * Union type for all material targets.
 */
export type MaterialTarget = MaterialTargetKnob | MaterialTargetSlider;

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
// Validation Types
// ============================================================================

/**
 * Result of a validation operation.
 */
export interface ValidationResult {
  /** Whether the value is valid */
  valid: boolean;

  /** Error message if invalid */
  error?: string;
}

/**
 * Constraint range for numeric values.
 */
export interface ConstraintRange {
  min: number;
  max: number;
}

// ============================================================================
// Plugin System Types
// ============================================================================

/**
 * Props passed to control-type-specific panels.
 */
export interface PanelProps<TDesign extends BaseControlDesign = BaseControlDesign> {
  design: TDesign;
  onUpdate: (updates: Partial<TDesign>) => void;
}

/**
 * Panel definition for UI rendering.
 */
export interface PanelDefinition {
  /** Unique panel identifier */
  id: string;

  /** Display label */
  label: string;

  /** SolidJS component to render */
  component: Component<PanelProps>;

  /** Optional icon component */
  icon?: Component;
}

/**
 * Renderer interface for control types.
 * Each control type provides its own Three.js renderer implementation.
 */
export interface ControlRenderer<TDesign extends BaseControlDesign = BaseControlDesign> {
  /** Initialize the renderer with a canvas element */
  initialize(canvas: HTMLCanvasElement): Promise<void>;

  /** Update the 3D scene based on design changes */
  updateScene(design: TDesign): void;

  /** Set the position for linear controls (0-1 normalized) */
  setPosition(position: number): void;

  /** Render a single preview frame */
  renderPreview(): void;

  /** Generate a filmstrip image */
  generateFilmstrip(
    design: TDesign,
    onProgress: (progress: GenerationProgress) => void
  ): Promise<string>;

  /** Clean up resources */
  dispose(): void;

  /** Optional: Set selected component for click selection */
  setSelectedComponent?(componentId: string | null): void;

  /** Optional: Resize the renderer */
  resize?(width: number, height: number): void;
}

/**
 * Control type plugin definition.
 * Registered at application startup to add new control types.
 */
export interface ControlTypePlugin<TDesign extends BaseControlDesign = BaseControlDesign> {
  /** Unique control type identifier */
  id: ControlTypeId;

  /** Display label for UI */
  label: string;

  /** Category determines frame generation logic */
  category: ControlCategory;

  /** Icon component for tabs */
  icon: Component;

  /** Factory method to create a default design */
  createDefaultDesign(): TDesign;

  /** Factory method to create a renderer instance */
  createRenderer(): ControlRenderer<TDesign>;

  /** Type-specific panel definitions */
  geometryPanels: PanelDefinition[];

  /** Validate a design configuration */
  validateDesign(design: TDesign): ValidationResult;

  /** Constraint ranges for validation */
  constraints: Record<string, ConstraintRange>;
}

// ============================================================================
// Preset Types
// ============================================================================

/**
 * A saved control design preset stored in IndexedDB.
 */
export interface ControlPreset<T extends BaseControlDesign = BaseControlDesign> {
  /** Unique identifier (UUID) */
  id: string;

  /** User-provided display name (unique) */
  name: string;

  /** Control type discriminator for filtering */
  controlType: ControlTypeId;

  /** Whether this is a built-in template (cannot be deleted) */
  isBuiltIn: boolean;

  /** ISO 8601 creation timestamp */
  createdAt: string;

  /** ISO 8601 last update timestamp */
  updatedAt: string;

  /** Complete control design configuration */
  design: T;
}

// ============================================================================
// History Types
// ============================================================================

/**
 * A history operation for the control designer's internal undo/redo stack.
 */
export interface ControlDesignerHistoryOperation {
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
