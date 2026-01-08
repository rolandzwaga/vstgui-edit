# Research: Template Management

**Feature**: 028-template-management
**Date**: 2026-01-08

## Research Questions

### 1. How does documentStore handle CRUD for resources?

**Finding**: The pattern for colors, fonts, control-tags, variables is consistent:

```typescript
// Get - returns data from document
export function getColors(): ColorsDefinition | undefined {
  return documentStore.document?.['vstgui-ui-description']?.colors;
}

// Add - uses produce() for immutable update
export function addColor(name: string, value: string): void {
  setDocumentStore(produce((draft) => {
    if (!draft.document?.['vstgui-ui-description']) return;
    const vstgui = draft.document['vstgui-ui-description'];
    if (!vstgui.colors) vstgui.colors = {};
    vstgui.colors[name] = value;
  }));
}

// Delete - returns removed data for undo
export function deleteColor(name: string): { color: string; removedReferences: RemovedColorReference[] } | null {
  // ... validation and removal logic
}
```

**Decision**: Follow this exact pattern for templates.

### 2. How does useCanvasData.ts select the template to display?

**Finding**: Currently hardcoded to first template (line 29-37):

```typescript
const firstTemplate = createMemo((): [string, TemplateDefinition] | null => {
  const t = templates();
  if (!t) return null;
  const entries = Object.entries(t) as [string, TemplateDefinition][];
  if (entries.length === 0) return null;
  return entries[0];  // <-- Always first
});
```

**Decision**: Create `templateStore.activeTemplateId` signal. Modify useCanvasData to:
1. If activeTemplateId is set, look up that template
2. If not set or template doesn't exist, fall back to first template
3. Auto-set activeTemplateId to first template on document load

### 3. How are history operations structured?

**Finding**: Domain modules export factory functions:

```typescript
// domain/colors/historyOperations.ts
export function createAddColorOperation(name: string, value: string): HistoryOperation {
  return {
    type: 'color-add',
    description: `Add color "${name}"`,
    timestamp: Date.now(),
    undo: () => deleteColor(name),
    redo: () => addColor(name, value),
  };
}
```

**Decision**: Create `domain/templates/historyOperations.ts` following this pattern.

### 4. How is name validation done?

**Finding**: Variables use regex pattern validation:

```typescript
// domain/variables/validation.ts
const NAME_PATTERN = /^[A-Za-z_][A-Za-z0-9_-]*$/;

export function isValidVariableName(name: string): boolean {
  if (!name || name.length === 0) return false;
  return NAME_PATTERN.test(name);
}
```

**Decision**: Use same pattern for template names (FR-015).

### 5. How do existing panels handle the UI?

**Finding**: All resource panels use CollapsibleSection + item list:
- AddXxxButton in header
- For loop over items
- ConfirmDialog for delete with usage warning
- Double-click for inline rename

**Decision**: Follow ControlTagsPanel pattern most closely since it has:
- Inline name editing
- Delete confirmation
- Similar complexity

## Alternatives Considered

### Template Store Location

**Option A**: Add activeTemplateId to documentStore
- Pro: Single store
- Con: Mixes persisted (document) and session (active template) state

**Option B**: Create separate templateStore
- Pro: Clear separation of concerns
- Con: Another store to manage

**Decision**: Option B - separate templateStore for session-only state (activeTemplateId).

### Template Switching Trigger

**Option A**: Emit event when template changes
- Pro: Decoupled
- Con: Event management complexity

**Option B**: Reactive signal in templateStore
- Pro: SolidJS reactive pattern
- Con: None significant

**Decision**: Option B - use reactive signal. useCanvasData will react automatically.

## Dependencies

No new dependencies required. Using existing:
- solid-js (createSignal, createMemo, produce)
- solid-js/store
- Existing historyStore, selectionStore patterns
