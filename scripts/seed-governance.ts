/**
 * Governance seed for the SELF-CONTAINED audit system.
 *
 * Targets THIS project only, using credentials from .env.local (no hardcoded
 * project refs or keys). Run AFTER migration 012 has created public.org_units:
 *
 *     bun scripts/seed-governance.ts
 *
 * Seeds (idempotently — each module is skipped if it already has rows):
 *   - org_units      (mirrors audit_divisions so org names match)
 *   - people         (a few DLPP Internal Audit officers)
 *   - KRA            (strategic KRAs + activities + quarterly status trend)
 *   - PSAP           (assessments + per-standard scores, using existing standards)
 *   - Risk Profiles  (profiles + risk items)
 */
import { createClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!url || !key) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY (check .env.local)')
  process.exit(1)
}
const sb = createClient(url, key)

const log = (...a: unknown[]) => console.log(...a)
async function count(table: string): Promise<number> {
  const { count } = await sb.from(table).select('id', { count: 'exact', head: false }).limit(1)
  return count ?? 0
}

// ---------------------------------------------------------------------------
// org_units — mirror the existing divisions so governance rows show real names
// ---------------------------------------------------------------------------
async function seedOrgUnits(): Promise<Record<string, string>> {
  const { data: existing } = await sb.from('org_units').select('id, code')
  const byCode: Record<string, string> = {}
  for (const r of existing ?? []) byCode[(r as any).code] = (r as any).id

  const { data: divisions } = await sb.from('audit_divisions').select('code, name').order('name')
  const toInsert = (divisions ?? [])
    .filter((d: any) => !byCode[d.code])
    .map((d: any) => ({ code: d.code, name: d.name, unit_type: 'Division', is_active: true }))

  if (toInsert.length) {
    const { data, error } = await sb.from('org_units').insert(toInsert).select('id, code')
    if (error) { console.error('org_units insert error:', error.message); return byCode }
    for (const r of data ?? []) byCode[(r as any).code] = (r as any).id
    log(`✅ org_units: inserted ${toInsert.length} (mirrored from divisions)`)
  } else {
    log(`• org_units: already populated (${Object.keys(byCode).length})`)
  }
  return byCode
}

// ---------------------------------------------------------------------------
// people — audit officers used as completed_by / prepared_by
// ---------------------------------------------------------------------------
async function seedPeople(): Promise<string[]> {
  const officers = [
    { full_name: 'John Kaupa', email: 'john.kaupa@dlpp.gov.pg', role: 'Chief Internal Auditor', active: true },
    { full_name: 'Mary Temu', email: 'mary.temu@dlpp.gov.pg', role: 'Audit Manager', active: true },
    { full_name: 'Peter Wari', email: 'peter.wari@dlpp.gov.pg', role: 'Senior Auditor', active: true },
  ]
  const ids: string[] = []
  for (const o of officers) {
    const { data: found } = await sb.from('people').select('id').eq('email', o.email).limit(1)
    if (found && found.length) { ids.push((found[0] as any).id); continue }
    const { data, error } = await sb.from('people').insert(o).select('id').single()
    if (error) { console.error('people insert error:', error.message); continue }
    ids.push((data as any).id)
  }
  log(`✅ people: ${ids.length} officer(s) available`)
  return ids
}

