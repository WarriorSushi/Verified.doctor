/**
 * Tests for /api/check-handle route
 *
 * This API is critical for the onboarding flow:
 * - Validates handle format (3-30 chars, alphanumeric + hyphens)
 * - Checks against banned/reserved handles
 * - Queries database for availability
 * - Rate limits to prevent enumeration attacks
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock dependencies before importing the route
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
}));

vi.mock('@/lib/rate-limit', () => ({
  getHandleCheckLimiter: vi.fn(() => null),
  getClientIp: vi.fn(() => '127.0.0.1'),
  checkRateLimit: vi.fn(() => ({ success: true, limit: 30, remaining: 29 })),
  formatRetryAfter: vi.fn((s: number) => `${s} seconds`),
}));

vi.mock('@/lib/banned-handles', () => ({
  isBannedHandle: vi.fn((handle: string) => {
    const banned = ['admin', 'dashboard', 'api', 'doctor', 'verified'];
    return banned.includes(handle.toLowerCase());
  }),
}));

// Import after mocking
import { POST } from '@/app/api/check-handle/route';
import { createClient } from '@/lib/supabase/server';
import { checkRateLimit } from '@/lib/rate-limit';

// Helper to create mock request
function createMockRequest(body: unknown): Request {
  return new Request('http://localhost:3000/api/check-handle', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

describe('/api/check-handle', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('handle validation', () => {
    it('should reject handles shorter than 3 characters', async () => {
      const request = createMockRequest({ handle: 'ab' });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.available).toBe(false);
      expect(data.error).toContain('at least 3 characters');
    });

    it('should reject handles longer than 30 characters', async () => {
      const longHandle = 'a'.repeat(31);
      const request = createMockRequest({ handle: longHandle });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.available).toBe(false);
      expect(data.error).toContain('at most 30 characters');
    });

    it('should reject handles with uppercase letters', async () => {
      const request = createMockRequest({ handle: 'DrSmith' });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.available).toBe(false);
      expect(data.error).toContain('lowercase');
    });

    it('should reject handles with special characters', async () => {
      const request = createMockRequest({ handle: 'dr_smith' }); // underscore
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.available).toBe(false);
    });

    it('should reject handles with spaces', async () => {
      const request = createMockRequest({ handle: 'dr smith' });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.available).toBe(false);
    });

    it('should reject handles starting with hyphen', async () => {
      const request = createMockRequest({ handle: '-drsmith' });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.available).toBe(false);
      expect(data.error).toContain('cannot start or end with a hyphen');
    });

    it('should reject handles ending with hyphen', async () => {
      const request = createMockRequest({ handle: 'drsmith-' });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.available).toBe(false);
      expect(data.error).toContain('cannot start or end with a hyphen');
    });

    it('should reject handles with consecutive hyphens', async () => {
      const request = createMockRequest({ handle: 'dr--smith' });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.available).toBe(false);
      expect(data.error).toContain('cannot contain consecutive hyphens');
    });

    it('should accept valid handles with hyphens', async () => {
      // Mock database to return no results (handle available)
      const mockSupabase = {
        from: vi.fn(() => ({
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              single: vi.fn(() => ({
                data: null,
                error: { code: 'PGRST116' }, // No rows returned
              })),
            })),
          })),
        })),
      };
      vi.mocked(createClient).mockResolvedValue(mockSupabase as never);

      const request = createMockRequest({ handle: 'dr-smith' });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.available).toBe(true);
    });

    it('should accept valid numeric handles', async () => {
      const mockSupabase = {
        from: vi.fn(() => ({
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              single: vi.fn(() => ({
                data: null,
                error: { code: 'PGRST116' },
              })),
            })),
          })),
        })),
      };
      vi.mocked(createClient).mockResolvedValue(mockSupabase as never);

      const request = createMockRequest({ handle: 'doc123' });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.available).toBe(true);
    });
  });

  describe('banned handles', () => {
    it('should reject banned system handles', async () => {
      const request = createMockRequest({ handle: 'admin' });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200); // Not a validation error, just unavailable
      expect(data.available).toBe(false);
      expect(data.error).toBe('This handle is not available');
    });

    it('should reject reserved medical terms', async () => {
      const request = createMockRequest({ handle: 'doctor' });
      const response = await POST(request);
      const data = await response.json();

      expect(data.available).toBe(false);
      expect(data.error).toBe('This handle is not available');
    });

    it('should reject verification-related handles', async () => {
      const request = createMockRequest({ handle: 'verified' });
      const response = await POST(request);
      const data = await response.json();

      expect(data.available).toBe(false);
    });
  });

  describe('database availability check', () => {
    it('should return available=true when handle not in database', async () => {
      const mockSupabase = {
        from: vi.fn(() => ({
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              single: vi.fn(() => ({
                data: null,
                error: { code: 'PGRST116' }, // No rows = available
              })),
            })),
          })),
        })),
      };
      vi.mocked(createClient).mockResolvedValue(mockSupabase as never);

      const request = createMockRequest({ handle: 'newhandle' });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.available).toBe(true);
      expect(data.message).toBe('This handle is available!');
    });

    it('should return available=false when handle exists in database', async () => {
      const mockSupabase = {
        from: vi.fn(() => ({
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              single: vi.fn(() => ({
                data: { handle: 'takenhandle' },
                error: null,
              })),
            })),
          })),
        })),
      };
      vi.mocked(createClient).mockResolvedValue(mockSupabase as never);

      const request = createMockRequest({ handle: 'takenhandle' });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.available).toBe(false);
      expect(data.error).toBe('This handle is already taken');
    });

    it('should handle database errors gracefully', async () => {
      const mockSupabase = {
        from: vi.fn(() => ({
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              single: vi.fn(() => ({
                data: null,
                error: { code: 'UNKNOWN_ERROR', message: 'Database connection failed' },
              })),
            })),
          })),
        })),
      };
      vi.mocked(createClient).mockResolvedValue(mockSupabase as never);

      const request = createMockRequest({ handle: 'somehandle' });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.available).toBe(false);
      expect(data.error).toBe('Error checking availability');
    });
  });

  describe('rate limiting', () => {
    it('should allow requests within rate limit', async () => {
      vi.mocked(checkRateLimit).mockResolvedValue({
        success: true,
        limit: 30,
        remaining: 29,
        reset: Date.now() + 60000,
      });

      const mockSupabase = {
        from: vi.fn(() => ({
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              single: vi.fn(() => ({
                data: null,
                error: { code: 'PGRST116' },
              })),
            })),
          })),
        })),
      };
      vi.mocked(createClient).mockResolvedValue(mockSupabase as never);

      const request = createMockRequest({ handle: 'validhandle' });
      const response = await POST(request);

      expect(response.status).toBe(200);
    });

    it('should block requests when rate limited', async () => {
      vi.mocked(checkRateLimit).mockResolvedValue({
        success: false,
        limit: 30,
        remaining: 0,
        reset: Date.now() + 60000,
        retryAfter: 45,
      });

      const request = createMockRequest({ handle: 'anyhandle' });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(429);
      expect(data.available).toBe(false);
      expect(data.code).toBe('RATE_LIMITED');
      expect(data.error).toContain('Too many requests');
    });

    it('should include Retry-After header when rate limited', async () => {
      vi.mocked(checkRateLimit).mockResolvedValue({
        success: false,
        limit: 30,
        remaining: 0,
        reset: Date.now() + 60000,
        retryAfter: 45,
      });

      const request = createMockRequest({ handle: 'anyhandle' });
      const response = await POST(request);

      expect(response.headers.get('Retry-After')).toBe('45');
    });
  });

  describe('edge cases', () => {
    it('should handle empty request body', async () => {
      const request = new Request('http://localhost:3000/api/check-handle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: '{}',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.available).toBe(false);
    });

    it('should handle missing handle field', async () => {
      const request = createMockRequest({ something: 'else' });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.available).toBe(false);
    });

    it('should handle malformed JSON', async () => {
      const request = new Request('http://localhost:3000/api/check-handle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: 'not-json',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Internal server error');
    });

    it('should handle exactly 3 character handles', async () => {
      const mockSupabase = {
        from: vi.fn(() => ({
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              single: vi.fn(() => ({
                data: null,
                error: { code: 'PGRST116' },
              })),
            })),
          })),
        })),
      };
      vi.mocked(createClient).mockResolvedValue(mockSupabase as never);

      const request = createMockRequest({ handle: 'abc' });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.available).toBe(true);
    });

    it('should handle exactly 30 character handles', async () => {
      const mockSupabase = {
        from: vi.fn(() => ({
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              single: vi.fn(() => ({
                data: null,
                error: { code: 'PGRST116' },
              })),
            })),
          })),
        })),
      };
      vi.mocked(createClient).mockResolvedValue(mockSupabase as never);

      const handle30chars = 'a'.repeat(30);
      const request = createMockRequest({ handle: handle30chars });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.available).toBe(true);
    });
  });
});
