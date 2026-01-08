# Quickstart: Save & Export Implementation

## Overview

This feature adds save and export functionality to VSTGUI-Edit. Implementation follows three main tracks:

1. **Serialization** - Convert document back to JSON/XML
2. **Dirty State** - Track unsaved changes
3. **File Operations** - Save, Save As, Export

## Getting Started

### Track 1: JSON Serialization (Start Here)

Location: `src/domain/serializer/`

```typescript
// src/domain/serializer/jsonSerializer.ts
import type { VSTGUIUIDescription } from '../../types/uidesc';

export interface JsonSerializeOptions {
  pretty?: boolean;
  indent?: number;
}

export function serializeToJson(
  doc: VSTGUIUIDescription,
  options?: JsonSerializeOptions
): string {
  const { pretty = true, indent = 2 } = options ?? {};
  return pretty ? JSON.stringify(doc, null, indent) : JSON.stringify(doc);
}
```

Test file: `src/domain/serializer/__tests__/jsonSerializer.spec.ts`

### Track 2: Dirty State

Location: `src/stores/documentStore.ts`

Add to initial state:
```typescript
const initialState: DocumentStoreState = {
  // existing...
  isDirty: false,
  originalFormat: null,
  fileHandle: null,
  lastSavedAt: null,
};
```

Add mutation wrapper:
```typescript
function markDirty(): void {
  setStore({ isDirty: true });
}

function markClean(): void {
  setStore({ isDirty: false, lastSavedAt: new Date() });
}
```

Update all mutation functions to call `markDirty()`.

### Track 3: XML Serialization

Location: `src/domain/serializer/xmlSerializer.ts`

Key conversion patterns:
```typescript
// Colors: { name: value } -> <color name="name" rgba="value"/>
// Fonts: { name: def } -> <font name="name" font-name="..." size="..."/>
// Templates: { name: view } -> <template name="name" ...>children</template>
```

### Track 4: File Operations

Location: `src/services/fileService.ts`

Feature detection:
```typescript
export function hasFileSystemAccess(): boolean {
  return 'showSaveFilePicker' in window;
}
```

Browser fallback flow (FR-018):
```typescript
async function save(): Promise<void> {
  if (!hasFileSystemAccess()) {
    // Show info modal explaining download fallback
    showBrowserFallbackModal();
    // After user acknowledges, trigger download
    return;
  }
  // Normal File System Access API save
}
```

## Key Patterns

### Existing Parser (Reference)

Look at `src/domain/parser/` for patterns:
- `jsonParser.ts` - JSON parsing
- `xmlToJson.ts` - XML to JSON conversion
- `validator.ts` - Schema validation

### Store Mutation Pattern

Every documentStore mutation should end with:
```typescript
export function someUpdateFunction(/*params*/): ReturnType {
  // ... do the update ...
  setStore(produce(draft => { /* mutation */ }));
  markDirty(); // ADD THIS
  return result;
}
```

### beforeunload Pattern

```typescript
// In App.tsx or similar top-level component
import { createEffect, onCleanup } from 'solid-js';
import { documentStore } from './stores/documentStore';

createEffect(() => {
  if (documentStore.isDirty) {
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', handler);
    onCleanup(() => window.removeEventListener('beforeunload', handler));
  }
});
```

## Implementation Order

1. **JSON serialization** - Simple, core functionality
2. **Dirty state tracking** - Foundation for save UX
3. **Save/Download service** - File operations
4. **XML serialization** - More complex conversion
5. **Pre-save validation** - Quality gate
6. **UI components**:
   - FilenameDisplay with dirty indicator (* before filename in toolbar)
   - SaveButton
   - SaveErrorModal (blocking modal for save failures)
   - ValidationModal (errors block with "Save Anyway", warnings proceed)
   - BrowserFallbackModal (info message for unsupported browsers)
7. **Keyboard shortcuts** - Ctrl+S, Ctrl+Shift+S

## Testing Strategy

Each module needs:
- Unit tests for serialization logic
- Integration tests with real uidesc files
- Store tests for dirty state
- Component tests for UI

Use existing test fixtures in `src/__tests__/fixtures/`.
