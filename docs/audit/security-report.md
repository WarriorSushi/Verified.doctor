# Security Audit Report

**Platform:** Verified.Doctor
**Audit Date:** January 4, 2026
**Auditor:** Claude Opus 4.5 (Security Audit)
**Scope:** Full codebase security review following OWASP Top 10 guidelines

---

## Executive Summary

The Verified.Doctor platform demonstrates a **moderate security posture** with several good practices in place, but also contains **critical vulnerabilities** that require immediate attention before production deployment.

### Overall Assessment: MEDIUM-HIGH RISK

**Strengths:**
- Comprehensive input validation with Zod schemas across all API routes
- Rate limiting infrastructure in place (Upstash Redis)
- Magic byte validation for file uploads
- Audit logging for admin actions
- Secure admin authentication with JWT and bcrypt support

**Critical Concerns:**
- Plain text admin password in production environment
- Overly permissive RLS policies allowing unauthorized data modification
- Real API keys exposed in `.env.local` file (checked into git based on status)
- XSS vulnerabilities in email templates
- Hardcoded admin email in source code

---

## Critical Vulnerabilities

### CVE-LIKE-001: Plaintext Admin Password in Environment

**Severity:** CRITICAL
**Location:** `C:\coding\newverified.doctor\.env.local` (line 12)
**Finding:**
```
ADMIN_PASSWORD=adminadmin
```

The admin password is stored in plaintext as a weak password ("adminadmin"). The `admin-auth.ts` file supports bcrypt hashed passwords but this is not being used.

**Impact:** Complete admin panel compromise. An attacker with access to the environment file gains full administrative access.

**Recommendation:**
1. Generate a bcrypt hash: `npx bcryptjs hash "your-secure-password"`
2. Use the hash in ADMIN_PASSWORD environment variable
3. Use a strong password (16+ characters, mixed case, numbers, symbols)

---

### CVE-LIKE-002: Overly Permissive Row Level Security Policies

**Severity:** CRITICAL
**Location:** Multiple migration files, especially:
- `supabase/migrations/20251230173713_add_profiles_insert_policy.sql`
- `supabase/migrations/20251230174110_add_recommendations_messages_policies.sql`
- `supabase/migrations/20251230180529_add_invites_connections_rls.sql`

**Finding:**
The RLS policies have been weakened to use `WITH CHECK (true)` and `USING (true)` for most operations:

```sql
-- Profiles: Anyone can UPDATE any profile!
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Messages: Anyone can READ any doctor's messages!
CREATE POLICY "Profile owners can read messages" ON messages
  FOR SELECT USING (true);

-- Connections: Anyone can DELETE any connection!
CREATE POLICY "Users can delete their connections" ON connections
  FOR DELETE USING (true);
```

**Impact:**
- Any authenticated user can modify any doctor's profile
- Any authenticated user can read private messages sent to any doctor
- Any authenticated user can delete connections between any doctors
- Patient phone numbers and personal data are exposed

**Recommendation:**
Revert to proper RLS policies that check ownership:
```sql
-- Correct profile update policy
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (
    user_id = (SELECT public.current_user_id())
  );

-- Correct messages read policy
CREATE POLICY "Profile owners can read messages" ON messages
  FOR SELECT USING (
    profile_id IN (
      SELECT id FROM profiles WHERE user_id = (SELECT public.current_user_id())
    )
  );
```

---

### CVE-LIKE-003: Exposed API Keys in Environment File

**Severity:** CRITICAL
**Location:** `C:\coding\newverified.doctor\.env.local`
**Finding:**
The `.env.local` file contains real, active API keys:
- Supabase service role key (full database bypass)
- Upstash Redis token
- Resend API key
- Admin JWT secret

Based on git status showing `.gitignore` as modified, there's a risk these may have been committed previously.

**Impact:** If these keys are in git history or exposed, attackers can:
- Bypass all RLS and access/modify any data
- Send emails on behalf of the platform
- Access rate limiting infrastructure

**Recommendation:**
1. Rotate ALL keys immediately
2. Ensure `.env.local` is in `.gitignore`
3. Check git history: `git log -p -- .env.local`
4. Use `git filter-branch` or BFG to remove from history if found

---

## High Risk Issues

### HIGH-001: XSS Vulnerability in Email Templates

**Severity:** HIGH
**Location:**
- `C:\coding\newverified.doctor\src\app\api\contact\route.ts` (lines 109-131)
- `C:\coding\newverified.doctor\src\app\api\support\route.ts` (lines 101-111)

**Finding:**
User-supplied input is directly interpolated into HTML email templates without sanitization:

```typescript
const emailHtml = `
  ...
  <div class="info-value">${name}</div>
  ...
  <div class="info-value">${subject}</div>
  ...
  <p class="message-content">${message}</p>
  ...
`;
```

