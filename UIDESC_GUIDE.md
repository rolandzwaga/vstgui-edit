# VSTGUI UIDescription Format Guide

A comprehensive reference for the `.uidesc` file format used in VSTGUI-based audio plugin interfaces.

---

## Table of Contents

1. [Overview](#overview)
2. [File Format](#file-format)
3. [Document Structure](#document-structure)
4. [Resource Definitions](#resource-definitions)
   - [Colors](#colors)
   - [Fonts](#fonts)
   - [Bitmaps](#bitmaps)
   - [Gradients](#gradients)
   - [Control Tags](#control-tags)
   - [Variables](#variables)
5. [Templates](#templates)
6. [View System](#view-system)
   - [View Hierarchy](#view-hierarchy)
   - [Base View Attributes](#base-view-attributes)
   - [Container Views](#container-views)
   - [Control Views](#control-views)
7. [View Class Reference](#view-class-reference)
8. [Predefined Resources](#predefined-resources)
9. [Custom Views and Sub-Controllers](#custom-views-and-sub-controllers)
10. [VST3 Integration](#vst3-integration)
11. [Best Practices](#best-practices)

---

## Overview

### What is VSTGUI?

VSTGUI (Virtual Studio Technology Graphical User Interface) is Steinberg's cross-platform UI framework for building audio plugin interfaces. It is used for:

- **VST3 plugins** - The primary target platform
- **Audio Unit (AU)** - macOS audio plugins
- **AAX** - Pro Tools plugins
- **Standalone applications** - Desktop audio tools

### What is a UIDescription file?

A `.uidesc` file is a declarative UI definition that describes:

- **Visual layout** - Position and size of UI elements
- **Resources** - Colors, fonts, bitmaps, gradients
- **Control bindings** - Mapping UI controls to plugin parameters
- **Templates** - Reusable view definitions

The UIDescription system allows creating UIs without C++ code for layout, separating design from logic.

### Why Use UIDescription?

1. **WYSIWYG Editing** - VSTGUI includes an inline editor for visual design
2. **Hot Reloading** - UI changes without recompilation during development
3. **Separation of Concerns** - UI layout separate from plugin logic
4. **Cross-Platform** - Same file works on Windows, macOS, Linux
5. **Version Control Friendly** - Text-based format for easy diffing

---

## File Format

### JSON vs XML

VSTGUI supports two file formats:

| Feature | JSON (Preferred) | XML (Deprecated) |
|---------|------------------|------------------|
| Introduced | Version 4.10 | Original format |
| Performance | Better parsing | Slower |
| Security | More secure | XML vulnerabilities |
| Status | **Current standard** | Deprecated but supported |
| File size | Larger | More compact |

> **Important**: As of VSTGUI 4.10, JSON is the preferred format. XML is deprecated but still supported for backward compatibility.

### JSON Format Example

```json
{
  "vstgui-ui-description": {
    "version": "1",
    "colors": {
      "Background": "#2d2d2dff",
      "Text": "#ffffffff"
    },
    "fonts": {
      "Label": {
        "font-name": "Arial",
        "size": "12"
      }
    },
    "control-tags": {
      "Gain": "0",
      "Pan": "1"
    },
    "templates": {
      "MainView": {
        "attributes": {
          "class": "CViewContainer",
          "size": "400, 300",
          "background-color": "Background"
        },
        "children": {
          "label1": {
            "attributes": {
              "class": "CTextLabel",
              "origin": "10, 10",
              "size": "100, 20",
              "title": "Gain",
              "font": "Label",
              "font-color": "Text"
            }
          }
        }
      }
    }
  }
}
```

### XML Format Example

```xml
<?xml version="1.0" encoding="UTF-8"?>
<vstgui-ui-description version="1">
  <colors>
    <color name="Background" rgba="#2d2d2dff"/>
    <color name="Text" rgba="#ffffffff"/>
  </colors>
  <fonts>
    <font name="Label" font-name="Arial" size="12"/>
  </fonts>
  <control-tags>
    <control-tag name="Gain" tag="0"/>
    <control-tag name="Pan" tag="1"/>
  </control-tags>
  <template name="MainView" class="CViewContainer" size="400, 300" background-color="Background">
    <view class="CTextLabel" origin="10, 10" size="100, 20" title="Gain" font="Label" font-color="Text"/>
  </template>
</vstgui-ui-description>
```

---

## Document Structure

### Root Element

Every uidesc file has a single root element:

```json
{
  "vstgui-ui-description": {
    "version": "1",
    // ... sections
  }
}
```

The `version` attribute is required and currently must be `"1"`.

### Main Sections

| Section | Required | Description |
|---------|----------|-------------|
| `version` | Yes | Format version (always "1") |
| `colors` | No | Named color definitions |
| `fonts` | No | Named font definitions |
| `bitmaps` | No | Image resource references |
| `gradients` | No | Gradient definitions |
| `control-tags` | No | Parameter ID mappings |
| `variables` | No | Reusable string values |
| `templates` | No | View definitions |
| `custom` | No | Editor metadata |

---

## Resource Definitions

### Colors

Colors define reusable color values referenced by name throughout the UI.

#### Color Formats

| Format | Example | Description |
|--------|---------|-------------|
| RGB Hex | `#FF5500` | Red, Green, Blue (alpha = 255) |
| RGBA Hex | `#FF550080` | Red, Green, Blue, Alpha |
| Named Reference | `Background` | Reference to another color |
| Predefined | `~ BlackCColor` | Built-in system color |

#### JSON Definition

```json
"colors": {
  "Background": "#2d2d2dff",
  "Text": "#ffffffff",
  "Accent": "#3b82f6ff",
  "AccentHover": "#60a5faff",
  "Border": "#404040ff",
  "Transparent": "#00000000"
}
```

#### XML Definition

```xml
<colors>
  <color name="Background" rgba="#2d2d2dff"/>
  <color name="Text" red="255" green="255" blue="255" alpha="255"/>
</colors>
```

#### Usage in Views

```json
{
  "class": "CTextLabel",
  "font-color": "Text",
  "back-color": "Background"
}
```

### Fonts

Fonts define typography settings referenced by name.

#### Font Properties

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `font-name` | string | Yes | System font name |
| `size` | number | Yes | Font size in points |
| `bold` | boolean | No | Bold weight |
| `italic` | boolean | No | Italic style |
| `underline` | boolean | No | Underline decoration |
| `strike-through` | boolean | No | Strikethrough decoration |
| `alternative-font-names` | string | No | Fallback fonts (comma-separated) |

#### JSON Definition

```json
"fonts": {
  "Title": {
    "font-name": "Helvetica Neue",
    "size": "18",
    "bold": "true",
    "alternative-font-names": "Arial, sans-serif"
  },
  "Label": {
    "font-name": "Arial",
    "size": "12"
  },
  "Mono": {
    "font-name": "JetBrains Mono",
    "size": "11",
    "alternative-font-names": "Consolas, monospace"
  }
}
```

#### XML Definition

```xml
<fonts>
  <font name="Title" font-name="Helvetica Neue" size="18" bold="true"/>
  <font name="Label" font-name="Arial" size="12"/>
</fonts>
```

### Bitmaps

Bitmaps define image resources used for controls and backgrounds.

#### Bitmap Properties

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `path` | string | Yes* | File path relative to uidesc |
| `scale-factor` | number | No | DPI scale (1, 1.5, 2, etc.) |
| `nineparttiled-offsets` | string | No | Nine-part tiling: "top, left, bottom, right" |
| `multiframe-size` | size | No | Size of each frame "width, height" |
| `multiframe-num-frames` | number | No | Total number of frames |
| `mulitframe-frames-per-row` | number | No | Frames per row (for grid layouts) |
| `data` | object | No | Embedded base64 data |

*Either `path` or `data` is required.

#### JSON Definition

```json
"bitmaps": {
  "background": {
    "path": "images/background.png"
  },
  "knob": {
    "path": "images/knob.png"
  },
  "knob@2x": {
    "path": "images/knob@2x.png",
    "scale-factor": "2"
  },
  "panel": {
    "path": "images/panel.png",
    "nineparttiled-offsets": "10, 10, 10, 10"
  },
  "animation": {
    "path": "autoanimation.png",
    "multiframe-size": "20, 20",
    "multiframe-num-frames": "36",
    "mulitframe-frames-per-row": "5"
  }
}
```

#### Embedded Base64 Bitmaps

Bitmaps can be embedded directly in the uidesc file:

```json
"bitmaps": {
  "embedded-icon": {
    "data": {
      "encoding": "base64",
      "data": "iVBORw0KGgoAAAANSUhEUgAA..."
    }
  }
}
```

#### Multi-Frame Bitmaps

For animation controls (CAnimKnob, CMovieBitmap), bitmaps contain multiple frames arranged vertically or in a grid:

```
┌─────────────┐
│  Frame 0    │  ← Value 0.0
├─────────────┤
│  Frame 1    │
├─────────────┤
│  Frame 2    │
├─────────────┤
│     ...     │
├─────────────┤
│  Frame N    │  ← Value 1.0
└─────────────┘
```

The `height-of-one-image` attribute specifies the height of each frame.

#### Nine-Part Tiled Bitmaps

Nine-part tiling allows a bitmap to scale without distorting corners:

```
┌────┬────────────┬────┐
│ TL │     T      │ TR │  ← Corners don't stretch
├────┼────────────┼────┤
│ L  │   Center   │ R  │  ← Edges stretch in one direction
├────┼────────────┼────┤
│ BL │     B      │ BR │  ← Center stretches both ways
└────┴────────────┴────┘
```

Offset format: `"top, left, bottom, right"` in pixels.

### Gradients

Gradients define color transitions for use in controls like CTextButton and CGradientView.

#### Gradient Definition

A gradient is an array of color stops, each with:

| Property | Type | Description |
|----------|------|-------------|
| `rgba` | color | Color at this stop |
| `start` | number | Position (0.0 to 1.0) |

#### JSON Definition

```json
"gradients": {
  "ButtonNormal": [
    { "rgba": "#e0e0e0ff", "start": "0" },
    { "rgba": "#c0c0c0ff", "start": "1" }
  ],
  "ButtonHighlighted": [
    { "rgba": "#c0c0c0ff", "start": "0" },
    { "rgba": "#a0a0a0ff", "start": "1" }
  ],
  "ThreeStop": [
    { "rgba": "#ff0000ff", "start": "0" },
    { "rgba": "#00ff00ff", "start": "0.5" },
    { "rgba": "#0000ffff", "start": "1" }
  ]
}
```

#### XML Definition

```xml
<gradients>
  <gradient name="ButtonNormal">
    <color-stop rgba="#e0e0e0ff" start="0"/>
    <color-stop rgba="#c0c0c0ff" start="1"/>
  </gradient>
  <gradient name="ButtonHighlighted">
    <color-stop rgba="#c0c0c0ff" start="0"/>
    <color-stop rgba="#a0a0a0ff" start="1"/>
  </gradient>
</gradients>
```

### Control Tags

Control tags map symbolic names to numeric parameter IDs, enabling UI controls to communicate with plugin parameters.

#### Tag Formats

| Format | Example | Description |
|--------|---------|-------------|
| Integer | `"0"` | Direct parameter ID |
| Character | `"'gain'"` | Four-character code |
| Expression | `"1000 + 1"` | Computed value |

#### JSON Definition

```json
"control-tags": {
  "Bypass": "0",
  "Gain": "1",
  "Pan": "2",
  "VuMeter": "1000",
  "UIMessage": "'msg1'"
}
```

#### How Tags Connect to VST3 Parameters

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  uidesc file    │     │  EditController │     │   Processor     │
│                 │     │                 │     │                 │
│ control-tag:    │────▶│ Parameter ID    │────▶│ Parameter       │
│ "Gain" = "1"    │     │      = 1        │     │ processing      │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

When a UI control with `control-tag="Gain"` changes:
1. VSTGUI resolves "Gain" → parameter ID 1
2. Calls `beginEdit(1)`, `performEdit(1, value)`, `endEdit(1)`
3. Host notifies processor of parameter change

### Variables

Variables define reusable string values for reducing repetition.

```json
"variables": {
  "DefaultMargin": "10",
  "LabelWidth": "100",
  "ControlHeight": "24"
}
```

Usage in attributes:
```json
{
  "origin": "var.DefaultMargin, var.DefaultMargin"
}
```

---

## Templates

Templates are the primary view definitions - reusable UI layouts that can be instantiated.

### Template Structure (JSON)

```json
"templates": {
  "TemplateName": {
    "attributes": {
      "class": "CViewContainer",
      "size": "400, 300",
      "minSize": "200, 150",
      "maxSize": "800, 600",
      "background-color": "Background"
    },
    "children": {
      "child1": {
        "attributes": { /* ... */ },
        "children": { /* nested children */ }
      }
    }
  }
}
```

### Template-Specific Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| `minSize` | size | Minimum resizable dimensions |
| `maxSize` | size | Maximum resizable dimensions |

### Template Structure (XML)

```xml
<template name="TemplateName" class="CViewContainer" size="400, 300" background-color="Background">
  <view class="CTextLabel" origin="10, 10" size="100, 20"/>
</template>
```

### Multiple Templates

A uidesc can contain multiple templates for:

- Main plugin editor view
- About dialog
- Settings panels
- Tab content views

```json
"templates": {
  "MainView": { /* main editor */ },
  "AboutDialog": { /* about panel */ },
  "SettingsTab": { /* settings */ }
}
```

### Template Embedding

Templates can be embedded within other templates using the `template` attribute:

```json
{
  "class": "CViewContainer",
  "template": "SettingsTab"
}
```

---

## View System

### View Hierarchy

VSTGUI uses a hierarchical view system:

```
CFrame (root)
└── CViewContainer
    ├── CTextLabel
    ├── CViewContainer
    │   ├── CKnob
    │   └── CTextEdit
    └── CSlider
```

All views inherit from `CView`. Container views (CViewContainer and subclasses) can have children.

### View Categories

| Category | Description | Examples |
|----------|-------------|----------|
| **Base** | Foundation classes | CView |
| **Containers** | Hold child views | CViewContainer, CScrollView, CSplitView |
| **Controls** | Interactive elements | CSlider, CKnob, CTextButton |
| **Displays** | Read-only output | CTextLabel, CVuMeter, CParamDisplay |
| **Special** | Specialized behavior | UIViewSwitchContainer, CGradientView |

### Base View Attributes

All views share these base attributes from `CView`:

| Attribute | Type | Description |
|-----------|------|-------------|
| `class` | string | View class name (required) |
| `origin` | point | Top-left position "x, y" |
| `size` | size | Dimensions "width, height" |
| `autosize` | flags | Resize behavior |
| `transparent` | boolean | Pass-through mouse events |
| `mouse-enabled` | boolean | Respond to mouse |
| `opacity` | number | View opacity (0-1) |
| `wants-focus` | boolean | Can receive keyboard focus |
| `tooltip` | string | Hover tooltip text |
| `bitmap` | string | Background bitmap reference |
| `custom-view-name` | string | Custom view identifier |
| `sub-controller` | string | Sub-controller name |
| `uidesc-label` | string | Editor identification label |

#### Point and Size Formats

```
origin: "x, y"      → "10, 20"
size: "width, height" → "100, 50"
```

#### Autosize Flags

Autosize controls how views resize when their parent resizes:

| Flag | Description |
|------|-------------|
| `left` | Maintain distance from left edge |
| `right` | Maintain distance from right edge |
| `top` | Maintain distance from top edge |
| `bottom` | Maintain distance from bottom edge |
| `row` | Size horizontally with parent |
| `column` | Size vertically with parent |

Combine flags with spaces: `"left right top"` keeps the view anchored but stretches horizontally.

### Container Views

Container views extend CView with child management:

#### CViewContainer

Base container class.

| Attribute | Type | Description |
|-----------|------|-------------|
| `background-color` | color | Container fill color |
| `background-color-draw-style` | enum | "filled", "stroked", "filled and stroked" |

#### CLayeredViewContainer

Draws to a platform layer for performance optimization.

| Attribute | Type | Description |
|-----------|------|-------------|
| `z-index` | number | Layer stacking order |

#### CScrollView

Scrollable container with scrollbars.

| Attribute | Type | Description |
|-----------|------|-------------|
| `container-size` | size | Scrollable content size |
| `horizontal-scrollbar` | boolean | Show horizontal scrollbar |
| `vertical-scrollbar` | boolean | Show vertical scrollbar |
| `auto-hide-scrollbars` | boolean | Hide when not needed |
| `auto-drag-scrolling` | boolean | Auto-scroll on drag |
| `overlay-scrollbars` | boolean | Overlay style scrollbars |
| `bordered` | boolean | Draw border around view |
| `follow-focus-view` | boolean | Scroll to focused child |
| `scrollbar-width` | number | Scrollbar thickness |
| `scrollbar-min-scroller-size` | number | Minimum thumb size |
| `scrollbar-background-color` | color | Scrollbar track color |
| `scrollbar-scroller-color` | color | Scrollbar thumb color |
| `scrollbar-frame-color` | color | Scrollbar border color |

#### CRowColumnView

Auto-layout container for rows or columns.

| Attribute | Type | Description |
|-----------|------|-------------|
| `row-style` | boolean | true=rows, false=columns |
| `spacing` | number | Pixels between items |
| `margin` | rect | "left, top, right, bottom" |
| `equal-size-layout` | enum | See layout options below |
| `hide-clipped-subviews` | boolean | Hide views outside bounds |
| `animate-view-resizing` | boolean | Animate size changes |
| `view-resize-animation-time` | number | Animation duration (ms) |

**Layout Options** for `equal-size-layout`:
- `left-top`, `center`, `right-bottom`, `stretch`
- `top-left`, `top-center`, `top-right`
- `middle-left`, `middle-center`, `middle-right`
- `bottom-left`, `bottom-center`, `bottom-right`

#### CSplitView

Resizable split container.

| Attribute | Type | Description |
|-----------|------|-------------|
| `orientation` | enum | "horizontal", "vertical" |
| `resize-method` | enum | "last", "first", "all" |
| `separator-width` | number | Divider thickness |

#### CShadowViewContainer

Container that draws a drop shadow.

| Attribute | Type | Description |
|-----------|------|-------------|
| `shadow-intensity` | number | Shadow opacity (0.0-1.0) |
| `shadow-blur-size` | number | Blur radius (0.8-20) |
| `shadow-offset` | point | Shadow offset "x, y" |

#### UIViewSwitchContainer

Shows different templates based on a control value.

| Attribute | Type | Description |
|-----------|------|-------------|
| `template-names` | string | Comma-separated template names |
| `template-switch-control` | string | Control tag that switches views |
| `animation-style` | enum | "fade", "move", "push" |
| `animation-time` | number | Transition duration (ms) |
| `animation-timing-function` | enum | "linear", "easy-in", "easy-out", "easy-in-out" |

### Control Views

Controls inherit from CControl and add interactivity:

#### Common Control Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| `control-tag` | string | Parameter binding |
| `default-value` | number | Initial value (0.0-1.0) |
| `min-value` | number | Minimum value |
| `max-value` | number | Maximum value |
| `wheel-inc-value` | number | Mouse wheel increment |

---

## View Class Reference

### Display Classes

#### CParamDisplay

Base class for parameter value display.

| Attribute | Type | Description |
|-----------|------|-------------|
| `font` | string | Font reference |
| `font-color` | color | Text color |
| `back-color` | color | Background color |
| `frame-color` | color | Border color |
| `frame-width` | number | Border thickness |
| `round-rect-radius` | number | Corner radius |
| `shadow-color` | color | Text shadow color |
| `font-antialias` | boolean | Smooth text rendering |
| `style-3D-in` | boolean | Inset 3D effect |
| `style-3D-out` | boolean | Raised 3D effect |
| `style-no-frame` | boolean | Hide border |
| `style-no-text` | boolean | Hide text |
| `style-no-draw` | boolean | No background |
| `style-round-rect` | boolean | Rounded corners |
| `style-shadow-text` | boolean | Text shadow |
| `text-alignment` | enum | "left", "center", "right" |
| `text-inset` | point | Text padding "horizontal, vertical" |
| `text-rotation` | number | Text angle (degrees) |
| `text-shadow-offset` | point | Shadow offset "x, y" |
| `value-precision` | number | Decimal places |

#### CTextLabel

Static text display (inherits CParamDisplay).

| Attribute | Type | Description |
|-----------|------|-------------|
| `title` | string | Display text |
| `truncate-mode` | enum | "head", "tail", "none" |

#### CMultiLineTextLabel

Multi-line text display.

| Attribute | Type | Description |
|-----------|------|-------------|
| `title` | string | Display text |
| `line-layout` | enum | "clip", "truncate", "wrap" |
| `auto-height` | boolean | Adjust height to content |
| `vertical-centered` | boolean | Center text vertically |

#### CVuMeter

VU/level meter display.

| Attribute | Type | Description |
|-----------|------|-------------|
| `bitmap` | string | "On" state bitmap |
| `off-bitmap` | string | "Off" state bitmap |
| `num-led` | number | Number of LED segments |
| `orientation` | enum | "horizontal", "vertical" |
| `decrease-step-value` | number | Decay rate |

### Button Classes

#### COnOffButton

Simple two-state toggle button.

| Attribute | Type | Description |
|-----------|------|-------------|
| `bitmap` | string | Button states bitmap |

#### CKickButton

Momentary button (press and release).

| Attribute | Type | Description |
|-----------|------|-------------|
| `bitmap` | string | Button states bitmap |
| `height-of-one-image` | number | Frame height in bitmap |

#### CTextButton

Button rendered with text and optional gradient.

| Attribute | Type | Description |
|-----------|------|-------------|
| `title` | string | Button text |
| `font` | string | Font reference |
| `text-alignment` | enum | "left", "center", "right" |
| `text-color` | color | Normal text color |
| `text-color-highlighted` | color | Pressed text color |
| `frame-color` | color | Normal border color |
| `frame-color-highlighted` | color | Pressed border color |
| `frame-width` | number | Border thickness |
| `round-radius` | number | Corner radius |
| `gradient` | string | Normal gradient reference |
| `gradient-highlighted` | string | Pressed gradient reference |
| `icon` | string | Icon bitmap |
| `icon-highlighted` | string | Pressed icon bitmap |
| `icon-position` | enum | "left", "right", "center above text", "center below text" |
| `icon-text-margin` | number | Space between icon and text |
| `kick-style` | boolean | Momentary behavior |

#### CCheckBox

Checkbox with three states.

| Attribute | Type | Description |
|-----------|------|-------------|
| `title` | string | Label text |
| `font` | string | Font reference |
| `font-color` | color | Label color |
| `boxfill-color` | color | Checkbox fill |
| `boxframe-color` | color | Checkbox border |
| `checkmark-color` | color | Check mark color |
| `frame-width` | number | Border thickness |
| `round-rect-radius` | number | Corner radius |
| `draw-crossbox` | boolean | X instead of checkmark |
| `autosize-to-fit` | boolean | Fit to content |

### Knob Classes

#### CKnob

Basic knob control with handle drawing.

| Attribute | Type | Description |
|-----------|------|-------------|
| `bitmap` | string | Knob background bitmap |
| `handle-bitmap` | string | Handle bitmap |
| `angle-start` | number | Start angle (degrees) |
| `angle-range` | number | Rotation range (degrees) |
| `knob-range` | number | Virtual rotation range |
| `value-inset` | number | Value indicator inset |
| `zoom-factor` | number | Mouse sensitivity |
| `handle-color` | color | Handle color |
| `handle-shadow-color` | color | Handle shadow |
| `handle-line-width` | number | Handle stroke width |
| `skip-handle-drawing` | boolean | Don't draw handle |
| `circle-drawing` | boolean | Draw as circle |
| `corona-drawing` | boolean | Draw value arc |
| `corona-color` | color | Arc color |
| `corona-inset` | number | Arc inset |
| `corona-outline` | boolean | Arc outline only |
| `corona-outline-width-add` | number | Additional outline width |
| `corona-inverted` | boolean | Reverse arc direction |
| `corona-from-center` | boolean | Arc from center |
| `corona-dash-dot` | boolean | Dashed arc |
| `corona-dash-dot-lengths` | string | Dash pattern (e.g., "1.26,0.1") |
| `corona-line-cap-butt` | boolean | Use butt line cap |

#### CAnimKnob

Animation-based knob using multi-frame bitmap.

| Attribute | Type | Description |
|-----------|------|-------------|
| `bitmap` | string | Multi-frame knob bitmap |
| `height-of-one-image` | number | Single frame height (deprecated) |
| `sub-pixmaps` | number | Number of frames (deprecated) |
| `inverse-bitmap` | boolean | Reverse frame order |
| `zoom-factor` | number | Mouse sensitivity |
| `knob-range` | number | Virtual rotation range |

> **Note**: `height-of-one-image` and `sub-pixmaps` are deprecated. Use bitmap-level `multiframe-size` and `multiframe-num-frames` instead.

### Slider Classes

#### CSlider

Linear slider control.

| Attribute | Type | Description |
|-----------|------|-------------|
| `bitmap` | string | Track/background bitmap |
| `handle-bitmap` | string | Thumb bitmap |
| `orientation` | enum | "horizontal", "vertical" |
| `reverse-orientation` | boolean | Flip direction |
| `mode` | enum | "touch", "relative touch", "free click", "ramp", "use global" |
| `handle-offset` | point | Thumb offset |
| `bitmap-offset` | point | Track offset |
| `zoom-factor` | number | Mouse sensitivity |
| `frame-width` | number | Border thickness |
| `draw-frame` | boolean | Draw border |
| `draw-back` | boolean | Draw background |
| `draw-value` | boolean | Draw value fill |
| `draw-value-from-center` | boolean | Fill from center |
| `draw-value-inverted` | boolean | Invert fill direction |
| `frame-color` | color | Border color |
| `back-color` | color | Background color |
| `value-color` | color | Fill color |

### Switch Classes

#### CVerticalSwitch / CHorizontalSwitch

Multi-position switch using bitmap frames.

| Attribute | Type | Description |
|-----------|------|-------------|
| `bitmap` | string | Multi-frame bitmap |
| `height-of-one-image` | number | Frame height |

#### CRockerSwitch

Three-position rocker (up/center/down).

| Attribute | Type | Description |
|-----------|------|-------------|
| `bitmap` | string | Three-frame bitmap |
| `height-of-one-image` | number | Frame height |

#### CSegmentButton

Multi-segment button bar.

| Attribute | Type | Description |
|-----------|------|-------------|
| `segment-names` | string | Comma-separated segment names |
| `selection-mode` | enum | "kSingle", "kSingleToggle", "kMultiple" |
| `style` | enum | "horizontal", "vertical", "horizontal-inverse", "vertical-inverse" |
| `font` | string | Font reference |
| `text-alignment` | enum | "left", "center", "right" |
| `text-color` | color | Normal text color |
| `text-color-highlighted` | color | Selected text color |
| `frame-color` | color | Border color |
| `frame-width` | number | Border thickness |
| `round-radius` | number | Corner radius |
| `gradient` | string | Normal gradient |
| `gradient-highlighted` | string | Selected gradient |
| `icon-text-margin` | number | Space between icon and text |
| `truncate-mode` | enum | "head", "tail", "none" |

### Text Input Classes

#### CTextEdit

Editable text field (inherits CParamDisplay).

| Attribute | Type | Description |
|-----------|------|-------------|
| `title` | string | Initial text |
| `placeholder-title` | string | Placeholder text when empty |
| `immediate-text-change` | boolean | Update on each keystroke |
| `secure-style` | boolean | Password mask |
| `style-doubleclick` | boolean | Select all on double-click |
| `style-round-rect` | boolean | Rounded corners |
| `round-rect-radius` | number | Corner radius |

#### CSearchTextEdit

Search field with clear button.

| Attribute | Type | Description |
|-----------|------|-------------|
| `clear-mark-inset` | point | Clear button position |

#### COptionMenu

Dropdown/popup menu (inherits CParamDisplay).

| Attribute | Type | Description |
|-----------|------|-------------|
| `menu-popup-style` | boolean | Popup menu style |
| `menu-check-style` | boolean | Show checkmarks |
| `font` | string | Font reference |
| `font-color` | color | Text color |
| `back-color` | color | Background color |
| `frame-color` | color | Border color |
| `frame-width` | number | Border thickness |
| `style-round-rect` | boolean | Rounded corners |
| `round-rect-radius` | number | Corner radius |
| `text-alignment` | enum | "left", "center", "right" |
| `text-inset` | point | Text padding "horizontal, vertical" |

### Other Classes

#### CXYPad

Two-dimensional control pad.

| Attribute | Type | Description |
|-----------|------|-------------|
| `bitmap` | string | Pad background |
| `handle-bitmap` | string | Handle bitmap |

#### CGradientView

View that displays a gradient.

| Attribute | Type | Description |
|-----------|------|-------------|
| `gradient` | string | Gradient reference |
| `gradient-style` | enum | "linear", "radial" |
| `gradient-angle` | number | Linear gradient angle (0-360) |
| `radial-center` | point | Center point for radial gradient "x, y" (0.0-1.0) |
| `radial-radius` | number | Radius for radial gradient |
| `round-rect-radius` | number | Corner radius |
| `frame-color` | color | Border color |
| `frame-width` | number | Border thickness |
| `draw-antialiased` | boolean | Smooth edges |

#### CMovieBitmap

Animated bitmap display.

| Attribute | Type | Description |
|-----------|------|-------------|
| `bitmap` | string | Multi-frame bitmap |
| `height-of-one-image` | number | Frame height |

#### CMovieButton

Button using multi-frame bitmap.

| Attribute | Type | Description |
|-----------|------|-------------|
| `bitmap` | string | Multi-frame bitmap |
| `height-of-one-image` | number | Frame height |

#### CAutoAnimation

Automatic animation display.

| Attribute | Type | Description |
|-----------|------|-------------|
| `bitmap` | string | Animation frames |
| `height-of-one-image` | number | Frame height |
| `animation-time` | number | Frame duration (ms) |

#### CAnimationSplashScreen

Splash screen with animation.

| Attribute | Type | Description |
|-----------|------|-------------|
| `bitmap` | string | Splash bitmap |
| `splash-bitmap` | string | Animation bitmap |
| `splash-origin` | point | Animation position |
| `splash-size` | size | Animation size |
| `animation-index` | number | Starting frame |
| `animation-time` | number | Frame duration |

#### CStringListControl

List control displaying string items.

| Attribute | Type | Description |
|-----------|------|-------------|
| `font` | string | Font reference |
| `font-color` | color | Normal text color |
| `selected-font-color` | color | Selected item text color |
| `back-color` | color | Background color |
| `selected-back-color` | color | Selected item background |
| `hover-color` | color | Hover highlight color |
| `line-color` | color | Separator line color |
| `line-width` | number | Separator thickness |
| `row-height` | number | Height of each row |
| `style-hover` | boolean | Enable hover highlighting |
| `text-inset` | number | Text padding |
| `text-alignment` | enum | "left", "center", "right" |

---

## Predefined Resources

### Predefined Colors

VSTGUI includes built-in colors prefixed with `~` (verified from `vstgui/lib/ccolor.h`):

| Name | RGB Value | Description |
|------|-----------|-------------|
| `~ BlackCColor` | (0, 0, 0, 255) | Pure black |
| `~ WhiteCColor` | (255, 255, 255, 255) | Pure white |
| `~ GreyCColor` | (127, 127, 127, 255) | Medium grey |
| `~ RedCColor` | (255, 0, 0, 255) | Pure red |
| `~ GreenCColor` | (0, 255, 0, 255) | Pure green |
| `~ BlueCColor` | (0, 0, 255, 255) | Pure blue |
| `~ YellowCColor` | (255, 255, 0, 255) | Pure yellow |
| `~ CyanCColor` | (0, 255, 255, 255) | Pure cyan |
| `~ MagentaCColor` | (255, 0, 255, 255) | Pure magenta |
| `~ TransparentCColor` | (255, 255, 255, 0) | Fully transparent |

> **Note**: VSTGUI 4.15+ also supports 148 CSS named colors (e.g., "navy", "darkslategrey").

Usage:
```json
{
  "back-color": "~ BlackCColor",
  "font-color": "~ WhiteCColor"
}
```

### Predefined Fonts

Built-in font references prefixed with `~` (verified from `vstgui/lib/cfont.h`):

| Name | Description |
|------|-------------|
| `~ SystemFont` | Platform default system font |
| `~ NormalFontVeryBig` | Very large standard font |
| `~ NormalFontBig` | Large standard font |
| `~ NormalFont` | Standard UI font (default size) |
| `~ NormalFontSmall` | Small standard font |
| `~ NormalFontSmaller` | Smaller standard font |
| `~ NormalFontVerySmall` | Very small font |
| `~ SymbolFont` | Symbol/icon font |

Usage:
```json
{
  "font": "~ NormalFont"
}
```

---

## Custom Views and Sub-Controllers

### Custom Views

For views not available in VSTGUI, create custom views in C++:

1. Set `custom-view-name` attribute in uidesc
2. Implement `createCustomView()` in your `VST3EditorDelegate`

```json
{
  "class": "CView",
  "custom-view-name": "MySpectrumAnalyzer",
  "size": "200, 100"
}
```

```cpp
CView* MyController::createCustomView(
    UTF8StringPtr name,
    const UIAttributes& attributes,
    const IUIDescription* description
) {
    if (strcmp(name, "MySpectrumAnalyzer") == 0) {
        return new SpectrumAnalyzerView(/* ... */);
    }
    return nullptr;
}
```

### Sub-Controllers

Sub-controllers provide view-specific control logic:

1. Set `sub-controller` attribute on a container
2. Implement `createSubController()` in your delegate

```json
{
  "class": "CViewContainer",
  "sub-controller": "GainController",
  "children": { /* ... */ }
}
```

```cpp
IController* MyController::createSubController(
    UTF8StringPtr name,
    const IUIDescription* description
) {
    if (strcmp(name, "GainController") == 0) {
        return new GainSubController(editController);
    }
    return nullptr;
}
```

---

## VST3 Integration

### Parameter Binding

VSTGUI automatically binds controls to VST3 parameters when:

1. **Control tags match parameter IDs** - Set `control-tag` to the parameter ID or use "Sync Parameter Tags" in the editor
2. **EditController implements the parameter** - Define parameters in your `EditController::initialize()`

### Automatic Features

With proper setup, VSTGUI provides:

- `beginEdit()` / `performEdit()` / `endEdit()` calls on user interaction
- Parameter value display updates from host automation
- Host context menu on right-click (VST 3.5+)
- Mouse wheel parameter adjustment

### UI-Only Parameters

For UI state not tied to audio processing (tab selection, scroll position):

```cpp
// In EditController
class UIOnlyParameter : public Parameter {
    // Not reported to processor
};

parameter* EditController::getParameterObject(int32 paramID) {
    if (paramID >= UI_PARAM_START) {
        return uiOnlyParams[paramID - UI_PARAM_START];
    }
    return EditController::getParameterObject(paramID);
}
```

---

## Best Practices

### File Organization

```
project/
├── resource/
│   ├── plugin.uidesc          # Main UI definition
│   ├── images/
│   │   ├── background.png
│   │   ├── knob.png
│   │   ├── knob@2x.png       # HiDPI version
│   │   └── slider.png
│   └── plugin.rc              # Windows resources
└── source/
    └── controller.cpp
```

### Naming Conventions

| Element | Convention | Example |
|---------|------------|---------|
| Colors | PascalCase | `BackgroundDark`, `TextPrimary` |
| Fonts | PascalCase | `LabelFont`, `TitleFont` |
| Bitmaps | lowercase-dash | `knob-large`, `button-normal` |
| Control Tags | PascalCase | `MainGain`, `OutputLevel` |
| Templates | PascalCase | `MainView`, `SettingsPanel` |

### Performance Tips

1. **Use CLayeredViewContainer** for frequently updating views (meters, analyzers)
2. **Minimize view hierarchy depth** - flat structures render faster
3. **Use appropriate bitmap formats** - PNG for UI, consider compression
4. **Provide @2x bitmaps** for HiDPI displays

### Accessibility

1. **Provide tooltips** for all controls
2. **Ensure sufficient contrast** (4.5:1 for text)
3. **Support keyboard navigation** (`wants-focus="true"`)
4. **Use semantic control types** (prefer CSlider over custom for standard behavior)

### Maintenance

1. **Use named resources** - Never hardcode colors/fonts inline
2. **Group related colors** - Create consistent palettes
3. **Document custom views** - Add comments in custom section
4. **Version your uidesc** - Track changes in version control

---

## Additional Resources

- [VSTGUI Official Documentation](https://steinbergmedia.github.io/vst3_doc/vstgui/html/index.html)
- [VSTGUI GitHub Repository](https://github.com/steinbergmedia/vstgui)
- [VST3 Developer Portal](https://steinbergmedia.github.io/vst3_dev_portal/)
- [UI XML Attributes Reference](https://steinbergmedia.github.io/vst3_doc/vstgui/html/uidescription_attributes.html)
- [VSTGUI Inline Editor Guide](https://steinbergmedia.github.io/vst3_doc/vstgui/html/page_uidescription_editor.html)

---

*This guide is maintained as part of the VSGUI-Edit project. Last updated: 2026-01-05*
