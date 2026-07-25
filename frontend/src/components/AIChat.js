
'use client'
import { useState, useRef, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import api from '@/lib/axios'

export default function AIChat({ owner, repo }) {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, isOpen])

  const submitPrompt = async (promptText) => {
    if (loading) return
    const userMessage = { role: 'user', content: promptText }
    setMessages(prev => [...prev, userMessage])
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      const headers = token ? { Authorization: `Bearer ${token}` } : {}
      const { data } = await api.post('/ai/chat', { owner, repo, question: promptText, history: messages }, { headers })
      setMessages(prev => [...prev, { role: 'assistant', content: data.response }])
    } catch (error) {
      console.error('Chat error:', error)
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I encountered an error while analyzing the repository. Please try again.', isError: true }])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const handleCustomPrompt = (e) => {
      setIsOpen(true)
      submitPrompt(e.detail)
    }
    window.addEventListener('trigger-ai-chat', handleCustomPrompt)
    return () => window.removeEventListener('trigger-ai-chat', handleCustomPrompt)
  }, [loading, messages, owner, repo])

  const handleSend = (e) => {
    e?.preventDefault()
    if (!input.trim() || loading) return
    const promptText = input
    setInput('')
    submitPrompt(promptText)
  }

  return (
    <>
      {/* Floating Action Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 z-50 w-16 h-16 rounded-full bg-coral hover:bg-coral-hover text-white shadow-[0_0_20px_rgba(255,107,107,0.4)] flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 ${isOpen ? 'scale-0 opacity-0 pointer-events-none' : 'scale-100 opacity-100'}`}
        title="Ask AI"
      >
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      </button>

      {/* Expanded Chat Window */}
      <div className={`fixed bottom-6 right-6 z-50 w-[90vw] max-w-[450px] h-[600px] max-h-[calc(100vh-2rem)] flex-col bg-tertiary rounded-2xl border border-midnight shadow-2xl overflow-hidden transition-all duration-300 origin-bottom-right ${isOpen ? 'flex scale-100 opacity-100' : 'scale-90 opacity-0 pointer-events-none'}`}>
        <div className="p-4 border-b border-midnight flex items-center justify-between bg-secondary">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full flex items-center justify-center glow-coral bg-coral/10">
              <svg className="w-5 h-5 text-coral" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-primary">Repo Intelligence</h3>
              <p className="text-[10px] text-muted">Ask anything about this codebase</p>
            </div>
          </div>
          <button 
            onClick={() => setIsOpen(false)}
            className="text-muted hover:text-coral transition-colors p-1"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-4 hide-scrollbar">
          {messages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-center p-2">
              <div className="w-16 h-16 rounded-full bg-secondary border border-midnight flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-coral opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h4 className="text-primary font-semibold mb-2">How can I help you?</h4>
              <p className="mb-6 text-sm text-muted">I've analyzed the README and file structure of this repository.</p>
              
              <div className="flex flex-col gap-3 w-full max-w-[300px]">
                <button 
                  onClick={() => setInput('Explain the architecture of this project.')} 
                  className="group flex items-center justify-between text-xs text-left px-4 py-3 rounded-xl border border-midnight/50 hover:border-coral/50 transition-all duration-300 hover:shadow-[0_0_15px_rgba(255,107,107,0.15)] bg-secondary hover:bg-tertiary text-primary"
                >
                  <span className="font-medium tracking-wide">Explain the architecture</span>
                  <svg className="w-4 h-4 text-muted group-hover:text-coral transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                </button>
                
                <button 
                  onClick={() => setInput('How do I install and run this locally?')} 
                  className="group flex items-center justify-between text-xs text-left px-4 py-3 rounded-xl border border-midnight/50 hover:border-coral/50 transition-all duration-300 hover:shadow-[0_0_15px_rgba(255,107,107,0.15)] bg-secondary hover:bg-tertiary text-primary"
                >
                  <span className="font-medium tracking-wide">How to install & run</span>
                  <svg className="w-4 h-4 text-muted group-hover:text-coral transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                </button>
                
                <button 
                  onClick={() => setInput('Find any potential security vulnerabilities.')} 
                  className="group flex items-center justify-between text-xs text-left px-4 py-3 rounded-xl border border-midnight/50 hover:border-coral/50 transition-all duration-300 hover:shadow-[0_0_15px_rgba(255,107,107,0.15)] bg-secondary hover:bg-tertiary text-primary"
                >
                  <span className="font-medium tracking-wide">Scan for vulnerabilities</span>
                  <svg className="w-4 h-4 text-muted group-hover:text-coral transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                </button>
              </div>
            </div>
          )}
          
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                msg.role === 'user' 
                  ? 'bg-coral text-white rounded-br-sm shadow-md' 
                  : msg.isError 
                    ? 'border border-red-500/50 bg-red-500/10 text-primary rounded-bl-sm'
                    : 'bg-secondary text-primary border border-midnight rounded-bl-sm shadow-sm'
              }`}>
                {msg.role === 'user' ? (
                  <p className="text-sm">{msg.content}</p>
                ) : (
                  <div className="prose prose-invert prose-sm max-w-none text-primary 
                    prose-p:leading-relaxed prose-pre:bg-tertiary prose-pre:border prose-pre:border-midnight
                    prose-a:text-coral prose-a:no-underline hover:prose-a:underline">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
                  </div>
                )}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-secondary border border-midnight rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-2">
                <div className="w-2 h-2 bg-coral rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
                <div className="w-2 h-2 bg-coral rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
                <div className="w-2 h-2 bg-coral rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 border-t border-midnight bg-secondary">
          <form onSubmit={handleSend} className="relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question about this repo..."
              className="w-full bg-tertiary border border-midnight rounded-xl pl-4 pr-12 py-3 text-sm text-primary focus:outline-none focus:border-coral transition-colors"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-coral hover:bg-tertiary disabled:opacity-50 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </form>
        </div>
      </div>
    </>
  )
}
