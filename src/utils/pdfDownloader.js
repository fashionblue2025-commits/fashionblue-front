import { customerService } from '../services/customerService'

/**
 * Descarga el estado de cuenta de un cliente en formato PDF
 * @param {number} customerId - ID del cliente
 * @param {number|null} days - Número de días del período (null = todas las transacciones)
 * @param {string} customerName - Nombre del cliente para el archivo
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export const downloadCustomerStatement = async (customerId, days = null, customerName = 'cliente') => {
  try {
    // Obtener el blob del PDF
    const blob = await customerService.downloadStatement(customerId, days)
    
    // Crear URL temporal del blob
    const url = window.URL.createObjectURL(new Blob([blob], { type: 'application/pdf' }))
    
    // Crear elemento de descarga
    const link = document.createElement('a')
    link.href = url
    
    // Generar nombre del archivo
    const sanitizedName = customerName.replace(/[^a-zA-Z0-9]/g, '_')
    const period = days ? `${days}dias` : 'completo'
    const timestamp = new Date().toISOString().split('T')[0]
    link.download = `estado_cuenta_${sanitizedName}_${period}_${timestamp}.pdf`
    
    // Agregar al DOM, hacer click y remover
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    // Limpiar URL temporal
    window.URL.revokeObjectURL(url)
    
    return { success: true }
  } catch (error) {
    console.error('Error descargando estado de cuenta:', error)
    return { 
      success: false, 
      error: error.response?.data?.error || error.message || 'Error al descargar el estado de cuenta'
    }
  }
}

/**
 * Abre el PDF en una nueva pestaña en lugar de descargarlo
 * @param {number} customerId - ID del cliente
 * @param {number|null} days - Número de días del período
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export const openStatementInNewTab = async (customerId, days = null) => {
  try {
    const blob = await customerService.downloadStatement(customerId, days)
    const url = window.URL.createObjectURL(new Blob([blob], { type: 'application/pdf' }))
    
    // Abrir en nueva pestaña
    window.open(url, '_blank')
    
    // Limpiar después de un delay para que el navegador pueda cargar el PDF
    setTimeout(() => {
      window.URL.revokeObjectURL(url)
    }, 100)
    
    return { success: true }
  } catch (error) {
    console.error('Error abriendo estado de cuenta:', error)
    return { 
      success: false, 
      error: error.response?.data?.error || error.message || 'Error al abrir el estado de cuenta'
    }
  }
}
