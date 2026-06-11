'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@/lib/supabase'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClientComponentClient()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (signInError) throw signInError

      if (data.user) {
        // Check if user has audit system access
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('system_access, is_active')
          .eq('id', data.user.id)
          .single()

        if (profile) {
          if (!profile.is_active) {
            await supabase.auth.signOut()
            throw new Error('Your account has been deactivated. Please contact administrator.')
          }

          const systemAccess = profile.system_access as string[]
          if (systemAccess && !systemAccess.includes('audit')) {
            await supabase.auth.signOut()
            throw new Error('You do not have access to the Audit System. Please contact administrator.')
          }

          // Update last login
          await supabase
            .from('user_profiles')
            .update({ last_login_at: new Date().toISOString() })
            .eq('id', data.user.id)
        }

        toast.success('Login successful!')
        router.push('/dashboard')
        router.refresh()
      }
    } catch (error: any) {
      console.error('Login error:', error)
      setError(error.message || 'Invalid email or password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: 'linear-gradient(135deg, #4A4284 0%, #5A5294 100%)' }}
    >
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="space-y-3 pb-6">
          <div className="flex justify-center mb-2">
            <img src="/dlpp-logo.svg" alt="DLPP Logo" className="h-20 w-auto" />
          </div>
          <CardTitle className="text-2xl text-center font-bold" style={{ color: '#4A4284' }}>
            Internal Audit & Compliance System
          </CardTitle>
          <CardDescription className="text-center text-base">
            Department of Lands & Physical Planning
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-10"
                autoComplete="email"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link
                  href="/forgot-password"
                  className="text-sm hover:underline"
                  style={{ color: '#4A4284' }}
                >
                  Forgot password?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-10"
                autoComplete="current-password"
              />
            </div>

            <Button
              type="submit"
              className="w-full h-10 text-white font-semibold hover:opacity-90 transition-opacity"
              style={{ background: '#EF5A5A' }}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </Button>
          </form>

          {/* Shared Authentication Indicator */}
          <div className="mt-6 pt-6 border-t border-slate-100">
            <p className="text-center text-xs text-slate-500 mb-2">
              Single sign-on across DLPP systems
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              <span className="px-3 py-1 bg-slate-100 rounded-full text-xs font-medium text-slate-600">
                Audit System
              </span>
              <span className="px-3 py-1 bg-slate-100 rounded-full text-xs font-medium text-slate-600">
                Land Cases
              </span>
              <span className="px-3 py-1 bg-slate-100 rounded-full text-xs font-medium text-slate-600">
                Corporate
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
