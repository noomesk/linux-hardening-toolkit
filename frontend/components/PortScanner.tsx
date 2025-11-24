import { useState } from 'react'
import axios from 'axios'

interface PortScannerProps {
  apiUrl: string
}

export default function PortScanner({ apiUrl }: PortScannerProps) {
  const [loading, setLoading] = useState(false)
  const [scanType, setScanType] = useState('common')
  const [results, setResults] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const runScan = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await axios.post(`${apiUrl}/api/scan-ports`, {
        scan_type: scanType,
        host: '127.0.0.1'
      })
      setResults(response.data)
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Error al escanear puertos')
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
          <span className="mr-3">🔍</span> Escaneo de Puertos
        </h2>

        <div className="mb-6">
          <label className="block text-sm font-bold mb-2 text-neon-green">Tipo de Escaneo:</label>
          <select
            value={scanType}
            onChange={(e) => setScanType(e.target.value)}
            className="cyber-input w-full md:w-auto"
            disabled={loading}
          >
            <option value="common">Puertos Comunes</option>
            <option value="netstat">Netstat/SS (Puertos Activos)</option>
          </select>
        </div>

        <button
          onClick={runScan}
          disabled={loading}
          className="cyber-button w-full md:w-auto"
        >
          {loading ? 'Escaneando...' : 'Iniciar Escaneo'}
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
          <p className="mt-4 text-neon-blue">Escaneando puertos...</p>
        </div>
      )}

      {results && !loading && (
        <div className="space-y-4">
          {/* Summary */}
          <div className="cyber-card">
            <h3 className="text-2xl font-bold text-neon-pink mb-4">Resumen</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-3xl font-bold text-neon-blue">{results.total_open_ports}</p>
                <p className="text-sm text-gray-400">Puertos Abiertos</p>
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

          {/* Ports Table */}
          <div className="cyber-card">
            <h3 className="text-2xl font-bold text-neon-blue mb-4">Puertos Detectados</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="border-b-2 border-neon-blue">
                  <tr>
                    <th className="pb-3 px-2">Puerto</th>
                    <th className="pb-3 px-2">Servicio</th>
                    <th className="pb-3 px-2">Estado</th>
                    <th className="pb-3 px-2">Riesgo</th>
                    <th className="pb-3 px-2">Descripción</th>
                  </tr>
                </thead>
                <tbody>
                  {results.ports && results.ports.map((port: any, idx: number) => (
                    <tr key={idx} className="border-b border-gray-700 hover:bg-cyber-dark/50">
                      <td className="py-3 px-2 font-bold text-neon-blue">{port.port}</td>
                      <td className="py-3 px-2">{port.service}</td>
                      <td className="py-3 px-2">
                        <span className="text-green-400">{port.status}</span>
                      </td>
                      <td className="py-3 px-2">
                        <span className={`font-bold ${getRiskColor(port.risk)}`}>
                          {port.risk}
                        </span>
                      </td>
                      <td className="py-3 px-2 text-sm text-gray-400">{port.description}</td>
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
