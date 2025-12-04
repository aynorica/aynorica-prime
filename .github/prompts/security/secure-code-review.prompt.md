````prompt
---
mode: agent
description: Systematic secure code review methodology for Node.js/TypeScript applications
---

# Secure Code Review Guide

Structured approach to identifying security vulnerabilities through manual code inspection.

## Review Methodology

### Phase 1: Preparation (15 min)

```markdown
1. **Understand the context**
   - What does this code do?
   - What data does it handle?
   - What are the trust boundaries?

2. **Identify attack surface**
   - User inputs (query params, body, headers)
   - File operations
   - Network calls
   - Database interactions
   - Authentication/authorization points

3. **Define risk areas**
   - Payment processing
   - Authentication
   - PII handling
   - Admin functions
````

### Phase 2: Systematic Review (60-90 min)

Follow the **STRIDE** threat model:

| Threat                     | Question                                    |
| -------------------------- | ------------------------------------------- |
| **S**poofing               | Can an attacker pretend to be someone else? |
| **T**ampering              | Can data be modified unauthorized?          |
| **R**epudiation            | Can actions be denied?                      |
| **I**nformation Disclosure | Can sensitive data leak?                    |
| **D**enial of Service      | Can the service be overloaded?              |
| **E**levation of Privilege | Can users gain unauthorized access?         |

---

## Code Review Checklist

### 1. Authentication & Session Management

```typescript
// ❌ RED FLAGS
- Hardcoded credentials
- Weak password requirements
- No rate limiting on login
- Session tokens in URL
- Missing session expiration
- Predictable session IDs

// ✅ WHAT TO LOOK FOR
✓ bcrypt/scrypt for password hashing (SALT_ROUNDS >= 10)
✓ JWT with reasonable expiration (access: 15m, refresh: 7d)
✓ HttpOnly, Secure, SameSite cookies
✓ Rate limiting (express-rate-limit, @nestjs/throttler)
✓ Logout invalidates tokens
```

**Example Review:**

```typescript
// 🚨 FINDING: Weak password hashing
const hashedPassword = crypto.createHash("md5").update(password).digest("hex");
// SEVERITY: HIGH
// RECOMMENDATION: Use bcrypt with salt rounds >= 10

// ✅ SECURE
const hashedPassword = await bcrypt.hash(password, 12);
```

---

### 2. Input Validation & Sanitization

```typescript
// ❌ RED FLAGS
- No validation on user inputs
- String concatenation in queries
- eval() or Function() with user input
- Unmarshalled JSON used directly
- No file type validation on uploads

// ✅ WHAT TO LOOK FOR
✓ class-validator decorators on DTOs
✓ Joi/Zod schemas for runtime validation
✓ Whitelist approach (allow known good)
✓ Length limits enforced
✓ Type checking before use
```

**Example Review:**

```typescript
// 🚨 FINDING: NoSQL Injection vulnerability
const user = await User.findOne({ email: req.body.email });
// SEVERITY: CRITICAL
// If req.body.email = { $ne: null }, returns first user
// RECOMMENDATION: Validate email format before query

// ✅ SECURE
class LoginDto {
	@IsEmail()
	email: string;
}
const user = await User.findOne({ email: validatedDto.email });
```

---

### 3. Authorization & Access Control

```typescript
// ❌ RED FLAGS
- Missing authorization checks
- Client-side only access control
- IDOR vulnerabilities (accessing /user/123 without check)
- Relying on hidden URLs for security
- Role checks only in frontend

// ✅ WHAT TO LOOK FOR
✓ Authorization guards on every route
✓ Resource ownership verification
✓ Centralized permission logic
✓ Principle of least privilege
✓ Default deny approach
```

**Example Review:**

```typescript
// 🚨 FINDING: Insecure Direct Object Reference
@Get('documents/:id')
async getDocument(@Param('id') id: string) {
  return this.documentService.findById(id); // Anyone can access any document
}
// SEVERITY: HIGH
// RECOMMENDATION: Verify user owns document

// ✅ SECURE
@UseGuards(JwtAuthGuard)
@Get('documents/:id')
async getDocument(@Param('id') id: string, @Req() req) {
  const doc = await this.documentService.findById(id);
  if (doc.userId !== req.user.id && req.user.role !== 'admin') {
    throw new ForbiddenException();
  }
  return doc;
}
```

---

### 4. Cryptography & Data Protection

```typescript
// ❌ RED FLAGS
- Weak hashing algorithms (MD5, SHA1)
- Hardcoded keys/secrets
- Encryption without authentication
- Predictable IVs
- Custom crypto implementation

