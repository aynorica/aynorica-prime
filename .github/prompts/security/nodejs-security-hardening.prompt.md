````prompt
---
mode: agent
description: Node.js specific security hardening guide and best practices
---

# Node.js Security Hardening

Comprehensive security configuration for Node.js applications in production.

## Node.js Permission Model (v20.0.0+)

### Enable Permission Restrictions

```bash
# Restrict all permissions by default
node --permission index.js

# Allow specific filesystem reads
node --permission --allow-fs-read=/uploads/ --allow-fs-read=/config/ index.js

# Allow specific filesystem writes
node --permission --allow-fs-write=/uploads/ --allow-fs-write=/logs/ index.js

# Allow child processes
node --permission --allow-child-process index.js

# Allow worker threads
node --permission --allow-worker index.js

# Allow native addons
node --permission --allow-addons index.js
````

**Security Impact:**

-   Prevents LFI (Local File Inclusion) attacks
-   Limits blast radius if code is compromised
-   Defense-in-depth layer

**⚠️ Note:** Symbolic links are followed even outside allowed paths. Ensure no relative symlinks exist.

---

## Environment Variable Security

### Secure Configuration Pattern

```typescript
// config/config.ts
import { z } from "zod";

const envSchema = z.object({
	NODE_ENV: z.enum(["development", "production", "test"]),
	PORT: z.coerce.number().int().positive(),
	DATABASE_URL: z.string().url(),
	JWT_SECRET: z.string().min(32),
	API_KEY: z.string().min(20),
	ENCRYPTION_KEY: z.string().length(64), // 32 bytes hex
});

export const config = envSchema.parse(process.env);

// Validate at startup
if (config.NODE_ENV === "production") {
	if (config.JWT_SECRET.length < 64) {
		throw new Error(
			"JWT_SECRET must be at least 64 characters in production",
		);
	}
}
```

### .env File Security

```bash
# ✅ DO
.env              # Add to .gitignore
.env.local        # Add to .gitignore
.env.example      # Commit with dummy values

# ❌ DON'T
- Commit .env files
- Use default secrets in production
- Log environment variables
- Expose via /config endpoint
```

---

## HTTP Server Hardening

### Request Limits

```typescript
import express from "express";
import rateLimit from "express-rate-limit";
import slowDown from "express-slow-down";

const app = express();

// Body size limits
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

// Rate limiting
const limiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	max: 100, // Limit each IP to 100 requests per windowMs
	standardHeaders: true,
	legacyHeaders: false,
	handler: (req, res) => {
		res.status(429).json({
			error: "Too many requests, please try again later.",
		});
	},
});

app.use("/api/", limiter);

// Stricter limits for auth endpoints
const authLimiter = rateLimit({
	windowMs: 15 * 60 * 1000,
	max: 5, // 5 attempts per 15 minutes
	skipSuccessfulRequests: true,
});

app.use("/api/auth/login", authLimiter);
app.use("/api/auth/register", authLimiter);

// Speed limiter (slow down instead of blocking)
const speedLimiter = slowDown({
	windowMs: 15 * 60 * 1000,
	delayAfter: 50, // Allow 50 requests at full speed
	delayMs: 500, // Add 500ms delay per request above 50
});

app.use(speedLimiter);
```

### Timeout Configuration

```typescript
import * as http from "http";

const server = http.createServer(app);

// Prevent Slowloris attacks
server.headersTimeout = 60_000; // 60 seconds
server.requestTimeout = 60_000; // 60 seconds
server.timeout = 60_000; // 60 seconds
server.keepAliveTimeout = 5_000; // 5 seconds

// Max requests per connection
server.maxRequestsPerSocket = 100;

// Socket limits
server.maxHeadersCount = 100;
```

---

## Security Headers

### Helmet Configuration

```typescript
import helmet from "helmet";

