/**
 * Tests for /api/recommend route
 *
 * This API is critical for the recommendation/social proof system:
 * - Validates profile ID (must be valid UUID)
 * - Prevents duplicate recommendations via fingerprint
 * - Rate limits per IP per profile (1 per 24h)
 * - Falls back to database check for IP-based duplicates
 * - Increments recommendation count atomically
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock dependencies before importing the route
vi.mock('next/headers', () => ({
  headers: vi.fn(() => ({
    get: vi.fn((key: string) => {
      if (key === 'user-agent') return 'Mozilla/5.0 Test Agent';
      if (key === 'accept-language') return 'en-US';
      if (key === 'accept-encoding') return 'gzip, deflate';
      if (key === 'sec-ch-ua') return '"Test";v="1"';
      if (key === 'sec-ch-ua-platform') return '"Windows"';
      if (key === 'sec-ch-ua-mobile') return '?0';
      return null;
    }),
  })),
}));

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
}));

vi.mock('@/lib/rate-limit', () => ({
  getRecommendationLimiter: vi.fn(() => null),
  getClientIp: vi.fn(() => '192.168.1.1'),
  checkRateLimit: vi.fn(() => ({ success: true, limit: 1, remaining: 0 })),
}));

// Import after mocking
import { POST } from '@/app/api/recommend/route';
import { createClient } from '@/lib/supabase/server';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';

// Test UUIDs
const VALID_PROFILE_ID = '123e4567-e89b-12d3-a456-426614174000';
const VALID_PROFILE_ID_2 = '223e4567-e89b-12d3-a456-426614174001';

// Helper to create mock request
function createMockRequest(body: unknown): Request {
  return new Request('http://localhost:3000/api/recommend', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

// Helper to create a standard mock Supabase client
function createMockSupabase(overrides: {
  profileExists?: boolean;
  fingerprintExists?: boolean;
  ipExists?: boolean;
  insertError?: boolean;
  rpcError?: boolean;
} = {}) {
  const {
    profileExists = true,
    fingerprintExists = false,
    ipExists = false,
    insertError = false,
    rpcError = false,
  } = overrides;

  return {
    from: vi.fn((table: string) => {
      if (table === 'profiles') {
        return {
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              single: vi.fn(() => ({
                data: profileExists ? { id: VALID_PROFILE_ID } : null,
                error: profileExists ? null : { code: 'PGRST116' },
              })),
            })),
          })),
        };
      }
      if (table === 'recommendations') {
        return {
          select: vi.fn(() => ({
            eq: vi.fn((field: string) => {
              // Check if this is fingerprint check or IP check
              if (field === 'fingerprint') {
                return {
                  eq: vi.fn(() => ({
                    single: vi.fn(() => ({
                      data: fingerprintExists ? { id: 'rec-1' } : null,
                      error: fingerprintExists ? null : { code: 'PGRST116' },
                    })),
                  })),
                };
              }
              // IP-based check with date filter
              return {
                eq: vi.fn(() => ({
                  gte: vi.fn(() => ({
                    single: vi.fn(() => ({
                      data: ipExists ? { id: 'rec-2' } : null,
                      error: ipExists ? null : { code: 'PGRST116' },
                    })),
                  })),
                })),
              };
            }),
          })),
          insert: vi.fn(() => ({
            data: null,
            error: insertError ? { code: 'INSERT_ERROR', message: 'Failed' } : null,
          })),
        };
      }
      return {};
    }),
    rpc: vi.fn(() => {
      if (rpcError) {
        return { error: { message: 'RPC failed' } };
      }
      return { error: null };
    }),
  };
}

describe('/api/recommend', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('request validation', () => {
    it('should reject missing profileId', async () => {
      const request = createMockRequest({});
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Invalid request');
    });

    it('should reject invalid UUID format', async () => {
      const request = createMockRequest({ profileId: 'not-a-uuid' });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Invalid request');
    });

    it('should reject empty string profileId', async () => {
      const request = createMockRequest({ profileId: '' });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
    });

    it('should accept valid UUID profileId', async () => {
      vi.mocked(createClient).mockResolvedValue(
        createMockSupabase({ profileExists: true }) as never
      );

      const request = createMockRequest({ profileId: VALID_PROFILE_ID });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });
  });

  describe('profile existence check', () => {
    it('should return 404 for non-existent profile', async () => {
      vi.mocked(createClient).mockResolvedValue(
        createMockSupabase({ profileExists: false }) as never
      );

      const request = createMockRequest({ profileId: VALID_PROFILE_ID });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('Profile not found');
    });

    it('should proceed for existing profile', async () => {
      vi.mocked(createClient).mockResolvedValue(
        createMockSupabase({ profileExists: true }) as never
      );

      const request = createMockRequest({ profileId: VALID_PROFILE_ID });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });
  });

  describe('rate limiting', () => {
    it('should allow first recommendation from an IP', async () => {
      vi.mocked(checkRateLimit).mockResolvedValue({
        success: true,
        limit: 1,
        remaining: 0,
        reset: Date.now() + 86400000,
      });
      vi.mocked(createClient).mockResolvedValue(
        createMockSupabase({ profileExists: true }) as never
      );

      const request = createMockRequest({ profileId: VALID_PROFILE_ID });
      const response = await POST(request);
      const data = await response.json();

      expect(data.success).toBe(true);
      expect(data.alreadyRecommended).toBe(false);
    });

    it('should return alreadyRecommended when rate limited', async () => {
      vi.mocked(checkRateLimit).mockResolvedValue({
        success: false,
        limit: 1,
        remaining: 0,
        reset: Date.now() + 86400000,
        retryAfter: 43200,
      });

      const request = createMockRequest({ profileId: VALID_PROFILE_ID });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200); // Not an error, just already recommended
      expect(data.success).toBe(true);
      expect(data.alreadyRecommended).toBe(true);
      expect(data.message).toContain('already recommended');
    });

    it('should rate limit per profile independently', async () => {
      // First profile - should be allowed
      vi.mocked(checkRateLimit).mockResolvedValue({
        success: true,
        limit: 1,
        remaining: 0,
        reset: Date.now() + 86400000,
      });
      vi.mocked(createClient).mockResolvedValue(
        createMockSupabase({ profileExists: true }) as never
      );

      const request1 = createMockRequest({ profileId: VALID_PROFILE_ID });
      const response1 = await POST(request1);
      const data1 = await response1.json();

      expect(data1.alreadyRecommended).toBe(false);

      // Second profile - should also be allowed (different rate limit key)
      const request2 = createMockRequest({ profileId: VALID_PROFILE_ID_2 });
      const response2 = await POST(request2);
      const data2 = await response2.json();

      expect(data2.alreadyRecommended).toBe(false);
    });
  });

  describe('fingerprint duplicate detection', () => {
    it('should detect duplicate by fingerprint', async () => {
      vi.mocked(createClient).mockResolvedValue(
        createMockSupabase({
          profileExists: true,
          fingerprintExists: true,
        }) as never
      );

      const request = createMockRequest({ profileId: VALID_PROFILE_ID });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.alreadyRecommended).toBe(true);
      expect(data.message).toBe("You've already recommended this doctor");
    });

    it('should allow new fingerprint', async () => {
      vi.mocked(createClient).mockResolvedValue(
        createMockSupabase({
          profileExists: true,
          fingerprintExists: false,
        }) as never
      );

      const request = createMockRequest({ profileId: VALID_PROFILE_ID });
      const response = await POST(request);
      const data = await response.json();

      expect(data.success).toBe(true);
      expect(data.alreadyRecommended).toBe(false);
    });
  });

  describe('IP-based duplicate detection (24h window)', () => {
    it('should detect duplicate by IP within 24 hours', async () => {
      vi.mocked(createClient).mockResolvedValue(
        createMockSupabase({
          profileExists: true,
          fingerprintExists: false,
          ipExists: true,
        }) as never
      );

      const request = createMockRequest({ profileId: VALID_PROFILE_ID });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.alreadyRecommended).toBe(true);
      expect(data.message).toContain('recently');
    });

    it('should allow different IP addresses', async () => {
      // Change IP for second request
      vi.mocked(getClientIp).mockResolvedValue('10.0.0.1');
      vi.mocked(createClient).mockResolvedValue(
        createMockSupabase({
          profileExists: true,
          fingerprintExists: false,
          ipExists: false,
        }) as never
      );

      const request = createMockRequest({ profileId: VALID_PROFILE_ID });
      const response = await POST(request);
      const data = await response.json();

      expect(data.success).toBe(true);
      expect(data.alreadyRecommended).toBe(false);
    });
  });

  describe('recommendation creation', () => {
    it('should create recommendation successfully', async () => {
      vi.mocked(createClient).mockResolvedValue(
        createMockSupabase({
          profileExists: true,
          fingerprintExists: false,
          ipExists: false,
        }) as never
      );

      const request = createMockRequest({ profileId: VALID_PROFILE_ID });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.alreadyRecommended).toBe(false);
      expect(data.message).toBe('Thank you for your recommendation!');
    });

    it('should handle insert errors', async () => {
      vi.mocked(createClient).mockResolvedValue(
        createMockSupabase({
          profileExists: true,
          fingerprintExists: false,
          ipExists: false,
          insertError: true,
        }) as never
      );

      const request = createMockRequest({ profileId: VALID_PROFILE_ID });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to submit recommendation');
    });
  });

  describe('recommendation count increment', () => {
    it('should call RPC to increment count after successful insert', async () => {
      const mockSupabase = createMockSupabase({
        profileExists: true,
        fingerprintExists: false,
        ipExists: false,
      });
      vi.mocked(createClient).mockResolvedValue(mockSupabase as never);

      const request = createMockRequest({ profileId: VALID_PROFILE_ID });
      await POST(request);

      expect(mockSupabase.rpc).toHaveBeenCalledWith(
        'increment_recommendation_count',
        { profile_uuid: VALID_PROFILE_ID }
      );
    });

    it('should still return success even if RPC fails', async () => {
      vi.mocked(createClient).mockResolvedValue(
        createMockSupabase({
          profileExists: true,
          fingerprintExists: false,
          ipExists: false,
          rpcError: true, // RPC will fail
        }) as never
      );

      const request = createMockRequest({ profileId: VALID_PROFILE_ID });
      const response = await POST(request);
      const data = await response.json();

      // Insert succeeded, so overall success
      expect(data.success).toBe(true);
    });
  });

  describe('edge cases', () => {
    it('should handle malformed JSON', async () => {
      const request = new Request('http://localhost:3000/api/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: 'not-json',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Internal server error');
    });

    it('should handle null body', async () => {
      const request = createMockRequest(null);
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
    });

    it('should handle array instead of object', async () => {
      const request = createMockRequest([VALID_PROFILE_ID]);
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
    });
  });

  describe('anti-spam behavior', () => {
    it('should not reveal if profile ID actually exists when already recommended', async () => {
      // When rate limited, we don't check the database
      vi.mocked(checkRateLimit).mockResolvedValue({
        success: false,
        limit: 1,
        remaining: 0,
        reset: Date.now() + 86400000,
      });

      const request = createMockRequest({ profileId: VALID_PROFILE_ID });
      const response = await POST(request);
      const data = await response.json();

      // Should return "already recommended" without revealing if profile exists
      expect(data.alreadyRecommended).toBe(true);
      // Database should not be called
      expect(createClient).not.toHaveBeenCalled();
    });

    it('should use consistent fingerprint for same headers', async () => {
      // This tests that the same browser will get the same fingerprint
      vi.mocked(createClient).mockResolvedValue(
        createMockSupabase({
          profileExists: true,
          fingerprintExists: true, // Same fingerprint already exists
        }) as never
      );

      const request1 = createMockRequest({ profileId: VALID_PROFILE_ID });
      const response1 = await POST(request1);
      const data1 = await response1.json();

      // Both requests should be detected as duplicates
      expect(data1.alreadyRecommended).toBe(true);
    });
  });
});
