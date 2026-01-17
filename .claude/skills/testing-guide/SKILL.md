---
description: Testing guide for VSTGUI-Edit project with Vitest 4.x and SolidJS patterns
---

# VSTGUI-Edit Testing Guide

**Vitest 4.x + @solidjs/testing-library 0.8.10**

## Core Principles

1. Test behavior, not implementation
2. Use helpers from `src/__tests__/helpers`
3. Wrap signal/store tests in `testInRoot()`
4. Flush microtasks with fake timers
5. Cleanup order: `vi.useRealTimers()` → `cleanup()`
6. One test = one behavior
7. Tests shouldn't change unless requirements change
8. Test public APIs, not internals

## Helpers

```typescript
// Full import (loads @solidjs/router)
import { renderWithProviders, testInRoot, useMockDate, createMockView } from '../helpers';

// Direct imports (avoids router)
import { testInRoot } from '../helpers/solidjs';
import { useMockDate, flushMicrotasks } from '../helpers/time';
import { createMockView, createMockDocument } from '../helpers/fixtures';
```

**`renderWithProviders(component, options?)`** — Renders with MemoryRouter. Options: `withRouter` (default: true), `initialRoute` (default: '/').

**`testInRoot(testFn)`** — Wraps in `createRoot()` with auto-disposal. Required for SolidJS reactivity.

**`useMockDate(dateString)`** — Fake timers with date, auto-cleans.

```typescript
// renderWithProviders
const { getByText } = renderWithProviders(() => <Editor />, { initialRoute: '/editor' });

// testInRoot
testInRoot(() => {
  const [count, setCount] = createSignal(0);
  setCount(1);
  expect(count()).toBe(1);
});

// useMockDate
describe('tests', () => {
  useMockDate('2025-01-15T12:00:00Z');
  test('uses mocked date', () => { /* ... */ });
});
```

## SolidJS Patterns

```typescript
// Components & Events
const user = userEvent.setup();
render(() => <Button onClick={onClick}>Click</Button>);
await user.click(screen.getByRole('button'));

// Effects
test('effect', () => testEffect(done => {
  const [value, setValue] = createSignal(0);
  createEffect((run: number = 0) => {
    if (run === 0) setValue(1);
    else { expect(value()).toBe(1); done(); }
    return run + 1;
  });
}));

// Context
renderWithProviders(() => <Consumer />, {
  wrapper: (props) => <MyContext.Provider value="test">{props.children}</MyContext.Provider>
});

// Directives
const { setArg } = renderDirective(myDirective, { initialValue: false, targetElement });

// Forms - use BOTH for SolidJS reactivity
fireEvent.input(input, { target: { value: 'test' } });
fireEvent.change(input, { target: { value: 'test' } });
```

## Router Testing

```typescript
// Route params
renderWithProviders(() => <ViewDetail />, { initialRoute: '/editor/view-001' });

// Mock useNavigate (must be module-level)
const mockNavigate = vi.fn();
vi.mock('@solidjs/router', async () => ({
  ...(await vi.importActual<typeof import('@solidjs/router')>('@solidjs/router')),
  useNavigate: vi.fn(() => mockNavigate),
}));
beforeEach(() => mockNavigate.mockClear());
```

## Fake Timers

SolidJS uses `queueMicrotask` for effects. Fake timers only control macrotasks. Flush microtasks explicitly.

```typescript
beforeEach(() => vi.useFakeTimers());
afterEach(() => { vi.useRealTimers(); cleanup(); }); // Order matters!

test('debounce', async () => {
  render(() => <SearchInput />);
  await user.type(screen.getByRole('textbox'), 'test');
  await Promise.resolve();                // Flush BEFORE
  await vi.advanceTimersByTimeAsync(300);
  await Promise.resolve();                // Flush AFTER
  expect(mockFn).toHaveBeenCalled();
});

// Avoid faking queueMicrotask
vi.useFakeTimers({ toFake: ['setTimeout', 'setInterval', 'clearTimeout', 'clearInterval'] });
```

## Framework Anti-Patterns

| Bad | Good |
|-----|------|
| Manual `<Router>` | `renderWithProviders()` |
| Manual `createRoot(dispose => ...)` | `testInRoot()` |
| `advanceTimersByTimeAsync()` alone | Wrap with `await Promise.resolve()` |
| `cleanup()` before `useRealTimers()` | `useRealTimers()` then `cleanup()` |
| `advanceTimersByTime()` with async | `advanceTimersByTimeAsync()` |

---

## Test Smells (Universal)

### Tautological Test
Test mirrors implementation—can never fail.

```typescript
// ❌ Expected calculated same as impl
const expected = quantity * unitPrice;
expect(calculatePrice(quantity, unitPrice)).toBe(expected);

// ✅ Known values
expect(calculatePrice(5, 10)).toBe(50);
```

### Placebo Test
Proves nothing, appeases coverage.

