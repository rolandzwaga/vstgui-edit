# Quickstart: Canvas Pan Navigation

**Feature**: 004-canvas-pan
**Date**: 2026-01-05

## Quick Verification

After implementation, verify the feature works:

### 1. Start Development Server

```bash
npm run dev
```

### 2. Load a Test File

Upload any `.uidesc` file with a template (JSON or XML format).

### 3. Test Middle-Mouse Pan (FR-001, SC-001)

1. Position mouse over canvas
2. Press and hold middle mouse button
3. Drag in any direction
4. **Expected**: Canvas content moves with mouse (1:1)
5. Release middle mouse button
6. **Expected**: Pan stops, position preserved

### 4. Test Space+Drag Pan (FR-002, SC-002)

1. Position mouse over canvas
2. Hold Space key
3. **Expected**: Cursor changes to "grab" (FR-005)
4. Left-click and drag
5. **Expected**: Cursor changes to "grabbing", canvas pans (FR-006)
6. Release mouse or Space key
7. **Expected**: Pan stops, cursor returns to default

### 5. Test Pan Preservation (FR-004)

1. Pan the canvas to a new position
2. Release and perform other actions
3. **Expected**: Pan offset persists
4. Pan again
5. **Expected**: New pan adds to existing offset

### 6. Run Tests

```bash
npm test
```

All tests must pass.

## Files Modified

| File | Change |
|------|--------|
| `src/types/canvas.ts` | Added `PanState` type |
| `src/stores/canvasStore.ts` | NEW - pan state management |
| `src/components/Canvas/Canvas.tsx` | Pan event handlers, transform style |
| `src/components/Canvas/Canvas.module.css` | Cursor classes (grab, grabbing) |

## Common Issues

### Pan Not Working

1. Check browser console for errors
2. Verify middle mouse button is not captured by browser (auto-scroll)
3. Check if Space key is being captured by browser search

### Cursor Not Changing

1. Check CSS Modules import
2. Verify classList application in component
3. Check browser dev tools for applied styles

### Pan Offset Not Preserved

1. Check store reset is not being called
2. Verify transform style binding
3. Check signal reactivity in component
