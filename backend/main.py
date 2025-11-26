# Importa 'os' para manejar variables de entorno
import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
import uvicorn

from modules.port_scanner import PortScanner
from modules.permission_check import PermissionChecker
from modules.service_manager import ServiceManager
from modules.firewall_setup import FirewallSetup
from modules.log_analyzer import LogAnalyzer
from modules.security_checklist import SecurityChecklist

app = FastAPI(
    title="Linux Hardening Toolkit API",
    description="API para herramientas de hardening de Linux",
    version="1.0.0"
)

# --- CAMBIO CLAVE PARA PRODUCCIÓN ---
# Lee la URL del frontend desde las variables de entorno de Render.
# Si no existe (en desarrollo local), usa 'http://localhost:3000' por defecto.
frontend_url = os.getenv("FRONTEND_URL", "http://localhost:3000")

# Configurar CORS con la URL dinámica
app.add_middleware(
    CORSMiddleware,
    allow_origins=[frontend_url], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# --- FIN DEL CAMBIO ---

# Modelos Pydantic
class PortScanRequest(BaseModel):
    scan_type: str = "common"  # common, range
    host: str = "127.0.0.1"
    start_port: Optional[int] = 1
    end_port: Optional[int] = 1024

class ServiceActionRequest(BaseModel):
    service_name: str
    action: str  # stop, disable, stop_and_disable

class FirewallConfigRequest(BaseModel):
    action: str  # enable, disable, configure_basic, allow_port, deny_port
    port: Optional[int] = None
    protocol: Optional[str] = "tcp"
    ssh_port: Optional[int] = 22

class MessageResponse(BaseModel):
    message: str
    success: bool


# Endpoints

@app.get("/")
async def root():
    """Endpoint raíz"""
    return {
        "name": "Linux Hardening Toolkit API",
        "version": "1.0.0",
        "status": "running"
    }

@app.get("/api/health")
async def health_check():
    """Health check"""
    return {"status": "healthy"}


# Port Scanner Endpoints

@app.post("/api/scan-ports")
async def scan_ports(request: PortScanRequest):
    """Escanear puertos"""
    try:
        scanner = PortScanner()
        
        if request.scan_type == "common":
            results = scanner.scan_common_ports(request.host)
        elif request.scan_type == "range":
            results = scanner.scan_range(request.host, request.start_port, request.end_port)
        elif request.scan_type == "netstat":
            results = scanner.get_netstat_info()
        else:
            raise HTTPException(status_code=400, detail="Tipo de escaneo inválido")
        
        report = scanner.generate_report(results)
        return report
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/scan-ports/netstat")
async def scan_ports_netstat():
    """Escanear puertos usando netstat/ss"""
    try:
        scanner = PortScanner()
        results = scanner.get_netstat_info()
        report = scanner.generate_report(results)
        return report
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Permission Check Endpoints

@app.get("/api/check-permissions")
async def check_permissions():
    """Verificar permisos peligrosos"""
    try:
        checker = PermissionChecker()
        report = checker.generate_report()
        return report
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/check-permissions/suid")
async def check_suid():
    """Buscar archivos SUID"""
    try:
        checker = PermissionChecker()
        results = checker.find_suid_files()
        return {"suid_files": results, "count": len(results)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/check-permissions/world-writable")
async def check_world_writable():
    """Buscar archivos/directorios world-writable"""
    try:
        checker = PermissionChecker()
        dirs = checker.find_world_writable_dirs()
        files = checker.find_world_writable_files()
        return {
            "world_writable_directories": dirs,
            "world_writable_files": files,
            "total": len(dirs) + len(files)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Service Manager Endpoints

@app.get("/api/services/dangerous")
async def scan_dangerous_services():
    """Escanear servicios peligrosos"""
    try:
        manager = ServiceManager()
        report = manager.generate_report()
        return report
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/services/action")
async def service_action(request: ServiceActionRequest):
    """Ejecutar acción en un servicio"""
    try:
        manager = ServiceManager()
        
        if request.action == "stop":
            result = manager.stop_service(request.service_name)
        elif request.action == "disable":
            result = manager.disable_service(request.service_name)
        elif request.action == "stop_and_disable":
            result = manager.stop_and_disable_service(request.service_name)
        else:
            raise HTTPException(status_code=400, detail="Acción inválida")
        
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/services/list")
async def list_services():
    """Listar todos los servicios"""
    try:
        manager = ServiceManager()
        services = manager.list_all_services()
        return {"services": services, "count": len(services)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Firewall Endpoints

@app.get("/api/firewall/status")
async def firewall_status():
    """Obtener estado del firewall"""
    try:
        firewall = FirewallSetup()
        status = firewall.get_ufw_status()
        return status
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/firewall/configure")
async def configure_firewall(request: FirewallConfigRequest):
    """Configurar firewall"""
    try:
        firewall = FirewallSetup()
        
        if request.action == "enable":
            result = firewall.enable_ufw()
        elif request.action == "disable":
            result = firewall.disable_ufw()
        elif request.action == "configure_basic":
            result = firewall.configure_basic_firewall(request.ssh_port)
        elif request.action == "allow_port":
            if not request.port:
                raise HTTPException(status_code=400, detail="Puerto requerido")
            result = firewall.allow_port(request.port, request.protocol)
        elif request.action == "deny_port":
            if not request.port:
                raise HTTPException(status_code=400, detail="Puerto requerido")
            result = firewall.deny_port(request.port, request.protocol)
        elif request.action == "reset":
            result = firewall.reset_firewall()
        else:
            raise HTTPException(status_code=400, detail="Acción inválida")
        
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/firewall/rules")
async def list_firewall_rules():
    """Listar reglas del firewall"""
    try:
        firewall = FirewallSetup()
        rules = firewall.list_rules()
        return rules
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Log Analyzer Endpoints

@app.get("/api/logs/analyze")
async def analyze_logs():
    """Analizar logs del sistema"""
    try:
        analyzer = LogAnalyzer()
        report = analyzer.generate_report()
        return report
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/logs/auth")
async def analyze_auth_logs():
    """Analizar logs de autenticación"""
    try:
        analyzer = LogAnalyzer()
        report = analyzer.analyze_auth_log()
        return report
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/logs/syslog")
async def analyze_system_logs():
    """Analizar syslog"""
    try:
        analyzer = LogAnalyzer()
        report = analyzer.analyze_syslog()
        return report
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Security Checklist Endpoints

@app.get("/api/checklist/run")
async def run_security_checklist():
    """Ejecutar checklist completo de seguridad"""
    try:
        checklist = SecurityChecklist()
        report = checklist.generate_report()
        return report
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/checklist/category/{category}")
async def run_checklist_category(category: str):
    """Ejecutar checklist por categoría"""
    try:
        checklist = SecurityChecklist()
        results = checklist.run_checks_by_category(category)
        return {"category": category, "results": results, "count": len(results)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Full Report Endpoint

@app.get("/api/report/full")
async def generate_full_report():
    """Generar reporte completo de seguridad"""
    try:
        # Ejecutar todos los módulos
        scanner = PortScanner()
        checker = PermissionChecker()
        service_mgr = ServiceManager()
        firewall = FirewallSetup()
        log_analyzer = LogAnalyzer()
        checklist = SecurityChecklist()
        
        # Generar reportes
        port_scan = scanner.get_netstat_info()
        port_report = scanner.generate_report(port_scan)
        
        permission_report = checker.generate_report()
        service_report = service_mgr.generate_report()
        firewall_report = firewall.generate_report()
        log_report = log_analyzer.generate_report()
        checklist_report = checklist.generate_report()
        
        return {
            "timestamp": __import__('datetime').datetime.now().isoformat(),
            "port_scan": port_report,
            "permissions": permission_report,
            "services": service_report,
            "firewall": firewall_report,
            "logs": log_report,
            "security_checklist": checklist_report
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Este bloque se ejecuta solo cuando corres el archivo directamente con 'python main.py'
# Render lo ignora, ya que usa su propio comando de inicio.
if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)