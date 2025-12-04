````prompt
---
mode: agent
description: Security best practices for npm package publishing and consumption
---

# npm Package Security Guide

Comprehensive security practices for npm package lifecycle: development, publishing, and consumption.

## Supply Chain Threat Model

### Attack Vectors

| Attack | Description | Impact |
|--------|-------------|--------|
| **Typosquatting** | Malicious package with similar name to popular package | Code execution on install |
| **Dependency Confusion** | Private package name hijacked in public registry | Supply chain compromise |
| **Account Takeover** | Compromised maintainer account | Malicious version published |
| **Lockfile Poisoning** | Manipulated lockfile points to malicious versions | Persistent backdoor |
| **Malicious Packages** | Intentionally malicious code in package | Data exfiltration, backdoor |
| **Compromised Dependencies** | Transitive dependency compromised | Indirect supply chain attack |

---

## Publishing Securely

### 1. Pre-Publish Checklist

```bash
# Verify you're logged in as correct user
npm whoami

# Check what will be published
npm publish --dry-run

# Inspect tarball contents
npm pack
tar -tzf <package-name>-<version>.tgz

# Run tests
npm test

# Audit dependencies
npm audit --production
````

### 2. Package.json Security

```json
{
	"name": "@scope/package-name",
	"version": "1.0.0",
	"description": "Clear description of what package does",

	"engines": {
		"node": ">=18.0.0"
	},

	"files": ["dist/", "README.md", "LICENSE"],

	"publishConfig": {
		"access": "public",
		"registry": "https://registry.npmjs.org/"
	},

	"scripts": {
		"prepublishOnly": "npm run test && npm run build",
		"prepack": "npm run audit"
	},

	"repository": {
		"type": "git",
		"url": "https://github.com/user/repo.git"
	},

	"author": "Your Name <email@example.com>",
	"license": "MIT",

	"keywords": ["relevant", "searchable", "keywords"]
}
```

### 3. .npmignore Security

```
# Development files
src/
test/
tests/
__tests__/
*.test.ts
*.spec.ts
tsconfig.json
jest.config.js

# Documentation
docs/
examples/
.github/

# Build artifacts
coverage/
.nyc_output/
*.log
npm-debug.log*

# Environment
.env
.env.*
!.env.example

# IDE
.vscode/
.idea/
*.swp

# Git
.git/
.gitignore

# CI/CD
.travis.yml
.circleci/
azure-pipelines.yml

# Sensitive
secrets/
credentials/
*.pem
*.key
```

### 4. Enable 2FA

```bash
# Enable 2FA for login and publishing
npm profile enable-2fa auth-and-writes

# Verify 2FA status
npm profile get
```

### 5. Use Provenance

```bash
# Publish with provenance (requires npm >=9.5.0)
npm publish --provenance

# Generates signed attestation proving:
# - Who published it
# - When it was published
# - What repository/commit it came from
```

### 6. Scope Your Packages

```bash
# Use organization scope
@yourorg/package-name

# Prevents typosquatting of your namespace
# Users know @yourorg/* packages are official
```

---

## Consuming Securely

### 1. Dependency Vetting Process

```bash
# Before installing, check:

# 1. Package reputation
npm view <package> maintainers
npm view <package> repository
npm view <package> downloads
npm view <package> versions

# 2. Recent activity
npm view <package> time

# 3. Known vulnerabilities
npm audit <package>
npx snyk test <package>

# 4. Source code review
git clone <repository-url>
# Review code, especially install scripts
```

### 2. Lockfile Security

```bash
# Use lockfiles (choose one ecosystem)
package-lock.json  # npm
yarn.lock          # yarn
pnpm-lock.yaml     # pnpm (recommended)

# Always commit lockfile
git add package-lock.json
git commit -m "chore: update lockfile"

# Use lockfile in CI/CD
npm ci  # NOT npm install

# Verify lockfile integrity
npm install --package-lock-only
git diff package-lock.json  # Should be empty
```

### 3. Audit Dependencies Regularly

```bash
# Manual audit
npm audit

