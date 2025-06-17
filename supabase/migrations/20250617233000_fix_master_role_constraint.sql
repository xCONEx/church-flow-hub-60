
-- CORREÇÃO CRÍTICA: church_id deve permitir NULL para roles globais como master
-- Esta migração corrige o problema de constraint NOT NULL na coluna church_id

-- 1. REMOVER CONSTRAINT NOT NULL da coluna church_id
ALTER TABLE public.user_roles ALTER COLUMN church_id DROP NOT NULL;

-- 2. LIMPAR DADOS ÓRFÃOS/DUPLICADOS
DELETE FROM public.user_roles 
WHERE user_id NOT IN (SELECT id FROM public.profiles);

-- 3. GARANTIR QUE O MASTER USER EXISTE COM ROLE CORRETA
DO $$
DECLARE
    master_user_id UUID;
BEGIN
    -- Buscar o ID do usuário master
    SELECT p.id INTO master_user_id
    FROM public.profiles p
    WHERE p.email = 'yuriadrskt@gmail.com'
    LIMIT 1;
    
    -- Se encontrou o usuário master
    IF master_user_id IS NOT NULL THEN
        -- Remover todas as roles existentes para este usuário
        DELETE FROM public.user_roles WHERE user_id = master_user_id;
        
        -- Inserir role master correta
        INSERT INTO public.user_roles (user_id, church_id, role, created_at)
        VALUES (master_user_id, NULL, 'master'::public.user_role, NOW());
        
        RAISE LOG 'Master user role fixed for user: %', master_user_id;
    ELSE
        RAISE LOG 'Master user profile not found with email: yuriadrskt@gmail.com';
    END IF;
END;
$$;

-- 4. ATUALIZAR FUNÇÃO handle_new_user PARA CORRIGIR A LÓGICA DE ROLES
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_name TEXT;
  user_avatar TEXT;
  user_role public.user_role;
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

  -- Determinar role baseado no email (CORRIGIDO)
  IF NEW.email = 'yuriadrskt@gmail.com' THEN
    user_role := 'master'::public.user_role;
  ELSE
    user_role := 'member'::public.user_role;
  END IF;

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

  -- Inserir role (CORRIGIDO para permitir church_id NULL)
  INSERT INTO public.user_roles (user_id, church_id, role, created_at)
  VALUES (NEW.id, NULL, user_role, NOW())
  ON CONFLICT (user_id, COALESCE(church_id, '00000000-0000-0000-0000-000000000000'::uuid), role) 
  DO NOTHING;
  
  RAISE LOG 'Role % assigned to user: %', user_role, NEW.email;

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log do erro mas não falha a autenticação
    RAISE LOG 'Error in handle_new_user for %: %', NEW.email, SQLERRM;
    RETURN NEW;
END;
$$;

-- 5. VERIFICAR SE EXISTEM ROLES PARA O MASTER USER
DO $$
DECLARE
    master_roles_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO master_roles_count
    FROM public.user_roles ur
    JOIN public.profiles p ON ur.user_id = p.id
    WHERE p.email = 'yuriadrskt@gmail.com' AND ur.role = 'master';
    
    RAISE LOG 'Master user has % master roles', master_roles_count;
END;
$$;

-- 6. CRIAR ÍNDICES ÚNICOS ATUALIZADOS
DROP INDEX IF EXISTS idx_user_roles_unique_constraint;
CREATE UNIQUE INDEX idx_user_roles_unique_constraint 
ON public.user_roles (user_id, COALESCE(church_id, '00000000-0000-0000-0000-000000000000'::uuid), role);

SELECT 'Master role constraint fixed successfully!' as status;
