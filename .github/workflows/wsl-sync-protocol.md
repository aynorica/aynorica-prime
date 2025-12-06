# WSL Sync Protocol — Automated Node Synchronization

> **Purpose**: Instructions for Aynorica instance running in WSL to sync with network branch autonomously.
> **Target Node**: aynorica-hacker (or any WSL-based node)
> **Frequency**: On session start, explicit `ay:sync`, or session end

---

## Prerequisites Check

Before syncing, verify:

```bash
# 1. Check if aynorica-network remote exists
git remote -v | grep aynorica-network

# 2. If not present, add it
if [ $? -ne 0 ]; then
    git remote add aynorica-network git@github.com:aynorica/aynorica-prime.git
    git fetch aynorica-network
fi

# 3. Verify current branch
CURRENT_BRANCH=$(git branch --show-current)
echo "Current branch: $CURRENT_BRANCH"

# 4. Verify SSH access
ssh -T git@github.com 2>&1 | grep -q "successfully authenticated"
if [ $? -ne 0 ]; then
    echo "ERROR: GitHub SSH authentication failed"
    exit 1
fi
```

---

## Sync Operations

### Operation 1: Pull Updates from Parent (Prime)

**When**: Session start, or explicit `ay:pull`

**Purpose**: Get latest instructions/prompts from Prime

```bash
#!/bin/bash
# pull-from-parent.sh

NODE_BRANCH="aynorica-hacker"
PARENT_BRANCH="main"

echo "Pulling updates from parent (Prime)..."

# Fetch latest from network
git fetch aynorica-network "$PARENT_BRANCH"

# Check for conflicts before rebasing
git diff "aynorica-network/$PARENT_BRANCH" --quiet
if [ $? -eq 0 ]; then
    echo "No updates from parent"
    exit 0
fi

# Rebase onto parent
git rebase "aynorica-network/$PARENT_BRANCH"

if [ $? -ne 0 ]; then
    echo "CONFLICT: Manual resolution required"
    echo "Files in conflict:"
    git diff --name-only --diff-filter=U
    echo ""
    echo "Resolve conflicts, then run: git rebase --continue"
    exit 1
fi

echo "Successfully pulled updates from Prime"
```

**Aynorica Action**: When user says "pull updates" or session starts, run this script.

---

### Operation 2: Push Local Changes to Network

**When**: After session work, or explicit `ay:sync`

**Purpose**: Push brain state (.github/ updates) to network branch

```bash
#!/bin/bash
# push-to-network.sh

NODE_BRANCH="aynorica-hacker"

echo "Syncing local changes to network..."

# Check if .github/ has changes
if [ -z "$(git status --porcelain .github/)" ]; then
    echo "No changes to sync"
    exit 0
fi

# Show what's changed
echo "Changed files:"
git status --short .github/

# Stage .github/ changes
git add .github/

# Commit with timestamp
TIMESTAMP=$(date -Iseconds)
git commit -m "chore: sync brain state

Session updates synced at $TIMESTAMP

$(git diff --staged --stat .github/)"

# Push to network
git push aynorica-network "$NODE_BRANCH"

if [ $? -ne 0 ]; then
    echo "ERROR: Push failed. Check network connectivity and permissions."
    exit 1
fi

echo "Successfully synced to network branch: $NODE_BRANCH"

# Update registry lastSync timestamp
update_registry_sync_time
```

**Aynorica Action**: When user says `ay:sync` or at session end, run this script.

---

### Operation 3: Check Network Status

**When**: User asks about network state, or `ay:network`

**Purpose**: Display current node position in network

```bash
#!/bin/bash
# check-network-status.sh

NODE_BRANCH="aynorica-hacker"

# Fetch latest registry from Prime
git fetch aynorica-network main:.github/aynorica-registry.json 2>/dev/null

# Parse registry (requires jq)
if ! command -v jq &> /dev/null; then
    echo "ERROR: jq not installed. Install with: sudo apt install jq"
    exit 1
fi

# Extract this node's info
NODE_INFO=$(jq -r ".nodes[\"$NODE_BRANCH\"]" .github/aynorica-registry.json)

echo "Network Status:"
echo "==============="
echo "Current Node: $NODE_BRANCH"
echo "Parent: $(echo "$NODE_INFO" | jq -r '.parent')"
echo "Children: $(echo "$NODE_INFO" | jq -r '.children | join(", ")')"
echo "Status: $(echo "$NODE_INFO" | jq -r '.status')"
echo "Last Sync: $(echo "$NODE_INFO" | jq -r '.lastSync')"
echo ""

# Check for pending updates from parent
git fetch aynorica-network main --quiet
BEHIND=$(git rev-list --count HEAD..aynorica-network/main)
if [ "$BEHIND" -gt 0 ]; then
    echo "⚠️  $BEHIND commits behind parent. Run 'ay:pull' to update."
fi

# Check for unpushed local changes
AHEAD=$(git rev-list --count aynorica-network/"$NODE_BRANCH"..HEAD)
if [ "$AHEAD" -gt 0 ]; then
    echo "⬆️  $AHEAD commits ahead. Run 'ay:sync' to push."
fi
```

