import socket
import json
import subprocess
from typing import List, Dict
from pathlib import Path


class PortScanner:
    def __init__(self):
        self.config_path = Path(__file__).parent.parent / "config" / "port_risks.json"
        self.load_config()
    
    def load_config(self):
        """Cargar configuración de riesgos de puertos"""
        try:
            with open(self.config_path, 'r') as f:
                config = json.load(f)
                self.port_risks = config.get('port_risks', {})
                self.common_services = config.get('common_services', {})
        except Exception as e:
            print(f"Error cargando configuración: {e}")
            self.port_risks = {}
            self.common_services = {}
    
    def scan_port(self, host: str, port: int, timeout: float = 0.5) -> bool:
        """Escanear un puerto específico"""
        try:
            sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            sock.settimeout(timeout)
            result = sock.connect_ex((host, port))
            sock.close()
            return result == 0
        except:
            return False
    
    def get_service_name(self, port: int) -> str:
        """Obtener nombre del servicio por puerto"""
        port_str = str(port)
        if port_str in self.common_services:
            return self.common_services[port_str]
        try:
            return socket.getservbyport(port)
        except:
            return "Unknown"
    
    def get_risk_level(self, port: int) -> Dict:
        """Obtener nivel de riesgo del puerto"""
        port_str = str(port)
        if port_str in self.port_risks:
            return self.port_risks[port_str]
        return {
            "service": self.get_service_name(port),
            "risk": "UNKNOWN",
            "description": "Puerto no catalogado en la base de datos"
        }
    
    def scan_common_ports(self, host: str = "127.0.0.1") -> List[Dict]:
        """Escanear puertos comunes"""
        common_ports = [21, 22, 23, 25, 53, 80, 110, 143, 443, 445, 
                       3306, 3389, 5432, 5900, 6379, 8080, 27017]
        results = []
        
        for port in common_ports:
            if self.scan_port(host, port):
                risk_info = self.get_risk_level(port)
                results.append({
                    "port": port,
                    "status": "open",
                    "service": risk_info.get("service", "Unknown"),
                    "risk": risk_info.get("risk", "UNKNOWN"),
                    "description": risk_info.get("description", "")
                })
        
        return results
    
    def scan_range(self, host: str = "127.0.0.1", start: int = 1, end: int = 1024) -> List[Dict]:
        """Escanear rango de puertos"""
        results = []
        
        for port in range(start, min(end + 1, 65536)):
            if self.scan_port(host, port, timeout=0.3):
                risk_info = self.get_risk_level(port)
                results.append({
                    "port": port,
                    "status": "open",
                    "service": risk_info.get("service", "Unknown"),
                    "risk": risk_info.get("risk", "UNKNOWN"),
                    "description": risk_info.get("description", "")
                })
        
        return results
    
    def get_netstat_info(self) -> List[Dict]:
        """Obtener información de puertos usando netstat/ss"""
        results = []
        try:
            # Intentar con ss primero (más moderno)
            cmd = ["ss", "-tuln"]
            output = subprocess.check_output(cmd, stderr=subprocess.DEVNULL).decode('utf-8')
            
            for line in output.split('\n')[1:]:  # Saltar encabezado
                if line.strip():
                    parts = line.split()
                    if len(parts) >= 5:
                        local_addr = parts[4]
                        if ':' in local_addr:
                            port = local_addr.split(':')[-1]
                            if port.isdigit():
                                port_num = int(port)
                                risk_info = self.get_risk_level(port_num)
                                results.append({
                                    "port": port_num,
                                    "status": "listening",
                                    "service": risk_info.get("service", "Unknown"),
                                    "risk": risk_info.get("risk", "UNKNOWN"),
                                    "protocol": parts[0],
                                    "address": local_addr
                                })
        except:
            # Fallback a netstat
            try:
                cmd = ["netstat", "-tuln"]
                output = subprocess.check_output(cmd, stderr=subprocess.DEVNULL).decode('utf-8')
                
                for line in output.split('\n')[2:]:  # Saltar encabezados
                    if line.strip():
                        parts = line.split()
                        if len(parts) >= 4:
                            local_addr = parts[3]
                            if ':' in local_addr:
                                port = local_addr.split(':')[-1]
                                if port.isdigit():
                                    port_num = int(port)
                                    risk_info = self.get_risk_level(port_num)
                                    results.append({
                                        "port": port_num,
                                        "status": "listening",
                                        "service": risk_info.get("service", "Unknown"),
                                        "risk": risk_info.get("risk", "UNKNOWN"),
                                        "protocol": parts[0]
                                    })
            except:
                pass
        
        # Eliminar duplicados
        seen = set()
        unique_results = []
        for item in results:
            port = item['port']
            if port not in seen:
                seen.add(port)
                unique_results.append(item)
        
        return unique_results
    
    def generate_report(self, scan_results: List[Dict]) -> Dict:
        """Generar reporte de escaneo"""
        total_ports = len(scan_results)
        risk_summary = {"CRITICAL": 0, "HIGH": 0, "MEDIUM": 0, "LOW": 0, "UNKNOWN": 0}
        
        for result in scan_results:
            risk = result.get('risk', 'UNKNOWN')
            risk_summary[risk] = risk_summary.get(risk, 0) + 1
        
        return {
            "total_open_ports": total_ports,
            "risk_summary": risk_summary,
            "ports": scan_results,
            "recommendations": self.generate_recommendations(scan_results)
        }
    
    def generate_recommendations(self, scan_results: List[Dict]) -> List[str]:
        """Generar recomendaciones basadas en el escaneo"""
        recommendations = []
        
        for result in scan_results:
            port = result.get('port')
            risk = result.get('risk')
            
            if risk == "CRITICAL":
                recommendations.append(
                    f"🔴 CRÍTICO: Puerto {port} ({result.get('service')}) - "
                    f"{result.get('description')} - Cerrar inmediatamente"
                )
            elif risk == "HIGH":
                recommendations.append(
                    f"🟠 ALTO: Puerto {port} ({result.get('service')}) - "
                    f"{result.get('description')}"
                )
        
        if not recommendations:
            recommendations.append("✅ No se encontraron puertos con riesgo crítico o alto")
        
        return recommendations
