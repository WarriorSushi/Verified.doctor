# Proposed Changes - Verified.Doctor

**Created:** January 8, 2026
**Status:** Planning Phase

---

## MCP Requirement Analysis

| Needs MCP? | Count | Description |
|------------|-------|-------------|
| ❌ No | 18 | Pure frontend/UI changes |
| ⚠️ Maybe | 4 | API changes but code-editable |
| ✅ Yes | 0 | None require MCP |

**Good news:** All changes can be implemented without Supabase/Firebase MCPs since we can directly edit the code files.

---

## Changes Overview

| # | Change | Category | Priority | MCP Needed |
|---|--------|----------|----------|------------|
| 1 | Onboarding scroll position fix | UI/UX | High | ❌ No |
| 2 | Page zoom issue fix | CSS | High | ❌ No |
| 3 | Layout/Color selection "change later" message | UI | Medium | ❌ No |
| 4 | WhatsApp & Copy Link fix (onboarding) | JS Logic | High | ❌ No |
| 5 | Dashboard zoom issue | CSS | High | ❌ No |
| 6 | "Get Verified Badge" navigation fix | Navigation | High | ❌ No |
| 7 | "Enrich Profile" section on Overview | New Feature | Medium | ❌ No |
| 8 | Edit Profile submenu visibility | UI | Medium | ❌ No |
| 9 | Save Changes button improvements | UI/UX | Medium | ❌ No |
| 10 | Add More Info icon change | UI | Low | ❌ No |
| 11 | Invites sent count bug | Bug Fix | Medium | ⚠️ Check API |
| 12 | WhatsApp sharing improvements | JS Logic | High | ❌ No |
| 13 | Analytics - unlock button & features | Feature | Medium | ⚠️ Check API |
| 14 | Rename "Overview" to "Home" | UI | Low | ❌ No |
| 15 | Contact support form error fix | Bug Fix | High | ⚠️ Check API |
| 16 | Policy pages navigation & layout | UI/Nav | Medium | ❌ No |
| 17 | Settings page improvements | Feature | Medium | ❌ No |
| 18 | Account freeze/delete buttons | Feature | High | ⚠️ Check API |
| 19 | Pro membership page & pricing | New Feature | High | ❌ No (UI only) |
| 20 | Loading skeleton visibility | UI | Low | ❌ No |
| 21 | Website speed optimization | Performance | High | ❌ No |

---

## Detailed Changes & Tasks

---

### 1. Onboarding Scroll Position Fix
**Priority:** High | **MCP:** ❌ No
**Problem:** After clicking "Next Step" in onboarding, page doesn't scroll to top
**Files:**
- `src/app/(dashboard)/onboarding/page.tsx`

#### Tasks:
- [ ] Add `window.scrollTo(0, 0)` or `scrollIntoView` when step changes
- [ ] Ensure smooth scroll behavior
- [ ] Test on mobile and desktop

---

### 2. Page Zoom Issue (Onboarding)
**Priority:** High | **MCP:** ❌ No
**Problem:** Page appears zoomed in, needs manual zoom out
**Files:**
- `src/app/(dashboard)/onboarding/page.tsx`
- `src/app/layout.tsx` (check viewport meta)

#### Tasks:
- [ ] Check viewport meta tag in layout
- [ ] Review CSS width/overflow settings
- [ ] Ensure `max-width: 100vw` and `overflow-x: hidden` on body
- [ ] Check for any `transform: scale()` CSS
- [ ] Test on various screen sizes

---

### 3. "You Can Change It Later" Message
**Priority:** Medium | **MCP:** ❌ No
**Problem:** No messaging that layout/color can be changed later
**Files:**
- `src/app/(dashboard)/onboarding/page.tsx`

#### Tasks:
- [ ] Add subtle text under "Choose Your Layout" header: "You can change this anytime from your dashboard"
- [ ] Add same message under "Choose Your Color Theme" header
- [ ] Style as muted/secondary text
- [ ] Ensure mobile responsive

---

### 4. WhatsApp & Copy Link Fix (Onboarding Success)
**Priority:** High | **MCP:** ❌ No
**Problem:** WhatsApp button doesn't open app on mobile, Copy Link has no feedback
**Files:**
- `src/app/(dashboard)/onboarding/success/page.tsx`
- `src/components/dashboard/invite-dialog.tsx`

