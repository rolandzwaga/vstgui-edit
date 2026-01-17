# Quickstart: Styled View Mode

**Date**: 2026-01-17
**Feature**: 042-styled-view-mode

## Overview

This feature adds a "Styled" view mode to the canvas that renders views with their actual visual properties from the uidesc file, complementing the existing "Wireframe" mode.

## Quick Reference

### Key Files

| File | Purpose |
|------|---------|
| `src/types/viewMode.ts` | Type definitions (ViewMode, StyledViewProps, etc.) |
| `src/stores/viewModeStore.ts` | View mode state management |
| `src/domain/viewMode/colorResolution.ts` | Color reference resolution |
| `src/domain/viewMode/luminance.ts` | Luminance calculation for adaptive overlays |
| `src/domain/viewMode/styledViewProps.ts` | Build styled properties from uidesc |
| `src/components/ViewModeToolbar/ViewModeToolbar.tsx` | Toolbar toggle button |
| `src/components/Canvas/ViewRectangle.tsx` | Modified for styled rendering |
| `src/components/Canvas/SelectionOverlay.tsx` | Modified for adaptive overlays |

### Key APIs

```typescript
// Toggle view mode
import { toggleViewMode, viewModeStore } from '../stores/viewModeStore';
toggleViewMode(); // Switches between 'wireframe' and 'styled'
console.log(viewModeStore.mode); // 'wireframe' or 'styled'

// Resolve color references
import { resolveColor } from '../domain/viewMode/colorResolution';
const color = resolveColor('background', documentColors); // -> '#2d2d2dff' or null

// Calculate luminance
import { calculateLuminance, isLightColor } from '../domain/viewMode/luminance';
const lum = calculateLuminance('#FFFFFF'); // -> 1.0
const isLight = isLightColor('#FFFFFF'); // -> true

// Get adaptive overlay
import { getAdaptiveOverlayStyle } from '../domain/viewMode/luminance';
const overlay = getAdaptiveOverlayStyle('#000000');
// -> { fillColor: '#FFFFFF', fillOpacity: 0.5, strokeColor: '#FFFFFF' }

// Build styled props
import { buildStyledViewProps } from '../domain/viewMode/styledViewProps';
const props = buildStyledViewProps(viewAttributes, documentColors);
// -> { backgroundColor, frameColor, frameWidth, isTransparent, opacity, useWireframeFallback }
```

## Implementation Checklist

### Phase 1: Types and Store (Foundation)

- [ ] Create `src/types/viewMode.ts` with all type definitions
- [ ] Create `src/stores/viewModeStore.ts` with state management
- [ ] Add `CanvasPreferences` to `src/domain/preferences/types.ts`
- [ ] Add `canvas` section to `DEFAULT_PREFERENCES`
- [ ] Add `setViewModePreference()` to preferencesStore
- [ ] Update preferences schema for validation

### Phase 2: Domain Functions (Color Resolution)

- [ ] Create `src/domain/viewMode/colorResolution.ts`
- [ ] Implement `resolveColor()` with all three formats
- [ ] Implement `hexToRgba()` for CSS conversion
- [ ] Handle circular reference protection (max depth 10)
- [ ] Write comprehensive tests

### Phase 3: Domain Functions (Luminance)

- [ ] Create `src/domain/viewMode/luminance.ts`
- [ ] Implement `calculateLuminance()` with W3C formula
- [ ] Implement `parseColorToRgb()` for multiple formats
- [ ] Implement `getAdaptiveOverlayStyle()`
- [ ] Write tests with edge cases (pure white, pure black, gray)

### Phase 4: Domain Functions (Styled Props)

- [ ] Create `src/domain/viewMode/styledViewProps.ts`
- [ ] Implement `buildStyledViewProps()`
- [ ] Implement `parseFrameWidth()`, `parseOpacity()`, `parseTransparent()`
- [ ] Implement `shouldUseWireframeFallback()` logic
- [ ] Write tests covering all attribute combinations

### Phase 5: Toolbar Component

- [ ] Create `src/components/ViewModeToolbar/ViewModeToolbar.tsx`
- [ ] Create `src/components/ViewModeToolbar/ViewModeToolbar.module.css`
- [ ] Add eye icon from FontAwesome (faEye)
- [ ] Implement active state styling
- [ ] Add to MainToolbar
- [ ] Write component tests

### Phase 6: Keyboard Shortcut

- [ ] Add P shortcut to `src/domain/shortcuts/registry.ts`
- [ ] Add handler in `src/hooks/canvas/useCanvasKeyboard.ts`
- [ ] Test shortcut functionality

### Phase 7: Canvas Components (ViewRectangle)

- [ ] Modify ViewRectangle to accept viewMode prop
- [ ] Implement styled rendering with inline SVG styles
- [ ] Implement wireframe fallback logic
- [ ] Handle transparent views
- [ ] Handle opacity attribute
- [ ] Update/add tests

### Phase 8: Canvas Components (SelectionOverlay)

- [ ] Modify SelectionOverlay to accept viewMode and overlayStyle props
- [ ] Implement adaptive overlay colors
- [ ] Handle hover state with adaptive colors
- [ ] Update/add tests

### Phase 9: Canvas Components (TemplateBounds)

