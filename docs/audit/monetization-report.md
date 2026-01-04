# Monetization & Pro Features Analysis Report

**Generated:** January 4, 2026
**Codebase Version:** Current production build
**Analysis Scope:** Full monetization readiness assessment

---

## Executive Summary

The Verified.Doctor platform has reached a mature state with extensive features currently offered for free. This creates excellent user acquisition potential but represents significant untapped revenue. The codebase already includes infrastructure for tiered access (rate limiting, visibility controls) but lacks explicit subscription gating.

**Key Findings:**
1. **All premium features are currently free** - Analytics, unlimited messages, all templates, unlimited connections
2. **Existing infrastructure supports gating** - Rate limiters, section visibility toggles, and template systems are in place
3. **High-value features identified** - Analytics dashboard, profile customization, and AI-powered tools are prime upsell candidates
4. **An "Upgrade to Pro" banner exists** on the analytics page but is non-functional

**Monetization Readiness Score: 7/10**
Infrastructure exists; implementation of subscription logic and payment integration needed.

---

## Current State Analysis

### Features Currently Free

#### Core Profile Features
| Feature | Location | Current Status | Recommended Tier |
|---------|----------|----------------|------------------|
| Profile URL (vanity handle) | `/[handle]` | Free, unlimited | Free |
| Profile photo upload | Dashboard settings | Free | Free |
| Basic profile info | Dashboard settings | Free | Free |
| Verified badge | Admin approval | Free | Free |
| QR code (B&W) | Dashboard | Free | Free |
| Recommendations display | Public profile | Free, unlimited | Free |

#### Advanced Profile Features (Profile Builder)
| Feature | Location | Current Status | Recommended Tier |
|---------|----------|----------------|------------------|
| Video introduction | Profile Builder | Free | Pro |
| Education timeline | Profile Builder | Free | Pro |
| Hospital affiliations | Profile Builder | Free | Pro |
| Conditions treated (tags) | Profile Builder | Free | Free (limit to 10) |
| Procedures performed (tags) | Profile Builder | Free | Free (limit to 10) |
| Approach to care text | Profile Builder | Free | Pro |
| Case studies | Profile Builder | **Has "PRO" badge** | Pro |
| First visit guide | Profile Builder | Free | Pro |
| Availability status | Profile Builder | Free | Free |
| Telemedicine badge | Profile Builder | Free | Free |
| Professional memberships | Profile Builder | Free | Free (limit to 3) |
| Media & publications | Profile Builder | Free | Pro |
| Clinic gallery | Profile Builder | Free (up to 6 images) | Free=3, Pro=10 |
| Section visibility toggles | Profile Builder | Free | Free |

#### Customization Features
| Feature | Location | Current Status | Recommended Tier |
|---------|----------|----------------|------------------|
| Layout selection (3 layouts) | Settings | Free, all layouts | Free=Classic only, Pro=All |
| Color themes (6 themes) | Settings | Free, all themes | Free=Blue/Ocean, Pro=All |
| Profile freeze toggle | Settings | Free | Free |

#### Networking Features
| Feature | Location | Current Status | Recommended Tier |
|---------|----------|----------------|------------------|
| Connections (unlimited) | Connections page | Free, unlimited | Free=10 max, Pro=Unlimited |
| Connection requests | Connections page | Free | Free |
| Invite colleagues | Connections page | Free, 10/hour rate limit | Free=5 total, Pro=Unlimited |
| Invite via email | Connections page | Free | Pro |

#### Messaging Features
| Feature | Location | Current Status | Recommended Tier |
|---------|----------|----------------|------------------|
| Receive messages | Messages page | Free, unlimited | Free=10/month, Pro=Unlimited |
| Message reply tracking | Messages page | Free | Free |
| Message deletion | Messages page | Free | Free |
| Admin messages (pinned) | Messages page | Free | Free |

#### Analytics Features
| Feature | Location | Current Status | Recommended Tier |
|---------|----------|----------------|------------------|
| Total views | Analytics dashboard | Free | Free |
| Unique visitors | Analytics dashboard | Free | Pro |
| Doctor views tracking | Analytics dashboard | Free | Pro |
| Actions breakdown | Analytics dashboard | Free | Pro |
| Device breakdown | Analytics dashboard | Free | Pro |
| Top referrers | Analytics dashboard | Free | Pro |
| Historical data (up to 365 days) | Analytics dashboard | Free | Free=7 days, Pro=365 days |
| Period comparison (% change) | Analytics dashboard | Free | Pro |
| Views chart over time | Analytics dashboard | Free | Pro |

