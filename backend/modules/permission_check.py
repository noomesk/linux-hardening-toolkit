import subprocess
import os
from typing import List, Dict
from pathlib import Path


class PermissionChecker:
    def __init__(self):
        self.critical_files = [
            "/etc/passwd",
            "/etc/shadow",
            "/etc/group",
            "/etc/gshadow",
            "/etc/ssh/sshd_config"
        ]
    
    def find_suid_files(self, max_results: int = 50) -> List[Dict]:
        """Buscar archivos con bit SUID"""
        results = []
        try:
            cmd = ["find", "/", "-perm", "-4000", "-type", "f", "2>/dev/null"]
            process = subprocess.Popen(
                ' '.join(cmd),
                shell=True,
                stdout=subprocess.PIPE,
                stderr=subprocess.DEVNULL
            )
            
            count = 0
            for line in process.stdout:
                if count >= max_results:
                    break
                
                filepath = line.decode('utf-8').strip()
                if filepath:
                    stat_info = self.get_file_info(filepath)
                    results.append({
                        "path": filepath,
                        "type": "SUID",
                        "permissions": stat_info.get("permissions", ""),
                        "owner": stat_info.get("owner", ""),
                        "risk": self.evaluate_suid_risk(filepath)
                    })
                    count += 1
            
            process.terminate()
        except Exception as e:
            print(f"Error buscando archivos SUID: {e}")
        
        return results
    
    def find_sgid_files(self, max_results: int = 50) -> List[Dict]:
        """Buscar archivos con bit SGID"""
        results = []
        try:
            cmd = ["find", "/", "-perm", "-2000", "-type", "f", "2>/dev/null"]
            process = subprocess.Popen(
                ' '.join(cmd),
                shell=True,
                stdout=subprocess.PIPE,
                stderr=subprocess.DEVNULL
            )
            
            count = 0
            for line in process.stdout:
                if count >= max_results:
                    break
                
                filepath = line.decode('utf-8').strip()
                if filepath:
                    stat_info = self.get_file_info(filepath)
                    results.append({
                        "path": filepath,
                        "type": "SGID",
                        "permissions": stat_info.get("permissions", ""),
                        "owner": stat_info.get("owner", ""),
                        "risk": "MEDIUM"
                    })
                    count += 1
            
            process.terminate()
        except Exception as e:
            print(f"Error buscando archivos SGID: {e}")
        
        return results
    
    def find_world_writable_dirs(self, max_results: int = 30) -> List[Dict]:
        """Buscar directorios escribibles por todos"""
        results = []
        try:
            cmd = ["find", "/", "-perm", "-0002", "-type", "d", "2>/dev/null"]
            process = subprocess.Popen(
                ' '.join(cmd),
                shell=True,
                stdout=subprocess.PIPE,
                stderr=subprocess.DEVNULL
            )
            
            count = 0
            for line in process.stdout:
                if count >= max_results:
                    break
                
                dirpath = line.decode('utf-8').strip()
                # Ignorar directorios temporales conocidos
                if dirpath and not any(x in dirpath for x in ['/tmp', '/var/tmp', '/dev/shm', '/proc', '/sys']):
                    stat_info = self.get_file_info(dirpath)
                    results.append({
                        "path": dirpath,
                        "type": "World-Writable Directory",
                        "permissions": stat_info.get("permissions", ""),
                        "owner": stat_info.get("owner", ""),
                        "risk": "HIGH"
                    })
                    count += 1
            
            process.terminate()
        except Exception as e:
            print(f"Error buscando directorios world-writable: {e}")
        
        return results
    
    def find_world_writable_files(self, max_results: int = 30) -> List[Dict]:
        """Buscar archivos escribibles por todos"""
        results = []
        try:
            cmd = ["find", "/", "-perm", "-0002", "-type", "f", "2>/dev/null"]
            process = subprocess.Popen(
                ' '.join(cmd),
                shell=True,
                stdout=subprocess.PIPE,
                stderr=subprocess.DEVNULL
            )
            
            count = 0
            for line in process.stdout:
                if count >= max_results:
                    break
                
                filepath = line.decode('utf-8').strip()
                # Ignorar archivos temporales conocidos
                if filepath and not any(x in filepath for x in ['/tmp', '/var/tmp', '/dev/', '/proc/', '/sys/']):
                    stat_info = self.get_file_info(filepath)
                    results.append({
                        "path": filepath,
                        "type": "World-Writable File",
                        "permissions": stat_info.get("permissions", ""),
                        "owner": stat_info.get("owner", ""),
                        "risk": "HIGH"
                    })
                    count += 1
            
            process.terminate()
        except Exception as e:
            print(f"Error buscando archivos world-writable: {e}")
        
        return results
    
    def check_critical_file_permissions(self) -> List[Dict]:
        """Verificar permisos de archivos críticos"""
        results = []
        expected_perms = {
            "/etc/passwd": "644",
            "/etc/shadow": "640",
            "/etc/group": "644",
            "/etc/gshadow": "640",
            "/etc/ssh/sshd_config": "600"
        }
        
        for filepath, expected in expected_perms.items():
            if os.path.exists(filepath):
                stat_info = self.get_file_info(filepath)
                actual_perms = stat_info.get("octal_permissions", "")
                
                is_correct = actual_perms == expected or (
                    filepath == "/etc/shadow" and actual_perms == "600"
                )
                
                results.append({
                    "path": filepath,
                    "type": "Critical File",
                    "expected_permissions": expected,
                    "actual_permissions": actual_perms,
                    "owner": stat_info.get("owner", ""),
                    "status": "OK" if is_correct else "VULNERABLE",
                    "risk": "LOW" if is_correct else "CRITICAL"
                })
        
        return results
    
    def get_file_info(self, filepath: str) -> Dict:
        """Obtener información de un archivo"""
        try:
            stat = os.stat(filepath)
            import pwd
            import grp
            
            owner = pwd.getpwuid(stat.st_uid).pw_name
            group = grp.getgrgid(stat.st_gid).gr_name
            
            # Permisos en formato rwx
            perms = oct(stat.st_mode)[-3:]
            
            return {
                "permissions": self.format_permissions(stat.st_mode),
                "octal_permissions": perms,
                "owner": f"{owner}:{group}",
                "size": stat.st_size
            }
        except Exception as e:
            return {
                "permissions": "unknown",
                "octal_permissions": "000",
                "owner": "unknown",
                "size": 0
            }
    
    def format_permissions(self, mode: int) -> str:
        """Formatear permisos en formato rwxrwxrwx"""
        perms = ""
        for who in "USR", "GRP", "OTH":
            for what in "R", "W", "X":
                if mode & getattr(os, f"{what}_{who}"):
                    perms += what.lower()
                else:
                    perms += "-"
        return perms
    
    def evaluate_suid_risk(self, filepath: str) -> str:
        """Evaluar riesgo de archivos SUID"""
        dangerous_suid = [
            "nmap", "vim", "find", "bash", "more", "less", "nano", "cp",
            "mv", "awk", "perl", "python", "ruby", "lua", "irb"
        ]
        
        filename = os.path.basename(filepath).lower()
        
        for dangerous in dangerous_suid:
            if dangerous in filename:
                return "CRITICAL"
        
        # SUID en binarios del sistema son generalmente seguros
        if filepath.startswith("/usr/bin") or filepath.startswith("/bin"):
            return "LOW"
        
        return "MEDIUM"
    
    def generate_report(self) -> Dict:
        """Generar reporte completo de permisos"""
        suid_files = self.find_suid_files()
        sgid_files = self.find_sgid_files()
        world_writable_dirs = self.find_world_writable_dirs()
        world_writable_files = self.find_world_writable_files()
        critical_files = self.check_critical_file_permissions()
        
        # Contar riesgos
        all_findings = suid_files + sgid_files + world_writable_dirs + world_writable_files + critical_files
        risk_summary = {"CRITICAL": 0, "HIGH": 0, "MEDIUM": 0, "LOW": 0}
        
        for finding in all_findings:
            risk = finding.get('risk', 'UNKNOWN')
            if risk in risk_summary:
                risk_summary[risk] += 1
        
        return {
            "suid_files": suid_files,
            "sgid_files": sgid_files,
            "world_writable_directories": world_writable_dirs,
            "world_writable_files": world_writable_files,
            "critical_files": critical_files,
            "risk_summary": risk_summary,
            "total_issues": len(all_findings),
            "recommendations": self.generate_recommendations(all_findings)
        }
    
    def generate_recommendations(self, findings: List[Dict]) -> List[str]:
        """Generar recomendaciones"""
        recommendations = []
        
        critical_count = sum(1 for f in findings if f.get('risk') == 'CRITICAL')
        high_count = sum(1 for f in findings if f.get('risk') == 'HIGH')
        
        if critical_count > 0:
            recommendations.append(
                f"🔴 CRÍTICO: Se encontraron {critical_count} problemas críticos de permisos que requieren atención inmediata"
            )
        
        if high_count > 0:
            recommendations.append(
                f"🟠 ALTO: Se encontraron {high_count} problemas de alto riesgo en permisos de archivos"
            )
        
        # Recomendaciones específicas para SUID
        suid_critical = [f for f in findings if f.get('type') == 'SUID' and f.get('risk') == 'CRITICAL']
        if suid_critical:
            recommendations.append(
                f"⚠️ Archivos SUID peligrosos detectados. Revisar: {', '.join([f['path'] for f in suid_critical[:3]])}"
            )
        
        if not recommendations:
            recommendations.append("✅ No se encontraron problemas críticos de permisos")
        
        return recommendations
