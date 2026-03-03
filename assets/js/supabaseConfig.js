// Arquivo de configuração do Supabase
// ATENÇÃO: Substitua as credenciais abaixo com as do seu projeto Supabase

const SUPABASE_CONFIG = {
    // URL do seu projeto Supabase
    URL: 'https://ftlgfaraeflseuafznnh.supabase.co',
    
    // Chave anônima do seu projeto Supabase
    ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ0bGdmYXJhZWZsc2V1YWZ6bm5oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAxNzEzNjMsImV4cCI6MjA4NTc0NzM2M30.fVjkybYuOMHDUUHI2_913tJDyMJ4tPUVMuFXJoQuMvs',
    
    // Configurações do Storage
    STORAGE: {
        BUCKETS: {
            AVATARS: 'avatars',
            POSTS: 'posts',
            PETS: 'pets'
        },
        MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
        ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'video/mp4', 'video/webm']
    },
    
    // Configurações de Realtime
    REALTIME: {
        CHANNELS: {
            MESSAGES: 'messages',
            POSTS: 'posts',
            LIKES: 'likes',
            COMMENTS: 'comments'
        }
    }
};

// Função para validar configuração
export const validateConfig = () => {
    if (!SUPABASE_CONFIG.URL || SUPABASE_CONFIG.URL === 'https://SEU-PROJETO-ID.supabase.co') {
        throw new Error('⚠️ ATENÇÃO: Você precisa configurar a URL do seu projeto Supabase no arquivo supabaseConfig.js');
    }
    
    if (!SUPABASE_CONFIG.ANON_KEY || SUPABASE_CONFIG.ANON_KEY === 'SUA-ANON-KEY-AQUI') {
        throw new Error('⚠️ ATENÇÃO: Você precisa configurar a ANON KEY do seu projeto Supabase no arquivo supabaseConfig.js');
    }
};

// Exportar configuração
export default SUPABASE_CONFIG;

// Instruções de configuração
export const SETUP_INSTRUCTIONS = `
🔧 COMO CONFIGURAR O SUPABASE:

1️⃣ Crie uma conta gratuita em https://supabase.com
2️⃣ Crie um novo projeto no dashboard do Supabase
3️⃣ No painel do seu projeto, vá em Settings > API
4️⃣ Copie a URL do projeto e a ANON KEY
5️⃣ Substitua os valores neste arquivo (supabaseConfig.js):
   - URL: 'https://SEU-PROJETO-ID.supabase.co' → sua URL real
   - ANON_KEY: 'SUA-ANON-KEY-AQUI' → sua ANON KEY real

6️⃣ Execute o SQL do arquivo database/schema.sql no painel SQL do Supabase
7️⃣ Configure os buckets de Storage no painel do Supabase:
   - Crie os buckets: 'avatars', 'posts', 'pets'
   - Configure as políticas de acesso público para leitura

📋 BUCKETS NECESSÁRIOS:
- avatars: fotos de perfil dos usuários
- posts: mídias das postagens
- pets: fotos dos pets

🔐 POLÍTICAS DE STORAGE (execute no painel SQL):
CREATE POLICY "Anyone can view images" ON storage.objects FOR SELECT USING (bucket_id IN ('avatars', 'posts', 'pets'));
CREATE POLICY "Users can upload own images" ON storage.objects FOR INSERT WITH CHECK (
    bucket_id IN ('avatars', 'posts', 'pets') AND 
    auth.uid()::text = (storage.foldername(name))[1]
);
CREATE POLICY "Users can update own images" ON storage.objects FOR UPDATE USING (
    bucket_id IN ('avatars', 'posts', 'pets') AND 
    auth.uid()::text = (storage.foldername(name))[1]
);
CREATE POLICY "Users can delete own images" ON storage.objects FOR DELETE USING (
    bucket_id IN ('avatars', 'posts', 'pets') AND 
    auth.uid()::text = (storage.foldername(name))[1]
);
`;

export { SUPABASE_CONFIG };
