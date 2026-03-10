# Deployment Guide

This guide will help you deploy the DLPP Audit & Compliance System to production.

## Prerequisites

Before deploying, ensure you have:

1. ✅ A Supabase project set up ([see SUPABASE_SETUP.md](./SUPABASE_SETUP.md))
2. ✅ Database migrations run successfully
3. ✅ Environment variables configured
4. ✅ Tested the application locally
5. ✅ GitHub repository with latest code

## Deployment Options

### Option 1: Deploy to Netlify (Recommended)

Netlify offers excellent support for Next.js applications with automatic deployments.

#### Step 1: Connect to Netlify

1. Go to [https://app.netlify.com](https://app.netlify.com)
2. Click "Add new site" → "Import an existing project"
3. Choose "GitHub" and authorize Netlify
4. Select `emabi2002/landauditsystem` repository
5. Configure build settings:

```
Build command: npm run build
Publish directory: .next
```

#### Step 2: Add Environment Variables

In Netlify dashboard → Site settings → Environment variables:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
NEXT_PUBLIC_SITE_URL=https://your-site.netlify.app
```

#### Step 3: Deploy

1. Click "Deploy site"
2. Wait for build to complete (2-3 minutes)
3. Your site will be live at `https://random-name.netlify.app`

## Post-Deployment Steps

### 1. Update Supabase Authentication URLs

1. Go to Supabase Dashboard → Authentication → URL Configuration
2. Add your production URL to:
   - **Site URL**: `https://your-site.com`
   - **Redirect URLs**: `https://your-site.com/**`

### 2. Test the Deployed Application

1. Visit your deployed site
2. Try creating a test engagement
3. Verify database connections work
4. Check authentication flows
5. Test all CRUD operations

## Security Checklist

Before going live:

- [ ] RLS policies enabled on all tables
- [ ] Storage buckets are private (not public)
- [ ] Environment variables are not in code
- [ ] HTTPS is enabled (automatic with Netlify/Vercel)
- [ ] Authentication is required for all routes
- [ ] API keys are kept secret
- [ ] Regular security audits scheduled
