# Code Quality & Bug Hunt Report

**Generated:** 2026-01-04
**Codebase:** Verified.Doctor - SaaS Platform for Doctor Digital Identity
**Framework:** Next.js 14+ (App Router), TypeScript, Supabase, Clerk

---

## Executive Summary

This comprehensive audit analyzed the entire `src/` directory of the Verified.Doctor codebase. The codebase is generally well-structured with good TypeScript usage, proper validation with Zod, and security-conscious implementations (rate limiting, file validation, etc.).

**Key Findings:**
- **3 Critical Issues** - Could cause crashes or data integrity problems
- **8 High Priority Issues** - Bugs affecting core functionality
- **12 Medium Priority Issues** - Non-critical improvements needed
- **6 Low Priority Issues** - Code style and minor improvements

---

## Critical Issues

### 1. Unused `router` Variable in MessageList Component

**File:** `C:\coding\newverified.doctor\src\components\dashboard\message-list.tsx`
**Line:** 48

```typescript
const router = useRouter();
```

**Issue:** The `router` variable is imported and initialized but never used. While this won't crash the app, it imports Next.js router unnecessarily. More critically, the `isDeleting` state is set but the loading state is not displayed in the delete button UI.

**Impact:** Unused import, potential UX issue during message deletion.

**Recommendation:** Either remove the unused router or use `router.refresh()` after successful message deletion to ensure the UI syncs with server state.

---

### 2. Analytics Event Type Mismatch Between Client and Server

**File (Client):** `C:\coding\newverified.doctor\src\lib\analytics.ts`
**File (Server):** `C:\coding\newverified.doctor\src\app\api\analytics\track\route.ts`

**Issue:** The client-side `AnalyticsEventType` includes `"click_share"` but the server-side Zod schema does not validate this event type:

```typescript
// Client side (analytics.ts)
export type AnalyticsEventType =
  | "profile_view"
  | "click_save_contact"
  // ...
  | "click_share"  // <-- EXISTS HERE
  | "inquiry_sent"
  | "recommendation_given";

// Server side (track/route.ts)
const trackEventSchema = z.object({
  eventType: z.enum([
    "profile_view",
    "click_save_contact",
    // ... NO "click_share" HERE
  ]),
});
```

**Impact:** If `trackEvent({ eventType: "click_share" })` is called, it will pass TypeScript checks but fail Zod validation on the server, silently failing (analytics fails silently by design).

**Recommendation:** Add `"click_share"` to the server-side Zod enum to maintain consistency.

---

### 3. Profile Template Validation Mismatch

**File:** `C:\coding\newverified.doctor\src\app\api\profiles\route.ts`
**Line:** 38

```typescript
profileTemplate: z.enum(["classic", "modern", "minimal", "professional"]).optional(),
```

**Issue:** The API accepts `"modern"`, `"minimal"`, `"professional"` as valid templates, but:
1. The onboarding page (`src/app/(dashboard)/onboarding/page.tsx`) only offers: `"classic"`, `"ocean"`, `"sage"`, `"warm"`
2. The theme-config (`src/lib/theme-config.ts`) uses: `"blue"`, `"ocean"`, `"sage"`, `"warm"`, `"teal"`, `"executive"`

**Impact:** A user could potentially send an invalid template through a crafted API request. The profile page fallback logic handles this gracefully, but data consistency is compromised.

**Recommendation:** Update the Zod schema to match the actual available templates:
```typescript
profileTemplate: z.enum(["classic", "ocean", "sage", "warm"]).optional(),
```

---

## High Priority Issues

### 4. Message Database Field Missing from Schema

**File:** `C:\coding\newverified.doctor\src\app\api\messages\route.ts`
**Line:** 82

```typescript
sender_email: senderEmail || null,
```

**Issue:** The `sender_email` field is being inserted into the `messages` table, but the database types file (`src/types/database.ts`) does not include `sender_email` in the messages table schema. Either:
1. The field was added via migration but types weren't regenerated
2. The insert is failing silently

**Impact:** Potential data loss - patient emails may not be stored.

**Recommendation:** Regenerate database types with `pnpm db:generate` after verifying the migration exists.

---

### 5. Race Condition in View Count Increment

**File:** `C:\coding\newverified.doctor\src\app\[handle]\page.tsx`
**Line:** 298

```typescript
// Increment view count (fire and forget)
supabase.rpc("increment_view_count", { profile_uuid: extendedProfile.id });
```

