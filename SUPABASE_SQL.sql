-- ==========================================
-- SUPABASE DATABASE SETUP SCRIPT
-- Application: Sistem Absensi Sekolah (AbsensiKita)
-- ==========================================

-- 1. PROFILES TABLE
-- Stores additional user information and roles
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  role TEXT DEFAULT 'guru' CHECK (role IN ('admin', 'guru')),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. STUDENTS TABLE
-- Stores student records
CREATE TABLE public.students (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nisn TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  class TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. TEACHER ATTENDANCE TABLE
-- Stores daily attendance for teachers
CREATE TABLE public.teacher_attendance (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  teacher_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('hadir', 'sakit', 'izin', 'alpa')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(teacher_id, date)
);

-- 4. STUDENT ATTENDANCE TABLE
-- Stores daily attendance for students
CREATE TABLE public.student_attendance (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES public.students(id) ON DELETE CASCADE NOT NULL,
  teacher_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  date DATE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('hadir', 'sakit', 'izin', 'alpa')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(student_id, date)
);

-- ==========================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==========================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teacher_attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_attendance ENABLE ROW LEVEL SECURITY;

-- PROFILES POLICIES
CREATE POLICY "Public profiles are viewable by everyone." ON public.profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can update own profile." ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins have full access to profiles." ON public.profiles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- STUDENTS POLICIES
CREATE POLICY "Students are viewable by authenticated users." ON public.students
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Only admins can modify students." ON public.students
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- TEACHER ATTENDANCE POLICIES
CREATE POLICY "Teacher attendance is viewable by authenticated users." ON public.teacher_attendance
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Teachers can manage their own attendance." ON public.teacher_attendance
  FOR ALL USING (auth.uid() = teacher_id);

-- STUDENT ATTENDANCE POLICIES
CREATE POLICY "Student attendance is viewable by authenticated users." ON public.student_attendance
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Teachers and admins can manage student attendance." ON public.student_attendance
  FOR ALL USING (auth.role() = 'authenticated');

-- ==========================================
-- AUTOMATION: PROFILE CREATION ON SIGNUP
-- ==========================================

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (
    NEW.id, 
    NEW.raw_user_meta_data->>'full_name',
    -- First user becomes admin, others are guru by default
    CASE WHEN (SELECT COUNT(*) FROM public.profiles) = 0 THEN 'admin' ELSE 'guru' END
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call the function on auth.users insert
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ==========================================
-- HELPER: BOOTSTRAP ADMIN (Optional)
-- ==========================================
-- If you already have a user and want to make them admin manually:
-- UPDATE public.profiles SET role = 'admin' WHERE id = 'YOUR_USER_UUID';