// ✅ WHAT TO LOOK FOR
✓ Strong algorithms (AES-256-GCM, ChaCha20-Poly1305)
✓ Secrets from environment/vault
✓ Authenticated encryption (GCM mode)
✓ Random IVs/nonces
✓ Key rotation strategy
```

**Example Review:**

```typescript
// 🚨 FINDING: Weak encryption
const cipher = crypto.createCipheriv("aes-256-cbc", key, iv); // No authentication
// SEVERITY: MEDIUM
// RECOMMENDATION: Use AES-GCM for authenticated encryption

// ✅ SECURE
const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
const encrypted = cipher.update(data, "utf8");
const final = cipher.final();
const authTag = cipher.getAuthTag(); // Authentication tag
```

---

### 5. Error Handling & Logging

```typescript
// ❌ RED FLAGS
- Stack traces exposed to client
- Sensitive data in error messages
- No error logging
- Logging sensitive data (passwords, tokens)
- Uncaught exceptions crashing app

// ✅ WHAT TO LOOK FOR
✓ Generic error messages to client
✓ Detailed server-side logging
✓ Sanitized log output
✓ Global exception filter
✓ Error correlation IDs
```

**Example Review:**

```typescript
// 🚨 FINDING: Information leakage in error
catch (error) {
  res.status(500).json({ error: error.stack }); // Exposes stack trace
}
// SEVERITY: MEDIUM
// RECOMMENDATION: Log stack server-side, generic message to client

// ✅ SECURE
catch (error) {
  logger.error('Database query failed', { error: error.message, stack: error.stack, userId: req.user.id });
  res.status(500).json({ error: 'Internal server error', errorId: correlationId });
}
```

---

### 6. API Security

```typescript
// ❌ RED FLAGS
- No rate limiting
- Missing CORS configuration
- No request size limits
- Allowing any Content-Type
- No API versioning

// ✅ WHAT TO LOOK FOR
✓ Rate limiting per user/IP
✓ CORS allowlist configured
✓ Request body size limits
✓ Content-Type validation
✓ API versioning strategy
```

**Example Review:**

```typescript
// 🚨 FINDING: Missing rate limiting
@Post('send-email')
async sendEmail(@Body() dto: EmailDto) {
  await this.emailService.send(dto); // Can be abused for spam
}
// SEVERITY: MEDIUM
// RECOMMENDATION: Add rate limiting

// ✅ SECURE
@UseGuards(ThrottlerGuard)
@Throttle(10, 60) // 10 requests per 60 seconds
@Post('send-email')
async sendEmail(@Body() dto: EmailDto) {
  await this.emailService.send(dto);
}
```

---

### 7. Database Security

```typescript
// ❌ RED FLAGS
- Raw SQL with string interpolation
- No prepared statements
- DB credentials in code
- Overly permissive DB user
- No query timeouts

// ✅ WHAT TO LOOK FOR
✓ Parameterized queries
✓ ORM/query builder usage
✓ Credentials from env/secrets manager
✓ Least privilege DB user
✓ Connection pooling configured
```

**Example Review:**

```typescript
// 🚨 FINDING: SQL Injection
const query = `SELECT * FROM users WHERE email = '${email}'`;
await db.raw(query);
// SEVERITY: CRITICAL
// RECOMMENDATION: Use parameterized query

// ✅ SECURE
const query = "SELECT * FROM users WHERE email = ?";
await db.raw(query, [email]);
// Or use ORM
await User.findOne({ where: { email } });
```

---

### 8. File Operations

```typescript
// ❌ RED FLAGS
- Path traversal vulnerabilities
- No file type validation
- Unrestricted file upload
- Executable files allowed
- No size limits

// ✅ WHAT TO LOOK FOR
✓ Path sanitization
✓ File extension allowlist
✓ MIME type verification
✓ File size limits
✓ Virus scanning
```

**Example Review:**

```typescript
// 🚨 FINDING: Path traversal
const filePath = path.join(UPLOAD_DIR, req.query.filename);
fs.readFileSync(filePath); // Can read any file with ../../../etc/passwd
// SEVERITY: CRITICAL
// RECOMMENDATION: Sanitize filename, validate within upload directory

// ✅ SECURE
import * as path from "path";
const sanitized = path.basename(req.query.filename); // Removes directory components
const filePath = path.join(UPLOAD_DIR, sanitized);
if (!filePath.startsWith(UPLOAD_DIR)) {
	throw new Error("Invalid path");
}
```

---

### 9. Third-Party Dependencies

```typescript
// ❌ RED FLAGS
- Outdated dependencies
- No lockfile
- Unnecessary dependencies
- Dependencies with known CVEs
- Using deprecated packages

