# 🚀 Quick Start: Apply Risk & Governance Migration

## ⚡ 5-Minute Setup

### 1️⃣ Open SQL Editor
**URL:** https://supabase.com/dashboard/project/xelptlfgpxdzrstiwcti/sql

### 2️⃣ Copy Migration
```bash
# Location of migration file:
landauditsystem/supabase/migrations/003_risk_governance_modules.sql
```

### 3️⃣ Paste & Run
1. Click **"New Query"** in Supabase
2. Paste the entire SQL file content
3. Click **"Run"** button

### 4️⃣ Verify
```bash
cd landauditsystem
bun run scripts/check-db-status.ts
```

Expected output:
```
✅ Migration 003 (Risk & Governance): APPLIED
📊 Seed Data Status:
  PSAP Standards: 20 (expected: 20)
  PSAP Rating Scales: 5 (expected: 5)
  Strategic KRAs: 1+ (expected: 1+)
```

### 5️⃣ Access New Modules
```bash
bun run dev
# Open: http://localhost:3000
# Navigate to: RISK & GOVERNANCE section
```

---

## 📋 What Gets Created

| Module | Tables | Seed Data |
|--------|--------|-----------|
| **Risk Profiles** | 2 tables | None (ready for your data) |
| **PSAP Scorecard** | 4 tables | 20 standards + 5 rating scales |
| **KRA & Workplan** | 3 tables | 1 sample KRA with 6 activities |

**Total:** 9 new tables, 3 views, auto-calculation triggers

---

## 🔍 Pages You Can Now Access

1. **Risk Profiles** (`/risk-profiles`)
   - Create risk assessment matrices
   - Track risks by context × resource categories
   - Auto-calculate risk scores

2. **PSAP Scorecard** (`/psap-scorecard`)
   - Quarterly financial & governance assessments
   - 20 PSAP standards with auto-weighting
   - Compliance level tracking

3. **KRA & Workplan** (`/kra-workplan`)
   - Key Result Area management
   - Quarterly status tracking
   - Performance reporting

---

## ⚠️ Important Notes

✅ **Database Connection:** Already configured
✅ **Core Tables:** Already deployed
❌ **Risk & Governance:** Needs migration 003

**No data loss risk** - This migration only ADDS new tables, doesn't modify existing ones.

---

## 🆘 Common Issues

| Issue | Solution |
|-------|----------|
| "relation already exists" | Already applied! Run verification script |
| "permission denied" | Check you're logged into correct Supabase account |
| Query timeout | Wait up to 2 minutes, retry if needed |
| Can't see tables | Clear browser cache, restart dev server |

---

## 📞 Quick Commands

```bash
# Check what's deployed
bun run scripts/check-db-status.ts

# View migration file
cat supabase/migrations/003_risk_governance_modules.sql

# Start dev server
bun run dev

# Check for errors
bun run lint
```

---

## ✨ After Migration

Your system will have:
- ✅ All original audit workflow features
- ✅ NEW: Risk assessment matrix
- ✅ NEW: PSAP scorecard tracking
- ✅ NEW: KRA performance monitoring
- ✅ Integrated navigation
- ✅ Auto-calculation triggers
- ✅ Reporting views

**Ready to create your first risk profile!** 🎉

---

**Supabase Project:** ilms (xelptlfgpxdzrstiwcti)
**Migration File:** `003_risk_governance_modules.sql`
**Documentation:** See `APPLY_MIGRATION_GUIDE.md` for detailed instructions
