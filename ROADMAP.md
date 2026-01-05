# VSTGUI-Edit Visual Editor Roadmap

A phased development plan for building a visual editor for VSTGUI `.uidesc` files.

---

## Project Vision

Create a visual editor that allows users to:
- View uidesc UI elements rendered as rectangles in a 2D canvas
- Navigate using pan, zoom, and fit-to-view
- Select and inspect view properties
- Graphically edit elements using mouse and keyboard
- Move, resize, add, and delete views
- Edit view properties through a dedicated panel
- Manage resources (colors, fonts, bitmaps, gradients, control-tags)
- Save changes back to valid uidesc JSON/XML

---

## Phase 1: Canvas Foundation

**Goal**: Render uidesc views as rectangles in a 2D canvas with navigation

### Core Canvas
- **Canvas Component** - 2D rendering surface using HTML Canvas or SVG
- **Coordinate System** - Match uidesc coordinate space (origin top-left, pixels)
- **View Rendering** - Draw views as rectangles using `origin` and `size` attributes
- **View Labels** - Display class name or custom label on each view
- **Hierarchy Rendering** - Nested views drawn in correct z-order (children on top)
- **Viewport Bounds** - Show template bounds as a distinct rectangle

### Navigation
- **Pan** - Middle-mouse drag or Space+drag to pan canvas
- **Zoom** - Mouse wheel to zoom in/out, centered on cursor
- **Zoom Controls** - Zoom in, zoom out, zoom to fit, zoom to 100%
- **Fit to View** - Auto-fit template to viewport (keyboard: `F`)
- **Minimap** - Optional overview for large templates

### Grid System
- **Grid Display** - Render grid lines or dots on canvas background
- **Grid Visibility Toggle** - Show/hide grid (keyboard: `G`)
- **Grid Size** - Configurable spacing (default: 10px)
- **Grid Presets** - Quick selection: 5px, 8px, 10px, 12px, 16px, 20px
- **Major/Minor Grid** - Primary lines every Nth division (e.g., every 5th darker)
- **Grid Style Options** - Lines, dots, or crosshairs
- **Grid Color** - Subtle color that adapts to light/dark themes

### Deliverables
- [ ] Canvas component with coordinate system matching uidesc
- [ ] View rectangle rendering from parsed uidesc data
- [ ] Pan and zoom navigation
- [ ] Configurable grid overlay
- [ ] Basic toolbar with zoom and grid controls

---

## Phase 2: Selection & Inspection

**Goal**: Select views and see their properties

### Selection
- **Click Selection** - Click view to select, deselect others
- **Multi-Selection** - Shift+click to add/remove from selection
- **Marquee Selection** - Click+drag on empty space to select multiple
- **Select All** - Ctrl+A to select all views in template
- **Deselect** - Escape or click empty space to deselect

### Selection Visuals
- **Selection Highlight** - Distinct border/fill for selected views
- **Resize Handles** - 8-point handles on selected view corners/edges
- **Parent Highlight** - Subtle highlight on parent when child selected
- **Selection Info** - Show count when multiple views selected

### Hover States
- **Hover Highlight** - Subtle highlight when hovering over view
- **Tooltip** - Show class name and size on hover
- **Cursor Changes** - Appropriate cursors for different actions

### Hierarchy Panel (Left Sidebar)
- **Tree View** - Hierarchical list of all views
- **Expand/Collapse** - Toggle children visibility
- **Selection Sync** - Click in tree selects on canvas and vice versa
- **View Icons** - Icon per view class type
- **Drag Indicator** - Show valid drop targets when dragging

### Properties Panel (Right Sidebar)
- **Read-Only Display** - Show all attributes of selected view
- **Grouped Attributes** - Organize by category (geometry, appearance, behavior)
- **Multiple Selection** - Show common attributes when multiple selected
- **Copy Values** - Click to copy attribute values

### Deliverables
- [ ] Click and multi-select functionality
- [ ] Selection visual indicators and handles
- [ ] Hierarchy tree panel with expand/collapse
- [ ] Properties panel showing view attributes
- [ ] Hover states and tooltips

---

## Phase 3: Basic Manipulation

**Goal**: Move and resize views with mouse and keyboard

### Move Operations
- **Drag to Move** - Click and drag selected view(s) to new position
- **Constrained Move** - Hold Shift to constrain to horizontal/vertical
- **Move Preview** - Show ghost outline while dragging
- **Keyboard Nudge** - Arrow keys move by 1px
- **Fast Nudge** - Shift+Arrow moves by 10px (or grid size)

