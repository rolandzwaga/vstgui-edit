# Quickstart: Advanced Color Picker Implementation

**Feature**: 040-advanced-color-picker
**Date**: 2026-01-11

## Overview

This guide provides the implementation roadmap for the Advanced Color Picker component. Follow the phases in order, completing all tests before moving to the next phase.

## Prerequisites

1. Read `specs/TESTING-GUIDE.md` for SolidJS testing patterns
2. Verify branch: `git branch --show-current` should show `040-advanced-color-picker`
3. Review existing code:
   - `src/components/editors/ColorPicker.tsx` (current implementation to replace)
   - `src/domain/colors/parsing.ts` (color utilities to reuse)
   - `src/components/common/FloatingDropdown/` (popup positioning)

## Implementation Phases

### Phase 1: Domain Logic (No UI)

**Goal**: Pure functions for color conversion and validation.

#### 1.1 Color Conversion (`src/domain/colorPicker/colorConversion.ts`)

```typescript
// Test file: src/domain/colorPicker/__tests__/colorConversion.spec.ts

// Functions to implement:
export function rgbToHsv(r: number, g: number, b: number): { h: number; s: number; v: number };
export function hsvToRgb(h: number, s: number, v: number): { r: number; g: number; b: number };
export function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number };
export function hslToRgb(h: number, s: number, l: number): { r: number; g: number; b: number };
export function parseHexToColorValue(hex: string): ColorValue | null;
export function colorValueToHex(color: ColorValue): string; // Always 8-digit
export function createColorValue(r: number, g: number, b: number, a: number): ColorValue;
```

**Test Cases**:
- RGB to HSV round-trip (known color values)
- RGB to HSL round-trip
- Parse 6-digit hex (adds FF alpha)
- Parse 8-digit hex
- Format to 8-digit hex (always uppercase)
- Edge cases: black, white, grayscale, transparent

#### 1.2 Color Validation (`src/domain/colorPicker/colorValidation.ts`)

```typescript
// Test file: src/domain/colorPicker/__tests__/colorValidation.spec.ts

export function validateHexInput(value: string): ValidationResult;
export function validateRgbInput(r: number, g: number, b: number, a: number): ValidationResult;
export function validateHslInput(h: number, s: number, l: number, a: number): ValidationResult;
```

**Test Cases**:
- Valid 6-digit hex
- Valid 8-digit hex
- Auto-add # prefix
- Invalid characters
- RGB range validation (0-255)
- HSL range validation (H: 0-360, S/L: 0-100)

#### 1.3 Recent Colors (`src/domain/colorPicker/recentColors.ts`)

```typescript
// Test file: src/domain/colorPicker/__tests__/recentColors.spec.ts

export function getRecentColors(): string[];
export function addRecentColor(hex: string): void;
export function clearRecentColors(): void;
```

**Test Cases**:
- Empty storage returns []
- Add color to empty list
- Add duplicate moves to front
- Max 10 colors (oldest removed)
- Invalid JSON returns []
- Storage unavailable graceful degradation

### Phase 2: Sub-Components (Individual UI pieces)

**Goal**: Build and test each sub-component in isolation.

#### 2.1 GradientArea (`src/components/editors/ColorPicker/GradientArea.tsx`)

**Behavior**:
- Displays saturation (X) / brightness (Y) gradient
- Updates CSS variable `--current-hue-color` based on hue prop
- Click sets position immediately
- Drag updates continuously
- Arrow keys: 1% step, Shift+Arrow: 10% step

**Test Cases**:
- Renders gradient with correct hue color
- Click at top-left gives S=0, B=100
- Click at bottom-right gives S=100, B=0
- Keyboard navigation with step sizes
- onCommit called on mouseup
- Disabled state prevents interaction

#### 2.2 HueSlider (`src/components/editors/ColorPicker/HueSlider.tsx`)

**Behavior**:
- Rainbow gradient track (0-360)
- Draggable handle
- Arrow keys: 1% (3.6 degrees), Shift: 10% (36 degrees)

