// 🔧 SUPABASE CLIENT - CONFIGURAÇÃO SEGURA E ROBUSTA
// Import com fallback para evitar erros de carregamento

let supabase = null;
let SUPABASE_URL = '';
let SUPABASE_ANON_KEY = '';

// 🚨 CONFIGURAÇÃO COM VARIÁVEIS DE AMBIENTE E FALLBACK
try {
    // Tentar usar variáveis de ambiente primeiro (produção)
    if (typeof import.meta !== 'undefined' && import.meta.env) {
        SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
        SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
    }
    
    // Fallback para configuração local (desenvolvimento)
    if (!SUPABASE_URL) {
        // Importar configuração local
        const config = await import('./supabaseConfig.js');
        SUPABASE_URL = config.SUPABASE_CONFIG.URL;
        SUPABASE_ANON_KEY = config.SUPABASE_CONFIG.ANON_KEY;
    }
    
    // Validar configuração
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
        throw new Error('Credenciais do Supabase não configuradas');
    }
    
    // Importar e criar cliente Supabase
    const { createClient } = await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm');
    supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    
    console.log('✅ Supabase client inicializado com sucesso');
    
} catch (error) {
    console.error('❌ Erro ao inicializar Supabase:', error.message);
    
    // Criar cliente mock para desenvolvimento
    supabase = createMockSupabase();
}

// 🎭 CLIENT MOCK PARA DESENVOLVIMENTO
function createMockSupabase() {
    console.warn('🔧 Usando cliente Supabase mock para desenvolvimento');
    
    return {
        auth: {
            signUp: async (data) => {
                console.log('Mock signUp:', data);
                return { 
                    data: { user: { id: 'mock-user', email: data.email } }, 
                    error: null 
                };
            },
            signInWithPassword: async (data) => {
                console.log('Mock signIn:', data);
                return { 
                    data: { user: { id: 'mock-user', email: data.email } }, 
                    error: null 
                };
            },
            signOut: async () => {
                console.log('Mock signOut');
                return { error: null };
            },
            getUser: async () => {
                const stored = sessionStorage.getItem('currentUser');
                return { 
                    data: { user: stored ? JSON.parse(stored) : null }, 
                    error: null 
                };
            }
        },
        from: (table) => ({
            select: (columns) => ({
                eq: (column, value) => ({
                    single: () => Promise.resolve({ 
                        data: null, 
                        error: { message: 'Mock: No data found' } 
                    }),
                    then: (resolve) => resolve({ 
                        data: [], 
                        error: null 
                    })
                }),
                order: (column, options) => ({
                    range: (start, end) => Promise.resolve({ 
                        data: [], 
                        error: null 
                    })
                })
            }),
            insert: (data) => Promise.resolve({ 
                data: Array.isArray(data) ? data[0] : data, 
                error: null 
            }),
            update: (data) => ({
                eq: (column, value) => Promise.resolve({ 
                    data: null, 
                    error: null 
                })
            }),
            delete: () => ({
                eq: (column, value) => Promise.resolve({ 
                    error: null 
                })
            })
        }),
        storage: {
            from: (bucket) => ({
                upload: (path, file) => Promise.resolve({ 
                    data: { path }, 
                    error: null 
                }),
                getPublicUrl: (path) => ({ 
                    data: { publicUrl: URL.createObjectURL(file) } 
                }),
                remove: (paths) => Promise.resolve({ 
                    error: null 
                })
            })
        },
        channel: (name) => ({
            on: (event, filter, callback) => ({
                subscribe: () => ({ 
                    unsubscribe: () => {} 
                })
            })
        })
    };
}

// 📦 EXPORTAÇÕES PRINCIPAIS
export { supabase, SUPABASE_URL, SUPABASE_ANON_KEY };

// 🗄️ CONFIGURAÇÕES
export const STORAGE_CONFIG = {
    BUCKETS: {
        AVATARS: 'avatars',
        POSTS: 'posts',
        PETS: 'pets'
    },
    MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
    ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'video/mp4', 'video/webm']
};

