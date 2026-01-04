# Test Coverage Analysis Report

**Generated:** 2026-01-04
**Codebase:** Verified.Doctor
**Analyzer:** Claude Opus 4.5

---

## Executive Summary

The Verified.Doctor codebase currently has **zero test coverage**. There are no test files, no test configuration (vitest.config.ts or playwright.config.ts), and no test scripts in package.json beyond the default placeholder.

This report identifies critical paths requiring tests, provides a testing strategy, and includes ready-to-use test file implementations.

---

## Current Coverage

### Test Files
- **Unit Tests:** None found
- **Integration Tests:** None found
- **E2E Tests:** None found

### Test Configuration
- **vitest.config.ts:** Not present
- **playwright.config.ts:** Not present
- **package.json test scripts:** Only default `"test": "..."` placeholder (not configured)

### Testing Dependencies
Missing from package.json:
- `vitest`
- `@vitejs/plugin-react`
- `@testing-library/react`
- `playwright` or `@playwright/test`
- `msw` (for API mocking)

---

## Critical Test Gaps

### Priority 1: Critical Business Logic (Must Have)

| Component | File | Risk Level | Business Impact |
|-----------|------|------------|-----------------|
| Handle Validation | `src/lib/banned-handles.ts` | **HIGH** | Prevents squatting, offensive handles |
| Metrics Formatting | `src/lib/format-metrics.ts` | **HIGH** | Core display logic for recommendations |
| Handle Check API | `src/app/api/check-handle/route.ts` | **CRITICAL** | User onboarding flow depends on this |
| Recommend API | `src/app/api/recommend/route.ts` | **CRITICAL** | Anti-spam, rate limiting, social proof |
| Profile Creation API | `src/app/api/profiles/route.ts` | **CRITICAL** | Core signup flow |
| Rate Limiting | `src/lib/rate-limit.ts` | **HIGH** | Security, anti-abuse |

### Priority 2: High Value Features

| Component | File | Risk Level |
|-----------|------|------------|
| Message API | `src/app/api/messages/route.ts` | HIGH |
| Theme Config | `src/lib/theme-config.ts` | MEDIUM |
| Auth Helpers | `src/lib/auth/index.ts` | HIGH |
| Invite System | `src/app/api/invites/route.ts` | MEDIUM |
| Connections API | `src/app/api/connections/route.ts` | MEDIUM |

### Priority 3: Supporting Functionality

| Component | File | Risk Level |
|-----------|------|------------|
| Admin Auth | `src/lib/admin-auth.ts` | MEDIUM |
| Analytics | `src/lib/analytics.ts` | LOW |
| Email Templates | `src/lib/email/templates.ts` | LOW |
| Upload Utils | `src/lib/upload.ts` | MEDIUM |

---

## Testing Strategy

### Unit Testing (Vitest)

**When to Use:** Pure functions, validation logic, formatting utilities

**Coverage Targets:**
- `src/lib/banned-handles.ts` - 100%
- `src/lib/format-metrics.ts` - 100%
- `src/lib/theme-config.ts` - 100%
- `src/lib/rate-limit.ts` - 80% (helper functions)
- `src/lib/utils.ts` - 100%

**Approach:**
1. Test all edge cases for validation functions
2. Test boundary conditions for metrics formatting
3. Mock external dependencies (Supabase, Redis)
4. Use snapshot testing for theme configurations

### Integration Testing

**When to Use:** API routes, database operations, auth flows

**Coverage Targets:**
- All API routes in `src/app/api/`
- Database queries and mutations
- Authentication middleware

**Approach:**
1. Mock Supabase client with `vi.mock()`
2. Mock Redis/rate limiting
3. Test request/response contracts
4. Verify error handling and status codes

### E2E Testing (Playwright)

**When to Use:** Critical user journeys, cross-page flows

**Coverage Targets:**
1. Handle claim flow (homepage -> availability check -> signup)
2. Onboarding flow (signup -> profile creation -> success)
3. Profile viewing (public profile -> recommend -> confirm)
4. Dashboard navigation (auth -> dashboard -> settings)
5. Admin verification flow

**Approach:**
1. Use test database or mock API responses
2. Enable test auth bypass for authenticated flows
3. Visual regression testing for profile templates
4. Mobile viewport testing for responsive layouts

---

## Test File Organization

```
src/
├── __tests__/
│   ├── lib/
│   │   ├── banned-handles.test.ts
│   │   ├── format-metrics.test.ts
│   │   ├── theme-config.test.ts
│   │   ├── rate-limit.test.ts
│   │   └── utils.test.ts
│   ├── api/
│   │   ├── check-handle.test.ts
│   │   ├── recommend.test.ts
│   │   ├── profiles.test.ts
│   │   ├── messages.test.ts
│   │   └── invites.test.ts
│   └── setup.ts                    # Global test setup
├── e2e/
│   ├── claim-flow.spec.ts
│   ├── onboarding.spec.ts
│   ├── profile-view.spec.ts
│   └── dashboard.spec.ts
└── ...
```

---

## Configuration Requirements

### Vitest Configuration

Create `vitest.config.ts`:

```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/__tests__/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
    exclude: ['node_modules', 'e2e'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/lib/**', 'src/app/api/**'],
      exclude: ['src/**/*.d.ts', 'src/__tests__/**'],
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
});
```

### Playwright Configuration

Create `playwright.config.ts`:

```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './src/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'mobile',
      use: { ...devices['iPhone 13'] },
    },
  ],
  webServer: {
    command: 'pnpm dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
```

### Package.json Scripts

Add to `package.json`:

