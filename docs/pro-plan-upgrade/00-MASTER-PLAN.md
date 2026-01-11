# Pro Plan Implementation - Master Plan

**Created:** January 10, 2026
**Status:** Implementation Ready
**Branch:** `adding-pro-plans`

---

## Executive Summary

This document outlines the complete implementation of the Pro subscription tier for Verified.Doctor using Dodo Payments as the payment provider.

### Why Dodo Payments?

1. **Adaptive Currency** - Auto-detects user location, shows prices in local currency (INR, USD, EUR, etc.)
2. **Hosted Checkout** - No need to build payment UI, Dodo handles it
3. **Merchant of Record** - Handles global tax compliance
4. **Built for SaaS** - Native subscription support with trials, plan changes, proration
5. **India-First** - Great UPI/card support for Indian market

---

## Table of Contents

1. [Pro vs Free Feature Matrix](#1-pro-vs-free-feature-matrix)
2. [Database Changes](#2-database-changes)
3. [Dodo Payments Integration](#3-dodo-payments-integration)
4. [Code Implementation](#4-code-implementation)
5. [UI Changes](#5-ui-changes)
6. [Testing Guide](#6-testing-guide)
7. [Launch Checklist](#7-launch-checklist)

---

## 1. Pro vs Free Feature Matrix

### Design Philosophy

> **Free should be generous enough for adoption. Pro should be a burning need for power users.**

The free tier must:
- Let doctors create a complete, professional profile
- Get discovered by patients
- Receive messages and recommendations
- See basic analytics

The Pro tier unlocks:
- Power features for serious professionals
- Unlimited scale (connections, messages)
- Advanced analytics & insights
- Premium customization

### Feature Matrix

| Feature | Free | Pro | Implementation |
|---------|------|-----|----------------|
| **Profile** |
| Public profile page | ✅ Unlimited | ✅ Unlimited | No gate |
| Profile photo | ✅ | ✅ | No gate |
| Basic info (name, specialty, clinic) | ✅ | ✅ | No gate |
| Bio & qualifications | ✅ | ✅ | No gate |
| Booking link | ✅ | ✅ | No gate |
| Verified badge (after verification) | ✅ | ✅ | No gate |
| **Templates & Themes** |
| Classic template | ✅ | ✅ | No gate |
| Hero template | ✅ | ✅ | No gate |
| Timeline template | ❌ | ✅ | Gate in UI |
| Magazine template | ❌ | ✅ | Gate in UI |
| Grid template | ❌ | ✅ | Gate in UI |
| Minimal template | ❌ | ✅ | Gate in UI |
| Blue theme | ✅ | ✅ | No gate |
| Ocean theme | ✅ | ✅ | No gate |
| Sage, Warm, Teal, Executive themes | ❌ | ✅ | Gate in UI |
| **Enriched Sections** |
| Education timeline | ✅ | ✅ | No gate |
| Hospital affiliations | ✅ | ✅ | No gate |
| Services/procedures | ✅ | ✅ | No gate |
| Video introduction | ❌ | ✅ | Gate in profile builder |
| Case studies | ❌ | ✅ | Gate in profile builder |
| Media & publications | ❌ | ✅ | Gate in profile builder |
| Clinic gallery (photos) | ❌ | ✅ | Gate in profile builder |
| **Connections** |
| Send/receive connection requests | ✅ | ✅ | No gate |
| Maximum connections | 20 | Unlimited | Check in API |
| Invite colleagues | ✅ | ✅ | No gate |
| **Messages** |
| Receive patient inquiries | ✅ | ✅ | No gate |
| Read & reply to messages | ✅ | ✅ | No gate |
| Messages per month | 50 | Unlimited | Check in API |
| Message templates (saved replies) | ❌ | ✅ | Future feature |
| **Recommendations** |
| Receive recommendations | ✅ Unlimited | ✅ Unlimited | No gate |
| Display count on profile | ✅ | ✅ | No gate |
| **Analytics** |
| Total views | ✅ | ✅ | No gate |
| Date range | Last 7 days | Unlimited | Gate in API |
| Device breakdown | ✅ | ✅ | No gate |
| Action clicks (save, book, inquiry) | ✅ | ✅ | No gate |
| Referrer sources | ❌ | ✅ | Gate in API |
| Custom date picker | ❌ | ✅ | Gate in UI |
| Export analytics (CSV) | ❌ | ✅ | Future feature |
| **QR Code** |
| Basic QR code | ✅ | ✅ | No gate |
| Custom colors | ❌ | ✅ | Gate in UI |
| Logo in QR code | ❌ | ✅ | Gate in UI |
| **AI Features** |
| AI profile suggestions | 3/month | Unlimited | Track usage in DB |
| AI profile enhancement | 3/month | Unlimited | Track usage in DB |
| **Support** |
| Email support | ✅ | ✅ | No gate |
| Priority support | ❌ | ✅ | Tag in support system |

### Pricing

| Plan | Price | Billing |
|------|-------|---------|
| Free | $0 | Forever |
| Pro Monthly | $4.99/month | Recurring |
| Pro Yearly | $39.99/year (~$3.33/month) | Recurring |

**Note:** Dodo's Adaptive Currency will auto-convert:
- India: ~₹420/month or ~₹3,360/year
- Europe: ~€4.50/month
- UK: ~£4/month

---

## 2. Database Changes

### New Columns for `profiles` Table

```sql
-- Subscription status
subscription_status TEXT DEFAULT 'free' CHECK (subscription_status IN ('free', 'pro', 'cancelled')),
subscription_id TEXT,  -- Dodo subscription ID
subscription_plan TEXT,  -- 'monthly' or 'yearly'
subscription_started_at TIMESTAMPTZ,
subscription_expires_at TIMESTAMPTZ,
subscription_cancelled_at TIMESTAMPTZ,

-- Usage tracking for gated features
ai_suggestions_used_this_month INTEGER DEFAULT 0,
ai_suggestions_reset_at TIMESTAMPTZ DEFAULT NOW(),
messages_received_this_month INTEGER DEFAULT 0,
messages_reset_at TIMESTAMPTZ DEFAULT NOW()
```

### New Table: `subscription_events`

```sql
CREATE TABLE subscription_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES profiles(id),
  event_type TEXT NOT NULL,  -- 'created', 'renewed', 'cancelled', 'expired', 'plan_changed'
  dodo_subscription_id TEXT,
  dodo_event_id TEXT,
  amount INTEGER,  -- in cents
  currency TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Migration SQL

```sql
-- Add subscription columns to profiles
ALTER TABLE profiles
ADD COLUMN subscription_status TEXT DEFAULT 'free' CHECK (subscription_status IN ('free', 'pro', 'cancelled')),
ADD COLUMN subscription_id TEXT,
ADD COLUMN subscription_plan TEXT,
ADD COLUMN subscription_started_at TIMESTAMPTZ,
ADD COLUMN subscription_expires_at TIMESTAMPTZ,
ADD COLUMN subscription_cancelled_at TIMESTAMPTZ,
ADD COLUMN ai_suggestions_used_this_month INTEGER DEFAULT 0,
ADD COLUMN ai_suggestions_reset_at TIMESTAMPTZ DEFAULT NOW(),
ADD COLUMN messages_received_this_month INTEGER DEFAULT 0,
ADD COLUMN messages_reset_at TIMESTAMPTZ DEFAULT NOW();

-- Create subscription events table
CREATE TABLE subscription_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES profiles(id),
  event_type TEXT NOT NULL,
  dodo_subscription_id TEXT,
  dodo_event_id TEXT,
  amount INTEGER,
  currency TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE subscription_events ENABLE ROW LEVEL SECURITY;

-- RLS policy: users can only see their own events
CREATE POLICY "Users can view own subscription events" ON subscription_events
  FOR SELECT USING (profile_id IN (
    SELECT id FROM profiles WHERE user_id = auth.uid()::text
  ));

-- Index for lookups
CREATE INDEX idx_subscription_events_profile ON subscription_events(profile_id);
CREATE INDEX idx_profiles_subscription_status ON profiles(subscription_status);
```

---

## 3. Dodo Payments Integration

### Environment Variables

```env
# Dodo Payments
DODO_PAYMENTS_API_KEY=your_api_key_here
DODO_PAYMENTS_WEBHOOK_SECRET=your_webhook_secret_here
DODO_PAYMENTS_ENVIRONMENT=test_mode  # or live_mode

# Product IDs (create in Dodo Dashboard)
DODO_PRODUCT_PRO_MONTHLY=prod_xxxxx
DODO_PRODUCT_PRO_YEARLY=prod_xxxxx
```

### Getting Dodo Credentials

1. Go to https://dashboard.dodopayments.com
2. Sign up / Log in
3. **Create Products:**
   - Go to Products > Create Product
   - Name: "Verified.Doctor Pro Monthly"
   - Type: Subscription
   - Price: $4.99 USD
   - Interval: Monthly
   - Create another for Yearly ($39.99)
4. **Get API Key:**
   - Go to Developer > API
   - Copy API Key
5. **Set up Webhook:**
   - Go to Developer > Webhooks
   - Add endpoint: `https://verified.doctor/api/webhooks/dodo`
   - Select events: All subscription events
   - Copy Webhook Secret
6. **Enable Adaptive Currency:**
   - Go to Business > Settings
   - Toggle "Adaptive Pricing" ON

### API Routes to Create

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/subscription/checkout` | POST | Create checkout session, return URL |
| `/api/subscription/status` | GET | Get current subscription status |
| `/api/subscription/cancel` | POST | Cancel subscription at period end |
| `/api/subscription/portal` | POST | Get customer portal URL |
| `/api/webhooks/dodo` | POST | Handle Dodo webhook events |

---

## 4. Code Implementation

### New Files to Create

```
src/
├── lib/
│   ├── dodo/
│   │   ├── client.ts          # Dodo API client
│   │   ├── products.ts        # Product IDs config
│   │   └── webhook.ts         # Webhook verification
│   └── subscription/
│       ├── check-access.ts    # Check if user has Pro
│       ├── gates.ts           # Feature gate definitions
│       └── usage.ts           # Usage tracking
├── app/api/
│   ├── subscription/
│   │   ├── checkout/route.ts  # Create checkout
│   │   ├── status/route.ts    # Get status
│   │   ├── cancel/route.ts    # Cancel
│   │   └── portal/route.ts    # Customer portal
│   └── webhooks/
│       └── dodo/route.ts      # Webhook handler
├── components/
│   └── subscription/
│       ├── upgrade-modal.tsx  # "Upgrade to Pro" modal
│       ├── pro-badge.tsx      # Pro badge indicator
│       └── feature-gate.tsx   # Gate wrapper component
```

### Feature Gate Helper

```typescript
// lib/subscription/check-access.ts
export type ProFeature =
  | 'premium_templates'
  | 'premium_themes'
  | 'video_intro'
  | 'case_studies'
  | 'media_publications'
  | 'clinic_gallery'
  | 'unlimited_connections'
  | 'unlimited_messages'
  | 'advanced_analytics'
  | 'custom_qr'
  | 'unlimited_ai';

export async function hasProAccess(profileId: string): Promise<boolean> {
  const profile = await getProfile(profileId);
  return profile.subscription_status === 'pro' &&
         profile.subscription_expires_at > new Date();
}

export async function canUseFeature(profileId: string, feature: ProFeature): Promise<boolean> {
  const isPro = await hasProAccess(profileId);
  if (isPro) return true;

  // Check free tier limits
  switch (feature) {
    case 'unlimited_connections':
      const connections = await getConnectionCount(profileId);
      return connections < 20;
    case 'unlimited_messages':
      const messages = await getMonthlyMessageCount(profileId);
      return messages < 50;
    case 'unlimited_ai':
      const aiUsage = await getAIUsageThisMonth(profileId);
      return aiUsage < 3;
    default:
      return false;  // Premium features not available on free
  }
}
```

---

## 5. UI Changes

### Upgrade Page Redesign

The current upgrade page has a region selector. **Remove it.** Dodo handles currency automatically.

New flow:
1. User clicks "Upgrade to Pro"
2. Show plan selection (Monthly/Yearly)
3. Click "Subscribe" → Create checkout session → Redirect to Dodo
4. Dodo shows price in user's currency
5. User completes payment
6. Redirect back → Webhook updates DB → User is Pro

### Feature Gates in UI

```tsx
// components/subscription/feature-gate.tsx
export function FeatureGate({
  feature,
  children,
  fallback
}: {
  feature: ProFeature;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  const { isPro } = useSubscription();

  if (isPro) return children;

  return fallback || (
    <div className="relative">
      <div className="opacity-50 pointer-events-none">{children}</div>
      <div className="absolute inset-0 flex items-center justify-center">
        <UpgradeButton feature={feature} />
      </div>
    </div>
  );
}
```

### Places to Add Gates

1. **Profile Builder** - Template selector (gate premium templates)
2. **Profile Builder** - Theme selector (gate premium themes)
3. **Profile Builder** - Section toggles (gate premium sections)
4. **Analytics** - Date range picker (gate custom ranges)
5. **Analytics** - Referrer table (gate with blur)
6. **QR Designer** - Color picker (gate with lock icon)
7. **Dashboard** - Show Pro badge if subscribed

---

## 6. Testing Guide

### Test Mode Setup

1. Use `DODO_PAYMENTS_ENVIRONMENT=test_mode`
2. Use test API key from Dodo Dashboard
3. Test card numbers (from Dodo docs):
   - Success: `4242 4242 4242 4242`
   - Decline: `4000 0000 0000 0002`

### Test Scenarios

| Scenario | Steps | Expected |
|----------|-------|----------|
| Subscribe Monthly | Click upgrade → Select monthly → Complete payment | User becomes Pro, webhook fires |
| Subscribe Yearly | Click upgrade → Select yearly → Complete payment | User becomes Pro, yearly plan |
| Cancel | Go to settings → Cancel subscription | Status = cancelled, access until period end |
| Renewal | Wait for subscription to renew (use test mode fast forward) | Webhook fires, access continues |
| Payment Failed | Use decline card | On-hold status, email sent |
| Upgrade Plan | Go from monthly to yearly | Proration handled |

### Webhook Testing

Use Dodo's webhook testing tool or:
```bash
curl -X POST http://localhost:3000/api/webhooks/dodo \
  -H "Content-Type: application/json" \
  -H "webhook-id: test" \
  -H "webhook-timestamp: $(date +%s)" \
  -H "webhook-signature: test" \
  -d '{"type":"subscription.active","data":{"subscription_id":"sub_123"}}'
```

---

## 7. Launch Checklist

### Before Launch

- [ ] Create products in Dodo Dashboard (Monthly & Yearly)
- [ ] Set up webhook endpoint in Dodo
- [ ] Enable Adaptive Currency
- [ ] Run database migration
- [ ] Deploy webhook handler
- [ ] Test complete flow in test mode
- [ ] Test all feature gates
- [ ] Update upgrade page UI
- [ ] Add Pro badge to dashboard

### Launch Day

- [ ] Switch to `live_mode`
- [ ] Update product IDs to production
- [ ] Verify webhook is receiving events
- [ ] Monitor first few subscriptions
- [ ] Have rollback plan ready

### Post-Launch

- [ ] Monitor conversion rates
- [ ] Track churn
- [ ] Gather feedback on Pro features
- [ ] Iterate on feature gates

---

## File Index

| File | Purpose |
|------|---------|
| `00-MASTER-PLAN.md` | This document |
| `01-dodo-integration-guide.md` | Dodo Payments API reference |
| `02-dodo-subscriptions.md` | Subscription management guide |
| `03-dodo-webhooks.md` | Webhook events reference |
| `04-feature-gates.md` | Feature gate implementation |
| `05-database-schema.md` | Database changes |
| `06-testing-guide.md` | Testing procedures |

---

## Quick Start

1. **Get Dodo credentials** (see Section 3)
2. **Run database migration** (see Section 2)
3. **Add env variables** to `.env.local`
4. **Create API routes** (see Section 4)
5. **Update upgrade page** (see Section 5)
6. **Test in test mode** (see Section 6)
7. **Launch!**
