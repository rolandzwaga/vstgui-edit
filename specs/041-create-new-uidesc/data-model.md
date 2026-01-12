# Data Model: Create New uidesc File

**Feature**: 041-create-new-uidesc
**Date**: 2026-01-12

## Entities

### NewDocumentConfig

Configuration for creating a new uidesc document.

```typescript
/**
 * Configuration for creating a new uidesc document
 */
interface NewDocumentConfig {
  /** Width in pixels (1-10000) */
  width: number;
  /** Height in pixels (1-10000) */
  height: number;
  /** Container class for root template view */
  containerClass: ContainerClass;
}
```

### ContainerClass

Allowed container classes for root template.

```typescript
/**
 * Container classes available for new documents
 */
type ContainerClass =
  | 'CViewContainer'
  | 'CScrollView'
  | 'CRowColumnView'
  | 'CSplitView'
  | 'CLayeredViewContainer'
  | 'UIViewSwitchContainer'
  | 'CShadowViewContainer';

/**
 * Ordered list of container classes for dropdown
 */
const CONTAINER_CLASSES: readonly ContainerClass[] = [
  'CViewContainer',
  'CScrollView',
  'CRowColumnView',
  'CSplitView',
  'CLayeredViewContainer',
  'UIViewSwitchContainer',
  'CShadowViewContainer',
] as const;

/**
 * Default container class for new documents
 */
const DEFAULT_CONTAINER_CLASS: ContainerClass = 'CViewContainer';
```

### CreateNewDialogState

Internal state for the dialog component (managed via signals, not a store).

```typescript
/**
 * Internal dialog form state (not exported - local to component)
 */
interface CreateNewDialogFormState {
  /** Width input value (string for form control) */
  widthValue: string;
  /** Height input value (string for form control) */
  heightValue: string;
  /** Selected container class */
  containerClass: ContainerClass;
  /** Width validation error message */
  widthError: string | null;
  /** Height validation error message */
  heightError: string | null;
}
```

### DimensionValidationResult

Validation result for dimension inputs (matches contracts/types.ts).

```typescript
/**
 * Validation result for dimension inputs
 */
interface DimensionValidationResult {
  /** Whether the value is valid */
  valid: boolean;
  /** Error message if invalid */
  error?: string;
  /** Parsed value if valid (rounded to integer) */
  value?: number;
}
```

## Relationships

```
NewDocumentConfig
    │
    ├── width: number
    ├── height: number
    └── containerClass: ContainerClass
            │
            └── one of CONTAINER_CLASSES[]

CreateNewDialogFormState (internal)
    │
    ├── widthValue: string ─────────────┐
    ├── heightValue: string ────────────┤
    │                                   │
    │   [validation on submit]          ▼
    │                          NewDocumentConfig
    │
    ├── containerClass: ContainerClass
    │
    ├── widthError: string | null
    └── heightError: string | null

VSTGUIUIDescription (created document)
    │
    └── vstgui-ui-description
            │
            ├── version: "1"
            └── templates
                    │
                    └── "view" (template name)
                            │
                            └── attributes
                                    │
                                    ├── class: containerClass
                                    ├── origin: "0, 0"
                                    ├── size: "${width}, ${height}"
                                    └── background-color: "~ BlackCColor"
```

## State Transitions

### Dialog State

```
[Closed] ──(user clicks "Create New")──> [Open]
    ^                                        │
    │                                        ▼
    │                              [Form displayed]
    │                               - widthValue: "400"
    │                               - heightValue: "300"
    │                               - containerClass: "CViewContainer"
    │                               - widthError: null
    │                               - heightError: null
    │                                        │
    │    ┌───────────────────────────────────┼───────────────────────────────┐
    │    │                                   │                               │
    │    ▼                                   ▼                               ▼
    │ [Cancel]                          [Validate]                      [Escape key]
    │ (button click)                    (Create click)                  (backdrop click)
    │    │                                   │                               │
    │    └───────────────────────────────────┼───────────────────────────────┘
    │                                        │
    │                                        ▼
    │                               [Validation result]
    │                                        │
    │                    ┌───────────────────┴───────────────────┐
    │                    │                                       │
    │                    ▼                                       ▼
    │               [Invalid]                               [Valid]
    │               - Show errors                           - Create document
    │               - Stay open                             - Close dialog
    │                    │                                       │
    │                    ▼                                       ▼
    │               [Open with errors]                    [Editor view]
    │                    │                                 (document loaded)
    │                    │
    └────────────────────┘
```

### Document Creation State

```
[No document]
    │
    ▼
createNewDocument(config)
    │
    ├── resetCanvas()
    ├── resetTemplateStore()
    ├── resetGuidesStore()
    ├── resetLockHideStore()
    │
    ▼
setStore({
    document: newDoc,
    parseState: 'valid',
    detectedFormat: 'json',
    originalFormat: 'json',
    isDirty: false,
    content: null,
    metadata: null,
    fileHandle: null,
    lastSavedAt: null
})
    │
    ▼
selectFirstTemplate(newDoc)
    │
    ▼
applyDefaultStatesOnDocumentLoad()
    │
    ▼
[Document loaded - editor view shown]
```

## Default Values

| Field | Default | Rationale |
|-------|---------|-----------|
| width | 400 | Spec FR-003 |
| height | 300 | Spec FR-004 |
| containerClass | 'CViewContainer' | Spec FR-005, most common |
| templateName | 'view' | Spec assumption |
| origin | '0, 0' | Spec FR-011 |
| background-color | '~ BlackCColor' | Spec FR-011 |

## Validation Rules

### Width/Height

| Rule | Value | Error Message |
|------|-------|---------------|
| Required | non-empty | "Width is required" / "Height is required" |
| Numeric | parseable as number | "Must be a number" |
| Positive | >= 1 | "Must be at least 1" |
| Maximum | <= 10000 | "Must be at most 10000" |
| Integer | rounds to int | (no error, auto-rounds) |

> **Note**: Error messages for "required" include the field name. Error messages for numeric constraints do not include the field name prefix (simpler, cleaner).

### Container Class

| Rule | Value | Error Message |
|------|-------|---------------|
| Valid value | in CONTAINER_CLASSES | N/A (dropdown enforces) |