# Fix automatically
npm audit fix

# Fix including breaking changes
npm audit fix --force

# Set audit threshold
npm audit --audit-level=high

# Continuous monitoring
npm install -g snyk
snyk monitor
```

### 4. Minimize Dependencies

```json
{
	"dependencies": {
		"express": "^4.18.0"
	},
	"devDependencies": {
		"@types/express": "^4.17.0",
		"typescript": "^5.0.0"
	},
	"optionalDependencies": {
		"fsevents": "^2.3.0"
	}
}
```

**Principles:**

-   **Only add dependencies when necessary**
-   **Review transitive dependencies:** `npm ls --all`
-   **Prefer well-maintained packages** (recent updates, many downloads)
-   **Avoid abandoned packages** (last update >2 years ago)

### 5. Pin Dependencies

```json
{
	"dependencies": {
		"express": "4.18.2" // ✅ Exact version
	}
}
```

**NOT:**

```json
{
	"dependencies": {
		"express": "^4.18.0", // ❌ Can auto-update to 4.x.x
		"lodash": "~4.17.0", // ❌ Can auto-update to 4.17.x
		"axios": "*" // ❌ Can auto-update to any version
	}
}
```

### 6. Disable Postinstall Scripts

```bash
# Globally disable
npm config set ignore-scripts true

# Or per-install
npm install --ignore-scripts

# If needed, run scripts manually after review
npm rebuild <package>
```

**Why:** Postinstall scripts can execute arbitrary code during `npm install`.

---

## Private Package Security

### 1. Dependency Confusion Prevention

```json
{
	"name": "@yourcompany/internal-package",
	"publishConfig": {
		"registry": "https://npm.yourcompany.com"
	}
}
```

```bash
# .npmrc (project level)
@yourcompany:registry=https://npm.yourcompany.com
//npm.yourcompany.com/:_authToken=${NPM_TOKEN}

# Prevent public publishing
registry=https://npm.yourcompany.com
```

### 2. Use Private Registry

**Options:**

-   **npm Enterprise** (paid)
-   **GitHub Packages**
-   **JFrog Artifactory**
-   **Verdaccio** (self-hosted)

**Verdaccio Setup:**

```yaml
# config.yaml
storage: ./storage
auth:
    htpasswd:
        file: ./htpasswd
uplinks:
    npmjs:
        url: https://registry.npmjs.org/
packages:
    "@yourcompany/*":
        access: $authenticated
        publish: $authenticated
    "**":
        access: $all
        publish: $authenticated
        proxy: npmjs
```

---

## CI/CD Security

### GitHub Actions Security

```yaml
name: Security Audit

on:
    push:
        branches: [main]
    pull_request:
    schedule:
        - cron: "0 0 * * 1" # Weekly

jobs:
    audit:
        runs-on: ubuntu-latest
        steps:
            - uses: actions/checkout@v4

            - uses: actions/setup-node@v4
              with:
                  node-version: "18"

            # Use lockfile
            - run: npm ci

            # Audit dependencies
            - run: npm audit --audit-level=high

            # Additional scanning
            - name: Run Snyk
              uses: snyk/actions/node@master
              env:
                  SNYK_TOKEN: ${{ secrets.SNYK_TOKEN }}

            # Secret scanning
            - name: Detect secrets
              run: npx detect-secrets scan

            # SBOM generation
            - name: Generate SBOM
              run: |
                  npm install -g @cyclonedx/cyclonedx-npm
                  cyclonedx-npm --output-file sbom.json

            - uses: actions/upload-artifact@v4
              with:
                  name: sbom
                  path: sbom.json
```

### Publishing with Provenance

```yaml
name: Publish

on:
    release:
        types: [created]

permissions:
    contents: read
    id-token: write # Required for provenance

jobs:
    publish:
        runs-on: ubuntu-latest
        steps:
            - uses: actions/checkout@v4

            - uses: actions/setup-node@v4
              with:
                  node-version: "18"
                  registry-url: "https://registry.npmjs.org"

            - run: npm ci
            - run: npm run build
            - run: npm test

            # Publish with provenance
            - run: npm publish --provenance --access public
              env:
                  NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

