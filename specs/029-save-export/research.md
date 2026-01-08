# Research: Save & Export

## 1. File System Access API

### Decision
Use File System Access API for Chrome/Edge, download fallback for Firefox/Safari.

### Rationale
- Chrome/Edge support `showSaveFilePicker()` and `FileSystemFileHandle`
- Firefox/Safari require download via Blob + anchor element
- Feature detection: `'showSaveFilePicker' in window`

### Alternatives Considered
1. **Download only**: Simpler, but worse UX - can't save to same file
2. **Native File System polyfill**: Adds dependency, limited benefit

### Implementation Pattern
```typescript
// Feature detection
const hasFileSystemAccess = 'showSaveFilePicker' in window;

// Save with file handle (Chrome/Edge)
async function saveWithHandle(handle: FileSystemFileHandle, content: string): Promise<void> {
  const writable = await handle.createWritable();
  await writable.write(content);
  await writable.close();
}

// Download fallback (Firefox/Safari)
function downloadFile(content: string, filename: string): void {
  const blob = new Blob([content], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
```

---

## 2. beforeunload Event

### Decision
Use `window.beforeunload` event with SolidJS `createEffect` to manage lifecycle.

### Rationale
- Standard browser API, works across all browsers
- SolidJS effect ensures handler is updated when dirty state changes
- Must return/set `returnValue` for browser to show native dialog

### Implementation Pattern
```typescript
import { createEffect, onCleanup } from 'solid-js';

function setupBeforeUnloadWarning(isDirty: () => boolean) {
  createEffect(() => {
    if (isDirty()) {
      const handler = (e: BeforeUnloadEvent) => {
        e.preventDefault();
        e.returnValue = ''; // Required for Chrome
      };
      window.addEventListener('beforeunload', handler);
      onCleanup(() => window.removeEventListener('beforeunload', handler));
    }
  });
}
```

### Notes
- Cannot customize the message text (browser security)
- User must interact with page before beforeunload works

---

## 3. VSTGUI XML Format

### Decision
Create dedicated XML serializer following VSTGUI conventions exactly.

### Rationale
- Must produce XML that VSTGUI runtime can load
- Specific element structure and attribute ordering expected
- Need to handle special cases (bitmaps, fonts, gradients)

### XML Structure Reference

```xml
<?xml version="1.0" encoding="UTF-8"?>
<vstgui-ui-description version="1">
  <!-- Colors: name attribute, rgba value as attribute -->
  <colors>
    <color name="Background" rgba="#000000ff"/>
  </colors>
  
  <!-- Fonts: name attribute, properties as attributes -->
  <fonts>
    <font name="Label" font-name="Arial" size="12" bold="false" italic="false"/>
  </fonts>
  
  <!-- Bitmaps: name attribute, path as attribute, optional nine-part-tiled -->
  <bitmaps>
    <bitmap name="knob" path="knob.png"/>
    <bitmap name="slider" path="slider.png" nine-part-tiled-offsets="5, 5, 5, 5"/>
  </bitmaps>
  
  <!-- Gradients: name attribute, color-stop children -->
  <gradients>
    <gradient name="HeaderGradient">
      <color-stop rgba="#ff0000ff" start="0"/>
      <color-stop rgba="#0000ffff" start="1"/>
    </gradient>
  </gradients>
  
  <!-- Control Tags: name attribute, tag value as attribute -->
  <control-tags>
    <control-tag name="Volume" tag="0"/>
  </control-tags>
  
  <!-- Variables: name attribute, type and value as attributes -->
  <variables>
    <var name="Margin" type="string" value="10"/>
  </variables>
  
  <!-- Templates: name attribute, view hierarchy as children -->
  <templates>
    <template name="MainView" class="CViewContainer" origin="0, 0" size="400, 300">
      <view class="CTextLabel" origin="10, 10" size="100, 20" title="Hello"/>
      <view class="CViewContainer" origin="10, 40" size="200, 200">
        <view class="CKnob" origin="10, 10" size="50, 50"/>
      </view>
    </template>
  </templates>
  
  <!-- Custom section: verbatim preservation -->
  <custom>
    <!-- Editor-specific metadata -->
  </custom>
</vstgui-ui-description>
```

