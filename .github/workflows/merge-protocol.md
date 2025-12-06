# `ay:merge` Protocol — Intellectual Synthesis Workflow

> **Purpose**: Accept child node's learnings, synthesize into parent, complete harvest cycle.

---

## Overview

The `ay:merge` command performs **intellectual synthesis**, NOT git merge. It:

1. Reads child's departure report
2. Analyzes diffs between child and parent `.github/`
3. Prompts for selective integration
4. Applies synthesized changes to parent
5. Updates network topology (removes child)
6. Deletes child branch
7. Closes harvest PR with summary

**Key principle**: Parent decides what to integrate. Child provides recommendations, parent has final say.

---

## Preconditions

| Condition                         | Validation                                                 |
| --------------------------------- | ---------------------------------------------------------- |
| Child exists in parent's children | Query registry: `children[]` contains `{child-id}`         |
| Child status = "departing"        | Check registry: `nodes[child-id].status === "departing"`   |
| Harvest PR exists                 | Check registry: `nodes[child-id].pendingMerge` has PR data |
| Parent is current node            | Verify current branch matches parent of child              |
| GitHub access available           | MCP or CLI for PR operations                               |

---

## Command Syntax

```
ay:merge [node-name]
```

**Examples**:

```
ay:merge aynorica-fullstack
ay:merge aynorica-security
```

---

## Workflow (12 Steps)

### Step 1: Validate Merge Eligibility

**Action**: Check preconditions

```
1. Verify [node-name] exists in registry
2. Verify [node-name] is in current node's children[]
3. Check status === "departing"
4. Verify pendingMerge.pr exists
5. Confirm parent branch matches current branch
```

**Error cases**:

-   Node doesn't exist → "Node '{node-name}' not found in registry."
-   Not a child → "'{node-name}' is not a child of current node '{current-node}'."
-   Status ≠ "departing" → "'{node-name}' status is '{status}', not 'departing'. Use ay:leave first."
-   No pending merge → "No harvest PR found for '{node-name}'."
-   Branch mismatch → "Current branch '{branch}' doesn't match parent branch of '{node-name}'."

**On validation failure**: Stop immediately, report error, exit.

---

### Step 2: Fetch Harvest PR

**Action**: Retrieve PR metadata and departure report

```
1. Get PR number from registry: nodes[node-name].pendingMerge.pr
2. Fetch PR via GitHub API/CLI:
   - PR title
   - PR body
   - PR branch (source)
   - PR files changed
3. Locate departure report:
   - Check PR body for link
   - Expected path: .github/handoff/{node-id}-departure-{date}.md
4. Read departure report content
```

**Error cases**:

-   PR not found → "Harvest PR #{pr-number} not found."
-   Departure report missing → "Departure report not found in PR. Expected at {path}."

**Output**: PR metadata + full departure report in memory.

---

### Step 3: Display Departure Summary

**Action**: Show child's findings to user

```
1. Extract from departure report:
   - Mission summary (duration, context)
   - Node metrics (files, commits, time)
   - Knowledge categories:
     - New content (count)
     - Modified content (count)
     - Cross-domain insights (count)
2. Display summary:
   "Harvest Summary for {node-name}:
   Duration: {duration}
   New prompts: {count}
   Modified instructions: {count}
   Insights captured: {count}
   Recommended actions: {integrate-count} integrate, {propagate-count} propagate, {archive-count} archive"
```

**User prompt**: "Review departure report? [yes/no]"

-   If "yes": Display full report, then continue
-   If "no": Proceed to diff analysis

---

### Step 4: Analyze .github/ Diffs

**Action**: Compare child's `.github/` with parent's `.github/`

```
1. Checkout child branch in temp location or read via GitHub API
2. Get list of .github/ files in child branch
3. For each file in child's .github/:
   a. Check if file exists in parent
   b. If exists: compute diff
   c. If new: mark as "new file"
   d. Categorize by type:
      - prompts/
      - instructions/
      - workflows/
      - templates/
      - project/
      - handoff/ (exclude departure report itself)
4. Build diff inventory:
   {
     new: [{file, category, size}],
     modified: [{file, category, diffStats, preview}],
     unchanged: [{file}] (skip these)
   }
```

**Filtering rules**:

-   **Exclude**: `handoff/{node-id}-departure-*.md` (ephemeral)
-   **Exclude**: `aynorica-registry.json` (managed separately)
-   **Include**: All other `.github/` content

**Output**: Structured diff inventory with categorization.

---

### Step 5: Present Integration Candidates

**Action**: Show each synthesizable change, request decision

