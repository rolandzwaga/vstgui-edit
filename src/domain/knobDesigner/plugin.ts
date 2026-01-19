/**
 * Knob Control Type Plugin
 *
 * Registers the knob control type with the control designer plugin system.
 * Wraps existing knob functionality to work with the extensible architecture.
 */

import type { Component } from 'solid-js';
import type {
  ConstraintRange,
  ControlRenderer,
  ControlTypePlugin,
  GenerationProgress,
  PanelDefinition,
  PanelProps,
  ValidationResult,
} from '../../types/controlDesigner';
import type { KnobDesign } from '../../types/knobDesigner';
import { copyDesign, createDefaultDesign, DEFAULT_KNOB_DESIGN } from './defaults';
import {
  INDICATOR_CONSTRAINTS,
  LAYER_CONSTRAINTS,
  LIGHTING_CONSTRAINTS,
  MATERIAL_CONSTRAINTS,
  OUTPUT_CONSTRAINTS,
  validateIndicator,
  validateLayerGeometry,
  validateLayerMaterial,
  validateLighting,
  validateOutput,
} from './validation';

// ============================================================================
// Type Helpers
// ============================================================================

/**
 * Helper to convert MIN/MAX constraint format to min/max format.
 */
function toConstraintRange(constraint: { MIN: number; MAX: number }): ConstraintRange {
  return { min: constraint.MIN, max: constraint.MAX };
}

/**
 * Type that extends KnobDesign to satisfy BaseControlDesign requirement.
 * KnobDesign has optional controlType, but we always provide it.
 */
type KnobDesignWithType = KnobDesign & { controlType: 'knob' };

// ============================================================================
// Knob Icon Component
// ============================================================================

/**
 * Simple knob icon for the control type tabs.
 */
const KnobIcon: Component = () => {
  // Return a simple SVG circle representing a knob
  return null; // Will be implemented with actual SVG in UI layer
};

// ============================================================================
// Knob Validation
// ============================================================================

/**
 * Validates a complete knob design configuration.
 *
 * @param design - The knob design to validate
 * @returns Validation result
 */
export function validateKnobDesign(design: KnobDesign): ValidationResult {
  // Validate layer count
  if (design.layers.length < LAYER_CONSTRAINTS.MIN_LAYERS) {
    return { valid: false, error: `At least ${LAYER_CONSTRAINTS.MIN_LAYERS} layer required` };
  }
  if (design.layers.length > LAYER_CONSTRAINTS.MAX_LAYERS) {
    return { valid: false, error: `Maximum ${LAYER_CONSTRAINTS.MAX_LAYERS} layers allowed` };
  }

  // Validate each layer
  for (const layer of design.layers) {
    const geometryResult = validateLayerGeometry(layer.geometry);
    if (!geometryResult.valid) {
      return { valid: false, error: `Layer "${layer.name}": ${geometryResult.error}` };
    }

    const materialResult = validateLayerMaterial(layer.material);
    if (!materialResult.valid) {
      return { valid: false, error: `Layer "${layer.name}": ${materialResult.error}` };
    }
  }

  // Validate indicator if enabled
  if (design.indicator) {
    const indicatorResult = validateIndicator(design.indicator);
    if (!indicatorResult.valid) return indicatorResult;
  }

  // Validate lighting
  const lightingResult = validateLighting(design.lighting);
  if (!lightingResult.valid) return lightingResult;

  // Validate output
  const outputResult = validateOutput(design.output);
  if (!outputResult.valid) return outputResult;

  return { valid: true };
}

// ============================================================================
// Knob Renderer Factory
// ============================================================================

/**
 * Creates a knob renderer instance.
 * This factory wraps the existing knobRendererService.
 *
 * @returns ControlRenderer implementation for knobs
 */
function createKnobRenderer(): ControlRenderer<KnobDesignWithType> {
  // Lazy import to avoid circular dependencies
  // The actual implementation delegates to knobRendererService
  let rendererModule: typeof import('../../services/knobRenderer') | null = null;

  return {
    async initialize(canvas: HTMLCanvasElement): Promise<void> {
      if (!rendererModule) {
        rendererModule = await import('../../services/knobRenderer');
      }
      await rendererModule.initialize(canvas);
    },

    updateScene(design: KnobDesignWithType): void {
      // Defensive check: ensure we're receiving a knob design
      if (design.controlType !== 'knob') {
        console.warn('[KnobRenderer] Received non-knob design, ignoring', design.controlType);
        return;
      }
      if (rendererModule) {
        rendererModule.updateScene(design);
      }
    },

    setPosition(position: number): void {
      // For knobs, position (0-1) maps to rotation angle
      if (rendererModule) {
        const startAngle = DEFAULT_KNOB_DESIGN.output.startAngle;
        const sweepAngle = DEFAULT_KNOB_DESIGN.output.sweepAngle;
        const angle = startAngle + position * sweepAngle;
        rendererModule.setPreviewRotation(angle);
      }
    },

    renderPreview(): void {
      if (rendererModule) {
        rendererModule.renderPreview();
      }
    },

    async generateFilmstrip(
      design: KnobDesignWithType,
      onProgress: (progress: GenerationProgress) => void
    ): Promise<string> {
      if (!rendererModule) {
        throw new Error('Renderer not initialized');
      }
      return rendererModule.generateFilmstrip(design, onProgress);
    },

    dispose(): void {
      if (rendererModule) {
        rendererModule.dispose();
        rendererModule = null;
      }
    },

    resize(width: number, height: number): void {
      if (rendererModule) {
        rendererModule.resize(width, height);
      }
    },
  };
}

