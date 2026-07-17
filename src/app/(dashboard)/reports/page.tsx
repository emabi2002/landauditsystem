'use client'

import { useEffect, useMemo, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Download,
  FileText,
  BarChart3,
  TrendingUp,
  Briefcase,
  AlertTriangle,
  CheckCircle,
  ShieldCheck,
  Target,
  Printer,
  Eye,
  Loader2,
  ClipboardCheck,
} from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts'
import { PageHeader, PageContainer } from '@/components/layout/PageHeader'
import { HelpTooltip } from '@/components/help/HelpTooltip'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import {
  REPORTS,
  generateReport,
  exportReportCSV,
  printReport,
  getReportDef,
  type ReportId,
  type ReportResult,
  type ReportCategory,
} from '@/lib/reports'

const categoryIcon: Record<ReportCategory, typeof Briefcase> = {
  'Audit Workflow': Briefcase,
  'Risk & Compliance': ShieldCheck,
  Governance: Target,
}

const CATEGORY_ORDER: ReportCategory[] = ['Audit Workflow', 'Risk & Compliance', 'Governance']

interface Analytics {
  engagements: number
  openFindings: number
  publishedRecs: number
  actionPlans: number
  avgProgress: number
  highRisks: number
  avgPsap: number | null
  findingsByRating: { name: string; value: number; color: string }[]
  risksByRating: { name: string; value: number; color: string }[]
}

const RATING_COLORS: Record<string, string> = {
  Critical: '#dc2626',
  Extreme: '#dc2626',
  High: '#f97316',
  Medium: '#eab308',
  Moderate: '#eab308',
  Low: '#22c55e',
}

