-- ==========================================
-- 🔒 CORREÇÃO DE SEGURANÇA - TABELA COMMENTS
-- Script SQL para habilitar RLS e criar políticas
-- Execute no Dashboard SQL do Supabase
-- ==========================================

-- 1️⃣ VERIFICAR ESTADO ATUAL DA TABELA
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename = 'comments';

-- 2️⃣ HABILITAR RLS NA TABELA COMMENTS
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

-- 3️⃣ REMOVER POLÍTICAS EXISTENTES (SE HOUVER)
DROP POLICY IF EXISTS "Anyone can view comments" ON public.comments;
DROP POLICY IF EXISTS "Users can insert comments" ON public.comments;
DROP POLICY IF EXISTS "Users can update own comments" ON public.comments;
DROP POLICY IF EXISTS "Users can delete own comments" ON public.comments;

-- 4️⃣ CRIAR POLÍTICA DE LEITURA PÚBLICA
-- Qualquer usuário (autenticado ou não) pode ver comentários
CREATE POLICY "Anyone can view comments" ON public.comments
    FOR SELECT USING (true);

-- 5️⃣ CRIAR POLÍTICA DE INSERÇÃO PARA AUTENTICADOS
-- Apenas usuários autenticados podem criar comentários
CREATE POLICY "Users can insert comments" ON public.comments
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- 6️⃣ CRIAR POLÍTICA DE ATUALIZAÇÃO (DONO DO COMENTÁRIO)
-- Apenas o autor do comentário pode atualizar
CREATE POLICY "Users can update own comments" ON public.comments
    FOR UPDATE USING (auth.uid() = user_id);

-- 7️⃣ CRIAR POLÍTICA DE DELEÇÃO (DONO DO COMENTÁRIO)
-- Apenas o autor do comentário pode deletar
CREATE POLICY "Users can delete own comments" ON public.comments
    FOR DELETE USING (auth.uid() = user_id);

-- 8️⃣ VERIFICAÇÃO FINAL - POLÍTICAS CRIADAS
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
WHERE tablename = 'comments'
ORDER BY policyname;

-- 9️⃣ VERIFICAÇÃO FINAL - RLS ATIVO
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled,
    hasindexes,
    hasrules,
    hastriggers
FROM pg_tables 
WHERE tablename = 'comments';

-- 🔍 TESTES DE SEGURANÇA (Opcional)
-- Teste 1: Usuário anônimo tentando inserir (deve falhar)
-- Teste 2: Usuário autenticado tentando inserir (deve funcionar)
-- Teste 3: Usuário tentando deletar comentário de outro (deve falhar)

-- 📝 RESUMO DAS POLÍTICAS CRIADAS:
-- ✅ SELECT: Público (qualquer um pode ver comentários)
-- ✅ INSERT: Apenas usuários autenticados (auth.uid() IS NOT NULL)
-- ✅ UPDATE: Apenas dono do comentário (auth.uid() = user_id)
-- ✅ DELETE: Apenas dono do comentário (auth.uid() = user_id)

-- 🚨 IMPORTANTE: 
-- - RLS agora está ATIVO na tabela comments
-- - Todas as operações são validadas pelas políticas
-- - Usuários só podem modificar seus próprios comentários
-- - Comentários são públicos para leitura

-- ✅ RESULTADO ESPERADO:
-- A tabela comments agora está protegida com Row Level Security
-- e permite as operações conforme as regras de negócio do PetSocial.
