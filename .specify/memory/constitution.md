# VSTGUI-Edit Project Constitution

**Version**: 1.5.0
**Purpose**: Define non-negotiable development principles, standards, and governance for the VSTGUI-Edit project

---

## ⛔️ CRITICAL: THIS IS A SOLIDJS PROJECT - NOT REACT ⛔️

```
╔══════════════════════════════════════════════════════════════════════════════╗
║                                                                              ║
║   ██████╗ ██████╗ ██╗     ██╗██████╗      ██╗███████╗    ██████╗ ███╗   ██╗██╗  ██╗   ██╗║
║  ██╔════╝██╔═══██╗██║     ██║██╔══██╗     ██║██╔════╝   ██╔═══██╗████╗  ██║██║  ╚██╗ ██╔╝║
║  ╚█████╗ ██║   ██║██║     ██║██║  ██║     ██║███████╗   ██║   ██║██╔██╗ ██║██║   ╚████╔╝ ║
║   ╚═══██╗██║   ██║██║     ██║██║  ██║██   ██║╚════██║   ██║   ██║██║╚██╗██║██║    ╚██╔╝  ║
║  ██████╔╝╚██████╔╝███████╗██║██████╔╝╚█████╔╝███████║   ╚██████╔╝██║ ╚████║███████╗██║   ║
║  ╚═════╝  ╚═════╝ ╚══════╝╚═╝╚═════╝  ╚════╝ ╚══════╝    ╚═════╝ ╚═╝  ╚═══╝╚══════╝╚═╝   ║
║                                                                              ║
║                     🚫 REACT IS ABSOLUTELY FORBIDDEN 🚫                      ║
║                                                                              ║
║  This project uses SolidJS EXCLUSIVELY. React concepts, patterns, hooks,    ║
║  and imports are STRICTLY PROHIBITED. There are NO exceptions.              ║
║                                                                              ║
║  ❌ NO useState, useEffect, useMemo, useCallback, useRef                    ║
║  ❌ NO import from 'react' or '@types/react'                                ║
║  ❌ NO React component patterns or lifecycle methods                        ║
║  ❌ NO virtual DOM concepts or reconciliation thinking                      ║
║                                                                              ║
║  ✅ USE createSignal, createEffect, createMemo, createResource              ║
║  ✅ USE SolidJS fine-grained reactivity model                               ║
║  ✅ USE solid-js imports ONLY                                               ║
║                                                                              ║
║  VIOLATION OF THIS RULE IS GROUNDS FOR IMMEDIATE CODE REJECTION             ║
║                                                                              ║
╚══════════════════════════════════════════════════════════════════════════════╝
```

---

## Core Principles

### I. Test-First Development (NON-NEGOTIABLE)

**STRICTLY ENFORCED**: Every feature MUST begin with tests before any implementation code is written. No implementation code shall be written without a failing test first.

**What Requires Tests** (must write test FIRST):
- All functions, methods, and business logic
- All components (with executable code)
- All utilities and helpers
- All state management (signals, stores, effects)
- All services and API interactions
- All hooks and composables

**What Does NOT Require Tests**:
- Pure type definitions (`type`, `interface` in type files)
- Configuration files
- Barrel exports (index files with only re-exports)

**Test-First Workflow** (NO EXCEPTIONS):
1. **RED**: Write failing test that describes desired behavior
2. **GREEN**: Write MINIMUM code to pass test
3. **REFACTOR**: Improve while keeping tests green
4. **NEVER**: Write implementation before test exists

**Enforcement**:
- ANY file containing executable code MUST have corresponding `.spec.ts` or `.test.ts` file
- Implementation commits without tests will be rejected in code review
- "I'll add tests later" is NOT acceptable

**Rationale**: Test-first development ensures that every behavior is explicitly defined and verified before implementation, reducing the risk of bugs. Tests written after implementation often miss edge cases and don't drive proper design.

### II. Technology Stack (Non-negotiable)