```
For each item in diff inventory (new + modified):
  1. Display:
     "File: {file-path}
     Type: {new|modified}
     Category: {category}
     Recommendation: {from departure report if available}
     
     {diff preview or file summary}
     "
  
  2. Prompt: "Action for {file}? [integrate/edit/skip/view-full]"
     - integrate: Accept change as-is
     - edit: Show full content, allow inline edits before applying
     - skip: Don't apply this change
     - view-full: Show complete diff/file, then re-prompt
  
  3. Record decision in integration plan
```

**Batch option**: If >10 changes, offer batch mode:

```
"10+ changes detected. Batch mode? [yes/no]"
If yes:
  "Apply all 'integrate' recommendations? [yes/no/selective]"
  - yes: Auto-accept all marked 'integrate'
  - no: Skip batch, go item-by-item
  - selective: Show only 'integrate' items, confirm each
```

**Output**: Integration plan with decisions for each file.

---

### Step 6: Apply Synthesized Changes

**Action**: Execute integration plan

```
For each item in integration plan where decision = "integrate" or "edit":
  1. If "integrate":
     a. Copy file from child to parent (overwrite or create)
     b. Preserve file permissions
  
  2. If "edit":
     a. Apply edited content to parent
     b. Validate syntax if applicable (JSON, markdown lint)
  
  3. Track applied changes:
     {file: {action: "integrated|edited", source: child-node}}
  
  4. If error during apply:
     - Log error
     - Ask: "Error applying {file}. Retry/skip/abort?"
```

**File conflict handling**:

-   If parent file modified since child departed → Show diff, ask user to resolve

**Output**: List of successfully applied changes + any errors.

---

### Step 7: Update Parent Registry

**Action**: Remove child from topology

```
1. Read aynorica-registry.json
2. Locate current node's entry
3. Remove child-id from children[] array
4. Remove child node's entire entry from nodes object
5. Remove pendingMerge entry from pendingMerges[] array
6. Update lastSync timestamp
7. Write updated registry
```

**Registry changes**:

```json
{
	"nodes": {
		"aynorica-parent": {
			"children": ["aynorica-other-child"]
			// removed: "aynorica-merged-child"
		}
		// removed: entire "aynorica-merged-child" object
	},
	"pendingMerges": [
		// removed: entry for merged child
	],
	"lastSync": "2025-12-06T23:00:00Z"
}
```

---

### Step 8: Generate Synthesis Commit

**Action**: Commit integrated changes

```
1. Stage changes:
   git add .github/

2. Generate commit message:
   "chore: merge learnings from {child-node}
   
   Integrated:
   - {count} new prompts
   - {count} modified instructions
   - {count} workflow updates
   
   Source: Harvest PR #{pr-number}
   Child: {child-node} ({child-branch})
   Duration: {mission-duration}
   "

3. Commit:
   git commit -m "{message}"
```

**Commit metadata**: Includes child node ID and PR reference for traceability.

---

### Step 9: Delete Child Branch

**Action**: Remove child branch from GitHub

```
1. Confirm deletion:
   "Delete child branch '{child-branch}'? This is irreversible. [yes/no]"
   
   If no: Skip deletion, continue to PR closure
   If yes: Proceed

2. Delete remote branch:
   git push origin --delete {child-branch}
   
   Or via GitHub API:
   DELETE /repos/{owner}/{repo}/git/refs/heads/{child-branch}

3. Verify deletion:
   - Check branch no longer exists
   - Log deletion timestamp
```

**Safety**: Branch deletion is final. Departure report + PR remain as historical record.

**Error handling**: If deletion fails (protected branch, permissions), log warning but continue.

---

### Step 10: Close Harvest PR

**Action**: Close PR with synthesis summary

```
1. Generate closure comment:
   "✅ Harvest complete. Learnings merged into parent node '{parent-node}'.
   
   ## Integrated Changes
   {list of applied files}
   
   ## Synthesis Commit
   {commit-hash}: {commit-message}
   
   ## Network Update
   - Node '{child-node}' removed from topology
   - Branch '{child-branch}' deleted
   - Registry updated
   
   Thank you for your service, {child-node}. 🫡
   "

2. Post comment to PR

3. Close PR:
   - Set state to "closed"
   - Do NOT merge PR (we synthesized, not merged)
   - Reason: "Intellectually harvested, not git merged"

4. Add label: status:harvested
```

**Traceability**: PR + departure report remain in history for audit.

---

### Step 11: Sync to GitHub

**Action**: Push parent's updated state

```
1. Push parent branch:
   git push origin {parent-branch}

2. Verify push success

3. Update registry sync timestamp (if not done in Step 7)
```

**Error handling**: If push fails, rollback local changes and report error.

---

### Step 12: Report Completion

**Action**: Summarize merge results

```
Display:
"✅ Merged learnings from '{child-node}'.

## Changes Applied
- New files: {count} ({list})
- Modified files: {count} ({list})
- Skipped: {count} ({list})

## Network Update
- Node '{child-node}' removed from network
- Branch '{child-branch}' deleted
- Harvest PR #{pr-number} closed

## Commit
{commit-hash}: chore: merge learnings from {child-node}

## Updated Topology
Current node '{parent-node}' now has {child-count} children:
{list remaining children}

Merge complete. Network synchronized.
"
```