### Resize Operations
- **Resize Handles** - Drag corner/edge handles to resize
- **Proportional Resize** - Hold Shift to maintain aspect ratio
- **Center Resize** - Hold Alt to resize from center
- **Minimum Size** - Enforce minimum view size (e.g., 10x10)

### Snapping
- **Snap to Grid** - View origins/edges snap to grid points
- **Snap Toggle** - Enable/disable snapping (keyboard: `Shift+G`)
- **Snap Threshold** - Configurable pixel distance for snap (default: 5px)
- **Snap Indicator** - Visual feedback when snap engages
- **Temporary Disable** - Hold Alt to bypass snap while dragging

### Smart Guides
- **Edge Alignment** - Guides when aligning to sibling edges
- **Center Alignment** - Guides when aligning to sibling centers
- **Parent Center** - Guides when centering within parent
- **Spacing Guides** - Show equal spacing between elements
- **Guide Appearance** - Colored lines with distance labels

### History
- **Undo** - Ctrl+Z to undo last action
- **Redo** - Ctrl+Y or Ctrl+Shift+Z to redo
- **History Panel** - Optional list of recent actions
- **Action Names** - Descriptive names (e.g., "Move CKnob", "Resize CViewContainer")

### Deliverables
- [ ] Drag-to-move with preview
- [ ] 8-point resize handles
- [ ] Grid snapping with toggle
- [ ] Smart guides for alignment
- [ ] Undo/redo system with history

---

## Phase 4: Property Editing

**Goal**: Edit view attributes through the properties panel

### Attribute Editors
- **Text Input** - For string attributes (title, tooltip)
- **Number Input** - For numeric attributes with increment/decrement
- **Point Editor** - For origin, size with linked X/Y fields
- **Boolean Toggle** - Checkbox for boolean attributes
- **Enum Dropdown** - Select from valid options
- **Color Picker** - Visual color selection with named color support
- **Font Picker** - Select from defined fonts
- **Bitmap Picker** - Select from defined bitmaps with preview
- **Gradient Picker** - Select from defined gradients

### Resource References
- **Named Resources** - Dropdown of defined colors/fonts/bitmaps
- **Predefined Resources** - Access to system colors (`~ BlackCColor`) and fonts
- **Inline Preview** - Show color swatch, font sample, bitmap thumbnail
- **Quick Create** - Option to create new resource from picker

### Editing Behavior
- **Live Preview** - Changes reflected immediately on canvas
- **Validation** - Indicate invalid values
- **Reset to Default** - Revert attribute to default value
- **Multi-Edit** - Edit common attributes across multiple selected views

### Deliverables
- [ ] Type-specific attribute editors
- [ ] Color, font, bitmap, gradient pickers
- [ ] Live preview of changes
- [ ] Multi-selection editing
- [ ] Validation feedback

---

## Phase 5: View Creation & Deletion

**Goal**: Add new views and remove existing ones

### View Palette
- **View Class List** - Categorized list of available view classes
- **Search Filter** - Filter by class name
- **Favorites** - Pin frequently used classes
- **Class Info** - Tooltip with class description

### Creation Methods
- **Drag from Palette** - Drag class onto canvas to create
- **Draw to Create** - Select class, then click+drag to define bounds
- **Insert at Selection** - Add as sibling or child of selected view
- **Duplicate** - Ctrl+D to duplicate selected view(s)
- **Default Size** - Reasonable default size per view class

### Deletion
- **Delete Key** - Remove selected view(s)
- **Context Menu** - Right-click delete option
- **Confirmation** - Optional confirm for containers with children
- **Delete with Children** - Remove view and all descendants

### Clipboard
- **Copy** - Ctrl+C to copy selected view(s)
- **Cut** - Ctrl+X to cut selected view(s)
- **Paste** - Ctrl+V to paste at cursor or center
- **Paste as Child** - Paste into selected container
- **Cross-Template** - Copy between templates

### Hierarchy Operations
- **Reparent** - Drag view in hierarchy to change parent
- **Reorder** - Drag to change z-order among siblings
- **Group** - Wrap selected views in new container
- **Ungroup** - Move children up and delete container

### Deliverables
- [ ] View palette with all view classes
- [ ] Drag-to-create and draw-to-create
- [ ] Delete with undo support
- [ ] Copy/cut/paste operations
- [ ] Reparenting via hierarchy drag

---

## Phase 6: Resource Management

**Goal**: Manage colors, fonts, bitmaps, gradients, and control-tags

### Colors Panel
- **Color List** - All defined colors with swatches
- **Add Color** - Create new named color
- **Edit Color** - Color picker with hex/RGB input
- **Delete Color** - Remove (with usage warning)
- **Usage Indicator** - Show where color is used

