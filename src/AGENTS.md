# Source Directory Guidelines

## For Test Files (*.spec.ts, *.spec.tsx, __tests__/*)

**REQUIRED READING**: Before creating or modifying any test file, you MUST read (when its not already in context) and follow:
- [specs/TESTING-GUIDE.md](../specs/TESTING-GUIDE.md)

Key requirements from the testing guide:
- Use `testInRoot()` for signal/store tests (wraps in reactive root)
- Use `renderWithProviders()` for component tests (includes MemoryRouter)
- Always flush microtasks with `await Promise.resolve()` before/after `vi.advanceTimersByTimeAsync()`
- Cleanup order matters: `vi.useRealTimers()` THEN `cleanup()`
- Use `fireEvent.input()` + `fireEvent.change()` for form inputs in SolidJS
- Selection tests must use `fireEvent.mouseDown()` + `fireEvent.mouseUp()`, NOT `fireEvent.click()`

Import helpers from:
```typescript
import { renderWithProviders, testInRoot } from '../helpers';
// Or directly to avoid router loading:
import { testInRoot } from '../helpers/solidjs';
import { flushMicrotasks } from '../helpers/time';
import { createMockView, createMockDocument } from '../helpers/fixtures';
```

## For Components (*.tsx outside __tests__)

- Every component uses CSS Modules (`ComponentName.module.css`)
- Props interface named `[ComponentName]Props`
- Export as named exports, not default
- Use SolidJS primitives only: `createSignal`, `createEffect`, `createMemo`
- Never destructure props (breaks reactivity)
- Co-locate tests in adjacent `__tests__/` directory

## For Stores (stores/*.ts)

- Follow the existing store patterns in `documentStore.ts`, `canvasStore.ts`
- Export both the store object and individual action functions
- Include a `reset[StoreName]()` function for testing
- Use `createStore` from `solid-js/store` for complex nested state

## For Domain Logic (domain/**/*.ts)

- Pure functions only, no side effects
- No direct store imports (pass dependencies as parameters)
- Full test coverage required
- Co-locate tests in adjacent `__tests__/` directory
