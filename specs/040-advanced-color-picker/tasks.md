# Tasks: Advanced Color Picker

**Input**: Design documents from `/specs/040-advanced-color-picker/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: This feature follows TDD approach - tests are written before implementation.

**Testing Guide**: Every task involving unit/component tests MUST include verification that `specs/TESTING-GUIDE.md` is loaded in context BEFORE writing tests.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Types, constants, and domain utilities that all stories depend on

- [ ] T001 Create TypeScript types in `src/types/colorPicker.ts` (ColorValue, ColorFormat, ColorSource, PickerMode, PredefinedColor)
- [ ] T002 [P] Create VSTGUI predefined colors constant in `src/domain/colorPicker/predefinedColors.ts`
- [ ] T003 [P] Create barrel exports in `src/domain/colorPicker/index.ts`
- [ ] T004 [P] Create ColorPicker directory structure at `src/components/editors/ColorPicker/`
- [ ] T005 **Commit**: Stage and commit Phase 1 changes with descriptive message

---

## Phase 2: Foundational (Color Conversion & Validation)

**Purpose**: Core domain logic that MUST be complete before ANY UI components

**CRITICAL**: No component work can begin until this phase is complete

### Tests for Foundational Phase

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**
> **REQUIRED: Read `specs/TESTING-GUIDE.md` before writing any test**

- [ ] T006 **Verify Testing Guide in context** - Read `specs/TESTING-GUIDE.md` before proceeding
- [ ] T007 [P] Write tests for color conversion in `src/domain/colorPicker/__tests__/colorConversion.spec.ts`
  - RGB to HSV round-trip (red, green, blue, black, white, gray)
  - HSV to RGB round-trip
  - RGB to HSL round-trip
  - HSL to RGB round-trip
  - parseHexToRgba (6-digit, 8-digit, 3-digit shorthand, invalid)
  - rgbaToHex (always 8-digit uppercase)
  - Edge cases: transparent, pure colors, grayscale
  - **FR-009a**: Output normalization tests - verify rgbaToHex ALWAYS returns 8-digit format:
    - 6-digit input (#FF5500) → 8-digit output (#FF5500FF)
    - RGB input (255, 85, 0) → 8-digit output
    - HSL input (20, 100%, 50%) → 8-digit output
    - Already 8-digit input returns unchanged
- [ ] T008 [P] Write tests for color validation in `src/domain/colorPicker/__tests__/colorValidation.spec.ts`
  - validateHexInput (valid 6/8 digit, auto-add #, invalid chars, case normalization)
  - validateRgbInput (0-255 range, out of range errors)
  - validateHslInput (H: 0-360, S/L: 0-100, out of range errors)
- [ ] T009 [P] Write tests for recent colors in `src/domain/colorPicker/__tests__/recentColors.spec.ts`
  - getRecentColors (empty storage, valid JSON, invalid JSON)
  - addRecentColor (adds to front, moves duplicate to front, max 10 FIFO)
  - clearRecentColors
  - isStorageAvailable (mock localStorage)

### Implementation for Foundational Phase

- [ ] T010 [P] Implement color conversion functions in `src/domain/colorPicker/colorConversion.ts`
  - rgbToHsv, hsvToRgb, rgbToHsl, hslToRgb
  - parseHexToRgba, rgbaToHex
  - clamp, roundTo, isValidHex utility functions
  - createColorValue factory function
- [ ] T011 [P] Implement color validation in `src/domain/colorPicker/colorValidation.ts`
  - validateHexInput, validateRgbInput, validateHslInput
  - Return { valid, error?, normalized? } structure
- [ ] T012 [P] Implement recent colors persistence in `src/domain/colorPicker/recentColors.ts`
  - STORAGE_KEY = 'vstgui-edit:recent-colors'
  - MAX_RECENT_COLORS = 10
  - getRecentColors, addRecentColor, clearRecentColors, isStorageAvailable
- [ ] T013 Verify all domain tests pass - run `npm test -- --testPathPattern=colorPicker`
- [ ] T014 **Commit**: Stage and commit Phase 2 changes with descriptive message

**Checkpoint**: Foundation ready - component implementation can now begin

---

## Phase 3: User Story 1 - Visual Color Selection (Priority: P1)

**Goal**: Users can visually select colors using a saturation-brightness gradient and hue slider

**Independent Test**: Open color picker, drag on gradient area and hue slider, verify selected color updates in real-time

### Tests for User Story 1

> **REQUIRED: Read `specs/TESTING-GUIDE.md` before writing any test**

- [ ] T015 [US1] **Verify Testing Guide in context** - Read `specs/TESTING-GUIDE.md` before proceeding
- [ ] T016 [P] [US1] Write tests for GradientArea in `src/components/editors/ColorPicker/__tests__/GradientArea.spec.tsx`
  - Renders with correct hue-based background color
  - Click at top-left gives S=0, B=100
  - Click at bottom-right gives S=100, B=0
  - Drag updates saturation/brightness continuously
  - mouseup calls onCommit
  - Arrow keys: 1% step normal, 10% with Shift
  - Disabled state prevents interaction
  - ARIA attributes present (role="slider", valuemin, valuemax)
- [ ] T017 [P] [US1] Write tests for HueSlider in `src/components/editors/ColorPicker/__tests__/HueSlider.spec.tsx`
  - Renders rainbow gradient track
  - Click sets hue to corresponding position
  - Drag updates hue continuously
  - Arrow keys: Left/Right change by 3.6 degrees (1%), Shift: 36 degrees (10%)
  - mouseup calls onCommit
  - Disabled state prevents interaction
  - ARIA attributes present

### Implementation for User Story 1

- [ ] T018 [P] [US1] Create CSS module `src/components/editors/ColorPicker/ColorPicker.module.css`
  - .gradientArea (200x150px, relative positioning, cursor crosshair)
  - .gradientThumb (circular indicator, 12px, border, shadow)
  - .hueSlider, .hueTrack (rainbow gradient), .hueThumb
  - .sliderTrack, .sliderThumb base classes
  - Focus indicators for keyboard accessibility
- [ ] T019 [US1] Implement GradientArea component in `src/components/editors/ColorPicker/GradientArea.tsx`
  - CSS gradient: horizontal (white to hue color) + vertical (transparent to black)
  - Update --current-hue-color CSS variable from hue prop
  - Click/drag event handling with coordinate calculation
  - Keyboard navigation (arrow keys with step sizes)
  - ARIA slider role attributes
- [ ] T020 [US1] Implement HueSlider component in `src/components/editors/ColorPicker/HueSlider.tsx`
  - Rainbow gradient background (0-360 degrees)
  - Horizontal slider with draggable thumb
  - Keyboard navigation (Left/Right with Shift modifier)
  - ARIA slider role attributes
- [ ] T021 [US1] Verify User Story 1 tests pass
- [ ] T022 [US1] **Commit**: Stage and commit User Story 1 changes with descriptive message

**Checkpoint**: Visual color selection (gradient + hue) is functional

---

## Phase 4: User Story 2 - Alpha/Opacity Control (Priority: P1)

**Goal**: Users can adjust alpha/opacity of colors for semi-transparent UI elements

**Independent Test**: Open color picker, drag alpha slider, verify 8-digit hex updates correctly

### Tests for User Story 2

> **REQUIRED: Read `specs/TESTING-GUIDE.md` before writing any test**

- [ ] T023 [US2] **Verify Testing Guide in context** - Read `specs/TESTING-GUIDE.md` before proceeding
- [ ] T024 [P] [US2] Write tests for AlphaSlider in `src/components/editors/ColorPicker/__tests__/AlphaSlider.spec.tsx`
  - Renders checkerboard pattern background
  - Shows gradient from transparent to current color
  - Click sets alpha to corresponding position
  - Drag updates alpha continuously
  - Arrow keys: 1% (~3 units), Shift: 10% (~26 units)
  - mouseup calls onCommit
  - Disabled state prevents interaction
  - ARIA attributes present

### Implementation for User Story 2

- [ ] T025 [US2] Add alpha slider styles to `src/components/editors/ColorPicker/ColorPicker.module.css`
  - .alphaSlider, .alphaTrack (checkerboard + color gradient)
  - Checkerboard pattern using CSS (reuse tokens from tokens.css)
- [ ] T026 [US2] Implement AlphaSlider component in `src/components/editors/ColorPicker/AlphaSlider.tsx`
  - Checkerboard background pattern
  - Color-to-transparent gradient overlay (using color prop)
  - Horizontal slider (0-255)
  - Keyboard navigation with alpha-specific step sizes
  - ARIA slider role attributes
- [ ] T027 [US2] Verify User Story 2 tests pass
- [ ] T028 [US2] **Commit**: Stage and commit User Story 2 changes with descriptive message

**Checkpoint**: Alpha control is functional

---

## Phase 5: User Story 3 - HEX Input (Priority: P1)

**Goal**: Users can type HEX values directly with validation

**Independent Test**: Type 6-digit and 8-digit hex codes, verify validation and normalization

### Tests for User Story 3

> **REQUIRED: Read `specs/TESTING-GUIDE.md` before writing any test**

- [ ] T029 [US3] **Verify Testing Guide in context** - Read `specs/TESTING-GUIDE.md` before proceeding
- [ ] T030 [P] [US3] Write tests for ColorInputs HEX mode in `src/components/editors/ColorPicker/__tests__/ColorInputs.spec.tsx`
  - Renders HEX tab by default
  - Shows current hex value in input
  - Valid 6-digit input updates color (alpha defaults to FF)
  - Valid 8-digit input updates color and alpha
  - Invalid input shows validation error (red border)
  - Auto-adds # prefix on commit
  - Tab key switches to RGB/HSL modes
  - Enter key commits value
  - ARIA attributes for tab panel

### Implementation for User Story 3

- [ ] T031 [US3] Add input styles to `src/components/editors/ColorPicker/ColorPicker.module.css`
  - .inputTabs, .tab, .tabActive
  - .inputPanel
  - .hexInput (monospace font, uppercase)
  - .inputError (red border for invalid)
  - .errorMessage
- [ ] T032 [US3] Implement ColorInputs component in `src/components/editors/ColorPicker/ColorInputs.tsx`
  - Tab bar with HEX/RGB/HSL options
  - HEX mode: single text input with validation
  - Format tab state management
  - Validation error display
  - Call onChange with parsed ColorValue and source
  - Call onCommit on Enter key
- [ ] T033 [US3] Verify User Story 3 tests pass
- [ ] T034 [US3] **Commit**: Stage and commit User Story 3 changes with descriptive message

**Checkpoint**: HEX input with validation is functional

---

## Phase 6: User Story 4 - RGB/HSL Format Switching (Priority: P2)

**Goal**: Users can input colors using RGB or HSL values

**Independent Test**: Switch between HEX/RGB/HSL tabs, enter values, verify accurate conversion

### Tests for User Story 4

> **REQUIRED: Read `specs/TESTING-GUIDE.md` before writing any test**

- [ ] T035 [US4] **Verify Testing Guide in context** - Read `specs/TESTING-GUIDE.md` before proceeding
- [ ] T036 [P] [US4] Write tests for ColorInputs RGB/HSL modes in `src/components/editors/ColorPicker/__tests__/ColorInputs.spec.tsx` (extend existing)
  - RGB mode: shows R, G, B, A inputs (0-255 each)
  - RGB validation (range 0-255)
  - HSL mode: shows H (0-360), S, L, A inputs (0-100%)
  - HSL validation (H: 0-360, S/L/A: 0-100)
  - Format switching preserves color value
  - Conversion accuracy between formats

### Implementation for User Story 4

- [ ] T037 [US4] Add RGB/HSL input styles to `src/components/editors/ColorPicker/ColorPicker.module.css`
  - .rgbInputs, .hslInputs (grid layout for 4 fields)
  - .fieldGroup, .fieldLabel, .fieldInput
- [ ] T038 [US4] Extend ColorInputs component for RGB/HSL modes
  - RGB panel: 4 number inputs (R, G, B, A 0-255)
  - HSL panel: 4 number inputs (H 0-360, S/L/A 0-100)
  - Format switching updates display without changing color
  - Input validation per format
- [ ] T039 [US4] Verify User Story 4 tests pass
- [ ] T040 [US4] **Commit**: Stage and commit User Story 4 changes with descriptive message

**Checkpoint**: Multi-format input is functional

---

## Phase 7: User Story 5 - Document Color Swatches (Priority: P2)

**Goal**: Quick access to colors defined in the uidesc document

**Independent Test**: Open picker with document colors, click swatch, verify color name is used as value

### Tests for User Story 5

> **REQUIRED: Read `specs/TESTING-GUIDE.md` before writing any test**

- [ ] T041 [US5] **Verify Testing Guide in context** - Read `specs/TESTING-GUIDE.md` before proceeding
- [ ] T042 [P] [US5] Write tests for ColorSwatches document colors in `src/components/editors/ColorPicker/__tests__/ColorSwatches.spec.tsx`
  - Renders "Document Colors" section when documentColors prop has items
  - Hides section when documentColors is empty
  - Renders swatches with resolved hex values for preview
  - Click calls onSelect with color name (not hex) and source 'document-color'
  - Selected swatch has visual highlight
  - Keyboard: arrow navigation, Enter/Space select
  - **Edge case**: Missing reference indicator - when current value is a document color name that no longer exists in documentColors, display the reference name with a visual "missing" indicator (red border/icon)

### Implementation for User Story 5

- [ ] T043 [US5] Add swatch styles to `src/components/editors/ColorPicker/ColorPicker.module.css`
  - .swatchesSection, .swatchesHeader
  - .swatchGrid (flex wrap, gap)
  - .swatch (24px square, border, cursor pointer)
  - .swatchSelected (highlight border)
  - .swatchName (tooltip on hover)
  - .swatchMissing (red border/icon for missing reference indicator)
- [ ] T044 [US5] Implement ColorSwatches component in `src/components/editors/ColorPicker/ColorSwatches.tsx`
  - Document colors section (conditional rendering)
  - Reuse existing ColorSwatch component from ColorsPanel
  - Selection highlighting
  - Keyboard navigation (arrow keys between swatches)
  - Output color name for document colors
  - Missing reference detection: if currentValue is a color name not in documentColors, show missing indicator
- [ ] T045 [US5] Verify User Story 5 tests pass
- [ ] T046 [US5] **Commit**: Stage and commit User Story 5 changes with descriptive message

**Checkpoint**: Document color swatches are functional

---

## Phase 8: User Story 6 - Predefined VSTGUI Colors (Priority: P2)

**Goal**: Access to VSTGUI's 10 built-in system colors

**Independent Test**: Expand predefined section, click swatch, verify "~ ColorName" format is used

### Tests for User Story 6

> **REQUIRED: Read `specs/TESTING-GUIDE.md` before writing any test**

- [ ] T047 [US6] **Verify Testing Guide in context** - Read `specs/TESTING-GUIDE.md` before proceeding
- [ ] T048 [P] [US6] Write tests for ColorSwatches predefined colors (extend existing test file)
  - Renders "Predefined Colors" section with 10 VSTGUI colors
  - Swatches show correct hex preview
  - Click calls onSelect with "~ ColorName" format and source 'predefined-color'
  - Tooltip shows display name (e.g., "Black", "White")

### Implementation for User Story 6

- [ ] T049 [US6] Extend ColorSwatches component for predefined colors
  - Import VSTGUI_PREDEFINED_COLORS constant
  - Render predefined section with all 10 colors
  - Output "~ ColorName" format when selected
  - Show displayName in tooltip
- [ ] T050 [US6] Verify User Story 6 tests pass
- [ ] T051 [US6] **Commit**: Stage and commit User Story 6 changes with descriptive message

**Checkpoint**: Predefined color swatches are functional

---

## Phase 9: User Story 7 - Color Preview Comparison (Priority: P2)

**Goal**: See old color next to new color for comparison

**Independent Test**: Open picker with existing color, change color, verify both displayed

### Tests for User Story 7

> **REQUIRED: Read `specs/TESTING-GUIDE.md` before writing any test**

- [ ] T052 [US7] **Verify Testing Guide in context** - Read `specs/TESTING-GUIDE.md` before proceeding
- [ ] T053 [P] [US7] Write tests for ColorPreview in `src/components/editors/ColorPicker/__tests__/ColorPreview.spec.tsx`
  - Renders original color on left, current color on right
  - Shows checkerboard behind both for transparency indication
  - Click on original color calls onRevert
  - Labels "Old" and "New" for accessibility

### Implementation for User Story 7

- [ ] T054 [US7] Add preview styles to `src/components/editors/ColorPicker/ColorPicker.module.css`
  - .previewContainer (flex row, gap)
  - .previewSwatch (40x24px, checkerboard background)
  - .previewLabel (small text)
  - .previewOld (cursor pointer for revert)
- [ ] T055 [US7] Implement ColorPreview component in `src/components/editors/ColorPicker/ColorPreview.tsx`
  - Two side-by-side swatches with checkerboard backgrounds
  - Labels for accessibility
  - Click handler on original for revert
- [ ] T056 [US7] Verify User Story 7 tests pass
- [ ] T057 [US7] **Commit**: Stage and commit User Story 7 changes with descriptive message

**Checkpoint**: Color preview comparison is functional

---

## Phase 10: User Story 8 - Eyedropper Tool (Priority: P3)

**Goal**: Pick colors from anywhere on screen (Chromium browsers only)

**Independent Test**: Click eyedropper button, select color from screen, verify captured

### Tests for User Story 8

> **REQUIRED: Read `specs/TESTING-GUIDE.md` before writing any test**

- [ ] T058 [US8] **Verify Testing Guide in context** - Read `specs/TESTING-GUIDE.md` before proceeding
- [ ] T059 [P] [US8] Write tests for EyeDropperButton in `src/components/editors/ColorPicker/__tests__/EyeDropperButton.spec.tsx`
  - Not rendered when EyeDropper API unavailable (mock window.EyeDropper)
  - Rendered with icon when API available
  - Click activates eyedropper (mock EyeDropper.open())
  - Successful pick calls onColorPick with hex (adds FF alpha)
  - User cancellation (Escape) does not call onColorPick
  - Disabled state prevents click

### Implementation for User Story 8

- [ ] T060 [US8] Add eyedropper styles to `src/components/editors/ColorPicker/ColorPicker.module.css`
  - .eyedropperButton (icon button, positioned)
  - .eyedropperIcon (SVG styles)
- [ ] T061 [US8] Implement EyeDropperButton component in `src/components/editors/ColorPicker/EyeDropperButton.tsx`
  - Feature detection: typeof window !== 'undefined' && 'EyeDropper' in window
  - Conditional rendering (null if not supported)
  - Async handler for EyeDropper.open()
  - Convert 6-digit result to 8-digit (add FF alpha)
  - Handle cancellation gracefully
- [ ] T062 [US8] Verify User Story 8 tests pass
- [ ] T063 [US8] **Commit**: Stage and commit User Story 8 changes with descriptive message

**Checkpoint**: Eyedropper tool is functional (where supported)

---

## Phase 11: User Story 9 - Recently Used Colors (Priority: P3)

**Goal**: Quick access to up to 10 recently used colors

**Independent Test**: Select colors, reopen picker, verify recent colors section shows them

### Tests for User Story 9

> **REQUIRED: Read `specs/TESTING-GUIDE.md` before writing any test**

- [ ] T064 [US9] **Verify Testing Guide in context** - Read `specs/TESTING-GUIDE.md` before proceeding
- [ ] T065 [P] [US9] Write tests for ColorSwatches recent colors (extend existing test file)
  - Renders "Recent Colors" section when recent colors exist
  - Hides section when no recent colors
  - Shows up to 10 colors in order (most recent first)
  - Click calls onSelect with hex and source 'recent-color'
  - Integration: selecting color adds to recent colors

### Implementation for User Story 9

- [ ] T066 [US9] Extend ColorSwatches component for recent colors
  - Call getRecentColors() from domain/colorPicker/recentColors
  - Render recent section conditionally
  - Output hex value when selected
- [ ] T067 [US9] Verify User Story 9 tests pass
- [ ] T068 [US9] **Commit**: Stage and commit User Story 9 changes with descriptive message

**Checkpoint**: Recent colors are functional

---

## Phase 12: User Story 10 - Popup Mode (Priority: P1)

**Goal**: Compact trigger that opens full picker in dropdown for Properties Panel

**Independent Test**: Click color trigger, verify dropdown opens, select color, verify commit

### Tests for User Story 10

> **REQUIRED: Read `specs/TESTING-GUIDE.md` before writing any test**

- [ ] T069 [US10] **Verify Testing Guide in context** - Read `specs/TESTING-GUIDE.md` before proceeding
- [ ] T070 [P] [US10] Write tests for ColorPickerPopup in `src/components/editors/ColorPicker/__tests__/ColorPicker.spec.tsx`
  - Default mode is popup
  - Trigger shows color swatch + value text
  - Click trigger opens dropdown
  - Dropdown contains ColorPickerCore
  - Click outside closes and commits (if valid)
  - Escape closes and reverts (if invalid per FR-022a)
  - FloatingDropdown positioning works

### Implementation for User Story 10

- [ ] T071 [US10] Add popup styles to `src/components/editors/ColorPicker/ColorPicker.module.css`
  - .popupTrigger (inline-flex, border, rounded)
  - .triggerSwatch (16px square)
  - .triggerValue (text)
  - .popupDropdown (width, padding, shadow)
- [ ] T072 [US10] Implement ColorPickerCore in `src/components/editors/ColorPicker/ColorPickerCore.tsx`
  - Compose: GradientArea, HueSlider, AlphaSlider, ColorInputs, ColorPreview, ColorSwatches, EyeDropperButton
  - State management: color signals, format signal
  - Derived hex output (always 8-digit)
  - onChange/onCommit prop handling
- [ ] T073 [US10] Implement ColorPickerPopup in `src/components/editors/ColorPicker/ColorPickerPopup.tsx`
  - Import FloatingDropdown from common
  - Trigger button with swatch + value
  - Capture originalValue on open
  - Close handlers: outside click commits, Escape reverts if invalid
  - Add recent color on commit
- [ ] T074 [US10] Verify User Story 10 tests pass
- [ ] T075 [US10] **Commit**: Stage and commit User Story 10 changes with descriptive message

**Checkpoint**: Popup mode is functional

---

## Phase 13: User Story 11 - Inline Mode (Priority: P2)

**Goal**: Full picker displayed inline for Colors Panel

**Independent Test**: Render picker with mode="inline", verify displays without popup

### Tests for User Story 11

> **REQUIRED: Read `specs/TESTING-GUIDE.md` before writing any test**

- [ ] T076 [US11] **Verify Testing Guide in context** - Read `specs/TESTING-GUIDE.md` before proceeding
- [ ] T077 [P] [US11] Write tests for ColorPickerInline in `src/components/editors/ColorPicker/__tests__/ColorPicker.spec.tsx` (extend)
  - mode="inline" renders picker directly (no trigger/dropdown)
  - Full picker UI visible immediately
  - Escape key commits changes
  - Same ColorPickerCore used as popup mode

### Implementation for User Story 11

- [ ] T078 [US11] Add inline styles to `src/components/editors/ColorPicker/ColorPicker.module.css`
  - .inlineContainer (direct display, no dropdown)
- [ ] T079 [US11] Implement ColorPickerInline in `src/components/editors/ColorPicker/ColorPickerInline.tsx`
  - Render ColorPickerCore directly
  - Escape key commits
  - No trigger/dropdown UI
- [ ] T080 [US11] Create main ColorPicker export in `src/components/editors/ColorPicker/ColorPicker.tsx`
  - Route to ColorPickerPopup (default) or ColorPickerInline based on mode prop
  - Maintain backward compatibility with existing ColorPickerProps
- [ ] T081 [US11] Verify User Story 11 tests pass
- [ ] T082 [US11] **Commit**: Stage and commit User Story 11 changes with descriptive message

**Checkpoint**: Both popup and inline modes are functional

---

## Phase 14: User Story 12 - Full Keyboard Navigation (Priority: P2)

**Goal**: Complete keyboard accessibility for all picker elements

**Independent Test**: Tab through all elements, use arrow keys to adjust values, verify operation without mouse

### Tests for User Story 12

> **REQUIRED: Read `specs/TESTING-GUIDE.md` before writing any test**

- [ ] T083 [US12] **Verify Testing Guide in context** - Read `specs/TESTING-GUIDE.md` before proceeding
- [ ] T084 [P] [US12] Write keyboard navigation integration tests (extend existing test files)
  - Tab order: trigger -> gradient -> hue -> alpha -> format tabs -> inputs -> swatches
  - Arrow keys in gradient area move selection
  - Arrow keys in sliders adjust values
  - Enter/Space on swatches select
  - Escape closes popup
  - Focus indicators visible (WCAG 2.1 AA)

### Implementation for User Story 12

- [ ] T085 [US12] Add focus styles to `src/components/editors/ColorPicker/ColorPicker.module.css`
  - :focus-visible outlines on all interactive elements
  - High contrast focus indicators (4.5:1)
- [ ] T086 [US12] Ensure all components have tabIndex and keyboard handlers
  - GradientArea: tabIndex=0, arrow key handlers
  - HueSlider: tabIndex=0, left/right handlers
  - AlphaSlider: tabIndex=0, left/right handlers
  - ColorInputs: tab panel navigation
  - ColorSwatches: listbox pattern with roving tabindex
- [ ] T087 [US12] Add comprehensive ARIA attributes
  - role="slider" with aria-valuemin, aria-valuemax, aria-valuenow, aria-label
  - role="tablist" and role="tab" for format switcher
  - role="listbox" and role="option" for swatches
- [ ] T088 [US12] Verify User Story 12 tests pass
- [ ] T089 [US12] **Commit**: Stage and commit User Story 12 changes with descriptive message

**Checkpoint**: Full keyboard accessibility is functional

---

## Phase 15: Integration & Replacement

**Purpose**: Replace existing ColorPicker and verify integration

- [ ] T090 Update barrel export in `src/components/editors/ColorPicker/index.ts`
- [ ] T091 [P] Write integration tests verifying backward compatibility in `src/components/editors/ColorPicker/__tests__/integration.spec.tsx`
  - Existing ColorPickerProps interface works
  - onChange/onCommit/onCancel callbacks work correctly
  - documentColors prop integration
  - History integration (undo/redo via onCommit)
  - **FR-009a**: Output normalization integration tests:
    - Input via HEX tab → onCommit receives 8-digit HEX
    - Input via RGB tab → onCommit receives 8-digit HEX
    - Input via HSL tab → onCommit receives 8-digit HEX
    - Visual picker selection → onCommit receives 8-digit HEX
    - 6-digit input is normalized to 8-digit on commit
- [ ] T092 Verify integration with Properties Panel (AttributeRow uses ColorPicker)
- [ ] T093 Run full test suite - `npm test`
- [ ] T094 **Commit**: Stage and commit Phase 15 changes with descriptive message

---

## Phase 16: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T095 [P] Add CSS custom properties to `src/styles/tokens.css` if needed
- [ ] T096 [P] Ensure all colors use design tokens (no hardcoded colors)
- [ ] T097 Performance audit: ensure <100ms response, 60fps during drag
- [ ] T098 Verify WCAG 2.1 AA compliance (color contrast 4.5:1)
- [ ] T099 Update `CLAUDE.md` with new ColorPicker domain utilities
- [ ] T100 **Commit**: Stage and commit Polish phase changes with descriptive message

---

## Phase Final-1: Quality Gates (MANDATORY)

**Purpose**: Verify code quality before marking feature complete

**CRITICAL**: ALL three quality gate commands MUST pass with ZERO errors and ZERO warnings before proceeding.

- [ ] TQG-1 **CSS Linting**: Run `npm run lint:css` - Fix ALL errors and warnings
- [ ] TQG-2 **Code Quality**: Run `npm run check` - Fix ALL errors and warnings
- [ ] TQG-3 **Type Safety**: Run `npm run typecheck` - Fix ALL errors and warnings
- [ ] TQG-4 **Verify Clean**: Re-run all three commands to confirm zero issues remain

**If Quality Gates Fail**:
1. STOP - do not proceed to Git Verification
2. FIX all reported errors and warnings
3. RE-RUN the failing command(s)
4. REPEAT until all three commands pass cleanly

**NO EXCEPTIONS**: Even "pre-existing" issues MUST be resolved. The spec is NOT complete until all quality gates pass.

---

## Phase Final: Git Verification

**Purpose**: Ensure all work is committed before marking feature complete

- [ ] TFINAL **Verify Git Status**: Run `git status` to check for uncommitted changes
- [ ] TFINAL **Commit Remaining**: If any unstaged/uncommitted changes exist, stage and commit them with an appropriate message
- [ ] TFINAL **Confirm Clean**: Verify working tree is clean (nothing to commit)

**CRITICAL**: Do NOT mark the feature as complete until this phase confirms all work is committed.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup - BLOCKS all user stories
- **User Stories 1-3 (P1)**: Depend on Foundational, can proceed in sequence (core visual picking)
- **User Stories 4-7 (P2)**: Depend on Foundational, can proceed after P1 stories
- **User Stories 8-9 (P3)**: Depend on Foundational, nice-to-have features
- **User Story 10 (P1)**: Depends on US1-3 components being ready
- **User Stories 11-12 (P2)**: Depend on US10 (core composition)
- **Integration (Phase 15)**: Depends on all user stories complete
- **Polish (Phase 16)**: Depends on integration complete

### User Story Dependencies

- **US1 (Visual Selection)**: Foundational only - first visual component
- **US2 (Alpha)**: Foundational only - can parallel with US1
- **US3 (HEX Input)**: Foundational only - can parallel with US1, US2
- **US4 (RGB/HSL)**: Extends US3 (ColorInputs component)
- **US5 (Document Colors)**: Foundational only
- **US6 (Predefined Colors)**: Extends US5 (ColorSwatches component)
- **US7 (Preview)**: Foundational only
- **US8 (Eyedropper)**: Foundational only
- **US9 (Recent)**: Extends US5/US6 (ColorSwatches component)
- **US10 (Popup Mode)**: Requires US1, US2, US3, US5-9 components
- **US11 (Inline Mode)**: Requires US10 (ColorPickerCore)
- **US12 (Keyboard)**: Cross-cutting, enhances all components

### Parallel Opportunities

Within each user story phase:
- Tests marked [P] can run in parallel
- Implementation tasks for different components can run in parallel

Between phases:
- After Foundational (Phase 2), US1, US2, US3 can be implemented in parallel
- US5, US7, US8 can run in parallel (independent components)

---

## Parallel Example: Foundational Phase

```bash
# Write all domain tests in parallel:
Task: "Write tests for color conversion in src/domain/colorPicker/__tests__/colorConversion.spec.ts"
Task: "Write tests for color validation in src/domain/colorPicker/__tests__/colorValidation.spec.ts"
Task: "Write tests for recent colors in src/domain/colorPicker/__tests__/recentColors.spec.ts"

