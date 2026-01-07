-- ========================================
-- DATABASE SCHEMA CHECK
-- Run this in Supabase SQL Editor to see what exists
-- ========================================

-- 1. List all tables in public schema
SELECT
    table_name,
    table_type
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;

-- 2. List all columns for each table
SELECT
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
ORDER BY table_name, ordinal_position;

-- 3. List all views
SELECT
    table_name as view_name
FROM information_schema.views
WHERE table_schema = 'public'
ORDER BY table_name;

-- 4. List all functions
SELECT
    routine_name as function_name,
    routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
ORDER BY routine_name;

-- 5. Check which specific tables we need
SELECT
    CASE
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'org_units')
        THEN '✅ org_units EXISTS'
        ELSE '❌ org_units MISSING'
    END as org_units_status,

    CASE
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'people')
        THEN '✅ people EXISTS'
        ELSE '❌ people MISSING'
    END as people_status,

    CASE
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'engagements')
        THEN '✅ engagements EXISTS'
        ELSE '❌ engagements MISSING'
    END as engagements_status,

    CASE
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'findings')
        THEN '✅ findings EXISTS'
        ELSE '❌ findings MISSING'
    END as findings_status,

    CASE
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'recommendations')
        THEN '✅ recommendations EXISTS'
        ELSE '❌ recommendations MISSING'
    END as recommendations_status,

    CASE
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'action_plans')
        THEN '✅ action_plans EXISTS'
        ELSE '❌ action_plans MISSING'
    END as action_plans_status,

    CASE
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'risk_profiles')
        THEN '✅ risk_profiles EXISTS'
        ELSE '❌ risk_profiles MISSING'
    END as risk_profiles_status,

    CASE
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'psap_standards')
        THEN '✅ psap_standards EXISTS'
        ELSE '❌ psap_standards MISSING'
    END as psap_standards_status,

    CASE
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'strategic_kras')
        THEN '✅ strategic_kras EXISTS'
        ELSE '❌ strategic_kras MISSING'
    END as strategic_kras_status;
