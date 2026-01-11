# Research: Advanced Color Picker

**Feature**: 040-advanced-color-picker
**Date**: 2026-01-11
**Status**: Complete

## Clarified Specifications (Session 2026-01-11)

| Question | Answer | Impact |
|----------|--------|--------|
| Arrow key step size | 1% per keypress, 10% with Shift held | Keyboard navigation in gradient/sliders |
| Output format | Always 8-digit HEX (#RRGGBBAA) | All internal conversions must normalize to 8-digit hex |
| Gradient axis mapping | X=Saturation (0-100%), Y=Brightness (100% top to 0% bottom) | Standard HSB picker layout |
| Recent colors persistence | localStorage across browser sessions | Use key `vstgui-edit:recent-colors` |
| Invalid dismiss behavior | Revert to previous valid value | Capture originalValue on open |

---

## Color Conversion Algorithms

### Decision: HSB/HSV for Visual Picker, HSL for Input Mode

**Rationale**: HSB (Hue-Saturation-Brightness, also known as HSV) is the industry standard for visual color pickers because it maps intuitively to the 2D gradient picker (saturation on X-axis, brightness/value on Y-axis). The HSL input mode is provided for users who prefer that format (common in CSS workflows).

**Alternatives considered**:
- HSL-only: Rejected because HSL's lightness model doesn't map well to a 2D picker (both 0% and 100% lightness produce black/white regardless of saturation)
- LCH/LAB: Rejected due to complexity and limited user familiarity; these are more appropriate for color science applications

### RGB to HSV Conversion

**Source**: Wikipedia HSL and HSV color spaces, validated against multiple implementations.

```typescript
/**
 * Convert RGB (0-255) to HSV (H: 0-360, S: 0-100, V: 0-100)
 */
function rgbToHsv(r: number, g: number, b: number): { h: number; s: number; v: number } {
  // Normalize to 0-1
  const rNorm = r / 255;
  const gNorm = g / 255;
  const bNorm = b / 255;

  const max = Math.max(rNorm, gNorm, bNorm);
  const min = Math.min(rNorm, gNorm, bNorm);
  const delta = max - min;

  // Value is simply the max component
  const v = max * 100;

  // Saturation
  const s = max === 0 ? 0 : (delta / max) * 100;

  // Hue calculation
  let h = 0;
  if (delta !== 0) {
    if (max === rNorm) {
      h = ((gNorm - bNorm) / delta) % 6;
    } else if (max === gNorm) {
      h = (bNorm - rNorm) / delta + 2;
    } else {
      h = (rNorm - gNorm) / delta + 4;
    }
    h = Math.round(h * 60);
    if (h < 0) h += 360;
  }

  return { h, s: Math.round(s), v: Math.round(v) };
}
```

### HSV to RGB Conversion

```typescript
/**
 * Convert HSV (H: 0-360, S: 0-100, V: 0-100) to RGB (0-255)
 */
function hsvToRgb(h: number, s: number, v: number): { r: number; g: number; b: number } {
  // Normalize S and V to 0-1
  const sNorm = s / 100;
  const vNorm = v / 100;

  const c = vNorm * sNorm;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = vNorm - c;

  let rPrime = 0, gPrime = 0, bPrime = 0;

  if (h >= 0 && h < 60) {
    rPrime = c; gPrime = x; bPrime = 0;
  } else if (h >= 60 && h < 120) {
    rPrime = x; gPrime = c; bPrime = 0;
  } else if (h >= 120 && h < 180) {
    rPrime = 0; gPrime = c; bPrime = x;
  } else if (h >= 180 && h < 240) {
    rPrime = 0; gPrime = x; bPrime = c;
  } else if (h >= 240 && h < 300) {
    rPrime = x; gPrime = 0; bPrime = c;
  } else {
    rPrime = c; gPrime = 0; bPrime = x;
  }

  return {
    r: Math.round((rPrime + m) * 255),
    g: Math.round((gPrime + m) * 255),
    b: Math.round((bPrime + m) * 255),
  };
}
```

### RGB to HSL Conversion

```typescript
/**
 * Convert RGB (0-255) to HSL (H: 0-360, S: 0-100, L: 0-100)
 */
function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  const rNorm = r / 255;
  const gNorm = g / 255;
  const bNorm = b / 255;

  const max = Math.max(rNorm, gNorm, bNorm);
  const min = Math.min(rNorm, gNorm, bNorm);
  const delta = max - min;

  // Lightness
  const l = ((max + min) / 2) * 100;

  // Saturation (different formula than HSV!)
  let s = 0;
  if (delta !== 0) {
    s = (delta / (1 - Math.abs(2 * (l / 100) - 1))) * 100;
  }

  // Hue (same as HSV)
  let h = 0;
  if (delta !== 0) {
    if (max === rNorm) {
      h = ((gNorm - bNorm) / delta) % 6;
    } else if (max === gNorm) {
      h = (bNorm - rNorm) / delta + 2;
    } else {
      h = (rNorm - gNorm) / delta + 4;
    }
    h = Math.round(h * 60);
    if (h < 0) h += 360;
  }

  return { h, s: Math.round(s), l: Math.round(l) };
}
```

### HSL to RGB Conversion

```typescript
/**
 * Convert HSL (H: 0-360, S: 0-100, L: 0-100) to RGB (0-255)
 */
function hslToRgb(h: number, s: number, l: number): { r: number; g: number; b: number } {
  const sNorm = s / 100;
  const lNorm = l / 100;

  const c = (1 - Math.abs(2 * lNorm - 1)) * sNorm;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = lNorm - c / 2;

  let rPrime = 0, gPrime = 0, bPrime = 0;

  if (h >= 0 && h < 60) {
    rPrime = c; gPrime = x; bPrime = 0;
  } else if (h >= 60 && h < 120) {
    rPrime = x; gPrime = c; bPrime = 0;
  } else if (h >= 120 && h < 180) {
    rPrime = 0; gPrime = c; bPrime = x;
  } else if (h >= 180 && h < 240) {
    rPrime = 0; gPrime = x; bPrime = c;
  } else if (h >= 240 && h < 300) {
    rPrime = x; gPrime = 0; bPrime = c;
  } else {
    rPrime = c; gPrime = 0; bPrime = x;
  }

  return {
    r: Math.round((rPrime + m) * 255),
    g: Math.round((gPrime + m) * 255),
    b: Math.round((bPrime + m) * 255),
  };
}
```

## Visual Picker Design

### Decision: SVG-based Gradient with CSS

**Rationale**: Use CSS linear-gradient for the hue slider and a combination of CSS gradients for the saturation-brightness area. This is more performant than canvas for our use case and easier to maintain.

**Alternatives considered**:
- Canvas rendering: Rejected because it requires more complex event handling and doesn't benefit from CSS theming
- WebGL: Overkill for this application

### Saturation-Brightness Gradient Implementation

The SB picker uses two overlapping CSS gradients:
1. Horizontal: white (left) to pure hue color (right) - controls saturation
2. Vertical: transparent (top) to black (bottom) - controls brightness/value

```css
.gradient {
  background:
    linear-gradient(to bottom, transparent 0%, black 100%),
    linear-gradient(to right, white 0%, var(--current-hue-color) 100%);
}
```

The `--current-hue-color` CSS variable is updated via JavaScript when hue changes.

### Hue Slider Implementation

Rainbow gradient with 6 color stops at 60-degree intervals:

```css
.hueTrack {
  background: linear-gradient(
    to right,
    hsl(0, 100%, 50%),
    hsl(60, 100%, 50%),
    hsl(120, 100%, 50%),
    hsl(180, 100%, 50%),
    hsl(240, 100%, 50%),
    hsl(300, 100%, 50%),
    hsl(360, 100%, 50%)
  );
}
```

### Alpha Slider Implementation

Checkerboard pattern with color overlay:

```css
.alphaTrack {
  background-image:
    linear-gradient(to right, transparent 0%, var(--current-color) 100%),
    /* Checkerboard pattern */
    linear-gradient(45deg, var(--checkerboard-light) 25%, transparent 25%),
    linear-gradient(-45deg, var(--checkerboard-light) 25%, transparent 25%),
    linear-gradient(45deg, transparent 75%, var(--checkerboard-light) 75%),
    linear-gradient(-45deg, transparent 75%, var(--checkerboard-light) 75%);
  background-color: var(--checkerboard-dark);
}
```

## EyeDropper API

### Decision: Feature Detection with Graceful Degradation

**Rationale**: The EyeDropper API is only available in Chromium-based browsers (Chrome 95+, Edge 95+). We provide the feature when available and hide the button otherwise.

**Browser Support** (as of 2025):
- Chrome: 95+
- Edge: 95+
- Opera: 81+
- Firefox: Not supported (open issue)
- Safari: Not supported (open issue)

### Implementation

```typescript
/**
 * Check if EyeDropper API is available
 */
function isEyeDropperSupported(): boolean {
  return 'EyeDropper' in window;
}

/**
 * Open the eye dropper and return selected color
 */
async function pickColorFromScreen(): Promise<string | null> {
  if (!isEyeDropperSupported()) return null;

  try {
    const eyeDropper = new (window as any).EyeDropper();
    const result = await eyeDropper.open();
    return result.sRGBHex; // Returns #RRGGBB format
  } catch {
    // User cancelled or error occurred
    return null;
  }
}
```

**Security requirements**:
- Must be called from a user gesture (click handler)
- Must be in a secure context (HTTPS)
- Must be top-level browsing context

## Recent Colors Storage

### Decision: localStorage with 10-color Limit

**Rationale**: Match the pattern used by `saveFormatStore` for localStorage persistence. Store as JSON array of hex strings, limit to 10 most recent.

**Storage Key**: `vstgui-edit:recent-colors`

**Storage Format**:
```json
["#FF5500FF", "#2D2D2DFF", "#FFFFFFFF", ...]
```

### Implementation Pattern

Following the established pattern from `src/domain/save/formatPreference.ts`:

```typescript
const STORAGE_KEY = 'vstgui-edit:recent-colors';
const MAX_RECENT_COLORS = 10;

function getRecentColors(): string[] {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    if (!value) return [];
    const colors = JSON.parse(value);
    return Array.isArray(colors) ? colors.filter(isValidHexColor).slice(0, MAX_RECENT_COLORS) : [];
  } catch {
    return [];
  }
}

function addRecentColor(color: string): void {
  try {
    const colors = getRecentColors().filter(c => c !== color);
    colors.unshift(color);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(colors.slice(0, MAX_RECENT_COLORS)));
  } catch {
    // Silently fail
  }
}
```

## VSTGUI Predefined Colors

### Decision: Static Constant Array

**Rationale**: VSTGUI has exactly 10 predefined colors that never change. Store as a constant array.

```typescript
const VSTGUI_PREDEFINED_COLORS = [
  { name: 'BlackCColor', value: '#000000FF' },
  { name: 'WhiteCColor', value: '#FFFFFFFF' },
  { name: 'GreyCColor', value: '#808080FF' },
  { name: 'RedCColor', value: '#FF0000FF' },
  { name: 'GreenCColor', value: '#00FF00FF' },
  { name: 'BlueCColor', value: '#0000FFFF' },
  { name: 'YellowCColor', value: '#FFFF00FF' },
  { name: 'CyanCColor', value: '#00FFFFFF' },
  { name: 'MagentaCColor', value: '#FF00FFFF' },
  { name: 'TransparentCColor', value: '#00000000' },
] as const;
```

**Output format**: When selected, outputs `~ ColorName` (e.g., `~ BlackCColor`)

## Keyboard Navigation

### Decision: Standard ARIA Patterns with 1%/10% Steps

**Rationale**: Follow established ARIA practices for color pickers and sliders. Per clarification, use 1% step for normal arrow keys, 10% for Shift+Arrow.

| Element | Keys | Action |
|---------|------|--------|
| Gradient area | Arrow keys | Move selection 1% per key (1% saturation or 1% brightness) |
| Gradient area | Shift+Arrow | Move selection 10% per key |
| Hue slider | Left/Right | Decrease/increase hue by 1% (3.6 degrees) |
| Hue slider | Shift+Left/Right | Change by 10% (36 degrees) |
| Alpha slider | Left/Right | Change alpha by 1% (2.55 units, rounded to 3) |
| Alpha slider | Shift+Left/Right | Change alpha by 10% (25.5 units, rounded to 26) |
| Format tabs | Tab/Shift+Tab | Navigate between tabs |
| Swatches | Arrow keys | Navigate between swatches |
| Swatches | Enter/Space | Select swatch |

**Step Size Implementation**:
```typescript
function getStepSize(shiftHeld: boolean): number {
  return shiftHeld ? 10 : 1; // Percentage
}

// For saturation/brightness (0-100%)
function applyPercentStep(value: number, step: number): number {
  return Math.max(0, Math.min(100, value + step));
}

// For hue (0-360 degrees, 1% = 3.6 degrees)
function applyHueStep(value: number, stepPercent: number): number {
  const stepDegrees = stepPercent * 3.6;
  return (value + stepDegrees + 360) % 360;
}

// For alpha (0-255, 1% = 2.55)
function applyAlphaStep(value: number, stepPercent: number): number {
  const stepUnits = Math.round(stepPercent * 2.55);
  return Math.max(0, Math.min(255, value + stepUnits));
}
```

### ARIA Roles

- Gradient area: `role="slider"` with `aria-valuemin`, `aria-valuemax`, `aria-valuenow`
- Hue/Alpha sliders: `role="slider"`
- Format tabs: `role="tablist"` with `role="tab"` children
- Swatches: `role="listbox"` with `role="option"` children

## Component Architecture

### Decision: Composition over Configuration

**Rationale**: Break the picker into small, focused components that compose together. This improves testability and allows reuse.

```
AdvancedColorPicker (popup/inline mode)
├── ColorPickerCore (main picker logic)
│   ├── SaturationBrightnessGradient
│   ├── HueSlider
│   ├── AlphaSlider
│   ├── ColorInputs (HEX/RGB/HSL tabs)
│   ├── ColorPreview (old vs new)
│   └── EyeDropperButton
└── ColorSwatches
    ├── DocumentColors section
    ├── PredefinedColors section
    └── RecentColors section
```

### State Management

Use SolidJS signals for local component state:

```typescript
// In ColorPickerCore
const [hue, setHue] = createSignal(0);          // 0-360
const [saturation, setSaturation] = createSignal(100); // 0-100
const [brightness, setBrightness] = createSignal(100); // 0-100 (value in HSV)
const [alpha, setAlpha] = createSignal(255);    // 0-255
const [format, setFormat] = createSignal<'hex' | 'rgb' | 'hsl'>('hex');

// Derived color value
const colorValue = createMemo(() => {
  const rgb = hsvToRgb(hue(), saturation(), brightness());
  return { ...rgb, a: alpha() };
});
```

## Integration with Existing System

### Decision: Maintain ColorPickerProps Interface

**Rationale**: The existing `ColorPickerProps` interface is used by `AttributeRow`. Maintain compatibility.

```typescript
// Existing interface (keep unchanged)
interface ColorPickerProps extends EditorProps {
  documentColors: string[];
}

// New component replaces old implementation
export const ColorPicker = AdvancedColorPicker;
```

### History Integration

Color changes are committed through the existing `onCommit` prop, which is handled by `AttributeRow` and integrated with the history system via `createPropertyEditOperation`.

## References

- [HSB Color System Primer](https://www.learnui.design/blog/the-hsb-color-system-practicioners-primer.html) - HSB design principles
- [RGB/HSV/HSL Algorithms (GitHub Gist)](https://gist.github.com/mjackson/5311256) - Reference implementations
- [EyeDropper API (MDN)](https://developer.mozilla.org/en-US/docs/Web/API/EyeDropper_API) - Browser API documentation
- [WCAG Color Contrast](https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html) - Accessibility requirements
