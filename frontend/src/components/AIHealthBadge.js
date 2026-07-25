'use client'
import { useState, useEffect } from 'react'
import api from '@/lib/axios'

export default function AIHealthBadge({ owner, repo }) {
  const [health, setHealth] = useState(null)
  const [loading, setLoading] = useState(false)

  const fetchHealth = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      const headers = token ? { Authorization: `Bearer ${token}` } : {}
      const { data } = await api.post('/ai/repo-health', { owner, repo }, { headers })
      setHealth(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-md border border-midnight bg-tertiary animate-pulse">
        <div className="w-2 h-2 rounded-full bg-coral/50"></div>
        <span className="text-muted">Analyzing...</span>
      </div>
    )
  }

  if (!health) {
    return (
      <button 
        onClick={fetchHealth}
        className="flex items-center gap-1.5 text-[10px] font-semibold px-2 py-0.5 rounded-md border border-coral/30 text-coral hover:bg-coral/10 transition-colors"
        title="Click to run an AI Health Check"
      >
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
        AI Health Check
      </button>
    )
  }

  // Score from 1 to 10
  const getScoreColor = (score) => {
    if (score >= 8) return 'text-green-400 bg-green-400/10 border-green-400/20'
    if (score >= 5) return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20'
    return 'text-red-400 bg-red-400/10 border-red-400/20'
  }

  const getIndicatorColor = (score) => {
    if (score >= 8) return 'bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.5)]'
    if (score >= 5) return 'bg-yellow-400 shadow-[0_0_8px_rgba(250,204,21,0.5)]'
    return 'bg-red-400 shadow-[0_0_8px_rgba(248,113,113,0.5)]'
  }

  return (
    <div 
      className={`group relative flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-md border transition-all hover:scale-105 cursor-help ${getScoreColor(health.score)}`}
      title={health.description}
    >
      <div className={`w-2 h-2 rounded-full ${getIndicatorColor(health.score)}`}></div>
      <span>{health.score}/10 {health.verdict}</span>
      
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-gray-900 border border-gray-700 rounded-lg text-[10px] leading-tight text-gray-300 font-normal opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 text-center shadow-xl">
        {health.description}
        <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-700"></div>
      </div>
    </div>
  )
}