### Key Conversion Rules
| JSON Property | XML Element/Attribute |
|--------------|----------------------|
| `vstgui-ui-description` | `<vstgui-ui-description version="1">` |
| `colors.{name}: value` | `<color name="{name}" rgba="{value}"/>` |
| `fonts.{name}: {def}` | `<font name="{name}" font-name="..." size="..."/>` |
| `bitmaps.{name}: path` | `<bitmap name="{name}" path="{path}"/>` |
| `templates.{name}` | `<template name="{name}" ...>` |
| `view.children.{key}` | `<view ...>` (key ignored) |

---

## 4. JSON Serialization Options

### Decision
Support pretty-print (default) and minified JSON output.

### Rationale
- Pretty-print for human readability and version control diffs
- Minified for reduced file size when needed

### Implementation Pattern
```typescript
interface JsonSerializeOptions {
  pretty?: boolean;  // default: true
  indent?: number;   // default: 2 (spaces)
}

function serializeToJson(doc: VSTGUIUIDescription, options?: JsonSerializeOptions): string {
  const { pretty = true, indent = 2 } = options ?? {};
  return pretty 
    ? JSON.stringify(doc, null, indent)
    : JSON.stringify(doc);
}
```

---

## 5. Pre-Save Validation

### Decision
Leverage existing AJV validation from parser module.

### Rationale
- Already have JSON Schema validation in `src/domain/parser/validator.ts`
- Reuse `validateUidesc()` function before save
- Report warnings (proceed allowed) vs errors (must confirm)

### Validation Categories
| Category | Severity | Action |
|----------|----------|--------|
| Invalid JSON structure | Error | Block save, show error |
| Schema violation | Error | Show warning, allow save with confirmation |
| Missing required attributes | Warning | Show warning, allow save |
| Orphaned references | Warning | Show warning, allow save |

### Implementation Pattern
```typescript
interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];   // Must fix before save
  warnings: ValidationError[]; // Can save with warning
}

function validateBeforeSave(doc: VSTGUIUIDescription): ValidationResult {
  const schemaResult = validateUidesc(doc);
  // Additional custom validation...
  return {
    valid: schemaResult.valid,
    errors: schemaResult.errors?.filter(e => e.severity === 'error') ?? [],
    warnings: schemaResult.errors?.filter(e => e.severity === 'warning') ?? [],
  };
}
```

---

## 6. Dirty State Tracking Strategy

### Decision
Add `isDirty` signal to documentStore, mark dirty at end of all mutation functions.

### Rationale
- Simple, explicit approach
- Easy to test
- Follows existing documentStore pattern

### Functions to Mark Dirty
All state-mutating functions in documentStore:
- `updateViewOrigin`
- `updateViewSize`  
- `updateViewAttribute`
- `removeView` / `removeViews`
- `addView`
- `restoreView`
- `duplicateView`
- `reparentView`
- `reorderView`
- `createGroupContainer`
- `ungroupContainer`
- `addColor` / `updateColorName` / `updateColorValue` / `deleteColor`
- `addFont` / `updateFontName` / `updateFontProperty` / `deleteFont`
- `addBitmap` / `updateBitmapName` / `updateBitmapProperty` / `deleteBitmap`
- `addGradient` / `updateGradientName` / `updateGradientStops` / `deleteGradient`
- `addVariable` / `updateVariableName` / `updateVariableValue` / `deleteVariable`
- `addControlTag` / `updateControlTagName` / `updateControlTagId` / `deleteControlTag`
- `renameTemplate` / `addTemplate` / `deleteTemplate` / `duplicateTemplate`

### Clear Dirty On
- Successful save (`markClean()`)
- Document reset (`reset()`)
- New document load (`loadFile()`)

---

## Summary of Decisions

| Area | Decision |
|------|----------|
| File Save | File System Access API + download fallback |
| Close Warning | beforeunload event with SolidJS effect |
| XML Output | Custom serializer following VSTGUI conventions |
| JSON Options | Pretty (2-space) and minified modes |
| Validation | Reuse existing AJV schema validation |
| Dirty Tracking | Signal in documentStore, mark in mutations |
| Dirty Indicator | Asterisk (*) before filename in toolbar |
| Save Failure | Blocking modal dialog with retry/cancel |
| Browser Fallback | Info message explaining download, then download |
| External Modification | Not detected; silently overwrite |
| Validation Errors | Block save; require "Save Anyway" to proceed |
