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
    <div className="container mx-auto my-auto px-4 sm:px-8 md:px-12 py-8 sm:py-12 md:py-16">
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

      {isNewUser && (
        <div className="mb-8 p-6 sm:p-8 border border-coral rounded-lg glow-coral animate-fade-in" style={{background: 'rgba(255, 107, 107, 0.05)'}}>
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 glow-coral" style={{background: 'rgba(255, 107, 107, 0.2)'}}>
              <svg className="w-6 h-6 text-coral" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-lg sm:text-xl font-semibold text-primary mb-2 flex items-center gap-2">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-coral" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                </svg>
                Quick Start Guide
              </h3>
              <p className="text-muted text-sm sm:text-base mb-4">Start exploring GitHub repositories, bookmark your favorites, and track issues all in one place!</p>
              <Link href="/repositories" className="btn-coral inline-block">
                Explore Repositories →
              </Link>
            </div>
          </div>
        </div>
      )}

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
          <h2 className="text-xl sm:text-2xl font-semibold text-primary mb-4 sm:mb-6">Quick Actions</h2>
          <div className="space-y-3">
            <Link href="/repositories" className="flex items-center gap-4 p-4 rounded-lg hover:bg-opacity-80 transition-colors group border border-midnight" style={{background: 'var(--bg-tertiary)'}}>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center glow-coral" style={{background: 'rgba(255, 107, 107, 0.1)'}}>
                <svg className="w-6 h-6 text-coral" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <div className="flex-1">
                <span className="text-primary font-medium text-base sm:text-lg block">Search Repositories</span>
                {isNewUser && <span className="text-coral text-xs">Start here! →</span>}
              </div>
            </Link>
            <Link href="/issues" className="flex items-center gap-4 p-4 rounded-lg hover:bg-opacity-80 transition-colors group border border-midnight" style={{background: 'var(--bg-tertiary)'}}>
              <div className="w-8 h-8 rounded-lg flex items-center justify-center glow-coral" style={{background: 'rgba(255, 107, 107, 0.1)'}}>
                <svg className="w-6 h-6 text-coral" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <span className="text-primary font-medium text-base sm:text-lg">Create Issue</span>
            </Link>
          </div>
        </div>

        <div className="card-midnight">
          <h2 className="text-xl sm:text-2xl font-semibold text-primary mb-4 sm:mb-6 flex items-center gap-2">
            {isNewUser && (
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-coral" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
            {isNewUser ? 'How It Works' : 'Getting Started'}
          </h2>
          <ul className="space-y-4">
            <li className="flex items-start gap-3 ">
              <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 glow-coral" style={{background: 'rgba(255, 107, 107, 0.2)'}}>
                <span className="text-coral text-sm font-bold">1</span>
              </div>
              <span className="text-muted">Search and explore GitHub repositories</span>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 glow-coral" style={{background: 'rgba(255, 107, 107, 0.2)'}}>
                <span className="text-coral text-sm font-bold">2</span>
              </div>
              <span className="text-muted">Bookmark your favorite projects</span>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 glow-coral" style={{background: 'rgba(255, 107, 107, 0.2)'}}>
                <span className="text-coral text-sm font-bold">3</span>
              </div>
              <span className="text-muted">Create and manage issues</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}
