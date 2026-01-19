# Quickstart: 3D Knob Designer

**Feature**: 044-3d-knob-designer
**Date**: 2026-01-18

## Overview

This guide provides a quick reference for implementing the 3D Knob Designer feature, including key patterns, file locations, and integration points.

---

## File Structure

```
src/
├── components/
│   └── KnobDesigner/
│       ├── KnobDesignerModal.tsx       # Main modal component
│       ├── KnobDesignerModal.module.css
│       ├── KnobPreview.tsx             # 3D canvas wrapper
│       ├── KnobPreview.module.css
│       ├── LayerPanel.tsx              # Layer list and controls
│       ├── LayerPanel.module.css
│       ├── LayerItem.tsx               # Single layer item
│       ├── LayerItem.module.css
│       ├── MaterialPanel.tsx           # Material controls
│       ├── MaterialPanel.module.css
│       ├── IndicatorPanel.tsx          # Indicator controls
│       ├── IndicatorPanel.module.css
│       ├── LightingPanel.tsx           # Lighting controls
│       ├── LightingPanel.module.css
│       ├── OutputPanel.tsx             # Output configuration
│       ├── OutputPanel.module.css
│       ├── PresetSelector.tsx          # Preset dropdown
│       ├── PresetSelector.module.css
│       ├── index.ts                    # Barrel export
│       └── __tests__/
│           ├── KnobDesignerModal.spec.tsx
│           ├── LayerPanel.spec.tsx
│           └── ...
│
├── domain/
│   └── knobDesigner/
│       ├── defaults.ts                 # Default values, built-in presets
│       ├── validation.ts               # Validation functions
│       ├── geometry.ts                 # Geometry calculations
│       ├── materials.ts                # Material factory
│       ├── scene.ts                    # Scene setup
│       ├── filmstrip.ts                # Filmstrip generation
│       ├── historyOperations.ts        # Undo/redo operations
│       ├── index.ts                    # Barrel export
│       └── __tests__/
│           ├── validation.spec.ts
│           ├── geometry.spec.ts
│           └── ...
│
├── services/
│   └── indexedDB/
│       ├── database.ts                 # Add presets store (modify)
│       └── presetService.ts            # New preset CRUD service
│
├── stores/
│   └── knobDesignerStore.ts            # Modal state management
│
└── types/
    └── knobDesigner.ts                 # Type definitions
```

---

## Key Patterns

### 1. Opening the Modal from BitmapItem

```typescript
// In BitmapItem.tsx, add button in expanded properties:
<button
  type="button"
  class={styles.designKnobButton}
  onClick={(e) => {
    e.stopPropagation();
    openKnobDesigner(props.name, props.projectId!);
  }}
  disabled={!props.projectId}
>
  Design Knob
</button>
```

### 2. Three.js Canvas Integration

```typescript
// KnobPreview.tsx
import { onMount, onCleanup } from 'solid-js';
import { knobRendererService } from '../../domain/knobDesigner';

export const KnobPreview: Component<KnobPreviewProps> = (props) => {
  let canvasRef: HTMLCanvasElement | undefined;

  onMount(() => {
    if (!canvasRef) return;

    try {
      knobRendererService.initialize(canvasRef);
      knobRendererService.updateScene(props.design);
      knobRendererService.startPreviewAnimation();
    } catch (e) {
      props.onError?.('WebGL not available');
    }
  });

  onCleanup(() => {
    knobRendererService.stopPreviewAnimation();
    knobRendererService.dispose();
  });

  // Re-render when design changes
  createEffect(() => {
    const design = props.design;
    knobRendererService.updateScene(design);
  });

  return <canvas ref={canvasRef} class={styles.canvas} />;
};
```

### 3. Modal-Scoped History

```typescript
// stores/knobDesignerStore.ts
import { createSignal } from 'solid-js';
import type { HistoryOperation } from '../types/history';

const MAX_HISTORY = 50;

function createModalHistory() {
  const [undoStack, setUndoStack] = createSignal<HistoryOperation[]>([]);
  const [redoStack, setRedoStack] = createSignal<HistoryOperation[]>([]);

  return {
    get canUndo() { return undoStack().length > 0; },
    get canRedo() { return redoStack().length > 0; },

    push(op: HistoryOperation) {
      setUndoStack(stack => {
        const newStack = [...stack, op];
        return newStack.length > MAX_HISTORY
          ? newStack.slice(-MAX_HISTORY)
          : newStack;
      });
      setRedoStack([]);
    },

    undo() {
      const stack = undoStack();
      if (stack.length === 0) return;
      const op = stack[stack.length - 1];
      setUndoStack(stack.slice(0, -1));
      setRedoStack(redo => [...redo, op]);
      op.undo();
    },

    redo() {
      const stack = redoStack();
      if (stack.length === 0) return;
      const op = stack[stack.length - 1];
      setRedoStack(stack.slice(0, -1));
      setUndoStack(undo => [...undo, op]);
      op.redo();
    },

    clear() {
      setUndoStack([]);
      setRedoStack([]);
    },
  };
}

// Initialize when modal opens, clear when closes
const modalHistory = createModalHistory();
```

