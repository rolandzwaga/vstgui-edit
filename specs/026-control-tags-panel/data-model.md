# Data Model: Control Tags Panel

## Entities

### ControlTagsDefinition (existing)

**Location**: `src/types/uidesc.ts`

```typescript
export type ControlTagsDefinition = Record<string, string>;
```

- **Key**: Tag name (string, e.g., "Volume", "Pan", "Bypass")
- **Value**: Tag ID as string (string representation of integer, e.g., "0", "1", "-1")

### ControlTagUsage (new)

**Location**: `src/domain/controlTags/usage.ts`

```typescript
export interface ControlTagUsage {
  viewId: string;        // Unique identifier of the view using this tag
  viewClass: string;     // View class name (e.g., "CSlider", "CKnob")
  templateName: string;  // Name of the template containing the view
}
```

### ValidationResult (new)

**Location**: `src/domain/controlTags/validation.ts`

```typescript
export interface ValidationResult {
  valid: boolean;
  error?: string;
}
```

### RemovedControlTagReference (new)

**Location**: `src/domain/controlTags/historyOperations.ts`

```typescript
export interface RemovedControlTagReference {
  viewId: string;       // View ID that had the reference
  attribute: string;    // Always 'control-tag'
  value: string;        // The tag name that was referenced
}
```

## Relationships

```
┌─────────────────────────────┐
│ VSTGUIUIDescription         │
│  └── 'vstgui-ui-description'│
│       └── 'control-tags'    │◄──────┐
│            └── {name: id}   │       │ referenced by name
└─────────────────────────────┘       │
                                      │
┌─────────────────────────────┐       │
│ ViewNode                    │       │
│  └── attributes             │       │
│       └── 'control-tag'     │───────┘
│            (tag name)       │
└─────────────────────────────┘
```

## Validation Rules

### Tag Name Validation

1. **Non-empty**: Name must have at least 1 character
2. **Unique**: Name must not exist in current control-tags (except when editing self)
3. **Whitespace**: Leading/trailing whitespace is trimmed

```typescript
function validateTagName(
  name: string,
  existingNames: string[],
  currentName?: string  // For edit mode - exclude self from uniqueness check
): ValidationResult {
  const trimmed = name.trim();
  
  if (trimmed.length === 0) {
    return { valid: false, error: 'Name cannot be empty' };
  }
  
  const others = currentName 
    ? existingNames.filter(n => n !== currentName)
    : existingNames;
    
  if (others.includes(trimmed)) {
    return { valid: false, error: 'Name already exists' };
  }
  
  return { valid: true };
}
```

### Tag ID Validation

1. **Integer format**: Must be a valid integer (positive, negative, or zero)
2. **Unique**: ID must not be used by another tag (except when editing self)
3. **No floating point**: "1.5" is invalid
4. **No leading zeros**: "007" is valid (parsed as 7), but display should be normalized

```typescript
function validateTagId(
  id: string,
  existingIds: string[],
  currentId?: string  // For edit mode - exclude self from uniqueness check
): ValidationResult {
  const trimmed = id.trim();
  
  // Check if valid integer
  if (!/^-?\d+$/.test(trimmed)) {
    return { valid: false, error: 'Tag ID must be an integer' };
  }
  
  const numericId = Number.parseInt(trimmed, 10);
  
  if (!Number.isFinite(numericId)) {
    return { valid: false, error: 'Tag ID must be a valid number' };
  }
  
  const others = currentId
    ? existingIds.filter(i => i !== currentId)
    : existingIds;
    
  const normalizedOthers = others.map(i => String(Number.parseInt(i, 10)));
  
  if (normalizedOthers.includes(String(numericId))) {
    return { valid: false, error: 'Tag ID already in use' };
  }
  
  return { valid: true };
}
```

## State Transitions

### Add Control Tag

```
Initial State:
  control-tags: { "Volume": "0" }

Action: addControlTag("Pan", "1")

Final State:
  control-tags: { "Volume": "0", "Pan": "1" }
```

### Rename Control Tag

```
Initial State:
  control-tags: { "Volume": "0" }
  views: [{ class: "CSlider", "control-tag": "Volume" }]

Action: updateControlTagName("Volume", "MainVolume")

Final State:
  control-tags: { "MainVolume": "0" }
  views: [{ class: "CSlider", "control-tag": "MainVolume" }]
  
Note: View references are NOT updated automatically.
The control-tag attribute stores the name, so renaming
breaks the reference. This is expected VSTGUI behavior.
```

### Update Control Tag ID

```
Initial State:
  control-tags: { "Volume": "0" }

Action: updateControlTagId("Volume", "10")

Final State:
  control-tags: { "Volume": "10" }
  
Note: View references are unaffected as they reference by name.
```

### Delete Control Tag

```
Initial State:
  control-tags: { "Volume": "0", "Pan": "1" }
  views: [
    { class: "CSlider", "control-tag": "Volume" },
    { class: "CKnob", "control-tag": "Pan" }
  ]

Action: deleteControlTag("Volume")

Final State:
  control-tags: { "Pan": "1" }
  views: [
    { class: "CSlider" },  // control-tag attribute removed
    { class: "CKnob", "control-tag": "Pan" }
  ]
  
Returns: {
  tagId: "0",
  removedReferences: [
    { viewId: "view-1", attribute: "control-tag", value: "Volume" }
  ]
}
```

## Auto-Assignment Logic

### Next Available Tag ID (FR-007)

Find the lowest non-negative integer not in use:

```typescript
function getNextAvailableTagId(existingTags: Record<string, string>): string {
  const usedIds = new Set(
    Object.values(existingTags)
      .map(id => Number.parseInt(id, 10))
      .filter(id => id >= 0)  // Only consider non-negative for gap-filling
  );
  
  let nextId = 0;
  while (usedIds.has(nextId)) {
    nextId++;
  }
  return String(nextId);
}
```

**Examples**:
- Existing: {} → Returns "0"
- Existing: { A: "0" } → Returns "1"
- Existing: { A: "0", B: "2" } → Returns "1" (fills gap)
- Existing: { A: "0", B: "1", C: "3" } → Returns "2" (fills gap)
- Existing: { A: "-1", B: "0" } → Returns "1" (negative IDs don't affect)
