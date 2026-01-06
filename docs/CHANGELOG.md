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

### Completed
- Core functionality (profiles, messaging, recommendations)
- Analytics system with dashboard
- Admin panel for user management
- 6 profile templates with 4 themes
- Guided tour for new users
- Mobile-responsive design
- Google OAuth integration

### Pending (from Security Audit)

#### Critical (Must Fix Before Production)
- [ ] Hash admin password (currently plaintext)
- [ ] Fix Row Level Security policies
- [ ] Rotate API keys if exposed
- [ ] Add critical database indexes (`profiles.handle`, `profiles.user_id`)
- [ ] Create custom 404 page with "Claim this handle" CTA
- [ ] Create global error boundary

#### High Priority
- [ ] Fix XSS in email templates (HTML escape user input)
- [ ] Add unit tests for core business logic
- [ ] Add magic byte validation for verification docs
- [ ] Fix N+1 queries in admin verifications

#### Medium Priority
- [ ] Add CSRF protection
- [ ] Implement phone number validation
- [ ] Add security headers to next.config
- [ ] Dynamic import for Recharts (bundle size)

### Email Automation (Infrastructure Ready)
- Database tables created
- API endpoints implemented
- Default templates defined
- **Pending**: Resend integration, cron job setup

See `docs/pending-automation.md` for implementation guide.

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
