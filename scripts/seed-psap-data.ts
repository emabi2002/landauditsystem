import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://xelptlfgpxdzrstiwcti.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhlbHB0bGZncHhkenJzdGl3Y3RpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDQxNTUxNiwiZXhwIjoyMDc5OTkxNTE2fQ.lyesXmAzZf0mHdTHOsca7ItMbiFMvmdYWdc1pw3Z1AY'

const supabase = createClient(supabaseUrl, supabaseKey)

async function seedPSAPData() {
  console.log('🌱 Seeding PSAP Assessment Data...\n')

  try {
    // Get org unit (GCU)
    const { data: orgUnit, error: orgError } = await supabase
      .from('org_units')
      .select('id')
      .eq('code', 'GCU')
      .single()

    if (orgError || !orgUnit) {
      console.error('❌ Error: Governance & Compliance Unit not found')
      console.log('💡 Make sure migration 003 has been run')
      return
    }

    console.log('✅ Found org unit:', orgUnit.id)

    // Get a person to use as completed_by
    const { data: people, error: peopleError } = await supabase
      .from('people')
      .select('id')
      .limit(1)

    if (peopleError || !people || people.length === 0) {
      console.error('❌ Error: No people found in database')
      console.log('💡 Please add at least one person record first')
      return
    }

    const personId = people[0].id
    console.log('✅ Using person:', personId)

    // Get PSAP standards
    const { data: standards, error: standardsError } = await supabase
      .from('psap_standards')
      .select('id, standard_no, weighting')
      .order('standard_no')

    if (standardsError || !standards || standards.length === 0) {
      console.error('❌ Error: PSAP standards not found')
      return
    }

    console.log(`✅ Found ${standards.length} PSAP standards\n`)

    // Create 4 quarterly assessments for 2024
    const quarters = [
      { quarter: 1, baseScore: 7.5, date: '2024-03-31' },
      { quarter: 2, baseScore: 8.0, date: '2024-06-30' },
      { quarter: 3, baseScore: 8.5, date: '2024-09-30' },
      { quarter: 4, baseScore: 9.0, date: '2024-12-31' },
    ]

    for (const q of quarters) {
      console.log(`📊 Creating assessment for 2024 Q${q.quarter}...`)

      // Create assessment
      const { data: assessment, error: assessmentError } = await supabase
        .from('psap_assessments')
        .insert({
          org_unit_id: orgUnit.id,
          financial_year: 2024,
          quarter: q.quarter,
          assessment_date: q.date,
          completed_by: personId,
          comments: `Q${q.quarter} 2024 assessment - Showing improvement in compliance standards`,
        })
        .select()
        .single()

      if (assessmentError) {
        if (assessmentError.message.includes('duplicate key')) {
          console.log(`   ⚠️  Assessment for 2024 Q${q.quarter} already exists, skipping...`)
          continue
        }
        throw assessmentError
      }

      console.log(`   ✅ Created assessment: ${assessment.id}`)

      // Create scores for each standard (with some variation)
      const scores = standards.map(std => {
        // Add some variation to scores (±1.0)
        const variation = (Math.random() - 0.5) * 2
        const rawScore = Math.max(0, Math.min(10, q.baseScore + variation))

        return {
          psap_assessment_id: assessment.id,
          psap_standard_id: std.id,
          raw_score: parseFloat(rawScore.toFixed(1)),
          comments: rawScore < 7 ? 'Needs improvement' : rawScore > 8.5 ? 'Excellent performance' : '',
        }
      })

      const { error: scoresError } = await supabase
        .from('psap_assessment_scores')
        .insert(scores)

      if (scoresError) throw scoresError

      console.log(`   ✅ Created ${scores.length} score records`)

      // Fetch the updated assessment to show the calculated totals
      const { data: updatedAssessment } = await supabase
        .from('psap_assessments')
        .select('overall_score, overall_rating')
        .eq('id', assessment.id)
        .single()

      if (updatedAssessment) {
        console.log(`   📈 Overall Score: ${updatedAssessment.overall_score?.toFixed(2)} / 20.0`)
        console.log(`   🏆 Rating: ${updatedAssessment.overall_rating}`)
      }

      console.log('')
    }

    // Create 2 assessments for 2025 (showing continued improvement)
    const quarters2025 = [
      { quarter: 1, baseScore: 8.8, date: '2025-03-31' },
      { quarter: 2, baseScore: 9.2, date: '2025-06-30' },
    ]

    for (const q of quarters2025) {
      console.log(`📊 Creating assessment for 2025 Q${q.quarter}...`)

      const { data: assessment, error: assessmentError } = await supabase
        .from('psap_assessments')
        .insert({
          org_unit_id: orgUnit.id,
          financial_year: 2025,
          quarter: q.quarter,
          assessment_date: q.date,
          completed_by: personId,
          comments: `Q${q.quarter} 2025 assessment - Continued improvement`,
        })
        .select()
        .single()

      if (assessmentError) {
        if (assessmentError.message.includes('duplicate key')) {
          console.log(`   ⚠️  Assessment for 2025 Q${q.quarter} already exists, skipping...`)
          continue
        }
        throw assessmentError
      }

      console.log(`   ✅ Created assessment: ${assessment.id}`)

      const scores = standards.map(std => {
        const variation = (Math.random() - 0.5) * 1.5
        const rawScore = Math.max(0, Math.min(10, q.baseScore + variation))

        return {
          psap_assessment_id: assessment.id,
          psap_standard_id: std.id,
          raw_score: parseFloat(rawScore.toFixed(1)),
          comments: rawScore > 9 ? 'Outstanding' : '',
        }
      })

      const { error: scoresError } = await supabase
        .from('psap_assessment_scores')
        .insert(scores)

      if (scoresError) throw scoresError

      console.log(`   ✅ Created ${scores.length} score records`)

      const { data: updatedAssessment } = await supabase
        .from('psap_assessments')
        .select('overall_score, overall_rating')
        .eq('id', assessment.id)
        .single()

      if (updatedAssessment) {
        console.log(`   📈 Overall Score: ${updatedAssessment.overall_score?.toFixed(2)} / 20.0`)
        console.log(`   🏆 Rating: ${updatedAssessment.overall_rating}`)
      }

      console.log('')
    }

    console.log('✨ PSAP Data Seeding Complete!\n')
    console.log('📍 What you can do now:')
    console.log('   1. Go to http://localhost:3000/psap-scorecard')
    console.log('   2. View the assessments in the table')
    console.log('   3. Click on the "Trends" tab to see the score chart')
    console.log('   4. Try the "Export CSV" button')
    console.log('   5. Check the dashboard for the PSAP widget')
    console.log('')
    console.log('🎯 You should see a trend showing improvement from ~15 to ~18.5')
    console.log('   (From Partial Compliance → Substantial Compliance)\n')

  } catch (error) {
    console.error('❌ Error seeding data:', error)
  }
}

seedPSAPData()
