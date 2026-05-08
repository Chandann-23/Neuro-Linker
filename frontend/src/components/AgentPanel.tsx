'use client'

import { useState } from 'react'
import { Sparkles, Send, MessageCircle, Upload, FileText } from 'lucide-react'

interface FileUploadProps {
  onFileUpload: (file: File) => Promise<void>
}

interface ChatMessage {
  id: string
  type: 'user' | 'ai'
  content: string
  timestamp: Date
}

export function AgentPanel({ onFileUpload }: FileUploadProps) {
  const [activeTab, setActiveTab] = useState<'chat' | 'history' | 'ingest'>('chat')
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      type: 'ai',
      content: 'Hello! I\'m your NEURO-LINKER AI assistant. I can help you find perfect candidates for your open positions. What role are you looking to fill?',
      timestamp: new Date()
    }
  ])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isNeuralAnalysis, setIsNeuralAnalysis] = useState(false)
  const [uploadStatus, setUploadStatus] = useState<string | null>(null)

  const handleFileUpload = async (file: File) => {
    if (!file) return
    
    setUploadStatus('Vectorizing PDF...')
    const formData = new FormData()
    formData.append('file', file)
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/upload-single`, {
        method: 'POST',
        body: formData
      })
      
      if (response.ok) {
        const result = await response.json()
        setUploadStatus('Neural Profile Synced to Vector Store')
        setTimeout(() => setUploadStatus(null), 3000)
      } else {
        throw new Error('Upload failed')
      }
    } catch (error) {
      setUploadStatus('Upload failed')
      setTimeout(() => setUploadStatus(null), 3000)
    }
  }

  const handleClearVectorStore = async () => {
    try {
      setUploadStatus('Clearing Vector Store...')
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/clear-store`, {
        method: 'POST'
      })
      
      if (response.ok) {
        setUploadStatus('Vector Store Cleared Successfully')
        setTimeout(() => setUploadStatus(null), 3000)
      } else {
        throw new Error('Clear failed')
      }
    } catch (error) {
      setUploadStatus('Clear failed')
      setTimeout(() => setUploadStatus(null), 3000)
    }
  }

  const handleSendMessage = async () => {
    if (inputValue.trim() && !isLoading && !isProcessing) {
      const userMessage: ChatMessage = {
        id: Date.now().toString(),
        type: 'user',
        content: inputValue,
        timestamp: new Date()
      }
      
      setMessages(prev => [...prev, userMessage])
      setInputValue('')
      setIsLoading(true)
      setIsProcessing(true)
      setIsNeuralAnalysis(true)
      
      // Add AI thinking message
      const thinkingMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: '🧠 Neural Processing...',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, thinkingMessage])
      
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/search`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            query: inputValue,
            alpha: 0.7,
            filters: {}
          })
        })
        
        if (!response.ok) {
          throw new Error('Search failed')
        }
        
        const data = await response.json()
        
        // Add Neural Analysis message
        const neuralMessage: ChatMessage = {
          id: (Date.now() + 2).toString(),
          type: 'ai',
          content: '🔬 **Neural Analysis**\n\nAnalyzing candidate matches with Qwen2.5-7B-Instruct...',
          timestamp: new Date()
        }
        setMessages(prev => [...prev, neuralMessage])
        
        // Format search results with new JSON response from Qwen
        const searchResults = Array.isArray(data) ? data : []
        let responseText = ''
        
        if (searchResults.length > 0) {
          responseText = `🎯 **Neural Analysis Complete**\n\nFound ${searchResults.length} candidates:\n\n${searchResults.map((result, index) => 
              `${index + 1}. **${result.filename}**\n   📊 Match Score: ${Math.round((result.score || 0) * 100)}%\n   📄 ${result.content_preview}`
            ).join('\n\n')}`
        } else {
          responseText = '🔍 **Database Empty**\n\nNo candidates found in vector store. Please upload resumes using the **Data Ingestion** tab to build your candidate database.'
        }
        
        const aiMessage: ChatMessage = {
          id: (Date.now() + 3).toString(),
          type: 'ai',
          content: responseText,
          timestamp: new Date()
        }
        
        setMessages(prev => [...prev, aiMessage])
      } catch (error) {
        console.error('Search error:', error)
        const errorMessage: ChatMessage = {
          id: (Date.now() + 2).toString(),
          type: 'ai',
          content: '❌ **Search Error**\n\nI encountered an error while searching. Please try again or check your connection.',
          timestamp: new Date()
        }
        setMessages(prev => [...prev, errorMessage])
      } finally {
        setIsLoading(false)
        setIsProcessing(false)
        setIsNeuralAnalysis(false)
      }
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      handleSendMessage()
    }
  }

  const handleSend = () => {
    handleSendMessage()
  }

  return (
    <div className="flex flex-col h-full" style={{backgroundColor: '#F4F8F8'}}>
      {/* Header */}
      <div className="p-6 border-b border-teal-50">
        <div className="flex flex-col gap-1 mb-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-brand-teal to-gray-400"></div>
            <h1 className="text-3xl font-black text-[#004D40]">NEURO-LINKER</h1>
          </div>
          <div className="text-[10px] tracking-[0.2em] font-mono text-[#008080]">AI CORE: ACTIVE</div>
        </div>
        
        {/* Tabs */}
        <div className="flex space-x-6">
          <button
            onClick={() => setActiveTab('chat')}
            className={`pb-2 px-1 text-sm font-medium transition-colors ${
              activeTab === 'chat'
                ? 'text-brand-teal border-b-2 border-brand-teal'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <MessageCircle size={16} className="inline mr-2" />
            Chat
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`pb-2 px-1 text-sm font-medium transition-colors ${
              activeTab === 'history'
                ? 'text-brand-teal border-b-2 border-brand-teal'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            History
          </button>
          <button
            onClick={() => setActiveTab('ingest')}
            className={`pb-2 px-1 text-sm font-medium transition-colors ${
              activeTab === 'ingest'
                ? 'text-brand-teal border-b-2 border-brand-teal'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Data Ingestion
          </button>
        </div>
      </div>

      {/* Data Ingestion Tab */}
      {activeTab === 'ingest' && (
        <div className="flex-1 p-6">
          <div className="border-2 border-dashed border-teal-200 rounded-lg p-6">
            <div className="text-center mb-4">
              <Upload size={48} className="mx-auto text-teal-600 mb-2" />
              <h3 className="text-lg font-semibold text-dark-teal mb-2">Data Ingestion</h3>
              <p className="text-sm text-gray-600 mb-4">Upload PDF resumes to vector database</p>
            </div>
            
            <div className="border-2 border-dashed border-teal-200 rounded-lg p-4">
              <input
                type="file"
                accept=".pdf"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) {
                    handleFileUpload(file)
                  }
                }}
                className="w-full px-4 py-3 bg-white border border-teal-200 rounded-lg text-sm file:mr-4 file:pdf hover:bg-teal-50 cursor-pointer"
              />
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Choose PDF file or drag and drop
              </label>
            </div>
            
            {uploadStatus && (
              <div className="mt-4 p-3 bg-teal-50 rounded-lg border border-teal-200">
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-teal-600 border-t-transparent"></div>
                  <span className="text-sm text-teal-700">{uploadStatus}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Chat Messages */}
      {activeTab === 'chat' && (
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.type === 'ai' ? 'justify-start' : 'justify-end'
              } mb-4`}
            >
              <div className={`max-w-[80%] px-4 py-3 rounded-2xl border ${
                message.type === 'ai' 
                  ? 'bg-[#E0F2F1] text-gray-800 border-[#E0F2F1]' 
                  : 'bg-white text-gray-800 border-[#E0F2F1]'
              }`}>
                <p className="text-sm">{message.content}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Input Area */}
      <div className="p-4 border-t border-teal-50">
        <div className="flex items-center space-x-2">
          <div className="flex-1 relative">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask about candidates..."
              disabled={isLoading}
              className="w-full px-4 py-3 bg-white border border-[#E0F2F1] rounded-lg shadow-lg focus:outline-none focus:ring-2 focus:ring-brand-teal disabled:opacity-50"
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              {isLoading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-300 border-t-transparent"></div>
              ) : (
                <Sparkles size={16} className="text-gray-400" />
              )}
            </div>
          </div>
          <button
            onClick={handleSendMessage}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            disabled={isLoading || !inputValue.trim() || isProcessing}
            className={`px-4 py-2 rounded-lg font-medium transition-all transform ${
              isLoading || !inputValue.trim() || isProcessing
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-brand-teal to-teal-600 text-white hover:from-teal-600 hover:to-teal-700 hover:scale-105 active:scale-95'
            }`}
          >
            {isNeuralAnalysis ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Neural Analysis...
              </span>
            ) : isProcessing ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Neural Processing...
              </span>
            ) : (
              'Send'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
