# TypeScript Patterns Reference

Comprehensive guide to TypeScript best practices and anti-patterns for code review.

## Strict Mode Configuration

### Required tsconfig Settings

```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true,
    "noImplicitReturns": true,
    "exactOptionalPropertyTypes": true
  }
}
```

### What Strict Mode Catches

| Flag | Catches |
|------|---------|
| `noImplicitAny` | Untyped parameters, variables |
| `strictNullChecks` | Null/undefined access errors |
| `strictFunctionTypes` | Function parameter mismatches |
| `noUncheckedIndexedAccess` | Array/object access without null check |

---

## Type Safety Patterns

### Prefer `unknown` Over `any`

```typescript
// BAD: Defeats type safety
function processData(data: any) {
  return data.name.toUpperCase(); // No error, crashes at runtime
}

// GOOD: Forces type narrowing
function processData(data: unknown) {
  if (typeof data === 'object' && data !== null && 'name' in data) {
    const name = (data as { name: unknown }).name;
    if (typeof name === 'string') {
      return name.toUpperCase();
    }
  }
  throw new Error('Invalid data');
}

// BETTER: Use runtime validation
import { z } from 'zod';
const DataSchema = z.object({ name: z.string() });

function processData(data: unknown) {
  const parsed = DataSchema.parse(data);
  return parsed.name.toUpperCase();
}
```

### Avoid Type Assertions Without Justification

```typescript
// BAD: Bypasses type checking
const user = response.data as User;

// GOOD: Validate at runtime
const user = UserSchema.parse(response.data);

// ACCEPTABLE: When you genuinely know more than TypeScript
const element = document.getElementById('app') as HTMLDivElement;
// But prefer type guard when possible:
const element = document.getElementById('app');
if (element instanceof HTMLDivElement) {
  // element is HTMLDivElement here
}
```

---

## Discriminated Unions

### Pattern for State Variants

```typescript
// BAD: Separate booleans lead to impossible states
interface FetchState {
  loading: boolean;
  error: Error | null;
  data: Data | null;
}
// Can have loading=true AND error set simultaneously

// GOOD: Discriminated union - mutually exclusive states
type FetchState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: Data }
  | { status: 'error'; error: Error };

function renderState(state: FetchState) {
  switch (state.status) {
    case 'idle':
      return <Placeholder />;
    case 'loading':
      return <Spinner />;
    case 'success':
      return <Content data={state.data} />; // data is typed!
    case 'error':
      return <Error error={state.error} />; // error is typed!
  }
}
```

### Exhaustive Switch Statements

```typescript
type Action =
  | { type: 'increment' }
  | { type: 'decrement' }
  | { type: 'reset'; value: number };

// BAD: Missing case doesn't error
function reducer(state: number, action: Action): number {
  switch (action.type) {
    case 'increment':
      return state + 1;
    case 'decrement':
      return state - 1;
    // 'reset' missing - no compile error!
    default:
      return state;
  }
}

// GOOD: Exhaustive check with never
function reducer(state: number, action: Action): number {
  switch (action.type) {
    case 'increment':
      return state + 1;
    case 'decrement':
      return state - 1;
    case 'reset':
      return action.value;
    default: {
      const _exhaustive: never = action;
      return _exhaustive; // Compile error if case missed
    }
  }
}

// GOOD: Helper function for exhaustive checks
function assertNever(x: never): never {
  throw new Error(`Unexpected value: ${x}`);
}
```

---

## Error Handling Patterns

### Expected vs Unexpected Errors

```typescript
// BAD: All errors look the same
async function createUser(data: UserData): Promise<User> {
  if (!data.email) throw new Error('Email required');
  if (await emailExists(data.email)) throw new Error('Email taken');
  return db.users.create(data);
}

// Caller can't distinguish recoverable from fatal errors
try {
  await createUser(data);
} catch (e) {
  // Is this validation error? DB error? Network error?
}

// GOOD: Result type pattern (neverthrow)
import { ok, err, Result } from 'neverthrow';

class ValidationError {
  readonly _tag = 'ValidationError';
  constructor(public message: string) {}
}

class DuplicateEmailError {
  readonly _tag = 'DuplicateEmailError';
}

type CreateUserError = ValidationError | DuplicateEmailError;

async function createUser(
  data: UserData
): Promise<Result<User, CreateUserError>> {
  if (!data.email) {
    return err(new ValidationError('Email required'));
  }
  if (await emailExists(data.email)) {
    return err(new DuplicateEmailError());
  }
  return ok(await db.users.create(data));
}

// Caller handles each case explicitly
const result = await createUser(data);
result.match(
  (user) => showSuccess(user),
  (error) => {
    switch (error._tag) {
      case 'ValidationError':
        showFieldError(error.message);
        break;
      case 'DuplicateEmailError':
        showDuplicateWarning();
        break;
    }
  }
);
```

---

## Interface and Type Patterns

### Props Interfaces

```typescript
// GOOD: Explicit, documented props
interface ButtonProps {
  /** Button display text */
  label: string;
  /** Called when button is clicked */
  onClick: () => void;
  /** Visual variant */
  variant?: 'primary' | 'secondary' | 'danger';
  /** Disable interaction */
  disabled?: boolean;
}

// GOOD: Extend HTML attributes when wrapping native elements
interface ButtonProps extends JSX.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary';
}
```

### Composition Over Extension

