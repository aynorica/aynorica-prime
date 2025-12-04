```prompt
---
mode: agent
description: Threat modeling methodology for identifying and mitigating security risks
---

# Threat Modeling Guide

Systematic approach to identifying, quantifying, and addressing security threats during design and development.

## Threat Modeling Methodologies

### STRIDE (Microsoft)

| Threat | Definition | Example | Mitigation |
|--------|------------|---------|------------|
| **S**poofing | Pretending to be someone/something else | Fake login page, JWT forgery | Authentication, digital signatures |
| **T**ampering | Unauthorized modification of data | SQL injection, MITM attack | Input validation, integrity checks, HTTPS |
| **R**epudiation | Denying an action was performed | Delete logs, unsigned transactions | Audit logging, digital signatures |
| **I**nformation Disclosure | Exposing information to unauthorized parties | API leaking PII, verbose errors | Encryption, access control, sanitize errors |
| **D**enial of Service | Making system unavailable | DDoS, resource exhaustion | Rate limiting, load balancing, validation |
| **E**levation of Privilege | Gaining unauthorized permissions | IDOR, privilege escalation | Authorization checks, least privilege |

---

### PASTA (Process for Attack Simulation and Threat Analysis)

**7-Stage Process:**

1. **Define Objectives** — Business impact, compliance requirements
2. **Define Technical Scope** — Architecture diagrams, data flows
3. **Application Decomposition** — Components, trust boundaries
4. **Threat Analysis** — Identify threats using STRIDE
5. **Vulnerability Analysis** — Map threats to vulnerabilities
6. **Attack Modeling** — Simulate attack scenarios
7. **Risk & Impact Analysis** — Prioritize and mitigate

---

### DREAD (Risk Rating)

Score each threat on a scale of 1-10:

| Factor | Question |
|--------|----------|
| **D**amage | How bad would an attack be? |
| **R**eproducibility | How easy is it to reproduce? |
| **E**xploitability | How much work to launch attack? |
| **A**ffected Users | How many users affected? |
| **D**iscoverability | How easy to discover vulnerability? |

**Risk Score** = (D + R + E + A + D) / 5

- **High Risk:** 7-10
- **Medium Risk:** 4-6
- **Low Risk:** 1-3

---

## Threat Modeling Process

### Phase 1: System Decomposition

#### 1.1 Create Architecture Diagram

```

┌──────────────┐
│ Browser │
└──────┬───────┘
│ HTTPS
▼
┌──────────────┐
│ API Gateway │ ◄── Rate Limiting
│ (NestJS) │ ◄── Authentication
└──────┬───────┘
│
┌───┴───┬─────────┐
▼ ▼ ▼
┌────┐ ┌────┐ ┌────┐
│Auth│ │User│ │File│
│Svc │ │Svc │ │Svc │
└─┬──┘ └─┬──┘ └─┬──┘
│ │ │
▼ ▼ ▼
┌────────────────────┐
│ PostgreSQL │
└────────────────────┘

Trust Boundaries:

1. Browser ↔ API Gateway (Internet boundary)
2. API Gateway ↔ Services (Application boundary)
3. Services ↔ Database (Data boundary)

````

#### 1.2 Identify Data Flows

```markdown
### Data Flow: User Login

1. **Browser → API Gateway**
   - Protocol: HTTPS (TLS 1.3)
   - Data: { email, password }
   - Trust Level: Untrusted

2. **API Gateway → Auth Service**
   - Protocol: Internal HTTP
   - Data: { email, password (cleartext) }
   - Trust Level: Trusted

3. **Auth Service → Database**
   - Protocol: PostgreSQL wire protocol
   - Data: SELECT query with email parameter
   - Trust Level: Trusted

4. **Database → Auth Service**
   - Data: { userId, hashedPassword, salt }

5. **Auth Service → API Gateway**
   - Data: { accessToken, refreshToken }

6. **API Gateway → Browser**
   - Data: { accessToken, refreshToken }
   - Cookie: HttpOnly, Secure, SameSite
````

#### 1.3 Identify Trust Boundaries

```markdown
### Trust Boundaries

**Boundary 1: Internet → Application**

-   Entry point: API Gateway
-   Protection: TLS, authentication, rate limiting
-   Risk: High (exposed to internet)

**Boundary 2: Application → Database**

-   Entry point: Database connection
-   Protection: Least privilege DB user, parameterized queries
-   Risk: Medium (internal network)

**Boundary 3: Service → Service**

