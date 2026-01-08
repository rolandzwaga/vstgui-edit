# Data Model: Fonts Panel

**Feature**: 023-fonts-panel  
**Date**: 2026-01-08

## Entities

### FontDefinition

Represents a font resource definition in the uidesc file.

```typescript
interface FontDefinition {
  'font-name': string;              // Required - System font name (e.g., "Arial", "Helvetica")
  size: string;                     // Required - Font size in points (numericValue format)
  bold?: BooleanValue;              // Optional - "true" or "false"
  italic?: BooleanValue;            // Optional - "true" or "false"
  underline?: BooleanValue;         // Optional - "true" or "false"
  'strike-through'?: BooleanValue;  // Optional - "true" or "false"
  'alternative-font-names'?: string; // Optional - Comma-separated fallback fonts
}

type BooleanValue = 'true' | 'false';
```

**Location in uidesc**: `vstgui-ui-description.fonts`

**Example**:
```json
{
  "fonts": {
    "NormalFont": {
      "font-name": "Arial",
      "size": "12"
    },
    "TitleFont": {
      "font-name": "Helvetica",
      "size": "18",
      "bold": "true"
    },
    "ItalicFont": {
      "font-name": "Times New Roman",
      "size": "14",
      "italic": "true",
      "alternative-font-names": "Georgia, serif"
    }
  }
}
```

### FontUsage

Tracks where a font is referenced in the view hierarchy.

```typescript
interface FontUsage {
  viewId: string;      // ID/path to the view
  viewClass: string;   // View class name (e.g., "CTextLabel")
  attribute: string;   // Always "font" for fonts
}
```

### RemovedFontReference

Captures references removed when deleting a font (for undo).

```typescript
interface RemovedFontReference {
  viewId: string;      // View that had the reference
  attribute: string;   // Attribute name (always "font")
  value: string;       // Original value (e.g., "~ TitleFont")
}
```

## Validation Rules

### Font Resource Name

| Rule | Validation | Error Message |
|------|------------|---------------|
| Non-empty | `name.trim().length > 0` | "Font name cannot be empty" |
| Unique | `!(name in existingFonts)` | "A font with this name already exists" |
| Case-sensitive | Exact match check | (implicit - VSTGUI is case-sensitive) |

### Font Properties

| Property | Rule | Error Message |
|----------|------|---------------|
| `font-name` | Non-empty | "System font name is required" |
| `size` | Positive number | "Size must be a positive number" |
| `size` | Warn if > 72 | "Warning: Size is unusually large" |
| `bold` | "true" or "false" or undefined | "Invalid boolean value" |
| `italic` | "true" or "false" or undefined | "Invalid boolean value" |
| `underline` | "true" or "false" or undefined | "Invalid boolean value" |
| `strike-through` | "true" or "false" or undefined | "Invalid boolean value" |
| `alternative-font-names` | Any string | No validation |

### Validation Functions

```typescript
interface ValidationResult {
  valid: boolean;
  error?: string;
  warning?: string;
}

function validateFontName(name: string, existingNames: string[]): ValidationResult;
function validateSystemFontName(fontName: string): ValidationResult;
function validateFontSize(size: string): ValidationResult;
function validateBooleanProperty(value: string): ValidationResult;
```

## State Transitions

### Font Lifecycle

```
[New] --> addFont(name, definition) --> [Exists]
[Exists] --> updateFontName(old, new) --> [Exists (renamed)]
[Exists] --> updateFontProperty(name, prop, value) --> [Exists (modified)]
[Exists] --> deleteFont(name) --> [Deleted]
[Deleted] --> undo() --> [Exists (restored)]
```

### Edit State per FontItem

```
[Display] --> double-click property --> [Editing]
[Editing] --> Enter/blur with valid --> [Display (updated)]
[Editing] --> Enter/blur with invalid --> [Editing (error shown)]
[Editing] --> Escape --> [Display (reverted)]
```

## Relationships

### Font → Views

```
Font "TitleFont" ──< references >── View (font="~ TitleFont")
                                 └── View (font="~ TitleFont")
```

One font can be referenced by many views. Views reference fonts by name prefixed with `~ `.

### Font → Document

```
Document ──< contains >── fonts: Record<string, FontDefinition>
```

Fonts are stored as a key-value map where the key is the font resource name.

## Display Formatting

### Font Name Truncation

```typescript
function truncateFontName(name: string, maxLength: number = 30): string;
// "VeryLongFontNameThatExceeds..." with tooltip showing full name
```

### Property Summary

```typescript
function summarizeFontProperties(font: FontDefinition): string;
// "Arial 12pt B I" - shows font-name, size, and style indicators
```

### Size Display

```typescript
function formatFontSize(size: string): string;
// "12pt" - adds pt suffix for display
```

## Default Values

### New Font Defaults

```typescript
const DEFAULT_FONT: FontDefinition = {
  'font-name': 'Arial',
  size: '12',
};
```

### New Font Name Generation

```typescript
function generateUniqueFontName(existingFonts: Record<string, FontDefinition>): string;
// Returns "New Font", "New Font 2", "New Font 3", etc.
```
