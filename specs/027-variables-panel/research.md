# Research: Variables Panel

**Feature**: 027-variables-panel
**Date**: 2026-01-08

## Research Questions

### 1. Variable Storage Format in uidesc

**Decision**: Variables are stored as a simple `Record<string, string>` in `vstgui-ui-description.variables`.

**Rationale**: The JSON schema defines `variablesDefinition` as:
```json
{
  "type": "object",
  "description": "Variable definitions (name -> value)",
  "additionalProperties": {
    "type": "string"
  }
}
```

This is the simplest possible format - just name→value string pairs.

**Alternatives considered**: 
- Complex object with metadata (rejected - not in schema)
- Array of {name, value} objects (rejected - schema uses object)

### 2. Variable Reference Syntax

**Decision**: Variables are referenced using `var.variableName` prefix syntax.

**Rationale**: Confirmed in spec clarification session. The pattern matches the colorValue regex in the schema which includes `var\\.[A-Za-z_][A-Za-z0-9_]*` as a valid pattern.

**Alternatives considered**:
- `var(variableName)` function syntax (rejected - not VSTGUI format)
- `${variableName}` template syntax (rejected - not VSTGUI format)

### 3. Existing Pattern to Follow

**Decision**: Follow ControlTagsPanel (026) architecture exactly.

**Rationale**: ControlTagsPanel has the most recent and complete implementation of a resource panel with:
- Domain layer: validation.ts, usage.ts, historyOperations.ts
- Store extensions: getX, addX, updateXName, updateXValue, deleteX, restoreXReference
- Component layer: Panel, Item, AddButton, EmptyState, AddDialog (optional)
- Full undo/redo integration via historyStore

**Key patterns from ControlTagsPanel**:
1. `initXHistoryOperations()` called in `onMount()` to inject store dependencies
2. `createMemo()` for derived list from store
3. `CollapsibleSection` with `headerActions` for add button
4. Inline editing via double-click (name) and single-click (value)
5. Usage tracking via `findXUsages()` scanning all view attributes
6. Confirmation dialog for deletion of used resources

### 4. Variable Name Validation Rules

**Decision**: Follow same rules as other resource names with minor adjustment.

**Rationale**: Based on pattern in schema colorValue regex and existing validation patterns:
- Non-empty string required
- Unique within document
- Case-sensitive
- Alphanumeric + underscore + hyphen allowed
- Must not start with number (to match `var.[A-Za-z_]` pattern)

### 5. Variable Value Validation Rules

**Decision**: Accept any string value including empty strings.

**Rationale**: FR-011 states "System MUST allow any string value for variables (including empty strings)". No validation needed for values.

## Dependencies

No new dependencies required. Using existing:
- SolidJS 1.9.x (createSignal, createMemo, createEffect, For, Show)
- solid-js/store (for documentStore)
- Existing historyStore for undo/redo
- Existing CollapsibleSection component

## Implementation Approach

### Phase 1: Domain Layer
1. Create `src/domain/variables/validation.ts` with:
   - `validateVariableName(name, existingNames, currentName?)`
   - `generateUniqueVariableName(existingVariables)`
2. Create `src/domain/variables/usage.ts` with:
   - `VARIABLE_REFERENCE_PATTERN = /var\.([A-Za-z_][A-Za-z0-9_]*)/g`
   - `findVariableUsages(variableName, document)`
3. Create `src/domain/variables/historyOperations.ts` with:
   - `createAddVariableOperation(name, value)`
   - `createEditVariableNameOperation(oldName, newName)`
   - `createEditVariableValueOperation(name, oldValue, newValue)`
   - `createDeleteVariableOperation(name, value, removedReferences)`

### Phase 2: Store Layer
Extend `documentStore.ts` with:
- `getVariables()` - Get all variables from document
- `addVariable(name, value)` - Add new variable
- `updateVariableName(oldName, newName)` - Rename variable
- `updateVariableValue(name, value)` - Update value
- `deleteVariable(name)` - Delete and return removed references
- `restoreVariableReference(viewId, value)` - Restore reference on undo

### Phase 3: Component Layer
1. Create `VariablesPanel` using CollapsibleSection
2. Create `VariableItem` with inline editing
3. Create `AddVariableButton` for header
4. Create `EmptyState` for no-variables message
5. Wire up usage tracking and confirmation dialogs

### Phase 4: Integration
1. Add VariablesPanel to App.tsx sidebar
2. Verify all acceptance scenarios
3. Run quality gates
