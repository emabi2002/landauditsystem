import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://xelptlfgpxdzrstiwcti.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhlbHB0bGZncHhkenJzdGl3Y3RpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDQxNTUxNiwiZXhwIjoyMDc5OTkxNTE2fQ.lyesXmAzZf0mHdTHOsca7ItMbiFMvmdYWdc1pw3Z1AY'

const supabase = createClient(supabaseUrl, supabaseKey)

async function seedRiskData() {
  console.log('🎲 Seeding Risk Profile Data...\n')

  try {
    // Get org unit
    const { data: orgUnit, error: orgError } = await supabase
      .from('org_units')
      .select('id, code, name')
      .eq('code', 'GCU')
      .single()

    if (orgError || !orgUnit) {
      console.error('❌ Error: Org unit not found')
      return
    }

    console.log('✅ Found org unit:', orgUnit.name)

    // Get a person
    const { data: people } = await supabase
      .from('people')
      .select('id')
      .limit(2)

    if (!people || people.length === 0) {
      console.error('❌ Error: No people found')
      return
    }

    const preparedBy = people[0].id
    const reviewedBy = people.length > 1 ? people[1].id : null

    console.log('✅ Using people for prepared/reviewed\n')

    // Create risk profiles
    const profiles = [
      {
        org_unit_id: orgUnit.id,
        project_name: 'IT Security Audit 2024',
        profile_date: '2024-09-15',
        prepared_by: preparedBy,
        reviewed_by: reviewedBy,
        overall_level: 'High',
        remarks: 'Comprehensive risk assessment for IT security infrastructure and controls',
      },
      {
        org_unit_id: orgUnit.id,
        project_name: 'Financial Systems Review Q4 2024',
        profile_date: '2024-12-01',
        prepared_by: preparedBy,
        reviewed_by: reviewedBy,
        overall_level: 'Moderate',
        remarks: 'Assessment of financial systems and reporting processes',
      },
    ]

    for (const profile of profiles) {
      console.log(`📋 Creating risk profile: ${profile.project_name}...`)

      const { data: createdProfile, error: profileError } = await supabase
        .from('risk_profiles')
        .insert(profile)
        .select()
        .single()

      if (profileError) {
        if (profileError.message.includes('duplicate key')) {
          console.log(`   ⚠️  Profile already exists, skipping...`)
          continue
        }
        throw profileError
      }

      console.log(`   ✅ Created profile: ${createdProfile.id}`)

      // Create risk items for this profile
      const riskItems = profile.project_name.includes('IT Security') ? [
        // IT Security risks
        {
          risk_profile_id: createdProfile.id,
          context_category: 'External Environment',
          resource_category: 'Information Resources',
          risk_description: 'Cyber attacks and data breaches from external threat actors targeting sensitive information systems',
          likelihood_score: 4,
          impact_score: 5,
          existing_controls: 'Firewall, antivirus, intrusion detection systems',
          additional_controls: 'Enhanced monitoring, penetration testing, security awareness training',
          risk_owner_id: orgUnit.id,
          target_date: '2025-03-31',
          status: 'Mitigating',
        },
        {
          risk_profile_id: createdProfile.id,
          context_category: 'Compliance',
          resource_category: 'Information Resources',
          risk_description: 'Non-compliance with data protection regulations and privacy laws',
          likelihood_score: 3,
          impact_score: 4,
          existing_controls: 'Data protection policy, privacy impact assessments',
          additional_controls: 'Regular compliance audits, staff training',
          risk_owner_id: orgUnit.id,
          target_date: '2025-06-30',
          status: 'Open',
        },
        {
          risk_profile_id: createdProfile.id,
          context_category: 'Business Processes',
          resource_category: 'Information Resources',
          risk_description: 'System downtime and service interruptions affecting business operations',
          likelihood_score: 3,
          impact_score: 4,
          existing_controls: 'Backup systems, disaster recovery plan',
          additional_controls: 'Redundant infrastructure, improved SLAs',
          risk_owner_id: orgUnit.id,
          target_date: '2025-04-30',
          status: 'Mitigating',
        },
        {
          risk_profile_id: createdProfile.id,
          context_category: 'Education & Skills / People',
          resource_category: 'Human Resources',
          risk_description: 'Insufficient IT security awareness among staff leading to security incidents',
          likelihood_score: 4,
          impact_score: 3,
          existing_controls: 'Basic security awareness training',
          additional_controls: 'Ongoing training program, phishing simulations',
          risk_owner_id: orgUnit.id,
          target_date: '2025-02-28',
          status: 'Open',
        },
        {
          risk_profile_id: createdProfile.id,
          context_category: 'External Environment',
          resource_category: 'Infrastructure & Physical Assets',
          risk_description: 'Physical security breaches to server rooms and data centers',
          likelihood_score: 2,
          impact_score: 5,
          existing_controls: 'Access control systems, CCTV, security guards',
          additional_controls: 'Biometric access, enhanced monitoring',
          risk_owner_id: orgUnit.id,
          target_date: '2025-05-31',
          status: 'Mitigating',
        },
        {
          risk_profile_id: createdProfile.id,
          context_category: 'Organisational Culture',
          resource_category: 'Human Resources',
          risk_description: 'Resistance to security policy enforcement and compliance',
          likelihood_score: 3,
          impact_score: 3,
          existing_controls: 'Security policy documentation',
          additional_controls: 'Culture change program, leadership engagement',
          risk_owner_id: orgUnit.id,
          target_date: '2025-07-31',
          status: 'Open',
        },
        {
          risk_profile_id: createdProfile.id,
          context_category: 'Business Processes',
          resource_category: 'Financial Resources',
          risk_description: 'Inadequate budget allocation for cybersecurity investments',
          likelihood_score: 3,
          impact_score: 4,
          existing_controls: 'Annual budget planning',
          additional_controls: 'Multi-year cybersecurity investment plan',
          risk_owner_id: orgUnit.id,
          target_date: '2025-01-31',
          status: 'Open',
        },
      ] : [
        // Financial Systems risks
        {
          risk_profile_id: createdProfile.id,
          context_category: 'Compliance',
          resource_category: 'Financial Resources',
          risk_description: 'Non-compliance with financial reporting standards and regulations',
          likelihood_score: 2,
          impact_score: 4,
          existing_controls: 'Financial policies, regular audits',
          additional_controls: 'Enhanced review processes',
          risk_owner_id: orgUnit.id,
          target_date: '2025-03-31',
          status: 'Open',
        },
        {
          risk_profile_id: createdProfile.id,
          context_category: 'Business Processes',
          resource_category: 'Financial Resources',
          risk_description: 'Errors in financial data processing and reporting',
          likelihood_score: 3,
          impact_score: 3,
          existing_controls: 'Reconciliation procedures, segregation of duties',
          additional_controls: 'Automated validation controls',
          risk_owner_id: orgUnit.id,
          target_date: '2025-02-28',
          status: 'Mitigating',
        },
        {
          risk_profile_id: createdProfile.id,
          context_category: 'Education & Skills / People',
          resource_category: 'Human Resources',
          risk_description: 'Insufficient financial management skills among key personnel',
          likelihood_score: 2,
          impact_score: 3,
          existing_controls: 'Training programs',
          additional_controls: 'Certification requirements, mentoring',
          risk_owner_id: orgUnit.id,
          target_date: '2025-04-30',
          status: 'Open',
        },
        {
          risk_profile_id: createdProfile.id,
          context_category: 'Business Processes',
          resource_category: 'Information Resources',
          risk_description: 'Financial system failures or data loss',
          likelihood_score: 2,
          impact_score: 4,
          existing_controls: 'Regular backups, system maintenance',
          additional_controls: 'Disaster recovery testing',
          risk_owner_id: orgUnit.id,
          target_date: '2025-05-31',
          status: 'Mitigating',
        },
        {
          risk_profile_id: createdProfile.id,
          context_category: 'External Environment',
          resource_category: 'Financial Resources',
          risk_description: 'Fraud and financial misappropriation',
          likelihood_score: 2,
          impact_score: 5,
          existing_controls: 'Internal controls, authorization limits',
          additional_controls: 'Fraud detection software, ethics training',
          risk_owner_id: orgUnit.id,
          target_date: '2025-06-30',
          status: 'Open',
        },
      ]

      for (const item of riskItems) {
        const { error: itemError } = await supabase
          .from('risk_profile_items')
          .insert(item)

        if (itemError) {
          console.error(`   ❌ Error creating risk item:`, itemError.message)
        }
      }

      console.log(`   ✅ Created ${riskItems.length} risk items`)

      // Count risks by level
      const extreme = riskItems.filter(r => (r.likelihood_score * r.impact_score) >= 15).length
      const high = riskItems.filter(r => {
        const score = r.likelihood_score * r.impact_score
        return score >= 10 && score < 15
      }).length
      const moderate = riskItems.filter(r => {
        const score = r.likelihood_score * r.impact_score
        return score >= 5 && score < 10
      }).length
      const low = riskItems.filter(r => (r.likelihood_score * r.impact_score) < 5).length

      console.log(`   📊 Risk Levels: Extreme: ${extreme}, High: ${high}, Moderate: ${moderate}, Low: ${low}`)
      console.log('')
    }

    console.log('✨ Risk Profile Data Seeding Complete!\n')
    console.log('📍 What you can do now:')
    console.log('   1. Go to http://localhost:3000/risk-profiles')
    console.log('   2. See 2 risk profiles in the list')
    console.log('   3. Click the "View" (eye) button on any profile')
    console.log('   4. See the risk matrix with color-coded risks')
    console.log('   5. View risk statistics dashboard')
    console.log('   6. Try "Add Risk Item" to create new risks')
    console.log('   7. Use "Export CSV" to download risk data')
    console.log('   8. Check the dashboard for Risk Profile widget')
    console.log('')
    console.log('🎯 Risk Matrix Features:')
    console.log('   - Auto-calculated risk scores (Likelihood × Impact)')
    console.log('   - Auto-determined risk levels (Low/Moderate/High/Extreme)')
    console.log('   - Color-coded badges for visual identification')
    console.log('   - Organized by context and resource categories\n')

  } catch (error) {
    console.error('❌ Error seeding risk data:', error)
  }
}

seedRiskData()
