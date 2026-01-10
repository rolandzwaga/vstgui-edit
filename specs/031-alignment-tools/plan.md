# Implementation Plan: Alignment Tools

**Branch**: `031-alignment-tools` | **Date**: 2026-01-10 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/031-alignment-tools/spec.md`

## Summary

Implement alignment and distribution tools for the VSTGUI-Edit visual editor. Users will be able to align multiple selected views (left/center/right/top/middle/bottom), align a single view to its parent container, and distribute 3+ views with equal spacing. The feature includes toolbar buttons with icons, keyboard shortcuts (Ctrl+Shift+L/C/R/T/M/B), and full undo/redo support. The toolbar will be dockable by default with the ability to detach into a floating panel.

## Technical Context

**Language/Version**: TypeScript 5.9.3 (strict mode)
**Primary Dependencies**: SolidJS 1.9.10, @floating-ui/dom 1.7.4 (for floating panel positioning)
**Storage**: In-memory via SolidJS stores; localStorage for docked/floating state persistence
**Testing**: Vitest 4.x with @solidjs/testing-library
**Testing Guide**: `specs/TESTING-GUIDE.md` - MUST be consulted for all test tasks
**Target Platform**: Web browser (modern browsers with ES2020+ support)
**Project Type**: Single SPA (SolidJS frontend)
**Performance Goals**: < 16ms for alignment calculations (60fps), immediate visual feedback
**Constraints**: No external dependencies beyond existing stack, operations must be undoable
**Scale/Scope**: Typically 10-50 views per template, max ~500 views

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Test-First Development | PASS | All domain logic and components will have tests written first |
| II. Technology Stack | PASS | Using existing SolidJS + TypeScript + Vitest stack |
| III. Security & Compliance | PASS | No sensitive data handling; input validation for coordinates |
| IV. Code Quality & Architecture | PASS | Biome + Stylelint + TypeScript strict mode |
| V. GUI Editor Domain | PASS | Undo/redo required for all operations, immediate visual feedback |
| VI. Testing Standards | PASS | Unit tests for domain, component tests for UI |
| XII. Framework Restrictions | PASS | SolidJS ONLY - no React patterns |
| XV. Styling Architecture | PASS | CSS Modules with design tokens |
| XIX. Domain Knowledge | PASS | View positioning uses uidesc origin/size attributes |
| XX. Technical Overview | PASS | Leveraging existing stores (selection, document, history) |
| XXI. Static Imports ONLY | PASS | No dynamic imports |
| XXII. Honest Completion | PASS | All FR/SC requirements tracked in compliance table |
| XXIII. Quality Gates | PASS | lint:css, check, typecheck must pass |

## Project Structure

### Documentation (this feature)

```text
specs/031-alignment-tools/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output (API contracts)
└── tasks.md             # Phase 2 output (/speckit.tasks command)
```

### Source Code (repository root)

```text
src/
├── domain/
│   └── alignment/           # NEW: Alignment calculation logic
│       ├── index.ts
│       ├── types.ts
│       ├── calculateBounds.ts
│       ├── alignViews.ts
│       ├── distributeViews.ts
│       ├── historyOperations.ts
│       └── __tests__/
│           ├── calculateBounds.spec.ts
│           ├── alignViews.spec.ts
│           ├── distributeViews.spec.ts
│           └── historyOperations.spec.ts
├── stores/
│   └── alignmentToolbarStore.ts  # NEW: Docked/floating state
├── components/
│   ├── AlignmentToolbar/         # NEW: Alignment toolbar component
│   │   ├── index.ts
│   │   ├── AlignmentToolbar.tsx
│   │   ├── AlignmentToolbar.module.css
│   │   ├── AlignmentButton.tsx
│   │   ├── AlignmentIcons.tsx
│   │   └── __tests__/
│   │       └── AlignmentToolbar.spec.tsx
│   └── MainToolbar/
│       └── MainToolbar.tsx       # MODIFY: Add AlignmentToolbar
├── hooks/
│   └── canvas/
│       └── useCanvasKeyboard.ts  # MODIFY: Add alignment shortcuts
└── types/
    └── alignment.ts              # NEW: Alignment type definitions
