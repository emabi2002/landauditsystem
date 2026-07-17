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

export interface ReportSelectFilter {
  /** Filter key used in the ReportFilters bag. */
  key: string
  /** Underlying DB column the value is matched against. */
  column: string
  label: string
  options: { value: string; label: string }[]
}

export interface ReportDateFilter {
  /** DB column the from/to range is applied to. */
  column: string
  /** Human label shown in the UI (e.g. "Created", "Assessed"). */
  label: string
}

export interface ReportFilterSpec {
  /** When present, the report supports a from/to date range. */
  date?: ReportDateFilter
  /** Dropdown filters (status, rating, quarter, ...). */
  selects: ReportSelectFilter[]
}

export interface ReportDef {
  id: ReportId
  title: string
  description: string
  frequency: string
  category: ReportCategory
  filters: ReportFilterSpec
}

export interface ReportResult {
  /** Ordered column keys — also used as CSV/table headers. */
  columns: string[]
  /** Row objects keyed by the column names. */
  rows: Record<string, string | number>[]
  /** Base filename (no extension / date suffix). */
  filename: string
}

/** Active filter values chosen by the user (undefined / 'all' = no filter). */
export interface ReportFilters {
  from?: string
  to?: string
  [key: string]: string | undefined
}

const opt = (values: string[]) => values.map((v) => ({ value: v, label: v }))
const quarterOpts = [1, 2, 3, 4].map((q) => ({ value: String(q), label: `Q${q}` }))
const yearOpts = ['2024', '2025', '2026', '2027'].map((y) => ({ value: y, label: y }))

export const REPORTS: ReportDef[] = [
  {
    id: 'engagement-summary',
    title: 'Engagement Summary Report',
    description: 'Every audit engagement with status, timeline and linked findings.',
    frequency: 'Monthly',
    category: 'Audit Workflow',
    filters: {
      date: { column: 'created_at', label: 'Created' },
      selects: [
        {
          key: 'status',
          column: 'status',
          label: 'Status',
          options: opt(['Planning', 'Fieldwork', 'Reporting', 'Follow-up', 'Closed']),
        },
      ],
    },
  },
  {
    id: 'findings-recommendations',
    title: 'Findings & Recommendations',
    description: 'All findings by risk rating with their recommendation counts.',
    frequency: 'Quarterly',
    category: 'Audit Workflow',
    filters: {
      date: { column: 'created_at', label: 'Raised' },
      selects: [
        {
          key: 'risk_rating',
          column: 'risk_rating',
          label: 'Risk Rating',
          options: opt(['Critical', 'High', 'Medium', 'Low']),
        },
        {
          key: 'status',
          column: 'status',
          label: 'Status',
          options: opt(['Draft', 'Under Review', 'Closed']),
        },
      ],
    },
  },
  {
    id: 'action-plans',
    title: 'Action Plans Status',
    description: 'Implementation progress of every action plan against recommendations.',
    frequency: 'Weekly',
    category: 'Audit Workflow',
    filters: {
      date: { column: 'created_at', label: 'Created' },
      selects: [
        {
          key: 'status',
          column: 'status',
          label: 'Status',
          options: opt(['Not Started', 'In Progress', 'Completed', 'Overdue']),
        },
      ],
    },
  },
  {
    id: 'compliance-register',
    title: 'Compliance Register',
    description: 'Compliance obligations and the controls mitigating them.',
    frequency: 'Monthly',
    category: 'Risk & Compliance',
    filters: {
      date: { column: 'created_at', label: 'Created' },
      selects: [],
    },
  },
  {
    id: 'risk-register',
    title: 'Risk Register Report',
    description: 'Residual risk ratings and status across the enterprise register.',
    frequency: 'Monthly',
    category: 'Risk & Compliance',
    filters: {
      date: { column: 'identified_date', label: 'Identified' },
      selects: [
        {
          key: 'residual_risk_rating',
          column: 'residual_risk_rating',
          label: 'Residual Rating',
          options: opt(['Extreme', 'High', 'Medium', 'Low']),
        },
        {
          key: 'risk_status',
          column: 'risk_status',
          label: 'Status',
          options: opt(['Active', 'Under Review', 'Mitigated', 'Accepted', 'Closed', 'Escalated']),
        },
      ],
    },
  },
  {
    id: 'psap-scorecard',
    title: 'PSAP Scorecard Report',
    description: 'Quarterly PSAP financial & governance assessment scores.',
    frequency: 'Quarterly',
    category: 'Governance',
    filters: {
      date: { column: 'assessment_date', label: 'Assessed' },
      selects: [
        { key: 'financial_year', column: 'financial_year', label: 'Financial Year', options: yearOpts },
        { key: 'quarter', column: 'quarter', label: 'Quarter', options: quarterOpts },
        {
          key: 'overall_rating',
          column: 'overall_rating',
          label: 'Rating',
          options: opt(['Excellent', 'Good', 'Fair', 'Poor']),
        },
      ],
    },
  },
  {
    id: 'kra-workplan',
    title: 'KRA Workplan Report',
    description: 'Key Result Area activity status across financial years.',
    frequency: 'Quarterly',
    category: 'Governance',
    filters: {
      selects: [
        { key: 'financial_year', column: 'financial_year', label: 'Financial Year', options: yearOpts },
        { key: 'quarter', column: 'quarter', label: 'Quarter', options: quarterOpts },
        {
          key: 'status',
          column: 'status',
          label: 'Status',
          options: opt(['Completed', 'Ongoing', 'Not Started', 'Delayed', 'Not Measurable']),
        },
      ],
    },
  },
]

