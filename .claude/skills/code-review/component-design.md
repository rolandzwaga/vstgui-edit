# Component Design Patterns Reference

Comprehensive guide to robust component architecture, SOLID principles, and anti-patterns for code review.

## SOLID Principles for Components

### Single Responsibility Principle (SRP)

A component should have **one reason to change**.

```typescript
// BAD: Multiple responsibilities
function UserDashboard(props: { userId: string }) {
  const [user, setUser] = createSignal<User | null>(null);
  const [posts, setPosts] = createSignal<Post[]>([]);
  const [isEditing, setIsEditing] = createSignal(false);

  // Fetching logic
  onMount(async () => {
    setUser(await fetchUser(props.userId));
    setPosts(await fetchPosts(props.userId));
  });

  // Form validation logic
  const validateName = (name: string) => { /* ... */ };

  // Render logic for profile, posts, edit form...
  return (
    <div>
      {/* 200 lines of mixed concerns */}
    </div>
  );
}

// GOOD: Separated concerns
function UserDashboard(props: { userId: string }) {
  return (
    <DashboardLayout>
      <UserProfile userId={props.userId} />
      <UserPosts userId={props.userId} />
    </DashboardLayout>
  );
}

function UserProfile(props: { userId: string }) {
  const [user] = createResource(() => props.userId, fetchUser);
  return <ProfileCard user={user()} />;
}

function UserPosts(props: { userId: string }) {
  const [posts] = createResource(() => props.userId, fetchPosts);
  return <PostList posts={posts()} />;
}
```

### Open/Closed Principle (OCP)

Components should be **open for extension, closed for modification**.

```typescript
// BAD: Requires modification for each new variant
function Button(props: { variant: string; label: string }) {
  const getStyles = () => {
    if (props.variant === 'primary') return primaryStyles;
    if (props.variant === 'secondary') return secondaryStyles;
    if (props.variant === 'danger') return dangerStyles;
    // Must edit this for each new variant
  };
  return <button style={getStyles()}>{props.label}</button>;
}

// GOOD: Extended via configuration
interface ButtonProps {
  label: string;
  class?: string;
  style?: JSX.CSSProperties;
}

function Button(props: ButtonProps) {
  return (
    <button class={props.class} style={props.style}>
      {props.label}
    </button>
  );
}

// Create variants by composition
const PrimaryButton = (props: Omit<ButtonProps, 'class'>) => (
  <Button {...props} class={styles.primary} />
);

const DangerButton = (props: Omit<ButtonProps, 'class'>) => (
  <Button {...props} class={styles.danger} />
);
```

### Liskov Substitution Principle (LSP)

Derived components should be substitutable for their base components.

```typescript
// BAD: Specialized button breaks expected behavior
interface ButtonProps {
  onClick: () => void;
  disabled?: boolean;
}

function SubmitButton(props: ButtonProps) {
  return (
    <button
      onClick={() => {
        if (!props.disabled) {
          // Added condition breaks contract
          props.onClick();
        }
      }}
    >
      Submit
    </button>
  );
}

// GOOD: Preserves base behavior
function SubmitButton(props: ButtonProps) {
  return (
    <button
      onClick={props.onClick}
      disabled={props.disabled}
      type="submit"
    >
      Submit
    </button>
  );
}
```

### Interface Segregation Principle (ISP)

Components shouldn't depend on props they don't use.

