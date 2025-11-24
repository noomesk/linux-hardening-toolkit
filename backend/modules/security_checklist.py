import subprocess
import json
import re
import os
from typing import List, Dict
from pathlib import Path


class SecurityChecklist:
    def __init__(self):
        self.config_path = Path(__file__).parent.parent / "config" / "security_rules.json"
        self.load_config()
    
    def load_config(self):
        """Cargar reglas de seguridad"""
        try:
            with open(self.config_path, 'r') as f:
                config = json.load(f)
                self.security_checks = config.get('security_checks', [])
        except Exception as e:
            print(f"Error cargando configuración: {e}")
            self.security_checks = []
    
    def run_command_check(self, check: Dict) -> Dict:
        """Ejecutar verificación basada en comando"""
        command = check.get('command')
        expected_pattern = check.get('expected_pattern', '')
        
        try:
            result = subprocess.run(
                command.split(),
                capture_output=True,
                text=True,
                timeout=10
            )
            
            output = result.stdout.strip()
            
            # Verificar si cumple con el patrón esperado
            if expected_pattern:
                # Soportar regex
                if re.search(expected_pattern, output):
                    status = "PASS"
                    message = f"Configuración correcta: {output}"
                else:
                    status = "FAIL"
                    message = f"No cumple con el patrón esperado. Salida: {output}"
            else:
                status = "PASS" if result.returncode == 0 else "FAIL"
                message = output
            
            return {
                "id": check.get('id'),
                "name": check.get('name'),
                "status": status,
                "message": message,
                "severity": check.get('severity'),
                "category": check.get('category'),
                "output": output
            }
        
        except subprocess.TimeoutExpired:
            return {
                "id": check.get('id'),
                "name": check.get('name'),
                "status": "ERROR",
                "message": "Timeout ejecutando comando",
                "severity": check.get('severity'),
                "category": check.get('category')
            }
        except Exception as e:
            return {
                "id": check.get('id'),
                "name": check.get('name'),
                "status": "ERROR" if not check.get('optional') else "SKIP",
                "message": f"Error: {str(e)}",
                "severity": check.get('severity'),
                "category": check.get('category')
            }
    
    def run_file_check(self, check: Dict) -> Dict:
        """Ejecutar verificación basada en archivo"""
        filepath = check.get('file')
        pattern = check.get('pattern', '')
        
        if not os.path.exists(filepath):
            return {
                "id": check.get('id'),
                "name": check.get('name'),
                "status": "ERROR" if not check.get('optional') else "SKIP",
                "message": f"Archivo no encontrado: {filepath}",
                "severity": check.get('severity'),
                "category": check.get('category')
            }
        
        try:
            with open(filepath, 'r') as f:
                content = f.read()
            
            # Buscar patrón en el archivo
            if pattern:
                if re.search(pattern, content, re.MULTILINE):
                    status = "PASS"
                    message = f"Configuración encontrada en {filepath}"
                else:
                    status = "FAIL"
                    message = f"Patrón no encontrado en {filepath}"
            else:
                status = "PASS"
                message = f"Archivo existe: {filepath}"
            
            return {
                "id": check.get('id'),
                "name": check.get('name'),
                "status": status,
                "message": message,
                "severity": check.get('severity'),
                "category": check.get('category'),
                "file": filepath
            }
        
        except Exception as e:
            return {
                "id": check.get('id'),
                "name": check.get('name'),
                "status": "ERROR",
                "message": f"Error leyendo archivo: {str(e)}",
                "severity": check.get('severity'),
                "category": check.get('category')
            }
    
    def run_single_check(self, check: Dict) -> Dict:
        """Ejecutar una verificación individual"""
        if 'command' in check:
            return self.run_command_check(check)
        elif 'file' in check:
            return self.run_file_check(check)
        else:
            return {
                "id": check.get('id'),
                "name": check.get('name'),
                "status": "ERROR",
                "message": "Configuración de verificación inválida",
                "severity": check.get('severity'),
                "category": check.get('category')
            }
    
    def run_all_checks(self) -> List[Dict]:
        """Ejecutar todas las verificaciones"""
        results = []
        
        for check in self.security_checks:
            result = self.run_single_check(check)
            results.append(result)
        
        return results
    
    def run_checks_by_category(self, category: str) -> List[Dict]:
        """Ejecutar verificaciones por categoría"""
        filtered_checks = [c for c in self.security_checks if c.get('category') == category]
        results = []
        
        for check in filtered_checks:
            result = self.run_single_check(check)
            results.append(result)
        
        return results
    
    def calculate_score(self, results: List[Dict]) -> Dict:
        """Calcular puntuación de seguridad"""
        total = len(results)
        passed = len([r for r in results if r.get('status') == 'PASS'])
        failed = len([r for r in results if r.get('status') == 'FAIL'])
        errors = len([r for r in results if r.get('status') == 'ERROR'])
        skipped = len([r for r in results if r.get('status') == 'SKIP'])
        
        # Calcular puntuación (0-100)
        if total > 0:
            score = (passed / (total - skipped)) * 100 if (total - skipped) > 0 else 0
        else:
            score = 0
        
        # Determinar nivel de seguridad
        if score >= 90:
            level = "EXCELLENT"
            color = "green"
        elif score >= 75:
            level = "GOOD"
            color = "blue"
        elif score >= 50:
            level = "FAIR"
            color = "yellow"
        else:
            level = "POOR"
            color = "red"
        
        return {
            "total_checks": total,
            "passed": passed,
            "failed": failed,
            "errors": errors,
            "skipped": skipped,
            "score": round(score, 2),
            "level": level,
            "color": color
        }
    
    def categorize_results(self, results: List[Dict]) -> Dict:
        """Categorizar resultados por categoría"""
        categories = {}
        
        for result in results:
            category = result.get('category', 'other')
            if category not in categories:
                categories[category] = []
            categories[category].append(result)
        
        return categories
    
    def get_critical_failures(self, results: List[Dict]) -> List[Dict]:
        """Obtener fallos críticos"""
        return [
            r for r in results
            if r.get('status') == 'FAIL' and r.get('severity') == 'CRITICAL'
        ]
    
    def get_high_failures(self, results: List[Dict]) -> List[Dict]:
        """Obtener fallos de alta severidad"""
        return [
            r for r in results
            if r.get('status') == 'FAIL' and r.get('severity') == 'HIGH'
        ]
    
    def generate_report(self) -> Dict:
        """Generar reporte completo de checklist"""
        results = self.run_all_checks()
        score = self.calculate_score(results)
        categories = self.categorize_results(results)
        critical_failures = self.get_critical_failures(results)
        high_failures = self.get_high_failures(results)
        
        return {
            "results": results,
            "score": score,
            "categories": categories,
            "critical_failures": critical_failures,
            "high_failures": high_failures,
            "recommendations": self.generate_recommendations(critical_failures, high_failures, score)
        }
    
    def generate_recommendations(self, critical: List[Dict], high: List[Dict], score: Dict) -> List[str]:
        """Generar recomendaciones"""
        recommendations = []
        
        if critical:
            recommendations.append(
                f"🔴 CRÍTICO: {len(critical)} verificaciones críticas fallaron - Acción inmediata requerida"
            )
            for check in critical[:3]:
                recommendations.append(f"  - {check['name']}: {check['message']}")
        
        if high:
            recommendations.append(
                f"🟠 ALTO: {len(high)} verificaciones de alta prioridad fallaron"
            )
        
        score_value = score.get('score', 0)
        if score_value < 50:
            recommendations.append(
                "⚠️ Puntuación de seguridad baja. Se requiere hardening completo del sistema"
            )
        elif score_value < 75:
            recommendations.append(
                "⚠️ Puntuación de seguridad media. Mejorar configuraciones de seguridad"
            )
        elif score_value >= 90:
            recommendations.append(
                "✅ Excelente puntuación de seguridad. Mantener buenas prácticas"
            )
        
        if not recommendations:
            recommendations.append("✅ Todas las verificaciones pasaron exitosamente")
        
        return recommendations
