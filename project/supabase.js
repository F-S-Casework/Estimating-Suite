// Supabase client — loaded as plain <script> before Babel processes JSX
const SUPABASE_URL = 'https://tapnbdorfxfdjmcwifzj.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_ZioO7aSGriL7xNQH8XDyXw_GFpijWxO';

const { createClient } = window.supabase;
window.sb = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
