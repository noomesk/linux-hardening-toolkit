import { useState } from 'react'
import axios from 'axios'

interface ServiceManagerProps {
  apiUrl: string
}

export default function ServiceManager({ apiUrl }: ServiceManagerProps) {
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const scanServices = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await axios.get(`${apiUrl}/api/services/dangerous`)
      setResults(response.data)
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Error al escanear servicios')
    } finally {
      setLoading(false)
    }
  }

  const handleServiceAction = async (serviceName: string, action: string) => {
    setActionLoading(serviceName)
    try {
      const response = await axios.post(`${apiUrl}/api/services/action`, {
        service_name: serviceName,
        action: action
      })
      
      if (response.data.success) {
        alert(`Servicio ${serviceName} ${action === 'stop_and_disable' ? 'detenido y deshabilitado' : action === 'stop' ? 'detenido' : 'deshabilitado'} exitosamente`)
        // Recargar resultados
        scanServices()
      } else {
        alert(`Error: ${response.data.message}`)
      }
    } catch (err: any) {
      alert(`Error al ejecutar acción: ${err.response?.data?.detail || err.message}`)
    } finally {
      setActionLoading(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="cyber-card">
        <h2 className="text-3xl font-bold text-neon-blue mb-6 flex items-center">
          <span className="mr-3">⚙️</span> Gestión de Servicios Inseguros
        </h2>

        <p className="text-gray-300 mb-6">
          Detectar y deshabilitar servicios conocidos por ser inseguros o vulnerables.
        </p>

        <button
          onClick={scanServices}
          disabled={loading}
          className="cyber-button w-full md:w-auto"
        >
          {loading ? 'Escaneando...' : 'Escanear Servicios Peligrosos'}
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
          <p className="mt-4 text-neon-blue">Escaneando servicios del sistema...</p>
        </div>
      )}

      {results && !loading && (
        <div className="space-y-4">
          {/* Summary */}
          <div className="cyber-card">
            <h3 className="text-2xl font-bold text-neon-pink mb-4">Resumen</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-3xl font-bold text-neon-blue">{results.dangerous_services_found || 0}</p>
                <p className="text-sm text-gray-400">Servicios Peligrosos</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-red-500">{results.risk_summary?.HIGH || 0}</p>
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

          {/* Services Table */}
          {results.services && results.services.length > 0 ? (
            <div className="cyber-card">
              <h3 className="text-2xl font-bold text-neon-blue mb-4">Servicios Detectados</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="border-b-2 border-neon-blue">
                    <tr>
                      <th className="pb-3 px-2">Servicio</th>
                      <th className="pb-3 px-2">Estado</th>
                      <th className="pb-3 px-2">Riesgo</th>
                      <th className="pb-3 px-2">Razón</th>
                      <th className="pb-3 px-2">Alternativa</th>
                      <th className="pb-3 px-2">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.services.map((service: any, idx: number) => (
                      <tr key={idx} className="border-b border-gray-700 hover:bg-cyber-dark/50">
                        <td className="py-3 px-2 font-bold text-neon-blue">{service.name}</td>
                        <td className="py-3 px-2">
                          <span className={service.active ? 'text-red-400 font-bold' : 'text-yellow-400'}>
                            {service.active ? 'ACTIVO' : 'INACTIVO'} 
                            {service.enabled && ' (Habilitado)'}
                          </span>
                        </td>
                        <td className="py-3 px-2">
                          <span className={service.risk === 'HIGH' ? 'text-red-500 font-bold' : 'text-yellow-500'}>
                            {service.risk}
                          </span>
                        </td>
                        <td className="py-3 px-2 text-sm text-gray-400">{service.reason}</td>
                        <td className="py-3 px-2 text-sm text-neon-green">{service.alternative}</td>
                        <td className="py-3 px-2">
                          <button
                            onClick={() => handleServiceAction(service.name, 'stop_and_disable')}
                            disabled={actionLoading === service.name}
                            className="px-3 py-1 text-xs border border-neon-pink text-neon-pink rounded hover:bg-neon-pink hover:text-black transition"
                          >
                            {actionLoading === service.name ? 'Procesando...' : 'Detener y Deshabilitar'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="cyber-card text-center">
              <p className="text-neon-green text-xl">✅ No se encontraron servicios peligrosos activos</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
