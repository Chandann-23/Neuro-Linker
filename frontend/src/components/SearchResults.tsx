'use client'

import { useState } from 'react'
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
  results: SearchResult[]
  onFeedback: (filename: string, feedback: boolean, score: number) => void
}

export function SearchResults({ results, onFeedback }: SearchResultsProps) {
  const [expandedResults, setExpandedResults] = useState<Set<string>>(new Set())
  const [feedbackSubmitted, setFeedbackSubmitted] = useState<Set<string>>(new Set())

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
    if (score >= 0.8) return '#22c55e' // green
    if (score >= 0.6) return '#f59e0b' // yellow
    return '#ef4444' // red
  }

  const getMatchType = (semanticScore: number, keywordScore: number) => {
    return semanticScore > keywordScore ? 'semantic' : 'keyword'
  }

  const getAvatarUrl = (filename: string) => {
    // Generate deterministic avatar based on filename
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(filename)}`
  }

  if (results.length === 0) {
    return (
      <div className="glass p-8 text-center">
        <Target className="mx-auto mb-4" size={48} style={{ color: 'var(--accent-purple)' }} />
        <h3 className="text-xl font-semibold mb-2">No Results Found</h3>
        <p className="opacity-70">Upload resumes in the Data Ingestion tab to begin neural indexing.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {results.map((result, index) => (
        <div key={result.filename} className="result-card fade-in">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-4">
              <Image
                src={getAvatarUrl(result.filename)}
                alt={result.filename}
                width={50}
                height={50}
                className="rounded-full border-2"
                style={{ borderColor: 'var(--accent-pink)' }}
              />
              <div>
                <h3 className="text-lg font-semibold mb-1">{result.filename}</h3>
                <div className="flex items-center space-x-4">
                  <span
                    className="font-bold text-lg"
                    style={{ color: getScoreColor(result.score) }}
                  >
                    {(result.score * 100).toFixed(1)}% Match
                  </span>
                  <span className="text-sm opacity-70">
                    {getMatchType(result.semantic_score, result.keyword_score) === 'semantic' ? (
                      <span className="flex items-center">
                        <Brain size={14} className="mr-1" />
                        Semantic
                      </span>
                    ) : (
                      <span className="flex items-center">
                        <Target size={14} className="mr-1" />
                        Keyword
                      </span>
                    )}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              {!feedbackSubmitted.has(result.filename) && (
                <div className="flex space-x-1">
                  <button
                    onClick={() => handleFeedback(result.filename, true, result.score)}
                    className="p-2 rounded-lg hover:bg-green-800 transition-colors"
                    title="Good match"
                  >
                    <ThumbsUp size={16} style={{ color: '#22c55e' }} />
                  </button>
                  <button
                    onClick={() => handleFeedback(result.filename, false, result.score)}
                    className="p-2 rounded-lg hover:bg-red-800 transition-colors"
                    title="Poor match"
                  >
                    <ThumbsDown size={16} style={{ color: '#ef4444' }} />
                  </button>
                </div>
              )}
              {feedbackSubmitted.has(result.filename) && (
                <span className="text-sm opacity-70">Feedback submitted</span>
              )}
            </div>
          </div>

          {/* Score Breakdown */}
          <div className="mb-4 p-3 rounded-lg" style={{ backgroundColor: 'var(--accent-navy)' }}>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="opacity-70">Semantic:</span>
                <div className="flex items-center mt-1">
                  <div className="flex-1 bg-gray-700 rounded-full h-2 mr-2">
                    <div
                      className="h-2 rounded-full"
                      style={{
                        width: `${result.semantic_score * 100}%`,
                        backgroundColor: 'var(--accent-purple)'
                      }}
                    />
                  </div>
                  <span>{(result.semantic_score * 100).toFixed(1)}%</span>
                </div>
              </div>
              <div>
                <span className="opacity-70">Keyword:</span>
                <div className="flex items-center mt-1">
                  <div className="flex-1 bg-gray-700 rounded-full h-2 mr-2">
                    <div
                      className="h-2 rounded-full"
                      style={{
                        width: `${result.keyword_score * 100}%`,
                        backgroundColor: 'var(--accent-pink)'
                      }}
                    />
                  </div>
                  <span>{(result.keyword_score * 100).toFixed(1)}%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Matched Chunk */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium">Match Evidence:</span>
              <button
                onClick={() => toggleExpanded(result.filename)}
                className="p-1 rounded hover:bg-purple-800 transition-colors"
              >
                {expandedResults.has(result.filename) ? (
                  <ChevronUp size={16} />
                ) : (
                  <ChevronDown size={16} />
                )}
              </button>
            </div>
            <div className={`p-3 rounded-lg text-sm ${expandedResults.has(result.filename) ? '' : 'line-clamp-3'}`}
                 style={{ backgroundColor: 'var(--accent-navy)' }}>
              {result.matched_chunk}
            </div>
          </div>

          {/* Skills */}
          <div className="flex flex-wrap gap-2">
            {['Python', 'AI', 'Machine Learning', 'React', 'TypeScript', 'Cloud'].slice(0, 4).map((skill, skillIndex) => (
              <span key={skillIndex} className="skill-chip">
                {skill}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
