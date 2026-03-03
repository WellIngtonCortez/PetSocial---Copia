# 🚨 GUIDE: Ativar Leaked Password Protection no Supabase

## 📍 Passo a Passo Detalhado

### 1️⃣ Acessar o Dashboard
1. Faça login em [supabase.com](https://supabase.com)
2. Selecione seu projeto: **ftlgfaraeflseuafznnh**
3. Clique em **"Go to Dashboard"**

### 2️⃣ Navegar até Authentication
1. No menu lateral esquerdo, clique em **"Authentication"**
2. Ícone: 🔑 (chave/cadeado)
3. Aguarde carregar a página de configurações

### 3️⃣ Configurar Password Protection
1. Na seção **Authentication**, procure por **"Settings"** (ícone ⚙️)
2. Role para baixo até encontrar **"Password Protection"**
3. Você verá estas opções:

   ✅ **Enable Leaked Password Protection**
   - **Status**: Atualmente ❌ DESATIVADO
   - **Action**: Clique no toggle para ativar ✅

   ✅ **Block sign-ups with breached passwords**  
   - **Status**: Atualmente ❌ DESATIVADO
   - **Action**: Clique no toggle para ativar ✅

### 4️⃣ Configurações Adicionais Recomendadas
Na mesma página, configure:

#### 🔐 **Rate Limiting**
- **Max sign-in attempts**: `5`
- **Time window**: `15 minutes`
- **Action**: Clique em **"Save"**

#### 📧 **Email Confirmation**
- **Enable email confirmations**: ✅ ATIVAR
- **Action**: Clique no toggle e depois **"Save"**

#### ⏰ **Session Timeout**
- **Session timeout**: `1 hour` (3600 segundos)
- **Action**: Configure e clique **"Save"**

### 5️⃣ Verificação Final
Após configurar, você deve ver:
- ✅ Leaked Password Protection: **Enabled**
- ✅ Block breached passwords: **Enabled**
- ✅ Rate limiting: **Configured**
- ✅ Email confirmation: **Enabled**

### 6️⃣ Testar a Configuração
1. Tente criar um novo usuário com senha "123456" (senha comum vazada)
2. O sistema deve bloquear o cadastro
3. Tente fazer login com senha fraca - deve ser bloqueado

## 🚨 IMPORTANTE

### ⚠️ **CREDENCIAIS EXPOSTAS**
Seu arquivo `supabaseConfig.js` contém chaves REAIS:
- **URL**: `https://ftlgfaraeflseuafznnh.supabase.co`
- **ANON_KEY**: Chave longa exposta no código

### 🔄 **AÇÃO IMEDIATA NECESSÁRIA**
1. **Revogar chaves atuais**:
   - Dashboard → Settings → API
   - Clique em **"Regenerate"** na ANON KEY

2. **Configurar variáveis de ambiente**:
   ```bash
   # .env.local
   VITE_SUPABASE_URL=https://NOVA-URL.supabase.co
   VITE_SUPABASE_ANON_KEY=NOVA-CHAVE
   ```

3. **Atualizar código para usar variáveis**:
   ```javascript
   const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
   const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
   ```

## ✅ **Checklist de Segurança Pós-Configuração**

- [ ] Leaked Password Protection ativada
- [ ] Rate limiting configurado (5/15min)
- [ ] Email confirmation ativada
- [ ] Chaves antigas revogadas
- [ ] Novas chaves em variáveis de ambiente
- [ ] RLS habilitado em todas tabelas
- [ ] Storage policies configuradas
- [ ] Logs de acesso monitorados

## 🆘 **Ajuda Adicional**

Se precisar de ajuda:
- **Documentação**: [Supabase Auth](https://supabase.com/docs/guides/auth)
- **Suporte**: Dashboard → Help → Contact Support
- **Comunidade**: [GitHub Discussions](https://github.com/supabase/supabase/discussions)

---

**⏰ Execute estas configurações IMEDIATAMENTE para proteger sua aplicação!**
