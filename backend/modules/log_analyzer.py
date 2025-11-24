import os
import re
from typing import List, Dict
from collections import Counter
from datetime import datetime


class LogAnalyzer:
    def __init__(self):
        self.log_files = {
            "auth": ["/var/log/auth.log", "/var/log/secure"],
            "syslog": ["/var/log/syslog", "/var/log/messages"],
            "fail2ban": ["/var/log/fail2ban.log"]
        }
        
        self.patterns = {
            "failed_ssh": r"Failed password for .* from ([\d\.]+)",
            "invalid_user": r"Invalid user .* from ([\d\.]+)",
            "accepted_ssh": r"Accepted password for .* from ([\d\.]+)",
            "sudo_command": r"sudo:.*COMMAND=(.*)",
            "new_session": r"New session .* of user (.*)",
            "authentication_failure": r"authentication failure.*user=(.*)",
            "break_in_attempt": r"POSSIBLE BREAK-IN ATTEMPT"
        }
    
    def find_log_file(self, log_type: str) -> str:
        """Encontrar archivo de log disponible"""
        for filepath in self.log_files.get(log_type, []):
            if os.path.exists(filepath):
                return filepath
        return None
    
    def read_log_file(self, filepath: str, max_lines: int = 1000) -> List[str]:
        """Leer archivo de log"""
        if not filepath or not os.path.exists(filepath):
            return []
        
        try:
            lines = []
            with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
                # Leer últimas líneas
                all_lines = f.readlines()
                lines = all_lines[-max_lines:] if len(all_lines) > max_lines else all_lines
            return lines
        except Exception as e:
            print(f"Error leyendo {filepath}: {e}")
            return []
    
    def analyze_failed_ssh(self, lines: List[str]) -> Dict:
        """Analizar intentos fallidos de SSH"""
        pattern = re.compile(self.patterns["failed_ssh"])
        ips = []
        
        for line in lines:
            match = pattern.search(line)
            if match:
                ips.append(match.group(1))
        
        ip_counts = Counter(ips)
        
        return {
            "total_attempts": len(ips),
            "unique_ips": len(ip_counts),
            "top_attackers": [
                {"ip": ip, "attempts": count}
                for ip, count in ip_counts.most_common(10)
            ]
        }
    
    def analyze_invalid_users(self, lines: List[str]) -> Dict:
        """Analizar intentos con usuarios inválidos"""
        pattern = re.compile(self.patterns["invalid_user"])
        ips = []
        
        for line in lines:
            match = pattern.search(line)
            if match:
                ips.append(match.group(1))
        
        ip_counts = Counter(ips)
        
        return {
            "total_attempts": len(ips),
            "unique_ips": len(ip_counts),
            "top_sources": [
                {"ip": ip, "attempts": count}
                for ip, count in ip_counts.most_common(10)
            ]
        }
    
    def analyze_successful_logins(self, lines: List[str]) -> Dict:
        """Analizar logins exitosos"""
        pattern = re.compile(self.patterns["accepted_ssh"])
        ips = []
        
        for line in lines:
            match = pattern.search(line)
            if match:
                ips.append(match.group(1))
        
        ip_counts = Counter(ips)
        
        return {
            "total_logins": len(ips),
            "unique_ips": len(ip_counts),
            "login_sources": [
                {"ip": ip, "logins": count}
                for ip, count in ip_counts.most_common(10)
            ]
        }
    
    def analyze_sudo_commands(self, lines: List[str]) -> Dict:
        """Analizar comandos sudo ejecutados"""
        pattern = re.compile(self.patterns["sudo_command"])
        commands = []
        
        for line in lines:
            match = pattern.search(line)
            if match:
                commands.append(match.group(1))
        
        command_counts = Counter(commands)
        
        return {
            "total_sudo_commands": len(commands),
            "unique_commands": len(command_counts),
            "top_commands": [
                {"command": cmd, "count": count}
                for cmd, count in command_counts.most_common(10)
            ]
        }
    
    def detect_bruteforce_patterns(self, lines: List[str]) -> List[Dict]:
        """Detectar patrones de fuerza bruta"""
        failed_pattern = re.compile(self.patterns["failed_ssh"])
        ip_attempts = {}
        
        for line in lines:
            match = failed_pattern.search(line)
            if match:
                ip = match.group(1)
                if ip not in ip_attempts:
                    ip_attempts[ip] = []
                ip_attempts[ip].append(line)
        
        # Identificar IPs con más de 5 intentos (posible fuerza bruta)
        bruteforce_ips = [
            {
                "ip": ip,
                "attempts": len(attempts),
                "risk": "HIGH" if len(attempts) > 20 else "MEDIUM"
            }
            for ip, attempts in ip_attempts.items()
            if len(attempts) > 5
        ]
        
        return sorted(bruteforce_ips, key=lambda x: x['attempts'], reverse=True)
    
    def analyze_auth_log(self) -> Dict:
        """Analizar log de autenticación"""
        auth_log = self.find_log_file("auth")
        
        if not auth_log:
            return {
                "error": "No se encontró archivo de log de autenticación",
                "available": False
            }
        
        lines = self.read_log_file(auth_log)
        
        failed_ssh = self.analyze_failed_ssh(lines)
        invalid_users = self.analyze_invalid_users(lines)
        successful_logins = self.analyze_successful_logins(lines)
        sudo_commands = self.analyze_sudo_commands(lines)
        bruteforce = self.detect_bruteforce_patterns(lines)
        
        return {
            "log_file": auth_log,
            "lines_analyzed": len(lines),
            "failed_ssh_attempts": failed_ssh,
            "invalid_user_attempts": invalid_users,
            "successful_logins": successful_logins,
            "sudo_activity": sudo_commands,
            "bruteforce_detected": bruteforce,
            "available": True
        }
    
    def analyze_syslog(self) -> Dict:
        """Analizar syslog"""
        syslog = self.find_log_file("syslog")
        
        if not syslog:
            return {
                "error": "No se encontró archivo syslog",
                "available": False
            }
        
        lines = self.read_log_file(syslog, max_lines=500)
        
        # Contar errores y warnings
        errors = [line for line in lines if "error" in line.lower()]
        warnings = [line for line in lines if "warning" in line.lower()]
        
        return {
            "log_file": syslog,
            "lines_analyzed": len(lines),
            "errors_found": len(errors),
            "warnings_found": len(warnings),
            "recent_errors": errors[-10:] if errors else [],
            "available": True
        }
    
    def analyze_fail2ban(self) -> Dict:
        """Analizar logs de fail2ban"""
        fail2ban_log = self.find_log_file("fail2ban")
        
        if not fail2ban_log:
            return {
                "error": "Fail2ban no está instalado o no tiene logs",
                "available": False,
                "recommendation": "Instalar fail2ban para protección contra fuerza bruta"
            }
        
        lines = self.read_log_file(fail2ban_log)
        
        # Contar baneos
        ban_pattern = re.compile(r"Ban ([\d\.]+)")
        banned_ips = []
        
        for line in lines:
            match = ban_pattern.search(line)
            if match:
                banned_ips.append(match.group(1))
        
        ip_counts = Counter(banned_ips)
        
        return {
            "log_file": fail2ban_log,
            "lines_analyzed": len(lines),
            "total_bans": len(banned_ips),
            "unique_ips_banned": len(ip_counts),
            "top_banned": [
                {"ip": ip, "bans": count}
                for ip, count in ip_counts.most_common(10)
            ],
            "available": True
        }
    
    def generate_report(self) -> Dict:
        """Generar reporte completo de logs"""
        auth_analysis = self.analyze_auth_log()
        syslog_analysis = self.analyze_syslog()
        fail2ban_analysis = self.analyze_fail2ban()
        
        recommendations = self.generate_recommendations(auth_analysis, fail2ban_analysis)
        
        return {
            "authentication_logs": auth_analysis,
            "system_logs": syslog_analysis,
            "fail2ban_logs": fail2ban_analysis,
            "recommendations": recommendations
        }
    
    def generate_recommendations(self, auth_data: Dict, fail2ban_data: Dict) -> List[str]:
        """Generar recomendaciones basadas en análisis"""
        recommendations = []
        
        # Verificar intentos de fuerza bruta
        if auth_data.get('available'):
            bruteforce = auth_data.get('bruteforce_detected', [])
            if bruteforce:
                high_risk = [b for b in bruteforce if b.get('risk') == 'HIGH']
                if high_risk:
                    recommendations.append(
                        f"🔴 CRÍTICO: Detectados {len(high_risk)} IPs con patrones de fuerza bruta intensos"
                    )
                    for ip_info in high_risk[:3]:
                        recommendations.append(f"  - IP {ip_info['ip']}: {ip_info['attempts']} intentos")
            
            # Verificar failed SSH
            failed = auth_data.get('failed_ssh_attempts', {})
            if failed.get('total_attempts', 0) > 50:
                recommendations.append(
                    f"🟠 ALTO: {failed['total_attempts']} intentos fallidos de SSH detectados"
                )
        
        # Verificar fail2ban
        if not fail2ban_data.get('available'):
            recommendations.append(
                "⚠️ Fail2ban no está instalado. Instalar para protección automática contra fuerza bruta"
            )
        else:
            total_bans = fail2ban_data.get('total_bans', 0)
            if total_bans > 0:
                recommendations.append(
                    f"✅ Fail2ban activo: {total_bans} IPs bloqueadas automáticamente"
                )
        
        if not recommendations:
            recommendations.append("✅ No se detectaron amenazas significativas en los logs")
        
        return recommendations
