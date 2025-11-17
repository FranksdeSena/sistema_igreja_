@echo off
REM Script de Setup Automático para Windows
REM Uso: setup.bat

setlocal enabledelayedexpansion

echo.
echo ============================================
echo   Sistema Igreja - Setup Automático
echo ============================================
echo.

REM Cores (simuladas com mensagens)
echo [INFO] Verificando Node.js...
node --version >nul 2>&1
if errorlevel 1 (
    echo [ERRO] Node.js nao encontrado!
    echo Instale em: https://nodejs.org
    pause
    exit /b 1
)

echo [OK] Node.js encontrado
echo.

REM Instalar dependências
echo [INFO] Instalando dependencias...
call npm install
if errorlevel 1 (
    echo [ERRO] Falha ao instalar dependencias
    pause
    exit /b 1
)
echo [OK] Dependencias instaladas
echo.

REM Criar environments
echo [INFO] Criando arquivos de ambiente...

if not exist "src\environments\environment.ts" (
    copy src\environments\environment.example.ts src\environments\environment.ts
    echo [OK] environment.ts criado
    echo [AVISO] Edite: src\environments\environment.ts
    echo [AVISO] Adicione suas credenciais Supabase
) else (
    echo [OK] environment.ts ja existe
)

if not exist "src\environments\environment.prod.ts" (
    copy src\environments\environment.prod.example.ts src\environments\environment.prod.ts
    echo [OK] environment.prod.ts criado
) else (
    echo [OK] environment.prod.ts ja existe
)

echo.

REM Verificar .gitignore
echo [INFO] Verificando seguranca (.gitignore)...
findstr /M "environment.ts" .gitignore >nul 2>&1
if errorlevel 1 (
    echo [AVISO] .gitignore pode nao estar protegendo credenciais
) else (
    echo [OK] .gitignore configurado corretamente
)

echo.
echo ============================================
echo   Setup Concluido!
echo ============================================
echo.
echo Proximas etapas:
echo 1. Edite: src\environments\environment.ts
echo 2. Adicione suas credenciais Supabase
echo 3. Execute: npm start
echo.
echo Referencias:
echo - Setup Local: SETUP_LOCAL.md
echo - Supabase: SUPABASE_SETUP.md
echo.
pause
