/**
 * Control Designer Plugin Registry Contract
 *
 * Defines the interfaces for the plugin registration system.
 * Control types register themselves with the registry to be available
 * in the Control Designer modal.
 */

import type { Component } from 'solid-js';
import type { WebGLRenderer } from 'three';
import type {
  BaseControlDesign,
  ControlTypeId,
  ControlCategory,
  LightingConfig,
} from './control-design-types';

// ============================================================================
// Generation Progress
// ============================================================================

/**
 * Stages of filmstrip generation.
 */
export type GenerationStage = 'preparing' | 'rendering' | 'compositing' | 'complete';

/**
 * Progress information during filmstrip generation.
 */
export interface GenerationProgress {
  /** Current generation stage */
  stage: GenerationStage;

  /** Current frame being rendered (0-based) */
  currentFrame: number;

  /** Total frames to render */
  totalFrames: number;

  /** Completion percentage (0-100) */
  percent: number;
}

// ============================================================================
// Validation
// ============================================================================

/**
 * Validation error information.
 */
export interface ValidationError {
  /** Field path that failed validation */
  path: string;

  /** Human-readable error message */
  message: string;

  /** Error severity */
  severity: 'error' | 'warning';
}

/**
 * Result of design validation.
 */
export interface ValidationResult {
  /** Whether the design is valid */
  valid: boolean;

  /** List of validation errors/warnings */
  errors: ValidationError[];
}

/**
 * Constraint range for numeric values.
 */
export interface ConstraintRange {
  /** Minimum allowed value */
  min: number;

  /** Maximum allowed value */
  max: number;

  /** Step increment (optional) */
  step?: number;
}

// ============================================================================
// Panel Definitions
// ============================================================================

/**
 * Props passed to panel components.
 */
export interface PanelProps<TDesign extends BaseControlDesign = BaseControlDesign> {
  /** Current design state */
  design: TDesign;

  /**
   * Callback to update design.
   * Pass partial updates that will be merged with current design.
   */
  onUpdate: (updates: Partial<TDesign>) => void;
}

/**
 * Definition of a panel in the Control Designer.
 */
export interface PanelDefinition {
  /** Unique panel identifier */
  id: string;

  /** Display label for panel header */
  label: string;

  /** Panel component (receives PanelProps) */
  component: Component<PanelProps>;

  /** Optional icon component for collapsed state */
  icon?: Component;
}

// ============================================================================
// Control Renderer Interface
// ============================================================================

/**
 * Interface for control-specific renderers.
 * Each control type provides its own renderer implementation.
 */
export interface ControlRenderer<TDesign extends BaseControlDesign = BaseControlDesign> {
  /**
   * Initializes the renderer with a canvas element.
   * Sets up WebGL context, scene, camera, and lighting.
   *
   * @param canvas - Canvas element for rendering
   * @returns Promise that resolves when initialization is complete
   */
  initialize(canvas: HTMLCanvasElement): Promise<void>;

  /**
   * Updates the 3D scene based on design changes.
   * Called whenever design state changes.
   *
   * @param design - Current design configuration
   */
  updateScene(design: TDesign): void;

  /**
   * Sets the normalized position for preview/filmstrip.
   * - For rotational controls: maps to rotation angle
   * - For linear controls: maps to handle position
   * - For binary controls: 0 = off, 1 = on
   *
   * @param position - Normalized position (0-1)
   */
  setPosition(position: number): void;

  /**
   * Renders a single frame to the preview canvas.
   */
  renderPreview(): void;

  /**
   * Generates the complete filmstrip image.
   *
   * @param design - Design configuration
   * @param onProgress - Progress callback
   * @returns Promise resolving to PNG data URL
   */
  generateFilmstrip(
    design: TDesign,
    onProgress: (progress: GenerationProgress) => void
  ): Promise<string>;

  /**
   * Disposes of all renderer resources.
   * Must be called when the modal closes.
   */
  dispose(): void;

  /**
   * Sets the selected component for material editing (optional).
   * Used for click-to-select in preview.
   *
   * @param componentId - Component identifier or null to deselect
   */
  setSelectedComponent?(componentId: string | null): void;
}

// ============================================================================
// Plugin Interface
// ============================================================================

