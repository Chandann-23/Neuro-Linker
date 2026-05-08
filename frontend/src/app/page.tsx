'use client'

import { useState } from 'react'
import { CandidateCard } from '@/components/CandidateCard'
import { Download, Filter, Search } from 'lucide-react'

export default function Canvas() {
  const [candidates, setCandidates] = useState([
    {
      id: '1',
      name: 'Sarah Chen',
      currentRole: 'Senior Machine Learning Engineer',
      location: 'San Francisco, CA',
      experience: '5 years',
      matchScore: 94,
      keySignals: [
        'Expert in PyTorch and TensorFlow',
        'Published researcher in NLP',
        'Led ML team at scale'
      ],
      lastActive: '2 days ago'
    },
    {
      id: '2',
      name: 'Michael Rodriguez',
      currentRole: 'Full-Stack Developer',
      location: 'Austin, TX',
      experience: '7 years',
      matchScore: 88,
      keySignals: [
        'React and Next.js specialist',
        'Cloud architecture experience',
        'Team lead for 3 years'
      ],
      lastActive: '1 week ago'
    },
    {
      id: '3',
      name: 'Emily Watson',
      currentRole: 'Data Scientist',
      location: 'Boston, MA',
      experience: '4 years',
      matchScore: 82,
      keySignals: [
        'Advanced statistical modeling',
        'Healthcare analytics background',
        'Python and R expert'
      ],
      lastActive: '3 days ago'
    }
  ])

  return (
    <div className="flex flex-col h-full bg-warm-white">
      {/* Header */}
      <div className="p-6 border-b border-teal-50">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-800">
              {candidates.length} Profiles Found
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Showing top candidates based on your search criteria
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            <button className="px-4 py-2 border border-teal-200 text-brand-teal rounded-lg hover:bg-soft-teal transition-colors flex items-center space-x-2">
              <Filter size={16} />
              <span>Filter</span>
            </button>
            <button className="px-4 py-2 bg-brand-teal text-white rounded-lg hover:bg-teal-700 transition-colors flex items-center space-x-2">
              <Download size={16} />
              <span>Export</span>
            </button>
          </div>
        </div>
      </div>

      {/* Candidate Cards */}
      <div className="flex-1 overflow-auto p-6">
        <div className="space-y-6">
          {candidates.map((candidate) => (
            <CandidateCard key={candidate.id} candidate={candidate} />
          ))}
        </div>
      </div>
    </div>
  )
}
