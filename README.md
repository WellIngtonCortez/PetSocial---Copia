# 🐾 PetSocial - Rede Social Full-Stack com Supabase

## 📋 Descrição do Projeto

PetSocial é uma rede social completa para amantes de pets, desenvolvida com HTML/CSS/JavaScript frontend e Supabase como backend. O projeto permite que usuários criem perfis, compartilhem fotos e vídeos de seus pets, interajam através de curtidas e comentários, e participem de um sistema de adoção.

## 🚀 Funcionalidades Implementadas

### ✅ Autenticação & Perfis
- **Cadastro Multi-etapas**: Formulário intuitivo com validação em tempo real
- **Login Seguro**: Autenticação via Supabase Auth
- **Perfis Completos**: Foto, bio, localização, estatísticas
- **Gestão de Pets**: Adicionar, editar e remover pets do perfil

### ✅ Rede Social
- **Feed Dinâmico**: Posts em tempo real com mídias
- **Sistema de Curtidas**: Toggle com contador sincronizado
- **Comentários**: Sistema completo de comentários por post
- **Upload de Mídia**: Suporte para imagens e vídeos

### ✅ Comunicação
- **Chat em Tempo Real**: Mensagens instantâneas entre usuários
- **Sistema de Adoção**: Formulário de interesse em adotar pets
- **Notificações**: Sistema de notificações em desenvolvimento

### ✅ Experiência do Usuário
- **Design Responsivo**: Mobile-first approach
- **SPA Navigation**: Navegação instantânea sem reload
- **Loading States**: Feedback visual em todas as operações
- **Error Handling**: Tratamento robusto de erros

## 🛠️ Stack Tecnológico

### Frontend
- **HTML5**: Semântico e acessível
- **CSS3**: Variáveis CSS, Grid, Flexbox, Animations
- **JavaScript ES6+**: Módulos, async/await, APIs modernas
- **FontAwesome 6.0**: Ícones consistentes

### Backend
- **Supabase**: BaaS (Backend as a Service)
  - Autenticação (Auth)
  - Banco de Dados (PostgreSQL)
  - Storage (Arquivos)
  - Realtime (WebSocket)
  - Edge Functions (Serverless)

## 📁 Estrutura do Projeto

```
PetSocial - Copia/
├── 📄 HTML Pages
│   ├── login.html              # Página de login
│   ├── pet-social-signup.html # Cadastro multi-etapas
│   ├── pet-social-network.html # Feed principal (SPA)
│   ├── petsocial-meu-perfil.html # Perfil do usuário
│   └── 404.html               # Página de erro
├── 📁 JavaScript
│   ├── js/
│   │   ├── supabaseClient.js    # Cliente Supabase completo
│   │   └── supabaseConfig.js    # Configurações e validação
├── 📁 Database
│   └── schema.sql              # Schema completo do banco
├── 📁 Assets
│   └── images/               # Imagens do projeto
└── 📄 README.md              # Este arquivo
```

## 🔧 Configuração do Ambiente

