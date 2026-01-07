# Research: Property Editing

**Date**: 2026-01-07
**Feature**: 016-property-editing

## Research Areas

### 1. Attribute Type Classification

**Decision**: Classify attributes into editor types based on UIDESC_GUIDE.md attribute definitions.

**Rationale**: VSTGUI attributes follow consistent type patterns. Mapping attribute names to editor types enables automatic selection of appropriate input controls.

**Classification**:

| Editor Type | Attributes | Format |
|-------------|------------|--------|
| **text** | title, tooltip, uidesc-label, custom-view-name, sub-controller | free-form string |
| **point** | origin, size, min-size, max-size, text-inset, shadow-offset, margin | "x, y" format |
| **number** | opacity, wheel-inc-value, frame-width, round-rect-radius, spacing, z-index | 0-1 or integer |
| **boolean** | mouse-enabled, transparent, wants-focus, visible, bordered, bold, italic | "true"/"false" |
| **enum** | text-alignment, autosize, background-color-draw-style, truncate-mode, orientation | fixed options |
| **color** | background-color, font-color, frame-color, shadow-color, back-color | named ref or hex |
| **font** | font | named ref |
| **bitmap** | bitmap | named ref |
| **readonly** | class | displayed but not editable |

**Alternatives Considered**:
- Generic text input for all attributes (rejected: poor UX, no validation)
- Schema-driven type detection (rejected: over-engineering, attribute names are predictable)

### 2. Document Store Update Pattern

**Decision**: Extend existing `documentStore` with generic `updateViewAttribute(viewId, attrName, newValue)` function.

**Rationale**: The store already has `updateViewOrigin` and `updateViewSize` patterns using `produce()` from solid-js/store. A generic attribute update follows the same pattern.

**Implementation Pattern**:
```typescript
export function updateViewAttribute(
  viewId: string,
  attributeName: string,
  newValue: string
): string | null {
  // 1. Find view in tree (reuse existing findViewInTree)
  // 2. Get previous value
  // 3. Use produce() to update attribute
  // 4. Return previous value for undo
}
```

**Alternatives Considered**:
- Separate store per editor type (rejected: fragments state, complicates undo)
- Direct DOM mutation (rejected: violates SolidJS reactivity model)

### 3. Validation Strategy

**Decision**: Implement validators per attribute type in `src/domain/properties/validation.ts`.

**Rationale**: Each attribute type has deterministic validation rules documented in UIDESC_GUIDE.md. Validation should happen before committing to store.

**Validators**:

