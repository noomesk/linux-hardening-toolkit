# Linux Hardening Toolkit - Guía de Iniciooooooooo básica

##  Estado del Proyecto: FUNCIONANDO 

**Ambos servicios están corriendo exitosamente:**
-  Backend (FastAPI): http://localhost:8000
-  Frontend (Next.js): http://localhost:3000

## ¿Cómo Usar??

### Acceder a la Interfaz Web
Bueno, abress tu navegador y vas a:
```
http://localhost:3000
```

### Acceder a la API
Backend disponible en:
```
http://localhost:8000
```

Documentación interactiva (Swagger):
```
http://localhost:8000/docs
```

##  Módulos Disponibles

### 1. Escaneo de Puertos
- Escanea puertos abiertos en el sistema
- Identifica servicios y evalúa riesgos
- Endpoint: `POST /api/scan-ports`

### 2. Verificación de Permisos
- Detecta archivos SUID/SGID
- Encuentra archivos world-writable
- Verifica permisos de archivos críticos
- Endpoint: `GET /api/check-permissions`

### 3. Gestión de Servicios
- Identifica servicios inseguros activos
- Permite detener y deshabilitar servicios
- Endpoint: `GET /api/services/dangerous`

### 4. Configuración de Firewall
- Gestiona UFW (Uncomplicated Firewall)
- Configura reglas rápidamente
- Endpoint: `GET /api/firewall/status`

### 5. Análisis de Logs
- Analiza intentos de acceso fallidos
- Detecta patrones de fuerza bruta
- Revisa logs de autenticación y sistema
- Endpoint: `GET /api/logs/analyze`

### 6.  Checklist de Seguridad
- Ejecuta verificaciones automáticas
- Genera puntuación de seguridad
- Endpoint: `GET /api/checklist/run`

### 7. Reporte Completo
- Genera reporte completo del sistema
- Compila todos los análisis
- Endpoint: `GET /api/report/full`

## Características de la Interfaz

- **Diseño Moderno**: Tema oscuro con efectos neón
- **Responsive**: Funciona en desktop y móvil
- **Animaciones**: GSAP para transiciones fluidas y suaveeees
- **Visualización en Tiempo Real**: Resultados actualizados instantáneamente
- **Interfaz Intuitiva**: Dashboard con tarjetas modulares

##  Estructura del Proyecto: (importante)

```
linux_hardening_toolkit/
├── backend/                    # Esta es la API FastAPI
│   ├── main.py                # Punto de entrada
│   ├── modules/               # Módulos de análisis
│   │   ├── port_scanner.py
│   │   ├── permission_check.py
│   │   ├── service_manager.py
│   │   ├── firewall_setup.py
│   │   ├── log_analyzer.py
│   │   └── security_checklist.py
│   ├── config/                # Aqui van las configuraciones JSON
│   └── requirements.txt
│
├── frontend/                  # Next.js + React
│   ├── pages/
│   │   ├── index.tsx         # Dashboard principal
│   │   ├── _app.tsx
│   │   └── _document.tsx
│   ├── components/           # Componentes React
│   │   ├── PortScanner.tsx
│   │   ├── PermissionCheck.tsx
│   │   ├── ServiceManager.tsx
│   │   ├── FirewallConfig.tsx
│   │   ├── LogAnalyzer.tsx
│   │   ├── SecurityChecklist.tsx
│   │   └── FullReport.tsx
│   ├── styles/
│   │   └── globals.css      # Estilos Tailwind estilitos medio ciberpunk
│   └── package.json
│
├── README.md
└── start.sh                  # Script de inicio
```

##  Reiniciar los Servicios

Si necesitas reiniciar, puedes usar:

```bash
# Detener procesos actuales
pkill -f "python main.py"
pkill -f "next dev"

# Iniciar nuevamente
cd /workspace/linux_hardening_toolkit
bash start.sh
```

O manualmente:

```bash
# Terminal 1 - Backend
cd backend
python main.py

# Terminal 2 - Frontend  
cd frontend
HOME=/tmp npm run dev
```

## PRUEBAAAAAAAAAAAS: Testing Rápido

### Probar Backend
```bash
# Health check
curl http://localhost:8000/api/health

# Escanear puertos
curl -X POST http://localhost:8000/api/scan-ports \
  -H "Content-Type: application/json" \
  -d '{"scan_type":"common","host":"127.0.0.1"}'

# Firewall status
curl http://localhost:8000/api/firewall/status
```

### Probar Frontend
Abre tu navegador en:
```
http://localhost:3000
```

## Notas Importantes:::

1. **Permisos**: Algunas funcionalidades requieren permisos de root/sudo
2. **Entorno Sandbox**: Este está corriendo en un entorno sandbox, por lo que algunas herramientas (UFW, SELinux, etc.) pueden no estar disponibles (en mi web intentaré que estén disponibles pero no sé que tan robusto pueda ser un sistema linux en render, así que depende)
3. **Producción**: Esto es un proyecto de desarrollo/educacional. Para producción, agregar autenticación y HTTPS

##  Paleta de Colores Cyberpunk

- **Neón Rosa**: #FF10F0
- **Neón Azul**: #00F0FF  
- **Neón Verde**: #39FF14
- **Neón Púrpura**: #BF40BF
- **Fondo Oscuro**: #0A0E27
- **Fondo Más Oscuro**: #050816

## ESCALABILIDAD: Próximos Pasos

Weno, si quieres mejorar el proyecto, (como es de ciberseguridad)... podrías:

1. Agregar autenticación de usuarios
2. Implementar persistencia de reportes
3. Agregar más verificaciones de seguridad
4. Crear visualizaciones con gráficos
5. Implementar alertas en tiempo real
6. Agregar soporte para múltiples sistemas

## Soporte

Si encuentras algún problema:
1. Verifica que ambos servicios estén corriendo
2. Revisa los logs en la terminal
3. Asegúrate de que los puertos 3000 y 8000 estén disponibles

##  LISTOOOOOOOOOOOO jaja muy friki, pero me gustó 

El proyecto está **100% funcional** y listo para usar. Espero q disfruten mucho explorando las herramientas de hardening de Linux!

---

**Desarrollado por**: noomesk
**Versión**: 1.0.0  
**Stack**: FastAPI + Next.js + TypeScript + Tailwind CSS
