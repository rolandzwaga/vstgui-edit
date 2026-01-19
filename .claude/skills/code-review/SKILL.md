---
name: code-review
description: Review code for SolidJS reactivity issues, TypeScript type safety problems, and component design anti-patterns. Use when asked to review code, check for issues, review a PR, or audit code quality.
allowed-tools:
  - Read
  - Grep
  - Glob
---

# Code Review

Review code for SolidJS, TypeScript, and component design issues.

## Instructions

When reviewing code:

1. **Read the file(s)** to be reviewed
2. **Check against patterns** in the reference files below
3. **Report findings** organized by severity

## Reference Files

Load these for detailed patterns when needed:

- [solidjs-patterns.md](solidjs-patterns.md) - Reactivity, signals, effects, stores
- [typescript-patterns.md](typescript-patterns.md) - Type safety, strict mode, unions
- [component-design.md](component-design.md) - SOLID principles, composition

## Quick Checks

### SolidJS Critical Issues
- Props destructured (breaks reactivity)
- Signal not called as function in JSX
- `createEffect` used for derived state
- Missing `onCleanup` for subscriptions

### TypeScript Critical Issues
- `any` type usage
- Missing exhaustive switch check
- Type assertion without validation
- Untyped external data

### Component Critical Issues
- God component (>300 lines, multiple concerns)
- Prop drilling through 3+ levels
- Direct API imports (not injected)

## Output Format

```markdown
## Critical Issues
[Must fix - causes bugs]

## Anti-Patterns
[Should fix - violates best practices]

## Suggestions
[Optional improvements]
```

## Project Rules (VSTGUI-Edit)

Also check:
- No React imports (only `solid-js`)
- No dynamic imports (static only)
- CSS modules only (`*.module.css`)
- Tests colocated as `*.spec.tsx`
