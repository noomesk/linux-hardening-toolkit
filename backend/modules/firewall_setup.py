import subprocess
from typing import List, Dict, Optional


class FirewallSetup:
    def __init__(self):
        self.firewall_type = self.detect_firewall()
    
    def detect_firewall(self) -> str:
        """Detectar tipo de firewall disponible"""
        # Verificar UFW
        try:
            subprocess.run(["which", "ufw"], check=True, capture_output=True)
            return "ufw"
        except:
            pass
        
        # Verificar iptables
        try:
            subprocess.run(["which", "iptables"], check=True, capture_output=True)
            return "iptables"
        except:
            pass
        
        return "none"
    
    def is_ufw_installed(self) -> bool:
        """Verificar si UFW está instalado"""
        try:
            subprocess.run(["which", "ufw"], check=True, capture_output=True)
            return True
        except:
            return False
    
    def is_ufw_active(self) -> bool:
        """Verificar si UFW está activo"""
        try:
            result = subprocess.run(["ufw", "status"], capture_output=True, text=True)
            return "Status: active" in result.stdout or "Estado: activo" in result.stdout
        except:
            return False
    
    def get_ufw_status(self) -> Dict:
        """Obtener estado de UFW"""
        try:
            result = subprocess.run(["ufw", "status", "verbose"], capture_output=True, text=True)
            return {
                "installed": self.is_ufw_installed(),
                "active": self.is_ufw_active(),
                "status_output": result.stdout,
                "type": "ufw"
            }
        except Exception as e:
            return {
                "installed": False,
                "active": False,
                "error": str(e),
                "type": "ufw"
            }
    
    def get_iptables_rules(self) -> Dict:
        """Obtener reglas de iptables"""
        try:
            result = subprocess.run(["iptables", "-L", "-n", "-v"], capture_output=True, text=True)
            return {
                "installed": True,
                "rules_output": result.stdout,
                "type": "iptables"
            }
        except Exception as e:
            return {
                "installed": False,
                "error": str(e),
                "type": "iptables"
            }
    
    def enable_ufw(self) -> Dict:
        """Habilitar UFW"""
        try:
            # Habilitar UFW sin confirmación
            result = subprocess.run(
                ["ufw", "--force", "enable"],
                capture_output=True,
                text=True
            )
            
            if result.returncode == 0:
                return {
                    "success": True,
                    "message": "UFW habilitado exitosamente",
                    "output": result.stdout
                }
            else:
                return {
                    "success": False,
                    "message": f"Error habilitando UFW: {result.stderr}",
                    "output": result.stderr
                }
        except Exception as e:
            return {
                "success": False,
                "message": f"Error: {str(e)}"
            }
    
    def disable_ufw(self) -> Dict:
        """Deshabilitar UFW"""
        try:
            result = subprocess.run(["ufw", "disable"], capture_output=True, text=True)
            
            if result.returncode == 0:
                return {
                    "success": True,
                    "message": "UFW deshabilitado",
                    "output": result.stdout
                }
            else:
                return {
                    "success": False,
                    "message": f"Error deshabilitando UFW: {result.stderr}"
                }
        except Exception as e:
            return {
                "success": False,
                "message": f"Error: {str(e)}"
            }
    
    def set_default_policy(self, incoming: str = "deny", outgoing: str = "allow") -> Dict:
        """Establecer política por defecto"""
        try:
            results = []
            
            # Política de entrada
            result_in = subprocess.run(
                ["ufw", "default", incoming, "incoming"],
                capture_output=True,
                text=True
            )
            results.append(f"Incoming: {result_in.stdout}")
            
            # Política de salida
            result_out = subprocess.run(
                ["ufw", "default", outgoing, "outgoing"],
                capture_output=True,
                text=True
            )
            results.append(f"Outgoing: {result_out.stdout}")
            
            return {
                "success": True,
                "message": "Políticas por defecto configuradas",
                "details": results
            }
        except Exception as e:
            return {
                "success": False,
                "message": f"Error: {str(e)}"
            }
    
    def allow_port(self, port: int, protocol: str = "tcp") -> Dict:
        """Permitir un puerto"""
        try:
            result = subprocess.run(
                ["ufw", "allow", f"{port}/{protocol}"],
                capture_output=True,
                text=True
            )
            
            if result.returncode == 0:
                return {
                    "success": True,
                    "message": f"Puerto {port}/{protocol} permitido",
                    "port": port,
                    "protocol": protocol
                }
            else:
                return {
                    "success": False,
                    "message": f"Error: {result.stderr}",
                    "port": port
                }
        except Exception as e:
            return {
                "success": False,
                "message": f"Error: {str(e)}",
                "port": port
            }
    
    def deny_port(self, port: int, protocol: str = "tcp") -> Dict:
        """Denegar un puerto"""
        try:
            result = subprocess.run(
                ["ufw", "deny", f"{port}/{protocol}"],
                capture_output=True,
                text=True
            )
            
            if result.returncode == 0:
                return {
                    "success": True,
                    "message": f"Puerto {port}/{protocol} denegado",
                    "port": port,
                    "protocol": protocol
                }
            else:
                return {
                    "success": False,
                    "message": f"Error: {result.stderr}",
                    "port": port
                }
        except Exception as e:
            return {
                "success": False,
                "message": f"Error: {str(e)}",
                "port": port
            }
    
    def configure_basic_firewall(self, ssh_port: int = 22) -> Dict:
        """Configurar firewall básico"""
        results = []
        
        # Establecer políticas por defecto
        policy_result = self.set_default_policy("deny", "allow")
        results.append(policy_result)
        
        # Permitir SSH
        ssh_result = self.allow_port(ssh_port, "tcp")
        results.append(ssh_result)
        
        # Permitir HTTP y HTTPS (comentar si no es servidor web)
        # http_result = self.allow_port(80, "tcp")
        # results.append(http_result)
        # https_result = self.allow_port(443, "tcp")
        # results.append(https_result)
        
        # Habilitar UFW
        enable_result = self.enable_ufw()
        results.append(enable_result)
        
        success = all(r.get('success', False) for r in results)
        
        return {
            "success": success,
            "message": "Configuración básica de firewall completada" if success else "Algunos pasos fallaron",
            "details": results
        }
    
    def reset_firewall(self) -> Dict:
        """Resetear firewall a configuración por defecto"""
        try:
            result = subprocess.run(
                ["ufw", "--force", "reset"],
                capture_output=True,
                text=True
            )
            
            if result.returncode == 0:
                return {
                    "success": True,
                    "message": "Firewall reseteado a configuración por defecto",
                    "output": result.stdout
                }
            else:
                return {
                    "success": False,
                    "message": f"Error reseteando firewall: {result.stderr}"
                }
        except Exception as e:
            return {
                "success": False,
                "message": f"Error: {str(e)}"
            }
    
    def list_rules(self) -> Dict:
        """Listar reglas del firewall"""
        try:
            result = subprocess.run(
                ["ufw", "status", "numbered"],
                capture_output=True,
                text=True
            )
            
            return {
                "success": True,
                "rules": result.stdout,
                "active": self.is_ufw_active()
            }
        except Exception as e:
            return {
                "success": False,
                "message": f"Error: {str(e)}"
            }
    
    def generate_report(self) -> Dict:
        """Generar reporte de firewall"""
        status = self.get_ufw_status()
        
        recommendations = []
        if not status.get('installed'):
            recommendations.append("🔴 CRÍTICO: UFW no está instalado. Instalar con: apt install ufw")
        elif not status.get('active'):
            recommendations.append("🔴 CRÍTICO: UFW está instalado pero no activo. Habilitar firewall inmediatamente")
        else:
            recommendations.append("✅ UFW está activo y funcionando")
        
        return {
            "firewall_type": self.firewall_type,
            "status": status,
            "recommendations": recommendations
        }
