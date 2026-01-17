# SolidJS Context & Async Patterns

## Context — Dependency Injection

### Creating Context

```typescript
// auth-context.ts — separate file recommended for HMR
import { createContext, useContext } from 'solid-js';

interface AuthContextValue {
  user: () => User | null;
  login: (credentials: Credentials) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue>();

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
```

### Provider Pattern

```typescript
export function AuthProvider(props: ParentProps) {
  const [user, setUser] = createSignal<User | null>(null);

  const value: AuthContextValue = {
    user,
    login: async (creds) => {
      const user = await api.login(creds);
      setUser(user);
    },
    logout: () => setUser(null),
  };

  return (
    <AuthContext.Provider value={value}>
      {props.children}
    </AuthContext.Provider>
  );
}
```

### Best Practices

- Create context in separate module (HMR stability)
- Provide explicit undefined check in custom hook
- Pass signals/functions, not raw values (maintains reactivity)
- Use context for global state; signals for local state

### SSR Consideration

Global state can leak between requests in SSR. Use context for user-specific data to avoid cross-request pollution.

---

## Error Handling

### ErrorBoundary

```typescript
<ErrorBoundary
  fallback={(err, reset) => (
    <div>
      <p>Error: {err.message}</p>
      <button onClick={reset}>Retry</button>
    </div>
  )}
>
  <RiskyComponent />
</ErrorBoundary>
```

**Note:** Only catches render errors. Event handlers and async errors need try/catch.

---

## Async Data with createResource

```typescript
const [userId, setUserId] = createSignal(1);

// Fetcher receives source value
const [user, { refetch, mutate }] = createResource(
  userId,
  async (id) => {
    const res = await fetch(`/api/users/${id}`);
    return res.json();
  }
);

// Reading
user()           // Data or undefined
user.loading     // Boolean
user.error       // Error or undefined
user.state       // 'unresolved' | 'pending' | 'ready' | 'refreshing' | 'errored'

// Actions
refetch()        // Re-run fetcher
mutate(newData)  // Update without fetching
```

---

## Suspense

```typescript
<Suspense fallback={<Loading />}>
  <Show when={user()}>
    {u => <Profile user={u()} />}
  </Show>
</Suspense>
```

**Key Points:**
- Tracks all resources read under it
- Non-blocking: both branches exist, only one shown
- Nested Suspense: nearest ancestor handles loading

---

## Combined Pattern

```typescript
function App() {
  return (
    <ErrorBoundary fallback={<ErrorDisplay />}>
      <Suspense fallback={<AppSkeleton />}>
        <Router />
      </Suspense>
    </ErrorBoundary>
  );
}

function UserProfile() {
  const [user] = createResource(fetchCurrentUser);

  return (
    <ErrorBoundary fallback={<ProfileError />}>
      <Suspense fallback={<ProfileSkeleton />}>
        <Show when={user()}>
          {u => <ProfileContent user={u()} />}
        </Show>
      </Suspense>
    </ErrorBoundary>
  );
}
```

---

## Lazy Loading Components

```typescript
import { lazy } from 'solid-js';

const Settings = lazy(() => import('./Settings'));

// Automatically triggers Suspense
<Suspense fallback={<Loading />}>
  <Settings />
</Suspense>
```

---

## Transition for Non-Blocking Updates

```typescript
import { useTransition } from 'solid-js';

function Search() {
  const [query, setQuery] = createSignal('');
  const [isPending, startTransition] = useTransition();

  const handleInput = (e) => {
    // Update immediately
    setQuery(e.target.value);

    // Heavy update can be deferred
    startTransition(() => {
      setSearchResults(/* expensive operation */);
    });
  };

  return (
    <div>
      <input onInput={handleInput} />
      <div classList={{ pending: isPending() }}>
        <Results />
      </div>
    </div>
  );
}
```
