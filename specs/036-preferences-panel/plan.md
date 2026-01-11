# Implementation Plan: Preferences Panel

**Branch**: `036-preferences-panel` | **Date**: 2026-01-11 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/036-preferences-panel/spec.md`

## Summary

Implement a centralized preferences panel modal dialog for managing all editor settings. The panel consolidates scattered localStorage keys into a unified `vstgui-edit:preferences` namespace, provides a sidebar-navigated UI for 6 settings sections (Grid, Snap, Smart Guides, Custom Guides, Theme, Keyboard Shortcuts), and includes migration of existing preferences with immediate deletion of legacy keys.

## Technical Context

**Language/Version**: TypeScript 5.9.3 (strict mode)
**Primary Dependencies**: SolidJS 1.9.10, @floating-ui/dom 1.7.4, solid-fontawesome
**Storage**: localStorage (unified key: `vstgui-edit:preferences`)
**Testing**: Vitest 4.x with @solidjs/testing-library
**Testing Guide**: `specs/TESTING-GUIDE.md` - MUST be consulted for all test tasks
**Target Platform**: Web browser (modern evergreen browsers)
**Project Type**: SolidJS SPA
**Performance Goals**: Panel opens in <500ms (SC-003), 60fps interactions
**Constraints**: No external modal libraries, CSS modules only, no dynamic imports
**Scale/Scope**: 6 settings sections, 23 keyboard shortcuts reference, ~10 individual settings

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Gate | Status | Notes |
|------|--------|-------|
| SolidJS Only (XII) | PASS | No React patterns - using createSignal, createEffect, createStore |
| Static Imports (XXI) | PASS | No dynamic imports - all imports at file top |
| Test-First (I) | PASS | All components/utilities will have tests written first |
| CSS Modules (XV) | PASS | Using `*.module.css` pattern per existing codebase |
| No New Dependencies (XI) | PASS | Using existing @floating-ui/dom, no new packages needed |
| Accessibility (IX) | PASS | WCAG 2.1 AA: keyboard nav, ARIA labels, focus trap |
| Undo/Redo (V) | N/A | Preferences are not undoable operations |

## Project Structure

### Documentation (this feature)

```text
specs/036-preferences-panel/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
└── tasks.md             # Phase 2 output (from /speckit.tasks)
```

### Source Code (repository root)

```text
src/
├── components/
│   └── PreferencesPanel/
│       ├── PreferencesPanel.tsx           # Main modal container
│       ├── PreferencesPanel.module.css    # Modal styling
│       ├── PreferencesSidebar.tsx         # Section navigation
│       ├── PreferencesSidebar.module.css
│       ├── sections/
│       │   ├── GridSection.tsx            # Grid settings
│       │   ├── SnapSection.tsx            # Snap settings
│       │   ├── SmartGuidesSection.tsx     # Smart guides settings
│       │   ├── CustomGuidesSection.tsx    # Custom guides settings
│       │   ├── ThemeSection.tsx           # Theme selection (stubbed)
│       │   └── KeyboardShortcutsSection.tsx # Shortcuts reference
│       ├── controls/
│       │   ├── SettingToggle.tsx          # Reusable toggle switch
│       │   ├── SettingSelect.tsx          # Reusable dropdown
│       │   └── SettingSlider.tsx          # Reusable slider
│       ├── ResetConfirmDialog.tsx         # Reset confirmation modal
│       ├── index.ts
│       └── __tests__/
│           ├── PreferencesPanel.spec.tsx
│           ├── PreferencesSidebar.spec.tsx
│           ├── GridSection.spec.tsx
│           ├── SnapSection.spec.tsx
│           ├── SmartGuidesSection.spec.tsx
│           ├── CustomGuidesSection.spec.tsx
│           ├── ThemeSection.spec.tsx
│           ├── KeyboardShortcutsSection.spec.tsx
│           ├── ResetConfirmDialog.spec.tsx
│           ├── SettingToggle.spec.tsx
│           ├── SettingSelect.spec.tsx
│           ├── SettingSlider.spec.tsx
│           └── PreferencesPanel.integration.spec.tsx
│
├── stores/
│   ├── preferencesStore.ts               # Unified preferences state
│   └── __tests__/
│       └── preferencesStore.spec.ts
│
├── domain/
│   └── preferences/
│       ├── types.ts                      # Preference types
│       ├── defaults.ts                   # Default values
│       ├── persistence.ts                # localStorage operations
│       ├── migration.ts                  # Legacy key migration
│       ├── validation.ts                 # Schema validation
│       ├── keyboardShortcuts.ts          # Shortcuts data
│       └── __tests__/
│           ├── persistence.spec.ts
│           ├── migration.spec.ts
│           ├── validation.spec.ts
│           └── keyboardShortcuts.spec.ts
│
└── types/
    └── preferences.ts                    # Type exports
