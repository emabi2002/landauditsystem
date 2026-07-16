import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * Service-role Supabase client. Runs ONLY on the server so the service key is
 * never exposed to the browser. The `audit_obligations` and `audit_controls`
 * tables have RLS enabled with NO write policy for anon/authenticated (inserts
 * return 42501), so all compliance writes must go through this route.
 */
function svc() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}

type Resource = 'obligation' | 'control'

const OBLIGATION_FIELDS = ['title', 'source', 'category', 'description', 'owner_unit_id'] as const
const CONTROL_FIELDS = [
  'title',
  'control_type',
  'description',
  'owner_unit_id',
  'obligation_id',
  'frequency',
  'effectiveness',
] as const

function tableFor(resource: Resource) {
  return resource === 'control' ? 'audit_controls' : 'audit_obligations'
}

/** Keep only known columns; coerce empty strings to null. */
function pick(body: Record<string, unknown>, fields: readonly string[]) {
  const out: Record<string, unknown> = {}
  for (const f of fields) {
    if (body[f] !== undefined) {
      const v = body[f]
      out[f] = typeof v === 'string' && v.trim() === '' ? null : v
    }
  }
  return out
}

// ---- GET: list obligations + controls (+ org units for names/dropdowns) -----
export async function GET() {
  try {
    const s = svc()
    const [obRes, ctRes, ouRes] = await Promise.all([
      s.from('audit_obligations').select('*').order('created_at', { ascending: false }),
      s.from('audit_controls').select('*').order('created_at', { ascending: false }),
      s.from('org_units').select('id, name, code').eq('is_active', true).order('name'),
    ])
    if (obRes.error) return NextResponse.json({ error: obRes.error.message }, { status: 400 })
    if (ctRes.error) return NextResponse.json({ error: ctRes.error.message }, { status: 400 })

    return NextResponse.json({
      obligations: obRes.data || [],
      controls: ctRes.data || [],
      orgUnits: ouRes.data || [],
    })
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 })
  }
}

// ---- POST: create an obligation or control ----------------------------------
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const resource = body.resource as Resource
    if (resource !== 'obligation' && resource !== 'control') {
      return NextResponse.json({ error: 'Invalid resource' }, { status: 400 })
    }
    if (!body.title || String(body.title).trim() === '') {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 })
    }
    if (resource === 'obligation' && (!body.source || String(body.source).trim() === '')) {
      return NextResponse.json({ error: 'Source is required for an obligation' }, { status: 400 })
    }

    const fields = resource === 'control' ? CONTROL_FIELDS : OBLIGATION_FIELDS
    const values = pick(body, fields)

    const s = svc()
    const { data, error } = await s.from(tableFor(resource)).insert(values as never).select().single()
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json({ data })
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 })
  }
}

// ---- PUT: update an obligation or control -----------------------------------
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json()
    const resource = body.resource as Resource
    const id = body.id
    if (resource !== 'obligation' && resource !== 'control') {
      return NextResponse.json({ error: 'Invalid resource' }, { status: 400 })
    }
    if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 })

    const fields = resource === 'control' ? CONTROL_FIELDS : OBLIGATION_FIELDS
    const values = pick(body, fields)
    values.updated_at = new Date().toISOString()

    const s = svc()
    const { data, error } = await s
      .from(tableFor(resource))
      .update(values as never)
      .eq('id', id)
      .select()
      .single()
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json({ data })
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 })
  }
}

// ---- DELETE: remove an obligation (+ its controls) or a control -------------
export async function DELETE(req: NextRequest) {
  try {
    const resource = req.nextUrl.searchParams.get('resource') as Resource | null
    const id = req.nextUrl.searchParams.get('id')
    if (resource !== 'obligation' && resource !== 'control') {
      return NextResponse.json({ error: 'Invalid resource' }, { status: 400 })
    }
    if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 })

    const s = svc()
    // Deleting an obligation first detaches its controls to avoid FK errors.
    if (resource === 'obligation') {
      await s.from('audit_controls').update({ obligation_id: null } as never).eq('obligation_id', id)
    }
    const { error } = await s.from(tableFor(resource)).delete().eq('id', id)
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json({ data: { id } })
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 })
  }
}
