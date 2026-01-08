# Data Model: Gradients Panel

**Feature**: 025-gradients-panel  
**Date**: 2026-01-08

## Core Entities

### 1. GradientColorStop (Existing)

From `src/types/uidesc.ts`:

```typescript
interface GradientColorStop {
  rgba: string;    // Color in hex format (#RRGGBBAA)
  start: string;   // Position 0.00-1.00 as string
}
```

**Identity**: Position within a gradient array (not individually identified)

**Validation Rules**:
- `rgba`: Valid hex color (#RRGGBB or #RRGGBBAA)
- `start`: Numeric string 0.00-1.00 (2 decimal places)

**State Transitions**: None (immutable within operations)

---

### 2. GradientsDefinition (Existing)

From `src/types/uidesc.ts`:

```typescript
type GradientsDefinition = Record<string, GradientColorStop[]>;
```

**Identity**: Gradient name (string key)

**Validation Rules**:
- Name: Non-empty, unique within document
- Stops array: Minimum 2 stops

**Relationships**:
- Belongs to: `VSTGUIUIDescriptionContent.gradients`
- Referenced by: Views via `gradient` attribute

---

### 3. GradientUsage (New)

```typescript
interface GradientUsage {
  viewId: string;      // Composite view ID (e.g., "MainView-0-1")
  viewClass: string;   // View class name (e.g., "CGradientView")
  attribute: string;   // Attribute name (always "gradient")
}
```

**Purpose**: Track which views reference a gradient for usage badge and deletion warning.

---

### 4. RemovedGradientReference (New)

```typescript
interface RemovedGradientReference {
  viewId: string;      // View that had reference
  attribute: string;   // Attribute name
  value: string;       // Original value (gradient name)
}
```

**Purpose**: Support undo for gradient deletion by tracking cleared references.

---

### 5. History Operation Types (Extension)

Add to `src/types/history.ts`:

```typescript
type HistoryOperationType =
  | 'move'
  | 'resize'
  | 'property'
  | 'add-view'
  | 'delete-view'
  | 'reparent'
  | 'reorder'
  | 'group'
  | 'ungroup'
  | 'duplicate'
  | 'add-color'
  | 'edit-color-name'
  | 'edit-color-value'
  | 'delete-color'
  | 'add-font'
  | 'edit-font-name'
  | 'edit-font-property'
  | 'delete-font'
  | 'add-bitmap'
  | 'edit-bitmap-name'
  | 'edit-bitmap-property'
  | 'delete-bitmap'
  // New gradient operations:
  | 'add-gradient'
  | 'edit-gradient-name'
  | 'edit-gradient-stops'
  | 'delete-gradient';
```

---

## Document Store Extensions

Add to `src/stores/documentStore.ts`:

### Read Operations

```typescript
// Get all gradients from document
function getGradients(): GradientsDefinition | undefined;
```

### Write Operations

```typescript
// Add new gradient
function addGradient(name: string, stops: GradientColorStop[]): boolean;

// Rename gradient
function updateGradientName(oldName: string, newName: string): boolean;

// Update gradient stops
function updateGradientStops(name: string, newStops: GradientColorStop[]): GradientColorStop[] | null;

// Delete gradient and clear references
function deleteGradient(name: string): {
  stops: GradientColorStop[];
  removedReferences: RemovedGradientReference[];
} | null;

// Restore gradient reference (for undo)
function restoreGradientReference(viewId: string, attribute: string, value: string): void;
```

---

## Domain Utilities

### validation.ts

```typescript
interface ValidationResult {
  valid: boolean;
  error?: string;
}

// Validate gradient name
function validateGradientName(
  name: string,
  existingNames: string[],
  currentName?: string
): ValidationResult;
```

### usage.ts

```typescript
// Gradient attributes to search
const GRADIENT_ATTRIBUTES = ['gradient'];

// Find all views referencing a gradient
function findGradientUsages(
  gradientName: string,
  doc: VSTGUIUIDescription | null
): GradientUsage[];
```

### formatting.ts

```typescript
// Truncate long gradient names for display
function truncateGradientName(name: string, maxLength?: number): string;

// Format stop count for display
function formatStopCount(count: number): string;
```

### stopCalculations.ts

```typescript
// Normalize position to 2 decimal places
function normalizePosition(value: number): string;

// Sort stops by position
function sortStops(stops: GradientColorStop[]): GradientColorStop[];

// Interpolate color between two stops
function interpolateColor(
  leftColor: string,
  rightColor: string,
  ratio: number
): string;

// Calculate color at position from stop array
function getColorAtPosition(
  stops: GradientColorStop[],
  position: number
): string;
```

### historyOperations.ts

```typescript
// History operation factories
function createAddGradientOperation(
  name: string,
  stops: GradientColorStop[],
  addFn: (name: string, stops: GradientColorStop[]) => boolean,
  deleteFn: (name: string) => unknown
): HistoryOperation;

function createEditGradientNameOperation(
  oldName: string,
  newName: string,
  updateFn: (old: string, newN: string) => boolean
): HistoryOperation;

function createEditGradientStopsOperation(
  name: string,
  oldStops: GradientColorStop[],
  newStops: GradientColorStop[],
  updateFn: (name: string, stops: GradientColorStop[]) => GradientColorStop[] | null
): HistoryOperation;

function createDeleteGradientOperation(
  name: string,
  stops: GradientColorStop[],
  removedReferences: RemovedGradientReference[],
  addFn: (name: string, stops: GradientColorStop[]) => boolean,
  restoreRefFn: (viewId: string, attr: string, value: string) => void
): HistoryOperation;
```

---

## UI Component Props

### GradientsPanel

```typescript
// No props - reads from documentStore
```

### GradientItem

```typescript
interface GradientItemProps {
  name: string;
  stops: GradientColorStop[];
  usageCount: number;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onRename: (newName: string) => void;
  onDelete: () => void;
  onStopsChange: (stops: GradientColorStop[]) => void;
}
```

### GradientStopEditor

```typescript
interface GradientStopEditorProps {
  stops: GradientColorStop[];
  onStopsChange: (stops: GradientColorStop[]) => void;
}
```

### GradientPreview

```typescript
interface GradientPreviewProps {
  stops: GradientColorStop[];
  height?: number;  // Default: 24px
}
```

### AddGradientButton

```typescript
interface AddGradientButtonProps {
  onAdd: () => void;
}
```

### EmptyState

```typescript
// No props - static content
```

---

## Default Values

```typescript
const DEFAULT_GRADIENT_STOPS: GradientColorStop[] = [
  { rgba: '#000000FF', start: '0.00' },
  { rgba: '#FFFFFFFF', start: '1.00' }
];

const DEFAULT_GRADIENT_NAME_BASE = 'New Gradient';

const MIN_STOPS = 2;        // Minimum stops per gradient
const GRADIENT_BAR_HEIGHT = 24;  // Default preview height in pixels
```

---

## CSS Custom Properties (Design Tokens)

Add to `src/styles/tokens.css`:

```css
/* Gradient editor tokens */
--gradient-stop-handle-size: 12px;
--gradient-stop-handle-border: 2px solid var(--color-border);
--gradient-stop-handle-selected: var(--color-primary);
--gradient-bar-height: 24px;
--gradient-bar-border-radius: 4px;
```
