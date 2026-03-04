// 🔧 SUPABASE CLIENT - CONFIGURAÇÃO TIPOADA E SEGURA
// Cliente Supabase com TypeScript e tratamento de erros robusto

import { createClient, SupabaseClient, Session, User } from '@supabase/supabase-js';
import type { 
    User as AuthUser, 
    Profile, 
    SignUpData, 
    SignUpResponse, 
    ProfileResponse,
    UploadResult,
    SupabaseConfig,
    ValidationErrors
} from '../types/auth';

// ==========================================
// CONFIGURAÇÃO DO CLIENTE
// ==========================================

class SupabaseService {
    private client: SupabaseClient;
    private config: SupabaseConfig;

    constructor() {
        this.config = this.getConfig();
        this.client = this.createClient();
        this.setupAuthListeners();
    }

    private getConfig(): SupabaseConfig {
        const url = this.getEnvVar('VITE_SUPABASE_URL');
        const anonKey = this.getEnvVar('VITE_SUPABASE_ANON_KEY');

        if (!url || !anonKey) {
            throw new Error('❌ Variáveis de ambiente do Supabase não configuradas');
        }

        return {
            url,
            anonKey,
            options: {
                auth: {
                    autoRefreshToken: true,
                    persistSession: true,
                    detectSessionInUrl: true
                }
            }
        };
    }

    private getEnvVar(key: string): string {
        // Vite/Next.js environment variables
        if (typeof import.meta !== 'undefined' && import.meta.env) {
            return import.meta.env[key] || '';
        }
        
        // Fallback para desenvolvimento
        if (typeof window !== 'undefined' && (window as any).__SUPABASE_CONFIG__) {
            return (window as any).__SUPABASE_CONFIG__[key] || '';
        }

        // Configuração local (desenvolvimento)
        const localConfig = {
            'VITE_SUPABASE_URL': 'https://ftlgfaraeflseuafznnh.supabase.co',
            'VITE_SUPABASE_ANON_KEY': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ0bGdmYXJhZWZsc2V1YWZ6bm5oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAxNzEzNjMsImV4cCI6MjA4NTc0NzM2M30.fVjkybYuOMHDUUHI2_913tJDyMJ4tPUVMuFXJoQuMvs'
        };

        return localConfig[key as keyof typeof localConfig] || '';
    }

    private createClient(): SupabaseClient {
        try {
            return createClient(this.config.url, this.config.anonKey, this.config.options);
        } catch (error) {
            console.error('❌ Erro ao criar cliente Supabase:', error);
            throw new Error('Falha na inicialização do Supabase');
        }
    }

    private setupAuthListeners(): void {
        this.client.auth.onAuthStateChange((event, session) => {
            console.log(`🔐 Auth event: ${event}`, session);
            
            // Disparar eventos customizados se necessário
            if (typeof window !== 'undefined') {
                window.dispatchEvent(new CustomEvent('supabase:auth', {
                    detail: { event, session }
                }));
            }
        });
    }

    // ==========================================
    // MÉTODOS DE AUTENTICAÇÃO
    // ==========================================

    async signUp(data: SignUpData): Promise<SignUpResponse> {
        try {
            const { email, password, username, full_name, biography, avatar_url } = data;

            // Validar dados antes do envio
            const validation = this.validateSignUpData(data);
            if (!validation.isValid) {
                return {
                    user: null,
                    session: null,
                    error: {
                        message: 'Dados inválidos',
                        code: 'VALIDATION_ERROR',
                        status: 400
                    }
                };
            }

            // Preparar metadata
            const metadata = {
                username: username.trim(),
                full_name: full_name.trim(),
                biography: biography?.trim(),
                avatar_url
            };

            console.log('📝 Enviando registro:', { email, username: metadata.username });

            const { data: authData, error } = await this.client.auth.signUp({
                email: email.trim(),
                password,
                options: {
                    data: metadata
                }
            });

            if (error) {
                console.error('❌ Erro no registro:', error);
                return {
                    user: null,
                    session: null,
                    error: {
                        message: this.formatErrorMessage(error),
                        code: error.code || 'SIGNUP_ERROR',
                        status: error.status || 400
                    }
                };
            }

            console.log('✅ Registro realizado:', authData);

            return {
                user: authData.user,
                session: authData.session
            };

        } catch (error) {
            console.error('❌ Erro inesperado no signUp:', error);
            return {
                user: null,
                session: null,
                error: {
                    message: 'Erro interno ao registrar usuário',
                    code: 'INTERNAL_ERROR',
                    status: 500
                }
            };
        }
    }