**Issue:** The RPC call is not awaited, which is intentional for performance. However, if the RPC fails, there's no error handling or logging, and the Promise rejection could potentially cause issues in strict mode.

**Impact:** Lost view counts if RPC fails; potential unhandled promise rejection.

**Recommendation:** Add a `.catch()` handler:
```typescript
supabase.rpc("increment_view_count", { profile_uuid: extendedProfile.id })
  .catch(err => console.error("Failed to increment view count:", err));
```

---

### 6. Unhandled Case in Hero Section Error Handler

**File:** `C:\coding\newverified.doctor\src\components\landing\hero-section.tsx`
**Lines:** 167-169

```typescript
} catch {
  setStatus(Math.random() > 0.3 ? "available" : "taken");
}
```

**Issue:** When the availability check API fails, the code randomly decides if the handle is available or taken. This is extremely problematic - users might think a handle is available when the check failed, leading to confusion during signup.

**Impact:** Poor UX; users could attempt to claim handles that are actually taken.

**Recommendation:** Show an error state instead:
```typescript
} catch {
  setStatus("idle");
  toast.error("Failed to check availability. Please try again.");
}
```

---

### 7. Unused State Variable in Hero Section

**File:** `C:\coding\newverified.doctor\src\components\landing\hero-section.tsx`
**Line:** 151

```typescript
const demoName = useTypewriter(DEMO_NAMES, true);
```

**Issue:** The `isActive` parameter is hardcoded to `true`, making it never stop. According to the PRD, the typewriter animation should "stop immediately when user clicks input" - this would require passing `!isInputFocused` instead of `true`.

**Impact:** Animation continues even when user is interacting with input, which doesn't match PRD specification.

**Recommendation:**
```typescript
const demoName = useTypewriter(DEMO_NAMES, !isInputFocused);
```

---

### 8. Missing Clerk User ID in Profile Types

**File:** `C:\coding\newverified.doctor\src\types\database.ts`

**Issue:** The database schema uses `user_id` which maps to Supabase Auth user IDs, but the PRD specifies Clerk for authentication. The `clerk_user_id` field mentioned in the implementation docs (`docs/implementation.md`) is not present in the actual database schema.

**Impact:** May cause confusion about authentication flow; if Clerk and Supabase Auth are both being used, there could be ID mismatches.

**Recommendation:** Clarify whether `user_id` stores Clerk IDs or Supabase Auth IDs and update documentation accordingly.

---

### 9. Analytics Supabase Client Cast to Any

**File:** `C:\coding\newverified.doctor\src\app\api\analytics\track\route.ts`
**Line:** 30

```typescript
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const supabase = await createClient() as any;
```

**Issue:** Type safety is deliberately bypassed. This suggests either:
1. The `analytics_events` table types are out of sync with the database
2. There's a type incompatibility being worked around

**Impact:** No compile-time type checking for analytics inserts; potential runtime errors.

**Recommendation:** Regenerate types and remove the `any` cast.

---

### 10. Messages API Also Uses Any Cast

**File:** `C:\coding\newverified.doctor\src\app\api\messages\route.ts`
**Lines:** 160-161

```typescript
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const { data: messages, error } = await (supabase as any)
```

**Issue:** Same pattern - type safety bypassed for the messages query.

**Impact:** Potential type mismatches between query results and expectations.

**Recommendation:** Investigate why the standard typed client doesn't work and fix the underlying type issue.

---

### 11. Recommend Button Toast Uses Escaped HTML Entity

**File:** `C:\coding\newverified.doctor\src\components\profile\recommend-button.tsx`
**Line:** 32

```typescript
toast.info("You&apos;ve already recommended this doctor");
```

**Issue:** HTML entity `&apos;` is being used in a plain string, which will display literally as "You&apos;ve" instead of "You've".

**Impact:** Poor UX - incorrect text display to users.

**Recommendation:** Use the actual apostrophe character:
```typescript
toast.info("You've already recommended this doctor");
```

---

## Medium Priority Issues

### 12. ValidatedInput Value Synchronization

**File:** `C:\coding\newverified.doctor\src\components\ui\validated-input.tsx`
**Lines:** 34, 82-86

```typescript
const [value, setValue] = useState((props.value as string) || (props.defaultValue as string) || "");
// ...
const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const newValue = e.target.value;
  setValue(newValue);
  props.onChange?.(e);
};
```

