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

#### Step 4: Configure Custom Domain (Optional)

1. Go to Site settings → Domain management
2. Click "Add custom domain"
3. Follow instructions to configure DNS
4. Update `NEXT_PUBLIC_SITE_URL` environment variable

#### Step 5: Enable Continuous Deployment

Netlify automatically deploys when you push to the `main` branch on GitHub.

---

### Option 2: Deploy to Vercel

Vercel is optimized for Next.js applications.

#### Step 1: Connect to Vercel

1. Go to [https://vercel.com](https://vercel.com)
2. Click "Add New Project"
3. Import `emabi2002/landauditsystem` from GitHub
4. Configure project:

```
Framework Preset: Next.js
Root Directory: ./
Build Command: (leave default)
Output Directory: (leave default)
```

#### Step 2: Add Environment Variables

In project settings → Environment Variables:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
NEXT_PUBLIC_SITE_URL=https://your-project.vercel.app
```

#### Step 3: Deploy

1. Click "Deploy"
2. Wait for build to complete
3. Your site will be live at `https://your-project.vercel.app`

---

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

### 3. Create Production Users

1. Go to Supabase Dashboard → Authentication → Users
2. Add users for your organization
3. Run SQL to create corresponding `people` records:

```sql
INSERT INTO people (user_id, full_name, email, role, org_unit_id, active)
VALUES
  ('user-uuid-from-auth', 'Admin User', 'admin@yourdomain.com', 'Audit Admin',
   (SELECT id FROM org_units WHERE code = 'CORP'), true);
```

### 4. Populate Reference Data

Run these SQL statements in Supabase SQL Editor:

```sql
-- Add your organization units
INSERT INTO org_units (name, code, description) VALUES
  ('Your Department', 'DEPT1', 'Department description'),
  ('Another Unit', 'DEPT2', 'Another description');

-- Add compliance obligations
INSERT INTO obligations (title, ref_code, source, description, level) VALUES
  ('Your Regulation', 'REG-001', 'Act', 'Description', 'National');
```

### 5. Configure Storage Buckets

1. Verify storage buckets exist: `compliance-evidence`, `compliance-reports`
2. Set up storage policies if needed
3. Test file uploads

---

## Monitoring & Maintenance

### Enable Error Tracking

Consider adding error tracking:

1. **Sentry**: For error monitoring
2. **LogRocket**: For session replay
3. **Google Analytics**: For usage tracking

### Set Up Backups

Supabase Pro plan includes automatic backups. For Free tier:

1. Regularly export database
2. Use Supabase CLI: `supabase db dump`
3. Store backups securely

### Performance Monitoring

1. Monitor Supabase dashboard for:
   - API requests
   - Database performance
   - Storage usage
2. Set up alerts for high usage

---

## Updating the Deployment

### Automatic Deployments

Both Netlify and Vercel automatically deploy when you push to GitHub:

```bash
# Make changes locally
git add .
git commit -m "Your changes"
git push origin main

# Deployment starts automatically
```

### Manual Deployment

If needed, you can trigger manual deployments:

- **Netlify**: Go to Deploys → Trigger deploy
- **Vercel**: Go to Deployments → Redeploy

---

## Troubleshooting

### Build Fails

1. Check build logs in deployment platform
2. Verify environment variables are set correctly
3. Test build locally: `npm run build`
4. Check for TypeScript errors: `npm run lint`

### Database Connection Errors

1. Verify Supabase URL and key are correct
2. Check RLS policies allow access
3. Ensure users have `people` records
4. Check Supabase project is active

### Authentication Issues

1. Verify redirect URLs in Supabase
2. Check authentication providers are enabled
3. Ensure users exist in auth.users table
4. Check browser console for errors

---

## Security Checklist

Before going live:

- [ ] RLS policies enabled on all tables
- [ ] Storage buckets are private (not public)
- [ ] Environment variables are not in code
- [ ] HTTPS is enabled (automatic with Netlify/Vercel)
- [ ] Authentication is required for all routes
- [ ] API keys are kept secret
- [ ] Regular security audits scheduled

---

## Rollback Procedure

If you need to rollback:

### Netlify

1. Go to Deploys
2. Find previous successful deployment
3. Click "Publish deploy"

### Vercel

1. Go to Deployments
2. Find previous deployment
3. Click "..." → "Promote to Production"

---

## Support

For deployment issues:

- **Netlify**: [https://docs.netlify.com](https://docs.netlify.com)
- **Vercel**: [https://vercel.com/docs](https://vercel.com/docs)
- **Supabase**: [https://supabase.com/docs](https://supabase.com/docs)
- **GitHub Repository**: [https://github.com/emabi2002/landauditsystem](https://github.com/emabi2002/landauditsystem)

---

## Next Steps

After successful deployment:

1. ✅ Set up monitoring and alerts
2. ✅ Configure backups
3. ✅ Train users on the system
4. ✅ Create user documentation
5. ✅ Plan regular maintenance windows
6. ✅ Set up CI/CD for automated testing
