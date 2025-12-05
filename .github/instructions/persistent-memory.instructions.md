---
applyTo: "**"
---

# Persistent Memory Protocol

> **Purpose**: Maintain continuity across sessions through GitHub Issues and session state files. Inspired by Beads issue tracker concepts, implemented via native GitHub infrastructure.

---

## Command Triggers

Use `ay:` prefix to trigger memory operations. These are unambiguous commands that won't be confused with normal conversation.

| Command               | Action                                                                          |
| --------------------- | ------------------------------------------------------------------------------- |
| `ay:sync`             | Update `session-state.md`, commit, push to GitHub                               |
| `ay:remember [thing]` | Create GitHub Issue for [thing]                                                 |
| `ay:ready`            | Query GitHub Issues for unblocked work                                          |
| `ay:checkpoint`       | Full state dump: update session-state + create issues for in-flight work + sync |
| `ay:status`           | Show current session state without modifying anything                           |

**Examples:**

-   `ay:sync` → I update session state and push to GitHub
-   `ay:remember refactor the auth module` → I create a GitHub Issue titled "Refactor the auth module"
-   `ay:ready` → I query and show what's ready to work on

---

## Core Principles

1. **Capture immediately** — Discovered work goes to GitHub Issues, not memory
2. **Track dependencies** — Know what blocks what
3. **Maintain state** — Handoff to future self
4. **Query first** — Check ready work before starting

---

## GitHub Issues as Memory Store

Use GitHub Issues on the `aynorica-os` repository as the persistent memory database.

### Issue Types (Labels)

| Label           | Use Case                      |
| --------------- | ----------------------------- |
| `type:task`     | Work to be done               |
| `type:bug`      | Something broken              |
| `type:feature`  | New capability to add         |
| `type:idea`     | Captured thought for later    |
| `type:question` | Needs clarification from Amir |
| `type:blocker`  | Something preventing progress |

### Priority Labels

| Label        | Meaning                   |
| ------------ | ------------------------- |
| `priority:0` | Critical — do immediately |
| `priority:1` | High — do soon            |
| `priority:2` | Normal — do when ready    |
| `priority:3` | Low — backlog             |

### State Labels

| Label                | Meaning                 |
| -------------------- | ----------------------- |
| `status:ready`       | No blockers, can start  |
| `status:blocked`     | Waiting on something    |
| `status:in-progress` | Currently being worked  |
| `status:discovered`  | Found during other work |

### Dependency Tracking

In issue body, use this format:

```markdown
## Dependencies

-   **Blocked by**: #15 (reason)
-   **Blocks**: #20, #21
-   **Parent**: #10 (epic/project)
-   **Related**: #12, #14
-   **Discovered from**: #8 (found while working on this)
```

---

## Session State Protocol

### File Location

`.github/project/session-state.md`

### When to Update

1. **Session start** — Read state, orient to current work
2. **During session** — Update as work progresses (optional)
3. **Session end** — Write final state before closing

### State File Structure

```markdown
# Session State

## Last Updated

[ISO timestamp]

## Active Context

[What project/area is currently in focus]

## In Progress

-   #[issue] — [title] ([% complete])
    -   Done: [what's finished]
    -   Next: [immediate next step]

## Blocked

-   #[issue] — blocked by #[blocker] ([reason])

## Ready Queue

1. #[issue] — [title] (priority: [0-3])
2. #[issue] — [title] (priority: [0-3])

## Recently Completed

-   #[issue] — [title] (closed: [date])

## Session Notes

[Anything Amir mentioned, decisions made, context to remember]

## Next Session Prompt

[Pre-formatted prompt for continuing work]
```

---

## Workflow Integration

### On Session Start

1. Read `.github/project/session-state.md`
2. Check GitHub Issues: `is:open repo:aynorica/aynorica-os`
3. Identify ready work: `is:open -label:status:blocked`
4. Orient to context before starting

### During Work — Discovered Work Capture

When I notice something that needs doing but isn't the current task:

1. **Don't try to remember it** — create GitHub Issue immediately
2. Add label `status:discovered`
3. Link to current work issue if relevant
4. Continue with original task

**Example**:

> "While refactoring auth, I noticed the error messages are inconsistent."
> → Create issue: "Standardize error message format" with `type:task`, `status:discovered`, `priority:2`

### On Session End

1. Update session-state.md with current progress
2. Close completed issues with summary comment
3. Update blocked/ready labels as needed
4. Write "Next Session Prompt" for continuity
5. Commit and push to GitHub

---

## Ready Work Query

To find what's ready to work on:

```
repo:aynorica/aynorica-os is:issue is:open -label:status:blocked sort:priority
```

Or ask me: "What's ready to work on?"

---

## Issue Templates

### Discovered Work

```markdown
**Found while**: Working on #[parent issue]
**Context**: [Why this matters]
**Proposed action**: [What should be done]

## Dependencies

-   Discovered from: #[parent]
```

### Blocker

```markdown
**Blocking**: #[issues being blocked]
**Nature**: [Technical / External / Decision needed]
**Resolution path**: [What needs to happen]
**ETA**: [If known]
```

---

## Audit Trail

All changes are tracked via:

-   GitHub Issue comments (discussion, updates)
-   Git commit history (code changes)
-   Session state file (context continuity)

When closing an issue, always add a summary comment:

```markdown
**Closed**: [date]
**Resolution**: [What was done]
**Commits**: [relevant commit hashes if any]
**Follow-up**: #[new issues if any]
```

---

## Integration with Existing Protocols

| Protocol                       | Integration                                 |
| ------------------------------ | ------------------------------------------- |
| `handoff.instructions.md`      | Session state feeds into handoff documents  |
| `amir-profile.instructions.md` | Issue priorities respect cognitive patterns |
| `functions.instructions.md`    | Issue types map to capability areas         |
| `identity.instructions.md`     | Issue workflow follows core behavioral laws |