**Test Cases**:
- Renders rainbow gradient
- Click sets hue to position
- Drag updates hue
- Keyboard navigation
- onCommit on mouseup

#### 2.3 AlphaSlider (`src/components/editors/ColorPicker/AlphaSlider.tsx`)

**Behavior**:
- Checkerboard background with color-to-transparent gradient
- Handle shows current alpha
- Arrow keys: 1% (~3 units), Shift: 10% (~26 units)

**Test Cases**:
- Renders checkerboard pattern
- Shows correct color gradient
- Keyboard navigation with alpha steps

#### 2.4 ColorInputs (`src/components/editors/ColorPicker/ColorInputs.tsx`)

**Behavior**:
- Three tabs: HEX, RGB, HSL
- HEX: Single text input
- RGB: Four number inputs (R, G, B, A 0-255)
- HSL: Four number inputs (H 0-360, S/L/A 0-100%)
- Live validation with error display

**Test Cases**:
- Tab switching
- HEX input validation and normalization
- RGB field validation
- HSL field validation
- Error display on invalid input

#### 2.5 ColorSwatches (`src/components/editors/ColorPicker/ColorSwatches.tsx`)

**Behavior**:
- Three sections: Document Colors, Predefined, Recent
- Click swatch to select
- Document colors output name, predefined output "~ Name"
- Keyboard: Arrow navigate, Enter/Space select

**Test Cases**:
- Renders document colors when available
- Renders predefined colors
- Renders recent colors
- Click calls onSelect with correct source
- Keyboard navigation

#### 2.6 ColorPreview (`src/components/editors/ColorPicker/ColorPreview.tsx`)

**Behavior**:
- Shows old color and new color side by side
- Checkerboard for transparency
- Click old color to revert (optional)

**Test Cases**:
- Renders both colors
- Shows checkerboard for transparent colors
- Revert click handler

#### 2.7 EyeDropperButton (`src/components/editors/ColorPicker/EyeDropperButton.tsx`)

**Behavior**:
- Hidden if API unavailable
- Opens native eyedropper
- Returns picked color (6-digit, needs alpha added)

**Test Cases**:
- Not rendered when API unavailable
- Calls onColorPick with hex
- Handles cancellation gracefully

### Phase 3: Integration (Main Component)

**Goal**: Compose sub-components into the main picker.

#### 3.1 ColorPickerCore

Internal component that composes all sub-components.

**State Management**:
```typescript
const [color, setColor] = createSignal<ColorValue>(initialColor);
const [format, setFormat] = createSignal<ColorFormat>('hex');
const [isDragging, setIsDragging] = createSignal(false);

// Derived hex output (always 8-digit)
const hexOutput = createMemo(() => colorValueToHex(color()));
```

#### 3.2 ColorPickerPopup

Wraps core with FloatingDropdown for Properties Panel.

**Behavior**:
- Trigger button shows swatch + value text
- Click opens dropdown
- Escape/click-outside closes and commits (if valid) or reverts (if invalid)

#### 3.3 ColorPickerInline

Wraps core for inline display in Colors Panel.

**Behavior**:
- Renders full picker without popup
- Escape commits and collapses

#### 3.4 Main ColorPicker Export

```typescript
// Maintains existing ColorPickerProps interface
export const ColorPicker: Component<ColorPickerProps> = (props) => {
  return props.mode === 'inline' 
    ? <ColorPickerInline {...props} />
    : <ColorPickerPopup {...props} />;
};
```

### Phase 4: Integration Tests

**Goal**: Test full user workflows.

**Test Cases**:
1. Visual color selection workflow
2. HEX input workflow
3. RGB input with format conversion
4. Document color selection
5. Recent colors persistence
6. Eyedropper workflow (mock API)
7. Invalid dismiss reverts to original
8. Undo/redo integration

## File Checklist

Domain:
- [ ] `src/domain/colorPicker/index.ts`
- [ ] `src/domain/colorPicker/colorConversion.ts`
- [ ] `src/domain/colorPicker/__tests__/colorConversion.spec.ts`
- [ ] `src/domain/colorPicker/colorValidation.ts`
- [ ] `src/domain/colorPicker/__tests__/colorValidation.spec.ts`
- [ ] `src/domain/colorPicker/recentColors.ts`
- [ ] `src/domain/colorPicker/__tests__/recentColors.spec.ts`
- [ ] `src/domain/colorPicker/predefinedColors.ts`

