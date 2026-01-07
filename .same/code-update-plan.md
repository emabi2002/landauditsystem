# Code Update Plan - Audit Table Prefixes

## Database Tables Renamed

| Old Name | New Name | Status |
|----------|----------|--------|
| engagements | audit_engagements | ✅ In DB |
| engagement_team | audit_engagement_team | ✅ In DB |
| workpapers | audit_workpapers | ✅ In DB |
| evidence | audit_evidence | ✅ In DB |
| findings | audit_findings | ✅ In DB |
| recommendations | audit_recommendations | ✅ In DB |
| action_plans | audit_action_plans | ✅ In DB |
| obligations | audit_obligations | ✅ In DB |
| controls | audit_controls | ✅ In DB |
| risk_profiles | audit_risk_profiles | ✅ In DB |
| risk_profile_items | audit_risk_profile_items | ✅ In DB |
| psap_standards | audit_psap_standards | ✅ In DB |
| psap_rating_scales | audit_psap_rating_scales | ✅ In DB |
| psap_assessments | audit_psap_assessments | ✅ In DB |
| psap_assessment_scores | audit_psap_assessment_scores | ✅ In DB |
| strategic_kras | audit_strategic_kras | ✅ In DB |
| kra_activities | audit_kra_activities | ✅ In DB |
| kra_activity_quarterly_status | audit_kra_activity_quarterly_status | ✅ In DB |
| events | audit_events | ✅ In DB |

## Shared Tables (NOT renamed)
- people (shared with case management)
- notifications (shared)
- org_units (doesn't exist - need to handle)

## Files to Update

### 1. Database Types
- [ ] `src/lib/database.types.ts` - Regenerate or manually update all table references

### 2. Hooks (7 files)
- [ ] `src/lib/hooks/useEngagements.ts` - engagements → audit_engagements
- [ ] `src/lib/hooks/useFindings.ts` - findings → audit_findings
- [ ] `src/lib/hooks/useRecommendations.ts` - recommendations → audit_recommendations
- [ ] `src/lib/hooks/useRiskProfiles.ts` - risk_profiles, risk_profile_items → audit_*
- [ ] `src/lib/hooks/usePSAPAssessments.ts` - psap_* → audit_psap_*
- [ ] `src/lib/hooks/useKRAs.ts` - strategic_kras, kra_* → audit_*

### 3. Dashboard Pages (13 files)
- [ ] `src/app/(dashboard)/engagements/page.tsx`
- [ ] `src/app/(dashboard)/findings/page.tsx`
- [ ] `src/app/(dashboard)/recommendations/page.tsx`
- [ ] `src/app/(dashboard)/action-plans/page.tsx`
- [ ] `src/app/(dashboard)/fieldwork/page.tsx` - workpapers, evidence
- [ ] `src/app/(dashboard)/compliance/page.tsx` - obligations, controls
- [ ] `src/app/(dashboard)/risk-profiles/page.tsx`
- [ ] `src/app/(dashboard)/risk-profiles/[id]/page.tsx`
- [ ] `src/app/(dashboard)/psap-scorecard/page.tsx`
- [ ] `src/app/(dashboard)/kra-workplan/page.tsx`
- [ ] `src/app/(dashboard)/risk-register/page.tsx`
- [ ] `src/app/(dashboard)/reports/page.tsx`

### 4. Dialog Components (5 files)
- [ ] `src/components/dialogs/AddRiskItemDialog.tsx`
- [ ] `src/components/dialogs/CreatePSAPAssessmentDialog.tsx`
- [ ] `src/components/dialogs/CreateRiskProfileDialog.tsx`
- [ ] `src/components/dialogs/UpdateKRAStatusDialog.tsx`

### 5. Widgets (3 files)
- [ ] `src/components/widgets/RiskProfileWidget.tsx`
- [ ] `src/components/widgets/PSAPRatingsWidget.tsx`
- [ ] `src/components/widgets/KRACompletionWidget.tsx`

### 6. Charts (2 files)
- [ ] `src/components/charts/PSAPTrendChart.tsx`
- [ ] `src/components/charts/KRATrendChart.tsx`

## Update Strategy

### Approach 1: Search and Replace (Quick but Risky)
Find: `from('engagements')`
Replace: `from('audit_engagements')`

### Approach 2: File by File (Safer)
Update each file individually, testing as we go.

### Approach 3: Regenerate Types First
1. Generate new database.types.ts from Supabase
2. Fix TypeScript errors one by one
3. Update code to match new types

## Testing Plan

After updates:
1. ✅ No TypeScript errors
2. ✅ Dev server starts
3. ✅ Can create an engagement
4. ✅ Can create a finding
5. ✅ Can create a risk profile
6. ✅ Can create a PSAP assessment
7. ✅ Can create a KRA

## Note on org_units

The `org_units` table doesn't exist in the database yet. Options:
1. Use existing department/division tables
2. Create org_units table (coordinated with other systems)
3. Make org_unit_id nullable for now
