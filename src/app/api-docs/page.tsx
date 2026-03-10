'use client'

import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Database, Lock, Code, CheckCircle } from 'lucide-react'

export default function ApiDocsPage() {
  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-slate-700 to-slate-900 text-white font-bold">
              IA
            </div>
            <h1 className="text-3xl font-bold text-slate-900">
              DLPP Audit & Compliance API
            </h1>
          </div>
          <p className="text-slate-600 text-lg">
            Integration Documentation for Legal CMS
          </p>
          <div className="mt-4 flex items-center justify-center gap-2">
            <Badge className="bg-green-100 text-green-700">v1.0</Badge>
            <Badge variant="outline">REST API</Badge>
            <Badge variant="outline">JSON</Badge>
          </div>
        </div>

        {/* Overview */}
        <Card className="p-6 bg-white border-slate-200">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Overview</h2>
          <p className="text-slate-700 leading-relaxed">
            The DLPP Internal Audit & Compliance System provides a read-only API for
            accessing published recommendations. This API is designed for integration
            with the Legal Case Management System (CMS) to enable legal teams to view
            and link audit recommendations to legal actions.
          </p>
          <div className="grid gap-4 md:grid-cols-3 mt-6">
            <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-lg">
              <Lock className="h-5 w-5 text-slate-600 mt-0.5" />
              <div>
                <h3 className="font-semibold text-slate-900 text-sm">Secure Access</h3>
                <p className="text-xs text-slate-600 mt-1">
                  API key authentication with RLS
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-lg">
              <Database className="h-5 w-5 text-slate-600 mt-0.5" />
              <div>
                <h3 className="font-semibold text-slate-900 text-sm">Read-Only</h3>
                <p className="text-xs text-slate-600 mt-1">
                  GET requests only for safety
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-lg">
              <CheckCircle className="h-5 w-5 text-slate-600 mt-0.5" />
              <div>
                <h3 className="font-semibold text-slate-900 text-sm">Real-time</h3>
                <p className="text-xs text-slate-600 mt-1">
                  Access latest published recommendations
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* API Details */}
        <Tabs defaultValue="endpoint" className="w-full">
          <TabsList className="w-full">
            <TabsTrigger value="endpoint" className="flex-1">Endpoints</TabsTrigger>
            <TabsTrigger value="auth" className="flex-1">Authentication</TabsTrigger>
            <TabsTrigger value="response" className="flex-1">Response Schema</TabsTrigger>
            <TabsTrigger value="examples" className="flex-1">Examples</TabsTrigger>
          </TabsList>

          {/* Endpoints */}
          <TabsContent value="endpoint" className="space-y-4">
            <Card className="p-6 bg-white border-slate-200">
              <div className="flex items-start gap-3 mb-4">
                <Badge className="bg-green-100 text-green-700">GET</Badge>
                <code className="text-sm bg-slate-100 px-3 py-1 rounded flex-1">
                  /rest/v1/published_recommendations_view
                </code>
              </div>
              <p className="text-slate-700 mb-4">
                Retrieve published audit recommendations with filtering and pagination
                support.
              </p>

              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-slate-900 mb-2">Query Parameters</h4>
                  <div className="bg-slate-50 rounded-lg p-4 space-y-3">
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <code className="text-slate-900 font-mono">status</code>
                      <span className="text-slate-600">string</span>
                      <span className="text-slate-500">Filter by status (Published, Implementing, etc.)</span>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <code className="text-slate-900 font-mono">priority</code>
                      <span className="text-slate-600">string</span>
                      <span className="text-slate-500">Filter by priority (Critical, High, Medium, Low)</span>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <code className="text-slate-900 font-mono">region_code</code>
                      <span className="text-slate-600">string</span>
                      <span className="text-slate-500">Filter by region code</span>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <code className="text-slate-900 font-mono">parcel_ref</code>
                      <span className="text-slate-600">string</span>
                      <span className="text-slate-500">Filter by parcel reference</span>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <code className="text-slate-900 font-mono">tags</code>
                      <span className="text-slate-600">array</span>
                      <span className="text-slate-500">Filter by tags (comma-separated)</span>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <code className="text-slate-900 font-mono">limit</code>
                      <span className="text-slate-600">integer</span>
                      <span className="text-slate-500">Number of records (default: 100)</span>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <code className="text-slate-900 font-mono">offset</code>
                      <span className="text-slate-600">integer</span>
                      <span className="text-slate-500">Pagination offset</span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-white border-slate-200">
              <div className="flex items-start gap-3 mb-4">
                <Badge className="bg-blue-100 text-blue-700">RPC</Badge>
                <code className="text-sm bg-slate-100 px-3 py-1 rounded flex-1">
                  /rest/v1/rpc/link_to_legal
                </code>
              </div>
              <p className="text-slate-700 mb-4">
                Link an audit recommendation to a legal case (requires write permissions).
              </p>

              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-slate-900 mb-2">Request Body</h4>
                  <div className="bg-slate-900 rounded-lg p-4">
                    <pre className="text-sm text-slate-100 font-mono">
{`{
  "rec_id": "uuid",
  "case_id": "uuid"
}`}
                    </pre>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Authentication */}
          <TabsContent value="auth" className="space-y-4">
            <Card className="p-6 bg-white border-slate-200">
              <h3 className="text-xl font-semibold text-slate-900 mb-4">
                API Key Authentication
              </h3>
              <p className="text-slate-700 mb-4">
                All API requests require authentication using the Supabase API key provided
                by the DLPP Audit system administrators.
              </p>

              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-slate-900 mb-2">Headers Required</h4>
                  <div className="bg-slate-900 rounded-lg p-4 space-y-2">
                    <div className="font-mono text-sm">
                      <span className="text-blue-400">apikey:</span>
                      <span className="text-slate-100"> YOUR_SUPABASE_ANON_KEY</span>
                    </div>
                    <div className="font-mono text-sm">
                      <span className="text-blue-400">Authorization:</span>
                      <span className="text-slate-100"> Bearer YOUR_SUPABASE_ANON_KEY</span>
                    </div>
                    <div className="font-mono text-sm">
                      <span className="text-blue-400">Content-Type:</span>
                      <span className="text-slate-100"> application/json</span>
                    </div>
                  </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h4 className="font-semibold text-yellow-900 mb-2">Security Note</h4>
                  <p className="text-sm text-yellow-800">
                    The API key should be stored securely and never committed to version
                    control. Row Level Security (RLS) policies ensure that the Legal CMS
                    service account can only access published recommendations.
                  </p>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Response Schema */}
          <TabsContent value="response" className="space-y-4">
            <Card className="p-6 bg-white border-slate-200">
              <h3 className="text-xl font-semibold text-slate-900 mb-4">
                Response Schema
              </h3>
              <p className="text-slate-700 mb-4">
                The API returns an array of recommendation objects with the following
                structure:
              </p>

              <div className="bg-slate-900 rounded-lg p-4 overflow-x-auto">
                <pre className="text-sm text-slate-100 font-mono">
{`{
  "recommendation_id": "uuid",
  "finding_id": "uuid",
  "engagement_id": "uuid",
  "finding_title": "string",
  "recommendation_text": "string",
  "risk_rating": "Critical | High | Medium | Low",
  "priority": "Critical | High | Medium | Low",
  "owner_unit": "string",
  "owner_unit_code": "string",
  "owner_person": "string",
  "target_date": "ISO8601 date",
  "published_at": "ISO8601 timestamp",
  "legal_case_linked": "boolean",
  "legal_case_id": "uuid | null",
  "region_code": "string | null",
  "parcel_ref": "string | null",
  "tags": ["string"],
  "engagement_title": "string",
  "org_unit_id": "uuid",
  "engagement_org_unit": "string",
  "status": "Published | Implementing | Verified | Closed"
}`}
                </pre>
              </div>
            </Card>
          </TabsContent>

          {/* Examples */}
          <TabsContent value="examples" className="space-y-4">
            <Card className="p-6 bg-white border-slate-200">
              <h3 className="text-xl font-semibold text-slate-900 mb-4">
                Example: Fetch All Published Recommendations
              </h3>
              <div className="bg-slate-900 rounded-lg p-4 overflow-x-auto">
                <pre className="text-sm text-slate-100 font-mono">
{`curl -X GET \\
  'https://your-project.supabase.co/rest/v1/published_recommendations_view?status=eq.Published' \\
  -H 'apikey: YOUR_SUPABASE_ANON_KEY' \\
  -H 'Authorization: Bearer YOUR_SUPABASE_ANON_KEY'`}
                </pre>
              </div>
            </Card>

            <Card className="p-6 bg-white border-slate-200">
              <h3 className="text-xl font-semibold text-slate-900 mb-4">
                Example: Filter by Priority and Region
              </h3>
              <div className="bg-slate-900 rounded-lg p-4 overflow-x-auto">
                <pre className="text-sm text-slate-100 font-mono">
{`curl -X GET \\
  'https://your-project.supabase.co/rest/v1/published_recommendations_view?priority=eq.Critical&region_code=eq.REG-001' \\
  -H 'apikey: YOUR_SUPABASE_ANON_KEY' \\
  -H 'Authorization: Bearer YOUR_SUPABASE_ANON_KEY'`}
                </pre>
              </div>
            </Card>

            <Card className="p-6 bg-white border-slate-200">
              <h3 className="text-xl font-semibold text-slate-900 mb-4">
                Example: Link Recommendation to Legal Case
              </h3>
              <div className="bg-slate-900 rounded-lg p-4 overflow-x-auto">
                <pre className="text-sm text-slate-100 font-mono">
{`curl -X POST \\
  'https://your-project.supabase.co/rest/v1/rpc/link_to_legal' \\
  -H 'apikey: YOUR_SUPABASE_ANON_KEY' \\
  -H 'Authorization: Bearer YOUR_SUPABASE_ANON_KEY' \\
  -H 'Content-Type: application/json' \\
  -d '{
    "rec_id": "550e8400-e29b-41d4-a716-446655440000",
    "case_id": "660e8400-e29b-41d4-a716-446655440001"
  }'`}
                </pre>
              </div>
            </Card>

            <Card className="p-6 bg-white border-slate-200">
              <h3 className="text-xl font-semibold text-slate-900 mb-4">
                Example Response
              </h3>
              <div className="bg-slate-900 rounded-lg p-4 overflow-x-auto">
                <pre className="text-sm text-slate-100 font-mono">
{`[
  {
    "recommendation_id": "550e8400-e29b-41d4-a716-446655440000",
    "finding_id": "660e8400-e29b-41d4-a716-446655440001",
    "engagement_id": "770e8400-e29b-41d4-a716-446655440002",
    "finding_title": "Inadequate password policy enforcement",
    "recommendation_text": "Implement multi-factor authentication...",
    "risk_rating": "High",
    "priority": "Critical",
    "owner_unit": "IT Department",
    "owner_unit_code": "IT",
    "owner_person": "John Smith",
    "target_date": "2024-12-31",
    "published_at": "2024-10-28T14:30:00Z",
    "legal_case_linked": false,
    "legal_case_id": null,
    "region_code": "REG-001",
    "parcel_ref": null,
    "tags": ["cybersecurity", "access-control"],
    "engagement_title": "IT Security Audit 2024",
    "org_unit_id": "880e8400-e29b-41d4-a716-446655440003",
    "engagement_org_unit": "IT Department",
    "status": "Published"
  }
]`}
                </pre>
              </div>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Support */}
        <Card className="p-6 bg-slate-900 text-white">
          <h3 className="text-xl font-semibold mb-2">Need Help?</h3>
          <p className="text-slate-300 mb-4">
            For API access credentials, technical support, or integration questions,
            please contact the DLPP Audit System administrators.
          </p>
          <div className="flex gap-4">
            <div>
              <p className="text-sm text-slate-400">Email</p>
              <p className="font-medium">audit-support@dlpp.org</p>
            </div>
            <div>
              <p className="text-sm text-slate-400">System Admin</p>
              <p className="font-medium">Sarah Johnson</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
