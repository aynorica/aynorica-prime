```prompt
---
mode: agent
description: OWASP Top 10 vulnerability analysis and mitigation for web applications
---

# OWASP Top 10 Security Analysis

Framework for identifying and mitigating the most critical web application security risks.

## OWASP Top 10 2021 (Updated 2025 RC)

### A01:2021 – Broken Access Control

**Risk:** Users acting outside intended permissions, accessing unauthorized functionality/data.

**Common Vulnerabilities:**
- Missing function-level access control
- Insecure Direct Object References (IDOR)
- Force browsing to authenticated pages
- Elevation of privilege
- CORS misconfiguration

**Detection Checklist:**
```

[ ] Can users access resources by modifying URL parameters?
[ ] Are role checks enforced on every endpoint?
[ ] Do API endpoints validate user permissions?
[ ] Is authorization logic centralized or scattered?
[ ] Are there admin panels without proper auth?

````

**Node.js/NestJS Mitigation:**
```typescript
// ❌ BAD: No authorization check
@Get('/users/:id')
async getUser(@Param('id') id: string) {
  return this.userService.findById(id);
}

// ✅ GOOD: Role-based guards
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin', 'user')
@Get('/users/:id')
async getUser(@Param('id') id: string, @Req() req) {
  // Verify user can only access their own data
  if (req.user.role !== 'admin' && req.user.id !== id) {
    throw new ForbiddenException();
  }
  return this.userService.findById(id);
}
````

---

### A02:2021 – Cryptographic Failures

**Risk:** Exposure of sensitive data due to lack of encryption or weak cryptographic practices.

**Common Failures:**

-   Transmitting data in clear text (HTTP)
-   Old/weak cryptographic algorithms
-   Default/weak keys
-   Missing encryption for sensitive data at rest
-   Improper certificate validation

**Detection Checklist:**

```
[ ] Is HTTPS enforced for all endpoints?
[ ] Are passwords hashed with bcrypt/scrypt (not MD5/SHA1)?
[ ] Are API keys/secrets stored in environment variables?
[ ] Is sensitive data encrypted in the database?
[ ] Are TLS versions < 1.2 disabled?
```

**Node.js Mitigation:**

```typescript
import * as bcrypt from "bcrypt";
import { createCipheriv, createDecipheriv, randomBytes } from "crypto";

// Password hashing
const SALT_ROUNDS = 12;
const hashedPassword = await bcrypt.hash(plainPassword, SALT_ROUNDS);
const isValid = await bcrypt.compare(plainPassword, hashedPassword);

// Encrypt sensitive data
const algorithm = "aes-256-gcm";
const key = Buffer.from(process.env.ENCRYPTION_KEY, "hex"); // 32 bytes
const iv = randomBytes(16);

function encrypt(text: string) {
	const cipher = createCipheriv(algorithm, key, iv);
	const encrypted = Buffer.concat([
		cipher.update(text, "utf8"),
		cipher.final(),
	]);
	const authTag = cipher.getAuthTag();
	return {
		encrypted: encrypted.toString("hex"),
		authTag: authTag.toString("hex"),
		iv: iv.toString("hex"),
	};
}
```

---

### A03:2021 – Injection

**Risk:** Untrusted data sent to interpreter as part of command/query.

**Types:**

-   SQL Injection
-   NoSQL Injection
-   Command Injection
-   LDAP Injection
-   XPath Injection

**Detection Checklist:**

```
[ ] Are user inputs sanitized before database queries?
[ ] Is parameterized querying used (no string concatenation)?
[ ] Are ORMs/query builders used properly?
[ ] Is user input validated against expected format?
[ ] Are dangerous functions (eval, exec) avoided?
```

**Node.js/TypeScript Mitigation:**

```typescript
// ❌ BAD: SQL Injection vulnerable
const query = `SELECT * FROM users WHERE email = '${userEmail}'`;

// ✅ GOOD: Parameterized query
const query = "SELECT * FROM users WHERE email = ?";
const result = await db.execute(query, [userEmail]);

// ❌ BAD: NoSQL Injection (MongoDB)
const user = await User.findOne({ email: req.body.email });

// ✅ GOOD: Type validation
import { IsEmail } from "class-validator";
class LoginDto {
	@IsEmail()
	email: string;
}

// ❌ BAD: Command Injection
exec(`git clone ${req.body.repo}`);

