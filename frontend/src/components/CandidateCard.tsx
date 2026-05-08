'use client'

import { Check, MapPin, Calendar, Briefcase } from 'lucide-react'

interface CandidateCardProps {
  candidate: {
    id: string
    name: string
    currentRole: string
    location: string
    experience: string
    matchScore: number
    keySignals: string[]
    lastActive: string
  }
}

export function CandidateCard({ candidate }: CandidateCardProps) {
  const getScoreColor = (score: number) => {
    if (score >= 90) return 'bg-green-500'
    if (score >= 80) return 'bg-teal-500'
    if (score >= 70) return 'bg-yellow-500'
    return 'bg-gray-400'
  }

  return (
    <div className="bg-white border border-teal-50 rounded-xl p-6 hover:shadow-glass hover:border-brand-teal transition-all duration-200 group">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-800 mb-1">{candidate.name}</h3>
          <p className="text-gray-600 mb-2">{candidate.currentRole}</p>
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <div className="flex items-center space-x-1">
              <MapPin size={14} />
              <span>{candidate.location}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Briefcase size={14} />
              <span>{candidate.experience}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Calendar size={14} />
              <span>{candidate.lastActive}</span>
            </div>
          </div>
        </div>
        
        {/* Match Score Badge */}
        <div className="flex flex-col items-end">
          <div className={`px-3 py-1 rounded-full text-white text-sm font-medium ${getScoreColor(candidate.matchScore)}`}>
            {candidate.matchScore}% Match
          </div>
        </div>
      </div>

      {/* Key Fit Signals */}
      <div className="mb-4">
        <h4 className="text-sm font-semibold text-gray-700 mb-3">Key Fit Signals</h4>
        <div className="space-y-2">
          {candidate.keySignals.map((signal, index) => (
            <div key={index} className="flex items-center space-x-3 p-2 bg-soft-teal rounded-lg">
              <div className="w-5 h-5 rounded-full bg-brand-teal flex items-center justify-center">
                <Check size={12} className="text-white" />
              </div>
              <span className="text-sm text-gray-700">{signal}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-3 pt-4 border-t border-teal-50">
        <button className="flex-1 px-4 py-2 bg-brand-teal text-white rounded-lg hover:bg-teal-700 transition-colors text-sm font-medium">
          View Profile
        </button>
        <button className="flex-1 px-4 py-2 border border-teal-200 text-brand-teal rounded-lg hover:bg-soft-teal transition-colors text-sm font-medium">
          Message
        </button>
      </div>
    </div>
  )
}
