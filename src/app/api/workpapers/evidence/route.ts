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

interface EvidenceEntry {
  id: string
  workpaper_id: string
  file_name: string
  file_path: string
  description: string | null
  uploaded_by: string | null
  created_at: string
}

async function ensureBucket(s: ReturnType<typeof svc>) {
  const { data: buckets } = await s.storage.listBuckets()
  if (!buckets?.some((b) => b.id === EVIDENCE_BUCKET)) {
    await s.storage.createBucket(EVIDENCE_BUCKET, { public: false })
  }
}

// Upload a file and record it in the workpaper's metadata.evidence[].
export async function POST(req: NextRequest) {
  try {
    const form = await req.formData()
    const file = form.get('file') as File | null
    const workpaperId = form.get('workpaperId') as string | null
    const description = (form.get('description') as string | null) || null
    if (!file || !workpaperId) {
      return NextResponse.json({ error: 'file and workpaperId are required' }, { status: 400 })
    }

    const s = svc()
    await ensureBucket(s)

    const rand = Math.random().toString(36).slice(2, 8)
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
    const filePath = `${workpaperId}/${Date.now()}-${rand}-${safeName}`

    const { error: upErr } = await s.storage.from(EVIDENCE_BUCKET).upload(filePath, file, {
      upsert: false,
      contentType: file.type || undefined,
    })
    if (upErr) return NextResponse.json({ error: upErr.message }, { status: 400 })

    const entry: EvidenceEntry = {
      id: `${Date.now()}-${rand}`,
      workpaper_id: workpaperId,
      file_name: file.name,
      file_path: filePath,
      description,
      uploaded_by: null,
      created_at: new Date().toISOString(),
    }

    const { data: wp } = await s
      .from('audit_workpapers')
      .select('metadata')
      .eq('id', workpaperId)
      .single()
    const meta = ((wp as { metadata?: Record<string, unknown> })?.metadata) || {}
    const evidence = [...((meta.evidence as EvidenceEntry[]) || []), entry]
    const { error: updErr } = await s
      .from('audit_workpapers')
      .update({ metadata: { ...meta, evidence } } as never)
      .eq('id', workpaperId)
    if (updErr) {
      // Roll back the uploaded file if we couldn't record it.
      await s.storage.from(EVIDENCE_BUCKET).remove([filePath])
      return NextResponse.json({ error: updErr.message }, { status: 400 })
    }

    return NextResponse.json({ data: entry })
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 })
  }
}

// GET with ?workpaperId= returns the evidence list; GET with ?path= returns a
// short-lived signed URL for a stored evidence file. Both use the service role.
export async function GET(req: NextRequest) {
  try {
    const s = svc()
    const workpaperId = req.nextUrl.searchParams.get('workpaperId')
    if (workpaperId) {
      const { data, error } = await s
        .from('audit_workpapers')
        .select('metadata')
        .eq('id', workpaperId)
        .single()
      if (error) return NextResponse.json({ data: [], error: error.message }, { status: 400 })
      const meta = ((data as { metadata?: Record<string, unknown> })?.metadata) || {}
      const evidence = ((meta.evidence as EvidenceEntry[]) || []).map((e) => ({
        ...e,
        workpaper_id: e.workpaper_id ?? workpaperId,
      }))
      return NextResponse.json({ data: evidence })
    }

    const path = req.nextUrl.searchParams.get('path')
    if (!path) return NextResponse.json({ url: null }, { status: 400 })
    const { data, error } = await s.storage.from(EVIDENCE_BUCKET).createSignedUrl(path, 60 * 60)
    if (error) return NextResponse.json({ url: null }, { status: 400 })
    return NextResponse.json({ url: data?.signedUrl ?? null })
  } catch (e) {
    return NextResponse.json({ url: null, error: (e as Error).message }, { status: 500 })
  }
}

// Delete a file and remove its metadata entry.
export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json()
    const { workpaperId, evidenceId, filePath } = body
    if (!workpaperId || !evidenceId) {
      return NextResponse.json({ error: 'workpaperId and evidenceId are required' }, { status: 400 })
    }
    const s = svc()
    if (filePath) {
      await s.storage.from(EVIDENCE_BUCKET).remove([filePath])
    }
    const { data: wp } = await s
      .from('audit_workpapers')
      .select('metadata')
      .eq('id', workpaperId)
      .single()
    const meta = ((wp as { metadata?: Record<string, unknown> })?.metadata) || {}
    const evidence = ((meta.evidence as EvidenceEntry[]) || []).filter((e) => e.id !== evidenceId)
    const { error } = await s
      .from('audit_workpapers')
      .update({ metadata: { ...meta, evidence } } as never)
      .eq('id', workpaperId)
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json({ ok: true })
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 })
  }
}
