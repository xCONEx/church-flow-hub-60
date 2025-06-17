
-- COMPLETE REBUILD OF DATABASE SCHEMA
-- This script will rebuild the entire database structure with proper RLS

-- Drop all existing tables and functions to start fresh
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can create own profile" ON public.profiles;
DROP POLICY IF EXISTS "Masters can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Masters can manage all user roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can view roles in their churches" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can manage roles in their church" ON public.user_roles;
DROP POLICY IF EXISTS "Masters can view all churches" ON public.churches;
DROP POLICY IF EXISTS "Church members can view their church" ON public.churches;
DROP POLICY IF EXISTS "Admins can update their church" ON public.churches;
DROP POLICY IF EXISTS "Church members can view departments" ON public.departments;
DROP POLICY IF EXISTS "Admins can manage departments" ON public.departments;
DROP POLICY IF EXISTS "Users can view their department memberships" ON public.user_departments;
DROP POLICY IF EXISTS "Leaders can manage their department members" ON public.user_departments;
DROP POLICY IF EXISTS "Church members can view songs" ON public.songs;
DROP POLICY IF EXISTS "Leaders and above can manage songs" ON public.songs;
DROP POLICY IF EXISTS "Church members can view scales" ON public.scales;
DROP POLICY IF EXISTS "Leaders and above can manage scales" ON public.scales;
DROP POLICY IF EXISTS "Users can view scale collaborators" ON public.scale_collaborators;
DROP POLICY IF EXISTS "Scale creators can manage collaborators" ON public.scale_collaborators;
DROP POLICY IF EXISTS "Church members can view events" ON public.events;
DROP POLICY IF EXISTS "Leaders and above can manage events" ON public.events;
DROP POLICY IF EXISTS "Church members can view courses" ON public.courses;
DROP POLICY IF EXISTS "Leaders and above can manage courses" ON public.courses;
DROP POLICY IF EXISTS "Church admins can manage invites" ON public.invites;
DROP POLICY IF EXISTS "Leaders can evaluate members" ON public.member_evaluations;
DROP POLICY IF EXISTS "Leaders can view evaluations" ON public.member_evaluations;
DROP POLICY IF EXISTS "Leaders can update evaluations" ON public.member_evaluations;
DROP POLICY IF EXISTS "Church members can view profile history" ON public.profile_history;
DROP POLICY IF EXISTS "Leaders can create profile history" ON public.profile_history;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS on_profile_master_check ON public.profiles;
DROP TRIGGER IF EXISTS track_user_role_changes ON public.user_roles;
DROP TRIGGER IF EXISTS set_updated_at_profiles ON public.profiles;
DROP TRIGGER IF EXISTS set_updated_at_churches ON public.churches;
DROP TRIGGER IF EXISTS set_updated_at_member_evaluations ON public.member_evaluations;

DROP FUNCTION IF EXISTS public.handle_new_user();
DROP FUNCTION IF EXISTS public.check_master_email();
DROP FUNCTION IF EXISTS public.track_role_changes();
DROP FUNCTION IF EXISTS public.handle_updated_at();
DROP FUNCTION IF EXISTS public.is_master();
DROP FUNCTION IF EXISTS public.get_user_role_in_church(UUID);
DROP FUNCTION IF EXISTS public.has_church_access(UUID);

DROP TABLE IF EXISTS public.member_evaluations CASCADE;
DROP TABLE IF EXISTS public.profile_history CASCADE;
DROP TABLE IF EXISTS public.user_course_progress CASCADE;
DROP TABLE IF EXISTS public.lesson_files CASCADE;
DROP TABLE IF EXISTS public.lessons CASCADE;
DROP TABLE IF EXISTS public.course_modules CASCADE;
DROP TABLE IF EXISTS public.courses CASCADE;
DROP TABLE IF EXISTS public.event_registrations CASCADE;
DROP TABLE IF EXISTS public.event_guests CASCADE;
DROP TABLE IF EXISTS public.events CASCADE;
DROP TABLE IF EXISTS public.agenda_items CASCADE;
DROP TABLE IF EXISTS public.scale_songs CASCADE;
DROP TABLE IF EXISTS public.scale_collaborators CASCADE;
DROP TABLE IF EXISTS public.scales CASCADE;
DROP TABLE IF EXISTS public.songs CASCADE;
DROP TABLE IF EXISTS public.user_departments CASCADE;
DROP TABLE IF EXISTS public.departments CASCADE;
DROP TABLE IF EXISTS public.invites CASCADE;
DROP TABLE IF EXISTS public.user_roles CASCADE;
DROP TABLE IF EXISTS public.churches CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

