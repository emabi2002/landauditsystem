-- =============================================
-- SEED DATA: RISK EVENTS
-- Run this AFTER applying fix_rls_for_dev.sql
-- Creates sample risk events for testing
-- =============================================

-- First, let's verify the risks exist
SELECT 'Risks available for linking:' AS info;
SELECT id, risk_code, risk_title, residual_risk_rating
FROM audit_risk_register
WHERE risk_status = 'Active'
ORDER BY
  CASE residual_risk_rating
    WHEN 'Extreme' THEN 1
    WHEN 'High' THEN 2
    WHEN 'Medium' THEN 3
    ELSE 4
  END
LIMIT 10;

-- Get IDs for linking
DO $$
DECLARE
    -- Risk IDs
    risk_duplicate_title UUID;
    risk_fraud_title UUID;
    risk_revenue_leakage UUID;
    risk_cyber_security UUID;
    risk_ilg_invalid UUID;
    risk_valuation UUID;
    risk_planning UUID;
    risk_political UUID;

    -- Division IDs
    div_ltr UUID;
    div_cs UUID;
    div_clu UUID;
    div_val UUID;
    div_phpl UUID;
    div_sec UUID;

    -- Category IDs
    cat_financial UUID;
    cat_compliance UUID;
    cat_ict UUID;
    cat_investigation UUID;
    cat_operational UUID;

