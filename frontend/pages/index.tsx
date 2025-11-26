import { useState, useEffect } from 'react'
import Head from 'next/head'
import axios from 'axios'
import PortScanner from '@/components/PortScanner'
import PermissionCheck from '@/components/PermissionCheck'
import ServiceManager from '@/components/ServiceManager'
import FirewallConfig from '@/components/FirewallConfig'
import LogAnalyzer from '@/components/LogAnalyzer'
import SecurityChecklist from '@/components/SecurityChecklist'
import FullReport from '@/components/FullReport'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

interface ModuleCardProps {
  title: string
  description: string
  icon: string
  onClick: () => void
  riskLevel?: string
}

const ModuleCard = ({ title, description, icon, onClick, riskLevel }: ModuleCardProps) => {
  return (
    <div 
      className="cyber-card cursor-pointer transform hover:scale-105 transition-transform duration-300"
      onClick={onClick}
    >
      <div className="flex items-center mb-4">
        <span className="text-4xl mr-4">{icon}</span>
        <div>
          <h3 className="text-xl font-bold text-neon-blue">{title}</h3>
          {riskLevel && (
            <span className={`text-sm font-semibold ${
              riskLevel === 'CRITICAL' ? 'text-red-500' :
              riskLevel === 'HIGH' ? 'text-orange-500' :
              riskLevel === 'MEDIUM' ? 'text-yellow-500' : 'text-green-500'
            }`}>
              {riskLevel}
            </span>
          )}
        </div>
      </div>
      <p className="text-gray-300 text-sm">{description}</p>
    </div>
  )
}

export default function Home() {
  const [activeModule, setActiveModule] = useState<string | null>(null)
  const [apiStatus, setApiStatus] = useState<'online' | 'offline' | 'checking'>('checking')

  useEffect(() => {
    checkApiStatus()
  }, [])

  const checkApiStatus = async () => {
    try {
      await axios.get(`${API_URL}/api/health`)
      setApiStatus('online')
    } catch (error) {
      setApiStatus('offline')
    }
  }

  const modules = [
    {
      id: 'port-scanner',
      title: 'Escaneo de Puertos',
      description: 'Escanear puertos abiertos y detectar servicios vulnerables',
      icon: '🔍',
      component: PortScanner
    },
    {
      id: 'permissions',
      title: 'Verificación de Permisos',
      description: 'Detectar archivos SUID, SGID y permisos peligrosos',
      icon: '🔐',
      component: PermissionCheck
    },
    {
      id: 'services',
      title: 'Gestión de Servicios',
      description: 'Identificar y deshabilitar servicios inseguros',
      icon: '⚙️',
      component: ServiceManager
    },
    {
      id: 'firewall',
      title: 'Configuración de Firewall',
      description: 'Configurar y gestionar reglas del firewall',
      icon: '🛡️',
      component: FirewallConfig
    },
    {
      id: 'logs',
      title: 'Análisis de Logs',
      description: 'Analizar logs del sistema y detectar amenazas',
      icon: '📊',
      component: LogAnalyzer
    },
    {
      id: 'checklist',
      title: 'Checklist de Seguridad',
      description: 'Ejecutar verificaciones completas de seguridad',
      icon: '✅',
      component: SecurityChecklist
    },
    {
      id: 'full-report',
      title: 'Reporte Completo',
      description: 'Generar reporte de seguridad completo del sistema',
      icon: '📄',
      component: FullReport
    }
  ]

  const ActiveComponent = modules.find(m => m.id === activeModule)?.component

  return (
    <>
      <Head>
        <title>Linux Hardening Toolkit</title>
        <meta name="description" content="Herramienta de hardening para sistemas Linux" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <main className="min-h-screen p-8">
        {/* Header */}
        <div className="max-w-7xl mx-auto mb-8">
          <div className="text-center mb-8">
            <h1 className="text-5xl md:text-7xl font-black mb-4 neon-text font-cyber">
              LINUX HARDENING TOOLKIT
            </h1>
            <p className="text-xl text-neon-blue mb-4">v1.0 - Cybersecurity Automation Suite</p>
            
            {/* API Status */}
            <div className="flex justify-center items-center gap-3">
              <span className="text-gray-400">API Status:</span>
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${
                  apiStatus === 'online' ? 'bg-neon-green animate-pulse' :
                  apiStatus === 'offline' ? 'bg-red-500' : 'bg-yellow-500'
                }`}></div>
                <span className={`font-bold ${
                  apiStatus === 'online' ? 'text-neon-green' :
                  apiStatus === 'offline' ? 'text-red-500' : 'text-yellow-500'
                }`}>
                  {apiStatus.toUpperCase()}
                </span>
              </div>
              {apiStatus === 'offline' && (
                <button 
                  onClick={checkApiStatus}
                  className="ml-2 px-3 py-1 text-xs border border-neon-blue text-neon-blue rounded hover:bg-neon-blue hover:text-black transition"
                >
                  Retry
                </button>
              )}
            </div>
          </div>

          {/* Back Button */}
          {activeModule && (
            <button
              onClick={() => setActiveModule(null)}
              className="mb-4 px-6 py-2 border-2 border-neon-pink text-neon-pink rounded hover:bg-neon-pink hover:text-black transition font-bold"
            >
              ← Volver al Dashboard
            </button>
          )}

          {/* Module View or Dashboard */}
          {activeModule && ActiveComponent ? (
            <div className="animate-fadeIn">
              <ActiveComponent apiUrl={API_URL} />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {modules.map((module) => (
                <ModuleCard
                  key={module.id}
                  title={module.title}
                  description={module.description}
                  icon={module.icon}
                  onClick={() => setActiveModule(module.id)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="max-w-7xl mx-auto mt-16 text-center">
          <div className="border-t border-neon-blue/30 pt-8">
            <p className="text-gray-500 text-sm">
              Desarrollado para fortalecer la seguridad de sistemas Linux
            </p>
            <p className="text-neon-blue text-xs mt-2">
              © 2024 Linux Hardening Toolkit - noomesk - Todos los derechos reservados. 
            </p>
          </div>
        </div>
      </main>
    </>
  )
}
