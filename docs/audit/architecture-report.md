# Architecture & Performance Analysis Report

**Date:** January 4, 2026
**Codebase:** Verified.Doctor
**Version:** 0.1.0

---

## Executive Summary

The Verified.Doctor codebase demonstrates solid foundational architecture with several well-implemented patterns including React cache for request deduplication, proper Supabase client separation, and thoughtful rate limiting. However, as the platform scales to 10,000+ doctors, several architectural decisions need attention:

**Strengths:**
- Excellent use of React `cache()` for request deduplication
- Well-structured API routes with Zod validation
- Proper separation of browser and server Supabase clients
- Comprehensive rate limiting implementation
- Good Next.js configuration for caching and image optimization

**Critical Areas Needing Attention:**
- Missing database indexes on frequently queried columns
- Analytics events table will grow unbounded without partitioning
- N+1 query patterns in several API routes
- Large component bundle (Recharts) loaded synchronously
- Counter increment operations vulnerable to race conditions

---

## Database Analysis

### Schema Review

The database schema (`src/types/database.ts`) shows a well-designed PostgreSQL structure with 15 tables covering core functionality. Key observations:

**Positive Aspects:**
- UUID primary keys consistently used
- Proper foreign key relationships defined
- Timestamps included for auditing
- Separate tables for analytics (events, daily stats)

**Schema Concerns:**

1. **Profiles Table (46 columns)**: The profiles table has grown quite large with many nullable columns. Consider:
   - Separating extended profile data into a `profile_details` table
   - Moving JSON columns (`education_timeline`, `hospital_affiliations`, etc.) to separate related tables for better queryability

2. **Analytics Events Table**: This table will grow indefinitely with every page view:
   ```
   analytics_events: profile_view, visitor_ip, created_at, etc.
   ```
   At 10,000 doctors with 100 daily views each = 1 million rows/day.

3. **Denormalized Counters**: `recommendation_count`, `connection_count`, `view_count` in profiles are vulnerable to race conditions even with RPC functions.

### Missing Indexes

Based on query patterns observed in the codebase, the following indexes are likely missing:

| Table | Column(s) | Query Pattern | Priority |
|-------|-----------|---------------|----------|
| `profiles` | `handle` | `eq("handle", handle)` - lookup by vanity URL | **CRITICAL** |
| `profiles` | `user_id` | `eq("user_id", userId)` - dashboard auth | **CRITICAL** |
| `profiles` | `verification_status` | Admin filtering pending verifications | HIGH |
| `messages` | `(profile_id, is_read)` | Dashboard unread count | HIGH |
| `messages` | `(profile_id, deleted_at)` | Message list query | HIGH |
| `connections` | `(requester_id, status)` | Connection queries | HIGH |
| `connections` | `(receiver_id, status)` | Pending connection requests | HIGH |
| `analytics_events` | `(profile_id, event_type, created_at)` | Dashboard analytics | HIGH |
| `analytics_daily_stats` | `(profile_id, date)` | Analytics range queries | HIGH |
| `recommendations` | `(profile_id, fingerprint)` | Duplicate check | MEDIUM |
| `recommendations` | `(profile_id, ip_address, created_at)` | Rate limit check | MEDIUM |
| `invites` | `invite_code` | Invite validation | MEDIUM |

**Recommended Migration:**
```sql
-- Critical indexes
CREATE INDEX CONCURRENTLY idx_profiles_handle ON profiles(handle);
CREATE INDEX CONCURRENTLY idx_profiles_user_id ON profiles(user_id);

-- High priority indexes
CREATE INDEX CONCURRENTLY idx_profiles_verification_status ON profiles(verification_status) WHERE verification_status = 'pending';
CREATE INDEX CONCURRENTLY idx_messages_profile_unread ON messages(profile_id, is_read) WHERE deleted_at IS NULL;
CREATE INDEX CONCURRENTLY idx_connections_requester_status ON connections(requester_id, status);
CREATE INDEX CONCURRENTLY idx_connections_receiver_status ON connections(receiver_id, status);
CREATE INDEX CONCURRENTLY idx_analytics_events_profile_type_date ON analytics_events(profile_id, event_type, created_at DESC);
CREATE INDEX CONCURRENTLY idx_analytics_daily_stats_profile_date ON analytics_daily_stats(profile_id, date DESC);
```

