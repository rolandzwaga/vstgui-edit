# Implementation Plan: Properties Panel

**Branch**: `011-properties-panel` | **Date**: 2026-01-06 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/011-properties-panel/spec.md`

## Summary

Read-only properties panel in the right sidebar that displays all attributes of selected view(s). Attributes are organized into collapsible groups (Geometry, Appearance, Behavior, Other). Multi-selection shows shared values or "Mixed" indicators. Click-to-copy functionality for attribute values.

## Technical Context

**Language/Version**: TypeScript 5.9.3 with strict mode enabled
**Primary Dependencies**: SolidJS 1.9.10, solid-js/store (already installed - no new dependencies)
**Storage**: N/A (reads from existing documentStore and selectionStore)
**Testing**: Vitest 4.0.16 with @solidjs/testing-library
**Testing Guide**: `specs/TESTING-GUIDE.md` - MUST be consulted for all test tasks  
**Target Platform**: Web browser (modern browsers with Clipboard API support)
**Project Type**: Single SolidJS web application
**Performance Goals**: Panel updates within 100ms of selection change
**Constraints**: Read-only display (no editing), clipboard API fallback for older browsers
**Scale/Scope**: Display up to 50+ selected views efficiently

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Test-First Development | ✅ PASS | Tests written before implementation |
| II. Technology Stack | ✅ PASS | SolidJS 1.9.10, no new dependencies |
| III. Security & Compliance | ✅ PASS | Read-only display, no sensitive data |
| IV. Code Quality | ✅ PASS | Biome, TypeScript strict, CSS Modules |
| V. GUI Editor Domain | ✅ PASS | Visual fidelity, real-time feedback |
| VI. Testing Standards | ✅ PASS | 80% coverage target, co-located tests |
| IX. Accessibility | ✅ PASS | Keyboard navigation, ARIA labels |
| XII. SolidJS Only | ✅ PASS | No React patterns |
| XV. Styling Architecture | ✅ PASS | CSS Modules |
| XVIII. Zero Failing Tests | ✅ PASS | All tests must pass |
| XXI. Static Imports Only | ✅ PASS | No dynamic imports |

**All gates pass. Proceeding to design.**

## Project Structure

### Documentation (this feature)

```text
specs/011-properties-panel/
├── spec.md              # Feature specification
├── plan.md              # This file
├── research.md          # Phase 0 output (minimal - no unknowns)
├── data-model.md        # Phase 1 output
└── tasks.md             # Phase 2 output (/speckit.tasks command)
```

### Source Code (repository root)

```text
src/
├── components/
│   └── PropertiesPanel/
│       ├── PropertiesPanel.tsx          # Main container component
│       ├── PropertiesPanel.module.css
│       ├── AttributeGroup.tsx           # Collapsible group component
│       ├── AttributeGroup.module.css
│       ├── AttributeRow.tsx             # Single attribute display with copy
│       ├── AttributeRow.module.css
│       ├── EmptyState.tsx               # No selection state
│       ├── EmptyState.module.css
│       ├── SelectionHeader.tsx          # Class name / selection count header
│       ├── SelectionHeader.module.css
│       ├── index.ts                     # Barrel export
│       └── __tests__/
│           ├── PropertiesPanel.spec.tsx
│           ├── PropertiesPanel.multiselect.spec.tsx
│           ├── AttributeGroup.spec.tsx
│           ├── AttributeRow.spec.tsx
│           ├── AttributeRow.copy.spec.tsx
│           ├── EmptyState.spec.tsx
│           └── SelectionHeader.spec.tsx
├── domain/
│   └── properties/
│       ├── groupAttributes.ts           # Attribute categorization logic
│       ├── mergeSelections.ts           # Multi-selection attribute merging
│       ├── index.ts                     # Barrel export
│       └── __tests__/
│           ├── groupAttributes.spec.ts
│           └── mergeSelections.spec.ts
├── stores/
│   ├── propertiesStore.ts               # Group expand/collapse state
│   └── __tests__/
│       └── propertiesStore.spec.ts
├── types/
│   └── properties.ts                    # Type definitions
└── App.tsx                              # Updated to include PropertiesPanel
```

**Structure Decision**: Single project structure following existing patterns. Components co-located with CSS modules, domain logic in domain/, stores in stores/, types in types/.

## Complexity Tracking

No constitution violations. No complexity justification needed.

## Integration Points

### Existing Stores to Use

1. **selectionStore** (`src/stores/selectionStore.ts`)
   - `selectionStore.selectedIds: Set<string>` - IDs of selected views
   - `isSelected(viewId)` - Check if view is selected

2. **documentStore** (`src/stores/documentStore.ts`)
   - `documentStore.document` - Parsed uidesc document
   - Access view attributes via templates

### Existing Types to Use

1. **ViewNode** (`src/types/uidesc.ts`)
   - `attributes: Record<string, unknown>` - View attributes to display

2. **RenderableView** (`src/domain/canvas/flattenHierarchy.ts`)
   - Already flattened view data with id mapping

### Layout Integration

Update `App.tsx` to add PropertiesPanel in right sidebar:
```
┌─────────────────────────────────────────────────────┐
│                    MainToolbar                       │
├────────────┬──────────────────────┬─────────────────┤
│            │                      │                 │
│ Hierarchy  │       Canvas         │  Properties     │
│   Panel    │                      │    Panel        │
│ (250px)    │     (flex: 1)        │   (280px)       │
│            │                      │                 │
└────────────┴──────────────────────┴─────────────────┘
```

## Attribute Grouping Specification

### Group Definitions

| Group | Attributes | Priority |
|-------|-----------|----------|
| **Identity** | class (always shown at top, not collapsible) | 0 |
| **Geometry** | origin, size, min-size, max-size, autosize-to-fit-content-width | 1 |
| **Appearance** | background-color, background-color-draw-style, opacity, bitmap, transparent, draw-antialiased, frame-color, frame-width | 2 |
| **Text** | font, font-color, text-alignment, text-inset, title, tooltip | 3 |
| **Behavior** | mouse-enabled, want-focus, tab-navigation-order, autosize, uidesc-label | 4 |
| **Other** | Any unrecognized attributes | 5 |

### Empty Groups

Hide groups that have no attributes for the selected view(s).

## Multi-Selection Logic

### Attribute Merging Rules

1. **All views have same value** → Display the value
2. **Views have different values** → Display "Mixed"
3. **Some views have attribute, others don't** → Display "Mixed"
4. **No views have attribute** → Don't display attribute

### Header Display

- Single view: Show class name (e.g., "CTextButton")
- Multiple views, same class: Show class + count (e.g., "CTextButton (3)")
- Multiple views, different classes: Show count only (e.g., "3 views selected")

## Copy-to-Clipboard Implementation

### Interaction

1. User clicks on attribute value text
2. Value is copied to clipboard via `navigator.clipboard.writeText()`
3. Visual feedback shows for 1.5 seconds (brief highlight or tooltip)

### Fallback

If Clipboard API unavailable:
- Show error tooltip "Copy not supported"
- Degrade gracefully without breaking UI

### Excluded Values

- "Mixed" indicators are not copyable
- Empty values are not copyable

## Expand/Collapse State

### State Management

Create `propertiesStore.ts`:
- `expandedGroups: Set<string>` - Which groups are expanded
- Default all groups expanded
- Persist state across selection changes

### Interaction

- Click group header to toggle expand/collapse
- Chevron icon indicates state (down = expanded, right = collapsed)
