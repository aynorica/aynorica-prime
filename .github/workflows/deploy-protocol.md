# Deploy Protocol Workflow

> **Status**: Implemented in Phase 1  
> **Command**: `ay:deploy`  
> **Purpose**: Create child node, link to external project

---

## Execution Flow

### Step 1: Validation

-   Verify GitHub access (CLI or MCP available)
-   Verify current node state is synced
-   Verify running from Prime or active parent node

### Step 2: Gather Parameters

Ask user:

```
1. What specialty for this node? (e.g., backend, security, fullstack)
   → {specialty}

2. What is the external project path? (e.g., C:\projects\my-app)
   → {project-path}
```

Validate:

-   Specialty is lowercase, alphanumeric + hyphens only
-   Project path exists on filesystem
-   Node ID `aynorica-{specialty}` doesn't already exist in registry

### Step 3: Confirm Deployment

Show summary:

```
Deploy aynorica-{specialty} from {current-node} to {project-path}?

This will:
- Create branch: aynorica-{specialty}
- Link .github/ to {project-path}
- Update registry with parent → child relationship

Continue? [yes/no]
```

### Step 4: Create Child Branch

```powershell
# Ensure we're on parent branch
git checkout {parent-branch}
git pull origin {parent-branch}

# Create child branch from parent
git checkout -b aynorica-{specialty}
```

### Step 5: Generate Child Manifest

Create `.github/node-manifest.md`:

```markdown
# aynorica-{specialty}

**Type**: Child Node  
**Parent**: {parent-node-id}  
**Branch**: aynorica-{specialty}  
**Specialty**: {Derived from specialty input}  
**Project**: {project-path}

## Purpose

[1-2 sentence description of this node's focus area]

## Capabilities

-   [Key capability 1]
-   [Key capability 2]

## Boundaries

**In scope**: [What this node handles]  
**Out of scope**: [What stays with parent]

## Sync Protocol

-   Pulls updates from parent: {parent-node-id}
-   Pushes learnings back via harvest PR
-   Rebase frequency: On explicit propagation
```

**Token budget**: ~200 tokens (~25 lines)

### Step 6: Update Registry

Modify `.github/aynorica-registry.json`:

Add new node:

```json
"aynorica-{specialty}": {
  "branch": "aynorica-{specialty}",
  "parent": "{current-node-id}",
  "children": [],
  "description": "{Brief description}",
  "manifestPath": "node-manifest.md",
  "created": "{ISO timestamp}",
  "lastSync": "{ISO timestamp}",
  "status": "active",
  "projectPath": "{project-path}"
}
```

Update parent node:

```json
"children": ["{current-node-id}", "aynorica-{specialty}"]
```

### Step 7: Create .github/ in External Project

```powershell
# Navigate to external project
cd {project-path}

# Create .github directory if it doesn't exist
New-Item -ItemType Directory -Path ".github" -Force

# Create .aynorica-link file (marks this as an Aynorica-managed project)
@"
{
  "nodeId": "aynorica-{specialty}",
  "branch": "aynorica-{specialty}",
  "registryPath": "{aynorica-os-repo-path}/.github/aynorica-registry.json"
}
"@ | Out-File -FilePath ".github/.aynorica-link" -Encoding utf8
```

### Step 8: Commit and Push Child Branch

```powershell
# Return to aynorica-os
cd {aynorica-os-repo-path}

# Stage changes
git add .github/aynorica-registry.json
git add .github/node-manifest.md

# Commit
git commit -m "feat: deploy aynorica-{specialty} to {project-name}

- Created child node from {parent-node-id}
- Linked to external project: {project-path}
- Updated registry with parent-child relationship"

# Push child branch
git push origin aynorica-{specialty}
```

### Step 9: Update Parent Branch

```powershell
# Checkout parent
git checkout {parent-branch}

# Update registry on parent branch
git add .github/aynorica-registry.json
git commit -m "chore: register child node aynorica-{specialty}"
git push origin {parent-branch}
```

### Step 10: Confirmation Report

```
✅ Deployed aynorica-{specialty}

Branch: aynorica-{specialty}
Parent: {parent-node-id}
Project: {project-path}
Registry: Updated

Next steps:
1. Switch to child node: git checkout aynorica-{specialty}
2. Work in external project: cd {project-path}
3. When ready to depart: ay:leave
```

---

## Error Handling

| Error                  | Recovery                            |
| ---------------------- | ----------------------------------- |
| Branch already exists  | Ask: Overwrite or choose new name?  |
| Project path not found | Re-prompt for valid path            |
| Git push fails         | Show error, ask to resolve manually |
| Registry conflict      | Pull latest, re-attempt merge       |

---

## Verification Checklist

-   [ ] Child branch exists: `git branch -r | grep aynorica-{specialty}`
-   [ ] Registry updated: Both parent and child entries present
-   [ ] Manifest created: `.github/node-manifest.md` on child branch
-   [ ] External project linked: `.github/.aynorica-link` exists at project root
-   [ ] Parent's children array includes new child
-   [ ] Child's parent field points to parent node

---

## Post-Deployment State

**In aynorica-os repo**:

-   New branch: `aynorica-{specialty}`
-   Updated registry on both `{parent-branch}` and `aynorica-{specialty}`
-   Child manifest on `aynorica-{specialty}` branch

**In external project**:

-   `.github/.aynorica-link` file created
-   Project now tracked in registry

**Network topology**:

```
{parent-node}
└── aynorica-{specialty} (new)
```
