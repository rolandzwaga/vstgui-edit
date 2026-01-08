# Quickstart: Variables Panel

**Feature**: 027-variables-panel
**Date**: 2026-01-08

## Prerequisites

- Node.js 18+ installed
- Project dependencies installed (`npm install`)
- Familiarity with SolidJS reactive primitives
- Understanding of existing resource panel patterns (ColorsPanel, ControlTagsPanel)

## Key Files to Reference

Before implementing, study these existing implementations:

```bash
# Reference pattern (ControlTagsPanel)
src/components/ControlTagsPanel/ControlTagsPanel.tsx
src/domain/controlTags/validation.ts
src/domain/controlTags/usage.ts
src/domain/controlTags/historyOperations.ts
src/stores/documentStore.ts  # Look for controlTag functions

# Testing guide (REQUIRED before writing tests)
specs/TESTING-GUIDE.md
```

## Development Commands

```bash
# Start dev server
npm run dev

# Run tests (watch mode)
npm test

# Run tests (single run)
npm test -- --run

# Run specific test file
npm test -- --run src/domain/variables/__tests__/validation.spec.ts

# Quality gates (run before completion)
npm run lint:css    # CSS linting
npm run check       # Biome linting
npm run typecheck   # TypeScript check
```

## Implementation Order

### 1. Domain Layer First (Test-First!)

```bash
# Create domain structure
mkdir -p src/domain/variables/__tests__
touch src/domain/variables/validation.ts
touch src/domain/variables/usage.ts
touch src/domain/variables/historyOperations.ts
touch src/domain/variables/index.ts
```

Write tests first, then implement:
1. `validation.spec.ts` → `validation.ts`
2. `usage.spec.ts` → `usage.ts`
3. `historyOperations.spec.ts` → `historyOperations.ts`

### 2. Store Layer

Extend `src/stores/documentStore.ts` with variable functions:
- `getVariables()`
- `addVariable(name, value)`
- `updateVariableName(oldName, newName)`
- `updateVariableValue(name, value)`
- `deleteVariable(name)`
- `restoreVariableReference(viewId, attribute, value)`

Add tests in `src/stores/__tests__/documentStore.variables.spec.ts`

### 3. Component Layer

```bash
# Create component structure
mkdir -p src/components/VariablesPanel/__tests__
touch src/components/VariablesPanel/VariablesPanel.tsx
touch src/components/VariablesPanel/VariablesPanel.module.css
touch src/components/VariablesPanel/VariableItem.tsx
touch src/components/VariablesPanel/VariableItem.module.css
touch src/components/VariablesPanel/AddVariableButton.tsx
touch src/components/VariablesPanel/AddVariableButton.module.css
touch src/components/VariablesPanel/EmptyState.tsx
touch src/components/VariablesPanel/EmptyState.module.css
touch src/components/VariablesPanel/index.ts
```

### 4. Integration

Add to `src/App.tsx` sidebar (after ControlTagsPanel).

## Key Patterns

### Variable Name Validation

```typescript
// Must match pattern for var.X references
const NAME_PATTERN = /^[A-Za-z_][A-Za-z0-9_-]*$/;

function validateVariableName(name: string, existingNames: string[], currentName?: string): ValidationResult {
  const trimmed = name.trim();
  
  if (trimmed.length === 0) {
    return { valid: false, error: 'Name cannot be empty' };
  }
  
  if (!NAME_PATTERN.test(trimmed)) {
    return { valid: false, error: 'Name must start with letter or underscore' };
  }
  
  const others = currentName ? existingNames.filter(n => n !== currentName) : existingNames;
  if (others.includes(trimmed)) {
    return { valid: false, error: 'Name already exists' };
  }
  
  return { valid: true };
}
```

### Finding Variable Usages

```typescript
const VARIABLE_REFERENCE_PATTERN = /var\.([A-Za-z_][A-Za-z0-9_-]*)/g;

function findVariableUsages(variableName: string, document: VSTGUIUIDescription | null): VariableUsage[] {
  if (!document) return [];
  
  const usages: VariableUsage[] = [];
  const pattern = `var.${variableName}`;
  
  // Scan all templates and their views
  const templates = document['vstgui-ui-description']?.templates;
  if (!templates) return usages;
  
  // Recursive scan of view attributes...
  // (Similar to findControlTagUsages in controlTags/usage.ts)
  
  return usages;
}
```

### Component Pattern

```typescript
export const VariablesPanel: Component = () => {
  onMount(() => {
    initVariableHistoryOperations({
      addVariable,
      deleteVariable,
      updateVariableName,
      updateVariableValue,
      restoreVariableReference,
    });
  });

  const variables = createMemo(() => {
    const vars = getVariables();
    if (!vars) return [];
    return Object.entries(vars).map(([name, value]) => ({ name, value }));
  });

  // ... handlers for add, edit, delete

  return (
    <CollapsibleSection
      title="Variables"
      headerActions={<AddVariableButton onClick={handleAdd} disabled={!hasDocument()} />}
    >
      <Show when={hasVariables()} fallback={<EmptyState />}>
        <For each={variables()}>
          {(variable) => (
            <VariableItem
              name={variable.name}
              value={variable.value}
              onDelete={handleDelete}
              usageCount={getUsageCount(variable.name)}
              onUsageClick={handleUsageClick}
            />
          )}
        </For>
      </Show>
    </CollapsibleSection>
  );
};
```

## Testing Checklist

Before marking any task complete:

- [ ] Tests written BEFORE implementation
- [ ] Tests follow patterns in TESTING-GUIDE.md
- [ ] Tests use `testInRoot()` for store operations
- [ ] Tests cover happy path and edge cases
- [ ] All tests pass (`npm test -- --run`)

## Quality Gate Checklist

Before marking spec complete:

- [ ] `npm run lint:css` passes with zero errors/warnings
- [ ] `npm run check` passes with zero errors/warnings
- [ ] `npm run typecheck` passes with zero errors/warnings
- [ ] All changes committed to feature branch
