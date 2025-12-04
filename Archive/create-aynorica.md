# `create-aynorica` Implementation Plan

**Project Type:** Standalone npm CLI Package  
**Purpose:** Scaffold new projects with Aynorica's `.github/` configuration  
**Status:** 🏗️ Planning Phase  
**Target Launch:** v1.0.0

---

## 📋 Executive Summary

**User Experience:**

```bash
npx create-aynorica my-project
# → Interactive prompts for customization
# → Creates my-project/.github/ with replaced templates
# → Ready-to-use Aynorica configuration
```

**Core Principle:** Always fetch latest `.github/` from main branch — no bundled templates, fail fast on network errors.

---

## 🎯 Project Specifications

### Scope

-   **Include:** `.github/` directory from `aynorica/aynorica-os` main branch
-   **Exclude:** Vault files, packages, infrastructure configs
-   **Customization:** Replace `{{PLACEHOLDERS}}` in `.instructions.md` files
-   **Prompts:** Name, email, timezone (4 required fields)

### Non-Goals (v1.0.0)

-   ❌ Vault structure initialization (future: `create-aynorica vault`)
-   ❌ Git repository initialization (user decides)
-   ❌ Dependency installation (no package.json in template)
-   ❌ Offline mode / bundled templates

---

## 🏗️ Architecture

### Package Structure

```
create-aynorica/
├── package.json              # ESM package, bin entry
├── README.md                 # Usage, examples, troubleshooting
├── LICENSE                   # MIT
├── .gitignore
├── .npmignore                # Exclude dev files
├── bin/
│   └── cli.js                # Entry point (#!/usr/bin/env node)
├── src/
│   ├── index.js              # Main orchestrator
│   ├── github.js             # GitHub API client
│   ├── scaffold.js           # File system operations
│   ├── prompts.js            # Inquirer configuration
│   ├── replacer.js           # Template variable substitution
│   ├── logger.js             # Chalk + Ora utilities
│   └── constants.js          # GitHub repo details, API URLs
└── tests/                    # Future: Jest integration tests
    └── .gitkeep
```

### Data Flow

```
CLI Invocation
    ↓
Parse Arguments (commander)
    ↓
Validate Target Directory
    ↓
Run Interactive Prompts (inquirer)
    ↓
Fetch .github/ Tree (GitHub API)
    ↓
Download File Contents (parallel)
    ↓
Replace {{PLACEHOLDERS}}
    ↓
Write Files to Disk
    ↓
Display Success Summary
```

---

## 🔧 Technical Implementation

### Phase 1: Package Bootstrap

**Actions:**

1. Create standalone repository at `github.com/aynorica/create-aynorica`
2. Initialize with npm/ESM configuration
3. Configure `.gitignore` and `.npmignore`
4. Set up MIT license

**Deliverables:**

-   ✅ `package.json` with correct `bin` entry
-   ✅ Empty `src/` and `bin/` directories
-   ✅ README skeleton

---

### Phase 2: Core Modules

#### Module A: CLI Entry Point (`bin/cli.js`)

**Responsibilities:**

-   Parse command-line arguments
-   Handle `--help` and `--version` flags
-   Delegate to main orchestrator

**Implementation:**

```javascript
#!/usr/bin/env node
import { program } from "commander";
import { createProject } from "../src/index.js";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const packageJson = JSON.parse(
	readFileSync(join(__dirname, "../package.json"), "utf-8"),
);

program
	.name("create-aynorica")
	.version(packageJson.version)
	.description("Scaffold a new Aynorica-powered project")
	.argument("[project-name]", "Project directory name")
	.option("-s, --skip-prompts", "Skip customization prompts (use defaults)")
	.action(async (projectName, options) => {
		try {
			await createProject(projectName, options);
		} catch (error) {
			console.error(`\n❌ Error: ${error.message}`);
			process.exit(1);
		}
	});

program.parse();
```

**Error Handling:**

-   Uncaught exceptions → Log + exit code 1
-   Invalid arguments → Show help text

---

#### Module B: GitHub API Client (`src/github.js`)

**Responsibilities:**

-   Fetch repository tree structure
-   Download file contents in parallel
-   Handle rate limiting and network errors

**API Endpoints:**

```javascript
// Tree API (get file list)
GET https://api.github.com/repos/aynorica/aynorica-os/git/trees/main?recursive=1

// Raw content (per file)
GET https://raw.githubusercontent.com/aynorica/aynorica-os/main/.github/path/to/file
```

