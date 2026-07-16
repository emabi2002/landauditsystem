# Governance Modules — Real DB + Full CRUD

## Diagnosis (verified against live DB yvnkyjnwvylrweyzvibs)
- PSAP dialog used `org_units.active` (col is `is_active`) -> org unit dropdown empty (400).
- No UI to create Org Units / People (PSAP dropdown sources).
- PSAP score scale wrong: UI /20.0, DB + rating scales are 0-100.
- KRA "New KRA" button inert; hardcoded "Sample KRA Activities"; no activity CRUD.
- Compliance page 100% hardcoded placeholder.
- audit_obligations/audit_controls RLS-blocked (42501) -> need service-role API.
- Writable by anon/auth: org_units, people, audit_strategic_kras, audit_kra_activities, psap tables.

## Real column names (live DB, types.ts partly stale)
- org_units: id, code, name, unit_type, parent_id, is_active
- people: id, user_id, full_name, email, role, org_unit_id, active
- audit_strategic_kras: id, org_unit_id, kra_code, kra_title, purpose, start_year, end_year
- audit_kra_activities: id, strategic_kra_id, activity_code, description, measure, baseline, annual_target
- audit_kra_activity_quarterly_status: id, kra_activity_id, financial_year, quarter, status, narrative_status, challenges, revision_next_year
- audit_psap_assessment_scores: id, psap_assessment_id, psap_standard_id, raw_score, weighted_score, comments
- audit_obligations: id, title, source, category, description, owner_unit_id
- audit_controls: id, title, control_type, description, owner_unit_id, obligation_id, frequency, effectiveness

## Tasks
- [ ] A1 Fix PSAP dialog: is_active, 0-100 scoring, inline add org unit + person
- [ ] A2 PSAP page: 0-100 display, edit + delete assessment
- [ ] B1 Admin > Organizational Units page (CRUD)
- [ ] B2 Admin > Officers (people) page (CRUD)
- [ ] B3 Sidebar links for both
- [ ] C1 /api/compliance service-role route (obligations + controls CRUD)
- [ ] C2 useCompliance hook
- [ ] C3 Rewrite compliance page (real data + stats + CRUD dialogs)
- [ ] D1 CreateKRADialog (create/edit strategic KRA)
- [ ] D2 Wire New KRA button; KRA edit/delete
- [ ] D3 Real KRA activities (replace placeholder) + add/delete activity
- [ ] E Verify: tsc clean, build, all routes 200, live CRUD tested
