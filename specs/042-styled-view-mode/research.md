# Research: Styled View Mode

**Date**: 2026-01-17
**Feature**: 042-styled-view-mode

## Research Tasks

### 1. Color Reference Resolution

**Question**: How should color references be resolved in the uidesc format?

**Findings**:

The uidesc format supports three types of color values:

1. **Direct Hex Colors**: `#RRGGBBAA` (8-digit) or `#RRGGBB` (6-digit)
   - Example: `"background-color": "#2d2d2dff"`
   - 8-digit format includes alpha channel
   - VSTGUI uses RGBA order (not ARGB)

2. **Document Color References**: Plain name referencing the colors section
   - Example: `"background-color": "background"` references `colors.background`
   - Must be resolved recursively (a color can reference another color)
   - Handle circular references by limiting resolution depth (max 10 levels)

3. **Predefined Color References**: Names prefixed with `~ `
   - Example: `"background-color": "~ BlackCColor"`
   - 10 predefined VSTGUI colors exist in `src/domain/colorPicker/predefinedColors.ts`
   - Already have `getPredefinedColorHex()` function for resolution

**Decision**: Create a unified `resolveColor()` function that:
1. First checks for hex format (`#...`)
2. Then checks for predefined color (`~ ...`)
3. Then checks document colors with recursive resolution
4. Returns `null` if unresolvable

**Rationale**: Existing `resolveColor()` in `flattenHierarchy.ts` already handles this pattern. Refactor into reusable domain function.

**Alternatives Considered**:
- Inline resolution in ViewRectangle - rejected due to code duplication
- Caching resolved colors - not needed, document colors map is small (<100)

### 2. Luminance Calculation for Adaptive Overlays

**Question**: How should background luminance be calculated to determine overlay color?

**Findings**:

The spec requires luminance calculation using the standard formula:
```
L = 0.299*R + 0.587*G + 0.114*B
```

Where R, G, B are normalized to 0-1 range.

