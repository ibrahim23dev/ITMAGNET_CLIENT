#!/bin/bash

# ITMAGNET Project Setup Script
# This script automates the initial setup and verification

set -e

echo "================================================"
echo "ITMAGNET PROJECT SETUP"
echo "================================================"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check Node.js
echo -e "${YELLOW}Checking Node.js version...${NC}"
if ! command -v node &> /dev/null; then
    echo -e "${RED}Node.js not found. Please install Node.js 18+${NC}"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo -e "${RED}Node.js 18+ required. Current: $(node -v)${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Node.js $(node -v) found${NC}"
echo ""

# Check npm
echo -e "${YELLOW}Checking npm...${NC}"
if ! command -v npm &> /dev/null; then
    echo -e "${RED}npm not found${NC}"
    exit 1
fi
echo -e "${GREEN}✓ npm $(npm -v) found${NC}"
echo ""

# Install dependencies
echo -e "${YELLOW}Installing dependencies...${NC}"
if [ ! -d "node_modules" ]; then
    npm install
    echo -e "${GREEN}✓ Dependencies installed${NC}"
else
    echo -e "${GREEN}✓ Dependencies already installed${NC}"
fi
echo ""

# Setup .env files
echo -e "${YELLOW}Setting up environment files...${NC}"

if [ ! -f ".env.local" ]; then
    if [ -f ".env.local.example" ]; then
        cp .env.local.example .env.local
        echo -e "${GREEN}✓ Created .env.local${NC}"
        echo -e "${YELLOW}  Please update NEXT_PUBLIC_API_BASE_URL in .env.local${NC}"
    fi
else
    echo -e "${GREEN}✓ .env.local already exists${NC}"
fi
echo ""

# Verify TypeScript
echo -e "${YELLOW}Verifying TypeScript configuration...${NC}"
if [ -f "tsconfig.json" ]; then
    echo -e "${GREEN}✓ TypeScript configured${NC}"
else
    echo -e "${RED}✗ tsconfig.json not found${NC}"
fi
echo ""

# Check for critical files
echo -e "${YELLOW}Verifying project structure...${NC}"
REQUIRED_FILES=(
    "package.json"
    "next.config.mjs"
    "middleware.ts"
    "lib/api.ts"
    "lib/axios.ts"
    "hooks/useAuthStore.ts"
)

for file in "${REQUIRED_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}✓ $file${NC}"
    else
        echo -e "${RED}✗ $file missing${NC}"
    fi
done
echo ""

# List API files
echo -e "${YELLOW}API Integration Files:${NC}"
API_FILES=(
    "lib/api.ts"
    "lib/api-service.ts"
    "lib/api-utils.ts"
    "lib/error-handler.ts"
    "lib/axios.ts"
    "hooks/useAuthApi.ts"
    "hooks/useApiError.ts"
)

for file in "${API_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}✓ $file${NC}"
    else
        echo -e "${YELLOW}○ $file${NC}"
    fi
done
echo ""

# Summary
echo "================================================"
echo -e "${GREEN}Setup Complete!${NC}"
echo "================================================"
echo ""
echo "📝 Next Steps:"
echo "1. Update .env.local with your API URL:"
echo "   NEXT_PUBLIC_API_BASE_URL=http://YOUR_API/api"
echo ""
echo "2. Start development server:"
echo "   npm run dev"
echo ""
echo "3. Open http://localhost:3000 in browser"
echo ""
echo "📚 Documentation:"
echo "   - API Integration: API_INTEGRATION_GUIDE.md"
echo "   - Setup Guide: SETUP_GUIDE.md"
echo "   - Architecture: ARCHITECTURE.md"
echo ""
echo -e "${YELLOW}Make sure your backend API is running before starting!${NC}"
echo ""
