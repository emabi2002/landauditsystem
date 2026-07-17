import { supabase } from '@/lib/supabase'
import { exportToCSV } from '@/lib/utils/export'

// ---------------------------------------------------------------------------
// Report catalog
// Each report pulls LIVE data from Supabase, renders a preview table, and can
// be exported to CSV or printed to PDF. No mock data.
// ---------------------------------------------------------------------------

export type ReportId =
  | 'engagement-summary'
  | 'findings-recommendations'
  | 'action-plans'
  | 'compliance-register'
  | 'risk-register'
  | 'psap-scorecard'
  | 'kra-workplan'

export type ReportCategory = 'Audit Workflow' | 'Risk & Compliance' | 'Governance'

export interface ReportDef {
  id: ReportId
  title: string
  description: string
  frequency: string
  category: ReportCategory
}

export interface ReportResult {
  /** Ordered column keys — also used as CSV/table headers. */
  columns: string[]
  /** Row objects keyed by the column names. */
  rows: Record<string, string | number>[]
  /** Base filename (no extension / date suffix). */
  filename: string
}

export const REPORTS: ReportDef[] = [
  {
    id: 'engagement-summary',
    title: 'Engagement Summary Report',
    description: 'Every audit engagement with status, timeline and linked findings.',
    frequency: 'Monthly',
    category: 'Audit Workflow',
  },
  {
    id: 'findings-recommendations',
    title: 'Findings & Recommendations',
    description: 'All findings by risk rating with their recommendation counts.',
    frequency: 'Quarterly',
    category: 'Audit Workflow',
  },
  {
    id: 'action-plans',
    title: 'Action Plans Status',
    description: 'Implementation progress of every action plan against recommendations.',
    frequency: 'Weekly',
    category: 'Audit Workflow',
  },
  {
    id: 'compliance-register',
    title: 'Compliance Register',
    description: 'Compliance obligations and the controls mitigating them.',
    frequency: 'Monthly',
    category: 'Risk & Compliance',
  },
  {
    id: 'risk-register',
    title: 'Risk Register Report',
    description: 'Residual risk ratings and status across the enterprise register.',
    frequency: 'Monthly',
    category: 'Risk & Compliance',
  },
  {
    id: 'psap-scorecard',
    title: 'PSAP Scorecard Report',
    description: 'Quarterly PSAP financial & governance assessment scores.',
    frequency: 'Quarterly',
    category: 'Governance',
  },
  {
    id: 'kra-workplan',
    title: 'KRA Workplan Report',
    description: 'Key Result Area activity status across financial years.',
    frequency: 'Quarterly',
    category: 'Governance',
  },
]

export function getReportDef(id: ReportId): ReportDef | undefined {
  return REPORTS.find((r) => r.id === id)
}

// ---------------------------------------------------------------------------
// Small helpers
// ---------------------------------------------------------------------------

