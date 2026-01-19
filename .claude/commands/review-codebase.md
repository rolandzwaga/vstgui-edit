---
description: Launch systematic codebase review - reviews all domains from ARCHITECTURE.md and creates detailed report files
allowed-tools: Read, Glob, Grep, Write, Task
---

# Codebase Review

Launch the `codebase-reviewer` agent to perform a systematic review of the entire codebase.

## What This Does

1. Reads `specs/ARCHITECTURE.md` to understand domain structure
2. Reviews each of the 13 functional domains in order
3. Checks for SolidJS, TypeScript, and component design issues
4. Creates individual report files in `specs/reviews/` for domains with issues
5. Generates a summary report at `specs/reviews/SUMMARY.md`

## Instructions

Use the Task tool to spawn the `codebase-reviewer` agent with this prompt:

"Review the VSTGUI-Edit codebase systematically. Start by reading specs/ARCHITECTURE.md, then work through each domain checking for SolidJS reactivity issues, TypeScript type safety problems, and component anti-patterns. Create report files in specs/reviews/ for any domains with issues, and finish with a SUMMARY.md overview."

The agent will work autonomously through all 13 domains and create actionable refactoring reports.

## Arguments

If $ARGUMENTS is provided, focus the review on that specific domain only:
- `/review-codebase parser` - Review only document processing domain
- `/review-codebase canvas` - Review only canvas & rendering domain
- `/review-codebase all` - Review entire codebase (default)