#### AI Features
| Feature | Location | Current Status | Recommended Tier |
|---------|----------|----------------|------------------|
| AI Enhance button | Profile Builder | Free | Pro (or limited free uses) |
| AI Suggest tags | Profile Builder | Free | Pro (or limited free uses) |

### Already Implemented Limits

The codebase has existing rate limiting infrastructure that could be extended for tier-based limits:

```typescript
// From src/lib/rate-limit.ts
- Recommendation: 1 per IP per profile per 24 hours
- Messages: 5 per IP per hour (sender-side)
- General API: 100 per IP per minute
- Handle check: 30 per IP per minute
- Invites: 10 per user per hour
```

Currently, these are spam prevention measures, not subscription-based limits.

---

## Recommended Tier Structure

### Free Tier (Growth Driver)
**Goal:** Maximize adoption, create network effects

| Feature | Limit |
|---------|-------|
| Profile URL & verified badge | Included |
| Basic profile info | Included |
| Profile photo | Included |
| QR code (standard B&W) | Included |
| Receive messages | 10/month |
| Connections | 10 maximum |
| Invites | 5 total |
| Profile layout | Classic only |
| Color theme | Blue or Ocean |
| Conditions/procedures tags | 10 each |
| Clinic gallery images | 3 images |
| Professional memberships | 3 entries |
| Analytics | View count only, 7-day history |
| AI features | 5 uses/month |

### Pro Tier (Rs 299/month or Rs 2499/year)
**Goal:** Convert active doctors who need more features

| Feature | Limit |
|---------|-------|
| All Free features | Included |
| Receive messages | Unlimited |
| Connections | Unlimited |
| Invites | Unlimited |
| Email invites | Included |
| All profile layouts | Hero, Timeline, Classic |
| All color themes | All 6 themes |
| Conditions/procedures tags | 30 each |
| Clinic gallery images | 10 images |
| Professional memberships | 10 entries |
| Video introduction | Included |
| Education timeline | Included |
| Hospital affiliations | Included |
| Case studies | 5 entries |
| Approach to care | Included |
| First visit guide | Included |
| Media & publications | 10 entries |
| Full analytics dashboard | 365-day history |
| Unique visitors | Included |
| Device breakdown | Included |
| Referrer tracking | Included |
| AI features | Unlimited |
| QR code customization | Colors + logo |
| Message templates | 5 saved templates |
| Priority support | Email support |

### Premium Tier (Rs 599/month or Rs 4999/year) - NEW
**Goal:** Capture high-value doctors willing to pay more

| Feature | Limit |
|---------|-------|
| All Pro features | Included |
| Directory priority listing | Boosted visibility |
| Custom domain support | CNAME mapping |
| White-label QR materials | PDF templates |
| Analytics export (CSV/PDF) | Included |
| Appointment booking integration | Coming soon |
| Video verification badge | Gold badge tier |
| Featured in specialty search | Included |
| SMS reply to patients | 50 SMS/month included |
| Dedicated account manager | For high-value accounts |
| API access (read-only) | Profile data export |

### Enterprise Tier (Custom Pricing)
**Goal:** Hospital and clinic group accounts

| Feature | Description |
|---------|-------------|
| Multi-doctor management | Single admin dashboard |
| Centralized billing | One invoice for all doctors |
| Bulk verification | Expedited verification process |
| Custom branding | Hospital logo on profiles |
| SSO integration | SAML/OAuth support |
| API access (full) | Read/write access |
| Analytics aggregation | Cross-doctor insights |
| Dedicated success manager | Onboarding + ongoing support |
| Custom contract terms | SLA guarantees |

---

## Upsell Touchpoint Opportunities

### 1. Analytics Dashboard
**File:** `src/app/(dashboard)/dashboard/analytics/page.tsx`
**Current:** Shows "Upgrade to Pro" banner (lines 190-205)
**Status:** Banner exists but is non-functional

**Recommendations:**
- Add lock icons on Pro metrics when in Free tier
- Show blurred previews of advanced analytics
- Display "Unlock with Pro" overlay on charts
- Add comparison to similar doctors ("You're in the top 10% of views")

