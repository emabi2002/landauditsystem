-- =============================================
-- QUICK FIX: Drop and recreate PSAP tables
-- Run this first, then run the main migration
-- =============================================

-- Drop PSAP tables if they exist with wrong schema
DROP TABLE IF EXISTS psap_assessment_scores CASCADE;
DROP TABLE IF EXISTS psap_assessments CASCADE;
DROP TABLE IF EXISTS psap_rating_scales CASCADE;
DROP TABLE IF EXISTS psap_standards CASCADE;

-- Now these will be created correctly by the main migration
