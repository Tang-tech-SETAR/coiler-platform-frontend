const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://bcqbaxggwxavogdqpzhj.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJjcWJheGdnd3hhdm9nZHFwemhqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkzODkxMzAsImV4cCI6MjA2NDk2NTEzMH0.cVpQXK5bFvGyk-xFSork7_qyDLZ3LsZ5av1UrYyja_I';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function seedDevices() {
  const { data: roleData } = await supabase.rpc('pg_current_user');
  console.log('🔍 Current Supabase role:', roleData);

  const { data, error } = await supabase
    .from('Devices')
    .insert([
      {
        name: 'Repeater Alpha',
        ip: '192.168.0.101',
        signal: 75,
        alarm: false,
        uptime: '12h 30m',
        temperature: '36°C',
        last_seen: new Date().toISOString()
      }
    ]);

  if (error) {
    console.error('❌ Seed error:', error);
  } else {
    console.log('✅ Seed successful:', data);
  }
}

seedDevices();