| Type | Validation Rules |
|------|------------------|
| **point** | Two comma-separated integers, both finite |
| **size** | Two comma-separated positive integers (width >= 0, height >= 0) |
| **number** | Finite number, optionally within range (e.g., opacity 0-1) |
| **boolean** | Must be "true" or "false" |
| **enum** | Must match one of defined options |
| **color** | Valid hex (#RRGGBBAA) or existing named color or predefined (~) |
| **font** | Existing named font in document |
| **bitmap** | Existing named bitmap in document |
| **text** | Always valid (any string) |

**Alternatives Considered**:
- AJV schema validation (rejected: overkill for inline editing, slow)
- No validation (rejected: corrupts document data)

### 4. Editor Component Architecture

**Decision**: Create standalone editor components with consistent props interface.

**Rationale**: Each editor has different UI (checkbox vs dropdown vs input), but all need same callbacks (onChange, onCancel, value).

**Common Props Interface**:
```typescript
interface EditorProps {
  value: string;
  onChange: (newValue: string) => void;
  onCancel: () => void;
  disabled?: boolean;
  error?: string;
}
```

**Specific Additions**:
- `EnumEditor`: `options: string[]` prop
- `NumberEditor`: `min?: number, max?: number, step?: number` props
- `ColorPicker/FontPicker/BitmapPicker`: Access document resources via documentStore

**Alternatives Considered**:
- Single polymorphic editor (rejected: complex switch logic, harder to test)
- Inline editing in AttributeRow (rejected: mixing concerns, harder to maintain)

### 5. History Integration

**Decision**: Create history operations in editors, push to existing `historyStore`.

**Rationale**: `historyStore` already exists with `pushOperation()`, `undo()`, `redo()` from 012-view-move. Property edits follow same HistoryOperation pattern.

**Operation Structure**:
```typescript
const operation: HistoryOperation = {
  type: 'property-change',
  description: `Change ${attrName}`,
  timestamp: Date.now(),
  undo: () => updateViewAttribute(viewId, attrName, previousValue),
  redo: () => updateViewAttribute(viewId, attrName, newValue),
};
pushOperation(operation);
```

**Multi-Selection Handling**:
- Single history operation contains undo/redo for ALL selected views
- `description` shows "Change {attr} on N views"

**Alternatives Considered**:
- Separate history stack for property changes (rejected: fragments undo experience)
- Batch operations after delay (rejected: complicates user mental model)

### 6. Live Preview Behavior

**Decision**: Update document store immediately on valid input, before commit.

**Rationale**: FR-009 requires real-time canvas update. Canvas already reactively renders from documentStore.

**Workflow**:
1. User types in editor
2. Validate input
3. If valid: update documentStore → canvas updates automatically
4. If invalid: show error, don't update store
5. On commit (Enter/blur): push history operation
6. On cancel (Escape): restore previous value from captured snapshot

**Alternatives Considered**:
- Update only on commit (rejected: no live preview)
- Separate preview store (rejected: duplicates state, complex sync)

### 7. Resource Picker UI Pattern

**Decision**: Use @floating-ui/dom for dropdown positioning (already installed).

**Rationale**: Existing project uses @floating-ui/dom for tooltips. Consistent positioning library.

**Picker Structure**:
- Trigger: Clickable value display with dropdown arrow
- Dropdown: List of resources with visual previews
- Color: Swatch + name
- Font: Sample text in font + name
- Bitmap: Thumbnail + name

**Resource Access**:
- Colors: `documentStore.document?.['vstgui-ui-description']?.colors`
- Fonts: `documentStore.document?.['vstgui-ui-description']?.fonts`
- Bitmaps: `documentStore.document?.['vstgui-ui-description']?.bitmaps`

**Alternatives Considered**:
- Native browser select (rejected: no visual previews)
- Modal dialogs (rejected: heavyweight for simple selection)

### 8. Multi-Selection Editing

**Decision**: Apply edits to ALL selected views when editing Mixed values.

**Rationale**: FR-012 requires editing across multiple views. Standard pattern in design tools.

**Workflow**:
1. Multi-select shows shared values or "Mixed"
2. When user edits Mixed field, new value replaces ALL selected views' values
3. Single history operation captures all previous values
4. Undo restores each view to its original value

**Implementation**:
```typescript
function handleMultiEdit(attrName: string, newValue: string) {
  const selectedIds = Array.from(selectionStore.selectedIds);
  const previousValues: Record<string, string> = {};
  
  for (const id of selectedIds) {
    previousValues[id] = getViewAttribute(id, attrName);
    updateViewAttribute(id, attrName, newValue);
  }
  
  pushOperation({
    type: 'property-change',
    description: `Change ${attrName} on ${selectedIds.length} views`,
    undo: () => { /* restore previousValues */ },
    redo: () => { /* apply newValue to all */ },
  });
}
```

**Alternatives Considered**:
- Disable editing for Mixed (rejected: blocks common workflow)
- Edit only first selected (rejected: confusing behavior)

### 9. Keyboard Handling

**Decision**: Standard text field keyboard conventions.

**Rationale**: Follow platform conventions for predictable UX.

| Key | Action |
|-----|--------|
| Enter | Commit edit |
| Escape | Cancel edit, restore previous |
| Tab | Commit and move to next field |
| Up/Down | Increment/decrement (number fields only) |

**Focus Management**:
- Click on value → focus editor
- Commit → return focus to row (or next field on Tab)
- Cancel → return focus to row

**Alternatives Considered**:
- Custom shortcuts (rejected: non-standard, learning curve)

### 10. Enum Options Mapping

**Decision**: Define enum options as constants in `attributeTypes.ts`.

**Rationale**: VSTGUI enum values are fixed and documented. Hardcoding ensures correctness.

**Options Map**:
```typescript
export const ENUM_OPTIONS: Record<string, string[]> = {
  'text-alignment': ['left', 'center', 'right'],
  'background-color-draw-style': ['filled', 'stroked', 'filled and stroked'],
  'truncate-mode': ['head', 'tail', 'none'],
  'orientation': ['horizontal', 'vertical'],
  'line-layout': ['clip', 'truncate', 'wrap'],
  // ... more enums
};

export const AUTOSIZE_FLAGS = ['left', 'right', 'top', 'bottom', 'row', 'column'];
```

**Special Case - Autosize**:
- Multi-select flags combined with spaces
- UI: Checkboxes for each flag, not dropdown
- Or: Multi-select dropdown

**Alternatives Considered**:
- Extract from schema (rejected: schema doesn't enumerate all enums)
- User-defined (rejected: fixed by VSTGUI, not user choice)

## Summary

All research questions resolved. Key decisions:
1. Type-based editor classification using attribute name patterns
2. Generic `updateViewAttribute()` in documentStore
3. Type-specific validators in domain layer
4. Standalone editor components with common props interface
5. Integrate with existing historyStore
6. Live preview via immediate store updates
7. @floating-ui/dom for picker dropdowns
8. Multi-selection applies to all selected views
9. Standard keyboard conventions
10. Hardcoded enum options from UIDESC_GUIDE.md

Ready for Phase 1: Data Model and Contracts.
