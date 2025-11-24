#!/bin/bash

echo "🚀 Iniciando Linux Hardening Toolkit..."

# Colores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Iniciar Backend
echo -e "${BLUE}📡 Iniciando Backend (FastAPI)...${NC}"
cd backend
python main.py &
BACKEND_PID=$!
echo -e "${GREEN}✅ Backend iniciado en http://localhost:8000 (PID: $BACKEND_PID)${NC}"

# Esperar un poco
sleep 3

# Iniciar Frontend
echo -e "${BLUE}🎨 Iniciando Frontend (Next.js)...${NC}"
cd ../frontend
HOME=/tmp npm run dev &
FRONTEND_PID=$!
echo -e "${GREEN}✅ Frontend iniciado en http://localhost:3000 (PID: $FRONTEND_PID)${NC}"

# Información
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  🛡️  LINUX HARDENING TOOLKIT v1.0"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "  📡 Backend API:  http://localhost:8000"
echo "  🎨 Frontend UI:  http://localhost:3000"
echo "  📚 API Docs:     http://localhost:8000/docs"
echo ""
echo "  Para detener: kill $BACKEND_PID $FRONTEND_PID"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Mantener el script corriendo
wait