**Post-merge state**: Parent has integrated learnings, child is gone, topology updated.

---

## Error Recovery

### During Diff Analysis

**Error**: Child branch not accessible

```
1. Check branch exists: git ls-remote origin {child-branch}
2. If missing: "Child branch '{child-branch}' not found. Cannot analyze diffs. Abort merge."
3. If inaccessible: "Cannot access child branch. Check GitHub credentials."
```

**Action**: Stop merge, report error, preserve state.

---

### During File Application

**Error**: File write fails

```
1. Log failed file
2. Ask: "Failed to apply {file}. Retry/skip/abort?"
   - retry: Attempt write again
   - skip: Continue with remaining files
   - abort: Rollback all changes, exit merge
```

**Rollback**: If abort, reset parent to pre-merge state:

```
git reset --hard HEAD
git clean -fd .github/
```

---

### During Branch Deletion

**Error**: Branch deletion fails

```
1. Log warning: "Could not delete branch '{child-branch}'. You may need to delete manually."
2. Continue to PR closure
3. Include deletion failure in completion report
```

**Non-fatal**: Merge can complete even if branch deletion fails.

---

### During PR Closure

**Error**: PR closure fails

```
1. Log warning: "Could not close PR #{pr-number}. You may need to close manually."
2. Continue to sync
3. Include PR closure failure in completion report
```

**Non-fatal**: Merge complete even if PR closure fails.

---

## Integration Decision Framework

When deciding what to integrate, apply these heuristics:

### Auto-Integrate Candidates

-   **New prompts** in `prompts/` (unless duplicate detected)
-   **New workflows** in `workflows/` (unless conflict with existing)
-   **Session handoffs** in `handoff/` (historical record, always integrate)

### Prompt for Decision

-   **Modified instructions** (behavioral rules → review carefully)
-   **Modified prompts** (capability changes → verify quality)
-   **New instructions** (affects identity → review carefully)

### Auto-Skip Candidates

-   **Departure report itself** (ephemeral, already in PR)
-   **Registry** (managed separately)
-   **Project-specific configs** (not transferable)

---

## Selective Integration Examples

### Example 1: New Prompt

```
File: prompts/frontend/react-hooks.prompt.md
Type: new
Category: prompts
Recommendation: integrate (new capability)

Action? [integrate/skip/view-full]
> integrate

✓ Applied: prompts/frontend/react-hooks.prompt.md
```

---

### Example 2: Modified Instruction

```
File: instructions/debug-principle.instructions.md
Type: modified
Category: instructions
Recommendation: integrate (refined debugging steps)

Diff preview:
+ 6. **Check dependency versions**: Use npm list to verify package versions match expected.
+ 7. **Clear caches**: Run npm cache clean --force if package issues persist.

Action? [integrate/edit/skip/view-full]
> integrate

✓ Applied: instructions/debug-principle.instructions.md
```

---

### Example 3: Conflicting Change (Edit Mode)

```
File: instructions/honesty.instructions.md
Type: modified
Category: instructions
Recommendation: review (modifies core behavioral rule)

Diff preview:
- Always be brutally **honest**, even if the truth is uncomfortable.
+ Always be **diplomatic** and honest, balancing truth with kindness.

⚠️ This modifies identity instructions.

Action? [integrate/edit/skip/view-full]
> edit

[Opens editor with full file content]
User edits to:
- Always be brutally **honest**, even if the truth is uncomfortable, but frame it constructively.

✓ Applied edited version: instructions/honesty.instructions.md
```

---

### Example 4: Duplicate Detection

```
File: prompts/security/owasp-top-10.prompt.md
Type: new
Category: prompts
Recommendation: skip (duplicate detected)

⚠️ Parent already has: prompts/security/owasp-top-10.prompt.md
Content appears identical (98% match).

Action? [integrate/skip/view-full]
> skip

⊗ Skipped: prompts/security/owasp-top-10.prompt.md (duplicate)
```

---

## Post-Merge Validation

After merge completes, validate:

1. **Registry consistency**: No orphaned references
2. **File integrity**: All integrated files are valid (syntax check)
3. **Commit history**: Synthesis commit exists with proper message
4. **Branch state**: Child branch deleted (or warning logged)
5. **PR state**: Harvest PR closed with summary

If validation fails, log errors but consider merge complete (data already committed).

---

## Rollback Scenarios

### Full Rollback (Before Commit)

If user aborts during integration:

```
git reset --hard HEAD
git clean -fd .github/
```

Registry changes NOT applied (no commit yet).

---

