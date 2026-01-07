# Data Model: View Creation & Deletion

**Feature**: 017-view-creation
**Date**: 2026-01-07

## Entities

### ViewClass

Represents a VSTGUI view class that can be instantiated.

```typescript
interface ViewClass {
  name: string;           // e.g., "CTextButton"
  category: ViewCategory; // e.g., "controls"
  defaultSize: Size;      // e.g., { width: 100, height: 30 }
  defaultAttributes?: Record<string, string>; // Optional defaults
}

type ViewCategory = 'containers' | 'controls' | 'displays' | 'text-input' | 'animation';
```

### PaletteCategory

Represents a collapsible category in the view palette.

```typescript
interface PaletteCategory {
  id: ViewCategory;
  label: string;          // Display name
  viewClasses: string[];  // Class names in this category
}
```

### ClipboardData

Internal clipboard storage format.

```typescript
interface ClipboardData {
  views: SerializedView[];          // Deep copies of view hierarchies
  sourceOrigins: Record<string, Point>;  // Original positions
  copyTimestamp: number;            // When copied
  pasteCount: number;               // Times pasted (for offset)
}

interface SerializedView {
  class: string;
  attributes: Record<string, string>;
  children?: SerializedView[];
}
```

### HistoryOperation Extensions

Operations for view lifecycle.

```typescript
// Delete operation
interface DeleteOperation extends HistoryOperation {
  type: 'delete';
  description: string;           // e.g., "Delete 3 views"
  deletedViews: SerializedView[]; // For undo restoration
  parentIds: Record<string, string>; // viewId -> parentId mapping
}

// Create operation (from palette or duplicate)
interface CreateOperation extends HistoryOperation {
  type: 'create';
  description: string;           // e.g., "Create CTextButton"
  createdViewIds: string[];      // For undo removal
}
```

## State Management

### clipboardStore

New store for internal clipboard.

```typescript
// src/stores/clipboardStore.ts
interface ClipboardState {
  data: ClipboardData | null;
  hasContent: boolean;  // Derived: data !== null
}

// Actions
function copy(views: ViewNode[]): void;
function cut(views: ViewNode[]): void;  // copy + delete
function paste(): ViewNode[] | null;    // Returns pasted views with new IDs
function clear(): void;
```

### paletteStore

New store for palette UI state.

```typescript
// src/stores/paletteStore.ts
interface PaletteState {
  expandedCategories: Set<ViewCategory>;
  searchQuery: string;
  filteredClasses: string[];  // Derived from searchQuery
}

// Actions
function toggleCategory(category: ViewCategory): void;
function setSearchQuery(query: string): void;
function resetPalette(): void;
```

### documentStore Extensions

Add view mutation methods.

```typescript
// Additions to existing documentStore
function addView(parentId: string, view: ViewNode): string;  // Returns new view ID
function removeView(viewId: string): SerializedView | null;  // Returns removed view for undo
function removeViews(viewIds: string[]): SerializedView[];   // Bulk remove
function duplicateView(viewId: string, offset: Point): string; // Returns new view ID
```

## View Class Registry

Complete list of supported VSTGUI view classes.

