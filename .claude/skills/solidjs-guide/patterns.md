# SolidJS Component Patterns

## Children Helper

Use when accessing `props.children` multiple times or manipulating children:

```typescript
import { children } from 'solid-js';

function Wrapper(props) {
  // Resolve children once, memoized
  const resolved = children(() => props.children);

  createEffect(() => {
    console.log('Children:', resolved());
  });

  return <div>{resolved()}</div>;
}
```

**When to use:**
- Accessing `props.children` multiple times
- Manipulating/inspecting children
- Passing children to multiple locations

**When NOT needed:**
- Simply passing `props.children` once in JSX

---

## Component Types (TypeScript)

```typescript
import type {
  Component,
  ParentComponent,
  VoidComponent,
  FlowComponent
} from 'solid-js';

// No children allowed
const Icon: VoidComponent<{ name: string }> = (props) => (
  <svg>{/* ... */}</svg>
);

// Optional children
const Card: ParentComponent<{ title: string }> = (props) => (
  <div>
    <h2>{props.title}</h2>
    {props.children}
  </div>
);

// Required children (render prop pattern)
const List: FlowComponent<{ items: Item[] }, Item> = (props) => (
  <ul>
    <For each={props.items}>
      {item => <li>{props.children(item)}</li>}
    </For>
  </ul>
);

// Generic component
const Button: Component<ButtonProps> = (props) => (
  <button {...props} />
);
```

---

## Slot Pattern

Pass multiple content areas to a component:

```typescript
interface LayoutProps {
  header: JSX.Element;
  sidebar: JSX.Element;
  children: JSX.Element;
}

function Layout(props: LayoutProps) {
  return (
    <div class="layout">
      <header>{props.header}</header>
      <aside>{props.sidebar}</aside>
      <main>{props.children}</main>
    </div>
  );
}

// Usage
<Layout
  header={<NavBar />}
  sidebar={<Menu />}
>
  <Content />
</Layout>
```

---

## Custom Directives (use:)

```typescript
// Define directive
function clickOutside(el: HTMLElement, accessor: () => () => void) {
  const handler = (e: MouseEvent) => {
    if (!el.contains(e.target as Node)) {
      accessor()?.();
    }
  };

  document.addEventListener('click', handler);
  onCleanup(() => document.removeEventListener('click', handler));
}

// TypeScript declaration
declare module 'solid-js' {
  namespace JSX {
    interface Directives {
      clickOutside: () => void;
    }
  }
}

// Usage
<div use:clickOutside={() => setOpen(false)}>
  Modal content
</div>
```

**Caveats:**
- Only works on native elements, not components
- TypeScript may remove unused imports—add `clickOutside;` to prevent

---

## Forwarding Refs

```typescript
import { mergeRefs } from '@solid-primitives/refs';

function Input(props) {
  let localRef: HTMLInputElement;

  return (
    <input
      ref={mergeRefs((el) => { localRef = el; }, props.ref)}
    />
  );
}
```

---

## Render Props Pattern

```typescript
interface TooltipProps {
  content: JSX.Element;
  children: (props: { show: () => void; hide: () => void }) => JSX.Element;
}

function Tooltip(props: TooltipProps) {
  const [visible, setVisible] = createSignal(false);

  return (
    <div class="tooltip-wrapper">
      {props.children({
        show: () => setVisible(true),
        hide: () => setVisible(false),
      })}
      <Show when={visible()}>
        <div class="tooltip">{props.content}</div>
      </Show>
    </div>
  );
}

// Usage
<Tooltip content={<span>Help text</span>}>
  {({ show, hide }) => (
    <button onMouseEnter={show} onMouseLeave={hide}>
      Hover me
    </button>
  )}
</Tooltip>
```

---

## Compound Components

```typescript
const TabsContext = createContext<{
  activeTab: () => string;
  setActiveTab: (id: string) => void;
}>();

function Tabs(props: ParentProps<{ defaultTab: string }>) {
  const [activeTab, setActiveTab] = createSignal(props.defaultTab);

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      <div class="tabs">{props.children}</div>
    </TabsContext.Provider>
  );
}

function Tab(props: ParentProps<{ id: string }>) {
  const ctx = useContext(TabsContext)!;

  return (
    <button
      class="tab"
      classList={{ active: ctx.activeTab() === props.id }}
      onClick={() => ctx.setActiveTab(props.id)}
    >
      {props.children}
    </button>
  );
}

function TabPanel(props: ParentProps<{ id: string }>) {
  const ctx = useContext(TabsContext)!;

  return (
    <Show when={ctx.activeTab() === props.id}>
      <div class="tab-panel">{props.children}</div>
    </Show>
  );
}

// Usage
<Tabs defaultTab="home">
  <Tab id="home">Home</Tab>
  <Tab id="settings">Settings</Tab>
  <TabPanel id="home">Home content</TabPanel>
  <TabPanel id="settings">Settings content</TabPanel>
</Tabs>
```