app.use(
	helmet({
		// Content Security Policy
		contentSecurityPolicy: {
			directives: {
				defaultSrc: ["'self'"],
				scriptSrc: ["'self'", "'unsafe-inline'"], // Avoid 'unsafe-inline' if possible
				styleSrc: ["'self'", "'unsafe-inline'"],
				imgSrc: ["'self'", "data:", "https:"],
				connectSrc: ["'self'"],
				fontSrc: ["'self'"],
				objectSrc: ["'none'"],
				mediaSrc: ["'self'"],
				frameSrc: ["'none'"],
				upgradeInsecureRequests: [],
			},
		},

		// Strict Transport Security
		hsts: {
			maxAge: 31536000, // 1 year
			includeSubDomains: true,
			preload: true,
		},

		// X-Frame-Options
		frameguard: {
			action: "deny",
		},

		// X-Content-Type-Options
		noSniff: true,

		// X-XSS-Protection (deprecated but still useful)
		xssFilter: true,

		// Referrer-Policy
		referrerPolicy: {
			policy: "strict-origin-when-cross-origin",
		},

		// Permissions-Policy
		permittedCrossDomainPolicies: {
			permittedPolicies: "none",
		},
	}),
);

// Additional custom headers
app.use((req, res, next) => {
	res.setHeader("X-Content-Type-Options", "nosniff");
	res.setHeader("X-Frame-Options", "DENY");
	res.setHeader("X-XSS-Protection", "1; mode=block");
	res.setHeader(
		"Permissions-Policy",
		"geolocation=(), microphone=(), camera=()",
	);
	next();
});

// Disable X-Powered-By
app.disable("x-powered-by");
```

---

## Cookie Security

```typescript
import session from "express-session";
import RedisStore from "connect-redis";
import { createClient } from "redis";

const redisClient = createClient({
	url: process.env.REDIS_URL,
	socket: {
		tls: process.env.NODE_ENV === "production",
	},
});

app.use(
	session({
		store: new RedisStore({ client: redisClient }),
		name: "sessionId", // Don't use default 'connect.sid'
		secret: process.env.SESSION_SECRET,
		resave: false,
		saveUninitialized: false,
		cookie: {
			secure: process.env.NODE_ENV === "production", // HTTPS only
			httpOnly: true, // No JavaScript access
			maxAge: 1000 * 60 * 60 * 24, // 24 hours
			sameSite: "strict", // CSRF protection
			domain: process.env.COOKIE_DOMAIN,
			path: "/",
		},
	}),
);
```

---

## Error Handling

### Global Exception Filter (NestJS)

```typescript
import {
	ExceptionFilter,
	Catch,
	ArgumentsHost,
	HttpException,
	HttpStatus,
} from "@nestjs/common";
import { Request, Response } from "express";
import * as winston from "winston";

const logger = winston.createLogger({
	level: "error",
	format: winston.format.json(),
	transports: [new winston.transports.File({ filename: "error.log" })],
});

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
	catch(exception: unknown, host: ArgumentsHost) {
		const ctx = host.switchToHttp();
		const response = ctx.getResponse<Response>();
		const request = ctx.getRequest<Request>();

		const status =
			exception instanceof HttpException
				? exception.getStatus()
				: HttpStatus.INTERNAL_SERVER_ERROR;

		const errorId = crypto.randomUUID();

		// Log full error server-side
		logger.error({
			errorId,
			message:
				exception instanceof Error
					? exception.message
					: "Unknown error",
			stack: exception instanceof Error ? exception.stack : undefined,
			url: request.url,
			method: request.method,
			ip: request.ip,
			userAgent: request.get("user-agent"),
		});

		// Generic error to client (no stack trace)
		const message =
			process.env.NODE_ENV === "production"
				? "Internal server error"
				: exception instanceof Error
				? exception.message
				: "Unknown error";

		response.status(status).json({
			statusCode: status,
			message,
			errorId,
			timestamp: new Date().toISOString(),
			path: request.url,
		});
	}
}
```

### Uncaught Exception Handling

```typescript
// main.ts or index.ts
process.on("uncaughtException", (error) => {
	console.error("Uncaught Exception:", error);
	// Log to monitoring service (Sentry, Datadog, etc.)
	process.exit(1); // Exit gracefully
});

