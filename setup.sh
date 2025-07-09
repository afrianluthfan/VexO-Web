#!/bin/bash

# VEXO Project Setup Script
# This script helps you set up the environment files for both backend and frontend

set -e

echo "🚀 VEXO Project Environment Setup"
echo "================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Get the script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$SCRIPT_DIR"

echo -e "${BLUE}Project root: $PROJECT_ROOT${NC}"
echo

# Setup Backend Environment
echo -e "${YELLOW}Setting up Backend environment...${NC}"
BACKEND_DIR="$PROJECT_ROOT/backend"

if [ -d "$BACKEND_DIR" ]; then
    cd "$BACKEND_DIR"
    
    if [ -f ".env.example" ]; then
        if [ ! -f ".env" ]; then
            cp .env.example .env
            echo -e "${GREEN}✓ Created backend/.env from .env.example${NC}"
        else
            echo -e "${YELLOW}⚠ backend/.env already exists, skipping...${NC}"
        fi
    else
        echo -e "${RED}✗ backend/.env.example not found${NC}"
    fi
    
    # Check if model file exists
    if [ -f "vexo_v4_2.keras" ]; then
        echo -e "${GREEN}✓ Model file vexo_v4_2.keras found${NC}"
    else
        echo -e "${YELLOW}⚠ Model file vexo_v4_2.keras not found - you may need to download it${NC}"
    fi
else
    echo -e "${RED}✗ Backend directory not found: $BACKEND_DIR${NC}"
fi

echo

# Setup Frontend Environment
echo -e "${YELLOW}Setting up Frontend environment...${NC}"
FRONTEND_DIR="$PROJECT_ROOT/frontend"

if [ -d "$FRONTEND_DIR" ]; then
    cd "$FRONTEND_DIR"
    
    if [ -f ".env.example" ]; then
        if [ ! -f ".env.local" ]; then
            cp .env.example .env.local
            echo -e "${GREEN}✓ Created frontend/.env.local from .env.example${NC}"
        else
            echo -e "${YELLOW}⚠ frontend/.env.local already exists, skipping...${NC}"
        fi
    else
        echo -e "${RED}✗ frontend/.env.example not found${NC}"
    fi
else
    echo -e "${RED}✗ Frontend directory not found: $FRONTEND_DIR${NC}"
fi

echo
echo -e "${BLUE}📋 Next Steps:${NC}"
echo "1. Edit backend/.env to configure your API settings"
echo "2. Edit frontend/.env.local to set your API URL"
echo "3. Run 'cd backend && uv pip install -r requirements.txt' to install backend dependencies"
echo "4. Run 'cd frontend && bun install' to install frontend dependencies"
echo "5. Start the backend with 'cd backend && uv run python main.py'"
echo "6. Start the frontend with 'cd frontend && bun dev'"
echo
echo -e "${GREEN}🎉 Environment setup complete!${NC}"
