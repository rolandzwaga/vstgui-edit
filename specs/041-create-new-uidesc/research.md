# Research: Create New uidesc File

**Feature**: 041-create-new-uidesc
**Date**: 2026-01-12

## Research Tasks

### 1. Dialog Pattern Analysis

**Question**: What dialog patterns exist in the codebase?

**Findings**:
- `AddControlTagDialog.tsx` - Modal with form inputs (name, ID), validation, Enter/Escape handlers
- `FormatChangeDialog.tsx` - Confirmation modal with message, Cancel/Confirm buttons
- `ResetConfirmDialog.tsx` - Similar confirmation pattern

**Pattern Summary**:
```typescript
// Props interface pattern
interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: T) => void;
  // ... context props
}

// Component pattern
const Dialog: Component<DialogProps> = (props) => {
  const [formState, setFormState] = createSignal(initial);
  const [errors, setErrors] = createSignal<string | null>(null);

  createEffect(() => {
    if (props.isOpen) { /* reset state */ }
  });

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') props.onClose();
    if (e.key === 'Enter') handleSubmit();
  };

  const handleBackdropClick = (e: MouseEvent) => {
    if (e.target === e.currentTarget) props.onClose();
  };

  return (
    <Show when={props.isOpen}>
      <div class={styles.backdrop} onClick={handleBackdropClick}>
        <div class={styles.dialog} onKeyDown={handleKeyDown}>
          {/* content */}
        </div>
      </div>
    </Show>
  );
};
```

**Decision**: Follow AddControlTagDialog pattern - includes form inputs with validation.

---

### 2. Document Store Document Creation

**Question**: How to create a new document programmatically?

**Findings**:
- `setDocumentForTest(doc)` - Sets document directly, calls `selectFirstTemplate`
- `addTemplate(name)` - Creates template with default values (400x300, CViewContainer)
- `parseContent(content)` - Parses and sets document, resets canvas, marks not dirty

**Pattern for new document**:
```typescript
function createNewDocument(config: NewDocumentConfig): void {
  const doc: VSTGUIUIDescription = {
    'vstgui-ui-description': {
      version: '1',
      templates: {
        view: {
          attributes: {
            class: config.containerClass,
            origin: '0, 0',
            size: `${config.width}, ${config.height}`,
            'background-color': '~ BlackCColor',
          },
        },
      },
    },
  };

  // Reset stores and set document
  resetCanvas();
  resetTemplateStore();
  setStore({
    document: doc,
    parseState: 'valid',
    detectedFormat: 'json',
    originalFormat: 'json',
    isDirty: false,
    // Clear file-related state
    content: null,
    metadata: null,
    fileHandle: null,
    lastSavedAt: null,
  });
  selectFirstTemplate(doc);
  applyDefaultStatesOnDocumentLoad();
}
```

**Decision**: Add `createNewDocument(config)` function to documentStore.

---

### 3. Container Classes Available

**Question**: What container classes should be available?

**Findings** (from `CONTAINER_CLASSES` in viewCategory.ts):
- CView (base, not useful for templates)
- CViewContainer (default, basic container)
- CLayeredViewContainer (optimized for frequent updates)
- CScrollView (scrollable content)
- CRowColumnView (auto-layout rows/columns)
- CSplitView (resizable split panels)
- CShadowViewContainer (drop shadow effect)
- UIViewSwitchContainer (tab-like switching)

**From spec requirement (FR-006)**:
> CViewContainer, CScrollView, CRowColumnView, CSplitView, CLayeredViewContainer, UIViewSwitchContainer, CShadowViewContainer

**Decision**: Use spec-defined list. CView excluded (not a template root). Order by frequency of use:
1. CViewContainer (default)
2. CScrollView
3. CRowColumnView
4. CSplitView
5. CLayeredViewContainer
6. UIViewSwitchContainer
7. CShadowViewContainer

---

### 4. Dimension Validation

**Question**: What validation is needed for width/height?

**Findings**:
- Spec: Positive integers 1-10000 (FR-007)
- Decimals should round to nearest integer (edge case)
- validateNumber in properties/validation.ts handles min/max
- validateTagId in controlTags/validation.ts shows pattern

**Validation Function Pattern**:
```typescript
interface ValidationResult {
  valid: boolean;
  error?: string;
}

function validateDimension(value: string, fieldName: string): ValidationResult {
  const trimmed = value.trim();

  if (trimmed === '') {
    return { valid: false, error: `${fieldName} is required` };
  }

  const parsed = Number(trimmed);

  if (!Number.isFinite(parsed)) {
    return { valid: false, error: `${fieldName} must be a number` };
  }

  const rounded = Math.round(parsed);

  if (rounded < 1) {
    return { valid: false, error: `${fieldName} must be at least 1` };
  }

  if (rounded > 10000) {
    return { valid: false, error: `${fieldName} must be at most 10000` };
  }

  return { valid: true };
}
```

**Decision**: Create validateDimension function in domain/createNew/validation.ts.

---

### 5. Focus Management and Accessibility

**Question**: How to handle keyboard accessibility?

**Findings** (from AddControlTagDialog):
- First input auto-focuses via ref callback: `ref={(el) => setTimeout(() => el.focus(), 0)}`
- Tab order natural via DOM structure
- Enter submits, Escape closes
- Backdrop click closes
- Dialog has role="dialog" implied, needs explicit for a11y

**FormatChangeDialog improvements**:
- Uses `role="dialog"` and `aria-modal="true"`
- Uses `aria-labelledby` for heading
- Focus on confirm button via requestAnimationFrame

**Decision**: Combine patterns:
- Auto-focus width input on open
- role="dialog", aria-modal="true", aria-labelledby
- Enter/Escape keyboard handlers
- Tab trapping (focus stays in dialog)

---

### 6. Integration with UploadZone

**Question**: Where does the Create New button go?

**Findings** (from UploadZone.tsx):
- Shows in idle/dragging states
- Button styles exist: `.button` class
- Pattern: icon + title + subtitle + button

**Design**:
```tsx
<Show when={uploadState === 'idle' || uploadState === 'dragging'}>
  <svg class={styles.icon}>...</svg>
  <p class={styles.title}>...</p>
  <p class={styles.subtitle}>or click the button below</p>
  <div class={styles.buttonGroup}>
    <button class={styles.button} onClick={handleButtonClick}>Browse files</button>
    <button class={styles.buttonSecondary} onClick={handleCreateNew}>Create New</button>
  </div>
</Show>
```

**Decision**: Add secondary button alongside "Browse files" in UploadZone.

---

## Resolved Clarifications

| Item | Resolution | Source |
|------|------------|--------|
| Default template name | "view" | Spec assumption, matches addTemplate behavior |
| Default dimensions | 400x300 | Spec FR-003, FR-004 |
| Default container | CViewContainer | Spec FR-005 |
| Background color | "~ BlackCColor" | Spec FR-011 |
| Origin | "0, 0" | Spec FR-011 |
| Document marked dirty | No (isDirty: false) | Spec FR-015 |
| Max dimensions | 10000x10000 | Spec edge case |
| Decimal handling | Round to integer | Spec edge case |

## Technology Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Dialog component location | src/components/CreateNewDialog/ | Follows existing dialog pattern |
| Validation location | src/domain/createNew/ | Matches controlTags pattern |
| Store integration | Add createNewDocument to documentStore | Minimal change, reuses existing reset logic |
| CSS approach | CSS Modules (.module.css) | Project standard |
| Container class list | Hardcoded constant | Static list, no runtime changes |