```typescript
// BAD: Component forced to accept unused props
interface CardProps {
  title: string;
  description: string;
  image: string;
  author: string;
  date: string;
  tags: string[];
  likes: number;
  comments: Comment[];
  onLike: () => void;
  onShare: () => void;
  onComment: (text: string) => void;
}

function SimpleCard(props: CardProps) {
  // Only uses title and description
  return (
    <div>
      <h2>{props.title}</h2>
      <p>{props.description}</p>
    </div>
  );
}

// GOOD: Minimal interface
interface SimpleCardProps {
  title: string;
  description: string;
}

function SimpleCard(props: SimpleCardProps) {
  return (
    <div>
      <h2>{props.title}</h2>
      <p>{props.description}</p>
    </div>
  );
}

// Compose for more complex needs
interface InteractiveCardProps extends SimpleCardProps {
  onLike: () => void;
  likes: number;
}

function InteractiveCard(props: InteractiveCardProps) {
  return (
    <div>
      <SimpleCard title={props.title} description={props.description} />
      <LikeButton count={props.likes} onClick={props.onLike} />
    </div>
  );
}
```

### Dependency Inversion Principle (DIP)

Components should depend on abstractions, not concrete implementations.

```typescript
// BAD: Direct dependency on API implementation
import { api } from '../services/api';

function UserList() {
  const [users] = createResource(api.fetchUsers);
  return <For each={users()}>{user => <UserCard user={user} />}</For>;
}

// GOOD: Dependency injected via props or context
interface UserListProps {
  fetchUsers: () => Promise<User[]>;
}

function UserList(props: UserListProps) {
  const [users] = createResource(props.fetchUsers);
  return <For each={users()}>{user => <UserCard user={user} />}</For>;
}

// Or via context
const ApiContext = createContext<ApiClient>();

function UserList() {
  const api = useContext(ApiContext)!;
  const [users] = createResource(api.fetchUsers);
  return <For each={users()}>{user => <UserCard user={user} />}</For>;
}

// Benefits: Easy to test with mock, easy to swap implementations
```

---

## Composition Patterns

### Composition Over Inheritance

```typescript
// BAD: Inheritance hierarchy
class BaseButton { /* ... */ }
class PrimaryButton extends BaseButton { /* ... */ }
class IconPrimaryButton extends PrimaryButton { /* ... */ }
// Explosion of combinations

// GOOD: Composition
interface ButtonProps {
  variant?: 'primary' | 'secondary';
  icon?: JSX.Element;
  children: JSX.Element;
}

function Button(props: ButtonProps) {
  return (
    <button class={styles[props.variant ?? 'primary']}>
      <Show when={props.icon}>
        <span class={styles.icon}>{props.icon}</span>
      </Show>
      {props.children}
    </button>
  );
}

// Any combination without new components
<Button variant="primary" icon={<SaveIcon />}>Save</Button>
```

### Compound Components

For components that work together with shared implicit state.

```typescript
// Usage
<Tabs defaultValue="tab1">
  <TabsList>
    <TabsTrigger value="tab1">Tab 1</TabsTrigger>
    <TabsTrigger value="tab2">Tab 2</TabsTrigger>
  </TabsList>
  <TabsContent value="tab1">Content 1</TabsContent>
  <TabsContent value="tab2">Content 2</TabsContent>
</Tabs>

// Implementation
interface TabsContextValue {
  value: Accessor<string>;
  setValue: Setter<string>;
}

const TabsContext = createContext<TabsContextValue>();

function Tabs(props: ParentProps<{ defaultValue: string }>) {
  const [value, setValue] = createSignal(props.defaultValue);

  return (
    <TabsContext.Provider value={{ value, setValue }}>
      <div class={styles.tabs}>{props.children}</div>
    </TabsContext.Provider>
  );
}

function TabsTrigger(props: ParentProps<{ value: string }>) {
  const ctx = useContext(TabsContext)!;
  const isActive = () => ctx.value() === props.value;

  return (
    <button
      class={isActive() ? styles.active : ''}
      onClick={() => ctx.setValue(props.value)}
    >
      {props.children}
    </button>
  );
}

function TabsContent(props: ParentProps<{ value: string }>) {
  const ctx = useContext(TabsContext)!;

  return (
    <Show when={ctx.value() === props.value}>
      <div class={styles.content}>{props.children}</div>
    </Show>
  );
}
```