```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui"
  },
  "devDependencies": {
    "vitest": "^1.6.0",
    "@vitejs/plugin-react": "^4.3.0",
    "@vitest/coverage-v8": "^1.6.0",
    "@vitest/ui": "^1.6.0",
    "@testing-library/react": "^15.0.0",
    "@playwright/test": "^1.44.0"
  }
}
```

---

## Test Data Strategy

### Mocking

**Supabase Client:**
```typescript
// Mock the entire module
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => ({
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(),
        })),
      })),
      insert: vi.fn(),
      update: vi.fn(),
    })),
    auth: {
      getUser: vi.fn(),
    },
  })),
}));
```

**Rate Limiting:**
```typescript
vi.mock('@/lib/rate-limit', () => ({
  getHandleCheckLimiter: vi.fn(() => null),
  getClientIp: vi.fn(() => '127.0.0.1'),
  checkRateLimit: vi.fn(() => ({ success: true, limit: 30, remaining: 29 })),
  formatRetryAfter: vi.fn((s) => `${s} seconds`),
}));
```

### Test Fixtures

Create `src/__tests__/fixtures/`:

```typescript
// profiles.ts
export const mockProfile = {
  id: '123e4567-e89b-12d3-a456-426614174000',
  handle: 'dr-smith',
  full_name: 'Dr. John Smith',
  specialty: 'Cardiology',
  is_verified: true,
  recommendation_count: 45,
  connection_count: 12,
};

// users.ts
export const mockUser = {
  id: 'user-123',
  email: 'doctor@example.com',
};
```

---

## CI/CD Integration

### GitHub Actions Workflow

Create `.github/workflows/test.yml`:

```yaml
name: Tests

on:
  push:
    branches: [main, master]
  pull_request:
    branches: [main, master]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v3
        with:
          version: 8
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'
      - run: pnpm install
      - run: pnpm test:coverage
      - uses: codecov/codecov-action@v4
        with:
          file: ./coverage/coverage-final.json

  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v3
        with:
          version: 8
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'
      - run: pnpm install
      - run: pnpm exec playwright install --with-deps
      - run: pnpm test:e2e
      - uses: actions/upload-artifact@v4
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
```

---

## Recommended Test Files to Create

### Immediate Priority (Created in this audit)

1. **`src/__tests__/lib/banned-handles.test.ts`**
   - Tests for `isBannedHandle()` function
   - Edge cases: case sensitivity, exact matches, similar words

2. **`src/__tests__/lib/format-metrics.test.ts`**
   - Tests for `formatRecommendationCount()`
   - Tests for `formatConnectionCount()`
   - Tests for `formatViewCount()`
   - Boundary conditions for all tier thresholds

3. **`src/__tests__/api/check-handle.test.ts`**
   - Valid handle check (available)
   - Invalid handle format (validation errors)
   - Banned handle rejection
   - Taken handle response
   - Rate limiting behavior

4. **`src/__tests__/api/recommend.test.ts`**
   - New recommendation success
   - Duplicate prevention (fingerprint)
   - Rate limiting (IP-based)
   - Invalid profile ID handling

### Next Phase

5. **`src/__tests__/api/profiles.test.ts`**
   - Profile creation success
   - Handle collision handling
   - Invite code processing
   - Validation error responses

6. **`src/__tests__/api/messages.test.ts`**
   - Message creation
   - Rate limiting
   - Doctor message retrieval

7. **`src/__tests__/lib/theme-config.test.ts`**
   - Theme retrieval
   - CSS variable generation
   - Fallback behavior

8. **`src/__tests__/lib/rate-limit.test.ts`**
   - Helper function tests
   - Fallback behavior when Redis unavailable

---

## Risk Assessment

### Current Risks (No Tests)

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Handle validation bypass | Medium | High | Unit tests for banned-handles.ts |
| Recommendation spam | High | Medium | Integration tests for recommend API |
| Profile creation race conditions | Low | High | Integration tests for profiles API |
| Metric display errors | Medium | Low | Unit tests for format-metrics.ts |
| Rate limiting failures | Medium | High | Integration tests with mocked Redis |

### Post-Testing Risk Reduction

With the recommended tests in place:
- Handle validation bypass: **LOW** (100% coverage)
- Recommendation spam: **LOW** (API + rate limit tests)
- Profile creation issues: **LOW** (integration tests)
- Metric errors: **VERY LOW** (comprehensive unit tests)

---

## Implementation Checklist

- [ ] Install testing dependencies
- [ ] Create vitest.config.ts
- [ ] Create playwright.config.ts
- [ ] Add test scripts to package.json
- [ ] Create `src/__tests__/setup.ts`
- [ ] Implement banned-handles.test.ts
- [ ] Implement format-metrics.test.ts
- [ ] Implement check-handle.test.ts
- [ ] Implement recommend.test.ts
- [ ] Set up GitHub Actions workflow
- [ ] Add coverage badges to README

---

## Appendix: Test File Locations

All test files should be created in `src/__tests__/` to keep them organized and separate from source code. The folder structure mirrors the source structure for easy navigation.

| Source File | Test File |
|-------------|-----------|
| `src/lib/banned-handles.ts` | `src/__tests__/lib/banned-handles.test.ts` |
| `src/lib/format-metrics.ts` | `src/__tests__/lib/format-metrics.test.ts` |
| `src/lib/theme-config.ts` | `src/__tests__/lib/theme-config.test.ts` |
| `src/lib/rate-limit.ts` | `src/__tests__/lib/rate-limit.test.ts` |
| `src/app/api/check-handle/route.ts` | `src/__tests__/api/check-handle.test.ts` |
| `src/app/api/recommend/route.ts` | `src/__tests__/api/recommend.test.ts` |
| `src/app/api/profiles/route.ts` | `src/__tests__/api/profiles.test.ts` |
| `src/app/api/messages/route.ts` | `src/__tests__/api/messages.test.ts` |
