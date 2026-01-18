# Research: 3D Knob Designer

**Feature**: 044-3d-knob-designer
**Date**: 2026-01-18
**Status**: Complete

## Overview

This document captures research findings for implementing the 3D Knob Designer feature using Three.js for WebGL rendering.

---

## 1. Single-Pass Multi-Viewport Rendering (FR-033)

### Research Question
Can filmstrip generation use single-pass multi-viewport rendering with WebGL instancing to render all frames in one draw call?

### Findings

**Answer: Not directly with InstancedMesh for our use case.**

After extensive research, the original FR-033 requirement for "single-pass multi-viewport rendering with WebGL instancing to render all frames in one draw call" is **technically problematic** for filmstrip generation. Here's why:

#### What Instancing Actually Does
- [InstancedMesh](https://threejs.org/docs/pages/InstancedMesh.html) renders multiple copies of the **same geometry and material** with different **world transformations** (position, rotation, scale)
- It reduces draw calls for rendering many identical objects **within a single viewport**
- Each instance appears in the **same rendered frame**, not in separate frames

#### The Filmstrip Challenge
A filmstrip requires **different camera angles** (or different knob rotations) for each frame - this is fundamentally incompatible with instancing because:
1. All instances share the same camera view
2. Each instance needs a different rotation to represent a different frame
3. We need to capture each frame as a **separate tile** in the final image

#### Correct Approach: Multi-Pass with Render Target
The technically correct approach for filmstrip generation is:

1. **Create a large WebGLRenderTarget** sized to hold all frames (e.g., frameWidth * framesPerRow x frameHeight * numRows)
2. **For each frame**:
   - Set `renderer.setViewport()` to the frame's tile position
   - Set `renderer.setScissor()` to prevent overdraw
   - Rotate the knob to the frame's angle
   - Call `renderer.render(scene, camera)`
3. **Extract pixels** with `renderer.readRenderTargetPixels()` or copy to canvas

**Sources**:
- [Three.js Multiple Views Example](https://github.com/timoxley/threejs/blob/master/examples/webgl_multiple_views.html)
- [WebGL Multiple Views](https://webglfundamentals.org/webgl/lessons/webgl-multiple-views.html)
- [Three.js Render Targets](https://threejsfundamentals.org/threejs/lessons/threejs-rendertargets.html)

### Decision
**Replace FR-033** with optimized multi-pass rendering:
- Use a single large `WebGLRenderTarget` sized for the entire filmstrip
- Render each frame into a tile using `setViewport()` and `setScissor()`
- Process all frames without creating/destroying render targets per frame
- Extract final image once after all frames are rendered

### Alternative Considered: True Single-Pass with Custom Shader
A theoretical single-pass approach would require:
- Custom vertex shader that transforms each instance to a different viewport region
- Per-instance rotation uniforms via `InstancedBufferAttribute`
- Complex custom material extending standard lighting

**Rejected because**: Complexity far exceeds benefit. Multi-pass with viewport tiling is standard practice and performs well (typically <10 seconds for 128 frames at 100x100).

---

## 2. Custom GLSL Brushed Metal Shader (FR-017)

### Research Question
How to implement procedural brushed metal texture using custom GLSL fragment shader?

### Findings

#### Brushed Metal Characteristics
Brushed metal has:
1. **Anisotropic reflection** - light reflects differently along vs perpendicular to brush direction
2. **Fine grain texture** - small parallel scratches creating noise pattern
3. **Directional specular highlight** - elongated highlight perpendicular to brush direction

#### Implementation Approaches

**Option A: ShaderMaterial with Full Custom Lighting (Not Recommended)**
- Write complete PBR lighting in GLSL
- Maximum control but significant complexity
- Loses Three.js lighting integration

**Option B: onBeforeCompile Shader Injection (Recommended)**
- Extend `MeshStandardMaterial` or `MeshPhysicalMaterial`
- Inject custom noise into the fragment shader at specific injection points
- Preserves all PBR lighting calculations
- Can use `csm_FragColor` or similar patterns

**Option C: three-custom-shader-material Library**
- NPM package: [three-custom-shader-material](https://www.npmjs.com/package/three-custom-shader-material)
- Cleaner API for extending materials
- **Dependency consideration**: Would need user approval

#### Procedural Noise Functions

From [The Book of Shaders](https://thebookofshaders.com/11/) and [GLSL Noise Algorithms](https://gist.github.com/patriciogonzalezvivo/670c22f3966e662d2f83):

```glsl
// Simple directional noise for brushed metal
float brushedMetalNoise(vec2 uv, vec2 direction, float scale, float intensity) {
    // Project UV onto direction vector
    float projection = dot(uv, direction) * scale;

    // Fractal noise with directional bias
    float n = 0.0;
    float amplitude = 1.0;
    for (int i = 0; i < 4; i++) {
        n += amplitude * fract(sin(projection * 12.9898) * 43758.5453);
        projection *= 2.0;
        amplitude *= 0.5;
    }

    return n * intensity;
}
```

#### Radial vs Linear Brush Direction
- **Linear**: `direction = normalize(vec2(1.0, 0.0))` - straight lines
- **Radial**: `direction = normalize(uv - 0.5)` - circular brush from center

### Decision
- Use `MeshStandardMaterial.onBeforeCompile` to inject procedural noise
- No additional dependencies required
- Implement both radial and linear brush directions
- Configurable noise scale and intensity uniforms

### Implementation Sketch

```typescript
function createBrushedMetalMaterial(params: BrushedMetalParams): MeshStandardMaterial {
    const material = new MeshStandardMaterial({
        color: params.color,
        metalness: 1.0,
        roughness: params.roughness,
    });

    material.onBeforeCompile = (shader) => {
        shader.uniforms.brushDirection = { value: params.direction };
        shader.uniforms.brushScale = { value: params.scale };
        shader.uniforms.brushIntensity = { value: params.intensity };

        // Inject uniforms
        shader.fragmentShader = `
            uniform vec2 brushDirection;
            uniform float brushScale;
            uniform float brushIntensity;
            ${shader.fragmentShader}
        `;

        // Inject noise modification before output
        shader.fragmentShader = shader.fragmentShader.replace(
            '#include <output_fragment>',
            `
            // Brushed metal noise
            vec2 brushUV = vUv; // or calculate from position for radial
            float noise = brushedMetalNoise(brushUV, brushDirection, brushScale, brushIntensity);
            gl_FragColor.rgb += noise * 0.05;
            #include <output_fragment>
            `
        );
    };

    return material;
}
```

**Sources**:
- [Three.js Forum - Brushed Metal Anisotropy](https://discourse.threejs.org/t/how-to-apply-brushed-metal-anisotropy-on-meshstandardmaterial/32945)
- [Modified Materials - Three.js Journey](https://threejs-journey.com/lessons/modified-materials)
- [THREE-CustomShaderMaterial](https://github.com/FarazzShaikh/THREE-CustomShaderMaterial)

---

## 3. Adaptive Geometry Detail (FR-012)

### Research Question
How to generate knob geometry with adaptive detail based on output size?

### Findings

#### LatheGeometry for Knob Profiles
[LatheGeometry](https://threejs.org/docs/#api/en/geometries/LatheGeometry) is ideal for knob shapes:
- Creates geometry by rotating a 2D profile around Y-axis
- Parameters: `points` (Vector2[]), `segments`, `phiStart`, `phiLength`

```typescript
// Create knob profile
const profile = [
    new Vector2(0, 0),           // Center bottom
    new Vector2(radius, 0),      // Base outer edge
    new Vector2(radius, bevelHeight), // Bevel start
    new Vector2(radius - bevelRadius, height - bevelRadius), // Bevel top
    new Vector2(0, height),      // Center top
];

const geometry = new LatheGeometry(profile, segments);
```

#### Adaptive Segment Calculation
From spec assumption #9:
```typescript
function calculateSegments(diameter: number): number {
    // Formula: segments = clamp(diameter * 0.4, 16, 128)
    return Math.max(16, Math.min(128, Math.floor(diameter * 0.4)));
}
```

For typical configurations:
- 50px diameter: 20 segments
- 100px diameter: 40 segments
- 200px diameter: 80 segments
- 300px+ diameter: 128 segments (max)

#### CylinderGeometry for Simple Layers
For cylindrical/tapered skirts:
```typescript
new CylinderGeometry(radiusTop, radiusBottom, height, segments);
```

- `radiusTop` = `radiusBottom`: Cylindrical
- `radiusTop` < `radiusBottom`: Tapered inward
- Custom angle calculations for angled skirts

### Decision
- Use `LatheGeometry` for cap with bevel profile
- Use `CylinderGeometry` for simple skirts
- Calculate segments at render time based on output frame size
- Rebuild geometry when frame dimensions change (not on every parameter change)

---

## 4. Ambient Occlusion (FR-026)

### Research Question
Best approach for ambient occlusion in a modal 3D preview?

### Findings

#### Options Evaluated

**Option A: N8AO Post-Processing (Recommended)**
- [N8AO](https://github.com/N8python/n8ao) - "efficient and visually pleasing SSAO with emphasis on temporal stability"
- Works with Three.js EffectComposer
- Configurable `aoRadius`, `distanceFalloff`, `intensity`
- **Dependency consideration**: Would need user approval

**Option B: Built-in SSAOPass**
- [Three.js SSAO Example](https://threejs.org/examples/webgl_postprocessing_ssao.html)
- Uses John Chapman's SSAO algorithm
- Built into Three.js examples, no external dependency
- Suitable for indirectly lit surfaces

**Option C: Baked AO in Material**
- Pre-calculate AO based on geometry
- Simple for symmetrical knobs
- No post-processing overhead
- Less accurate but faster

**Option D: No AO for Preview, Add for Generation**
- Keep preview rendering fast
- Apply AO only during filmstrip generation
- Best of both worlds for performance

#### Performance Considerations
From [Three.js Forum](https://discourse.threejs.org/t/new-ambient-occlusion-example-hbao-vs-n8ao/58847):
- SSAO adds significant per-pixel cost
- May impact preview responsiveness on lower-end devices
- N8AO is optimized but still adds overhead

### Decision
- **Primary**: Use Three.js built-in SAO/SSAO during **filmstrip generation only**
- **Preview**: Simple approximation via material settings (increased roughness at edges)
- **Configurable**: Allow users to toggle AO strength (FR-026 specifies adjustable strength)
- **No external dependency**: Use Three.js examples/addons for SAO

---

## 5. Three.js Scene Setup

### Research Question
Optimal Three.js setup for knob rendering with transparent background?

### Findings

#### WebGLRenderer Configuration

```typescript
const renderer = new WebGLRenderer({
    canvas: canvas,
    antialias: true,
    alpha: true,                    // Enable transparency
    preserveDrawingBuffer: true,    // Required for toDataURL
});
renderer.setClearColor(0x000000, 0); // Fully transparent background
```

**Sources**:
- [Transparent Background - Three.js Forum](https://discourse.threejs.org/t/transparent-background/22742)
- [ThreeJS Transparent Background](https://www.prowaretech.com/articles/current/javascript/three-js/transparent-background)

#### Camera Setup for Knob Rendering
For 2D filmstrip output, use `OrthographicCamera`:

```typescript
const aspect = frameWidth / frameHeight;
const frustumSize = knobDiameter * 1.1; // 10% padding

const camera = new OrthographicCamera(
    frustumSize * aspect / -2,  // left
    frustumSize * aspect / 2,   // right
    frustumSize / 2,            // top
    frustumSize / -2,           // bottom
    0.1,                        // near
    1000                        // far
);
camera.position.set(0, 0, 100);
camera.lookAt(0, 0, 0);
```

#### Lighting Setup

```typescript
// Main directional light (user-adjustable position)
const mainLight = new DirectionalLight(0xffffff, 1.0);
mainLight.position.setFromSphericalCoords(
    100,                        // distance
    elevation * Math.PI / 180,  // phi (from zenith)
    azimuth * Math.PI / 180     // theta (around Y)
);

// Ambient light for fill
const ambientLight = new AmbientLight(0xffffff, 0.3);
```

### Decision
- Use `OrthographicCamera` for consistent knob size regardless of distance
- Configure renderer with `alpha: true` and `preserveDrawingBuffer: true`
- Single directional light with spherical coordinate positioning
- Ambient fill light for shadow areas

---

## 6. MeshPhysicalMaterial for Metals

### Research Question
How to configure MeshPhysicalMaterial for realistic metallic knob materials?

### Findings

From [MeshPhysicalMaterial Docs](https://threejs.org/docs/pages/MeshPhysicalMaterial.html):

#### Material Presets

**Metallic Material** (FR-015):
```typescript
{
    color: userColor,
    metalness: 1.0,
    roughness: userRoughness,    // 0 = mirror, 1 = matte
    // reflectivity has no effect when metalness = 1
}
```

**Matte Material** (FR-016):
```typescript
{
    color: userColor,
    metalness: 0.0,
    roughness: 1.0,
    // No specular highlights
}
```

**Solid Color** (FR-014):
```typescript
{
    color: userColor,
    metalness: 0.0,
    roughness: 1.0,
    // Essentially same as matte for flat color
}
```

#### Shininess/Reflectivity Mapping (FR-015)
Spec mentions "shininess 0-128" and "reflectivity 0-100%":
- Map shininess to inverse roughness: `roughness = 1 - (shininess / 128)`
- Reflectivity applies to non-metals only, ignored for metalness=1
- For user-perceived "reflectivity" on metal, adjust environment map intensity

### Decision
- Use `MeshStandardMaterial` for most materials (lighter than Physical)
- Use `MeshPhysicalMaterial` only for clearcoat effects if needed
- Map user-friendly "shininess" to PBR "roughness"
- Provide environment map for reflections (simple gradient for preview)

---

## 7. Filmstrip Export to PNG

### Research Question
How to export rendered filmstrip as transparent PNG?

### Findings

#### Approach 1: Render to Large Target, Read Pixels

```typescript
// Create render target for entire filmstrip
const target = new WebGLRenderTarget(
    frameWidth * framesPerRow,
    frameHeight * numRows,
    {
        minFilter: LinearFilter,
        magFilter: LinearFilter,
        format: RGBAFormat,
    }
);

// Render each frame to appropriate tile
for (let i = 0; i < numFrames; i++) {
    const col = i % framesPerRow;
    const row = Math.floor(i / framesPerRow);

    renderer.setViewport(col * frameWidth, row * frameHeight, frameWidth, frameHeight);
    renderer.setScissor(col * frameWidth, row * frameHeight, frameWidth, frameHeight);
    renderer.setScissorTest(true);

    // Rotate knob for this frame
    knobGroup.rotation.y = startAngle + (i / (numFrames - 1)) * sweepAngle;

    renderer.setRenderTarget(target);
    renderer.render(scene, camera);
}

// Read pixels
const pixels = new Uint8Array(totalWidth * totalHeight * 4);
renderer.readRenderTargetPixels(target, 0, 0, totalWidth, totalHeight, pixels);

// Create canvas and export
const canvas = document.createElement('canvas');
canvas.width = totalWidth;
canvas.height = totalHeight;
const ctx = canvas.getContext('2d');
const imageData = new ImageData(
    new Uint8ClampedArray(pixels),
    totalWidth,
    totalHeight
);
ctx.putImageData(imageData, 0, 0);
const dataURL = canvas.toDataURL('image/png');
```

**Note**: WebGL Y-axis is inverted, may need to flip the image.

**Sources**:
- [Render to Texture](https://code.tutsplus.com/quick-tip-how-to-render-to-a-texture-in-threejs--cms-25686t)
- [Three.js RTT Example](https://threejs.org/examples/webgl_rtt.html)

### Decision
- Use `WebGLRenderTarget` for offscreen rendering
- Render all frames using viewport/scissor tiling
- Read pixels once after all frames complete
- Convert to canvas and export as PNG data URL
- Flip Y-axis during ImageData creation if needed

---

## 8. IndexedDB Preset Storage

### Research Question
How to extend existing IndexedDB infrastructure for presets?

### Findings

Existing infrastructure in `src/services/indexedDB/`:
- `database.ts`: `openDatabase()`, `getStore()`, `promisifyRequest()`
- `bitmapService.ts`: CRUD pattern to follow
- Schema version in `src/domain/project/types.ts`: `DB_VERSION = 1`

#### Database Schema Extension

```typescript
// Add to STORES constant
export const STORES = {
    PROJECTS: 'projects',
    BITMAPS: 'bitmaps',
    PRESETS: 'presets',  // NEW
} as const;

// Add to INDEXES constant
export const INDEXES = {
    BITMAPS_BY_PROJECT: 'projectId',
    PRESETS_BY_NAME: 'name',  // NEW - for duplicate checking
} as const;

// Bump version
export const DB_VERSION = 2;  // Was 1
```

#### Migration in openDatabase()

```typescript
request.onupgradeneeded = event => {
    const db = (event.target as IDBOpenDBRequest).result;

    // ... existing store creation ...

    // Create presets store (version 2)
    if (!db.objectStoreNames.contains(STORES.PRESETS)) {
        const presetStore = db.createObjectStore(STORES.PRESETS, { keyPath: 'id' });
        presetStore.createIndex(INDEXES.PRESETS_BY_NAME, 'name', { unique: true });
    }
};
```

#### Preset Entity

```typescript
interface KnobPreset {
    id: string;           // UUID
    name: string;         // Unique display name
    isBuiltIn: boolean;   // true for starter templates
    createdAt: string;    // ISO timestamp
    updatedAt: string;    // ISO timestamp
    design: KnobDesign;   // Complete design configuration
}
```

### Decision
- Add `presets` object store with unique name index
- Follow existing `bitmapService` CRUD pattern
- Seed built-in templates on first load
- Bump DB_VERSION to 2 for migration

---

## 9. Modal Undo/Redo Architecture

### Research Question
How to implement modal-scoped undo/redo independent of main editor?

### Findings

Existing `historyStore` pattern:
```typescript
const [undoStack, setUndoStack] = createSignal<HistoryOperation[]>([]);
const [redoStack, setRedoStack] = createSignal<HistoryOperation[]>([]);
```

#### Modal-Scoped History Pattern

Create a factory function returning isolated store:

```typescript
function createModalHistory(maxOperations: number = 50) {
    const [undoStack, setUndoStack] = createSignal<HistoryOperation[]>([]);
    const [redoStack, setRedoStack] = createSignal<HistoryOperation[]>([]);

    return {
        get canUndo() { return undoStack().length > 0; },
        get canRedo() { return redoStack().length > 0; },

        push(op: HistoryOperation): void {
            setUndoStack(stack => {
                const newStack = [...stack, op];
                if (newStack.length > maxOperations) {
                    return newStack.slice(-maxOperations);
                }
                return newStack;
            });
            setRedoStack([]);
        },

        undo(): void { /* similar to historyStore */ },
        redo(): void { /* similar to historyStore */ },
        clear(): void { setUndoStack([]); setRedoStack([]); },
    };
}
```

#### Usage in Modal Component

```typescript
const KnobDesignerModal: Component = (props) => {
    const history = createModalHistory(50);

    // Pass to child components or use context
    // Clear on modal close (FR-035)
    onCleanup(() => history.clear());

    // Handle Ctrl+Z/Y (FR-036)
    const handleKeyDown = (e: KeyboardEvent) => {
        if (e.ctrlKey && e.key === 'z') history.undo();
        if (e.ctrlKey && e.key === 'y') history.redo();
    };
};
```

### Decision
- Create `createModalHistory()` factory function
- 50 operation limit per FR-006 success criteria
- Clear on modal close
- Local keyboard handler for Ctrl+Z/Y within modal

---

## 10. Dependency Approval Needed

### Three.js (REQUIRED)
- **Package**: `three` (npm)
- **Purpose**: WebGL 3D rendering, scene graph, materials, lighting
- **Size**: ~150KB minified+gzipped
- **Justification**: Industry-standard library specified in FR-045. No viable alternative for WebGL abstraction.
- **Status**: NEEDS USER APPROVAL per constitution XI

### Optional Dependencies (NOT Recommended)

These were evaluated but are NOT recommended to minimize dependencies:

1. **three-custom-shader-material**: Custom shader extension - can use `onBeforeCompile` instead
2. **n8ao**: Ambient occlusion - can use built-in Three.js SAO
3. **postprocessing**: Effect composer - can use Three.js examples/jsm

---

## Summary of Key Decisions

| Topic | Decision | Rationale |
|-------|----------|-----------|
| Multi-viewport rendering | Multi-pass with single RenderTarget | Instancing doesn't apply to filmstrip generation |
| Brushed metal shader | onBeforeCompile injection | No external dependency, preserves PBR |
| Geometry | LatheGeometry + CylinderGeometry | Native Three.js, adaptive segments |
| Ambient occlusion | Built-in SAO, preview-off | No dependency, performance balance |
| Camera | OrthographicCamera | Consistent knob size |
| Materials | MeshStandardMaterial | Lighter than Physical for most cases |
| Export | RenderTarget + readPixels + Canvas | Standard approach |
| Preset storage | New IndexedDB store, DB_VERSION 2 | Extends existing infrastructure |
| Modal history | Factory pattern, 50 ops max | Isolated from main editor |
| Dependency | Three.js only | Minimize bundle impact |

---

## References

### Official Documentation
- [Three.js Documentation](https://threejs.org/docs/)
- [Three.js Examples](https://threejs.org/examples/)
- [WebGL Fundamentals](https://webglfundamentals.org/)

### Three.js Specific
- [InstancedMesh Docs](https://threejs.org/docs/pages/InstancedMesh.html)
- [MeshPhysicalMaterial Docs](https://threejs.org/docs/pages/MeshPhysicalMaterial.html)
- [WebGLRenderTarget](https://threejsfundamentals.org/threejs/lessons/threejs-rendertargets.html)
- [Multiple Views Example](https://threejs.org/examples/webgl_multiple_views.html)

### Shader Resources
- [The Book of Shaders - Noise](https://thebookofshaders.com/11/)
- [GLSL Noise Algorithms](https://gist.github.com/patriciogonzalezvivo/670c22f3966e662d2f83)
- [Brushed Metal Anisotropy Discussion](https://discourse.threejs.org/t/how-to-apply-brushed-metal-anisotropy-on-meshstandardmaterial/32945)

### Post-Processing
- [Three.js SSAO Example](https://threejs.org/examples/webgl_postprocessing_ssao.html)
- [N8AO GitHub](https://github.com/N8python/n8ao)
- [Three.js SAO Example](https://threejs.org/examples/webgl_postprocessing_sao.html)

### Performance
- [InstancedMesh Performance](https://waelyasmina.net/articles/instanced-rendering-in-three-js/)
- [WebGL Best Practices - MDN](https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/WebGL_best_practices)