- [ ] Modify TemplateBounds to accept viewMode and backgroundColor props
- [ ] Render template background in styled mode
- [ ] Update/add tests

### Phase 10: Integration

- [ ] Wire up viewModeStore in Canvas component
- [ ] Pass viewMode and styled props to child components
- [ ] Verify z-ordering (children on top of parents)
- [ ] Initialize viewMode from preferences on document load
- [ ] Add CSS tokens for overlay colors

### Phase 11: Quality Gates

- [ ] Run `npm run lint:css` - must pass
- [ ] Run `npm run check` - must pass
- [ ] Run `npm run typecheck` - must pass
- [ ] Run `npm test` - all tests must pass
- [ ] Verify 80%+ code coverage for new code

## Common Patterns

### Using viewModeStore in Components

```typescript
import { viewModeStore } from '../../stores/viewModeStore';

const ViewRectangle: Component<ViewRectangleProps> = (props) => {
  const isStyledMode = () => viewModeStore.mode === 'styled';

  return (
    <rect
      style={isStyledMode() ? { fill: props.styledProps?.backgroundColor } : undefined}
      class={!isStyledMode() ? styles.wireframeRect : undefined}
    />
  );
};
```

### Color Resolution Pattern

```typescript
import { resolveColor } from '../../domain/viewMode/colorResolution';
import { documentStore } from '../../stores/documentStore';

const backgroundColor = resolveColor(
  view.attributes['background-color'],
  documentStore.document?.['vstgui-ui-description']?.colors
);
```

### Adaptive Overlay Pattern

```typescript
import { getAdaptiveOverlayStyle } from '../../domain/viewMode/luminance';

const overlayStyle = createMemo(() => {
  if (viewModeStore.mode === 'styled' && styledProps.backgroundColor) {
    return getAdaptiveOverlayStyle(styledProps.backgroundColor);
  }
  return getDefaultOverlayStyle();
});
```

## Testing Patterns

### Store Tests

```typescript
import { describe, test, expect, beforeEach } from 'vitest';
import { viewModeStore, setViewMode, toggleViewMode, resetViewModeStore } from '../viewModeStore';
import { testInRoot } from '../../__tests__/helpers/solidjs';

describe('viewModeStore', () => {
  beforeEach(() => {
    resetViewModeStore();
  });

  test('initial state is wireframe', () => {
    testInRoot(() => {
      expect(viewModeStore.mode).toBe('wireframe');
    });
  });

  test('toggleViewMode switches between modes', () => {
    testInRoot(() => {
      toggleViewMode();
      expect(viewModeStore.mode).toBe('styled');
      toggleViewMode();
      expect(viewModeStore.mode).toBe('wireframe');
    });
  });
});
```

### Domain Function Tests

```typescript
import { describe, test, expect } from 'vitest';
import { resolveColor } from '../colorResolution';

describe('resolveColor', () => {
  test('resolves direct hex color', () => {
    expect(resolveColor('#FF0000FF', {})).toBe('rgba(255, 0, 0, 1.00)');
  });

  test('resolves predefined color', () => {
    expect(resolveColor('~ BlackCColor', {})).toBe('#000000FF');
  });

  test('resolves document color reference', () => {
    const colors = { background: '#2D2D2DFF' };
    expect(resolveColor('background', colors)).toBe('rgba(45, 45, 45, 1.00)');
  });

  test('returns null for unresolvable reference', () => {
    expect(resolveColor('nonexistent', {})).toBeNull();
  });
});
```

### Component Tests

```typescript
import { describe, test, expect, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup } from '@solidjs/testing-library';
import { ViewModeToolbar } from '../ViewModeToolbar';
import { resetViewModeStore, viewModeStore } from '../../../stores/viewModeStore';
import userEvent from '@testing-library/user-event';

describe('ViewModeToolbar', () => {
  beforeEach(() => {
    resetViewModeStore();
  });

  afterEach(() => {
    cleanup();
  });

  test('renders toggle button', () => {
    render(() => <ViewModeToolbar />);
    expect(screen.getByRole('button', { name: /view mode/i })).toBeInTheDocument();
  });

  test('toggles mode on click', async () => {
    const user = userEvent.setup();
    render(() => <ViewModeToolbar />);

    const button = screen.getByRole('button');
    await user.click(button);

    expect(viewModeStore.mode).toBe('styled');
  });
});
```

## Troubleshooting

### Color Not Resolving

1. Check if color reference exists in document colors
2. Check for typos in predefined color names (case-sensitive)
3. Check for circular references (max 10 depth)
4. Verify hex format (#RRGGBB or #RRGGBBAA)

### Overlay Not Adapting

1. Verify backgroundColor is not null
2. Check luminance calculation input format
3. Verify threshold is 0.5

### Mode Not Persisting

1. Check preferencesStore integration
2. Verify `applyDefaultStatesOnDocumentLoad` is called
3. Check localStorage for `vstgui-edit:preferences` key

## References

- [Spec](./spec.md) - Full feature specification
- [Research](./research.md) - Technical research findings
- [Data Model](./data-model.md) - Entity definitions
- [Contracts](./contracts/) - API contracts
- [CLAUDE.md](/CLAUDE.md) - Project guidelines
- [TESTING-GUIDE.md](/specs/TESTING-GUIDE.md) - Testing patterns
