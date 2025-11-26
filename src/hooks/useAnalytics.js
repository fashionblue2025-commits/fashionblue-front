import { useState, useEffect } from 'react'
import { analyticsService } from '../services/analyticsService'

export function useAnalytics(refreshInterval = 30000) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await analyticsService.getDashboard()
        setData(response.data)
        setError(null)
      } catch (err) {
        console.error('Error loading analytics:', err)
        setError(err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
    
    // Actualizar cada refreshInterval milisegundos
    const interval = setInterval(fetchData, refreshInterval)

    return () => clearInterval(interval)
  }, [refreshInterval])

  return { data, loading, error }
}
