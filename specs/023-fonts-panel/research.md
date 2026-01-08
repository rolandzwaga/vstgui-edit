# Research: Fonts Panel

**Feature**: 023-fonts-panel  
**Date**: 2026-01-08

## Research Summary

This research phase identified the key patterns and approaches for implementing the Fonts Panel feature by analyzing the existing Colors Panel implementation and the uidesc schema.

## Key Findings

### 1. Font Schema Structure

**Decision**: Follow the exact schema from `vstgui-uidesc.schema.json`

**Schema Properties**:
- `font-name` (string, required) - System font name
- `size` (numericValue, required) - Font size in points
- `bold` (booleanValue, optional) - Bold style flag
- `italic` (booleanValue, optional) - Italic style flag  
- `underline` (booleanValue, optional) - Underline style flag
- `strike-through` (booleanValue, optional) - Strike-through style flag
- `alternative-font-names` (string, optional) - Comma-separated fallbacks

**Rationale**: Using the exact schema ensures validation compatibility with existing parser.

**Alternatives considered**: None - schema is fixed by VSTGUI specification.

### 2. UI Pattern Approach

**Decision**: Mirror the Colors Panel architecture

**Components**:
- `FontsPanel.tsx` - Main panel container (like `ColorsPanel.tsx`)
- `FontItem.tsx` - Individual font row with inline editing (like `ColorItem.tsx`)
- `FontPreview.tsx` - Sample text preview (analogous to `ColorSwatch.tsx`)
- `AddFontButton.tsx` - Add action button (like `AddColorButton.tsx`)
- `EmptyState.tsx` - Empty state display (reuse pattern from ColorsPanel)

**Rationale**: Consistency with existing UI patterns, proven architecture, minimal learning curve.

**Alternatives considered**:
- Modal-based editing - Rejected: inline editing is more efficient for quick changes
- Separate preview panel - Rejected: preview inline with each font is more intuitive

### 3. Font Preview Implementation

**Decision**: Use CSS to render sample text with actual font properties

**Approach**:
```css
.preview {
  font-family: var(--preview-font);
  font-size: 14px; /* Fixed for display, not actual size */
  font-weight: var(--preview-bold, normal);
  font-style: var(--preview-italic, normal);
  text-decoration: var(--preview-decoration, none);
}
```

**Sample text**: "AaBbCc 123" - shows uppercase, lowercase, and numbers

**Rationale**: CSS-based rendering is simple, fast, and shows actual font appearance.

**Alternatives considered**:
- Canvas rendering - Rejected: overkill for simple text preview
- SVG text - Rejected: CSS is simpler and more performant

### 4. Usage Tracking

**Decision**: Search for `font` attribute in views (similar to color usage tracking)

**Font Attributes**: `['font']` - Views reference fonts by name

**Reference Format**: 
- `"~ FontName"` - Document-defined font reference
- Font names without prefix are system fonts

**Rationale**: Matches existing color usage pattern, consistent with uidesc convention.

### 5. Document Store Extensions

**Decision**: Add parallel functions to existing color operations

**New Functions**:
```typescript
getFonts(): Record<string, FontDefinition> | undefined
addFont(name: string, font: FontDefinition): void
updateFontName(oldName: string, newName: string): boolean
updateFontProperty(name: string, prop: keyof FontDefinition, value: string): string | null
deleteFont(name: string): { removedReferences: RemovedFontReference[] } | null
```

**Rationale**: Follows established pattern, minimal store changes needed.

### 6. Validation Rules

**Decision**: Implement domain-specific validation

**Rules**:
- Font resource name: non-empty, unique (case-sensitive)
- `font-name`: non-empty string (required)
- `size`: positive number (required), warn if > 72
- `bold/italic/underline/strike-through`: "true" or "false"
- `alternative-font-names`: comma-separated, no validation needed

**Rationale**: Matches schema requirements, provides helpful user feedback.

### 7. History Operations

**Decision**: Create operation types matching colors pattern

**Operations**:
- `add-font` - Add new font definition
- `edit-font-name` - Rename font resource
- `edit-font-property` - Change any font property
- `delete-font` - Delete font (with reference cleanup)

**Rationale**: Consistent with existing history patterns, enables full undo/redo.

## Implementation Dependencies

### Existing Utilities to Reuse
- `historyStore` - Undo/redo stack management
- `documentStore` - Document state, view updates
- `pushOperation()` - Add to history
- `updateViewAttribute()` - Update view references

### New Utilities to Create
- `domain/fonts/validation.ts` - Font validation functions
- `domain/fonts/formatting.ts` - Display formatting
- `domain/fonts/usage.ts` - Usage tracking
- `domain/fonts/historyOperations.ts` - History operations

## Risk Assessment

| Risk | Mitigation |
|------|------------|
| Font not installed on system | Show warning indicator, allow save anyway |
| Complex property editing | Inline editing for each property, not modal |
| Performance with many fonts | Memoize usage counts, defer calculations |

## Conclusion

The Fonts Panel can be implemented by closely following the Colors Panel pattern with adaptations for font-specific properties. No new dependencies required. The existing architecture provides all necessary foundation.
