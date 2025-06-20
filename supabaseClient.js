import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://your-project-url.supabase.co',  // Replace with your actual Supabase project URL
  'your-anon-key'                        // Replace with your actual Supabase anon key
);

export default supabase;
