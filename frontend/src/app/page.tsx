'use client'

import { useState } from 'react'
import { SearchFilterPanel } from '@/components/SearchFilterPanel'
import { ResultsGrid } from '@/components/ResultsGrid'
import { UploadModal } from '@/components/UploadModal'
import { BackendStatus } from '@/components/BackendStatus'
import { Upload, FileText, Database } from 'lucide-react'
import { ApiService, SearchResult } from '@/api'
import { ErrorBoundary } from '@/components/ErrorBoundary'

export const dynamic = 'force-dynamic'

interface FilterState {
  experienceLevel: string
  location: string
  skills: string[]
}

export default function RecruiterDashboard() {
  const [candidates, setCandidates] = useState<SearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [filters, setFilters] = useState<FilterState>({
    experienceLevel: '',
    location: '',
    skills: []
  })
  const [uploadModalOpen, setUploadModalOpen] = useState(false)

  const handleUpload = (files: File[]) => {
    // Handle file upload logic here
    console.log('Uploading files:', files)
    setUploadModalOpen(false)
  }

  const handleSearch = async (query: string) => {
    if (!query.trim()) return
    
    setIsSearching(true)
    
    try {
      const data = await ApiService.search(query, {
        experience_level: filters.experienceLevel,
        location: filters.location,
        skills: filters.skills
      })
      // Force array initialization to prevent crashes
      const results = Array.isArray(data) ? data : []
      setCandidates(results)
    } catch (error) {
      console.error('Search error:', error)
      // Graceful error recovery with empty array fallback
      setCandidates([])
    } finally {
      setIsSearching(false)
    }
  }

  return (
    <ErrorBoundary>
      <div className="flex min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        {/* Search & Filter Panel */}
        <div className="w-96 h-full">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-white">Neural Search</h1>
            <button
              onClick={() => setUploadModalOpen(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <Upload size={16} />
              <span>Upload Resumes</span>
            </button>
          </div>
          
          <SearchFilterPanel 
            onSearch={handleSearch}
            onFilterChange={setFilters}
            isSearching={isSearching}
          />
        </div>
        
        {/* Backend Status */}
        <div className="absolute top-4 right-4">
          <BackendStatus />
        </div>
        
        {/* Results Grid */}
        <div className="flex-1 h-full overflow-hidden">
          <ResultsGrid 
            candidates={candidates}
            isSearching={isSearching}
          />
        </div>
        
        {/* Upload Modal */}
        <UploadModal
          isOpen={uploadModalOpen}
          onClose={() => setUploadModalOpen(false)}
          onUpload={handleUpload}
        />
      </div>
    </ErrorBoundary>
  )
}
