import { useState } from 'react'
import axios from 'axios'

interface LogAnalyzerProps {
  apiUrl: string
}

export default function LogAnalyzer({ apiUrl }: LogAnalyzerProps) {
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const analyzeLogs = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await axios.get(`${apiUrl}/api/logs/analyze`)
      setResults(response.data)
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Error al analizar logs')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="cyber-card">
        <h2 className="text-3xl font-bold text-neon-blue mb-6 flex items-center">
          <span className="mr-3">📊</span> Análisis de Logs del Sistema
        </h2>

        <p className="text-gray-300 mb-6">
          Analizar logs de autenticación, sistema y fail2ban para detectar patrones de ataque 
          y actividad sospechosa.
        </p>

        <button
          onClick={analyzeLogs}
          disabled={loading}
          className="cyber-button w-full md:w-auto"
        >
          {loading ? 'Analizando...' : 'Analizar Logs'}
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
          <p className="mt-4 text-neon-blue">Analizando archivos de log...</p>
        </div>
      )}

      {results && !loading && (
        <div className="space-y-4">
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

          {/* Authentication Logs */}
          {results.authentication_logs && results.authentication_logs.available && (
            <div className="cyber-card">
              <h3 className="text-2xl font-bold text-neon-pink mb-4">Logs de Autenticación</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="text-center p-4 bg-red-900/20 border border-red-500 rounded">
                  <p className="text-3xl font-bold text-red-400">
                    {results.authentication_logs.failed_ssh_attempts?.total_attempts || 0}
                  </p>
                  <p className="text-sm text-gray-400">Intentos SSH Fallidos</p>
                </div>
                <div className="text-center p-4 bg-yellow-900/20 border border-yellow-500 rounded">
                  <p className="text-3xl font-bold text-yellow-400">
                    {results.authentication_logs.invalid_user_attempts?.total_attempts || 0}
                  </p>
                  <p className="text-sm text-gray-400">Usuarios Inválidos</p>
                </div>
                <div className="text-center p-4 bg-green-900/20 border border-green-500 rounded">
                  <p className="text-3xl font-bold text-green-400">
                    {results.authentication_logs.successful_logins?.total_logins || 0}
                  </p>
                  <p className="text-sm text-gray-400">Logins Exitosos</p>
                </div>
              </div>

              {/* Bruteforce Detection */}
              {results.authentication_logs.bruteforce_detected && 
               results.authentication_logs.bruteforce_detected.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-xl font-bold text-red-500 mb-3">🚨 Fuerza Bruta Detectada</h4>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="border-b-2 border-red-500">
                        <tr>
                          <th className="pb-2 px-2">IP</th>
                          <th className="pb-2 px-2">Intentos</th>
                          <th className="pb-2 px-2">Riesgo</th>
                        </tr>
                      </thead>
                      <tbody>
                        {results.authentication_logs.bruteforce_detected.map((item: any, idx: number) => (
                          <tr key={idx} className="border-b border-gray-700">
                            <td className="py-2 px-2 font-mono">{item.ip}</td>
                            <td className="py-2 px-2 text-red-400 font-bold">{item.attempts}</td>
                            <td className="py-2 px-2">
                              <span className={item.risk === 'HIGH' ? 'text-red-500 font-bold' : 'text-orange-500'}>
                                {item.risk}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Top Attackers */}
              {results.authentication_logs.failed_ssh_attempts?.top_attackers && 
               results.authentication_logs.failed_ssh_attempts.top_attackers.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-lg font-bold text-orange-500 mb-2">Top IPs con Intentos Fallidos</h4>
                  <div className="space-y-1">
                    {results.authentication_logs.failed_ssh_attempts.top_attackers.slice(0, 10).map((item: any, idx: number) => (
                      <div key={idx} className="flex justify-between items-center p-2 bg-cyber-dark/50 rounded">
                        <span className="font-mono text-sm">{item.ip}</span>
                        <span className="text-red-400 font-bold">{item.attempts} intentos</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* System Logs */}
          {results.system_logs && results.system_logs.available && (
            <div className="cyber-card">
              <h3 className="text-2xl font-bold text-neon-blue mb-4">Logs del Sistema</h3>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-red-400">{results.system_logs.errors_found || 0}</p>
                  <p className="text-sm text-gray-400">Errores</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-yellow-400">{results.system_logs.warnings_found || 0}</p>
                  <p className="text-sm text-gray-400">Advertencias</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-neon-blue">{results.system_logs.lines_analyzed || 0}</p>
                  <p className="text-sm text-gray-400">Líneas Analizadas</p>
                </div>
              </div>
            </div>
          )}

          {/* Fail2ban */}
          {results.fail2ban_logs && (
            <div className="cyber-card">
              <h3 className="text-2xl font-bold text-neon-green mb-4">Fail2ban</h3>
              
              {results.fail2ban_logs.available ? (
                <div>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="text-center">
                      <p className="text-3xl font-bold text-neon-green">{results.fail2ban_logs.total_bans || 0}</p>
                      <p className="text-sm text-gray-400">Total Baneos</p>
                    </div>
                    <div className="text-center">
                      <p className="text-3xl font-bold text-neon-blue">{results.fail2ban_logs.unique_ips_banned || 0}</p>
                      <p className="text-sm text-gray-400">IPs Únicas</p>
                    </div>
                  </div>

                  {results.fail2ban_logs.top_banned && results.fail2ban_logs.top_banned.length > 0 && (
                    <div>
                      <h4 className="text-lg font-bold text-neon-green mb-2">IPs Más Baneadas</h4>
                      <div className="space-y-1">
                        {results.fail2ban_logs.top_banned.slice(0, 10).map((item: any, idx: number) => (
                          <div key={idx} className="flex justify-between items-center p-2 bg-cyber-dark/50 rounded">
                            <span className="font-mono text-sm">{item.ip}</span>
                            <span className="text-neon-green font-bold">{item.bans} baneos</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center p-4 bg-yellow-900/20 border border-yellow-500 rounded">
                  <p className="text-yellow-400">
                    ⚠️ Fail2ban no está instalado o no tiene logs disponibles
                  </p>
                  <p className="text-sm text-gray-400 mt-2">
                    {results.fail2ban_logs.recommendation}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