Types:
- [ ] `src/types/colorPicker.ts`

Components:
- [ ] `src/components/editors/ColorPicker/GradientArea.tsx`
- [ ] `src/components/editors/ColorPicker/__tests__/GradientArea.spec.tsx`
- [ ] `src/components/editors/ColorPicker/HueSlider.tsx`
- [ ] `src/components/editors/ColorPicker/__tests__/HueSlider.spec.tsx`
- [ ] `src/components/editors/ColorPicker/AlphaSlider.tsx`
- [ ] `src/components/editors/ColorPicker/__tests__/AlphaSlider.spec.tsx`
- [ ] `src/components/editors/ColorPicker/ColorInputs.tsx`
- [ ] `src/components/editors/ColorPicker/__tests__/ColorInputs.spec.tsx`
- [ ] `src/components/editors/ColorPicker/ColorSwatches.tsx`
- [ ] `src/components/editors/ColorPicker/__tests__/ColorSwatches.spec.tsx`
- [ ] `src/components/editors/ColorPicker/ColorPreview.tsx`
- [ ] `src/components/editors/ColorPicker/__tests__/ColorPreview.spec.tsx`
- [ ] `src/components/editors/ColorPicker/EyeDropperButton.tsx`
- [ ] `src/components/editors/ColorPicker/__tests__/EyeDropperButton.spec.tsx`
- [ ] `src/components/editors/ColorPicker/ColorPicker.tsx`
- [ ] `src/components/editors/ColorPicker/__tests__/ColorPicker.spec.tsx`
- [ ] `src/components/editors/ColorPicker/ColorPicker.module.css`

## Key Implementation Details

### Output Format (CRITICAL)

Every color selection MUST output 8-digit HEX:
```typescript
// Always output #RRGGBBAA
function getOutputValue(color: ColorValue, source: ColorSource, name?: string): string {
  // Document/predefined colors preserve their reference
  if (source === 'document-color' && name) return name;
  if (source === 'predefined-color' && name) return `~ ${name}`;
  
  // Everything else outputs 8-digit hex
  return colorValueToHex(color); // e.g., "#FF5500FF"
}
```

### Keyboard Step Sizes

```typescript
const STEP_NORMAL = 1;  // 1%
const STEP_SHIFT = 10;  // 10%

function handleKeyDown(e: KeyboardEvent, value: number, max: number, onChange: (v: number) => void) {
  const step = e.shiftKey ? STEP_SHIFT : STEP_NORMAL;
  const percent = value / max * 100;
  
  switch (e.key) {
    case 'ArrowRight':
    case 'ArrowUp':
      onChange(Math.min(max, (percent + step) / 100 * max));
      break;
    case 'ArrowLeft':
    case 'ArrowDown':
      onChange(Math.max(0, (percent - step) / 100 * max));
      break;
  }
}
```

### Invalid Dismiss Handling

```typescript
const [originalValue] = createSignal(props.value); // Capture on mount

function handleClose() {
  const validation = validateCurrentValue();
  if (!validation.valid) {
    // Revert to original
    props.onChange(originalValue());
    props.onCancel();
  } else {
    props.onCommit();
  }
  setIsOpen(false);
}
```

## Quality Checklist

Before completing each phase:

1. [ ] All tests pass: `npm test`
2. [ ] Types check: `npm run typecheck`
3. [ ] Lint passes: `npm run check`
4. [ ] CSS lint passes: `npm run lint:css`
5. [ ] Coverage >= 80% for new code

## Notes

- Reuse `ColorSwatch` from `src/components/ColorsPanel/ColorSwatch.tsx`
- Reuse `FloatingDropdown` for popup mode
- Follow existing editor patterns from `src/components/editors/`
- Check `specs/TESTING-GUIDE.md` for SolidJS testing patterns