// ✅ GOOD: Whitelist validation
const allowedRepos = ["repo1", "repo2"];
if (!allowedRepos.includes(req.body.repo)) {
	throw new Error("Invalid repository");
}
execFile("git", ["clone", req.body.repo]);
```

---

### A04:2021 – Insecure Design

**Risk:** Missing or ineffective security controls in the design phase.

**Prevention Strategies:**

-   Threat modeling during design
-   Secure design patterns and principles
-   Security requirements from user stories
-   Principle of least privilege
-   Defense in depth

**Threat Modeling Questions:**

```
1. What are you building?
2. What can go wrong?
3. What are you going to do about it?
4. Did you do a good enough job?
```

**Secure Design Principles:**

```markdown
1. **Default Deny** — Explicit allow, implicit deny
2. **Fail Securely** — Errors should not expose sensitive info
3. **Defense in Depth** — Multiple layers of security
4. **Least Privilege** — Minimum necessary permissions
5. **Separation of Duties** — No single point of control
6. **Economy of Mechanism** — Keep design simple
```

---

### A05:2021 – Security Misconfiguration

**Risk:** Insecure default configurations, incomplete setups, open cloud storage, verbose errors.

**Common Issues:**

-   Default credentials still enabled
-   Unnecessary features enabled
-   Error messages revealing stack traces
-   Missing security headers
-   Out-of-date software

**Detection Checklist:**

```
[ ] Are default accounts disabled/changed?
[ ] Is stack trace exposure prevented in production?
[ ] Are security headers configured (CSP, HSTS, etc.)?
[ ] Is directory listing disabled?
[ ] Are unnecessary features/services disabled?
```

**NestJS/Express Security Headers:**

```typescript
import helmet from "helmet";
import { NestFactory } from "@nestjs/core";

async function bootstrap() {
	const app = await NestFactory.create(AppModule);

	// Security headers
	app.use(
		helmet({
			contentSecurityPolicy: {
				directives: {
					defaultSrc: ["'self'"],
					styleSrc: ["'self'", "'unsafe-inline'"],
					scriptSrc: ["'self'"],
					imgSrc: ["'self'", "data:", "https:"],
				},
			},
			hsts: {
				maxAge: 31536000,
				includeSubDomains: true,
				preload: true,
			},
		}),
	);

	// Disable X-Powered-By
	app.disable("x-powered-by");

	// CORS
	app.enableCors({
		origin: process.env.ALLOWED_ORIGINS?.split(",") || [],
		credentials: true,
	});

	await app.listen(3000);
}
```

---

### A06:2021 – Vulnerable and Outdated Components

**Risk:** Using components with known vulnerabilities.

**Detection & Mitigation:**

```bash
# Audit dependencies
npm audit
npm audit fix

# Use OWASP Dependency-Check
npm install -g dependency-check
dependency-check --project "My App" --scan ./

# Automated scanning in CI/CD
npm ci --audit-level=high

# Use Snyk/Socket for deeper analysis
npm install -g snyk
snyk test
```

**Lockfile Best Practices:**

```json
{
	"scripts": {
		"preinstall": "npx only-allow pnpm",
		"postinstall": "npm audit --audit-level=high"
	},
	"engines": {
		"node": ">=18.0.0",
		"npm": ">=8.0.0"
	}
}
```

---

### A07:2021 – Identification and Authentication Failures

**Risk:** Compromised credentials, session management flaws, weak password policies.

**Common Failures:**

-   Permits brute force attacks
-   Permits default/weak passwords
-   Weak credential recovery
-   Missing/weak MFA
-   Session IDs in URL
-   Session fixation vulnerabilities

**Secure Authentication (NestJS + Passport):**

```typescript
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { RateLimiterMemory } from 'rate-limiter-flexible';

// Rate limiting for login
const rateLimiter = new RateLimiterMemory({
  points: 5, // 5 attempts
  duration: 60 * 15, // Per 15 minutes
});

@Post('login')
async login(@Req() req, @Body() loginDto: LoginDto) {
  try {
    // Rate limiting
    await rateLimiter.consume(req.ip);
  } catch {
    throw new TooManyRequestsException('Too many login attempts');
  }

  const user = await this.userService.findByEmail(loginDto.email);
  if (!user) {
    // Generic error message (don't reveal user existence)
    throw new UnauthorizedException('Invalid credentials');
  }

  const isValid = await bcrypt.compare(loginDto.password, user.password);
  if (!isValid) {
    throw new UnauthorizedException('Invalid credentials');
  }

  // Check if MFA required
  if (user.mfaEnabled) {
    return { requiresMfa: true, tempToken: this.generateTempToken(user.id) };
  }

  return {
    access_token: this.jwtService.sign({ sub: user.id, email: user.email }),
    refresh_token: this.generateRefreshToken(user.id),
  };
}
```

---

### A08:2021 – Software and Data Integrity Failures

**Risk:** Code/infrastructure rely on plugins/libraries from untrusted sources.

**Mitigation Strategies:**

```bash
# Use lock files
package-lock.json  # npm
yarn.lock          # yarn
pnpm-lock.yaml     # pnpm

