-- ==========================================
-- 🔒 CORREÇÃO DE SEGURANÇA - PET SOCIAL
-- Habilitar RLS na tabela comments e criar políticas
-- Execute este script no Dashboard SQL do Supabase
-- ==========================================

-- 1️⃣ HABILITAR RLS NA TABELA COMMENTS
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

-- 2️⃣ REMOVER POLÍTICAS EXISTENTES (SE HOUVER)
DROP POLICY IF EXISTS "Anyone can view comments" ON public.comments;
DROP POLICY IF EXISTS "Users can insert comments" ON public.comments;
DROP POLICY IF EXISTS "Users can delete own comments" ON public.comments;

-- 3️⃣ CRIAR POLÍTICA DE LEITURA PÚBLICA
-- Qualquer usuário (autenticado ou não) pode ver comentários
CREATE POLICY "Anyone can view comments" ON public.comments
    FOR SELECT USING (true);

-- 4️⃣ CRIAR POLÍTICA DE INSERÇÃO PARA AUTENTICADOS
-- Apenas usuários autenticados podem criar comentários
CREATE POLICY "Users can insert comments" ON public.comments
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- 5️⃣ CRIAR POLÍTICA DE ATUALIZAÇÃO (DONO DO COMENTÁRIO)
-- Apenas o autor do comentário pode atualizar
CREATE POLICY "Users can update own comments" ON public.comments
    FOR UPDATE USING (auth.uid() = user_id);

-- 6️⃣ CRIAR POLÍTICA DE DELEÇÃO (DONO DO COMENTÁRIO)
-- Apenas o autor do comentário pode deletar
CREATE POLICY "Users can delete own comments" ON public.comments
    FOR DELETE USING (auth.uid() = user_id);

-- 7️⃣ VERIFICAÇÃO DE SEGURANÇA
-- Confirme se as políticas foram criadas corretamente
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
WHERE tablename = 'comments';

-- 8️⃣ VERIFICAR SE RLS ESTÁ ATIVO
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename = 'comments';

-- ==========================================
-- ✅ RESULTADO ESPERADO:
-- - RLS habilitado na tabela comments
-- - 4 políticas criadas: SELECT, INSERT, UPDATE, DELETE
-- - Proteção contra acesso não autorizado
-- ==========================================