### 2. Messages Page - Hitting Limit
**File:** `src/app/(dashboard)/dashboard/messages/page.tsx`

**Implementation:**
```
When free user receives 8th message:
- Show warning: "2 messages remaining this month"

When limit reached:
- Show upgrade prompt instead of message content
- "Upgrade to Pro to read unlimited messages"
```

### 3. Connections Page - Hitting Limit
**File:** `src/app/(dashboard)/dashboard/connections/page.tsx`

**Implementation:**
- When at 8/10 connections: Show "2 slots remaining" badge
- When at 10/10: Hide "Connect" button, show upgrade CTA
- In invite dialog: "Upgrade for unlimited invites"

### 4. Profile Builder - Premium Sections
**File:** `src/components/dashboard/profile-builder/profile-builder.tsx`

**Current:** Case Studies section already has `badge="PRO"` (line 329)
**Recommendation:** Expand PRO badge to more sections and make them functional:
- Lock section content (not just badge)
- Show preview with blur
- Add "Unlock with Pro" button

### 5. Settings Page - Template Selection
**File:** `src/components/dashboard/profile-settings.tsx`

**Implementation:**
- Show Pro themes with lock icons
- Add "Pro" badge to premium layouts (Hero, Timeline)
- On click: Show upgrade modal instead of applying theme

### 6. Dashboard Overview - Metrics Cards
**File:** `src/app/(dashboard)/dashboard/page.tsx`

**Implementation:**
- Add sparklines to metric cards (Pro only)
- Show trend arrows with upgrade prompt
- Add "Detailed breakdown" link that goes to gated analytics

### 7. Public Profile - Owner View Banner
**File:** `src/app/[handle]/page.tsx`

**Implementation:**
- When doctor views their own profile:
  - Show floating "Upgrade your profile" banner
  - Highlight features they're missing
  - "Get 3x more views with Premium template"

### 8. QR Code Section
**File:** `src/app/(dashboard)/dashboard/page.tsx` (lines 142-173)

**Implementation:**
- Show color customization options (locked for free)
- Preview colored QR with "Upgrade to customize"
- Add "Download with logo" option (Pro only)

### 9. AI Feature Usage
**Files:**
- `src/components/ui/ai-enhance-button.tsx`
- `src/components/ui/ai-suggest-tags.tsx`

**Implementation:**
- Track AI usage per user
- Show "3/5 free uses remaining"
- After limit: "Upgrade for unlimited AI enhancements"

### 10. Onboarding Success Page
**File:** `src/app/(dashboard)/onboarding/success/page.tsx`

**Implementation:**
- Add "Start your free Pro trial" banner
- Highlight premium features they're missing
- Limited-time discount offer

---

## Feature Gating Implementation

### Database Schema Addition

Add subscription tracking to profiles table:

```sql
ALTER TABLE profiles ADD COLUMN subscription_tier TEXT DEFAULT 'free';
ALTER TABLE profiles ADD COLUMN subscription_started_at TIMESTAMP;
ALTER TABLE profiles ADD COLUMN subscription_ends_at TIMESTAMP;
ALTER TABLE profiles ADD COLUMN stripe_customer_id TEXT;
ALTER TABLE profiles ADD COLUMN stripe_subscription_id TEXT;
ALTER TABLE profiles ADD COLUMN monthly_message_count INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN monthly_ai_usage_count INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN message_count_reset_at TIMESTAMP;
```

### Usage Tracking Tables

```sql
CREATE TABLE subscription_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES profiles(id),
  usage_type TEXT NOT NULL, -- 'message', 'ai_enhance', 'ai_suggest', 'invite'
  count INTEGER DEFAULT 0,
  period_start TIMESTAMP NOT NULL,
  period_end TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE subscription_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES profiles(id),
  event_type TEXT NOT NULL, -- 'upgraded', 'downgraded', 'cancelled', 'renewed'
  from_tier TEXT,
  to_tier TEXT,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Helper Functions

Create a subscription utility:

```typescript
// src/lib/subscription.ts

export type SubscriptionTier = 'free' | 'pro' | 'premium' | 'enterprise';

