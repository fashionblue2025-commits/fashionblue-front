import { useState } from 'react'
import { FileText, Download } from 'lucide-react'
import { downloadCustomerStatement } from '../utils/pdfDownloader'

/**
 * Botón compacto para descargar estado de cuenta
 * Útil para usar en tablas de clientes
 */
export default function StatementDownloadButton({ customerId, customerName, days = null, variant = 'icon' }) {
  const [loading, setLoading] = useState(false)

  const handleDownload = async (e) => {
    e.stopPropagation() // Evitar propagación si está dentro de un elemento clickeable
    
    setLoading(true)
    const result = await downloadCustomerStatement(customerId, days, customerName)
    
    if (!result.success) {
      alert(`Error: ${result.error}`)
    }
    
    setLoading(false)
  }

  if (variant === 'icon') {
    return (
      <button
        onClick={handleDownload}
        disabled={loading}
        title="Descargar estado de cuenta"
        className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? (
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-600"></div>
        ) : (
          <FileText className="w-5 h-5" />
        )}
      </button>
    )
  }

  if (variant === 'compact') {
    return (
      <button
        onClick={handleDownload}
        disabled={loading}
        className="flex items-center gap-2 px-3 py-1.5 text-sm bg-primary-100 text-primary-700 hover:bg-primary-200 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600"></div>
            Descargando...
          </>
        ) : (
          <>
            <FileText className="w-4 h-4" />
            PDF
          </>
        )}
      </button>
    )
  }

  // variant === 'full'
  return (
    <button
      onClick={handleDownload}
      disabled={loading}
      className="flex items-center justify-center gap-2 px-4 py-2 bg-primary-500 text-white hover:bg-primary-600 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {loading ? (
        <>
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
          Descargando...
        </>
      ) : (
        <>
          <Download className="w-5 h-5" />
          Descargar Estado de Cuenta
        </>
      )}
    </button>
  )
}
