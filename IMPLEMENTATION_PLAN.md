# Implementation Plan: Pro Trial & Analytics Improvements

## Overview

This document outlines the implementation plan for the following features:

1. **Onboarding Default Selection** - Select first layout/theme by default
2. **Analytics Restrictions** - Put 7-day analytics behind Pro, free users see only today
3. **New Account View Boost** - Add 10-20 random views for new accounts (one-time)
4. **Dashboard Notifications** - Dismissible notification cards with "X people viewed your profile"
5. **Free Pro Trial Offer** - 30 days Pro for inviting 2 people (viral mechanism)
6. **Email Notifications** - Profile views email, trial offer email on signup
7. **UI Improvements** - Premium look for dashboard sections

---

## Database Schema Changes

### New Columns on `profiles` table:

```sql
-- View boost tracking (one-time mechanism)
initial_boost_applied BOOLEAN DEFAULT false,
initial_boost_amount INTEGER DEFAULT 0,
initial_boost_applied_at TIMESTAMP WITH TIME ZONE,

-- Dashboard notifications state (JSON for flexibility)
dismissed_notifications JSONB DEFAULT '[]',

-- Pro trial system
trial_status TEXT DEFAULT 'none', -- 'none', 'eligible', 'in_progress', 'claimed', 'expired'
trial_invites_required INTEGER DEFAULT 2,
trial_invites_completed INTEGER DEFAULT 0,
trial_started_at TIMESTAMP WITH TIME ZONE,
trial_expires_at TIMESTAMP WITH TIME ZONE,
trial_offer_shown_at TIMESTAMP WITH TIME ZONE
```

### New Table: `trial_invites`

```sql
CREATE TABLE trial_invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES profiles(id) NOT NULL,
  invite_code TEXT NOT NULL,
  invitee_profile_id UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE
);
```

---

## Feature Breakdown

### 1. Onboarding Default Selection

**File:** `src/app/(dashboard)/onboarding/page.tsx`

**Current State:**
- `profileLayout` and `profileTheme` are initialized as empty strings
- Users must manually select to proceed

**Change:**
- Set defaults: `profileLayout = "classic"` and `profileTheme = "blue"`
- First option pre-selected visually
- Users can still change but don't need to explicitly pick

**Implementation:**
```typescript
const [profileLayout, setProfileLayout] = useState("classic");  // Default to first
const [profileTheme, setProfileTheme] = useState("blue");        // Default to first
```

---

### 2. Analytics Restrictions for Free Users

**Files:**
- `src/app/(dashboard)/dashboard/analytics/page.tsx`
- `src/app/api/analytics/dashboard/route.ts`
- `src/lib/subscription/check-access.ts`

**Current State:**
- Free users can see 7 days of analytics
- Only 90+ days are Pro-restricted

**Changes:**

1. **Update `FREE_LIMITS`:**
```typescript
export const FREE_LIMITS = {
  connections: 20,
  messages_per_month: 50,
  ai_suggestions_per_month: 3,
  analytics_days: 1,  // Changed from 7 to 1 (today only)
} as const;
```

2. **API Route:** Enforce limit server-side
3. **UI:** Show 7-day option as Pro-only with lock icon

---

### 3. New Account View Boost (One-Time)

**Mechanism:**
- After account creation, check if 24 hours have passed
- If `initial_boost_applied = false` AND `created_at + 24h < now()`
- Generate random number 10-20
- Add to `view_count` and `analytics_daily_stats`
- Set `initial_boost_applied = true`, record `initial_boost_amount`
- Create notification for user
- Send email about profile views

**Files:**
- New: `src/app/api/cron/apply-view-boost/route.ts` (or trigger on dashboard load)
- `src/app/(dashboard)/dashboard/page.tsx` - trigger check
- `src/lib/email/send.ts` - new email template

**Trigger:** Dashboard load (simpler than cron for now)

```typescript
// On dashboard load:
if (!profile.initial_boost_applied && isOlderThan24Hours(profile.created_at)) {
  await applyViewBoost(profile.id);
}
```

---

### 4. Dashboard Notifications

**Components:**
- New: `src/components/dashboard/notification-card.tsx`
- Update: `src/app/(dashboard)/dashboard/page.tsx`

**Notification Types:**
1. **View Boost Notification:** "X people viewed your profile!"
2. **Pro Trial Offer:** "You've been selected for free Pro!"

**State Management:**
- Store dismissed IDs in `dismissed_notifications` JSONB array
- Check on load, don't show if ID in array

**UI Design:**
```tsx
<NotificationCard
  id="view-boost-notification"
  type="success"
  title="Your profile is getting noticed!"
  description="15 people viewed your profile today. Keep building your presence!"
  onDismiss={() => dismissNotification('view-boost-notification')}
  dismissible
/>
```

---

### 5. Free Pro Trial System

**Flow:**

1. **On Signup:**
   - Set `trial_status = 'eligible'`
   - Record `trial_offer_shown_at = now()`
   - Send email about offer
   - Show notification on dashboard

2. **Dashboard Display:**
   - Special card: "You've been selected for free Pro!"
   - Show invite mechanism: "Invite 2 colleagues to get 30 days Pro free"
   - Progress indicator: "0/2 invites completed"