### 4. Brushed Metal Shader

```typescript
// domain/knobDesigner/materials.ts
import { MeshStandardMaterial, Vector2 } from 'three';

export function createBrushedMetalMaterial(params: {
  color: string;
  direction: 'radial' | 'linear';
  intensity: number;
  roughness: number;
}): MeshStandardMaterial {
  const material = new MeshStandardMaterial({
    color: params.color,
    metalness: 1.0,
    roughness: params.roughness,
  });

  material.onBeforeCompile = (shader) => {
    // Add uniforms
    shader.uniforms.brushDirection = {
      value: params.direction === 'linear'
        ? new Vector2(1, 0)
        : new Vector2(0, 0), // 0,0 = radial mode
    };
    shader.uniforms.brushIntensity = { value: params.intensity / 100 };

    // Inject noise function
    shader.fragmentShader = shader.fragmentShader.replace(
      '#include <common>',
      `
      #include <common>
      uniform vec2 brushDirection;
      uniform float brushIntensity;

      float brushNoise(vec2 uv) {
        vec2 dir = brushDirection.x == 0.0 && brushDirection.y == 0.0
          ? normalize(uv - 0.5)  // Radial
          : brushDirection;     // Linear
        float n = fract(sin(dot(uv * dir, vec2(12.9898, 78.233))) * 43758.5453);
        return n * brushIntensity * 0.1;
      }
      `
    );

    // Apply noise to color
    shader.fragmentShader = shader.fragmentShader.replace(
      '#include <dithering_fragment>',
      `
      gl_FragColor.rgb += brushNoise(vUv);
      #include <dithering_fragment>
      `
    );
  };

  // Force shader recompilation on uniform change
  material.needsUpdate = true;

  return material;
}
```

### 5. Filmstrip Generation

```typescript
// domain/knobDesigner/filmstrip.ts
import { WebGLRenderTarget, RGBAFormat, LinearFilter } from 'three';

export async function generateFilmstrip(
  renderer: THREE.WebGLRenderer,
  scene: THREE.Scene,
  camera: THREE.OrthographicCamera,
  knobGroup: THREE.Group,
  config: OutputConfig,
  onProgress: (progress: GenerationProgress) => void
): Promise<string> {
  const { frameCount, frameWidth, frameHeight, startAngle, sweepAngle } = config;
  const framesPerRow = calculateFramesPerRow(frameCount);
  const rows = Math.ceil(frameCount / framesPerRow);
  const totalWidth = frameWidth * framesPerRow;
  const totalHeight = frameHeight * rows;

  // Create render target
  const target = new WebGLRenderTarget(totalWidth, totalHeight, {
    minFilter: LinearFilter,
    magFilter: LinearFilter,
    format: RGBAFormat,
  });

  // Render each frame
  for (let i = 0; i < frameCount; i++) {
    const col = i % framesPerRow;
    const row = Math.floor(i / framesPerRow);
    const x = col * frameWidth;
    const y = (rows - 1 - row) * frameHeight; // Flip Y

    // Set viewport/scissor
    renderer.setViewport(x, y, frameWidth, frameHeight);
    renderer.setScissor(x, y, frameWidth, frameHeight);
    renderer.setScissorTest(true);

    // Rotate knob
    const angle = startAngle + (i / (frameCount - 1)) * sweepAngle;
    knobGroup.rotation.y = (angle * Math.PI) / 180;

    // Render
    renderer.setRenderTarget(target);
    renderer.render(scene, camera);

    // Report progress
    onProgress({
      stage: 'rendering',
      currentFrame: i,
      totalFrames: frameCount,
      percent: Math.round((i / frameCount) * 100),
    });

    // Yield to UI
    await new Promise(resolve => setTimeout(resolve, 0));
  }

  // Extract pixels
  const pixels = new Uint8Array(totalWidth * totalHeight * 4);
  renderer.readRenderTargetPixels(target, 0, 0, totalWidth, totalHeight, pixels);

  // Create canvas and export
  const canvas = document.createElement('canvas');
  canvas.width = totalWidth;
  canvas.height = totalHeight;
  const ctx = canvas.getContext('2d')!;
  const imageData = new ImageData(
    new Uint8ClampedArray(pixels),
    totalWidth,
    totalHeight
  );
  ctx.putImageData(imageData, 0, 0);

  // Cleanup
  target.dispose();

  return canvas.toDataURL('image/png');
}

function calculateFramesPerRow(frameCount: number): number {
  // Prefer square-ish layout with power of 2 width
  const sqrt = Math.sqrt(frameCount);
  const candidates = [8, 16, 32, 64];
  return candidates.find(c => c >= sqrt) ?? 64;
}
```

### 6. Preset Service

