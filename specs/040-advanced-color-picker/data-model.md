# Data Model: Advanced Color Picker

## Core Types

### ColorValue

Represents a color with all its component values for bidirectional conversion.

```typescript
/**
 * Complete color representation with all format values.
 * Used as the internal state of the color picker.
 */
export interface ColorValue {
  // RGB components (0-255)
  r: number;
  g: number;
  b: number;
  a: number;  // Alpha (0-255)

  // HSV/HSB components (derived)
  h: number;  // Hue (0-360)
  s: number;  // Saturation (0-100)
  v: number;  // Value/Brightness (0-100)

  // HSL components (derived, for HSL input mode)
  hslS: number;  // HSL Saturation (0-100) - different formula than HSV
  l: number;     // Lightness (0-100)
}
```

### ColorFormat

Input/display format selection.

```typescript
/**
 * Available input format modes.
 */
export type ColorFormat = 'hex' | 'rgb' | 'hsl';
```

### ColorSource

Tracks the origin of a color selection for analytics/UX.

```typescript
/**
 * Origin of the color value for tracking selection method.
 */
export type ColorSource =
  | 'hex-input'        // Typed in hex field
  | 'rgb-input'        // Typed in RGB fields
  | 'hsl-input'        // Typed in HSL fields
  | 'visual-picker'    // Selected via gradient/sliders
  | 'document-color'   // Selected from document colors
  | 'predefined-color' // Selected from VSTGUI predefined colors
  | 'recent-color'     // Selected from recent colors
  | 'eyedropper';      // Picked from screen
```

### PickerMode

Display mode for the picker component.

```typescript
/**
 * How the picker is displayed.
 */
export type PickerMode = 'popup' | 'inline';
```

### PredefinedColor

VSTGUI system color definition.

```typescript
/**
 * VSTGUI predefined color with name and hex value.
 */
export interface PredefinedColor {
  name: string;       // e.g., 'BlackCColor'
  value: string;      // e.g., '#000000FF'
  displayName: string; // e.g., 'Black'
}
```

## Component Props

### AdvancedColorPickerProps

Main component props (extends existing EditorProps).

```typescript
import type { EditorProps } from '../../types/editors';

/**
 * Props for the AdvancedColorPicker component.
 * Maintains compatibility with existing ColorPickerProps.
 */
export interface AdvancedColorPickerProps extends EditorProps {
  /** Available color names from document colors */
  documentColors: string[];

  /** Display mode: popup (default) or inline */
  mode?: PickerMode;

  /** Resolved hex values for document colors (optional, for swatch preview) */
  documentColorValues?: Record<string, string>;
}
```

### ColorPickerCoreProps

Internal core picker component props.

```typescript
/**
 * Props for the core picker component (gradient, sliders, inputs).
 */
export interface ColorPickerCoreProps {
  /** Current color value */
  value: ColorValue;

  /** Original color for comparison preview */
  originalValue: ColorValue;

  /** Called when color changes (continuous during drag) */
  onChange: (value: ColorValue, source: ColorSource) => void;

  /** Called when editing is complete (commit to history) */
  onCommit: () => void;

  /** Document colors for swatches */
  documentColors: string[];

  /** Resolved document color values */
  documentColorValues?: Record<string, string>;
}
```

### Slider Props

Common props for hue and alpha sliders.

```typescript
/**
 * Props for slider components.
 */
export interface SliderProps {
  /** Current value */
  value: number;

  /** Minimum value */
  min: number;

  /** Maximum value */
  max: number;

  /** Value change handler */
  onChange: (value: number) => void;

  /** Commit handler (drag end) */
  onCommit: () => void;

  /** Accessible label */
  ariaLabel: string;

  /** Disabled state */
  disabled?: boolean;
}

/**
 * Props for the hue slider (extends SliderProps).
 */
export interface HueSliderProps extends SliderProps {
  // min: 0, max: 360 (implicit)
}

/**
 * Props for the alpha slider (extends SliderProps).
 */
export interface AlphaSliderProps extends SliderProps {
  /** Current color (without alpha) for gradient preview */
  color: { r: number; g: number; b: number };
  // min: 0, max: 255 (implicit)
}
```