**Decision**: Create `calculateLuminance()` function:
- Input: hex color string (#RRGGBB or #RRGGBBAA)
- Output: luminance value 0.0 to 1.0
- Threshold: 0.5 (as specified in clarifications)
- If luminance >= 0.5: use dark overlay (#000000 at 50% opacity)
- If luminance < 0.5: use white overlay (#FFFFFF at 50% opacity)

**Rationale**: Standard W3C luminance formula provides perceptually correct brightness measurement.

**Alternatives Considered**:
- Using HSL lightness - rejected, not perceptually accurate
- Using simple RGB average - rejected, doesn't account for human perception

### 3. Existing Patterns for Toggle Buttons

**Question**: What is the existing pattern for toolbar toggle buttons?

**Findings**:

From `GridToolbar.tsx` (lines 40-53):
```tsx
<button
  type="button"
  class={styles.button}
  classList={{
    [styles.buttonActive]: gridStore.isVisible,
  }}
  onClick={() => toggleVisibility()}
  aria-label="Toggle grid visibility"
  aria-pressed={gridStore.isVisible}
  title="Toggle Grid (G)"
>
  #
</button>
```

Pattern elements:
- `classList` with conditional `buttonActive` class
- `aria-pressed` for accessibility
- `title` with shortcut hint
- `aria-label` for screen readers

**Decision**: Follow exact same pattern for view mode toggle button.

**Rationale**: Consistency with existing codebase.

### 4. Preferences System Integration

**Question**: How should the view mode preference be integrated with the existing preferencesStore?

**Findings**:

From `src/domain/preferences/types.ts`:
- `UserPreferences` interface contains nested preference groups
- Existing groups: `grid`, `snap`, `smartGuides`, `customGuides`, `theme`, `ui`, `save`
- Each group has its own interface

From `src/stores/preferencesStore.ts`:
- Each preference has a setter function (e.g., `setThemeModePreference`)
- Setters update store and call `saveCurrentPreferences()`
- Preferences loaded on init via `initializePreferences()`
- Defaults applied via `applyDefaultStatesOnDocumentLoad()`

**Decision**: Add `canvas` preference group to `UserPreferences`:
```typescript
export interface CanvasPreferences {
  viewMode: ViewMode; // 'wireframe' | 'styled'
}

export interface UserPreferences {
  // ... existing
  canvas: CanvasPreferences;
}
```

Add setter `setViewModePreference(mode: ViewMode)` to preferencesStore.

**Rationale**: Follows existing patterns. Canvas-related preferences grouped logically.

**Alternatives Considered**:
- Standalone viewModeStore with own localStorage - rejected, violates DRY
- Adding to `ui` preferences - rejected, not UI state, it's canvas behavior

### 5. Keyboard Shortcut Registration

**Question**: How should the P shortcut be registered?

**Findings**:

From `src/domain/shortcuts/registry.ts`:
- Shortcuts defined in `SHORTCUT_REGISTRY` array
- Each entry has: `id`, `keys`, `description`, `category`, optional `context`
- View Management category exists: `id: 'viewManagement'`
- 5 existing shortcuts in viewManagement category

**Decision**: Add to SHORTCUT_REGISTRY:
```typescript
{
  id: 'view-styled-mode',
  keys: 'P',
  description: 'Toggle Styled/Wireframe Mode',
  category: 'viewManagement',
}
```

**Rationale**: P is intuitive ("Preview"), not conflicting with existing shortcuts.

### 6. SVG Rendering Approach

**Question**: How should styled views be rendered in SVG?

**Findings**:

Current `ViewRectangle.tsx` renders:
```tsx
<rect
  class={rectClass()}
  x={props.view.absoluteX}
  y={props.view.absoluteY}
  width={props.view.width}
  height={props.view.height}
  // ...
/>
```

Category colors applied via CSS classes (`.container`, `.control`, etc.)

**Decision**: In styled mode:
1. Use inline `fill` attribute for background-color
2. Use inline `stroke` attribute for frame-color
3. Use inline `stroke-width` attribute for frame-width
4. Conditionally hide text labels (class names)
5. Fall back to wireframe CSS classes when no colors defined

```tsx
<rect
  style={viewMode === 'styled' && resolvedBackgroundColor ? {
    fill: resolvedBackgroundColor,
    'fill-opacity': '1',
    stroke: resolvedFrameColor || 'none',
    'stroke-width': frameWidth || '1'
  } : undefined}
  class={viewMode === 'styled' && resolvedBackgroundColor ? undefined : rectClass()}
  // ...
/>
```

**Rationale**: Inline styles override CSS classes cleanly. SVG fill/stroke supported universally.

**Alternatives Considered**:
- Dynamic CSS classes per color - rejected, would pollute stylesheet
- Canvas 2D rendering - rejected, breaks existing SVG architecture

### 7. Handling transparent="true" Attribute

**Question**: How should views with `transparent="true"` be rendered?

**Findings**:

From UIDESC_GUIDE.md:
- `transparent`: Boolean value as string ("true" | "false")
- When true, view background should not be rendered

**Decision**: In styled mode, if `transparent="true"`:
- Do not apply `fill` attribute
- Use `fill: "none"` or `fill-opacity: "0"`
- Frame color still applied if defined

**Rationale**: Matches VSTGUI rendering behavior where transparent views show through.

### 8. View Opacity Handling

**Question**: How should the `opacity` attribute be applied?

**Findings**:

From `src/types/uidesc.ts`:
- `opacity?: NumericValue` (string representation of number)
- Range: 0.0 to 1.0

**Decision**: In styled mode, apply opacity to the SVG `<g>` element:
```tsx
<g style={{ opacity: view.opacity || '1' }}>
  <rect ... />
  <text ... />
</g>
```

**Rationale**: CSS opacity on parent group affects all children correctly.

### 9. Template Background Color

**Question**: How should template root background be rendered?

**Findings**:

Current `TemplateBounds.tsx` renders:
```tsx
<rect
  class={styles.templateBounds}  // dashed border, no fill
  x={0}
  y={0}
  width={props.width}
  height={props.height}
/>
```

**Decision**: In styled mode, render template background first (z-index 0):
```tsx
{viewMode === 'styled' && templateBackgroundColor && (
  <rect
    fill={templateBackgroundColor}
    x={0}
    y={0}
    width={props.width}
    height={props.height}
  />
)}
<rect class={styles.templateBounds} ... />  // Border always visible
```

**Rationale**: Background rendered behind all views, border still visible for size reference.

### 10. Label Visibility Toggle

**Question**: How should labels be hidden in styled mode?

**Findings**:

Current `ViewRectangle.tsx` shows labels via `<Show when={props.view.title}>`:
- Only views with `title` attribute (e.g., CTextLabel) show text
- Class name labels come from the view ID/class

Labels are actually class names shown via a different mechanism - need to verify.

Reviewing `ViewRectangle.tsx` - no class name labels are rendered currently. The `title` attribute text is rendered for CTextLabel views.

**Decision**:
- In styled mode: Keep `title` text for CTextLabel (it's content, not debugging info)
- The "labels" referenced in spec likely means the category-colored borders that identify views
- Hide category outlines when styled colors are applied

**Rationale**: CTextLabel `title` is actual content that should display in styled mode.

## Summary

All research questions resolved. Key decisions:

1. **Color Resolution**: Unified `resolveColor()` function handling hex, predefined, and document colors
2. **Luminance**: Standard W3C formula with 0.5 threshold
3. **Toggle Pattern**: Follow existing GridToolbar button pattern
4. **Preferences**: New `canvas.viewMode` preference group
5. **Shortcut**: P key registered in viewManagement category
6. **SVG Rendering**: Inline styles for styled mode, CSS classes for wireframe
7. **Transparent**: `fill: "none"` for transparent views
8. **Opacity**: CSS opacity on `<g>` element
9. **Template Background**: Render filled rect before bounds border
10. **Labels**: Keep CTextLabel title text, hide category indicators via styling

