/**
 * Tests for banned-handles.ts
 *
 * This module is critical for preventing:
 * - URL squatting on system routes
 * - Offensive or inappropriate handles
 * - Reserved terms that could cause confusion
 */

import { describe, it, expect } from 'vitest';
import { BANNED_HANDLES, isBannedHandle } from '@/lib/banned-handles';

describe('banned-handles', () => {
  describe('BANNED_HANDLES constant', () => {
    it('should contain system routes', () => {
      const systemRoutes = ['admin', 'api', 'dashboard', 'sign-in', 'sign-up', 'login', 'logout'];
      systemRoutes.forEach(route => {
        expect(BANNED_HANDLES).toContain(route);
      });
    });

    it('should contain reserved medical terms', () => {
      const medicalTerms = ['doctor', 'doctors', 'medical', 'health', 'hospital', 'clinic', 'patient'];
      medicalTerms.forEach(term => {
        expect(BANNED_HANDLES).toContain(term);
      });
    });

    it('should contain special reserved words', () => {
      const reserved = ['www', 'mail', 'localhost', 'root', 'null', 'undefined', 'test', 'demo'];
      reserved.forEach(word => {
        expect(BANNED_HANDLES).toContain(word);
      });
    });

    it('should contain moderator/staff terms', () => {
      const staffTerms = ['moderator', 'mod', 'staff', 'official'];
      staffTerms.forEach(term => {
        expect(BANNED_HANDLES).toContain(term);
      });
    });

    it('should be a non-empty array', () => {
      expect(Array.isArray(BANNED_HANDLES)).toBe(true);
      expect(BANNED_HANDLES.length).toBeGreaterThan(0);
    });
  });

  describe('isBannedHandle()', () => {
    describe('exact matches', () => {
      it('should return true for banned handles', () => {
        expect(isBannedHandle('admin')).toBe(true);
        expect(isBannedHandle('dashboard')).toBe(true);
        expect(isBannedHandle('doctor')).toBe(true);
        expect(isBannedHandle('support')).toBe(true);
      });

      it('should return false for allowed handles', () => {
        expect(isBannedHandle('dr-smith')).toBe(false);
        expect(isBannedHandle('john-doe')).toBe(false);
        expect(isBannedHandle('cardiologist123')).toBe(false);
        expect(isBannedHandle('arjun')).toBe(false);
      });
    });

    describe('case insensitivity', () => {
      it('should treat uppercase as banned', () => {
        expect(isBannedHandle('ADMIN')).toBe(true);
        expect(isBannedHandle('Admin')).toBe(true);
        expect(isBannedHandle('DASHBOARD')).toBe(true);
      });

      it('should treat mixed case as banned', () => {
        expect(isBannedHandle('AdMiN')).toBe(true);
        expect(isBannedHandle('DashBoard')).toBe(true);
        expect(isBannedHandle('DOCTOR')).toBe(true);
      });

      it('should handle case for allowed handles', () => {
        expect(isBannedHandle('Dr-Smith')).toBe(false);
        expect(isBannedHandle('ARJUN')).toBe(false);
      });
    });

    describe('edge cases', () => {
      it('should handle empty string', () => {
        expect(isBannedHandle('')).toBe(false);
      });

      it('should handle whitespace', () => {
        // Note: Whitespace shouldn't reach this function normally (validation catches it)
        // but we test defensive behavior
        expect(isBannedHandle(' admin ')).toBe(false); // Has spaces, not an exact match
        expect(isBannedHandle('admin ')).toBe(false);
      });

      it('should handle similar but different handles', () => {
        // These are NOT banned because they're different from banned words
        expect(isBannedHandle('admin1')).toBe(false);
        expect(isBannedHandle('myadmin')).toBe(false);
        expect(isBannedHandle('doctors-clinic')).toBe(false);
        expect(isBannedHandle('super-admin')).toBe(false);
      });

      it('should handle handles with hyphens', () => {
        // Hyphenated variations should not be banned unless explicitly listed
        expect(isBannedHandle('sign-up')).toBe(true); // This IS in the list
        expect(isBannedHandle('log-in')).toBe(false); // This is NOT in the list
        expect(isBannedHandle('admin-panel')).toBe(false);
      });

      it('should handle numeric strings', () => {
        expect(isBannedHandle('123')).toBe(false);
        expect(isBannedHandle('000')).toBe(false);
      });
    });

    describe('specific banned categories', () => {
      it('should block all auth-related routes', () => {
        const authRoutes = ['sign-in', 'sign-up', 'login', 'logout', 'register'];
        authRoutes.forEach(route => {
          expect(isBannedHandle(route)).toBe(true);
        });
      });

      it('should block verification-related terms', () => {
        const verifyTerms = ['verify', 'verified', 'verification'];
        verifyTerms.forEach(term => {
          expect(isBannedHandle(term)).toBe(true);
        });
      });

      it('should block common system pages', () => {
        const pages = ['help', 'support', 'contact', 'about', 'terms', 'privacy', 'settings', 'account'];
        pages.forEach(page => {
          expect(isBannedHandle(page)).toBe(true);
        });
      });
    });
  });

  describe('handle validation integration scenarios', () => {
    // These scenarios test how banned handles would work in real usage

    it('should allow legitimate doctor handles', () => {
      const validHandles = [
        'dr-sharma',
        'priya-gupta',
        'cardiologist-nyc',
        'ortho-specialist',
        'pediatrics-expert',
        'john-doe-md',
        'surgeon2024',
      ];

      validHandles.forEach(handle => {
        expect(isBannedHandle(handle)).toBe(false);
      });
    });

    it('should block all handles that could conflict with routes', () => {
      const routeConflicts = [
        'api',
        'dashboard',
        'onboarding',
        'profile',
        'admin',
      ];

      routeConflicts.forEach(handle => {
        expect(isBannedHandle(handle)).toBe(true);
      });
    });

    it('should block handles that could cause trust issues', () => {
      const trustIssues = [
        'verified',    // Could fake verification status
        'official',    // Could imply official endorsement
        'staff',       // Could impersonate staff
        'moderator',   // Could impersonate moderator
      ];

      trustIssues.forEach(handle => {
        expect(isBannedHandle(handle)).toBe(true);
      });
    });
  });
});
