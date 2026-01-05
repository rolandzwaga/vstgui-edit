# Data Model: Canvas Zoom Navigation

**Date**: 2026-01-05 | **Feature**: 005-canvas-zoom

## Entities

### ZoomState (extends canvasStore)

| Field | Type | Default | Constraints | Description |
|-------|------|---------|-------------|-------------|
| zoomLevel | number | 1.0 | 0.1 <= z <= 5.0 | Current zoom level (1.0 = 100%) |

**Validation Rules**:
- `zoomLevel` clamped to [0.1, 5.0] range (FR-004, FR-005)
- Value persists across re-renders within session
- Resets to 1.0 on new document load (FR-009)

### Point (existing type)

| Field | Type | Description |
|-------|------|-------------|
| x | number | X coordinate |
| y | number | Y coordinate |

**Used For**: Cursor position, pan offset calculations

## State Transitions

```
┌─────────────────────────────────────────────────────────────────┐
│                        Zoom State Machine                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  [Initial: 1.0] ─────────────────────────────────────────────►  │
│        │                                                         │
│        │ wheel up (deltaY < 0)                                  │
│        ▼                                                         │
│  [Zoom In] ──► clamp(current * 1.1, max=5.0) ──► update pan     │
│        │                                                         │
│        │ wheel down (deltaY > 0)                                │
│        ▼                                                         │
│  [Zoom Out] ──► clamp(current / 1.1, min=0.1) ──► update pan    │
│        │                                                         │
│        │ new document loaded                                     │
│        ▼                                                         │
│  [Reset: 1.0] ──► pan also resets to {0, 0}                     │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## Relationships

```
documentStore.loadFile()
       │
       │ triggers on success
       ▼
canvasStore.resetZoom() + canvasStore.resetPan()
       │
       │ sets
       ▼
zoomLevel = 1.0, panOffset = {0, 0}
```

## Computed Values

### Combined Transform String

```typescript
// In Canvas.tsx
const transformStyle = () =>
  `translate(${canvasStore.panOffset.x}px, ${canvasStore.panOffset.y}px) scale(${canvasStore.zoomLevel})`;
```

### Zoom Percentage (for future UI)

```typescript
// For potential zoom indicator
const zoomPercentage = () => Math.round(canvasStore.zoomLevel * 100);
// Returns: 10, 100, 200, 500, etc.
```
