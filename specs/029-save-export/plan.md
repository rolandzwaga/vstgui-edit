# Implementation Plan: Save & Export

**Branch**: `029-save-export` | **Date**: 2026-01-08 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/029-save-export/spec.md`

## Summary

Implement document saving and export functionality for VSTGUI-Edit. Users can save their work to the current file (Ctrl+S), save to a new location (Save As), and export to JSON or XML formats with formatting options. The feature includes dirty state tracking, visual indicators for unsaved changes, and pre-save validation.

## Technical Context

**Language/Version**: TypeScript 5.9.x with strict mode enabled
**Primary Dependencies**: SolidJS 1.9.x, solid-js/store (already installed - no new dependencies)
**Storage**: Browser File System Access API (for Save), File download via Blob/URL (for Save As/Export)
**Testing**: Vitest 4.x with @solidjs/testing-library
**Testing Guide**: `specs/TESTING-GUIDE.md` - MUST be consulted for all test tasks
**Target Platform**: Modern browsers (Chrome, Firefox, Safari, Edge)
**Project Type**: Single SPA (SolidJS frontend)
**Performance Goals**: Save completes in < 1 second for files up to 1MB (SC-001)
**Constraints**: Dirty state indicator updates within 100ms of modification (SC-002)
**Scale/Scope**: Typical uidesc files 10KB-500KB, max expected ~2MB

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Gate | Status | Notes |
|------|--------|-------|
| SolidJS Only (XII) | ✅ PASS | Using SolidJS signals/stores exclusively |
| Static Imports (XXI) | ✅ PASS | No dynamic imports needed |
| Test-First (I) | ✅ WILL FOLLOW | Tests written before implementation |
| No New Dependencies (XI) | ✅ PASS | Using existing browser APIs |
| CSS Modules (XV) | ✅ PASS | Components will use module CSS |

## Project Structure

### Documentation (this feature)

```text
specs/029-save-export/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
└── tasks.md             # Phase 2 output (/speckit.tasks command)
```

### Source Code (repository root)

```text
src/
├── domain/
│   └── serializer/           # NEW: Serialization logic
│       ├── index.ts          # Public API
│       ├── jsonSerializer.ts # JSON serialization
│       ├── xmlSerializer.ts  # XML serialization
│       ├── validation.ts     # Pre-save validation
│       └── __tests__/
│           ├── jsonSerializer.spec.ts
│           ├── xmlSerializer.spec.ts
│           └── validation.spec.ts
├── stores/
│   └── documentStore.ts      # EXTEND: Add dirty state tracking
├── services/
│   └── fileService.ts        # NEW: File save/download operations
└── components/
    ├── Toolbar/
    │   ├── SaveButton.tsx        # NEW: Save button component
    │   ├── SaveButton.module.css
    │   ├── FilenameDisplay.tsx   # NEW: Filename with dirty indicator (*)
    │   └── FilenameDisplay.module.css
    └── Modals/
        ├── SaveErrorModal.tsx    # NEW: Save failure modal (FR-017)
        ├── SaveErrorModal.module.css
        ├── ValidationModal.tsx   # NEW: Validation errors/warnings (FR-014)
        ├── ValidationModal.module.css
        ├── BrowserFallbackModal.tsx  # NEW: Info for unsupported browsers (FR-018)
        └── BrowserFallbackModal.module.css
```

**Structure Decision**: Single project extending existing `src/domain/` and `src/stores/` patterns. Serialization logic in `domain/serializer/` mirrors the existing `domain/parser/` pattern.

## Complexity Tracking

No violations to justify - design follows existing patterns.

---

## Phase 0: Research

### Research Tasks

1. **File System Access API**: Research browser File System Access API for saving to original file location
2. **beforeunload Event**: Research best practices for browser close warning with unsaved changes
3. **XML Serialization**: Research VSTGUI XML format requirements for valid uidesc output
4. **JSON-to-XML Conversion**: Research how to convert JSON structure back to VSTGUI XML format

### Key Findings

#### 1. File System Access API

The File System Access API allows web apps to read/write files on the user's device:

```typescript
// Save to existing file handle
const writable = await fileHandle.createWritable();
await writable.write(content);
await writable.close();

// Save As - shows file picker
const handle = await window.showSaveFilePicker({
  types: [{ description: 'VSTGUI UIDesc', accept: { 'application/json': ['.uidesc'] } }]
});
```

**Decision**: Use File System Access API where available (Chrome, Edge), fallback to download for unsupported browsers (Firefox, Safari).

**Browser Support**:
- Chrome/Edge: Full support for `showSaveFilePicker` and `FileSystemFileHandle`
- Firefox/Safari: Must use download fallback (Blob + anchor click)

#### 2. beforeunload Event

Standard pattern for warning on unsaved changes:

```typescript
window.addEventListener('beforeunload', (e) => {
  if (isDirty) {
    e.preventDefault();
    e.returnValue = ''; // Required for Chrome
  }
});
```

**Decision**: Implement in a SolidJS `createEffect` that reacts to dirty state signal.

#### 3. VSTGUI XML Format

The original VSTGUI uidesc format is XML. Key structure:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<vstgui-ui-description version="1">
  <colors>
    <color name="Background" rgba="#000000ff"/>
  </colors>
  <fonts>
    <font name="Label" font-name="Arial" size="12"/>
  </fonts>
  <bitmaps>
    <bitmap name="knob" path="knob.png"/>
  </bitmaps>
  <templates>
    <template name="MainView" class="CViewContainer" origin="0, 0" size="400, 300">
      <view class="CTextLabel" origin="10, 10" size="100, 20" title="Hello"/>
    </template>
  </templates>
</vstgui-ui-description>
```

