import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * Service-role Supabase client. Runs ONLY on the server so the service key is
 * never exposed to the browser. Used to (a) create real auth logins with a
 * password via the Auth Admin API and (b) manage the shared user directory
 * (`users` / `profiles`), per-app access (`user_system_access`) and RBAC group
 * membership (`user_groups`) — bypassing RLS safely.
 */
function svc() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}

interface MergedUser {
  id: string
  email: string
  full_name: string | null
  phone: string | null
  department: string | null
  role: string | null
  status: string | null
  created_at: string | null
  systems: string[]
  groups: { id: string; group_name: string; description: string | null; system: string | null }[]
}

// ---- GET: list all shared users, merged with systems + groups ---------------
export async function GET() {
  try {
    const s = svc()

    const [usersRes, accessRes, ugRes] = await Promise.all([
      s
        .from('users')
        .select('id, email, full_name, phone, department, role, status, created_at')
        .order('full_name', { ascending: true }),
      s.from('user_system_access').select('user_id, system'),
      s.from('user_groups').select('user_id, group_id, groups(id, group_name, description, system)'),
    ])

    if (usersRes.error) {
      return NextResponse.json({ error: usersRes.error.message }, { status: 400 })
    }

    const accessByUser = new Map<string, string[]>()
    for (const a of (accessRes.data as any[]) || []) {
      if (!a?.user_id) continue
      const list = accessByUser.get(a.user_id) || []
      if (a.system) list.push(a.system)
      accessByUser.set(a.user_id, list)
    }

    const groupsByUser = new Map<string, MergedUser['groups']>()
    for (const ug of (ugRes.data as any[]) || []) {
      if (!ug?.user_id || !ug.groups) continue
      const list = groupsByUser.get(ug.user_id) || []
      list.push({
        id: ug.groups.id,
        group_name: ug.groups.group_name,
        description: ug.groups.description ?? null,
        system: ug.groups.system ?? null,
      })
      groupsByUser.set(ug.user_id, list)
    }

    const data: MergedUser[] = ((usersRes.data as any[]) || []).map((u) => ({
      id: u.id,
      email: u.email,
      full_name: u.full_name ?? null,
      phone: u.phone ?? null,
      department: u.department ?? null,
      role: u.role ?? null,
      status: u.status ?? 'active',
      created_at: u.created_at ?? null,
      systems: accessByUser.get(u.id) || [],
      groups: groupsByUser.get(u.id) || [],
    }))

    return NextResponse.json({ data })
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 })
  }
}

// ---- POST: create a real auth user + directory rows -------------------------
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const email = (body.email || '').trim().toLowerCase()
    const password = body.password || ''
    const full_name = (body.full_name || '').trim()
    const phone = body.phone || null
    const department = body.department || null
    const role = body.role || 'user'
    const systems: string[] = Array.isArray(body.systems) ? body.systems.filter(Boolean) : []
    const group_ids: string[] = Array.isArray(body.group_ids) ? body.group_ids.filter(Boolean) : []

    if (!email || !full_name) {
      return NextResponse.json({ error: 'Full name and email are required' }, { status: 400 })
    }
    if (!password || password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 })
    }

    const s = svc()

    // 1) Create the auth login.
    const created = await s.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name },
    })

    if (created.error || !created.data.user) {
      const msg = created.error?.message || 'Failed to create auth user'
      const status = /already|exists|registered/i.test(msg) ? 409 : 400
      return NextResponse.json({ error: msg }, { status })
    }

    const userId = created.data.user.id

    // 2) Upsert the shared directory rows so both `users` and `profiles`
    //    (which auth.ts reads) recognise this account.
    const usersUpsert = await s
      .from('users')
      .upsert(
        { id: userId, email, full_name, phone, department, role, status: 'active' } as never,
        { onConflict: 'id' },
      )
    if (usersUpsert.error) {
      return NextResponse.json({ error: usersUpsert.error.message }, { status: 400 })
    }

    // profiles is best-effort (schema differs slightly across environments).
    await s
      .from('profiles')
      .upsert({ id: userId, email, full_name, role, is_active: true } as never, { onConflict: 'id' })

    // 3) Grant application/system access.
    if (systems.length > 0) {
      const rows = systems.map((system) => ({
        user_id: userId,
        system,
        email,
        user_name: full_name,
      }))
      const accessRes = await s.from('user_system_access').insert(rows as never)
      if (accessRes.error) {
        console.error('user_system_access insert error:', accessRes.error.message)
      }
    }

    // 4) Assign to group(s).
    if (group_ids.length > 0) {
      const rows = group_ids.map((group_id) => ({ user_id: userId, group_id }))
      const ugRes = await s.from('user_groups').insert(rows as never)
      if (ugRes.error) {
        console.error('user_groups insert error:', ugRes.error.message)
      }
    }

    return NextResponse.json({ data: { id: userId } })
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 })
  }
}

// ---- PUT: update profile fields, system access and group membership ---------
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json()
    const id = body.id
    if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 })

    const s = svc()

    const updates: Record<string, unknown> = {}
    if (body.full_name !== undefined) updates.full_name = body.full_name
    if (body.phone !== undefined) updates.phone = body.phone || null
    if (body.department !== undefined) updates.department = body.department || null
    if (body.role !== undefined) updates.role = body.role
    if (body.status !== undefined) updates.status = body.status

    if (Object.keys(updates).length > 0) {
      const uRes = await s.from('users').update(updates as never).eq('id', id)
      if (uRes.error) return NextResponse.json({ error: uRes.error.message }, { status: 400 })
      // Keep profiles in sync (best effort).
      const pUpdates: Record<string, unknown> = {}
      if (updates.full_name !== undefined) pUpdates.full_name = updates.full_name
      if (updates.role !== undefined) pUpdates.role = updates.role
      if (updates.status !== undefined) pUpdates.is_active = updates.status === 'active'
      if (Object.keys(pUpdates).length > 0) {
        await s.from('profiles').update(pUpdates as never).eq('id', id)
      }
    }

    // Optional password reset.
    if (body.password) {
      if (String(body.password).length < 6) {
        return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 })
      }
      await s.auth.admin.updateUserById(id, { password: body.password })
    }

    // Replace system access when `systems` is provided.
    if (Array.isArray(body.systems)) {
      await s.from('user_system_access').delete().eq('user_id', id)
      const systems: string[] = body.systems.filter(Boolean)
      if (systems.length > 0) {
        const rows = systems.map((system) => ({
          user_id: id,
          system,
          email: body.email || null,
          user_name: body.full_name || null,
        }))
        await s.from('user_system_access').insert(rows as never)
      }
    }

    // Replace group membership when `group_ids` is provided.
    if (Array.isArray(body.group_ids)) {
      await s.from('user_groups').delete().eq('user_id', id)
      const ids: string[] = body.group_ids.filter(Boolean)
      if (ids.length > 0) {
        const rows = ids.map((group_id) => ({ user_id: id, group_id }))
        await s.from('user_groups').insert(rows as never)
      }
    }

    return NextResponse.json({ data: { id } })
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 })
  }
}

// ---- DELETE: remove the user everywhere -------------------------------------
export async function DELETE(req: NextRequest) {
  try {
    const id = req.nextUrl.searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 })

    const s = svc()
    await s.from('user_groups').delete().eq('user_id', id)
    await s.from('user_system_access').delete().eq('user_id', id)
    await s.from('users').delete().eq('id', id)
    // profiles + auth are best-effort.
    await s.from('profiles').delete().eq('id', id)
    await s.auth.admin.deleteUser(id).catch(() => {})

    return NextResponse.json({ data: { id } })
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 })
  }
}