The following technology choices are mandatory and MUST NOT be substituted without a constitutional amendment:

**Frontend Framework**: SolidJS 1.9.x
- **Build Tool**: Vite 7.x with vite-plugin-solid
- **Routing**: @solidjs/router 0.15.x
- **Language**: TypeScript with strict mode enabled (`"strict": true`)
- **Testing Framework**: Vitest 4.x with @solidjs/testing-library
- **Code Quality Tools**: Biome (linting + formatting), Stylelint (CSS)
- **Icons**: FontAwesome via solid-fontawesome
- **UI Positioning**: @floating-ui/dom

**Architectural Constraints**:
- Use SolidJS reactive primitives: `createSignal`, `createEffect`, `createMemo`, `createStore`
- Components are functions returning JSX (no class components)
- Fine-grained reactivity - avoid unnecessary re-renders
- Prefer signals over stores for simple state
- Use stores for complex nested state

**Rationale**: SolidJS provides excellent performance through fine-grained reactivity without virtual DOM overhead, making it ideal for GUI editing applications.

### III. Security & Compliance First

**CRITICAL**: All development MUST maintain secure coding practices.

- Implement audit logging for sensitive data access and modification
- NEVER log sensitive user information in application logs or console output
- Validate and sanitize ALL user inputs before processing
- Role-based access control (RBAC) enforced at both API and UI layers if applicable
- Session management includes timeout and secure token handling
- All data transmissions use HTTPS in production
- No inline scripts or styles that bypass CSP

**Rationale**: Security vulnerabilities can compromise user data and system integrity.

### IV. Code Quality & Architecture

All code MUST adhere to consistent quality standards:

**Code Quality Enforcement (MANDATORY)**:
- After completing EACH task, run quality checks:
  1. `npx biome check --write .` - Lint and format code
  2. `npx stylelint "**/*.css" --fix` - Lint CSS
  3. `npx tsc --noEmit` - Verify type correctness
- Review all output and manually fix ANY remaining issues
- A task is NOT complete until all checks pass without errors or warnings
- NEVER commit code with unresolved errors

**Architectural Standards**:
- Every feature begins as a standalone, testable module
- Use type system to enforce business rules at compile time
- Avoid `any` type assertions; prefer proper type narrowing
- Keep functions pure and manage side-effects explicitly via `createEffect`
- Minimize shared mutable state; prefer immutable data structures
- Each module MUST have a single, well-defined responsibility

**Rationale**: Consistent code quality prevents technical debt, reduces code review friction, and ensures maintainability.

### V. GUI Editor Domain Requirements

- **Visual Fidelity**: UI must accurately represent underlying data structures
- **Undo/Redo**: All user actions that modify data MUST be undoable
- **Real-time Feedback**: Visual changes reflect immediately upon user interaction
- **Data Integrity**: Editing operations never corrupt underlying data
- **Accessibility**: All interactive elements accessible via keyboard
- **Responsive Layout**: UI adapts to different viewport sizes

**Rationale**: GUI editors require precise control and immediate feedback for effective user experience.

### VI. Testing Standards

Testing is comprehensive and mandatory:

- **Unit Tests**: Required for all business logic, utilities, and pure functions
- **Integration Tests**: Required for workflow orchestration and cross-module interactions
- **Component Tests**: Required for all UI components with user interactions
- **Edge Case Testing**: Test error paths, boundary conditions, and edge cases
- **Isolation**: Mock external dependencies; test modules in isolation
- **Coverage Threshold**: Minimum 80% code coverage for business logic
- **Test Naming**: Use descriptive names (Given-When-Then format preferred)
- **Test Location**: Co-located in a directory named `__tests__` with source files (e.g., `Component.tsx` and `__tests__\Component.spec.tsx`)

**Testing Guide Requirement (MANDATORY)**:
- **BEFORE writing any test**: Verify `specs/TESTING-GUIDE.md` is loaded in context
- The testing guide contains SolidJS-specific patterns (microtask flushing, testInRoot, etc.)
- Failure to follow guide patterns causes subtle test failures and flaky tests
- Every task involving unit tests MUST include explicit verification step

