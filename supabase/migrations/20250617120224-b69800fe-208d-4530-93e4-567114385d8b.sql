
-- Criar enums para tipagem
CREATE TYPE public.user_role AS ENUM ('master', 'admin', 'leader', 'collaborator', 'member');
CREATE TYPE public.department_type AS ENUM ('louvor', 'louvor-juniores', 'louvor-teens', 'midia', 'midia-juniores', 'sonoplastia', 'instrumentos', 'recepcao', 'ministracao', 'palavra', 'oracao', 'custom');
CREATE TYPE public.invite_status AS ENUM ('pending', 'accepted', 'expired', 'declined');
CREATE TYPE public.event_status AS ENUM ('draft', 'published', 'cancelled', 'completed');
CREATE TYPE public.scale_status AS ENUM ('draft', 'published', 'completed');
CREATE TYPE public.file_type AS ENUM ('pdf', 'doc', 'image', 'video', 'audio', 'other');

-- Tabela de perfis de usuário
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  avatar TEXT,
  experience TEXT CHECK (experience IN ('beginner', 'intermediate', 'advanced')),
  skills TEXT[],
  language TEXT DEFAULT 'pt-BR',
  dark_mode BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de igrejas
CREATE TABLE public.churches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  address TEXT,
  phone TEXT,
  email TEXT,
  admin_id UUID REFERENCES public.profiles(id) NOT NULL,
  service_types TEXT[] DEFAULT ARRAY['Culto Domingo Manhã', 'Culto Domingo Noite', 'Reunião de Oração', 'Culto de Jovens', 'Ensaio Geral', 'Evento Especial'],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de papéis de usuário por igreja
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  church_id UUID REFERENCES public.churches(id) ON DELETE CASCADE,
  role public.user_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, church_id, role)
);

-- Tabela de departamentos
CREATE TABLE public.departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  church_id UUID REFERENCES public.churches(id) ON DELETE CASCADE NOT NULL,
  leader_id UUID REFERENCES public.profiles(id),
  type public.department_type NOT NULL,
  parent_department_id UUID REFERENCES public.departments(id),
  is_sub_department BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de relacionamento usuário-departamento
CREATE TABLE public.user_departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  department_id UUID REFERENCES public.departments(id) ON DELETE CASCADE NOT NULL,
  role TEXT DEFAULT 'member',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, department_id)
);

-- Tabela de músicas/repertório
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
  tags TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de escalas
CREATE TABLE public.scales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  date TIMESTAMP WITH TIME ZONE NOT NULL,
  service_type TEXT NOT NULL,
  church_id UUID REFERENCES public.churches(id) ON DELETE CASCADE NOT NULL,
  department_id UUID REFERENCES public.departments(id) ON DELETE CASCADE NOT NULL,
  created_by UUID REFERENCES public.profiles(id) NOT NULL,
  notes TEXT,
  status public.scale_status DEFAULT 'draft',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de colaboradores na escala
CREATE TABLE public.scale_collaborators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scale_id UUID REFERENCES public.scales(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  role TEXT NOT NULL,
  confirmed BOOLEAN DEFAULT false,
  invited_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(scale_id, user_id, role)
);

-- Tabela de músicas na escala
CREATE TABLE public.scale_songs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scale_id UUID REFERENCES public.scales(id) ON DELETE CASCADE NOT NULL,
  song_id UUID REFERENCES public.songs(id) ON DELETE CASCADE NOT NULL,
  original_key TEXT,
  scale_key TEXT,
  order_position INTEGER NOT NULL,
  notes TEXT,
  links TEXT[],
  UNIQUE(scale_id, song_id, order_position)
);

-- Tabela de agenda da escala
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

-- Tabela de eventos
CREATE TABLE public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  date TIMESTAMP WITH TIME ZONE NOT NULL,
  location TEXT,
  church_id UUID REFERENCES public.churches(id) ON DELETE CASCADE NOT NULL,
  created_by UUID REFERENCES public.profiles(id) NOT NULL,
  max_attendees INTEGER,
  is_public BOOLEAN DEFAULT true,
  status public.event_status DEFAULT 'draft',
  qr_readers TEXT[],
  registration_deadline TIMESTAMP WITH TIME ZONE,
  tags TEXT[],
  image TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de convidados de eventos
CREATE TABLE public.event_guests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  document TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de inscrições em eventos
CREATE TABLE public.event_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE NOT NULL,
  attendee_id UUID NOT NULL, -- pode ser profiles.id ou event_guests.id
  attendee_type TEXT NOT NULL CHECK (attendee_type IN ('member', 'guest')),
  qr_code TEXT UNIQUE NOT NULL,
  registered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  checked_in BOOLEAN DEFAULT false,
  checked_in_at TIMESTAMP WITH TIME ZONE,
  checked_in_by TEXT
);

-- Tabela de cursos
CREATE TABLE public.courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  church_id UUID REFERENCES public.churches(id) ON DELETE CASCADE NOT NULL,
  department_id UUID REFERENCES public.departments(id),
  instructor_id UUID REFERENCES public.profiles(id),
  tags TEXT[],
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de módulos do curso
CREATE TABLE public.course_modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  order_position INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de aulas
CREATE TABLE public.lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id UUID REFERENCES public.course_modules(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  content TEXT,
  order_position INTEGER NOT NULL,
  video_url TEXT,
  duration INTEGER, -- em minutos
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de arquivos das aulas
CREATE TABLE public.lesson_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id UUID REFERENCES public.lessons(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  type public.file_type NOT NULL,
  url TEXT NOT NULL,
  size BIGINT NOT NULL, -- em bytes
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de progresso do usuário no curso
CREATE TABLE public.user_course_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
  enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  completed_lessons UUID[],
  UNIQUE(user_id, course_id)
);

-- Tabela de convites
CREATE TABLE public.invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  role public.user_role NOT NULL,
  department_id UUID REFERENCES public.departments(id),
  church_id UUID REFERENCES public.churches(id) ON DELETE CASCADE NOT NULL,
  invited_by UUID REFERENCES public.profiles(id) NOT NULL,
  status public.invite_status DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '7 days')
);

