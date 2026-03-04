// 🎨 COMPONENTE DE FORMULÁRIO DE CADASTRO - PET SOCIAL
// Formulário moderno, responsivo e tipado com validação robusta

import React, { useState, useCallback, useRef } from 'react';
import type { 
    SignUpFormData, 
    FormState, 
    ValidationErrors, 
    SignUpResponse,
    ButtonProps,
    InputProps 
} from '../types/auth';
import { getSupabase } from '../lib/supabase';

// ==========================================
// COMPONENTES UI ATÔMICOS
// ==========================================

const Button: React.FC<ButtonProps> = ({
    type = 'button',
    variant = 'primary',
    size = 'md',
    disabled = false,
    loading = false,
    children,
    onClick,
    className = ''
}) => {
    const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2';
    
    const variantClasses = {
        primary: 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 focus:ring-blue-500',
        secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500',
        outline: 'border-2 border-blue-500 text-blue-500 hover:bg-blue-50 focus:ring-blue-500',
        ghost: 'text-gray-600 hover:bg-gray-100 focus:ring-gray-500'
    };
    
    const sizeClasses = {
        sm: 'px-3 py-1.5 text-sm',
        md: 'px-4 py-2 text-base',
        lg: 'px-6 py-3 text-lg'
    };
    
    const disabledClasses = disabled || loading ? 'opacity-50 cursor-not-allowed' : '';
    
    const classes = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${disabledClasses} ${className}`;

    return (
        <button
            type={type}
            className={classes}
            disabled={disabled || loading}
            onClick={onClick}
        >
            {loading && (
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
            )}
            {children}
        </button>
    );
};

const Input: React.FC<InputProps> = ({
    type = 'text',
    name,
    label,
    placeholder,
    value = '',
    error,
    disabled = false,
    required = false,
    onChange,
    onBlur,
    className = ''
}) => {
    const baseClasses = 'w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors';
    const errorClasses = error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300';
    const disabledClasses = disabled ? 'bg-gray-100 cursor-not-allowed' : '';
    
    const classes = `${baseClasses} ${errorClasses} ${disabledClasses} ${className}`;

    return (
        <div className="space-y-1">
            {label && (
                <label htmlFor={name} className="block text-sm font-medium text-gray-700">
                    {label}
                    {required && <span className="text-red-500 ml-1">*</span>}
                </label>
            )}
            <input
                type={type}
                id={name}
                name={name}
                placeholder={placeholder}
                value={value}
                disabled={disabled}
                required={required}
                className={classes}
                onChange={(e) => onChange?.(e.target.value)}
                onBlur={onBlur}
            />
            {error && (
                <p className="text-sm text-red-600 flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {error}
                </p>
            )}
        </div>
    );
};

// ==========================================
// COMPONENTE PRINCIPAL
// ==========================================

const SignUpForm: React.FC = () => {
    const supabase = getSupabase();
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Estado do formulário
    const [formState, setFormState] = useState<FormState>({
        data: {
            email: '',
            password: '',
            confirmPassword: '',
            username: '',
            full_name: '',
            biography: '',
            avatar_url: ''
        },
        errors: {},
        isLoading: false,
        isSubmitted: false,
        isValid: false
    });

    // Estado de upload
    const [uploadProgress, setUploadProgress] = useState(0);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

    // Estado de sucesso
    const [showSuccess, setShowSuccess] = useState(false);
    const [emailSent, setEmailSent] = useState('');

    // ==========================================
    // VALIDAÇÃO
    // ==========================================

    const validateField = useCallback((name: keyof SignUpFormData, value: string): string | null => {
        const validators: Record<keyof SignUpFormData, (value: string) => string | null> = {
            email: (value) => {
                if (!value.trim()) return 'Email é obrigatório';
                if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Email inválido';
                return null;
            },
            password: (value) => {
                if (!value) return 'Senha é obrigatória';
                if (value.length < 6) return 'Senha deve ter pelo menos 6 caracteres';
                if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(value)) {
                    return 'Senha deve conter letra maiúscula, minúscula e número';
                }
                return null;
            },
            confirmPassword: (value) => {
                if (!value) return 'Confirme sua senha';
                if (value !== formState.data.password) return 'As senhas não coincidem';
                return null;
            },
            username: (value) => {
                if (!value.trim()) return 'Nome de usuário é obrigatório';
                if (value.length < 3) return 'Nome de usuário deve ter pelo menos 3 caracteres';
                if (value.length > 30) return 'Nome de usuário deve ter no máximo 30 caracteres';
                if (!/^[a-zA-Z0-9_]+$/.test(value)) return 'Use apenas letras, números e _';
                return null;
            },
            full_name: (value) => {
                if (!value.trim()) return 'Nome completo é obrigatório';
                if (value.length < 2) return 'Nome deve ter pelo menos 2 caracteres';
                return null;
            },
            biography: (value) => {
                if (value && value.length > 500) return 'Biografia deve ter no máximo 500 caracteres';
                return null;
            },
            avatar_url: () => null // Avatar é opcional e validado separadamente
        };

        return validators[name](value);
    }, [formState.data.password]);

    const validateForm = useCallback((): boolean => {
        const errors: ValidationErrors = {};
        let isValid = true;

        // Validar todos os campos
        Object.keys(formState.data).forEach((key) => {
            const fieldName = key as keyof SignUpFormData;
            const error = validateField(fieldName, formState.data[fieldName]);
            if (error) {
                errors[fieldName] = error;
                isValid = false;
            }
        });

        setFormState(prev => ({
            ...prev,
            errors,
            isValid
        }));

        return isValid;
    }, [formState.data, validateField]);

    // ==========================================
    // HANDLERS
    // ==========================================

    const handleInputChange = useCallback((name: keyof SignUpFormData, value: string) => {
        setFormState(prev => ({
            ...prev,
            data: {
                ...prev.data,
                [name]: value
            },
            errors: {
                ...prev.errors,
                [name]: undefined
            }
        }));

        // Validar campo em tempo real
        const error = validateField(name, value);
        if (error) {
            setFormState(prev => ({
                ...prev,
                errors: {
                    ...prev.errors,
                    [name]: error
                }
            }));
        }
    }, [validateField]);

    const handleAvatarUpload = useCallback(async (file: File) => {
        if (!file) return;

        // Validar arquivo
        if (!file.type.startsWith('image/')) {
            setFormState(prev => ({
                ...prev,
                errors: { ...prev.errors, avatar_url: 'Selecione uma imagem válida' }
            }));
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            setFormState(prev => ({
                ...prev,
                errors: { ...prev.errors, avatar_url: 'Imagem deve ter no máximo 5MB' }
            }));
            return;
        }

        // Preview
        const reader = new FileReader();
        reader.onload = (e) => {
            setAvatarPreview(e.target?.result as string);
        };
        reader.readAsDataURL(file);

        // Upload (será feito no submit)
        setFormState(prev => ({
            ...prev,
            data: {
                ...prev.data,
                avatar_url: file.name
            },
            errors: {
                ...prev.errors,
                avatar_url: undefined
            }
        }));
    }, []);

    const handleSubmit = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            setFormState(prev => ({ ...prev, isSubmitted: true }));
            return;
        }

        setFormState(prev => ({ ...prev, isLoading: true }));

        try {
            // Upload do avatar se houver
            let avatarUrl = '';
            if (avatarPreview && fileInputRef.current?.files?.[0]) {
                const mockUser = { id: 'temp-' + Date.now() };
                const uploadResult = await supabase.uploadAvatar(mockUser.id, fileInputRef.current.files[0]);
                
                if (uploadResult.error) {
                    setFormState(prev => ({
                        ...prev,
                        isLoading: false,
                        errors: { avatar_url: uploadResult.error }
                    }));
                    return;
                }
                
                avatarUrl = uploadResult.publicUrl;
            }

            // Registrar usuário
            const signUpData = {
                email: formState.data.email,
                password: formState.data.password,
                username: formState.data.username,
                full_name: formState.data.full_name,
                biography: formState.data.biography,
                avatar_url: avatarUrl || undefined
            };

            const result = await supabase.signUp(signUpData);

            if (result.error) {
                setFormState(prev => ({
                    ...prev,
                    isLoading: false,
                    errors: { general: result.error.message }
                }));
                return;
            }

            // Sucesso
            setEmailSent(formState.data.email);
            setShowSuccess(true);

        } catch (error) {
            console.error('Erro no registro:', error);
            setFormState(prev => ({
                ...prev,
                isLoading: false,
                errors: { general: 'Erro interno ao registrar usuário' }
            }));
        }
    }, [formState.data, validateForm, avatarPreview, supabase]);

    // ==========================================
    // RENDER
    // ==========================================

    if (showSuccess) {
        return <SuccessMessage email={emailSent} />;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="flex justify-center mb-4">
                        <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                            <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
                            </svg>
                        </div>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">
                        Junte-se ao PetSocial 🐾
                    </h1>
                    <p className="text-gray-600">
                        Crie sua conta e conecte-se com outros amantes de pets
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Avatar Upload */}
                    <div className="flex justify-center">
                        <div className="relative">
                            <div
                                className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center cursor-pointer hover:bg-gray-300 transition-colors"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                {avatarPreview ? (
                                    <img
                                        src={avatarPreview}
                                        alt="Avatar"
                                        className="w-full h-full rounded-full object-cover"
                                    />
                                ) : (
                                    <svg className="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                    </svg>
                                )}
                            </div>
                            <button
                                type="button"
                                className="absolute bottom-0 right-0 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs hover:bg-blue-600"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                                </svg>
                            </button>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => e.target.files?.[0] && handleAvatarUpload(e.target.files[0])}
                            />
                        </div>
                    </div>

                    {/* Campos do formulário */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                            name="full_name"
                            label="Nome Completo"
                            placeholder="Seu nome completo"
                            value={formState.data.full_name}
                            error={formState.isSubmitted && formState.errors.full_name}
                            onChange={(value) => handleInputChange('full_name', value)}
                            required
                        />
                        
                        <Input
                            name="username"
                            label="Nome de Usuário"
                            placeholder="@usuario"
                            value={formState.data.username}
                            error={formState.isSubmitted && formState.errors.username}
                            onChange={(value) => handleInputChange('username', value)}
                            required
                        />
                    </div>

                    <Input
                        name="email"
                        type="email"
                        label="Email"
                        placeholder="seu@email.com"
                        value={formState.data.email}
                        error={formState.isSubmitted && formState.errors.email}
                        onChange={(value) => handleInputChange('email', value)}
                        required
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                            name="password"
                            type="password"
                            label="Senha"
                            placeholder="••••••••"
                            value={formState.data.password}
                            error={formState.isSubmitted && formState.errors.password}
                            onChange={(value) => handleInputChange('password', value)}
                            required
                        />
                        
                        <Input
                            name="confirmPassword"
                            type="password"
                            label="Confirmar Senha"
                            placeholder="••••••••"
                            value={formState.data.confirmPassword}
                            error={formState.isSubmitted && formState.errors.confirmPassword}
                            onChange={(value) => handleInputChange('confirmPassword', value)}
                            required
                        />
                    </div>

                    <div>
                        <label htmlFor="biography" className="block text-sm font-medium text-gray-700 mb-1">
                            Biografia (opcional)
                        </label>
                        <textarea
                            id="biography"
                            name="biography"
                            rows={3}
                            placeholder="Conte um pouco sobre você e seus pets..."
                            value={formState.data.biography}
                            onChange={(e) => handleInputChange('biography', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                            maxLength={500}
                        />
                        <div className="text-xs text-gray-500 mt-1">
                            {formState.data.biography.length}/500 caracteres
                        </div>
                    </div>

                    {/* Erro geral */}
                    {formState.errors.general && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                            <div className="flex items-center">
                                <svg className="w-5 h-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                                <span className="text-red-800">{formState.errors.general}</span>
                            </div>
                        </div>
                    )}

                    {/* Submit */}
                    <Button
                        type="submit"
                        variant="primary"
                        size="lg"
                        loading={formState.isLoading}
                        disabled={formState.isLoading}
                        className="w-full"
                    >
                        {formState.isLoading ? 'Criando conta...' : 'Criar Conta'}
                    </Button>

                    {/* Links */}
                    <div className="text-center text-sm text-gray-600">
                        Já tem uma conta?{' '}
                        <a href="/login" className="text-blue-600 hover:text-blue-500 font-medium">
                            Faça login
                        </a>
                    </div>
                </form>
            </div>
        </div>
    );
};

// ==========================================
// COMPONENTE DE SUCESSO
// ==========================================

const SuccessMessage: React.FC<{ email: string }> = ({ email }) => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
                <div className="flex justify-center mb-6">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                        <svg className="w-8 h-8 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                    </div>
                </div>

                <h1 className="text-2xl font-bold text-gray-900 mb-4">
                    Conta Criada com Sucesso! 🎉
                </h1>

                <div className="space-y-4 mb-8">
                    <p className="text-gray-600">
                        Enviamos um email de confirmação para:
                    </p>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <p className="text-blue-900 font-medium">{email}</p>
                    </div>
                    <p className="text-gray-600 text-sm">
                        Clique no link de confirmação no email para ativar sua conta.
                    </p>
                    <p className="text-gray-500 text-sm">
                        Não recebeu? Verifique sua pasta de spam.
                    </p>
                </div>

                <div className="space-y-3">
                    <a
                        href="/login"
                        className="block w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white text-center py-3 rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 transition-colors"
                    >
                        Ir para Login
                    </a>
                    <button
                        onClick={() => window.location.reload()}
                        className="block w-full text-gray-600 text-center py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                    >
                        Criar outra conta
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SignUpForm;
