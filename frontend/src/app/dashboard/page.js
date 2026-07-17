'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import api from '@/lib/axios'

export default function Dashboard() {
  const router = useRouter()
  const [stats, setStats] = useState({ bookmarks: 0, issues: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/auth')
      return
    }
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token')
      const [bookmarksRes, issuesRes] = await Promise.all([
        api.get('/bookmarks', { headers: { Authorization: `Bearer ${token}` } }),
        api.get('/myissues', { headers: { Authorization: `Bearer ${token}` } })
      ])
      setStats({
        bookmarks: bookmarksRes.data.length,
        issues: issuesRes.data.length
      })
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-coral"></div>
      </div>
    )
  }

  const isNewUser = stats.bookmarks === 0 && stats.issues === 0

  return (
    <div className="container mx-auto my-auto px-4 sm:px-8 md:px-12 py-8 sm:py-12 md:py-16 flex justify-center">
      <div className="w-full max-w-7xl">
      <div className="mb-8 sm:mb-12">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-primary mb-3 flex items-center gap-3">
          {isNewUser && (
            <svg className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 text-coral" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
            </svg>
          )}
          {isNewUser ? 'Welcome to RepoPilot!' : 'Dashboard'}
        </h1>
        <p className="text-muted text-base sm:text-lg md:text-xl">{isNewUser ? 'Let\'s get started with exploring repositories!' : 'Welcome back! Here\'s your activity overview'}</p>
      </div>



      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-12">
        <Link href="/bookmarks" className="group">
          <div className="card-midnight p-6 sm:p-8">
            <div className="flex items-center justify-between mb-6">
              <div className="w-14 h-14 rounded-lg flex items-center justify-center glow-coral" style={{background: 'rgba(255, 107, 107, 0.1)'}}>
                <svg className="w-7 h-7 text-coral" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
              </div>
              <span className="text-4xl sm:text-5xl font-bold text-coral">{stats.bookmarks}</span>
            </div>
            <h3 className="text-lg sm:text-xl font-semibold text-primary mb-2">Bookmarks</h3>
            <p className="text-muted text-sm">Starred repositories</p>
          </div>
        </Link>

        <Link href="/myissues" className="group">
          <div className="card-midnight p-6 sm:p-8">
            <div className="flex items-center justify-between mb-6">
              <div className="w-14 h-14 rounded-lg flex items-center justify-center glow-coral" style={{background: 'rgba(136, 136, 136, 0.1)'}}>
                <svg className="w-7 h-7 text-coral" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="text-4xl sm:text-5xl font-bold text-coral">{stats.issues}</span>
            </div>
            <h3 className="text-lg sm:text-xl font-semibold text-primary mb-2">My Issues</h3>
            <p className="text-muted text-sm">Created by you</p>
          </div>
        </Link>

        <Link href="/repositories" className="group">
          <div className="card-midnight p-6 sm:p-8">
            <div className="flex items-center justify-between mb-6">
              <div className="w-14 h-14 rounded-lg flex items-center justify-center glow-coral" style={{background: 'rgba(255, 107, 107, 0.1)'}}>
                <svg className="w-7 h-7 text-coral" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
            <h3 className="text-lg sm:text-xl font-semibold text-primary mb-2">Explore</h3>
            <p className="text-muted text-sm">Search repositories</p>
          </div>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        <div className="card-midnight">
          <h2 className="text-xl sm:text-2xl font-semibold text-primary mb-4 sm:mb-6">AI Capabilities</h2>
          <div className="space-y-4">
            <div className="flex items-start gap-4 p-4 rounded-lg border border-midnight" style={{background: 'var(--bg-tertiary)'}}>
              <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 glow-coral" style={{background: 'rgba(255, 107, 107, 0.1)'}}>
                <svg className="w-6 h-6 text-coral" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div className="flex-1">
                <span className="text-primary font-medium text-base sm:text-lg block mb-1">Repo Intelligence</span>
                <span className="text-muted text-sm leading-relaxed">Chat directly with any repository using our built-in floating AI Copilot. Ask architectural questions and summarize codebases instantly.</span>
              </div>
            </div>
            
            <div className="flex items-start gap-4 p-4 rounded-lg border border-midnight" style={{background: 'var(--bg-tertiary)'}}>
              <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 glow-coral" style={{background: 'rgba(255, 107, 107, 0.1)'}}>
                <svg className="w-6 h-6 text-coral" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div className="flex-1">
                <span className="text-primary font-medium text-base sm:text-lg block mb-1">Security Scanner</span>
                <span className="text-muted text-sm leading-relaxed">Automatically generate detailed security posture reports with exact CLI commands to fix missing dependencies and flaws.</span>
              </div>
            </div>
          </div>
        </div>

        <div className="card-midnight flex flex-col justify-center items-center text-center p-8">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mb-6 glow-coral" style={{background: 'rgba(255, 107, 107, 0.1)'}}>
            <svg className="w-8 h-8 text-coral" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-primary mb-3">Ready to dive in?</h2>
          <p className="text-muted mb-8 max-w-sm">Discover trending repositories, track your open issues, and let AI guide you through complex codebases.</p>
          <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
            <Link href="/repositories" className="btn-coral flex-1 max-w-[200px]">
              Explore Repos
            </Link>
            <Link href="/issues" className="btn-dark flex-1 max-w-[200px]">
              My Issues
            </Link>
          </div>
        </div>
      </div>
      </div>
    </div>
  )
}
