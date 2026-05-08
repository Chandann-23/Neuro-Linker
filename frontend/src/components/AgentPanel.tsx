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
      content: 'Hello! I\'m your AI recruitment assistant. I can help you find the perfect candidates for your open positions. What role are you looking to fill?',
      timestamp: new Date()
    }
  ])
  const [inputValue, setInputValue] = useState('')

  const handleSendMessage = () => {
    if (inputValue.trim()) {
      const userMessage: ChatMessage = {
        id: Date.now().toString(),
        type: 'user',
        content: inputValue,
        timestamp: new Date()
      }
      
      setMessages(prev => [...prev, userMessage])
      setInputValue('')
      
      // Simulate AI response
      setTimeout(() => {
        const aiMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          type: 'ai',
          content: 'I\'m searching our database for qualified candidates. Let me analyze the requirements and find the best matches for you.',
          timestamp: new Date()
        }
        setMessages(prev => [...prev, aiMessage])
      }, 1000)
    }
  }

  return (
    <div className="flex flex-col h-full bg-warm-white">
      {/* Header */}
      <div className="p-4 border-b border-teal-50">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-brand-teal to-gray-400"></div>
            <h1 className="text-2xl font-bold font-serif text-gray-800">SYNAPSE</h1>
          </div>
          <div className="text-xs font-mono text-brand-teal">SYNAPTIC CORE: ACTIVE</div>
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
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs px-4 py-3 rounded-2xl ${
                  message.type === 'user'
                    ? 'bg-brand-teal text-white'
                    : 'bg-soft-teal text-gray-800 shadow-glass'
                }`}
              >
                <p className="text-sm">{message.content}</p>
                <p className={`text-xs mt-1 ${
                  message.type === 'user' ? 'text-teal-100' : 'text-gray-500'
                }`}>
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
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
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Describe your ideal candidate..."
              className="w-full px-4 py-3 pr-12 bg-white border border-teal-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-teal focus:border-transparent"
            />
            <Sparkles className="absolute right-3 top-3.5 h-5 w-5 text-brand-teal" />
          </div>
          <button
            onClick={handleSendMessage}
            className="p-3 bg-brand-teal text-white rounded-xl hover:bg-teal-700 transition-colors"
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  )
}