**Coverage Verification (MANDATORY)**:
- **AFTER spec completion**: Run `npx vitest run --coverage`
- **Analyze coverage**: Review and identify files below 80% threshold
- **Implement missing tests**: Write additional tests to achieve 80%
- **Exception process**: If coverage cannot be achieved:
  1. **STOP IMMEDIATELY**
  2. Document specific files/functions that cannot reach threshold
  3. Provide detailed technical justification
  4. Present findings to user and **WAIT for explicit approval**
  5. Only proceed after approval or alternative approach
- **NO EXCEPTIONS** for business logic without user approval

**Test Organization**:
```
src/
├── components/
│   ├── Button/
│   │   ├── Button.tsx
│   │   └── __tests__/
│   │       └── Button.spec.tsx
├── utils/
│   ├── helpers.ts
│   └── __tests__/
│       └── helpers.spec.ts
```

**Rationale**: Comprehensive testing catches bugs before production. Coverage verification ensures no critical code paths are left untested.

### VII. Development Workflow

All development MUST follow Test-First Development:

1. **Red**: Write failing test (BEFORE ANY IMPLEMENTATION)
2. **Green**: Write minimum code to make test pass
3. **Refactor**: Improve code while keeping tests green
4. **Quality Gate**: Run `npx biome check --write .` and `npx tsc --noEmit`
5. **Fix Issues**: Resolve any errors
6. **Commit**: Commit tests and implementation together after all checks pass
7. **Review**: Ensure all tests pass before requesting code review

**Test-First Enforcement**:
- NEVER write implementation code before test exists
- Each commit MUST show test written before implementation
- Every PR MUST include tests for new functionality
- Breaking changes MUST be discussed and approved

**Rationale**: The Red-Green-Refactor cycle ensures disciplined development. Quality enforcement prevents technical debt accumulation.

### VIII. Performance & User Experience

- **Real-time Updates**: Optimize for 60fps during interactions
- **Data Loading**: Lazy load and paginate large datasets
- **Initial Load**: Target < 3 seconds for initial page load
- **Interaction**: Target < 100ms response time for user interactions
- **Perceived Performance**: Show loading states and optimistic updates
- **Bundle Size**: Monitor and minimize bundle size; use code splitting

**Rationale**: GUI editing requires responsive, smooth interactions for productive user experience.

### IX. Accessibility & Usability

Applications must serve diverse users:

- Follow WCAG 2.1 AA standards for ALL UI components
- Ensure keyboard navigation for all interactive elements
- Provide clear, actionable error messages
- Use semantic HTML elements appropriately
- Include ARIA labels where semantic HTML is insufficient
- Ensure color contrast ratios meet WCAG AA requirements (4.5:1)
- Support screen readers and assistive technologies

**Rationale**: Accessibility is both a legal requirement and moral obligation.

### X. Research & Documentation Standards

When researching implementations, accuracy is critical:

- Use official SolidJS documentation: https://www.solidjs.com/docs
- Use official Vitest documentation: https://vitest.dev/
- Use official Vite documentation: https://vite.dev/
- Verify API signatures and patterns against official documentation
- Query documentation BEFORE writing unfamiliar code
- Cross-reference implementation patterns with best practices
- Document discrepancies between documentation and actual behavior

**Rationale**: Outdated or incorrect library usage leads to bugs and technical debt.

### XI. Dependency Management

**CRITICAL**: Dependency changes affect stability, security, and maintainability.

- **DO NOT** automatically install or modify package.json
- **DO NOT** add dependencies without user consultation
- When new dependency is required, **STOP** and discuss first
- **DO NOT** continue until user approval is obtained
- Document dependency requirements in planning phase
- Justify every new dependency with use case and rationale
- Consider alternatives using existing dependencies