-   Entry point: Internal API calls
-   Protection: Service mesh, mutual TLS (optional)
-   Risk: Low (trusted internal services)
```

---

### Phase 2: Threat Identification (STRIDE Analysis)

#### Example: User Authentication Feature

**Component:** Login Endpoint (`POST /api/auth/login`)

##### Spoofing Threats

| Threat              | Description                      | Mitigation                               |
| ------------------- | -------------------------------- | ---------------------------------------- |
| Credential stuffing | Attacker uses leaked credentials | Rate limiting, CAPTCHA, breach detection |
| Phishing            | Fake login page                  | Domain monitoring, user education        |
| Session hijacking   | Steal session token              | HttpOnly cookies, short expiration       |

##### Tampering Threats

| Threat                   | Description                  | Mitigation                      |
| ------------------------ | ---------------------------- | ------------------------------- |
| MITM attack              | Intercept/modify credentials | HTTPS only, HSTS                |
| Password reset poisoning | Manipulate reset token       | Signed tokens, short expiration |
| Database injection       | Modify queries               | Parameterized queries, ORM      |

##### Repudiation Threats

| Threat               | Description                             | Mitigation                                |
| -------------------- | --------------------------------------- | ----------------------------------------- |
| Deny login attempt   | User claims they didn't log in          | Audit logging (IP, timestamp, user-agent) |
| Deny password change | User claims they didn't change password | Email notification, audit trail           |

##### Information Disclosure Threats

| Threat                 | Description                                | Mitigation               |
| ---------------------- | ------------------------------------------ | ------------------------ |
| User enumeration       | Determine if user exists                   | Generic error messages   |
| Verbose error messages | Stack trace exposure                       | Custom error handler     |
| Timing attacks         | Infer password validity from response time | Constant-time comparison |

##### Denial of Service Threats

| Threat              | Description                   | Mitigation                         |
| ------------------- | ----------------------------- | ---------------------------------- |
| Brute force         | Overwhelm with login attempts | Rate limiting, exponential backoff |
| Resource exhaustion | bcrypt with high cost         | Async processing, queue            |
| Slowloris           | Slow HTTP requests            | Server timeouts, reverse proxy     |

##### Elevation of Privilege Threats

| Threat              | Description              | Mitigation                      |
| ------------------- | ------------------------ | ------------------------------- |
| JWT manipulation    | Change role in token     | Sign tokens, validate signature |
| SQL injection       | Inject admin role        | Parameterized queries           |
| Parameter pollution | Add admin=true parameter | Whitelist parameters            |

---

### Phase 3: Risk Assessment

#### Threat Risk Matrix

```markdown
| Threat ID | Threat                       | Likelihood | Impact   | Risk Score | Priority |
| --------- | ---------------------------- | ---------- | -------- | ---------- | -------- |
| T-001     | SQL Injection in user search | High       | Critical | 9.5        | P0       |
| T-002     | CSRF on password change      | Medium     | High     | 7.0        | P1       |
| T-003     | XSS in comment field         | Medium     | Medium   | 5.5        | P2       |
| T-004     | User enumeration via login   | High       | Low      | 4.0        | P3       |
```

**Likelihood Scale:**

-   **High:** Exploitable with minimal effort
-   **Medium:** Requires moderate skill/effort
-   **Low:** Requires significant effort/access

**Impact Scale:**

-   **Critical:** Full system compromise, data breach
-   **High:** Unauthorized access, data modification
-   **Medium:** Information disclosure, partial DoS
-   **Low:** Minor information leakage

---

### Phase 4: Mitigation Planning

#### Mitigation Strategies

**Priority Matrix:**

```
         High Impact
              │
    Mitigate  │  Mitigate
    First     │  Quickly
──────────────┼──────────────
    Monitor   │  Accept/
    Closely   │  Transfer
              │
         Low Impact
```

#### Example Mitigation Plan

**Threat:** SQL Injection in user search endpoint

**Risk Score:** 9.5 (Critical)

**Mitigation Strategy:**

```typescript
// BEFORE (Vulnerable)
@Get('/search')
async searchUsers(@Query('q') query: string) {
  const sql = `SELECT * FROM users WHERE name LIKE '%${query}%'`;
  return this.db.raw(sql);
}

// AFTER (Secure)
import { IsString, MaxLength } from 'class-validator';

class SearchDto {
  @IsString()
  @MaxLength(100)
  q: string;
}

@Get('/search')
async searchUsers(@Query() dto: SearchDto) {
  // Parameterized query via ORM
  return this.userRepository.find({
    where: {
      name: Like(`%${dto.q}%`), // ORM handles escaping
    },
  });
}
```

**Verification:**

-   [ ] Code review completed
-   [ ] Unit tests added
-   [ ] Integration tests pass
-   [ ] Security scan clean
-   [ ] Penetration test passed

**Residual Risk:** Low

---

## Threat Modeling Templates

### Feature Threat Model Template

```markdown
# Feature: Password Reset

## Description

Allow users to reset their password via email link.

## Architecture
```

[User] → [Email Service] → [User Email]
↓
[Reset Token] → [Database]
↓
[Validation] → [New Password]

```

## Data Flow
1. User requests reset (email)
2. Generate secure token (crypto.randomBytes(32))
3. Store token with expiration (15 minutes)
4. Send email with reset link
5. User clicks link
6. Validate token (not expired, not used)
7. User submits new password
8. Invalidate token, update password

