// supabaseClient.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://bcqbxagxwavogdqpzhj.supabase.co'; // ✅ URL properly closed
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJjcWJheGdnd3hhdm9nZHfwemhqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkzODkxNTh9.mZ0iGOStEtDYKXqlKjW9nK-6qVsUUVbQ39aLd0QBFuk';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