DROP TYPE IF EXISTS public.user_role CASCADE;
DROP TYPE IF EXISTS public.department_type CASCADE;
DROP TYPE IF EXISTS public.invite_status CASCADE;
DROP TYPE IF EXISTS public.event_status CASCADE;
DROP TYPE IF EXISTS public.scale_status CASCADE;
DROP TYPE IF EXISTS public.file_type CASCADE;

-- CREATE ENUMS
CREATE TYPE public.user_role AS ENUM ('master', 'admin', 'leader', 'collaborator', 'member');
CREATE TYPE public.department_type AS ENUM ('louvor', 'louvor-juniores', 'louvor-teens', 'midia', 'midia-juniores', 'sonoplastia', 'instrumentos', 'recepcao', 'ministracao', 'palavra', 'oracao', 'custom');
CREATE TYPE public.invite_status AS ENUM ('pending', 'accepted', 'expired', 'declined');
CREATE TYPE public.event_status AS ENUM ('draft', 'published', 'cancelled', 'completed');
CREATE TYPE public.scale_status AS ENUM ('draft', 'published', 'completed');
CREATE TYPE public.file_type AS ENUM ('pdf', 'doc', 'image', 'video', 'audio', 'other');

-- CREATE TABLES

-- Profiles table (main user data)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  avatar TEXT,
  experience TEXT DEFAULT 'beginner' CHECK (experience IN ('beginner', 'intermediate', 'advanced')),
  skills TEXT[] DEFAULT '{}',
  language TEXT DEFAULT 'pt-BR',
  dark_mode BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Churches table
CREATE TABLE public.churches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  address TEXT,
  phone TEXT,
  email TEXT,
  admin_id UUID REFERENCES public.profiles(id) NOT NULL,
  service_types TEXT[] DEFAULT ARRAY['Culto Domingo Manhã', 'Culto Domingo Noite', 'Reunião de Oração', 'Culto de Jovens', 'Ensaio Geral', 'Evento Especial'],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User roles (relationship between users and churches)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  church_id UUID REFERENCES public.churches(id) ON DELETE CASCADE,
  role public.user_role NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, COALESCE(church_id, '00000000-0000-0000-0000-000000000000'::uuid), role)
);

-- Departments table
CREATE TABLE public.departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  church_id UUID REFERENCES public.churches(id) ON DELETE CASCADE NOT NULL,
  leader_id UUID REFERENCES public.profiles(id),
  type public.department_type NOT NULL,
  parent_department_id UUID REFERENCES public.departments(id),
  is_sub_department BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User departments (relationship between users and departments)
CREATE TABLE public.user_departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  department_id UUID REFERENCES public.departments(id) ON DELETE CASCADE NOT NULL,
  role TEXT DEFAULT 'member',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, department_id)
);

-- Songs table
CREATE TABLE public.songs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  artist TEXT NOT NULL,
  key TEXT,
  tempo TEXT,
  bpm INTEGER,
  genre TEXT,
  youtube_url TEXT,
  spotify_url TEXT,
  cifra_url TEXT,
  lyrics TEXT,
  church_id UUID REFERENCES public.churches(id) ON DELETE CASCADE NOT NULL,
  added_by UUID REFERENCES public.profiles(id) NOT NULL,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Scales table
CREATE TABLE public.scales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  date TIMESTAMPTZ NOT NULL,
  service_type TEXT NOT NULL,
  church_id UUID REFERENCES public.churches(id) ON DELETE CASCADE NOT NULL,
  department_id UUID REFERENCES public.departments(id) ON DELETE CASCADE NOT NULL,
  created_by UUID REFERENCES public.profiles(id) NOT NULL,
  notes TEXT,
  status public.scale_status DEFAULT 'draft',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Scale collaborators
CREATE TABLE public.scale_collaborators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scale_id UUID REFERENCES public.scales(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  role TEXT NOT NULL,
  confirmed BOOLEAN DEFAULT false,
  invited_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(scale_id, user_id, role)
);

