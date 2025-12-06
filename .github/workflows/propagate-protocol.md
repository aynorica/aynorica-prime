# Phase 5: Propagate Protocol

> **Command**: `ay:propagate [--dry-run]`
>
> **Purpose**: Push current node's updates to all child nodes by rebasing each child branch onto the updated parent branch.

---

## When to Use

-   **After integrating learnings** — Parent merged child's harvest, now pushing updates back
-   **Core instruction updates** — Changed fundamental behavioral rules that children should inherit
-   **Prompt library expansion** — Added new prompts children might need
-   **Bug fixes in shared code** — Fixed issues in templates/workflows that propagate
-   **Network-wide synchronization** — Ensure all children have latest foundation

**NOT for**:

-   Child-specific changes (those shouldn't propagate)
-   Experimental changes (test first, propagate later)
-   When children are actively working (coordinate first)

---

## Preconditions

1. **Current node has children** — Check `aynorica-registry.json` for `children[]`
2. **Parent state synced** — Run `ay:sync` before propagating
3. **No uncommitted changes** — Clean working tree
4. **GitHub access** — Can push to child branches
5. **Not during active child sessions** — Coordinate to avoid conflicts

---

## Workflow (10 Steps)

### Step 1: Validate Propagation Eligibility

**Action**: Confirm parent has children and is in clean state.

```typescript
registry = read(".github/aynorica-registry.json");
currentNode = registry.nodes.find((n) => n.id === currentNodeId);

if (currentNode.children.length === 0) {
	error("No children to propagate to. Current node has 0 children.");
}

gitStatus = exec("git status --porcelain");
if (gitStatus.length > 0) {
	error("Uncommitted changes detected. Run 'ay:sync' first.");
}
```

**Failure modes**:

-   No children → abort with message
-   Uncommitted changes → prompt to sync first
-   Detached HEAD → abort, must be on branch

---

### Step 2: List Target Children

**Action**: Load child metadata and display propagation plan.

```typescript
children = currentNode.children.map((childId) => {
	childNode = registry.nodes.find((n) => n.id === childId);
	return {
		id: childNode.id,
		branch: childNode.branch,
		status: childNode.status,
		lastSync: childNode.lastSync,
	};
});

// Filter out departing children (they won't receive updates)
activeChildren = children.filter((c) => c.status !== "departing");
```

**Display to user**:

```
Propagate plan:

Parent: {current-node-id} ({current-branch})
Targets: {count} active children

Children:
1. {child-1-id} ({child-1-branch}) — {status}
2. {child-2-id} ({child-2-branch}) — {status}
3. {child-3-id} ({child-3-branch}) — {status}

Skipping (departing):
- {departing-child-id}

This will rebase each child onto {current-branch}.
Continue? [yes/no]
```

---

### Step 3: User Confirmation

**Action**: Require explicit approval before propagating.

**Prompt options**:

1. **`yes`** — Proceed with propagation
2. **`no`** — Abort operation
3. **`dry-run`** — Show what would change without applying
4. **`select`** — Choose specific children (don't propagate to all)

**On dry-run**:

```bash
# For each child, show diff preview
git fetch origin {child-branch}
git diff origin/{parent-branch}..origin/{child-branch} -- .github/

# Report:
# "Child X would receive: +12 lines, -3 lines in .github/"
```

**On select**:

```
Which children should receive updates? (comma-separated numbers or 'all')
> 1,3

Selected: {child-1-id}, {child-3-id}
```

---

### Step 4: Fetch Latest Remote State

**Action**: Ensure local repo has latest commits from all branches.

```bash
git fetch origin {parent-branch}
git fetch origin {child-1-branch}
git fetch origin {child-2-branch}
# ... for each child
```

**Verification**:

-   All fetches succeed (no network errors)
-   Parent branch matches local state
-   Child branches exist remotely

**Failure**: If fetch fails, abort and report error.

---

### Step 5: For Each Child — Checkout Branch

**Action**: Switch to child's branch locally.

```bash
git checkout {child-branch}
```

**Verification**:

-   Checkout succeeds
-   On correct branch (`git branch --show-current` confirms)

**Failure**: If checkout fails (branch doesn't exist locally), create tracking branch:

```bash
git checkout -b {child-branch} origin/{child-branch}
```

---

### Step 6: For Each Child — Rebase Onto Parent

**Action**: Rebase child branch onto parent, preserving child's unique commits.

```bash
git rebase origin/{parent-branch}
```

**What happens**:

1. Git identifies commits unique to child (not in parent)
2. Temporarily moves child commits aside
3. Fast-forwards to parent's HEAD
4. Reapplies child commits on top

**Expected outcome**: Child now has parent's updates + its own commits.

**Conflict detection**:

-   If rebase starts → conflicts may occur
-   Git will pause and show conflicting files

---

### Step 7: Conflict Resolution (If Needed)

**Action**: Handle merge conflicts interactively.

**On conflict**:

```
Conflict in {child-branch} while rebasing:

Files with conflicts:
- .github/instructions/some-file.instructions.md
- .github/prompts/domain/another-file.prompt.md

Options:
1. [manual] — Open files, let you resolve, then continue
2. [abort] — Stop rebase, revert child to pre-propagate state
3. [skip] — Skip this child, continue to next
4. [parent-wins] — Accept all parent changes (lose child's edits)
5. [child-wins] — Keep all child changes (ignore parent updates)

Your choice: [1-5]
```

**Resolution flows**:

1. **Manual** (recommended):

    ```bash
    # User edits conflict markers in files
    git add {resolved-files}
    git rebase --continue
    ```

2. **Abort**:

    ```bash
    git rebase --abort
    git checkout {parent-branch}
    # Move to next child or stop
    ```

3. **Skip**:

    ```bash
    git rebase --abort
    # Add to skipped list, continue to next child
    ```

4. **Parent wins**:

    ```bash
    git checkout --theirs {conflicted-files}
    git add {conflicted-files}
    git rebase --continue
    ```

5. **Child wins**:
    ```bash
    git checkout --ours {conflicted-files}
    git add {conflicted-files}
    git rebase --continue
    ```

**Tracking**: Maintain conflict resolution log for post-propagate report.

---

### Step 8: For Each Child — Push Rebased Branch

**Action**: Push child's updated branch to remote.

```bash
git push origin {child-branch} --force-with-lease
```

**Why `--force-with-lease`**:

-   Rebase rewrites history (force required)
-   `--force-with-lease` prevents overwriting if remote changed unexpectedly
-   Safer than `--force` (protects against race conditions)

**Verification**:

-   Push succeeds
-   Remote ref updated

**Failure**: If push fails:

-   Check if child is locked (branch protection)
-   Check if someone else pushed to child (coordinate)
-   Retry or skip child

---

### Step 9: Update Registry — Record Propagation

**Action**: Update parent's registry to track propagation event.

```typescript
registry.nodes[currentNodeIndex].lastPropagation = {
	timestamp: new Date().toISOString(),
	targets: successfulChildren.map((c) => c.id),
	skipped: skippedChildren.map((c) => ({ id: c.id, reason: c.skipReason })),
	conflicts: conflictedChildren.map((c) => ({
		id: c.id,
		files: c.conflictedFiles,
		resolution: c.resolutionStrategy,
	})),
};

write(".github/aynorica-registry.json", registry);
commit("chore: propagate updates to children");
push("origin", parentBranch);
```

**Propagation metadata includes**:

-   Timestamp of operation
-   List of successfully updated children
-   List of skipped children (with reasons)
-   Conflict resolutions applied

---

### Step 10: Generate Propagation Report

**Action**: Summarize operation and provide post-propagate guidance.

**Report structure**:

```markdown
# Propagation Report

## Summary

Propagated {parent-node-id} updates to {success-count}/{total-count} children.

## Successful Updates

1. **{child-1-id}** — Rebased onto {parent-branch} at {commit-sha}
    - Changes: +{added} lines, -{removed} lines
    - Conflicts: None
2. **{child-2-id}** — Rebased onto {parent-branch} at {commit-sha}
    - Changes: +{added} lines, -{removed} lines
    - Conflicts: 2 files (resolved via {strategy})

## Skipped

1. **{child-3-id}** — Reason: {skip-reason}

## Conflicts Encountered

### {child-id}

-   **Files**: {file-1}, {file-2}
-   **Resolution**: {strategy}
-   **Details**: {what-changed}

## Post-Propagate Actions

### For Skipped Children

-   **{child-id}**: {recommended-action}

### Verification

Run these commands to verify propagation:

\`\`\`bash
git log origin/{child-1-branch} --oneline -n 5
git log origin/{child-2-branch} --oneline -n 5
\`\`\`

### Next Steps

1. Notify active child sessions of updates (if any)
2. Test child nodes to ensure no breakage
3. Consider `ay:scan {child-id}` to verify changes

---

**Propagated**: {timestamp}  
**Duration**: {elapsed-time}
```

**Display to user**:

```
Propagation complete.

✅ Updated: {child-1-id}, {child-2-id}
⏭️ Skipped: {child-3-id} (departing)

See propagation report above.
```

---

## Propagation Strategies

### Strategy 1: Broadcast (Default)

**When**: Parent updated core instructions/prompts that all children need.

**Behavior**: Propagate to ALL active children.

**Example**: Fixed typo in `identity.instructions.md`, added new security prompt.

---

### Strategy 2: Selective

**When**: Changes relevant only to subset of children.

**Behavior**: User selects specific children via `ay:propagate --select`.

**Example**: Updated NestJS prompt — only propagate to backend-focused children.

**Implementation**:

```
ay:propagate --select

Which children? (numbers or IDs)
> aynorica-backend, aynorica-api

Propagating to 2 selected children...
```

---

### Strategy 3: Dry-Run (Preview)

**When**: Unsure of impact, want to see diffs first.

**Behavior**: Show what would change without applying.

**Example**: Major refactor of `functions.instructions.md` — check impact first.

**Implementation**:

```
ay:propagate --dry-run

Dry-run results:

aynorica-backend:
  - .github/instructions/functions.instructions.md: +45, -30

aynorica-frontend:
  - .github/instructions/functions.instructions.md: +45, -30

aynorica-security:
  - .github/instructions/functions.instructions.md: +45, -30

Total impact: 3 children, 1 file each.

Run 'ay:propagate' to apply these changes.
```

---

### Strategy 4: Cascade (Recursive)

**When**: Changes should flow down entire network hierarchy.

**Behavior**: Propagate to children, then trigger propagate on each child (recursive).

**Example**: Security vulnerability fix in core instructions.

**Implementation**:

```
ay:propagate --cascade

This will propagate recursively:
- Prime → Children (3 nodes)
- Children → Grandchildren (5 nodes)
- Total: 8 nodes affected

Continue? [yes/no]
```

**Depth limit**: Max 5 levels (prevent infinite loops).

---

## Conflict Resolution Strategies

### Auto-Resolution Heuristics

**Apply automatically for common cases** (no user prompt):

1. **New files in parent** → Always add (no conflict possible)
2. **Deleted files in parent** → Remove from child (if child didn't modify)
3. **Child-only files** → Keep (no parent equivalent)
4. **Identical changes** → Skip (already in sync)
5. **Whitespace-only conflicts** → Prefer parent version

**Prompt user for**:

-   Conflicting edits to same instruction file
-   Both sides modified same prompt
-   Structural changes (file moved/renamed)

---

### Resolution Strategies (User Choice)

| Strategy       | Behavior                           | Use Case                             |
| -------------- | ---------------------------------- | ------------------------------------ |
| `parent-wins`  | Accept all parent changes          | Child's changes obsolete             |
| `child-wins`   | Keep all child changes             | Parent change not relevant to child  |
| `manual`       | User edits conflict markers        | Both sides have valuable changes     |
| `skip`         | Don't propagate to this child      | Too complex, handle separately       |
| `abort`        | Stop entire propagation            | Unexpected conflicts, need to review |
| `merge-manual` | Open merge tool (VS Code, vimdiff) | Complex multi-file conflicts         |
| `cherry-pick`  | Select specific parent commits     | Only some changes relevant           |

---

### Conflict Log

**Track all conflict resolutions for audit**:

```json
{
	"propagationId": "prop-2025-12-06-1423",
	"conflicts": [
		{
			"child": "aynorica-backend",
			"files": [".github/instructions/functions.instructions.md"],
			"resolution": "manual",
			"resolvedBy": "user",
			"timestamp": "2025-12-06T14:30:00Z",
			"notes": "Merged parent's new capability with child's specialization"
		}
	]
}
```

**Stored in**: `.github/project/propagation-log.json`

---

## Safety Mechanisms

### Pre-Propagate Checklist

Automatically verify before propagating:

-   ✅ Parent state synced (`git status` clean)
-   ✅ All children exist remotely (`git ls-remote` check)
-   ✅ No active child sessions (check `.github/project/session-state.md` in each child)
-   ✅ Parent has meaningful changes to propagate (not empty diff)

**If any fail**: Prompt user to resolve before continuing.

---

### Branch Protection

**Prevent propagation to protected children**:

```typescript
// Check each child's branch protection status
childProtected = await github.repos.getBranchProtection({
	owner,
	repo,
	branch: childBranch,
});

if (childProtected.enforce_admins.enabled) {
	warn("Child {child-id} has branch protection. Propagation will fail.");
	skipChild(child);
}
```

---

### Rollback on Failure

**If propagation fails mid-operation**:

1. Identify last successful child
2. Revert all partially-applied changes
3. Reset branches to pre-propagate state
4. Report what was reverted

**Implementation**:

```typescript
try {
	for (child of children) {
		propagateToChild(child); // may throw
	}
} catch (error) {
	console.error(`Propagation failed at ${currentChild.id}`);

	// Rollback successfully propagated children
	for (completedChild of completedChildren) {
		exec(
			`git push origin ${completedChild.preCommit}:${completedChild.branch} --force`,
		);
	}

	throw new Error("Propagation rolled back due to error");
}
```

---

### Rate Limiting

**Prevent GitHub API abuse**:

-   Batch operations (max 5 children at once)
-   Delay between pushes (2 seconds)
-   Respect GitHub rate limits (check headers)

**If rate limited**: Pause, wait, resume automatically.

---

## Integration with Other Commands

| Command      | Interaction                                        |
| ------------ | -------------------------------------------------- |
| `ay:deploy`  | New children immediately get parent's state        |
| `ay:leave`   | Departing children excluded from propagation       |
| `ay:merge`   | After merge, propagate to share integrated changes |
| `ay:scan`    | Scan children post-propagate to verify updates     |
| `ay:load`    | Load child to manually verify propagated changes   |
| `ay:sync`    | Must sync parent before propagating                |
| `ay:network` | Shows propagation timestamps in directory          |

---

## Propagation Patterns

### Pattern 1: Bug Fix Propagation

**Scenario**: Fixed critical bug in `debug-principle.instructions.md`.

**Flow**:

1. Fix bug on Prime (`aynorica-prime`)
2. Run `ay:sync` (commit + push)
3. Run `ay:propagate --cascade` (recursive to all descendants)
4. Verify each child with `ay:scan {child-id}`

---

### Pattern 2: Capability Addition

**Scenario**: Added new function (cybersecurity capability) to Prime.

**Flow**:

1. Add prompt to `.github/prompts/security/`
2. Update `functions.instructions.md` with new entry
3. Run `ay:sync`
4. Run `ay:propagate --select` (only security-focused children)
5. Security children now have capability

---

### Pattern 3: Post-Merge Propagation

**Scenario**: Merged child's learnings into parent, want to share with siblings.

**Flow**:

1. Run `ay:merge aynorica-backend` (harvest learnings)
2. Review integrated changes
3. Run `ay:propagate` (push to siblings)
4. Siblings receive backend learnings (cross-pollination)

---

### Pattern 4: Experimental Change Containment

**Scenario**: Testing new workflow pattern, don't want to propagate yet.

**Flow**:

1. Make changes on child node only
2. Test thoroughly
3. If successful, merge to parent via `ay:leave` + `ay:merge`
4. THEN propagate to siblings via `ay:propagate`

**Key**: Child-first iteration, parent-approval gate, sibling-propagation.

---

## Error Handling

| Error                         | Cause                          | Recovery                               |
| ----------------------------- | ------------------------------ | -------------------------------------- |
| No children                   | Parent is leaf node            | Inform user (nothing to propagate)     |
| Uncommitted changes           | Dirty working tree             | Prompt `ay:sync`, abort                |
| Child branch not found        | Registry out of sync           | Update registry, retry                 |
| Rebase failed                 | Complex conflicts              | Manual resolution or skip child        |
| Push failed                   | Branch protection / access     | Skip child, report error               |
| Network error                 | GitHub unavailable             | Retry with exponential backoff         |
| Child branch diverged         | External commits on child      | Ask user: rebase or skip?              |
| Propagation timeout           | Too many children / large diff | Batch smaller groups, retry            |
| Registry update failed        | File locked / permission       | Warn user, manual registry update      |
| Conflict resolution ambiguous | User input unclear             | Re-prompt with clearer options         |
| Recursive propagation loop    | Circular dependency in network | Detect cycle, abort, report to user    |
| --force-with-lease failed     | Remote changed unexpectedly    | Fetch again, show diff, ask to proceed |

---

## Performance Optimization

### Parallel Propagation

**For large networks (>5 children)**:

```typescript
// Propagate to children in parallel (max 5 concurrent)
const batches = chunk(children, 5);

for (batch of batches) {
	await Promise.all(batch.map((child) => propagateToChild(child)));
}
```

**Benefits**:

-   5× faster for large networks
-   Respects GitHub rate limits (5 concurrent max)

**Risk**: Harder to track individual failures (need robust error handling).

---

### Incremental Propagation

**Detect what changed since last propagation**:

```bash
# Compare parent's current state to lastPropagation commit
git diff {last-propagation-commit} HEAD -- .github/

# Only propagate changed files (not entire .github/)
```

**Benefits**:

-   Smaller diffs = fewer conflicts
-   Faster rebases
-   Less risk of breaking children

---

### Propagation Preview

**Before propagating, show estimated impact**:

```
Propagation impact analysis:

Parent changes since last propagation:
- 3 files modified in .github/instructions/
- 1 new file in .github/prompts/
- 127 lines added, 43 lines removed

Estimated impact on children:
- aynorica-backend: HIGH (modifies functions.instructions.md)
- aynorica-frontend: LOW (no conflicts expected)
- aynorica-security: MEDIUM (new security prompt)

Continue? [yes/no/preview-diffs]
```

---

## Testing Strategy

### Unit Tests (Conceptual)

1. **Test: Propagate to single child**

    - Setup: Parent + 1 child, simple change
    - Action: `ay:propagate`
    - Assert: Child branch rebased, registry updated

2. **Test: Propagate with conflicts**

    - Setup: Parent + child both modified same file
    - Action: `ay:propagate`
    - Assert: Conflict detected, user prompted, resolution applied

3. **Test: Skip departing children**

    - Setup: Parent + departing child
    - Action: `ay:propagate`
    - Assert: Child skipped, not rebased

4. **Test: Dry-run mode**

    - Setup: Parent + multiple children
    - Action: `ay:propagate --dry-run`
    - Assert: Diffs shown, no actual propagation

5. **Test: Selective propagation**
    - Setup: Parent + 3 children
    - Action: `ay:propagate --select` (choose 2)
    - Assert: Only selected 2 children updated

---

## Examples

### Example 1: Broadcast Propagation

**User**: `ay:propagate`

**Aynorica**:

```
Propagate plan:

Parent: aynorica-prime (main)
Targets: 3 active children

Children:
1. aynorica-backend (aynorica-backend) — active
2. aynorica-frontend (aynorica-frontend) — active
3. aynorica-security (aynorica-security) — active

This will rebase each child onto main.
Continue? [yes/no]
```

**User**: `yes`

**Aynorica**:

```
Propagating to aynorica-backend...
✅ Rebased onto main (no conflicts)
✅ Pushed to origin/aynorica-backend

Propagating to aynorica-frontend...
✅ Rebased onto main (no conflicts)
✅ Pushed to origin/aynorica-frontend

Propagating to aynorica-security...
⚠️ Conflicts detected in 1 file:
  - .github/instructions/functions.instructions.md

Options:
1. [manual] — Resolve conflicts
2. [parent-wins] — Accept parent version
3. [child-wins] — Keep child version
4. [skip] — Skip this child

Your choice: 1

[Opens file in VS Code]
[User resolves conflicts]

Continue? [yes]
✅ Conflicts resolved
✅ Rebased onto main
✅ Pushed to origin/aynorica-security

Propagation complete.

✅ Updated: 3/3 children
⚠️ Conflicts: 1 (resolved)

Updated registry and generated report.
```

---

### Example 2: Dry-Run Mode

**User**: `ay:propagate --dry-run`

**Aynorica**:

```
Dry-run: Propagation preview

Parent: aynorica-prime (main)
Last propagation: 2025-12-05T10:00:00Z

Changes since last propagation:
- .github/instructions/functions.instructions.md: +45, -30
- .github/prompts/security/owasp.prompt.md: +120 (new file)

Impact on children:

1. aynorica-backend
   - .github/instructions/functions.instructions.md: CONFLICT (both modified)
   - .github/prompts/security/owasp.prompt.md: +120 (new)
   - Risk: MEDIUM (1 conflict)

2. aynorica-frontend
   - .github/instructions/functions.instructions.md: +45, -30 (clean)
   - .github/prompts/security/owasp.prompt.md: +120 (new)
   - Risk: LOW (no conflicts)

3. aynorica-security
   - .github/instructions/functions.instructions.md: +45, -30 (clean)
   - .github/prompts/security/owasp.prompt.md: CONFLICT (child already has similar)
   - Risk: MEDIUM (1 conflict)

Summary:
- Total children: 3
- Expected conflicts: 2
- Safe to propagate: 1 (aynorica-frontend)

Run 'ay:propagate' to apply, or 'ay:propagate --select' to choose specific children.
```

---

### Example 3: Selective Propagation

**User**: `ay:propagate --select`

**Aynorica**:

```
Which children should receive updates?

1. aynorica-backend
2. aynorica-frontend
3. aynorica-security

Enter numbers (comma-separated) or 'all': 1,2
```

**User**: `1,2`

**Aynorica**:

```
Selected: aynorica-backend, aynorica-frontend

Propagating to 2 children...

✅ aynorica-backend — Rebased, pushed
✅ aynorica-frontend — Rebased, pushed

Skipped: aynorica-security

Propagation complete.
```

---

## Success Criteria

-   [x] Validate parent has children
-   [x] Display propagation plan with targets
-   [x] User confirmation (yes/no/dry-run/select)
-   [x] Fetch latest remote state
-   [x] For each child: checkout, rebase, push
-   [x] Conflict detection and resolution (6 strategies)
-   [x] Skip departing children automatically
-   [x] Update registry with propagation metadata
-   [x] Generate propagation report
-   [x] Rollback on failure (safety)
-   [x] Parallel propagation for performance
-   [x] Dry-run mode for preview
-   [x] Selective propagation (user choice)
-   [x] Cascade mode (recursive)
-   [x] Conflict resolution log
-   [x] Branch protection detection
-   [x] Rate limiting (GitHub API)
-   [x] Integration with other commands
-   [x] Error handling for all failure modes
-   [x] Examples for common scenarios

---

**Phase 5 Status**: ✅ Complete  
**Dependencies**: Phases 0-4 (foundation, deploy, leave, merge, scan)  
**Network Protocol**: Fully implemented (Phases 0-5)