### Query Optimization

**N+1 Patterns Identified:**

1. **Admin Verifications Route** (`/api/admin/verifications/route.ts` lines 43-54):
   ```typescript
   // Generates N signed URLs sequentially
   const documentsWithUrls = await Promise.all(
     (documents || []).map(async (doc) => {
       const { data: signedUrlData } = await adminSupabase.storage
         .from("verification-docs")
         .createSignedUrl(doc.document_url, 3600);
       // ...
     })
   );
   ```
   **Impact:** Each pending verification with 3 documents = 3 API calls to storage.
   **Fix:** Batch sign URLs using Supabase's batch capabilities or cache signed URLs.

2. **Analytics Dashboard Route** (`/api/analytics/dashboard/route.ts`):
   Makes 3 sequential database queries that could be parallelized:
   - Daily stats query
   - Previous stats query
   - Referrer data query

   **Fix:** Use `Promise.all()` to parallelize independent queries.

3. **Connections GET Route** (`/api/connections/route.ts`):
   Makes 2 separate queries (accepted connections + pending requests) that could be combined.

**Inefficient Query Patterns:**

1. **Profile Page** (`/[handle]/page.tsx` lines 301-325):
   ```typescript
   // Two separate queries that could be one
   const { data: connections } = await supabase
     .from("connections")
     .select(...)

   const { data: inviteData } = await supabase
     .from("invites")
     .select(...)
   ```
   **Fix:** Parallelize with `Promise.all()` or consider a combined view.

2. **Dashboard Layout** (`/dashboard/layout.tsx` lines 31-42):
   ```typescript
   // Good: Already parallelized
   const [unreadResult, pendingResult] = await Promise.all([...]);
   ```
   This is a good pattern to follow elsewhere.

---

## API Architecture

### RESTful Design Consistency

**Positive Patterns:**
- Consistent use of Zod for request validation
- Standard error response format: `{ error: string, code?: string }`
- Proper HTTP status codes (401, 403, 404, 429, 500)
- Rate limiting applied to public endpoints

**Inconsistencies Found:**

1. **Mixed Response Formats:**
   ```typescript
   // Some routes return data directly
   return NextResponse.json({ profile });

   // Others wrap in success flag
   return NextResponse.json({ success: true, profile });
   ```
   **Recommendation:** Standardize on a consistent envelope format.

2. **Route Naming:**
   - `/api/recommend` (verb) vs `/api/messages` (noun)
   - `/api/check-handle` vs `/api/profiles`

   **Recommendation:** Use consistent resource-based naming.

### API Security

**Strong Points:**
- Rate limiting on all public endpoints (check-handle, recommend, messages)
- Admin routes protected by session verification
- Profile ownership verification before updates

**Concerns:**

1. **SQL Injection Risk** (`/api/connections/route.ts` line 46):
   ```typescript
   .or(`requester_id.eq."${profile.id}",receiver_id.eq."${profile.id}"`)
   ```
   While `profile.id` comes from an authenticated source, string interpolation in queries is risky.
   **Fix:** Use parameterized queries or separate queries.

2. **Missing Rate Limiting:**
   - `/api/profiles/[id]` PATCH endpoint (profile updates)
   - `/api/analytics/track` endpoint

---

## Component Architecture

### Component Organization

The component structure is well-organized:
```
components/
├── ui/           # shadcn/ui primitives (19 files)
├── dashboard/    # Dashboard-specific (13 files)
├── profile/      # Public profile (templates, sections)
├── analytics/    # Charts and analytics
├── landing/      # Landing page sections
├── admin/        # Admin panel
└── layout/       # Shared layout components
```