-- Scale songs
CREATE TABLE public.scale_songs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scale_id UUID REFERENCES public.scales(id) ON DELETE CASCADE NOT NULL,
  song_id UUID REFERENCES public.songs(id) ON DELETE CASCADE NOT NULL,
  original_key TEXT,
  scale_key TEXT,
  order_position INTEGER NOT NULL,
  notes TEXT,
  links TEXT[] DEFAULT '{}',
  UNIQUE(scale_id, song_id, order_position)
);

-- Agenda items
CREATE TABLE public.agenda_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scale_id UUID REFERENCES public.scales(id) ON DELETE CASCADE NOT NULL,
  time TEXT NOT NULL,
  block TEXT NOT NULL,
  description TEXT NOT NULL,
  key TEXT,
  notes TEXT,
  order_position INTEGER NOT NULL
);

-- Events table
CREATE TABLE public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  date TIMESTAMPTZ NOT NULL,
  location TEXT,
  church_id UUID REFERENCES public.churches(id) ON DELETE CASCADE NOT NULL,
  created_by UUID REFERENCES public.profiles(id) NOT NULL,
  max_attendees INTEGER,
  is_public BOOLEAN DEFAULT true,
  status public.event_status DEFAULT 'draft',
  qr_readers TEXT[] DEFAULT '{}',
  registration_deadline TIMESTAMPTZ,
  tags TEXT[] DEFAULT '{}',
  image TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Event guests
CREATE TABLE public.event_guests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  document TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Event registrations
CREATE TABLE public.event_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE NOT NULL,
  attendee_id UUID NOT NULL,
  attendee_type TEXT NOT NULL CHECK (attendee_type IN ('member', 'guest')),
  qr_code TEXT UNIQUE NOT NULL,
  registered_at TIMESTAMPTZ DEFAULT NOW(),
  checked_in BOOLEAN DEFAULT false,
  checked_in_at TIMESTAMPTZ,
  checked_in_by TEXT
);

-- Courses table
CREATE TABLE public.courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  church_id UUID REFERENCES public.churches(id) ON DELETE CASCADE NOT NULL,
  department_id UUID REFERENCES public.departments(id),
  instructor_id UUID REFERENCES public.profiles(id),
  tags TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Course modules
CREATE TABLE public.course_modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  order_position INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Lessons
CREATE TABLE public.lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id UUID REFERENCES public.course_modules(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  content TEXT,
  order_position INTEGER NOT NULL,
  video_url TEXT,
  duration INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Lesson files
CREATE TABLE public.lesson_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id UUID REFERENCES public.lessons(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  type public.file_type NOT NULL,
  url TEXT NOT NULL,
  size BIGINT NOT NULL,
  uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

-- User course progress
CREATE TABLE public.user_course_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
  enrolled_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  completed_lessons UUID[] DEFAULT '{}',
  UNIQUE(user_id, course_id)
);

-- Invites table
CREATE TABLE public.invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  role public.user_role NOT NULL,
  department_id UUID REFERENCES public.departments(id),
  church_id UUID REFERENCES public.churches(id) ON DELETE CASCADE NOT NULL,
  invited_by UUID REFERENCES public.profiles(id) NOT NULL,
  status public.invite_status DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '7 days')
);

-- Profile history
CREATE TABLE public.profile_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  church_id UUID REFERENCES public.churches(id) ON DELETE CASCADE,
  department_id UUID REFERENCES public.departments(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL,
  previous_role TEXT,
  new_role TEXT,
  previous_department_id UUID,
  changed_by UUID REFERENCES public.profiles(id) NOT NULL,
  notes TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Member evaluations
CREATE TABLE public.member_evaluations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  evaluator_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  church_id UUID REFERENCES public.churches(id) ON DELETE CASCADE NOT NULL,
  department_id UUID REFERENCES public.departments(id) ON DELETE CASCADE,
  overall_rating INTEGER CHECK (overall_rating >= 1 AND overall_rating <= 5),
  technical_skills INTEGER CHECK (technical_skills >= 1 AND technical_skills <= 5),
  leadership_skills INTEGER CHECK (leadership_skills >= 1 AND leadership_skills <= 5),
  commitment INTEGER CHECK (commitment >= 1 AND commitment <= 5),
  teamwork INTEGER CHECK (teamwork >= 1 AND teamwork <= 5),
  punctuality INTEGER CHECK (punctuality >= 1 AND punctuality <= 5),
  notes TEXT,
  evaluation_date TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(member_id, evaluator_id, church_id, department_id)
);

