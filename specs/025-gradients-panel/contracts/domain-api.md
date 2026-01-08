# Domain API Contract: Gradients

**Feature**: 025-gradients-panel  
**Date**: 2026-01-08

## Module: `src/domain/gradients/`

### validation.ts

```typescript
interface ValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Validate gradient name.
 * @param name - Proposed gradient name
 * @param existingNames - Array of existing gradient names
 * @param currentName - Current name if renaming (excluded from uniqueness check)
 * @returns ValidationResult with valid=true or error message
 * 
 * Rules:
 * - Name must not be empty or whitespace-only
 * - Name must be unique (case-sensitive)
 */
function validateGradientName(
  name: string,
  existingNames: string[],
  currentName?: string
): ValidationResult;
```

### formatting.ts

```typescript
/**
 * Truncate gradient name for display.
 * @param name - Full gradient name
 * @param maxLength - Maximum length (default: 20)
 * @returns Truncated name with ellipsis if needed
 */
function truncateGradientName(name: string, maxLength?: number): string;

/**
 * Format stop count for display.
 * @param count - Number of stops
 * @returns Human-readable string (e.g., "3 stops")
 */
function formatStopCount(count: number): string;
```

### usage.ts

```typescript
interface GradientUsage {
  viewId: string;
  viewClass: string;
  attribute: string;
}

/**
 * Attributes that can reference gradients.
 */
const GRADIENT_ATTRIBUTES: string[] = ['gradient'];

/**
 * Find all views that reference a gradient.
 * @param gradientName - Name of gradient to search for
 * @param doc - VSTGUI document (or null)
 * @returns Array of usage records
 */
function findGradientUsages(
  gradientName: string,
  doc: VSTGUIUIDescription | null
): GradientUsage[];
```

### stopCalculations.ts

```typescript
/**
 * Normalize position to 2 decimal places within [0, 1].
 * @param value - Raw numeric position
 * @returns String position "0.00" to "1.00"
 */
function normalizePosition(value: number): string;

/**
 * Sort stops by position ascending.
 * @param stops - Unsorted stops array
 * @returns New sorted array (original unchanged)
 */
function sortStops(stops: GradientColorStop[]): GradientColorStop[];

/**
 * Linear interpolation between two colors.
 * @param leftColor - Start color (#RRGGBBAA)
 * @param rightColor - End color (#RRGGBBAA)
 * @param ratio - Interpolation ratio 0.0-1.0
 * @returns Interpolated color (#RRGGBBAA)
 */
function interpolateColor(
  leftColor: string,
  rightColor: string,
  ratio: number
): string;

/**
 * Calculate color at position from stop array.
 * @param stops - Sorted gradient stops
 * @param position - Position 0.0-1.0
 * @returns Color at position (#RRGGBBAA)
 */
function getColorAtPosition(
  stops: GradientColorStop[],
  position: number
): string;
```

### historyOperations.ts

```typescript
interface RemovedGradientReference {
  viewId: string;
  attribute: string;
  value: string;
}

/**
 * Create history operation for adding a gradient.
 */
function createAddGradientOperation(
  name: string,
  stops: GradientColorStop[],
  addFn: (name: string, stops: GradientColorStop[]) => boolean,
  deleteFn: (name: string) => unknown
): HistoryOperation;

/**
 * Create history operation for renaming a gradient.
 */
function createEditGradientNameOperation(
  oldName: string,
  newName: string,
  updateFn: (oldN: string, newN: string) => boolean
): HistoryOperation;

/**
 * Create history operation for editing gradient stops.
 */
function createEditGradientStopsOperation(
  name: string,
  oldStops: GradientColorStop[],
  newStops: GradientColorStop[],
  updateFn: (name: string, stops: GradientColorStop[]) => GradientColorStop[] | null
): HistoryOperation;

/**
 * Create history operation for deleting a gradient.
 */
function createDeleteGradientOperation(
  name: string,
  stops: GradientColorStop[],
  removedReferences: RemovedGradientReference[],
  addFn: (name: string, stops: GradientColorStop[]) => boolean,
  restoreRefFn: (viewId: string, attr: string, value: string) => void
): HistoryOperation;
```

---

## Module: `src/stores/documentStore.ts` (Extensions)

```typescript
import type { GradientColorStop } from '../types/uidesc';

interface RemovedGradientReference {
  viewId: string;
  attribute: string;
  value: string;
}

/**
 * Get all gradients from document.
 * @returns Gradients map or undefined if no document
 */
function getGradients(): Record<string, GradientColorStop[]> | undefined;

/**
 * Add a new gradient.
 * @param name - Unique gradient name
 * @param stops - Array of color stops (min 2)
 * @returns true if added, false if no document
 */
function addGradient(name: string, stops: GradientColorStop[]): boolean;

/**
 * Rename an existing gradient.
 * @param oldName - Current name
 * @param newName - New name
 * @returns true if renamed, false if not found
 */
function updateGradientName(oldName: string, newName: string): boolean;

/**
 * Update gradient stops.
 * @param name - Gradient name
 * @param newStops - New stops array
 * @returns Previous stops if updated, null if not found
 */
function updateGradientStops(
  name: string,
  newStops: GradientColorStop[]
): GradientColorStop[] | null;

/**
 * Delete gradient and clear all references.
 * @param name - Gradient to delete
 * @returns Deleted data for undo, null if not found
 */
function deleteGradient(name: string): {
  stops: GradientColorStop[];
  removedReferences: RemovedGradientReference[];
} | null;

/**
 * Restore a gradient reference (for undo).
 * @param viewId - View ID
 * @param attribute - Attribute name
 * @param value - Gradient name to restore
 */
function restoreGradientReference(
  viewId: string,
  attribute: string,
  value: string
): void;
```

---

## Module: `src/types/history.ts` (Extensions)

Add to `HistoryOperationType` union:

```typescript
type HistoryOperationType =
  // ... existing types ...
  | 'add-gradient'
  | 'edit-gradient-name'
  | 'edit-gradient-stops'
  | 'delete-gradient';
```
