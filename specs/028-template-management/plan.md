# Implementation Plan: Template Management

**Branch**: `028-template-management` | **Date**: 2026-01-08 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/028-template-management/spec.md`

## Summary

Add template management capabilities to the editor: display a template list showing all templates in a uidesc file, switch between templates to edit different UI screens, and perform CRUD operations (create, duplicate, rename, delete) on templates. Currently, the editor only displays the first template; this feature enables editing all templates in multi-template uidesc files.

## Technical Context

**Language/Version**: TypeScript 5.9.x with strict mode enabled
**Primary Dependencies**: SolidJS 1.9.x, solid-js/store (already installed - no new dependencies)
**Storage**: In-memory state via existing documentStore
**Testing**: Vitest 4.x with @solidjs/testing-library
**Testing Guide**: `specs/TESTING-GUIDE.md` - MUST be consulted for all test tasks
**Target Platform**: Web browser (Vite dev server)
**Project Type**: Single SolidJS application
**Performance Goals**: <1s template switch, <500ms CRUD operations (per spec SC-001, SC-002)
**Constraints**: All operations must support undo/redo, template names must be validated
**Scale/Scope**: 1-100 templates (per spec SC-003)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Gate | Status | Notes |
|------|--------|-------|
| SolidJS only (no React) | ✅ PASS | Using createSignal, createMemo, createStore |
| Static imports only | ✅ PASS | No dynamic imports planned |
| Test-first development | ✅ PASS | Tests before implementation |
| No new dependencies | ✅ PASS | Using existing SolidJS stack |
| CSS Modules | ✅ PASS | Component.module.css pattern |
| Undo/redo support | ✅ PASS | historyStore integration planned |
| Quality gates | ✅ PASS | lint:css, check, typecheck required |

## Project Structure

### Documentation (this feature)

```text
specs/028-template-management/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
└── tasks.md             # Phase 2 output (from /speckit.tasks)
```

### Source Code (repository root)

```text
src/
├── components/
│   └── TemplatesPanel/           # NEW: Template list UI
│       ├── TemplatesPanel.tsx
│       ├── TemplatesPanel.module.css
│       ├── TemplateItem.tsx
│       ├── TemplateItem.module.css
│       ├── AddTemplateButton.tsx
│       ├── EmptyState.tsx
│       └── __tests__/
│           ├── TemplatesPanel.spec.tsx
│           └── TemplateItem.spec.tsx
├── domain/
│   └── templates/                # NEW: Template domain utilities
│       ├── index.ts              # Barrel export
│       ├── validation.ts         # Name validation
│       ├── historyOperations.ts  # Undo/redo operations
│       └── __tests__/
│           ├── validation.spec.ts
│           └── historyOperations.spec.ts
├── stores/
│   ├── documentStore.ts          # EXTEND: Template CRUD operations
│   ├── templateStore.ts          # NEW: Active template tracking
│   └── __tests__/
│       ├── documentStore.templates.spec.ts  # NEW
│       └── templateStore.spec.ts            # NEW
├── hooks/
│   └── canvas/
│       └── useCanvasData.ts      # MODIFY: Use active template instead of first
└── types/
    └── history.ts                # EXTEND: Template operation types
```

**Structure Decision**: Single project structure following existing patterns. TemplatesPanel follows the same pattern as ColorsPanel, FontsPanel, etc. Template store is separate from document store to manage active template state (session-only, not persisted in document).

## Complexity Tracking

> **No violations** - This feature follows established patterns and doesn't introduce new complexity.

| Item | Justification |
|------|---------------|
| New templateStore | Simple signal for active template ID, similar to selectionStore |
| Template CRUD in documentStore | Follows existing pattern for colors, fonts, control-tags |
| TemplatesPanel component | Follows existing resource panel pattern |

---

## Phase 0: Outline & Research

### Research Tasks

1. **Existing patterns**: Review how documentStore handles CRUD for colors/fonts/control-tags
2. **Template switching**: How useCanvasData.ts currently selects first template
3. **History operations**: Review existing historyOperations patterns for undo/redo
4. **Name validation**: Review variable/control-tag name validation patterns

### Key Findings (from codebase analysis)

**Template data location**: `document['vstgui-ui-description'].templates` - Record<string, TemplateDefinition>

**Current first-template selection** (useCanvasData.ts lines 29-37):
```typescript
const firstTemplate = createMemo((): [string, TemplateDefinition] | null => {
  const t = templates();
  if (!t) return null;
  const entries = Object.entries(t) as [string, TemplateDefinition][];
  if (entries.length === 0) return null;
  return entries[0];  // <-- Always first, needs to use activeTemplateId
});
```

**CRUD pattern** (from documentStore - control-tags, colors, etc.):
1. Get function returns data from document
2. Add/update/delete functions use produce() for immutable updates
3. History operations created via domain utilities
4. Removed references tracked for undo

**Name validation pattern** (from variables/validation.ts):
```typescript
const NAME_PATTERN = /^[A-Za-z_][A-Za-z0-9_-]*$/;
export function isValidVariableName(name: string): boolean {
  return NAME_PATTERN.test(name);
}
```

---

## Phase 1: Design & Contracts

### Data Model

**Active Template State** (new templateStore):
```typescript
// Session-only state - not persisted in document
interface TemplateStoreState {
  activeTemplateId: string | null;  // Currently displayed template
}
```

**Template CRUD Operations** (extend documentStore):
```typescript
// Read
getTemplates(): TemplatesDefinition | undefined
getTemplate(name: string): TemplateDefinition | undefined
getTemplateNames(): string[]

