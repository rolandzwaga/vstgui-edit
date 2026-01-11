# Implementation Plan: Keyboard Shortcuts System

**Branch**: `038-keyboard-shortcuts` | **Date**: 2026-01-11 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/038-keyboard-shortcuts/spec.md`

## Summary

Implement a centralized keyboard shortcuts system providing a searchable reference panel accessible via `?` or `Ctrl+/`, consolidating all 44 shortcuts across 10 categories with conflict detection, platform-aware key display (Ctrl vs Cmd), and integration with the existing Preferences panel.

## Technical Context

**Language/Version**: TypeScript 5.9.3 (strict mode)
**Primary Dependencies**: SolidJS 1.9.10, Vite 7.3.0
**Storage**: N/A (session-only UI state, no persistence)
**Testing**: Vitest 4.0.16 with @solidjs/testing-library
**Testing Guide**: `specs/TESTING-GUIDE.md` - MUST be consulted for all test tasks
**Target Platform**: Web (Windows/Linux/macOS browsers)
**Project Type**: Single SolidJS web application
**Performance Goals**: Panel opens < 1 second, search response < 100ms
**Constraints**: No new dependencies (constitution XI)
**Scale/Scope**: 44 shortcuts, 10 categories, single modal panel

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Test-First Development | PASS | All components/functions will have tests first |
| II. Technology Stack | PASS | SolidJS only, no React patterns |
| IV. Code Quality | PASS | Will run biome, stylelint, tsc on completion |
| VI. Testing Standards | PASS | Unit tests for domain, component tests for UI |
| XI. Dependency Management | PASS | No new dependencies required |
| XII. Framework Restrictions | PASS | SolidJS patterns only (createSignal, createStore) |
| XVIII. Zero Failing Tests | PASS | All tests must pass before completion |
| XX. Technical Overview | PASS | CLAUDE.md consulted, will be updated |
| XXI. Static Imports ONLY | PASS | No dynamic imports planned |
| XXIII. Quality Gates | PASS | lint:css, check, typecheck will run |

**Pre-Design Gate**: PASSED - No violations

## Project Structure

### Documentation (this feature)

```text
specs/038-keyboard-shortcuts/
├── plan.md              # This file
├── research.md          # Phase 0 research output
├── data-model.md        # Entity definitions
├── quickstart.md        # Implementation guide
├── contracts/           # API contracts
│   ├── shortcutsRegistry.ts
│   └── shortcutsPanelStore.ts
└── tasks.md             # Phase 2 output (to be generated)
```

### Source Code (repository root)

```text
src/
├── types/
│   └── shortcuts.ts                    # NEW: Type definitions
├── domain/
│   └── shortcuts/                      # NEW: Domain logic
│       ├── index.ts                    # Barrel export
│       ├── registry.ts                 # Shortcut definitions + queries
│       ├── search.ts                   # Search/filter utilities
│       ├── conflicts.ts                # Conflict detection
│       ├── platform.ts                 # Platform detection (Ctrl/Cmd)
│       └── __tests__/
│           ├── registry.spec.ts
│           ├── search.spec.ts
│           ├── conflicts.spec.ts
│           └── platform.spec.ts
├── stores/
│   ├── shortcutsPanelStore.ts          # NEW: Panel state
│   └── __tests__/
│       └── shortcutsPanelStore.spec.ts
├── components/
│   └── ShortcutsPanel/                 # NEW: Panel components
│       ├── ShortcutsPanel.tsx          # Main modal
│       ├── ShortcutsPanel.module.css
│       ├── ShortcutSearch.tsx          # Search input
│       ├── ShortcutSearch.module.css
│       ├── ShortcutCategory.tsx        # Collapsible category
│       ├── ShortcutCategory.module.css
│       ├── ShortcutItem.tsx            # Single shortcut row
│       ├── ShortcutItem.module.css
│       └── __tests__/
│           ├── ShortcutsPanel.spec.tsx
│           ├── ShortcutSearch.spec.tsx
│           ├── ShortcutCategory.spec.tsx
│           └── ShortcutItem.spec.tsx
├── hooks/canvas/
│   └── useCanvasKeyboard.ts            # MODIFY: Add ? and Ctrl+/ handlers
├── domain/preferences/
│   └── keyboardShortcuts.ts            # MODIFY: Delegate to new registry
└── components/PreferencesPanel/sections/
    └── KeyboardShortcutsSection.tsx    # MODIFY: Add "Open Full Panel" button
