# Research: JSON Save Format Option

**Feature**: 030-json-save-format | **Date**: 2026-01-10

## Research Tasks Completed

### 1. Split Button UI Pattern

**Decision**: Custom split button using two adjacent button elements with shared styling

**Rationale**:
- Native HTML split button pattern (button + button) provides best accessibility
- Matches existing button styling in SaveButton.module.css
- Visual separator via CSS border between main action and chevron areas
- No additional library needed

**Alternatives Considered**:
- Single button with click region detection - Rejected: Complex hit testing, accessibility issues
- Third-party component library - Rejected: Would add dependency, overkill for single component

**Implementation Pattern**:
```tsx
<div class={styles.splitButton} role="group">
  <button class={styles.mainAction} onClick={handleSave}>
    Save (JSON)
  </button>
  <button class={styles.chevron} onClick={toggleDropdown} aria-haspopup="menu">
    <ChevronIcon />
  </button>
</div>
```

### 2. Dropdown Positioning with @floating-ui/dom

**Decision**: Use existing @floating-ui/dom pattern from EnumEditor

**Rationale**:
- Already installed and used in codebase
- `computePosition` with `flip`, `offset`, `shift` middleware handles edge cases
- Proven pattern in EnumEditor.tsx

**Implementation Pattern**:
```typescript
import { computePosition, flip, offset, shift } from '@floating-ui/dom';

computePosition(buttonRef, dropdownRef, {
  placement: 'bottom-start',
  middleware: [offset(4), flip(), shift({ padding: 8 })],
}).then(({ x, y }) => {
  dropdownRef.style.left = `${x}px`;
  dropdownRef.style.top = `${y}px`;
});
```

### 3. Modal Dialog Pattern

**Decision**: Reuse dialog structure from AddControlTagDialog

**Rationale**:
- Existing pattern with backdrop, focus management, keyboard handling
- Consistent styling with design tokens
- Proven accessibility approach

**Key Features to Include**:
- Backdrop click closes dialog (optional for confirmation dialogs - may want explicit button)
- Escape key closes dialog
- Focus trap within dialog
- ARIA labels for accessibility

**Differences from AddControlTagDialog**:
- No form inputs - just message and two buttons
- Should NOT close on backdrop click (prevent accidental dismissal)
- Simpler structure: header, message, footer with buttons

### 4. localStorage Preference Storage

**Decision**: Simple key-value storage with JSON stringification

**Rationale**:
- Minimal data (single string value)
- No expiration needed
- No encryption required (non-sensitive)

**Implementation**:
```typescript
const STORAGE_KEY = 'vstgui-edit:save-format';

export function getSavedFormatPreference(): SaveFormat | null {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    if (value === 'json' || value === 'xml') {
      return value;
    }
    return null;
  } catch {
    return null; // localStorage unavailable (private browsing)
  }
}

export function saveFormatPreference(format: SaveFormat): void {
  try {
    localStorage.setItem(STORAGE_KEY, format);
  } catch {
    // Silently fail if localStorage unavailable
  }
}
```

### 5. Format Selection Logic

**Decision**: Three-tier priority for determining save format

**Priority Order**:
1. User-selected format (if explicitly changed this session)
2. Original file format (documentStore.originalFormat)
3. Persisted preference from localStorage
4. Default to 'json' if none of the above

**Rationale**:
- Respects loaded file format by default (prevents accidental format change)
- Remembers user preference across sessions
- JSON as fallback aligns with modern uidesc best practices

### 6. Keyboard Accessibility

**Decision**: Follow ARIA split button pattern

**Implementation**:
- Main button: Space/Enter triggers save
- Chevron button: Space/Enter/ArrowDown opens dropdown
- Dropdown: ArrowUp/ArrowDown navigates, Enter selects, Escape closes
- Ctrl+S saves in current format (existing behavior preserved)

**ARIA Attributes**:
```tsx
<div role="group" aria-label="Save options">
  <button aria-label="Save as JSON">Save (JSON)</button>
  <button aria-haspopup="menu" aria-expanded={isOpen()}>
    <span class="sr-only">Select save format</span>
  </button>
</div>
```

### 7. Format Change Confirmation Flow

**Decision**: Modal dialog with clear warning and explicit action buttons

**User Flow**:
1. User opens dropdown and selects different format
2. If format differs from originalFormat, show confirmation dialog
3. Dialog message: "The file was originally saved as [X]. Saving as [Y] may cause compatibility changes."
4. Two buttons: "Change Format" (primary) and "Cancel"
5. On confirm: update selected format, close dialog
6. On cancel: revert to original format, close dialog

**Edge Cases**:
- File has no original format (new document): No confirmation needed
- User re-selects same format: No confirmation needed
- User confirms format change, then changes back: Show confirmation again

## Technology Decisions Summary

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Split button pattern | Custom CSS/HTML | Simple, accessible, no dependency |
| Dropdown positioning | @floating-ui/dom | Already in codebase |
| Dialog pattern | Custom modal | Reuse AddControlTagDialog structure |
| Preference storage | localStorage | Simple, synchronous, sufficient |
| Default format | JSON | Modern uidesc best practice |

## Open Questions - RESOLVED

1. ~~Should dropdown stay open after selection?~~ **No** - matches existing EnumEditor behavior
2. ~~Should confirmation dialog have "Don't ask again" checkbox?~~ **No** - spec doesn't require it
3. ~~What if localStorage is unavailable?~~ **Silently fail** - graceful degradation
