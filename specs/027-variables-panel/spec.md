# Feature Specification: Variables Panel

**Feature Branch**: `027-variables-panel`  
**Created**: 2026-01-08  
**Status**: Complete  
**Input**: User description: "Add a Variables Panel to manage VSTGUI uidesc variables (template variables for reusable values)"

## Clarifications

### Session 2026-01-08

- Q: What is the exact variable reference syntax in VSTGUI uidesc files? → A: `var.variableName` prefix syntax (e.g., `var.buttonWidth`)

## User Scenarios & Testing *(mandatory)*

### User Story 1 - View Variable Resources (Priority: P1)

As a UI designer, I want to see all defined variables in a dedicated sidebar panel so that I can understand what reusable values are available in the current uidesc document.

**Why this priority**: Users must see existing variables before they can add, edit, or delete them. This is the foundational capability for managing template variables.

**Independent Test**: Load a uidesc file with variable definitions and verify all variables appear in the panel with their names and values.

**Acceptance Scenarios**:

1. **Given** a uidesc file with 5 variable definitions, **When** the file is loaded, **Then** all 5 variables appear in the Variables Panel with name and value
2. **Given** a uidesc file with no variables defined, **When** the file is loaded, **Then** an empty state message is displayed with instructions to add a variable
3. **Given** a variable named "buttonWidth" with value "100", **When** displayed in the panel, **Then** both the name "buttonWidth" and value "100" are clearly visible

---

### User Story 2 - Add New Variable (Priority: P2)

As a UI designer, I want to add new variables so that I can define reusable values for my UI elements.

**Why this priority**: After viewing, adding is the next most important capability to build the variable library needed for consistent UI design.

**Independent Test**: Click the Add button, verify a new variable is created with a unique name and empty value.

**Acceptance Scenarios**:

1. **Given** the Variables Panel is visible, **When** I click the Add button, **Then** a new variable is created with a unique auto-generated name ("New Variable", "New Variable 2", etc.)
2. **Given** a new variable is created, **When** I view it in the panel, **Then** it has an empty string value by default
3. **Given** I add a variable, **When** I press Ctrl+Z, **Then** the variable is removed (undo works)

---

### User Story 3 - Edit Variable (Priority: P2)

As a UI designer, I want to edit variable names and values so that I can correct mistakes or update reusable values.

**Why this priority**: Editing is essential for maintaining accurate template values - closely tied to adding functionality.

**Independent Test**: Double-click a variable name to rename it; click on the value field to change the value.

**Acceptance Scenarios**:

1. **Given** a variable in the panel, **When** I double-click the name, **Then** an inline text editor appears for renaming
2. **Given** I rename a variable to an existing name, **When** I try to save, **Then** a validation error is shown and the change is rejected
3. **Given** a variable in the panel, **When** I click on the value field, **Then** I can edit the string value
4. **Given** I modify a variable, **When** I press Ctrl+Z, **Then** the change is undone

---

### User Story 4 - Delete Variable (Priority: P3)

As a UI designer, I want to delete unused variables so that I can keep my variable definitions clean.

**Why this priority**: Deletion is less frequent than viewing/editing but still essential for resource management.

**Independent Test**: Delete an unused variable immediately; delete a used variable after confirming the warning dialog.

**Acceptance Scenarios**:

1. **Given** a variable not used by any view, **When** I click the delete button, **Then** the variable is immediately removed
2. **Given** a variable used by views (referenced in attribute values), **When** I click the delete button, **Then** a confirmation dialog shows the usage count
3. **Given** I confirm deletion of a used variable, **When** the deletion completes, **Then** the variable is removed (views retain literal values but variable reference becomes invalid)
4. **Given** I delete a variable, **When** I press Ctrl+Z, **Then** the variable is restored

---

### User Story 5 - View Variable Usage (Priority: P3)

As a UI designer, I want to see which views use a particular variable so that I can understand the impact of changes.

**Why this priority**: Usage tracking helps prevent accidental breakage but is not needed for basic variable management.

**Independent Test**: Click the usage badge on a variable to see a popover listing all views that reference it.

**Acceptance Scenarios**:

1. **Given** a variable referenced by 3 views (in attribute values), **When** it appears in the list, **Then** a badge shows "3"
2. **Given** a variable with a usage badge, **When** I click the badge, **Then** a popover shows the list of referencing views with their class names
3. **Given** an unused variable, **When** it appears in the list, **Then** no usage badge is visible

---

### Edge Cases

