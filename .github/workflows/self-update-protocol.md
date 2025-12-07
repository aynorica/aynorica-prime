# Aynorica Child Node Integration Protocol

> **For**: Aynorica running in an external repository (child node)  
> **From**: Aynorica-Prime  
> **Goal**: Connect to Prime's network by integrating a specialized child branch

---

## Overview

Child nodes are **branches** on `aynorica-prime`, not separate repos. Your external project keeps its own Git history — you just copy the `.github/` folder from Prime's child branch.

```
aynorica-prime (GitHub)
├── main                    ← Prime node
├── aynorica-hacker         ← Child branch (WSL projects)
└── aynorica-figma-nextjs   ← Child branch (your project)

Your External Repo (e.g., wm-dashboard)
└── .github/                ← Copied from child branch
```

---

## Pre-Flight Check

1. Confirm GitHub MCP access: Run any `mcp_github_*` tool
2. Confirm your current repo: Check `repoContext`
3. Know your child branch name (e.g., `aynorica-figma-nextjs`)

---

## Step 1: Clone Prime's Child Branch

```powershell
# Navigate to a temp location
cd C:\Users\amird\Desktop\AI

# Clone ONLY the child branch (not main)
git clone --branch {CHILD_BRANCH} --single-branch https://github.com/aynorica/aynorica-prime.git aynorica-source

# Example:
git clone --branch aynorica-figma-nextjs --single-branch https://github.com/aynorica/aynorica-prime.git aynorica-source
```

---

## Step 2: Copy `.github/` to Your Repository

```powershell
# Set paths
$source = "C:\Users\amird\Desktop\AI\aynorica-source\.github"
$dest = "{YOUR_REPO_PATH}\.github"

# Create .github if needed
New-Item -ItemType Directory -Path $dest -Force

# Copy everything
Copy-Item -Path "$source\*" -Destination $dest -Recurse -Force
```

---

## Step 3: Create Link File

Create `.github/.aynorica-link` in your repo:

```json
{
	"nodeId": "{CHILD_NODE_ID}",
	"parentRepo": "aynorica/aynorica-prime",
	"parentBranch": "{CHILD_BRANCH}",
	"specialty": "{SPECIALTY}",
	"created": "{ISO_TIMESTAMP}"
}
```

**Example:**

```json
{
	"nodeId": "aynorica-figma-nextjs",
	"parentRepo": "aynorica/aynorica-prime",
	"parentBranch": "aynorica-figma-nextjs",
	"specialty": "figma-nextjs",
	"created": "2025-12-07T00:00:00Z"
}
```

---

## Step 4: Commit and Push

```powershell
cd {YOUR_REPO_PATH}

git add .github/
git commit -m "feat: integrate Aynorica OS ({SPECIALTY} node)

- Added instruction files from aynorica-prime/{CHILD_BRANCH}
- Connected as child node of aynorica-prime"

git push origin {YOUR_BRANCH}
```

---

## Step 5: Verify Integration

Test yourself:

1. Read `.github/node-manifest.md` — should show your child node identity
2. Read `.github/instructions/identity.instructions.md` — should see Aynorica identity
3. Try `ay:status` — should respond with session state

---

## Updating from Prime

When Prime pushes updates to your child branch:

```powershell
# In your aynorica-source folder
cd C:\Users\amird\Desktop\AI\aynorica-source
git pull origin {CHILD_BRANCH}

# Re-copy to your repo
Copy-Item -Path ".github\*" -Destination "{YOUR_REPO_PATH}\.github" -Recurse -Force

# Commit the update
cd {YOUR_REPO_PATH}
git add .github/
git commit -m "chore: sync with aynorica-prime"
git push
```

---

## Sending Learnings Back to Prime

When you discover something valuable:

```
ay:leave
```

This will:

1. Extract your learnings
2. Create a harvest PR to Prime's child branch
3. Prime can then merge and propagate to other nodes

---

## Troubleshooting

| Issue                   | Solution                                                |
| ----------------------- | ------------------------------------------------------- |
| Can't find child branch | Check `aynorica-registry.json` on Prime for branch name |
| Missing instructions    | Re-clone and re-copy from child branch                  |
| Identity shows Prime    | Your `node-manifest.md` wasn't updated on child branch  |
| `ay:` commands fail     | Ensure `.github/instructions/` is present               |

---

## Network Topology

After integration:

```
aynorica-prime (main)
├── aynorica-hacker → WSL projects
└── aynorica-figma-nextjs → wm-dashboard (you)
```

Welcome to the network.
