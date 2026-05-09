'use client'

import { useState, useEffect } from 'react'
import { Search, Filter, Briefcase, MapPin, GraduationCap, Wifi, WifiOff } from 'lucide-react'

interface SearchFilterPanelProps {
  onSearch: (query: string) => void
  onFilterChange: (filters: FilterState) => void
  isSearching: boolean
}

interface FilterState {
  experienceLevel: string
  location: string
  skills: string[]
}

export function SearchFilterPanel({ onSearch, onFilterChange, isSearching }: SearchFilterPanelProps) {
  const [query, setQuery] = useState('')
  const [filters, setFilters] = useState<FilterState>({
    experienceLevel: '',
    location: '',
    skills: []
  })
  const [isConnected, setIsConnected] = useState(true)

  useEffect(() => {
    // Simulate backend connection check
    const checkConnection = () => {
      setIsConnected(Math.random() > 0.3) // Random connection status for demo
    }
    
    const interval = setInterval(checkConnection, 3000)
    return () => clearInterval(interval)
  }, [])

  const handleSearch = () => {
    onSearch(query)
  }

  const handleFilterChange = (key: keyof FilterState, value: any) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    onFilterChange(newFilters)
  }

  return (
    <div className="w-80 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 h-full">
      <div className="space-y-6">
        {/* Search Section */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-white mb-4">Neural Search</h2>
          <div className="relative">
            <Search className="absolute left-3 top-3 text-white/60" size={20} />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Search candidates..."
              className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
            />
            <button
              onClick={handleSearch}
              disabled={isSearching}
              className="absolute right-2 top-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50"
            >
              {isSearching ? 'Searching...' : 'Search'}
            </button>
          </div>
        </div>

        {/* Filter Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white mb-3">Filters</h3>
          
          {/* Experience Level */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-white/80 flex items-center">
              <Briefcase size={16} className="mr-2" />
              Experience Level
            </label>
            <select
              value={filters.experienceLevel}
              onChange={(e) => handleFilterChange('experienceLevel', e.target.value)}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            >
              <option value="">All Levels</option>
              <option value="entry">Entry Level</option>
              <option value="mid">Mid Level</option>
              <option value="senior">Senior Level</option>
              <option value="lead">Lead/Principal</option>
            </select>
          </div>

          {/* Location */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-white/80 flex items-center">
              <MapPin size={16} className="mr-2" />
              Location
            </label>
            <input
              type="text"
              value={filters.location}
              onChange={(e) => handleFilterChange('location', e.target.value)}
              placeholder="e.g., Bengaluru"
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            />
          </div>

          {/* Top Skills */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-white/80 flex items-center">
              <GraduationCap size={16} className="mr-2" />
              Top Skills
            </label>
            <div className="flex flex-wrap gap-2">
              {['React', 'Node.js', 'Python', 'AWS', 'DevOps', 'TypeScript'].map((skill) => (
                <button
                  key={skill}
                  onClick={() => {
                    const newSkills = filters.skills.includes(skill)
                      ? filters.skills.filter(s => s !== skill)
                      : [...filters.skills, skill]
                    handleFilterChange('skills', newSkills)
                  }}
                  className={`px-3 py-1 rounded-full text-sm transition-all ${
                    filters.skills.includes(skill)
                      ? 'bg-blue-600 text-white'
                      : 'bg-white/10 text-white/80 border border-white/20 hover:bg-white/20'
                  }`}
                >
                  {skill}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="mt-6 p-4 bg-white/5 rounded-lg">
          <div className="text-sm text-white/60">
            <div className="flex justify-between mb-2">
              <span>Active Filters:</span>
              <span className="font-medium">
                {[filters.experienceLevel, filters.location, filters.skills.length].filter(Boolean).length}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Backend Status:</span>
              <span className={`font-medium flex items-center ${isConnected ? 'text-green-400' : 'text-red-400'}`}>
                {isConnected ? (
                  <>
                    <Wifi size={14} className="mr-1" />
                    Connected to BGE-M3
                  </>
                ) : (
                  <>
                    <WifiOff size={14} className="mr-1" />
                    Disconnected
                  </>
                )}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Ready to Search:</span>
              <span className="font-medium text-green-400">
                {isConnected ? 'Yes' : 'No'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