### Gradient Props

```typescript
/**
 * Props for the saturation-brightness gradient picker.
 */
export interface SaturationBrightnessGradientProps {
  /** Current hue (0-360) */
  hue: number;

  /** Current saturation (0-100) */
  saturation: number;

  /** Current brightness/value (0-100) */
  brightness: number;

  /** Saturation change handler */
  onSaturationChange: (value: number) => void;

  /** Brightness change handler */
  onBrightnessChange: (value: number) => void;

  /** Commit handler (drag end) */
  onCommit: () => void;

  /** Disabled state */
  disabled?: boolean;
}
```

### Input Props

```typescript
/**
 * Props for the color input component (HEX/RGB/HSL tabs).
 */
export interface ColorInputsProps {
  /** Current color value */
  value: ColorValue;

  /** Active format tab */
  format: ColorFormat;

  /** Format change handler */
  onFormatChange: (format: ColorFormat) => void;

  /** Color value change handler */
  onChange: (value: ColorValue, source: ColorSource) => void;

  /** Commit handler */
  onCommit: () => void;

  /** Disabled state */
  disabled?: boolean;
}
```

### Swatch Props

```typescript
/**
 * Props for the color swatches component.
 */
export interface ColorSwatchesProps {
  /** Document color names */
  documentColors: string[];

  /** Resolved document color hex values */
  documentColorValues?: Record<string, string>;

  /** Currently selected color (for highlighting) */
  selectedColor: string | null;

  /** Color selection handler */
  onSelect: (color: string, source: ColorSource) => void;

  /** Show recent colors section */
  showRecent?: boolean;

  /** Show predefined colors section */
  showPredefined?: boolean;
}
```

### Preview Props

```typescript
/**
 * Props for the color preview component.
 */
export interface ColorPreviewProps {
  /** Original/old color */
  original: ColorValue;

  /** Current/new color */
  current: ColorValue;

  /** Click on original color to revert */
  onRevert?: () => void;
}
```

### EyeDropper Props

```typescript
/**
 * Props for the eye dropper button.
 */
export interface EyeDropperButtonProps {
  /** Called when a color is picked */
  onColorPick: (hexColor: string) => void;

  /** Disabled state */
  disabled?: boolean;
}
```

## Validation Types

### ColorValidationResult

```typescript
/**
 * Result of validating a color input.
 */
export interface ColorValidationResult {
  /** Whether the input is valid */
  valid: boolean;

  /** Error message if invalid */
  error?: string;

  /** Parsed ColorValue if valid */
  value?: ColorValue;

  /** Normalized output string (e.g., uppercase hex) */
  normalizedOutput?: string;
}
```

## State Types

### PickerState

Internal state for the picker component.

```typescript
/**
 * Internal picker state managed via signals.
 */
export interface PickerState {
  /** Current color value */
  color: ColorValue;

  /** Original color (captured at open) */
  originalColor: ColorValue;

  /** Active input format */
  format: ColorFormat;

  /** Whether currently dragging (gradient or slider) */
  isDragging: boolean;

  /** Validation error message */
  error: string | null;

  /** Dropdown open state (popup mode only) */
  isOpen: boolean;
}
```

## Constants

```typescript
/**
 * VSTGUI predefined colors.
 */
export const VSTGUI_PREDEFINED_COLORS: readonly PredefinedColor[] = [
  { name: 'BlackCColor', value: '#000000FF', displayName: 'Black' },
  { name: 'WhiteCColor', value: '#FFFFFFFF', displayName: 'White' },
  { name: 'GreyCColor', value: '#808080FF', displayName: 'Grey' },
  { name: 'RedCColor', value: '#FF0000FF', displayName: 'Red' },
  { name: 'GreenCColor', value: '#00FF00FF', displayName: 'Green' },
  { name: 'BlueCColor', value: '#0000FFFF', displayName: 'Blue' },
  { name: 'YellowCColor', value: '#FFFF00FF', displayName: 'Yellow' },
  { name: 'CyanCColor', value: '#00FFFFFF', displayName: 'Cyan' },
  { name: 'MagentaCColor', value: '#FF00FFFF', displayName: 'Magenta' },
  { name: 'TransparentCColor', value: '#00000000', displayName: 'Transparent' },
] as const;

/**
 * Maximum number of recent colors to store.
 */
export const MAX_RECENT_COLORS = 10;

/**
 * localStorage key for recent colors.
 */
export const RECENT_COLORS_STORAGE_KEY = 'vstgui-edit:recent-colors';

/**
 * Default picker dimensions.
 */
export const PICKER_DIMENSIONS = {
  gradientWidth: 200,
  gradientHeight: 150,
  sliderHeight: 12,
  swatchSize: 24,
} as const;
```

