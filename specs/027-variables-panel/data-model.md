# Data Model: Variables Panel

**Feature**: 027-variables-panel
**Date**: 2026-01-08

## Entities

### Variable Definition

A named variable resource in a uidesc document.

```typescript
// Variables are stored in document as Record<string, string>
// Location: vstgui-ui-description.variables

interface VariablesSection {
  [variableName: string]: string; // name → value mapping
}

// Example:
{
  "buttonWidth": "100",
  "headerHeight": "50",
  "primaryColor": "#FF5500FF"
}
```

**Fields**:
| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| name (key) | string | Non-empty, unique, matches `[A-Za-z_][A-Za-z0-9_-]*` | Variable identifier |
| value | string | Any string (including empty) | Variable value |

**Validation Rules**:
- Name must not be empty
- Name must be unique within the variables section
- Name must start with letter or underscore
- Name may contain letters, numbers, underscores, hyphens
- Name is case-sensitive ("myVar" ≠ "MyVar")
- Value has no constraints (any string is valid)

### Variable Reference

A view attribute value that references a variable.

```typescript
interface VariableUsage {
  viewId: string;        // Path-based ID of referencing view
  viewClass: string;     // Class name (e.g., "CTextLabel")
  attribute: string;     // Attribute name containing reference
  value: string;         // Full attribute value with var.X reference
}
```

**Reference Syntax**: `var.variableName`

Examples:
- `var.buttonWidth` - direct reference
- `var.headerHeight` - in size attribute

**Detection Pattern**: `/var\.([A-Za-z_][A-Za-z0-9_]*)/g`

## State Transitions

### Variable Lifecycle

```
[Not Exists] --add--> [Exists, Unused]
[Exists, Unused] --reference--> [Exists, Used]
[Exists, Used] --dereference--> [Exists, Unused]
[Exists, *] --delete--> [Not Exists]
[Exists, *] --rename--> [Exists, *] (preserves usage state)
[Exists, *] --edit value--> [Exists, *] (preserves usage state)
```

### Operation History

| Operation | Undo Action | Redo Action |
|-----------|-------------|-------------|
| Add variable | Delete variable | Add variable |
| Rename variable | Rename back | Rename again |
| Edit value | Restore old value | Apply new value |
| Delete variable | Restore variable + references | Delete variable |

## Relationships

```
┌─────────────────────────────────────────────────────────────┐
│                    VSTGUIUIDescription                       │
│  ┌─────────────────────────────────────────────────────────┐│
│  │                      variables                          ││
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ││
│  │  │ buttonWidth  │  │ headerHeight │  │ primaryColor │  ││
│  │  │    "100"     │  │     "50"     │  │ "#FF5500FF"  │  ││
│  │  └──────────────┘  └──────────────┘  └──────────────┘  ││
│  └─────────────────────────────────────────────────────────┘│
│                              │                               │
│                              │ referenced by                 │
│                              ▼                               │
│  ┌─────────────────────────────────────────────────────────┐│
│  │                      templates                          ││
│  │  ┌─────────────────────────────────────────────────────┐││
│  │  │ View attributes may contain "var.buttonWidth" etc.  │││
│  │  └─────────────────────────────────────────────────────┘││
│  └─────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
```

## Store Interface

```typescript
// documentStore extensions for variables
interface VariableStoreOperations {
  // Read
  getVariables(): Record<string, string> | undefined;
  
  // Create
  addVariable(name: string, value: string): boolean;
  
  // Update
  updateVariableName(oldName: string, newName: string): boolean;
  updateVariableValue(name: string, value: string): string | null;
  
  // Delete
  deleteVariable(name: string): DeleteResult | null;
  
  // Restore (for undo)
  restoreVariableReference(viewId: string, attribute: string, value: string): void;
}

interface DeleteResult {
  value: string;
  removedReferences: RemovedVariableReference[];
}

interface RemovedVariableReference {
  viewId: string;
  attribute: string;
  value: string;
}
```

## Domain Functions

```typescript
// validation.ts
interface ValidationResult {
  valid: boolean;
  error?: string;
}

function validateVariableName(
  name: string,
  existingNames: string[],
  currentName?: string
): ValidationResult;

function generateUniqueVariableName(
  existingVariables: Record<string, string>
): string;

// usage.ts
const VARIABLE_REFERENCE_PATTERN: RegExp;

interface VariableUsage {
  viewId: string;
  viewClass: string;
  attribute: string;
  value: string;
}

function findVariableUsages(
  variableName: string,
  document: VSTGUIUIDescription | null
): VariableUsage[];

// historyOperations.ts
interface HistoryOperation {
  type: string;
  description: string;
  timestamp: number;
  undo: () => void;
  redo: () => void;
}

function createAddVariableOperation(name: string, value: string): HistoryOperation;
function createEditVariableNameOperation(oldName: string, newName: string): HistoryOperation;
function createEditVariableValueOperation(name: string, oldValue: string, newValue: string): HistoryOperation;
function createDeleteVariableOperation(
  name: string,
  value: string,
  removedReferences: RemovedVariableReference[]
): HistoryOperation;
```