**Approval Process**:
1. Identify need during planning
2. Research alternatives
3. Document requirement and justification
4. Present options with pros/cons
5. Wait for explicit approval
6. Proceed only after approval

**Rationale**: Uncontrolled dependency growth leads to version conflicts, security vulnerabilities, and maintenance burden.

### XII. Framework-Specific Restrictions (ABSOLUTE - ZERO TOLERANCE)

## ⛔️⛔️⛔️ THIS IS A SOLIDJS PROJECT - REACT IS FORBIDDEN ⛔️⛔️⛔️

**ABSOLUTE PROHIBITION**: This project uses SolidJS EXCLUSIVELY. React, Vue, Angular, or ANY other framework code is COMPLETELY AND UTTERLY FORBIDDEN. This is not a suggestion - it is an ABSOLUTE REQUIREMENT with ZERO EXCEPTIONS.

### What is FORBIDDEN (will result in IMMEDIATE rejection):

| React Concept | SolidJS Equivalent | Notes |
|---------------|-------------------|-------|
| `useState` | `createSignal` | NEVER use useState |
| `useEffect` | `createEffect` | NEVER use useEffect |
| `useMemo` | `createMemo` | NEVER use useMemo |
| `useCallback` | Not needed (no re-renders) | NEVER use useCallback |
| `useRef` | `let ref` or variables | NEVER use useRef |
| `useContext` | `useContext` (SolidJS version) | Import from solid-js ONLY |
| `useReducer` | `createStore` | NEVER use useReducer |
| `React.memo` | Not needed | NEVER use React.memo |
| `forwardRef` | `ref` prop directly | NEVER use forwardRef |
| Virtual DOM | Fine-grained reactivity | SolidJS has NO virtual DOM |

### FORBIDDEN imports (will NEVER be accepted):
```typescript
// ❌❌❌ ABSOLUTELY FORBIDDEN - NEVER WRITE THESE ❌❌❌
import React from 'react';
import { useState, useEffect } from 'react';
import type { FC, ReactNode } from 'react';
// ❌❌❌ END FORBIDDEN ❌❌❌
```

### REQUIRED imports:
```typescript
// ✅✅✅ ALWAYS USE THESE ✅✅✅
import { createSignal, createEffect, createMemo } from 'solid-js';
import { createStore } from 'solid-js/store';
import type { Component, JSX } from 'solid-js';
// ✅✅✅ END REQUIRED ✅✅✅
```

### Key Differences You MUST Understand:

1. **SolidJS components run ONCE** - not on every render like React
2. **Signals are getter functions** - call `count()` not `count`
3. **No dependency arrays** - SolidJS tracks dependencies automatically
4. **Props are reactive** - destructuring props breaks reactivity
5. **No virtual DOM** - direct DOM manipulation, surgical updates

### When Writing Code:
1. **STOP** before writing any hook-like code
2. **ASK**: "Is this a React pattern or SolidJS pattern?"
3. **VERIFY**: Check SolidJS documentation if uncertain
4. **NEVER GUESS**: Ask user if you're not 100% sure

### Consequences of Violation:
- Code will be **IMMEDIATELY REJECTED**
- PR will be **BLOCKED**
- Offending code must be **COMPLETELY REWRITTEN**
- This is **NON-NEGOTIABLE**

**Rationale**: SolidJS and React have superficially similar syntax but FUNDAMENTALLY DIFFERENT execution models. React re-runs components on every state change; SolidJS runs them once. Mixing patterns causes subtle bugs, broken reactivity, and runtime errors. There is NO scenario where React code is acceptable in this project.

### XIII. Debugging Attempt Limit (NON-NEGOTIABLE)

**CRITICAL**: Limited to **5 attempts** before requiring user consultation.

**The 5-Attempt Rule**:
1. **Attempt 1**: Initial diagnosis and first solution
2. **Attempt 2**: Different approach based on new information
3. **Attempt 3**: Research issue more deeply
4. **Attempt 4**: Try fundamental approach or alternative
5. **Attempt 5**: Document attempts and prepare questions