#### Tasks:
- [ ] Fix WhatsApp URL scheme for mobile: `whatsapp://send?text=...` or `https://wa.me/?text=...`
- [ ] Test on Android and iOS
- [ ] Add toast notification on successful copy
- [ ] Add helper text after copy: "Now paste and send to a colleague!"
- [ ] Ensure proper URL encoding for share message

---

### 5. Dashboard Zoom Issue
**Priority:** High | **MCP:** ❌ No
**Problem:** Dashboard appears zoomed in like onboarding
**Files:**
- `src/app/(dashboard)/dashboard/layout.tsx`
- `src/app/(dashboard)/dashboard/page.tsx`

#### Tasks:
- [ ] Same fixes as #2
- [ ] Check dashboard-specific container widths
- [ ] Verify responsive breakpoints

---

### 6. "Get Verified Badge" Navigation Fix
**Priority:** High | **MCP:** ❌ No
**Problem:** Button goes to edit profile but not to verification submenu
**Files:**
- `src/app/(dashboard)/dashboard/page.tsx` (or wherever CTA is)
- `src/app/(dashboard)/dashboard/profile-builder/page.tsx`
- `src/components/dashboard/profile-builder/profile-builder.tsx`

#### Tasks:
- [ ] Add URL parameter support: `/dashboard/profile-builder?tab=verification`
- [ ] Read URL param and auto-select verification tab
- [ ] Update all "Get Verified" CTAs to include `?tab=verification`
- [ ] Test navigation from dashboard and other pages

---

### 7. "Enrich Your Profile" Section on Overview
**Priority:** Medium | **MCP:** ❌ No
**Problem:** No prompt to add more profile details
**Files:**
- `src/app/(dashboard)/dashboard/page.tsx`

#### Tasks:
- [ ] Create new card component for "Enrich Your Profile"
- [ ] Add compelling copy: "Enrich your public profile with more details. Premade templates available!"
- [ ] Link to `/dashboard/profile-builder?tab=blocks` (or similar)
- [ ] Add icon (sparkles or similar)
- [ ] Position after main metrics cards
- [ ] Make responsive for mobile/desktop

---

### 8. Edit Profile Submenu Visibility
**Priority:** Medium | **MCP:** ❌ No
**Problem:** Submenu items not prominent enough, no descriptions
**Files:**
- `src/components/dashboard/profile-builder/profile-builder.tsx`

#### Tasks:
- [ ] Increase font size/weight of submenu items
- [ ] Add subtle descriptions under each:
  - General: "Basic info, photo, specialty"
  - Appearance: "Layout and color theme"
  - Add More Info: "Education, services, gallery & more"
  - Verification: "Upload documents to get verified"
- [ ] Improve active state styling
- [ ] Add better visual separation

---

### 9. Save Changes Button Improvements
**Priority:** Medium | **MCP:** ❌ No
**Problem:** Button too large, always visible, shown on verification tab
**Files:**
- `src/components/dashboard/profile-builder/profile-builder.tsx`

#### Tasks:
- [ ] Track dirty state (hasChanges boolean)
- [ ] Only show button when hasChanges === true
- [ ] Make button smaller, stick to bottom nav on mobile
- [ ] Hide on verification tab
- [ ] Add subtle entrance animation when it appears

---

### 10. Add More Info Icon Change
**Priority:** Low | **MCP:** ❌ No
**Problem:** Stars icon doesn't represent "add more info"
**Files:**
- `src/components/dashboard/profile-builder/profile-builder.tsx`

#### Tasks:
- [ ] Change icon to something like `Plus`, `LayoutGrid`, `Blocks`, or `PlusCircle`
- [ ] Ensure consistency with other icons

---

### 11. Invites Sent Count Bug
**Priority:** Medium | **MCP:** ⚠️ Check API
**Problem:** Shows 6 invites when only 3 were sent
**Files:**
- `src/app/(dashboard)/dashboard/connections/page.tsx`
- `src/app/api/invites/route.ts`

#### Tasks:
- [ ] Review how invites are counted in the API
- [ ] Check if there's duplicate counting
- [ ] Verify database query is correct
- [ ] Add logging to debug
- [ ] Fix counting logic

---

