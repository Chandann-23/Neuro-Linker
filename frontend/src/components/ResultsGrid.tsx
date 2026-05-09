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
      <div className="flex flex-1 h-full">
        <div className="flex flex-1 flex-col justify-center items-center p-6">
          <div className="text-center max-w-md">
            <div className="mb-8">
              <div className="w-24 h-24 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl flex flex-col items-center justify-center mx-auto">
                <div className="text-5xl text-white/60 mb-3">🔍</div>
              </div>
              <div className="text-white/80 mt-6">
                <div className="text-2xl font-semibold text-white mb-3">No Candidates Found</div>
                <p className="text-white/60 max-w-sm mx-auto text-center">
                  Try adjusting your search query or filters to find matching candidates from the database.
                </p>
              </div>
            </div>
          </div>
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
