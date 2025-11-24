import { useState } from 'react'
import axios from 'axios'

interface FullReportProps {
  apiUrl: string
}

export default function FullReport({ apiUrl }: FullReportProps) {
  const [loading, setLoading] = useState(false)
  const [report, setReport] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const generateReport = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await axios.get(`${apiUrl}/api/report/full`)
      setReport(response.data)
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Error al generar reporte')
    } finally {
      setLoading(false)
    }
  }

  const downloadReport = () => {
    if (!report) return

    const reportText = JSON.stringify(report, null, 2)
    const blob = new Blob([reportText], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `security_report_${new Date().toISOString()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      <div className="cyber-card">
        <h2 className="text-3xl font-bold text-neon-blue mb-6 flex items-center">
          <span className="mr-3">📄</span> Reporte de Seguridad Completo
        </h2>

        <p className="text-gray-300 mb-6">
          Generar un reporte completo que ejecuta todos los módulos de análisis y compilará 
          los resultados en un documento unificado.
        </p>

        <div className="flex gap-4">
          <button
            onClick={generateReport}
            disabled={loading}
            className="cyber-button"
          >
            {loading ? 'Generando...' : 'Generar Reporte Completo'}
          </button>

          {report && (
            <button
              onClick={downloadReport}
              className="cyber-button-pink"
            >
              Descargar Reporte (JSON)
            </button>
          )}
        </div>

        {error && (
          <div className="mt-4 p-4 border-2 border-red-500 rounded bg-red-900/20 text-red-400">
            {error}
          </div>
        )}
      </div>

      {loading && (
        <div className="cyber-card text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-neon-blue"></div>
          <p className="mt-4 text-neon-blue">Ejecutando análisis completo del sistema...</p>
          <p className="text-sm text-gray-400 mt-2">Esto puede tomar varios minutos</p>
        </div>
      )}

      {report && !loading && (
        <div className="space-y-4">
          {/* Header */}
          <div className="cyber-card">
            <h3 className="text-2xl font-bold text-neon-pink mb-4">Información del Reporte</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-400">Fecha de Generación</p>
                <p className="text-neon-blue font-bold">{new Date(report.timestamp).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Versión del Toolkit</p>
                <p className="text-neon-green font-bold">v1.0.0</p>
              </div>
            </div>
          </div>

          {/* Executive Summary */}
          <div className="cyber-card">
            <h3 className="text-2xl font-bold text-neon-blue mb-4">Resumen Ejecutivo</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Port Scan Summary */}
              {report.port_scan && (
                <div className="p-4 bg-cyber-dark/50 border border-neon-blue rounded">
                  <h4 className="text-lg font-bold text-neon-blue mb-2">Escaneo de Puertos</h4>
                  <p className="text-3xl font-bold text-white">{report.port_scan.total_open_ports || 0}</p>
                  <p className="text-sm text-gray-400">Puertos abiertos</p>
                  {report.port_scan.risk_summary && (
                    <div className="mt-2 text-xs">
                      <span className="text-red-500">{report.port_scan.risk_summary.CRITICAL || 0} Críticos</span>
                      {' | '}
                      <span className="text-orange-500">{report.port_scan.risk_summary.HIGH || 0} Alto</span>
                    </div>
                  )}
                </div>
              )}

              {/* Permissions Summary */}
              {report.permissions && (
                <div className="p-4 bg-cyber-dark/50 border border-neon-pink rounded">
                  <h4 className="text-lg font-bold text-neon-pink mb-2">Permisos</h4>
                  <p className="text-3xl font-bold text-white">{report.permissions.total_issues || 0}</p>
                  <p className="text-sm text-gray-400">Problemas detectados</p>
                  {report.permissions.risk_summary && (
                    <div className="mt-2 text-xs">
                      <span className="text-red-500">{report.permissions.risk_summary.CRITICAL || 0} Críticos</span>
                      {' | '}
                      <span className="text-orange-500">{report.permissions.risk_summary.HIGH || 0} Alto</span>
                    </div>
                  )}
                </div>
              )}

              {/* Services Summary */}
              {report.services && (
                <div className="p-4 bg-cyber-dark/50 border border-neon-green rounded">
                  <h4 className="text-lg font-bold text-neon-green mb-2">Servicios</h4>
                  <p className="text-3xl font-bold text-white">{report.services.dangerous_services_found || 0}</p>
                  <p className="text-sm text-gray-400">Servicios peligrosos</p>
                  {report.services.risk_summary && (
                    <div className="mt-2 text-xs">
                      <span className="text-red-500">{report.services.risk_summary.HIGH || 0} Alto riesgo</span>
                    </div>
                  )}
                </div>
              )}

              {/* Firewall Summary */}
              {report.firewall && (
                <div className="p-4 bg-cyber-dark/50 border border-neon-purple rounded">
                  <h4 className="text-lg font-bold text-neon-purple mb-2">Firewall</h4>
                  <p className="text-2xl font-bold text-white">
                    {report.firewall.status?.active ? '🛡️ Activo' : '⚠️ Inactivo'}
                  </p>
                  <p className="text-sm text-gray-400">Estado del firewall</p>
                </div>
              )}

              {/* Security Checklist Summary */}
              {report.security_checklist && report.security_checklist.score && (
                <div className="p-4 bg-cyber-dark/50 border border-yellow-500 rounded">
                  <h4 className="text-lg font-bold text-yellow-500 mb-2">Puntuación</h4>
                  <p className="text-3xl font-bold text-white">{report.security_checklist.score.score || 0}%</p>
                  <p className="text-sm text-gray-400">{report.security_checklist.score.level || 'N/A'}</p>
                  <div className="mt-2 text-xs">
                    <span className="text-green-400">{report.security_checklist.score.passed || 0} ✓</span>
                    {' | '}
                    <span className="text-red-400">{report.security_checklist.score.failed || 0} ✗</span>
                  </div>
                </div>
              )}

              {/* Logs Summary */}
              {report.logs && report.logs.authentication_logs && (
                <div className="p-4 bg-cyber-dark/50 border border-orange-500 rounded">
                  <h4 className="text-lg font-bold text-orange-500 mb-2">Logs</h4>
                  <p className="text-2xl font-bold text-white">
                    {report.logs.authentication_logs.failed_ssh_attempts?.total_attempts || 0}
                  </p>
                  <p className="text-sm text-gray-400">Intentos SSH fallidos</p>
                  {report.logs.authentication_logs.bruteforce_detected && (
                    <p className="text-xs text-red-400 mt-2">
                      {report.logs.authentication_logs.bruteforce_detected.length} IPs sospechosas
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Critical Issues */}
          <div className="cyber-card border-2 border-red-500">
            <h3 className="text-2xl font-bold text-red-500 mb-4">🚨 Problemas Críticos</h3>
            
            <div className="space-y-3">
              {/* Firewall Issues */}
              {report.firewall && !report.firewall.status?.active && (
                <div className="p-3 bg-red-900/20 border border-red-500 rounded">
                  <p className="font-bold text-red-400">Firewall desactivado</p>
                  <p className="text-sm text-gray-300">El firewall UFW no está activo. Activar inmediatamente.</p>
                </div>
              )}

              {/* Critical Port Issues */}
              {report.port_scan && report.port_scan.risk_summary?.CRITICAL > 0 && (
                <div className="p-3 bg-red-900/20 border border-red-500 rounded">
                  <p className="font-bold text-red-400">Puertos críticos expuestos</p>
                  <p className="text-sm text-gray-300">
                    {report.port_scan.risk_summary.CRITICAL} puerto(s) con riesgo crítico detectados
                  </p>
                </div>
              )}

              {/* Critical Security Checks */}
              {report.security_checklist && report.security_checklist.critical_failures?.length > 0 && (
                <div className="p-3 bg-red-900/20 border border-red-500 rounded">
                  <p className="font-bold text-red-400">
                    {report.security_checklist.critical_failures.length} verificación(es) crítica(s) fallaron
                  </p>
                  <ul className="text-sm text-gray-300 mt-2 space-y-1">
                    {report.security_checklist.critical_failures.slice(0, 3).map((fail: any, idx: number) => (
                      <li key={idx}>• {fail.name}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* All Recommendations */}
          <div className="cyber-card">
            <h3 className="text-2xl font-bold text-neon-green mb-4">Todas las Recomendaciones</h3>
            
            <div className="space-y-4">
              {Object.entries(report).map(([module, data]: [string, any]) => {
                if (data && data.recommendations && data.recommendations.length > 0) {
                  return (
                    <div key={module}>
                      <h4 className="text-lg font-bold text-neon-blue mb-2 uppercase">{module.replace('_', ' ')}</h4>
                      <ul className="space-y-1">
                        {data.recommendations.map((rec: string, idx: number) => (
                          <li key={idx} className="text-gray-300 pl-4 border-l-2 border-neon-green text-sm">
                            {rec}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )
                }
                return null
              })}
            </div>
          </div>

          {/* Raw Data */}
          <div className="cyber-card">
            <h3 className="text-2xl font-bold text-neon-blue mb-4">Datos Completos (JSON)</h3>
            <div className="terminal max-h-96 overflow-auto">
              <pre className="text-xs">{JSON.stringify(report, null, 2)}</pre>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