export function getReportDef(id: ReportId): ReportDef | undefined {
  return REPORTS.find((r) => r.id === id)
}

/** Human-readable summary of the active filters (for the printed cover). */
export function summarizeFilters(id: ReportId, filters?: ReportFilters): string {
  const def = getReportDef(id)
  if (!def || !filters) return ''
  const parts: string[] = []
  if (def.filters.date && (filters.from || filters.to)) {
    parts.push(`${def.filters.date.label}: ${filters.from || '…'} → ${filters.to || '…'}`)
  }
  for (const s of def.filters.selects) {
    const v = filters[s.key]
    if (v && v !== 'all') {
      parts.push(`${s.label}: ${s.options.find((o) => o.value === v)?.label || v}`)
    }
  }
  return parts.join('   •   ')
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

/** Exclusive upper bound = the day after `d` (works for date & timestamp cols). */
function nextDay(d: string): string {
  const dt = new Date(`${d}T00:00:00Z`)
  dt.setUTCDate(dt.getUTCDate() + 1)
  return dt.toISOString().slice(0, 10)
}

/** Apply a report's date-range + select filters to a Supabase query builder. */
function applyFilters(query: any, spec: ReportFilterSpec, filters?: ReportFilters) {
  if (!filters) return query
  if (spec.date) {
    if (filters.from) query = query.gte(spec.date.column, filters.from)
    if (filters.to) query = query.lt(spec.date.column, nextDay(filters.to))
  }
  for (const s of spec.selects) {
    const v = filters[s.key]
    if (v && v !== 'all') query = query.eq(s.column, v)
  }
  return query
}

const specOf = (id: ReportId): ReportFilterSpec => getReportDef(id)!.filters

// ---------------------------------------------------------------------------
// Report generators (LIVE data)
// ---------------------------------------------------------------------------

async function engagementSummary(filters?: ReportFilters): Promise<ReportResult> {
  // NB: the live `audit_engagements` table has no `engagement_number` column
  // (the generated types are stale), so we derive a reference from the id.
  let engQuery = supabase
    .from('audit_engagements')
    .select('id, title, status, start_date, end_date, created_at')
    .order('created_at', { ascending: false })
  engQuery = applyFilters(engQuery, specOf('engagement-summary'), filters)

  const [{ data: engagements }, { data: findings }] = await Promise.all([
    engQuery,
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

async function findingsRecommendations(filters?: ReportFilters): Promise<ReportResult> {
  let fQuery = supabase
    .from('audit_findings')
    .select('id, title, risk_rating, status, engagement_id, created_at')
    .order('created_at', { ascending: false })
  fQuery = applyFilters(fQuery, specOf('findings-recommendations'), filters)

  const [{ data: findings }, { data: recs }, engagementMap] = await Promise.all([
    fQuery,
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

async function actionPlans(filters?: ReportFilters): Promise<ReportResult> {
  let planQuery = supabase
    .from('audit_action_plans')
    .select('id, recommendation_id, action_owner_id, planned_action, progress_percentage, status, actual_completion_date, created_at')
    .order('created_at', { ascending: false })
  planQuery = applyFilters(planQuery, specOf('action-plans'), filters)

  const [{ data: plans }, recMap, peopleMap] = await Promise.all([
    planQuery,
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

async function complianceRegister(filters?: ReportFilters): Promise<ReportResult> {
  const res = await fetch('/api/compliance', { cache: 'no-store' })
  const json = await res.json().catch(() => ({}))
  let obligations: any[] = json.obligations || []
  const controls: any[] = json.controls || []
  const orgUnits: any[] = json.orgUnits || []

  // Compliance data comes from a server route, so the created-date range is
  // applied client-side here (ISO timestamps compare correctly as strings).
  if (filters?.from) obligations = obligations.filter((o) => (o.created_at || '') >= filters.from!)
  if (filters?.to) {
    const upper = nextDay(filters.to)
    obligations = obligations.filter((o) => (o.created_at || '') < upper)
  }

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

async function riskRegister(filters?: ReportFilters): Promise<ReportResult> {
  let riskQuery = supabase
    .from('audit_risk_register')
    .select('risk_code, risk_title, risk_category, residual_risk_rating, residual_risk_score, risk_status, division_id, identified_date')
    .order('residual_risk_score', { ascending: false })
  riskQuery = applyFilters(riskQuery, specOf('risk-register'), filters)

  const [{ data: risks }, divisionMap] = await Promise.all([
    riskQuery,
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

async function psapScorecard(filters?: ReportFilters): Promise<ReportResult> {
  let psapQuery = supabase
    .from('audit_psap_assessments')
    .select('org_unit_id, financial_year, quarter, overall_score, overall_rating, assessment_date, completed_by')
    .order('assessment_date', { ascending: false })
  psapQuery = applyFilters(psapQuery, specOf('psap-scorecard'), filters)

  const [{ data: assessments }, orgMap, peopleMap] = await Promise.all([
    psapQuery,
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

async function kraWorkplan(filters?: ReportFilters): Promise<ReportResult> {
  let statusQuery = supabase
    .from('audit_kra_activity_quarterly_status')
    .select('kra_activity_id, financial_year, quarter, status, narrative_status')
    .order('financial_year', { ascending: false })
  statusQuery = applyFilters(statusQuery, specOf('kra-workplan'), filters)

  const [{ data: statuses }, activityRes, kraRes] = await Promise.all([
    statusQuery,
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

const GENERATORS: Record<ReportId, (filters?: ReportFilters) => Promise<ReportResult>> = {
  'engagement-summary': engagementSummary,
  'findings-recommendations': findingsRecommendations,
  'action-plans': actionPlans,
  'compliance-register': complianceRegister,
  'risk-register': riskRegister,
  'psap-scorecard': psapScorecard,
  'kra-workplan': kraWorkplan,
}

export async function generateReport(id: ReportId, filters?: ReportFilters): Promise<ReportResult> {
  const gen = GENERATORS[id]
  if (!gen) throw new Error(`Unknown report: ${id}`)
  return gen(filters)
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
export function printReport(title: string, result: ReportResult, filterSummary?: string) {
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
        ${filterSummary ? `<span><strong>Filters:</strong> ${esc(filterSummary)}</span>` : ''}
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