process.on("unhandledRejection", (reason, promise) => {
	console.error("Unhandled Rejection at:", promise, "reason:", reason);
	// Log to monitoring service
	process.exit(1);
});

// Graceful shutdown
process.on("SIGTERM", async () => {
	console.log("SIGTERM received, closing server gracefully");
	await server.close();
	await db.close();
	process.exit(0);
});
```

---

## Input Validation

### HTTP Parameter Pollution Prevention

```typescript
import hpp from "hpp";

// Prevent HPP attacks
app.use(
	hpp({
		whitelist: ["filter", "sort"], // Allow arrays for these params
	}),
);
```

### Request Validation (NestJS)

```typescript
import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";

async function bootstrap() {
	const app = await NestFactory.create(AppModule);

	app.useGlobalPipes(
		new ValidationPipe({
			whitelist: true, // Strip unknown properties
			forbidNonWhitelisted: true, // Throw error on unknown properties
			transform: true, // Auto-transform to DTO types
			disableErrorMessages: process.env.NODE_ENV === "production",
			validationError: {
				target: false, // Don't expose class in error
				value: false, // Don't expose value in error
			},
		}),
	);

	await app.listen(3000);
}
```

---

## Dependency Security

### npm Security Configuration

```json
{
	"scripts": {
		"preinstall": "npx only-allow pnpm",
		"postinstall": "npm audit --audit-level=high",
		"audit": "npm audit",
		"audit:fix": "npm audit fix",
		"check:updates": "npx npm-check-updates",
		"security:check": "npx snyk test"
	},
	"engines": {
		"node": ">=18.0.0",
		"npm": ">=8.0.0"
	}
}
```

### .npmrc Security

```ini
# .npmrc
audit=true
audit-level=high
ignore-scripts=true  # Prevent malicious postinstall scripts
fund=false
save-exact=true      # No semver ranges
```

### Lockfile Integrity

```bash
# Use lockfile strictly
npm ci --ignore-scripts

# Verify lockfile integrity
npm install --package-lock-only
git diff package-lock.json  # Should be empty
```

---

## Prototype Pollution Prevention

```typescript
// Disable __proto__ globally
node --disable-proto=delete index.js

// Use Object.create(null) for dictionaries
const cache = Object.create(null);
cache['key'] = 'value'; // No prototype

// Freeze critical prototypes
Object.freeze(Object.prototype);
Object.freeze(Array.prototype);
Object.freeze(String.prototype);

// Secure merge function
function secureMerge(target: any, source: any) {
  for (const key in source) {
    if (Object.prototype.hasOwnProperty.call(source, key)) {
      if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
        continue; // Skip dangerous keys
      }
      if (typeof source[key] === 'object' && source[key] !== null) {
        target[key] = secureMerge(target[key] || {}, source[key]);
      } else {
        target[key] = source[key];
      }
    }
  }
  return target;
}
```

---

## ReDoS (Regular Expression DoS) Prevention

```typescript
import { isSafeRegex } from "safe-regex";

// Check regex safety at build time
const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
if (!isSafeRegex(emailRegex)) {
	throw new Error("Unsafe regex detected");
}

// Or use validated libraries
import { IsEmail } from "class-validator"; // Battle-tested regex

// Set timeout for regex execution
import { withTimeout } from "regex-with-timeout";
const result = withTimeout(/pattern/, inputString, { timeout: 100 }); // 100ms max
```

---

## Secrets Management

### Using Node.js crypto for secure storage

```typescript
import { subtle } from "crypto";

