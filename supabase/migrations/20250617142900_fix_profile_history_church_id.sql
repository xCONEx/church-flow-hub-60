
-- Corrigir a constraint da tabela profile_history para permitir church_id NULL
-- Isso resolve o erro ao criar/convidar usuários

-- Primeiro, vamos alterar a tabela para permitir church_id NULL
ALTER TABLE public.profile_history ALTER COLUMN church_id DROP NOT NULL;

-- Atualizar o trigger para não criar histórico desnecessário em operações básicas
DROP TRIGGER IF EXISTS track_user_role_changes ON public.user_roles;

-- Recriar a função do trigger com melhor lógica
CREATE OR REPLACE FUNCTION public.track_role_changes()
RETURNS TRIGGER AS $$
BEGIN
  -- Só registrar mudanças se não for um master role (masters não têm church_id)
  IF (TG_OP = 'INSERT' AND NEW.role != 'master') OR 
     (TG_OP = 'UPDATE' AND OLD.role != NEW.role AND NEW.role != 'master') OR
     (TG_OP = 'DELETE' AND OLD.role != 'master') THEN
    
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
      COALESCE(NEW.church_id, OLD.church_id), -- Pode ser NULL para masters
      CASE 
        WHEN TG_OP = 'INSERT' THEN 'join'
        WHEN TG_OP = 'UPDATE' THEN 'promote'
        WHEN TG_OP = 'DELETE' THEN 'demote'
      END,
      CASE WHEN OLD.role IS NOT NULL THEN OLD.role::TEXT ELSE NULL END,
      CASE WHEN NEW.role IS NOT NULL THEN NEW.role::TEXT ELSE NULL END,
      auth.uid(),
      'Mudança automática de role'
    );
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recriar o trigger
CREATE TRIGGER track_user_role_changes
  AFTER INSERT OR UPDATE OR DELETE ON public.user_roles
  FOR EACH ROW EXECUTE FUNCTION public.track_role_changes();

-- Atualizar a função de verificação de master para não causar problemas
DROP TRIGGER IF EXISTS on_profile_master_check ON public.profiles;

CREATE OR REPLACE FUNCTION public.check_master_email()
RETURNS TRIGGER AS $$
BEGIN
  -- Se o email for o master definido, adicionar role master
  IF NEW.email = 'yuriadrskt@gmail.com' THEN
    INSERT INTO public.user_roles (user_id, church_id, role, created_at)
    VALUES (NEW.id, NULL, 'master'::public.user_role, NOW())
    ON CONFLICT (user_id, COALESCE(church_id, '00000000-0000-0000-0000-000000000000'::uuid), role) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_profile_master_check
  AFTER INSERT ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.check_master_email();

-- Limpar registros de histórico problemáticos (opcional)
DELETE FROM public.profile_history WHERE church_id IS NULL AND action_type != 'join';
