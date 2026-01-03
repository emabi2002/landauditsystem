import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://xelptlfgpxdzrstiwcti.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhlbHB0bGZncHhkenJzdGl3Y3RpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDQxNTUxNiwiZXhwIjoyMDc5OTkxNTE2fQ.lyesXmAzZf0mHdTHOsca7ItMbiFMvmdYWdc1pw3Z1AY'

const supabase = createClient(supabaseUrl, supabaseKey)

async function seedKRAData() {
  console.log('🎯 Seeding KRA Quarterly Status Data...\n')

  try {
    // Get the KRA
    const { data: kra, error: kraError } = await supabase
      .from('strategic_kras')
      .select('id, kra_code, kra_title')
      .eq('kra_code', '1')
      .single()

    if (kraError || !kra) {
      console.error('❌ Error: KRA not found')
      console.log('💡 Make sure migration 003 has been run')
      return
    }

    console.log('✅ Found KRA:', kra.kra_title)

    // Get activities for this KRA
    const { data: activities, error: activitiesError } = await supabase
      .from('kra_activities')
      .select('id, activity_code, description')
      .eq('strategic_kra_id', kra.id)
      .order('activity_code')

    if (activitiesError || !activities || activities.length === 0) {
      console.error('❌ Error: No activities found')
      return
    }

    console.log(`✅ Found ${activities.length} activities\n`)

    // Create quarterly status for 2024 Q1-Q4
    const quarters2024 = [
      {
        year: 2024,
        quarter: 1,
        statuses: [
          { activity_idx: 0, status: 'Completed', narrative: '2 routine audits completed successfully', challenges: '', revision: '' },
          { activity_idx: 1, status: 'Ongoing', narrative: 'Monthly validation reports being generated', challenges: 'Some data quality issues identified', revision: '' },
          { activity_idx: 2, status: 'Ongoing', narrative: 'Compliance monitoring framework established', challenges: '', revision: '' },
          { activity_idx: 3, status: 'Completed', narrative: 'Annual asset verification completed', challenges: '', revision: '' },
          { activity_idx: 4, status: 'Not Started', narrative: '', challenges: 'Resources not yet allocated', revision: 'Plan to start in Q2' },
          { activity_idx: 5, status: 'Ongoing', narrative: 'Risk management advisory provided to 3 departments', challenges: '', revision: '' },
        ]
      },
      {
        year: 2024,
        quarter: 2,
        statuses: [
          { activity_idx: 0, status: 'Completed', narrative: '2 routine audits + 1 special investigation completed', challenges: '', revision: '' },
          { activity_idx: 1, status: 'Completed', narrative: 'Validation framework fully implemented', challenges: '', revision: '' },
          { activity_idx: 2, status: 'Ongoing', narrative: 'Quarterly compliance reports issued', challenges: '', revision: '' },
          { activity_idx: 3, status: 'Ongoing', narrative: 'Monthly spot checks conducted', challenges: '', revision: '' },
          { activity_idx: 4, status: 'Ongoing', narrative: 'Efficiency review of procurement processes initiated', challenges: 'Stakeholder engagement challenges', revision: '' },
          { activity_idx: 5, status: 'Completed', narrative: 'Risk workshops conducted for all divisions', challenges: '', revision: '' },
        ]
      },
      {
        year: 2024,
        quarter: 3,
        statuses: [
          { activity_idx: 0, status: 'Completed', narrative: '2 routine audits completed, 1 ongoing', challenges: '', revision: '' },
          { activity_idx: 1, status: 'Ongoing', narrative: 'Data quality improvements implemented', challenges: '', revision: '' },
          { activity_idx: 2, status: 'Completed', narrative: 'Full compliance monitoring cycle completed', challenges: '', revision: '' },
          { activity_idx: 3, status: 'Completed', narrative: 'Asset register updated and verified', challenges: '', revision: '' },
          { activity_idx: 4, status: 'Ongoing', narrative: 'Draft report on procurement efficiency prepared', challenges: '', revision: '' },
          { activity_idx: 5, status: 'Ongoing', narrative: 'Updated risk management framework drafted', challenges: '', revision: '' },
        ]
      },
      {
        year: 2024,
        quarter: 4,
        statuses: [
          { activity_idx: 0, status: 'Completed', narrative: '6 routine audits completed for the year + 2 investigations', challenges: '', revision: 'Plan 8 audits for 2025' },
          { activity_idx: 1, status: 'Completed', narrative: '100% compliance achieved for quarterly validations', challenges: '', revision: '' },
          { activity_idx: 2, status: 'Completed', narrative: 'Year-end compliance summary report published', challenges: '', revision: '' },
          { activity_idx: 3, status: 'Completed', narrative: 'Annual asset verification completed with 98% accuracy', challenges: '', revision: '' },
          { activity_idx: 4, status: 'Completed', narrative: '2 performance audits completed with recommendations', challenges: '', revision: 'Expand to 3 audits in 2025' },
          { activity_idx: 5, status: 'Completed', narrative: 'New risk management policy approved and published', challenges: '', revision: '' },
        ]
      },
    ]

    for (const q of quarters2024) {
      console.log(`📊 Creating status records for 2024 Q${q.quarter}...`)

      let created = 0
      for (const status of q.statuses) {
        const activity = activities[status.activity_idx]

        const { error } = await supabase
          .from('kra_activity_quarterly_status')
          .insert({
            kra_activity_id: activity.id,
            financial_year: q.year,
            quarter: q.quarter,
            status: status.status,
            narrative_status: status.narrative || null,
            challenges: status.challenges || null,
            revision_next_year: status.revision || null,
          })

        if (error) {
          if (error.message.includes('duplicate key')) {
            // Skip if already exists
          } else {
            console.error(`   ❌ Error:`, error.message)
          }
        } else {
          created++
        }
      }

      console.log(`   ✅ Created ${created} status records`)

      // Calculate completion stats
      const completed = q.statuses.filter(s => s.status === 'Completed').length
      const ongoing = q.statuses.filter(s => s.status === 'Ongoing').length
      const notStarted = q.statuses.filter(s => s.status === 'Not Started').length
      const delayed = q.statuses.filter(s => s.status === 'Delayed').length
      const completionRate = Math.round((completed / q.statuses.length) * 100)

      console.log(`   📈 Stats: ${completed} Completed, ${ongoing} Ongoing, ${delayed} Delayed, ${notStarted} Not Started`)
      console.log(`   🎯 Completion: ${completionRate}%`)
      console.log('')
    }

    // Create status for 2025 Q1
    console.log(`📊 Creating status records for 2025 Q1...`)

    const q1_2025 = [
      { activity_idx: 0, status: 'Ongoing', narrative: '2 routine audits in progress', challenges: '', revision: '' },
      { activity_idx: 1, status: 'Ongoing', narrative: 'Monthly validations continuing', challenges: '', revision: '' },
      { activity_idx: 2, status: 'Completed', narrative: 'Q1 compliance monitoring completed', challenges: '', revision: '' },
      { activity_idx: 3, status: 'Ongoing', narrative: 'Monthly asset spot checks conducted', challenges: '', revision: '' },
      { activity_idx: 4, status: 'Ongoing', narrative: 'First performance audit of 2025 initiated', challenges: '', revision: '' },
      { activity_idx: 5, status: 'Completed', narrative: 'Risk advisory sessions for new initiatives', challenges: '', revision: '' },
    ]

    let created2025 = 0
    for (const status of q1_2025) {
      const activity = activities[status.activity_idx]

      const { error } = await supabase
        .from('kra_activity_quarterly_status')
        .insert({
          kra_activity_id: activity.id,
          financial_year: 2025,
          quarter: 1,
          status: status.status,
          narrative_status: status.narrative || null,
          challenges: status.challenges || null,
          revision_next_year: status.revision || null,
        })

      if (error) {
        if (!error.message.includes('duplicate key')) {
          console.error(`   ❌ Error:`, error.message)
        }
      } else {
        created2025++
      }
    }

    console.log(`   ✅ Created ${created2025} status records`)
    const completed2025 = q1_2025.filter(s => s.status === 'Completed').length
    const completionRate2025 = Math.round((completed2025 / q1_2025.length) * 100)
    console.log(`   📈 Stats: ${completed2025} Completed, ${q1_2025.length - completed2025} Ongoing`)
    console.log(`   🎯 Completion: ${completionRate2025}%`)
    console.log('')

    console.log('✨ KRA Quarterly Status Data Seeding Complete!\n')
    console.log('📍 What you can do now:')
    console.log('   1. Go to http://localhost:3000/kra-workplan')
    console.log('   2. See KRA statistics for current quarter')
    console.log('   3. View Quarterly Status tab with all activities')
    console.log('   4. Use filters to view different quarters')
    console.log('   5. Click "Trends" tab to see completion chart')
    console.log('   6. Try "Update Status" to modify activity status')
    console.log('   7. Use "Export CSV" to download KRA data')
    console.log('   8. Check dashboard for KRA Completion widget')
    console.log('')
    console.log('🎯 Trend Shows:')
    console.log('   - 2024 Q1: 33% completion (2/6 activities)')
    console.log('   - 2024 Q2: 50% completion (3/6 activities)')
    console.log('   - 2024 Q3: 50% completion (3/6 activities)')
    console.log('   - 2024 Q4: 100% completion (6/6 activities) ✨')
    console.log('   - 2025 Q1: 33% completion (2/6 activities)')
    console.log('')
    console.log('📊 Activities Overview:')
    activities.forEach((activity, idx) => {
      console.log(`   ${activity.activity_code} ${activity.description}`)
    })
    console.log('')

  } catch (error) {
    console.error('❌ Error seeding KRA data:', error)
  }
}

seedKRAData()