-- ENABLE RLS ON ALL TABLES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.churches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.songs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scale_collaborators ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scale_songs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agenda_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_guests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_course_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profile_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.member_evaluations ENABLE ROW LEVEL SECURITY;

-- CREATE HELPER FUNCTIONS

-- Function to check if user is master
CREATE OR REPLACE FUNCTION public.is_master()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'master' AND church_id IS NULL
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Function to get user role in church
CREATE OR REPLACE FUNCTION public.get_user_role_in_church(church_uuid UUID)
RETURNS public.user_role AS $$
BEGIN
  RETURN (
    SELECT role FROM public.user_roles 
    WHERE user_id = auth.uid() AND church_id = church_uuid
    ORDER BY 
      CASE role
        WHEN 'admin' THEN 1
        WHEN 'leader' THEN 2
        WHEN 'collaborator' THEN 3
        WHEN 'member' THEN 4
      END
    LIMIT 1
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Function to check church access
CREATE OR REPLACE FUNCTION public.has_church_access(church_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  IF public.is_master() THEN
    RETURN TRUE;
  END IF;
  
  RETURN EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND church_id = church_uuid
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- CREATE TRIGGERS AND FUNCTIONS

-- Function to handle updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert profile
  INSERT INTO public.profiles (id, email, name, avatar, created_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(
      NEW.raw_user_meta_data->>'name', 
      NEW.raw_user_meta_data->>'full_name', 
      split_part(NEW.email, '@', 1)
    ),
    COALESCE(
      NEW.raw_user_meta_data->>'avatar_url',
      NEW.raw_user_meta_data->>'picture'
    ),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    name = COALESCE(EXCLUDED.name, profiles.name),
    avatar = COALESCE(EXCLUDED.avatar, profiles.avatar),
    updated_at = NOW();

  -- Check if master user
  IF NEW.email = 'yuriadrskt@gmail.com' THEN
    INSERT INTO public.user_roles (user_id, church_id, role, created_at)
    VALUES (NEW.id, NULL, 'master'::public.user_role, NOW())
    ON CONFLICT (user_id, COALESCE(church_id, '00000000-0000-0000-0000-000000000000'::uuid), role) 
    DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE TRIGGER set_updated_at_profiles 
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_churches 
  BEFORE UPDATE ON public.churches
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_member_evaluations 
  BEFORE UPDATE ON public.member_evaluations
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- CREATE RLS POLICIES

-- Profiles policies
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can create own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Masters can view all profiles" ON public.profiles
  FOR SELECT USING (public.is_master());

-- User roles policies
CREATE POLICY "Users can view own roles" ON public.user_roles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Masters can manage all roles" ON public.user_roles
  FOR ALL USING (public.is_master());

CREATE POLICY "Admins can view church roles" ON public.user_roles
  FOR SELECT USING (
    church_id IS NOT NULL AND 
    public.get_user_role_in_church(church_id) IN ('admin', 'leader')
  );

CREATE POLICY "Admins can manage church roles" ON public.user_roles
  FOR ALL USING (
    church_id IS NOT NULL AND 
    public.get_user_role_in_church(church_id) = 'admin'
  );

-- Churches policies
CREATE POLICY "Masters can view all churches" ON public.churches
  FOR ALL USING (public.is_master());

CREATE POLICY "Church members can view their church" ON public.churches
  FOR SELECT USING (public.has_church_access(id));

CREATE POLICY "Admins can update their church" ON public.churches
  FOR UPDATE USING (public.get_user_role_in_church(id) = 'admin');

-- Departments policies
CREATE POLICY "Church members can view departments" ON public.departments
  FOR SELECT USING (public.has_church_access(church_id));

CREATE POLICY "Admins can manage departments" ON public.departments
  FOR ALL USING (public.get_user_role_in_church(church_id) IN ('admin', 'leader'));

-- User departments policies
CREATE POLICY "Users can view department memberships" ON public.user_departments
  FOR SELECT USING (
    user_id = auth.uid() OR 
    EXISTS (
      SELECT 1 FROM public.departments d 
      WHERE d.id = department_id AND public.has_church_access(d.church_id)
    )
  );

CREATE POLICY "Leaders can manage department members" ON public.user_departments
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.departments d 
      WHERE d.id = department_id 
      AND (d.leader_id = auth.uid() OR public.get_user_role_in_church(d.church_id) IN ('admin', 'leader'))
    )
  );

-- Songs policies
CREATE POLICY "Church members can view songs" ON public.songs
  FOR SELECT USING (public.has_church_access(church_id));

CREATE POLICY "Leaders can manage songs" ON public.songs
  FOR ALL USING (
    public.get_user_role_in_church(church_id) IN ('admin', 'leader', 'collaborator')
  );

-- Scales policies
CREATE POLICY "Church members can view scales" ON public.scales
  FOR SELECT USING (public.has_church_access(church_id));

CREATE POLICY "Leaders can manage scales" ON public.scales
  FOR ALL USING (
    public.get_user_role_in_church(church_id) IN ('admin', 'leader')
  );

-- Scale collaborators policies
CREATE POLICY "Users can view scale collaborators" ON public.scale_collaborators
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.scales s 
      WHERE s.id = scale_id AND public.has_church_access(s.church_id)
    )
  );

