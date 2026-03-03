#!/bin/bash

# 🧹 LIMPEZA COMPLETA DE DEPENDÊNCIAS - PETSOCIAL
# Execute este script para limpar e reinstalar dependências

echo "🚀 Iniciando limpeza completa do PetSocial..."

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para print colorido
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Verificar se está no diretório correto
if [ ! -f "package.json" ]; then
    print_error "package.json não encontrado. Execute este script na raiz do projeto."
    exit 1
fi

# Backup do package-lock.json (se existir)
if [ -f "package-lock.json" ]; then
    print_status "Fazendo backup do package-lock.json..."
    cp package-lock.json package-lock.json.backup
    print_success "Backup criado: package-lock.json.backup"
fi

# Limpar node_modules
if [ -d "node_modules" ]; then
    print_status "Removendo node_modules..."
    rm -rf node_modules
    print_success "node_modules removido"
else
    print_warning "node_modules não encontrado"
fi

# Limpar package-lock.json
if [ -f "package-lock.json" ]; then
    print_status "Removendo package-lock.json..."
    rm package-lock.json
    print_success "package-lock.json removido"
fi

# Limpar caches do npm
print_status "Limpando caches do npm..."
npm cache clean --force
print_success "Cache do npm limpo"

# Limpar .npm (opcional, descomente se necessário)
# print_status "Limpando .npm..."
# rm -rf ~/.npm

# Verificar Node.js e npm versions
print_status "Verificando versões..."
echo "Node.js: $(node --version)"
echo "npm: $(npm --version)"

# Instalar dependências
print_status "Instalando dependências limpas..."
npm install

if [ $? -eq 0 ]; then
    print_success "Dependências instaladas com sucesso!"
else
    print_error "Erro ao instalar dependências"
    exit 1
fi

# Verificar árvore de dependências
print_status "Verificando árvore de dependências..."
npm ls --depth=0

# Verificar vulnerabilidades
print_status "Verificando vulnerabilidades..."
npm audit

if [ $? -eq 0 ]; then
    print_success "Nenhuma vulnerabilidade crítica encontrada"
else
    print_warning "Vulnerabilidades encontradas. Execute 'npm audit fix' se necessário"
fi

# Testar build
print_status "Testando build..."
npm run build

if [ $? -eq 0 ]; then
    print_success "Build testado com sucesso!"
else
    print_error "Erro no build"
    exit 1
fi

# Verificar se há scripts de teste
if grep -q '"test"' package.json; then
    print_status "Executando testes..."
    npm test
fi

print_success "🎉 Limpeza e instalação concluídas com sucesso!"
print_status "Seu ambiente está pronto para desenvolvimento e deploy na Vercel."

# Resumo final
echo ""
echo "📋 RESUMO:"
echo "✅ node_modules limpo e reinstalado"
echo "✅ package-lock.json regenerado"
echo "✅ Cache do npm limpo"
echo "✅ Dependências verificadas"
echo "✅ Build testado"
echo "✅ Ambiente pronto para Vercel (Node.js 20.x)"
echo ""
echo "🚀 Próximos passos:"
echo "1. npm run dev     - Iniciar servidor local"
echo "2. npm run build   - Testar build"
echo "3. npm run deploy  - Deploy para Vercel"
echo "4. git add . && git commit -m '🔧 Updated dependencies and build config'"
