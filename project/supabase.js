// Supabase client — loaded as plain <script> before Babel processes JSX
const SUPABASE_URL = 'https://tapnbdorfxfdjmcwifzj.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndwanJnZG96dHVzYmZwbXdrYWx4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY5ODg0MDEsImV4cCI6MjA5MjU2NDQwMX0.UO-8k9luNZ_enQV8OhA1arhDMCc0U36nsuzt6I-xEVg';

const { createClient } = window.supabase;
window.sb = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
