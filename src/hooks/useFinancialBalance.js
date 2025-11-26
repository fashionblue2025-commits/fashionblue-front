import { useState, useEffect } from 'react'
import { financialService } from '../services/financialService'

export function useFinancialBalance(autoRefresh = false, refreshInterval = 30000) {
  const [balance, setBalance] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchBalance = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await financialService.getBalance()
      setBalance(response.data.data)
    } catch (err) {
      console.error('Error fetching balance:', err)
      setError(err.response?.data?.error || 'Error al cargar el balance')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBalance()

    // Auto-refresh si está habilitado
    if (autoRefresh) {
      const interval = setInterval(fetchBalance, refreshInterval)
      return () => clearInterval(interval)
    }
  }, [autoRefresh, refreshInterval])

  return { balance, loading, error, refetch: fetchBalance }
}