## Assets
- User credentials (password hashes)
- Reset tokens
- Email addresses

## Threats (STRIDE)

### Spoofing
- **T-001:** Attacker sends reset request for victim's email
  - **Mitigation:** Rate limit reset requests per email (5/hour)

### Tampering
- **T-002:** Token prediction/brute force
  - **Mitigation:** Use cryptographically secure random tokens (256-bit)

### Repudiation
- **T-003:** User denies requesting password reset
  - **Mitigation:** Log all reset requests with IP, timestamp

### Information Disclosure
- **T-004:** Email enumeration (different error for invalid email)
  - **Mitigation:** Generic success message regardless of email existence

### Denial of Service
- **T-005:** Email bombing (send many reset emails)
  - **Mitigation:** Rate limit per IP (10/hour)

### Elevation of Privilege
- **T-006:** Reset other user's password
  - **Mitigation:** Token tied to specific user, validate token ownership

## Mitigations Implemented
- [x] Secure token generation (crypto.randomBytes)
- [x] Token expiration (15 minutes)
- [x] One-time use tokens
- [x] Rate limiting (5 requests per email per hour)
- [x] Generic error messages
- [x] HTTPS only
- [x] Audit logging

## Residual Risks
- Low: Email interception (MITM on email)
  - Accepted: Rare scenario, requires email compromise
```

---

### API Endpoint Threat Model

````markdown
# Endpoint: POST /api/documents

## Description

Upload a document file

## Input

-   Multipart form data
-   File (max 10MB)
-   Metadata (title, tags)

## STRIDE Analysis

| Threat              | Risk   | Mitigation                                   |
| ------------------- | ------ | -------------------------------------------- |
| **Spoofing**        | Medium | JWT authentication required                  |
| **Tampering**       | High   | Validate file type, scan for malware         |
| **Repudiation**     | Low    | Log all uploads with userId, timestamp       |
| **Info Disclosure** | Medium | Validate file doesn't contain metadata leaks |
| **DoS**             | High   | File size limit (10MB), rate limiting        |
| **Elevation**       | Medium | User can only upload to own account          |

## Security Controls

```typescript
@UseGuards(JwtAuthGuard)
@UseInterceptors(FileInterceptor('file', {
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    // Allow only specific MIME types
    const allowedMimes = ['application/pdf', 'image/jpeg', 'image/png'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new BadRequestException('Invalid file type'), false);
    }
  },
}))
@Post('documents')
async uploadDocument(
  @UploadedFile() file: Express.Multer.File,
  @Body() dto: UploadDto,
  @Req() req,
) {
  // Virus scan
  await this.virusScanner.scan(file.path);

  // Store with user association
  return this.documentService.create({
    userId: req.user.id, // From JWT
    filename: file.originalname,
    path: file.path,
    ...dto,
  });
}
```
````

````

---

## Automated Threat Modeling

### Using Microsoft Threat Modeling Tool

```xml
<!-- threat-model.tm7 -->
<ThreatModel>
  <Element Type="Process" Id="1" Name="API Gateway">
    <Threats>
      <Threat Type="Spoofing" Status="Mitigated">
        <Description>JWT authentication implemented</Description>
      </Threat>
    </Threats>
  </Element>
</ThreatModel>
````

### Using OWASP Threat Dragon

```json
{
	"summary": {
		"title": "Payment Processing Threat Model"
	},
	"detail": {
		"contributors": [],
		"diagrams": [
			{
				"cells": [
					{
						"type": "tm.Process",
						"id": "payment-gateway",
						"threats": [
							{
								"type": "Tampering",
								"status": "Mitigated",
								"severity": "High",
								"mitigation": "PCI DSS compliant gateway"
							}
						]
					}
				]
			}
		]
	}
}
```

---

## Continuous Threat Modeling

### Integration into SDLC

```markdown
### Design Phase

-   [ ] Create architecture diagram
-   [ ] Identify trust boundaries
-   [ ] Document data flows
-   [ ] Initial STRIDE analysis

### Development Phase

-   [ ] Security unit tests
-   [ ] Code review with security focus
-   [ ] SAST scanning

### Testing Phase

-   [ ] Threat-based test cases
-   [ ] Penetration testing
-   [ ] Vulnerability scanning

### Deployment Phase

-   [ ] Security configuration review
-   [ ] Update threat model with findings
-   [ ] Residual risk acceptance

### Maintenance Phase

-   [ ] Re-assess on architecture changes
-   [ ] Update threat model quarterly
-   [ ] Incorporate new threat intelligence
```

---

## Threat Intelligence Sources

```markdown
-   **OWASP Top 10** — https://owasp.org/Top10/
-   **MITRE ATT&CK** — https://attack.mitre.org/
-   **CVE Database** — https://cve.mitre.org/
-   **NVD** — https://nvd.nist.gov/
-   **CWE** — https://cwe.mitre.org/
-   **SANS Top 25** — https://www.sans.org/top25-software-errors/
```

```

```
