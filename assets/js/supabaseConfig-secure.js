// 🚨 ATENÇÃO: CREDENCIAIS EXPOSTAS DETECTADAS!
// Este arquivo contém chaves reais do Supabase que devem ser mantidas em segurança

// 🔄 CONFIGURAÇÃO SEGURA RECOMENDADA:
// 1️⃣ Mova estas credenciais para variáveis de ambiente
// 2️⃣ Use .env para desenvolvimento
// 3️⃣ Configure secrets no deploy (Vercel/Netlify)

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
    },
    
    // 🔐 NOVAS CONFIGURAÇÕES DE SEGURANÇA
    AUTH: {
        // Habilitar proteção contra senhas vazadas
        ENABLE_LEAKED_PASSWORD_PROTECTION: true,
        
        // Configurações de sessão
        SESSION_TIMEOUT: 3600, // 1 hora em segundos
        
        // Requer confirmação de email
        REQUIRE_EMAIL_CONFIRMATION: false, // Configure conforme necessidade
        
        // Limitar tentativas de login
        RATE_LIMIT: {
            MAX_ATTEMPTS: 5,
            WINDOW_MINUTES: 15
        }
    }
};

// Função de validação aprimorada
export const validateConfig = () => {
    // Verificar se está usando credenciais reais (não placeholders)
    if (!SUPABASE_CONFIG.URL || SUPABASE_CONFIG.URL.includes('SEU-PROJETO-ID')) {
        throw new Error('⚠️ ATENÇÃO: Configure a URL real do seu projeto Supabase');
    }
    
    if (!SUPABASE_CONFIG.ANON_KEY || SUPABASE_CONFIG.ANON_KEY.includes('SUA-ANON-KEY')) {
        throw new Error('⚠️ ATENÇÃO: Configure a ANON KEY real do seu projeto Supabase');
    }
    
    // Verificar formato da URL
    if (!SUPABASE_CONFIG.URL.startsWith('https://') || !SUPABASE_CONFIG.URL.includes('.supabase.co')) {
        throw new Error('⚠️ ATENÇÃO: URL do Supabase parece inválida');
    }
    
    // Verificar formato da chave
    if (SUPABASE_CONFIG.ANON_KEY.length < 100) {
        throw new Error('⚠️ ATENÇÃO: ANON KEY parece inválida (muito curta)');
    }
    
    console.log('✅ Configuração do Supabase validada com sucesso');
};

// Exportar configuração
export default SUPABASE_CONFIG;

// Instruções de configuração atualizadas
export const SETUP_INSTRUCTIONS = `
🔧 CONFIGURAÇÃO SEGURA DO SUPABASE:

1️⃣ PROTEÇÃO DE CREDENCIAIS:
   - NUNCA commit chaves reais no Git
   - Use variáveis de ambiente
   - Configure secrets no deploy

2️⃣ ATIVAR LEAKED PASSWORD PROTECTION:
   1. Dashboard Supabase → Authentication
   2. Settings → Password Protection
   3. Ative "Enable Leaked Password Protection"
   4. Configure "Block sign-ups with breached passwords"

3️⃣ CONFIGURAÇÕES RECOMENDADAS:
   - Email Confirmation: ON
   - Rate Limiting: 5 tentativas/15min
   - Session Timeout: 1 hora
   - Multi-factor Authentication: ON

4️⃣ BUCKETS DE STORAGE:
   - avatars: fotos de perfil
   - posts: mídias das postagens  
   - pets: fotos dos pets

🚨 SEGURANÇA CRÍTICA:
- RLS deve estar habilitado em TODAS as tabelas
- Use service_role_key APENAS no backend
- Limpe logs regularmente
- Monitore atividades suspeitas
`;

export { SUPABASE_CONFIG };
