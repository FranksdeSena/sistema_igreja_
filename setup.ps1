# Sistema Igreja - Setup Script
# Funciona em Windows PowerShell
# Uso: .\setup.ps1

param(
    [switch]$SkipNodeCheck = $false
)

# Cores
$Green = @{ ForegroundColor = "Green" }
$Yellow = @{ ForegroundColor = "Yellow" }
$Red = @{ ForegroundColor = "Red" }

Write-Host ""
Write-Host "============================================" @Yellow
Write-Host "  Sistema Igreja - Setup Automático" @Yellow
Write-Host "============================================" @Yellow
Write-Host ""

# 1. Verificar Node.js
Write-Host "1️⃣  Verificando Node.js..." @Yellow
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Node.js não encontrado!" @Red
    Write-Host "Instale em: https://nodejs.org" @Red
    exit 1
}
$nodeVersion = node --version
Write-Host "✅ Node.js encontrado: $nodeVersion" @Green
Write-Host ""

# 2. Instalar dependências
Write-Host "2️⃣  Instalando dependências..." @Yellow
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Falha ao instalar dependências" @Red
    exit 1
}
Write-Host "✅ Dependências instaladas" @Green
Write-Host ""

# 3. Criar arquivos de ambiente
Write-Host "3️⃣  Criando arquivos de ambiente..." @Yellow

$envFile = "src/environments/environment.ts"
$envExample = "src/environments/environment.example.ts"
$envProdFile = "src/environments/environment.prod.ts"
$envProdExample = "src/environments/environment.prod.example.ts"

if (-not (Test-Path $envFile)) {
    Copy-Item $envExample $envFile
    Write-Host "✅ environment.ts criado" @Green
    Write-Host "   ⚠️  Edite: src/environments/environment.ts" @Yellow
    Write-Host "   Adicione suas credenciais Supabase" @Yellow
} else {
    Write-Host "✅ environment.ts já existe" @Green
}

if (-not (Test-Path $envProdFile)) {
    Copy-Item $envProdExample $envProdFile
    Write-Host "✅ environment.prod.ts criado" @Green
} else {
    Write-Host "✅ environment.prod.ts já existe" @Green
}
Write-Host ""

# 4. Verificar .gitignore
Write-Host "4️⃣  Verificando segurança (.gitignore)..." @Yellow
$gitignoreContent = Get-Content .gitignore -Raw
if ($gitignoreContent -match "environment\.ts") {
    Write-Host "✅ .gitignore configurado corretamente" @Green
} else {
    Write-Host "❌ .gitignore pode não estar protegendo credenciais" @Red
}
Write-Host ""

# 5. Resumo
Write-Host "✅ Setup concluído!" @Green
Write-Host ""
Write-Host "Próximas etapas:" @Yellow
Write-Host "1. Edite: src/environments/environment.ts" @Yellow
Write-Host "2. Adicione suas credenciais Supabase" @Yellow
Write-Host "3. Inicie: npm start" @Yellow
Write-Host ""
Write-Host "Referências:" @Yellow
Write-Host "- Setup Local: cat SETUP_LOCAL.md" @Yellow
Write-Host "- Supabase: cat SUPABASE_SETUP.md" @Yellow
Write-Host ""