**After 5 Failed Attempts**:
- **STOP IMMEDIATELY**
- **DOCUMENT** what was tried and why each failed
- **ANALYZE** common patterns across failures
- **FORMULATE** specific questions
- **PRESENT** findings to user
- **WAIT** for user response

**Rationale**: After 5 attempts, problem likely requires different perspective or approach.

### XIV. Concise Communication (NON-NEGOTIABLE)

**CRITICAL**: Respect user's time with brief, technical communication.

**Communication Rules**:
- Keep responses SHORT and TO THE POINT
- Assume senior-level technical knowledge
- NO hand-holding explanations
- NO verbose status updates
- State what you did, not how or why (unless asked)
- Use bullet points for multiple items
- Omit unnecessary pleasantries

**Good Examples**:
- "Updated constitution v1.0.0. Added SolidJS-specific constraints."
- "Fixed TypeScript errors in 3 files. Tests pass."

**Bad Examples**:
- "I've successfully updated the constitution! Let me walk you through..."
- "Perfect! I'm so happy to report that all tests passed..."

**Rationale**: Senior developers don't need explanations of basic operations.

### XV. Styling Architecture

**CSS Modules Approach**:
- Use CSS files co-located with components (`Component.module.css`)
- Import styles: `import styles from './Component.module.css'`
- Reference classes: `class={styles.button}`
- Centralized design tokens in `src/styles/` directory
- Use CSS custom properties for theming

**Stylelint Enforcement**:
- All CSS must pass Stylelint checks
- Use `stylelint-value-no-unknown-custom-properties` for custom property validation
- No magic numbers - use design tokens

**Rationale**: CSS Modules provide scoped styling without runtime overhead, ideal for SolidJS's compilation model.

### XVI. Token Efficiency (NON-NEGOTIABLE)

**CRITICAL**: Token usage is finite. NEVER generate redundant documentation.

**Prohibited**:
- **NEVER** generate test coverage reports in documentation
- **NEVER** copy/paste command output into markdown
- **NEVER** document metrics that can be obtained by running commands
- **NEVER** duplicate machine-readable information

**Required**:
- **ALWAYS** run commands to view output
- **ONLY** document INSIGHTS requiring human interpretation
- **VERIFY** via command output, not documentation

**Rationale**: Machine-readable output wastes tokens. Documentation should add insight, not duplicate tools.

### XVII. Internationalization Standards

**If i18n is Required** (confirm with user before implementing):
- Use established SolidJS i18n solution
- Translation keys follow dot notation: `section.subsection.key`
- All user-facing strings require translation
- Component tests verify translation key usage
- Dictionaries organized by feature/section

**Rationale**: i18n should be planned from the start but only implemented when explicitly required.

### XVIII. Zero Failing Tests Policy (NON-NEGOTIABLE)

**CRITICAL**: EVERY spec delivered with ALL tests passing. ANY failing test is IMMEDIATE problem.

**Absolute Requirements**:
- **ALL tests MUST pass** before spec is complete
- **ALL tests MUST pass** before ANY commit
- **ALL tests MUST pass** in CI/CD before merge
- Failing test is YOUR responsibility to fix immediately
- NO "pre-existing failing tests" - this is impossible

**When Tests Fail**:
1. **STOP** all other work
2. **ANALYZE** the failure
3. **FIX** test or code causing failure
4. **VERIFY** all tests pass
5. If unable to fix after 5 attempts, **CONSULT USER**

**NO Excuses Accepted**:
- "Those failures were already there" → IMPOSSIBLE. Fix them.
- "That's not my code" → IRRELEVANT. Fix it.
- "I'll fix it later" → NO. Fix it NOW.

**Rationale**: Failing tests indicate broken functionality. Every spec is delivered with clean, passing test suite.

### XIX. Domain Knowledge - VSTGUI UIDescription Format (CRITICAL)