    async signIn(email: string, password: string): Promise<SignUpResponse> {
        try {
            const { data, error } = await this.client.auth.signInWithPassword({
                email: email.trim(),
                password
            });

            if (error) {
                return {
                    user: null,
                    session: null,
                    error: {
                        message: this.formatErrorMessage(error),
                        code: error.code || 'SIGNIN_ERROR',
                        status: error.status || 400
                    }
                };
            }

            return {
                user: data.user,
                session: data.session
            };

        } catch (error) {
            console.error('❌ Erro inesperado no signIn:', error);
            return {
                user: null,
                session: null,
                error: {
                    message: 'Erro interno ao fazer login',
                    code: 'INTERNAL_ERROR',
                    status: 500
                }
            };
        }
    }

    async signOut(): Promise<void> {
        try {
            const { error } = await this.client.auth.signOut();
            
            if (error) {
                console.error('❌ Erro ao fazer logout:', error);
                throw error;
            }

            console.log('✅ Logout realizado com sucesso');

        } catch (error) {
            console.error('❌ Erro inesperado no signOut:', error);
            throw error;
        }
    }

    async getCurrentUser(): Promise<User | null> {
        try {
            const { data: { user }, error } = await this.client.auth.getUser();

            if (error) {
                console.error('❌ Erro ao obter usuário atual:', error);
                return null;
            }

            return user;

        } catch (error) {
            console.error('❌ Erro inesperado ao obter usuário:', error);
            return null;
        }
    }

    async getCurrentSession(): Promise<Session | null> {
        try {
            const { data: { session }, error } = await this.client.auth.getSession();

            if (error) {
                console.error('❌ Erro ao obter sessão atual:', error);
                return null;
            }

            return session;

        } catch (error) {
            console.error('❌ Erro inesperado ao obter sessão:', error);
            return null;
        }
    }

    // ==========================================
    // MÉTODOS DE PERFIL
    // ==========================================

    async getProfile(userId: string): Promise<ProfileResponse> {
        try {
            const { data, error } = await this.client
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single();

            if (error) {
                return {
                    error: {
                        message: this.formatErrorMessage(error),
                        code: error.code || 'PROFILE_ERROR',
                        details: error.details
                    },
                    status: error.status || 400
                };
            }

            return { data };

        } catch (error) {
            console.error('❌ Erro inesperado ao obter perfil:', error);
            return {
                error: {
                    message: 'Erro interno ao obter perfil',
                    code: 'INTERNAL_ERROR',
                    status: 500
                },
                status: 500
            };
        }
    }

    async updateProfile(userId: string, updates: Partial<Profile>): Promise<ProfileResponse> {
        try {
            const { data, error } = await this.client
                .from('profiles')
                .update(updates)
                .eq('id', userId)
                .select()
                .single();

            if (error) {
                return {
                    error: {
                        message: this.formatErrorMessage(error),
                        code: error.code || 'UPDATE_ERROR',
                        details: error.details
                    },
                    status: error.status || 400
                };
            }

            return { data };

        } catch (error) {
            console.error('❌ Erro inesperado ao atualizar perfil:', error);
            return {
                error: {
                    message: 'Erro interno ao atualizar perfil',
                    code: 'INTERNAL_ERROR',
                    status: 500
                },
                status: 500
            };
        }
    }

    // ==========================================
    // MÉTODOS DE UPLOAD
    // ==========================================

