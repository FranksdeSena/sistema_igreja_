#!/bin/bash
# Script de Setup Automático do Projeto
# Uso: ./setup.sh

set -e

echo "🚀 Setup do Sistema Igreja"
echo "=========================="
echo ""

# Cores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 1. Verificar Node.js
echo -e "${YELLOW}1️⃣  Verificando Node.js...${NC}"
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js não encontrado. Instale em: https://nodejs.org${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Node.js encontrado: $(node --version)${NC}"
echo ""

# 2. Instalar dependências
echo -e "${YELLOW}2️⃣  Instalando dependências...${NC}"
npm install
echo -e "${GREEN}✅ Dependências instaladas${NC}"
echo ""

# 3. Criar environments
echo -e "${YELLOW}3️⃣  Criando arquivos de ambiente...${NC}"

if [ ! -f "src/environments/environment.ts" ]; then
    cp src/environments/environment.example.ts src/environments/environment.ts
    echo -e "${GREEN}✅ environment.ts criado${NC}"
    echo -e "${YELLOW}   ⚠️  Edite: src/environments/environment.ts${NC}"
    echo -e "${YELLOW}   Adicione suas credenciais Supabase${NC}"
else
    echo -e "${GREEN}✅ environment.ts já existe${NC}"
fi

if [ ! -f "src/environments/environment.prod.ts" ]; then
    cp src/environments/environment.prod.example.ts src/environments/environment.prod.ts
    echo -e "${GREEN}✅ environment.prod.ts criado${NC}"
else
    echo -e "${GREEN}✅ environment.prod.ts já existe${NC}"
fi
echo ""

# 4. Verificar .gitignore
echo -e "${YELLOW}4️⃣  Verificando segurança (.gitignore)...${NC}"
if grep -q "environment.ts" .gitignore; then
    echo -e "${GREEN}✅ .gitignore configurado corretamente${NC}"
else
    echo -e "${RED}❌ .gitignore não protege credenciais${NC}"
fi
echo ""

# 5. Resumo
echo -e "${GREEN}✅ Setup concluído!${NC}"
echo ""
echo -e "${YELLOW}Próximas etapas:${NC}"
echo "1. Edite: src/environments/environment.ts"
echo "2. Adicione suas credenciais Supabase"
echo "3. Inicie: npm start"
echo ""
echo -e "${YELLOW}Referências:${NC}"
echo "- Setup Local: cat SETUP_LOCAL.md"
echo "- Supabase: cat SUPABASE_SETUP.md"
echo ""
