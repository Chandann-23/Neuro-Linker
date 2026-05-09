'use client'

import { CandidateCard } from './CandidateCard'

interface ResultsGridProps {
  candidates: any[]
  isSearching: boolean
}

export function ResultsGrid({ candidates, isSearching }: ResultsGridProps) {
  if (isSearching) {
    return (
      <div className="flex-1 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 animate-pulse">
              <div className="space-y-4">
                <div className="h-6 bg-white/20 rounded-lg w-3/4"></div>
                <div className="h-4 bg-white/10 rounded-lg w-1/2"></div>
                <div className="space-y-2">
                  <div className="h-3 bg-white/10 rounded w-full"></div>
                  <div className="h-3 bg-white/10 rounded w-5/6"></div>
                </div>
                <div className="h-20 bg-white/5 rounded-lg"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (candidates.length === 0) {
    return (
      <div className="flex-1 p-6">
        <div className="flex flex-col items-center justify-center h-full text-center">
          <div className="mb-6">
            <div className="w-16 h-16 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full flex items-center justify-center">
              <span className="text-2xl text-white/60">🔍</span>
            </div>
          </div>
          <h3 className="text-2xl font-bold text-white mb-2">No Candidates Found</h3>
          <p className="text-white/60 max-w-md">
            Try adjusting your search query or filters to find matching candidates from the database.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">
            {candidates.length} {candidates.length === 1 ? 'Candidate' : 'Candidates'} Found
          </h2>
          <div className="text-sm text-white/60">
            Sorted by neural match score
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {candidates.map((candidate, index) => (
          <div key={candidate.id || index} className="transform transition-all duration-300 hover:scale-105">
            <CandidateCard candidate={candidate} />
          </div>
        ))}
      </div>
    </div>
  )
}