**Positive Aspects:**
- Clear separation between UI primitives and feature components
- Profile templates isolated in their own directory
- Section components properly modularized

### Props Drilling Issues

**Identified in Profile Templates:**

The `ClassicTemplate` component (719 lines) receives a large `profile` object with 30+ properties that are passed down to 12 different section components.

```typescript
interface Profile {
  // 30+ properties...
}

<EducationTimeline items={profile.education_timeline} themeColors={themeColors} />
<HospitalAffiliations items={profile.hospital_affiliations} themeColors={themeColors} />
// ...10 more section components
```

**Recommendation:** Consider a Context provider for theme and profile data to reduce prop drilling:
```typescript
// ProfileContext.tsx
export const ProfileContext = createContext<ProfileContextValue | null>(null);

// In template:
<ProfileProvider profile={profile} theme={theme}>
  <EducationTimeline />
  <HospitalAffiliations />
</ProfileProvider>
```

### State Management

**Current Approach:**
- Server components for initial data
- Local state in client components (`useState`)
- React `cache()` for request deduplication

**Observations:**
- No global client-side state management (Redux, Zustand, etc.) - appropriate for this app size
- Good use of server components for data fetching
- Form state managed with react-hook-form

**Concern:** The profile builder (`profile-builder.tsx`) likely manages a lot of local state. Consider form persistence to localStorage to prevent data loss on accidental navigation.

### Component Reusability

**Good Examples:**
- `ValidatedInput` component for consistent input styling
- `CopyButton` reused across dashboard
- `ProfileActions` shared across all profile templates

**Improvement Opportunities:**
- The three profile templates (`classic`, `hero`, `timeline`) share significant code. Consider extracting shared sections to reduce duplication.

---

## Data Fetching Patterns

### Server vs Client Components

**Excellent Pattern - Profile Cache:**
```typescript
// src/lib/profile-cache.ts
export const getProfile = cache(async () => {
  const { userId } = await getAuth();
  // ...
});
```
This ensures the profile is fetched only once per request, even if called from multiple components.

**Excellent Pattern - Metadata Deduplication:**
```typescript
// [handle]/page.tsx
const getProfileByHandle = cache(async (handle: string) => {
  // ...
});

// Both page and generateMetadata use the same cached function
export async function generateMetadata({ params }) {
  const profile = await getProfileByHandle(handle);
}

export default async function ProfilePage({ params }) {
  const profile = await getProfileByHandle(handle);
}
```

### Caching Strategies

**Current Configuration:**
```typescript
// [handle]/page.tsx
export const revalidate = 60; // 60 seconds
```

**Issues:**
- Public profiles revalidate every 60 seconds, but the profile might not change for days
- Consider using `revalidatePath()` on profile updates (already done in PATCH route)
- Analytics data could use longer cache times

**Recommendations:**
1. Increase `revalidate` to 3600 (1 hour) for profile pages
2. Use ISR with `revalidatePath()` on updates
3. Add stale-while-revalidate headers for API routes

### Waterfall Requests

**Profile Page Waterfall:**
```typescript
// Sequential operations that could be parallel:
1. getProfileByHandle(handle)           // Cached
2. supabase.rpc("increment_view_count") // Fire and forget
3. supabase.from("connections").select  // Could be parallel
4. supabase.from("invites").select      // Could be parallel
```

**Fix:**
```typescript
const [connections, inviteData] = await Promise.all([
  supabase.from("connections").select(...),
  supabase.from("invites").select(...)
]);
```

---

## Performance Bottlenecks

### Critical

1. **Analytics Events Table Growth**
   - **Impact:** Database performance degrades as table grows
   - **Current:** No partitioning, no cleanup
   - **At Scale:** 30M+ rows/month (10k doctors x 100 views/day x 30 days)
   - **Fix:**
     - Implement table partitioning by date
     - Add automated cleanup job (aggregate to daily_stats, delete events > 30 days)
     - Consider time-series database for events