```typescript
// BAD: Deep inheritance
interface Animal { name: string; }
interface Mammal extends Animal { warmBlooded: true; }
interface Dog extends Mammal { breed: string; }

// GOOD: Composition with intersection
type Animal = { name: string };
type Mammal = { warmBlooded: true };
type Dog = Animal & Mammal & { breed: string };

// Or explicit composition
interface Dog {
  animal: Animal;
  mammal: Mammal;
  breed: string;
}
```

### Avoid Extending Interfaces with Interfaces

```typescript
// BAD: Hard to trace what a type includes
interface Retryable {
  retry(): void;
}
interface Queue extends Retryable {
  process(): Promise<void>;
}
interface DataQueue extends Queue {
  // What methods does this have?
}

// GOOD: Explicit implementation
interface Retryable {
  retry(): void;
}
interface Processable {
  process(): Promise<void>;
}

class DataQueue implements Retryable, Processable {
  retry() { /* ... */ }
  process() { /* ... */ }
}
```

---

## Generic Patterns

### Constrained Generics

```typescript
// BAD: Unconstrained - allows anything
function getProperty<T, K>(obj: T, key: K) {
  return obj[key]; // Error: can't index T with K
}

// GOOD: Constrained to valid keys
function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}

// GOOD: Multiple constraints
function merge<T extends object, U extends object>(a: T, b: U): T & U {
  return { ...a, ...b };
}
```

### Utility Types

```typescript
// Use built-in utility types
type PartialUser = Partial<User>;           // All optional
type RequiredUser = Required<User>;         // All required
type ReadonlyUser = Readonly<User>;         // All readonly
type PickedUser = Pick<User, 'id' | 'name'>; // Subset
type OmittedUser = Omit<User, 'password'>;  // Exclude props

// Create custom utility types
type Nullable<T> = T | null;
type NonNullableProps<T> = {
  [K in keyof T]: NonNullable<T[K]>;
};
```

---

## Runtime Validation

### Parse, Don't Validate

```typescript
// BAD: Validation scattered throughout
function processUser(data: unknown) {
  if (typeof data !== 'object' || data === null) {
    throw new Error('Invalid data');
  }
  if (!('name' in data) || typeof data.name !== 'string') {
    throw new Error('Invalid name');
  }
  // Still using 'unknown' internally...
}

// GOOD: Parse once at boundary, use typed data
import { z } from 'zod';

const UserSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  email: z.string().email(),
  age: z.number().int().positive().optional(),
});

type User = z.infer<typeof UserSchema>;

function processUser(data: unknown): User {
  return UserSchema.parse(data); // Throws ZodError if invalid
}

// Or with safe parsing
function processUserSafe(data: unknown) {
  const result = UserSchema.safeParse(data);
  if (!result.success) {
    return { error: result.error.flatten() };
  }
  return { data: result.data };
}
```

---

## Type Narrowing

### Type Guards

```typescript
// Custom type guard
function isUser(value: unknown): value is User {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    'name' in value
  );
}

// Usage
function process(data: unknown) {
  if (isUser(data)) {
    console.log(data.name); // TypeScript knows it's User
  }
}

// Discriminated union narrowing
type Result<T> = { ok: true; value: T } | { ok: false; error: Error };

function unwrap<T>(result: Result<T>): T {
  if (result.ok) {
    return result.value; // Narrowed to success case
  }
  throw result.error;
}
```

### Assertion Functions

```typescript
function assertDefined<T>(
  value: T | null | undefined,
  message = 'Value is not defined'
): asserts value is T {
  if (value === null || value === undefined) {
    throw new Error(message);
  }
}

function process(maybeUser: User | null) {
  assertDefined(maybeUser, 'User not found');
  // maybeUser is now User (not null)
  console.log(maybeUser.name);
}
```

---

## Common Mistakes Checklist

| Mistake | Symptom | Fix |
|---------|---------|-----|
| Using `any` | No type errors | Use `unknown` + narrowing |
| Missing null checks | Runtime null errors | Enable `strictNullChecks` |
| Non-exhaustive switch | Missing case handling | Add `never` default |
| Unvalidated external data | Type mismatches | Use zod/io-ts |
| Type assertion abuse | Hidden type errors | Validate or narrow |
| Implicit any in arrays | `Array<any>` | Explicit type annotation |
| Optional chaining overuse | Hidden null states | Model states explicitly |

---

## Anti-Pattern Summary

### Avoid

1. **`any` type** - Defeats TypeScript's purpose
2. **Type assertions without validation** - Hides errors
3. **Boolean flags for state** - Use discriminated unions
4. **Throwing for expected errors** - Use Result types
5. **Deep interface inheritance** - Use composition
6. **Unvalidated external data** - Parse at boundaries

### Prefer

1. **`unknown` with narrowing** - Safe untyped data handling
2. **Discriminated unions** - Mutually exclusive states
3. **Exhaustive checks** - Catch missing cases at compile time
4. **Const assertions** - Narrow literal types
5. **Explicit return types** - Document function contracts
6. **Branded types** - Distinguish similar primitives

---

## Sources

- [TypeScript Handbook - Narrowing](https://www.typescriptlang.org/docs/handbook/2/narrowing.html)
- [TypeScript Best Practices 2025](https://dev.to/mitu_mariam/typescript-best-practices-in-2025-57hb)
- [Effective TypeScript Principles](https://www.dennisokeeffe.com/blog/2025-03-16-effective-typescript-principles-in-2025)
- [Discriminated Unions - Fullstory](https://www.fullstory.com/blog/discriminated-unions-and-exhaustiveness-checking-in-typescript/)
- [TypeScript Strict Mode Guide](https://typescriptworld.com/the-ultimate-guide-to-typescript-strict-mode-elevating-code-quality-and-safety)
