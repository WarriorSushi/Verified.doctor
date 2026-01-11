# Dodo Payments Integration Guide

## Overview

Dodo Payments is our payment provider for Pro subscriptions. It handles:
- Payment collection (cards, UPI, local methods)
- Subscription management (renewals, cancellations)
- Global tax compliance (Merchant of Record)
- Currency conversion (Adaptive Currency)

---

## Setup Instructions

### Step 1: Create Dodo Account

1. Go to https://dodopayments.com
2. Click "Get Started"
3. Complete business verification

### Step 2: Create Subscription Products

In Dodo Dashboard:

1. Go to **Products** > **Create Product**
2. Create "Pro Monthly":
   - Name: `Verified.Doctor Pro Monthly`
   - Description: `Monthly Pro subscription for Verified.Doctor`
   - Type: **Subscription**
   - Price: `$4.99 USD`
   - Billing Interval: `Every 1 month`
   - Trial Period: `0 days` (no trial)
3. Create "Pro Yearly":
   - Name: `Verified.Doctor Pro Yearly`
   - Description: `Annual Pro subscription for Verified.Doctor`
   - Type: **Subscription**
   - Price: `$39.99 USD`
   - Billing Interval: `Every 1 year`
   - Trial Period: `0 days`
4. Note the Product IDs (e.g., `prod_abc123`)

### Step 3: Get API Credentials

1. Go to **Developer** > **API**
2. Copy your **API Key**
3. For test mode, use the test API key

### Step 4: Configure Webhook

1. Go to **Developer** > **Webhooks**
2. Click **Add Endpoint**
3. Enter URL: `https://verified.doctor/api/webhooks/dodo`
4. Select events:
   - `subscription.created`
   - `subscription.active`
   - `subscription.renewed`
   - `subscription.on_hold`
   - `subscription.cancelled`
   - `subscription.expired`
   - `subscription.plan_changed`
5. Copy the **Webhook Secret**

### Step 5: Enable Adaptive Currency

1. Go to **Business** > **Business Settings**
2. Toggle **Adaptive Pricing** to ON
3. Save

---

## Environment Variables

```env
# .env.local

# Dodo Payments API
DODO_PAYMENTS_API_KEY=dodo_sk_test_xxxxx
DODO_PAYMENTS_WEBHOOK_SECRET=whsec_xxxxx

# Environment: 'test_mode' or 'live_mode'
DODO_PAYMENTS_ENVIRONMENT=test_mode

# Product IDs from Dodo Dashboard
DODO_PRODUCT_PRO_MONTHLY=prod_xxxxx
DODO_PRODUCT_PRO_YEARLY=prod_xxxxx

# Base URL for redirects
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## SDK Installation

```bash
pnpm add dodopayments standardwebhooks
```

---

## API Client Setup

```typescript
// src/lib/dodo/client.ts
import DodoPayments from 'dodopayments';

const environment = process.env.DODO_PAYMENTS_ENVIRONMENT === 'live_mode'
  ? 'live_mode'
  : 'test_mode';

export const dodo = new DodoPayments({
  bearerToken: process.env.DODO_PAYMENTS_API_KEY!,
  environment,
});

export const PRODUCTS = {
  PRO_MONTHLY: process.env.DODO_PRODUCT_PRO_MONTHLY!,
  PRO_YEARLY: process.env.DODO_PRODUCT_PRO_YEARLY!,
};
```

---

## Creating Checkout Sessions

```typescript
// src/app/api/subscription/checkout/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { dodo, PRODUCTS } from '@/lib/dodo/client';
import { getProfileByUserId } from '@/lib/supabase/queries';

