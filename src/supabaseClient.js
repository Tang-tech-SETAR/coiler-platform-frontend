import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://bcqbxggwxavogdqpzhj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJjcWJheGdnd3hhdm9nZHFwemhqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkzODkxMzAsImV4cCI6MjA2NDk2NTEzMH0.cVpQXK5bFvGyk-xFSork7_qyDLZ3LsZ5av1UrYyja_I';

export const supabase = createClient(supabaseUrl, supabaseKey);
