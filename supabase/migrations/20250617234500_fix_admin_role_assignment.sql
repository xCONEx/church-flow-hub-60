
-- CORREÇÃO DEFINITIVA PARA ROLES DE ADMIN
-- Esta migração resolve o problema de usuários não receberem o role correto

-- 1. Limpar roles duplicadas ou incorretas
DELETE FROM public.user_roles 
WHERE user_id IN (
  SELECT user_id 
  FROM public.user_roles 
  GROUP BY user_id, church_id 
  HAVING COUNT(*) > 1
);

-- 2. Função melhorada para handle_new_user
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_name TEXT;
  user_avatar TEXT;
BEGIN
  -- Log para debug
  RAISE LOG 'Creating user profile for: %', NEW.email;
  
  -- Extrair dados do usuário
  user_name := COALESCE(
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'name',
    NEW.raw_user_meta_data->>'given_name',
    NEW.raw_user_meta_data->>'first_name',
    split_part(NEW.email, '@', 1),
    'Usuário'
  );
  
  user_avatar := COALESCE(
    NEW.raw_user_meta_data->>'avatar_url',
    NEW.raw_user_meta_data->>'picture',
    NEW.raw_user_meta_data->>'photo'
  );

  -- Inserir perfil com UPSERT
  INSERT INTO public.profiles (id, email, name, avatar, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.email,
    user_name,
    user_avatar,
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    name = COALESCE(EXCLUDED.name, profiles.name),
    avatar = COALESCE(EXCLUDED.avatar, profiles.avatar),
    updated_at = NOW();
    
  RAISE LOG 'Profile created/updated successfully for: %', NEW.email;

  -- Inserir role baseado no email
  IF NEW.email = 'yuriadrskt@gmail.com' THEN
    INSERT INTO public.user_roles (user_id, church_id, role, created_at)
    VALUES (NEW.id, NULL, 'master'::public.user_role, NOW())
    ON CONFLICT (user_id, COALESCE(church_id, '00000000-0000-0000-0000-000000000000'::uuid), role) 
    DO NOTHING;
    RAISE LOG 'Master role assigned to: %', NEW.email;
  ELSE
    -- Para novos usuários, NÃO adicionar role member automaticamente
    -- Eles receberão role quando forem convidados para uma igreja
    RAISE LOG 'New user registered without default role: %', NEW.email;
  END IF;

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log do erro mas não falha a autenticação
    RAISE LOG 'Error in handle_new_user for %: %', NEW.email, SQLERRM;
    RETURN NEW;
END;
$$;

-- 3. Função para garantir que admin receba role correto quando igreja é criada
CREATE OR REPLACE FUNCTION public.ensure_admin_role()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Quando uma igreja é criada, garantir que o admin_id receba role de admin
  IF TG_OP = 'INSERT' AND NEW.admin_id IS NOT NULL THEN
    -- Remover qualquer role member anterior
    DELETE FROM public.user_roles 
    WHERE user_id = NEW.admin_id 
    AND role = 'member' 
    AND church_id IS NULL;
    
    -- Inserir role de admin
    INSERT INTO public.user_roles (user_id, church_id, role, created_at)
    VALUES (NEW.admin_id, NEW.id, 'admin'::public.user_role, NOW())
    ON CONFLICT (user_id, COALESCE(church_id, '00000000-0000-0000-0000-000000000000'::uuid), role) 
    DO NOTHING;
    
    RAISE LOG 'Admin role assigned to user % for church %', NEW.admin_id, NEW.id;
  END IF;
  
  RETURN NEW;
END;
$$;

-- 4. Trigger para garantir role de admin quando igreja é criada
DROP TRIGGER IF EXISTS ensure_admin_role_trigger ON public.churches;
CREATE TRIGGER ensure_admin_role_trigger
  AFTER INSERT ON public.churches
  FOR EACH ROW EXECUTE FUNCTION public.ensure_admin_role();

-- 5. Garantir que usuários existentes que são admins de igrejas tenham o role correto
DO $$
DECLARE
    church_record RECORD;
BEGIN
    FOR church_record IN 
        SELECT id, admin_id, name FROM public.churches WHERE admin_id IS NOT NULL
    LOOP
        -- Remover role member do admin se existir
        DELETE FROM public.user_roles 
        WHERE user_id = church_record.admin_id 
        AND role = 'member' 
        AND church_id IS NULL;
        
        -- Garantir role admin
        INSERT INTO public.user_roles (user_id, church_id, role, created_at)
        VALUES (church_record.admin_id, church_record.id, 'admin'::public.user_role, NOW())
        ON CONFLICT (user_id, COALESCE(church_id, '00000000-0000-0000-0000-000000000000'::uuid), role) 
        DO NOTHING;
        
        RAISE LOG 'Fixed admin role for church: %', church_record.name;
    END LOOP;
END;
$$;

-- 6. Verificar e corrigir master user
DO $$
DECLARE
    master_user_id UUID;
BEGIN
    SELECT p.id INTO master_user_id
    FROM public.profiles p
    WHERE p.email = 'yuriadrskt@gmail.com'
    LIMIT 1;
    
    IF master_user_id IS NOT NULL THEN
        -- Garantir que tem apenas role master
        DELETE FROM public.user_roles WHERE user_id = master_user_id AND role != 'master';
        
        INSERT INTO public.user_roles (user_id, church_id, role, created_at)
        VALUES (master_user_id, NULL, 'master'::public.user_role, NOW())
        ON CONFLICT DO NOTHING;
        
        RAISE LOG 'Master user role verified: %', master_user_id;
    END IF;
END;
$$;

SELECT 'Admin role assignment fixed successfully!' as status;