### 12. WhatsApp Sharing Improvements (Connections)
**Priority:** High | **MCP:** ❌ No
**Problem:** WhatsApp opens but doesn't show share sheet, link looks boring
**Files:**
- `src/app/(dashboard)/dashboard/connections/page.tsx`
- `src/components/dashboard/invite-dialog.tsx`
- `src/components/dashboard/connections-list.tsx`

#### Tasks:
- [ ] Use proper WhatsApp share URL: `https://wa.me/?text=...`
- [ ] For mobile, consider using Web Share API first, fallback to WhatsApp
- [ ] Improve share message copy:
  ```
  🎉 You've been invited to Verified.Doctor!

  I'm sharing my exclusive invite with you.
  Join the trusted network of verified medical professionals.

  ✨ Limited invite - Pro features unlocked on signup!

  👉 [LINK]
  ```
- [ ] Consider adding Open Graph meta tags to invite pages for rich previews
- [ ] Test on Android and iOS

---

### 13. Analytics - Unlock Button & Features
**Priority:** Medium | **MCP:** ⚠️ Check API
**Problem:** Unlock button does nothing, unclear what analytics exist
**Files:**
- `src/app/(dashboard)/dashboard/analytics/page.tsx`
- `src/components/analytics/analytics-overview.tsx`
- `src/app/api/analytics/dashboard/route.ts`

#### Tasks:
- [ ] Review current analytics capabilities
- [ ] Define free vs pro analytics:
  - **Free:** Today, This Week views
  - **Pro:** Monthly, Yearly, All Time, Custom Date Range
- [ ] Wire unlock button to Pro upgrade page
- [ ] Add time period selector (Day/Week/Month/Year/Custom)
- [ ] Grey out pro features with lock icon for free users
- [ ] Add tooltip explaining pro requirement

---

### 14. Rename "Overview" to "Home"
**Priority:** Low | **MCP:** ❌ No
**Problem:** "Overview" is vague
**Files:**
- `src/components/dashboard/mobile-bottom-nav.tsx`
- `src/components/dashboard/dashboard-nav.tsx`
- `src/app/(dashboard)/dashboard/page.tsx` (page title if any)

#### Tasks:
- [ ] Find all instances of "Overview" text
- [ ] Change to "Home"
- [ ] Update aria-labels if present
- [ ] Verify no broken links (route should stay same)

---

### 15. Contact Support Form Error Fix
**Priority:** High | **MCP:** ⚠️ Check API
**Problem:** "Failed to save message" error
**Files:**
- `src/app/(dashboard)/dashboard/help/page.tsx`
- `src/app/api/support/route.ts` (or messages route)

#### Tasks:
- [ ] Check API endpoint for support messages
- [ ] Review error handling
- [ ] Check if table exists in database
- [ ] Add proper error messages
- [ ] Test form submission flow

---

### 16. Policy Pages Navigation & Layout
**Priority:** Medium | **MCP:** ❌ No
**Problem:** "Back to Home" goes to landing instead of dashboard, no bottom nav
**Files:**
- `src/app/(legal)/privacy/page.tsx`
- `src/app/(legal)/terms/page.tsx`
- `src/app/(legal)/contact/page.tsx`
- `src/app/(legal)/layout.tsx`

#### Tasks:
- [ ] Detect if user is logged in
- [ ] If logged in: "Back" goes to `/dashboard`, show dashboard nav
- [ ] If not logged in: "Back" goes to `/`, show standard nav
- [ ] Add proper back button (not "Back to Homepage")
- [ ] Consider using `router.back()` for true back behavior
- [ ] Show bottom nav on mobile when logged in

---

### 17. Settings Page Improvements
**Priority:** Medium | **MCP:** ❌ No
**Problem:** Settings page has same content as edit profile
**Files:**
- `src/app/(dashboard)/dashboard/settings/page.tsx`

#### Tasks:
- [ ] Redesign settings to include:
  - Notification preferences
  - Email settings
  - Privacy settings (who can message, profile visibility)
  - Language/Region
  - Connected accounts
  - Account management (freeze, delete)
- [ ] Remove duplicate profile editing options
- [ ] Add proper sections with headers

---

### 18. Account Freeze & Delete Buttons
**Priority:** High | **MCP:** ⚠️ Check API
**Problem:** Can't find account freeze, need delete option
**Files:**
- `src/app/(dashboard)/dashboard/settings/page.tsx`
- `src/app/api/profile/freeze/route.ts`

