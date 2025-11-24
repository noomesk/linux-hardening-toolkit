import { useState, useEffect } from 'react'
import axios from 'axios'

interface FirewallConfigProps {
  apiUrl: string
}

export default function FirewallConfig({ apiUrl }: FirewallConfigProps) {
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    getStatus()
  }, [])

  const getStatus = async () => {
    try {
      const response = await axios.get(`${apiUrl}/api/firewall/status`)
      setStatus(response.data)
    } catch (err: any) {
      console.error('Error getting firewall status:', err)
    }
  }

  const executeAction = async (action: string, port?: number, protocol?: string) => {
    setLoading(true)
    setError(null)
    try {
      const response = await axios.post(`${apiUrl}/api/firewall/configure`, {
        action,
        port,
        protocol: protocol || 'tcp',
        ssh_port: 22
      })

      if (response.data.success) {
        alert(`Acción ejecutada exitosamente: ${action}`)
        getStatus()
      } else {
        alert(`Error: ${response.data.message}`)
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Error al configurar firewall')
    } finally {
      setLoading(false)
    }
  }

  const handleAllowPort = () => {
    const port = prompt('Ingrese el puerto a permitir:')
    if (port) {
      executeAction('allow_port', parseInt(port))
    }
  }

  const handleDenyPort = () => {
    const port = prompt('Ingrese el puerto a denegar:')
    if (port) {
      executeAction('deny_port', parseInt(port))
    }
  }

  return (
    <div className="space-y-6">
      <div className="cyber-card">
        <h2 className="text-3xl font-bold text-neon-blue mb-6 flex items-center">
          <span className="mr-3">🛡️</span> Configuración de Firewall
        </h2>

        <p className="text-gray-300 mb-6">
          Gestionar el firewall UFW del sistema. Configure reglas, habilite o deshabilite el firewall.
        </p>

        {error && (
          <div className="mt-4 p-4 border-2 border-red-500 rounded bg-red-900/20 text-red-400">
            {error}
          </div>
        )}
      </div>

      {/* Status */}
      <div className="cyber-card">
        <h3 className="text-2xl font-bold text-neon-pink mb-4">Estado del Firewall</h3>
        {status ? (
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="text-gray-400">Instalado:</span>
              <span className={status.installed ? 'text-green-400 font-bold' : 'text-red-400 font-bold'}>
                {status.installed ? 'SÍ' : 'NO'}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-gray-400">Activo:</span>
              <span className={status.active ? 'text-green-400 font-bold' : 'text-red-400 font-bold'}>
                {status.active ? 'SÍ' : 'NO'}
              </span>
            </div>
            {status.status_output && (
              <div className="mt-4">
                <p className="text-sm text-gray-400 mb-2">Salida de estado:</p>
                <pre className="terminal text-xs">{status.status_output}</pre>
              </div>
            )}
          </div>
        ) : (
          <p className="text-gray-400">Cargando estado...</p>
        )}
      </div>

      {/* Actions */}
      <div className="cyber-card">
        <h3 className="text-2xl font-bold text-neon-green mb-4">Acciones Rápidas</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={() => executeAction('enable')}
            disabled={loading || status?.active}
            className="cyber-button-blue disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Procesando...' : 'Habilitar UFW'}
          </button>

          <button
            onClick={() => executeAction('disable')}
            disabled={loading || !status?.active}
            className="cyber-button-pink disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Procesando...' : 'Deshabilitar UFW'}
          </button>

          <button
            onClick={() => executeAction('configure_basic')}
            disabled={loading}
            className="cyber-button disabled:opacity-50"
          >
            {loading ? 'Procesando...' : 'Configuración Básica'}
          </button>

          <button
            onClick={() => executeAction('reset')}
            disabled={loading}
            className="bg-cyber-dark border-2 border-red-500 text-red-500 px-6 py-3 rounded font-bold hover:bg-red-500 hover:text-black transition disabled:opacity-50"
          >
            {loading ? 'Procesando...' : 'Resetear Firewall'}
          </button>

          <button
            onClick={handleAllowPort}
            disabled={loading}
            className="cyber-button disabled:opacity-50"
          >
            Permitir Puerto
          </button>

          <button
            onClick={handleDenyPort}
            disabled={loading}
            className="cyber-button-pink disabled:opacity-50"
          >
            Denegar Puerto
          </button>
        </div>

        <div className="mt-6 p-4 bg-yellow-900/20 border border-yellow-500 rounded">
          <p className="text-yellow-400 text-sm">
            ⚠️ <strong>ADVERTENCIA:</strong> La configuración básica establece política de deny por defecto
            y permite solo SSH (puerto 22). Asegúrese de tener acceso SSH antes de habilitar.
          </p>
        </div>
      </div>

      {/* Common Configurations */}
      <div className="cyber-card">
        <h3 className="text-2xl font-bold text-neon-blue mb-4">Puertos Comunes</h3>
        <p className="text-gray-400 text-sm mb-4">Haga clic para permitir puertos comunes:</p>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { port: 22, name: 'SSH', color: 'green' },
            { port: 80, name: 'HTTP', color: 'blue' },
            { port: 443, name: 'HTTPS', color: 'blue' },
            { port: 3306, name: 'MySQL', color: 'yellow' },
            { port: 5432, name: 'PostgreSQL', color: 'yellow' },
            { port: 27017, name: 'MongoDB', color: 'yellow' },
            { port: 8080, name: 'HTTP-Alt', color: 'blue' },
            { port: 3000, name: 'Node.js', color: 'green' },
          ].map((item) => (
            <button
              key={item.port}
              onClick={() => executeAction('allow_port', item.port)}
              disabled={loading}
              className={`px-4 py-2 text-sm border-2 rounded transition disabled:opacity-50 ${
                item.color === 'green' ? 'border-neon-green text-neon-green hover:bg-neon-green hover:text-black' :
                item.color === 'blue' ? 'border-neon-blue text-neon-blue hover:bg-neon-blue hover:text-black' :
                'border-yellow-500 text-yellow-500 hover:bg-yellow-500 hover:text-black'
              }`}
            >
              {item.port} - {item.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
