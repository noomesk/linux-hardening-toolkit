import { useState } from 'react'
import axios from 'axios'

interface PermissionCheckProps {
  apiUrl: string
}

export default function PermissionCheck({ apiUrl }: PermissionCheckProps) {
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const runCheck = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await axios.get(`${apiUrl}/api/check-permissions`)
      setResults(response.data)
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Error al verificar permisos')
    } finally {
      setLoading(false)
    }
  }

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'CRITICAL': return 'text-red-500'
      case 'HIGH': return 'text-orange-500'
      case 'MEDIUM': return 'text-yellow-500'
      case 'LOW': return 'text-green-500'
      default: return 'text-gray-500'
    }
  }

  return (
    <div className="space-y-6">
      <div className="cyber-card">
        <h2 className="text-3xl font-bold text-neon-blue mb-6 flex items-center">
          <span className="mr-3">🔐</span> Verificación de Permisos Peligrosos
        </h2>

        <p className="text-gray-300 mb-6">
          Esta herramienta busca archivos con permisos peligrosos como SUID, SGID, 
          world-writable, y verifica permisos de archivos críticos del sistema.
        </p>

        <button
          onClick={runCheck}
          disabled={loading}
          className="cyber-button w-full md:w-auto"
        >
          {loading ? 'Verificando...' : 'Iniciar Verificación'}
        </button>

        {error && (
          <div className="mt-4 p-4 border-2 border-red-500 rounded bg-red-900/20 text-red-400">
            {error}
          </div>
        )}
      </div>

      {loading && (
        <div className="cyber-card text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-neon-blue"></div>
          <p className="mt-4 text-neon-blue">Escaneando permisos del sistema...</p>
        </div>
      )}

      {results && !loading && (
        <div className="space-y-4">
          {/* Summary */}
          <div className="cyber-card">
            <h3 className="text-2xl font-bold text-neon-pink mb-4">Resumen</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-3xl font-bold text-neon-blue">{results.total_issues || 0}</p>
                <p className="text-sm text-gray-400">Total Problemas</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-red-500">{results.risk_summary?.CRITICAL || 0}</p>
                <p className="text-sm text-gray-400">Críticos</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-orange-500">{results.risk_summary?.HIGH || 0}</p>
                <p className="text-sm text-gray-400">Alto Riesgo</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-yellow-500">{results.risk_summary?.MEDIUM || 0}</p>
                <p className="text-sm text-gray-400">Riesgo Medio</p>
              </div>
            </div>
          </div>

          {/* Recommendations */}
          {results.recommendations && results.recommendations.length > 0 && (
            <div className="cyber-card">
              <h3 className="text-2xl font-bold text-neon-green mb-4">Recomendaciones</h3>
              <ul className="space-y-2">
                {results.recommendations.map((rec: string, idx: number) => (
                  <li key={idx} className="text-gray-300 pl-4 border-l-2 border-neon-green">
                    {rec}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* SUID Files */}
          {results.suid_files && results.suid_files.length > 0 && (
            <div className="cyber-card">
              <h3 className="text-2xl font-bold text-neon-blue mb-4">
                Archivos SUID ({results.suid_files.length})
              </h3>
              <div className="overflow-x-auto max-h-96">
                <table className="w-full text-left text-sm">
                  <thead className="border-b-2 border-neon-blue">
                    <tr>
                      <th className="pb-3 px-2">Ruta</th>
                      <th className="pb-3 px-2">Permisos</th>
                      <th className="pb-3 px-2">Owner</th>
                      <th className="pb-3 px-2">Riesgo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.suid_files.slice(0, 20).map((file: any, idx: number) => (
                      <tr key={idx} className="border-b border-gray-700 hover:bg-cyber-dark/50">
                        <td className="py-2 px-2 font-mono text-xs">{file.path}</td>
                        <td className="py-2 px-2">{file.permissions}</td>
                        <td className="py-2 px-2 text-xs">{file.owner}</td>
                        <td className="py-2 px-2">
                          <span className={`font-bold ${getRiskColor(file.risk)}`}>
                            {file.risk}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Critical Files */}
          {results.critical_files && results.critical_files.length > 0 && (
            <div className="cyber-card">
              <h3 className="text-2xl font-bold text-neon-blue mb-4">Archivos Críticos del Sistema</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="border-b-2 border-neon-blue">
                    <tr>
                      <th className="pb-3 px-2">Archivo</th>
                      <th className="pb-3 px-2">Esperado</th>
                      <th className="pb-3 px-2">Actual</th>
                      <th className="pb-3 px-2">Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.critical_files.map((file: any, idx: number) => (
                      <tr key={idx} className="border-b border-gray-700 hover:bg-cyber-dark/50">
                        <td className="py-2 px-2 font-mono text-xs">{file.path}</td>
                        <td className="py-2 px-2">{file.expected_permissions}</td>
                        <td className="py-2 px-2">{file.actual_permissions}</td>
                        <td className="py-2 px-2">
                          <span className={file.status === 'OK' ? 'text-green-400' : 'text-red-400 font-bold'}>
                            {file.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* World Writable */}
          {results.world_writable_directories && results.world_writable_directories.length > 0 && (
            <div className="cyber-card">
              <h3 className="text-2xl font-bold text-orange-500 mb-4">
                Directorios World-Writable ({results.world_writable_directories.length})
              </h3>
              <div className="overflow-x-auto max-h-64">
                <ul className="space-y-1 font-mono text-xs">
                  {results.world_writable_directories.slice(0, 15).map((dir: any, idx: number) => (
                    <li key={idx} className="text-gray-300 pl-2 border-l-2 border-orange-500">
                      {dir.path} - {dir.permissions}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
