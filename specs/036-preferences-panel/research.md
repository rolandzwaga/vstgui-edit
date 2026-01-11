# Research: Preferences Panel

**Feature**: 036-preferences-panel
**Date**: 2026-01-11

## Research Questions

### 1. Modal Dialog Pattern

**Question**: How does FormatChangeDialog handle focus trap, Escape key, overlay click?

**Investigation**: Examined `/src/components/SaveButton/FormatChangeDialog.tsx`

**Findings**:

1. **Structure**: Show/when wraps overlay + dialog
2. **Overlay**: Fixed position, full viewport, centers dialog via flexbox
3. **Close behaviors**:
   - Click overlay: `onClick={props.onCancel}`
   - Click dialog: `onClick={(e) => e.stopPropagation()}` prevents bubble
   - Escape key: document keydown listener in createEffect
4. **Focus management**:
   - `requestAnimationFrame(() => confirmButtonRef?.focus())` after open
   - Focus primary action button on open
5. **Cleanup**: `onCleanup(() => document.removeEventListener('keydown', handleKeyDown))`
6. **ARIA**: `role="dialog"`, `aria-modal="true"`, `aria-labelledby`

**CSS Pattern** (FormatChangeDialog.module.css):
```css
.overlay {
  position: fixed;
  inset: 0;
  z-index: var(--z-modal);
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--color-overlay);
}

.dialog {
  width: 100%;
  max-width: 400px; /* Will need larger for preferences: ~700px */
  padding: var(--spacing-6);
  background-color: var(--color-background);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-xl);
}
```

**Decision**: Use identical pattern. Preferences panel will be larger (~700px wide, ~500px tall) but same overlay/dialog structure.

---

### 2. localStorage Persistence Pattern

**Question**: How do alignmentToolbarStore and saveFormatStore persist/load state?

**Investigation**: Examined both stores and formatPreference.ts

**Findings**:

**alignmentToolbarStore.ts**:
```typescript
export const STORAGE_KEY = 'vstgui-edit:alignment-toolbar';

export function loadAlignmentToolbarState(): void {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved) as AlignmentToolbarState;
      setStore({
        isDocked: parsed.isDocked ?? true,  // Default if missing
        floatingPosition: parsed.floatingPosition ?? null,
      });
    }
  } catch {
    // Invalid JSON or other error - use default state
  }
}

export function saveAlignmentToolbarState(): void {
  const state: AlignmentToolbarState = {
    isDocked: store.isDocked,
    floatingPosition: store.floatingPosition,
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}
```

**formatPreference.ts**:
```typescript
export const STORAGE_KEY = 'vstgui-edit:save-format';

export function isValidSaveFormat(value: unknown): value is SaveFormat {
  return value === 'json' || value === 'xml';
}

export function getFormatPreference(): SaveFormat | null {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    if (isValidSaveFormat(value)) {
      return value;
    }
    return null;
  } catch {
    return null;  // localStorage unavailable
  }
}
```

**Key patterns**:
1. Export STORAGE_KEY constant
2. try/catch for localStorage errors (private browsing)
3. Provide defaults for missing fields (`??` operator)
4. Type guards for validation
5. Silent failure on errors

**Decision**: Unified preferences will use single key with schema validation:
- `STORAGE_KEY = 'vstgui-edit:preferences'`
- AJV validation instead of manual type guards
- console.warn on corruption, silent reset to defaults
- Explicit defaults for all fields

---

### 3. Store Initialization Pattern

**Question**: How do existing stores initialize and apply saved preferences?

**Investigation**: Examined gridStore, smartGuidesStore, guidesStore

**Findings**:

**gridStore.ts** - No persistence:
```typescript
const [isVisible, setIsVisible] = createSignal<boolean>(true);
const [size, setSize] = createSignal<GridSizePreset>(DEFAULT_GRID_SIZE);
// ... all signals with hardcoded defaults
// No loadFromStorage or saveToStorage functions
```

**smartGuidesStore.ts** - No persistence:
```typescript
const [isEnabled, setIsEnabled] = createSignal<boolean>(DEFAULT_GUIDES_ENABLED);
// No persistence
```

**guidesStore.ts** - No persistence:
```typescript
const [guides, setGuides] = createSignal<CustomGuide[]>([]);
const [isVisible, setIsVisible] = createSignal<boolean>(true);
// resetGuidesStore() resets to hardcoded defaults
```

**All stores have setters**:
- gridStore: `setGridSize()`, `setGridStyle()`, `toggleVisibility()`
- smartGuidesStore: `toggleSmartGuides()`
- guidesStore: `setGuidesVisibility()`, `setGuidesSnap()`

**Decision**: preferencesStore will:
1. Load preferences from localStorage on init
2. Export `initializeStores()` function that applies preferences to existing stores
3. Call in App.tsx or EditorPage on mount
4. Watch preference changes and auto-apply to stores via createEffect

---

### 4. Settings Control Patterns

**Question**: How do existing editors (BooleanEditor, EnumEditor, NumberEditor) handle state?

**Investigation**: Examined editor components

**Findings**:

**BooleanEditor.tsx**:
```typescript
// Simple checkbox, immediate commit
const handleChange = () => {
  const newValue = isChecked() ? 'false' : 'true';
  props.onChange(newValue);
  props.onCommit();  // Commits immediately
};
```