// ---------------------------------------------------------------------------
// KRA — strategic KRAs + activities + quarterly status (gives a real trend)
// ---------------------------------------------------------------------------
async function seedKRA(orgId?: string) {
  if ((await count('audit_strategic_kras')) > 0) { log('• KRA: already seeded — skipped'); return }

  const kras = [
    { kra_code: '1', kra_title: 'Strengthen the Internal Audit Function', purpose: 'Build a risk-based, professional internal audit capability across DLPP.', start_year: 2024, end_year: 2026, org_unit_id: orgId ?? null },
    { kra_code: '2', kra_title: 'Enhance Risk & Compliance Management', purpose: 'Embed proactive risk management and regulatory compliance in operations.', start_year: 2024, end_year: 2026, org_unit_id: orgId ?? null },
  ]
  const { data: kraRows, error: kraErr } = await sb.from('audit_strategic_kras').insert(kras).select('id, kra_code')
  if (kraErr) { console.error('KRA insert error:', kraErr.message); return }

  const kra1 = (kraRows ?? []).find((k: any) => k.kra_code === '1') as any
  const activities = [
    { strategic_kra_id: kra1.id, activity_code: '1.1', description: 'Conduct risk-based audits per the annual audit plan', measure: 'No. of audits completed', baseline: '4 / year', annual_target: '8 / year' },
    { strategic_kra_id: kra1.id, activity_code: '1.2', description: 'Validate management action plans on prior findings', measure: '% findings followed up', baseline: '50%', annual_target: '90%' },
    { strategic_kra_id: kra1.id, activity_code: '1.3', description: 'Maintain continuous compliance monitoring', measure: 'Quarterly reports issued', baseline: '2', annual_target: '4' },
    { strategic_kra_id: kra1.id, activity_code: '1.4', description: 'Perform annual asset verification', measure: 'Verification accuracy', baseline: '90%', annual_target: '98%' },
    { strategic_kra_id: kra1.id, activity_code: '1.5', description: 'Deliver performance (value-for-money) audits', measure: 'No. of performance audits', baseline: '1', annual_target: '3' },
    { strategic_kra_id: kra1.id, activity_code: '1.6', description: 'Provide risk management advisory to divisions', measure: 'Divisions supported', baseline: '3', annual_target: 'All' },
  ]
  const { data: actRows, error: actErr } = await sb.from('audit_kra_activities').insert(activities).select('id, activity_code')
  if (actErr) { console.error('KRA activities error:', actErr.message); return }
  const acts = (actRows ?? []).sort((a: any, b: any) => a.activity_code.localeCompare(b.activity_code)) as any[]

  // Completion trend: Q1 33% -> Q2 50% -> Q3 67% -> Q4 100% -> 2025 Q1 ramp
  const S = { done: 'Completed', going: 'Ongoing', none: 'Not Started' }
  // Span the previous + current financial year so the page's default view
  // (current year) always has data, plus history for the trend.
  const plan: Record<string, string[]> = {
    '2025-1': [S.done, S.going, S.going, S.done, S.none, S.going],
    '2025-2': [S.done, S.done, S.going, S.going, S.going, S.done],
    '2025-3': [S.done, S.going, S.done, S.done, S.going, S.going],
    '2025-4': [S.done, S.done, S.done, S.done, S.done, S.done],
    '2026-1': [S.done, S.done, S.going, S.done, S.going, S.done],
    '2026-2': [S.going, S.going, S.done, S.going, S.going, S.done],
  }
  const statusRows: any[] = []
  for (const [key, statuses] of Object.entries(plan)) {
    const [fy, q] = key.split('-').map(Number)
    statuses.forEach((st, idx) => {
      if (!acts[idx]) return
      statusRows.push({
        kra_activity_id: acts[idx].id,
        financial_year: fy,
        quarter: q,
        status: st,
        narrative_status: st === S.done ? 'Target achieved for the period.' : st === S.going ? 'Work in progress; on track.' : 'Scheduled to commence next quarter.',
        challenges: st === S.none ? 'Resourcing to be confirmed.' : null,
        revision_next_year: null,
      })
    })
  }
  const { error: stErr } = await sb.from('audit_kra_activity_quarterly_status').insert(statusRows)
  if (stErr) { console.error('KRA status error:', stErr.message); return }
  log(`✅ KRA: 2 KRAs, ${acts.length} activities, ${statusRows.length} quarterly-status rows`)
}

