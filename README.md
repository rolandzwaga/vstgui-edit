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

### Canvas
- Zoomable, pannable workspace (mouse wheel, middle-drag, Space+drag)
- Configurable grid overlay with snap-to-grid
- Smart alignment guides during drag operations
- Custom guide lines (drag from rulers)
- Rulers with cursor position indicator
- Template bounds visualization
- Styled view mode (P): preview colors and frames from uidesc properties

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

SolidJS, TypeScript, Vite, Vitest, Biome

## Development

```bash
npm install
npm run dev      # Start dev server
npm test         # Run tests
npm run build    # Production build
```

## License

See [LICENSE](LICENSE) for details.
