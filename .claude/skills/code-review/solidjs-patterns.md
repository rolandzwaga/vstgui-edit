# SolidJS Patterns Reference

Comprehensive guide to SolidJS best practices and anti-patterns for code review.

## Core Reactivity Rules

### 1. Components Execute Once

Unlike React, SolidJS components are **functions that run once**. Only reactive expressions (signals, memos, effects) re-execute when dependencies change.

```typescript
// This logs ONCE, not on every count change
function Counter() {
  console.log('Component created'); // Runs once
  const [count, setCount] = createSignal(0);

  return <div>{count()}</div>; // JSX re-evaluates
}
```

### 2. Signals Are Getters

Signals return getter functions. You must **call them** to read the value.

```typescript
// BAD: Passes the signal function, not the value
<Display value={count} />

// GOOD: Calls the signal to get current value
<Display value={count()} />
```

### 3. Never Destructure Props

Destructuring breaks the reactive proxy chain. Props must be accessed via the props object.

```typescript
// BAD: Breaks reactivity - values captured at call time
function Button({ label, onClick }: ButtonProps) {
  return <button onClick={onClick}>{label}</button>;
}

// GOOD: Maintains reactive tracking
function Button(props: ButtonProps) {
  return <button onClick={props.onClick}>{props.label}</button>;
}

// GOOD: Use splitProps if you need to separate props
function Button(props: ButtonProps) {
  const [local, others] = splitProps(props, ['label']);
  return <button {...others}>{local.label}</button>;
}
```

### 4. Reactive Wrappers for Derived Values

Values derived from signals must be wrapped in functions or memos to stay reactive.

```typescript
// BAD: Computed once, never updates
const doubled = count() * 2;

// GOOD: Function wrapper - recomputes on access
const doubled = () => count() * 2;

// GOOD: Memoized - caches until dependency changes
const doubled = createMemo(() => count() * 2);
```

**When to use which:**
- Simple derivation: `() => ...` function
- Expensive computation: `createMemo(() => ...)`
- Side effects: `createEffect(() => ...)`

---

## Control Flow Components

### Prefer `<Show>` Over Conditionals

```typescript
// BAD: JavaScript conditional
<>{isOpen() && <Modal />}</>

// GOOD: Control flow component
<Show when={isOpen()}>
  <Modal />
</Show>

// GOOD: With fallback
<Show when={user()} fallback={<LoginPrompt />}>
  {(u) => <Profile user={u()} />}
</Show>
```

### Prefer `<For>` Over `.map()`

```typescript
// BAD: Recreates all items on any change
{items().map(item => <Item item={item} />)}

// GOOD: Preserves item identity, updates minimally
<For each={items()}>
  {(item, index) => <Item item={item} index={index()} />}
</For>

// NOTE: index is a signal in <For>, call it: index()
```

### Use `<Switch>/<Match>` for Multiple Conditions

```typescript
// BAD: Nested ternaries
{status() === 'loading'
  ? <Spinner />
  : status() === 'error'
    ? <Error />
    : <Content />}

// GOOD: Clear intent
<Switch fallback={<Content />}>
  <Match when={status() === 'loading'}>
    <Spinner />
  </Match>
  <Match when={status() === 'error'}>
    <Error />
  </Match>
</Switch>
```

---

## Effects Anti-Patterns

### Never Use Effects for Derived State

```typescript
// BAD: Creates sync loop, hides relationship
const [firstName, setFirstName] = createSignal('John');
const [lastName, setLastName] = createSignal('Doe');
const [fullName, setFullName] = createSignal('');

createEffect(() => {
  setFullName(`${firstName()} ${lastName()}`);
});

// GOOD: Explicit derivation
const fullName = () => `${firstName()} ${lastName()}`;
```

### Never Use Effects for Data Fetching

```typescript
// BAD: No loading state, race conditions, runs after render
createEffect(async () => {
  const data = await fetch('/api/posts').then(r => r.json());
  setPosts(data);
});

// GOOD: Proper resource with Suspense integration
const [posts] = createResource(fetchPosts);

// Usage with loading/error states
<Show when={!posts.loading} fallback={<Spinner />}>
  <Show when={!posts.error} fallback={<Error />}>
    <PostList posts={posts()} />
  </Show>
</Show>
```

### Never Set Signals Inside Effects That Read Them

```typescript
// BAD: Infinite loop
createEffect(() => {
  setCount(count() + 1); // Reads and writes same signal
});

// If you need to react to changes, use on() helper
createEffect(on(count, (value) => {
  console.log('Count changed to:', value);
}, { defer: true }));
```

### Async Code Breaks Tracking

```typescript
// BAD: count() called after async boundary
createEffect(() => {
  setTimeout(() => {
    console.log(count()); // Not tracked!
  }, 1000);
});

// GOOD: Capture value before async
createEffect(() => {
  const current = count(); // Tracked
  setTimeout(() => {
    console.log(current); // Uses captured value
  }, 1000);
});
```

### Valid Effect Use Cases

Effects are appropriate for:
- DOM manipulation (refs, third-party libraries)
- Subscriptions to external sources
- Logging and analytics
- Synchronizing with external systems