#### Tasks:
- [ ] Locate existing freeze functionality
- [ ] Add visible "Freeze Account" button in settings
- [ ] Add "Delete Account" button with confirmation
- [ ] Implement proper deletion flow:
  - Confirmation modal with warning
  - Type "DELETE" to confirm
  - Email confirmation
  - 30-day grace period before permanent deletion
- [ ] Ensure GDPR/legal compliance

---

### 19. Pro Membership Page & Pricing
**Priority:** High | **MCP:** ❌ No (UI only)
**Problem:** No upgrade path or Pro page
**Files:**
- `src/app/(dashboard)/dashboard/upgrade/page.tsx` (new)
- `src/components/dashboard/mobile-bottom-nav.tsx`
- `src/components/dashboard/dashboard-nav.tsx`

#### Tasks:
- [ ] Create new `/dashboard/upgrade` page
- [ ] Add "Upgrade to Pro" in bottom nav (mobile) and sidebar (desktop)
- [ ] Design compelling upgrade page:
  ```
  🚀 Upgrade to Pro

  "83% of our users upgraded to Pro within 5 days.
  Our service works perfectly free, but Pro is for
  power users who want maximum value."

  🎉 Super January Sale - 60% OFF!

  PRICING:
  India: ₹199/month | ₹1,999/year (save 17%)
  USA: $4.99/month | $39.99/year (save 33%)

  PRO FEATURES:
  ✅ Advanced Analytics (Monthly, Yearly, Custom)
  ✅ Unlimited Connections
  ✅ Priority Support
  ✅ Custom QR Code Colors
  ✅ Message Templates
  ✅ Profile Insights
  ```
- [ ] Add dynamic month name for "sale" (get current month)
- [ ] Plan payment integration (Dodo Payments / RevenueCat)
- [ ] Add pro badge/indicator in nav for pro users

---

### 20. Loading Skeleton Visibility
**Priority:** Low | **MCP:** ❌ No
**Problem:** Skeletons too subtle
**Files:**
- `src/components/ui/skeleton.tsx`
- Various loading.tsx files

#### Tasks:
- [ ] Increase skeleton background contrast
- [ ] Make shimmer animation more visible
- [ ] Test in light and dark modes
- [ ] Consider adding pulse animation alternative

---

### 21. Website Speed Optimization
**Priority:** High | **MCP:** ❌ No
**Problem:** Site feels slow
**Files:**
- Various components
- `next.config.ts`

#### Tasks:
- [ ] Run Lighthouse audit
- [ ] Implement dynamic imports for heavy components (Recharts)
- [ ] Add proper image optimization
- [ ] Review bundle size
- [ ] Add proper caching headers
- [ ] Consider edge functions for API routes
- [ ] Lazy load below-fold content
- [ ] Optimize fonts loading
- [ ] Review and optimize database queries
- [ ] Add loading states for slow operations

---

## Execution Plan

### Phase 1: Critical Fixes (Do First)
1. ✅ #2, #5 - Zoom issues (affects entire UX)
2. ✅ #1 - Scroll position fix
3. ✅ #4, #12 - WhatsApp sharing fixes
4. ✅ #6 - Get Verified navigation
5. ✅ #15 - Contact support error

### Phase 2: Navigation & UX
6. ✅ #16 - Policy pages navigation
7. ✅ #14 - Rename Overview to Home
8. ✅ #3 - "Change later" messages
9. ✅ #8, #9, #10 - Edit profile improvements

### Phase 3: Features
10. ✅ #7 - Enrich profile section
11. ✅ #17 - Settings page redesign
12. ✅ #18 - Account freeze/delete
13. ✅ #13 - Analytics improvements

### Phase 4: Pro & Monetization
14. ✅ #19 - Pro membership page

### Phase 5: Polish
15. ✅ #11 - Invites count bug
16. ✅ #20 - Loading skeletons
17. ✅ #21 - Speed optimization

---

## Notes

- **Payment Integration:** Will need to research Dodo Payments vs RevenueCat for web + mobile
- **Testing:** Each change should be tested on mobile (Android/iOS) and desktop
- **No MCP Required:** All changes can be made by editing code directly
- **Database Changes:** Items 11, 13, 15, 18 may need API/DB work but no MCP needed - we edit code directly
