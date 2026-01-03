import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function seedDatabase() {
  console.log('🌱 Starting comprehensive database seeding...\n')

  try {
    // 1. Seed Divisions
    console.log('📁 Seeding divisions...')
    const divisions = [
      { id: 'div-001', code: 'LANDS', name: 'Lands Administration Division', description: 'Manages land registration and administration' },
      { id: 'div-002', code: 'SURVEY', name: 'Survey and Mapping Division', description: 'Handles surveying and geospatial services' },
      { id: 'div-003', code: 'VALUATION', name: 'Valuation Division', description: 'Property and land valuation services' },
      { id: 'div-004', code: 'PLANNING', name: 'Physical Planning Division', description: 'Urban and regional planning' },
      { id: 'div-005', code: 'FINANCE', name: 'Finance and Administration', description: 'Financial management and admin services' },
    ]

    for (const div of divisions) {
      await supabase.from('audit_divisions').upsert(div, { onConflict: 'id' })
    }
    console.log(`   ✅ ${divisions.length} divisions seeded`)

    // 2. Seed Sections
    console.log('📂 Seeding sections...')
    const sections = [
      { id: 'sec-001', division_id: 'div-001', code: 'REG', name: 'Registration Unit', description: 'Land title registration' },
      { id: 'sec-002', division_id: 'div-001', code: 'REC', name: 'Records Management', description: 'Land records and archives' },
      { id: 'sec-003', division_id: 'div-002', code: 'CAD', name: 'Cadastral Survey', description: 'Cadastral surveying operations' },
      { id: 'sec-004', division_id: 'div-002', code: 'GIS', name: 'GIS Unit', description: 'Geographic information systems' },
      { id: 'sec-005', division_id: 'div-003', code: 'MASS', name: 'Mass Valuation', description: 'Mass appraisal and rating' },
      { id: 'sec-006', division_id: 'div-004', code: 'DEV', name: 'Development Control', description: 'Building permits and development approvals' },
    ]

    for (const sec of sections) {
      await supabase.from('audit_sections').upsert(sec, { onConflict: 'id' })
    }
    console.log(`   ✅ ${sections.length} sections seeded`)

    // 3. Seed Audit Categories
    console.log('🏷️ Seeding audit categories...')
    const categories = [
      { id: 'cat-001', code: 'COMP', name: 'Compliance Audit', description: 'Regulatory and policy compliance reviews' },
      { id: 'cat-002', code: 'FIN', name: 'Financial Audit', description: 'Financial controls and reporting reviews' },
      { id: 'cat-003', code: 'OPS', name: 'Operational Audit', description: 'Process efficiency and effectiveness reviews' },
      { id: 'cat-004', code: 'IT', name: 'IT Audit', description: 'Information technology controls and security' },
      { id: 'cat-005', code: 'SPEC', name: 'Special Investigation', description: 'Fraud and special investigations' },
      { id: 'cat-006', code: 'PERF', name: 'Performance Audit', description: 'Value for money and performance reviews' },
    ]

    for (const cat of categories) {
      await supabase.from('audit_categories').upsert(cat, { onConflict: 'id' })
    }
    console.log(`   ✅ ${categories.length} categories seeded`)

    // 4. Seed Risk Register
    console.log('⚠️ Seeding risk register...')
    const risks = [
      {
        id: 'risk-001',
        risk_code: 'DLPP-REG-001',
        risk_title: 'Fraudulent Land Title Registration',
        risk_description: 'Risk of fraudulent land titles being registered due to inadequate verification processes',
        risk_category: 'Compliance',
        division_id: 'div-001',
        inherent_likelihood: 4,
        inherent_impact: 5,
        inherent_risk_score: 20,
        inherent_risk_rating: 'Extreme',
        residual_likelihood: 2,
        residual_impact: 4,
        residual_risk_score: 8,
        residual_risk_rating: 'Medium',
        risk_status: 'Active',
        control_effectiveness: 'Partially Effective',
        risk_owner_role: 'Registrar of Titles',
        is_system_risk: true,
      },
      {
        id: 'risk-002',
        risk_code: 'DLPP-IT-001',
        risk_title: 'Cybersecurity Breach',
        risk_description: 'Risk of unauthorized access to land information systems and data theft',
        risk_category: 'Technology',
        division_id: 'div-002',
        inherent_likelihood: 3,
        inherent_impact: 5,
        inherent_risk_score: 15,
        inherent_risk_rating: 'High',
        residual_likelihood: 2,
        residual_impact: 4,
        residual_risk_score: 8,
        residual_risk_rating: 'Medium',
        risk_status: 'Active',
        control_effectiveness: 'Effective',
        risk_owner_role: 'IT Manager',
        is_system_risk: true,
      },
      {
        id: 'risk-003',
        risk_code: 'DLPP-FIN-001',
        risk_title: 'Revenue Leakage',
        risk_description: 'Risk of uncollected fees and revenue from land transactions',
        risk_category: 'Financial',
        division_id: 'div-005',
        inherent_likelihood: 4,
        inherent_impact: 4,
        inherent_risk_score: 16,
        inherent_risk_rating: 'High',
        residual_likelihood: 2,
        residual_impact: 3,
        residual_risk_score: 6,
        residual_risk_rating: 'Medium',
        risk_status: 'Active',
        control_effectiveness: 'Partially Effective',
        risk_owner_role: 'Chief Accountant',
        is_system_risk: true,
      },
      {
        id: 'risk-004',
        risk_code: 'DLPP-OPS-001',
        risk_title: 'Survey Data Inaccuracy',
        risk_description: 'Risk of inaccurate survey measurements leading to boundary disputes',
        risk_category: 'Operational',
        division_id: 'div-002',
        inherent_likelihood: 3,
        inherent_impact: 4,
        inherent_risk_score: 12,
        inherent_risk_rating: 'High',
        residual_likelihood: 2,
        residual_impact: 3,
        residual_risk_score: 6,
        residual_risk_rating: 'Medium',
        risk_status: 'Active',
        control_effectiveness: 'Effective',
        risk_owner_role: 'Chief Surveyor',
        is_system_risk: true,
      },
      {
        id: 'risk-005',
        risk_code: 'DLPP-COMP-001',
        risk_title: 'Non-Compliance with Land Act',
        risk_description: 'Risk of non-compliance with the Land Act provisions and regulations',
        risk_category: 'Compliance',
        division_id: 'div-001',
        inherent_likelihood: 3,
        inherent_impact: 4,
        inherent_risk_score: 12,
        inherent_risk_rating: 'High',
        residual_likelihood: 2,
        residual_impact: 3,
        residual_risk_score: 6,
        residual_risk_rating: 'Medium',
        risk_status: 'Under Review',
        control_effectiveness: 'Partially Effective',
        risk_owner_role: 'Legal Counsel',
        is_system_risk: true,
      },
    ]

    for (const risk of risks) {
      await supabase.from('audit_risk_register').upsert(risk as never, { onConflict: 'id' })
    }
    console.log(`   ✅ ${risks.length} risks seeded`)

    // 5. Seed Risk Events
    console.log('⚡ Seeding risk events...')
    const riskEvents = [
      {
        id: 'evt-001',
        event_code: 'RE-2025-001',
        event_title: 'Land Title Verification Audit',
        event_description: 'Comprehensive audit of land title verification processes',
        source_type: 'AAAP',
        primary_risk_id: 'risk-001',
        priority: 'Critical',
        event_status: 'In Progress',
        target_division_id: 'div-001',
        is_priority_override: false,
      },
      {
        id: 'evt-002',
        event_code: 'RE-2025-002',
        event_title: 'IT Security Assessment',
        event_description: 'Annual IT security and cybersecurity controls assessment',
        source_type: 'AAAP',
        primary_risk_id: 'risk-002',
        priority: 'High',
        event_status: 'Approved',
        target_division_id: 'div-002',
        is_priority_override: false,
      },
      {
        id: 'evt-003',
        event_code: 'RE-2025-003',
        event_title: 'Revenue Collection Review',
        event_description: 'Special review of revenue collection and reconciliation',
        source_type: 'Secretary',
        primary_risk_id: 'risk-003',
        priority: 'Critical',
        event_status: 'Under Review',
        target_division_id: 'div-005',
        is_priority_override: true,
      },
      {
        id: 'evt-004',
        event_code: 'RE-2025-004',
        event_title: 'Survey Equipment Calibration Audit',
        event_description: 'Review of survey equipment maintenance and calibration procedures',
        source_type: 'Internal',
        primary_risk_id: 'risk-004',
        priority: 'Medium',
        event_status: 'Pending',
        target_division_id: 'div-002',
        is_priority_override: false,
      },
      {
        id: 'evt-005',
        event_code: 'RE-2025-005',
        event_title: 'Land Act Compliance Review',
        event_description: 'Statutory compliance review for Land Act provisions',
        source_type: 'External',
        primary_risk_id: 'risk-005',
        priority: 'High',
        event_status: 'Pending',
        target_division_id: 'div-001',
        is_priority_override: false,
      },
      {
        id: 'evt-006',
        event_code: 'RE-2025-006',
        event_title: 'GIS Data Integrity Check',
        event_description: 'Data quality assessment of GIS databases',
        source_type: 'AAAP',
        primary_risk_id: 'risk-002',
        priority: 'Medium',
        event_status: 'Approved',
        target_division_id: 'div-002',
        is_priority_override: false,
      },
    ]

    for (const evt of riskEvents) {
      await supabase.from('audit_risk_events').upsert(evt as never, { onConflict: 'id' })
    }
    console.log(`   ✅ ${riskEvents.length} risk events seeded`)

    // 6. Seed Engagements
    console.log('📋 Seeding engagements...')
    const engagements = [
      {
        id: 'eng-001',
        title: 'Land Title Registration Process Audit 2025',
        scope: 'Review of end-to-end land title registration process including verification, approval, and issuance',
        objectives: 'Assess adequacy of controls, identify fraud risks, recommend improvements',
        status: 'Fieldwork',
        start_date: '2025-01-15',
        end_date: '2025-03-15',
        risk_event_id: 'evt-001',
        audit_category_id: 'cat-001',
      },
      {
        id: 'eng-002',
        title: 'IT Security Controls Assessment Q1 2025',
        scope: 'Assessment of IT security controls, access management, and data protection measures',
        objectives: 'Evaluate cybersecurity posture, test controls effectiveness, identify vulnerabilities',
        status: 'Planning',
        start_date: '2025-02-01',
        end_date: '2025-04-30',
        risk_event_id: 'evt-002',
        audit_category_id: 'cat-004',
      },
      {
        id: 'eng-003',
        title: 'Revenue Collection and Reconciliation Audit',
        scope: 'Review of revenue collection processes, fee structures, and bank reconciliations',
        objectives: 'Identify revenue leakage, assess collection efficiency, verify reconciliations',
        status: 'Fieldwork',
        start_date: '2025-01-20',
        end_date: '2025-02-28',
        risk_event_id: 'evt-003',
        audit_category_id: 'cat-002',
      },
      {
        id: 'eng-004',
        title: 'Procurement Compliance Audit 2024',
        scope: 'Review of procurement processes and compliance with regulations',
        objectives: 'Verify compliance with procurement laws, assess vendor management',
        status: 'Reporting',
        start_date: '2024-10-01',
        end_date: '2024-12-31',
        audit_category_id: 'cat-001',
      },
      {
        id: 'eng-005',
        title: 'Physical Planning Permits Review',
        scope: 'Assessment of development permit issuance and monitoring',
        objectives: 'Evaluate permit processes, verify compliance monitoring',
        status: 'Follow-up',
        start_date: '2024-09-01',
        end_date: '2024-11-30',
        audit_category_id: 'cat-003',
      },
      {
        id: 'eng-006',
        title: 'HR and Payroll Audit 2024',
        scope: 'Review of HR processes and payroll controls',
        objectives: 'Assess payroll accuracy, ghost worker detection, leave management',
        status: 'Closed',
        start_date: '2024-07-01',
        end_date: '2024-09-30',
        audit_category_id: 'cat-002',
      },
    ]

    for (const eng of engagements) {
      await supabase.from('audit_engagements').upsert(eng as never, { onConflict: 'id' })
    }
    console.log(`   ✅ ${engagements.length} engagements seeded`)

    // 7. Seed Findings
    console.log('🔍 Seeding findings...')
    const findings = [
      {
        id: 'fnd-001',
        finding_code: 'FND-2025-001',
        engagement_id: 'eng-001',
        title: 'Inadequate Document Verification',
        description: 'Supporting documents for land title applications are not being adequately verified before processing',
        risk_rating: 'High',
        status: 'Open',
        condition: 'Documents are accepted without thorough verification of authenticity',
        criteria: 'Land Registration Act requires verification of all supporting documents',
        cause: 'Insufficient staff training and lack of verification tools',
        effect: 'Increased risk of fraudulent titles being registered',
      },
      {
        id: 'fnd-002',
        finding_code: 'FND-2025-002',
        engagement_id: 'eng-001',
        title: 'Missing Approval Signatures',
        description: 'Several land title applications processed without required supervisor approval signatures',
        risk_rating: 'Critical',
        status: 'Open',
        condition: '15% of sampled applications lacked supervisor approval',
        criteria: 'Internal procedures require supervisor sign-off on all applications',
        cause: 'Workflow system allows bypassing approval steps',
        effect: 'Segregation of duties compromised',
      },
      {
        id: 'fnd-003',
        finding_code: 'FND-2025-003',
        engagement_id: 'eng-003',
        title: 'Unreconciled Revenue Accounts',
        description: 'Bank reconciliations not performed for 3 months',
        risk_rating: 'High',
        status: 'Open',
        condition: 'Last reconciliation was performed 3 months ago',
        criteria: 'Finance policy requires monthly reconciliations',
        cause: 'Staff vacancy in accounts section',
        effect: 'Potential errors and fraud going undetected',
      },
      {
        id: 'fnd-004',
        finding_code: 'FND-2025-004',
        engagement_id: 'eng-003',
        title: 'Fee Waivers Without Documentation',
        description: 'Fee waivers granted without proper authorization documentation',
        risk_rating: 'Medium',
        status: 'Draft',
        condition: '8 fee waivers lacked supporting documentation',
        criteria: 'Fee waiver policy requires written authorization from Secretary',
        cause: 'Unclear waiver authorization process',
        effect: 'Revenue loss of approximately K50,000',
      },
      {
        id: 'fnd-005',
        finding_code: 'FND-2024-015',
        engagement_id: 'eng-004',
        title: 'Contract Splitting',
        description: 'Evidence of contract splitting to avoid procurement thresholds',
        risk_rating: 'Critical',
        status: 'Closed',
        condition: 'Multiple contracts to same vendor totaling above threshold',
        criteria: 'Procurement Act prohibits contract splitting',
        cause: 'Intentional circumvention of procurement rules',
        effect: 'Non-competitive procurement, potential fraud',
      },
      {
        id: 'fnd-006',
        finding_code: 'FND-2024-016',
        engagement_id: 'eng-005',
        title: 'Expired Building Permits',
        description: 'Constructions continuing with expired building permits',
        risk_rating: 'Medium',
        status: 'Remediated',
        condition: '25 active construction sites with expired permits',
        criteria: 'Physical Planning Act requires valid permits',
        cause: 'Inadequate permit monitoring system',
        effect: 'Non-compliant developments, safety risks',
      },
    ]

    for (const fnd of findings) {
      await supabase.from('audit_findings').upsert(fnd as never, { onConflict: 'id' })
    }
    console.log(`   ✅ ${findings.length} findings seeded`)

    // 8. Seed Recommendations
    console.log('💡 Seeding recommendations...')
    const recommendations = [
      {
        id: 'rec-001',
        recommendation_code: 'REC-2025-001',
        finding_id: 'fnd-001',
        title: 'Implement Document Verification System',
        description: 'Implement an electronic document verification system with authenticity checks',
        priority: 'High',
        status: 'Published',
        target_date: '2025-06-30',
        responsible_person: 'Registrar of Titles',
      },
      {
        id: 'rec-002',
        recommendation_code: 'REC-2025-002',
        finding_id: 'fnd-001',
        title: 'Staff Training on Verification',
        description: 'Conduct comprehensive training on document verification procedures',
        priority: 'Medium',
        status: 'Published',
        target_date: '2025-04-30',
        responsible_person: 'HR Manager',
      },
      {
        id: 'rec-003',
        recommendation_code: 'REC-2025-003',
        finding_id: 'fnd-002',
        title: 'Fix Workflow System',
        description: 'Modify workflow system to enforce mandatory approval steps',
        priority: 'Critical',
        status: 'Published',
        target_date: '2025-03-31',
        responsible_person: 'IT Manager',
      },
      {
        id: 'rec-004',
        recommendation_code: 'REC-2025-004',
        finding_id: 'fnd-003',
        title: 'Fill Accounts Vacancy',
        description: 'Urgently fill the vacant accounts officer position',
        priority: 'High',
        status: 'Accepted',
        target_date: '2025-02-28',
        responsible_person: 'HR Manager',
      },
      {
        id: 'rec-005',
        recommendation_code: 'REC-2025-005',
        finding_id: 'fnd-003',
        title: 'Complete Outstanding Reconciliations',
        description: 'Complete all outstanding bank reconciliations immediately',
        priority: 'Critical',
        status: 'In Progress',
        target_date: '2025-02-15',
        responsible_person: 'Chief Accountant',
      },
      {
        id: 'rec-006',
        recommendation_code: 'REC-2025-006',
        finding_id: 'fnd-004',
        title: 'Fee Waiver Policy Review',
        description: 'Review and update fee waiver authorization policy',
        priority: 'Medium',
        status: 'Draft',
        target_date: '2025-05-31',
        responsible_person: 'Policy Officer',
      },
    ]

    for (const rec of recommendations) {
      await supabase.from('audit_recommendations').upsert(rec as never, { onConflict: 'id' })
    }
    console.log(`   ✅ ${recommendations.length} recommendations seeded`)

    // 9. Seed Action Plans
    console.log('📝 Seeding action plans...')
    const actionPlans = [
      {
        id: 'ap-001',
        recommendation_id: 'rec-001',
        action_description: 'Procure and implement e-verification system',
        status: 'In Progress',
        progress_percentage: 30,
        due_date: '2025-06-30',
        start_date: '2025-02-01',
      },
      {
        id: 'ap-002',
        recommendation_id: 'rec-002',
        action_description: 'Develop training curriculum and schedule sessions',
        status: 'Not Started',
        progress_percentage: 0,
        due_date: '2025-04-30',
        start_date: '2025-03-01',
      },
      {
        id: 'ap-003',
        recommendation_id: 'rec-003',
        action_description: 'Engage IT vendor to modify workflow system',
        status: 'In Progress',
        progress_percentage: 60,
        due_date: '2025-03-31',
        start_date: '2025-01-15',
      },
      {
        id: 'ap-004',
        recommendation_id: 'rec-004',
        action_description: 'Advertise position and conduct interviews',
        status: 'In Progress',
        progress_percentage: 75,
        due_date: '2025-02-28',
        start_date: '2025-01-10',
      },
      {
        id: 'ap-005',
        recommendation_id: 'rec-005',
        action_description: 'Complete 3 months of reconciliations',
        status: 'In Progress',
        progress_percentage: 50,
        due_date: '2025-02-15',
        start_date: '2025-01-20',
      },
      {
        id: 'ap-006',
        recommendation_id: 'rec-005',
        action_description: 'Implement automated reconciliation alerts',
        status: 'Overdue',
        progress_percentage: 20,
        due_date: '2025-01-31',
        start_date: '2025-01-01',
      },
    ]

    for (const ap of actionPlans) {
      await supabase.from('audit_action_plans').upsert(ap as never, { onConflict: 'id' })
    }
    console.log(`   ✅ ${actionPlans.length} action plans seeded`)

    // 10. Seed Risk Profiles
    console.log('📊 Seeding risk profiles...')
    const riskProfiles = [
      {
        id: 'rp-001',
        project_name: 'Land Title Digitization Project',
        profile_date: '2025-01-10',
        prepared_by: 'John Auditor',
        reviewed_by: 'Jane Manager',
        overall_level: 'High',
        remarks: 'High risk due to data migration complexity',
      },
      {
        id: 'rp-002',
        project_name: 'Revenue System Upgrade',
        profile_date: '2025-01-05',
        prepared_by: 'Mary Analyst',
        reviewed_by: 'Jane Manager',
        overall_level: 'Medium',
        remarks: 'Moderate risk with adequate controls planned',
      },
    ]

    for (const rp of riskProfiles) {
      await supabase.from('audit_risk_profiles').upsert(rp as never, { onConflict: 'id' })
    }
    console.log(`   ✅ ${riskProfiles.length} risk profiles seeded`)

    // 11. Seed Strategic KRAs
    console.log('🎯 Seeding strategic KRAs...')
    const kras = [
      {
        id: 'kra-001',
        kra_code: 'KRA-01',
        kra_title: 'Audit Coverage',
        purpose: 'Ensure comprehensive audit coverage of high-risk areas',
        start_year: 2025,
        end_year: 2027,
      },
      {
        id: 'kra-002',
        kra_code: 'KRA-02',
        kra_title: 'Recommendation Implementation',
        purpose: 'Ensure timely implementation of audit recommendations',
        start_year: 2025,
        end_year: 2027,
      },
      {
        id: 'kra-003',
        kra_code: 'KRA-03',
        kra_title: 'Stakeholder Satisfaction',
        purpose: 'Maintain high levels of stakeholder satisfaction with audit services',
        start_year: 2025,
        end_year: 2027,
      },
    ]

    for (const kra of kras) {
      await supabase.from('audit_strategic_kras').upsert(kra as never, { onConflict: 'id' })
    }
    console.log(`   ✅ ${kras.length} KRAs seeded`)

    // 12. Seed KRA Activities
    console.log('📋 Seeding KRA activities...')
    const kraActivities = [
      {
        id: 'act-001',
        strategic_kra_id: 'kra-001',
        activity_code: 'ACT-01-01',
        description: 'Complete 90% of planned audits',
        measure: 'Percentage of planned audits completed',
        baseline: '75%',
        annual_target: '90%',
      },
      {
        id: 'act-002',
        strategic_kra_id: 'kra-001',
        activity_code: 'ACT-01-02',
        description: 'Audit all critical risk areas',
        measure: 'Number of critical risk areas audited',
        baseline: '3',
        annual_target: '5',
      },
      {
        id: 'act-003',
        strategic_kra_id: 'kra-002',
        activity_code: 'ACT-02-01',
        description: 'Achieve 80% recommendation implementation rate',
        measure: 'Percentage of recommendations implemented',
        baseline: '60%',
        annual_target: '80%',
      },
      {
        id: 'act-004',
        strategic_kra_id: 'kra-003',
        activity_code: 'ACT-03-01',
        description: 'Achieve 85% stakeholder satisfaction score',
        measure: 'Stakeholder satisfaction survey score',
        baseline: '70%',
        annual_target: '85%',
      },
    ]

    for (const act of kraActivities) {
      await supabase.from('audit_kra_activities').upsert(act as never, { onConflict: 'id' })
    }
    console.log(`   ✅ ${kraActivities.length} KRA activities seeded`)

    // 13. Seed PSAP Standards
    console.log('📏 Seeding PSAP standards...')
    const psapStandards = [
      { id: 'std-001', standard_number: 1, title: 'Board Governance', description: 'Effectiveness of board oversight', weight: 5, category: 'Governance' },
      { id: 'std-002', standard_number: 2, title: 'Strategic Planning', description: 'Quality of strategic planning processes', weight: 5, category: 'Governance' },
      { id: 'std-003', standard_number: 3, title: 'Risk Management', description: 'Effectiveness of risk management framework', weight: 5, category: 'Governance' },
      { id: 'std-004', standard_number: 4, title: 'Internal Controls', description: 'Adequacy of internal control systems', weight: 5, category: 'Governance' },
      { id: 'std-005', standard_number: 5, title: 'Financial Management', description: 'Quality of financial management practices', weight: 5, category: 'Financial' },
      { id: 'std-006', standard_number: 6, title: 'Budget Execution', description: 'Budget execution and variance management', weight: 5, category: 'Financial' },
      { id: 'std-007', standard_number: 7, title: 'Asset Management', description: 'Asset register and management practices', weight: 5, category: 'Financial' },
      { id: 'std-008', standard_number: 8, title: 'Procurement', description: 'Procurement compliance and efficiency', weight: 5, category: 'Financial' },
      { id: 'std-009', standard_number: 9, title: 'HR Management', description: 'Human resource management practices', weight: 5, category: 'Operations' },
      { id: 'std-010', standard_number: 10, title: 'Service Delivery', description: 'Quality of service delivery', weight: 5, category: 'Operations' },
    ]

    for (const std of psapStandards) {
      await supabase.from('audit_psap_standards').upsert(std as never, { onConflict: 'id' })
    }
    console.log(`   ✅ ${psapStandards.length} PSAP standards seeded`)

    // 14. Seed PSAP Assessment
    console.log('📝 Seeding PSAP assessments...')
    const psapAssessments = [
      {
        id: 'assess-001',
        financial_year: 2025,
        quarter: 1,
        assessment_date: '2025-01-15',
        completed_by: 'Audit Team',
        overall_score: 72,
        overall_rating: 'Substantial Compliance',
        status: 'Completed',
      },
    ]

    for (const assess of psapAssessments) {
      await supabase.from('audit_psap_assessments').upsert(assess as never, { onConflict: 'id' })
    }
    console.log(`   ✅ ${psapAssessments.length} PSAP assessments seeded`)

    console.log('\n✅ Database seeding completed successfully!')
    console.log('\nSummary:')
    console.log(`  - ${divisions.length} divisions`)
    console.log(`  - ${sections.length} sections`)
    console.log(`  - ${categories.length} audit categories`)
    console.log(`  - ${risks.length} risks in register`)
    console.log(`  - ${riskEvents.length} risk events`)
    console.log(`  - ${engagements.length} engagements`)
    console.log(`  - ${findings.length} findings`)
    console.log(`  - ${recommendations.length} recommendations`)
    console.log(`  - ${actionPlans.length} action plans`)
    console.log(`  - ${riskProfiles.length} risk profiles`)
    console.log(`  - ${kras.length} strategic KRAs`)
    console.log(`  - ${kraActivities.length} KRA activities`)
    console.log(`  - ${psapStandards.length} PSAP standards`)
    console.log(`  - ${psapAssessments.length} PSAP assessments`)

  } catch (error) {
    console.error('❌ Error seeding database:', error)
    throw error
  }
}

seedDatabase()
