import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { join } from 'path'

const supabaseUrl = 'https://xelptlfgpxdzrstiwcti.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhlbHB0bGZncHhkenJzdGl3Y3RpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDQxNTUxNiwiZXhwIjoyMDc5OTkxNTE2fQ.lyesXmAzZf0mHdTHOsca7ItMbiFMvmdYWdc1pw3Z1AY'

const supabase = createClient(supabaseUrl, supabaseKey)

async function applyMigration() {
  console.log('🚀 Applying Migration 003: Risk & Governance Modules\n')
  console.log('📍 Project: ilms (xelptlfgpxdzrstiwcti)')
  console.log('📍 Database: Supabase PostgreSQL\n')

  try {
    // Read the migration file
    const migrationPath = join(process.cwd(), 'supabase', 'migrations', '003_risk_governance_modules.sql')
    const migrationSQL = readFileSync(migrationPath, 'utf-8')

    console.log('📄 Migration file loaded successfully')
    console.log(`📏 SQL size: ${(migrationSQL.length / 1024).toFixed(2)} KB\n`)

    console.log('⏳ Executing migration (this may take 30-60 seconds)...\n')

    // Execute the migration using Supabase REST API
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query: migrationSQL })
    })

    // Alternative approach: use supabase.rpc if exec_sql is available
    // If the above doesn't work, we'll use the SQL editor approach

    console.log('ℹ️  Note: Supabase REST API does not support direct SQL execution.')
    console.log('ℹ️  You need to run this migration manually in the Supabase SQL Editor.\n')

    console.log('📋 INSTRUCTIONS:\n')
    console.log('1. Go to https://supabase.com/dashboard/project/xelptlfgpxdzrstiwcti/sql')
    console.log('2. Click "New Query"')
    console.log('3. Copy the contents of: supabase/migrations/003_risk_governance_modules.sql')
    console.log('4. Paste into the SQL editor')
    console.log('5. Click "Run" (bottom right)\n')

    console.log('✨ Migration creates:')
    console.log('   • 9 new tables (risk_profiles, psap_standards, strategic_kras, etc.)')
    console.log('   • Auto-calculation triggers')
    console.log('   • 3 reporting views')
    console.log('   • Seed data: 20 PSAP standards, 5 rating scales, sample KRA\n')

    console.log('🔍 After running the migration, you can verify with:')
    console.log('   bun run scripts/check-db-status.ts\n')

  } catch (error) {
    console.error('❌ Error:', error)
  }
}

applyMigration()