export async function POST(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { plan } = await request.json(); // 'monthly' or 'yearly'
  const profile = await getProfileByUserId(userId);

  const productId = plan === 'yearly'
    ? PRODUCTS.PRO_YEARLY
    : PRODUCTS.PRO_MONTHLY;

  const session = await dodo.checkoutSessions.create({
    product_cart: [{ product_id: productId, quantity: 1 }],
    customer: {
      email: profile.email, // Get from Clerk
      name: profile.full_name,
    },
    metadata: {
      profile_id: profile.id,
      user_id: userId,
    },
    return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?upgraded=true`,
  });

  return NextResponse.json({ checkoutUrl: session.checkout_url });
}
```

---

## Webhook Handler

```typescript
// src/app/api/webhooks/dodo/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { Webhook } from 'standardwebhooks';
import { createClient } from '@/lib/supabase/server';

const webhook = new Webhook(process.env.DODO_PAYMENTS_WEBHOOK_SECRET!);

export async function POST(request: NextRequest) {
  const rawBody = await request.text();

  const headers = {
    'webhook-id': request.headers.get('webhook-id') || '',
    'webhook-signature': request.headers.get('webhook-signature') || '',
    'webhook-timestamp': request.headers.get('webhook-timestamp') || '',
  };

  try {
    await webhook.verify(rawBody, headers);
  } catch (err) {
    console.error('Webhook verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  const event = JSON.parse(rawBody);
  const supabase = createClient();

  switch (event.type) {
    case 'subscription.active':
    case 'subscription.renewed':
      await handleSubscriptionActive(supabase, event.data);
      break;

    case 'subscription.cancelled':
      await handleSubscriptionCancelled(supabase, event.data);
      break;

    case 'subscription.expired':
      await handleSubscriptionExpired(supabase, event.data);
      break;

    case 'subscription.on_hold':
      await handleSubscriptionOnHold(supabase, event.data);
      break;
  }

  // Log the event
  await supabase.from('subscription_events').insert({
    profile_id: event.data.metadata?.profile_id,
    event_type: event.type,
    dodo_subscription_id: event.data.subscription_id,
    dodo_event_id: event.id,
    amount: event.data.amount,
    currency: event.data.currency,
    metadata: event.data,
  });

  return NextResponse.json({ received: true });
}

async function handleSubscriptionActive(supabase: any, data: any) {
  const profileId = data.metadata?.profile_id;
  if (!profileId) return;

  await supabase.from('profiles').update({
    subscription_status: 'pro',
    subscription_id: data.subscription_id,
    subscription_plan: data.product_id.includes('yearly') ? 'yearly' : 'monthly',
    subscription_started_at: new Date().toISOString(),
    subscription_expires_at: data.next_billing_date,
  }).eq('id', profileId);
}

async function handleSubscriptionCancelled(supabase: any, data: any) {
  const profileId = data.metadata?.profile_id;
  if (!profileId) return;

  await supabase.from('profiles').update({
    subscription_status: 'cancelled',
    subscription_cancelled_at: new Date().toISOString(),
    // Keep expires_at - they have access until then
  }).eq('id', profileId);
}

async function handleSubscriptionExpired(supabase: any, data: any) {
  const profileId = data.metadata?.profile_id;
  if (!profileId) return;

  await supabase.from('profiles').update({
    subscription_status: 'free',
    subscription_id: null,
    subscription_plan: null,
  }).eq('id', profileId);
}

async function handleSubscriptionOnHold(supabase: any, data: any) {
  // Payment failed - could send email to user
  // For now, just log it
}
```

---

## Adaptive Currency

Dodo automatically:
1. Detects user's country from IP/billing address
2. Converts your USD price to local currency
3. Shows local payment methods (UPI in India, etc.)
4. Handles currency conversion fees (paid by customer)

**No code changes needed** - just enable in Dashboard.

Example conversions (approximate):
- USA: $4.99/month
- India: ₹420/month
- UK: £4/month
- EU: €4.50/month

---

## Test Mode

### Test Cards

| Card | Result |
|------|--------|
| `4242 4242 4242 4242` | Success |
| `4000 0000 0000 0002` | Decline |
| `4000 0000 0000 9995` | Insufficient funds |

### Testing Webhooks

1. Use `test_mode` environment
2. Create a test subscription
3. Check webhook delivery in Dodo Dashboard
4. Or use Dodo's webhook testing tool

---

## Production Checklist

- [ ] Switch `DODO_PAYMENTS_ENVIRONMENT` to `live_mode`
- [ ] Use production API key
- [ ] Update webhook URL to production domain
- [ ] Verify webhook is receiving events
- [ ] Test with real card (small amount)
