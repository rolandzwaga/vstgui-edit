# SolidJS Common Pitfalls & Anti-Patterns

## 1. Destructuring Props

**The most common mistake.** Breaks reactivity completely.

```typescript
// ❌ WRONG - Component won't update when name changes
function Greeting({ name, color }) {
  return <h1 style={{ color }}>Hello {name}</h1>;
}

// ✅ CORRECT
function Greeting(props) {
  return <h1 style={{ color: props.color }}>Hello {props.name}</h1>;
}

// ✅ ALSO CORRECT - using splitProps
function Greeting(props) {
  const [local, rest] = splitProps(props, ['name', 'color']);
  return <h1 style={{ color: local.color }}>Hello {local.name}</h1>;
}
```

**Why:** Props are reactive via getters. Destructuring calls getters at component creation (outside tracking scope), capturing static values.

---

## 2. Forgetting Signal is a Function

```typescript
const [count, setCount] = createSignal(0);

// ❌ Comparing functions - always false!
if (count === 5) { /* never runs */ }

// ❌ Passing function reference, not value
<span>{count}</span>  // Shows "[Function]"

// ✅ Call the getter
if (count() === 5) { /* works */ }
<span>{count()}</span>
```

---

## 3. Accessing Signals Outside Tracking Scope

```typescript
// ❌ Only captures initial value
function Counter(props) {
  const currentCount = props.count; // Called once!

  createEffect(() => {
    console.log(currentCount); // Never updates
  });

  return <span>{currentCount}</span>; // Static forever
}

// ✅ Access inside tracking scope
function Counter(props) {
  createEffect(() => {
    console.log(props.count); // Updates when count changes
  });

  return <span>{props.count}</span>; // Reactive
}
```

---

## 4. Async Code Breaks Tracking

Tracking only works synchronously. After `await`, you're outside the tracking scope.

```typescript
// ❌ Signal access after await is NOT tracked
createEffect(async () => {
  await someAsyncOperation();
  console.log(count()); // Not tracked! Effect won't re-run
});

// ✅ Capture values before async
createEffect(() => {
  const currentCount = count(); // Tracked here

  (async () => {
    await someAsyncOperation();
    console.log(currentCount); // Uses captured value
  })();
});

// ✅ Or use createResource for async data
const [data] = createResource(count, async (c) => {
  return await fetchData(c);
});
```

---

## 5. Store Mutations Affect Original

Stores use proxies. Creating a store from props doesn't clone—it references.

```typescript
// ❌ This modifies the original store!
function Editor(props) {
  const [local, setLocal] = createStore(props.data);
  setLocal('name', 'Changed'); // Mutates props.data too!
}

// ✅ Deep clone if you need independence
import { unwrap } from 'solid-js/store';

function Editor(props) {
  const [local, setLocal] = createStore(
    structuredClone(unwrap(props.data))
  );
}
```

---

## 6. Controlled Inputs Differ from React

In React, `<input checked={false} />` prevents user changes. In Solid, it's one-way binding—user can still interact.

```typescript
// ❌ User CAN change this checkbox in Solid!
<input type="checkbox" checked={checked()} />

// ✅ For truly controlled input, handle the event
<input
  type="checkbox"
  checked={checked()}
  onChange={(e) => setChecked(e.target.checked)}
/>

// ✅ For text inputs
<input
  value={text()}
  onInput={(e) => setText(e.target.value)}
/>
```

---

## 7. Using .map() Instead of <For>

```typescript
// ❌ Re-creates all items on any change
<ul>
  {items().map(item => <li>{item.name}</li>)}
</ul>

// ✅ Only updates changed items
<ul>
  <For each={items()}>
    {item => <li>{item.name}</li>}
  </For>
</ul>
```

---

## 8. Directive Import Removal

TypeScript may tree-shake directive imports if only used as `use:`.

```typescript
// ❌ Import may be removed
import { clickOutside } from './directives';

<div use:clickOutside={handler} />

// ✅ Reference the import to prevent removal
import { clickOutside } from './directives';
clickOutside; // Keep import

<div use:clickOutside={handler} />
```

---

## 9. Effects for Derived State

```typescript
// ❌ Unnecessary effect
const [count, setCount] = createSignal(0);
const [doubled, setDoubled] = createSignal(0);

createEffect(() => {
  setDoubled(count() * 2);
});

// ✅ Just derive it
const doubled = () => count() * 2;

// ✅ Or memo if expensive
const doubled = createMemo(() => expensiveCalc(count()));
```

---

## 10. Multiple Children Accesses

```typescript
// ❌ Children created twice!
function Bad(props) {
  console.log(props.children); // Creates children
  return <div>{props.children}</div>; // Creates again!
}

// ✅ Use children helper
function Good(props) {
  const resolved = children(() => props.children);
  console.log(resolved());
  return <div>{resolved()}</div>;
}
```