CREATE POLICY "Scale creators can manage collaborators" ON public.scale_collaborators
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.scales s 
      WHERE s.id = scale_id 
      AND (s.created_by = auth.uid() OR public.get_user_role_in_church(s.church_id) IN ('admin', 'leader'))
    )
  );

-- Scale songs policies
CREATE POLICY "Users can view scale songs" ON public.scale_songs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.scales s 
      WHERE s.id = scale_id AND public.has_church_access(s.church_id)
    )
  );

CREATE POLICY "Scale creators can manage songs" ON public.scale_songs
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.scales s 
      WHERE s.id = scale_id 
      AND (s.created_by = auth.uid() OR public.get_user_role_in_church(s.church_id) IN ('admin', 'leader'))
    )
  );

-- Agenda items policies
CREATE POLICY "Users can view agenda items" ON public.agenda_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.scales s 
      WHERE s.id = scale_id AND public.has_church_access(s.church_id)
    )
  );

CREATE POLICY "Scale creators can manage agenda" ON public.agenda_items
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.scales s 
      WHERE s.id = scale_id 
      AND (s.created_by = auth.uid() OR public.get_user_role_in_church(s.church_id) IN ('admin', 'leader'))
    )
  );

-- Events policies
CREATE POLICY "Church members can view events" ON public.events
  FOR SELECT USING (public.has_church_access(church_id));

CREATE POLICY "Leaders can manage events" ON public.events
  FOR ALL USING (
    public.get_user_role_in_church(church_id) IN ('admin', 'leader')
  );

-- Event guests policies
CREATE POLICY "Anyone can view event guests" ON public.event_guests
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create guests" ON public.event_guests
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Event registrations policies
CREATE POLICY "Users can view event registrations" ON public.event_registrations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.events e 
      WHERE e.id = event_id AND public.has_church_access(e.church_id)
    )
  );

CREATE POLICY "Users can create registrations" ON public.event_registrations
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.events e 
      WHERE e.id = event_id AND (e.is_public = true OR public.has_church_access(e.church_id))
    )
  );

-- Courses policies
CREATE POLICY "Church members can view courses" ON public.courses
  FOR SELECT USING (public.has_church_access(church_id));

CREATE POLICY "Leaders can manage courses" ON public.courses
  FOR ALL USING (
    public.get_user_role_in_church(church_id) IN ('admin', 'leader')
  );

-- Course modules policies
CREATE POLICY "Users can view course modules" ON public.course_modules
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.courses c 
      WHERE c.id = course_id AND public.has_church_access(c.church_id)
    )
  );

CREATE POLICY "Leaders can manage modules" ON public.course_modules
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.courses c 
      WHERE c.id = course_id AND public.get_user_role_in_church(c.church_id) IN ('admin', 'leader')
    )
  );

-- Lessons policies
CREATE POLICY "Users can view lessons" ON public.lessons
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.course_modules cm
      JOIN public.courses c ON c.id = cm.course_id
      WHERE cm.id = module_id AND public.has_church_access(c.church_id)
    )
  );

CREATE POLICY "Leaders can manage lessons" ON public.lessons
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.course_modules cm
      JOIN public.courses c ON c.id = cm.course_id
      WHERE cm.id = module_id AND public.get_user_role_in_church(c.church_id) IN ('admin', 'leader')
    )
  );