export interface TierLimits {
  maxMessages: number;
  maxConnections: number;
  maxInvites: number;
  maxConditionTags: number;
  maxProcedureTags: number;
  maxGalleryImages: number;
  maxMemberships: number;
  maxCaseStudies: number;
  maxMediaPublications: number;
  maxAiUsage: number;
  analyticsHistoryDays: number;
  availableLayouts: string[];
  availableThemes: string[];
  features: string[];
}

export const TIER_LIMITS: Record<SubscriptionTier, TierLimits> = {
  free: {
    maxMessages: 10,
    maxConnections: 10,
    maxInvites: 5,
    maxConditionTags: 10,
    maxProcedureTags: 10,
    maxGalleryImages: 3,
    maxMemberships: 3,
    maxCaseStudies: 0,
    maxMediaPublications: 0,
    maxAiUsage: 5,
    analyticsHistoryDays: 7,
    availableLayouts: ['classic'],
    availableThemes: ['blue', 'ocean'],
    features: ['basic_profile', 'qr_code', 'recommendations'],
  },
  pro: {
    maxMessages: -1, // unlimited
    maxConnections: -1,
    maxInvites: -1,
    maxConditionTags: 30,
    maxProcedureTags: 30,
    maxGalleryImages: 10,
    maxMemberships: 10,
    maxCaseStudies: 5,
    maxMediaPublications: 10,
    maxAiUsage: -1,
    analyticsHistoryDays: 365,
    availableLayouts: ['classic', 'hero', 'timeline'],
    availableThemes: ['blue', 'ocean', 'sage', 'warm', 'teal', 'executive'],
    features: ['basic_profile', 'qr_code', 'recommendations', 'full_analytics',
               'video_intro', 'education', 'hospitals', 'case_studies',
               'approach', 'first_visit', 'media', 'email_invites', 'ai_unlimited'],
  },
  premium: {
    // ... extended limits
  },
  enterprise: {
    // ... custom limits
  },
};

export function canAccessFeature(tier: SubscriptionTier, feature: string): boolean {
  return TIER_LIMITS[tier].features.includes(feature);
}

export function getRemainingUsage(tier: SubscriptionTier, usageType: string, currentCount: number): number {
  const limit = TIER_LIMITS[tier][`max${capitalize(usageType)}` as keyof TierLimits] as number;
  if (limit === -1) return Infinity;
  return Math.max(0, limit - currentCount);
}
```

### API Middleware Pattern

```typescript
// src/lib/subscription-check.ts

