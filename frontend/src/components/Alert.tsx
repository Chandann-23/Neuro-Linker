'use client'

import { X, CheckCircle, AlertCircle, AlertTriangle } from 'lucide-react'

interface AlertProps {
  type: 'success' | 'error' | 'warning'
  message: string
  onClose?: () => void
}

export function Alert({ type, message, onClose }: AlertProps) {
  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle size={20} />
      case 'error':
        return <AlertCircle size={20} />
      case 'warning':
        return <AlertTriangle size={20} />
      default:
        return <AlertCircle size={20} />
    }
  }

  return (
    <div className={`alert alert-${type} fade-in flex items-center justify-between`}>
      <div className="flex items-center space-x-3">
        {getIcon()}
        <span>{message}</span>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="p-1 rounded hover:bg-black/20 transition-colors"
        >
          <X size={16} />
        </button>
      )}
    </div>
  )
}
