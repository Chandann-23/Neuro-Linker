'use client'

import { useState } from 'react'
import { Search, Settings, BarChart3 } from 'lucide-react'

interface SearchInterfaceProps {
  onSearch: (query: string, options: any) => void
  isSearching: boolean
}

export function SearchInterface({ onSearch, isSearching }: SearchInterfaceProps) {
  const [query, setQuery] = useState('')
  const [showOptions, setShowOptions] = useState(false)
  const [options, setOptions] = useState({
    topK: 5,
    alpha: 0.7,
    filters: {}
  })

  const handleSearch = () => {
    if (query.trim()) {
      onSearch(query, options)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSearch()
    }
  }

  return (
    <div className="glass p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold gradient-text">Neural Search Interface</h3>
        <button
          onClick={() => setShowOptions(!showOptions)}
          className="p-2 rounded-lg hover:bg-purple-800 transition-colors"
          style={{ backgroundColor: 'var(--accent-navy)' }}
        >
          <Settings size={20} style={{ color: 'var(--accent-purple)' }} />
        </button>
      </div>

      {/* Search Input */}
      <div className="mb-6">
        <textarea
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Define the ideal neural profile..."
          className="search-input resize-none"
          rows={4}
          disabled={isSearching}
        />
      </div>

      {/* Search Options */}
      {showOptions && (
        <div className="mb-6 p-4 rounded-lg" style={{ backgroundColor: 'var(--accent-navy)' }}>
          <h4 className="font-semibold mb-4 flex items-center">
            <BarChart3 size={18} className="mr-2" style={{ color: 'var(--accent-purple)' }} />
            Search Parameters
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Top Results: {options.topK}
              </label>
              <input
                type="range"
                min="1"
                max="20"
                value={options.topK}
                onChange={(e) => setOptions({...options, topK: parseInt(e.target.value)})}
                className="w-full"
                style={{ accentColor: 'var(--accent-purple)' }}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">
                Semantic Weight: {Math.round(options.alpha * 100)}%
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={options.alpha * 100}
                onChange={(e) => setOptions({...options, alpha: parseInt(e.target.value) / 100})}
                className="w-full"
                style={{ accentColor: 'var(--accent-purple)' }}
              />
            </div>
          </div>
          
          <div className="mt-4 text-sm opacity-70">
            <p><strong>Semantic ({Math.round(options.alpha * 100)}%)</strong>: Contextual understanding</p>
            <p><strong>Keyword ({Math.round((1 - options.alpha) * 100)}%)</strong>: Exact term matching</p>
          </div>
        </div>
      )}

      {/* Search Button */}
      <button
        onClick={handleSearch}
        disabled={isSearching || !query.trim()}
        className="btn-primary w-full flex items-center justify-center space-x-2"
      >
        {isSearching ? (
          <>
            <div className="spinner" />
            <span>Processing Neural Match...</span>
          </>
        ) : (
          <>
            <Search size={20} />
            <span>START MATCHING</span>
          </>
        )}
      </button>

      {/* Quick Examples */}
      <div className="mt-6">
        <p className="text-sm font-medium mb-3 opacity-70">Quick Examples:</p>
        <div className="flex flex-wrap gap-2">
          {[
            "Senior Python Developer with AI/ML experience",
            "Cloud Architect with AWS and Kubernetes",
            "Full-stack React engineer with TypeScript",
            "Data Scientist with NLP expertise"
          ].map((example, index) => (
            <button
              key={index}
              onClick={() => setQuery(example)}
              className="skill-chip cursor-pointer"
              disabled={isSearching}
            >
              {example}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