// Create
addTemplate(name: string, template: TemplateDefinition): boolean
duplicateTemplate(sourceName: string, newName: string): boolean

// Update
renameTemplate(oldName: string, newName: string): boolean
updateTemplateSize(name: string, size: string): boolean

// Delete
deleteTemplate(name: string): TemplateDefinition | null
```

**History Operation Types** (extend types/history.ts):
```typescript
type HistoryOperationType = 
  | ... // existing types
  | 'template-add'
  | 'template-delete'
  | 'template-rename'
  | 'template-duplicate'
  | 'template-resize';
```

### API Contracts

**Template Store API**:
```typescript
// src/stores/templateStore.ts
export const templateStore: { activeTemplateId: string | null };
export function setActiveTemplate(templateId: string | null): void;
export function resetTemplateStore(): void;
```

**Template Domain API**:
```typescript
// src/domain/templates/validation.ts
export function isValidTemplateName(name: string): boolean;
export function generateUniqueTemplateName(existingNames: string[], baseName?: string): string;

// src/domain/templates/historyOperations.ts
export function createAddTemplateOperation(name: string, template: TemplateDefinition): HistoryOperation;
export function createDeleteTemplateOperation(name: string, template: TemplateDefinition): HistoryOperation;
export function createRenameTemplateOperation(oldName: string, newName: string): HistoryOperation;
export function createDuplicateTemplateOperation(sourceName: string, newName: string, template: TemplateDefinition): HistoryOperation;
```

### Integration Points

1. **useCanvasData.ts**: Replace `entries[0]` with `templateStore.activeTemplateId` lookup
2. **App.tsx**: Add TemplatesPanel to sidebar (above HierarchyPanel)
3. **documentStore.ts**: Add template CRUD operations
4. **selectionStore**: Clear selection when switching templates (FR-004)

### Component Hierarchy

```
TemplatesPanel
├── CollapsibleSection (existing)
│   ├── AddTemplateButton
│   └── Template list
│       └── TemplateItem (for each template)
│           ├── Name (editable on double-click)
│           ├── Size indicator
│           └── Action buttons (duplicate, delete)
└── DeleteConfirmDialog (when deleting)
```

---

## Quickstart

### Prerequisites
- Node.js 18+
- npm install completed

### Development
```bash
# Start dev server
npm run dev

# Run tests
npm test

# Quality checks (must all pass)
npm run lint:css
npm run check
npm run typecheck
```

### Key Files to Modify
1. `src/stores/templateStore.ts` - New store for active template
2. `src/stores/documentStore.ts` - Add template CRUD
3. `src/hooks/canvas/useCanvasData.ts` - Use active template
4. `src/components/TemplatesPanel/` - New UI components
5. `src/App.tsx` - Add TemplatesPanel to layout

### Testing Pattern
Follow test-first development. See `specs/TESTING-GUIDE.md` for SolidJS testing patterns.

```typescript
// Example: Testing template switching
it('should update canvas when active template changes', async () => {
  // Setup document with multiple templates
  loadFile(createMultiTemplateFile());
  
  // Switch template
  setActiveTemplate('SettingsView');
  
  // Verify canvas shows new template
  await waitFor(() => {
    expect(screen.getByTestId('template-bounds')).toHaveAttribute('data-template', 'SettingsView');
  });
});
```

---

## Post-Design Constitution Re-Check

| Gate | Status | Notes |
|------|--------|-------|
| SolidJS only (no React) | ✅ PASS | Design uses createSignal, createMemo |
| Static imports only | ✅ PASS | No dynamic imports in design |
| Test-first development | ✅ PASS | Test files specified in structure |
| No new dependencies | ✅ PASS | Only existing SolidJS stack |
| CSS Modules | ✅ PASS | .module.css files in structure |
| Undo/redo support | ✅ PASS | History operations designed |
| Quality gates | ✅ PASS | Quickstart includes gate commands |

---

## Artifacts Generated

- [x] plan.md (this file)
- [ ] research.md (findings integrated above)
- [ ] data-model.md (see Data Model section)
- [ ] quickstart.md (see Quickstart section)
- [ ] contracts/ (see API Contracts section)

**Note**: Research, data model, and contracts are consolidated into this plan document since findings were derived from direct codebase analysis and the design is straightforward following existing patterns.