### Fonts Panel
- **Font List** - All defined fonts with samples
- **Add Font** - Create new named font
- **Edit Font** - Font name, size, bold, italic, etc.
- **Font Preview** - Sample text in selected font
- **Delete Font** - Remove (with usage warning)

### Bitmaps Panel
- **Bitmap List** - All bitmaps with thumbnails
- **Import Bitmap** - Add image file to resources
- **Bitmap Properties** - Path, scale-factor, multi-frame settings
- **Nine-Part Editor** - Visual editor for tiled offset
- **Multi-Frame Preview** - Show animation frames
- **Delete Bitmap** - Remove (with usage warning)

### Gradients Panel
- **Gradient List** - All gradients with previews
- **Add Gradient** - Create new named gradient
- **Gradient Editor** - Visual color stop editor
- **Delete Gradient** - Remove (with usage warning)

### Control Tags Panel
- **Tag List** - All control-tags with IDs
- **Add Tag** - Create new tag with name and ID
- **Edit Tag** - Modify name or ID
- **Auto-Assign** - Suggest next available ID
- **Usage List** - Show controls using each tag

### Variables Panel
- **Variable List** - All defined variables
- **Add/Edit/Delete** - Manage variables
- **Usage Indicator** - Show where used

### Deliverables
- [ ] Resource panels for all resource types
- [ ] Add, edit, delete operations for each
- [ ] Visual editors (color picker, gradient editor)
- [ ] Usage tracking and warnings
- [ ] Import functionality for bitmaps

---

## Phase 7: Template Management

**Goal**: Work with multiple templates in a single file

### Template List
- **Template Tabs** - Tab bar or list showing all templates
- **Active Template** - Currently displayed template
- **Template Preview** - Thumbnail preview in list

### Template Operations
- **Create Template** - New template with name and root class
- **Duplicate Template** - Copy existing template
- **Delete Template** - Remove template (with confirmation)
- **Rename Template** - Edit template name

### Template Properties
- **Name** - Template identifier
- **Size** - Root view dimensions
- **Min/Max Size** - Resize constraints
- **Background Color** - Root container color

### Template Embedding
- **Template Attribute** - Reference another template
- **Embedded Preview** - Show referenced template inline
- **Edit Embedded** - Navigate to embedded template

### Deliverables
- [ ] Template list/tabs UI
- [ ] Create, duplicate, delete templates
- [ ] Template properties editor
- [ ] Template embedding support

---

## Phase 8: Advanced Editing Tools

**Goal**: Professional-grade editing capabilities

### Alignment Tools
- **Align Left/Center/Right** - Horizontal alignment
- **Align Top/Middle/Bottom** - Vertical alignment
- **Align to Parent** - Center within parent
- **Align to Selection** - Align to first selected or selection bounds

### Distribution Tools
- **Distribute Horizontally** - Equal horizontal spacing
- **Distribute Vertically** - Equal vertical spacing
- **Space Evenly** - Equal gaps between views

### Rulers
- **Horizontal Ruler** - Pixel ruler along top edge
- **Vertical Ruler** - Pixel ruler along left edge
- **Ruler Origin** - Show current pan offset
- **Grid Markers** - Tick marks aligned to grid

### Custom Guides
- **Drag from Ruler** - Create guide by dragging from ruler
- **Guide Positioning** - Numeric input for precise placement
- **Guide Visibility** - Show/hide all guides
- **Guide Snapping** - Snap to guides like grid
- **Delete Guide** - Remove individual guides

### Additional Tools
- **Lock/Unlock** - Prevent accidental modifications
- **Hide/Show** - Toggle view visibility in editor
- **Find/Replace** - Search by class, attribute values
- **Batch Edit** - Edit attribute across multiple views

### Deliverables
- [ ] Alignment and distribution toolbar
- [ ] Rulers with grid markers
- [ ] Draggable custom guides
- [ ] Lock/hide functionality
- [ ] Find and batch edit features

---

## Phase 9: File Operations & Export

**Goal**: Complete file management

### Save Operations
- **Save** - Write to current file (Ctrl+S)
- **Save As** - Write to new file location
- **Auto-Save** - Periodic automatic saving
- **Backup** - Create backup before overwriting

### Export Formats
- **JSON Export** - Standard uidesc JSON format
- **XML Export** - Legacy XML format for compatibility
- **Format Options** - Pretty print, minified

### Validation
- **Pre-Save Validation** - Check for errors before save
- **Error List** - Show validation errors with navigation
- **Warning List** - Non-critical issues
- **Auto-Fix** - Offer to fix common issues

### File Management
- **Recent Files** - Quick access to recent projects
- **File Watching** - Detect external modifications
- **Reload** - Refresh from disk
- **Dirty Indicator** - Show unsaved changes

