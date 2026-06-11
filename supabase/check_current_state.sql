-- =============================================
-- CHECK CURRENT DATABASE STATE
-- Run this to see what exists
-- =============================================

-- 1. What tables exist?
SELECT
    table_name,
    table_type
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;

-- 2. What columns does psap_standards have (if it exists)?
SELECT
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'psap_standards'
ORDER BY ordinal_position;

-- 3. What columns does people have?
SELECT
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'people'
ORDER BY ordinal_position;

-- 4. What columns does engagements have?
SELECT
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'engagements'
ORDER BY ordinal_position;

-- 5. Are there any triggers?
SELECT
    trigger_name,
    event_object_table,
    action_statement
FROM information_schema.triggers
WHERE trigger_schema = 'public'
ORDER BY event_object_table;
