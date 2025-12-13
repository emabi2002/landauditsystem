# Quick Start Guide

Get the DLPP Audit & Compliance System up and running in 15 minutes.

## ✅ What's Already Done

- ✅ **GitHub Repository**: Code pushed to [https://github.com/emabi2002/landauditsystem](https://github.com/emabi2002/landauditsystem)
- ✅ **Full CRUD Operations**: Create, Read, Update, Delete for all entities
- ✅ **Database Schema**: Complete SQL migrations ready to run
- ✅ **UI Components**: All 10 modules built and functional
- ✅ **Documentation**: Setup, deployment, and API docs included

## 🚀 Next Steps (Choose Your Path)

### Path A: Local Development (Test First)

Perfect for testing before deployment.

**Step 1: Create Supabase Project (5 min)**

1. Go to [supabase.com](https://supabase.com) and create account
2. Click "New Project"
3. Set project name: `dlpp-audit-dev`
4. Choose a region close to you
5. Copy **Project URL** and **anon key** from Settings → API

**Step 2: Update Environment Variables (1 min)**

Edit `.env.local` file:

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR-ANON-KEY
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

**Step 3: Run Database Migrations (3 min)**

In Supabase dashboard → SQL Editor → New query:

1. Copy content from `supabase/migrations/001_initial_schema.sql`
2. Paste and click "Run"
3. Copy content from `supabase/migrations/002_rls_policies.sql`
4. Paste and click "Run"

**Step 4: Create Storage Buckets (2 min)**

In Supabase → Storage:

1. Create bucket: `compliance-evidence` (Private)
2. Create bucket: `compliance-reports` (Private)

**Step 5: Create Test User (2 min)**

In Supabase → Authentication → Users → Add user:

- Email: `admin@test.com`
- Password: `testpass123`
- Auto Confirm: Yes

Then in SQL Editor:

```sql
-- Get the user ID from auth.users table
SELECT id, email FROM auth.users;

-- Insert person record (replace USER_ID with actual ID)
INSERT INTO people (user_id, full_name, email, role, org_unit_id, active)
VALUES
  ('USER_ID_HERE', 'Test Admin', 'admin@test.com', 'Audit Admin',
   (SELECT id FROM org_units WHERE code = 'CORP'), true);
```

**Step 6: Run Development Server (1 min)**

```bash
bun install
bun dev
```

Visit [http://localhost:3000](http://localhost:3000)

**Step 7: Test CRUD Operations (1 min)**

1. Go to Engagements page
2. Click "New Engagement"
3. Fill in the form and submit
4. Try Edit and Delete buttons

✅ **Success!** You now have a working system locally.

---

### Path B: Direct to Production (Deploy Now)

Skip local testing and deploy immediately.

**Step 1: Create Production Supabase Project**

Same as Path A, but name it `dlpp-audit-prod`

**Step 2: Deploy to Netlify**

1. Go to [netlify.com](https://netlify.com)
2. Click "Add new site" → "Import from Git"
3. Select `emabi2002/landauditsystem`
4. Build settings:
   - Build command: `npm run build`
   - Publish directory: `.next`
5. Add environment variables:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   NEXT_PUBLIC_SITE_URL=https://your-site.netlify.app
   ```
6. Click "Deploy site"

**Step 3: Run Migrations & Create Users**

Follow Steps 3-5 from Path A

**Step 4: Update Supabase Auth URLs**

In Supabase → Authentication → URL Configuration:

- Site URL: `https://your-site.netlify.app`
- Redirect URLs: `https://your-site.netlify.app/**`

**Step 5: Test Live Site**

Visit your Netlify URL and test the system!

---

## 📚 Full Documentation

For detailed guides, see:

- **[SUPABASE_SETUP.md](./SUPABASE_SETUP.md)** - Complete Supabase configuration
- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Deployment to Netlify/Vercel
- **[README.md](./README.md)** - Full project documentation
- **[/api-docs](/api-docs)** - API integration for Legal CMS

---

## 🆘 Common Issues

### "Module not found" errors

```bash
rm -rf node_modules bun.lock
bun install
```

### "Invalid API key"

- Double-check `.env.local` values
- Restart dev server after changing env vars
- Make sure you copied the `anon` key, not `service_role`

### "Row Level Security" errors

- Ensure you created a `people` record for your user
- Check the `user_id` matches your auth user
- Verify RLS policies ran successfully

### Build fails in deployment

- Check environment variables are set in Netlify/Vercel
- Verify all dependencies are in `package.json`
- Check build logs for specific errors

---

## 🎯 What You Can Do Now

After setup, you can:

1. ✅ **Create Audit Engagements** - Plan and track audits
2. ✅ **Document Findings** - Record audit findings with risk ratings
3. ✅ **Issue Recommendations** - Create and publish recommendations
4. ✅ **Track Action Plans** - Monitor implementation progress
5. ✅ **View Dashboards** - See KPIs and analytics
6. ✅ **Manage Compliance** - Track obligations and controls
7. ✅ **Generate Reports** - Export audit reports
8. ✅ **API Integration** - Connect to Legal CMS
9. ✅ **User Management** - Add team members with role-based access
10. ✅ **Risk Analysis** - View risk heat maps

---

## 🔄 Keeping Up to Date

The system will auto-deploy when you push to GitHub:

```bash
git pull origin main  # Get latest changes
git add .
git commit -m "Your changes"
git push origin main  # Triggers automatic deployment
```

---

## 📞 Need Help?

- **GitHub Issues**: [Report bugs or request features](https://github.com/emabi2002/landauditsystem/issues)
- **Documentation**: Check the guides in this repository
- **Supabase Docs**: [https://supabase.com/docs](https://supabase.com/docs)
- **Netlify Docs**: [https://docs.netlify.com](https://docs.netlify.com)

---

## ⭐ Next Steps

1. **Customize**: Add your organization's branding
2. **Populate Data**: Add your departments, compliance obligations
3. **Train Users**: Share the system with your audit team
4. **Monitor**: Set up error tracking and analytics
5. **Enhance**: Add features specific to your needs

**Congratulations! You're ready to start using the DLPP Audit & Compliance System! 🎉**
