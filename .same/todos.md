# Help & Training Centre — Build Plan

Goal: Comprehensive, data-driven Interactive Help & Training Centre for DLPP Audit System.

## Dependencies
- [x] Install react-joyride (2.9.3) + radix (tooltip, popover, accordion, scroll-area)
- [x] Add UI primitives: tooltip, popover, accordion, scroll-area
- [x] Fix react-joyride ESM interop (alias to CJS build in next.config.js)

## Data layer (`src/help/help-content.ts`)
- [x] Types (HelpArticle, FAQ, Role, Tour, Tooltip)
- [x] 19 full help articles
- [x] Route → article map + getArticleForRoute()
- [x] Contextual tooltips map
- [x] 14 guided tour definitions (+ new-user tour)
- [x] Roles + Quick Start content
- [x] searchArticles() helper

## Components (`src/components/help/`)
- [x] HelpProvider (context: drawer, favourites, recents, feedback, tour)
- [x] HelpButton (floating + icon)
- [x] HelpDrawer (route-aware)
- [x] HelpArticleView (shared renderer + print/PDF/feedback)
- [x] HelpCentre (searchable centre)
- [x] HelpTooltip (? icons)
- [x] GuidedTour (React Joyride)
- [x] HelpSearch (instant results)
- [x] RelatedTopics
- [x] HelpBreadcrumb
- [x] icon-map + print helpers

## Pages & integration
- [x] /help page
- [x] HelpProvider + HelpButton + HelpDrawer + GuidedTour in AppLayout
- [x] Help & Support group in Sidebar + Help icon in TopHeader
- [x] data-tour hooks (sidebar, page-header, page-actions, notifications, user-menu, global-search, help-button)
- [x] Contextual tooltips wired into CreateRiskDialog + CreatePSAPAssessmentDialog

## Embed Help into every module (landcasesystem parity)

### Foundation (already done)
- [x] HelpProvider / HelpButton / HelpDrawer / GuidedTour mounted in AppLayout
- [x] Route-aware drawer (getArticleForRoute) + /help Centre
- [x] 19 articles, tours, tooltips map, search in help-content.ts
- [x] Shared chrome data-tour hooks (sidebar, search, notifications, user-menu, help-button, page-header, page-actions)

### Remaining work
- [x] Revert `src/app/page.tsx` to redirect to `/dashboard`
- [x] Define canonical `data-tour` convention (filters, table, tabs, kpi-cards, charts, governance-widgets)
- [x] Update guided tours in help-content.ts to target REAL controls (not body center)
- [x] Expand HELP_TOOLTIPS with any missing field keys
- [x] Add data-tour hooks + HelpTooltip icons to module pages:
  - [x] dashboard, engagements, fieldwork
  - [x] findings, recommendations, action-plans
  - [x] compliance, risk-register, risk-profiles, risk-events
  - [x] psap-scorecard, kra-workplan, reports
  - [x] admin (hub + users + groups + divisions + modules + auditors)
- [x] Verify: tsc clean (0 errors), dev server up, all routes serve 200
- [x] Version the project (v4–v8)

## Fieldwork module (real build) — DONE
- [x] Migration `supabase/migrations/009_fieldwork_workpapers.sql` (audit_workpapers + audit_workpaper_evidence + RLS anon/auth + private storage bucket `workpaper-evidence`)
- [x] Types: added audit_workpapers + audit_workpaper_evidence to database.types.ts
- [x] Hook: `useWorkpapers.ts` (CRUD + evidence upload/list/signed-url/delete; degrades to empty if table missing)
- [x] Dialog: `CreateWorkpaperDialog.tsx` (create/edit; tooltips test-objective, procedure-performed, sample-population, conclusion, evidence-upload; queued + immediate evidence uploads)
- [x] Page: rewrote `fieldwork/page.tsx` (stats, filters+search+status data-tour="filters" with fieldwork-search/fieldwork-filter, table data-tour="table" with fieldwork-table, New Workpaper fieldwork-new, edit/delete)
- [x] tsc 0 errors; /fieldwork serves 200

## Fieldwork wired to REAL Supabase (creds provided) — DONE
- [x] .env.local set to real project (yvnkyjnwvylrweyzvibs) + anon + service role
- [x] Discovered existing audit_workpapers has minimal schema (title, procedure, sample_ref, metadata jsonb, created_by); anon can SELECT-return-empty (RLS) and cannot INSERT
- [x] Adapted: rich fields + evidence[] stored in metadata jsonb; procedure/sample_ref real columns
- [x] Server API routes (service role, secure): GET/POST/PUT/DELETE /api/workpapers, POST/GET/DELETE /api/workpapers/evidence (multipart upload + signed URL)
- [x] useWorkpapers rewritten to read+write via API (same public interface; dialog/page unchanged)
- [x] Created private storage bucket `workpaper-evidence` via service role
- [x] database.types.ts audit_workpapers updated to real columns; migration 009 rewritten to match
- [x] E2E verified: list→create→list→upload evidence→list evidence→delete (all 200, cleaned up)
- [x] tsc 0 errors