-- Lesson files policies
CREATE POLICY "Users can view lesson files" ON public.lesson_files
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.lessons l
      JOIN public.course_modules cm ON cm.id = l.module_id
      JOIN public.courses c ON c.id = cm.course_id
      WHERE l.id = lesson_id AND public.has_church_access(c.church_id)
    )
  );

CREATE POLICY "Leaders can manage lesson files" ON public.lesson_files
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.lessons l
      JOIN public.course_modules cm ON cm.id = l.module_id
      JOIN public.courses c ON c.id = cm.course_id
      WHERE l.id = lesson_id AND public.get_user_role_in_church(c.church_id) IN ('admin', 'leader')
    )
  );

-- User course progress policies
CREATE POLICY "Users can view own progress" ON public.user_course_progress
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own progress" ON public.user_course_progress
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Leaders can view all progress" ON public.user_course_progress
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.courses c 
      WHERE c.id = course_id AND public.get_user_role_in_church(c.church_id) IN ('admin', 'leader')
    )
  );

-- Invites policies
CREATE POLICY "Church admins can manage invites" ON public.invites
  FOR ALL USING (
    public.get_user_role_in_church(church_id) IN ('admin', 'leader')
  );

-- Profile history policies
CREATE POLICY "Users can view own history" ON public.profile_history
  FOR SELECT USING (
    user_id = auth.uid() OR 
    (church_id IS NOT NULL AND public.has_church_access(church_id))
  );

CREATE POLICY "Leaders can create history" ON public.profile_history
  FOR INSERT WITH CHECK (
    changed_by = auth.uid() AND
    (church_id IS NULL OR public.get_user_role_in_church(church_id) IN ('admin', 'leader') OR public.is_master())
  );

-- Member evaluations policies
CREATE POLICY "Leaders can evaluate members" ON public.member_evaluations
  FOR INSERT WITH CHECK (
    evaluator_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM public.departments d 
      WHERE d.id = department_id 
      AND (d.leader_id = auth.uid() OR public.get_user_role_in_church(d.church_id) IN ('admin', 'leader'))
    )
  );

CREATE POLICY "Users can view evaluations" ON public.member_evaluations
  FOR SELECT USING (
    evaluator_id = auth.uid() OR
    member_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.departments d 
      WHERE d.id = department_id 
      AND (d.leader_id = auth.uid() OR public.get_user_role_in_church(d.church_id) IN ('admin', 'leader'))
    )
  );

CREATE POLICY "Leaders can update evaluations" ON public.member_evaluations
  FOR UPDATE USING (
    evaluator_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM public.departments d 
      WHERE d.id = department_id 
      AND (d.leader_id = auth.uid() OR public.get_user_role_in_church(d.church_id) IN ('admin', 'leader'))
    )
  );

-- CREATE INDEXES FOR PERFORMANCE
CREATE INDEX idx_profiles_email ON public.profiles(email);
CREATE INDEX idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX idx_user_roles_church_id ON public.user_roles(church_id);
CREATE INDEX idx_user_roles_role ON public.user_roles(role);
CREATE INDEX idx_departments_church_id ON public.departments(church_id);
CREATE INDEX idx_departments_leader_id ON public.departments(leader_id);
CREATE INDEX idx_songs_church_id ON public.songs(church_id);
CREATE INDEX idx_scales_church_id ON public.scales(church_id);
CREATE INDEX idx_scales_department_id ON public.scales(department_id);
CREATE INDEX idx_events_church_id ON public.events(church_id);
CREATE INDEX idx_courses_church_id ON public.courses(church_id);

-- INSERT MASTER USER IF NOT EXISTS
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM public.profiles WHERE email = 'yuriadrskt@gmail.com') THEN
    INSERT INTO public.user_roles (user_id, church_id, role, created_at)
    SELECT 
      p.id,
      NULL,
      'master'::public.user_role,
      NOW()
    FROM public.profiles p 
    WHERE p.email = 'yuriadrskt@gmail.com'
    ON CONFLICT (user_id, COALESCE(church_id, '00000000-0000-0000-0000-000000000000'::uuid), role) DO NOTHING;
  END IF;
END
$$;

-- GRANT NECESSARY PERMISSIONS
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;

-- Success message
SELECT 'Database rebuild completed successfully!' as status;