**Issue:** The component maintains internal state AND receives `props.value`, but never syncs when `props.value` changes externally. This can cause the controlled value to diverge from the displayed value.

**Impact:** Form state can become out of sync with displayed value if parent updates `value` prop.

**Recommendation:** Add a `useEffect` to sync with external value changes:
```typescript
useEffect(() => {
  if (props.value !== undefined && props.value !== value) {
    setValue(props.value as string);
  }
}, [props.value]);
```

---

### 13. Missing Loading State for Invite Validation

**File:** `C:\coding\newverified.doctor\src\app\(dashboard)\onboarding\page.tsx`
**Lines:** 103-127

**Issue:** When `validateInvite` is called, there's no loading state shown to the user. The invite status banner only appears after validation completes or fails.

**Impact:** User sees no feedback while invite code is being validated on page load.

**Recommendation:** Add a loading state for `inviteStatus` and show a loading indicator.

---

### 14. Missing `sender_email` Field in Message Interface

**File:** `C:\coding\newverified.doctor\src\components\dashboard\message-list.tsx`
**Line:** 31

```typescript
sender_email?: string | null;
```

**Issue:** The interface correctly includes `sender_email` but it's marked as optional. The component handles this correctly in the UI, but this could be made consistent with the actual database schema.

**Impact:** Minor - works correctly but could be cleaner.

---

### 15. Hardcoded QR Code Service URL

**File:** `C:\coding\newverified.doctor\src\app\(dashboard)\dashboard\page.tsx`
**Lines:** 152-155, 163-165