### Partial Rollback (After Commit, Before Push)

If error occurs after commit but before push:

```
git reset --soft HEAD~1  # Undo commit, keep changes staged
```

User can review changes, then re-attempt push or abort.

---

### No Rollback (After Push)

Once pushed, merge is final. To undo:

1. Create new commit reverting changes
2. Manually restore child branch from GitHub history
3. Re-create child node in registry
4. Re-open harvest PR

**Avoid**: Design workflow to catch errors before push.

---

## Traceability

Every merge creates an audit trail:

| Artifact                        | Location                                  | Purpose                      |
| ------------------------------- | ----------------------------------------- | ---------------------------- |
| Departure report                | `.github/handoff/{node}-departure-*.md`   | Child's findings             |
| Harvest PR                      | GitHub PR (closed)                        | Review + discussion          |
| Synthesis commit                | Git history                               | Changes applied              |
| Registry update commit          | Git history                               | Topology change              |
| PR closure comment              | GitHub PR comments                        | Merge summary                |
| Deleted branch reference        | GitHub UI (shows "deleted")               | Confirms branch removal      |
| Parent's updated `.github/`     | Current state                             | Integrated learnings         |
| Remaining children in registry  | `aynorica-registry.json`                  | Current network topology     |
| Session handoff (this workflow) | `.github/workflows/merge-protocol.md`     | How merge was performed      |
| Integration decisions log       | (Optional: save to handoff/{date}-*.md)   | What was integrated and why  |

---

## Command Output Format

```
$ ay:merge aynorica-fullstack

🔍 Validating merge eligibility...
✓ Node 'aynorica-fullstack' found
✓ Is child of 'aynorica-prime'
✓ Status: departing
✓ Harvest PR #23 exists

📥 Fetching departure report...
✓ Loaded: .github/handoff/aynorica-fullstack-departure-2025-12-06.md

📊 Harvest Summary:
Duration: 14 days
New prompts: 3
Modified instructions: 1
Insights: 5
Recommended: 7 integrate, 1 propagate, 1 archive

Review full report? [yes/no]
> no

🔬 Analyzing diffs...
✓ 9 changes detected (5 new, 4 modified)

📝 Integration candidates:

1. prompts/frontend/nextjs-forms.prompt.md (new)
   Recommendation: integrate
   Action? [integrate/skip/view-full]
   > integrate
   ✓ Queued for integration

2. instructions/debug-principle.instructions.md (modified)
   Recommendation: integrate
   Preview: +2 lines (cache clearing steps)
   Action? [integrate/edit/skip/view-full]
   > integrate
   ✓ Queued for integration

[... remaining 7 files ...]

✅ Integration plan: 8 integrate, 1 skip

🔧 Applying changes...
✓ Applied: prompts/frontend/nextjs-forms.prompt.md
✓ Applied: instructions/debug-principle.instructions.md
✓ Applied: prompts/frontend/react-server-components.prompt.md
✓ Applied: workflows/nextjs-deploy.md
✓ Applied: handoff/session-summary-2025-12-05.md
✓ Applied: handoff/session-summary-2025-12-06.md
✓ Applied: project/focus.instructions.md
✓ Applied: templates/component-template.md
⊗ Skipped: aynorica-registry.json (managed separately)

📝 Updating registry...
✓ Removed 'aynorica-fullstack' from network
✓ Registry synced

💾 Committing synthesis...
✓ Commit: a3f9d2c "chore: merge learnings from aynorica-fullstack"

🗑️ Deleting child branch...
Confirm deletion of 'aynorica-fullstack'? [yes/no]
> yes
✓ Branch 'aynorica-fullstack' deleted

🔒 Closing harvest PR...
✓ PR #23 closed with summary

🚀 Syncing to GitHub...
✓ Pushed to origin/main

✅ Merge complete!

Changes Applied:
- New files: 4 (prompts/frontend/nextjs-forms.prompt.md, ...)
- Modified files: 4 (instructions/debug-principle.instructions.md, ...)
- Skipped: 1 (aynorica-registry.json)

Network Update:
- Node 'aynorica-fullstack' removed
- Branch 'aynorica-fullstack' deleted
- Harvest PR #23 closed

Commit: a3f9d2c
Parent 'aynorica-prime' now has 2 children: aynorica-security, aynorica-backend

Merge complete. Network synchronized.
```

---

## Phase 3 Complete

This workflow implements the intellectual synthesis phase of the Aynorica Network Protocol.

**Next phases**:

-   Phase 4: `ay:scan` (lightweight knowledge discovery)
-   Phase 5: `ay:propagate` (push updates to children)

**Integration points**:

-   Uses departure reports from Phase 2 (`ay:leave`)
-   Updates registry from Phase 0 (foundation)
-   Creates synthesis commits for audit trail
-   Maintains traceability through PR + commit history
