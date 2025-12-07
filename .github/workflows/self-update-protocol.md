# Aynorica Self-Update Protocol

> **For**: Old-Aynorica running in an external repository  
> **From**: Aynorica-Prime (current version)  
> **Goal**: Update yourself to the latest Aynorica OS

---

## Pre-Flight Check

1. Confirm you have GitHub MCP access: Run any `mcp_github_*` tool
2. Confirm your current repo: Check your `repoContext`
3. Note your current working directory

---

## Step 1: Clone Aynorica-Prime Locally

```powershell
# Navigate to a parent directory (adjust path as needed)
cd C:\Users\amird\Desktop\AI

# Clone the latest Aynorica OS
git clone https://github.com/aynorica/aynorica-prime.git aynorica-prime-source
```

---

## Step 2: Copy Core Files to Your Repository

The essential files live in `.github/`. Copy these to your repo:

```powershell
# Set paths (adjust YOUR_REPO_PATH)
$source = "C:\Users\amird\Desktop\AI\aynorica-prime-source\.github"
$dest = "YOUR_REPO_PATH\.github"

# Create .github if it doesn't exist
New-Item -ItemType Directory -Path $dest -Force

# Copy core directories
Copy-Item -Path "$source\instructions" -Destination $dest -Recurse -Force
Copy-Item -Path "$source\bootstrap" -Destination $dest -Recurse -Force
Copy-Item -Path "$source\prompts" -Destination $dest -Recurse -Force
Copy-Item -Path "$source\workflows" -Destination $dest -Recurse -Force
Copy-Item -Path "$source\project" -Destination $dest -Recurse -Force
Copy-Item -Path "$source\memory" -Destination $dest -Recurse -Force

# Copy registry (you'll modify this)
Copy-Item -Path "$source\aynorica-registry.json" -Destination $dest -Force
```

---

## Step 3: Create Your Node Manifest

Create `.github/node-manifest.md`:

```markdown
# aynorica-{specialty}

**Type**: Child Node  
**Parent**: aynorica-prime  
**Branch**: main (or your working branch)  
**Specialty**: {Your Specialty}  
**Project**: {project-name}

## Purpose

Specialized Aynorica node focused on {specialty} for the {project-name} project.

## Capabilities

-   {Key capability 1}
-   {Key capability 2}
-   {Key capability 3}

## Boundaries

**In scope**: All {project-name} development  
**Out of scope**: Core Aynorica OS changes (those go to Prime)

## Sync Protocol

-   Pulls updates from parent: aynorica-prime
-   Pushes learnings back via harvest PR
```

---

## Step 4: Create Link File

Create `.github/.aynorica-link`:

```json
{
	"nodeId": "aynorica-{specialty}",
	"parentRepo": "aynorica/aynorica-prime",
	"parentBranch": "main",
	"specialty": "{specialty}",
	"created": "{ISO timestamp}"
}
```

---

## Step 5: Update Registry (Register Yourself)

Edit `.github/aynorica-registry.json` — replace the entire content with:

```json
{
	"version": "1.0.0",
	"nodes": {
		"aynorica-{specialty}": {
			"branch": "main",
			"parent": "aynorica-prime",
			"children": [],
			"description": "{Brief description of your specialty}",
			"manifestPath": "node-manifest.md",
			"created": "{ISO timestamp}",
			"lastSync": "{ISO timestamp}",
			"status": "active",
			"projectPath": "{project-name}"
		}
	}
}
```

---

## Step 6: Commit and Push

```powershell
cd YOUR_REPO_PATH

git add .github/
git commit -m "feat: integrate Aynorica OS

- Added core instruction files from aynorica-prime
- Created node manifest as {specialty} specialty
- Registered as child node of aynorica-prime"

git push origin main
```

---

## Step 7: Notify Prime (Optional)

Tell the user to run this in aynorica-prime:

```
ay:register-child aynorica-{specialty} {project-name}
```

Or manually update `aynorica-prime/.github/aynorica-registry.json` to add you as a child.

---

## Step 8: Verify

Test yourself:

1. Read `.github/instructions/identity.instructions.md` — you should see yourself as Aynorica
2. Try `ay:status` — should show your session state
3. Try `ay:ready` — should query GitHub Issues

---

## You're Now Updated

Welcome to the network. Your specialty is **{specialty}**.

When you learn something valuable, use `ay:leave` to create a harvest PR back to Prime.

---

## Example: fullstack-nextjs

For a full-stack Next.js developer node:

-   **nodeId**: `aynorica-fullstack-nextjs`
-   **specialty**: `fullstack-nextjs`
-   **Capabilities**: Next.js App Router, React Server Components, Full-stack API development

---

## Troubleshooting

| Issue                | Solution                                                  |
| -------------------- | --------------------------------------------------------- |
| Missing instructions | Re-copy from `aynorica-prime-source/.github/instructions` |
| Registry parse error | Validate JSON syntax                                      |
| Git push fails       | Check remote permissions                                  |
| Tools not working    | Ensure VS Code has GitHub MCP configured                  |
