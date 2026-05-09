'use client'

import { useState, useEffect } from 'react'
import { Target, ThumbsUp, ThumbsDown, ChevronDown, ChevronUp, Brain } from 'lucide-react'
import Image from 'next/image'

interface SearchResult {
  filename: string
  score: number
  semantic_score: number
  keyword_score: number
  matched_chunk: string
}

interface SearchResultsProps {
  data: SearchResult[] // RENAMED FROM 'results' TO 'data' TO AVOID CONFLICT
  onFeedback: (filename: string, feedback: boolean, score: number) => void
}

export function SearchResults({ data, onFeedback }: SearchResultsProps) {
  const [expandedResults, setExpandedResults] = useState<Set<string>>(new Set())
  const [feedbackSubmitted, setFeedbackSubmitted] = useState<Set<string>>(new Set())
  const [isClient, setIsClient] = useState(false)

  // Ensure this only runs in the browser
  useEffect(() => {
    setIsClient(true)
  }, [])

  const toggleExpanded = (filename: string) => {
    const newExpanded = new Set(expandedResults)
    newExpanded.has(filename) ? newExpanded.delete(filename) : newExpanded.add(filename)
    setExpandedResults(newExpanded)
  }

  // ULTIMATE GUARD: Force an array even if the parent passes undefined
  const safeResults = Array.isArray(data) ? data : [];

  if (!isClient) return null;

  if (safeResults.length === 0) {
    return (
      <div className="glass p-12 text-center fade-in rounded-2xl border border-white/10">
        <Target className="mx-auto mb-4 opacity-20" size={64} style={{ color: 'var(--accent-purple)' }} />
        <h3 className="text-xl font-bold mb-2">Neural Engine Ready</h3>
        <p className="opacity-60 max-w-xs mx-auto text-sm">
          Awaiting search query or uploaded candidate data from the cloud.
        </p>
      </div>
    )
  }

  return (
    <div className="grid gap-6 fade-in pb-10">
      {safeResults.map((candidate, index) => (
        <div key={`${candidate.filename}-${index}`} className="result-card p-6 bg-black/40 rounded-xl border border-white/5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-purple-500/30">
                <img 
                  src={`https://api.dicebear.com/7.x/initials/svg?seed=${candidate.filename}`} 
                  alt="Avatar" 
                />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white truncate max-w-[200px]">
                  {candidate.filename.replace('.pdf', '')}
                </h3>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xl font-black text-green-400">
                    {(candidate.score * 100).toFixed(0)}%
                  </span>
                  <span className="text-[10px] uppercase tracking-widest px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 flex items-center gap-1">
                    <Brain size={10} /> Neural Match
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Result Evidence */}
          <div className="mt-4">
            <div 
              className={`p-4 rounded-lg bg-black/50 text-sm leading-relaxed border border-white/5 text-gray-300 transition-all ${
                expandedResults.has(candidate.filename) ? '' : 'line-clamp-2'
              }`}
            >
              <span className="text-purple-400 font-bold mr-2">CONTEXT:</span>
              {candidate.matched_chunk}
            </div>
            <button 
              onClick={() => toggleExpanded(candidate.filename)}
              className="mt-2 text-[10px] uppercase text-purple-400 hover:text-white font-bold tracking-tighter"
            >
              {expandedResults.has(candidate.filename) ? 'Show Less [-]' : 'Show Deep Match [+]'}
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}