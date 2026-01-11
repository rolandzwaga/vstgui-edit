# Requirements Checklist: 038-keyboard-shortcuts

## Functional Requirements

### Shortcuts Panel
- [ ] FR-001: `?` key opens shortcuts panel when no input focused
- [ ] FR-002: `Ctrl+/` (or `Cmd+/` on Mac) opens shortcuts panel
- [ ] FR-003: Modal closes via Escape, click outside, or close button
- [ ] FR-004: Search input filters shortcuts in real-time
- [ ] FR-005: Shortcuts organized by category when not searching
- [ ] FR-006: Panel only accessible when document is loaded

### Search Functionality
- [ ] FR-007: Search matches key combination text (case-insensitive)
- [ ] FR-008: Search matches action description text (case-insensitive)
- [ ] FR-009: Results update in real-time as user types
- [ ] FR-010: "No shortcuts found" message for empty results
- [ ] FR-011: Search field auto-focused on panel open

### Shortcut Display
- [ ] FR-012: Key combination displayed in keyboard-key styled format
- [ ] FR-013: Action description displayed for each shortcut
- [ ] FR-014: Category headers shown when viewing all (no search)
- [ ] FR-015: Category headers hidden during search (flat results)

### Shortcut Categories
- [ ] FR-016: Categories: Canvas Navigation, Selection, Editing, Clipboard, Alignment, View Management, Grouping, Find/Replace, File, General
- [ ] FR-017: Each category collapsible/expandable
- [ ] FR-017a: All categories expanded by default

### Centralized Registry
- [ ] FR-018: Single source of truth for all shortcuts
- [ ] FR-019: Typed interface for registering shortcuts
- [ ] FR-020: Mac-specific key display (Cmd instead of Ctrl)

### Conflict Detection
- [ ] FR-021: Detect duplicate key combinations during initialization
- [ ] FR-022: Log conflicts to console as warnings
- [ ] FR-023: Visual warning icon with tooltip for conflicts

### Preferences Integration
- [ ] FR-024: Preferences shortcuts section uses centralized registry
- [ ] FR-025: Button in Preferences to open full shortcuts panel

### Panel Accessibility
- [ ] FR-026: Keyboard navigation (Tab, arrow keys)
- [ ] FR-027: Shortcut entries are focusable for screen readers

## Success Criteria

- [ ] SC-001: Panel opens within 1 second of trigger
- [ ] SC-002: Find any shortcut within 5 seconds via search
- [ ] SC-003: All 44 shortcuts catalogued in registry
- [ ] SC-004: Search updates within 100ms (instant feel)
- [ ] SC-005: Zero conflicts in default configuration
- [ ] SC-006: 90% discoverability for zoom shortcuts
- [ ] SC-007: Platform-specific key display accurate

## Implementation Notes

Total Requirements: 27 functional + 7 success criteria = 34 items

Categories to implement (10):
1. Canvas Navigation (10 shortcuts)
2. Selection (3 shortcuts)
3. Editing (6 shortcuts)
4. Clipboard (4 shortcuts)
5. Alignment (6 shortcuts)
6. View Management (5 shortcuts)
7. Grouping (2 shortcuts)
8. Find/Replace (4 shortcuts)
9. File (2 shortcuts)
10. General (2 shortcuts)

**Total: 44 shortcuts across 10 categories**