```

**Structure Decision**: Single project with co-located tests. New domain module `src/domain/alignment/` follows existing patterns (like `src/domain/canvas/move.ts`). New component `AlignmentToolbar` integrates into existing `MainToolbar`.

## Complexity Tracking

No violations requiring justification. Feature uses existing patterns:
- Store pattern: Similar to `saveFormatStore` for toolbar state
- Domain pattern: Similar to `src/domain/canvas/move.ts` for operations
- History pattern: Same as existing move/resize operations
- Keyboard shortcuts: Extending existing `useCanvasKeyboard` hook

---

## Phase 0: Research Summary

### Key Decisions Made

1. **Alignment Reference Points**
   - Multi-select: Align to selection bounding box (geometric center)
   - Single-select: Align to parent container bounds
   - Decision: Use absolute canvas coordinates for cross-parent alignment

2. **Distribution Algorithm**
   - Calculate total span (leftmost left to rightmost right)
   - Calculate sum of view widths
   - Distribute remaining space equally as gaps
   - Outer views remain fixed; inner views reposition

3. **History Integration**
   - Reuse existing `createMoveOperation` pattern from `src/domain/canvas/move.ts`
   - Alignment is essentially a batch move operation
   - Skip history entry if no views actually moved

4. **Toolbar Architecture**
   - Docked by default in MainToolbar
   - Detachable via drag handle
   - Floating panel uses @floating-ui/dom for positioning
   - State persisted to localStorage (key: `vstgui-edit:alignment-toolbar`)

5. **Keyboard Shortcuts**
   - Ctrl+Shift+L: Align Left
   - Ctrl+Shift+C: Align Center (Horizontal)
   - Ctrl+Shift+R: Align Right
   - Ctrl+Shift+T: Align Top
   - Ctrl+Shift+M: Align Middle (Vertical)
   - Ctrl+Shift+B: Align Bottom
   - No shortcuts for distribution (toolbar only)

6. **Button Enable/Disable Logic**
   - 0 selected: All disabled
   - 1 selected (root): All disabled
   - 1 selected (non-root): Alignment enabled (align to parent)
   - 2+ selected: Alignment enabled
   - 0-2 selected: Distribution disabled
   - 3+ selected: Distribution enabled

### Existing Code to Leverage

| Module | Usage |
|--------|-------|
| `selectionStore` | Get selected view IDs |
| `documentStore.getView()` | Retrieve view data |
| `documentStore.updateViewOrigin()` | Move views |
| `documentStore.getParentId()` | Find parent for single-view alignment |
| `historyStore.pushOperation()` | Add undo/redo entry |
| `parsePoint()`, `parseSize()` | Parse origin/size strings |
| `formatOrigin()` | Format new position |
| `createMoveOperation()` | Create history operation |
| `MainToolbar` | Container for alignment toolbar |
| `useCanvasKeyboard` | Add keyboard shortcuts |
| `@floating-ui/dom` | Position floating panel |

---

## Phase 1: Design Artifacts

### Data Model

See [data-model.md](data-model.md) for complete entity definitions.

Key entities:
- `AlignmentType`: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom'
- `DistributionDirection`: 'horizontal' | 'vertical'
- `ViewBounds`: { id, left, right, top, bottom, centerX, centerY }
- `AlignmentResult`: { viewId, originalOrigin, newOrigin }
- `AlignmentToolbarState`: { isDocked, floatingPosition }

### API Contracts

See [contracts/](contracts/) directory for function signatures.

Key functions:
- `calculateSelectionBounds(viewIds): SelectionBounds`
- `calculateParentBounds(viewId): ViewBounds | null`
- `alignViews(viewIds, type, referencePoint?): AlignmentResult[]`
- `distributeViews(viewIds, direction): AlignmentResult[]`
- `createAlignmentOperation(results): HistoryOperation`

### Quickstart

See [quickstart.md](quickstart.md) for implementation guide.

---

## Implementation Phases

### Phase 1: Domain Logic (Priority: P1)
**Tasks**: 1.1-1.6

1.1. Create alignment types (`src/types/alignment.ts`)
1.2. Implement bounds calculation (`src/domain/alignment/calculateBounds.ts`)
1.3. Implement alignment functions (`src/domain/alignment/alignViews.ts`)
1.4. Implement distribution functions (`src/domain/alignment/distributeViews.ts`)
1.5. Implement history operations (`src/domain/alignment/historyOperations.ts`)
1.6. Create barrel export (`src/domain/alignment/index.ts`)

### Phase 2: Store Layer (Priority: P2)
**Tasks**: 2.1-2.2

2.1. Create alignment toolbar store (`src/stores/alignmentToolbarStore.ts`)
2.2. Add localStorage persistence for docked/floating state

### Phase 3: UI Components (Priority: P1)
**Tasks**: 3.1-3.5

3.1. Create alignment icons component (`src/components/AlignmentToolbar/AlignmentIcons.tsx`)
3.2. Create alignment button component (`src/components/AlignmentToolbar/AlignmentButton.tsx`)
3.3. Create alignment toolbar component (`src/components/AlignmentToolbar/AlignmentToolbar.tsx`)
3.4. Add CSS module styles (`src/components/AlignmentToolbar/AlignmentToolbar.module.css`)
3.5. Integrate into MainToolbar (`src/components/MainToolbar/MainToolbar.tsx`)

### Phase 4: Keyboard Shortcuts (Priority: P2)
**Tasks**: 4.1-4.2

4.1. Add alignment shortcuts to useCanvasKeyboard hook
4.2. Add tests for keyboard shortcuts

### Phase 5: Floating Panel (Priority: P3)
**Tasks**: 5.1-5.3

5.1. Implement drag handle for detaching toolbar
5.2. Implement floating panel positioning with @floating-ui/dom
5.3. Implement re-dock functionality

### Phase 6: Integration & Polish (Priority: P1)
**Tasks**: 6.1-6.3

6.1. Integration tests for full workflow
6.2. Accessibility audit and ARIA labels
6.3. Update CLAUDE.md with new utilities

---

## Test Strategy

### Unit Tests (Phase 1)
- `calculateSelectionBounds`: Various selection scenarios
- `calculateParentBounds`: Root vs non-root views
- `alignViews`: All 6 alignment types, multi-select, single-select
- `distributeViews`: 3+ views, edge cases (2 views, same position)
- History operations: Undo/redo correctness

### Component Tests (Phase 3)
- Button enable/disable based on selection state
- Tooltip display with keyboard shortcuts
- Click handlers trigger correct operations
- Accessibility attributes (aria-label, role)

### Integration Tests (Phase 6)
- Full alignment workflow: select views, click button, verify positions
- Keyboard shortcut triggers alignment
- Undo/redo after alignment
- No history entry when no change occurs

### Test Patterns
- Use `testInRoot()` for store/signal tests
- Use `renderWithProviders()` for component tests
- Mock `documentStore.updateViewOrigin()` to verify calls
- Use `fireEvent.mouseDown/mouseUp` for click tests (not `fireEvent.click`)

---

## Risk Assessment

| Risk | Mitigation |
|------|------------|
| Floating panel z-index conflicts | Use CSS custom property `--z-dropdown` from tokens |
| Performance with many views | Batch DOM updates, limit calculations to selected views |
| Cross-parent alignment edge cases | Use absolute coordinates, document in spec |
| Keyboard shortcut conflicts | Verify Ctrl+Shift+X combos not used elsewhere |

---

## Dependencies

No new dependencies required. Using existing:
- `@floating-ui/dom` (already in package.json)
- Design tokens from `src/styles/tokens.css`

---

## Acceptance Verification

Before marking complete, verify:
1. All FR-xxx requirements in spec.md have passing tests
2. All SC-xxx success criteria measured and documented
3. `npm run lint:css` passes
4. `npm run check` passes
5. `npm run typecheck` passes
6. Coverage >= 80% for new domain code
7. CLAUDE.md updated with new utilities
