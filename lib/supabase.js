import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Pengecekan keamanan: cegah crash misterius jika env belum diisi
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('⚠️ WARN: Supabase URL atau Anon Key belum diset di .env.local!');
}

export const supabase = createClient(
  supabaseUrl || '',
  supabaseAnonKey || ''
);