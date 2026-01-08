# Data Model: Template Management

**Feature**: 028-template-management
**Date**: 2026-01-08

## Entities

### Template (existing type - TemplateDefinition)

A named root view containing a hierarchy of child views.

**Location in document**: `document['vstgui-ui-description'].templates[name]`

**Type**: `TemplateDefinition` from `src/types/uidesc.ts`

```typescript
interface TemplateDefinition extends ViewNode {
  attributes: ViewAttributes;
  children?: Record<string, ViewNode>;
}

interface ViewAttributes {
  class: string;           // Usually "CViewContainer"
  origin?: string;         // "x, y" - usually "0, 0" for root
  size?: string;           // "width, height" - template dimensions
  'min-size'?: string;     // Minimum resize constraint
  'max-size'?: string;     // Maximum resize constraint
  'background-color'?: string;
  // ... other view attributes
}
```

**Key attributes for templates**:
- `size`: Template dimensions (e.g., "400, 300")
- `min-size`: Minimum dimensions (e.g., "200, 150")
- `max-size`: Maximum dimensions (e.g., "1920, 1080")
- `background-color`: Root container background

### Active Template (new - session state)

The currently selected template being displayed on canvas.

**Location**: `templateStore.activeTemplateId`

```typescript
// src/stores/templateStore.ts
interface TemplateStore {
  activeTemplateId: string | null;
}
```

**Lifecycle**:
1. Set to first template when document loads
2. Updated when user clicks template in list
3. Reset to null when document unloads
4. Falls back to first template if active template is deleted

### Templates Collection (existing)

Map of all templates in the document.

**Location**: `document['vstgui-ui-description'].templates`

**Type**: `TemplatesDefinition` from `src/types/uidesc.ts`

```typescript
type TemplatesDefinition = Record<string, TemplateDefinition>;
```

## Validation Rules

### Template Name (FR-015)

- Must not be empty
- Must start with letter (a-z, A-Z) or underscore (_)
- Can contain letters, numbers, underscores, and hyphens
- Must be unique among template names
- Pattern: `/^[A-Za-z_][A-Za-z0-9_-]*$/`

### Template Operations

**Create** (FR-007):
- Name must be valid and unique
- Default root view: CViewContainer
- Default size: "400, 300"
- Default origin: "0, 0"

**Rename** (FR-006):
- New name must be valid
- New name must not exist (no duplicates)
- Cannot rename to same name (no-op)

**Delete** (FR-009):
- Cannot delete last template (minimum 1)
- If deleted template was active, switch to first remaining
- Requires confirmation dialog

**Duplicate** (FR-008):
- Deep copy of template structure
- New name generated: "Name Copy", "Name Copy 2", etc.
- All children and attributes copied

## State Transitions

### Document Load

```
Initial State → Document Loaded
  - Parse templates from document
  - Set activeTemplateId to first template name
  - Clear view selection
```

### Template Switch

```
Template A Active → User clicks Template B
  - Clear view selection (FR-004)
  - Set activeTemplateId to "B"
  - Canvas updates to show Template B views
```

### Template Delete

```
Template Active → Delete Confirmed
  - Remove template from document
  - If deleted was active:
    - Set activeTemplateId to first remaining template
  - Push delete operation to history
```

## Data Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                         documentStore                            │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ document['vstgui-ui-description'].templates              │    │
│  │   MainView: TemplateDefinition                          │    │
│  │   SettingsView: TemplateDefinition                      │    │
│  │   AboutView: TemplateDefinition                         │    │
│  └─────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                         templateStore                            │
│  activeTemplateId: "MainView"                                   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                        useCanvasData                             │
│  activeTemplate = templates[activeTemplateId] ?? first          │
│  renderableViews = flattenHierarchy(activeTemplate)             │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                           Canvas                                 │
│  Renders views from activeTemplate                              │
└─────────────────────────────────────────────────────────────────┘
```