// ---------------------------------------------------------------------------
// PSAP — assessments + per-standard scores (uses the 20 existing standards)
// ---------------------------------------------------------------------------
async function seedPSAP(orgIds: string[], personId?: string) {
  if ((await count('audit_psap_assessments')) > 0) { log('• PSAP: already seeded — skipped'); return }
  if (!personId) { log('• PSAP: no person available (completed_by required) — skipped'); return }

  const { data: standards } = await sb.from('audit_psap_standards').select('id, weight').order('standard_number')
  const { data: scales } = await sb.from('audit_psap_rating_scales').select('min_score, max_score, rating').order('min_score')
  if (!standards?.length) { log('• PSAP: no standards found — skipped'); return }

  const ratingFor = (score: number) => {
    const hit = (scales ?? []).find((s: any) => score >= Number(s.min_score) && score <= Number(s.max_score))
    return hit ? (hit as any).rating : null
  }

  let totalScores = 0
  const targets = orgIds.slice(0, 3)
  for (let i = 0; i < targets.length; i++) {
    const raws = (standards as any[]).map(() => 3 + Math.floor(Math.random() * 3)) // 3..5
    const sumWeight = (standards as any[]).reduce((acc, s) => acc + Number(s.weight), 0)
    // weighted_score per standard = (raw/5) * weight; overall = % of the maximum
    // possible, i.e. a 0..100 score to match the PSAP rating scales
    // (0-59 Poor, 60-74 Fair, 75-89 Good, 90-100 Excellent).
    const sumWeighted = (standards as any[]).reduce((acc, s, idx) => acc + (raws[idx] / 5) * Number(s.weight), 0)
    const overall = Number(((sumWeighted / sumWeight) * 100).toFixed(2)) // 0..100 scale
    const { data: aRow, error: aErr } = await sb.from('audit_psap_assessments').insert({
      org_unit_id: targets[i],
      financial_year: 2026,
      quarter: i === 0 ? 1 : 2,
      assessment_date: i === 0 ? '2026-03-31' : '2026-06-30',
      completed_by: personId,
      overall_score: overall,
      overall_rating: ratingFor(overall),
      comments: 'PSAP self-assessment for FY2026.',
    }).select('id').single()
    if (aErr) { console.error('PSAP assessment error:', aErr.message); continue }
    const scoreRows = (standards as any[]).map((s, idx) => ({
      psap_assessment_id: (aRow as any).id,
      psap_standard_id: s.id,
      raw_score: raws[idx],
      // per-standard weighted score = raw * weight (matches CreatePSAPAssessmentDialog display)
      weighted_score: Number((raws[idx] * Number(s.weight)).toFixed(2)),
      comments: null,
    }))
    const { error: sErr } = await sb.from('audit_psap_assessment_scores').insert(scoreRows)
    if (sErr) { console.error('PSAP scores error:', sErr.message); continue }
    totalScores += scoreRows.length
    // A DB trigger recomputes overall_score from the raw scores on a 1-5 scale
    // when scores are inserted, which does not match the 0-100 rating scales.
    // Re-apply our 0-100 value with a direct parent UPDATE (not overwritten by
    // the trigger) so the stored score + rating are consistent.
    await sb.from('audit_psap_assessments')
      .update({ overall_score: overall, overall_rating: ratingFor(overall) })
      .eq('id', (aRow as any).id)
  }
  log(`✅ PSAP: ${targets.length} assessment(s), ${totalScores} standard scores`)
}

