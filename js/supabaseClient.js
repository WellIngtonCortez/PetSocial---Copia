// Configuração do Supabase
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

// Substitua com suas credenciais do Supabase
const SUPABASE_URL = 'https://SEU-PROJETO.supabase.co';
const SUPABASE_ANON_KEY = 'SUA-ANON-KEY';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Configuração do Storage
export const STORAGE_BUCKET = 'pet-social-media';

// Funções utilitárias
export const uploadImage = async (file, bucket = STORAGE_BUCKET) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `${bucket}/${fileName}`;
    
    const { data, error } = await supabase.storage
        .from(bucket)
        .upload(filePath, file);
    
    if (error) throw error;
    
    const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);
    
    return publicUrl;
};

export const deleteImage = async (url, bucket = STORAGE_BUCKET) => {
    const filePath = url.split(`/${bucket}/`)[1];
    const { error } = await supabase.storage
        .from(bucket)
        .remove([filePath]);
    
    if (error) throw error;
};

// Funções de autenticação
export const signUp = async (email, password, userData) => {
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: userData
        }
    });
    
    if (error) throw error;
    return data;
};

export const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
    });
    
    if (error) throw error;
    return data;
};

export const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
};

export const getCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
};

// Funções do banco de dados
export const createProfile = async (profileData) => {
    const { data, error } = await supabase
        .from('profiles')
        .insert([profileData])
        .select();
    
    if (error) throw error;
    return data[0];
};

export const getProfile = async (userId) => {
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
    
    if (error) throw error;
    return data;
};

export const updateProfile = async (userId, updates) => {
    const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId)
        .select();
    
    if (error) throw error;
    return data[0];
};

// Funções de Posts
export const createPost = async (postData) => {
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
};

// Funções de Pets
export const createPet = async (petData) => {
    const { data, error } = await supabase
        .from('pets')
        .insert([petData])
        .select();
    
    if (error) throw error;
    return data[0];
};

export const getPets = async (userId) => {
    const { data, error } = await supabase
        .from('pets')
        .select('*')
        .eq('owner_id', userId)
        .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
};

export const updatePet = async (petId, updates) => {
    const { data, error } = await supabase
        .from('pets')
        .update(updates)
        .eq('id', petId)
        .select();
    
    if (error) throw error;
    return data[0];
};

export const deletePet = async (petId) => {
    const { error } = await supabase
        .from('pets')
        .delete()
        .eq('id', petId);
    
    if (error) throw error;
};

// Funções de Comentários
export const createComment = async (commentData) => {
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

// Funções de Mensagens (Chat)
export const sendMessage = async (messageData) => {
    const { data, error } = await supabase
        .from('messages')
        .insert([messageData])
        .select();
    
    if (error) throw error;
    return data[0];
};

export const getMessages = async (userId1, userId2) => {
    const { data, error } = await supabase
        .from('messages')
        .select('*')
        .or(`(sender_id.eq.${userId1},receiver_id.eq.${userId2}),(sender_id.eq.${userId2},receiver_id.eq.${userId1})`)
        .order('created_at', { ascending: true });
    
    if (error) throw error;
    return data;
};

// Configuração de Realtime
export const subscribeToMessages = (userId, callback) => {
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

export const subscribeToLikes = (postId, callback) => {
    return supabase
        .channel(`likes_${postId}`)
        .on('postgres_changes', 
            { 
                event: '*', 
                schema: 'public', 
                table: 'likes',
                filter: `post_id=eq.${postId}`
            }, 
            callback
        )
        .subscribe();
};
