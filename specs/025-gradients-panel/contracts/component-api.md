# Component API Contract: Gradients Panel

**Feature**: 025-gradients-panel  
**Date**: 2026-01-08

## Module: `src/components/GradientsPanel/`

### GradientsPanel.tsx

```typescript
import type { Component } from 'solid-js';

/**
 * Main gradients panel component.
 * Renders in CollapsibleSection, reads from documentStore.
 * 
 * Requirements:
 * - FR-001: Display "Gradients" section in left sidebar
 * - FR-002: Display all gradient definitions as scrollable list
 * - FR-004: Show empty state when no gradients defined
 */
const GradientsPanel: Component = () => { ... };

export { GradientsPanel };
```

### GradientItem.tsx

```typescript
import type { Component } from 'solid-js';
import type { GradientColorStop } from '../../types/uidesc';

interface GradientItemProps {
  /** Gradient name (unique identifier) */
  name: string;
  /** Color stops array */
  stops: GradientColorStop[];
  /** Number of views using this gradient */
  usageCount: number;
  /** Whether detail editor is expanded */
  isExpanded: boolean;
  /** Toggle expand/collapse */
  onToggleExpand: () => void;
  /** Rename gradient */
  onRename: (newName: string) => void;
  /** Delete gradient */
  onDelete: () => void;
  /** Update gradient stops */
  onStopsChange: (stops: GradientColorStop[]) => void;
}

/**
 * Individual gradient item in the list.
 * Shows name, preview, usage badge; expands to show stop editor.
 * 
 * Requirements:
 * - FR-003: Show gradient name and horizontal linear preview
 * - FR-008: Double-click name to rename
 * - FR-010: Click to expand and see stop editor
 * - FR-017: Delete button on hover
 * - FR-020: Usage count badge
 */
const GradientItem: Component<GradientItemProps> = (props) => { ... };

export { GradientItem };
export type { GradientItemProps };
```

### GradientStopEditor.tsx

```typescript
import type { Component } from 'solid-js';
import type { GradientColorStop } from '../../types/uidesc';

interface GradientStopEditorProps {
  /** Current gradient stops */
  stops: GradientColorStop[];
  /** Callback when stops change */
  onStopsChange: (stops: GradientColorStop[]) => void;
}

/**
 * Visual gradient stop editor.
 * Renders gradient bar with draggable stop handles.
 * 
 * Requirements:
 * - FR-011: Display visual gradient bar with draggable stop handles
 * - FR-012: Drag color stops to change position (0.0-1.0)
 * - FR-013: Click stop to edit color via color picker
 * - FR-014: Click empty area to add stop with interpolated color
 * - FR-015: Drag stop off bar to remove (if > 2 stops)
 * - FR-016: Enforce minimum 2 stops
 * - FR-023: Normalize positions to 2 decimal places
 * 
 * Interactions:
 * - Click on bar: Add new stop at position
 * - Click on handle: Select stop
 * - Drag handle horizontally: Move stop
 * - Drag handle downward: Remove stop (if > 2)
 * - Selected stop shows color picker input
 */
const GradientStopEditor: Component<GradientStopEditorProps> = (props) => { ... };

export { GradientStopEditor };
export type { GradientStopEditorProps };
```

### GradientPreview.tsx

```typescript
import type { Component } from 'solid-js';
import type { GradientColorStop } from '../../types/uidesc';

interface GradientPreviewProps {
  /** Gradient stops to render */
  stops: GradientColorStop[];
  /** Bar height in pixels (default: 24) */
  height?: number;
}

/**
 * Horizontal gradient preview bar.
 * Renders CSS linear-gradient from stops.
 * 
 * Requirements:
 * - FR-003: Horizontal linear preview bar
 */
const GradientPreview: Component<GradientPreviewProps> = (props) => { ... };

export { GradientPreview };
export type { GradientPreviewProps };
```

### AddGradientButton.tsx

```typescript
import type { Component } from 'solid-js';

interface AddGradientButtonProps {
  /** Callback when add button clicked */
  onAdd: () => void;
}

/**
 * Add gradient button in section header.
 * 
 * Requirements:
 * - FR-005: Add button in section header
 * - FR-006: Auto-generate unique name
 * - FR-007: Create with default 2-stop gradient
 */
const AddGradientButton: Component<AddGradientButtonProps> = (props) => { ... };

export { AddGradientButton };
export type { AddGradientButtonProps };
```

### EmptyState.tsx

```typescript
import type { Component } from 'solid-js';

/**
 * Empty state shown when no gradients defined.
 * 
 * Requirements:
 * - FR-004: Show empty state with instructions
 */
const EmptyState: Component = () => { ... };

export { EmptyState };
```

### index.ts

```typescript
export { GradientsPanel } from './GradientsPanel';
export { GradientItem } from './GradientItem';
export type { GradientItemProps } from './GradientItem';
export { GradientStopEditor } from './GradientStopEditor';
export type { GradientStopEditorProps } from './GradientStopEditor';
export { GradientPreview } from './GradientPreview';
export type { GradientPreviewProps } from './GradientPreview';
export { AddGradientButton } from './AddGradientButton';
export type { AddGradientButtonProps } from './AddGradientButton';
export { EmptyState } from './EmptyState';
```

---

## CSS Module: `GradientsPanel.module.css`

```css
/* Required classes */
.panel { }
.list { }
.empty { }
```

## CSS Module: `GradientItem.module.css`

```css
/* Required classes */
.item { }
.header { }
.name { }
.nameInput { }
.preview { }
.usageBadge { }
.deleteButton { }
.expanded { }
.stopEditor { }
```

## CSS Module: `GradientStopEditor.module.css`

```css
/* Required classes */
.editor { }
.bar { }
.handle { }
.handleSelected { }
.colorInput { }
```

## CSS Module: `GradientPreview.module.css`

```css
/* Required classes */
.preview { }
```
