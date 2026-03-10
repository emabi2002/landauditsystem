# Data Recovery & Shared Database Plan

## 🚨 Current Situation

**What Happened:**
- Ran `DROP SCHEMA public CASCADE` which deleted ALL tables
- Lost case management system tables
- Only audit system tables remain

**Impact:**
- Case management system: Data LOST
- Audit system: Newly created (no data lost)

---

## 🛟 Recovery Steps

### If You Have SQL Backup Files:

1. **Restore Case Management Schema First**
   - Run case management migration SQL
   - This recreates all case management tables

2. **Then Add Audit Tables**
   - Use `CREATE TABLE IF NOT EXISTS`
   - Won't conflict with case management

3. **Restore Case Management Data**
   - Import data from SQL dump
   - Or restore from CSV exports

---

## 🏗️ Proper Shared Database Architecture

### Strategy 1: Separate Schemas (RECOMMENDED)

```sql
-- Create separate schemas for each system
CREATE SCHEMA IF NOT EXISTS case_management;
CREATE SCHEMA IF NOT EXISTS audit_system;

-- Put tables in their own schemas
CREATE TABLE case_management.legal_cases (...);
CREATE TABLE audit_system.engagements (...);
```

**Pros:**
- Clear separation
- No table name conflicts
- Easy to manage permissions
- Safe backups per schema

**Cons:**
- Requires code changes (table references)
- More complex queries for shared tables

### Strategy 2: Table Prefixes (SIMPLE)

```sql
-- Case management tables
CREATE TABLE cm_legal_cases (...);
CREATE TABLE cm_documents (...);

-- Audit tables
CREATE TABLE audit_engagements (...);
CREATE TABLE audit_findings (...);

-- Shared tables (no prefix)
CREATE TABLE org_units (...);
CREATE TABLE people (...);
```

**Pros:**
- All in public schema
- Clear ownership by name
- Easy to implement

**Cons:**
- Longer table names
- Still share same namespace

### Strategy 3: Shared Tables Only (CURRENT - RISKY)

```sql
-- All tables in public schema
CREATE TABLE legal_cases (...);
CREATE TABLE engagements (...);
CREATE TABLE org_units (...);  -- SHARED
```

**Pros:**
- Simple structure
- Direct access

**Cons:**
- Risk of conflicts
- Risk of accidental deletion (what happened)
- Hard to track ownership

---

## 📋 Shared Tables Strategy

These tables MUST be shared by both systems:

### org_units (Organization Hierarchy)
- Shared by: Case Management + Audit
- Schema: Must support BOTH systems' needs
- Migration: `ALTER TABLE ADD COLUMN IF NOT EXISTS`

### people (Staff Directory)
- Shared by: Case Management + Audit
- Schema: Must support multiple roles
- Consider: `role` as JSON array instead of single value

### notifications (Optional - could be separate)
- Option 1: Shared notification system
- Option 2: Separate tables (audit_notifications, cm_notifications)

---

## 🔐 RLS Policy Strategy

### For Shared Tables:

```sql
-- org_units: Everyone can read
CREATE POLICY org_units_read ON org_units
  FOR SELECT TO authenticated USING (true);

-- org_units: Only admins can modify
CREATE POLICY org_units_write ON org_units
  FOR ALL TO authenticated
  USING (current_person_role() IN ('Admin', 'Audit Admin', 'System Admin'));
```

### For System-Specific Tables:

```sql
-- Audit tables: Only audit users
CREATE POLICY audit_engagements_all ON engagements
  FOR ALL TO authenticated
  USING (current_person_role() LIKE '%Audit%');

-- Case mgmt tables: Only case mgmt users
CREATE POLICY cm_cases_all ON legal_cases
  FOR ALL TO authenticated
  USING (current_person_role() LIKE '%Legal%');
```

---

## 🛡️ Prevention Measures

### 1. Never Drop Schema
```sql
-- ❌ NEVER DO THIS:
DROP SCHEMA public CASCADE;

-- ✅ Instead, drop specific tables:
DROP TABLE IF EXISTS audit_engagements CASCADE;
```

### 2. Always Check First
```sql
-- Before any DROP, check what exists:
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public';
```

### 3. Use Transactions
```sql
-- Wrap dangerous operations in transactions
BEGIN;
  DROP TABLE IF EXISTS test_table;
  -- Check results
  SELECT * FROM information_schema.tables;
ROLLBACK; -- or COMMIT if safe
```

### 4. Backup Before Changes
```sql
-- Always have a recent backup before schema changes
```

---

## 📝 Migration File Naming Convention

```
001_case_management_schema.sql
002_case_management_data.sql
003_audit_system_schema.sql
004_audit_system_data.sql
005_shared_tables_modifications.sql
```

---

## ✅ Recommended Approach Going Forward

**Option A: Separate Schemas (Best for Large Systems)**
1. Create `case_management` schema
2. Create `audit_system` schema
3. Keep `org_units` and `people` in `public`
4. Update application code to reference schemas

**Option B: Table Prefixes (Quickest)**
1. Rename audit tables: `audit_*`
2. Rename case mgmt tables: `cm_*`
3. Keep shared tables without prefix
4. Update application code references

**Option C: Current Setup with Safeguards**
1. Document which tables belong to which system
2. Never use DROP SCHEMA
3. Always coordinate schema changes
4. Regular backups

---

## 🎯 Next Steps (After Recovery)

1. ✅ Restore case management tables
2. ✅ Verify case management data
3. ✅ Document table ownership
4. ✅ Implement safeguards
5. ✅ Create backup strategy
6. ✅ Test both systems working together