// ✅ WHAT TO LOOK FOR
✓ npm audit clean
✓ lockfile committed
✓ Regular dependency updates
✓ Minimal dependency tree
✓ Reputable packages only
```

**Review Process:**

```bash
# Check for vulnerabilities
npm audit

# Check for outdated packages
npm outdated

# Analyze dependency tree
npm list --depth=0

# Check package reputation
npm view <package> maintainers
npm view <package> downloads
```

---

### 10. Environment & Configuration

```typescript
// ❌ RED FLAGS
- Secrets in code
- Debug mode in production
- Verbose error messages
- Default ports
- No HTTPS enforcement

// ✅ WHAT TO LOOK FOR
✓ Environment variables for config
✓ Production mode enabled
✓ HTTPS redirect configured
✓ Security headers set
✓ Unnecessary services disabled
```

**Example Review:**

```typescript
// 🚨 FINDING: Hardcoded secret
const JWT_SECRET = "my-secret-key-123";
// SEVERITY: CRITICAL
// RECOMMENDATION: Use environment variable

// ✅ SECURE
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
	throw new Error("JWT_SECRET not configured");
}
```

---

## Code Review Report Template

````markdown
# Security Code Review Report

## Summary

-   **Project:** [Name]
-   **Reviewer:** [Name]
-   **Date:** [YYYY-MM-DD]
-   **Scope:** [Files/modules reviewed]

## Findings

### CRITICAL (Immediate Fix Required)

1. **SQL Injection in /api/users endpoint**

    - **File:** `src/users/users.controller.ts:45`
    - **Issue:** Raw SQL query with user input
    - **Impact:** Attacker can read/modify entire database
    - **Recommendation:** Use parameterized queries

    ```typescript
    // BEFORE
    const query = `SELECT * FROM users WHERE id = ${userId}`;

    // AFTER
    const query = "SELECT * FROM users WHERE id = ?";
    db.query(query, [userId]);
    ```
````

### HIGH (Fix Before Release)

2. **Missing Authorization Check**
    - **File:** `src/documents/documents.controller.ts:78`
    - **Issue:** No ownership verification
    - **Impact:** Users can access other users' documents
    - **Recommendation:** Add authorization guard

### MEDIUM (Fix Next Sprint)

3. **Verbose Error Messages**
    - **File:** `src/main.ts:30`
    - **Issue:** Stack traces exposed to client
    - **Impact:** Information leakage
    - **Recommendation:** Use exception filter

### LOW (Technical Debt)

4. **Outdated Dependencies**
    - **Issue:** 3 packages with known vulnerabilities
    - **Recommendation:** Run `npm audit fix`

## Positive Findings

-   ✅ All passwords hashed with bcrypt
-   ✅ Rate limiting configured on auth endpoints
-   ✅ CORS properly configured

## Recommendations

1. Implement automated security scanning in CI/CD
2. Add pre-commit hook for `npm audit`
3. Security training for development team

````

---

## Common Vulnerability Patterns

### Pattern: NoSQL Injection
```typescript
// VULNERABLE
const user = await User.findOne({ email: req.body.email });
// Attack: { "email": { "$ne": null } }

// SECURE
if (typeof req.body.email !== 'string') {
  throw new BadRequestException();
}
````

### Pattern: Prototype Pollution

```typescript
// VULNERABLE
function merge(target, source) {
	for (const key in source) {
		target[key] = source[key]; // Can set __proto__
	}
}

// SECURE
function merge(target, source) {
	for (const key in source) {
		if (
			Object.prototype.hasOwnProperty.call(source, key) &&
			key !== "__proto__"
		) {
			target[key] = source[key];
		}
	}
}
```

### Pattern: ReDoS (Regular Expression Denial of Service)

```typescript
// VULNERABLE
const emailRegex = /^([a-zA-Z0-9_\.-]+)@([\da-zA-Z\.-]+)\.([a-zA-Z\.]{2,6})$/;
// Attack: long string with many dots

// SECURE
import { IsEmail } from "class-validator"; // Uses tested regex
```

---

## Tools for Automated Review

```bash
# Static Analysis
npx eslint . --ext .ts
npx tsc --noEmit

# Security Linting
npm install -g eslint-plugin-security
npx eslint . --plugin security

# Dependency Scanning
npm audit
npm install -g snyk && snyk test

# SAST Tools
npx semgrep --config=auto .
```

---

## Review Frequency

| Code Type            | Review Frequency   |
| -------------------- | ------------------ |
| Authentication logic | Every change       |
| Payment processing   | Every change       |
| Admin functions      | Every change       |
| API endpoints        | Every new endpoint |
| Dependencies         | Monthly            |
| Full codebase        | Quarterly          |

```

```
