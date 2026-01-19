# vstgui-edit

A visual editor for VSTGUI `.uidesc` files. These files define the UI layout for VST, AU, and AAX audio plugins using the [VSTGUI framework](https://github.com/steinbergmedia/vstgui).

**[Live Demo](https://rolandzwaga.github.io/vstgui-edit/)**

## Features

### File Handling
- Drag-and-drop file upload
- JSON and XML format support with automatic detection
- Schema validation with detailed error reporting
- Save/export to JSON or XML
- Create new uidesc files from scratch

### Projects
- Persistent project storage using IndexedDB
- Upload and store bitmaps referenced in your uidesc files
- Standard, 9-Part, and Multi-Frame bitmap type support
- Auto-detection of multi-frame dimensions for filmstrip bitmaps
- Project thumbnails and management (rename, duplicate, delete)
- Automatic save with dirty state tracking

### 3D Knob Designer
- Create filmstrip animations for CAnimKnob controls without external tools
- Real-time 3D preview with WebGL rendering
- Up to 3 concentric layers with configurable diameter, height, and bevel
- Material types: solid, metallic, matte, and brushed metal (radial/linear grain)
- Position indicators: dot, line, notch, or groove
- Adjustable lighting (azimuth, elevation, ambient occlusion)
- Filmstrip output: configurable frame count, size, rotation sweep, and layout
- PNG export with optimized compression
- Built-in presets for quick starting points

### Canvas
- Zoomable, pannable workspace (mouse wheel, middle-drag, Space+drag)
- Configurable grid overlay with snap-to-grid
- Smart alignment guides during drag operations
- Custom guide lines (drag from rulers)
- Rulers with cursor position indicator
- Template bounds visualization
- Styled view mode (P): preview colors and frames from uidesc properties
- Interactive CAnimKnob filmstrip preview: click and drag to scrub through animation frames

### View Editing
- Click and marquee selection (Shift for multi-select)
- Drag to move views with axis constraint (Shift)
- Resize with 8 handles (Shift for aspect ratio, Alt for center-resize)
- Arrow key nudging
- Lock and hide views
- Full undo/redo history

### Alignment Tools
- Align left, center, right, top, middle, bottom
- Distribute horizontally and vertically
- Keyboard shortcuts for all alignment operations

### Properties Panel
- Grouped attribute display
- Multi-view editing with mixed value handling
- Specialized editors: text, point, number, boolean, enum, color, font, bitmap
- Live preview with commit on blur/Enter

### Color Picker
- HSB gradient picker with hue and alpha sliders
- HEX, RGB, and HSL input modes
- Document colors, predefined VSTGUI colors, recent colors
- Eyedropper tool

### Find/Replace
- Search by view class or attribute value
- Category and scope filters
- Replace with undo support
- Result navigation (F3/Shift+F3)

### Preferences
- Grid size, style, and snap settings
- Smart guides and custom guides configuration
- Theme selection (Light/Dark/System)
- Keyboard shortcuts reference

## Tech Stack

SolidJS, TypeScript, Vite, Three.js, Vitest, Biome

## Development

```bash
npm install
npm run dev      # Start dev server
npm test         # Run tests
npm run build    # Production build
```

## License

See [LICENSE](LICENSE) for details.