// ---------------------------------------------------------------------------
// Risk Profiles — profiles + risk items
// ---------------------------------------------------------------------------
async function seedRiskProfiles(orgIds: string[], personId?: string) {
  if ((await count('audit_risk_profiles')) > 0) { log('• Risk Profiles: already seeded — skipped'); return }
  if (!personId) { log('• Risk Profiles: no person available (prepared_by required) — skipped'); return }

  // overall_level CHECK allows: Low | Moderate | High | Extreme (matches the
  // risk-score bands: >=15 Extreme, >=10 High, >=5 Moderate, else Low)
  const levelFor = (avg: number) => (avg >= 15 ? 'Extreme' : avg >= 10 ? 'High' : avg >= 5 ? 'Moderate' : 'Low')
  // item status CHECK allows: Open | Mitigating | Closed
  // context/resource categories must match the DB CHECK constraints (same set
  // as the AddRiskItemDialog dropdowns).
  const itemsTemplate = [
    { context_category: 'Compliance', resource_category: 'Human Resources', risk_description: 'Insufficient segregation of duties in title processing', likelihood_score: 4, impact_score: 4, existing_controls: 'Manual supervisory review', additional_controls: 'Implement system-enforced maker-checker', status: 'Open' },
    { context_category: 'Business Processes', resource_category: 'Human Resources', risk_description: 'Backlog in land title registration', likelihood_score: 4, impact_score: 3, existing_controls: 'Periodic clean-up drives', additional_controls: 'Digitise workflow + SLAs', status: 'Open' },
    { context_category: 'Business Processes', resource_category: 'Financial Resources', risk_description: 'Revenue leakage from manual fee collection', likelihood_score: 3, impact_score: 5, existing_controls: 'Monthly reconciliation', additional_controls: 'Integrate e-payment gateway', status: 'Open' },
    { context_category: 'Compliance', resource_category: 'Information Resources', risk_description: 'Incomplete records for statutory reporting', likelihood_score: 3, impact_score: 3, existing_controls: 'Document checklist', additional_controls: 'Central records management system', status: 'Closed' },
    { context_category: 'External Environment', resource_category: 'Infrastructure & Physical Assets', risk_description: 'Legacy systems without adequate backups', likelihood_score: 2, impact_score: 5, existing_controls: 'Ad-hoc backups', additional_controls: 'Automated off-site backup + DR plan', status: 'Open' },
  ]

  const targets = orgIds.slice(0, 2)
  let totalItems = 0
  for (let i = 0; i < targets.length; i++) {
    const avg = itemsTemplate.reduce((a, it) => a + it.likelihood_score * it.impact_score, 0) / itemsTemplate.length
    const { data: pRow, error: pErr } = await sb.from('audit_risk_profiles').insert({
      org_unit_id: targets[i],
      project_name: i === 0 ? 'Land Titles Modernisation' : 'Divisional Risk Profile FY2026',
      profile_date: '2026-06-30',
      prepared_by: personId,
      overall_level: levelFor(avg),
      remarks: 'Initial risk profile prepared by Internal Audit.',
    }).select('id').single()
    if (pErr) { console.error('Risk profile error:', pErr.message); continue }
    const items = itemsTemplate.map((it) => ({
      risk_profile_id: (pRow as any).id,
      ...it,
      risk_score: it.likelihood_score * it.impact_score,
      target_date: '2027-06-30',
    }))
    const { error: iErr } = await sb.from('audit_risk_profile_items').insert(items)
    if (iErr) { console.error('Risk items error:', iErr.message); continue }
    totalItems += items.length
  }
  log(`✅ Risk Profiles: ${targets.length} profile(s), ${totalItems} risk items`)
}

// ---------------------------------------------------------------------------
async function main() {
  log('🌱 Seeding governance data into', url)
  // org_units requires migration 012; fail clearly if it is missing.
  const probe = await sb.from('org_units').select('id').limit(1)
  if (probe.error) {
    console.error('\n❌ org_units is missing. Run migration 012 first:')
    console.error('   supabase/migrations/012_org_units_self_contained.sql\n')
    process.exit(1)
  }
  const orgByCode = await seedOrgUnits()
  const orgIds = Object.values(orgByCode)
  const people = await seedPeople()
  const person = people[0]
  await seedKRA(orgIds[0])
  await seedPSAP(orgIds, person)
  await seedRiskProfiles(orgIds, person)
  log('\n✨ Governance seeding complete.')
}

main().catch((e) => { console.error(e); process.exit(1) })
