# Data Model: Keyboard Shortcuts System

**Feature**: 038-keyboard-shortcuts
**Date**: 2026-01-11

## Entities

### ShortcutDefinition

Represents a single keyboard shortcut with all metadata.

| Field | Type | Description | Validation |
|-------|------|-------------|------------|
| id | string | Unique identifier | Required, unique across all shortcuts |
| keys | string | Key combination display string | Required, non-empty |
| description | string | Human-readable action description | Required, non-empty |
| category | ShortcutCategoryId | Category this shortcut belongs to | Required, valid category ID |
| context | string? | Optional context note (e.g., "when views selected") | Optional |

### ShortcutCategoryId

Enum of all category identifiers.

```typescript
type ShortcutCategoryId =
  | 'canvas'
  | 'selection'
  | 'editing'
  | 'clipboard'
  | 'alignment'
  | 'viewManagement'
  | 'grouping'
  | 'findReplace'
  | 'file'
  | 'general';
```

### ShortcutCategoryMeta

Metadata for a shortcut category.

| Field | Type | Description |
|-------|------|-------------|
| id | ShortcutCategoryId | Category identifier |
| name | string | Display name (e.g., "Canvas Navigation") |
| order | number | Sort order for display |

### ShortcutConflict

Represents a conflict between two shortcuts.

| Field | Type | Description |
|-------|------|-------------|
| normalizedKey | string | The conflicting key combination (lowercase, normalized) |
| shortcuts | ShortcutDefinition[] | Array of 2+ conflicting shortcuts |

### ShortcutsPanelState

UI state for the shortcuts panel (store).

| Field | Type | Description | Default |
|-------|------|-------------|---------|
| isOpen | boolean | Whether panel is visible | false |
| searchQuery | string | Current search filter | '' |
| expandedCategories | Set<string> | Set of expanded category IDs | All categories |

## Type Definitions

```typescript
// src/types/shortcuts.ts (new file)

/** Category identifier for shortcuts */
export type ShortcutCategoryId =
  | 'canvas'
  | 'selection'
  | 'editing'
  | 'clipboard'
  | 'alignment'
  | 'viewManagement'
  | 'grouping'
  | 'findReplace'
  | 'file'
  | 'general';

/** A single keyboard shortcut definition */
export interface ShortcutDefinition {
  /** Unique identifier */
  id: string;
  /** Key combination display (e.g., "Ctrl+Z") */
  keys: string;
  /** Action description */
  description: string;
  /** Category this shortcut belongs to */
  category: ShortcutCategoryId;
  /** Optional context note */
  context?: string;
}

/** Metadata for a shortcut category */
export interface ShortcutCategoryMeta {
  id: ShortcutCategoryId;
  name: string;
  order: number;
}

/** Represents a key combination conflict */
export interface ShortcutConflict {
  /** Normalized key (lowercase) */
  normalizedKey: string;
  /** Conflicting shortcut definitions */
  shortcuts: ShortcutDefinition[];
}

/** Shortcuts panel UI state */
export interface ShortcutsPanelState {
  isOpen: boolean;
  searchQuery: string;
  expandedCategories: Set<ShortcutCategoryId>;
}
```

## Category Definitions

```typescript
// Order and display names for categories
export const SHORTCUT_CATEGORIES: ShortcutCategoryMeta[] = [
  { id: 'canvas', name: 'Canvas Navigation', order: 1 },
  { id: 'selection', name: 'Selection', order: 2 },
  { id: 'editing', name: 'Editing', order: 3 },
  { id: 'clipboard', name: 'Clipboard', order: 4 },
  { id: 'alignment', name: 'Alignment', order: 5 },
  { id: 'viewManagement', name: 'View Management', order: 6 },
  { id: 'grouping', name: 'Grouping', order: 7 },
  { id: 'findReplace', name: 'Find/Replace', order: 8 },
  { id: 'file', name: 'File', order: 9 },
  { id: 'general', name: 'General', order: 10 },
];
```

## Complete Shortcut Registry