**EnumEditor.tsx**:
```typescript
// Dropdown with floating-ui positioning
// Keyboard navigation (Arrow keys, Enter, Escape)
// Commits on selection
const selectOption = (option: string) => {
  if (option !== props.value) {
    props.onChange(option);
    props.onCommit();
  }
  closeDropdown();
};
```

**NumberEditor.tsx**:
```typescript
// Input with +/- buttons
// Step/min/max constraints
// Commits on blur or Enter
const handleBlur = () => {
  props.onCommit();
};
```

**Key observations**:
1. Property editors use onChange + onCommit pattern (live preview + history commit)
2. Preferences don't need history - can simplify to just onChange
3. Editors don't have integrated labels - separate from PropertyRow
4. No slider/range input exists - need to create

**Decision**: Create simplified preference-specific controls:

```typescript
// SettingToggle - simpler than BooleanEditor
interface SettingToggleProps {
  label: string;
  description?: string;
  value: boolean;
  onChange: (value: boolean) => void;
  disabled?: boolean;
}

// SettingSelect - simpler than EnumEditor
interface SettingSelectProps<T extends string> {
  label: string;
  description?: string;
  value: T;
  options: readonly T[];
  onChange: (value: T) => void;
  disabled?: boolean;
}

// SettingSlider - new control
interface SettingSliderProps {
  label: string;
  description?: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
  disabled?: boolean;
}
```

---

### 5. Keyboard Shortcuts Reference Data

**Question**: What are the 23 implemented shortcuts to display?

**Investigation**: Reviewed spec and CLAUDE.md

**Findings**: 23 shortcuts across 5 categories:

```typescript
export const KEYBOARD_SHORTCUTS: ShortcutCategory[] = [
  {
    name: 'Canvas Navigation',
    shortcuts: [
      { keys: '+/=', description: 'Zoom In' },
      { keys: '-', description: 'Zoom Out' },
      { keys: '0', description: 'Reset Zoom' },
      { keys: 'F', description: 'Fit to View' },
      { keys: 'G', description: 'Toggle Grid Visibility' },
      { keys: 'Shift+G', description: 'Toggle Snap to Grid' },
      { keys: 'S', description: 'Toggle Smart Guides' },
      { keys: 'Ctrl+;', description: 'Toggle Custom Guides Visibility' },
    ],
  },
  {
    name: 'Selection',
    shortcuts: [
      { keys: 'Ctrl+A', description: 'Select All' },
      { keys: 'Escape', description: 'Clear Selection / Cancel Operation' },
    ],
  },
  {
    name: 'Editing',
    shortcuts: [
      { keys: 'Ctrl+Z', description: 'Undo' },
      { keys: 'Ctrl+Y / Ctrl+Shift+Z', description: 'Redo' },
      { keys: 'Arrow Keys', description: 'Nudge (1px)' },
      { keys: 'Shift+Arrow Keys', description: 'Nudge Fast (10px)' },
    ],
  },
  {
    name: 'Alignment',
    shortcuts: [
      { keys: 'Ctrl+Shift+L', description: 'Align Left' },
      { keys: 'Ctrl+Shift+C', description: 'Align Center' },
      { keys: 'Ctrl+Shift+R', description: 'Align Right' },
      { keys: 'Ctrl+Shift+T', description: 'Align Top' },
      { keys: 'Ctrl+Shift+M', description: 'Align Middle' },
      { keys: 'Ctrl+Shift+B', description: 'Align Bottom' },
    ],
  },
  {
    name: 'View Management',
    shortcuts: [
      { keys: 'Ctrl+L', description: 'Lock/Unlock Selected' },
      { keys: 'Ctrl+H', description: 'Hide/Show Selected' },
      { keys: 'Ctrl+Shift+H', description: 'Show All Hidden' },
    ],
  },
];
```

**Decision**: Store shortcuts data in `domain/preferences/keyboardShortcuts.ts` as const array. Read-only display, no editing capability.

---

### 6. Schema Validation with AJV

**Question**: How is AJV currently used in the project?

**Investigation**: Checked existing validation usage

**Findings**: AJV is used in `src/domain/parser/validate.ts` for uidesc validation:
```typescript
import Ajv from 'ajv';
import schema from '../../../vstgui-uidesc.schema.json';

const ajv = new Ajv({ allErrors: true });
const validateSchema = ajv.compile(schema);

export function validateUidesc(document: unknown): ValidationResult {
  const valid = validateSchema(document);
  // ... error processing
}
```

**Decision**: Create preferences schema inline (small, simple) rather than external JSON file:
```typescript
const preferencesSchema = {
  type: 'object',
  properties: {
    grid: {
      type: 'object',
      properties: {
        size: { type: 'number', enum: [5, 8, 10, 12, 16, 20] },
        style: { type: 'string', enum: ['lines', 'dots', 'crosshairs'] },
        visibleByDefault: { type: 'boolean' },
      },
    },
    // ... other sections
  },
};
```

---

## Unresolved Questions

None - all questions resolved through codebase investigation.

## Summary of Decisions

| Area | Decision |
|------|----------|
| Modal | Follow FormatChangeDialog pattern exactly |
| Storage key | Single unified key: `vstgui-edit:preferences` |
| Validation | AJV with inline schema |
| Corruption | Silent reset to defaults with console.warn |
| Migration | Immediate deletion of legacy keys |
| Controls | New simplified SettingToggle, SettingSelect, SettingSlider |
| Shortcuts | Static const data, read-only display |
| Store sync | preferencesStore applies to existing stores via setters |