const fmtDate = (d: string | null | undefined) => {
  if (!d) return ''
  const date = new Date(d)
  if (Number.isNaN(date.getTime())) return String(d)
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

async function lookupMap(
  table: string,
  labelCol: string,
  filter?: (q: any) => any,
): Promise<Record<string, string>> {
  let q = supabase.from(table as any).select(`id, ${labelCol}`)
  if (filter) q = filter(q)
  const { data } = await q
  const map: Record<string, string> = {}
  for (const row of (data as any[]) || []) map[row.id] = row[labelCol]
  return map
}

// ---------------------------------------------------------------------------
// Report generators (LIVE data)
// ---------------------------------------------------------------------------

async function engagementSummary(): Promise<ReportResult> {
  const [{ data: engagements }, { data: findings }] = await Promise.all([
    // NB: the live `audit_engagements` table has no `engagement_number` column
    // (the generated types are stale), so we derive a reference from the id.
    supabase
      .from('audit_engagements')
      .select('id, title, status, start_date, end_date, created_at')
      .order('created_at', { ascending: false }),
    supabase.from('audit_findings').select('id, engagement_id'),
  ])

  const findingCount: Record<string, number> = {}
  for (const f of (findings as any[]) || []) {
    if (f.engagement_id) findingCount[f.engagement_id] = (findingCount[f.engagement_id] || 0) + 1
  }

  const rows = ((engagements as any[]) || []).map((e) => ({
    'Reference': `ENG-${String(e.id).slice(0, 8).toUpperCase()}`,
    'Title': e.title || '',
    'Status': e.status || '',
    'Start Date': fmtDate(e.start_date),
    'End Date': e.end_date ? fmtDate(e.end_date) : 'Ongoing',
    'Findings': findingCount[e.id] || 0,
    'Created': fmtDate(e.created_at),
  }))

  return {
    columns: ['Reference', 'Title', 'Status', 'Start Date', 'End Date', 'Findings', 'Created'],
    rows,
    filename: 'Engagement_Summary',
  }
}

async function findingsRecommendations(): Promise<ReportResult> {
  const [{ data: findings }, { data: recs }, engagementMap] = await Promise.all([
    supabase
      .from('audit_findings')
      .select('id, title, risk_rating, status, engagement_id, created_at')
      .order('created_at', { ascending: false }),
    supabase.from('audit_recommendations').select('id, finding_id, status'),
    lookupMap('audit_engagements', 'title'),
  ])

  const recCount: Record<string, number> = {}
  const recPublished: Record<string, number> = {}
  for (const r of (recs as any[]) || []) {
    if (!r.finding_id) continue
    recCount[r.finding_id] = (recCount[r.finding_id] || 0) + 1
    if (r.status === 'Published') recPublished[r.finding_id] = (recPublished[r.finding_id] || 0) + 1
  }

  const rows = ((findings as any[]) || []).map((f) => ({
    'Finding': f.title || '',
    'Engagement': engagementMap[f.engagement_id] || '—',
    'Risk Rating': f.risk_rating || '',
    'Status': f.status || '',
    'Recommendations': recCount[f.id] || 0,
    'Published': recPublished[f.id] || 0,
    'Raised': fmtDate(f.created_at),
  }))

  return {
    columns: ['Finding', 'Engagement', 'Risk Rating', 'Status', 'Recommendations', 'Published', 'Raised'],
    rows,
    filename: 'Findings_and_Recommendations',
  }
}

async function actionPlans(): Promise<ReportResult> {
  const [{ data: plans }, recMap, peopleMap] = await Promise.all([
    supabase
      .from('audit_action_plans')
      .select('id, recommendation_id, action_owner_id, planned_action, progress_percentage, status, actual_completion_date, created_at')
      .order('created_at', { ascending: false }),
    lookupMap('audit_recommendations', 'recommendation_text'),
    lookupMap('people', 'full_name'),
  ])

  const rows = ((plans as any[]) || []).map((p) => ({
    'Action': p.planned_action || '',
    'Recommendation': recMap[p.recommendation_id] || '—',
    'Owner': peopleMap[p.action_owner_id] || 'Unassigned',
    'Progress %': p.progress_percentage ?? 0,
    'Status': p.status || '',
    'Completed': p.actual_completion_date ? fmtDate(p.actual_completion_date) : '',
  }))

  return {
    columns: ['Action', 'Recommendation', 'Owner', 'Progress %', 'Status', 'Completed'],
    rows,
    filename: 'Action_Plans_Status',
  }
}

async function complianceRegister(): Promise<ReportResult> {
  const res = await fetch('/api/compliance', { cache: 'no-store' })
  const json = await res.json().catch(() => ({}))
  const obligations: any[] = json.obligations || []
  const controls: any[] = json.controls || []
  const orgUnits: any[] = json.orgUnits || []

  const unitName: Record<string, string> = {}
  for (const u of orgUnits) unitName[u.id] = u.name

  const controlsFor: Record<string, any[]> = {}
  for (const c of controls) {
    if (!c.obligation_id) continue
    ;(controlsFor[c.obligation_id] ||= []).push(c)
  }

  const rows = obligations.map((o) => {
    const linked = controlsFor[o.id] || []
    const effective = linked.filter((c) => c.effectiveness === 'Effective').length
    return {
      'Obligation': o.title || '',
      'Source': o.source || '',
      'Category': o.category || '',
      'Owner Unit': unitName[o.owner_unit_id] || '—',
      'Controls': linked.length,
      'Effective Controls': effective,
    }
  })

  return {
    columns: ['Obligation', 'Source', 'Category', 'Owner Unit', 'Controls', 'Effective Controls'],
    rows,
    filename: 'Compliance_Register',
  }
}

async function riskRegister(): Promise<ReportResult> {
  const [{ data: risks }, divisionMap] = await Promise.all([
    supabase
      .from('audit_risk_register')
      .select('risk_code, risk_title, risk_category, residual_risk_rating, residual_risk_score, risk_status, division_id')
      .order('residual_risk_score', { ascending: false }),
    lookupMap('audit_divisions', 'name'),
  ])

  const rows = ((risks as any[]) || []).map((r) => ({
    'Code': r.risk_code || '',
    'Risk': r.risk_title || '',
    'Category': r.risk_category || '',
    'Division': divisionMap[r.division_id] || '—',
    'Residual Rating': r.residual_risk_rating || '',
    'Score': r.residual_risk_score ?? '',
    'Status': r.risk_status || '',
  }))

  return {
    columns: ['Code', 'Risk', 'Category', 'Division', 'Residual Rating', 'Score', 'Status'],
    rows,
    filename: 'Risk_Register',
  }
}

async function psapScorecard(): Promise<ReportResult> {
  const [{ data: assessments }, orgMap, peopleMap] = await Promise.all([
    supabase
      .from('audit_psap_assessments')
      .select('org_unit_id, financial_year, quarter, overall_score, overall_rating, assessment_date, completed_by')
      .order('assessment_date', { ascending: false }),
    lookupMap('org_units', 'name'),
    lookupMap('people', 'full_name'),
  ])

  const rows = ((assessments as any[]) || []).map((a) => ({
    'Organization Unit': orgMap[a.org_unit_id] || '—',
    'Financial Year': a.financial_year ?? '',
    'Quarter': a.quarter ? `Q${a.quarter}` : '',
    'Overall Score': a.overall_score != null ? Number(a.overall_score).toFixed(1) : '',
    'Rating': a.overall_rating || '',
    'Completed By': peopleMap[a.completed_by] || '—',
    'Assessed': fmtDate(a.assessment_date),
  }))

  return {
    columns: ['Organization Unit', 'Financial Year', 'Quarter', 'Overall Score', 'Rating', 'Completed By', 'Assessed'],
    rows,
    filename: 'PSAP_Scorecard',
  }
}

async function kraWorkplan(): Promise<ReportResult> {
  const [{ data: statuses }, activityRes, kraRes] = await Promise.all([
    supabase
      .from('audit_kra_activity_quarterly_status')
      .select('kra_activity_id, financial_year, quarter, status, narrative_status')
      .order('financial_year', { ascending: false }),
    // Select all columns: the activity→KRA foreign key is named `strategic_kra_id`
    // in some environments and `kra_id` in others; selecting * avoids a 400 on a
    // missing column and we resolve whichever exists at runtime.
    supabase.from('audit_kra_activities').select('*'),
    supabase.from('audit_strategic_kras').select('*'),
  ])

  const activities: Record<string, any> = {}
  for (const a of (activityRes.data as any[]) || []) activities[a.id] = a
  const kras: Record<string, any> = {}
  for (const k of (kraRes.data as any[]) || []) kras[k.id] = k

  const rows = ((statuses as any[]) || []).map((s) => {
    const act = activities[s.kra_activity_id] || {}
    const kra = kras[act.strategic_kra_id || act.kra_id] || {}
    return {
      'KRA': kra.kra_code ? `${kra.kra_code} — ${kra.kra_title}` : '—',
      'Activity': act.activity_code ? `${act.activity_code}: ${act.description}` : act.description || '—',
      'Year': s.financial_year ?? '',
      'Quarter': s.quarter ? `Q${s.quarter}` : '',
      'Status': s.status || 'Not Started',
      'Narrative': s.narrative_status || '',
    }
  })

  return {
    columns: ['KRA', 'Activity', 'Year', 'Quarter', 'Status', 'Narrative'],
    rows,
    filename: 'KRA_Workplan',
  }
}

const GENERATORS: Record<ReportId, () => Promise<ReportResult>> = {
  'engagement-summary': engagementSummary,
  'findings-recommendations': findingsRecommendations,
  'action-plans': actionPlans,
  'compliance-register': complianceRegister,
  'risk-register': riskRegister,
  'psap-scorecard': psapScorecard,
  'kra-workplan': kraWorkplan,
}

export async function generateReport(id: ReportId): Promise<ReportResult> {
  const gen = GENERATORS[id]
  if (!gen) throw new Error(`Unknown report: ${id}`)
  return gen()
}

// ---------------------------------------------------------------------------
// Export + print
// ---------------------------------------------------------------------------

export function exportReportCSV(result: ReportResult) {
  // exportToCSV derives headers from object keys; our rows already use the
  // column names as keys, so ordering + headers match the preview table.
  exportToCSV(result.rows, result.filename)
}

function esc(text: string | number): string {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

const PRINT_STYLES = `
  * { box-sizing: border-box; }
  body { font-family: -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif; color: #0f172a; margin: 0; padding: 40px; line-height: 1.5; }
  .cover { border-bottom: 3px solid #059669; padding-bottom: 20px; margin-bottom: 24px; }
  .cover .eyebrow { text-transform: uppercase; letter-spacing: .08em; font-size: 11px; font-weight: 700; color: #059669; margin: 0 0 6px; }
  .cover h1 { font-size: 24px; margin: 0 0 6px; color: #064e3b; }
  .cover p { margin: 2px 0; color: #475569; font-size: 13px; }
  .meta { display: flex; gap: 24px; margin: 0 0 18px; font-size: 12px; color: #475569; }
  .meta strong { color: #0f172a; }
  table { width: 100%; border-collapse: collapse; font-size: 11px; }
  thead { display: table-header-group; }
  th, td { border: 1px solid #e2e8f0; padding: 6px 8px; text-align: left; vertical-align: top; }
  th { background: #ecfdf5; color: #065f46; font-weight: 600; white-space: nowrap; }
  tr:nth-child(even) td { background: #f8fafc; }
  .empty { padding: 24px; text-align: center; color: #94a3b8; font-size: 13px; border: 1px dashed #e2e8f0; border-radius: 8px; }
  @page { margin: 16mm; size: A4 landscape; }
`

/** Print a tabular report to PDF via a hidden iframe (safe in embedded previews). */
export function printReport(title: string, result: ReportResult) {
  if (typeof document === 'undefined') return

  const iframe = document.createElement('iframe')
  iframe.style.position = 'fixed'
  iframe.style.right = '0'
  iframe.style.bottom = '0'
  iframe.style.width = '0'
  iframe.style.height = '0'
  iframe.style.border = '0'
  document.body.appendChild(iframe)

  const doc = iframe.contentWindow?.document
  if (!doc) {
    iframe.remove()
    return
  }

  const generated = new Date().toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  const head = result.columns.map((c) => `<th>${esc(c)}</th>`).join('')
  const body = result.rows
    .map(
      (row) =>
        `<tr>${result.columns.map((c) => `<td>${esc(row[c] ?? '')}</td>`).join('')}</tr>`,
    )
    .join('')

  const tableHtml = result.rows.length
    ? `<table><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table>`
    : `<div class="empty">No records available for this report.</div>`

  doc.open()
  doc.write(`<!doctype html><html><head><meta charset="utf-8" /><title>${esc(title)}</title><style>${PRINT_STYLES}</style></head>
    <body>
      <div class="cover">
        <p class="eyebrow">DLPP Internal Audit &amp; Compliance System</p>
        <h1>${esc(title)}</h1>
        <p>Department of Lands &amp; Physical Planning</p>
      </div>
      <div class="meta">
        <span><strong>Records:</strong> ${result.rows.length}</span>
        <span><strong>Generated:</strong> ${esc(generated)}</span>
      </div>
      ${tableHtml}
    </body></html>`)
  doc.close()

  const cleanup = () => window.setTimeout(() => iframe.remove(), 1000)
  iframe.contentWindow?.focus()
  window.setTimeout(() => {
    try {
      iframe.contentWindow?.print()
    } finally {
      cleanup()
    }
  }, 300)
}
