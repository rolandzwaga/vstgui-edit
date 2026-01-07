# Requirements Checklist - Feature 021: Colors Panel

## User Stories

### US1 - View Colors List (P1)
- [ ] Colors panel visible in sidebar
- [ ] All colors from uidesc displayed
- [ ] Each color shows: name, hex value, swatch preview
- [ ] Empty state shown when no colors defined
- [ ] Alpha channel colors display with transparency

### US2 - Add New Color (P1)
- [ ] "Add Color" button available in panel
- [ ] New color entry with editable fields appears
- [ ] Valid color saves to uidesc JSON
- [ ] Duplicate name shows validation error
- [ ] Invalid hex shows validation error with format guidance

### US3 - Edit Existing Color (P1)
- [ ] Click on name enables inline editing
- [ ] Click on hex value enables inline editing
- [ ] Swatch updates live while editing hex
- [ ] Duplicate name edit rejected with error
- [ ] Escape cancels edit and restores original

### US4 - Delete Color (P2)
- [ ] Delete action available (context menu or button)
- [ ] Unused colors delete immediately
- [ ] Used colors show confirmation with usage list
- [ ] Confirm deletes the color
- [ ] Cancel preserves the color

### US5 - View Color Usage (P2)
- [ ] Usage count badge on colors in use
- [ ] Click/hover shows list of referencing views
- [ ] Unused colors show no badge or "0 uses"

### US6 - Undo/Redo (P2)
- [ ] Ctrl+Z undoes add color
- [ ] Ctrl+Z undoes edit color
- [ ] Ctrl+Z undoes delete color
- [ ] Ctrl+Shift+Z redoes operations

## Functional Requirements

### Display & Panel
- [ ] FR-001: Colors panel in sidebar resource area
- [ ] FR-002: List all colors from uidesc `colors` object
- [ ] FR-003: Color swatch preview for each entry
- [ ] FR-004: Alpha channel support in swatch display

### Add Color
- [ ] FR-005: "Add Color" button/action
- [ ] FR-006: Unique name validation (case-sensitive)
- [ ] FR-007: Hex format validation (#RGB, #RRGGBB, #RRGGBBAA)
- [ ] FR-008: Immediate JSON update on valid input

### Edit Color
- [ ] FR-009: Inline name editing
- [ ] FR-010: Inline hex value editing
- [ ] FR-011: Live swatch preview while editing
- [ ] FR-012: Validation before applying edits

### Delete Color
- [ ] FR-013: Delete via context menu or button
- [ ] FR-014: Usage warning before delete
- [ ] FR-015: Force-deletion with confirmation

### Usage Tracking
- [ ] FR-016: Track view references by scanning attributes
- [ ] FR-017: Display usage count in panel
- [ ] FR-018: Show referencing views on demand

### Undo/Redo
- [ ] FR-019: Integration with existing undo/redo system
- [ ] FR-020: Support for add, edit name, edit value, delete

### Format Support
- [ ] FR-021: #RGB shorthand format support
- [ ] FR-022: #RRGGBB format support
- [ ] FR-023: #RRGGBBAA format support
- [ ] FR-024: Preserve original format when possible

## Success Criteria

- [ ] SC-001: Colors display within 100ms of file load
- [ ] SC-002: Add color updates UI and JSON atomically
- [ ] SC-003: Swatch preview updates within 50ms while typing
- [ ] SC-004: Usage tracking 100% accurate
- [ ] SC-005: All operations undoable/redoable
- [ ] SC-006: Invalid hex rejected with clear error messages

## Edge Cases

- [ ] Invalid hex format (e.g., "red") shows error
- [ ] Missing hash prefix auto-corrected or error shown
- [ ] 3-char shorthand (#f00) accepted
- [ ] Alpha channel (#ff000080) displays with transparency
- [ ] Empty color name rejected
- [ ] Spaces in name allowed ("Background Color")
- [ ] Long names truncated with tooltip
- [ ] Case insensitive hex comparison
- [ ] Predefined colors (~ BlackCColor) handled specially

## Quality Gates

- [ ] `npm run lint:css` passes
- [ ] `npm run check` passes
- [ ] `npm run typecheck` passes
- [ ] All tests pass
- [ ] No console errors in browser
