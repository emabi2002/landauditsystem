-- =============================================
-- VERIFY SCHEMA - Check everything was created
-- =============================================

-- Count tables
SELECT
    COUNT(*) as total_tables,
    COUNT(CASE WHEN table_type = 'BASE TABLE' THEN 1 END) as base_tables,
    COUNT(CASE WHEN table_type = 'VIEW' THEN 1 END) as views
FROM information_schema.tables
WHERE table_schema = 'public';

-- List all tables
SELECT
    table_name,
    (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_schema = 'public'
AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- Check indexes
SELECT
    COUNT(*) as total_indexes
FROM pg_indexes
WHERE schemaname = 'public';

-- Check triggers
SELECT
    COUNT(*) as total_triggers
FROM information_schema.triggers
WHERE trigger_schema = 'public';

-- Check functions
SELECT
    routine_name,
    routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
ORDER BY routine_name;

-- Check seed data
SELECT 'Org Units' as table_name, COUNT(*) as row_count FROM org_units
UNION ALL
SELECT 'PSAP Standards', COUNT(*) FROM psap_standards
UNION ALL
SELECT 'PSAP Rating Scales', COUNT(*) FROM psap_rating_scales;
