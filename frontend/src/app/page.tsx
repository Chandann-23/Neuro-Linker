'use client'

import { useState, useEffect } from 'react'
import { SearchResults } from '@/components/SearchResults'
import { UploadZone } from '@/components/UploadZone'
import { SearchInterface } from '@/components/SearchInterface'
import { SystemMetrics } from '@/components/SystemMetrics'
import { Alert } from '@/components/Alert'

export default function Home() {
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: any }>({})
  const [metrics, setMetrics] = useState<any>(null)
  const [alert, setAlert] = useState<{ type: string; message: string } | null>(null)

  const handleSearch = async (query: string, options: any) => {
    setIsSearching(true)
    setAlert(null)

    try {
      const response = await fetch('http://localhost:7860/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query,
          top_k: options.topK || 5,
          alpha: options.alpha || 0.7,
          filters: options.filters || {}
        })
      })

      if (!response.ok) {
        throw new Error('Search failed')
      }

      const results = await response.json()
      setSearchResults(results)

      if (results.length === 0) {
        setAlert({
          type: 'warning',
          message: 'No results found. Try adjusting your search criteria.'
        })
      }
    } catch (error) {
      setAlert({
        type: 'error',
        message: 'Search failed. Please try again.'
      })
    } finally {
      setIsSearching(false)
    }
  }

  const handleUpload = async (files: File[]) => {
    const formData = new FormData()
    files.forEach(file => {
      formData.append('files', file)
    })

    try {
      const response = await fetch('http://localhost:7860/upload', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        throw new Error('Upload failed')
      }

      const result = await response.json()
      const taskId = result.task_id

      // Poll for progress
      const pollProgress = async () => {
        try {
          const progressResponse = await fetch(`http://localhost:7860/status/${taskId}`)
          const progress = await progressResponse.json()
          
          setUploadProgress(prev => ({
            ...prev,
            [taskId]: progress
          }))

          if (progress.status === 'processing') {
            setTimeout(pollProgress, 2000)
          } else if (progress.status === 'completed') {
            setAlert({
              type: 'success',
              message: `Successfully processed ${progress.total_files} files`
            })
            // Refresh metrics
            fetchMetrics()
          } else if (progress.status === 'failed') {
            setAlert({
              type: 'error',
              message: `Processing failed: ${progress.message}`
            })
          }
        } catch (error) {
          console.error('Error polling progress:', error)
        }
      }

      pollProgress()
    } catch (error) {
      setAlert({
        type: 'error',
        message: 'Upload failed. Please try again.'
      })
    }
  }

  const fetchMetrics = async () => {
    try {
      const response = await fetch('http://localhost:7860/metrics')
      const data = await response.json()
      setMetrics(data)
    } catch (error) {
      console.error('Error fetching metrics:', error)
    }
  }

  const handleFeedback = async (filename: string, feedback: boolean, score: number) => {
    try {
      await fetch('http://localhost:7860/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          task_id: 'search_' + Date.now(),
          filename,
          feedback,
          score
        })
      })
    } catch (error) {
      console.error('Error submitting feedback:', error)
    }
  }

  // Fetch metrics on mount
  useEffect(() => {
    fetchMetrics()
  }, [])

  return (
    <div className="min-h-screen" style={{backgroundColor: 'var(--bg-dark)'}}>
      {/* Header */}
      <div className="gradient-bg text-white py-16 px-8">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-6xl font-bold mb-4 tracking-tight">
            NEURO-LINKER
          </h1>
          <p className="text-2xl" style={{color: 'var(--accent-pink)'}} className="font-semibold tracking-wider mb-4">
            VELVET EDITION
          </p>
          <p className="text-lg max-w-2xl mx-auto opacity-90" style={{color: 'rgba(255,255,255,0.9)'}}>
            Neural-vector linkage engine for elite candidate matching powered by semantic search and AI
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-8 py-12">
        {alert && (
          <Alert
            type={alert.type}
            message={alert.message}
            onClose={() => setAlert(null)}
          />
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Upload Section */}
          <div className="lg:col-span-1">
            <UploadZone
              onUpload={handleUpload}
              uploadProgress={uploadProgress}
            />
          </div>

          {/* Search Section */}
          <div className="lg:col-span-2">
            <SearchInterface
              onSearch={handleSearch}
              isSearching={isSearching}
            />
          </div>
        </div>

        {/* Results Section */}
        {searchResults.length > 0 && (
          <div className="mb-12">
            <h2 className="text-3xl font-bold mb-8 gradient-text">
              Top Match Results
            </h2>
            <SearchResults
              results={searchResults}
              onFeedback={handleFeedback}
            />
          </div>
        )}

        {/* Metrics Section */}
        {metrics && (
          <div className="mb-12">
            <h2 className="text-3xl font-bold mb-8 gradient-text">
              System Metrics
            </h2>
            <SystemMetrics metrics={metrics} />
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="border-t py-8 px-8" style={{borderColor: 'var(--accent-navy)'}}>
        <div className="max-w-6xl mx-auto text-center" style={{color: 'rgba(255,255,255,0.8)'}}>
          <p>© 2024 NEURO-LINKER - Production-grade semantic recruitment system</p>
        </div>
      </footer>
    </div>
  )
}
