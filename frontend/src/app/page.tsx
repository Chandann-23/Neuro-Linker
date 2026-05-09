'use client'

import { useState } from 'react'
import { SearchFilterPanel } from '@/components/SearchFilterPanel'
import { ResultsGrid } from '@/components/ResultsGrid'

export const dynamic = 'force-dynamic'

interface FilterState {
  experienceLevel: string
  location: string
  skills: string[]
}

export default function RecruiterDashboard() {
  const [candidates, setCandidates] = useState([])
  const [isSearching, setIsSearching] = useState(false)
  const [filters, setFilters] = useState<FilterState>({
    experienceLevel: '',
    location: '',
    skills: []
  })

  const handleSearch = async (query: string) => {
    if (!query.trim()) return
    
    setIsSearching(true)
    
    try {
      const response = await fetch('/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: query,
          alpha: 0.7,
          filters: {
            experience_level: filters.experienceLevel,
            location: filters.location,
            skills: filters.skills
          }
        }),
      })
      
      if (!response.ok) {
        throw new Error('Search failed')
      }
      
      const results = await response.json()
      setCandidates(results)
    } catch (error) {
      console.error('Search error:', error)
      setCandidates([])
    } finally {
      setIsSearching(false)
    }
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Search & Filter Panel */}
      <div className="w-96 h-full">
        <SearchFilterPanel 
          onSearch={handleSearch}
          onFilterChange={setFilters}
          isSearching={isSearching}
        />
      </div>
      
      {/* Results Grid */}
      <div className="flex-1 h-full overflow-hidden">
        <ResultsGrid 
          candidates={candidates}
          isSearching={isSearching}
        />
      </div>
    </div>
  )
}
