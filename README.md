# Linux Hardening Toolkit 🛡️

## Descripción

Linux Hardening Toolkit es una suite completa de herramientas de seguridad para sistemas Linux con una interfaz web moderna y responsive. Esta herramienta automatiza análisis de seguridad, configuración de firewall, gestión de servicios y más...

## Características:

### Backend (FastAPI + Python)
- **Escaneo de Puertos**: Detecta puertos abiertos y evalúa riesgos
- **Verificación de Permisos**: Busca archivos SUID, SGID y permisos peligrosos
- **Gestión de Servicios**: Identifica y deshabilita servicios inseguros
- **Configuración de Firewall**: Gestiona UFW con configuraciones predefinidas
- **Análisis de Logs**: Analiza logs del sistema para detectar amenazas
- **Checklist de Seguridad**: Ejecuta verificaciones completas según mejores prácticas

### Frontend (Next.js + TypeScript + Tailwind CSS)
- Interfaz moderna 
- Animaciones fluidas
- Dashboard interactivo
- Visualización de datos en tiempo real
- Tema oscuro con efectos neón :)

## Instalación

### Requisitos Previos
- Python 3.8+ (CONSEJO: Funciona mejor con Python 3.11.9 porque puede haber errores de incompatibilidad de versiones con Python 3.14 esto lo digo porque en las dependencias del backend necesitas instalar pydantic y pydantic==2.5.0 (que es la versión que se usa aqui) fue creada antes de que Python 3.14 existiera y pues si usas esa versión, python no sabe cómo funcionar con ella, así que por eso recomiendo la versión de Python 3.11.9 o 3.12 ya que estas versiones son más estables y compatibles con la mayoría de las librerías) jeje ya lo probé. Saludos.
- Node.js 18+
- npm o yarn
- Permisos de superusuario para algunas operaciones (Linux o en su defecto WSL2 en Windows, usar Docker o correrlo desde Máquina Virtual con Linux, para funcionalidad real)

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

```bashcd backend
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

##  STAAAAAAAAAAAAAAAAAAAACK TECNOLÓGICO USADO: 

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

##  ¿Cómo lo ejecuto en mi máquina???

🐧 Linux (3 pasos):
bash
cd backend && python3 -m venv venv && source venv/bin/activate && pip install -r requirements.txt
cd ../frontend && npm install
# Luego ejecutar en 2 terminales

- MacOS (3 pasos):
bash
cd backend && python3 -m venv venv && source venv/bin/activate && pip install -r requirements.txt
cd ../frontend && npm install

- Windows (3 pasos):
cmd
cd backend && python -m venv venv && venv\Scripts\activate && pip install -r requirements.txt
cd frontend && npm install

##  Licencia

Este proyecto es de código abierto para fines educativos :3

##  Autor

Desarrollado por noomesk

##  Contribuciones


Las contribuciones son bienvenidas. Por favor, abre un issue o pull request, o siéntete libre de enviar un mensaje en mi portafolio https://noomesk.vercel.app/ sección >> contacto. 