/**
 * Slider Designer Plugin
 *
 * Plugin definition for the slider control type.
 * Implements the ControlTypePlugin interface to register with the plugin system.
 */

import type { Component } from 'solid-js';
import { createSliderRenderer } from '../../services/controlRenderer/sliderRenderer';
import type {
  BaseControlDesign,
  ControlTypePlugin,
  PanelDefinition,
  PanelProps,
  ValidationResult,
} from '../../types/controlDesigner';
import type { SliderDesign } from '../../types/controlDesigner/slider';
import { createDefaultSliderDesign } from './defaults';
import {
  HANDLE_CONSTRAINTS,
  SLIDER_OUTPUT_CONSTRAINTS,
  TRACK_CONSTRAINTS,
  VALUE_FILL_CONSTRAINTS,
  validateSliderDesign,
} from './validation';

// ============================================================================
// Slider Icon Component
// ============================================================================

/**
 * Simple slider icon for the control type tabs.
 */
const SliderIcon: Component = () => {
  // Return null as placeholder - actual SVG will be implemented in UI layer
  return null;
};

// ============================================================================
// Lazy Panel Imports (to avoid circular dependencies)
// ============================================================================

// Panels will be lazily loaded to avoid circular dependencies
// The actual panel components are registered but not imported here
let TrackPanel: Component<PanelProps> | null = null;
let HandlePanel: Component<PanelProps> | null = null;
let ValueFillPanel: Component<PanelProps> | null = null;

/**
 * Sets the panel components for the slider plugin.
 * Called during component registration to avoid circular dependencies.
 */
export function registerSliderPanels(panels: {
  TrackPanel: Component<PanelProps> | null;
  HandlePanel: Component<PanelProps> | null;
  ValueFillPanel: Component<PanelProps> | null;
}): void {
  TrackPanel = panels.TrackPanel;
  HandlePanel = panels.HandlePanel;
  ValueFillPanel = panels.ValueFillPanel;
}

// ============================================================================
// Plugin Definition
// ============================================================================

/**
 * Slider control type plugin.
 * Provides slider-specific validation, rendering, and panel registration.
 */
export const sliderPlugin: ControlTypePlugin = {
  id: 'slider',
  label: 'Slider',
  icon: SliderIcon,
  category: 'linear',

  createDefaultDesign: (): BaseControlDesign => {
    return createDefaultSliderDesign();
  },

  validateDesign: (design: BaseControlDesign): ValidationResult => {
    return validateSliderDesign(design as SliderDesign);
  },

  createRenderer: () => {
    return createSliderRenderer();
  },

  get geometryPanels(): PanelDefinition[] {
    // Return panel registrations - panels may be null if not yet registered
    const panels: PanelDefinition[] = [];

    if (TrackPanel) {
      panels.push({
        id: 'track',
        label: 'Track',
        component: TrackPanel,
      });
    }

    if (HandlePanel) {
      panels.push({
        id: 'handle',
        label: 'Handle',
        component: HandlePanel,
      });
    }

    if (ValueFillPanel) {
      panels.push({
        id: 'valueFill',
        label: 'Value Fill',
        component: ValueFillPanel,
      });
    }

    return panels;
  },

  constraints: {
    // Track constraints
    'track.length': { min: TRACK_CONSTRAINTS.LENGTH.MIN, max: TRACK_CONSTRAINTS.LENGTH.MAX },
    'track.width': { min: TRACK_CONSTRAINTS.WIDTH.MIN, max: TRACK_CONSTRAINTS.WIDTH.MAX },
    'track.depth': { min: TRACK_CONSTRAINTS.DEPTH.MIN, max: TRACK_CONSTRAINTS.DEPTH.MAX },
    'track.cornerRadius': {
      min: TRACK_CONSTRAINTS.CORNER_RADIUS.MIN,
      max: TRACK_CONSTRAINTS.CORNER_RADIUS.MAX,
    },

    // Handle constraints
    'handle.width': { min: HANDLE_CONSTRAINTS.WIDTH.MIN, max: HANDLE_CONSTRAINTS.WIDTH.MAX },
    'handle.height': { min: HANDLE_CONSTRAINTS.HEIGHT.MIN, max: HANDLE_CONSTRAINTS.HEIGHT.MAX },
    'handle.gripLines': {
      min: HANDLE_CONSTRAINTS.GRIP_LINES.MIN,
      max: HANDLE_CONSTRAINTS.GRIP_LINES.MAX,
    },

    // Value fill constraints
    'valueFill.glowIntensity': {
      min: VALUE_FILL_CONSTRAINTS.GLOW_INTENSITY.MIN,
      max: VALUE_FILL_CONSTRAINTS.GLOW_INTENSITY.MAX,
    },

    // Output constraints
    'output.frameCount': {
      min: SLIDER_OUTPUT_CONSTRAINTS.FRAME_COUNT.MIN,
      max: SLIDER_OUTPUT_CONSTRAINTS.FRAME_COUNT.MAX,
    },
    'output.frameSize': {
      min: SLIDER_OUTPUT_CONSTRAINTS.FRAME_SIZE.MIN,
      max: SLIDER_OUTPUT_CONSTRAINTS.FRAME_SIZE.MAX,
    },
  },
};
