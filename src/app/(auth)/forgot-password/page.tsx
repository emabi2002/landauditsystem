'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle, ArrowLeft, CheckCircle2, Loader2, MailCheck } from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const redirectTo =
        typeof window !== 'undefined' ? `${window.location.origin}/login` : undefined

      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo,
      })

      if (resetError) throw resetError

      setSent(true)
      toast.success('Password reset email sent')
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to send reset email'
      setError(message)
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
            Reset your password
          </CardTitle>
          <CardDescription className="text-center text-base">
            {sent
              ? 'Check your inbox for a secure reset link'
              : 'Enter your email and we will send you a reset link'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {sent ? (
            <div className="space-y-6">
              <div className="flex flex-col items-center gap-3 rounded-lg border border-emerald-100 bg-emerald-50 p-6 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100">
                  <MailCheck className="h-6 w-6 text-emerald-600" />
                </div>
                <p className="text-sm text-slate-700">
                  If an account exists for <span className="font-semibold">{email}</span>, a password
                  reset link is on its way. Follow the link to set a new password.
                </p>
                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                  You can safely close this tab after resetting.
                </div>
              </div>
              <Button
                variant="outline"
                className="w-full h-10"
                onClick={() => {
                  setSent(false)
                  setEmail('')
                }}
              >
                Send to a different email
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
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

              <Button
                type="submit"
                className="w-full h-10 text-white font-semibold hover:opacity-90 transition-opacity"
                style={{ background: '#EF5A5A' }}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending link...
                  </>
                ) : (
                  'Send reset link'
                )}
              </Button>
            </form>
          )}

          <div className="mt-6 pt-6 border-t border-slate-100">
            <Link
              href="/login"
              className="flex items-center justify-center gap-2 text-sm font-medium hover:underline"
              style={{ color: '#4A4284' }}
            >
              <ArrowLeft className="h-4 w-4" />
              Back to sign in
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