### Render Props / Children as Function

```typescript
// For flexible rendering control
interface ListProps<T> {
  items: T[];
  children: (item: T, index: Accessor<number>) => JSX.Element;
}

function List<T>(props: ListProps<T>) {
  return (
    <ul>
      <For each={props.items}>
        {(item, index) => <li>{props.children(item, index)}</li>}
      </For>
    </ul>
  );
}

// Usage
<List items={users}>
  {(user) => <UserCard user={user} />}
</List>
```

---

## Avoiding Prop Drilling

### Context for Cross-Cutting Concerns

```typescript
// BAD: Drilling through multiple levels
<App theme={theme}>
  <Layout theme={theme}>
    <Sidebar theme={theme}>
      <Menu theme={theme}>
        <MenuItem theme={theme} />

// GOOD: Context
const ThemeContext = createContext<Theme>();

function App() {
  const [theme, setTheme] = createSignal<Theme>('light');

  return (
    <ThemeContext.Provider value={theme()}>
      <Layout>
        <Sidebar />
      </Layout>
    </ThemeContext.Provider>
  );
}

function MenuItem() {
  const theme = useContext(ThemeContext);
  return <div class={styles[theme]}>...</div>;
}
```

### Component Composition (Slots)

```typescript
// BAD: Drilling user down to render
function Layout(props: { user: User; children: JSX.Element }) {
  return (
    <div>
      <Header user={props.user} />
      {props.children}
    </div>
  );
}

// GOOD: Compose instead of drill
interface LayoutProps {
  header: JSX.Element;
  children: JSX.Element;
}

function Layout(props: LayoutProps) {
  return (
    <div>
      {props.header}
      {props.children}
    </div>
  );
}

// Usage - parent controls header content
<Layout header={<Header user={user} />}>
  <MainContent />
</Layout>
```

---

## Component Patterns

### Controlled vs Uncontrolled

```typescript
// Uncontrolled: Internal state
function UncontrolledInput(props: { defaultValue?: string }) {
  const [value, setValue] = createSignal(props.defaultValue ?? '');
  return <input value={value()} onInput={e => setValue(e.target.value)} />;
}

// Controlled: External state
interface ControlledInputProps {
  value: string;
  onChange: (value: string) => void;
}

function ControlledInput(props: ControlledInputProps) {
  return (
    <input
      value={props.value}
      onInput={e => props.onChange(e.currentTarget.value)}
    />
  );
}

// Flexible: Support both modes
interface FlexibleInputProps {
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
}

function FlexibleInput(props: FlexibleInputProps) {
  const isControlled = () => props.value !== undefined;
  const [internalValue, setInternalValue] = createSignal(
    props.defaultValue ?? ''
  );

  const currentValue = () =>
    isControlled() ? props.value! : internalValue();

  const handleChange = (newValue: string) => {
    if (!isControlled()) {
      setInternalValue(newValue);
    }
    props.onChange?.(newValue);
  };

  return (
    <input
      value={currentValue()}
      onInput={e => handleChange(e.currentTarget.value)}
    />
  );
}
```

### Presentational vs Container

```typescript
// Presentational: Pure rendering, no side effects
interface UserCardProps {
  user: User;
  onEdit?: () => void;
}

function UserCard(props: UserCardProps) {
  return (
    <div class={styles.card}>
      <img src={props.user.avatar} alt={props.user.name} />
      <h3>{props.user.name}</h3>
      <Show when={props.onEdit}>
        <button onClick={props.onEdit}>Edit</button>
      </Show>
    </div>
  );
}

// Container: Data fetching and state
function UserCardContainer(props: { userId: string }) {
  const [user] = createResource(() => props.userId, fetchUser);

  const handleEdit = () => {
    // Business logic
  };

  return (
    <Show when={user()} fallback={<UserCardSkeleton />}>
      {u => <UserCard user={u()} onEdit={handleEdit} />}
    </Show>
  );
}
```