**CRITICAL**: This project is a visual editor for VSTGUI `.uidesc` files. Understanding the uidesc format is ESSENTIAL.

**Mandatory Reference**:
- **BEFORE any uidesc-related work**: Consult `UIDESC_GUIDE.md`
- **BEFORE parsing/validation changes**: Understand the complete schema
- **BEFORE UI feature design**: Know the view hierarchy and attributes

**Key Concepts to Understand**:
1. **File Format**: JSON (preferred) and XML (deprecated) formats
2. **Resource Definitions**: Colors, fonts, bitmaps, gradients, control-tags, variables
3. **View Hierarchy**: CView → CViewContainer → Templates
4. **Control Types**: All 30+ view classes and their specific attributes
5. **VST3 Integration**: Control tags, parameter binding, automation

**Schema File**: `vstgui-uidesc.schema.json` - JSON Schema for validation

**Rationale**: This editor must correctly parse, validate, display, and edit uidesc files. Misunderstanding the format leads to data corruption and invalid output.

### XX. Technical Overview Reference (NON-NEGOTIABLE)

**CRITICAL**: ALWAYS consult technical documentation before creating specs/plans/tasks.

**Mandatory Consultation**:
- **BEFORE spec**: Read CLAUDE.md to understand existing architecture
- **BEFORE plan**: Check docs for existing modules/utilities to reuse
- **BEFORE tasks**: Verify docs for implementation patterns
- **AFTER completion**: UPDATE docs with new utilities/patterns

**What to Check**:
- Existing utilities and helpers
- State management patterns (signals, stores)
- Component patterns
- Testing helpers
- Styling patterns
- Service patterns

**Prevention of Duplication**:
- Check if utility already exists before creating new one
- Verify reusable components exist
- Check for existing test helpers

**Update Requirements After Completion**:
- Add new utilities to CLAUDE.md
- Add new patterns to CLAUDE.md
- Update technology stack if changed
- Document architectural decisions

**Rationale**: Code duplication is major source of technical debt. Documentation prevents duplication and promotes reuse.

### XXI. Static Imports ONLY (NON-NEGOTIABLE)

## ⛔️⛔️⛔️ STATIC IMPORTS ONLY - DYNAMIC IMPORTS ARE FORBIDDEN ⛔️⛔️⛔️

```
╔══════════════════════════════════════════════════════════════════════════════╗
║                                                                              ║
║   ███████╗████████╗ █████╗ ████████╗██╗ ██████╗    ██╗███╗   ███╗██████╗    ║
║   ██╔════╝╚══██╔══╝██╔══██╗╚══██╔══╝██║██╔════╝    ██║████╗ ████║██╔══██╗   ║
║   ███████╗   ██║   ███████║   ██║   ██║██║         ██║██╔████╔██║██████╔╝   ║
║   ╚════██║   ██║   ██╔══██║   ██║   ██║██║         ██║██║╚██╔╝██║██╔═══╝    ║
║   ███████║   ██║   ██║  ██║   ██║   ██║╚██████╗    ██║██║ ╚═╝ ██║██║        ║
║   ╚══════╝   ╚═╝   ╚═╝  ╚═╝   ╚═╝   ╚═╝ ╚═════╝    ╚═╝╚═╝     ╚═╝╚═╝        ║
║                                                                              ║
║              🚫 DYNAMIC IMPORTS ARE ABSOLUTELY FORBIDDEN 🚫                  ║
║                                                                              ║
║  ALWAYS use static imports. Dynamic imports (import()) are BANNED except    ║
║  in the ONLY acceptable case: vi.mock() with vi.importActual().             ║
║                                                                              ║
║  ❌ NEVER use: import() for lazy loading                                    ║
║  ❌ NEVER use: import() for code splitting                                  ║
║  ❌ NEVER use: import() for conditional imports                             ║
║  ❌ NEVER use: await import() anywhere in application code                  ║
║                                                                              ║
║  ✅ ALWAYS use: import { x } from 'module' (static imports)                 ║
║  ✅ ONLY exception: vi.importActual() inside vi.mock() in tests             ║
║                                                                              ║
║  VIOLATION = IMMEDIATE CODE REJECTION. NO EXCEPTIONS. ZERO TOLERANCE.       ║
║                                                                              ║
╚══════════════════════════════════════════════════════════════════════════════╝
```