3. **When Colleague Signs Up via Trial Invite:**
   - Increment `trial_invites_completed`
   - If count >= 2:
     - Set `trial_status = 'claimed'`
     - Set `subscription_status = 'pro'`
     - Set `trial_started_at = now()`
     - Set `trial_expires_at = now() + 30 days`
     - Send congratulations email

4. **After Trial Claimed:**
   - Remove notification from dashboard
   - Add to user menu dropdown: "Free Pro Active (X days left)"

5. **After Trial Expires:**
   - Set `trial_status = 'expired'`
   - Set `subscription_status = 'free'`
   - Show upgrade CTA

**Files:**
- `src/app/api/trial/status/route.ts`
- `src/app/api/trial/invite/route.ts`
- `src/components/dashboard/trial-offer-card.tsx`
- `src/components/dashboard/user-menu.tsx` - add "Free Pro" item

---

### 6. Email Notifications

**New Email Templates:**

1. **Profile Views Email (`sendProfileViewsEmail`):**
```
Subject: "15 people viewed your profile on Verified.Doctor"

Content:
- Congratulations on the views
- Tips to get more views
- Mention all the blocks they can add (education, case studies, etc.)
- CTA to Profile Builder
```

2. **Pro Trial Offer Email (`sendTrialOfferEmail`):**
```
Subject: "You've been selected for free Pro access!"

Content:
- Exclusive offer messaging
- Explain: Invite 2 colleagues = 30 days Pro
- List Pro benefits
- CTA to dashboard
```

3. **Trial Claimed Email (`sendTrialClaimedEmail`):**
```
Subject: "Your 30-day Pro trial is now active!"

Content:
- Congratulations
- What's now unlocked
- Trial end date
- CTA to explore Pro features
```

---

### 7. UI Improvements

**Dashboard Page:**
- Add subtle card shadows
- Increase contrast between sections and background
- Add gradient borders to cards
- More prominent metric cards

**Profile Builder:**
- Add section dividers
- Better tab styling
- Clearer visual hierarchy
- Premium card styling for section editors

**Files:**
- `src/app/(dashboard)/dashboard/page.tsx`
- `src/app/(dashboard)/dashboard/profile-builder/page.tsx`
- Various component files

---

## Implementation Order

### Phase 1: Database & Simple Changes

1. [ ] Apply database migrations for new columns
2. [ ] Update onboarding default selections
3. [ ] Update analytics restrictions (FREE_LIMITS)

### Phase 2: View Boost System

4. [ ] Create view boost application logic
5. [ ] Create `sendProfileViewsEmail` template
6. [ ] Integrate boost check on dashboard load

### Phase 3: Notification System

7. [ ] Create `NotificationCard` component
8. [ ] Integrate with dashboard
9. [ ] API for dismissing notifications

### Phase 4: Pro Trial System

10. [ ] Create trial status tracking
11. [ ] Create trial invite mechanism
12. [ ] Create `TrialOfferCard` component
13. [ ] Create trial emails
14. [ ] Update user menu with trial status
15. [ ] Handle trial expiry

### Phase 5: UI Improvements

16. [ ] Dashboard card styling
17. [ ] Profile builder improvements
18. [ ] Overall polish

---

## Pro Benefits to Highlight

When showing Pro benefits, use this list:

**Templates & Themes:**
- 4 Premium Profile Layouts (Timeline, Magazine, Grid, Minimal)
- 4 Exclusive Color Themes (Sage, Warm, Teal, Executive)

**Content Sections:**
- Video Introduction
- Case Studies Gallery
- Media & Publications
- Clinic Photo Gallery

**Limits:**
- Unlimited Connections (vs 20 for free)
- Unlimited Messages (vs 50/month for free)
- Unlimited AI Suggestions (vs 3/month for free)

**Analytics:**
- Extended History (90 days, 1 year)
- Referrer Tracking
- Export Data

**QR Codes:**
- Custom Colors
- Logo Integration

---

## File Changes Summary

### New Files:
- `src/components/dashboard/notification-card.tsx`
- `src/components/dashboard/trial-offer-card.tsx`
- `src/app/api/trial/status/route.ts`
- `src/app/api/trial/invite/route.ts`
- `src/app/api/notifications/dismiss/route.ts`

### Modified Files:
- `src/app/(dashboard)/onboarding/page.tsx` - default selections
- `src/app/(dashboard)/dashboard/page.tsx` - notifications, boost check, UI
- `src/app/(dashboard)/dashboard/analytics/page.tsx` - Pro restrictions
- `src/app/api/analytics/dashboard/route.ts` - enforce 1-day limit
- `src/lib/subscription/check-access.ts` - update FREE_LIMITS
- `src/lib/email/send.ts` - new email templates
- `src/app/api/profiles/route.ts` - set trial_status on signup
- `src/components/dashboard/user-menu.tsx` - trial status display
- `src/types/database.ts` - new types after migration

---

## Success Criteria

1. New users see layout/theme pre-selected
2. Free users only see today's analytics
3. New accounts get 10-20 view boost after 24 hours (once)
4. Dashboard shows dismissible notifications
5. New users see Pro trial offer
6. Inviting 2 colleagues grants 30-day Pro
7. Appropriate emails sent at each stage
8. UI looks premium and clear
