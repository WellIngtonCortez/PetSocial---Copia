// 📝 TIPOS TYPESCRIPT - PET SOCIAL
// Definições de tipos para registro e autenticação

// ==========================================
// TIPOS DE USUÁRIO E AUTENTICAÇÃO
// ==========================================

export interface User {
    id: string;
    email: string;
    email_confirmed_at?: string;
    phone?: string;
    phone_confirmed_at?: string;
    last_sign_in_at?: string;
    created_at: string;
    updated_at: string;
    user_metadata: UserMetadata;
    app_metadata: AppMetadata;
}

export interface UserMetadata {
    username?: string;
    full_name?: string;
    avatar_url?: string;
    biography?: string;
    [key: string]: any;
}

export interface AppMetadata {
    provider?: string;
    providers?: string[];
    [key: string]: any;
}

// ==========================================
// TIPOS DE PERFIL
// ==========================================

export interface Profile {
    id: string;
    username: string;
    full_name: string;
    avatar_url?: string;
    biography?: string;
    created_at: string;
    updated_at: string;
}

export interface ProfileUpdate {
    username?: string;
    full_name?: string;
    avatar_url?: string;
    biography?: string;
}

// ==========================================
// TIPOS DE REGISTRO (SIGN UP)
// ==========================================

export interface SignUpData {
    email: string;
    password: string;
    username: string;
    full_name: string;
    biography?: string;
    avatar_url?: string;
}

export interface SignUpResponse {
    user: User | null;
    session: Session | null;
    error?: SignUpError;
}

export interface SignUpError {
    message: string;
    code?: string;
    status?: number;
}

// ==========================================
// TIPOS DE SESSÃO
// ==========================================

export interface Session {
    access_token: string;
    refresh_token: string;
    expires_in: number;
    token_type: string;
    user: User;
}

// ==========================================
// TIPOS DE VALIDAÇÃO
// ==========================================

export interface ValidationErrors {
    email?: string;
    password?: string;
    username?: string;
    full_name?: string;
    biography?: string;
    avatar_url?: string;
    general?: string;
}

export interface ValidationResult {
    isValid: boolean;
    errors: ValidationErrors;
}

// ==========================================
// TIPOS DE FORMULÁRIO
// ==========================================

export interface SignUpFormData {
    email: string;
    password: string;
    confirmPassword: string;
    username: string;
    full_name: string;
    biography?: string;
    avatar_url?: string;
}

export interface FormState {
    data: SignUpFormData;
    errors: ValidationErrors;
    isLoading: boolean;
    isSubmitted: boolean;
    isValid: boolean;
}

// ==========================================
// TIPOS DE API RESPONSE
// ==========================================

export interface ApiResponse<T = any> {
    data?: T;
    error?: {
        message: string;
        code?: string;
        details?: any;
    };
    status: number;
}

export interface ProfileResponse extends ApiResponse<Profile> {}

// ==========================================
// TIPOS DE UPLOAD
// ==========================================

export interface UploadOptions {
    bucket: string;
    path?: string;
    upsert?: boolean;
    cacheControl?: string;
    contentType?: string;
}

export interface UploadResult {
    path: string;
    publicUrl: string;
    error?: string;
}

// ==========================================
// TIPOS DE UI COMPONENTS
// ==========================================

export interface ButtonProps {
    type?: 'button' | 'submit' | 'reset';
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    disabled?: boolean;
    loading?: boolean;
    children: React.ReactNode;
    onClick?: () => void;
    className?: string;
}

export interface InputProps {
    type?: string;
    name: string;
    label?: string;
    placeholder?: string;
    value?: string;
    error?: string;
    disabled?: boolean;
    required?: boolean;
    onChange?: (value: string) => void;
    onBlur?: () => void;
    className?: string;
}

export interface FormFieldProps extends InputProps {
    helperText?: string;
}

// ==========================================
// TIPOS DE CONTEXT
// ==========================================

export interface AuthContextType {
    user: User | null;
    profile: Profile | null;
    session: Session | null;
    isLoading: boolean;
    signUp: (data: SignUpData) => Promise<SignUpResponse>;
    signIn: (email: string, password: string) => Promise<SignUpResponse>;
    signOut: () => Promise<void>;
    updateProfile: (data: ProfileUpdate) => Promise<ProfileResponse>;
    uploadAvatar: (file: File) => Promise<UploadResult>;
    refreshProfile: () => Promise<void>;
}

// ==========================================
// TIPOS DE CONFIGURAÇÃO
// ==========================================

export interface SupabaseConfig {
    url: string;
    anonKey: string;
    options?: {
        auth?: {
            autoRefreshToken?: boolean;
            persistSession?: boolean;
            detectSessionInUrl?: boolean;
        };
    };
}

export interface AppConfig {
    supabase: SupabaseConfig;
    features: {
        emailConfirmation: boolean;
        phoneVerification: boolean;
        socialAuth: boolean;
        avatarUpload: boolean;
    };
    validation: {
        passwordMinLength: number;
        usernameMinLength: number;
        usernameMaxLength: number;
        biographyMaxLength: number;
        allowedImageTypes: string[];
        maxImageSize: number;
    };
}

// ==========================================
// TIPOS DE EVENTOS
// ==========================================

export interface AuthEvent {
    type: 'SIGNED_IN' | 'SIGNED_OUT' | 'TOKEN_REFRESHED' | 'USER_UPDATED';
    session?: Session | null;
    user?: User | null;
}

export interface ProfileEvent {
    type: 'PROFILE_CREATED' | 'PROFILE_UPDATED' | 'PROFILE_DELETED';
    profile?: Profile;
    error?: string;
}

// ==========================================
// TIPOS DE UTILITÁRIOS
// ==========================================

export type AsyncFunction<T = void> = () => Promise<T>;
export type EventHandler<T = any> = (event: T) => void;
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

// ==========================================
// TIPOS DE ESTADO GLOBAL
// ==========================================

export interface AppState {
    auth: {
        user: User | null;
        profile: Profile | null;
        session: Session | null;
        isLoading: boolean;
        error: string | null;
    };
    ui: {
        theme: 'light' | 'dark';
        sidebarOpen: boolean;
        notifications: Notification[];
    };
}

export interface Notification {
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    title: string;
    message: string;
    duration?: number;
    timestamp: string;
}

// Exportações padrão
export type {
    // Re-exportar tipos comuns
    User as AuthUser,
    Profile as UserProfile,
    Session as AuthSession,
    SignUpData as RegistrationData,
    ValidationErrors as FormErrors,
};