    async uploadAvatar(userId: string, file: File): Promise<UploadResult> {
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${userId}/avatar.${fileExt}`;
            const filePath = `avatars/${fileName}`;

            // Validar arquivo
            if (!this.validateImageFile(file)) {
                return {
                    path: '',
                    publicUrl: '',
                    error: 'Arquivo inválido. Use JPG, PNG ou GIF até 5MB.'
                };
            }

            const { data, error } = await this.client.storage
                .from('avatars')
                .upload(filePath, file, {
                    upsert: true,
                    contentType: file.type
                });

            if (error) {
                console.error('❌ Erro no upload:', error);
                return {
                    path: '',
                    publicUrl: '',
                    error: this.formatErrorMessage(error)
                };
            }

            const { data: { publicUrl } } = this.client.storage
                .from('avatars')
                .getPublicUrl(filePath);

            return {
                path: data.path,
                publicUrl
            };

        } catch (error) {
            console.error('❌ Erro inesperado no upload:', error);
            return {
                path: '',
                publicUrl: '',
                error: 'Erro interno ao fazer upload'
            };
        }
    }

    // ==========================================
    // MÉTODOS DE VALIDAÇÃO
    // ==========================================

    private validateSignUpData(data: SignUpData): { isValid: boolean; errors: ValidationErrors } {
        const errors: ValidationErrors = {};

        // Email
        if (!data.email?.trim()) {
            errors.email = 'Email é obrigatório';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
            errors.email = 'Email inválido';
        }

        // Senha
        if (!data.password) {
            errors.password = 'Senha é obrigatória';
        } else if (data.password.length < 6) {
            errors.password = 'Senha deve ter pelo menos 6 caracteres';
        }

        // Username
        if (!data.username?.trim()) {
            errors.username = 'Nome de usuário é obrigatório';
        } else if (data.username.length < 3) {
            errors.username = 'Nome de usuário deve ter pelo menos 3 caracteres';
        } else if (data.username.length > 30) {
            errors.username = 'Nome de usuário deve ter no máximo 30 caracteres';
        } else if (!/^[a-zA-Z0-9_]+$/.test(data.username)) {
            errors.username = 'Nome de usuário deve conter apenas letras, números e _';
        }

        // Full Name
        if (!data.full_name?.trim()) {
            errors.full_name = 'Nome completo é obrigatório';
        } else if (data.full_name.length < 2) {
            errors.full_name = 'Nome deve ter pelo menos 2 caracteres';
        }

        // Biography (opcional)
        if (data.biography && data.biography.length > 500) {
            errors.biography = 'Biografia deve ter no máximo 500 caracteres';
        }

        return {
            isValid: Object.keys(errors).length === 0,
            errors
        };
    }

    private validateImageFile(file: File): boolean {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        const maxSize = 5 * 1024 * 1024; // 5MB

        return allowedTypes.includes(file.type) && file.size <= maxSize;
    }

    // ==========================================
    // UTILITÁRIOS
    // ==========================================

    private formatErrorMessage(error: any): string {
        const errorMessages: Record<string, string> = {
            'user_already_exists': 'Este email já está cadastrado',
            'weak_password': 'A senha é muito fraca',
            'invalid_email': 'Email inválido',
            'invalid_credentials': 'Email ou senha incorretos',
            'email_not_confirmed': 'Email não confirmado. Verifique sua caixa de entrada',
            'signup_disabled': 'Registro desativado',
            'too_many_requests': 'Muitas tentativas. Tente novamente em alguns minutos',
            'validation_error': 'Dados inválidos',
            'storage_error': 'Erro no upload do arquivo'
        };

        return errorMessages[error.code] || error.message || 'Ocorreu um erro inesperado';
    }

    // ==========================================
    // GETTERS
    // ==========================================

    getClient(): SupabaseClient {
        return this.client;
    }

    getConfig(): SupabaseConfig {
        return this.config;
    }

    // ==========================================
    // MÉTODOS DE TESTE
    // ==========================================

    async testConnection(): Promise<{ success: boolean; message: string }> {
        try {
            const { data, error } = await this.client
                .from('profiles')
                .select('count')
                .limit(1);

            if (error) {
                return {
                    success: false,
                    message: this.formatErrorMessage(error)
                };
            }

            return {
                success: true,
                message: 'Conexão com Supabase estabelecida com sucesso'
            };

        } catch (error) {
            return {
                success: false,
                message: 'Erro ao testar conexão com Supabase'
            };
        }
    }
}

// ==========================================
// INSTÂNCIA GLOBAL
// ==========================================

let supabaseInstance: SupabaseService | null = null;

export function getSupabase(): SupabaseService {
    if (!supabaseInstance) {
        supabaseInstance = new SupabaseService();
    }
    return supabaseInstance;
}

// Exportar cliente bruto se necessário
export { supabaseInstance as supabase };

// Exportar classe para testes
export { SupabaseService };

// Exportações padrão
export default getSupabase;
