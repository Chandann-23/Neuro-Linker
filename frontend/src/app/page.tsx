'use client'

import { useState } from 'react'
import { CandidateCard } from '@/components/CandidateCard'
import { Download, Filter, Search } from 'lucide-react'

export const dynamic = 'force-dynamic'

interface Candidate {
  id: string
  name: string
  currentRole: string
  location: string
  experience: string
  matchScore: number
  keySignals: string[]
  lastActive: string
}

export default function Canvas() {
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [query, setQuery] = useState('')

  const searchCandidates = async (searchQuery: string) => {
    if (!searchQuery.trim()) return []
    
    try {
      const response = await fetch('/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: searchQuery,
          alpha: 0.7,
          filters: {}
        }),
      })
      
      if (!response.ok) {
        throw new Error('Search failed')
      }
      
      const results = await response.json()
      return results
    } catch (error) {
      console.error('Search error:', error)
      return []
    }
  }

  return (
    <div className="flex flex-col h-full bg-warm-white">
      {/* Header */}
      <div className="p-6 border-b border-teal-50">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-800">
              {isSearching ? (
                <>
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-8 w-8 border-2 border-teal-200"></div>
                    <span className="ml-2">Neural Processing...</span>
                  </div>
                </>
              ) : (
                <>
                  {candidates.length} Profiles Found
                </>
              )}
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              {isSearching ? (
                <>
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-8 w-8 border-2 border-teal-200"></div>
                    <span className="ml-2">Neural Processing...</span>
                  </div>
                </>
              ) : (
                <>
                  Showing top candidates based on your search criteria
                </>
              )}
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <input 
              type="text" 
              value={query} 
              onChange={(e) => setQuery(e.target.value)} 
              className="px-4 py-2 border border-teal-200 text-brand-teal rounded-lg hover:bg-soft-teal transition-colors flex items-center space-x-2"
            />
            <button 
              className="px-4 py-2 border border-teal-200 text-brand-teal rounded-lg hover:bg-soft-teal transition-colors flex items-center space-x-2"
              onClick={() => {
                setIsSearching(true);
                searchCandidates(query).then(results => {
                  setCandidates(results);
                  setIsSearching(false);
                }).catch(error => {
                  console.error('Search error:', error);
                  setIsSearching(false);
                });
              }}
              disabled={isSearching}
            >
              <Search size={16} />
              <span>Search</span>
            </button>
            <button 
              className="px-4 py-2 bg-brand-teal text-white rounded-lg hover:bg-teal-700 transition-colors flex items-center space-x-2"
              disabled={isSearching}
            >
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