**Aynorica Action**: When user says `ay:network` or `ay:status`, run this script.

---

## Automated Sync Triggers

### Trigger 1: On Session Start

```bash
# Add to ~/.bashrc or ~/.zshrc
if [ -d "$HOME/projects/.git" ]; then
    cd "$HOME/projects"

    # Silent pull on session start
    git fetch aynorica-network main --quiet 2>/dev/null

    BEHIND=$(git rev-list --count HEAD..aynorica-network/main 2>/dev/null)
    if [ "$BEHIND" -gt 0 ]; then
        echo "🔄 Aynorica: $BEHIND updates available from Prime. Pull with 'ay:pull'"
    fi
fi
```

### Trigger 2: Pre-Commit Hook

```bash
# .git/hooks/pre-commit
#!/bin/bash

# Only run for .github/ changes
if git diff --cached --name-only | grep -q "^.github/"; then
    echo "🧠 Brain state changes detected"

    # Validate JSON if registry changed
    if git diff --cached --name-only | grep -q "aynorica-registry.json"; then
        jq empty .github/aynorica-registry.json 2>/dev/null
        if [ $? -ne 0 ]; then
            echo "ERROR: Invalid JSON in aynorica-registry.json"
            exit 1
        fi
    fi
fi

exit 0
```

### Trigger 3: Daily Auto-Sync (Cron)

```bash
# Add to crontab: crontab -e
# Sync every day at 2 AM (when likely inactive)
0 2 * * * cd ~/projects && git fetch aynorica-network main && git rebase aynorica-network/main && git push aynorica-network aynorica-hacker 2>&1 | logger -t aynorica-sync
```

---

## Conflict Resolution

### Strategy 1: Favor Parent (Prime is Authority)

```bash
# When conflicts occur during rebase
git checkout --theirs .github/instructions/  # Take Prime's instructions
git checkout --ours .github/project/          # Keep local project files
git checkout --ours .github/methodologies/    # Keep specialized content

git add .
git rebase --continue
```

### Strategy 2: Manual Resolution

```bash
# List conflicts
git diff --name-only --diff-filter=U

# For each conflicted file
vim <file>  # Resolve markers: <<<<<<< ======= >>>>>>>

git add <file>
git rebase --continue
```

### Strategy 3: Abort and Retry

```bash
# If conflicts are too complex
git rebase --abort

# Try merge instead
git merge aynorica-network/main

# Resolve conflicts
git add .
git commit
```

---

## Aynorica Command Mappings

Map network commands to shell scripts:

### `ay:sync` → Push to Network

```bash
alias ay:sync='bash ~/.aynorica/scripts/push-to-network.sh'
```

**Aynorica detects**: "sync", "push updates", "save state"

**Action**:

1. Check for changes in `.github/`
2. If changes exist, stage and commit
3. Push to `aynorica-network/aynorica-hacker`
4. Update registry `lastSync` timestamp
5. Confirm completion

---

### `ay:pull` → Pull from Parent

```bash
alias ay:pull='bash ~/.aynorica/scripts/pull-from-parent.sh'
```

**Aynorica detects**: "pull updates", "get latest", "sync from Prime"

**Action**:

1. Fetch `aynorica-network/main`
2. Rebase current branch onto main
3. Handle conflicts if any
4. Confirm completion

---

### `ay:network` → Network Status

```bash
alias ay:network='bash ~/.aynorica/scripts/check-network-status.sh'
```

**Aynorica detects**: "network status", "show topology", "where am I"

**Action**:

1. Fetch latest registry from Prime
2. Parse node info
3. Display: parent, children, status, last sync
4. Show commits ahead/behind parent