```typescript
export const SHORTCUT_REGISTRY: ShortcutDefinition[] = [
  // Canvas Navigation (10)
  { id: 'canvas-space-drag', keys: 'Space+Drag', description: 'Pan canvas', category: 'canvas' },
  { id: 'canvas-middle-drag', keys: 'Middle-mouse Drag', description: 'Pan canvas', category: 'canvas' },
  { id: 'canvas-ctrl-drag', keys: 'Ctrl+Drag', description: 'Pan canvas (alternative)', category: 'canvas' },
  { id: 'canvas-scroll', keys: 'Scroll Wheel', description: 'Zoom in/out', category: 'canvas' },
  { id: 'canvas-zoom-in', keys: '+/=', description: 'Zoom In', category: 'canvas' },
  { id: 'canvas-zoom-out', keys: '-', description: 'Zoom Out', category: 'canvas' },
  { id: 'canvas-zoom-reset', keys: '0', description: 'Reset Zoom (100%)', category: 'canvas' },
  { id: 'canvas-fit', keys: 'F', description: 'Fit to View', category: 'canvas' },
  { id: 'canvas-grid', keys: 'G', description: 'Toggle Grid Visibility', category: 'canvas' },
  { id: 'canvas-snap', keys: 'Shift+G', description: 'Toggle Snap to Grid', category: 'canvas' },

  // Selection (3)
  { id: 'select-click', keys: 'Click', description: 'Select view', category: 'selection' },
  { id: 'select-shift-click', keys: 'Shift+Click', description: 'Add to / Toggle selection', category: 'selection' },
  { id: 'select-all', keys: 'Ctrl+A', description: 'Select All', category: 'selection' },

  // Editing (6)
  { id: 'edit-undo', keys: 'Ctrl+Z', description: 'Undo', category: 'editing' },
  { id: 'edit-redo', keys: 'Ctrl+Y', description: 'Redo', category: 'editing' },
  { id: 'edit-redo-alt', keys: 'Ctrl+Shift+Z', description: 'Redo (alternative)', category: 'editing' },
  { id: 'edit-nudge', keys: 'Arrow Keys', description: 'Nudge 1px', category: 'editing', context: 'when views selected' },
  { id: 'edit-nudge-fast', keys: 'Shift+Arrow Keys', description: 'Nudge 10px', category: 'editing', context: 'when views selected' },
  { id: 'edit-delete', keys: 'Delete / Backspace', description: 'Delete selected views', category: 'editing', context: 'when views selected' },

  // Clipboard (4)
  { id: 'clipboard-copy', keys: 'Ctrl+C', description: 'Copy', category: 'clipboard', context: 'when views selected' },
  { id: 'clipboard-cut', keys: 'Ctrl+X', description: 'Cut', category: 'clipboard', context: 'when views selected' },
  { id: 'clipboard-paste', keys: 'Ctrl+V', description: 'Paste', category: 'clipboard' },
  { id: 'clipboard-duplicate', keys: 'Ctrl+D', description: 'Duplicate', category: 'clipboard', context: 'when views selected' },

  // Alignment (6)
  { id: 'align-left', keys: 'Ctrl+Shift+L', description: 'Align Left', category: 'alignment', context: 'when views selected' },
  { id: 'align-center', keys: 'Ctrl+Shift+C', description: 'Align Center', category: 'alignment', context: 'when views selected' },
  { id: 'align-right', keys: 'Ctrl+Shift+R', description: 'Align Right', category: 'alignment', context: 'when views selected' },
  { id: 'align-top', keys: 'Ctrl+Shift+T', description: 'Align Top', category: 'alignment', context: 'when views selected' },
  { id: 'align-middle', keys: 'Ctrl+Shift+M', description: 'Align Middle', category: 'alignment', context: 'when views selected' },
  { id: 'align-bottom', keys: 'Ctrl+Shift+B', description: 'Align Bottom', category: 'alignment', context: 'when views selected' },

  // View Management (5)
  { id: 'view-smart-guides', keys: 'S', description: 'Toggle Smart Guides', category: 'viewManagement' },
  { id: 'view-custom-guides', keys: 'Ctrl+;', description: 'Toggle Custom Guides Visibility', category: 'viewManagement' },
  { id: 'view-lock', keys: 'Ctrl+L', description: 'Lock/Unlock Selected', category: 'viewManagement', context: 'when views selected' },
  { id: 'view-hide', keys: 'Ctrl+H', description: 'Hide/Show Selected', category: 'viewManagement', context: 'when views selected' },
  { id: 'view-show-all', keys: 'Ctrl+Shift+H', description: 'Show All Hidden', category: 'viewManagement' },

  // Grouping (2)
  { id: 'group-create', keys: 'Ctrl+G', description: 'Group selected views', category: 'grouping', context: 'when 2+ views selected' },
  { id: 'group-ungroup', keys: 'Ctrl+Shift+G', description: 'Ungroup container', category: 'grouping', context: 'when container selected' },

  // Find/Replace (4)
  { id: 'find-open', keys: 'Ctrl+F', description: 'Open Find panel', category: 'findReplace' },
  { id: 'find-replace-open', keys: 'Ctrl+Shift+F', description: 'Open Find/Replace panel', category: 'findReplace' },
  { id: 'find-next', keys: 'F3', description: 'Find Next', category: 'findReplace' },
  { id: 'find-prev', keys: 'Shift+F3', description: 'Find Previous', category: 'findReplace' },

  // File (2)
  { id: 'file-save', keys: 'Ctrl+S', description: 'Save', category: 'file' },
  { id: 'file-preferences', keys: 'Ctrl+,', description: 'Open Preferences', category: 'file' },

  // General (2)
  { id: 'general-escape', keys: 'Escape', description: 'Cancel operation / Clear selection / Close panel', category: 'general' },
  { id: 'general-shortcuts', keys: '? / Ctrl+/', description: 'Open Keyboard Shortcuts panel', category: 'general' },
];
```

## Relationships

```
ShortcutCategoryMeta (10 categories)
        |
        v
ShortcutDefinition (44 shortcuts)
        |
        +---> ShortcutConflict (detected at init, 0 in production)
        |
        v
ShortcutsPanelState (UI state)
```

## State Transitions

### ShortcutsPanelState

```
                  openShortcutsPanel()
    [Closed] ------------------------> [Open]
       ^                                  |
       |   closeShortcutsPanel()         |
       +----------------------------------+
                   Escape key

    [Open] + search input change --> [Open] with filtered results
    [Open] + category toggle --> [Open] with updated expandedCategories
```

## Validation Rules

1. **Shortcut ID uniqueness**: All `id` fields must be unique across the registry
2. **Category validity**: All `category` values must be valid `ShortcutCategoryId`
3. **Key combination format**: `keys` should follow pattern: `Modifier+Key` or `Key`
4. **Conflict detection**: No two shortcuts should have identical normalized keys (enforced at build time with warnings)

## Platform Display Adaptation

Keys display adapts based on platform:

| Registry Value | Windows/Linux Display | macOS Display |
|----------------|----------------------|---------------|
| `Ctrl+Z` | Ctrl+Z | Cmd+Z |
| `Ctrl+Shift+L` | Ctrl+Shift+L | Cmd+Shift+L |
| `Ctrl+A` | Ctrl+A | Cmd+A |

Note: Registry stores `Ctrl+` format. Display function converts to `Cmd+` on Mac.
