# Data Model: JSON Save Format Option

**Feature**: 030-json-save-format | **Date**: 2026-01-10

## Entities

### SaveFormat (existing)

Already defined in `src/domain/serializer/types.ts`:

```typescript
export type SaveFormat = 'json' | 'xml';
```

**Usage**: Represents the file serialization format.

### SaveFormatState (new)

State for the save format selection UI:

```typescript
export interface SaveFormatState {
  /** Currently selected format for saving */
  selectedFormat: SaveFormat;

  /** Whether the dropdown is open */
  isDropdownOpen: boolean;

  /** Whether format change confirmation dialog is open */
  isConfirmDialogOpen: boolean;

  /** Format pending confirmation (when dialog is open) */
  pendingFormat: SaveFormat | null;
}
```

**Location**: `src/stores/saveFormatStore.ts`

### FormatPreference (new)

Persistence utilities for format preference:

```typescript
export interface FormatPreferenceAPI {
  /** Get saved format preference from localStorage */
  getPreference(): SaveFormat | null;

  /** Save format preference to localStorage */
  setPreference(format: SaveFormat): void;

  /** Clear format preference from localStorage */
  clearPreference(): void;
}
```

**Location**: `src/domain/save/formatPreference.ts`

## State Transitions

### Format Selection Flow

```
Initial State
    |
    v
[User loads file] --> originalFormat set in documentStore
    |
    v
[Determine initial selectedFormat]
    1. If originalFormat exists: use originalFormat
    2. Else if localStorage has preference: use preference
    3. Else: use 'json' default
    |
    v
[User clicks chevron] --> isDropdownOpen = true
    |
    v
[User selects format from dropdown]
    |
    +--[Same as current]---> isDropdownOpen = false (no change)
    |
    +--[Different from originalFormat]---> isConfirmDialogOpen = true
    |                                      pendingFormat = selected
    |
    +--[Different but originalFormat is null]---> selectedFormat = selected
                                                   isDropdownOpen = false
                                                   persist to localStorage
```

### Confirmation Dialog Flow

```
[Dialog opens with pendingFormat]
    |
    +--[User clicks "Change Format"]---> selectedFormat = pendingFormat
    |                                    pendingFormat = null
    |                                    isConfirmDialogOpen = false
    |                                    persist to localStorage
    |
    +--[User clicks "Cancel"]---> pendingFormat = null
    |                             isConfirmDialogOpen = false
    |                             (selectedFormat unchanged)
    |
    +--[User presses Escape]---> same as Cancel
```

### Save Action Flow

```
[User clicks main Save button] or [User presses Ctrl+S]
    |
    v
[Close dropdown if open]
    |
    v
[Get content based on selectedFormat]
    - 'json': serializeToJson(document)
    - 'xml': serializeToXml(document)
    |
    v
[Execute save using fileService]
    - If fileHandle exists: saveToFileHandle
    - Else if File System Access: showSaveFilePicker
    - Else: downloadDocument
```

## Validation Rules

### Format Selection

| Rule | Condition | Action |
|------|-----------|--------|
| Valid format | format === 'json' \|\| format === 'xml' | Allow |
| Invalid format | otherwise | Reject, log error |

### Confirmation Required

| Condition | Confirmation Required |
|-----------|----------------------|
| originalFormat === null | No (new document) |
| selectedFormat === originalFormat | No (same format) |
| selectedFormat !== originalFormat | Yes |

## localStorage Schema

**Key**: `vstgui-edit:save-format`

**Value**: `'json'` | `'xml'` (string, not JSON encoded)

**Behavior**:
- Read on app initialization
- Write on confirmed format change
- Graceful degradation if unavailable

## Component Props

### SaveButtonProps (existing, no changes needed)

```typescript
export interface SaveButtonProps {
  class?: string;
}
```

### FormatChangeDialogProps (new)

```typescript
export interface FormatChangeDialogProps {
  /** Whether dialog is visible */
  isOpen: boolean;

  /** Original format of the loaded file */
  originalFormat: SaveFormat;

  /** New format the user wants to switch to */
  newFormat: SaveFormat;

  /** Called when user confirms format change */
  onConfirm: () => void;

  /** Called when user cancels */
  onCancel: () => void;
}
```

## Store API

### saveFormatStore

```typescript
// Read-only state
export const saveFormatStore: {
  readonly selectedFormat: SaveFormat;
  readonly isDropdownOpen: boolean;
  readonly isConfirmDialogOpen: boolean;
  readonly pendingFormat: SaveFormat | null;
};

// Actions
export function initializeFormat(originalFormat: SaveFormat | null): void;
export function openDropdown(): void;
export function closeDropdown(): void;
export function selectFormat(format: SaveFormat): void;
export function confirmFormatChange(): void;
export function cancelFormatChange(): void;
export function resetSaveFormatStore(): void;
```

## Integration Points

### With documentStore

- Read `documentStore.originalFormat` to determine if confirmation needed
- Read `documentStore.document` for serialization
- Read `documentStore.isDirty` for button disabled state
- Read `documentStore.fileHandle` for save target
- Call `markClean()` after successful save

### With fileService

- `serializeToJson()` for JSON format
- `serializeToXml()` for XML format
- `saveToFileHandle()` for File System Access
- `downloadDocument()` for fallback
- `hasFileSystemAccess()` for feature detection