/**
 * Control type plugin definition.
 * Each control type (knob, slider, etc.) implements this interface
 * and registers with the controlTypeRegistry.
 */
export interface ControlTypePlugin<TDesign extends BaseControlDesign = BaseControlDesign> {
  /** Unique control type identifier */
  id: ControlTypeId;

  /** Human-readable label for UI */
  label: string;

  /** Category determines frame generation behavior */
  category: ControlCategory;

  /** Icon component for tab/menu display */
  icon: Component;

  /**
   * Creates a new design with default values.
   * Called when opening designer without a preset.
   *
   * @returns New design instance with generated ID
   */
  createDefaultDesign(): TDesign;

  /**
   * Creates a renderer instance for this control type.
   * Called when initializing the preview canvas.
   *
   * @param webglRenderer - Shared WebGL renderer (optional optimization)
   * @returns Renderer instance
   */
  createRenderer(webglRenderer?: WebGLRenderer): ControlRenderer<TDesign>;

  /**
   * Panel definitions for type-specific geometry configuration.
   * These panels appear in the panel area alongside shared panels.
   */
  geometryPanels: PanelDefinition[];

  /**
   * Validates a design configuration.
   * Called before saving presets or generating filmstrips.
   *
   * @param design - Design to validate
   * @returns Validation result with any errors
   */
  validateDesign(design: TDesign): ValidationResult;

  /**
   * Constraint definitions for numeric fields.
   * Keys are dot-notation paths (e.g., 'track.width').
   */
  constraints: Record<string, ConstraintRange>;

  /**
   * Maps a position (0-1) to a display value for preview.
   * - Knob: maps to angle display (e.g., "45deg")
   * - Slider: maps to percentage (e.g., "50%")
   *
   * @param position - Normalized position (0-1)
   * @param design - Current design for context
   * @returns Display string
   */
  formatPosition?(position: number, design: TDesign): string;
}

// ============================================================================
// Registry Interface
// ============================================================================

/**
 * Control type registry for plugin management.
 * Plugins register themselves at app startup.
 */
export interface ControlTypeRegistryInterface {
  /**
   * Registers a control type plugin.
   * Plugins are keyed by their ID; re-registration overwrites.
   *
   * @param plugin - Plugin to register
   */
  register<T extends BaseControlDesign>(plugin: ControlTypePlugin<T>): void;

  /**
   * Gets a plugin by ID.
   *
   * @param id - Control type ID
   * @returns Plugin or undefined if not registered
   */
  get(id: ControlTypeId): ControlTypePlugin | undefined;

  /**
   * Gets all registered plugins.
   *
   * @returns Array of all plugins
   */
  getAll(): ControlTypePlugin[];

  /**
   * Checks if a control type is registered.
   *
   * @param id - Control type ID
   * @returns True if registered
   */
  isRegistered(id: ControlTypeId): boolean;

  /**
   * Gets plugins by category.
   *
   * @param category - Control category
   * @returns Array of plugins in category
   */
  getByCategory(category: ControlCategory): ControlTypePlugin[];
}

// ============================================================================
// Registry Implementation (Example)
// ============================================================================

/**
 * Example registry implementation.
 * Actual implementation goes in src/domain/controlDesigner/registry.ts
 */
/*
class ControlTypeRegistry implements ControlTypeRegistryInterface {
  private plugins = new Map<ControlTypeId, ControlTypePlugin>();

  register<T extends BaseControlDesign>(plugin: ControlTypePlugin<T>): void {
    if (this.plugins.has(plugin.id)) {
      console.warn(`[ControlTypeRegistry] Plugin "${plugin.id}" already registered, overwriting`);
    }
    this.plugins.set(plugin.id, plugin as ControlTypePlugin);
  }

  get(id: ControlTypeId): ControlTypePlugin | undefined {
    return this.plugins.get(id);
  }

  getAll(): ControlTypePlugin[] {
    return Array.from(this.plugins.values());
  }

  isRegistered(id: ControlTypeId): boolean {
    return this.plugins.has(id);
  }

  getByCategory(category: ControlCategory): ControlTypePlugin[] {
    return this.getAll().filter(p => p.category === category);
  }
}

export const controlTypeRegistry = new ControlTypeRegistry();
*/
