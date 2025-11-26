import { useState, useEffect } from 'react'
import { orderService } from '../services/orderService'

export function useOrderStatus(orderId) {
  const [allowedStatuses, setAllowedStatuses] = useState([])
  const [loading, setLoading] = useState(false)

  // Obtener estados permitidos
  const fetchAllowedStatuses = async () => {
    if (!orderId) return
    
    try {
      const response = await orderService.getAllowedStatuses(orderId)
      setAllowedStatuses(response.data?.allowedNextStatuses || [])
    } catch (error) {
      console.error('Error fetching allowed statuses:', error)
      setAllowedStatuses([])
    }
  }

  // Cambiar estado
  const changeStatus = async (newStatus) => {
    setLoading(true)
    try {
      const response = await orderService.updateOrderStatus(orderId, newStatus)
      
      // Actualizar estados permitidos automáticamente desde la respuesta
      if (response.data?.allowedNextStatuses) {
        setAllowedStatuses(response.data.allowedNextStatuses)
      }
      
      return response.data?.order
    } catch (error) {
      console.error('Error changing status:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  // Cargar estados permitidos al montar o cuando cambie el orderId
  useEffect(() => {
    fetchAllowedStatuses()
  }, [orderId])

  return { 
    allowedStatuses, 
    changeStatus, 
    loading, 
    fetchAllowedStatuses 
  }
}