**ABSOLUTE PROHIBITION**: All imports MUST be static `import` statements at the top of files. Dynamic `import()` calls are COMPLETELY FORBIDDEN in application code.

### What is FORBIDDEN (will result in IMMEDIATE rejection):

```typescript
// ❌❌❌ ABSOLUTELY FORBIDDEN - NEVER WRITE THESE ❌❌❌
const module = await import('./module');
const { something } = await import('package');
lazy(() => import('./Component'));
import('./chunk').then(m => m.default);
// ❌❌❌ END FORBIDDEN ❌❌❌
```

### What is REQUIRED:

```typescript
// ✅✅✅ ALWAYS USE THESE ✅✅✅
import { something } from './module';
import { Component } from './Component';
import defaultExport from 'package';
// ✅✅✅ END REQUIRED ✅✅✅
```

### ONLY Acceptable Exception:

```typescript
// ✅ ONLY in test files, inside vi.mock():
vi.mock('./store', async () => {
  const actual = await vi.importActual('./store');
  return { ...actual, mockedFn: vi.fn() };
});
```

**Rationale**: Dynamic imports add complexity, break static analysis, complicate debugging, and are unnecessary for this application's scope. Static imports provide better tree-shaking, clearer dependencies, and simpler mental models. The ONLY case where dynamic imports are acceptable is `vi.importActual()` in test mocks, which is a Vitest requirement.

### XXII. Honest Completion (Anti-Cheating) (NON-NEGOTIABLE)

**CRITICAL**: Features are only complete when ALL requirements are genuinely met.

**Definition of "Done"**:
- ALL acceptance criteria met
- Tests at spec thresholds (not weakened to pass)
- No placeholders or TODOs in deliverables
- Performance targets measured and verified

**Forbidden Patterns**:
- Relaxing test thresholds to pass
- Placeholder values marked "needs proper design"
- Removing scope without explicit declaration
- Saying "tests pass" when tests were weakened
- Claiming completion with unimplemented requirements

**Mandatory Verification**:
Before claiming complete, review EVERY FR-xxx and SC-xxx requirement.
If ANY requirement is not met, the spec is NOT complete.

**Compliance Table Format** (required at spec completion):

| Requirement | Status | Evidence |
|-------------|--------|----------|
| FR-001 | ✅ MET | Test X verifies behavior |
| FR-002 | ❌ NOT MET | Reason why incomplete |
| SC-001 | ✅ MET | Measured at Y ms |

**Enforcement**:
- Spec completion MUST include compliance table
- ALL requirements MUST show ✅ MET status
- Any ❌ NOT MET requires user approval to proceed
- Falsely claiming completion is grounds for full feature rejection

**Rationale**: Honest completion prevents technical debt accumulation, ensures stakeholder trust, and maintains code quality. Shortcuts compound into major problems.

## Technology Stack Requirements

### Mandatory Dependencies

**Production**:
- `solid-js`: ^1.9.10 - Core reactive framework
- `@solidjs/router`: ^0.15.4 - Client-side routing
- `@floating-ui/dom`: ^1.7.4 - Tooltip and popover positioning
- `@fortawesome/free-solid-svg-icons`: ^7.1.0 - Icon library
- `solid-fontawesome`: ^0.2.1 - FontAwesome SolidJS bindings

