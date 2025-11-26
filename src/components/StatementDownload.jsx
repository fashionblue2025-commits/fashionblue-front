import { useState } from 'react'
import { FileText, Download, Eye, ChevronDown } from 'lucide-react'
import { downloadCustomerStatement, openStatementInNewTab } from '../utils/pdfDownloader'

export default function StatementDownload({ customerId, customerName }) {
  const [loading, setLoading] = useState(false)
  const [customDays, setCustomDays] = useState('')
  const [showOptions, setShowOptions] = useState(false)

  const handleDownload = async (days = null) => {
    setLoading(true)
    
    const result = await downloadCustomerStatement(customerId, days, customerName)
    
    if (result.success) {
      console.log('PDF descargado exitosamente')
    } else {
      alert(`Error: ${result.error}`)
    }
    
    setLoading(false)
  }

  const handleOpenInNewTab = async (days = null) => {
    setLoading(true)
    
    const result = await openStatementInNewTab(customerId, days)
    
    if (!result.success) {
      alert(`Error: ${result.error}`)
    }
    
    setLoading(false)
  }

  const handleCustomDownload = () => {
    const days = parseInt(customDays)
    if (days > 0) {
      handleDownload(days)
      setCustomDays('')
    } else {
      alert('Por favor ingresa un número válido de días')
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
      {/* Header compacto */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-primary-600" />
          <h3 className="font-semibold text-gray-900">Estado de Cuenta</h3>
        </div>
        <button
          onClick={() => setShowOptions(!showOptions)}
          className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1"
        >
          {showOptions ? 'Ocultar opciones' : 'Más opciones'}
          <ChevronDown className={`w-4 h-4 transition-transform ${showOptions ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* Botones principales en grid horizontal */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3">
        <button
          onClick={() => handleDownload(7)}
          disabled={loading}
          className="px-3 py-2 bg-primary-500 text-white text-sm rounded-lg hover:bg-primary-600 transition-colors disabled:opacity-50 font-medium"
        >
          7 días
        </button>
        <button
          onClick={() => handleDownload(30)}
          disabled={loading}
          className="px-3 py-2 bg-primary-500 text-white text-sm rounded-lg hover:bg-primary-600 transition-colors disabled:opacity-50 font-medium"
        >
          30 días
        </button>
        <button
          onClick={() => handleDownload(90)}
          disabled={loading}
          className="px-3 py-2 bg-primary-500 text-white text-sm rounded-lg hover:bg-primary-600 transition-colors disabled:opacity-50 font-medium"
        >
          90 días
        </button>
        <button
          onClick={() => handleDownload()}
          disabled={loading}
          className="px-3 py-2 bg-gradient-brand text-white text-sm rounded-lg hover:bg-gradient-brand-hover transition-colors disabled:opacity-50 font-medium"
        >
          Completo
        </button>
      </div>

      {/* Opciones adicionales (colapsables) */}
      {showOptions && (
        <div className="pt-3 border-t border-gray-200 space-y-3 animate-slideIn">
          {/* Período personalizado */}
          <div className="flex gap-2">
            <input
              type="number"
              value={customDays}
              onChange={(e) => setCustomDays(e.target.value)}
              placeholder="Días personalizados"
              min="1"
              className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              disabled={loading}
            />
            <button
              onClick={handleCustomDownload}
              disabled={loading || !customDays}
              title="Descargar período personalizado"
              className="px-4 py-2 bg-primary-500 text-white text-sm rounded-lg hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>

          {/* Botones de vista previa */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-600 flex-shrink-0">Vista previa:</span>
            <div className="flex gap-2 flex-1">
              <button
                onClick={() => handleOpenInNewTab(30)}
                disabled={loading}
                className="flex-1 px-2 py-1.5 bg-gray-100 text-gray-700 text-xs rounded hover:bg-gray-200 transition-colors disabled:opacity-50 flex items-center justify-center gap-1"
              >
                <Eye className="w-3 h-3" />
                30d
              </button>
              <button
                onClick={() => handleOpenInNewTab()}
                disabled={loading}
                className="flex-1 px-2 py-1.5 bg-gray-100 text-gray-700 text-xs rounded hover:bg-gray-200 transition-colors disabled:opacity-50 flex items-center justify-center gap-1"
              >
                <Eye className="w-3 h-3" />
                Todo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Indicador de carga */}
      {loading && (
        <div className="mt-3 flex items-center justify-center gap-2 text-primary-600 py-2 bg-primary-50 rounded-lg">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600"></div>
          <span className="text-xs font-medium">Generando PDF...</span>
        </div>
      )}
    </div>
  )
}