# Implement all domain modules in parallel:
Task: "Implement color conversion in src/domain/colorPicker/colorConversion.ts"
Task: "Implement color validation in src/domain/colorPicker/colorValidation.ts"
Task: "Implement recent colors in src/domain/colorPicker/recentColors.ts"
```

---

## Implementation Strategy

### MVP First (User Stories 1, 2, 3, 10)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL)
3. Complete Phases 3-5: US1-US3 (visual + alpha + HEX input)
4. Complete Phase 12: US10 (popup mode composition)
5. **STOP and VALIDATE**: Basic color picker is functional
6. Deploy/demo if ready

### Incremental Delivery

1. MVP (US1, US2, US3, US10) -> Basic picker works
2. Add US4 (RGB/HSL) -> Multi-format input
3. Add US5, US6 (Swatches) -> Quick color selection
4. Add US7 (Preview) -> Better UX
5. Add US8, US9 (Eyedropper, Recent) -> Power user features
6. Add US11, US12 (Inline, Keyboard) -> Full accessibility

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- **Testing Guide**: Always read `specs/TESTING-GUIDE.md` before writing tests
- Verify tests fail before implementing
- **Commit after each phase** - each phase ends with a commit task
- Stop at any checkpoint to validate story independently
- Output is ALWAYS 8-digit HEX (#RRGGBBAA) except for document/predefined color references
- Reuse existing components: ColorSwatch from ColorsPanel, FloatingDropdown from common