```typescript
// services/indexedDB/presetService.ts
import type { KnobPreset } from '../../types/knobDesigner';
import { STORES, INDEXES } from '../../domain/project/types';
import { getStore, promisifyRequest } from './database';

export const presetService = {
  async add(preset: KnobPreset): Promise<void> {
    const store = getStore(STORES.PRESETS, 'readwrite');
    await promisifyRequest(store.put(preset));
  },

  async get(id: string): Promise<KnobPreset | undefined> {
    const store = getStore(STORES.PRESETS, 'readonly');
    return promisifyRequest(store.get(id));
  },

  async getByName(name: string): Promise<KnobPreset | undefined> {
    const store = getStore(STORES.PRESETS, 'readonly');
    const index = store.index(INDEXES.PRESETS_BY_NAME);
    return promisifyRequest(index.get(name));
  },

  async getAll(): Promise<KnobPreset[]> {
    const store = getStore(STORES.PRESETS, 'readonly');
    const all = await promisifyRequest(store.getAll());
    // Sort: built-in first, then alphabetical
    return all.sort((a, b) => {
      if (a.isBuiltIn !== b.isBuiltIn) return a.isBuiltIn ? -1 : 1;
      return a.name.localeCompare(b.name);
    });
  },

  async delete(id: string): Promise<void> {
    const preset = await this.get(id);
    if (preset?.isBuiltIn) {
      throw new Error('Cannot delete built-in preset');
    }
    const store = getStore(STORES.PRESETS, 'readwrite');
    await promisifyRequest(store.delete(id));
  },

  async isNameTaken(name: string, excludeId?: string): Promise<boolean> {
    const existing = await this.getByName(name);
    return existing !== undefined && existing.id !== excludeId;
  },

  async seedBuiltInPresets(): Promise<void> {
    const existing = await this.getAll();
    if (existing.some(p => p.isBuiltIn)) return; // Already seeded

    for (const template of BUILTIN_PRESET_TEMPLATES) {
      await this.add({
        ...template,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }
  },
};
```

---

## Database Migration

Update `src/services/indexedDB/database.ts`:

```typescript
// Update DB_VERSION in domain/project/types.ts
export const DB_VERSION = 2;

// Add to STORES constant
export const STORES = {
  PROJECTS: 'projects',
  BITMAPS: 'bitmaps',
  PRESETS: 'presets',  // NEW
} as const;

// Add to INDEXES constant
export const INDEXES = {
  BITMAPS_BY_PROJECT: 'projectId',
  PRESETS_BY_NAME: 'name',  // NEW
} as const;

// In openDatabase() onupgradeneeded handler:
if (!db.objectStoreNames.contains(STORES.PRESETS)) {
  const presetStore = db.createObjectStore(STORES.PRESETS, { keyPath: 'id' });
  presetStore.createIndex(INDEXES.PRESETS_BY_NAME, 'name', { unique: true });
}
```

---

## Integration Points

### BitmapItem Integration
- Add "Design Knob" button in expanded properties section
- Pass `props.name` and `props.projectId` to `openKnobDesigner()`

### Bitmap Update After Generation
```typescript
// After filmstrip generation completes:
const dataUrl = await generateFilmstrip(...);
const blob = await dataUrlToBlob(dataUrl);

// Update bitmap in IndexedDB
await bitmapService.add({
  id: crypto.randomUUID(),
  projectId: targetProjectId,
  name: targetBitmapName,
  blob,
  mimeType: 'image/png',
  width: totalWidth,
  height: totalHeight,
  size: blob.size,
  addedAt: new Date().toISOString(),
});

// Update uidesc document with multiframe properties
updateBitmapProperty(targetBitmapName, 'multiframe-num-frames', String(frameCount));
updateBitmapProperty(targetBitmapName, 'multiframe-size', `${frameWidth}, ${frameHeight}`);
```

---

## Keyboard Shortcuts

| Key | Action | Scope |
|-----|--------|-------|
| Ctrl+Z | Undo | Modal only |
| Ctrl+Y | Redo | Modal only |
| Escape | Close modal / Cancel generation | Modal only |

---

## Testing Strategy

1. **Unit Tests**: Validation, geometry calculations, material factory
2. **Integration Tests**: Store operations with mock IndexedDB
3. **Component Tests**: Panel interactions, form validation
4. **Visual Tests**: Three.js rendering (manual verification)

### Mock Three.js for Unit Tests
```typescript
vi.mock('three', () => ({
  WebGLRenderer: vi.fn(),
  Scene: vi.fn(),
  OrthographicCamera: vi.fn(),
  // ...
}));
```

---

## Performance Considerations

1. **Preview Rendering**: Limit to 30 FPS using `requestAnimationFrame`
2. **Geometry Updates**: Debounce parameter changes (100ms)
3. **Filmstrip Generation**: Use `setTimeout(0)` between frames for UI responsiveness
4. **Memory**: Dispose Three.js resources on modal close

---

## Error Handling

| Error | User Message | Recovery |
|-------|--------------|----------|
| WebGL unavailable | "WebGL is required for 3D preview" | Show fallback UI |
| IndexedDB unavailable | "Presets will only be available this session" | Use in-memory storage |
| Generation failure | "Failed to generate filmstrip: {reason}" | Allow retry |
| Preset name exists | "A preset with this name already exists" | Prompt rename |
