# Linux Hardening Toolkit 🛡️

## 📋 Descripción

Linux Hardening Toolkit es una suite completa de herramientas de seguridad para sistemas Linux con una interfaz web moderna y cyberpunk. Automatiza análisis de seguridad, configuración de firewall, gestión de servicios y más.

## 🎯 Características

### Backend (FastAPI + Python)
- **Escaneo de Puertos**: Detecta puertos abiertos y evalúa riesgos
- **Verificación de Permisos**: Busca archivos SUID, SGID y permisos peligrosos
- **Gestión de Servicios**: Identifica y deshabilita servicios inseguros
- **Configuración de Firewall**: Gestiona UFW con configuraciones predefinidas
- **Análisis de Logs**: Analiza logs del sistema para detectar amenazas
- **Checklist de Seguridad**: Ejecuta verificaciones completas según mejores prácticas

### Frontend (Next.js + TypeScript + Tailwind CSS)
- Interfaz moderna con diseño cyberpunk
- Animaciones fluidas
- Dashboard interactivo
- Visualización de datos en tiempo real
- Tema oscuro con efectos neón

## 🚀 Instalación

### Requisitos Previos
- Python 3.8+
- Node.js 18+
- npm o yarn
- Permisos de superusuario para algunas operaciones

### Backend

```bash
cd backend
pip install -r requirements.txt
```

### Frontend

```bash
cd frontend
npm install
```

## 🔧 Ejecución

### Iniciar Backend (Puerto 8000)

```bash
cd backend
python main.py
```

O con uvicorn:

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Iniciar Frontend (Puerto 3000)

```bash
cd frontend
npm run dev
```

Acceder a: http://localhost:3000

## 📚 API Endpoints

### Escaneo de Puertos
- `POST /api/scan-ports` - Escanear puertos
- `GET /api/scan-ports/netstat` - Escanear con netstat/ss

### Permisos
- `GET /api/check-permissions` - Verificación completa
- `GET /api/check-permissions/suid` - Solo archivos SUID
- `GET /api/check-permissions/world-writable` - Archivos/directorios escribibles

### Servicios
- `GET /api/services/dangerous` - Escanear servicios peligrosos
- `POST /api/services/action` - Ejecutar acción en servicio
- `GET /api/services/list` - Listar todos los servicios

### Firewall
- `GET /api/firewall/status` - Estado del firewall
- `POST /api/firewall/configure` - Configurar firewall
- `GET /api/firewall/rules` - Listar reglas

### Logs
- `GET /api/logs/analyze` - Análisis completo
- `GET /api/logs/auth` - Solo logs de autenticación
- `GET /api/logs/syslog` - Solo syslog

### Checklist
- `GET /api/checklist/run` - Ejecutar checklist completo
- `GET /api/checklist/category/{category}` - Por categoría

### Reporte
- `GET /api/report/full` - Generar reporte completo

## 🎨 Stack Tecnológico

### Backend
- FastAPI
- Python 3.x
- Uvicorn
- Pydantic

### Frontend
- Next.js 14
- React 18
- TypeScript
- Tailwind CSS
- Axios
- GSAP
- Framer Motion

## ⚠️ Advertencias

- **Requiere privilegios de root/sudo** para muchas operaciones
- Realizar backups antes de modificar configuraciones
- Probar en entorno de desarrollo antes de producción
- Algunas acciones pueden interrumpir servicios

## 📝 Licencia

Este proyecto es de código abierto para fines educativos.

## 👨‍💻 Autor

Desarrollado por noomesk

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Por favor, abre un issue o pull request.
