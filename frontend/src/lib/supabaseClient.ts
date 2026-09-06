import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://ewiadxzmaboxprmqtedc.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_T2q7_VA32ivoXtqq1NcvJQ_c3whI105';

export const supabase = createClient(supabaseUrl, supabaseKey);