**Decision**: Create dedicated XML serializer that handles VSTGUI-specific conventions.

#### 4. JSON-to-XML Conversion

Key mapping rules:
- Root object: `vstgui-ui-description` → `<vstgui-ui-description version="1">`
- Resource collections (colors, fonts, etc.): Object entries become child elements with `name` attribute
- View hierarchy: `children` object keys are ignored, children become nested `<view>` elements
- Attributes: JSON object properties become XML attributes

**Decision**: Implement reverse of `xmlToJson` logic in `src/domain/parser/xmlToJson.ts`.

---

## Phase 1: Design

### Data Model

See `data-model.md` for full details.

**Key Additions to documentStore**:

```typescript
interface DocumentStoreState {
  // Existing fields...
  
  // NEW: Save/Export state
  isDirty: boolean;              // Document has unsaved changes
  originalFormat: FormatType;    // Format when loaded ('json' | 'xml')
  fileHandle: FileSystemFileHandle | null;  // For File System Access API
  lastSavedAt: Date | null;      // Timestamp of last save
}
```

### Contracts

See `contracts/` directory for:
- `serializer.ts` - Serialization interface
- `fileService.ts` - File operations interface

### API Design

#### Serialization Module (`src/domain/serializer/`)

```typescript
// Public API
export function serializeToJson(doc: VSTGUIUIDescription, options?: JsonSerializeOptions): string;
export function serializeToXml(doc: VSTGUIUIDescription): string;
export function validateDocument(doc: VSTGUIUIDescription): ValidationResult;
```

#### Document Store Extensions

```typescript
// New exports from documentStore
export function markDirty(): void;
export function markClean(): void;
export function setFileHandle(handle: FileSystemFileHandle | null): void;
```

#### File Service (`src/services/fileService.ts`)

```typescript
export async function saveDocument(content: string): Promise<SaveResult>;
export async function saveAsDocument(content: string, filename: string): Promise<SaveResult>;
export function downloadDocument(content: string, filename: string, format: FormatType): void;
```

### Component Design

#### SaveButton

Location: Toolbar next to existing buttons
Behavior:
- Click or Ctrl+S: Save to current file (or Save As if no file handle)
- Ctrl+Shift+S: Always Save As

Visual:
- Floppy disk icon (or similar)
- Disabled when not dirty
- Shows saving spinner during operation

#### Dirty Indicator

Location: Toolbar, before filename
Visual:
- Asterisk (*) before filename in toolbar when dirty
- Example: `* myfile.uidesc` when dirty, `myfile.uidesc` when clean

### Dirty State Tracking

**Strategy**: Wrap all mutation functions in documentStore to automatically set dirty flag.

Current mutation functions that need wrapping:
- `updateViewOrigin`
- `updateViewSize`
- `updateViewAttribute`
- `removeView` / `removeViews`
- `addView`
- `reparentView`
- `reorderView`
- All resource mutations (colors, fonts, bitmaps, etc.)

**Implementation**: Create `markDirty()` helper, call at end of each mutation function.

---

## Architecture Decisions

### AD-001: Dirty State via Wrapper Functions

**Decision**: Mark dirty at the end of each documentStore mutation function.

**Alternatives Considered**:
- Proxy pattern on store: Too complex, harder to test
- Manual markDirty calls: Error-prone, easy to forget
- Deep comparison: Performance concern for large documents

**Rationale**: Simple, explicit, follows existing pattern.

### AD-002: File System Access API with Download Fallback

**Decision**: Use File System Access API for native save experience where supported, download for others.

**Fallback Behavior (FR-018)**: On browsers without File System Access API (Firefox, Safari), Save (Ctrl+S) shows an info message explaining that the browser doesn't support direct file saving, then triggers a file download.

**Rationale**: Best UX for Chrome/Edge users (majority), graceful fallback with explanation for others.

### AD-003: Preserve Original Format on Save

**Decision**: When user presses Save (not Export), preserve the format the file was loaded in.

**Rationale**: Meets FR-011 requirement, prevents accidental format changes.

### AD-004: Save Failure Handling (FR-017)

**Decision**: Show blocking modal dialog on save failure with error details and retry/cancel options.

**Rationale**: Users need to know save failed and have clear options. Modal ensures they acknowledge the failure before continuing.

### AD-005: Validation Error Handling (FR-014)

**Decision**: Validation errors block save; user must fix issues or explicitly click "Save Anyway" to proceed. Warnings show but don't block.

**Rationale**: Prevents accidental saving of invalid files while allowing expert users to override when necessary.

### AD-006: External File Modification

**Decision**: No detection of external file changes. Editor silently overwrites on save.

**Rationale**: Browser APIs don't provide reliable external modification detection. Attempting partial solutions would create false sense of security.

---

## Quickstart

See `quickstart.md` for implementation getting-started guide.
