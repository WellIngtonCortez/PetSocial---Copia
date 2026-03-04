-- ==========================================
-- 🐾 PET SOCIAL - PERFIS DE USUÁRIOS
-- Schema completo para registro e autenticação
-- Execute no Dashboard SQL do Supabase
-- ==========================================

-- 1️⃣ CRIAR TABELA PROFILES
-- Extende a tabela auth.users com informações adicionais
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    username TEXT UNIQUE,
    full_name TEXT,
    avatar_url TEXT,
    biography TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    
    -- Constraints adicionais
    CONSTRAINT username_length CHECK (char_length(username) >= 3 AND char_length(username) <= 30),
    CONSTRAINT username_format CHECK (username ~ '^[a-zA-Z0-9_]+$'),
    CONSTRAINT biography_length CHECK (char_length(biography) <= 500)
);

-- 2️⃣ CRIAR ÍNDICES PARA PERFORMANCE
CREATE INDEX IF NOT EXISTS profiles_username_idx ON public.profiles(username);
CREATE INDEX IF NOT EXISTS profiles_created_at_idx ON public.profiles(created_at DESC);
CREATE INDEX IF NOT EXISTS profiles_full_name_idx ON public.profiles(full_name);

-- 3️⃣ HABILITAR ROW LEVEL SECURITY (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 4️⃣ REMOVER POLÍTICAS EXISTENTES (SE HOUVER)
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can delete own profile" ON public.profiles;

-- 5️⃣ CRIAR POLÍTICAS DE SEGURANÇA

-- Política de leitura: Qualquer usuário pode ver qualquer perfil
CREATE POLICY "Users can view all profiles" ON public.profiles
    FOR SELECT USING (true);

-- Política de inserção: Apenas usuários autenticados podem criar perfil
CREATE POLICY "Users can insert own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Política de atualização: Apenas o dono pode editar seu perfil
CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- Política de deleção: Apenas o dono pode deletar seu perfil
CREATE POLICY "Users can delete own profile" ON public.profiles
    FOR DELETE USING (auth.uid() = id);

-- 6️⃣ CRIAR TRIGGER AUTOMÁTICO
-- Cria perfil automaticamente quando usuário se registra
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Inserir perfil com dados básicos
    INSERT INTO public.profiles (id, username, full_name)
    VALUES (
        NEW.id,
        -- Extrair username do email ou usar padrão
        COALESCE(
            NEW.raw_user_meta_data->>'username',
            split_part(NEW.email, '@', 1)
        ),
        COALESCE(
            NEW.raw_user_meta_data->>'full_name',
            split_part(NEW.email, '@', 1)
        )
    );
    
    -- Retornar o usuário
    RETURN NEW;
END;
$$;

-- 7️⃣ CRIAR TRIGGER
-- Dispara após inserção em auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- 8️⃣ CRIAR FUNÇÃO PARA ATUALIZAR updated_at
-- Atualiza automaticamente o timestamp quando o perfil é modificado
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$;

-- 9️⃣ CRIAR TRIGGER PARA updated_at
DROP TRIGGER IF EXISTS set_updated_at ON public.profiles;
CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- 🔟 VERIFICAÇÕES E TESTES

-- Verificar estrutura da tabela
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Verificar políticas criadas
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'profiles'
ORDER BY policyname;

-- Verificar triggers
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_timing,
    action_condition,
    action_statement
FROM information_schema.triggers 
WHERE trigger_name IN ('on_auth_user_created', 'set_updated_at')
ORDER BY trigger_name;

-- 🧪 TESTE MANUAL (Opcional)
-- Para testar o trigger, você pode criar um usuário manualmente:
/*
INSERT INTO auth.users (
    id,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    raw_user_meta_data
) VALUES (
    gen_random_uuid(),
    'test@example.com',
    'hashed_password',
    timezone('utc'::text, now()),
    timezone('utc'::text, now()),
    timezone('utc'::text, now()),
    '{"username": "testuser", "full_name": "Test User"}'::jsonb
);
*/

-- 📝 RESUMO DAS FUNCIONALIDADES:
-- ✅ Tabela profiles com relacionamento 1:1 com auth.users
-- ✅ Campos: id, username, full_name, avatar_url, biography, timestamps
-- ✅ RLS habilitado com políticas apropriadas
-- ✅ Trigger automático para criar perfil no registro
-- ✅ Trigger automático para updated_at
-- ✅ Índices para performance
-- ✅ Constraints para validação de dados

-- 🚨 IMPORTANTE:
-- - Certifique-se de que o Email Confirmation está configurado no Dashboard
-- - Teste o fluxo completo de registro
-- - Verifique se os buckets de Storage existem para avatares