// 📤 FUNÇÕES DE STORAGE
export const uploadImage = async (file, bucket = STORAGE_CONFIG.BUCKETS.POSTS) => {
    if (!supabase || supabase.storage.from.toString().includes('mock')) {
        console.warn('🔧 Usando upload mock');
        return URL.createObjectURL(file);
    }
    
    try {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const filePath = `${bucket}/${fileName}`;
        
        // Validar arquivo
        if (file.size > STORAGE_CONFIG.MAX_FILE_SIZE) {
            throw new Error(`Arquivo muito grande. Máximo: ${STORAGE_CONFIG.MAX_FILE_SIZE / 1024 / 1024}MB`);
        }
        
        if (!STORAGE_CONFIG.ALLOWED_TYPES.includes(file.type)) {
            throw new Error('Tipo de arquivo não permitido');
        }
        
        const { data, error } = await supabase.storage
            .from(bucket)
            .upload(filePath, file);
        
        if (error) throw error;
        
        const { data: { publicUrl } } = supabase.storage
            .from(bucket)
            .getPublicUrl(filePath);
        
        return publicUrl;
        
    } catch (error) {
        console.error('Erro no upload:', error);
        throw error;
    }
};

export const deleteImage = async (url, bucket = STORAGE_CONFIG.BUCKETS.POSTS) => {
    if (!supabase || supabase.storage.from.toString().includes('mock')) {
        console.warn('🔧 Usando delete mock');
        return;
    }
    
    try {
        const filePath = url.split(`/${bucket}/`)[1];
        if (!filePath) {
            throw new Error('URL inválida');
        }
        
        const { error } = await supabase.storage
            .from(bucket)
            .remove([filePath]);
        
        if (error) throw error;
        
    } catch (error) {
        console.error('Erro ao deletar imagem:', error);
        throw error;
    }
};

// 🔐 FUNÇÕES DE AUTENTICAÇÃO
export const signUp = async (email, password, userData = {}) => {
    if (!supabase) {
        throw new Error('Supabase não disponível');
    }
    
    try {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: userData
            }
        });
        
        if (error) throw error;
        return data;
        
    } catch (error) {
        console.error('Erro no signUp:', error);
        throw error;
    }
};

export const signIn = async (email, password) => {
    if (!supabase) {
        throw new Error('Supabase não disponível');
    }
    
    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });
        
        if (error) throw error;
        return data;
        
    } catch (error) {
        console.error('Erro no signIn:', error);
        throw error;
    }
};

export const signOut = async () => {
    if (!supabase) {
        console.warn('🔧 Usando signOut mock');
        return;
    }
    
    try {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
        
        // Limpar storage local
        sessionStorage.removeItem('currentUser');
        localStorage.removeItem('supabase.auth.token');
        localStorage.removeItem('supabase.auth.refreshToken');
        
    } catch (error) {
        console.error('Erro no signOut:', error);
        throw error;
    }
};

export const getCurrentUser = async () => {
    if (!supabase) {
        const stored = sessionStorage.getItem('currentUser');
        return stored ? JSON.parse(stored) : null;
    }
    
    try {
        const { data: { user }, error } = await supabase.auth.getUser();
        
        if (error) {
            // Se houver erro, tentar usar sessionStorage
            const stored = sessionStorage.getItem('currentUser');
            return stored ? JSON.parse(stored) : null;
        }
        
        return user;
        
    } catch (error) {
        console.error('Erro ao obter usuário:', error);
        const stored = sessionStorage.getItem('currentUser');
        return stored ? JSON.parse(stored) : null;
    }
};

// 📊 FUNÇÕES DO BANCO DE DADOS
export const createProfile = async (profileData) => {
    if (!supabase) throw new Error('Supabase não disponível');
    
    const { data, error } = await supabase
        .from('profiles')
        .insert([profileData])
        .select();
    
    if (error) throw error;
    return data[0];
};

export const getProfile = async (userId) => {
    if (!supabase) return null;
    
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
    
    if (error) throw error;
    return data;
};

export const updateProfile = async (userId, updates) => {
    if (!supabase) throw new Error('Supabase não disponível');
    
    const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId)
        .select();
    
    if (error) throw error;
    return data[0];
};

// 📝 FUNÇÕES DE POSTS
export const createPost = async (postData) => {
    if (!supabase) throw new Error('Supabase não disponível');
    
    const { data, error } = await supabase
        .from('posts')
        .insert([postData])
        .select(`
            *,
            profiles (
                username,
                full_name,
                avatar_url
            )
        `);
    
    if (error) throw error;
    return data[0];
};

