import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkDatabaseSchema() {
  console.log('🔍 Checking Supabase Database Schema...\n')
  console.log('📍 Database:', supabaseUrl)
  console.log('=' .repeat(80))

  try {
    // Query to get all tables in public schema
    const { data: tables, error: tablesError } = await supabase.rpc('get_tables_info', {})

    // If RPC doesn't exist, use direct query
    const { data: tablesList, error } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .order('table_name')

    if (error) {
      // Try alternative method - query pg_tables
      console.log('📊 Checking existing tables...\n')

      // Check a few key tables individually
      const tablesToCheck = [
        'org_units',
        'people',
        'engagements',
        'findings',
        'recommendations',
        'action_plans',
        'obligations',
        'risk_profiles',
        'risk_profile_items',
        'psap_standards',
        'psap_assessments',
        'psap_assessment_scores',
        'strategic_kras',
        'kra_activities',
        'kra_activity_quarterly_status',
        'notifications',
      ]

      console.log('Checking tables by attempting to query them:\n')

      const existingTables: string[] = []
      const missingTables: string[] = []

      for (const table of tablesToCheck) {
        const { data, error } = await supabase
          .from(table)
          .select('count')
          .limit(0)

        if (error) {
          if (error.message.includes('does not exist') || error.code === '42P01') {
            missingTables.push(table)
            console.log(`❌ ${table} - NOT FOUND`)
          } else {
            console.log(`⚠️  ${table} - ERROR: ${error.message}`)
          }
        } else {
          existingTables.push(table)
          console.log(`✅ ${table} - EXISTS`)
        }
      }

      console.log('\n' + '='.repeat(80))
      console.log(`\n📈 Summary:`)
      console.log(`   ✅ Existing tables: ${existingTables.length}`)
      console.log(`   ❌ Missing tables: ${missingTables.length}`)

      if (missingTables.length > 0) {
        console.log(`\n🚨 Missing Tables:`)
        missingTables.forEach(t => console.log(`   - ${t}`))
      }

      if (existingTables.length > 0) {
        console.log(`\n✅ Existing Tables:`)
        existingTables.forEach(t => console.log(`   - ${t}`))
      }

      // Check for views
      console.log('\n' + '='.repeat(80))
      console.log('\n🔍 Checking for views and functions...\n')

      const viewsToCheck = [
        'published_recommendations_view',
        'v_current_risk_summary',
        'v_kra_status_summary',
        'v_latest_psap_ratings',
      ]

      for (const view of viewsToCheck) {
        const { data, error } = await supabase
          .from(view)
          .select('count')
          .limit(0)

        if (error) {
          console.log(`❌ ${view} - NOT FOUND`)
        } else {
          console.log(`✅ ${view} - EXISTS`)
        }
      }

    } else if (tablesList) {
      console.log('✅ Found tables:\n')
      tablesList.forEach((t: any) => {
        console.log(`   - ${t.table_name}`)
      })
      console.log(`\n📊 Total tables: ${tablesList.length}`)
    }

  } catch (err) {
    console.error('❌ Error checking database:', err)
  }

  console.log('\n' + '='.repeat(80))
}

checkDatabaseSchema()