-- Habilitar RLS em todas as tabelas
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

-- Function para verificar se o usuário é master
CREATE OR REPLACE FUNCTION public.is_master()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'master' AND church_id IS NULL
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Function para obter o role do usuário em uma igreja
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

-- Function para verificar se o usuário tem acesso a uma igreja
CREATE OR REPLACE FUNCTION public.has_church_access(church_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  -- Master tem acesso a tudo
  IF public.is_master() THEN
    RETURN TRUE;
  END IF;
  
  -- Verificar se tem role na igreja
  RETURN EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND church_id = church_uuid
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- RLS Policies para profiles
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Masters can view all profiles" ON public.profiles
  FOR SELECT USING (public.is_master());

-- RLS Policies para churches
CREATE POLICY "Masters can view all churches" ON public.churches
  FOR ALL USING (public.is_master());

CREATE POLICY "Church members can view their church" ON public.churches
  FOR SELECT USING (public.has_church_access(id));

CREATE POLICY "Admins can update their church" ON public.churches
  FOR UPDATE USING (public.get_user_role_in_church(id) = 'admin');

-- RLS Policies para user_roles
CREATE POLICY "Masters can manage all user roles" ON public.user_roles
  FOR ALL USING (public.is_master());

CREATE POLICY "Users can view roles in their churches" ON public.user_roles
  FOR SELECT USING (
    church_id IS NULL OR public.has_church_access(church_id)
  );

CREATE POLICY "Admins can manage roles in their church" ON public.user_roles
  FOR ALL USING (
    church_id IS NOT NULL AND public.get_user_role_in_church(church_id) = 'admin'
  );

-- RLS Policies para departments
CREATE POLICY "Church members can view departments" ON public.departments
  FOR SELECT USING (public.has_church_access(church_id));

CREATE POLICY "Admins can manage departments" ON public.departments
  FOR ALL USING (public.get_user_role_in_church(church_id) = 'admin');

-- RLS Policies para user_departments
CREATE POLICY "Users can view their department memberships" ON public.user_departments
  FOR SELECT USING (
    user_id = auth.uid() OR 
    EXISTS (
      SELECT 1 FROM public.departments d 
      WHERE d.id = department_id AND public.has_church_access(d.church_id)
    )
  );

CREATE POLICY "Leaders can manage their department members" ON public.user_departments
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.departments d 
      WHERE d.id = department_id 
      AND (d.leader_id = auth.uid() OR public.get_user_role_in_church(d.church_id) = 'admin')
    )
  );

-- RLS Policies para songs
CREATE POLICY "Church members can view songs" ON public.songs
  FOR SELECT USING (public.has_church_access(church_id));

CREATE POLICY "Leaders and above can manage songs" ON public.songs
  FOR ALL USING (
    public.get_user_role_in_church(church_id) IN ('admin', 'leader')
  );

-- RLS Policies para scales
CREATE POLICY "Church members can view scales" ON public.scales
  FOR SELECT USING (public.has_church_access(church_id));

CREATE POLICY "Leaders and above can manage scales" ON public.scales
  FOR ALL USING (
    public.get_user_role_in_church(church_id) IN ('admin', 'leader')
  );

-- RLS Policies para scale_collaborators
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

-- RLS Policies para events
CREATE POLICY "Church members can view events" ON public.events
  FOR SELECT USING (public.has_church_access(church_id));

CREATE POLICY "Leaders and above can manage events" ON public.events
  FOR ALL USING (
    public.get_user_role_in_church(church_id) IN ('admin', 'leader')
  );

-- RLS Policies para courses
CREATE POLICY "Church members can view courses" ON public.courses
  FOR SELECT USING (public.has_church_access(church_id));

CREATE POLICY "Leaders and above can manage courses" ON public.courses
  FOR ALL USING (
    public.get_user_role_in_church(church_id) IN ('admin', 'leader')
  );

-- RLS Policies para invites
CREATE POLICY "Church admins can manage invites" ON public.invites
  FOR ALL USING (
    public.get_user_role_in_church(church_id) IN ('admin', 'leader')
  );

-- Trigger para criar perfil automaticamente
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'full_name', 'Usuário'),
    NEW.email
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at_profiles BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_churches BEFORE UPDATE ON public.churches
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Criar storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES 
  ('avatars', 'avatars', true),
  ('course-files', 'course-files', true),
  ('event-images', 'event-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "Anyone can view avatars" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their avatar" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'avatars' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can update their avatar" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'avatars' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Church members can view course files" ON storage.objects
  FOR SELECT USING (bucket_id = 'course-files');

CREATE POLICY "Leaders can upload course files" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'course-files' AND auth.role() = 'authenticated');

CREATE POLICY "Church members can view event images" ON storage.objects
  FOR SELECT USING (bucket_id = 'event-images');

CREATE POLICY "Leaders can upload event images" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'event-images' AND auth.role() = 'authenticated');