// ============================================================================
// Lazy Panel Imports (to avoid circular dependencies)
// ============================================================================

// Panels will be lazily loaded to avoid circular dependencies
// The actual panel components are registered but not imported here
let LayerPanel: Component<PanelProps> | null = null;
let IndicatorPanel: Component<PanelProps> | null = null;

/**
 * Sets the panel components for the knob plugin.
 * Called during component registration to avoid circular dependencies.
 */
export function registerKnobPanels(panels: {
  LayerPanel: Component<PanelProps> | null;
  IndicatorPanel: Component<PanelProps> | null;
}): void {
  LayerPanel = panels.LayerPanel;
  IndicatorPanel = panels.IndicatorPanel;
}

// ============================================================================
// Knob Plugin Definition
// ============================================================================

/**
 * Creates the default knob design with the required controlType field.
 */
function createDefaultKnobDesign(): KnobDesignWithType {
  const design = createDefaultDesign();
  return { ...design, controlType: 'knob' };
}

/**
 * Knob control type plugin definition.
 * Registered with the control designer plugin registry.
 */
export const knobPlugin: ControlTypePlugin<KnobDesignWithType> = {
  id: 'knob',
  label: 'Knob',
  category: 'rotational',
  icon: KnobIcon,

  createDefaultDesign(): KnobDesignWithType {
    return createDefaultKnobDesign();
  },

  createRenderer(): ControlRenderer<KnobDesignWithType> {
    return createKnobRenderer();
  },

  get geometryPanels(): PanelDefinition[] {
    // Return panel registrations - panels may be null if not yet registered
    const panels: PanelDefinition[] = [];

    if (LayerPanel) {
      panels.push({
        id: 'layers',
        label: 'Layers',
        component: LayerPanel,
      });
    }

    if (IndicatorPanel) {
      panels.push({
        id: 'indicator',
        label: 'Indicator',
        component: IndicatorPanel,
      });
    }

    return panels;
  },

  validateDesign(design: KnobDesignWithType): ValidationResult {
    return validateKnobDesign(design);
  },

  constraints: {
    // Layer geometry constraints
    'layer.diameter': toConstraintRange(LAYER_CONSTRAINTS.DIAMETER),
    'layer.height': toConstraintRange(LAYER_CONSTRAINTS.HEIGHT),
    'layer.bevelRadius': toConstraintRange(LAYER_CONSTRAINTS.BEVEL_RADIUS),

    // Material constraints
    'material.shininess': toConstraintRange(MATERIAL_CONSTRAINTS.SHININESS),
    'material.reflectivity': toConstraintRange(MATERIAL_CONSTRAINTS.REFLECTIVITY),
    'material.brushIntensity': toConstraintRange(MATERIAL_CONSTRAINTS.BRUSH_INTENSITY),

    // Indicator constraints
    'indicator.radialPosition': toConstraintRange(INDICATOR_CONSTRAINTS.RADIAL_POSITION),
    'indicator.radius': toConstraintRange(INDICATOR_CONSTRAINTS.RADIUS),
    'indicator.length': toConstraintRange(INDICATOR_CONSTRAINTS.LENGTH),
    'indicator.width': toConstraintRange(INDICATOR_CONSTRAINTS.WIDTH),
    'indicator.height': toConstraintRange(INDICATOR_CONSTRAINTS.HEIGHT),
    'indicator.depth': toConstraintRange(INDICATOR_CONSTRAINTS.DEPTH),

    // Lighting constraints
    'lighting.azimuth': toConstraintRange(LIGHTING_CONSTRAINTS.AZIMUTH),
    'lighting.elevation': toConstraintRange(LIGHTING_CONSTRAINTS.ELEVATION),
    'lighting.aoStrength': toConstraintRange(LIGHTING_CONSTRAINTS.AO_STRENGTH),

    // Output constraints
    'output.frameCount': toConstraintRange(OUTPUT_CONSTRAINTS.FRAME_COUNT),
    'output.frameSize': toConstraintRange(OUTPUT_CONSTRAINTS.FRAME_SIZE),
    'output.sweepAngle': toConstraintRange(OUTPUT_CONSTRAINTS.SWEEP_ANGLE),
    'output.angle': toConstraintRange(OUTPUT_CONSTRAINTS.ANGLE),
    'output.rotationOffset': toConstraintRange(OUTPUT_CONSTRAINTS.ROTATION_OFFSET),
  },
};

// ============================================================================
// Design Utilities (Re-export)
// ============================================================================

export { createDefaultDesign, copyDesign };