2. **Counter Race Conditions**
   - **Impact:** Incorrect recommendation/view counts under high concurrency
   - **Current:** RPC functions increment counts
   - **Fix:** Use atomic operations with proper locking:
   ```sql
   UPDATE profiles SET recommendation_count = recommendation_count + 1 WHERE id = $1;
   ```

3. **Missing Critical Indexes**
   - **Impact:** Full table scans on every profile lookup
   - **Fix:** Add indexes on `handle` and `user_id` columns immediately

### High Priority

1. **Recharts Bundle Size**
   - **Current:** Loaded synchronously in analytics components
   - **Impact:** ~40-50KB gzipped added to bundle
   - **Fix:** Dynamic import with loading state:
   ```typescript
   const ViewsChart = dynamic(() =>
     import("@/components/analytics/views-chart"),
     { loading: () => <ChartSkeleton /> }
   );
   ```

2. **Large Profile Objects**
   - **Current:** `select("*")` returns all 46 columns
   - **Impact:** Unnecessary data transfer
   - **Fix:** Select only needed columns:
   ```typescript
   .select("id, handle, full_name, specialty, is_verified, ...")
   ```

3. **Image Optimization**
   - **Current:** QR codes generated on external service
   - **Fix:** Generate QR codes locally and cache:
   ```typescript
   // api/qr/[handle]/route.ts
   export const revalidate = 86400; // Cache for 24 hours
   ```

### Medium Priority

1. **Framer Motion Bundle**
   - **Current:** Full library imported
   - **Fix:** Use `optimizePackageImports` (already configured) and tree-shake unused features

2. **Dashboard Data Refetching**
   - **Current:** Layout and page both fetch some same data
   - **Fix:** Use React cache properly (already done with `getProfile`)

3. **Analytics Aggregation**
   - **Current:** Referrer aggregation done in API route
   - **Fix:** Pre-aggregate in database or use materialized views

---

## Bundle Analysis

### Dependencies Review

**Total Dependencies:** 35 (24 production, 11 dev)

**Large Dependencies:**
| Package | Approx. Size | Usage | Recommendation |
|---------|--------------|-------|----------------|
| `recharts` | ~50KB gzipped | Analytics charts | Dynamic import |
| `framer-motion` | ~30KB gzipped | Animations | Already optimized |
| `date-fns` | ~20KB | Date formatting | Tree-shakeable, OK |
| `react-easy-crop` | ~8KB | Image cropping | Dynamic import |

**Potential Removals:**
- `bcryptjs` - Only used for admin password. Consider moving to edge auth.

**Missing Dev Dependencies:**
- No bundle analyzer configured
- Consider adding `@next/bundle-analyzer` for visibility

### Next.js Configuration

**Current (`next.config.ts`):**
```typescript
experimental: {
  optimizePackageImports: ["lucide-react", "framer-motion", "date-fns"],
},
images: {
  formats: ["image/avif", "image/webp"],
  minimumCacheTTL: 60 * 60 * 24, // 24 hours
},
```

**Good:** Image optimization and package imports optimized.

**Recommendations:**
```typescript
experimental: {
  optimizePackageImports: ["lucide-react", "framer-motion", "date-fns", "recharts"],
},
// Consider enabling PPR when stable:
// ppr: true,
```

---

## Caching Strategy

### Current Implementation

| Resource | Cache Strategy | Duration |
|----------|---------------|----------|
| Profile pages | ISR | 60 seconds |
| Static assets | Immutable | 1 year |
| API responses | None | N/A |

### Recommended Improvements

1. **Profile Pages:**
   ```typescript
   // Increase to 1 hour, rely on revalidatePath() on updates
   export const revalidate = 3600;
   ```