### Preview overlay investigation (RESOLVED)
- [x] Root cause: transient dev-mode HMR artifact (ChunkLoadError / "missing )") on version-reload; each error has a different webpack build id
- [x] Proved NOT a code bug: node --check on served (dashboard)/layout.js = valid complete JS
- [x] Proved NOT a proxy/parens issue: chunk serves 200 (6.4MB) through preview proxy (raw + encoded parens)
- [x] Self-heals on a normal browser refresh; avoid rapid server-restart + re-version churn

### ChunkLoadError on HelpDrawer (RESOLVED — permanent fix)
- [x] Recurred: `ChunkLoadError` loading `_..._help_HelpDrawer_tsx` at AppLayout dynamic import (corrupt .next dev chunk = "missing )")
- [x] Consolidated HelpDrawer + GuidedTour into ONE client component `HelpOverlays.tsx`; AppLayout now has a single dynamic(ssr:false) boundary instead of two
- [x] Cleared .next + restarted dev server (fresh chunks)
- [x] Verified: HelpOverlays chunk valid on disk AND over HTTP (node --check pass, 200, properly terminated `}]);`); old HelpDrawer_tsx/GuidedTour_tsx dynamic chunks gone; tsc 0 errors; all routes 200

### ChunkLoadError recurred again → TRUE ROOT-CAUSE FIX (static import)
- [x] Still failing in browser: `SyntaxError: missing ) after argument list` in `HelpOverlays_tsx.js:905` → `ChunkLoadError` at AppLayout.tsx:20 (the dynamic() loader)
- [x] Diagnosis: on-disk AND HTTP-served HelpOverlays chunk are BOTH valid (node --check pass, HTTP 200, 1.6MB) → the *current* build is fine; browser was serving a stale/truncated cached chunk from a prior HMR rebuild. The `dynamic(ssr:false)` on-demand chunk itself is the fragile part.
- [x] Confirmed react-joyride@2.9.3 is SSR-safe at import time (node require with window=undefined → OK) and GuidedTour already guards render with a `mounted` state → the `ssr:false` split is unnecessary
- [x] FIX: replaced `next/dynamic(ssr:false)` import of HelpOverlays in AppLayout with a plain STATIC import → help UI now bundles into main-app/layout chunk; ZERO on-demand chunks remain (grep: no `next/dynamic`, no `ssr: false` anywhere)
- [x] Clean rebuild (rm -rf .next + cache, restart dev) → `HelpOverlays_tsx.js` chunk is NO LONGER generated; served /dashboard HTML has 0 references to it; /dashboard + /login = 200; dev log clean; tsc 0 errors
- [x] Also added `experimental.optimizePackageImports` (lucide-react, recharts, radix, date-fns, tanstack-table) to keep dev chunks leaner (minor: ~4% since most are already default-optimized)
- [x] FINAL VERIFICATION (build settled, no restart churn): all routes 200 (/login /dashboard /fieldwork /help /engagements /findings); every served chunk is valid COMPLETE JS (node --check); /login renders real content; /dashboard HTML has 0 error markers (no "missing )", no ChunkLoadError, no "Application error")
- [x] Versions 14/15/16 created (v15/v16 screenshot service failed to capture — platform/preview hiccup, NOT an app error; server confirmed 200 throughout)
- [ ] ACTION FOR USER: HARD-REFRESH the preview once (Cmd/Ctrl+Shift+R) to drop the old cached broken `HelpOverlays_tsx.js` chunk — the new build no longer generates/references it

## User creation bug: "Could not find the table 'public.audit_users'"
- [x] Diagnosed via Supabase agent (REST introspection of live project yvnkyjnwvylrweyzvibs):
  - audit_divisions EXISTS (id uuid), groups EXISTS (id uuid), user_groups EXISTS (FK group_id->groups.id already present)
  - **audit_users is the ONLY missing table** -> root cause