```typescript
src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://verified.doctor/${profile.handle}`}
```

**Issue:** The QR code generation uses an external third-party service (`api.qrserver.com`). The PRD specifies using the `qrcode` npm package for generation.

**Impact:**
1. Dependency on external service availability
2. Potential privacy concern (profile URLs sent to third party)
3. Rate limiting by the external service

**Recommendation:** Implement a local QR code generation API as specified in the implementation docs (`/api/qr/[handle]`).

---

### 16. Inconsistent Template System Architecture

**Files:**
- `C:\coding\newverified.doctor\src\lib\theme-config.ts` - Defines 3 layouts and 6 themes
- `C:\coding\newverified.doctor\src\components\profile\templates\index.ts` - Exports 7 templates
- `C:\coding\newverified.doctor\src\app\[handle]\page.tsx` - Routes to 3 layout templates

**Issue:** The template/theme system has evolved and now has multiple overlapping concepts:
1. **Layouts** (classic, hero, timeline) - structural templates
2. **Themes** (blue, ocean, sage, warm, teal, executive) - color schemes
3. **Legacy templates** (ocean, sage, warm, executive) - marked as deprecated

The routing logic only uses layouts (`classic`, `hero`, `timeline`) but the legacy templates still exist.

**Impact:** Code confusion; unnecessary files that may never be used.

**Recommendation:** Remove deprecated template files after confirming they're not referenced.

---

### 17. Missing Error Boundary for Profile Templates

**File:** `C:\coding\newverified.doctor\src\app\[handle]\page.tsx`

**Issue:** If any of the template components (`ClassicTemplate`, `HeroTemplate`, `TimelineTemplate`) throw an error during render, the entire profile page crashes without a graceful fallback.

**Impact:** Profile pages could show a generic error instead of falling back to a simpler display.

**Recommendation:** Wrap template rendering in an error boundary or try-catch with fallback rendering.

---

### 18. Potential Memory Leak in useDoctorCount Hook

**File:** `C:\coding\newverified.doctor\src\components\landing\hero-section.tsx`
**Lines:** 86-116

```typescript
// Set up recurring increments
const intervalId = setInterval(() => {
  clearTimeout(timeoutId);
  timeoutId = scheduleIncrement();
}, 2000 + Math.random() * 4000);
```

**Issue:** The cleanup function clears both `timeoutId` and `intervalId`, but the `intervalId` timing itself uses `Math.random()` which creates an inconsistent interval pattern. More importantly, every interval callback creates a new timeout, which could lead to multiple overlapping timeouts if the interval fires faster than the timeout.

**Impact:** Potential timer accumulation over long sessions.

**Recommendation:** Refactor to use a single `setTimeout` chain or a more predictable pattern:
```typescript
const scheduleNext = () => {
  const delay = 2000 + Math.random() * 4000;
  return setTimeout(() => {
    incrementCount();
    timeoutId = scheduleNext();
  }, delay);
};
```

---

### 19. Missing Validation for External Booking URL

**File:** `C:\coding\newverified.doctor\src\app\api\profiles\route.ts`
**Line:** 29

```typescript
externalBookingUrl: z.string().url().optional().or(z.literal("")),
```

**Issue:** The validation allows any URL, but for security, medical booking URLs should probably be validated against a whitelist of known booking platforms (Practo, Doctolib, etc.) or at least checked for HTTPS.

**Impact:** Potential for malicious URLs to be stored and displayed on profiles.

**Recommendation:** Add HTTPS requirement:
```typescript
externalBookingUrl: z.string().url().refine(url => url.startsWith("https://"), "URL must use HTTPS").optional().or(z.literal("")),
```

---

### 20. Connection Count Fallback Logic Could Be Cleaner

**File:** `C:\coding\newverified.doctor\src\app\api\profiles\route.ts`
**Lines:** 247-275

**Issue:** The fallback logic for incrementing connection counts when RPC fails manually fetches and updates counts. However, this isn't atomic and could lead to race conditions if multiple invites are being processed simultaneously.

**Impact:** Potential for incorrect connection counts in high-concurrency scenarios.

**Recommendation:** Consider using a database transaction or a more robust fallback mechanism.

---

### 21. Image Cropper Not Validating Aspect Ratio Output

**File:** `C:\coding\newverified.doctor\src\app\(dashboard)\onboarding\page.tsx`
**Line:** 279

```typescript
aspectRatio={1}
```

**Issue:** While the aspect ratio is set to 1 (square), there's no server-side validation that the uploaded image is actually square. A malicious client could bypass the cropper.

**Impact:** Profile photos might not display correctly if non-square images are uploaded.

**Recommendation:** Add server-side aspect ratio validation in the upload API.

---

### 22. Missing CSRF Protection on Recommendation API

**File:** `C:\coding\newverified.doctor\src\app\api\recommend\route.ts`

**Issue:** The recommendation API relies on fingerprinting and rate limiting but has no CSRF protection. A malicious site could potentially submit recommendations on behalf of visitors.

**Impact:** Recommendation counts could be artificially inflated.

**Recommendation:** Add a CSRF token or same-origin validation.

---

### 23. Unused Import in ConnectionsList

**File:** `C:\coding\newverified.doctor\src\components\dashboard\connections-list.tsx`
**Line:** 4

```typescript
import { useRouter } from "next/navigation";
```

**Issue:** `useRouter` is imported and used (line 50: `const router = useRouter()`), but `router.refresh()` is only called on successful accept/reject. The router could also be used after actions to ensure UI consistency.

**Impact:** Minor - the import is used, but refresh could be added to error cases too.

---

## Low Priority Issues

### 24. Console Error Logs in Production

**Multiple Files:**
- `src/app/api/profiles/route.ts`
- `src/app/api/messages/route.ts`
- `src/app/api/recommend/route.ts`
- etc.

**Issue:** Many API routes use `console.error()` for logging. In production, these should use a proper logging service (as mentioned in tech stack - Sentry).

**Impact:** Logs may be lost; no alerting on errors.

**Recommendation:** Integrate Sentry or similar error tracking.

---

### 25. Inconsistent Button Sizing

**File:** `C:\coding\newverified.doctor\src\app\(dashboard)\dashboard\page.tsx`

**Issue:** The dashboard uses a mix of `size="sm"` and `size="default"` for buttons without clear pattern. The "View Your Public Profile" button uses `size="default"` while others use `size="sm"`.

**Impact:** Minor visual inconsistency.

---

### 26. Missing TypeScript Strict Mode Enforcement

**Issue:** While TypeScript is used throughout, there are several places where `any` is used or type safety is bypassed with `as unknown as Type`.

**Impact:** Potential runtime type errors.

**Recommendation:** Enable stricter TypeScript settings and address all type issues.

---

### 27. Unused RATE_LIMIT_WINDOW_MS Constant

**File:** `C:\coding\newverified.doctor\src\app\api\recommend\route.ts`
**Line:** 16

```typescript
const RATE_LIMIT_WINDOW_MS = 24 * 60 * 60 * 1000;
```

**Issue:** This constant is defined but not used - the actual rate limit window is configured in the `getRecommendationLimiter()` function.

**Impact:** Dead code.

---

### 28. Tailwind Arbitrary Values

**Multiple Files:**

**Issue:** Several files use arbitrary Tailwind values like `text-[10px]`, `w-[600px]`, which work but make the design system less consistent.

**Impact:** Harder to maintain consistent spacing/sizing.

**Recommendation:** Define custom sizes in Tailwind config.

---

### 29. Missing Alt Text Descriptions

**File:** `C:\coding\newverified.doctor\src\components\profile\templates\classic-template.tsx`

**Issue:** Some Image components use generic alt text like "Verified" instead of descriptive text.

**Impact:** Accessibility - screen readers won't convey meaningful information.

---

## Dead Code & Unused Imports

### Files with Unused Imports/Variables

| File | Unused Import/Variable |
|------|----------------------|
| `src/components/dashboard/message-list.tsx` | `router` (useRouter) - initialized but refresh never called |
| `src/app/api/recommend/route.ts` | `RATE_LIMIT_WINDOW_MS` constant defined but unused |
| `src/components/profile/templates/index.ts` | Legacy exports (OceanTemplate, SageTemplate, etc.) marked deprecated |

### Deprecated/Legacy Files

| File | Reason |
|------|--------|
| `src/components/profile/templates/ocean-template.tsx` | Deprecated - uses old theme system |
| `src/components/profile/templates/sage-template.tsx` | Deprecated - uses old theme system |
| `src/components/profile/templates/warm-template.tsx` | Deprecated - uses old theme system |
| `src/components/profile/templates/executive-template.tsx` | Deprecated - uses old theme system |

---

## Implementation vs Documentation Gaps

### Features Specified in PRD but Not Found/Different

| PRD Feature | Status | Notes |
|-------------|--------|-------|
| SMS Reply System | NOT IMPLEMENTED | PRD specifies MSG91 for SMS replies; no SMS sending code found |
| QR Code API (`/api/qr/[handle]`) | NOT IMPLEMENTED | Using external qrserver.com service instead |
| Admin Panel (`/admin`) | PARTIAL | Admin verification exists but no dedicated admin dashboard |
| Profile Completion Bar | IMPLEMENTED | Works correctly |
| Tiered Badge Display | PARTIAL | Connection count shown but not tiered badges (Silver/Gold/Platinum) |
| Typewriter Animation Stop | NOT WORKING | Animation continues when input is focused (should stop per PRD) |

### Database Schema Differences

| PRD Table | Actual | Notes |
|-----------|--------|-------|
| `clerk_user_id` in profiles | `user_id` | Column name differs from spec |
| `verification_documents.deleted_at` | NOT PRESENT | PRD mentions 90-day deletion |

### Template System

The PRD defines 4 color themes (Classic, Ocean, Sage, Warm), but the implementation has evolved to a separate layout/theme system with 3 layouts and 6 color themes. This is an improvement but documentation should be updated.

---

## Recommendations

### Priority 1 - Fix Before Production

1. **Fix toast HTML entity** in `recommend-button.tsx`
2. **Fix analytics event type mismatch** between client/server
3. **Fix random availability status** in hero section catch block
4. **Fix template validation schema** in profiles API

### Priority 2 - Soon After Launch

5. **Regenerate database types** to sync `sender_email` and other fields
6. **Implement local QR code generation** to remove external dependency
7. **Add error boundaries** for profile templates
8. **Fix typewriter animation** to stop on input focus

### Priority 3 - Technical Debt

9. **Remove deprecated template files** (ocean, sage, warm, executive templates)
10. **Remove `any` type casts** and fix underlying type issues
11. **Add proper logging service** (Sentry integration)
12. **Implement SMS reply functionality** as specified in PRD

### Priority 4 - Nice to Have

13. **Add CSRF protection** to public-facing APIs
14. **Clean up unused imports** and dead code
15. **Standardize button sizes** and Tailwind arbitrary values
16. **Update documentation** to match current implementation

---

## Summary Statistics

| Category | Count |
|----------|-------|
| Critical Issues | 3 |
| High Priority Issues | 8 |
| Medium Priority Issues | 12 |
| Low Priority Issues | 6 |
| Dead Code Files | 4 |
| Missing PRD Features | 3 |

**Overall Code Quality Score: 7.5/10**

The codebase is well-structured and follows Next.js best practices. Security measures (rate limiting, input validation, file type checking) are properly implemented. The main concerns are type safety issues, the mismatch between documentation and implementation, and some UX bugs that should be addressed before wider launch.
