import subprocess
import json
from typing import List, Dict
from pathlib import Path


class ServiceManager:
    def __init__(self):
        self.config_path = Path(__file__).parent.parent / "config" / "services_blacklist.json"
        self.load_config()
    
    def load_config(self):
        """Cargar lista de servicios peligrosos"""
        try:
            with open(self.config_path, 'r') as f:
                config = json.load(f)
                self.dangerous_services = config.get('dangerous_services', [])
        except Exception as e:
            print(f"Error cargando configuración: {e}")
            self.dangerous_services = []
    
    def is_service_active(self, service_name: str) -> bool:
        """Verificar si un servicio está activo"""
        try:
            cmd = ["systemctl", "is-active", service_name]
            result = subprocess.run(cmd, capture_output=True, text=True)
            return result.stdout.strip() == "active"
        except:
            return False
    
    def is_service_enabled(self, service_name: str) -> bool:
        """Verificar si un servicio está habilitado"""
        try:
            cmd = ["systemctl", "is-enabled", service_name]
            result = subprocess.run(cmd, capture_output=True, text=True)
            return result.stdout.strip() == "enabled"
        except:
            return False
    
    def get_service_status(self, service_name: str) -> Dict:
        """Obtener estado de un servicio"""
        try:
            cmd = ["systemctl", "status", service_name]
            result = subprocess.run(cmd, capture_output=True, text=True)
            
            return {
                "name": service_name,
                "active": self.is_service_active(service_name),
                "enabled": self.is_service_enabled(service_name),
                "status_output": result.stdout[:500]  # Primeras 500 caracteres
            }
        except:
            return {
                "name": service_name,
                "active": False,
                "enabled": False,
                "status_output": "Service not found"
            }
    
    def scan_dangerous_services(self) -> List[Dict]:
        """Escanear servicios peligrosos"""
        results = []
        
        for service_info in self.dangerous_services:
            service_name = service_info.get('name')
            is_active = self.is_service_active(service_name)
            is_enabled = self.is_service_enabled(service_name)
            
            if is_active or is_enabled:
                results.append({
                    "name": service_name,
                    "active": is_active,
                    "enabled": is_enabled,
                    "risk": service_info.get('risk'),
                    "reason": service_info.get('reason'),
                    "alternative": service_info.get('alternative'),
                    "status": "VULNERABLE" if is_active else "ENABLED"
                })
        
        return results
    
    def stop_service(self, service_name: str) -> Dict:
        """Detener un servicio"""
        try:
            cmd = ["systemctl", "stop", service_name]
            result = subprocess.run(cmd, capture_output=True, text=True)
            
            if result.returncode == 0:
                return {
                    "success": True,
                    "message": f"Servicio {service_name} detenido exitosamente",
                    "service": service_name
                }
            else:
                return {
                    "success": False,
                    "message": f"Error deteniendo servicio: {result.stderr}",
                    "service": service_name
                }
        except Exception as e:
            return {
                "success": False,
                "message": f"Error: {str(e)}",
                "service": service_name
            }
    
    def disable_service(self, service_name: str) -> Dict:
        """Deshabilitar un servicio"""
        try:
            cmd = ["systemctl", "disable", service_name]
            result = subprocess.run(cmd, capture_output=True, text=True)
            
            if result.returncode == 0:
                return {
                    "success": True,
                    "message": f"Servicio {service_name} deshabilitado exitosamente",
                    "service": service_name
                }
            else:
                return {
                    "success": False,
                    "message": f"Error deshabilitando servicio: {result.stderr}",
                    "service": service_name
                }
        except Exception as e:
            return {
                "success": False,
                "message": f"Error: {str(e)}",
                "service": service_name
            }
    
    def stop_and_disable_service(self, service_name: str) -> Dict:
        """Detener y deshabilitar un servicio"""
        stop_result = self.stop_service(service_name)
        disable_result = self.disable_service(service_name)
        
        return {
            "service": service_name,
            "stopped": stop_result.get('success', False),
            "disabled": disable_result.get('success', False),
            "messages": {
                "stop": stop_result.get('message', ''),
                "disable": disable_result.get('message', '')
            },
            "success": stop_result.get('success', False) and disable_result.get('success', False)
        }
    
    def list_all_services(self) -> List[Dict]:
        """Listar todos los servicios"""
        try:
            cmd = ["systemctl", "list-units", "--type=service", "--all", "--no-pager"]
            result = subprocess.run(cmd, capture_output=True, text=True)
            
            services = []
            for line in result.stdout.split('\n'):
                if '.service' in line:
                    parts = line.split()
                    if len(parts) >= 4:
                        name = parts[0].replace('.service', '')
                        services.append({
                            "name": name,
                            "loaded": parts[1],
                            "active": parts[2],
                            "status": parts[3]
                        })
            
            return services
        except:
            return []
    
    def generate_report(self) -> Dict:
        """Generar reporte de servicios"""
        dangerous = self.scan_dangerous_services()
        
        risk_summary = {"HIGH": 0, "MEDIUM": 0, "LOW": 0}
        for service in dangerous:
            risk = service.get('risk', 'MEDIUM')
            if risk in risk_summary:
                risk_summary[risk] += 1
        
        return {
            "dangerous_services_found": len(dangerous),
            "services": dangerous,
            "risk_summary": risk_summary,
            "recommendations": self.generate_recommendations(dangerous)
        }
    
    def generate_recommendations(self, services: List[Dict]) -> List[str]:
        """Generar recomendaciones"""
        recommendations = []
        
        high_risk = [s for s in services if s.get('risk') == 'HIGH']
        medium_risk = [s for s in services if s.get('risk') == 'MEDIUM']
        
        if high_risk:
            recommendations.append(
                f"🔴 CRÍTICO: Se encontraron {len(high_risk)} servicios de alto riesgo activos"
            )
            for service in high_risk[:3]:
                recommendations.append(
                    f"  - {service['name']}: {service['reason']}. Usar {service['alternative']} en su lugar"
                )
        
        if medium_risk:
            recommendations.append(
                f"🟠 MEDIO: Se encontraron {len(medium_risk)} servicios de riesgo medio"
            )
        
        if not recommendations:
            recommendations.append("✅ No se encontraron servicios peligrosos activos")
        
        return recommendations