---

## Anti-Patterns to Avoid

### God Components

```typescript
// BAD: Does everything
function Dashboard() {
  // 50 lines of state
  // 100 lines of effects
  // 200 lines of handlers
  // 300 lines of JSX
  // Total: 650+ lines
}

// GOOD: Composed from focused components
function Dashboard() {
  return (
    <DashboardLayout>
      <DashboardHeader />
      <DashboardStats />
      <DashboardCharts />
      <DashboardRecentActivity />
    </DashboardLayout>
  );
}
```

### Premature Abstraction

```typescript
// BAD: Abstraction for one use case
function GenericListWithFilteringAndSortingAndPagination<T>(...) {
  // Complex generic that's only used once
}

// GOOD: Start concrete, abstract when patterns emerge
function UserList(props: { users: User[] }) {
  // Simple, focused implementation
}

// Abstract only when you have 3+ similar implementations
```

### Logic in JSX

```typescript
// BAD: Complex logic inline
<div>
  {items.filter(i => i.active && i.date > Date.now() - 86400000)
    .sort((a, b) => b.priority - a.priority)
    .slice(0, 5)
    .map(item => <Item key={item.id} item={item} />)}
</div>

// GOOD: Extract to derived values
const recentActiveItems = createMemo(() =>
  items()
    .filter(i => i.active && isRecent(i.date))
    .sort(byPriorityDesc)
    .slice(0, 5)
);

<div>
  <For each={recentActiveItems()}>{item => <Item item={item} />}</For>
</div>
```

### Inconsistent Prop Naming

```typescript
// BAD: Inconsistent conventions
<Button onclick={...} />        // lowercase
<Input handleChange={...} />    // "handle" prefix
<Modal onclose={...} />         // lowercase
<Form submitHandler={...} />    // "Handler" suffix

// GOOD: Consistent onAction pattern
<Button onClick={...} />
<Input onChange={...} />
<Modal onClose={...} />
<Form onSubmit={...} />
```

---

## Testing Considerations

### Testable Component Traits

1. **Props-driven**: All inputs via props
2. **Events-out**: Side effects via callbacks
3. **No global state**: Dependencies injected
4. **Pure rendering**: Same props = same output

```typescript
// Hard to test
function UserProfile() {
  const user = useGlobalStore().user; // Hidden dependency
  const analytics = window.analytics; // Global access

  return <div onClick={() => analytics.track('click')}>{user.name}</div>;
}

// Easy to test
interface UserProfileProps {
  user: User;
  onInteraction?: () => void;
}

function UserProfile(props: UserProfileProps) {
  return (
    <div onClick={props.onInteraction}>
      {props.user.name}
    </div>
  );
}

// Test
it('renders user name', () => {
  render(() => <UserProfile user={{ name: 'Alice' }} />);
  expect(screen.getByText('Alice')).toBeInTheDocument();
});
```

---

## Checklist Summary

| Principle | Check |
|-----------|-------|
| SRP | Component has one reason to change |
| OCP | Extended via props/composition, not modification |
| LSP | Derived components honor base contracts |
| ISP | Props interface is minimal |
| DIP | Dependencies injected, not imported |
| Composition | Prefers composition over inheritance |
| Prop drilling | Uses context or composition for deep data |
| God component | Under 200 lines, single focus |
| Testability | Props-driven, side effects via callbacks |

---

## Sources

- [Feature-Sliced Design](https://feature-sliced.design/blog/frontend-architecture-guide)
- [SOLID Principles in React](https://konstantinlebedev.com/solid-in-react/)
- [Frontend Design Patterns 2026](https://www.netguru.com/blog/frontend-design-patterns)
- [React Design Patterns](https://refine.dev/blog/react-design-patterns/)
- [LogRocket - React Design Patterns](https://blog.logrocket.com/react-design-patterns/)
