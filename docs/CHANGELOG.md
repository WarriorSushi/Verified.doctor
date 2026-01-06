# Verified.Doctor - Changelog

## [1.1.0] - January 2026

### New Features

#### Guided Tour System
- **Dashboard Tour**: Interactive 9-step tour highlighting all dashboard features
- **Spotlight Effect**: Semi-transparent overlay with spotlight cutout for highlighted elements
- **Smart Positioning**: Tooltips auto-position to stay within viewport
- **Mobile Support**: Detects mobile and targets mobile-specific nav items
- **Auto-trigger**: Tour starts automatically after onboarding completion
- **Skip Confirmation**: Dialog with recommendation to complete tour
- **Restart Option**: "Take a Tour" option in user menu to restart anytime

#### Landing Page Enhancements
- **Profile Showcase**: Auto-scrolling profile cards with 5 sample doctors
- **6 Layout Templates**: Classic, Hero, Magazine, Grid, Minimal, Timeline
- **Rich Profile Data**: Education timeline, hospital affiliations, services, conditions treated
- **Scroll Indicator**: Animated bouncing chevron with "Scroll to see stunning profiles" text
- **Improved Input UX**:
  - Placeholder changed to "type your name"
  - Mobile layout: URL and input on single line, button below
  - Removed white box from demo URL preview

#### Dashboard Improvements
- **QR Code Enhancements**: Larger QR with clinic-branded styling
- **Sticky Action Bar**: View Profile and Edit Profile buttons stay visible
- **Simplified Navigation**: Cleaner nav structure
- **Metrics Label Fix**: "Recommendations" shortened to "Recommends" on mobile

#### Profile Templates
- **6 Premium Layouts**: Classic, Hero, Magazine, Grid, Minimal, Timeline
- **4 Color Themes**: Classic (blue), Ocean, Sage, Warm
- **Responsive Design**: All templates work on mobile and desktop
- **Profile Completeness**: Visual indicators for missing sections

### UI/UX Improvements

#### Mobile Experience
- **Dropdown Press States**: Visual feedback when tapping menu items
- **Contact Page Reorder**: Form appears first on mobile, info blocks below
- **Bottom Nav Targeting**: Tour highlights correct mobile nav items
- **Responsive Typography**: Proper font scaling across devices

#### Animations & Polish
- **Framer Motion Transitions**: Smooth page and element animations
- **Skeleton Loading States**: Dashboard shows loading placeholders
- **Toast Notifications**: Consistent feedback for user actions
- **Liquid Glass Navbar**: Modern frosted glass effect

### Bug Fixes
- Fixed invite URLs missing https:// protocol
- Fixed Google Search Console indexing issues
- Fixed profile template cache invalidation
- Fixed name extraction bugs in onboarding
- Fixed chart sizing errors on initial render
- Fixed OAuth redirect issues
- Fixed email confirmation flow
- Fixed logout and cookie consent
- Fixed US-style number formatting (commas, not lakhs)

### Authentication
- **Google OAuth**: One-click sign-in with Google
- **Improved Auth Tabs**: Better visual design for sign-in/sign-up

---

## Previous Versions

### [1.0.0] - Initial Release
- Core profile creation and management
- Handle claiming with availability check
- Verification document upload system
- Patient recommendation system
- Async messaging between patients and doctors
- QR code generation
- Analytics dashboard
- Admin panel for verification approval
- Connection/invite system for doctors

---

## Production Readiness Status

### All Systems Go - Production Ready

| Category | Status | Notes |
|----------|--------|-------|
| Core Features | ✅ Ready | Profiles, messaging, recommendations |
| Database Security | ✅ Ready | RLS policies properly configured |
| Database Indexes | ✅ Ready | `profiles.handle`, `profiles.user_id` indexed |
| XSS Protection | ✅ Ready | `escapeHtml()` used in all email templates |
| Error Handling | ✅ Ready | Custom 404 and error boundary added |
| Authentication | ✅ Ready | Clerk + Google OAuth |
| Analytics | ✅ Ready | Full dashboard with charts |
| Admin Panel | ✅ Ready | User management, verification approval |
| Email System | ✅ Ready | Resend configured |
| Environment | ✅ Ready | `.env.local` properly gitignored |

### Security Audit Resolution (January 6, 2026)

The January 4, 2026 audit identified issues that have been verified as **already resolved**:

| Audit Issue | Resolution |
|-------------|------------|
| RLS policies bypass | ✅ Verified: All policies use `current_user_id()` properly |
| Missing indexes | ✅ Verified: `idx_profiles_handle`, `idx_profiles_user_id` exist |
| XSS in emails | ✅ Verified: `escapeHtml()` imported and used |
| Missing 404 page | ✅ Fixed: Custom page with "Claim Your Domain" CTA |
| Missing error boundary | ✅ Fixed: Friendly error page with retry |
| Function search_path | ✅ Fixed: `current_user_id()` now has `SET search_path = ''` |
| .env.local exposed | ✅ Verified: Properly in .gitignore |

### Future Enhancements (Not Blocking)

These are optional improvements for later:

- [ ] Add unit tests for core business logic
- [ ] Dynamic import for Recharts (bundle optimization)

### Email Automation

- Database tables: ✅ Created
- API endpoints: ✅ Implemented
- Email templates: ✅ Defined
- Resend: ✅ Configured
- **Optional**: Set up Vercel Cron for automated sending

See `docs/pending-automation.md` for cron setup guide.

---

## File Structure Added

```
src/components/tour/
├── tour-provider.tsx      # Context for tour state
├── tour-overlay.tsx       # Spotlight + tooltip UI
├── tour-steps.ts          # Step definitions
├── use-tour.ts            # Custom hook
└── index.ts               # Exports

src/components/landing/
├── profile-showcase.tsx   # Auto-scrolling profile cards
└── hero-section.tsx       # Updated with scroll indicator
```

---

## Configuration Notes

### Tour Auto-Trigger
After onboarding success, the tour auto-starts via:
```typescript
localStorage.setItem("show_tour_on_dashboard", "true");
```

### Profile Templates
Stored in `profiles.profile_template` column:
- `classic` (default)
- `hero`
- `magazine`
- `grid`
- `minimal`
- `timeline`

### Color Themes
Stored in `profiles.color_theme` column:
- `classic` (default)
- `ocean`
- `sage`
- `warm`
