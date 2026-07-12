# DLPP Internal Audit System — Database Setup & Reproducibility

This guide provisions the audit database on a **fresh Supabase project** and loads
sample data. Everything here targets a self-contained project (no dependency on
any other/previous project).

---

## Option 1 — Recommended: clone the live database

The most reliable way to reproduce the exact schema + data is a dump of the live
project (requires the Supabase CLI and the database password):

```bash
# schema only
supabase db dump --db-url "postgresql://postgres.<ref>:<password>@aws-1-<region>.pooler.supabase.com:5432/postgres" -f schema.sql
# data only
supabase db dump --db-url "...same url..." --data-only -f data.sql
```

Then run `schema.sql` and `data.sql` against the new project. (The live project is
in region `ap-southeast-2` and its direct host is IPv6-only, so use the **pooler**
host `aws-1-ap-southeast-2.pooler.supabase.com` for IPv4 access.)

---

## Option 2 — One-shot SQL script (this repo)

1. Open the new project's **SQL Editor**.
2. Paste the entire contents of **`supabase/setup/complete_setup.sql`** and **Run**.
   It builds the whole schema in dependency order (migrations `001`–`013` plus the
   prefixed workflow/governance tables). It is idempotent where possible, so it is
   safe to re-run.
3. Load sample governance data (see **Seed data** below).

> Note: the schema grew through a mixed history (some tables are `audit_`-prefixed,
> some are shared/unprefixed such as `people`, `org_units`, `groups`, `modules`).
> `complete_setup.sql` assembles them in the correct order. If you only need the
> incremental changes made for THIS project, they are migrations **010–013**.

---

## Seed data

Base reference data (divisions, legal instruments, risk register, risk events,
PSAP standards, rating scales, modules, groups, permissions) is created/seeded by
the setup script.

Sample **governance** data (KRA, PSAP assessments, Risk Profiles) + `org_units` +
`people` is loaded by an idempotent script that reads credentials from
`.env.local` (never hardcoded):

```bash
bun scripts/seed-governance.ts
```

It seeds: `org_units` (mirrored from `audit_divisions`), 3 `people` officers,
2 KRAs + 6 activities + a quarterly-status trend, 3 PSAP assessments (0–100 scored)
+ 60 scores, and 2 risk profiles + 10 items.

---

## Environment variables (`.env.local`)

```
NEXT_PUBLIC_SUPABASE_URL=https://<ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon key>
SUPABASE_SERVICE_ROLE_KEY=<service role key>   # server-only; never exposed to the browser
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

---

## Critical schema facts / gotchas (discovered & encoded)

These matter when inserting data or extending the app:

- **RLS model (dev):** tables use permissive policies for BOTH `anon` and
  `authenticated`. The app signs users in with real Supabase auth, so it runs as
  `authenticated` — every table the app reads must have an `authenticated` policy
  (migrations `011` and `013` backfill these for RBAC + governance tables).
- **`org_units` is required** by the KRA/PSAP/Risk-Profile hooks (they embed
  `org_units(name, code)`); migration `012` creates it + the `org_unit_id` FKs.
- **CHECK constraints** to respect:
  - `audit_risk_profiles.overall_level` ∈ `Low | Moderate | High | Extreme`
  - `audit_risk_profile_items.status` ∈ `Open | Closed` (only)
  - `audit_risk_profile_items.context_category` ∈ `External Environment |
    Compliance | Organisational Culture | Business Processes |
    Education & Skills / People`
  - `audit_risk_profile_items.resource_category` ∈ `Human Resources |
    Financial Resources | Information Resources | Infrastructure & Physical Assets`
- **PSAP scoring:** `audit_psap_rating_scales` are on a **0–100** scale
  (`<60 Poor`, `60–74 Fair`, `75–89 Good`, `90+ Excellent`). Store
  `audit_psap_assessments.overall_score` as a 0–100 percentage so the rating maps
  correctly.
- **FKs used by embeds:** `audit_psap_assessments.completed_by` and
  `audit_risk_profiles.prepared_by` reference `people(id)` — seed `people` first.

---

## Migration inventory

| File | Creates / does |
|------|----------------|
| `001_initial_schema.sql` | base shared tables (`people`, org structure, …) |
| `002_rls_policies.sql` | RLS for base tables |
| `003_risk_governance_modules.sql` | legacy (unprefixed) governance tables |
| `004_risk_register_integration.sql` | `audit_divisions`, `audit_sections`, `audit_risk_register` + risk sub-tables |
| `005_central_risk_event_repository.sql` | `audit_risk_events`, `audit_categories` + subs |
| `006_rbac_system.sql` | `groups`, `modules`, `group_module_permissions`, `user_groups`, `audit_users`, `audit_log` (+ module seed) |
| `007_auditor_profiles.sql` | `audit_auditor_profiles` + certification/specialization lookups |
| `008_shared_auth_integration.sql` | shared-auth helpers |
| `009_fieldwork_workpapers.sql` | `audit_workpapers` + evidence + storage bucket |
| `audit_system_with_prefixes.sql` | prefixed workflow + **governance** tables (engagements, findings, recommendations, PSAP, KRA, risk profiles) |
| `010_create_audit_users_and_user_groups.sql` | reconcile `audit_users` / `user_groups` + drop stale FK |
| `011_auditor_profiles_and_rls_hardening.sql` | auditor tables + `authenticated` RLS on RBAC tables |
| `012_org_units_self_contained.sql` | `org_units` + `org_unit_id` FKs for governance embeds |
| `013_governance_rls_policies.sql` | permissive RLS on the 9 governance tables |
