-- =============================================
-- AUDIT SHARED DATABASE
-- Check what tables exist and who might own them
-- =============================================

-- 1. List ALL tables with column counts
SELECT
    t.table_name,
    COUNT(c.column_name) as column_count,
    string_agg(c.column_name, ', ' ORDER BY c.ordinal_position) as columns
FROM information_schema.tables t
LEFT JOIN information_schema.columns c ON c.table_name = t.table_name AND c.table_schema = 'public'
WHERE t.table_schema = 'public'
AND t.table_type = 'BASE TABLE'
GROUP BY t.table_name
ORDER BY t.table_name;

-- 2. Check for audit-specific tables (that we created)
SELECT
    CASE
        WHEN table_name IN (
            'engagements', 'engagement_team', 'workpapers', 'evidence',
            'findings', 'recommendations', 'action_plans',
            'obligations', 'controls',
            'risk_profiles', 'risk_profile_items',
            'psap_standards', 'psap_rating_scales', 'psap_assessments', 'psap_assessment_scores',
            'strategic_kras', 'kra_activities', 'kra_activity_quarterly_status',
            'events'
        ) THEN 'AUDIT SYSTEM'
        WHEN table_name IN ('org_units', 'people', 'notifications') THEN 'POSSIBLY SHARED'
        ELSE 'OTHER DEPARTMENT'
    END as likely_owner,
    table_name,
    (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as columns
FROM information_schema.tables t
WHERE table_schema = 'public'
AND table_type = 'BASE TABLE'
ORDER BY likely_owner, table_name;

-- 3. Check row counts (to see if other systems have data)
DO $$
DECLARE
    tbl RECORD;
    row_count INTEGER;
BEGIN
    RAISE NOTICE 'TABLE NAME | ROW COUNT | STATUS';
    RAISE NOTICE '----------------------------------------';

    FOR tbl IN
        SELECT table_name
        FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_type = 'BASE TABLE'
        ORDER BY table_name
    LOOP
        EXECUTE format('SELECT COUNT(*) FROM %I', tbl.table_name) INTO row_count;

        RAISE NOTICE '% | % | %',
            RPAD(tbl.table_name, 30),
            LPAD(row_count::TEXT, 8),
            CASE
                WHEN row_count = 0 THEN 'Empty'
                WHEN row_count < 10 THEN 'Few rows'
                ELSE 'Has data - MAY BE SHARED!'
            END;
    END LOOP;
END $$;

-- 4. Check for foreign keys to identify relationships
SELECT
    tc.table_name as from_table,
    kcu.column_name as from_column,
    ccu.table_name AS to_table,
    ccu.column_name AS to_column
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
AND tc.table_schema = 'public'
ORDER BY tc.table_name, kcu.column_name;

-- 5. List all RLS policies (might conflict with other departments)
SELECT
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
