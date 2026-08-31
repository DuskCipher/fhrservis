import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://mvuqqzciaztfrygllexp.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im12dXFxemNpYXp0ZnJ5Z2xsZXhwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgxNDM2NjUsImV4cCI6MjEwMzcxOTY2NX0.BVNTzcr5vuvpN7qd3JU_wLrYGw9_l-Fn-NHiD9_Ay1w';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

export default supabase;
