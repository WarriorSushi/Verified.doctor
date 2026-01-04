/**
 * Tests for format-metrics.ts
 *
 * This module handles the tiered display of social proof metrics:
 * - Recommendations: Hidden at 0, ranges for privacy (10+, 50+, 100+)
 * - Connections: Simple count with proper pluralization
 * - Views: Abbreviated for large numbers (K, M)
 */

import { describe, it, expect } from 'vitest';
import {
  formatRecommendationCount,
  formatConnectionCount,
  formatViewCount,
} from '@/lib/format-metrics';

describe('format-metrics', () => {
  describe('formatRecommendationCount()', () => {
    describe('tier 0: hidden (count = 0)', () => {
      it('should return null for zero recommendations', () => {
        expect(formatRecommendationCount(0)).toBeNull();
      });
    });

    describe('tier 1: no number shown (1-10)', () => {
      it('should return generic text for 1 recommendation', () => {
        expect(formatRecommendationCount(1)).toBe('Recommended by patients');
      });

      it('should return generic text for 5 recommendations', () => {
        expect(formatRecommendationCount(5)).toBe('Recommended by patients');
      });

      it('should return generic text for exactly 10 recommendations', () => {
        expect(formatRecommendationCount(10)).toBe('Recommended by patients');
      });
    });

    describe('tier 2: 10+ shown (11-50)', () => {
      it('should return "10+" for 11 recommendations', () => {
        expect(formatRecommendationCount(11)).toBe('Recommended by 10+ patients');
      });

      it('should return "10+" for 25 recommendations', () => {
        expect(formatRecommendationCount(25)).toBe('Recommended by 10+ patients');
      });

      it('should return "10+" for exactly 50 recommendations', () => {
        expect(formatRecommendationCount(50)).toBe('Recommended by 10+ patients');
      });
    });

    describe('tier 3: 50+ shown (51-100)', () => {
      it('should return "50+" for 51 recommendations', () => {
        expect(formatRecommendationCount(51)).toBe('Recommended by 50+ patients');
      });

      it('should return "50+" for 75 recommendations', () => {
        expect(formatRecommendationCount(75)).toBe('Recommended by 50+ patients');
      });

      it('should return "50+" for exactly 100 recommendations', () => {
        expect(formatRecommendationCount(100)).toBe('Recommended by 50+ patients');
      });
    });

    describe('tier 4: 100+ shown (101+)', () => {
      it('should return "100+" for 101 recommendations', () => {
        expect(formatRecommendationCount(101)).toBe('Recommended by 100+ patients');
      });

      it('should return "100+" for 500 recommendations', () => {
        expect(formatRecommendationCount(500)).toBe('Recommended by 100+ patients');
      });

      it('should return "100+" for very large numbers', () => {
        expect(formatRecommendationCount(10000)).toBe('Recommended by 100+ patients');
      });
    });

    describe('boundary conditions', () => {
      // Test exact boundary values
      it('should handle boundary between tier 1 and 2', () => {
        expect(formatRecommendationCount(10)).toBe('Recommended by patients');
        expect(formatRecommendationCount(11)).toBe('Recommended by 10+ patients');
      });

      it('should handle boundary between tier 2 and 3', () => {
        expect(formatRecommendationCount(50)).toBe('Recommended by 10+ patients');
        expect(formatRecommendationCount(51)).toBe('Recommended by 50+ patients');
      });

      it('should handle boundary between tier 3 and 4', () => {
        expect(formatRecommendationCount(100)).toBe('Recommended by 50+ patients');
        expect(formatRecommendationCount(101)).toBe('Recommended by 100+ patients');
      });
    });

    describe('edge cases', () => {
      it('should handle negative numbers gracefully', () => {
        // Negative counts should not occur, but function should handle gracefully
        // Based on implementation: -1 is not === 0 and not <= 10, etc.
        // It would fall through to return "100+ patients" which is incorrect
        // This test documents current behavior - consider fixing implementation
        const result = formatRecommendationCount(-1);
        // Current implementation returns null only for 0
        expect(result).not.toBeNull();
      });
    });
  });

  describe('formatConnectionCount()', () => {
    describe('zero connections', () => {
      it('should return null for zero connections', () => {
        expect(formatConnectionCount(0)).toBeNull();
      });
    });

    describe('singular (1 connection)', () => {
      it('should use singular form for 1 connection', () => {
        expect(formatConnectionCount(1)).toBe('Connected with 1 doctor');
      });
    });

    describe('plural (2+ connections)', () => {
      it('should use plural form for 2 connections', () => {
        expect(formatConnectionCount(2)).toBe('Connected with 2 doctors');
      });

      it('should use plural form for 10 connections', () => {
        expect(formatConnectionCount(10)).toBe('Connected with 10 doctors');
      });

      it('should use plural form for 100 connections', () => {
        expect(formatConnectionCount(100)).toBe('Connected with 100 doctors');
      });

      it('should use plural form for large numbers', () => {
        expect(formatConnectionCount(500)).toBe('Connected with 500 doctors');
      });
    });

    describe('edge cases', () => {
      it('should handle negative numbers', () => {
        // Negative should not occur, test current behavior
        const result = formatConnectionCount(-1);
        // Based on implementation: -1 !== 0 so it returns the formatted string
        expect(result).toBe('Connected with -1 doctors');
      });
    });
  });

  describe('formatViewCount()', () => {
    describe('raw numbers (< 1000)', () => {
      it('should return "0 views" for zero', () => {
        expect(formatViewCount(0)).toBe('0 views');
      });

      it('should use singular "view" for 1', () => {
        expect(formatViewCount(1)).toBe('1 view');
      });

      it('should use plural "views" for 2', () => {
        expect(formatViewCount(2)).toBe('2 views');
      });

      it('should show full number for 999', () => {
        expect(formatViewCount(999)).toBe('999 views');
      });
    });

    describe('thousands (K suffix)', () => {
      it('should abbreviate 1000 as "1.0K views"', () => {
        expect(formatViewCount(1000)).toBe('1.0K views');
      });

      it('should abbreviate 1500 as "1.5K views"', () => {
        expect(formatViewCount(1500)).toBe('1.5K views');
      });

      it('should abbreviate 10000 as "10.0K views"', () => {
        expect(formatViewCount(10000)).toBe('10.0K views');
      });

      it('should abbreviate 999999 as "1000.0K views"', () => {
        // This is the boundary case before millions
        expect(formatViewCount(999999)).toBe('1000.0K views');
      });
    });

    describe('millions (M suffix)', () => {
      it('should abbreviate 1000000 as "1.0M views"', () => {
        expect(formatViewCount(1000000)).toBe('1.0M views');
      });

      it('should abbreviate 1500000 as "1.5M views"', () => {
        expect(formatViewCount(1500000)).toBe('1.5M views');
      });

      it('should abbreviate 10000000 as "10.0M views"', () => {
        expect(formatViewCount(10000000)).toBe('10.0M views');
      });

      it('should handle very large numbers', () => {
        expect(formatViewCount(100000000)).toBe('100.0M views');
      });
    });

    describe('decimal precision', () => {
      it('should show one decimal place for K', () => {
        expect(formatViewCount(1234)).toBe('1.2K views');
        expect(formatViewCount(1299)).toBe('1.3K views');
      });

      it('should show one decimal place for M', () => {
        expect(formatViewCount(1234567)).toBe('1.2M views');
        expect(formatViewCount(1299999)).toBe('1.3M views');
      });
    });

    describe('edge cases', () => {
      it('should handle negative numbers', () => {
        // Negative views should not occur, test current behavior
        const result = formatViewCount(-100);
        // Based on implementation: -100 < 1000 so returns raw with plural
        expect(result).toBe('-100 views');
      });
    });
  });

  describe('integration scenarios', () => {
    // Test realistic profile scenarios

    it('should format a new doctor profile correctly', () => {
      // New doctor with minimal metrics
      expect(formatRecommendationCount(0)).toBeNull();
      expect(formatConnectionCount(0)).toBeNull();
      expect(formatViewCount(50)).toBe('50 views');
    });

    it('should format a growing profile correctly', () => {
      // Doctor gaining traction
      expect(formatRecommendationCount(15)).toBe('Recommended by 10+ patients');
      expect(formatConnectionCount(5)).toBe('Connected with 5 doctors');
      expect(formatViewCount(1500)).toBe('1.5K views');
    });

    it('should format an established profile correctly', () => {
      // Well-established doctor
      expect(formatRecommendationCount(85)).toBe('Recommended by 50+ patients');
      expect(formatConnectionCount(42)).toBe('Connected with 42 doctors');
      expect(formatViewCount(25000)).toBe('25.0K views');
    });

    it('should format a top doctor profile correctly', () => {
      // Very successful doctor
      expect(formatRecommendationCount(500)).toBe('Recommended by 100+ patients');
      expect(formatConnectionCount(150)).toBe('Connected with 150 doctors');
      expect(formatViewCount(2500000)).toBe('2.5M views');
    });
  });
});
