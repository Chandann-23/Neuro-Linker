'use client'

import { Database, Zap, Users, Clock } from 'lucide-react'

interface SystemMetricsProps {
  metrics: any
}

export function SystemMetrics({ metrics }: SystemMetricsProps) {
  const metricCards = [
    {
      title: 'Total Documents',
      value: metrics.total_documents || 0,
      icon: Database,
      color: 'var(--accent-purple)',
      description: 'Resumes indexed'
    },
    {
      title: 'Vector Chunks',
      value: metrics.total_chunks || 0,
      icon: Zap,
      color: 'var(--accent-violet)',
      description: 'Searchable segments'
    },
    {
      title: 'Active Tasks',
      value: metrics.active_tasks || 0,
      icon: Users,
      color: 'var(--accent-pink)',
      description: 'Background jobs'
    },
    {
      title: 'Avg Latency',
      value: `${(metrics.average_latency || 0).toFixed(1)}ms`,
      icon: Clock,
      color: '#22c55e',
      description: 'Search response time'
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {metricCards.map((card, index) => (
        <div key={index} className="glass glass-hover p-6">
          <div className="flex items-center justify-between mb-4">
            <div
              className="p-3 rounded-lg"
              style={{ backgroundColor: `${card.color}20` }}
            >
              <card.icon size={24} style={{ color: card.color }} />
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">{card.value}</div>
              <div className="text-sm opacity-70">{card.title}</div>
            </div>
          </div>
          <p className="text-sm opacity-70">{card.description}</p>
        </div>
      ))}
    </div>
  )
}