**Impact:** Attackers can inject malicious HTML/JavaScript that executes when admin opens the email in certain email clients.

**Recommendation:**
Create a sanitization function:
```typescript
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Use in templates
<div class="info-value">${escapeHtml(name)}</div>
```

---

### HIGH-002: Hardcoded Admin Email

**Severity:** HIGH
**Location:** `C:\coding\newverified.doctor\src\app\api\support\route.ts` (line 7)

**Finding:**
```typescript
const ADMIN_EMAIL = "drsyedirfan93@gmail.com";
```

The admin email is hardcoded in source code instead of using environment variables.

**Impact:**
- Requires code change to update admin email
- Personal email exposed in codebase
- Cannot have different admins per environment

**Recommendation:**
```typescript
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
if (!ADMIN_EMAIL) {
  throw new Error("ADMIN_EMAIL environment variable not configured");
}
```

---

### HIGH-003: Missing Authentication on Profile GET by ID

**Severity:** HIGH
**Location:** `C:\coding\newverified.doctor\src\app\api\profiles\[id]\route.ts` (lines 205-228)

**Finding:**
The GET endpoint returns ALL profile fields without authentication check:

```typescript
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    // NO AUTH CHECK HERE!
    const { data: profile, error } = await supabase
      .from("profiles")
      .select("*")  // Returns ALL fields
      .eq("id", id)
      .single();
```

**Impact:**
- Private fields (user_id, etc.) exposed to unauthenticated users
- Combined with RLS bypass, all profile data is accessible

**Recommendation:**
Either add authentication or limit returned fields:
```typescript
// Option 1: Require authentication
const { userId } = await getAuth();
if (!userId) {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

// Option 2: Return only public fields
.select("id, handle, full_name, specialty, ...")
```

---

### HIGH-004: Verification Documents File Type Validation

**Severity:** HIGH
**Location:** `C:\coding\newverified.doctor\src\app\api\verification\route.ts` (lines 60-78)

**Finding:**
Unlike the general upload route, verification document uploads do NOT validate magic bytes:

```typescript
// Validate file types and sizes - ONLY checks MIME type
const allowedTypes = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
const maxSize = 5 * 1024 * 1024; // 5MB

for (const file of files) {
  if (!allowedTypes.includes(file.type)) {
    // ONLY checks declared MIME type, not actual content!
```

**Impact:** Malicious files could be uploaded by spoofing MIME type.

**Recommendation:**
Add magic byte validation matching the upload route:
```typescript
function validateFileMagicBytes(bytes: Uint8Array, mimeType: string): boolean {
  // Validate JPEG, PNG, WebP magic bytes
  // Add PDF validation: %PDF-
}
```

---

## Medium Risk Issues

### MED-001: Potential SQL Injection in Connection Query

**Severity:** MEDIUM
**Location:** `C:\coding\newverified.doctor\src\app\api\connections\route.ts` (line 46)

**Finding:**
String interpolation in `.or()` filter:
```typescript
.or(`requester_id.eq."${profile.id}",receiver_id.eq."${profile.id}"`)
```

While `profile.id` comes from a database lookup (UUID), the pattern is unsafe.

**Recommendation:**
Use parameterized queries or the safer approach already used elsewhere:
```typescript
// Query both directions separately
const { data: asRequester } = await supabase
  .from("connections")
  .select("*")
  .eq("requester_id", profile.id);
```

---

### MED-002: Missing CSRF Protection

**Severity:** MEDIUM
**Location:** All POST/PATCH/DELETE API routes

**Finding:**
No CSRF token validation is implemented. While cookies use `sameSite: 'lax'`, this doesn't fully protect against all CSRF attacks.

**Recommendation:**
Implement CSRF tokens for state-changing operations, or ensure all mutating requests use JSON Content-Type (which provides some protection).

---

### MED-003: Rate Limiting Bypass in Development

**Severity:** MEDIUM
**Location:** `C:\coding\newverified.doctor\src\lib\rate-limit.ts` (lines 156-164)

**Finding:**
Rate limiting is disabled when Redis is not configured:
```typescript
if (!limiter) {
  if (STRICT_MODE) {
    // In strict mode (production), block requests
  }
  // In development, allow requests
  return { success: true, ... };
}
```

**Impact:** If Redis is misconfigured in production, rate limiting fails open.

**Recommendation:**
The code already handles this with `STRICT_MODE`, but ensure `RATE_LIMIT_STRICT_MODE` is never set to "false" in production.

---

### MED-004: Insufficient Phone Number Validation

**Severity:** MEDIUM
**Location:** `C:\coding\newverified.doctor\src\app\api\messages\route.ts` (line 16)

**Finding:**
```typescript
senderPhone: z.string().min(10, "Valid phone number required").max(20),
```

Only length is validated, not format. Invalid phone numbers can be submitted.

