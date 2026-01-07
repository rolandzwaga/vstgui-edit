# Research: Colors Panel

## Decision Log

### 1. Color Storage Format in uidesc

**Decision**: Colors are stored as `"name": "#RRGGBBAA"` in the uidesc JSON `colors` object.

**Rationale**: This is the native VSTGUI format as documented in UIDESC_GUIDE.md.

**Alternatives considered**:
- RGB only (#RRGGBB) - rejected, alpha channel support required
- Separate alpha property - rejected, VSTGUI uses combined format

**Reference**: UIDESC_GUIDE.md section "Colors"

### 2. Supported Color Formats

**Decision**: Support all three VSTGUI hex formats:
- `#RGB` (3-char shorthand) - expanded to `#RRGGBB` internally
- `#RRGGBB` (6-char) - standard hex without alpha
- `#RRGGBBAA` (8-char) - hex with alpha channel

**Rationale**: VSTGUI natively supports all three formats. The editor should accept any valid input.

**Alternatives considered**:
- Normalize all to #RRGGBBAA on save - rejected, preserve original format per FR-024
- Only support #RRGGBBAA - rejected, too restrictive for user input

### 3. Predefined Colors (~ prefix)

**Decision**: Display predefined colors with special indicator but treat as read-only.

**Rationale**: Predefined colors like `~ BlackCColor` are VSTGUI built-ins. Users should see them but cannot modify their definitions.

**Predefined colors available**:
- `~ BlackCColor` - #000000FF
- `~ WhiteCColor` - #FFFFFFFF
- `~ GreyCColor` - #808080FF
- `~ RedCColor` - #FF0000FF
- `~ GreenCColor` - #00FF00FF
- `~ BlueCColor` - #0000FFFF
- `~ YellowCColor` - #FFFF00FF
- `~ CyanCColor` - #00FFFFFF
- `~ MagentaCColor` - #FF00FFFF
- `~ TransparentCColor` - #00000000

### 4. Color Reference Tracking

**Decision**: Scan view attributes for color references by checking known color attribute names.

**Color attributes to scan**:
- `background-color`
- `font-color`
- `frame-color`
- `hover-color`
- `value-color`
- `min-value-color`
- `max-value-color`
- `default-value-color`
- `shadow-color`
- `highlight-color`

**Rationale**: These are the documented VSTGUI attributes that reference colors.

### 5. Panel Position in Sidebar

**Decision**: Add ColorsPanel below ViewPalette, before HierarchyPanel.

**Rationale**: Resources (colors, fonts, bitmaps) logically group together near the top for easy access during design. View creation (palette) is primary, then resources, then hierarchy/properties.

**Current sidebar order** (after implementation):
1. ViewPalette
2. **ColorsPanel** (new)
3. HierarchyPanel
4. PropertiesPanel

### 6. Inline Editing UX

**Decision**: Double-click or Enter on color item to edit inline. Tab moves between name and value fields.

**Rationale**: Matches PropertiesPanel editing pattern. Familiar UX.

**Behavior**:
- Click: Select color (highlight)
- Double-click/Enter: Enter edit mode
- Escape: Cancel edit, revert changes
- Blur/Enter: Commit changes
- Tab: Move to next field (name → value)

### 7. Color Swatch Transparency Display

**Decision**: Show checkerboard pattern behind semi-transparent colors.

**Rationale**: Standard UX pattern for visualizing alpha channel in color swatches.

**Implementation**: CSS background pattern with `background-image: linear-gradient(45deg, ...)` checkerboard, color overlay on top.

### 8. Add Color Default Values

**Decision**: New color starts with auto-generated unique name and white color.

**Default values**:
- Name: "New Color 1", "New Color 2", etc. (incrementing)
- Value: "#FFFFFFFF" (white with full opacity)

**Rationale**: Provides usable defaults while ensuring uniqueness.

### 9. Delete Confirmation UX

**Decision**: Show modal confirmation dialog with usage list before deleting used colors.

**Content**:
- Warning icon
- "This color is used by N views"
- List of view names/types
- "Delete anyway" / "Cancel" buttons

**Rationale**: Prevents accidental data loss while giving user full control.

### 10. Undo/Redo Integration

**Decision**: Use existing historyStore with HistoryOperation pattern.

**Operations**:
- `add-color`: Push with undo=remove, redo=add
- `edit-color-name`: Push with old/new names
- `edit-color-value`: Push with old/new values
- `delete-color`: Push with full color data for undo restoration

**Rationale**: Consistent with existing move/resize/property operations.

## Implementation Notes

### Existing Patterns to Follow

1. **Panel structure**: Copy HierarchyPanel pattern with header, content, empty state
2. **CSS Modules**: Use `*.module.css` files, import as `styles`
3. **Design tokens**: Use CSS variables from `tokens.css`
4. **Store extension**: Add methods to documentStore like existing `updateViewAttribute`
5. **Testing**: Follow TESTING-GUIDE.md for SolidJS component testing

### documentStore Extensions Needed

```typescript
// New methods to add:
addColor(name: string, value: string): void
updateColorName(oldName: string, newName: string): void
updateColorValue(name: string, value: string): void
deleteColor(name: string): void
getColors(): Record<string, string> | undefined
```

### Validation Rules

1. **Name uniqueness**: Case-sensitive, no duplicates allowed
2. **Name non-empty**: Must have at least 1 character
3. **Hex format**: Must match `/^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6}|[0-9A-Fa-f]{8})$/`
4. **Auto-correct missing #**: If user enters "FF0000", prepend "#"

### Color Parsing

```typescript
interface ParsedColor {
  r: number;  // 0-255
  g: number;  // 0-255
  b: number;  // 0-255
  a: number;  // 0-255 (default 255 if not specified)
}

function parseHexColor(hex: string): ParsedColor | null {
  // Handle #RGB, #RRGGBB, #RRGGBBAA
}
```