### Deliverables
- [ ] Save/Save As with format selection
- [ ] Auto-save functionality
- [ ] Pre-save validation
- [ ] Recent files list
- [ ] External change detection

---

## Phase 10: Polish & Integration

**Goal**: Production-ready experience

### Keyboard Shortcuts
- **Shortcut System** - Comprehensive keyboard shortcuts
- **Shortcut Reference** - Help panel showing all shortcuts
- **Custom Shortcuts** - User-configurable bindings

### Preferences
- **Grid Settings** - Size, style, color
- **Snap Settings** - Threshold, guide colors
- **Editor Theme** - Light/dark mode
- **Auto-Save Interval** - Configure timing
- **Default Values** - New view defaults

### Theme Support
- **Light Theme** - Clean light appearance
- **Dark Theme** - Dark mode for low-light editing
- **System Theme** - Follow OS preference
- **Canvas Theme** - Independent canvas background

### Performance
- **Large File Handling** - Optimize for complex uidesc files
- **Virtualized Lists** - Efficient hierarchy/resource lists
- **Render Optimization** - Only redraw changed areas
- **Memory Management** - Handle large bitmaps efficiently

### Accessibility
- **Keyboard Navigation** - Full keyboard access
- **Screen Reader Support** - ARIA labels and announcements
- **High Contrast** - Support high contrast mode
- **Focus Indicators** - Clear focus states

### Help & Documentation
- **Tooltips** - Contextual help on hover
- **Help Panel** - Built-in documentation
- **What's This** - Click for element help
- **Onboarding** - First-run guidance

### Deliverables
- [ ] Complete keyboard shortcut system
- [ ] Preferences panel
- [ ] Light and dark themes
- [ ] Performance optimization
- [ ] Accessibility compliance
- [ ] Built-in help system

---

## Implementation Order

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  Phase 1: Canvas          ──┐                                   │
│  Phase 2: Selection         ├──► MVP: View & Navigate           │
│                           ──┘                                   │
│                                                                 │
│  Phase 3: Manipulation    ──┐                                   │
│  Phase 4: Properties        ├──► Core Editor: Edit Views        │
│                           ──┘                                   │
│                                                                 │
│  Phase 5: Creation        ──┐                                   │
│  Phase 6: Resources         ├──► Full Editor: Create & Manage   │
│                           ──┘                                   │
│                                                                 │
│  Phase 7: Templates       ──┐                                   │
│  Phase 9: File Ops          ├──► Complete Workflow              │
│                           ──┘                                   │
│                                                                 │
│  Phase 8: Tools           ──┐                                   │
│  Phase 10: Polish           ├──► Professional Polish            │
│                           ──┘                                   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Milestone Summary

| Milestone | Phases | Description |
|-----------|--------|-------------|
| **MVP** | 1-2 | View uidesc visually, navigate, select, inspect |
| **Core Editor** | 3-4 | Move, resize, edit properties |
| **Full Editor** | 5-6 | Create views, manage resources |
| **Complete** | 7, 9 | Multiple templates, save/load |
| **Professional** | 8, 10 | Advanced tools, polish |

---

## Technical Considerations

### Technology Stack (Current)
- **SolidJS** - Reactive UI framework
- **TypeScript** - Type-safe development
- **Vite** - Build tooling
- **Vitest** - Testing framework

### Canvas Options
- **HTML Canvas 2D** - Good performance, immediate mode
- **SVG** - Scalable, DOM-based, easier hit testing
- **Hybrid** - SVG for UI elements, Canvas for grid/guides

### State Management
- **SolidJS Stores** - For document state (existing pattern)
- **Signals** - For UI state (selection, zoom, etc.)
- **History Stack** - For undo/redo

### File Format
- **Primary**: JSON (VSTGUI 4.10+ standard)
- **Secondary**: XML (legacy support)
- **Internal**: Normalized representation for editing

---

## Success Criteria

### MVP Success
- [ ] Load and display any valid uidesc file
- [ ] Navigate with pan/zoom
- [ ] Select views and see properties
- [ ] Grid overlay visible and configurable

### Core Editor Success
- [ ] Move and resize views with mouse
- [ ] Edit properties through panel
- [ ] Undo/redo all operations
- [ ] Save changes to file

### Full Editor Success
- [ ] Create all view types
- [ ] Manage all resource types
- [ ] Copy/paste operations
- [ ] Work with multiple templates

### Professional Success
- [ ] Alignment and distribution tools
- [ ] Custom guides
- [ ] Keyboard shortcuts for all operations
- [ ] Performance with large files

---

*This roadmap is maintained as part of the VSTGUI-Edit project. Last updated: 2026-01-05*