```typescript
// src/domain/views/viewClasses.ts
export const VIEW_CLASSES: Record<string, ViewClass> = {
  // Containers
  CViewContainer: { name: 'CViewContainer', category: 'containers', defaultSize: { width: 200, height: 200 } },
  CLayeredViewContainer: { name: 'CLayeredViewContainer', category: 'containers', defaultSize: { width: 200, height: 200 } },
  CScrollView: { name: 'CScrollView', category: 'containers', defaultSize: { width: 200, height: 200 } },
  CRowColumnView: { name: 'CRowColumnView', category: 'containers', defaultSize: { width: 200, height: 100 } },
  CSplitView: { name: 'CSplitView', category: 'containers', defaultSize: { width: 300, height: 200 } },
  CShadowViewContainer: { name: 'CShadowViewContainer', category: 'containers', defaultSize: { width: 200, height: 200 } },
  UIViewSwitchContainer: { name: 'UIViewSwitchContainer', category: 'containers', defaultSize: { width: 200, height: 200 } },

  // Controls
  CSlider: { name: 'CSlider', category: 'controls', defaultSize: { width: 20, height: 100 } },
  CKnob: { name: 'CKnob', category: 'controls', defaultSize: { width: 50, height: 50 } },
  CAnimKnob: { name: 'CAnimKnob', category: 'controls', defaultSize: { width: 50, height: 50 } },
  COnOffButton: { name: 'COnOffButton', category: 'controls', defaultSize: { width: 50, height: 20 } },
  CKickButton: { name: 'CKickButton', category: 'controls', defaultSize: { width: 50, height: 30 } },
  CTextButton: { name: 'CTextButton', category: 'controls', defaultSize: { width: 100, height: 30 } },
  CCheckBox: { name: 'CCheckBox', category: 'controls', defaultSize: { width: 100, height: 20 } },
  CSegmentButton: { name: 'CSegmentButton', category: 'controls', defaultSize: { width: 200, height: 30 } },
  CVerticalSwitch: { name: 'CVerticalSwitch', category: 'controls', defaultSize: { width: 30, height: 60 } },
  CHorizontalSwitch: { name: 'CHorizontalSwitch', category: 'controls', defaultSize: { width: 60, height: 30 } },
  CRockerSwitch: { name: 'CRockerSwitch', category: 'controls', defaultSize: { width: 40, height: 60 } },
  CXYPad: { name: 'CXYPad', category: 'controls', defaultSize: { width: 100, height: 100 } },

  // Displays
  CTextLabel: { name: 'CTextLabel', category: 'displays', defaultSize: { width: 100, height: 20 } },
  CMultiLineTextLabel: { name: 'CMultiLineTextLabel', category: 'displays', defaultSize: { width: 150, height: 60 } },
  CParamDisplay: { name: 'CParamDisplay', category: 'displays', defaultSize: { width: 60, height: 20 } },
  CVuMeter: { name: 'CVuMeter', category: 'displays', defaultSize: { width: 20, height: 100 } },
  CGradientView: { name: 'CGradientView', category: 'displays', defaultSize: { width: 100, height: 100 } },

  // Text Input
  CTextEdit: { name: 'CTextEdit', category: 'text-input', defaultSize: { width: 150, height: 24 } },
  CSearchTextEdit: { name: 'CSearchTextEdit', category: 'text-input', defaultSize: { width: 200, height: 24 } },
  COptionMenu: { name: 'COptionMenu', category: 'text-input', defaultSize: { width: 120, height: 24 } },

  // Animation
  CMovieBitmap: { name: 'CMovieBitmap', category: 'animation', defaultSize: { width: 100, height: 100 } },
  CMovieButton: { name: 'CMovieButton', category: 'animation', defaultSize: { width: 50, height: 50 } },
  CAutoAnimation: { name: 'CAutoAnimation', category: 'animation', defaultSize: { width: 100, height: 100 } },
  CAnimationSplashScreen: { name: 'CAnimationSplashScreen', category: 'animation', defaultSize: { width: 200, height: 150 } },
  CStringListControl: { name: 'CStringListControl', category: 'animation', defaultSize: { width: 150, height: 200 } },
};

export const PALETTE_CATEGORIES: PaletteCategory[] = [
  { id: 'containers', label: 'Containers', viewClasses: ['CViewContainer', 'CLayeredViewContainer', 'CScrollView', 'CRowColumnView', 'CSplitView', 'CShadowViewContainer', 'UIViewSwitchContainer'] },
  { id: 'controls', label: 'Controls', viewClasses: ['CSlider', 'CKnob', 'CAnimKnob', 'COnOffButton', 'CKickButton', 'CTextButton', 'CCheckBox', 'CSegmentButton', 'CVerticalSwitch', 'CHorizontalSwitch', 'CRockerSwitch', 'CXYPad'] },
  { id: 'displays', label: 'Displays', viewClasses: ['CTextLabel', 'CMultiLineTextLabel', 'CParamDisplay', 'CVuMeter', 'CGradientView'] },
  { id: 'text-input', label: 'Text Input', viewClasses: ['CTextEdit', 'CSearchTextEdit', 'COptionMenu'] },
  { id: 'animation', label: 'Animation', viewClasses: ['CMovieBitmap', 'CMovieButton', 'CAutoAnimation', 'CAnimationSplashScreen', 'CStringListControl'] },
];
```

## Validation Rules

### Delete Validation
- Cannot delete root template view
- Deleting container deletes all descendants
- Must have at least one view selected

### Duplicate Validation
- Must have at least one view selected
- Duplicates maintain hierarchy (container + children)
- New IDs generated for all duplicated views

### Paste Validation
- Clipboard must have content
- Paste creates new IDs for all views
- Resource references preserved as-is (may be invalid)

### Create (Drag) Validation
- Drop target must be a container or template root
- Position must be within canvas bounds
- New view gets unique ID

## State Transitions

### Clipboard Flow
```
Empty → Copy → HasContent → Paste → HasContent (stays)
Empty → Cut → HasContent (source deleted) → Paste → HasContent
HasContent → Clear → Empty
```

### Selection After Operations
```
Delete: selection cleared
Duplicate: selection = duplicated views
Paste: selection = pasted views
Create: selection = new view
```
