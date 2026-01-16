# Data Model: Styled View Mode

**Date**: 2026-01-17
**Feature**: 042-styled-view-mode

## Entities

### ViewMode (Type)

Enum type representing canvas rendering modes.

```typescript
/**
 * Canvas rendering mode.
 * - 'wireframe': Current behavior with category-colored outlines
 * - 'styled': Renders views with their actual uidesc colors
 */
export type ViewMode = 'wireframe' | 'styled';
```

**Validation Rules**:
- Must be one of the two literal values
- Default: 'wireframe'

### ResolvedColor (Type)

Result of resolving a color reference.

```typescript
/**
 * Result of resolving a color reference from uidesc.
 * Null if the reference cannot be resolved.
 */
export type ResolvedColor = string | null;
```

**Validation Rules**:
- When non-null, must be a valid CSS color value
- Format: `#RRGGBB`, `rgba(r, g, b, a)`, or CSS color keyword

### StyledViewProps (Interface)

Extended view properties for styled rendering.

```typescript
/**
 * Styled rendering properties resolved from uidesc view attributes.
 * Used to determine how a view should render in styled mode.
 */
export interface StyledViewProps {
  /** Resolved background color (CSS value) or null if unresolvable */
  backgroundColor: ResolvedColor;

  /** Resolved frame/border color (CSS value) or null */
  frameColor: ResolvedColor;

  /** Frame width in pixels (default 1 if not specified) */
  frameWidth: number;

  /** Whether view is transparent (no fill) */
  isTransparent: boolean;

  /** View opacity (0.0 to 1.0, default 1.0) */
  opacity: number;

  /** Whether this view should render in wireframe fallback */
  useWireframeFallback: boolean;
}
```

**Validation Rules**:
- `frameWidth`: >= 0 (0 means no frame)
- `opacity`: 0.0 to 1.0
- `useWireframeFallback`: true if no backgroundColor and not transparent

### OverlayStyle (Interface)

Adaptive overlay styling for selection/hover.

```typescript
/**
 * Overlay styling based on background luminance.
 */
export interface OverlayStyle {
  /** Fill color for overlay ('white' or 'black') */
  fillColor: string;

  /** Fill opacity (0.5 for 50%) */
  fillOpacity: number;

  /** Stroke color for border */
  strokeColor: string;
}
```

