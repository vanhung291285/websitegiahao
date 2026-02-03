
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://bymxqbplqiyjxyxnruij.supabase.co';
const SUPABASE_KEY = 'sb_publishable_fuQ-lRBgPwQs4y50fIQn0A_T8GETdja';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  }
});
