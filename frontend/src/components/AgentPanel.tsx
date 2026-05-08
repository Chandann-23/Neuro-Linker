'use client'

import { useState } from 'react'
import { Sparkles, Send, MessageCircle } from 'lucide-react'

interface ChatMessage {
  id: string
  type: 'user' | 'ai'
  content: string
  timestamp: Date
}

export function AgentPanel() {
  const [activeTab, setActiveTab] = useState<'chat' | 'history'>('chat')
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      type: 'ai',
      content: 'Hello! I\'m your NEURO-LINKER AI assistant. I can help you find the perfect candidates for your open positions. What role are you looking to fill?',
      timestamp: new Date()
    }
  ])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)

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
      
      // Add neural processing message
      const processingMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: '🧠 Neural Processing: Analyzing candidates with GLM 5.1...',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, processingMessage])
      
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/search`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            query: inputValue,
            top_k: 5,
            alpha: 0.7
          })
        })

        if (!response.ok) {
          throw new Error('Failed to send message')
        }

        const data = await response.json()
        
        // Remove processing message and add final result
        setMessages(prev => prev.filter(msg => msg.id !== processingMessage.id))
        
        // Format search results as AI response
        const searchResults = Array.isArray(data) ? data : []
        const responseText = searchResults.length > 0 
          ? `🎯 **Agentic Analysis Complete**\n\n${searchResults.map((result, index) => 
              `${index + 1}. **${result.filename}** (Score: ${result.score.toFixed(2)})\n   ${result.content_preview}`
            ).join('\n\n')}`
          : 'I couldn\'t find any candidates matching your query. Please try different keywords.'
        
        const aiMessage: ChatMessage = {
          id: (Date.now() + 2).toString(),
          type: 'ai',
          content: responseText,
          timestamp: new Date()
        }
        
        setMessages(prev => [...prev, aiMessage])
      } catch (error) {
        console.error('Error sending message:', error)
        
        // Remove processing message and add error
        setMessages(prev => prev.filter(msg => msg.id !== processingMessage.id))
        
        const errorMessage: ChatMessage = {
          id: (Date.now() + 2).toString(),
          type: 'ai',
          content: 'Sorry, I encountered an error. Please try again.',
          timestamp: new Date()
        }
        setMessages(prev => [...prev, errorMessage])
      } finally {
        setIsLoading(false)
        setIsProcessing(false)
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
        </div>
      </div>

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
            onClick={handleSend}
            disabled={isLoading || isProcessing}
            className="px-6 py-3 bg-brand-teal text-white rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
          >
            {(isLoading || isProcessing) ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-300 border-t-transparent"></div>
                <span>{isProcessing ? 'Neural Processing...' : 'Thinking...'}</span>
              </>
            ) : (
              <>
                <Send size={16} />
                <span>Send</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
