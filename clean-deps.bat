@echo off
REM 🧹 LIMPEZA COMPLETA DE DEPENDÊNCIAS - PETSOCIAL (Windows)
REM Execute este script para limpar e reinstalar dependências

echo 🚀 Iniciando limpeza completa do PetSocial...

REM Verificar se está no diretório correto
if not exist "package.json" (
    echo [ERROR] package.json não encontrado. Execute este script na raiz do projeto.
    pause
    exit /b 1
)

REM Backup do package-lock.json (se existir)
if exist "package-lock.json" (
    echo [INFO] Fazendo backup do package-lock.json...
    copy package-lock.json package-lock.json.backup
    echo [SUCCESS] Backup criado: package-lock.json.backup
)

REM Limpar node_modules
if exist "node_modules" (
    echo [INFO] Removendo node_modules...
    rmdir /s /q node_modules
    echo [SUCCESS] node_modules removido
) else (
    echo [WARNING] node_modules não encontrado
)

REM Limpar package-lock.json
if exist "package-lock.json" (
    echo [INFO] Removendo package-lock.json...
    del package-lock.json
    echo [SUCCESS] package-lock.json removido
)

REM Limpar caches do npm
echo [INFO] Limpando caches do npm...
npm cache clean --force
echo [SUCCESS] Cache do npm limpo

REM Verificar Node.js e npm versions
echo [INFO] Verificando versões...
node --version
npm --version

REM Instalar dependências
echo [INFO] Instalando dependências limpas...
npm install

if %errorlevel% neq 0 (
    echo [ERROR] Erro ao instalar dependências
    pause
    exit /b 1
)

echo [SUCCESS] Dependências instaladas com sucesso!

REM Verificar árvore de dependências
echo [INFO] Verificando árvore de dependências...
npm ls --depth=0

REM Verificar vulnerabilidades
echo [INFO] Verificando vulnerabilidades...
npm audit

if %errorlevel% equ 0 (
    echo [SUCCESS] Nenhuma vulnerabilidade crítica encontrada
) else (
    echo [WARNING] Vulnerabilidades encontradas. Execute 'npm audit fix' se necessário
)

REM Testar build
echo [INFO] Testando build...
npm run build

if %errorlevel% neq 0 (
    echo [ERROR] Erro no build
    pause
    exit /b 1
)

echo [SUCCESS] Build testado com sucesso!

echo.
echo 🎉 Limpeza e instalação concluídas com sucesso!
echo [INFO] Seu ambiente está pronto para desenvolvimento e deploy na Vercel.

REM Resumo final
echo.
echo 📋 RESUMO:
echo ✅ node_modules limpo e reinstalado
echo ✅ package-lock.json regenerado
echo ✅ Cache do npm limpo
echo ✅ Dependências verificadas
echo ✅ Build testado
echo ✅ Ambiente pronto para Vercel (Node.js 20.x)
echo.
echo 🚀 Próximos passos:
echo 1. npm run dev     - Iniciar servidor local
echo 2. npm run build   - Testar build
echo 3. npm run deploy  - Deploy para Vercel
echo 4. git add . && git commit -m "🔧 Updated dependencies and build config"
echo.
pause