```typescript
// ❌ Tests existence
render(() => <PaymentForm />);
expect(document.body).toBeDefined();

// ❌ Never triggers behavior
render(() => <Button onClick={handler} />);
expect(handler).toBeDefined(); // Never clicked!

// ✅ Tests behavior
await user.click(screen.getByRole('button', { name: 'Pay' }));
expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ cardNumber: '4242...' }));
```

### Liar (False Positive)
Always passes regardless of correctness.

```typescript
// ❌ Same reference
expect(transform(input)).toBe(input);

// ❌ No assertion (Secret Catcher)
processOrder({ items: [] });

// ❌ Dead code path
if (result.valid) expect(result.errors).toHaveLength(0);
// Passes when result.valid is false!

// ✅ Explicit assertions
expect(validate('')).toEqual({ valid: false, errors: ['Required'] });
```

### Mockery (Over-Mocking)
Testing mocks, not code.

```typescript
// ❌ All dependencies mocked
const mockDb = { save: vi.fn().mockResolvedValue({ id: 1 }) };
expect(mockDb.save).toHaveBeenCalled(); // So what?

// ✅ Real collaborators
const db = createTestDatabase();
const saved = await db.findById(user.id);
expect(saved.name).toBe('Test');
```

**Mock**: External services, non-deterministic (time), expensive ops.
**Never mock**: Thing under test, value objects, pure functions.

### Brittle Test
Coupled to implementation, breaks on refactor.

```typescript
// ❌ Internal state
expect(cart._items).toHaveLength(1);
expect(spy).toHaveBeenCalledBefore(saveSpy);

// ✅ Observable behavior
expect(cart.itemCount).toBe(1);
expect(cart.total).toBe(10);
```

### Assertion Roulette
Multiple assertions, unclear which failed.

```typescript
// ❌ Which failed?
expect(user.id).toBeDefined();
expect(user.name).toBe('Test');
expect(user.email).toBe('test@test.com');

// ✅ Grouped or separated
expect(user).toMatchObject({ id: expect.any(String), name: 'Test' });
```

### Giant
Excessive setup obscures test.

```typescript
// ❌ 50 lines setup, 2 lines test
const store = createStore(); const user = createUser({...}); // ...40 more lines
expect(total).toBe(270);

// ✅ Minimal relevant setup
const cart = createTestCart({ subtotal: 300 });
expect(calculateTotal(cart, goldUser)).toBe(270);
```

### Free Rider
Multiple behaviors in one test.

```typescript
// ❌ Tests create, update, AND delete
const user = await service.create({...});
const updated = await service.update(user.id, {...});
await service.delete(user.id);

// ✅ Separate tests
test('creates user', ...);
test('updates user', ...);
test('deletes user', ...);
```

### Flaky Test
Random pass/fail. Causes: real time, race conditions, shared state, order-dependent, network.

```typescript
// ❌ Real timer
await new Promise(r => setTimeout(r, 300));

// ✅ Fake timer
vi.useFakeTimers();
await vi.advanceTimersByTimeAsync(300);
```

### Coverage Junkie
Metrics over meaning. Signs: arbitrary mandates, testing trivial code, splitting functions for metrics.

```typescript
// ❌ Tests JS works
expect(new User('Test').name).toBe('Test');
// ❌ Tests getter/setter
expect(config.getDebug()).toBe(true);
```

---

## Testing Pyramid

~70% unit (fast, isolated) → ~20% integration (component interactions) → ~10% E2E (full flows).

**Ice Cream Cone anti-pattern**: Inverted—lots of manual/E2E, few unit tests. Problems: slow feedback, expensive, doesn't scale, brittle.

---

## Quick Reference

| Task | Solution |
|------|----------|
| Render component | `renderWithProviders(() => <C />)` |
| Test signals/stores | `testInRoot(() => {...})` |
| Mock dates | `useMockDate('2025-01-15T12:00:00Z')` |
| Test effects | `testEffect(done => { createEffect(...); done(); })` |
| Test directives | `renderDirective(directive, { initialValue, targetElement })` |
| Mock useNavigate | Module-level `vi.mock('@solidjs/router', ...)` |
| Flush microtasks | `await Promise.resolve()` |
| Form input | `fireEvent.input()` + `fireEvent.change()` |

---

## Good Test Checklist

| Property | Meaning |
|----------|---------|
| Trustworthy | Fail = bug, pass = works |
| Maintainable | Easy to change with requirements |
| Fast | Milliseconds |
| Isolated | No external state |
| Deterministic | Same result every time |
| Readable | Clear intent |
| Valuable | Tests user behavior |

**Before commit**: Can fail? Clear on failure? Survives refactor? Documents requirement? Saw it fail first?

```
□ No tautological assertions
□ All assertions reachable
□ Tests behavior, not impl
□ Minimal mocks
□ Single purpose
□ Descriptive names
□ No flaky tests
□ Minimal setup
□ No order dependencies
□ Red-green verified
```
