# Leave Protocol Workflow

> **Command**: `ay:leave` > **Purpose**: Prepare departure from external project, extract learnings, create harvest PR

---

## Preconditions

-   Current node is NOT Prime (can't leave from root)
-   Node is deployed to an external project
-   GitHub access available (MCP or CLI)
-   Current node state synced (`ay:sync` recommended)

---

## Execution Flow

### Step 1: Validate Departure Eligibility

```
1. Check current node from .aynorica-link or context
2. If node === "aynorica-prime":
   → ABORT: "Cannot leave from Prime node"
3. Read registry, confirm node has externalProject field
4. If no externalProject:
   → ABORT: "Node not linked to external project"
```

### Step 2: User Confirmation

**Prompt**:

```
This will prepare departure from {project-path}.
Actions:
- Scan .github/ for learnings
- Generate departure report
- Create harvest PR to parent ({parent-node})
- Update node status to "departing"

Continue? [yes/no]
```

**On "no"**: ABORT, no changes made

---

### Step 3: Scan for Transferable Knowledge

**Directories to scan**:

-   `.github/prompts/` → new or modified prompts
-   `.github/instructions/` → instruction changes
-   `.github/project/` → session learnings, ADRs, handoffs
-   `.github/handoff/` → session reports

**For each file**:

```
1. Check if file exists in parent branch
2. If NEW:
   - Include full content
   - Tag as "new capability"
3. If MODIFIED:
   - Diff against parent version
   - Extract only transferable changes (filter project-specific)
4. If project-specific (e.g., external-project-name in content):
   - Mark for exclusion or anonymization
```

**Output**: Structured data object with categorized learnings

---

### Step 4: Generate Departure Report

**File**: `departure-report.md` in current branch's `.github/handoff/`

**Template**:

```markdown
# {Node Name} Departure Report

## Mission Summary

**Node**: {node-id}
**Parent**: {parent-node}
**External Project**: {project-path}
**Deployed**: {created-date}
**Departing**: {current-date}
**Duration**: {days} days

## Context

{Brief description of what this node was doing in the external project}

## Transferable Learnings

### New Capabilities Added

| Category | File | Description |
| -------- | ---- | ----------- |

{For each new prompt/instruction}
| {domain} | {filename} | {what-it-does} |

### Modified Instructions

| File | Change | Reason |
| ---- | ------ | ------ |

{For each modified instruction}
| {filename} | {summary-of-change} | {why-it-matters} |

### Session Insights

{Extract from session-state.md, handoff reports}

-   **Work patterns observed**: {patterns}
-   **Amir profile updates**: {any new behavioral observations}
-   **Effective techniques**: {what worked well}
-   **Anti-patterns discovered**: {what didn't work}

### Recommended Actions for Parent

1. **Integrate**: {specific files to merge}
2. **Propagate**: {patterns to push to other children}
3. **Archive**: {project-specific content to keep but not propagate}

## Artifacts

### New Prompts

{List with brief description}

### Modified Instructions

{List with diff summary}

### Notable Commits

{Significant commits from this node's history}

## Network Impact

**Children affected**: {if this node has children, list them}
**Propagation recommendation**: {should changes go to siblings?}

---

**Generated**: {timestamp}
**Status**: Ready for harvest
```

**Save to**: `.github/handoff/{node-id}-departure-{YYYY-MM-DD}.md`

---

### Step 5: Create File Change Summary

**Purpose**: Prepare for PR diff review

```
1. Run git diff origin/{parent-branch}..HEAD -- .github/
2. Categorize changes:
   - New files
   - Modified files
   - Deleted files (rare, note if present)
3. Generate change table for PR body
```

---

### Step 6: Commit Departure Report

```bash
git add .github/handoff/{node-id}-departure-{date}.md
git commit -m "chore: prepare departure from {project-name}"
git push origin {current-branch}
```

**Verification**: Confirm commit pushed successfully

---

### Step 7: Create Harvest PR

**Target repo**: `aynorica/aynorica-prime`  
**Source branch**: `{current-node-branch}`  
**Target branch**: `{parent-branch}`

**PR Title**:

```
[Harvest] {Node Name} → {Parent Name}
```

**PR Body Template**:

```markdown
## 🌾 Harvest Request

**Node**: `{node-id}`  
**Parent**: `{parent-node}`  
**Project**: `{project-path}`  
**Duration**: {days} days

---

## 📊 Summary

{2-3 sentence summary of what this node learned}

---

## 📦 Transferable Artifacts

| Type                  | Count | Examples        |
| --------------------- | ----- | --------------- |
| New Prompts           | {n}   | {list top 3}    |
| Modified Instructions | {n}   | {list files}    |
| Session Learnings     | {n}   | {handoff count} |

---

## 🔗 Departure Report

See full details: [departure-report.md](.github/handoff/{node-id}-departure-{date}.md)

---

## 🗂️ Changed Files

{Insert file change table from Step 5}

---

## ✅ Review Checklist

-   [ ] Review new prompts for reusability
-   [ ] Check instruction modifications for conflicts
-   [ ] Validate session learnings are anonymized
-   [ ] Decide on propagation to siblings
-   [ ] Merge or archive project-specific content

---

**Merge Command**: `ay:merge {node-id}`

---

<details>
<summary>🤖 Automated by Aynorica Leave Protocol</summary>

This PR was generated by the `ay:leave` command.  
Next step: Parent node runs `ay:merge {node-id}` to synthesize learnings.

</details>
```

**Create PR via**:

-   **MCP GitHub**: `mcp_github_github_create_pull_request`
-   **GitHub CLI**: `gh pr create --base {parent-branch} --head {current-branch} --title "..." --body "..."`

**Labels to add**:

-   `type:harvest`
-   `status:pending-review`
-   `node:{node-id}`

---

### Step 8: Update Registry

**Changes**:

```json
{
  "nodes": {
    "{node-id}": {
      "status": "departing",
      "departureDate": "{ISO-timestamp}",
      "pendingMerge": {
        "prNumber": {pr-number},
        "prUrl": "{pr-url}",
        "createdAt": "{ISO-timestamp}"
      }
    }
  },
  "{parent-node}": {
    "pendingMerges": [
      {
        "childNode": "{node-id}",
        "prNumber": {pr-number},
        "createdAt": "{ISO-timestamp}"
      }
    ]
  }
}
```

**Commit**:

```bash
git add .github/aynorica-registry.json
git commit -m "chore: mark {node-id} as departing (PR #{pr-number})"
git push origin {current-branch}
```

---

### Step 9: Notify Parent

**Report to user**:

```
✅ Departure prepared for {node-id}

Actions completed:
- Scanned {n} files for learnings
- Generated departure report
- Created PR: {pr-url}
- Updated registry (status: departing)

Next steps:
1. Review PR: {pr-url}
2. Parent node ({parent-node}) should run:
   ay:merge {node-id}

Node will remain operational until merged.
```

---

### Step 10: Post-Departure State

**Node status**: `departing` (still functional, can continue work if needed)  
**PR status**: `open`, awaiting parent review  
**Registry**: Updated with pending merge metadata

**What's preserved**:

-   Node branch remains intact
-   External project link remains active
-   All history preserved

**What changes**:

-   Status flag (signals intent to harvest)
-   Pending merge entry in parent's queue

---

## Error Handling

### PR Creation Fails

```
1. Log error details
2. Keep departure report in branch
3. Suggest manual PR creation: "Visit {github-url} to create PR manually"
4. Do NOT update registry status
5. Report: "Departure report created, but PR failed. Manual intervention needed."
```

### Registry Update Fails

```
1. Note the PR was created successfully
2. Log registry sync error
3. Suggest manual fix: "PR created, but registry sync failed. Check network-protocol.md for manual steps."
```

### Scan Finds No Changes

```
1. Confirm with user: "No .github/ changes detected. Proceed with empty harvest?"
2. On "yes": Create minimal departure report with metadata only
3. On "no": ABORT, no PR created
```

### External Project Link Missing

```
1. Check for .aynorica-link file
2. If missing: "Cannot determine external project. Node may not be properly deployed."
3. Ask: "Proceed with departure anyway? (PR will note 'unknown project')"
```

---

## Verification Checklist

After execution:

-   [ ] Departure report exists in `.github/handoff/`
-   [ ] Report contains transferable learnings summary
-   [ ] PR created successfully (check URL works)
-   [ ] PR has correct labels
-   [ ] Registry shows node status = "departing"
-   [ ] Parent has `pendingMerges` entry
-   [ ] Commit history clean (no merge conflicts)
-   [ ] User notified with next steps

---

## Integration Points

| System              | Integration                                    |
| ------------------- | ---------------------------------------------- |
| **Deploy Protocol** | Reverse of deployment — unlink instead of link |
| **Merge Protocol**  | This creates the input for `ay:merge`          |
| **Registry**        | Updates topology status                        |
| **Handoff Format**  | Departure report follows handoff template      |
| **GitHub MCP**      | Uses PR creation tools                         |

---

## Future Enhancements

-   [ ] Auto-detect knowledge categories (security, architecture, etc.)
-   [ ] Dry-run mode: Generate report without creating PR
-   [ ] Departure scheduling: Set departure date in advance
-   [ ] Multi-node departure: Batch process for multiple nodes
-   [ ] Anonymization tool: Strip project-specific references automatically

---

**Phase**: 2 (Leave Protocol)  
**Status**: Implementation complete  
**Next phase**: Phase 3 (Merge Protocol)