export default function ReportsPage() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [loading, setLoading] = useState(true)

  // Report preview state
  const [activeReport, setActiveReport] = useState<ReportId | null>(null)
  const [result, setResult] = useState<ReportResult | null>(null)
  const [previewLoading, setPreviewLoading] = useState(false)
  const [busyId, setBusyId] = useState<ReportId | null>(null)

  useEffect(() => {
    loadAnalytics()
  }, [])

  const loadAnalytics = async () => {
    setLoading(true)
    try {
      const [findingsRes, engRes, recRes, planRes, riskRes, psapRes] = await Promise.all([
        supabase.from('audit_findings').select('risk_rating, status'),
        supabase.from('audit_engagements').select('id', { count: 'exact', head: true }),
        supabase.from('audit_recommendations').select('status'),
        supabase.from('audit_action_plans').select('status, progress_percentage'),
        supabase.from('audit_risk_register').select('residual_risk_rating'),
        supabase.from('audit_psap_assessments').select('overall_score'),
      ])

      const findings = (findingsRes.data as any[]) || []
      const recs = (recRes.data as any[]) || []
      const plans = (planRes.data as any[]) || []
      const risks = (riskRes.data as any[]) || []
      const psap = (psapRes.data as any[]) || []

      const ratingCount = (arr: any[], key: string, buckets: string[]) =>
        buckets.map((b) => ({
          name: b,
          value: arr.filter((x) => x[key] === b).length,
          color: RATING_COLORS[b] || '#94a3b8',
        }))

      const avgProgress = plans.length
        ? Math.round(plans.reduce((s, p) => s + (p.progress_percentage || 0), 0) / plans.length)
        : 0

      const psapScores = psap.map((p) => Number(p.overall_score)).filter((n) => !Number.isNaN(n))
      const avgPsap = psapScores.length
        ? Math.round((psapScores.reduce((s, n) => s + n, 0) / psapScores.length) * 10) / 10
        : null

      setAnalytics({
        engagements: engRes.count || 0,
        openFindings: findings.filter((f) => f.status !== 'Closed').length,
        publishedRecs: recs.filter((r) => r.status === 'Published').length,
        actionPlans: plans.length,
        avgProgress,
        highRisks: risks.filter((r) => ['High', 'Extreme'].includes(r.residual_risk_rating)).length,
        avgPsap,
        findingsByRating: ratingCount(findings, 'risk_rating', ['Critical', 'High', 'Medium', 'Low']),
        risksByRating: ratingCount(risks, 'residual_risk_rating', ['Extreme', 'High', 'Medium', 'Low']),
      })
    } catch (e) {
      console.error('Failed to load analytics', e)
    } finally {
      setLoading(false)
    }
  }

  const openPreview = async (id: ReportId) => {
    setActiveReport(id)
    setResult(null)
    setPreviewLoading(true)
    try {
      const res = await generateReport(id)
      setResult(res)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to generate report')
      setActiveReport(null)
    } finally {
      setPreviewLoading(false)
    }
  }

  const runExport = async (id: ReportId) => {
    setBusyId(id)
    try {
      const res = await generateReport(id)
      if (res.rows.length === 0) {
        toast.info('No records to export for this report yet.')
        return
      }
      exportReportCSV(res)
      toast.success(`Exported ${res.rows.length} record${res.rows.length === 1 ? '' : 's'} to CSV`)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to export report')
    } finally {
      setBusyId(null)
    }
  }

  const runPrint = async (id: ReportId) => {
    const def = getReportDef(id)
    setBusyId(id)
    try {
      const res = await generateReport(id)
      printReport(def?.title || 'Report', res)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to print report')
    } finally {
      setBusyId(null)
    }
  }

  const activeDef = activeReport ? getReportDef(activeReport) : null

  const kpis = useMemo(() => {
    if (!analytics) return []
    return [
      { label: 'Engagements', value: analytics.engagements, icon: Briefcase, color: 'text-slate-700', bg: 'bg-slate-100' },
      { label: 'Open Findings', value: analytics.openFindings, icon: AlertTriangle, color: 'text-orange-600', bg: 'bg-orange-50' },
      { label: 'Published Recs', value: analytics.publishedRecs, icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50' },
      { label: 'Action Plans', value: analytics.actionPlans, icon: ClipboardCheck, color: 'text-blue-600', bg: 'bg-blue-50' },
      { label: 'High / Extreme Risks', value: analytics.highRisks, icon: ShieldCheck, color: 'text-red-600', bg: 'bg-red-50' },
      { label: 'Avg PSAP Score', value: analytics.avgPsap ?? '—', icon: Target, color: 'text-teal-600', bg: 'bg-teal-50' },
    ]
  }, [analytics])

  return (
    <>
      <PageHeader
        icon={BarChart3}
        title="Reports"
        subtitle="Generate, preview and export audit reports from live data"
        actions={
          <div className="flex items-center gap-1.5">
            <Button
              size="sm"
              variant="outline"
              onClick={() => runExport('engagement-summary')}
              disabled={busyId !== null}
            >
              <Download className="mr-2 h-4 w-4" />
              Quick Export
            </Button>
            <HelpTooltip tooltipKey="reports-export" label="Export" side="left" />
          </div>
        }
      />
      <PageContainer>
        <div className="space-y-6">
          {/* Live analytics */}
          <div data-tour="kpi-cards" className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
            {loading
              ? Array.from({ length: 6 }).map((_, i) => (
                  <Card key={i} className="p-4">
                    <div className="h-14 animate-pulse rounded bg-slate-100" />
                  </Card>
                ))
              : kpis.map((k) => (
                  <Card key={k.label} className="p-4">
                    <div className={`inline-flex h-9 w-9 items-center justify-center rounded-lg ${k.bg} mb-3`}>
                      <k.icon className={`h-5 w-5 ${k.color}`} />
                    </div>
                    <p className="text-2xl font-bold text-slate-900 leading-none">{k.value}</p>
                    <p className="mt-1 text-xs text-slate-500">{k.label}</p>
                  </Card>
                ))}
          </div>

          {/* Charts */}
          <div data-tour="charts" className="grid gap-6 lg:grid-cols-2">
            <Card className="p-6">
              <h3 className="mb-4 flex items-center gap-1.5 text-base font-semibold text-slate-900">
                <FileText className="h-4 w-4 text-slate-500" />
                Findings by Risk Rating
              </h3>
              {analytics && analytics.findingsByRating.some((f) => f.value > 0) ? (
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie
                      data={analytics.findingsByRating.filter((f) => f.value > 0)}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={95}
                      paddingAngle={2}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}`}
                    >
                      {analytics.findingsByRating.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <RTooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <EmptyChart icon={FileText} label="No findings recorded yet" />
              )}
            </Card>

            <Card className="p-6">
              <h3 className="mb-4 flex items-center gap-1.5 text-base font-semibold text-slate-900">
                <ShieldCheck className="h-4 w-4 text-slate-500" />
                Risk Register by Residual Rating
              </h3>
              {analytics && analytics.risksByRating.some((r) => r.value > 0) ? (
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={analytics.risksByRating}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                    <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
                    <YAxis stroke="#64748b" fontSize={12} allowDecimals={false} />
                    <RTooltip
                      contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: 8 }}
                    />
                    <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                      {analytics.risksByRating.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <EmptyChart icon={ShieldCheck} label="No risks recorded yet" />
              )}
            </Card>
          </div>

          {/* Report library */}
          <div data-tour="table" className="space-y-6">
            <div className="flex items-center gap-1.5">
              <h2 className="text-lg font-semibold text-slate-900">Report Library</h2>
              <HelpTooltip tooltipKey="reports-preview" label="Report templates" />
            </div>

            {CATEGORY_ORDER.map((cat) => {
              const catReports = REPORTS.filter((r) => r.category === cat)
              if (catReports.length === 0) return null
              const CatIcon = categoryIcon[cat]
              return (
                <div key={cat} className="space-y-3">
                  <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
                    <CatIcon className="h-4 w-4" />
                    {cat}
                  </div>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {catReports.map((r) => {
                      const busy = busyId === r.id
                      return (
                        <Card
                          key={r.id}
                          className="flex flex-col p-5 transition-shadow hover:shadow-md"
                        >
                          <div className="mb-3 flex items-start justify-between">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50">
                              <BarChart3 className="h-5 w-5 text-emerald-600" />
                            </div>
                            <Badge variant="outline" className="text-xs font-normal text-slate-500">
                              {r.frequency}
                            </Badge>
                          </div>
                          <h3 className="font-semibold text-slate-900">{r.title}</h3>
                          <p className="mt-1 flex-1 text-sm text-slate-600">{r.description}</p>
                          <div className="mt-4 flex items-center gap-2">
                            <Button
                              size="sm"
                              className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                              onClick={() => openPreview(r.id)}
                              disabled={busy}
                            >
                              <Eye className="mr-1.5 h-4 w-4" />
                              Preview
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              title="Export CSV"
                              onClick={() => runExport(r.id)}
                              disabled={busy}
                            >
                              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              title="Print / PDF"
                              onClick={() => runPrint(r.id)}
                              disabled={busy}
                            >
                              <Printer className="h-4 w-4" />
                            </Button>
                          </div>
                        </Card>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </PageContainer>

      {/* Preview dialog */}
      <Dialog open={!!activeReport} onOpenChange={(o) => !o && setActiveReport(null)}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-emerald-600" />
              {activeDef?.title}
            </DialogTitle>
            <DialogDescription>{activeDef?.description}</DialogDescription>
          </DialogHeader>

          {previewLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
            </div>
          ) : result ? (
            <>
              <div className="flex items-center justify-between border-y border-slate-100 py-2 text-sm text-slate-500">
                <span>
                  <strong className="text-slate-900">{result.rows.length}</strong> record
                  {result.rows.length === 1 ? '' : 's'}
                </span>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      if (result.rows.length === 0) return toast.info('No records to export.')
                      exportReportCSV(result)
                      toast.success('Exported to CSV')
                    }}
                  >
                    <Download className="mr-1.5 h-4 w-4" />
                    Export CSV
                  </Button>
                  <Button
                    size="sm"
                    className="bg-emerald-600 hover:bg-emerald-700"
                    onClick={() => printReport(activeDef?.title || 'Report', result)}
                  >
                    <Printer className="mr-1.5 h-4 w-4" />
                    Print / PDF
                  </Button>
                </div>
              </div>

              <div className="overflow-auto">
                {result.rows.length === 0 ? (
                  <div className="py-16 text-center text-slate-500">
                    <TrendingUp className="mx-auto mb-3 h-12 w-12 text-slate-300" />
                    <p>No records available for this report yet.</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-slate-50">
                        {result.columns.map((c) => (
                          <TableHead key={c} className="whitespace-nowrap font-semibold">
                            {c}
                          </TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {result.rows.map((row, i) => (
                        <TableRow key={i} className="hover:bg-slate-50">
                          {result.columns.map((c) => (
                            <TableCell key={c} className="max-w-[280px] truncate align-top text-sm">
                              {String(row[c] ?? '')}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </div>
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  )
}

function EmptyChart({ icon: Icon, label }: { icon: typeof FileText; label: string }) {
  return (
    <div className="flex h-[260px] flex-col items-center justify-center text-slate-400">
      <Icon className="mb-3 h-12 w-12 text-slate-300" />
      <p className="text-sm">{label}</p>
    </div>
  )
}