### 1️⃣ Criar Projeto Supabase
1. Acesse [supabase.com](https://supabase.com)
2. Crie uma conta gratuita
3. Crie um novo projeto
4. Anote a URL e a ANON KEY

### 2️⃣ Configurar Banco de Dados
1. No painel do projeto, vá em **SQL Editor**
2. Execute o conteúdo do arquivo `database/schema.sql`
3. Verifique se todas as tabelas foram criadas

### 3️⃣ Configurar Storage
1. Vá em **Storage**
2. Crie os buckets:
   - `avatars` (fotos de perfil)
   - `posts` (mídias das postagens)
   - `pets` (fotos dos pets)
3. Configure políticas de acesso público

### 4️⃣ Configurar Aplicação
1. Abra o arquivo `js/supabaseConfig.js`
2. Substitua as credenciais:
   ```javascript
   const SUPABASE_CONFIG = {
       URL: 'https://SEU-PROJETO-ID.supabase.co',
       ANON_KEY: 'SUA-ANON-KEY-AQUI'
   };
   ```

## 🚀 Como Executar

### Desenvolvimento Local
1. Clone o repositório
2. Configure o Supabase conforme instruções acima
3. Abra os arquivos HTML diretamente no navegador
4. Ou use um servidor local:
   ```bash
   # Python 3
   python -m http.server 8000
   
   # Node.js
   npx serve .
   
   # Live Server
   npx live-server
   ```

### Deploy Produção
1. **Vercel** (Recomendado):
   ```bash
   # Instalar Vercel CLI
   npm i -g vercel
   
   # Deploy
   vercel --prod
   ```
2. **Netlify**:
   ```bash
   # Arrastar pasta para netlify.com
   # Ou usar Netlify CLI
   netlify deploy --prod --dir=.
   ```

## 📊 Schema do Banco de Dados

### Tabelas Principais
- **profiles**: Dados dos usuários
- **posts**: Postagens do feed
- **pets**: Informações dos pets
- **likes**: Curtidas nos posts
- **comments**: Comentários por post
- **messages**: Mensagens privadas
- **adoption_requests**: Solicitações de adoção

### Relacionamentos
- `posts` → `profiles` (user_id)
- `pets` → `profiles` (owner_id)
- `likes` → `posts` + `profiles`
- `comments` → `posts` + `profiles`
- `messages` → `profiles` (sender/receiver)

## 🔐 Segurança

### Row Level Security (RLS)
- Todas as tabelas possuem RLS ativado
- Políticas configuradas para acesso seguro
- Usuários só acessam próprios dados

### Validações
- Validação de email e senha no frontend
- Sanitização de dados no backend
- Proteção contra SQL Injection

## 📱 Responsividade

### Breakpoints
- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

### Features Mobile
- Menu hambúrguer
- Formulários otimizados
- Touch-friendly buttons
- Swipe gestures para galeria

## ⚡ Performance

### Otimizações
- **Lazy Loading**: Imagens carregadas sob demanda
- **Code Splitting**: Módulos JavaScript separados
- **Caching**: Storage com cache adequado
- **Minificação**: CSS e JavaScript otimizados

### Métricas
- **First Contentful Paint**: < 1.5s
- **Largest Contentful Paint**: < 2.5s
- **Cumulative Layout Shift**: < 0.1

## 🔄 Fluxo de Usuário

### Cadastro → Login → Feed
1. **Cadastro**: Multi-etapas com validação
2. **Verificação**: Email automático (opcional)
3. **Login**: Redirecionamento automático
4. **Onboarding**: Tour guiado do sistema

### Navegação Principal
1. **Feed**: Posts em timeline infinita
2. **Perfil**: Edição e gestão de pets
3. **Adoção**: Visualização e solicitação
4. **Mensagens**: Chat em tempo real

## 🧪 Testes

### Testes Manuais
- ✅ Fluxo completo de cadastro
- ✅ Login com credenciais válidas/inválidas
- ✅ Postagem com e sem mídia
- ✅ Sistema de curtidas e comentários
- ✅ Upload de arquivos diversos tamanhos

### Testes Automáticos (Futuro)
- [ ] Unit Tests com Jest
- [ ] E2E Tests com Cypress
- [ ] Performance Tests com Lighthouse
- [ ] Accessibility Tests com Axe

## 📈 Próximos Passos

### V1.1 (Curto Prazo)
- [ ] Sistema de notificações push
- [ ] Stories tipo Instagram
- [ ] Filtros avançados no feed
- [ ] Sistema de report de conteúdo

### V2.0 (Médio Prazo)
- [ ] App mobile React Native
- [ ] Sistema de encontros de pets
- [ ] Integração com veterinárias
- [ ] Marketplace de produtos

### V3.0 (Longo Prazo)
- [ ] IA para reconhecimento de raças
- [ ] Sistema de pedigree digital
- [ ] Integração com pet shops
- [ ] Sistema de eventos e meetups

## 🐛 Troubleshooting

### Problemas Comuns

#### ❌ "Supabase URL not configured"
**Solução**: Configure as credenciais em `js/supabaseConfig.js`

#### ❌ "Storage permission denied"
**Solução**: Verifique as políticas RLS do Storage

#### ❌ "CORS error"
**Solução**: Adicione sua URL de deploy nas configurações CORS

#### ❌ "Realtime not working"
**Solução**: Verifique se as tabelas têm RLS habilitado

### Debug Mode
Ative o debug mode no console:
```javascript
// No console do navegador
localStorage.setItem('debug', 'true');
```

## 📚 Documentação Adicional

### Supabase
- [Documentação Oficial](https://supabase.com/docs)
- [JavaScript Client](https://supabase.com/docs/reference/javascript)
- [Auth Guide](https://supabase.com/docs/guides/auth)
- [Storage Guide](https://supabase.com/docs/guides/storage)

### Web Development
- [MDN Web Docs](https://developer.mozilla.org/)
- [CSS Tricks](https://css-tricks.com/)
- [JavaScript.info](https://javascript.info/)

## 🤝 Contribuição

### Como Contribuir
1. Fork o projeto
2. Crie uma branch feature (`git checkout -b feature/nova-funcionalidade`)
3. Commit suas mudanças (`git commit -m 'Add nova funcionalidade'`)
4. Push para a branch (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request

### Code Style
- Use ES6+ features
- Siga o padrão de nomenclatura
- Adicione comentários em código complexo
- Mantenha a consistência no estilo

## 📄 Licença

Este projeto está licenciado sob a **MIT License** - veja o arquivo [LICENSE](LICENSE) para detalhes.

## 👥 Créditos

- **Desenvolvimento**: [Seu Nome]
- **Design**: UI/UX Team
- **Icons**: FontAwesome 6.0
- **Backend**: Supabase
- **Hosting**: Vercel/Netlify

---

## 🎯 Quick Start

```bash
# 1. Clone e configure
git clone https://github.com/SEU-USER/petsocial.git
cd petsocial
# Configure js/supabaseConfig.js com suas credenciais

# 2. Execute local
python -m http.server 8000
# Acesse http://localhost:8000

# 3. Deploy para produção
vercel --prod
```

**🚀 Parabéns! Seu PetSocial está pronto para uso!**

---

*Última atualização: Janeiro/2024*
*Versão: 1.0.0*
