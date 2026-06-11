import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://xelptlfgpxdzrstiwcti.supabase.co'
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhlbHB0bGZncHhkenJzdGl3Y3RpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDQxNTUxNiwiZXhwIjoyMDc5OTkxNTE2fQ.lyesXmAzZf0mHdTHOsca7ItMbiFMvmdYWdc1pw3Z1AY'

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkDatabaseStatus() {
  console.log('🔍 Checking Supabase Database Status...\n')
  console.log('📍 Project URL:', supabaseUrl)
  console.log('📍 Project ID: xelptlfgpxdzrstiwcti\n')

  try {
    // Check if we can query the database by testing a simple query
    console.log('Testing database connection...\n')

    const tables: string[] = []

    // Try to query each table to see if it exists
    const tablesToCheck = [
      'org_units', 'people', 'obligations', 'controls',
      'engagements', 'engagement_team', 'workpapers', 'evidence',
      'findings', 'recommendations', 'action_plans',
      'events', 'notifications',
      'risk_profiles', 'risk_profile_items',
      'psap_standards', 'psap_rating_scales', 'psap_assessments', 'psap_assessment_scores',
      'strategic_kras', 'kra_activities', 'kra_activity_quarterly_status'
    ]

    for (const table of tablesToCheck) {
      const { error } = await supabase.from(table).select('*').limit(1)
      if (!error) {
        tables.push(table)
      }
    }

    console.log('✅ Database connection successful!\n')
    console.log('📊 Existing Tables:\n')

    // Core tables from migration 001
    const coreTables = [
      'org_units', 'people', 'obligations', 'controls',
      'engagements', 'engagement_team', 'workpapers', 'evidence',
      'findings', 'recommendations', 'action_plans',
      'events', 'notifications'
    ]

    // New Risk & Governance tables from migration 003
    const riskGovernanceTables = [
      'risk_profiles', 'risk_profile_items',
      'psap_standards', 'psap_rating_scales', 'psap_assessments', 'psap_assessment_scores',
      'strategic_kras', 'kra_activities', 'kra_activity_quarterly_status'
    ]

    console.log('Core Audit Tables:')
    coreTables.forEach(table => {
      const exists = tables.includes(table)
      console.log(`  ${exists ? '✅' : '❌'} ${table}`)
    })

    console.log('\nRisk & Governance Tables:')
    riskGovernanceTables.forEach(table => {
      const exists = tables.includes(table)
      console.log(`  ${exists ? '✅' : '❌'} ${table}`)
    })

    const coreTablesExist = coreTables.every(t => tables.includes(t))
    const riskTablesExist = riskGovernanceTables.every(t => tables.includes(t))

    console.log('\n📋 Migration Status:')
    console.log(`  ${coreTablesExist ? '✅' : '❌'} Migration 001 (Core Schema): ${coreTablesExist ? 'APPLIED' : 'NOT APPLIED'}`)
    console.log(`  ${riskTablesExist ? '✅' : '❌'} Migration 003 (Risk & Governance): ${riskTablesExist ? 'APPLIED' : 'NOT APPLIED'}`)

    if (!riskTablesExist) {
      console.log('\n⚠️  Risk & Governance tables are missing!')
      console.log('   Run migration 003 to create them.\n')
    } else {
      console.log('\n🎉 All migrations are applied!\n')

      // Check for seed data
      const { data: standards } = await supabase.from('psap_standards').select('count')
      const { data: scales } = await supabase.from('psap_rating_scales').select('count')
      const { data: kras } = await supabase.from('strategic_kras').select('count')

      console.log('📊 Seed Data Status:')
      console.log(`  PSAP Standards: ${standards?.[0]?.count || 0} (expected: 20)`)
      console.log(`  PSAP Rating Scales: ${scales?.[0]?.count || 0} (expected: 5)`)
      console.log(`  Strategic KRAs: ${kras?.[0]?.count || 0} (expected: 1+)`)
    }

  } catch (err) {
    console.error('❌ Error checking database:', err)
  }
}

checkDatabaseStatus()
