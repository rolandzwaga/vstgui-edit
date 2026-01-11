# Research: Keyboard Shortcuts System

**Feature**: 038-keyboard-shortcuts
**Date**: 2026-01-11

## Research Tasks

### 1. Modal Dialog Pattern for Shortcuts Panel

**Decision**: Reuse existing `PreferencesPanel` modal pattern

**Rationale**:
- Project already has a working modal implementation in `PreferencesPanel.tsx`
- Pattern includes: overlay, panel positioning, Escape handling, focus management
- CSS tokens and styles are established (`--z-modal`, overlay, panel classes)
- Consistent UX across the application

**Alternatives considered**:
- Ark UI Dialog component: Would require new dependency (blocked by constitution XI)
- Custom implementation: Unnecessary when existing pattern works

### 2. Shortcut Registry Architecture

**Decision**: Extend existing `KEYBOARD_SHORTCUTS` in `src/domain/preferences/keyboardShortcuts.ts`

**Rationale**:
- 23 shortcuts already defined in this file
- Existing types (`KeyboardShortcut`, `ShortcutCategory`) cover the use case
- Minimal refactoring needed

**Required extensions**:
1. Add missing shortcuts from spec (~44 total)
2. Add platform detection utility for Ctrl/Cmd display
3. Add conflict detection function
4. Add search/filter utilities

**Alternatives considered**:
- New registry class with registration API: Over-engineered for read-only shortcuts
- Distributed shortcut definitions: Would lose single source of truth

### 3. Search Implementation

**Decision**: Client-side filtering with case-insensitive substring matching

**Rationale**:
- ~44 shortcuts is a small dataset
- No debounce needed (instant feedback)
- Simple string matching sufficient for key combinations and descriptions

**Implementation approach**:
```typescript
function filterShortcuts(
  categories: ShortcutCategory[],
  query: string
): KeyboardShortcut[] {
  const lowerQuery = query.toLowerCase();
  return categories
    .flatMap(cat => cat.shortcuts)
    .filter(s =>
      s.keys.toLowerCase().includes(lowerQuery) ||
      s.description.toLowerCase().includes(lowerQuery)
    );
}
```

### 4. Platform Detection

**Decision**: Use `navigator.platform` or `navigator.userAgentData.platform`

**Rationale**:
- Standard browser API
- Simple detection: contains "Mac" = macOS
- No dependency needed

**Implementation**:
```typescript
function isMacPlatform(): boolean {
  return navigator.platform?.toLowerCase().includes('mac') ?? false;
}

function getModifierKey(): string {
  return isMacPlatform() ? 'Cmd' : 'Ctrl';
}
```

### 5. Conflict Detection

**Decision**: Build-time detection with console.warn in development

**Rationale**:
- Conflicts are development-time issues per spec
- Console warnings are sufficient for developer awareness
- Visual indicator (warning icon) in panel helps identify issues

**Implementation approach**:
```typescript
function detectConflicts(categories: ShortcutCategory[]): ShortcutConflict[] {
  const keyMap = new Map<string, KeyboardShortcut[]>();
  // Group shortcuts by normalized key
  // Return pairs where count > 1
}
```

### 6. Collapsible Categories

**Decision**: Reuse existing `CollapsibleSection` component

**Rationale**:
- Component exists at `src/components/CollapsibleSection/CollapsibleSection.tsx`
- Supports `defaultExpanded` prop (FR-017a requires all expanded by default)
- Has proper accessibility (aria-expanded)

### 7. Keyboard Accessibility (FR-026, FR-027)

**Decision**: Implement focus management with Tab and Arrow key navigation

**Rationale**:
- WCAG 2.1 AA compliance required (constitution IX)
- Tab moves between search input and shortcut list
- Arrow keys navigate within shortcut list
- Each shortcut item must be focusable for screen readers

**Implementation approach**:
- Search input auto-focused on panel open (FR-011)
- Tab from search to first shortcut, Tab from last shortcut to close button
- Arrow up/down navigates shortcut items
- `tabIndex={0}` on shortcut items for focusability

### 8. Panel Trigger Integration

**Decision**: Add `?` and `Ctrl+/` handlers to `useCanvasKeyboard` hook

**Rationale**:
- Central keyboard handler already exists
- All other shortcuts are handled here
- Consistent pattern

**Edge cases handled**:
- No trigger when input/textarea focused (existing check)
- No trigger when another modal is open (preferencesStore.isOpen check)
- Only active when document is loaded (FR-006)

### 9. Preferences Panel Integration

**Decision**: Add "Open Full Panel" button to KeyboardShortcutsSection

**Rationale**:
- FR-024/FR-025 require Preferences to use registry and link to full panel
- Existing section already displays shortcuts
- Simple button click to open standalone panel

### 10. State Management

**Decision**: Create `shortcutsPanelStore` for panel state

**Store structure**:
```typescript
interface ShortcutsPanelState {
  isOpen: boolean;
  searchQuery: string;
  expandedCategories: Set<string>;
}
```

**Rationale**:
- Follows project pattern (see gridStore, selectionStore, etc.)
- Separates panel UI state from shortcut data
- Session-only state (no localStorage persistence per spec assumptions)

## Resolved Clarifications

| Unknown | Resolution |
|---------|------------|
| Number of categories | 10 categories per spec (Canvas Navigation, Selection, Editing, Clipboard, Alignment, View Management, Grouping, Find/Replace, File, General) |
| Total shortcuts | ~44 shortcuts across all categories |
| Search algorithm | Simple substring matching (case-insensitive) |
| Category default state | All expanded by default (FR-017a) |
| State persistence | Session-only, not persisted |
| Conflict display | Warning icon with tooltip |
| Platform detection | navigator.platform API |

## Dependencies

No new dependencies required. All functionality can be implemented using:
- Existing SolidJS primitives
- Existing components (CollapsibleSection, modal pattern)
- Existing CSS tokens and patterns
