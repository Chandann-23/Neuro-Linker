'use client'

import { useState, useEffect } from 'react'
import { User, ThumbsUp, ThumbsDown, ChevronDown, ChevronUp, Star, Target, Brain } from 'lucide-react'
import Image from 'next/image'

interface SearchResult {
  filename: string
  score: number
  semantic_score: number
  keyword_score: number
  matched_chunk: string
}

interface SearchResultsProps {
  results: SearchResult[] // This is the data coming from your API
  onFeedback: (filename: string, feedback: boolean, score: number) => void
}

export function SearchResults({ results, onFeedback }: SearchResultsProps) {
  // REMOVED: const [results, setResults] = useState([]) <- THIS WAS THE BUG
  
  const [expandedResults, setExpandedResults] = useState<Set<string>>(new Set())
  const [feedbackSubmitted, setFeedbackSubmitted] = useState<Set<string>>(new Set())
  const [hasMounted, setHasMounted] = useState(false)

  // Hydration Guard
  useEffect(() => {
    setHasMounted(true)
  }, [])

  const toggleExpanded = (filename: string) => {
    const newExpanded = new Set(expandedResults)
    if (newExpanded.has(filename)) {
      newExpanded.delete(filename)
    } else {
      newExpanded.add(filename)
    }
    setExpandedResults(newExpanded)
  }

  const handleFeedback = (filename: string, feedback: boolean, score: number) => {
    onFeedback(filename, feedback, score)
    setFeedbackSubmitted(prev => new Set(prev).add(filename))
  }

  const getScoreColor = (score: number) => {
    if (score >= 0.8) return '#22c55e' 
    if (score >= 0.6) return '#f59e0b' 
    return '#ef4444' 
  }

  const getAvatarUrl = (filename: string) => {
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(filename)}`
  }

  // THE BULLETPROOF GUARD
  if (!hasMounted) return null;

  const safeCandidates = Array.isArray(results) ? results : [];

  if (safeCandidates.length === 0) {
    return (
      <div className="glass p-8 text-center fade-in">
        <Target className="mx-auto mb-4" size={48} style={{ color: 'var(--accent-purple)' }} />
        <h3 className="text-xl font-semibold mb-2">No Candidates Found</h3>
        <p className="opacity-70">Try adjusting your filters or upload more resumes.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 fade-in">
      {safeCandidates.map((candidate, index) => (
        <div key={`${candidate.filename}-${index}`} className="result-card">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-4">
              <div className="relative w-12 h-12">
                <Image
                  src={getAvatarUrl(candidate.filename)}
                  alt={candidate.filename}
                  fill
                  className="rounded-full border-2"
                  style={{ borderColor: 'var(--accent-pink)' }}
                />
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-1 truncate max-w-[200px]">
                  {candidate.filename.replace('.pdf', '')}
                </h3>
                <div className="flex items-center space-x-4">
                  <span
                    className="font-bold text-lg"
                    style={{ color: getScoreColor(candidate.score) }}
                  >
                    {(candidate.score * 100).toFixed(1)}% Match
                  </span>
                  <span className="text-sm opacity-70 flex items-center">
                    {candidate.semantic_score > candidate.keyword_score ? (
                      <><Brain size={14} className="mr-1" /> Semantic</>
                    ) : (
                      <><Target size={14} className="mr-1" /> Keyword</>
                    )}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              {!feedbackSubmitted.has(candidate.filename) ? (
                <div className="flex space-x-1">
                  <button
                    onClick={() => handleFeedback(candidate.filename, true, candidate.score)}
                    className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                  >
                    <ThumbsUp size={16} style={{ color: '#22c55e' }} />
                  </button>
                  <button
                    onClick={() => handleFeedback(candidate.filename, false, candidate.score)}
                    className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                  >
                    <ThumbsDown size={16} style={{ color: '#ef4444' }} />
                  </button>
                </div>
              ) : (
                <span className="text-xs opacity-50 bg-white/5 px-2 py-1 rounded">Feedback Received</span>
              )}
            </div>
          </div>

          {/* Progress Bars */}
          <div className="mb-4 p-3 rounded-lg bg-black/20 border border-white/5">
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="opacity-70">Semantic Score</span>
                  <span>{(candidate.semantic_score * 100).toFixed(0)}%</span>
                </div>
                <div className="w-full bg-gray-800 h-1.5 rounded-full overflow-hidden">
                  <div 
                    className="h-full transition-all duration-500" 
                    style={{ width: `${candidate.semantic_score * 100}%`, backgroundColor: 'var(--accent-purple)' }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="opacity-70">Keyword Match</span>
                  <span>{(candidate.keyword_score * 100).toFixed(0)}%</span>
                </div>
                <div className="w-full bg-gray-800 h-1.5 rounded-full overflow-hidden">
                  <div 
                    className="h-full transition-all duration-500" 
                    style={{ width: `${candidate.keyword_score * 100}%`, backgroundColor: 'var(--accent-pink)' }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Evidence Chunk */}
          <div className="mb-4">
            <button
              onClick={() => toggleExpanded(candidate.filename)}
              className="flex items-center justify-between w-full text-sm font-medium mb-2 hover:opacity-80"
            >
              <span>Semantic Evidence</span>
              {expandedResults.has(candidate.filename) ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
            <div 
              className={`p-3 rounded-lg text-sm bg-black/30 border border-white/5 transition-all ${expandedResults.has(candidate.filename) ? '' : 'line-clamp-2'}`}
            >
              {candidate.matched_chunk}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}