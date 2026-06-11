import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://xelptlfgpxdzrstiwcti.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhlbHB0bGZncHhkenJzdGl3Y3RpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDQxNTUxNiwiZXhwIjoyMDc5OTkxNTE2fQ.lyesXmAzZf0mHdTHOsca7ItMbiFMvmdYWdc1pw3Z1AY'

const supabase = createClient(supabaseUrl, supabaseKey)

async function seedSampleUsers() {
  console.log('👥 Creating Sample Users...\n')

  try {
    // Get org unit
    const { data: orgUnit } = await supabase
      .from('org_units')
      .select('id')
      .eq('code', 'GCU')
      .single()

    if (!orgUnit) {
      console.error('❌ Org unit not found')
      return
    }

    const samplePeople = [
      {
        full_name: 'Sarah Johnson',
        email: 'sarah.johnson@dlpp.org',
        role: 'Audit Admin',
        org_unit_id: orgUnit.id,
        active: true,
      },
      {
        full_name: 'Michael Chen',
        email: 'michael.chen@dlpp.org',
        role: 'Audit Manager',
        org_unit_id: orgUnit.id,
        active: true,
      },
      {
        full_name: 'Emily Rodriguez',
        email: 'emily.rodriguez@dlpp.org',
        role: 'Auditor',
        org_unit_id: orgUnit.id,
        active: true,
      },
      {
        full_name: 'David Thompson',
        email: 'david.thompson@dlpp.org',
        role: 'Auditor',
        org_unit_id: orgUnit.id,
        active: true,
      },
      {
        full_name: 'Lisa Anderson',
        email: 'lisa.anderson@dlpp.org',
        role: 'Action Owner',
        org_unit_id: orgUnit.id,
        active: true,
      },
    ]

    for (const person of samplePeople) {
      const { data, error } = await supabase
        .from('people')
        .insert(person)
        .select()

      if (error) {
        if (error.message.includes('duplicate key')) {
          console.log(`   ⚠️  ${person.full_name} already exists, skipping...`)
        } else {
          console.error(`   ❌ Error creating ${person.full_name}:`, error.message)
        }
      } else {
        console.log(`   ✅ Created: ${person.full_name} (${person.role})`)
      }
    }

    console.log('\n✨ Sample users created successfully!\n')

  } catch (error) {
    console.error('❌ Error:', error)
  }
}

seedSampleUsers()
