'use client'

import { Check, MapPin, Calendar, Briefcase, Download, Mail, Award, Code, GraduationCap } from 'lucide-react'

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
    filename: string
    content: string
    education: string
    skills: string[]
    projects: string[]
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
    <div className="bg-white border border-teal-200 border-[1px] rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-brand-teal transition-all duration-200 group">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div>
            <h3 className="text-lg font-semibold mb-1">{candidate.name}</h3>
            <p className="text-sm text-gray-500 mb-2">{candidate.currentRole}</p>
            <p className="text-sm text-gray-500 mb-1">{candidate.education}</p>
          </div>
        </div>
        <div className="flex-1">
          <div className="flex items-center space-x-4">
            <div>
              <MapPin size={14} className="mr-1" />
              <span className="text-sm text-gray-500">{candidate.location}</span>
            </div>
            <div>
              <Calendar size={14} className="mr-1" />
              <span className="text-sm text-gray-500">{candidate.experience}</span>
            </div>
          </div>
        </div>
        
        {/* Match Score Badge */}
        <div className="flex flex-col items-end">
          <div className={`px-3 py-1 rounded-full text-white text-sm font-bold bg-match border-[2px]`}>
            {Math.round(candidate.matchScore * 100)}% Match
          </div>
        </div>
      </div>

      {/* Key Fit Signals */}
      <div className="mb-4">
        <h4 className="text-sm font-semibold text-gray-700 mb-3">Key Fit Signals</h4>
        <div className="space-y-2">
          {candidate.keySignals.map((signal, index) => (
            <div key={index} className="flex items-center space-x-3 p-2 bg-signal rounded-lg">
              <Award size={14} className="mr-1" />
              <span className="text-sm text-gray-500">{signal}</span>
            </div>
          ))}
        </div>
        
        {/* Smart Tags Grid */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          {candidate.education && (
            <div className="px-3 py-2 bg-purple-100 text-purple-800 rounded-lg text-sm text-center">
              <GraduationCap size={14} className="mr-1 inline" />
              <span className="font-medium">{candidate.education}</span>
            </div>
          )}
          {candidate.projects && candidate.projects.length > 0 && (
            <div className="px-3 py-2 bg-green-100 text-green-800 rounded-lg text-sm text-center">
              <Code size={14} className="mr-1 inline" />
              <span className="font-medium">{candidate.projects[0]}</span>
            </div>
          )}
          {candidate.skills && candidate.skills.length > 0 && (
            <div className="px-3 py-2 bg-blue-100 text-blue-800 rounded-lg text-sm text-center">
              <Briefcase size={14} className="mr-1 inline" />
              <span className="font-medium">{candidate.skills[0]}</span>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex space-x-3 pt-4 border-t border-teal-50">
        <button className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium flex items-center justify-center">
          <Download size={14} className="mr-2" />
          Download PDF
        </button>
        <button className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium flex items-center justify-center">
          <Mail size={14} className="mr-2" />
          Email Candidate
        </button>
      </div>
    </div>
  )
}