# Verify package integrity
npm install --integrity

# Use private registry/proxy
npm config set registry https://registry.your-company.com

# Subresource Integrity (SRI) for CDN
<script src="https://cdn.example.com/lib.js"
  integrity="sha384-oqVuAfXRKap7fdgcCY5uykM6+R9GqQ8K/uxy9rx7HNQlGYl1kPzQho1wx4JwY8wC"
  crossorigin="anonymous"></script>
```

---

### A09:2021 – Security Logging and Monitoring Failures

**Risk:** Insufficient logging/monitoring allows attacks to go undetected.

**What to Log:**

```
✅ Authentication successes/failures
✅ Authorization failures
✅ Input validation failures
✅ Application errors
✅ High-value transactions
✅ Admin privilege use

❌ Sensitive data (passwords, tokens, PII)
❌ Full stack traces in production
```

**Winston Logging Setup:**

```typescript
import * as winston from "winston";

const logger = winston.createLogger({
	level: process.env.LOG_LEVEL || "info",
	format: winston.format.combine(
		winston.format.timestamp(),
		winston.format.errors({ stack: true }),
		winston.format.json(),
	),
	defaultMeta: { service: "api" },
	transports: [
		new winston.transports.File({ filename: "error.log", level: "error" }),
		new winston.transports.File({ filename: "combined.log" }),
	],
});

// Security event logging
logger.warn("Failed login attempt", {
	ip: req.ip,
	email: loginDto.email,
	timestamp: new Date().toISOString(),
});
```

---

### A10:2021 – Server-Side Request Forgery (SSRF)

**Risk:** Web application fetches remote resources without validating user-supplied URL.

**Detection Checklist:**

```
[ ] Does the app fetch URLs provided by users?
[ ] Are fetched URLs validated against allowlist?
[ ] Is access to internal networks blocked?
[ ] Are URL redirects validated?
```

**SSRF Prevention:**

```typescript
import { URL } from "url";

const ALLOWED_DOMAINS = ["api.example.com", "cdn.example.com"];
const BLOCKED_IPS = ["127.0.0.1", "0.0.0.0", "::1", "169.254.169.254"]; // AWS metadata

async function safeFetch(userUrl: string) {
	let url: URL;
	try {
		url = new URL(userUrl);
	} catch {
		throw new Error("Invalid URL");
	}

	// Protocol check
	if (!["http:", "https:"].includes(url.protocol)) {
		throw new Error("Invalid protocol");
	}

	// Domain allowlist
	if (!ALLOWED_DOMAINS.includes(url.hostname)) {
		throw new Error("Domain not allowed");
	}

	// IP blocklist check
	const resolved = await dns.lookup(url.hostname);
	if (BLOCKED_IPS.includes(resolved.address)) {
		throw new Error("IP blocked");
	}

	return fetch(url.toString());
}
```

---

## Quick Audit Checklist

```markdown
### Authentication & Authorization

-   [ ] Role-based access control on all routes
-   [ ] No sensitive data in JWT payload
-   [ ] Rate limiting on login endpoints
-   [ ] Password requirements enforced
-   [ ] MFA available for sensitive accounts

### Input Validation

-   [ ] All inputs validated with DTO/schemas
-   [ ] Parameterized queries only
-   [ ] File upload MIME type verification
-   [ ] Request size limits enforced

### Data Protection

-   [ ] HTTPS enforced (HSTS enabled)
-   [ ] Passwords hashed with bcrypt/scrypt
-   [ ] Secrets in environment variables
-   [ ] Sensitive data encrypted at rest

### Security Headers

-   [ ] CSP configured
-   [ ] X-Frame-Options set
-   [ ] X-Content-Type-Options: nosniff
-   [ ] HSTS enabled

### Dependencies

-   [ ] npm audit clean
-   [ ] Lock file committed
-   [ ] Regular dependency updates
-   [ ] SBOM generated

### Logging & Monitoring

-   [ ] Failed auth attempts logged
-   [ ] Error logging configured
-   [ ] No sensitive data in logs
-   [ ] Alerting configured
```

---

## Tools & Resources

**Scanning Tools:**

-   `npm audit` — Built-in vulnerability scanner
-   [OWASP ZAP](https://www.zaproxy.org/) — Dynamic application security testing
-   [Snyk](https://snyk.io/) — Dependency scanning
-   [SonarQube](https://www.sonarqube.org/) — Static analysis
-   [Burp Suite](https://portswigger.net/burp) — Penetration testing

**References:**

-   [OWASP Top 10 2021](https://owasp.org/Top10/)
-   [OWASP Cheat Sheet Series](https://cheatsheetseries.owasp.org/)
-   [Node.js Security Best Practices](https://nodejs.org/en/learn/getting-started/security-best-practices)

```

```
