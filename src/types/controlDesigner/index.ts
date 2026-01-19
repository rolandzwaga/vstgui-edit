/**
 * Control Designer Types Index
 *
 * Re-exports all control designer type definitions for convenient importing.
 */

// Base types (shared across all control types)
export type {
  BaseControlDesign,
  BaseOutputConfig,
  BrushDirection,
  CameraView,
  ConstraintRange,
  ControlCategory,
  ControlDesignerHistoryOperation,
  ControlPreset,
  ControlRenderer,
  ControlTypeId,
  ControlTypePlugin,
  FilmstripLayout,
  GenerationProgress,
  GenerationStage,
  LayerMaterial,
  LightingConfig,
  LinearOutputConfig,
  MaterialTarget,
  MaterialTargetKnob,
  MaterialTargetSlider,
  MaterialType,
  PanelDefinition,
  PanelProps,
  RotationalOutputConfig,
  ValidationResult,
} from './base';

// Knob-specific types
export type {
  IndicatorMaterial,
  IndicatorSize,
  IndicatorType,
  KnobDesign,
  KnobIndicator,
  KnobLayer,
  LayerGeometry,
  SkirtStyle,
} from './knob';

// Slider-specific types
export type {
  HandleShape,
  SliderDesign,
  SliderHandle,
  SliderOrientation,
  SliderTrack,
  SliderValueFill,
  ValueFillMode,
} from './slider';