**Development**:
- `typescript`: ^5.9.3 - Type system
- `vite`: ^7.3.0 - Build tool and dev server
- `vite-plugin-solid`: ^2.11.10 - SolidJS Vite plugin
- `vitest`: ^4.0.16 - Testing framework
- `@solidjs/testing-library`: ^0.8.10 - Component testing utilities
- `@testing-library/user-event`: ^14.6.1 - User interaction simulation
- `jsdom`: ^27.4.0 - DOM environment for tests
- `@biomejs/biome`: ^2.3.11 - Linting and formatting
- `stylelint`: ^16.26.1 - CSS linting
- `stylelint-value-no-unknown-custom-properties`: ^6.1.0 - Custom property validation

### Configuration

**TypeScript** (`tsconfig.json`):
- `"strict": true` - Strict mode required
- `"jsx": "preserve"` - Let Vite handle JSX
- `"jsxImportSource": "solid-js"` - SolidJS JSX

**Biome** (`biome.json`):
- Format and lint on save
- Consistent code style across project

**Stylelint** (`.stylelintrc`):
- Validate custom properties
- Enforce CSS best practices

## Development Workflow

### Feature Development Process

1. **Technical Documentation Consultation**: Read CLAUDE.md
2. **Specification**: Create feature spec using `/speckit.specify`
3. **Planning**: Generate implementation plan using `/speckit.plan`
4. **Clarification**: Use `/speckit.clarify` to resolve underspecified areas
5. **Task Generation**: Generate tasks using `/speckit.tasks`
6. **Test-First Implementation**: For each task:
   - Write failing test(s) first
   - Implement minimum code to pass
   - Refactor while keeping tests green
   - Run quality checks
   - Fix all issues
   - Commit atomically
7. **Coverage Verification**: Verify 80% threshold after spec completion
8. **All Tests Passing**: Ensure ALL tests pass before completion
9. **Update Technical Docs**: Document new utilities/patterns in CLAUDE.md
10. **Review**: Submit PR with all checks passing

### Git Workflow

- **Branch Naming**: `feature/description` or `fix/description`
- **Commit Messages**: Conventional commits format
- **Atomic Commits**: Each commit is complete working unit
- **No Broken Commits**: Never commit failing tests or quality violations
- **PR Requirements**: Include tests, pass CI, meet coverage requirements

### Code Review Standards

All code reviews MUST verify:
- [ ] Tests written BEFORE implementation
- [ ] Every file has corresponding `.spec.ts` or `.test.ts`
- [ ] All tests passing (EVERY SINGLE TEST)
- [ ] Coverage >= 80% for business logic
- [ ] Quality checks pass without errors (`biome check`, `tsc --noEmit`)
- [ ] No React patterns used (SolidJS only)
- [ ] CLAUDE.md consulted and updated
- [ ] No duplicate code
- [ ] No unauthorized dependency changes

## Governance

### Constitutional Authority

This constitution supersedes all other practices. When conflicts arise, this constitution takes precedence.

### Amendment Process

1. **Proposal**: Document change, rationale, impact, migration plan
2. **Review**: Technical lead reviews
3. **Approval**: Requires unanimous approval
4. **Documentation**: Document with version bump
5. **Migration**: Include migration guide for breaking changes

### Versioning Policy

Semantic versioning:
- **MAJOR**: Backward-incompatible changes, principle removals
- **MINOR**: New principles added or expanded
- **PATCH**: Clarifications, wording improvements

### Compliance Verification

**Every Pull Request MUST**:
- Verify adherence to all principles
- Document exceptions with justification
- Pass all automated checks
- Include compliance verification

**Quarterly Reviews**:
- Constitution effectiveness review
- Principle adherence audit
- Technology stack assessment
- Documentation accuracy audit

### Exceptions

Exceptions are **extremely rare** and require:
1. Written justification
2. Risk assessment and mitigation plan
3. Approval from technical lead
4. Time-bound exception with remediation plan
5. Documentation in exceptions log

**Note**: Security/compliance principles and Zero Failing Tests Policy have **NO exceptions**.

---

**Version**: 1.5.0
**Ratified**: 2026-01-05
**Last Amended**: 2026-01-05 (v1.5.0: Added Static Imports ONLY principle - dynamic imports forbidden except vi.importActual)