**Recommendation:**
Use a phone number validation library or regex:
```typescript
senderPhone: z.string().regex(
  /^\+?[1-9]\d{9,14}$/,
  "Invalid phone number format"
),
```

---

### MED-005: No Request Size Limits

**Severity:** MEDIUM
**Location:** API routes

**Finding:**
No explicit body size limits are configured. Large JSON payloads could cause memory issues.

**Recommendation:**
Configure body size limits in Next.js config or middleware:
```typescript
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '1mb',
    },
  },
};
```

---

## Low Risk Issues

### LOW-001: innerHTML Usage in Client-Side Code

**Severity:** LOW
**Location:** `C:\coding\newverified.doctor\src\components\landing\hero-section.tsx` (line 420)

**Finding:**
```typescript
target.innerHTML = `<div class="...">${i + 1}</div>`;
```

While the interpolated value is a number, `innerHTML` usage should be minimized.

**Recommendation:**
Use React's state management instead of direct DOM manipulation.

---

### LOW-002: JSON-LD Injection Risk

**Severity:** LOW
**Location:** `C:\coding\newverified.doctor\src\app\[handle]\page.tsx` (line 360)

**Finding:**
```typescript
dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
```

Profile data is included in JSON-LD without escaping `</script>` sequences.

**Recommendation:**
Escape closing script tags in JSON-LD:
```typescript
JSON.stringify(jsonLd).replace(/<\/script>/gi, '<\\/script>')
```

---

### LOW-003: Verbose Error Logging

**Severity:** LOW
**Location:** Multiple API routes

**Finding:**
Detailed error objects are logged to console:
```typescript
console.error("Database error:", error);
```

**Impact:** Sensitive database details may appear in server logs.

**Recommendation:**
Sanitize logged errors in production, avoid logging full error objects.

---

### LOW-004: Missing Security Headers

**Severity:** LOW
**Location:** Not configured

**Finding:**
Common security headers are not explicitly configured:
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Content-Security-Policy`

**Recommendation:**
Add to `next.config.js`:
```javascript
async headers() {
  return [
    {
      source: '/(.*)',
      headers: [
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'X-Frame-Options', value: 'DENY' },
        { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      ],
    },
  ];
}
```

---

## OWASP Top 10 Checklist

| # | Category | Status | Notes |
|---|----------|--------|-------|
| A01 | Broken Access Control | FAIL | RLS policies allow unauthorized access |
| A02 | Cryptographic Failures | WARN | Admin password in plaintext |
| A03 | Injection | WARN | Potential SQL injection patterns, XSS in emails |
| A04 | Insecure Design | PASS | Good separation of concerns, validation patterns |
| A05 | Security Misconfiguration | FAIL | Overly permissive policies, exposed keys |
| A06 | Vulnerable Components | PASS | No known vulnerable dependencies detected |
| A07 | Auth Failures | WARN | Weak admin password, missing CSRF |
| A08 | Software/Data Integrity | PASS | Input validation in place |
| A09 | Logging Failures | WARN | Some verbose error logging |
| A10 | SSRF | PASS | External URLs validated/controlled |

---

## Recommendations (Prioritized)

### Immediate (Before Production)

1. **Hash admin password** with bcrypt and use strong credentials
2. **Rotate all API keys** (Supabase, Upstash, Resend)
3. **Fix RLS policies** to check ownership properly
4. **Verify `.env.local` is not in git history**
5. **Add HTML escaping** to email templates

### Short-Term (Within 2 Weeks)

6. **Add magic byte validation** to verification document uploads
7. **Implement CSRF protection** or verify JSON-only mutations
8. **Add phone number format validation**
9. **Configure security headers** in Next.js
10. **Add authentication** to profile GET by ID endpoint

### Medium-Term (Within 1 Month)

11. **Implement request size limits**
12. **Add Content-Security-Policy header**
13. **Review and sanitize error logging**
14. **Add security monitoring/alerting**
15. **Implement IP blocklist for repeat offenders**

---

## Secure Coding Practices Missing

1. **Principle of Least Privilege:** RLS policies grant more access than needed
2. **Defense in Depth:** API routes rely solely on RLS, need application-level checks
3. **Input Sanitization:** HTML content in emails not escaped
4. **Secrets Management:** Hardcoded values, plaintext passwords
5. **Error Handling:** Detailed errors may leak information

---

## Conclusion

The Verified.Doctor platform has a solid foundation with good practices like Zod validation, rate limiting, and file upload security. However, **the critical RLS policy issues and exposed credentials must be addressed before production deployment**.

The most severe issue is that the RLS policies essentially disable row-level security, making the database accessible to any authenticated user. Combined with exposed API keys, this creates significant data breach risk.

**Recommended Next Steps:**
1. Fix RLS policies immediately
2. Rotate all credentials
3. Re-audit after fixes
4. Consider penetration testing before launch

---

*Report generated by Claude Opus 4.5 Security Audit*