// Encrypt secrets at rest
async function encryptSecret(
	plaintext: string,
	key: CryptoKey,
): Promise<string> {
	const iv = crypto.getRandomValues(new Uint8Array(12));
	const encoded = new TextEncoder().encode(plaintext);

	const ciphertext = await subtle.encrypt(
		{ name: "AES-GCM", iv },
		key,
		encoded,
	);

	return JSON.stringify({
		iv: Array.from(iv),
		data: Array.from(new Uint8Array(ciphertext)),
	});
}

// Rotate secrets periodically
async function rotateJWTSecret() {
	const newSecret = crypto.randomBytes(64).toString("hex");
	// Store in secrets manager (AWS Secrets Manager, Vault, etc.)
	await secretsManager.updateSecret("JWT_SECRET", newSecret);
}
```

### Environment-specific secrets

```bash
# Development
.env.development

# Staging
.env.staging

# Production (use secrets manager)
# AWS: AWS Secrets Manager
# GCP: Secret Manager
# Azure: Key Vault
# Self-hosted: HashiCorp Vault
```

---

## Monitoring & Alerting

```typescript
import * as Sentry from "@sentry/node";
import { ProfilingIntegration } from "@sentry/profiling-node";

Sentry.init({
	dsn: process.env.SENTRY_DSN,
	environment: process.env.NODE_ENV,
	tracesSampleRate: 1.0,
	profilesSampleRate: 1.0,
	integrations: [new ProfilingIntegration()],
});

// Security event logging
function logSecurityEvent(event: {
	type: "AUTH_FAILURE" | "SUSPICIOUS_ACTIVITY" | "RATE_LIMIT_HIT";
	userId?: string;
	ip: string;
	details: any;
}) {
	logger.warn("Security event", event);

	// Alert on critical events
	if (event.type === "SUSPICIOUS_ACTIVITY") {
		// Send to SIEM, PagerDuty, etc.
	}
}
```

---

## Production Checklist

```markdown
### Environment

-   [ ] NODE_ENV=production
-   [ ] All secrets in environment variables
-   [ ] Error stack traces disabled for clients
-   [ ] Debug logs disabled
-   [ ] Source maps not deployed

### Security Headers

-   [ ] Helmet configured
-   [ ] HSTS enabled (min 1 year)
-   [ ] CSP configured
-   [ ] CORS allowlist configured
-   [ ] X-Powered-By removed

### Authentication

-   [ ] bcrypt salt rounds >= 12
-   [ ] JWT expiration < 1 hour
-   [ ] Refresh tokens used
-   [ ] Rate limiting on auth endpoints
-   [ ] MFA available

### Input Validation

-   [ ] All DTOs validated
-   [ ] Request size limits set
-   [ ] HPP prevention enabled
-   [ ] File upload validation

### Dependencies

-   [ ] npm audit clean
-   [ ] Lockfile committed
-   [ ] ignore-scripts enabled
-   [ ] Regular updates scheduled

### Monitoring

-   [ ] Error tracking (Sentry/Datadog)
-   [ ] Security event logging
-   [ ] Performance monitoring
-   [ ] Alerting configured

### Node.js Runtime

-   [ ] Permission model enabled (if v20+)
-   [ ] Frozen intrinsics (if needed)
-   [ ] **proto** disabled
-   [ ] HTTP timeouts configured

### Network

-   [ ] HTTPS enforced
-   [ ] TLS 1.2+ only
-   [ ] Certificate pinning (if mobile)
-   [ ] Reverse proxy configured
```

---

## Security Testing

```bash
# Dependency scanning
npm audit
npx snyk test
npx retire --js

# SAST
npx semgrep --config=auto .
npx eslint . --plugin security

# Secret scanning
npx detect-secrets scan

# DAST
npm install -g owasp-zap
zap-cli quick-scan http://localhost:3000

# Load testing (DoS prevention)
npx autocannon http://localhost:3000
```

```

```
