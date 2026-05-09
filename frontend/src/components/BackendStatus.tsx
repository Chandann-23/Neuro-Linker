'use client'

import { useState, useEffect } from 'react'
import { Wifi, WifiOff, Activity, CheckCircle } from 'lucide-react'

export function BackendStatus() {
  const [isConnected, setIsConnected] = useState(true)
  const [lastPing, setLastPing] = useState(Date.now())
  const [consecutiveFailures, setConsecutiveFailures] = useState(0)

  useEffect(() => {
    const checkBackendHealth = async () => {
      try {
        const response = await fetch('/health')
        const data = await response.json()
        
        if (data.status === 'healthy') {
          setIsConnected(true)
          setConsecutiveFailures(0)
          setLastPing(Date.now())
        } else {
          setConsecutiveFailures(prev => prev + 1)
          if (consecutiveFailures >= 2) {
            setIsConnected(false)
          }
        }
      } catch (error) {
        console.error('Health check failed:', error)
        setConsecutiveFailures(prev => prev + 1)
        if (consecutiveFailures >= 2) {
          setIsConnected(false)
        }
      }
    }

    // Initial ping
    checkBackendHealth()

    // Set up polling interval
    const interval = setInterval(checkBackendHealth, 20000) // 20 seconds

    return () => {
      clearInterval(interval)
    }
  }, [])

  useEffect(() => {
    // Auto-reconnect logic when disconnected
    if (!isConnected && consecutiveFailures > 0) {
      const reconnectInterval = setInterval(async () => {
        try {
          await checkBackendHealth()
        } catch (error) {
          console.error('Reconnection attempt failed:', error)
        }
      }, 5000) // Try to reconnect every 5 seconds

      return () => {
        clearInterval(reconnectInterval)
      }
    }
  }, [isConnected, consecutiveFailures])

  const getStatusColor = () => {
    if (isConnected) {
      return 'text-green-400'
    } else if (consecutiveFailures >= 3) {
      return 'text-red-400'
    } else {
      return 'text-yellow-400'
    }
  }

  const getStatusText = () => {
    if (isConnected) {
      return 'Connected to BGE-M3'
    } else if (consecutiveFailures >= 3) {
      return 'Connection Lost'
    } else {
      return 'Reconnecting...'
    }
  }

  return (
    <div className="flex items-center space-x-2 p-2 bg-white/5 rounded-lg">
      <div className="flex items-center space-x-2">
        {isConnected ? (
          <Wifi size={16} className={getStatusColor()} />
        ) : (
          <WifiOff size={16} className={getStatusColor()} />
        )}
        <span className={`text-sm font-medium ${getStatusColor()}`}>
          {getStatusText()}
        </span>
      </div>
      
      <div className="flex items-center space-x-2">
        <Activity size={14} className="text-gray-400" />
        <span className="text-xs text-gray-500">
          Last ping: {new Date(lastPing).toLocaleTimeString()}
        </span>
      </div>
      
      <div className="flex items-center space-x-2">
        <CheckCircle size={14} className="text-green-400" />
        <span className="text-xs text-gray-500">
          {consecutiveFailures === 0 ? 'System Healthy' : `${consecutiveFailures} consecutive failures`}
        </span>
      </div>
    </div>
  )
}
