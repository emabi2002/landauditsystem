# Lands Audit System - Central Risk Event Repository

## Current Status: RLS Fix Required for Heat Map Data

### The Golden Rule
**All audit activities must originate from a Risk Event, which must be anchored to the Risk Register.**

### Traceability Chain (Non-Negotiable)
```
Risk Register → Risk Event → Audit Engagement → Tasks → Findings → Closure
```

---

## IMMEDIATE ACTION REQUIRED

### Fix Risk Register Heat Map (Showing Zeros)

The data exists in the database (22 risks, 10 divisions), but Row Level Security (RLS) policies are blocking anonymous read access. The UI is running unauthenticated, so it can't fetch the data.

**To fix this, run this SQL in your Supabase SQL Editor:**

1. Go to https://supabase.com/dashboard
2. Select your project
3. Click **SQL Editor** in the left sidebar
4. Click **New Query**
5. Paste the contents of `supabase/fix_rls_for_dev.sql`
6. Click **Run**

Or copy this quick fix:

```sql
-- Add anonymous read policies for development
DROP POLICY IF EXISTS audit_risk_register_anon_read ON audit_risk_register;
CREATE POLICY audit_risk_register_anon_read ON audit_risk_register
  FOR SELECT TO anon USING (true);

DROP POLICY IF EXISTS audit_divisions_anon_read ON audit_divisions;
CREATE POLICY audit_divisions_anon_read ON audit_divisions
  FOR SELECT TO anon USING (true);

DROP POLICY IF EXISTS audit_categories_anon_read ON audit_categories;
CREATE POLICY audit_categories_anon_read ON audit_categories
  FOR SELECT TO anon USING (true);

DROP POLICY IF EXISTS audit_risk_events_anon_read ON audit_risk_events;
CREATE POLICY audit_risk_events_anon_read ON audit_risk_events
  FOR SELECT TO anon USING (true);
```

After running, refresh the Risk Register page - the heat map will show real data!

---

## Implementation Progress

### ✅ Completed (Version 16+)

#### Core Infrastructure
- [x] Database schema with `audit_` prefix on all tables
- [x] Migration 004: Risk Register as authoritative spine
- [x] Migration 005: Central Risk Event Repository
- [x] 20+ DLPP system risks seeded with legal references
- [x] 10 DLPP divisions seeded
- [x] 7 audit categories seeded

#### Risk Register UI
- [x] Risk Register page with heat map visualization
- [x] Stats cards (Total, Extreme, High, Medium, Low)
- [x] Filters by category, status, rating, division
- [x] Risk table with view/edit actions
- [x] Export to CSV functionality
- [x] CreateRiskDialog with legal reference requirement
- [x] RiskDetailSheet for detailed view

#### Risk Events UI
- [x] Risk Events page with tabs (All, Pending, Secretary, By Source)
- [x] CreateRiskEventDialog with 4-step wizard
- [x] RiskEventDetailSheet for event management
- [x] Stats dashboard (Pending, Under Review, Approved, etc.)
- [x] Priority and source type filtering

#### Dashboard Integration
- [x] PendingRiskEventsWidget for Audit Manager action
- [x] Risk Event Gateway section explaining sources
- [x] Quick stats and links to Risk Events

#### Engagements Integration
- [x] Retrofitted to require Risk Event selection
- [x] Auto-populate title/scope from Risk Event
- [x] Governance notice explaining traceability
- [x] Auto-update Risk Event status on engagement creation

### 🔄 Pending User Action
- [ ] **Apply RLS fix SQL in Supabase** (see instructions above)
- [ ] Test Risk Events creation workflow end-to-end

### 📋 Future Enhancements
- [ ] Add task assignment UI for Risk Events
- [ ] Add milestone tracking UI
- [ ] Add information request management
- [ ] Add document upload for Risk Events
- [ ] Implement user authentication flow
- [ ] Add role-based access control

---

## Key Files Reference

| File | Purpose |
|------|---------|
| `src/app/(dashboard)/risk-register/page.tsx` | Risk Register with heat map |
| `src/app/(dashboard)/risk-events/page.tsx` | Risk Events management |
| `src/app/(dashboard)/engagements/page.tsx` | Engagements (requires Risk Event) |
| `src/app/(dashboard)/dashboard/page.tsx` | Dashboard with widgets |
| `src/lib/hooks/useRiskRegister.ts` | Risk Register CRUD hook |
| `src/lib/hooks/useRiskEvents.ts` | Risk Events CRUD hook |
| `src/components/widgets/PendingRiskEventsWidget.tsx` | Dashboard widget |
| `supabase/fix_rls_for_dev.sql` | RLS fix for anonymous access |
| `supabase/migrations/005_central_risk_event_repository.sql` | Risk Event schema |

---

## GitHub Repository
https://github.com/emabi2002/landauditsystem.git

Last push: Version 16 - Full Risk Event Integration
