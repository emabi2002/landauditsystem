-- =============================================
-- CLEAN MIGRATION - Drops existing tables first
-- Run this if you're getting "column does not exist" errors
-- =============================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- =============================================
-- DROP EXISTING TABLES (in correct order)
-- =============================================

-- Drop tables in reverse dependency order
DROP TABLE IF EXISTS psap_assessment_scores CASCADE;
DROP TABLE IF EXISTS psap_assessments CASCADE;
DROP TABLE IF EXISTS psap_rating_scales CASCADE;
DROP TABLE IF EXISTS psap_standards CASCADE;

DROP TABLE IF EXISTS kra_activity_quarterly_status CASCADE;
DROP TABLE IF EXISTS kra_activities CASCADE;
DROP TABLE IF EXISTS strategic_kras CASCADE;

DROP TABLE IF EXISTS action_plans CASCADE;
DROP TABLE IF EXISTS recommendations CASCADE;
DROP TABLE IF EXISTS findings CASCADE;

DROP TABLE IF EXISTS evidence CASCADE;
DROP TABLE IF EXISTS workpapers CASCADE;
DROP TABLE IF EXISTS engagement_team CASCADE;
DROP TABLE IF EXISTS engagements CASCADE;

DROP TABLE IF EXISTS risk_profile_items CASCADE;
DROP TABLE IF EXISTS risk_profiles CASCADE;

DROP TABLE IF EXISTS controls CASCADE;
DROP TABLE IF EXISTS obligations CASCADE;

DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS events CASCADE;

DROP TABLE IF EXISTS people CASCADE;
DROP TABLE IF EXISTS org_units CASCADE;

-- =============================================
-- NOW RUN THE OPTIMIZED SCHEMA
-- Copy and paste the contents of optimized_schema.sql BELOW this line
-- =============================================