```typescript
// GOOD: External integration
createEffect(() => {
  thirdPartyChart.update(data());
});

// GOOD: Cleanup with onCleanup
createEffect(() => {
  const subscription = eventSource.subscribe(handler);
  onCleanup(() => subscription.unsubscribe());
});
```

---

## Stores for Complex State

### When to Use Stores

- Nested objects with multiple levels
- Arrays of objects
- State shared across components
- Fine-grained updates to deep properties

```typescript
// BAD: Signal forces full replacement
const [board, setBoard] = createSignal({
  boards: ['Board 1'],
  notes: ['Note 1'],
});

// Must replace entire object
setBoard({
  ...board(),
  notes: [...board().notes, 'Note 2'],
});

// GOOD: Store allows surgical updates
const [board, setBoard] = createStore({
  boards: ['Board 1'],
  notes: ['Note 1'],
});

// Update only what changed
setBoard('notes', notes => [...notes, 'Note 2']);
// Or use produce for complex mutations
setBoard(produce(state => {
  state.notes.push('Note 2');
}));
```

### Store Tracking Granularity

```typescript
const [store, setStore] = createStore({
  todos: [
    { id: 1, text: 'Learn Solid', done: false }
  ]
});

// BAD: Tracks entire todos array
createEffect(() => {
  console.log(store.todos); // Re-runs on ANY todo change
});

// GOOD: Track specific item
createEffect(() => {
  console.log(store.todos[0].done); // Only this property
});
```

---

## Resource Patterns

### Basic Resource Usage

```typescript
// Simple fetch
const [user] = createResource(() => fetchUser(userId()));

// With source signal (refetches when userId changes)
const [user] = createResource(userId, fetchUser);

// Destructure for more control
const [user, { refetch, mutate }] = createResource(fetchUser);
```

### Resource States

```typescript
function UserProfile() {
  const [user] = createResource(fetchUser);

  return (
    <Switch>
      <Match when={user.loading}>
        <Skeleton />
      </Match>
      <Match when={user.error}>
        <ErrorMessage error={user.error} />
      </Match>
      <Match when={user()}>
        {(u) => <Profile user={u()} />}
      </Match>
    </Switch>
  );
}
```

---

## Cleanup and Memory Management

### Always Clean Up Side Effects

```typescript
// BAD: Memory leak
function Component() {
  const handler = () => console.log('resize');
  window.addEventListener('resize', handler);
  // Never removed!
}

// GOOD: Proper cleanup
function Component() {
  onMount(() => {
    const handler = () => console.log('resize');
    window.addEventListener('resize', handler);
    onCleanup(() => window.removeEventListener('resize', handler));
  });
}
```

### Cleanup in Effects

```typescript
createEffect(() => {
  const interval = setInterval(() => {
    setCount(c => c + 1);
  }, 1000);

  onCleanup(() => clearInterval(interval));
});
```

---

## Context Patterns

### Provider Setup

```typescript
// Define context with types
interface ThemeContextValue {
  theme: Accessor<string>;
  setTheme: Setter<string>;
}

const ThemeContext = createContext<ThemeContextValue>();

// Provider component
function ThemeProvider(props: ParentProps) {
  const [theme, setTheme] = createSignal('light');

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {props.children}
    </ThemeContext.Provider>
  );
}

// Consumer hook with type safety
function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}
```

---

## SolidStart Patterns

### Preload Without Await

```typescript
// BAD: Blocks navigation
export const route = {
  preload: async () => await getPosts(), // Don't await!
};

// GOOD: Fire and forget, warms cache
export const route = {
  preload: () => getPosts(),
} satisfies RouteDefinition;
```

### Query and Action Pattern

```typescript
// Query for reads
const getPosts = query(async () => {
  'use server';
  return await db.posts.findMany();
}, 'posts');

// Action for mutations
const createPost = action(async (formData: FormData) => {
  'use server';
  await db.posts.create({ data: { title: formData.get('title') } });
  throw redirect('/posts'); // Revalidates on redirect
}, 'createPost');
```

---

## Common Mistakes Checklist

| Mistake | Symptom | Fix |
|---------|---------|-----|
| Destructured props | Component doesn't update | Access via `props.x` |
| Signal not called | Displays `[Function]` | Call it: `signal()` |
| Effect for derivation | Unnecessary re-renders | Use `createMemo` |
| Missing cleanup | Memory leaks | Add `onCleanup` |
| Async in effect | Lost tracking | Capture values first |
| map() instead of For | Full list re-render | Use `<For>` |
| Conditional && | Hidden edge cases | Use `<Show>` |

---

## Sources

- [SolidJS Docs - createEffect](https://docs.solidjs.com/reference/basic-reactivity/create-effect)
- [SolidJS Docs - Fine-grained Reactivity](https://docs.solidjs.com/advanced-concepts/fine-grained-reactivity)
- [Brenelz - Solid.js Best Practices](https://www.brenelz.com/posts/solid-js-best-practices/)
- [ProjectRules - SolidJS Guide](https://www.projectrules.ai/rules/solidjs)