```

**Structure Decision**: Single project structure. New domain module `shortcuts/` follows existing patterns (`alignment/`, `guides/`, `rulers/`). New component folder `ShortcutsPanel/` follows existing patterns (`PreferencesPanel/`, `HierarchyPanel/`).

## Architecture Decisions

### 1. Shortcut Registry Design

**Decision**: Flat array of ShortcutDefinition objects with category field

**Rationale**:
- Simple to search/filter
- Categories derived via groupBy operations
- Easy to extend with new shortcuts
- Single source of truth

**Alternative rejected**: Nested object by category - harder to search, more complex to maintain

### 2. Panel State Management

**Decision**: New `shortcutsPanelStore` (SolidJS store)

**Rationale**:
- Follows project patterns (gridStore, selectionStore, etc.)
- Separates panel UI state from shortcut data
- Session-only (no persistence needed)

### 3. Search Implementation

**Decision**: Client-side substring matching (case-insensitive)

**Rationale**:
- 44 items is trivially small
- No debounce needed
- Instant feedback for users

### 4. Platform Detection

**Decision**: Use `navigator.platform` with "Mac" detection

**Rationale**:
- Standard browser API
- No dependencies needed
- Well-established pattern

### 5. Conflict Detection

**Decision**: Build-time detection with console.warn + visual indicator

**Rationale**:
- Development-time concern only
- Warning icon helps developers identify issues
- No runtime performance impact

### 6. Category Expansion

**Decision**: Reuse `CollapsibleSection` component

**Rationale**:
- Component exists and is tested
- Consistent UX across application
- Supports defaultExpanded for FR-017a

### 7. Keyboard Accessibility

**Decision**: Tab navigation + Arrow key navigation within list

**Rationale**:
- WCAG 2.1 AA compliance (constitution IX)
- Tab: search -> shortcut list -> close button
- Arrow: navigate within shortcut items
- Focus visible indicators

## Component Hierarchy

```
App
└── ShortcutsPanel (modal)
    ├── Header (title + close button)
    ├── ShortcutSearch (auto-focused input)
    └── ShortcutList
        └── For each category:
            └── ShortcutCategory (collapsible)
                └── For each shortcut:
                    └── ShortcutItem (kbd + description + conflict indicator)
```

## Integration Points

1. **useCanvasKeyboard.ts**: Add handlers for `?` and `Ctrl+/`
2. **KeyboardShortcutsSection.tsx**: Refactor to use registry, add button to open panel
3. **App.tsx**: Mount ShortcutsPanel component
4. **documentStore check**: Panel only available when document loaded (FR-006)
5. **preferencesStore check**: Don't open panel when Preferences is open

## Requirement Mapping

| Requirement | Implementation |
|-------------|----------------|
| FR-001, FR-002 | useCanvasKeyboard.ts handler |
| FR-003 | ShortcutsPanel modal (Escape, overlay click, close button) |
| FR-004 | ShortcutSearch component |
| FR-005 | ShortcutCategory component with groupBy |
| FR-006 | documentStore.document check in handler |
| FR-007, FR-008 | search.ts searchShortcuts() |
| FR-009 | Real-time filter (no debounce) |
| FR-010 | Empty state in ShortcutsPanel |
| FR-011 | searchInputRef.focus() on open |
| FR-012 | ShortcutItem kbd styling |
| FR-013 | ShortcutItem description |
| FR-014 | Category headers when no search |
| FR-015 | Flat list when searching |
| FR-016 | SHORTCUT_CATEGORIES constant |
| FR-017 | CollapsibleSection component |
| FR-017a | defaultExpanded=true |
| FR-018 | SHORTCUT_REGISTRY constant |
| FR-019 | ShortcutDefinition type |
| FR-020 | platform.ts formatKeysForPlatform() |
| FR-021 | conflicts.ts detectConflicts() |
| FR-022 | console.warn in detectConflicts() |
| FR-023 | ShortcutItem warning icon + tooltip |
| FR-024 | KeyboardShortcutsSection uses registry |
| FR-025 | Button to open ShortcutsPanel |
| FR-026 | Tab + Arrow key navigation |
| FR-027 | tabIndex={0} on shortcut items |

## Post-Design Constitution Re-Check

| Principle | Status | Notes |
|-----------|--------|-------|
| II. Technology Stack | PASS | SolidJS store, signals, For/Show |
| IV. Code Quality | PASS | CSS modules, design tokens |
| VI. Testing Standards | PASS | Tests co-located in __tests__/ |
| XI. Dependency Management | PASS | No new dependencies |
| XV. Styling Architecture | PASS | CSS modules, tokens.css |

**Post-Design Gate**: PASSED - No violations

## Complexity Tracking

> No violations requiring justification.

## Implementation Phases

### Phase 1: Foundation
- Types (shortcuts.ts)
- Registry (registry.ts, constants, query functions)
- Platform detection (platform.ts)
- Search utilities (search.ts)
- Conflict detection (conflicts.ts)

### Phase 2: State Management
- shortcutsPanelStore (open/close, search query, expanded categories)

### Phase 3: Components
- ShortcutItem (smallest unit)
- ShortcutCategory (uses ShortcutItem)
- ShortcutSearch (input)
- ShortcutsPanel (main modal)

### Phase 4: Integration
- useCanvasKeyboard.ts (keyboard triggers)
- KeyboardShortcutsSection.tsx (Preferences integration)
- App.tsx mounting

### Phase 5: Cleanup
- Quality gates (lint:css, check, typecheck)
- Coverage verification
- CLAUDE.md update

## Risk Assessment

| Risk | Mitigation |
|------|------------|
| Keyboard conflicts with existing shortcuts | Conflict detection + console.warn |
| Modal focus trap complexity | Follow PreferencesPanel pattern |
| Platform detection edge cases | Default to Ctrl if detection fails |
| Large test surface | Break into small, focused test files |

## Next Steps

Run `/speckit.tasks` to generate task breakdown for implementation.