```

**Structure Decision**: Single SPA structure following existing codebase patterns. New components under `src/components/PreferencesPanel/`, domain logic under `src/domain/preferences/`, store under `src/stores/`.

## Complexity Tracking

No constitution violations requiring justification.

## Phase 0: Research Summary

### Research Tasks

1. **Modal Dialog Pattern**: How does FormatChangeDialog handle focus trap, Escape key, overlay click?
2. **localStorage Persistence**: How do alignmentToolbarStore and saveFormatStore persist/load state?
3. **Store Initialization**: How do existing stores initialize and apply saved preferences?
4. **Settings Control Patterns**: How do existing editors (BooleanEditor, EnumEditor, NumberEditor) handle state?

### Research Findings

#### 1. Modal Dialog Pattern (FormatChangeDialog)

**Decision**: Follow FormatChangeDialog pattern exactly.

**Pattern discovered**:
- Overlay with `position: fixed; inset: 0; z-index: var(--z-modal)`
- Dialog centered via flexbox on overlay
- Click overlay = close (onClick handler)
- Click dialog = stopPropagation
- Escape key via document keydown listener in createEffect
- Focus management: requestAnimationFrame to focus primary action after render
- onCleanup to remove event listeners
- Show/when conditional rendering

**Key code patterns**:
```typescript
// Focus trap on open
createEffect(() => {
  if (props.isOpen) {
    document.addEventListener('keydown', handleKeyDown);
    requestAnimationFrame(() => confirmButtonRef?.focus());
  }
});

// Cleanup
onCleanup(() => document.removeEventListener('keydown', handleKeyDown));

// Overlay click
<div class={styles.overlay} onClick={props.onCancel}>
  <div onClick={(e) => e.stopPropagation()}>...</div>
