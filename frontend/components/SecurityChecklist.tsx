import { useState } from 'react'
import axios from 'axios'

interface SecurityChecklistProps {
  apiUrl: string
}

export default function SecurityChecklist({ apiUrl }: SecurityChecklistProps) {
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const runChecklist = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await axios.get(`${apiUrl}/api/checklist/run`)
      setResults(response.data)
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Error al ejecutar checklist')
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PASS': return '✅'
      case 'FAIL': return '❌'
      case 'ERROR': return '⚠️'
      case 'SKIP': return '⏭️'
      default: return '❓'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PASS': return 'text-green-400'
      case 'FAIL': return 'text-red-400'
      case 'ERROR': return 'text-yellow-400'
      case 'SKIP': return 'text-gray-400'
      default: return 'text-gray-500'
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
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
          <span className="mr-3">✅</span> Checklist de Seguridad
        </h2>

        <p className="text-gray-300 mb-6">
          Ejecutar verificaciones completas de seguridad del sistema según mejores prácticas 
          y estándares de hardening.
        </p>

        <button
          onClick={runChecklist}
          disabled={loading}
          className="cyber-button w-full md:w-auto"
        >
          {loading ? 'Ejecutando...' : 'Ejecutar Checklist Completo'}
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
          <p className="mt-4 text-neon-blue">Ejecutando verificaciones de seguridad...</p>
        </div>
      )}

      {results && !loading && (
        <div className="space-y-4">
          {/* Security Score */}
          <div className="cyber-card">
            <h3 className="text-2xl font-bold text-neon-pink mb-4">Puntuación de Seguridad</h3>
            
            <div className="text-center mb-6">
              <div className={`text-6xl font-black mb-2 ${
                results.score?.level === 'EXCELLENT' ? 'text-green-400' :
                results.score?.level === 'GOOD' ? 'text-blue-400' :
                results.score?.level === 'FAIR' ? 'text-yellow-400' : 'text-red-400'
              }`}>
                {results.score?.score || 0}%
              </div>
              <div className={`text-2xl font-bold ${
                results.score?.level === 'EXCELLENT' ? 'text-green-400' :
                results.score?.level === 'GOOD' ? 'text-blue-400' :
                results.score?.level === 'FAIR' ? 'text-yellow-400' : 'text-red-400'
              }`}>
                {results.score?.level || 'UNKNOWN'}
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-green-900/20 border border-green-500 rounded">
                <p className="text-2xl font-bold text-green-400">{results.score?.passed || 0}</p>
                <p className="text-sm text-gray-400">Pasaron</p>
              </div>
              <div className="text-center p-3 bg-red-900/20 border border-red-500 rounded">
                <p className="text-2xl font-bold text-red-400">{results.score?.failed || 0}</p>
                <p className="text-sm text-gray-400">Fallaron</p>
              </div>
              <div className="text-center p-3 bg-yellow-900/20 border border-yellow-500 rounded">
                <p className="text-2xl font-bold text-yellow-400">{results.score?.errors || 0}</p>
                <p className="text-sm text-gray-400">Errores</p>
              </div>
              <div className="text-center p-3 bg-gray-900/20 border border-gray-500 rounded">
                <p className="text-2xl font-bold text-gray-400">{results.score?.skipped || 0}</p>
                <p className="text-sm text-gray-400">Omitidas</p>
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

          {/* Critical Failures */}
          {results.critical_failures && results.critical_failures.length > 0 && (
            <div className="cyber-card border-2 border-red-500">
              <h3 className="text-2xl font-bold text-red-500 mb-4">🚨 Fallos Críticos</h3>
              <div className="space-y-3">
                {results.critical_failures.map((check: any, idx: number) => (
                  <div key={idx} className="p-3 bg-red-900/20 border border-red-500 rounded">
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">❌</span>
                      <div className="flex-1">
                        <p className="font-bold text-red-400">{check.name}</p>
                        <p className="text-sm text-gray-300 mt-1">{check.message}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Results by Category */}
          {results.categories && (
            <div className="cyber-card">
              <h3 className="text-2xl font-bold text-neon-blue mb-4">Resultados por Categoría</h3>
              
              {Object.entries(results.categories).map(([category, checks]: [string, any]) => (
                <div key={category} className="mb-6 last:mb-0">
                  <h4 className="text-xl font-bold text-neon-pink mb-3 uppercase">{category}</h4>
                  <div className="space-y-2">
                    {checks.map((check: any, idx: number) => (
                      <div 
                        key={idx} 
                        className={`p-3 rounded border ${
                          check.status === 'PASS' ? 'bg-green-900/10 border-green-500/30' :
                          check.status === 'FAIL' ? 'bg-red-900/10 border-red-500/30' :
                          check.status === 'ERROR' ? 'bg-yellow-900/10 border-yellow-500/30' :
                          'bg-gray-900/10 border-gray-500/30'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <span className="text-xl">{getStatusIcon(check.status)}</span>
                          <div className="flex-1">
                            <div className="flex items-start justify-between gap-2">
                              <p className={`font-bold ${getStatusColor(check.status)}`}>
                                {check.name}
                              </p>
                              <span className={`text-xs font-bold ${getSeverityColor(check.severity)}`}>
                                {check.severity}
                              </span>
                            </div>
                            <p className="text-sm text-gray-400 mt-1">{check.message}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* All Results Table */}
          <div className="cyber-card">
            <h3 className="text-2xl font-bold text-neon-blue mb-4">Todos los Resultados</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b-2 border-neon-blue">
                  <tr>
                    <th className="pb-3 px-2">Estado</th>
                    <th className="pb-3 px-2">Verificación</th>
                    <th className="pb-3 px-2">Categoría</th>
                    <th className="pb-3 px-2">Severidad</th>
                    <th className="pb-3 px-2">Mensaje</th>
                  </tr>
                </thead>
                <tbody>
                  {results.results && results.results.map((check: any, idx: number) => (
                    <tr key={idx} className="border-b border-gray-700 hover:bg-cyber-dark/50">
                      <td className="py-2 px-2">
                        <span className={getStatusColor(check.status)}>
                          {getStatusIcon(check.status)} {check.status}
                        </span>
                      </td>
                      <td className="py-2 px-2 font-bold">{check.name}</td>
                      <td className="py-2 px-2 text-xs text-gray-400">{check.category}</td>
                      <td className="py-2 px-2">
                        <span className={getSeverityColor(check.severity)}>
                          {check.severity}
                        </span>
                      </td>
                      <td className="py-2 px-2 text-xs text-gray-400">{check.message}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