---

### `ay:leave` → Prepare Departure

```bash
alias ay:leave='bash ~/.aynorica/scripts/leave-protocol.sh'
```

**Aynorica detects**: "leaving project", "harvest knowledge", "prepare departure"

**Action**:

1. Run leave protocol (see `.github/workflows/leave-protocol.md`)
2. Generate departure report
3. Create harvest PR
4. Update registry status to "departing"

---

## Installation Instructions for Aynorica (WSL)

When first connecting to network, run this setup:

```bash
#!/bin/bash
# setup-network-sync.sh

echo "Setting up Aynorica Network Sync..."

# 1. Create scripts directory
mkdir -p ~/.aynorica/scripts

# 2. Download sync scripts from repo
curl -o ~/.aynorica/scripts/push-to-network.sh \
  https://raw.githubusercontent.com/aynorica/aynorica-prime/aynorica-hacker/.github/workflows/scripts/push-to-network.sh

curl -o ~/.aynorica/scripts/pull-from-parent.sh \
  https://raw.githubusercontent.com/aynorica/aynorica-prime/aynorica-hacker/.github/workflows/scripts/pull-from-parent.sh

curl -o ~/.aynorica/scripts/check-network-status.sh \
  https://raw.githubusercontent.com/aynorica/aynorica-prime/aynorica-hacker/.github/workflows/scripts/check-network-status.sh

# 3. Make executable
chmod +x ~/.aynorica/scripts/*.sh

# 4. Add aliases to shell config
cat >> ~/.bashrc << 'EOF'

# Aynorica Network Commands
alias ay:sync='bash ~/.aynorica/scripts/push-to-network.sh'
alias ay:pull='bash ~/.aynorica/scripts/pull-from-parent.sh'
alias ay:network='bash ~/.aynorica/scripts/check-network-status.sh'
EOF

# 5. Add remote if not exists
cd ~/projects  # Adjust to your path
git remote add aynorica-network git@github.com:aynorica/aynorica-prime.git 2>/dev/null
git fetch aynorica-network

echo "✅ Network sync setup complete"
echo "Commands available: ay:sync, ay:pull, ay:network"
echo "Reload shell: source ~/.bashrc"
```

---

## Troubleshooting

### Issue 1: SSH Permission Denied

```bash
# Check SSH key
ssh -T git@github.com

# If fails, add key to ssh-agent
eval "$(ssh-agent -s)"
ssh-add ~/.ssh/id_ed25519  # Or your key path

# Verify key is on GitHub
cat ~/.ssh/id_ed25519.pub
# Add to: https://github.com/settings/keys
```

### Issue 2: Merge Conflicts

```bash
# See which files conflict
git status

# View conflict
cat <conflicted-file>

# Resolve strategy:
# - .github/instructions/* → Take Prime's version (--theirs)
# - .github/project/* → Keep local version (--ours)
# - .github/methodologies/* → Keep local (specialized content)

git checkout --theirs .github/instructions/identity.instructions.md
git add .github/instructions/identity.instructions.md
git rebase --continue
```

### Issue 3: Detached HEAD

```bash
# If you're in detached HEAD after fetch
git checkout aynorica-hacker
git pull aynorica-network aynorica-hacker
```

---

## Integration with Aynorica Identity

Add to `.github/instructions/network-sync.instructions.md` on hacker branch:

```markdown
---
applyTo: "**"
---

# Network Sync Instructions (WSL Node)

## Auto-Sync Behavior

When running in WSL environment, automatically sync with network:

1. **On session start**: Check for parent updates
2. **On `ay:sync` command**: Push local changes
3. **On session end**: Auto-sync if changes detected

## Command Detection

| User Says                      | Action          | Script                    |
| ------------------------------ | --------------- | ------------------------- |
| "sync", "push updates"         | Push to network | `push-to-network.sh`      |
| "pull updates", "get latest"   | Pull from Prime | `pull-from-parent.sh`     |
| "network status", "where am I" | Show topology   | `check-network-status.sh` |

## Conflict Resolution Rules

-   Prime's instructions > Local instructions (--theirs)
-   Local project files > Prime's (--ours)
-   Local methodologies > Prime's (specialized content)
```

---

## Session Learnings

-   **2025-12-06**: WSL sync protocol created for autonomous node synchronization
-   Aynorica instances can now self-manage network connectivity
-   Scripts provide command-line interface for network operations