BEGIN
    -- Get Risk IDs
    SELECT id INTO risk_duplicate_title FROM audit_risk_register WHERE risk_code = 'DLPP-LT-001';
    SELECT id INTO risk_fraud_title FROM audit_risk_register WHERE risk_code = 'DLPP-LT-002';
    SELECT id INTO risk_revenue_leakage FROM audit_risk_register WHERE risk_code = 'DLPP-FN-001';
    SELECT id INTO risk_cyber_security FROM audit_risk_register WHERE risk_code = 'DLPP-IT-002';
    SELECT id INTO risk_ilg_invalid FROM audit_risk_register WHERE risk_code = 'DLPP-CL-001';
    SELECT id INTO risk_valuation FROM audit_risk_register WHERE risk_code = 'DLPP-SV-002';
    SELECT id INTO risk_planning FROM audit_risk_register WHERE risk_code = 'DLPP-PP-001';
    SELECT id INTO risk_political FROM audit_risk_register WHERE risk_code = 'DLPP-GV-001';

    -- Get Division IDs
    SELECT id INTO div_ltr FROM audit_divisions WHERE code = 'LTR';
    SELECT id INTO div_cs FROM audit_divisions WHERE code = 'CS';
    SELECT id INTO div_clu FROM audit_divisions WHERE code = 'CLU';
    SELECT id INTO div_val FROM audit_divisions WHERE code = 'VAL';
    SELECT id INTO div_phpl FROM audit_divisions WHERE code = 'PHPL';
    SELECT id INTO div_sec FROM audit_divisions WHERE code = 'SEC';

    -- Get Category IDs
    SELECT id INTO cat_financial FROM audit_categories WHERE code = 'FIN';
    SELECT id INTO cat_compliance FROM audit_categories WHERE code = 'CMP';
    SELECT id INTO cat_ict FROM audit_categories WHERE code = 'ICT';
    SELECT id INTO cat_investigation FROM audit_categories WHERE code = 'INV';
    SELECT id INTO cat_operational FROM audit_categories WHERE code = 'OPS';

    -- =========================================
    -- AAAP EVENTS (Annual Audit Activity Plan)
    -- =========================================

    -- Event 1: Land Rent Revenue Audit (High Priority)
    INSERT INTO audit_risk_events (
        event_title, event_description, source_type, primary_risk_id,
        audit_category_id, response_type, priority, target_division_id,
        requested_start_date, requested_completion_date, event_status
    ) VALUES (
        'Land Rent Revenue Collection Audit FY2025',
        'Comprehensive audit of land rent collection processes, billing accuracy, debt recovery, and revenue reconciliation. Focus on identifying leakages and strengthening controls.',
        'AAAP', risk_revenue_leakage,
        cat_financial, 'Audit', 'High', div_cs,
        '2025-02-01', '2025-04-30', 'Approved'
    );

    -- Event 2: Title Registration Compliance Review
    INSERT INTO audit_risk_events (
        event_title, event_description, source_type, primary_risk_id,
        audit_category_id, response_type, priority, target_division_id,
        requested_start_date, requested_completion_date, event_status
    ) VALUES (
        'Title Registration Process Compliance Audit',
        'Review of title registration procedures to ensure compliance with Land Registration Act and prevent duplicate or fraudulent titles.',
        'AAAP', risk_duplicate_title,
        cat_compliance, 'Audit', 'High', div_ltr,
        '2025-03-01', '2025-05-31', 'Pending'
    );

    -- Event 3: ICT Security Assessment
    INSERT INTO audit_risk_events (
        event_title, event_description, source_type, primary_risk_id,
        audit_category_id, response_type, priority, target_division_id,
        requested_start_date, requested_completion_date, event_status
    ) VALUES (
        'Land Information Systems Security Audit',
        'Assessment of cybersecurity controls, access management, data protection, and disaster recovery capabilities for all DLPP information systems.',
        'AAAP', risk_cyber_security,
        cat_ict, 'Audit', 'Critical', div_cs,
        '2025-01-15', '2025-03-15', 'Under Review'
    );

    -- =========================================
    -- SECRETARY DIRECTIVES (Priority Override)
    -- =========================================

    -- Event 4: Urgent Valuation Investigation
    INSERT INTO audit_risk_events (
        event_title, event_description, source_type, primary_risk_id,
        audit_category_id, response_type, priority, target_division_id,
        directive_reference, directive_date, directive_issuer, is_priority_override,
        requested_start_date, requested_completion_date, event_status
    ) VALUES (
        'Investigation: Alleged Valuation Irregularities - Kokopo Properties',
        'Secretary directive to investigate complaints of undervaluation of state properties in Kokopo. Allegations of collusion between valuers and buyers.',
        'Secretary', risk_valuation,
        cat_investigation, 'Investigation', 'Critical', div_val,
        'SEC/DIR/2025/001', '2025-01-10', 'Secretary for Lands', true,
        '2025-01-15', '2025-02-28', 'Approved'
    );

    -- Event 5: ILG Registration Irregularities
    INSERT INTO audit_risk_events (
        event_title, event_description, source_type, primary_risk_id,
        audit_category_id, response_type, priority, target_division_id,
        directive_reference, directive_date, directive_issuer, is_priority_override,
        requested_start_date, requested_completion_date, event_status
    ) VALUES (
        'Special Review: ILG Registration Compliance - Southern Highlands',
        'Secretary requires immediate review of ILG registrations in Southern Highlands Province following community disputes and allegations of invalid registrations.',
        'Secretary', risk_ilg_invalid,
        cat_compliance, 'Review', 'Critical', div_clu,
        'SEC/DIR/2025/002', '2025-01-12', 'Secretary for Lands', true,
        '2025-01-20', '2025-03-20', 'Pending'
    );

    -- =========================================
    -- EXTERNAL REQUESTS
    -- =========================================

    -- Event 6: Auditor-General Request
    INSERT INTO audit_risk_events (
        event_title, event_description, source_type, primary_risk_id,
        audit_category_id, response_type, priority, target_division_id,
        requested_start_date, requested_completion_date, event_status
    ) VALUES (
        'AGO Request: State Land Lease Management Review',
        'Request from Auditor-General Office to review management of state land leases, focusing on compliance with lease conditions and rent collection.',
        'External', risk_revenue_leakage,
        cat_compliance, 'Review', 'High', div_cs,
        '2025-04-01', '2025-06-30', 'Pending'
    );

    -- Event 7: Ombudsman Commission Request
    INSERT INTO audit_risk_events (
        event_title, event_description, source_type, primary_risk_id,
        audit_category_id, response_type, priority, target_division_id,
        requested_start_date, requested_completion_date, event_status
    ) VALUES (
        'OC Request: Title Fraud Prevention Controls Assessment',
        'Ombudsman Commission request to assess controls in place to prevent and detect title fraud following increased public complaints.',
        'External', risk_fraud_title,
        cat_operational, 'Review', 'High', div_ltr,
        '2025-02-15', '2025-04-15', 'Approved'
    );

    -- =========================================
    -- INTERNAL REQUESTS
    -- =========================================

    -- Event 8: Physical Planning Division Request
    INSERT INTO audit_risk_events (
        event_title, event_description, source_type, primary_risk_id,
        audit_category_id, response_type, priority, target_division_id,
        requested_start_date, requested_completion_date, event_status
    ) VALUES (
        'Self-Assessment: Development Approval Process Review',
        'Request from Chief Physical Planner for internal audit to review development approval processes and identify efficiency improvements.',
        'Internal', risk_planning,
        cat_operational, 'Review', 'Medium', div_phpl,
        '2025-03-15', '2025-05-15', 'Pending'
    );

    -- Event 9: Corporate Services Request
    INSERT INTO audit_risk_events (
        event_title, event_description, source_type, primary_risk_id,
        audit_category_id, response_type, priority, target_division_id,
        requested_start_date, requested_completion_date, event_status
    ) VALUES (
        'IT Systems Access Control Review',
        'Request from Director Corporate Services for review of user access controls across all DLPP systems following staff movements.',
        'Internal', risk_cyber_security,
        cat_ict, 'Review', 'Medium', div_cs,
        '2025-02-01', '2025-03-31', 'Allocated'
    );

    -- Event 10: Follow-up Audit
    INSERT INTO audit_risk_events (
        event_title, event_description, source_type, primary_risk_id,
        audit_category_id, response_type, priority, target_division_id,
        requested_start_date, requested_completion_date, event_status
    ) VALUES (
        'Follow-up: Prior Year Revenue Audit Recommendations',
        'Follow-up audit to verify implementation of recommendations from FY2024 Land Rent Revenue audit.',
        'AAAP', risk_revenue_leakage,
        cat_financial, 'Audit', 'Medium', div_cs,
        '2025-05-01', '2025-05-31', 'Pending'
    );

END $$;

-- =============================================
-- VERIFICATION
-- =============================================
SELECT 'Risk Events seeded successfully!' AS status;

SELECT
    event_code,
    event_title,
    source_type,
    priority,
    event_status,
    CASE WHEN is_priority_override THEN 'YES' ELSE 'NO' END AS priority_override
FROM audit_risk_events
ORDER BY
    CASE priority WHEN 'Critical' THEN 1 WHEN 'High' THEN 2 WHEN 'Medium' THEN 3 ELSE 4 END,
    created_at;

-- Summary by status
SELECT event_status, COUNT(*) as count
FROM audit_risk_events
GROUP BY event_status
ORDER BY count DESC;

-- Summary by source
SELECT source_type, COUNT(*) as count
FROM audit_risk_events
GROUP BY source_type
ORDER BY count DESC;