## Entity Relationships

```
┌─────────────────────────────────────────────────────────────────────┐
│                     AdvancedColorPicker                              │
│  ┌─────────────────────────────────────────────────────────────┐    │
│  │ mode: 'popup' | 'inline'                                    │    │
│  │ value: string (hex or color name)                           │    │
│  │ documentColors: string[]                                     │    │
│  └────────────────────────────┬────────────────────────────────┘    │
│                               │                                      │
│  ┌────────────────────────────▼────────────────────────────────┐    │
│  │                     ColorPickerCore                          │    │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │    │
│  │  │ ColorValue   │  │ ColorFormat  │  │ isDragging   │       │    │
│  │  │ (signals)    │  │ (signal)     │  │ (signal)     │       │    │
│  │  └──────┬───────┘  └──────────────┘  └──────────────┘       │    │
│  │         │                                                     │    │
│  │  ┌──────▼──────────────────────────────────────────────┐     │    │
│  │  │ Conversion Functions                                 │     │    │
│  │  │ rgbToHsv ◄──► hsvToRgb                              │     │    │
│  │  │ rgbToHsl ◄──► hslToRgb                              │     │    │
│  │  │ parseHex ◄──► formatHex                             │     │    │
│  │  └─────────────────────────────────────────────────────┘     │    │
│  └──────────────────────────────────────────────────────────────┘    │
│                                                                       │
│  ┌────────────────────────────────────────────────────────────────┐  │
│  │                        Sub-Components                           │  │
│  │  ┌────────────────┐ ┌────────────┐ ┌─────────────┐             │  │
│  │  │ SatBright      │ │ HueSlider  │ │ AlphaSlider │             │  │
│  │  │ Gradient       │ │            │ │             │             │  │
│  │  └────────────────┘ └────────────┘ └─────────────┘             │  │
│  │  ┌────────────────┐ ┌────────────┐ ┌─────────────┐             │  │
│  │  │ ColorInputs    │ │ ColorPreview│ │ EyeDropper │             │  │
│  │  │ (HEX/RGB/HSL)  │ │ (old/new)  │ │ Button     │             │  │
│  │  └────────────────┘ └────────────┘ └─────────────┘             │  │
│  │  ┌─────────────────────────────────────────────────┐           │  │
│  │  │ ColorSwatches                                    │           │  │
│  │  │ ├─ DocumentColors                               │           │  │
│  │  │ ├─ PredefinedColors                             │           │  │
│  │  │ └─ RecentColors                                 │           │  │
│  │  └─────────────────────────────────────────────────┘           │  │
│  └────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘

External Integration:
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│ localStorage    │     │ documentStore   │     │ historyStore    │
│ (recentColors)  │     │ (colors dict)   │     │ (undo/redo)     │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

## Validation Rules

### Hex Input

- Must start with `#` (auto-added if missing)
- 6 digits: `#RRGGBB` (alpha defaults to FF)
- 8 digits: `#RRGGBBAA`
- Case insensitive (normalized to uppercase)

### RGB Input

- R, G, B: Integer 0-255
- A: Integer 0-255 (or 0-100%)

### HSL Input

- H: Integer 0-360 (degrees)
- S: Integer 0-100 (%)
- L: Integer 0-100 (%)
- A: Integer 0-100 (%)

### Document Color Reference

- Must exist in `documentColors` array
- Output as color name (not resolved hex)

### Predefined Color Reference

- Must be one of the 10 VSTGUI colors
- Output as `~ ColorName` format
