# Research: Properties Panel

**Feature**: 011-properties-panel  
**Date**: 2026-01-06  
**Status**: Complete

## Summary

No significant unknowns identified. All technologies are already in use in the project.

## Questions Investigated

### Q1: How to access view attributes from documentStore?

**Answer**: View attributes are stored in `ViewNode.attributes` from parsed uidesc documents. Access path:
- `documentStore.document.vstgui-ui-description.templates[templateName].children[viewId].attributes`
- Use existing `flattenHierarchy()` from `src/domain/canvas/flattenHierarchy.ts` to get view IDs
- ViewNode type defined in `src/types/uidesc.ts`

**Evidence**: Existing canvas rendering already traverses view hierarchy.

### Q2: How does clipboard API work in modern browsers?

**Answer**: `navigator.clipboard.writeText(value)` returns a Promise. Need to handle:
- Success: Show visual feedback
- Failure: Clipboard API may be unavailable or permission denied
- Fallback: Show error message, don't break UI

**Evidence**: Standard Web API, well-documented.

### Q3: How to integrate with existing selectionStore?

**Answer**: Already implemented in 008-view-selection:
- `selectionStore.selectedIds: Set<string>` - reactive set of selected view IDs
- Subscribe via SolidJS reactivity - when selectedIds changes, panel updates automatically

**Evidence**: `src/stores/selectionStore.ts` exists with documented API.

### Q4: What attribute categories exist in VSTGUI?

**Answer**: Based on UIDESC_GUIDE.md and schema, attributes fall into:
- **Geometry**: origin, size, min-size, max-size, autosize-to-fit-content-width
- **Appearance**: background-color, background-color-draw-style, opacity, bitmap, transparent, draw-antialiased, frame-color, frame-width
- **Text**: font, font-color, text-alignment, text-inset, title, tooltip
- **Behavior**: mouse-enabled, want-focus, tab-navigation-order, autosize, uidesc-label
- **Other**: Any attribute not in above categories

**Evidence**: `UIDESC_GUIDE.md` section "Common Attributes for All Views"

## Unknowns Resolved

None - all patterns exist in codebase.

## Dependencies Confirmed

- No new dependencies needed
- SolidJS 1.9.10 - already installed
- Clipboard API - native browser API

## Risks Identified

None.

## Next Steps

Proceed to Phase 1: Create data-model.md with type definitions.
