
'use client'
import { useState, useRef, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import api from '@/lib/axios'

export default function AIChat() {
  const { owner, repo } = useParams()
  const router = useRouter()
  const isRepoContext = !!(owner && repo)
  
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const [showHistory, setShowHistory] = useState(false)
  const [historyList, setHistoryList] = useState([])
  const [currentChatId, setCurrentChatId] = useState(null)
  
  const messagesEndRef = useRef(null)
  const isOpenRef = useRef(isOpen)
  const chatContainerRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (chatContainerRef.current && !chatContainerRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }
    
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  useEffect(() => {
    isOpenRef.current = isOpen
    if (isOpen) setUnreadCount(0)
    if (!isOpen) setShowHistory(false)
  }, [isOpen])

  const fetchHistory = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) return
      
      const { data } = await api.get('/ai/history', { headers: { Authorization: `Bearer ${token}` } })
      
      const list = data.map(chat => {
        let name = 'Global Chat'
        if (!chat.isGlobal && chat.owner && chat.repo) {
          name = `${chat.owner}/${chat.repo}`
        }
        return { 
          id: chat._id, 
          name, 
          count: chat.messages.length, 
          lastMessage: chat.messages[chat.messages.length - 1]?.content || '', 
          isGlobal: chat.isGlobal, 
          owner: chat.owner, 
          repo: chat.repo,
          messages: chat.messages
        }
      }).filter(item => item.count > 0)
      
      setHistoryList(list)

      // Find the current context chat
      const currentContextChat = list.find(c => c.isGlobal === !isRepoContext && c.owner === (owner || null) && c.repo === (repo || null))
      if (currentContextChat) {
        setMessages(currentContextChat.messages)
        setCurrentChatId(currentContextChat.id)
      } else {
        setMessages([])
        setCurrentChatId(null)
      }
    } catch (error) {
      console.error('Failed to fetch chat history', error)
    }
  }

  // Fetch history when context changes or when history panel is opened
  useEffect(() => {
    fetchHistory()
  }, [owner, repo, showHistory])

  const syncHistoryToDB = async (updatedMessages) => {
    try {
      const token = localStorage.getItem('token')
      if (!token) return
      
      const { data } = await api.post('/ai/history', { 
        owner: owner || null, 
        repo: repo || null, 
        isGlobal: !isRepoContext, 
        messages: updatedMessages 
      }, { headers: { Authorization: `Bearer ${token}` } })
      setCurrentChatId(data._id)
    } catch (error) {
      console.error('Failed to sync chat history', error)
    }
  }

  const handleDeleteHistory = async (e, id) => {
    e.stopPropagation() // Prevent triggering the row click
    try {
      const token = localStorage.getItem('token')
      await api.delete(`/ai/history/${id}`, { headers: { Authorization: `Bearer ${token}` } })
      
      setHistoryList(prev => prev.filter(item => item.id !== id))
      if (currentChatId === id) {
        setMessages([])
        setCurrentChatId(null)
      }
    } catch (error) {
      console.error('Failed to delete history', error)
    }
  }

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
    const newMessages = [...messages, userMessage]
    setMessages(newMessages)
    setLoading(true)
    
    try {
      const token = localStorage.getItem('token')
      const headers = token ? { Authorization: `Bearer ${token}` } : {}
      const { data } = await api.post('/ai/chat', { owner, repo, question: promptText, history: newMessages }, { headers })
      
      const finalMessages = [...newMessages, { role: 'assistant', content: data.response }]
      setMessages(finalMessages)
      syncHistoryToDB(finalMessages)
      
      if (!isOpenRef.current) {
        setUnreadCount(prev => prev + 1)
      }
    } catch (error) {
      console.error('Chat error:', error)
      const errorMessages = [...newMessages, { role: 'assistant', content: 'Sorry, I encountered an error while analyzing the repository. Please try again.', isError: true }]
      setMessages(errorMessages)
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

  const handleSuggestionClick = (text) => {
    if (loading) return
    submitPrompt(text)
  }

  return (
    <>
      {/* Floating Action Button */}
      <div className={`fixed bottom-6 right-6 z-50 transition-all duration-300 ${isOpen ? 'scale-0 opacity-0 pointer-events-none' : 'scale-100 opacity-100'}`}>
        <button
          onClick={() => setIsOpen(true)}
          className="relative w-16 h-16 rounded-full bg-coral hover:bg-coral-hover text-white shadow-[0_0_20px_rgba(255,107,107,0.4)] flex items-center justify-center transition-all hover:scale-110 active:scale-95"
          title="Ask AI"
        >
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white shadow-lg animate-bounce">
              {unreadCount}
            </span>
          )}
        </button>
      </div>

      {/* Expanded Chat Window */}
      <div ref={chatContainerRef} className={`fixed bottom-6 right-6 z-50 w-[90vw] max-w-[450px] h-[600px] max-h-[calc(100vh-2rem)] flex-col bg-tertiary rounded-2xl border border-midnight shadow-2xl overflow-hidden transition-all duration-300 origin-bottom-right ${isOpen ? 'flex scale-100 opacity-100' : 'scale-90 opacity-0 pointer-events-none'}`}>
        <div className="p-4 border-b border-midnight flex items-center justify-between bg-secondary">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full flex items-center justify-center glow-coral bg-coral/10">
              <svg className="w-5 h-5 text-coral" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-primary">{isRepoContext ? 'Repo Intelligence' : 'RepoPilot AI Copilot'}</h3>
              <p className="text-[10px] text-muted">{isRepoContext ? `Ask about ${owner}/${repo}` : 'Ask anything about software development'}</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button 
              onClick={() => setShowHistory(!showHistory)}
              title="Chat History"
              className={`transition-colors p-1.5 ${showHistory ? 'text-coral' : 'text-muted hover:text-coral'}`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
            <button 
              onClick={() => {
                setMessages([])
                syncHistoryToDB([]) // Sync empty array to DB
              }}
              title="New Chat"
              className="text-muted hover:text-coral transition-colors p-1.5"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
            <button 
              onClick={() => setIsOpen(false)}
              className="text-muted hover:text-coral transition-colors p-1.5"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-4 hide-scrollbar">
          {showHistory ? (
            <div className="space-y-3">
              <h4 className="text-primary font-semibold mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-coral" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                Past Conversations
              </h4>
              {historyList.length === 0 ? (
                <p className="text-muted text-sm text-center mt-10">No chat history found.</p>
              ) : (
                historyList.map(item => (
                  <div 
                    key={item.id}
                    onClick={() => {
                      setShowHistory(false)
                      if (item.isGlobal) {
                        router.push('/dashboard')
                      } else {
                        router.push(`/repositories/${item.owner}/${item.repo}`)
                      }
                    }}
                    className="w-full group flex flex-col text-left px-4 py-3 rounded-xl border border-midnight/50 hover:border-coral/50 transition-all duration-300 hover:shadow-[0_0_15px_rgba(255,107,107,0.15)] bg-secondary hover:bg-tertiary cursor-pointer relative"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-primary group-hover:text-coral transition-colors">{item.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] bg-midnight/50 text-muted px-2 py-0.5 rounded-full">{item.count} msgs</span>
                        <button 
                          onClick={(e) => handleDeleteHistory(e, item.id)}
                          className="text-muted hover:text-red-500 transition-colors p-1 opacity-60 hover:opacity-100"
                          title="Delete Session"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                      </div>
                    </div>
                    <span className="text-xs text-muted line-clamp-1 pr-6">{item.lastMessage}</span>
                  </div>
                ))
              )}
            </div>
          ) : (
            <>
              {messages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-center p-2">
              <div className="w-16 h-16 rounded-full bg-secondary border border-midnight flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-coral opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h4 className="text-primary font-semibold mb-2">How can I help you?</h4>
              <p className="mb-6 text-sm text-muted">{isRepoContext ? `I've analyzed the README and file structure of ${repo}.` : 'I am your RepoPilot Copilot. How can I assist you today?'}</p>
              
              <div className="flex flex-col gap-3 w-full max-w-[300px]">
                <button 
                  onClick={() => handleSuggestionClick(isRepoContext ? 'Explain the architecture of this project.' : 'What can RepoPilot do?')} 
                  className="group flex items-center justify-between text-xs text-left px-4 py-3 rounded-xl border border-midnight/50 hover:border-coral/50 transition-all duration-300 hover:shadow-[0_0_15px_rgba(255,107,107,0.15)] bg-secondary hover:bg-tertiary text-primary"
                >
                  <span className="font-medium tracking-wide">{isRepoContext ? 'Explain the architecture' : 'Platform Features'}</span>
                  <svg className="w-4 h-4 text-muted group-hover:text-coral transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                </button>
                
                <button 
                  onClick={() => handleSuggestionClick(isRepoContext ? 'How do I install and run this locally?' : 'Give me a GitHub best practice.')} 
                  className="group flex items-center justify-between text-xs text-left px-4 py-3 rounded-xl border border-midnight/50 hover:border-coral/50 transition-all duration-300 hover:shadow-[0_0_15px_rgba(255,107,107,0.15)] bg-secondary hover:bg-tertiary text-primary"
                >
                  <span className="font-medium tracking-wide">{isRepoContext ? 'How to install & run' : 'GitHub Best Practices'}</span>
                  <svg className="w-4 h-4 text-muted group-hover:text-coral transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                </button>
                
                <button 
                  onClick={() => handleSuggestionClick(isRepoContext ? 'Find any potential security vulnerabilities.' : 'How do I manage issues here?')} 
                  className="group flex items-center justify-between text-xs text-left px-4 py-3 rounded-xl border border-midnight/50 hover:border-coral/50 transition-all duration-300 hover:shadow-[0_0_15px_rgba(255,107,107,0.15)] bg-secondary hover:bg-tertiary text-primary"
                >
                  <span className="font-medium tracking-wide">{isRepoContext ? 'Scan for vulnerabilities' : 'Manage Issues'}</span>
                  <svg className="w-4 h-4 text-muted group-hover:text-coral transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                </button>

                <button 
                  onClick={() => handleSuggestionClick(isRepoContext ? 'Summarize this repository\'s main purpose.' : 'How do I track a repository\'s health?')} 
                  className="group flex items-center justify-between text-xs text-left px-4 py-3 rounded-xl border border-midnight/50 hover:border-coral/50 transition-all duration-300 hover:shadow-[0_0_15px_rgba(255,107,107,0.15)] bg-secondary hover:bg-tertiary text-primary"
                >
                  <span className="font-medium tracking-wide">{isRepoContext ? 'Summarize this repository' : 'Track Repo Health'}</span>
                  <svg className="w-4 h-4 text-muted group-hover:text-coral transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                </button>

                <button 
                  onClick={() => handleSuggestionClick(isRepoContext ? 'Identify any hidden bugs or performance issues.' : 'Show me how to search for repositories.')} 
                  className="group flex items-center justify-between text-xs text-left px-4 py-3 rounded-xl border border-midnight/50 hover:border-coral/50 transition-all duration-300 hover:shadow-[0_0_15px_rgba(255,107,107,0.15)] bg-secondary hover:bg-tertiary text-primary"
                >
                  <span className="font-medium tracking-wide">{isRepoContext ? 'Find hidden issues' : 'Search Repositories'}</span>
                  <svg className="w-4 h-4 text-muted group-hover:text-coral transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                </button>
              </div>
            </div>
          )}
          
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                msg.role === 'user' 
                  ? 'bg-coral/10 border border-coral/30 text-primary rounded-br-sm shadow-[0_0_10px_rgba(255,107,107,0.1)]' 
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
            </>
          )}
        </div>

        <div className="p-4 border-t border-midnight bg-secondary">
          <form onSubmit={handleSend} className="relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={showHistory ? "Select a conversation above..." : (isRepoContext ? "Ask a question about this repo..." : "Ask RepoPilot anything...")}
              className="w-full bg-tertiary border border-midnight rounded-xl pl-4 pr-12 py-3 text-sm text-primary focus:outline-none focus:border-coral transition-colors"
              disabled={loading || showHistory}
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