- [x] Wrote idempotent migration `supabase/migrations/010_create_audit_users_and_user_groups.sql` (creates audit_users with FK division_id->audit_divisions.id, permissive anon+authenticated RLS, reload schema cache)
- [x] Code hardening: users/page.tsx create-user now generates a valid UUID v4 even without crypto.randomUUID (audit_users.id is uuid)
- [x] Recovered users/page.tsx after an edit-tool mishap on the (dashboard) parenthesized path (restored full 892-line file; tsc clean)
- [ ] BLOCKED on applying DDL: Supabase MCP is connected to a DIFFERENT account (sees only org `dlpp` projects ovwkmqdzasgqtfbxhibw / tlpeajzrnfqehakoifyj, NOT yvnkyjnwvylrweyzvibs). Service-role key cannot run DDL.
- [x] USER ran the audit_users SQL in the SQL Editor
- [x] VERIFIED live (anon/RLS path): audit_users now exists; INSERT user = HTTP 201; embedded read returns nested audit_divisions {code:SEC, name:Secretary's Office}; DELETE = 204. USER CREATION WORKS.
- [x] Found 2nd issue: group assignment INSERT into user_groups fails 409 FK `user_groups_user_id_fkey` -> stale FK to shared `users` table (audit app users live in audit_users). App swallows this error, so user is created but group not attached.
- [x] Added fix to migration 010: `ALTER TABLE public.user_groups DROP CONSTRAINT IF EXISTS user_groups_user_id_fkey;`
- [ ] ACTION FOR USER: run that one ALTER (+ NOTIFY) in the SQL Editor to enable group assignment, then I'll re-verify the full create+assign+read cycle

## Auditor tables + RLS hardening (migration 011) — APPLIED & VERIFIED
- [x] Review found /admin/auditors broken: audit_auditor_profiles, audit_certification_types, audit_specialization_areas all 404 (never applied to this project)
- [x] Also flagged RBAC RLS gap: groups/modules/group_module_permissions were anon-only (app runs authenticated after login)
- [x] Wrote idempotent migration 011 (create 3 auditor tables + FK to audit_users + seeds + anon/auth RLS; add authenticated policies to groups/modules/group_module_permissions; NOTIFY reload)
- [x] Supabase MCP still on wrong account (org dlpp qqbbigearvznbtubooul → only DLPP IMS + DLPP Land Case System; NOT yvnkyjnwvylrweyzvibs) — agent could not apply
- [x] USER ran migration 011 in the SQL Editor
- [x] VERIFIED live (anon/RLS path): all 3 tables now HTTP 200 (were 404); cert_types seeded (10: CIA…PMP); spec_areas seeded (15: FIN_AUDIT…REPORT_WRITING); FK embed `audit_auditor_profiles?select=...,audit_users(...)` returns 200 (relationship resolves); CREATE profile = 201; DELETE = 204; table left clean. AUDITORS PAGE NOW FUNCTIONAL.
- [ ] Governance modules still empty (KRA/PSAP/risk_profiles = 0 rows) — optional: run seed scripts in scripts/

## Make project self-contained: disassociate old project + recreate audit schema/data
- [x] Full table audit (SELECT-based) of yvnkyjnwvylrweyzvibs: 21 tables with data, 20 empty, 3 MISSING
- [x] 3 missing tables = org_units (USED by PSAP+Risk hooks via `org_units(name,code)` embed), user_profiles + audit_user_profiles (NOT used anywhere in the app -> intentionally NOT recreated)
- [x] people table EXISTS but empty (needed for PSAP.completed_by + risk_profiles.prepared_by FKs)
- [x] DISASSOCIATE: deleted 6 stale scripts hardcoding the OLD project `xelptlfgpxdzrstiwcti` + a leaked service-role key + old un-prefixed table names:
      apply-migration-003.ts, check-db-status.ts, seed-kra-data.ts, seed-psap-data.ts, seed-risk-data.ts, seed-sample-users.ts
      (remaining scripts use process.env from .env.local = current project; grep for old ref = NONE)
- [x] Wrote migration `012_org_units_self_contained.sql`: creates org_units + permissive RLS (anon+auth) + org_unit_id FKs on audit_strategic_kras/audit_psap_assessments/audit_risk_profiles (empty tables, safe) + NOTIFY reload
- [x] Wrote `scripts/seed-governance.ts` (current project, .env.local creds, idempotent): seeds org_units (mirrors divisions) + people (3 officers) + KRA (2 KRAs, 6 activities, quarterly-status trend) + PSAP (assessments + per-standard scores) + Risk Profiles (profiles + items). Validated: connects + correctly detects org_units missing.
- [ ] ACTION FOR USER: run `012_org_units_self_contained.sql` in the SQL Editor.
- [ ] THEN I run `bun scripts/seed-governance.ts` and verify all 3 governance pages resolve + show data.

### Progress (self-contained recreation)
- [x] USER ran migration 012 -> org_units created + FKs added
- [x] Ran seed-governance.ts against THIS project: org_units 10, people 3, KRA (2 KRAs/6 activities/30 status), PSAP (3 assessments/60 scores), Risk Profiles (2 profiles/10 items). Fixed CHECK constraints found along the way: overall_level in (Low,Moderate,High,Extreme); risk item context/resource categories = dialog's sets; risk item status in (Open,Closed) ONLY (live constraint rejects 'Mitigating' even though the dialog offers it).
- [x] Verified via anon vs service-role read comparison: ALL 9 governance tables hold data but RLS blocks the anon role (control tables audit_risk_register/org_units/people read fine) -> the KRA/PSAP/Risk pages render empty despite data.
- [x] Wrote migration `013_governance_rls_policies.sql`: permissive anon+authenticated FOR ALL policies on the 9 governance tables + NOTIFY reload.
- [ ] ACTION FOR USER: run `013_governance_rls_policies.sql` (final step) — OR provide the DB connection string so I can apply DDL directly and avoid future SQL round-trips.
- [ ] THEN verify governance pages show data end-to-end.
- [ ] KNOWN app/DB mismatch to polish later: AddRiskItemDialog offers status 'Mitigating' but the DB constraint only allows Open/Closed.

## Governance pages review (code+data, since login not available to agent)
- [x] CRITICAL: src/lib/hooks/useKRAs.ts was EMPTY (0 bytes) -> KRA page would crash on `useKRAs is not a function`. Restored it; fetchKRAStatusSummary now computes the summary in JS from audit_kra_activity_quarterly_status (the v_kra_status_summary view does not exist / 404). fetchKRAs embeds org_units.
- [x] YEAR MISMATCH: all 3 governance pages default to the CURRENT year (2026) but data was seeded for 2024 -> default views were empty. Re-seeded KRA (2025 Q1-Q4 + 2026 Q1-Q2 = 36 status rows), PSAP (FY2026), Risk Profiles (2026) so the default views show data.
- [x] PSAP score: confirmed a DB TRIGGER recomputes overall_score from raw scores on a 1-5 scale when scores are inserted (mismatches the 0-100 rating scales). seed now re-applies the 0-100 value via a direct parent UPDATE after inserting scores (trigger does not override parent UPDATE). Now 79-84 -> Good.
- [x] Verified default-view (2026) queries via anon: KRA 2026 Q1 = 6 rows; PSAP 2026 = 3 (79-84 Good); Risk 2026 = 2 (High).
- [x] tsc clean; rebuilt; all routes 200 incl /kra-workplan.
- [ ] USER: log in and visually confirm /kra-workplan, /psap-scorecard, /risk-profiles, /admin/auditors.

## Verify
- [x] tsc: 0 errors (full project)
- [x] All 11+ routes compile & serve 200 (dashboard, kra-workplan, admin/*, help, engagements, findings)
- [x] All guided-tour data-tour targets exist across pages + shared chrome
- [x] Temporary root page reverted to redirect('/dashboard')
- [x] Re-verified after context resume: tsc 0 errors; /, /login, /dashboard, /fieldwork, /help all serve; /api/workpapers E2E (create→list→delete) green against live Supabase
- [x] Final version

## "missing ) after argument list" / ChunkLoadError — DEFINITIVE ROOT-CAUSE FIX (production serve)
- [x] Reproduced from console: `Uncaught SyntaxError: missing ) after argument list` at `(dashboard)/layout.js:3411` + `ChunkLoadError: Loading chunk app/(dashboard)/layout failed. (timeout: .../layout.js)`
- [x] MEASURED the real cause (not transient): dev route chunks were HUGE —
      dashboard/page.js = 8.4 MB, (dashboard)/layout.js = 6.5 MB, main-app.js = 7.6 MB
      → 56% of each chunk (4.7 MB) was inline base64 source maps from Next dev's
      `eval-source-map` devtool (576 inline maps in one chunk). First on-demand
      dev compile took **74s**. Both the multi-MB transfer AND the 74s compile
      exceed the preview-proxy timeout → browser gets a truncated chunk → parse
      error "missing )".
- [x] Confirmed Next.js 15 IGNORES `config.devtool=false` in dev (SWC loader still emits inline maps) — can't shrink dev chunks that way.
- [x] SOLUTION: serve a **minified production build** instead of `next dev`.
      Route First-Load JS dropped ~30x (dashboard 8.4 MB → 339 KB; largest single
      served chunk 324 KB across 26 code-split chunks, total 1.5 MB). Chunks now
      transfer reliably; no timeout/truncation.
- [x] Enabled `experimental.webpackMemoryOptimizations` + `NODE_OPTIONS=--max-old-space-size=2560` so `next build` fits the container's limited RAM (avoids the earlier OOM/exit-137).
- [x] package.json `dev` script rewritten: `([ -f .next/BUILD_ID ] || build) && next start -H 0.0.0.0 -p 3000`
      → the platform now serves the production build; fast restarts (2s) when a
      build already exists, auto-builds once if missing. `dev:hmr` kept for the
      old `next dev` behaviour if ever needed.
- [x] VERIFIED: server Ready in 2s; /, /dashboard, /admin/users, /kra-workplan, /fieldwork, /help all 200 (4–92ms); all 26 dashboard chunks valid (node --check, INVALID=0); tsc 0 errors.
- [ ] NOTE (workflow): live preview now serves the production build, so code
      changes require a rebuild (`bun run build`) + server restart to appear
      (HMR is off in exchange for a stable, crash-free preview).

## Scope RBAC users & groups by application (multi-app aware) — CODE DONE
Approach evolved from "Audit-only tag" to full multi-application scoping because the
DB is SHARED (audit / corporate / landcase). Every group/module/user is scoped by a
`system` value; the app degrades gracefully before the DB column exists.

- [x] `src/lib/rbac-scope.ts`: APPLICATIONS registry, conservative name classifier
      (ambiguous → NULL, never mis-tagged), fetch/insert/update helpers that retry
      without the `system` column, `fetchModulesForApplication`
- [x] `src/lib/rbac-types.ts`: `ApplicationKey` + optional `system` on Group/Module
- [x] Groups page: application filter chips (audit/corporate/landcase/unassigned/all),
      per-app create/edit, menu-access matrix scoped to the group's own app, amber
      banner when the `system` column is missing
- [x] Modules page: application filter; app tag on create/edit; seed Audit menu
- [x] Users page: application filter; group dropdown scoped to the user's app(s);
      Manage-Groups dialog scoped per app
- [x] Admin hub: stats scoped to `system='audit'`
- [x] Fixed duplicated Application+Route block in the Module edit form
- [x] Migration `015_shared_rbac_system_scoping.sql` (additive/idempotent):
      groups.system + conservative backfill + seed audit modules + RLS + reload
- [x] tsc 0 errors; clean production build; server 200; Version 26

### Live DB state (verified read-only via service-role REST, project yvnkyjnwvylrweyzvibs)
- `groups.system` does NOT exist yet (migration 015 not applied)
- 15 groups. Conservative backfill/classifier resolves them as:
  - audit (2): Audit Team, Auditor
  - corporate (7): Corporate Deputy Secretary/Director/Legal Manager/Legal Officer/
    Secretary/Super Admin, Senior Corporate Legal Officer
  - landcase (3): Document Clerk, Legal Clerk, Litigation
  - UNASSIGNED/NULL (3): Manager, Super Admin, Viewer  <- admin tags these in the UI
- modules by system: admin 3, corporate 13, landcase 34, audit 0 (015 seeds audit)
- NO other app's rows are retagged (data-safety flaw from old migration 014 resolved)

### Migration 015 — APPLIED & VERIFIED (user ran it in the SQL Editor)
Verified read-only via service-role REST after the user applied it:
- `groups.system` now EXISTS (probe HTTP 200; was 400/absent before).
- Backfill exactly as designed: audit(2) Audit Team, Auditor | corporate(7) all
  Corporate* + Senior Corporate Legal Officer | landcase(3) Document Clerk, Legal
  Clerk, Litigation | UNASSIGNED(3) Manager, Super Admin, Viewer.
- modules by system: admin 3, corporate 13, landcase 34 (UNCHANGED) + audit 0->19
  seeded (audit_dashboard … audit_divisions). No other app's rows touched.
- App effect: Groups page amber banner gone; Audit menu-access matrix now has 19
  modules to allocate; the 3 unassigned groups can be tagged via Edit -> Application.
### Post-migration follow-ups — DONE (via safe service-role writes, reversible in UI)
- [x] Tagged the 3 unassigned groups -> audit (Manager, Super Admin, Viewer).
      Verified: audit(5) Audit Team, Auditor, Manager, Super Admin, Viewer;
      corporate(7) + landcase(3) UNCHANGED. NOTE: "Super Admin" tagged audit as a
      default for this deployment — re-tag via Edit->Application if it's cross-app.
- [x] Allocated default menu access (surgical; preserved pre-existing perms like
      audit_trail + non-audit modules):
      - Auditor: workflow (engagements/fieldwork/findings/recommendations/
        action_plans/risk_events) = CRUPE; dashboard/risk_profiles/psap/kra = R;
        risk_register/compliance/reports = RPE; admin modules = none.
      - Audit Team: all 13 workflow modules = R; compliance/reports = RPE; admin = none.
- [x] Initialised git repo (was empty .git) + committed the work.
- [x] Pushed to GitHub emabi2002/landauditsystem (existing PUBLIC repo, main had
      3 prior commits ending at the Netlify-fix). Rebased current work on top via
      `git reset --soft origin/main` so it's a clean 13-file feature commit 206135b
      (NO force-push, remote history preserved, fast-forward 1db99a4..206135b).
      Verified secret scan clean (0 JWTs; .env* untracked). Remote main tip=206135b;
      /api/users/route.ts now present on remote (the password fix was absent before).
- [ ] Optional: trigger a Netlify redeploy so the LIVE site picks up the new commit
      (GitHub push alone doesn't redeploy unless Netlify auto-deploy is connected).

## Fix: user creation ("email already registered" + hidden role-constraint bug) — DONE
Reported: creating a user showed "A user with this email address has already been
registered". Root-caused TWO issues via live E2E against the shared DB:
- [x] Shared-SSO reality: the email often already exists in auth (another DLPP app
      or the admin's own account). POST /api/users now GRACEFULLY LINKS the existing
      login (findAuthUserByEmail) and grants app access + group ADDITIVELY instead of
      failing. Existing SSO password is preserved (use Edit->Reset Password to change).
- [x] Hidden bug: the shared `users.role` CHECK constraint only allows
      {officer, admin, viewer}. The UI defaulted role='user' (and offered 'manager'),
      both INVALID -> every new-user insert 400'd on users_role_check. Probed the live
      constraint to confirm the allowed set.
      Fix: added normalizeRole() in /api/users (POST+PUT) coercing any invalid role to
      'officer'; updated the UI Role options to Officer/Viewer/Administrator (default
      Officer). Real access is via RBAC groups, not this coarse field.
- [x] E2E verified (throwaway email, cleaned up): CREATE -> 200 linked:false;
      same email again -> 200 linked:true; DELETE -> 200. PASS.
- [x] tsc 0 errors; clean production build; server 200; Version 27.
- [ ] User: hard-refresh, then create a user end-to-end to confirm in the UI.
- [ ] Collaborative: user logs in and walks Groups/Modules/Users so I can fine-tune UX.

## Fix: KRA & Workplan dialogs never opened (dead New KRA / Edit / Activities buttons) — DONE
Reported implicitly via the attached kra-workplan/page.tsx.
- [x] Root cause: the page IMPORTED CreateKRADialog + ManageKRAActivitiesDialog and
      wired all their state (kraDialogOpen/editingKRA/activitiesKRA via the New KRA
      button, the row Edit pencil, and the Manage-activities ListTree button), but
      only `<UpdateKRAStatusDialog>` was actually rendered in the JSX. So clicking
      New KRA / Edit KRA / Manage activities set state but nothing ever appeared.
- [x] Rendered `<CreateKRADialog>` (create+edit, refreshes list + status on success)
      and `<ManageKRAActivitiesDialog>` (open={!!activitiesKRA}) at the bottom of the page.
- [x] Removed the hardcoded "Sample KRA Activities" placeholder card (fake a)–f)
      list) now that each KRA has real, per-KRA activity management via the dialog.
- [x] Also fixed a pre-existing tsc error in CreatePSAPAssessmentDialog.tsx
      (.eq('id', assessmentId) where assessmentId was string|undefined) by adding a
      guard after create/update so scores always save against a known id.
- [x] tsc 0 errors; clean production build; server restarted; /, /login, /dashboard,
      /kra-workplan, /psap-scorecard, /compliance, /admin/users all 200.
- [ ] User: hard-refresh /kra-workplan, then click New KRA / a row's Edit / the
      Activities (tree) icon to confirm each dialog now opens.
- [x] E2E VERIFIED against live DB as a REAL authenticated user (temp user created +
      deleted via service role; all test data cleaned up). Mirrored the exact dialog
      queries:
      - CreateKRADialog: org_units dropdown = 10 units; insert audit_strategic_kras OK;
        reads back with org_units embed (org unit "Corporate Services").
      - ManageKRAActivitiesDialog: inserted 2 audit_kra_activities; list = 2 rows.
      - UpdateKRAStatusDialog: upsert audit_kra_activity_quarterly_status with
        onConflict(kra_activity_id,financial_year,quarter) SUCCEEDED (the required
        UNIQUE constraint EXISTS) + re-upsert edits in place with NO duplicates.
      - useKRAs.fetchKRAStatusSummary nested join resolves the KRA (total/completed/
        ongoing) + KRA title. RESULT: all operations PASSED. Authenticated RLS allows
        the full flow, so a logged-in user gets the same result.

## Fix: dead "Forgot password?" link on the login page — DONE
- [x] Root cause: login page linked to /forgot-password but the route did not exist
      -> Next's RSC prefetch of that link failed (visible runtime error) and clicking
      it would 404.
- [x] Created src/app/(auth)/forgot-password/page.tsx matching the DLPP login design
      (same gradient, logo, colors). Uses supabase.auth.resetPasswordForEmail(email,
      { redirectTo: `${origin}/login` }); shows a success state + "Back to sign in".
- [x] tsc 0 errors; production build lists /forgot-password (3.18 kB); server 200 for
      /login, /forgot-password, /kra-workplan, /dashboard; prefetch error resolved.

## Live E2E: PSAP Scorecard + Compliance (as REAL authenticated user)
- [x] COMPLIANCE: hit the real /api/compliance route (service-role) end-to-end:
      GET -> POST obligation -> POST control(linked) -> PUT obligation -> GET(reflects)
      -> DELETE control -> DELETE obligation -> GET(clean). ALL PASSED.
- [x] PSAP: mirrored CreatePSAPAssessmentDialog + usePSAPAssessments.fetchAssessments
      as an authenticated user. PASSED: 20 standards load; 10 org units; insert
      audit_psap_assessments OK; insert 20 scores OK; overall_score persists (80/Good)
      via the parent-UPDATE-after-trigger workaround; page fetch with named FK embeds
      (audit_psap_assessments_completed_by_fkey / _reviewed_by_fkey) resolves; org_units
      embed = "Corporate Services"; scores read back with standard titles.
- [x] Also confirmed audit_psap_assessments has UNIQUE(org_unit_id,financial_year,
      quarter) (a 2nd insert for a seeded period 409'd) -> the dialog should ideally
      surface a friendly "assessment already exists for this unit/period" message.

## BUG found by the PSAP E2E: `people` blocks the `authenticated` role
- [x] Root cause (verified 3-way): people rows -> service_role=3, anon=3, AUTHENTICATED=0.
      org_units got its authenticated RLS policy (012/013) but `people` was missed, so
      after LOGIN: PSAP Completed/Reviewed-By dropdowns are EMPTY (completed_by is
      required) AND Admin -> Officers is empty + CRUD fails. The PSAP assessment table
      also shows the officer as N/A (completed_by_person embed returns null).
- [x] Proved it's ONLY the people-RLS gap: seeded a person via service role, then as
      authenticated the FULL PSAP create (assessment + 20 scores + overall + fetch)
      succeeded; only completed_by_person name came back "(none)".
- [x] Wrote migration `016_people_rls_authenticated.sql` (idempotent; permissive
      anon+authenticated FOR ALL on people + defensively org_units; NOTIFY reload) —
      same pattern as 013.
- [ ] ACTION FOR USER: run `016_people_rls_authenticated.sql` in the Supabase SQL
      Editor (I can't apply DDL: no DB password; MCP was on a different account).
      After that, PSAP dropdowns + Admin Officers work for logged-in users. Then I can
      re-run the PSAP E2E to confirm completed_by resolves.

## Git: re-established repo + pushed all uncommitted work
- [x] .git was empty this session (container reset lost it); remote emabi2002/
      landauditsystem still had history (origin/main was at 1ffe354).
- [x] Re-init + remote add + fetch + `git reset --mixed origin/main` (kept working
      tree). Revealed the ENTIRE governance-CRUD feature set was never committed
      before the repo was lost (compliance page/api/hook, org-units + people admin
      pages, CreateKRADialog, ManageKRAActivitiesDialog, useKRAs rewrite, PSAP dialog),
      plus this session's KRA dialog fix + forgot-password + migration 016.
- [x] Committed all 16 files as 7a3d0b4 (no .env staged) and pushed main
      1ffe354..7a3d0b4 using a user-provided PAT passed INLINE (not persisted:
      remote url is clean, 0 token refs in .git/config).
- [ ] SECURITY: the PAT was shared in plaintext in chat — user should ROTATE/REVOKE it.

## Migration 016 APPLIED & VERIFIED (user ran it) + PSAP friendly duplicate msg
- [x] User ran 016 in the SQL Editor. Re-verified E2E as an authenticated user:
      people read = 3 (was 0); inline "Add Person" INSERT works; full PSAP create
      (assessment + 20 scores) OK; the named-FK embed now resolves the officer name
      ("John Kaupa") in the assessments table (was N/A). Admin Officers now works too.
- [x] PSAP dialog: raw 23505 unique-violation now shown as a friendly message naming
      the org unit + Q/year and telling the user to edit the existing assessment.

## Live E2E: Risk Register + Risk Profiles (as authenticated user)
Found a SYSTEMIC RLS gap + dialog/FK bugs; verified via authenticated vs service reads.
- [x] RLS gap: an entire family of tables has anon policies but NO authenticated
      policy, so after login they read 0 and writes fail with an RLS violation:
      audit_divisions(10), audit_legal_instruments(13), audit_risk_register(22),
      audit_risk_legal_references(25), audit_risk_audit_log(22), audit_categories(7),
      audit_risk_events(17), audit_risk_event_risks(23), audit_risk_event_log(29)
      + empty siblings (sections, business_processes, treatments, incidents,
      indicators(+values), event_milestones/documents, tasks). Effect: Risk Register
      + Risk Events pages empty after login; Create-Risk Division/Legal dropdowns
      empty; "Add Risk" fails. (engagements/findings/recommendations already work.)
- [x] Wrote migration `017_risk_register_rls_authenticated.sql` (idempotent; permissive
      anon+authenticated FOR ALL on those 18 tables; NOTIFY reload).
- [x] BUG: CreateRiskProfileDialog loaded org_units with .eq('active') (col is
      is_active) -> Organization Unit dropdown empty -> risk profiles couldn't be
      created (required field). FIXED -> .eq('is_active').
- [x] BUG: risk_owner_id on audit_risk_profile_items references `people` (proved via
      FK probe: people OK; org_unit/division/audit_user all FK-error), but
      AddRiskItemDialog loaded org_units for the Risk Owner dropdown and useRiskProfiles
      .fetchRiskProfileItems embedded risk_owner:org_units. FIXED both to use people
      (dialog loads people.active; hook embeds people!..._risk_owner_id_fkey(full_name)).
      (The /risk-profiles/[id] detail page already used the correct people embed.)
- [x] Verified after fixes (authenticated): Risk Profiles create + add item + read-back
      with people owner ("John Kaupa") all PASS. Risk Register still RLS-blocked until
      the user runs 017. tsc 0 errors; clean build; risk routes 200.
- [x] USER ran 017. RE-VERIFIED as authenticated: Risk Register reads 22 (was 0),
      divisions 10, legal instruments 13, create risk + legal ref works, DB computes
      residual rating, status update works. Risk Events reads 17 (was 0), categories 7,
      create risk event (RE-2026-008) works. Both modules functional after login.

## FINAL RLS sweep + remaining modules (Engagements/Fieldwork/Findings/Recs/Action Plans)
- [x] RLS SWEEP (read + write probe across all 41 tables, authenticated): ALL CLEAR.
      Every table svc==auth on reads; every write-probe passed (insert {} returns a
      data-constraint error, NOT 42501). Migrations 013/016/017 fully closed the gaps.
      No remaining table blocks authenticated read OR write.
- [x] Engagements: REAL (useEngagements). Read 11, create + update verified (auth).
- [x] Fieldwork: REAL via /api/workpapers (service-role). GET 200 (0 rows).
- [x] FINDING: Findings, Recommendations, Action Plans PAGES render HARDCODED mock
      arrays (const findings/recommendations/actionPlans = [...]); they do NOT use the
      DB. useFindings/useRecommendations hooks exist but are unused; DB has real data
      (audit_findings=8, audit_recommendations=9). Action Plans has no DB table wired.
- [x] NOTE: audit_findings real schema differs from database.types.ts (no `condition`
      column) — relevant when wiring the Findings page to the DB. (RLS write is fine.)
- [x] DONE: wired Findings + Recommendations + Action Plans to real Supabase CRUD.

## Wire Findings / Recommendations / Action Plans to real data + full CRUD
- [x] Discovered real live schemas (types were stale):
      audit_findings: title (not finding_title), condition_found NOT NULL (not
        `condition`), + criteria/cause/effect/risk_rating/status/engagement_id.
      audit_recommendations: finding_id/recommendation_text/priority/status/target_date
        (no recommendation_number/responsible_division_id).
      audit_action_plans ALREADY EXISTS (10 rows) — recommendation_id(FK NOT NULL),
        action_owner_id(FK->people), planned_action, progress_percentage(0-100),
        status, actual_completion_date, notes, evidence_url. NO migration needed.
- [x] Probed CHECK values: findings.risk_rating {Low,Medium,High,Critical};
      findings.status {Draft,Under Review,Closed}; rec.priority {Low,Medium,High,
      Critical}; rec.status {Draft,In Progress,Accepted,Published}; action_plans.status
      {Not Started,In Progress,Completed,Overdue}.
- [x] Aligned database.types.ts: real audit_findings + audit_recommendations columns
      + added audit_action_plans table type.
- [x] Created useActionPlans hook (select/insert/update/delete on audit_action_plans).
- [x] Rewrote findings/page.tsx: useFindings + engagement dropdown, stats, search,
      create/edit/delete dialogs (Condition/Criteria/Cause/Effect structure).
- [x] Rewrote recommendations/page.tsx: useRecommendations + finding dropdown, stats,
      CRUD + one-click Publish (sets status=Published + published_at).
- [x] Rewrote action-plans/page.tsx: useActionPlans + recommendation + owner(people)
      dropdowns, progress bar, stats (in progress/completed/overdue/avg), CRUD.
- [x] E2E (authenticated) chain PASSED: create finding(Critical/Under Review)->update
      ->Closed; create rec(High/Draft)->publish; create action plan(50%/In Progress)->
      update 100%/Completed; all cleaned up. tsc 0 errors; clean build; routes 200.

## ACTIVE: Build the real Reports module (last mock page)

Reports page was 100% static: hardcoded templates + dead buttons (Create Report,
Export Data, View Analytics, Generate all did nothing). Dashboard is already real.

- [x] Re-establish git repo (container reset wiped .git again) via authenticated gh CLI
- [x] Create `src/lib/reports.ts`: report catalog + live Supabase data generators
      (engagements, findings+recommendations, action plans, compliance, risk
      register, PSAP scorecard, KRA workplan) + printable-table helper
- [x] Rewrite `reports/page.tsx`: real analytics KPI cards + charts + report library
      with working Preview / Export CSV / Print-to-PDF per report
- [x] Verify tsc clean + rebuild + routes 200; version (v10); commit + push
- [x] E2E verified every report query returns live rows (engagements 11, findings 8,
      recommendations 9, action plans 9, risk register 22, PSAP 3, KRA status 36);
      fixed a stale `engagement_number` column reference (not in live DB)
