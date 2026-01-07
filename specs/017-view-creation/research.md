# Research: View Creation & Deletion

**Feature**: 017-view-creation
**Date**: 2026-01-07

## Research Tasks Completed

### 1. VSTGUI View Classes for Palette

**Decision**: Organize 32 VSTGUI view classes into 5 categories

**Source**: UIDESC_GUIDE.md (project documentation)

**Categories and Classes**:

| Category | Classes |
|----------|---------|
| **Containers** | CViewContainer, CLayeredViewContainer, CScrollView, CRowColumnView, CSplitView, CShadowViewContainer, UIViewSwitchContainer |
| **Controls** | CSlider, CKnob, CAnimKnob, COnOffButton, CKickButton, CTextButton, CCheckBox, CSegmentButton, CVerticalSwitch, CHorizontalSwitch, CRockerSwitch, CXYPad |
| **Displays** | CTextLabel, CMultiLineTextLabel, CParamDisplay, CVuMeter, CGradientView |
| **Text Input** | CTextEdit, CSearchTextEdit, COptionMenu |
| **Animation** | CMovieBitmap, CMovieButton, CAutoAnimation, CAnimationSplashScreen, CStringListControl |

**Rationale**: These categories match VSTGUI's logical groupings in documentation and provide intuitive organization for users.

**Alternatives Considered**:
- Single flat list (rejected: too many items, poor discoverability)
- Alphabetical only (rejected: no semantic grouping)
- Functional grouping (considered: similar to chosen approach)

---

### 2. Default View Sizes

**Decision**: Define default sizes per view category

| Category | Default Size | Rationale |
|----------|--------------|-----------|
| Containers | 200 × 200 | Large enough to contain children |
| Controls (knobs) | 50 × 50 | Standard knob size |
| Controls (sliders) | 20 × 100 (vertical) or 100 × 20 (horizontal) | Common slider dimensions |
| Controls (buttons) | 100 × 30 | Fits text labels |
| Displays (text) | 100 × 20 | Single line text |
| Displays (meters) | 20 × 100 | Vertical meter |
| Text Input | 150 × 24 | Standard input field |
| Animation | 100 × 100 | Square animation frame |

**Alternatives Considered**:
- Single size for all (rejected: too small for containers, too large for buttons)
- User-configurable defaults (deferred: adds complexity, can add later)

---

### 3. Unique ID Generation Strategy

**Decision**: Use `view-{timestamp}-{random}` format

**Format**: `view-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

**Example**: `view-1736268000000-abc123def`

**Rationale**: 
- Timestamp provides rough ordering
- Random suffix prevents collisions
- Prefix makes IDs easily identifiable
- No external dependencies

**Alternatives Considered**:
- UUID v4 (rejected: overkill, requires dependency or more code)
- Sequential counter (rejected: would need global state across sessions)
- Hash of content (rejected: content may be identical for duplicates)

---

### 4. Clipboard Storage Format

**Decision**: Store serialized ViewNode objects with metadata

```typescript
interface ClipboardData {
  views: ViewNode[];           // Serialized view hierarchy
  sourceOrigins: Record<string, Point>;  // Original positions by ID
  copyTimestamp: number;       // When copied (for offset calculation)
  pasteCount: number;          // Times pasted (for incremental offset)
}
```

**Rationale**:
- Full ViewNode preserves all attributes
- Source origins enable offset calculation
- Paste count enables incremental offsets (10px, 20px, 30px...)

**Alternatives Considered**:
- System clipboard with JSON (rejected: security restrictions, cross-tab complexity)
- Reference-only clipboard (rejected: would break if source deleted)

---

### 5. Drop Target Detection Algorithm

**Decision**: Point-in-rect hit testing, deepest container wins

**Algorithm**:
1. Get all views under drop point (point-in-rect test)
2. Filter to container views only
3. Sort by depth (deepest first)
4. Return first container, or template root if none

**Existing Code**: `src/domain/canvas/hitTest.ts` already has `findViewAtPoint()` - extend for containers only

**Rationale**: Deepest container is most intuitive - user is dropping "into" the innermost container they can see.

**Alternatives Considered**:
- Visual z-order only (rejected: containers may overlap)
- User selects target (rejected: adds friction)

---

### 6. Ghost Preview Appearance

**Decision**: Reuse existing DragPreview styling pattern

**Appearance**:
- 50% opacity
- Dashed stroke (1px, 4px dash pattern)
- Blue stroke color (matches selection)
- Size based on view class defaults

**Source**: Existing `DragPreview.tsx` and `DragPreview.module.css`

**Rationale**: Consistent with existing drag preview for view moves.

---

### 7. Keyboard Shortcut Conflict Handling

**Decision**: Disable shortcuts when text inputs are focused

**Implementation**: Check `document.activeElement` before handling shortcuts

```typescript
const isTextInputFocused = () => {
  const active = document.activeElement;
  return active instanceof HTMLInputElement || 
         active instanceof HTMLTextAreaElement ||
         active?.getAttribute('contenteditable') === 'true';
};
```

**Existing Pattern**: `src/hooks/canvas/useCanvasKeyboard.ts` already filters shortcuts

**Rationale**: Users expect Delete in text fields to delete characters, not views.

---

### 8. Existing Utilities to Reuse

**From CLAUDE.md**:

| Utility | Location | Purpose |
|---------|----------|---------|
| `historyStore` | `src/stores/historyStore.ts` | Undo/redo stack |
| `pushOperation()` | `src/stores/historyStore.ts` | Add to history |
| `selectionStore` | `src/stores/selectionStore.ts` | Track selected views |
| `documentStore` | `src/stores/documentStore.ts` | Document state |
| `flattenHierarchy()` | `src/domain/canvas/index.ts` | View tree traversal |
| `parsePoint()`, `formatOrigin()` | `src/domain/canvas/move.ts` | Point utilities |
| `DragPreview` | `src/components/Canvas/DragPreview.tsx` | Drag visualization |

---

## Open Questions Resolved

| Question | Resolution |
|----------|------------|
| What happens when deleting root template? | Prevent - root cannot be deleted |
| What if pasting references missing resources? | Allow - references remain as strings |
| Multiple items from palette? | Not supported - one item at a time |
| Maximum clipboard size? | No limit - reasonable for typical documents |
