// Supabase client — loaded as plain <script> before Babel processes JSX
// TODO: Replace SUPABASE_URL and SUPABASE_ANON_KEY with your project values
// Find these in: Supabase Dashboard → Project Settings → API
const SUPABASE_URL = 'https://'https://tapnbdorfxfdjmcwifzj.supabase.co';
const SUPABASE_ANON_KEY = 'YOUR_ANON_KEY';

const { createClient } = window.supabase;
window.sb = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