</div>
```

#### 2. localStorage Persistence Pattern

**Decision**: Follow alignmentToolbarStore pattern with improvements.

**Pattern from alignmentToolbarStore**:
- STORAGE_KEY constant exported
- loadState() reads, parses JSON, applies defaults for missing fields
- saveState() stringifies and writes
- try/catch for localStorage unavailability (private browsing)
- Invalid JSON silently uses defaults

**Pattern from formatPreference**:
- Type guard `isValidSaveFormat()` for validation
- Returns null if invalid (not undefined)
- Separate functions: get, set, clear

**Unified preference pattern**:
- Single STORAGE_KEY: `'vstgui-edit:preferences'`
- Schema validation with AJV (already in project)
- Silent reset to defaults on corruption with console.warn
- Migration runs once on first load

#### 3. Store Initialization Pattern

**Decision**: New preferencesStore initializes on app load, applies to existing stores.

**Current stores (gridStore, smartGuidesStore, guidesStore)**:
- No persistence - reset to defaults on page load
- Expose setters for external configuration

**New pattern**:
- preferencesStore loads from localStorage on module init
- preferencesStore.initializeFromStorage() called in App.tsx
- Applies loaded values to gridStore, smartGuidesStore, guidesStore
- Changes auto-save via createEffect watching preferences

#### 4. Settings Control Patterns

**Decision**: Create simplified preference-specific controls (not full property editors).

**Reusable controls needed**:
- SettingToggle: Checkbox with label (simpler than BooleanEditor)
- SettingSelect: Dropdown for enums (like EnumEditor but with label)
- SettingSlider: Range input for thresholds (new)

**Differences from property editors**:
- No onCommit/onCancel (auto-save)
- Integrated labels
- Simpler validation (type-based, not uidesc validation)

### Decisions Log

| Decision | Rationale | Alternatives Rejected |
|----------|-----------|----------------------|
| Single unified localStorage key | Simplifies migration, reduces key clutter | Per-setting keys (scattered, hard to manage) |
| Immediate migration deletion | App not in production, no backward compat needed | Graceful deprecation period (unnecessary complexity) |
| Schema validation with AJV | Already in project, robust validation | Manual validation (error-prone) |
| Silent reset on corruption | Better UX than error dialogs for edge case | Error notification (confusing for users) |
| Sidebar navigation | User-requested pattern, scales to 6 sections | Tabs (horizontal space limited), Accordion (poor UX for shortcuts) |

## Phase 1: Design Artifacts

### Data Model

See [data-model.md](./data-model.md) for complete entity definitions.

**Key Entities**:
- `UserPreferences`: Complete preferences object stored in localStorage
- `PreferencesSection`: Enum for navigation sections
- `KeyboardShortcut`: Read-only shortcut reference entry
- `ThemePreference`: 'light' | 'dark' | 'system'

### API Contracts

See [contracts/](./contracts/) directory.

**Key contracts**:
- `preferencesStore` API (signals and actions)
- `PreferencesPanel` component props
- Settings section component props
- Control component props

### Quickstart

See [quickstart.md](./quickstart.md) for implementation guide.

## Migration Strategy

### Legacy Keys to Migrate

| Old Key | New Location | Action |
|---------|--------------|--------|
| `vstgui-edit:alignment-toolbar` | `preferences.ui.alignmentToolbar` | Migrate, delete old |
| `vstgui-edit:save-format` | `preferences.save.format` | Migrate, delete old |

### Migration Flow

1. On first preferencesStore initialization
2. Check if new unified key exists
3. If not, read old keys and construct preferences object
4. Write to new unified key
5. Delete old keys immediately (no backward compat period)
6. Log migration in console.info

### Corruption Handling

1. Read localStorage value
2. Parse JSON (catch syntax errors)
3. Validate against schema (AJV)
4. If invalid: console.warn with details, reset to defaults
5. Never show user-facing error for corruption

## Integration Points

### MainToolbar Integration

Add PreferencesButton between AlignmentToolbar and end of toolbar:
```typescript
// MainToolbar.tsx
<SaveButton />
<ZoomToolbar />
<GridToolbar />
<AlignmentToolbar />
<PreferencesButton onClick={openPreferences} /> // NEW
```

### Keyboard Shortcut (Ctrl+,)

Register in existing keyboard handling (EditorPage or similar):
```typescript
if (e.key === ',' && (e.ctrlKey || e.metaKey)) {
  e.preventDefault();
  openPreferencesPanel();
}
```

### Store Synchronization

When preferences change in panel:
1. preferencesStore updates internal state
2. createEffect triggers auto-save to localStorage
3. createEffect applies changes to existing stores (gridStore, etc.)
4. Canvas updates reactively

## Testing Strategy

### Unit Tests
- preferencesStore: load, save, reset, migration
- persistence.ts: get, set, clear, unavailability
- migration.ts: legacy key detection, migration, cleanup
- validation.ts: schema validation, corruption handling
- Each settings section component
- Each reusable control

### Integration Tests
- Full preferences flow: open, modify, close, verify persistence
- Migration: existing keys migrate correctly
- Store sync: preferences changes apply to canvas

### Accessibility Tests
- Focus trap in modal
- Keyboard navigation through sections
- ARIA labels and roles
- Screen reader announcements

## File Dependencies

```
preferencesStore.ts
  └── depends on: domain/preferences/persistence.ts
  └── depends on: domain/preferences/migration.ts
  └── depends on: domain/preferences/defaults.ts
  └── depends on: domain/preferences/validation.ts

PreferencesPanel.tsx
  └── depends on: preferencesStore
  └── depends on: PreferencesSidebar
  └── depends on: sections/*
  └── depends on: ResetConfirmDialog

sections/GridSection.tsx
  └── depends on: preferencesStore
  └── depends on: controls/SettingSelect
  └── depends on: controls/SettingToggle
```

## Risk Assessment

| Risk | Mitigation |
|------|------------|
| Focus trap complexity | Use existing FormatChangeDialog pattern |
| Store synchronization timing | Test with createEffect ordering |
| Migration edge cases | Comprehensive tests for all legacy key combinations |
| Theme stubbing unclear | Document stubbed behavior clearly in code |
