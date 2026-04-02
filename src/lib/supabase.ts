import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (import.meta as any).env.VITE_SUPABASE_URL;
const supabaseAnonKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase URL or Anon Key is missing. Please configure them in the environment variables.');
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');

export type Profile = {
  id: string;
  full_name: string;
  role: 'admin' | 'guru';
  created_at: string;
};

export type Student = {
  id: string;
  nisn: string;
  name: string;
  class: string;
  created_at: string;
};

export type Attendance = {
  id: string;
  user_id?: string;
  student_id?: string;
  date: string;
  status: 'hadir' | 'sakit' | 'izin' | 'alpa';
  created_at: string;
};