**State Transitions**:
- Light background (luminance >= 0.5) -> dark overlay (#000000)
- Dark background (luminance < 0.5) -> white overlay (#FFFFFF)

### CanvasPreferences (Interface)

Canvas-related preferences for persistence.

```typescript
/**
 * Canvas display preferences stored in localStorage.
 */
export interface CanvasPreferences {
  /** Active view rendering mode */
  viewMode: ViewMode;
}
```

**Persistence**: Part of `UserPreferences` in preferencesStore

### ViewModeState (Interface)

Reactive store state for view mode.

```typescript
/**
 * View mode store state.
 */
export interface ViewModeState {
  /** Current view mode */
  mode: ViewMode;
}
```

## Relationships

```
┌─────────────────────────────────────────────────────────────────────┐
│                        Data Flow Diagram                            │
└─────────────────────────────────────────────────────────────────────┘

┌──────────────┐     ┌────────────────┐     ┌──────────────────────┐
│ UserAction   │────▶│ viewModeStore  │────▶│ preferencesStore     │
│ (P key/click)│     │ setViewMode()  │     │ setViewModePreference│
└──────────────┘     └───────┬────────┘     └──────────┬───────────┘
                             │                          │
                             ▼                          ▼
                    ┌────────────────┐         ┌───────────────┐
                    │ Canvas         │         │ localStorage  │
                    │ Components     │         │ (persistence) │
                    └───────┬────────┘         └───────────────┘
                            │
              ┌─────────────┼─────────────┐
              ▼             ▼             ▼
┌───────────────────┐ ┌───────────┐ ┌─────────────────┐
│ ViewRectangle     │ │ Selection │ │ TemplateBounds  │
│ - resolveColors() │ │ Overlay   │ │ - background    │
│ - applyStyles()   │ │ - adaptive│ │   color         │
└───────────────────┘ └───────────┘ └─────────────────┘
```

## Color Resolution Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                    Color Resolution Algorithm                        │
└─────────────────────────────────────────────────────────────────────┘

Input: colorRef (string), documentColors (Record<string, string>)

1. If colorRef starts with '#':
   └─▶ Return normalized CSS color (convert #RRGGBBAA to rgba)

2. If colorRef starts with '~ ':
   ├─▶ Extract color name (e.g., "~ BlackCColor" -> "BlackCColor")
   ├─▶ Call getPredefinedColorHex(colorRef)
   └─▶ Return hex value or null

3. If colorRef exists in documentColors:
   ├─▶ Get value from documentColors[colorRef]
   ├─▶ Recursively resolve (max depth 10)
   └─▶ Return resolved value or null (if circular/missing)

4. Return null (unresolvable)
```

## Luminance Calculation Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                    Luminance-Based Overlay Selection                 │
└─────────────────────────────────────────────────────────────────────┘

Input: backgroundColor (CSS color string)

1. Parse color to RGB components (0-255 each)

2. Normalize to 0-1 range:
   r = R/255, g = G/255, b = B/255

3. Calculate luminance:
   L = 0.299*r + 0.587*g + 0.114*b

4. Determine overlay:
   If L >= 0.5:
     └─▶ Return dark overlay (#000000, 50% opacity)
   Else:
     └─▶ Return white overlay (#FFFFFF, 50% opacity)
```

## Store Operations

### viewModeStore

| Operation | Input | Output | Side Effects |
|-----------|-------|--------|--------------|
| `setViewMode(mode)` | ViewMode | void | Updates store, triggers preferencesStore update |
| `toggleViewMode()` | none | void | Toggles between 'wireframe' and 'styled' |
| `resetViewModeStore()` | none | void | Resets to default 'wireframe' |

### preferencesStore Extensions

| Operation | Input | Output | Side Effects |
|-----------|-------|--------|--------------|
| `setViewModePreference(mode)` | ViewMode | void | Updates preferences.canvas.viewMode, saves to localStorage |
| `applyDefaultStatesOnDocumentLoad()` | none | void | Also applies viewMode from preferences to viewModeStore |

## Component Props Extensions

### ViewRectangleProps (Extended)

```typescript
export interface ViewRectangleProps {
  view: RenderableView;
  allViews?: RenderableView[];
  // NEW: Styled mode properties
  viewMode: ViewMode;
  styledProps?: StyledViewProps;
}
```

### SelectionOverlayProps (Extended)

```typescript
export interface SelectionOverlayProps {
  view: RenderableView;
  onResizeStart?: (handle: HandlePosition, view: RenderableView) => void;
  // NEW: Adaptive overlay styling
  viewMode: ViewMode;
  overlayStyle?: OverlayStyle;
}
```

### TemplateBoundsProps (Extended)

```typescript
export interface TemplateBoundsProps {
  width: number;
  height: number;
  // NEW: Template background in styled mode
  viewMode: ViewMode;
  backgroundColor?: ResolvedColor;
}
```

## CSS Token Extensions

New CSS custom properties for styled mode:

```css
:root {
  /* Styled Mode Overlay Colors */
  --color-styled-overlay-light: rgba(0, 0, 0, 0.5);
  --color-styled-overlay-dark: rgba(255, 255, 255, 0.5);

  /* Styled Mode Fallback (wireframe in styled mode) */
  --color-styled-fallback-stroke: var(--color-neutral-400);
}

[data-theme="dark"] {
  --color-styled-overlay-light: rgba(0, 0, 0, 0.6);
  --color-styled-overlay-dark: rgba(255, 255, 255, 0.6);
  --color-styled-fallback-stroke: var(--color-neutral-500);
}
```

