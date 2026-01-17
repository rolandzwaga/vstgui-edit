---
description: SolidJS best practices, component patterns, and reactivity guide for building high-performance web applications
allowed-tools: Read
---

# SolidJS Best Practices & Patterns Guide

**SolidJS 1.9.x** — Fine-grained reactivity without Virtual DOM

## Core Philosophy

SolidJS uses **fine-grained reactivity** with direct DOM updates. Components run **once** at creation—only reactive expressions re-execute. This is fundamentally different from React where components re-render on state changes.

---

## Reactivity Primitives

### createSignal — Basic Reactive State

```typescript
const [count, setCount] = createSignal(0);

// Getter is a function - MUST call it to read
console.log(count()); // 0

// Setter updates and notifies subscribers
setCount(1);
setCount(prev => prev + 1); // Functional update
```

**Key Points:**
- Returns `[getter, setter]` tuple (not `[value, setter]` like React)
- Getter is a function—always call it: `count()` not `count`
- Use for primitives and simple objects you replace entirely

### createStore — Complex Nested State

```typescript
const [state, setState] = createStore({
  user: { name: 'Alice', settings: { theme: 'dark' } },
  items: []
});

// Read directly (no function call needed)
console.log(state.user.name);

// Path-based updates for granular reactivity
setState('user', 'name', 'Bob');
setState('items', items => [...items, newItem]);
```

**When to Use:**
| Use Case | Recommended |
|----------|-------------|
| Primitives (string, number, boolean) | `createSignal` |
| Simple objects replaced entirely | `createSignal` |
| Nested objects with granular updates | `createStore` |
| Arrays/lists with item-level reactivity | `createStore` |

### createEffect — Side Effects

```typescript
createEffect(() => {
  // Automatically tracks signals accessed here
  console.log('Count changed:', count());

  onCleanup(() => console.log('Cleaning up'));
});
```

- NO dependency array—tracking is automatic
- Runs after render, before browser paint
- Async code breaks tracking—signals in `setTimeout`/`await` won't subscribe

### createMemo — Cached Derived Values

```typescript
// Only recalculates when dependencies change
const doubled = createMemo(() => count() * 2);
console.log(doubled());
```

**Derived signal vs Memo:**
```typescript
// Derived signal - recalculates on EVERY access
const doubled = () => count() * 2;

// Memo - caches result, only recalculates when deps change
const doubled = createMemo(() => expensive());
```

**Use memo when:** expensive computation, multiple access points, or need reactivity filtering.

*"Use memos as a reactivity filter when you face performance issues; avoid premature optimization."*

---

## Props — The Critical Rules

### NEVER Destructure Props

```typescript
// ❌ WRONG - Breaks reactivity!
function Greeting({ name }) {
  return <h1>Hello {name}</h1>; // Won't update
}

// ✅ CORRECT - Maintains reactivity
function Greeting(props) {
  return <h1>Hello {props.name}</h1>;
}
```

**Why:** Destructuring calls getters outside tracking scope. Props are reactive via Object getters—accessing outside JSX/effects loses subscription.

### splitProps — Safe "Destructuring"

```typescript
function Button(props) {
  const [local, buttonProps] = splitProps(props, ['class', 'children']);
  return (
    <button class={local.class} {...buttonProps}>
      {local.children}
    </button>
  );
}
```

### mergeProps — Default Props

```typescript
function Greeting(props) {
  const merged = mergeProps({ name: 'World' }, props);
  return <h1>Hello {merged.name}</h1>;
}
```

---

## Control Flow Components

### Show — Boolean Conditional

```typescript
<Show when={isLoggedIn()} fallback={<LoginForm />}>
  <Dashboard />
</Show>

// Keyed flow - receives truthy value
<Show when={user()}>
  {(user) => <Profile user={user()} />}
</Show>
```

### For — List Iteration

```typescript
<For each={items()}>
  {(item, index) => (
    <div>{index()}: {item.name}</div>
  )}
</For>
```

