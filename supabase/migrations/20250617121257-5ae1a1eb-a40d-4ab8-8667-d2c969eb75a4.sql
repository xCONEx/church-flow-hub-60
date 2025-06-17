
-- Inserir o email como master
INSERT INTO public.user_roles (user_id, church_id, role, created_at)
SELECT 
  p.id,
  NULL, -- church_id é NULL para master
  'master'::public.user_role,
  NOW()
FROM public.profiles p 
WHERE p.email = 'yuriadrskt@gmail.com'
ON CONFLICT (user_id, church_id, role) DO NOTHING;

-- Se o perfil não existir ainda, vamos criar um trigger que adiciona o role master automaticamente
CREATE OR REPLACE FUNCTION public.check_master_email()
RETURNS TRIGGER AS $$
BEGIN
  -- Se o email for o master definido, adicionar role master
  IF NEW.email = 'yuriadrskt@gmail.com' THEN
    INSERT INTO public.user_roles (user_id, church_id, role, created_at)
    VALUES (NEW.id, NULL, 'master'::public.user_role, NOW())
    ON CONFLICT (user_id, church_id, role) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_profile_master_check
  AFTER INSERT ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.check_master_email();

-- Tabela de avaliações/rankings dos membros
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
  evaluation_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(member_id, evaluator_id, church_id, department_id)
);

-- Habilitar RLS na tabela de avaliações
ALTER TABLE public.member_evaluations ENABLE ROW LEVEL SECURITY;

-- RLS Policies para member_evaluations
CREATE POLICY "Leaders can evaluate members" ON public.member_evaluations
  FOR INSERT WITH CHECK (
    evaluator_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM public.departments d 
      WHERE d.id = department_id 
      AND (d.leader_id = auth.uid() OR public.get_user_role_in_church(d.church_id) IN ('admin', 'leader'))
    )
  );

CREATE POLICY "Leaders can view evaluations" ON public.member_evaluations
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

-- Tabela para histórico de perfil completo
CREATE TABLE public.profile_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  church_id UUID REFERENCES public.churches(id) ON DELETE CASCADE NOT NULL,
  department_id UUID REFERENCES public.departments(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL, -- 'join', 'promote', 'demote', 'transfer', 'evaluation'
  previous_role TEXT,
  new_role TEXT,
  previous_department_id UUID,
  changed_by UUID REFERENCES public.profiles(id) NOT NULL,
  notes TEXT,
  metadata JSONB, -- Para dados adicionais flexíveis
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS na tabela de histórico
ALTER TABLE public.profile_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies para profile_history
CREATE POLICY "Church members can view profile history" ON public.profile_history
  FOR SELECT USING (
    user_id = auth.uid() OR public.has_church_access(church_id)
  );

CREATE POLICY "Leaders can create profile history" ON public.profile_history
  FOR INSERT WITH CHECK (
    changed_by = auth.uid() AND
    (public.get_user_role_in_church(church_id) IN ('admin', 'leader') OR public.is_master())
  );

-- Atualizar a tabela de convites para permitir role admin
ALTER TABLE public.invites DROP CONSTRAINT IF EXISTS invites_role_check;
-- A constraint já não existe na definição atual, então não precisamos dropar

-- Trigger para criar histórico quando roles mudam
CREATE OR REPLACE FUNCTION public.track_role_changes()
RETURNS TRIGGER AS $$
BEGIN
  -- Registrar mudança de role
  INSERT INTO public.profile_history (
    user_id, 
    church_id, 
    action_type, 
    previous_role, 
    new_role, 
    changed_by,
    notes
  ) VALUES (
    COALESCE(NEW.user_id, OLD.user_id),
    COALESCE(NEW.church_id, OLD.church_id),
    CASE 
      WHEN TG_OP = 'INSERT' THEN 'join'
      WHEN TG_OP = 'UPDATE' THEN 'promote'
      WHEN TG_OP = 'DELETE' THEN 'demote'
    END,
    OLD.role::TEXT,
    NEW.role::TEXT,
    auth.uid(),
    'Mudança automática de role'
  );
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER track_user_role_changes
  AFTER INSERT OR UPDATE OR DELETE ON public.user_roles
  FOR EACH ROW EXECUTE FUNCTION public.track_role_changes();

-- Trigger para atualizar updated_at nas novas tabelas
CREATE TRIGGER set_updated_at_member_evaluations BEFORE UPDATE ON public.member_evaluations
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
