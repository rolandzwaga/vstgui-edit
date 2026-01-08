# Research: Gradients Panel

**Feature**: 025-gradients-panel  
**Date**: 2026-01-08

## Research Questions

### 1. Gradient Data Structure in VSTGUI

**Decision**: Use existing `GradientsDefinition` type from `src/types/uidesc.ts`

**Details**:
```typescript
// From src/types/uidesc.ts (lines 58-65)
interface GradientColorStop {
  rgba: string;    // Color value (hex format)
  start: string;   // Position 0.0-1.0 as string
}

type GradientsDefinition = Record<string, GradientColorStop[]>;
```

**From JSON Schema** (`vstgui-uidesc.schema.json`):
- `gradientColorStop`: Required properties `rgba` (color at stop) and `start` (position 0.0-1.0)
- `gradientDefinition`: Array with `minItems: 2`
- Gradients stored in `vstgui-ui-description.gradients` object

**Rationale**: Existing types match the JSON schema. No type changes needed.

**Alternatives Considered**: None - types already exist and are correct.

---

### 2. Gradient Attributes in Views

**Decision**: Gradient can be referenced via the `gradient` attribute

**Details**:
Based on schema analysis and existing VSTGUI documentation:
- `gradient` - Primary attribute for gradient reference
- `gradient-angle` - Optional rotation angle
- Used by: `CGradientView` and other gradient-capable views

Reference pattern matches colors/fonts/bitmaps: value can be:
- Direct gradient name: `"MyGradient"`
- Prefixed with tilde: `"~ MyGradient"`

**Rationale**: Consistent with other resource references in VSTGUI.

---

### 3. Gradient Stop Editor UI Pattern

**Decision**: Build custom SolidJS gradient stop editor following `react-linear-gradient-picker` UX pattern

**UI Design**:
1. Horizontal gradient bar rendered as CSS `linear-gradient(to right, ...)`
2. Stop handles positioned absolutely based on `start` value (0-1 → 0%-100%)
3. Click on gradient bar → add new stop at click position with interpolated color
4. Drag stop handle horizontally → change position
5. Drag stop handle downward (off bar) → remove stop (if > 2 stops)
6. Click stop handle → select and show color picker

**Implementation**:
```typescript
// CSS for gradient bar
const gradientStyle = () => {
  const stops = sortedStops().map(s => `${s.rgba} ${parseFloat(s.start) * 100}%`);
  return `linear-gradient(to right, ${stops.join(', ')})`;
};
```

**Rationale**: No suitable SolidJS gradient picker library exists. Building custom allows full control and matches existing panel patterns.

**Alternatives Considered**:
- `react-linear-gradient-picker`: React-only, would require wrapper
- `@thednp/solid-color-picker`: Color picker only, no gradient support
- WordPress Gutenberg: React-only, too heavy

---

### 4. Color Interpolation for New Stops

**Decision**: Linear RGB interpolation between adjacent stops

**Algorithm**:
```typescript
function interpolateColor(leftColor: string, rightColor: string, ratio: number): string {
  const left = parseHexColor(leftColor);
  const right = parseHexColor(rightColor);
  
  const r = Math.round(left.r + (right.r - left.r) * ratio);
  const g = Math.round(left.g + (right.g - left.g) * ratio);
  const b = Math.round(left.b + (right.b - left.b) * ratio);
  const a = Math.round(left.a + (right.a - left.a) * ratio);
  
  return formatAsHex({ r, g, b, a });
}
```

**Rationale**: Simple, predictable, matches user expectations. VSTGUI uses linear interpolation.

**Alternatives Considered**:
- HSL interpolation: More "natural" for some colors but adds complexity
- No interpolation (use left color): Worse UX

---

### 5. Existing Panel Patterns to Follow

**Decision**: Follow `BitmapsPanel` pattern (most recent, best reference)

**Pattern Analysis**:

| Component | Pattern |
|-----------|---------|
| **Domain validation** | `validateBitmapName()` → `validateGradientName()` |
| **Domain usage** | `findBitmapUsages()` → `findGradientUsages()` |
| **History operations** | `createAddBitmapOperation()` etc. → gradient equivalents |
| **UI Panel** | `BitmapsPanel` with `CollapsibleSection` |
| **UI Item** | `BitmapItem` expandable row → `GradientItem` |
| **Store operations** | `addBitmap()`, `deleteBitmap()` etc. → gradient equivalents |

**Store Functions Needed** (add to `documentStore.ts`):
- `getGradients()` - Get all gradients
- `addGradient(name, stops)` - Add new gradient
- `updateGradientName(oldName, newName)` - Rename gradient
- `updateGradientStops(name, stops)` - Update gradient stops
- `deleteGradient(name)` - Delete and clear references

**Rationale**: Consistency with existing codebase reduces cognitive load.

---

### 6. Position Normalization (FR-023)

**Decision**: Normalize stop positions to 2 decimal places

**Implementation**:
```typescript
function normalizePosition(value: number): string {
  return Math.min(1, Math.max(0, value)).toFixed(2);
}
```

**Rationale**: Spec requirement FR-023. Prevents floating-point precision issues.

---

### 7. Gradient Reference Attributes

**Decision**: Track gradient usage via `gradient` attribute

**Attributes to Search**:
```typescript
const GRADIENT_ATTRIBUTES = ['gradient'];
```

**Rationale**: Based on VSTGUI schema. Unlike colors (9 attributes) or bitmaps (7 attributes), gradients have a single reference attribute.

---

## Implementation Notes

### Default Gradient
New gradients created with:
```typescript
const DEFAULT_GRADIENT: GradientColorStop[] = [
  { rgba: '#000000FF', start: '0.00' },
  { rgba: '#FFFFFFFF', start: '1.00' }
];
```

### Unique Name Generation
```typescript
function generateUniqueName(existing: string[]): string {
  const base = 'New Gradient';
  if (!existing.includes(base)) return base;
  
  let i = 2;
  while (existing.includes(`${base} ${i}`)) i++;
  return `${base} ${i}`;
}
```

### Stop Sorting
Stops should always be displayed sorted by position:
```typescript
const sortedStops = () => [...stops].sort((a, b) => 
  parseFloat(a.start) - parseFloat(b.start)
);
```
