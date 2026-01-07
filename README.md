# DLPP Internal Audit & Compliance System

A comprehensive, end-to-end workflow system for managing internal audits, fieldwork, findings, recommendations, risk/compliance registers, and follow-ups. Built with Next.js, TypeScript, Tailwind CSS, and Supabase.

**📦 Repository**: [https://github.com/emabi2002/landauditsystem](https://github.com/emabi2002/landauditsystem)

**🚀 Status**: Production Ready ✅

**📚 Documentation**:
- [Supabase Setup Guide](./SUPABASE_SETUP.md)
- [Deployment Guide](./DEPLOYMENT.md)
- [API Documentation](/api-docs)

## Features

### Core Modules

1. **Dashboard** - Real-time KPIs, charts, and activity overview
2. **Engagements** - Manage audit engagements from planning to closure
3. **Fieldwork** - Document workpapers, evidence, and testing procedures
4. **Findings** - Register and track audit findings with risk ratings
5. **Recommendations** - Create and publish actionable recommendations
6. **Action Plans** - Monitor implementation progress with evidence
7. **Compliance** - Track obligations, controls, and regulatory requirements
8. **Risk Register** - Risk heat map and analysis
9. **Reports** - Generate and export comprehensive audit reports
10. **Admin** - System configuration, users, and API access management

### Risk & Governance Modules (NEW!)

11. **Risk Profiles** - Risk assessment matrix management with context and resource categories
12. **PSAP Scorecard** - 20 PSAP Financial & Governance Standards quarterly assessment
13. **KRA & Workplan** - Key Result Areas and quarterly performance tracking

See [RISK_GOVERNANCE_INTEGRATION.md](./RISK_GOVERNANCE_INTEGRATION.md) for detailed documentation.

### Key Capabilities

- **Evidence-Grade Records** - Immutable audit logs, timestamps, and document trails
- **Role-Based Access Control** - Fine-grained permissions with Supabase RLS
- **API Integration** - Read-only API for Legal CMS integration
- **BI-Ready Reporting** - Export to CSV/Excel/PDF
- **Real-Time Dashboards** - KPIs, charts, and analytics
- **Workflow Management** - Status tracking from draft to verified/closed

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui
- **Backend**: Supabase (PostgreSQL, Auth, Storage, RLS)
- **Charts**: Recharts
- **Forms**: React Hook Form + Zod validation
- **State**: Zustand (if needed)

## Setup Instructions

### Prerequisites

- Node.js 18+ or Bun
- Supabase account
- Git

### 1. Clone the Repository

\`\`\`bash
git clone <repository-url>
cd dlpp-audit-compliance
\`\`\`

### 2. Install Dependencies

\`\`\`bash
bun install
# or
npm install
\`\`\`

### 3. Set Up Supabase

#### Create a New Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Note your project URL and anon key

#### Run Database Migrations

1. Install Supabase CLI:
   \`\`\`bash
   npm install -g supabase
   \`\`\`

2. Login to Supabase:
   \`\`\`bash
   supabase login
   \`\`\`

3. Link your project:
   \`\`\`bash
   supabase link --project-ref YOUR_PROJECT_REF
   \`\`\`

4. Apply migrations:
   \`\`\`bash
   supabase db push
   \`\`\`

   Or manually run the SQL files in this order:
   - \`supabase/migrations/001_initial_schema.sql\`
   - \`supabase/migrations/002_rls_policies.sql\`

#### Create Storage Buckets

In your Supabase dashboard:
1. Go to Storage
2. Create two buckets:
   - \`compliance-evidence\` (private)
   - \`compliance-reports\` (private)

### 4. Configure Environment Variables

Create a \`.env.local\` file:

\`\`\`env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
\`\`\`

### 5. Run Development Server

\`\`\`bash
bun dev
# or
npm run dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000)

## Database Schema

### Core Tables

- **org_units** - Organization structure
- **people** - Users linked to Supabase Auth
- **obligations** - Legal/regulatory requirements
- **controls** - Control framework
- **engagements** - Audit engagements
- **engagement_team** - Team assignments
- **workpapers** - Fieldwork documentation
- **evidence** - File attachments
- **findings** - Audit findings
- **recommendations** - Recommendations from findings
- **action_plans** - Implementation tracking
- **events** - Immutable audit log
- **notifications** - User notifications

### Views

- **published_recommendations_view** - Published recommendations for Legal CMS API

### Functions

- \`publish_recommendation(rec_id)\` - Transition recommendation to Published status
- \`link_to_legal(rec_id, case_id)\` - Link recommendation to legal case
- \`update_action_progress(plan_id, progress, note)\` - Update action plan progress

## User Roles & Permissions

1. **Audit Admin** - Full system access, user management, configuration
2. **Audit Manager** - Create engagements, approve findings/recommendations
3. **Auditor** - Conduct fieldwork, create findings, draft recommendations
4. **Action Owner** - Update action plans, provide evidence
5. **Read-Only** - View dashboards and reports
6. **System Integrator** - API access to published recommendations

## API Documentation

The system provides a read-only API for the Legal CMS to consume published recommendations.

### Endpoint

\`\`\`
GET /rest/v1/published_recommendations_view
\`\`\`

### Query Parameters

- \`status=eq.Published\` - Filter by status
- \`priority=eq.Critical\` - Filter by priority
- \`region_code=eq.REG-001\` - Filter by region
- \`limit=100\` - Pagination limit
- \`offset=0\` - Pagination offset

### Authentication

All requests require Supabase API key:

\`\`\`bash
curl -X GET 'https://your-project.supabase.co/rest/v1/published_recommendations_view' \\
  -H 'apikey: YOUR_SUPABASE_ANON_KEY' \\
  -H 'Authorization: Bearer YOUR_SUPABASE_ANON_KEY'
\`\`\`

Full API documentation available at: [/api-docs](/api-docs)

## Deployment

### Deploy to Netlify

1. Connect your repository to Netlify
2. Configure build settings:
   - Build command: \`npm run build\`
   - Publish directory: \`.next\`
3. Add environment variables in Netlify dashboard
4. Deploy

### Deploy to Vercel

\`\`\`bash
vercel
\`\`\`

Or connect via Vercel dashboard.

## Security

- **Authentication** - Supabase Auth with JWT
- **Authorization** - Row Level Security (RLS) policies
- **Audit Logging** - Immutable event log for all changes
- **Encryption** - At rest and in transit
- **API Security** - Rate limiting, key authentication

## Development

### Project Structure

\`\`\`
dlpp-audit-compliance/
├── src/
│   ├── app/
│   │   ├── (dashboard)/        # Dashboard routes
│   │   │   ├── dashboard/
│   │   │   ├── engagements/
│   │   │   ├── findings/
│   │   │   ├── recommendations/
│   │   │   ├── action-plans/
│   │   │   ├── compliance/
│   │   │   ├── risk-register/
│   │   │   ├── reports/
│   │   │   └── admin/
│   │   └── api-docs/           # API documentation
│   ├── components/
│   │   ├── ui/                 # shadcn/ui components
│   │   └── layout/             # Layout components
│   └── lib/
│       ├── supabase.ts         # Supabase client
│       └── database.types.ts   # TypeScript types
├── supabase/
│   └── migrations/             # SQL migrations
└── public/                     # Static assets
\`\`\`

### Code Style

- TypeScript strict mode
- ESLint + Biome for linting
- Prettier for formatting

## Support

For questions, issues, or feature requests:

- **Email**: audit-support@dlpp.org
- **System Admin**: Sarah Johnson
- **Documentation**: [/api-docs](/api-docs)

## License

Proprietary - DLPP Internal Use Only

## Version History

- **v1.0.0** (2024-11-01) - Initial release
  - Complete audit workflow
  - Dashboard and reporting
  - API for Legal CMS integration
  - RLS security policies
