# Apply Risk Register Migration - Step by Step

## Prerequisites

Before running this migration, ensure:
1. You have access to your Supabase project's SQL Editor
2. The `audit_system_with_prefixes.sql` migration has already been applied
3. The `people` table exists in your database

---

## Step 1: Open Supabase SQL Editor

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project
3. Click on **SQL Editor** in the left sidebar
4. Click **New Query**

---

## Step 2: Copy and Run the Migration

Copy the **entire contents** of the file:
```
supabase/migrations/004_risk_register_integration.sql
```

Paste it into the SQL Editor and click **Run**.

---

## Step 3: Verify the Migration

After running, execute this verification query:

```sql
-- Verify Risk Register tables were created
SELECT
    'audit_risk_register' as table_name, COUNT(*) as count FROM audit_risk_register
UNION ALL
SELECT 'audit_legal_instruments', COUNT(*) FROM audit_legal_instruments
UNION ALL
SELECT 'audit_divisions', COUNT(*) FROM audit_divisions
UNION ALL
SELECT 'audit_risk_legal_references', COUNT(*) FROM audit_risk_legal_references;
```

### Expected Results:
| table_name | count |
|------------|-------|
| audit_risk_register | 20+ |
| audit_legal_instruments | 13 |
| audit_divisions | 10 |
| audit_risk_legal_references | 20+ |

---

## Step 4: Check Seeded Data

### View DLPP Divisions
```sql
SELECT code, name, head_title FROM audit_divisions ORDER BY code;
```

### View Legal Instruments
```sql
SELECT code, title, instrument_type FROM audit_legal_instruments ORDER BY code;
```

### View System Risks
```sql
SELECT
    risk_code,
    risk_title,
    risk_category,
    inherent_risk_rating,
    residual_risk_rating,
    risk_status
FROM audit_risk_register
ORDER BY risk_code;
```

### View Risks with Legal References
```sql
SELECT
    r.risk_code,
    r.risk_title,
    li.code as legal_code,
    li.title as legal_title,
    rlr.section_reference,
    rlr.compliance_type
FROM audit_risk_register r
JOIN audit_risk_legal_references rlr ON rlr.risk_id = r.id
JOIN audit_legal_instruments li ON li.id = rlr.legal_instrument_id
ORDER BY r.risk_code;
```

---

## Step 5: Verify Audit Table Modifications

Check that the risk_id columns were added to audit tables:

```sql
SELECT
    table_name,
    column_name,
    data_type
FROM information_schema.columns
WHERE table_schema = 'public'
AND column_name = 'risk_id'
AND table_name LIKE 'audit_%'
ORDER BY table_name;
```

### Expected Result:
| table_name | column_name | data_type |
|------------|-------------|-----------|
| audit_action_plans | risk_id | uuid |
| audit_engagements | risk_id | uuid |
| audit_findings | risk_id | uuid |
| audit_recommendations | risk_id | uuid |

---

## Troubleshooting

### Error: "relation 'people' does not exist"
The `people` table must exist before running this migration. Run the previous audit migrations first.

### Error: "relation already exists"
If tables already exist, this is normal - the `CREATE TABLE IF NOT EXISTS` statements will skip existing tables.

### Error: "duplicate key value violates unique constraint"
The seed data may have already been inserted. You can ignore this error or run:
```sql
-- Clear existing seed data (ONLY if you want to reset)
DELETE FROM audit_risk_legal_references;
DELETE FROM audit_risk_register WHERE is_system_risk = true;
DELETE FROM audit_legal_instruments;
DELETE FROM audit_divisions;
```
Then re-run the migration.

---

## What Was Created

### New Tables
- `legal_instruments` - PNG Acts, Regulations, Policies
- `divisions` - DLPP organizational units
- `sections` - Sections within divisions
- `business_processes` - Business process catalog
- `risk_register` - **THE AUTHORITATIVE RISK REGISTER**
- `risk_legal_references` - Links risks to legal instruments
- `risk_treatments` - Risk mitigation actions
- `risk_incidents` - Risk events and incidents
- `risk_indicators` - Key Risk Indicators
- `risk_indicator_values` - KRI measurements
- `risk_audit_log` - Immutable audit trail

### Seeded Data
- 10 DLPP Divisions
- 13 Legal Instruments (PNG Acts & Regulations)
- 20+ System Risks with legal references

### Modified Tables
- `audit_engagements` - Added `risk_id` column
- `audit_findings` - Added `risk_id` and `legal_instrument_id` columns
- `audit_recommendations` - Added `risk_id` column
- `audit_action_plans` - Added `risk_id` column

---

## Next Steps

After successful migration:

1. **Refresh the application** - Navigate to `/risk-register` to see the Risk Register UI
2. **Review seeded risks** - Check the 20+ DLPP-specific system risks
3. **Test creating a new risk** - Use the 4-step wizard (requires legal reference)
4. **Link existing engagements** - Update audit engagements to reference risks

---

## Support

If you encounter issues, contact the system administrator or check the Supabase logs for detailed error messages.
