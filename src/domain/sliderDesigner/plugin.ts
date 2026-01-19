/**
 * Slider Designer Plugin
 *
 * Plugin definition for the slider control type.
 * Implements the ControlTypePlugin interface to register with the plugin system.
 */

import type { Component } from 'solid-js';
import type {
  BaseControlDesign,
  ControlRenderer,
  ControlTypePlugin,
  GenerationProgress,
  GenerationStage,
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
// Stub Renderer (until proper 3D rendering is implemented)
// ============================================================================

/**
 * Stub slider renderer that provides basic functionality until
 * the full 3D rendering is implemented in Phase 5.
 */
class StubSliderRenderer implements ControlRenderer {
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private design: SliderDesign | null = null;
  private position = 0.5;

  async initialize(canvas: HTMLCanvasElement): Promise<void> {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
  }

  updateScene(design: BaseControlDesign): void {
    this.design = design as SliderDesign;
    this.renderPreview();
  }

  setPosition(position: number): void {
    this.position = Math.max(0, Math.min(1, position));
  }

  renderPreview(): void {
    if (!this.canvas || !this.ctx || !this.design) return;

    const { width, height } = this.canvas;
    const ctx = this.ctx;
    const design = this.design;

    // Clear canvas
    ctx.fillStyle = '#2a2a2a';
    ctx.fillRect(0, 0, width, height);

    // Calculate track dimensions
    const isVertical = design.track.orientation === 'vertical';
    const trackLength = (isVertical ? height : width) * (design.track.length / 100);
    const trackWidth = (isVertical ? width : height) * (design.track.width / 100);

    const trackX = isVertical ? (width - trackWidth) / 2 : (width - trackLength) / 2;
    const trackY = isVertical ? (height - trackLength) / 2 : (height - trackWidth) / 2;
    const trackW = isVertical ? trackWidth : trackLength;
    const trackH = isVertical ? trackLength : trackWidth;

    // Draw track
    ctx.fillStyle = design.track.material.color.slice(0, 7);
    ctx.fillRect(trackX, trackY, trackW, trackH);

    // Draw track border
    ctx.strokeStyle = '#555';
    ctx.lineWidth = 1;
    ctx.strokeRect(trackX, trackY, trackW, trackH);

    // Calculate handle position
    const handleWidth = trackWidth * (design.handle.width / 100);
    const handleHeight = trackWidth * (design.handle.height / 100);

    let handleX: number;
    let handleY: number;

    if (isVertical) {
      handleX = (width - handleWidth) / 2;
      const handleTravel = trackLength - handleHeight;
      handleY = trackY + handleTravel * (1 - this.position);
    } else {
      const handleTravel = trackLength - handleWidth;
      handleX = trackX + handleTravel * this.position;
      handleY = (height - handleHeight) / 2;
    }

    // Draw value fill
    if (design.valueFill.mode !== 'none') {
      ctx.fillStyle = design.valueFill.color.slice(0, 7);
      ctx.globalAlpha = 0.6;

      if (isVertical) {
        const fillHeight = trackLength * this.position;
        ctx.fillRect(trackX, trackY + trackLength - fillHeight, trackW, fillHeight);
      } else {
        const fillWidth = trackLength * this.position;
        ctx.fillRect(trackX, trackY, fillWidth, trackH);
      }

      ctx.globalAlpha = 1;
    }

    // Draw handle
    ctx.fillStyle = design.handle.material.color.slice(0, 7);

    if (design.handle.shape === 'circle') {
      const radius = Math.min(handleWidth, handleHeight) / 2;
      ctx.beginPath();
      ctx.arc(handleX + handleWidth / 2, handleY + handleHeight / 2, radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#888';
      ctx.stroke();
    } else {
      const radius = design.handle.shape === 'rectangle' ? 0 : 4;
      ctx.beginPath();
      ctx.roundRect(handleX, handleY, handleWidth, handleHeight, radius);
      ctx.fill();
      ctx.strokeStyle = '#888';
      ctx.stroke();
    }

    // Draw grip lines
    if (design.handle.gripLines > 0) {
      ctx.strokeStyle = '#666';
      ctx.lineWidth = 1;
      const lineSpacing = (isVertical ? handleHeight : handleWidth) / (design.handle.gripLines + 1);

      for (let i = 1; i <= design.handle.gripLines; i++) {
        if (isVertical) {
          const y = handleY + lineSpacing * i;
          ctx.beginPath();
          ctx.moveTo(handleX + 4, y);
          ctx.lineTo(handleX + handleWidth - 4, y);
          ctx.stroke();
        } else {
          const x = handleX + lineSpacing * i;
          ctx.beginPath();
          ctx.moveTo(x, handleY + 4);
          ctx.lineTo(x, handleY + handleHeight - 4);
          ctx.stroke();
        }
      }
    }

    // Draw "STUB" label
    ctx.fillStyle = '#666';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('2D Preview (3D Coming Soon)', width / 2, height - 10);
  }

  resize(width: number, height: number): void {
    if (this.canvas) {
      this.canvas.width = width;
      this.canvas.height = height;
      this.renderPreview();
    }
  }

  async generateFilmstrip(
    design: BaseControlDesign,
    onProgress: (progress: GenerationProgress) => void
  ): Promise<string> {
    const sliderDesign = design as SliderDesign;
    const { frameCount, frameWidth, frameHeight, layout } = sliderDesign.output;

    // Calculate filmstrip dimensions
    let cols: number;
    let rows: number;

    if (layout === 'vertical') {
      cols = 1;
      rows = frameCount;
    } else if (layout === 'horizontal') {
      cols = frameCount;
      rows = 1;
    } else {
      cols = Math.ceil(Math.sqrt(frameCount));
      rows = Math.ceil(frameCount / cols);
    }

    const totalWidth = frameWidth * cols;
    const totalHeight = frameHeight * rows;

    // Create filmstrip canvas
    const filmstrip = document.createElement('canvas');
    filmstrip.width = totalWidth;
    filmstrip.height = totalHeight;
    const fsCtx = filmstrip.getContext('2d')!;

    // Create frame canvas
    const frameCanvas = document.createElement('canvas');
    frameCanvas.width = frameWidth;
    frameCanvas.height = frameHeight;

    // Initialize stub renderer for frame rendering
    const frameRenderer = new StubSliderRenderer();
    await frameRenderer.initialize(frameCanvas);

    // Render each frame
    for (let i = 0; i < frameCount; i++) {
      const position = frameCount > 1 ? i / (frameCount - 1) : 0;
      frameRenderer.setPosition(position);
      frameRenderer.updateScene(sliderDesign);

      // Calculate frame position in filmstrip
      const col = layout === 'vertical' ? 0 : i % cols;
      const row = layout === 'horizontal' ? 0 : Math.floor(i / cols);
      const x = col * frameWidth;
      const y = row * frameHeight;

      // Copy frame to filmstrip
      fsCtx.drawImage(frameCanvas, x, y);

      // Report progress
      const stage: GenerationStage = 'rendering';
      onProgress({
        stage,
        percent: Math.round(((i + 1) / frameCount) * 100),
        currentFrame: i,
        totalFrames: frameCount,
      });
    }

    const completeStage: GenerationStage = 'complete';
    onProgress({
      stage: completeStage,
      percent: 100,
      currentFrame: frameCount,
      totalFrames: frameCount,
    });

    return filmstrip.toDataURL('image/png');
  }

  dispose(): void {
    this.canvas = null;
    this.ctx = null;
    this.design = null;
  }
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

  createRenderer: (): ControlRenderer => {
    return new StubSliderRenderer();
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