- **Duplicate variable names**: When a user attempts to create or rename a variable to an existing name, validation prevents the change. Each variable name must be unique.
- **Empty variable name**: Variable names cannot be empty. Validation prevents saving an empty name.
- **Empty variable value**: Empty string values are valid and allowed.
- **Special characters in name**: Variable names may contain alphanumeric characters, hyphens, and underscores. Spaces and other special characters should be validated.
- **Very long values**: Variable values can be any length. Long values should be truncated in display with full value in tooltip.
- **Case sensitivity**: Variable names are case-sensitive ("myVar" is different from "MyVar").
- **Variable reference syntax**: Variables are referenced in attribute values using the `var.variableName` prefix syntax (e.g., `var.buttonWidth`). Usage tracking must scan for this pattern.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST display a "Variables" section in the left sidebar with a collapsible header
- **FR-002**: System MUST display all variable definitions from the loaded uidesc document as a scrollable list
- **FR-003**: Each variable item MUST show the variable name and value
- **FR-004**: System MUST show an empty state message when no variables are defined
- **FR-005**: Users MUST be able to add new variables via an Add button in the section header
- **FR-006**: New variables MUST be created with a unique auto-generated name ("New Variable", "New Variable 2", etc.)
- **FR-007**: New variables MUST be created with an empty string value by default
- **FR-008**: Users MUST be able to rename variables by double-clicking the name
- **FR-009**: System MUST validate that variable names are unique and non-empty
- **FR-010**: Users MUST be able to edit the variable value by clicking on the value field
- **FR-011**: System MUST allow any string value for variables (including empty strings)
- **FR-012**: Users MUST be able to delete variables via a delete button that appears on hover
- **FR-013**: System MUST show a confirmation dialog when deleting a variable that is referenced by views
- **FR-014**: System MUST show a usage count badge on variable items that are referenced by views
- **FR-015**: Users MUST be able to click the usage badge to see a popover listing all referencing views
- **FR-016**: All add, rename, edit value, and delete operations MUST be undoable/redoable via Ctrl+Z/Ctrl+Y

### Key Entities

- **Variable Definition**: A named variable resource with a string name and string value
- **Variable Reference**: A view attribute value that references a variable using `var.variableName` syntax (e.g., `var.buttonWidth`). Detected via pattern matching in attribute values.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: All variable definitions in a loaded uidesc file are visible in the Variables Panel within 1 second of file load
- **SC-002**: Users can add, rename, edit value, and delete a variable in under 5 seconds each
- **SC-003**: All variable operations can be undone and redone without data loss
- **SC-004**: Usage tracking identifies views referencing each variable in attribute values

---

## Implementation Completion Checklist

### Requirement Compliance Table (MANDATORY)

| Requirement | Status | Evidence |
|-------------|--------|----------|
| FR-001 | ✅ MET | `VariablesPanel.tsx` uses `CollapsibleSection` with title "Variables" |
| FR-002 | ✅ MET | `documentStore.variables.spec.ts` - getVariables() returns all variables |
| FR-003 | ✅ MET | `VariableItem.tsx` displays name and value with data-testid attributes |
| FR-004 | ✅ MET | `EmptyState.tsx` shows "No variables defined" message |
| FR-005 | ✅ MET | `AddVariableButton.tsx` in header, `handleAddVariable()` in VariablesPanel |
| FR-006 | ✅ MET | `validation.spec.ts` - generateUniqueVariableName() tests |
| FR-007 | ✅ MET | `VariablesPanel.tsx:handleAddVariable()` creates with value='' |
| FR-008 | ✅ MET | `VariableItem.tsx:handleNameDblClick()` enables inline name editing |
| FR-009 | ✅ MET | `validation.spec.ts` - validateVariableName() rejects empty/duplicate |
| FR-010 | ✅ MET | `VariableItem.tsx:handleValueClick()` enables inline value editing |
| FR-011 | ✅ MET | `documentStore.variables.spec.ts` - updateVariableValue allows empty string |
| FR-012 | ✅ MET | `VariableItem.tsx` shows delete button on hover via isHovered signal |
| FR-013 | ✅ MET | `VariablesPanel.tsx:handleDeleteRequest()` shows confirmDialog when usageCount > 0 |
| FR-014 | ✅ MET | `VariableItem.tsx` shows usageBadge with count from getUsageCount() |
| FR-015 | ✅ MET | `VariablesPanel.tsx:handleUsageClick()` shows usagePopover with view list |
| FR-016 | ✅ MET | `historyOperations.spec.ts` - all operations integrated with historyStore |
| SC-001 | ✅ MET | Variables loaded synchronously via createMemo() - under 1 second |
| SC-002 | ✅ MET | All operations use direct store updates - instant feedback |
| SC-003 | ✅ MET | `historyOperations.ts` - all operations push to historyStore for undo/redo |
| SC-004 | ✅ MET | `usage.spec.ts` - findVariableUsages() scans var.X pattern in attributes |

**⚠️ CRITICAL**: Any ❌ NOT MET requires explicit user approval before claiming completion.

### Final Verification

- [x] **Compliance Table Complete**: All FR-xxx and SC-xxx requirements verified with ✅ MET status
- [x] **Tests at Spec Thresholds**: No test thresholds were relaxed to pass
- [x] **No Placeholders**: No TODOs or "needs proper design" markers in deliverables
- [x] **Quality Gate - CSS**: Run `npm run lint:css` - PASSED with zero errors/warnings
- [x] **Quality Gate - Code**: Run `npm run check` - PASSED with zero errors/warnings
- [x] **Quality Gate - Types**: Run `npm run typecheck` - PASSED with zero errors/warnings
- [x] **Git Status Check**: All feature changes committed to 027-variables-panel branch
- [x] **Commit Any Remaining Work**: 4 commits: domain layer, store layer, UI components, spec docs
- [x] **Confirm Clean Working Tree**: Feature-related files all committed
- [x] **Update Documentation**: AGENTS.md auto-generated from plan.md

**⚠️ CRITICAL**: The feature is NOT complete until:
1. All quality gates pass (lint:css, check, typecheck) with zero errors/warnings
2. All work is committed to the feature branch
3. The compliance table shows all requirements MET