export const getPosts = async (limit = 20, offset = 0) => {
    if (!supabase) return [];
    
    const { data, error } = await supabase
        .from('posts')
        .select(`
            *,
            profiles (
                username,
                full_name,
                avatar_url
            ),
            likes (count),
            comments (count)
        `)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);
    
    if (error) throw error;
    return data;
};

export const toggleLike = async (postId, userId) => {
    if (!supabase) return { action: 'mock' };
    
    try {
        // Verificar se já curtiu
        const { data: existingLike } = await supabase
            .from('likes')
            .select('*')
            .eq('post_id', postId)
            .eq('user_id', userId)
            .single();
        
        if (existingLike) {
            // Remover like
            const { error } = await supabase
                .from('likes')
                .delete()
                .eq('post_id', postId)
                .eq('user_id', userId);
            
            if (error) throw error;
            return { action: 'unliked' };
        } else {
            // Adicionar like
            const { error } = await supabase
                .from('likes')
                .insert([{ post_id: postId, user_id: userId }]);
            
            if (error) throw error;
            return { action: 'liked' };
        }
    } catch (error) {
        console.error('Erro no toggleLike:', error);
        throw error;
    }
};

// 💬 FUNÇÕES DE COMENTÁRIOS
export const createComment = async (commentData) => {
    if (!supabase) throw new Error('Supabase não disponível');
    
    const { data, error } = await supabase
        .from('comments')
        .insert([commentData])
        .select(`
            *,
            profiles (
                username,
                full_name,
                avatar_url
            )
        `);
    
    if (error) throw error;
    return data[0];
};

export const getComments = async (postId) => {
    if (!supabase) return [];
    
    const { data, error } = await supabase
        .from('comments')
        .select(`
            *,
            profiles (
                username,
                full_name,
                avatar_url
            )
        `)
        .eq('post_id', postId)
        .order('created_at', { ascending: true });
    
    if (error) throw error;
    return data;
};

// 🐾 FUNÇÕES DE PETS
export const createPet = async (petData) => {
    if (!supabase) throw new Error('Supabase não disponível');
    
    const { data, error } = await supabase
        .from('pets')
        .insert([petData])
        .select();
    
    if (error) throw error;
    return data[0];
};

export const getPets = async (userId) => {
    if (!supabase) return [];
    
    const { data, error } = await supabase
        .from('pets')
        .select('*')
        .eq('owner_id', userId)
        .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
};

export const updatePet = async (petId, updates) => {
    if (!supabase) throw new Error('Supabase não disponível');
    
    const { data, error } = await supabase
        .from('pets')
        .update(updates)
        .eq('id', petId)
        .select();
    
    if (error) throw error;
    return data[0];
};

export const deletePet = async (petId) => {
    if (!supabase) return;
    
    const { error } = await supabase
        .from('pets')
        .delete()
        .eq('id', petId);
    
    if (error) throw error;
};

// 🔄 FUNÇÕES DE REALTIME
export const subscribeToMessages = (userId, callback) => {
    if (!supabase) return { unsubscribe: () => {} };
    
    return supabase
        .channel('messages')
        .on('postgres_changes', 
            { 
                event: 'INSERT', 
                schema: 'public', 
                table: 'messages',
                filter: `receiver_id=eq.${userId}`
            }, 
            callback
        )
        .subscribe();
};

export const subscribeToPosts = (callback) => {
    if (!supabase) return { unsubscribe: () => {} };
    
    return supabase
        .channel('posts')
        .on('postgres_changes', 
            { 
                event: '*', 
                schema: 'public', 
                table: 'posts'
            }, 
            callback
        )
        .subscribe();
};

// 🧪 FUNÇÃO DE TESTE
export const testSupabaseConnection = async () => {
    try {
        if (!supabase) {
            return { success: false, message: 'Cliente Supabase não disponível' };
        }
        
        // Testar conexão básica
        const { data, error } = await supabase
            .from('profiles')
            .select('count')
            .limit(1);
        
        if (error) {
            return { success: false, message: error.message };
        }
        
        return { success: true, message: 'Conexão OK' };
        
    } catch (error) {
        return { success: false, message: error.message };
    }
};

// Exportar padrão
export default supabase;
