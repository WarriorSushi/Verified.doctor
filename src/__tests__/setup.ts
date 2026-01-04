/**
 * Global test setup for Vitest
 * This file runs before all tests and sets up global mocks
 */

import { vi, beforeEach, afterEach } from 'vitest';

// Mock Next.js headers() function used in many API routes
vi.mock('next/headers', () => ({
  headers: vi.fn(() => ({
    get: vi.fn((key: string) => {
      if (key === 'x-forwarded-for') return '127.0.0.1';
      if (key === 'user-agent') return 'test-agent';
      return null;
    }),
  })),
  cookies: vi.fn(() => ({
    get: vi.fn(),
    set: vi.fn(),
  })),
}));

// Mock NextResponse for API route tests
vi.mock('next/server', async () => {
  const actual = await vi.importActual('next/server');
  return {
    ...actual,
    NextResponse: {
      json: vi.fn((data: unknown, init?: ResponseInit) => {
        return {
          status: init?.status || 200,
          headers: new Headers(init?.headers),
          json: async () => data,
        };
      }),
    },
  };
});

// Reset all mocks between tests
beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  vi.restoreAllMocks();
});

// Suppress console.error in tests unless debugging
const originalConsoleError = console.error;
beforeEach(() => {
  console.error = (...args: unknown[]) => {
    // Only show errors if VERBOSE_TESTS env var is set
    if (process.env.VERBOSE_TESTS) {
      originalConsoleError(...args);
    }
  };
});

afterEach(() => {
  console.error = originalConsoleError;
});