export async function requireSubscription(
  profileId: string,
  requiredTier: SubscriptionTier,
  featureKey?: string
): Promise<{ allowed: boolean; tier: SubscriptionTier; reason?: string }> {
  const profile = await getProfileWithSubscription(profileId);
  const currentTier = profile.subscription_tier as SubscriptionTier || 'free';

  const tierOrder: SubscriptionTier[] = ['free', 'pro', 'premium', 'enterprise'];
  const currentIndex = tierOrder.indexOf(currentTier);
  const requiredIndex = tierOrder.indexOf(requiredTier);

  if (currentIndex < requiredIndex) {
    return {
      allowed: false,
      tier: currentTier,
      reason: `This feature requires ${requiredTier} subscription`
    };
  }

  if (featureKey && !canAccessFeature(currentTier, featureKey)) {
    return {
      allowed: false,
      tier: currentTier,
      reason: `This feature is not available on your current plan`
    };
  }

  return { allowed: true, tier: currentTier };
}
```

---

## Analytics Monetization

### Current Analytics Data Collected
From `src/lib/analytics.ts` and `src/types/database.ts`:

| Data Point | Collection Method | Current Use | Monetization Potential |
|------------|-------------------|-------------|------------------------|
| Profile views | `increment_view_count` | Dashboard metric | Free |
| Unique visitors | Visitor ID hash | Dashboard | Pro |
| Device type | User agent parsing | Device chart | Pro |
| Referrer URLs | Document.referrer | Referrer table | Pro |
| Action clicks | Event tracking | Actions chart | Pro |
| Verified doctor views | Auth check | Dashboard | Pro |
| Session tracking | Session ID | Analytics | Pro |
| Geographic location | IP-based (columns exist) | Not implemented | Premium |

### Premium Analytics Features to Build

1. **Conversion Funnel**
   - Views -> Save Contact -> Send Inquiry -> Appointment Booked
   - Show drop-off rates at each step
   - Compare to specialty averages

2. **Patient Demographics**
   - Age group estimates (from device/browser data)
   - Location heatmap
   - Peak visiting times

3. **Competitor Benchmarking**
   - "Your profile gets 2x more views than average cardiologists"
   - Anonymous specialty comparisons
   - Ranking within specialty

4. **SEO Insights**
   - Search keywords driving traffic
   - Google ranking for specialty + location
   - Suggested SEO improvements

5. **Recommendation Analytics**
   - Recommendation growth trend
   - Viral coefficient (recommendations per connection)
   - Best performing content

### B2B Data Monetization (Aggregate, Anonymized)

| Data Product | Potential Buyer | Value Proposition |
|--------------|-----------------|-------------------|
| Specialty demand by city | Pharma companies | "Which cities need more cardiologists?" |
| Doctor engagement benchmarks | Hospital HR | "What makes doctors engage more?" |
| Patient inquiry patterns | Healthcare startups | "When do patients seek doctors?" |
| Medical trend signals | Research organizations | "Which specialties are growing?" |

**Important:** All B2B data must be:
- Fully anonymized
- Aggregated (never individual)
- Opt-in with clear disclosure
- HIPAA/data protection compliant

---

## Physical Product Opportunities

### QR Code Stands (High Margin)

**Product:** Premium acrylic QR code displays for clinic desks

| Item | Cost (Est.) | Price | Margin |
|------|-------------|-------|--------|
| Basic acrylic stand | Rs 150 | Rs 499 | 70% |
| Premium with metal base | Rs 250 | Rs 799 | 69% |
| Desk nameplate with QR | Rs 400 | Rs 1299 | 69% |
| Wall-mounted frame | Rs 200 | Rs 699 | 71% |

**Implementation:**
- Partner with local acrylic manufacturers
- On-demand printing with custom QR
- Upsell during Pro subscription checkout
- Bundle with annual Pro subscription

### Business Cards Integration

**Product:** Premium business cards with QR code

| Item | Cost | Price (100 cards) | Margin |
|------|------|-------------------|--------|
| Standard cards | Rs 200 | Rs 699 | 71% |
| Premium thick stock | Rs 350 | Rs 999 | 65% |
| NFC-enabled cards | Rs 500 | Rs 1499 | 67% |

**Implementation:**
- Partner with VistaPrint or local printers
- Auto-generate card design from profile
- Include in Premium tier as one-time perk

### Prescription Pad Headers

**Product:** Custom prescription pads with QR

| Item | Cost | Price (2 pads x 100 sheets) | Margin |
|------|------|------------------------------|--------|
| Standard pads | Rs 150 | Rs 599 | 75% |
| Premium carbonless | Rs 300 | Rs 899 | 67% |

---

## Revenue Projections

### Assumptions
- Current users: Estimated 500 (based on development stage)
- Growth rate: 100 new users/month
- Pro conversion rate: 10% of active users
- Premium conversion rate: 2% of active users
- Annual subscription preference: 40%

### Year 1 Projections

| Revenue Stream | Monthly (Steady State) | Annual |
|----------------|------------------------|--------|
| Pro subscriptions | Rs 75,000 | Rs 900,000 |
| Premium subscriptions | Rs 30,000 | Rs 360,000 |
| Physical products | Rs 20,000 | Rs 240,000 |
| Enterprise (2 hospitals) | Rs 50,000 | Rs 600,000 |
| **Total** | **Rs 175,000** | **Rs 2,100,000** |

### Year 2 Projections (10x user growth)

| Revenue Stream | Monthly | Annual |
|----------------|---------|--------|
| Pro subscriptions | Rs 450,000 | Rs 5,400,000 |
| Premium subscriptions | Rs 180,000 | Rs 2,160,000 |
| Physical products | Rs 100,000 | Rs 1,200,000 |
| Enterprise (10 hospitals) | Rs 250,000 | Rs 3,000,000 |
| B2B data products | Rs 100,000 | Rs 1,200,000 |
| **Total** | **Rs 1,080,000** | **Rs 12,960,000** |

---

## Implementation Roadmap

### Phase 1: Foundation (Weeks 1-2)
**Priority:** Set up payment and subscription infrastructure

1. **Integrate Razorpay/Stripe**
   - Create payment API routes
   - Set up webhook handlers
   - Add customer management

2. **Add subscription columns to profiles table**
   - `subscription_tier`
   - `subscription_ends_at`
   - `stripe_customer_id`

3. **Create subscription utility library**
   - Tier limits configuration
   - Access check functions
   - Usage tracking helpers

4. **Build pricing page**
   - Feature comparison table
   - Monthly/annual toggle
   - Checkout flow

### Phase 2: Feature Gating (Weeks 3-4)
**Priority:** Gate highest-value features first

1. **Analytics Dashboard**
   - Gate full analytics to Pro
   - Show 7-day limit for Free
   - Add upgrade prompts

2. **Messages**
   - Implement monthly limit tracking
   - Add limit warning UI
   - Gate new messages when limit reached

3. **Connections**
   - Implement connection limit
   - Add upgrade prompt at limit

4. **Profile Builder**
   - Gate Pro sections (video, case studies, etc.)
   - Show lock icons
   - Add upgrade modals

### Phase 3: Upsell Optimization (Weeks 5-6)
**Priority:** Maximize conversion touchpoints

1. **Dashboard prompts**
   - Add upgrade banners
   - Show usage stats
   - Implement trial offers

2. **Settings page gating**
   - Lock premium layouts
   - Lock premium themes
   - Add preview capability

3. **Email campaigns**
   - Welcome sequence mentioning Pro
   - Usage limit warnings
   - Feature announcement emails

### Phase 4: Physical Products (Weeks 7-8)
**Priority:** Add high-margin revenue stream

1. **QR stands**
   - Partner with manufacturer
   - Create product pages
   - Add to checkout flow

2. **Business cards**
   - Design templates
   - Partner with printer
   - Integrate ordering

### Phase 5: Enterprise (Month 3+)
**Priority:** Land first enterprise deals

1. **Multi-tenant features**
   - Clinic admin dashboard
   - Bulk user management
   - Centralized billing

2. **Sales materials**
   - Enterprise pricing deck
   - Demo environment
   - Case studies

---

## Competitive Analysis Notes

### Competitors and Their Monetization

| Platform | Free Tier | Paid Tier | Key Insight |
|----------|-----------|-----------|-------------|
| **Practo** | Basic listing | Rs 5000+/month | Premium = priority listing |
| **DocOn** | Basic profile | Rs 999/month | Appointment booking upsell |
| **LinkedIn** | Profile + basic networking | Rs 2500+/month | Sales Navigator model |
| **Linktree** | 1 free link | $5/month | Templates + analytics |

### Differentiation Opportunities

1. **Verification as moat** - Competitors don't have verified badge system
2. **Network effects** - Connection system creates switching costs
3. **Patient relationship** - Messaging system is unique
4. **Physical integration** - QR stands bridge online-offline gap

### Pricing Psychology

- **Anchor high:** Show Premium first, Pro looks reasonable
- **Annual discount:** 2 months free on annual
- **Trial period:** 14-day Pro trial for new users
- **Grandfathering:** Early adopters keep current pricing forever

---

## Next Steps

1. **Immediate:** Fix the non-functional "Upgrade to Pro" button on analytics page
2. **This week:** Design pricing page UI
3. **This month:** Integrate Razorpay and implement basic subscription logic
4. **This quarter:** Full feature gating and upsell optimization

---

## Appendix: Files to Modify

### For Subscription Logic
- `src/types/database.ts` - Add subscription types
- `src/lib/subscription.ts` - Create new file
- `src/app/api/subscription/*` - New API routes

### For Feature Gating
- `src/app/(dashboard)/dashboard/analytics/page.tsx`
- `src/app/(dashboard)/dashboard/messages/page.tsx`
- `src/app/(dashboard)/dashboard/connections/page.tsx`
- `src/components/dashboard/profile-settings.tsx`
- `src/components/dashboard/profile-builder/profile-builder.tsx`
- `src/components/dashboard/profile-builder/section-wrapper.tsx`

### For Payment Integration
- `src/app/api/payment/create-checkout/route.ts` - New
- `src/app/api/payment/webhook/route.ts` - New
- `src/app/pricing/page.tsx` - New
- `src/components/pricing/*` - New components

---

*Report prepared for Verified.Doctor product and engineering teams.*