---

## Vulnerability Response

### When Vulnerability Discovered

```bash
# 1. Assess severity
npm audit

# 2. Update affected package
npm update <package>

# 3. If breaking change required
npm install <package>@latest

# 4. Test thoroughly
npm test

# 5. Update lockfile
npm install --package-lock-only

# 6. Security advisory
npm audit fix
```

### Security Policy

Create `SECURITY.md`:

```markdown
# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 2.x     | :white_check_mark: |
| 1.x     | :x:                |

## Reporting a Vulnerability

**DO NOT** open public issues for security vulnerabilities.

Email: security@yourcompany.com
PGP Key: https://yourcompany.com/pgp-key.asc

Expected response time: 48 hours

## Disclosure Policy

-   Report received
-   Acknowledge within 48h
-   Fix developed within 90 days
-   CVE assigned
-   Security advisory published
-   Coordinated public disclosure
```

---

## Package Signing & Verification

### Using npm provenance

```bash
# Verify package provenance
npm view <package> --json | jq .dist.attestations

# Example response shows GitHub Actions signed attestation
```

### Using Sigstore

```typescript
import * as sigstore from "sigstore";
import * as fs from "fs";

// Sign package
const artifact = "my-package-1.0.0.tgz";
const payload = fs.readFileSync(artifact);
const bundle = await sigstore.sign(payload);
fs.writeFileSync(`${artifact}.sigstore.json`, JSON.stringify(bundle, null, 2));

// Verify package
await sigstore.verify(payload, bundle);
console.log("✓ Verified");
```

---

## Monitoring & Alerting

### Automated Monitoring

```bash
# Snyk continuous monitoring
snyk monitor

# Dependabot (GitHub)
# Automatically creates PRs for vulnerabilities

# Socket.dev
# Detects supply chain attacks in real-time
npx socket-npm audit
```

### Set Up Alerts

```yaml
# .github/dependabot.yml
version: 2
updates:
    - package-ecosystem: npm
      directory: /
      schedule:
          interval: daily
      open-pull-requests-limit: 10
      reviewers:
          - security-team
      labels:
          - dependencies
          - security
```

---

## Best Practices Summary

### For Package Publishers

```markdown
✅ DO:

-   Enable 2FA on npm account
-   Use --provenance flag
-   Review code before publishing
-   Use scoped packages (@org/)
-   Include security policy
-   Sign releases
-   Respond to vulnerability reports
-   Keep dependencies updated

❌ DON'T:

-   Publish with root access
-   Include secrets in package
-   Use default credentials
-   Ignore security reports
-   Publish without tests
-   Use wildcard dependencies
```

### For Package Consumers

```markdown
✅ DO:

-   Use lockfiles
-   Run npm audit regularly
-   Pin dependency versions
-   Review package before installing
-   Use npm ci in CI/CD
-   Enable ignore-scripts by default
-   Monitor dependencies continuously
-   Have incident response plan

❌ DON'T:

-   Install packages without vetting
-   Ignore audit warnings
-   Use npm install in production
-   Trust all packages blindly
-   Run postinstall scripts automatically
-   Use outdated packages
```

---

## Tools Reference

| Tool                   | Purpose                          | Command                   |
| ---------------------- | -------------------------------- | ------------------------- |
| npm audit              | Built-in vulnerability scanner   | `npm audit`               |
| Snyk                   | Dependency scanning + monitoring | `npx snyk test`           |
| Socket                 | Supply chain attack detection    | `npx socket-npm audit`    |
| Retire.js              | Find vulnerable JS libraries     | `npx retire`              |
| OWASP Dependency-Check | Comprehensive dependency scanner | `dependency-check`        |
| detect-secrets         | Secret scanning                  | `npx detect-secrets scan` |
| CycloneDX              | SBOM generation                  | `cyclonedx-npm`           |

```

```