2. **API Route Caching:**
   ```typescript
   // api/analytics/dashboard/route.ts
   export const dynamic = 'force-dynamic';
   export const revalidate = 300; // 5 minutes

   // Add Cache-Control headers
   return NextResponse.json(data, {
     headers: {
       'Cache-Control': 'private, max-age=300, stale-while-revalidate=60'
     }
   });
   ```

3. **Static Data:**
   - Banned handles list could be fetched once and cached
   - Theme configurations are static - ensure no re-computation

---

## Scalability Concerns

### Issues at 10,000+ Doctors

1. **Analytics Events Table**
   - **Problem:** 30M+ events/month
   - **Solution:**
     - Partition by month
     - Aggregate to daily stats via cron job
     - Delete raw events after 30 days
     - Consider ClickHouse or TimescaleDB for analytics

2. **Real-time Features**
   - **Current:** No real-time updates
   - **Future Need:** Message notifications, connection requests
   - **Solution:** Supabase Realtime (already available) or separate WebSocket service

3. **Search/Directory**
   - **Future Need:** Find doctors by specialty/location
   - **Solution:**
     - Add PostgreSQL full-text search indexes
     - Or implement Algolia/Meilisearch

4. **Media Storage**
   - **Current:** Supabase Storage
   - **At Scale:** Consider CDN (Cloudflare R2, CloudFront)
   - **Profile Photos:** ~500KB x 10,000 = 5GB
   - **Verification Docs:** Deleted after 90 days (good)

5. **Rate Limiting**
   - **Current:** Upstash Redis - scales well
   - **Concern:** Single region latency
   - **Solution:** Multi-region Redis or edge-based rate limiting

---

## Recommendations

### Immediate Actions (Week 1)

1. **Add Critical Database Indexes**
   ```sql
   CREATE INDEX CONCURRENTLY idx_profiles_handle ON profiles(handle);
   CREATE INDEX CONCURRENTLY idx_profiles_user_id ON profiles(user_id);
   ```

2. **Fix SQL Interpolation in Connections Route**
   - Replace string interpolation with separate queries or parameterized approach

3. **Parallelize Profile Page Queries**
   - Use `Promise.all()` for connections and invites fetches

### Short-term Actions (Month 1)

4. **Implement Analytics Event Cleanup**
   - Create a scheduled job to aggregate old events
   - Delete events older than 30 days

5. **Add Dynamic Imports for Charts**
   - Lazy load Recharts components
   - Add loading skeletons

6. **Add High-Priority Indexes**
   - Messages, connections, analytics tables

### Medium-term Actions (Month 2-3)

7. **Optimize Profile Queries**
   - Replace `select("*")` with specific columns
   - Create optimized views for common queries

8. **Implement Better Caching**
   - Increase profile revalidation to 1 hour
   - Add API route caching headers

9. **Set Up Monitoring**
   - Add database query logging
   - Track slow queries
   - Monitor bundle size in CI

### Long-term Actions (Month 3-6)

10. **Database Partitioning**
    - Partition analytics_events by date
    - Consider archival strategy

11. **Search Infrastructure**
    - Implement full-text search
    - Add doctor directory functionality

12. **Edge Optimization**
    - Move rate limiting to edge
    - Consider edge rendering for profiles

---

## Appendix: File References

- Database Types: `C:\coding\newverified.doctor\src\types\database.ts`
- Supabase Clients: `C:\coding\newverified.doctor\src\lib\supabase\`
- API Routes: `C:\coding\newverified.doctor\src\app\api\`
- Profile Page: `C:\coding\newverified.doctor\src\app\[handle]\page.tsx`
- Dashboard: `C:\coding\newverified.doctor\src\app\(dashboard)\dashboard\`
- Rate Limiting: `C:\coding\newverified.doctor\src\lib\rate-limit.ts`
- Profile Cache: `C:\coding\newverified.doctor\src\lib\profile-cache.ts`
- Next Config: `C:\coding\newverified.doctor\next.config.ts`
- Package.json: `C:\coding\newverified.doctor\package.json`
