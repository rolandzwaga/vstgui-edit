# Quickstart: Template Management

**Feature**: 028-template-management
**Date**: 2026-01-08

## Prerequisites

- Node.js 18+
- Repository cloned
- Dependencies installed: `npm install`

## Development Commands

```bash
# Start development server
npm run dev

# Run tests (watch mode)
npm run test:watch

# Run tests (single run)
npm test

# Quality gates (ALL MUST PASS before completion)
npm run lint:css    # CSS linting
npm run check       # Biome code quality
npm run typecheck   # TypeScript checking
```

## Key Files to Create/Modify

### New Files

| File | Purpose |
|------|---------|
| `src/stores/templateStore.ts` | Active template state |
| `src/stores/__tests__/templateStore.spec.ts` | Store tests |
| `src/domain/templates/validation.ts` | Name validation |
| `src/domain/templates/historyOperations.ts` | Undo/redo operations |
| `src/domain/templates/index.ts` | Barrel export |
| `src/domain/templates/__tests__/*.spec.ts` | Domain tests |
| `src/components/TemplatesPanel/TemplatesPanel.tsx` | Main panel component |
| `src/components/TemplatesPanel/TemplateItem.tsx` | Individual template item |
| `src/components/TemplatesPanel/AddTemplateButton.tsx` | Add button |
| `src/components/TemplatesPanel/EmptyState.tsx` | Empty state display |
| `src/components/TemplatesPanel/*.module.css` | Styles |
| `src/components/TemplatesPanel/__tests__/*.spec.tsx` | Component tests |
| `src/stores/__tests__/documentStore.templates.spec.ts` | CRUD tests |

### Files to Modify

| File | Changes |
|------|---------|
| `src/stores/documentStore.ts` | Add template CRUD operations |
| `src/hooks/canvas/useCanvasData.ts` | Use activeTemplateId |
| `src/types/history.ts` | Add template operation types |
| `src/App.tsx` | Add TemplatesPanel to layout |

## Testing Strategy

### Test-First Order

1. **Domain utilities first**
   - `validation.spec.ts` - Name validation
   - `historyOperations.spec.ts` - Undo/redo factories

2. **Store tests second**
   - `templateStore.spec.ts` - Active template state
   - `documentStore.templates.spec.ts` - CRUD operations

3. **Component tests last**
   - `TemplatesPanel.spec.tsx` - Panel integration
   - `TemplateItem.spec.tsx` - Item interactions

### Testing Patterns

**Important**: Read `specs/TESTING-GUIDE.md` before writing tests!

```typescript
// Template store test example
import { templateStore, setActiveTemplate, resetTemplateStore } from '../templateStore';

describe('templateStore', () => {
  beforeEach(() => {
    resetTemplateStore();
  });

  it('should set active template', () => {
    setActiveTemplate('SettingsView');
    expect(templateStore.activeTemplateId).toBe('SettingsView');
  });
});
```

```typescript
// Component test example (SolidJS pattern)
import { render, screen } from '@solidjs/testing-library';
import { TemplatesPanel } from '../TemplatesPanel';

it('should display template list', async () => {
  // Setup document with templates
  loadFile(createMultiTemplateFile());
  
  render(() => <TemplatesPanel />);
  
  expect(screen.getByText('MainView')).toBeInTheDocument();
  expect(screen.getByText('SettingsView')).toBeInTheDocument();
});
```

## Implementation Order

1. **Phase 1: Core State** (P1 - Template switching)
   - Create templateStore
   - Add getTemplates/getTemplateNames to documentStore
   - Modify useCanvasData to use activeTemplateId
   - Verify canvas updates on template switch

2. **Phase 2: UI Components** (P1 - Template list)
   - Create TemplatesPanel scaffold
   - Create TemplateItem component
   - Add to App.tsx layout
   - Implement click-to-switch

3. **Phase 3: CRUD Operations** (P2 - Create, Rename, Duplicate)
   - Add template CRUD to documentStore
   - Create domain validation utilities
   - Create history operations
   - Add UI for create/rename/duplicate

4. **Phase 4: Delete & Edge Cases** (P3 - Delete)
   - Implement delete with confirmation
   - Handle last-template protection
   - Edge case testing

## Common Patterns

### Following Existing Panel Pattern

Look at `src/components/ControlTagsPanel/` for the pattern:
- CollapsibleSection wrapper
- AddXxxButton in header
- For loop over items
- ConfirmDialog for delete

### History Operations

Follow `src/domain/colors/historyOperations.ts`:
```typescript
export function createAddTemplateOperation(
  name: string,
  template: TemplateDefinition
): HistoryOperation {
  return {
    type: 'template-add',
    description: `Add template "${name}"`,
    timestamp: Date.now(),
    undo: () => deleteTemplate(name),
    redo: () => addTemplate(name, template),
  };
}
```

## Quality Checklist

Before marking complete:

- [ ] All tests pass: `npm test`
- [ ] CSS lint passes: `npm run lint:css`
- [ ] Code quality passes: `npm run check`
- [ ] Types check: `npm run typecheck`
- [ ] All FR-xxx requirements verified
- [ ] All SC-xxx criteria measured
- [ ] CLAUDE.md updated if new patterns introduced
