import { createClient } from '@supabase/supabase-js';

const supabase = createClient('https://your-project-url.supabase.co', 'your-anon-key');

export default supabase;