- `index` is a signal (call it: `index()`)
- Items are values, not signals

### Switch/Match — Multiple Conditions

```typescript
<Switch fallback={<DefaultView />}>
  <Match when={state() === 'loading'}><Loading /></Match>
  <Match when={state() === 'error'}><Error /></Match>
  <Match when={state() === 'success'}><Success /></Match>
</Switch>
```

### For vs Index

| Component | Items | Indices | Use When |
|-----------|-------|---------|----------|
| `<For>` | values | signals | Stable item identity |
| `<Index>` | signals | numbers | Order matters more |

---

## Lifecycle

### onMount — Run Once After Render

```typescript
onMount(() => {
  console.log('Component mounted');
  initializeLibrary(ref);
});
```

### onCleanup — Cleanup on Disposal

```typescript
// At component level - runs on unmount
onCleanup(() => subscription.unsubscribe());

// Inside effect - runs before re-execution AND on unmount
createEffect(() => {
  window.addEventListener('resize', handler);
  onCleanup(() => window.removeEventListener('resize', handler));
});
```

---

## Performance Utilities

### batch — Group Updates

```typescript
// Without batch: 3 separate updates
setA(1); setB(2); setC(3);

// With batch: single update
batch(() => { setA(1); setB(2); setC(3); });
```

Solid auto-batches inside effects and event handlers. Use `batch` for async callbacks.

### untrack — Prevent Tracking

```typescript
createEffect(() => {
  const a = signalA();           // Tracked
  const b = untrack(() => signalB()); // NOT tracked
  // Only re-runs when signalA changes
});
```

---

## Refs

```typescript
let inputRef: HTMLInputElement;

onMount(() => inputRef.focus());

<input ref={inputRef} />

// Or callback ref
<input ref={(el) => { inputRef = el; }} />
```

---

## Common Pitfalls

| Pitfall | Wrong | Right |
|---------|-------|-------|
| Destructuring props | `function C({ name })` | `function C(props)` |
| Forgetting getter call | `if (count === 5)` | `if (count() === 5)` |
| Signal outside tracking | `const x = props.x;` | Access in JSX/effect |
| Async breaks tracking | `await; use(signal())` | Capture before await |
| Store mutation copies | `createStore(props.data)` | Deep clone if needed |

See [pitfalls.md](pitfalls.md) for detailed examples.

---

## Quick Reference

| Task | Solution |
|------|----------|
| Simple state | `const [val, setVal] = createSignal(init)` |
| Complex state | `const [state, setState] = createStore({})` |
| Derived (simple) | `const derived = () => signal() * 2` |
| Derived (cached) | `const derived = createMemo(() => ...)` |
| Side effect | `createEffect(() => { /* tracked */ })` |
| One-time setup | `onMount(() => { ... })` |
| Cleanup | `onCleanup(() => { ... })` |
| Default props | `mergeProps(defaults, props)` |
| Split props | `splitProps(props, ['a', 'b'])` |
| Conditional | `<Show when={} fallback={}>` |
| List | `<For each={}>{item => ...}</For>` |
| Multi-condition | `<Switch><Match when={}>` |
| Batch updates | `batch(() => { ... })` |
| Skip tracking | `untrack(() => signal())` |
| DOM ref | `<div ref={el}>` |

---

## Additional References

- [patterns.md](patterns.md) — Component patterns, children, slots, TypeScript
- [async-context.md](async-context.md) — Context, ErrorBoundary, Suspense, createResource
- [pitfalls.md](pitfalls.md) — Detailed anti-patterns with examples

---

## Architecture Guidelines

1. **Components run once** — reactive logic goes in JSX or effects
2. **Prefer derived signals** — less code, clearer intent than effects
3. **Stores for nested state** — fine-grained updates without replacing objects
4. **Context for DI** — avoid prop drilling, enable testing
5. **Colocate state** — keep state close to where it's used
6. **Avoid premature memoization** — derived signals often suffice
