-- =============================================
-- STEP-BY-STEP MIGRATION
-- Run each section one at a time to find the error
-- =============================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- =============================================
-- STEP 1: Foundation Tables
-- =============================================

CREATE TABLE IF NOT EXISTS org_units (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    code TEXT UNIQUE NOT NULL,
    parent_id UUID REFERENCES org_units(id),
    description TEXT,
    active BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS people (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL CHECK (role IN (
        'Audit Admin',
        'Audit Manager',
        'Auditor',
        'Action Owner',
        'Read-Only',
        'System Integrator'
    )),
    org_unit_id UUID REFERENCES org_units(id),
    active BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Test: Insert default org unit
INSERT INTO org_units (name, code, description)
VALUES ('DLPP Head Office', 'DLPP-HQ', 'Department of Lands and Physical Planning - Main Office')
ON CONFLICT (code) DO NOTHING;

SELECT 'STEP 1 COMPLETE: Foundation tables created' AS status;

-- =============================================
-- STOP HERE AND RUN
-- If this succeeds, continue with next sections
-- =============================================
