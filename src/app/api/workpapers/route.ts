import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const EVIDENCE_BUCKET = 'workpaper-evidence'

function svc() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
  return createClient(url, key)
}

const SELECT = '*, audit_engagements(title)'

/**
 * Map the rich UI payload onto the existing `audit_workpapers` columns:
 *  - procedure_performed -> procedure
 *  - sample_population    -> sample_ref
 *  - everything else      -> metadata (jsonb)
 */
function buildMetadata(p: Record<string, unknown>, existing: Record<string, unknown> = {}) {
  return {
    ...existing,
    wp_number: p.wp_number ?? existing.wp_number ?? null,
    test_objective: p.test_objective ?? null,
    result: p.result ?? null,
    conclusion: p.conclusion ?? null,
    conclusion_rating: p.conclusion_rating ?? 'Not Concluded',
    status: p.status ?? 'Draft',
    prepared_by: p.prepared_by ?? null,
    // Preserve evidence across updates.
    evidence: (existing.evidence as unknown[]) ?? [],
  }
}

// List workpapers (or a single one by ?id=), read via the service role so the
// browser reliably sees rows regardless of the table's RLS.
export async function GET(req: NextRequest) {
  try {
    const s = svc()
    const id = req.nextUrl.searchParams.get('id')
    const base = s.from('audit_workpapers').select(SELECT)
    const filtered = id ? base.eq('id', id) : base
    const { data, error } = await filtered.order('created_at', { ascending: false })
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json({ data: data || [] })
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    if (!body.engagement_id || !body.title) {
      return NextResponse.json({ error: 'engagement_id and title are required' }, { status: 400 })
    }
    const s = svc()
    const row = {
      engagement_id: body.engagement_id,
      title: body.title,
      procedure: body.procedure_performed ?? null,
      sample_ref: body.sample_population ?? null,
      metadata: buildMetadata(body),
    }
    const { data, error } = await s
      .from('audit_workpapers')
      .insert(row as never)
      .select(SELECT)
      .single()
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json({ data })
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json()
    const { id } = body
    if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 })
    const s = svc()
    // Preserve existing metadata (esp. evidence) on update.
    const { data: existing } = await s
      .from('audit_workpapers')
      .select('metadata')
      .eq('id', id)
      .single()
    const existingMeta = ((existing as { metadata?: Record<string, unknown> })?.metadata) || {}
    const row = {
      title: body.title,
      procedure: body.procedure_performed ?? null,
      sample_ref: body.sample_population ?? null,
      metadata: buildMetadata(body, existingMeta),
    }
    const { data, error } = await s
      .from('audit_workpapers')
      .update(row as never)
      .eq('id', id)
      .select(SELECT)
      .single()
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json({ data })
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const id = req.nextUrl.searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 })
    const s = svc()
    // Remove any evidence files from storage first.
    const { data: wp } = await s.from('audit_workpapers').select('metadata').eq('id', id).single()
    const evidence =
      (((wp as { metadata?: { evidence?: Array<{ file_path?: string }> } })?.metadata?.evidence) as
        | Array<{ file_path?: string }>
        | undefined) || []
    const paths = evidence.map((e) => e.file_path).filter(Boolean) as string[]
    if (paths.length) {
      await s.storage.from(EVIDENCE_BUCKET).remove(paths)
    }
    const { error } = await s.from('audit_workpapers').delete().eq('id', id)
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json({ ok: true })
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 })
  }
}