**Implementation Strategy:**

```javascript
export async function fetchGithubDirectory(owner, repo, branch, path) {
	// 1. Fetch tree with recursive=1
	const treeUrl = `https://api.github.com/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`;
	const treeResponse = await fetch(treeUrl);

	if (!treeResponse.ok) {
		throw new Error(`GitHub API error: ${treeResponse.status}`);
	}

	const tree = await treeResponse.json();

	// 2. Filter files under .github/
	const files = tree.tree.filter(
		(item) => item.type === "blob" && item.path.startsWith(path),
	);

	// 3. Download content in parallel (max 10 concurrent)
	const downloads = files.map((file) =>
		downloadFile(owner, repo, branch, file.path),
	);
	const contents = await Promise.all(downloads);

	return contents.map((content, i) => ({
		path: files[i].path.replace(`${path}/`, ""), // Remove .github/ prefix
		content,
	}));
}

async function downloadFile(owner, repo, branch, path) {
	const rawUrl = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${path}`;
	const response = await fetch(rawUrl);

	if (!response.ok) {
		throw new Error(`Failed to download ${path}: ${response.status}`);
	}

	return await response.text();
}
```

**Error Scenarios:**
| Error | Response | Exit Code |
|-------|----------|-----------|
| Network timeout | "Cannot reach GitHub. Check your connection." | 1 |
| 404 (repo/branch not found) | "Repository not found. Contact support." | 1 |
| 403 (rate limit) | "GitHub API rate limit exceeded. Retry in X minutes." | 1 |
| Invalid JSON | "Unexpected response from GitHub API." + log raw | 1 |

---

#### Module C: Interactive Prompts (`src/prompts.js`)

**Responsibilities:**

-   Collect user customization data
-   Validate inputs
-   Provide sensible defaults

**Configuration:**

```javascript
import inquirer from "inquirer";

export const PROMPT_QUESTIONS = [
	{
		type: "input",
		name: "USER_NAME",
		message: "Your full name:",
		default: "Amir Daryabari",
		validate: (input) => input.trim().length > 0 || "Name cannot be empty",
	},
	{
		type: "input",
		name: "USER_EMAIL",
		message: "Your email address:",
		default: "amir@aynorica.dev",
		validate: (input) => {
			const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
			return emailRegex.test(input) || "Invalid email format";
		},
	},
	{
		type: "input",
		name: "TIMEZONE_DESC",
		message: "Timezone description (e.g., Istanbul (GMT+3)):",
		default: "Istanbul (GMT+3)",
	},
	{
		type: "input",
		name: "TIMEZONE_OFFSET",
		message: "Timezone offset (e.g., +03:00):",
		default: "+03:00",
		validate: (input) => {
			const offsetRegex = /^[+-]\d{2}:\d{2}$/;
			return offsetRegex.test(input) || "Format: +HH:MM or -HH:MM";
		},
	},
];

export async function runPrompts(skipPrompts = false) {
	if (skipPrompts) {
		// Use defaults
		return PROMPT_QUESTIONS.reduce((acc, q) => {
			acc[q.name] = q.default;
			return acc;
		}, {});
	}

	return await inquirer.prompt(PROMPT_QUESTIONS);
}
```

**Skip Mode:**

-   `--skip-prompts` flag → Use all defaults
-   Useful for CI/CD or automated setups

---

#### Module D: Template Replacer (`src/replacer.js`)

**Responsibilities:**

-   Replace `{{PLACEHOLDERS}}` with user-provided values
-   Only process `.instructions.md` files
-   Preserve file structure and formatting

**Implementation:**

```javascript
export function replaceTemplateVariables(content, variables) {
	let result = content;

	for (const [key, value] of Object.entries(variables)) {
		const placeholder = `{{${key}}}`;
		result = result.replaceAll(placeholder, value);
	}

	return result;
}

export function shouldProcessFile(filePath) {
	// Only process instruction files
	return filePath.endsWith(".instructions.md");
}
```

**Target Files:**

```
instructions/amir-profile.instructions.md
instructions/available-techstack.instructions.md
instructions/mcp.instructions.md
```

**Placeholders:**

-   `{{USER_NAME}}`
-   `{{USER_EMAIL}}`
-   `{{TIMEZONE_DESC}}`
-   `{{TIMEZONE_OFFSET}}`

---

#### Module E: File Scaffolder (`src/scaffold.js`)

**Responsibilities:**

-   Create target directory
-   Write files to disk
-   Preserve directory structure
-   Handle file system errors

**Implementation:**

```javascript
import { mkdir, writeFile, access } from "fs/promises";
import { join, dirname } from "path";

export async function createProjectStructure(projectName, files, variables) {
	const targetDir = join(process.cwd(), projectName);

	// 1. Check if directory exists
	try {
		await access(targetDir);
		throw new Error(`Directory "${projectName}" already exists`);
	} catch (error) {
		if (error.code !== "ENOENT") throw error;
	}

	// 2. Create root directory
	await mkdir(targetDir, { recursive: true });

	// 3. Write each file
	for (const file of files) {
		const fullPath = join(targetDir, ".github", file.path);
		const fileDir = dirname(fullPath);

		// Create subdirectories
		await mkdir(fileDir, { recursive: true });

		// Process content if it's an instruction file
		let content = file.content;
		if (shouldProcessFile(file.path)) {
			content = replaceTemplateVariables(content, variables);
		}

		// Write file
		await writeFile(fullPath, content, "utf-8");
	}

	return targetDir;
}
```

**Error Handling:**

-   Directory exists → Ask to overwrite (future: v1.1.0) or abort
-   Permission denied → Clear error message
-   Disk full → Abort gracefully

---

#### Module F: Logger (`src/logger.js`)

**Responsibilities:**

-   Styled console output
-   Loading spinners
-   Success/error formatting

**Implementation:**

```javascript
import chalk from "chalk";
import ora from "ora";

export const logger = {
	info: (msg) => console.log(chalk.blue("ℹ"), msg),
	success: (msg) => console.log(chalk.green("✔"), msg),
	error: (msg) => console.log(chalk.red("✖"), msg),
	warn: (msg) => console.log(chalk.yellow("⚠"), msg),

	spinner: (text) => ora({ text, color: "cyan" }).start(),
};
```

**Usage Example:**

```javascript
const spinner = logger.spinner("Fetching .github/ from GitHub...");
// ... async operation
spinner.succeed("Downloaded 23 files");
```

---

#### Module G: Main Orchestrator (`src/index.js`)

**Responsibilities:**

-   Coordinate all modules
-   Implement main flow
-   Error boundary

**Implementation:**

```javascript
import { runPrompts } from "./prompts.js";
import { fetchGithubDirectory } from "./github.js";
import { createProjectStructure } from "./scaffold.js";
import { logger } from "./logger.js";
import {
	GITHUB_OWNER,
	GITHUB_REPO,
	GITHUB_BRANCH,
	GITHUB_PATH,
} from "./constants.js";

export async function createProject(projectName, options) {
	// 1. Validate project name
	if (!projectName) {
		const { name } = await inquirer.prompt([
			{
				type: "input",
				name: "name",
				message: "Project name:",
				validate: (input) => input.trim().length > 0 || "Name required",
			},
		]);
		projectName = name;
	}

	logger.info(`Creating Aynorica project: ${chalk.bold(projectName)}\n`);

	// 2. Run prompts
	const variables = await runPrompts(options.skipPrompts);

	// 3. Fetch .github/ from GitHub
	const spinner = logger.spinner("Fetching latest .github/ from GitHub...");
	let files;
	try {
		files = await fetchGithubDirectory(
			GITHUB_OWNER,
			GITHUB_REPO,
			GITHUB_BRANCH,
			GITHUB_PATH,
		);
		spinner.succeed(`Downloaded ${files.length} files`);
	} catch (error) {
		spinner.fail("Failed to fetch from GitHub");
		throw error;
	}

	// 4. Create project structure
	const scaffoldSpinner = logger.spinner("Creating project structure...");
	const targetDir = await createProjectStructure(
		projectName,
		files,
		variables,
	);
	scaffoldSpinner.succeed("Project created");

	// 5. Display success message
	console.log("\n" + chalk.green.bold("🎉 Success!"));
	console.log(
		`\nYour Aynorica project is ready at: ${chalk.cyan(targetDir)}`,
	);
	console.log("\nNext steps:");
	console.log(`  ${chalk.gray("1.")} cd ${projectName}`);
	console.log(`  ${chalk.gray("2.")} Review .github/instructions/ files`);
	console.log(`  ${chalk.gray("3.")} Start building!\n`);
}
```

---

### Phase 3: Constants Configuration (`src/constants.js`)

```javascript
export const GITHUB_OWNER = "aynorica";
export const GITHUB_REPO = "aynorica-os";
export const GITHUB_BRANCH = "main";
export const GITHUB_PATH = ".github";

export const DEFAULT_VALUES = {
	USER_NAME: "Amir Daryabari",
	USER_EMAIL: "amir@aynorica.dev",
	TIMEZONE_DESC: "Istanbul (GMT+3)",
	TIMEZONE_OFFSET: "+03:00",
};
```

---

### Phase 4: Package Configuration

#### `package.json`

```json
{
	"name": "create-aynorica",
	"version": "1.0.0",
	"description": "Scaffold a new Aynorica-powered project with GitHub configuration templates",
	"type": "module",
	"bin": {
		"create-aynorica": "./bin/cli.js"
	},
	"files": ["bin", "src", "README.md", "LICENSE"],
	"scripts": {
		"test": "echo \"Error: no test specified\" && exit 1"
	},
	"keywords": [
		"aynorica",
		"second-brain",
		"obsidian",
		"template",
		"scaffolding",
		"cli",
		"create"
	],
	"author": "Amir Daryabari <amir@aynorica.dev>",
	"license": "MIT",
	"repository": {
		"type": "git",
		"url": "https://github.com/aynorica/create-aynorica.git"
	},
	"bugs": {
		"url": "https://github.com/aynorica/create-aynorica/issues"
	},
	"homepage": "https://github.com/aynorica/create-aynorica#readme",
	"dependencies": {
		"commander": "^11.1.0",
		"inquirer": "^9.2.12",
		"chalk": "^5.3.0",
		"ora": "^8.0.1",
		"node-fetch": "^3.3.2"
	},
	"engines": {
		"node": ">=18.0.0"
	}
}
```

#### `.gitignore`

```
node_modules/
*.log
.DS_Store
dist/
coverage/
.env
```

#### `.npmignore`

```
tests/
.github/
*.log
.DS_Store
coverage/
```

---

## 🧪 Testing Strategy

### Manual Testing (Pre-publish)

```bash
# 1. Link package locally
cd create-aynorica
npm link

# 2. Test in empty directory
cd /tmp
npx create-aynorica test-project-1

# 3. Verify structure
cd test-project-1
ls -la .github/
cat .github/instructions/amir-profile.instructions.md
# → Check {{PLACEHOLDERS}} are replaced

# 4. Test skip-prompts flag
cd /tmp
npx create-aynorica test-project-2 --skip-prompts

# 5. Test error cases
npx create-aynorica test-project-1  # Should fail (already exists)
```

### Edge Cases Checklist

-   [ ] Empty project name → Prompt for it
-   [ ] Directory already exists → Error with clear message
-   [ ] No internet connection → Fail fast with retry suggestion
-   [ ] GitHub API rate limit → Show retry-after time
-   [ ] Invalid timezone format → Prompt re-entry
-   [ ] Ctrl+C during prompts → Clean exit
-   [ ] Ctrl+C during download → No partial files left

### Future: Automated Tests (v1.1.0)

```javascript
// tests/integration.test.js
describe("create-aynorica", () => {
	test("creates project with valid structure", async () => {
		// Mock GitHub API
		// Run CLI programmatically
		// Assert file structure
	});

	test("replaces placeholders correctly", async () => {
		// ...
	});
});
```

---

## 🚀 Publishing Protocol

### Pre-Publish Checklist

```bash
# 1. Verify npm authentication
npm whoami
# Expected: Your npm username

# 2. Ensure clean git state
git status
git tag v1.0.0
git push origin main --tags

# 3. Build/test package
npm pack
# → Inspect create-aynorica-1.0.0.tgz contents

# 4. Dry-run publish
npm publish --dry-run
# → Review what will be published
```

### Publish Command

```bash
npm publish --access public
```

### Post-Publish Verification

```bash
# 1. Wait 1-2 minutes for npm registry sync

# 2. Test published version
cd /tmp
npx create-aynorica@latest verify-publish

# 3. Check npm page
# Visit: https://www.npmjs.com/package/create-aynorica

# 4. Update documentation
# → Add usage examples to aynorica-os README
```

---

## 📚 Documentation Plan

### README.md Structure

```markdown
# create-aynorica

> Scaffold a new Aynorica-powered project in seconds

## Installation

No installation needed! Use `npx`:

\`\`\`bash
npx create-aynorica my-project
\`\`\`

## Usage

### Interactive Mode (Recommended)

\`\`\`bash
npx create-aynorica my-project

# → Answer prompts for customization

\`\`\`

### Quick Start (Skip Prompts)

\`\`\`bash
npx create-aynorica my-project --skip-prompts

# → Uses default values

\`\`\`

## What Gets Created?

Your project will have:

-   `.github/instructions/` - Personalized Aynorica instructions
-   `.github/prompts/` - Reusable prompt templates
-   `.github/workflows/` - (If present in template)

## Customization

During setup, you'll be asked for:

-   Your full name
-   Email address
-   Timezone details

These values replace `{{PLACEHOLDERS}}` in instruction files.

## Requirements

-   Node.js >= 18.0.0
-   Internet connection (fetches from GitHub)

## Troubleshooting

**Error: Directory already exists**
→ Choose a different project name or remove existing directory

**Error: Cannot reach GitHub**
→ Check internet connection and try again

**Error: GitHub API rate limit**
→ Wait 1 hour or authenticate with GitHub CLI

## License

MIT © Amir Daryabari
```

---

## 🔄 Maintenance & Versioning

### When to Bump Versions

**Patch (1.0.x):**

-   Bug fixes in existing logic
-   Error message improvements
-   Documentation updates

**Minor (1.x.0):**

-   New prompts/customization options
-   New CLI flags
-   Non-breaking feature additions

**Major (x.0.0):**

-   Changed template structure expectations
-   Removed CLI options
-   Breaking changes to behavior

### Dependency Updates

```bash
# Monthly check
npm outdated
npm update

# Security patches
npm audit
npm audit fix
```

### Template Sync Strategy

**User always gets latest** — `.github/` is fetched from main branch at runtime.

**No action needed when:**

-   New files added to `.github/`
-   Existing files modified
-   Directory structure changes

**Action needed when:**

-   New `{{PLACEHOLDERS}}` introduced (add to prompts)
-   Breaking changes to instruction file format

---

## 🎯 Success Metrics (v1.0.0)

**Launch Criteria:**

-   [ ] Package published to npm
-   [ ] GitHub repository created (public)
-   [ ] README with full usage docs
-   [ ] Manual testing passed (5 edge cases)
-   [ ] Integration with `aynorica-os` documented

**Post-Launch (Week 1):**

-   [ ] 0 critical bugs reported
-   [ ] Successfully scaffolds projects on Windows/macOS/Linux
-   [ ] npm package page has clear description

---

## 📅 Timeline

**Day 1 (Today):**

-   Create GitHub repository
-   Scaffold package structure
-   Implement core modules (A-G)

**Day 2:**

-   Manual testing
-   README documentation
-   Publish v1.0.0

**Day 3:**

-   Update aynorica-os docs
-   Create GitHub release
-   Announce in relevant channels

---

## 🔗 Related Resources

-   **GitHub Repo:** `https://github.com/aynorica/create-aynorica`
-   **npm Package:** `https://www.npmjs.com/package/create-aynorica`
-   **Parent Project:** `https://github.com/aynorica/aynorica-os`
-   **Template Source:** `.github/` directory in aynorica-os

---

## 🚨 Critical Reminders

1. **ESM Only:** Use `type: "module"` in package.json
2. **Shebang Required:** `#!/usr/bin/env node` in bin/cli.js
3. **GitHub API:** No auth needed for public repos
4. **Rate Limits:** 60 req/hour unauthenticated (sufficient)
5. **No Bundled Templates:** Always fetch from GitHub (fail if offline)
6. **Placeholder Format:** Strict `{{KEY}}` format (no spaces)
7. **File Targeting:** Only process `.instructions.md` files
8. **Exit Codes:** 0 = success, 1 = error

---

## 📝 Open Questions (Answer Before Build)

1. ✅ **Repo location:** Standalone repo at `github.com/aynorica/create-aynorica`
2. ✅ **LICENSE:** MIT
3. ✅ **Visibility:** Public
4. ✅ **First version:** 1.0.0
5. ⏳ **Local scaffold location:** Where to create `create-aynorica/` directory? (Default: Desktop/AI/ sibling to aynorica-os)

---

_Last Updated: 2025-12-04_  
_Status: Ready for Implementation_  
_Next Action: Execute Phase 1 - Package Bootstrap_
