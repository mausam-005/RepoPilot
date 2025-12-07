'use client'
import Link from 'next/link'
import { useState, useEffect } from 'react'

export default function Hero() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('token')
      setIsLoggedIn(!!token)
    }
    
    checkAuth()
    
    const handleAuthChange = () => checkAuth()
    window.addEventListener('authChange', handleAuthChange)
    
    return () => {
      window.removeEventListener('authChange', handleAuthChange)
    }
  }, [])

  return (
    <div className="relative">
      <div className="min-h-screen flex items-center justify-center px-12">
        <div className="text-center max-w-5xl animate-fade-up">
          <h1 className="text-6xl md:text-7xl font-bold mb-6 text-primary tracking-tight">
            RepoPilot
          </h1>
          <p className="text-2xl mb-6 font-medium text-coral">
            GitHub Explorer & Issue Tracker
          </p>
          <p className="text-xl text-muted mb-12 leading-relaxed max-w-3xl mx-auto">
            A unified dashboard to search repositories, track issues, bookmark repos, and manage project activity — all powered by GitHub API and real-time data.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-20">
            {isLoggedIn ? (
              <Link href="/dashboard" className="btn-coral text-lg px-10 py-4">
                Go to Dashboard
              </Link>
            ) : (
              <Link href="/auth" className="btn-coral text-lg px-10 py-4">
                Get Started Free
              </Link>
            )}
            <Link href="/repositories" className="btn-dark text-lg px-10 py-4">
              View Demo
            </Link>
          </div>
        </div>
      </div>

      <div className="py-24 px-12 border-t border-midnight">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-primary">
              Key Features
            </h2>
            <p className="text-xl text-muted max-w-3xl mx-auto">
              Designed for developers and project managers to manage multiple GitHub repositories, track issues, and stay organized.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="card-midnight">
              <div className="w-14 h-14 rounded-xl flex items-center justify-center mb-4 glow-coral" style={{background: 'rgba(255, 107, 107, 0.1)'}}>
                <svg className="w-7 h-7 text-coral" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-primary mb-3">
                Authentication
              </h3>
              <p className="text-muted">
                Secure login with JWT-based authentication and optional GitHub OAuth for fast, reliable access.
              </p>
            </div>

            <div className="card-midnight">
              <div className="w-14 h-14 rounded-xl flex items-center justify-center mb-4 glow-coral" style={{background: 'rgba(255, 107, 107, 0.1)'}}>
                <svg className="w-7 h-7 text-coral" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M2 2.5A2.5 2.5 0 014.5 0h8.75a.75.75 0 01.75.75v12.5a.75.75 0 01-.75.75h-2.5a.75.75 0 110-1.5h1.75v-2h-8a1 1 0 00-.714 1.7.75.75 0 01-1.072 1.05A2.495 2.495 0 012 11.5v-9zm10.5-1V9h-8c-.356 0-.694.074-1 .208V2.5a1 1 0 011-1h8zM5 12.25v3.25a.25.25 0 00.4.2l1.45-1.087a.25.25 0 01.3 0L8.6 15.7a.25.25 0 00.4-.2v-3.25a.25.25 0 00-.25-.25h-3.5a.25.25 0 00-.25.25z"/>
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-primary mb-3">
                Repository Explorer
              </h3>
              <p className="text-muted">
                Search, sort, and filter repositories using GitHub API integration with pagination support.
              </p>
            </div>

            <div className="card-midnight">
              <div className="w-14 h-14 rounded-xl flex items-center justify-center mb-4 glow-coral" style={{background: 'rgba(255, 107, 107, 0.1)'}}>
                <svg className="w-7 h-7 text-coral" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M4.72.22a.75.75 0 011.06 0l1 .999a3.492 3.492 0 012.441 0l.999-.999a.75.75 0 111.06 1.06l-.693.693c.286.39.499.83.618 1.305h.756a.75.75 0 010 1.5h-.774a4.496 4.496 0 01-.772 2.665l.676.676a.75.75 0 11-1.06 1.06l-.761-.761a3.993 3.993 0 01-3.472 0l-.761.761a.75.75 0 01-1.06-1.06l.676-.676a4.496 4.496 0 01-.772-2.665h-.775a.75.75 0 010-1.5h.757c.118-.475.331-.915.618-1.305L3.66 1.28a.75.75 0 010-1.06zM6.5 5a.75.75 0 100 1.5.75.75 0 000-1.5zm3.75.75a.75.75 0 111.5 0 .75.75 0 01-1.5 0zM8 13a3.988 3.988 0 003.464-2H4.536A3.988 3.988 0 008 13zm2.25-6.5a.75.75 0 100-1.5.75.75 0 000 1.5z"/>
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-primary mb-3">
                Issue Tracker
              </h3>
              <p className="text-muted">
                Create, update, and delete issues with filters and pagination — fully synced with GitHub issues.
              </p>
            </div>

            <div className="card-midnight">
              <div className="w-14 h-14 rounded-xl flex items-center justify-center mb-4 glow-coral" style={{background: 'rgba(255, 107, 107, 0.1)'}}>
                <svg className="w-7 h-7 text-coral" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-primary mb-3">
                Dashboard Overview
              </h3>
              <p className="text-muted">
                Get a snapshot of open issues, recent repository activity, and overall project health in one place.
              </p>
            </div>

            <div className="card-midnight">
              <div className="w-14 h-14 rounded-xl flex items-center justify-center mb-4 glow-coral" style={{background: 'rgba(255, 107, 107, 0.1)'}}>
                <svg className="w-7 h-7 text-coral" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-primary mb-3">
                Bookmarks
              </h3>
              <p className="text-muted">
                Save your favorite repositories and access them instantly from a personalized bookmarks section.
              </p>
            </div>

            <div className="card-midnight">
              <div className="w-14 h-14 rounded-xl flex items-center justify-center mb-4 glow-coral" style={{background: 'rgba(255, 107, 107, 0.1)'}}>
                <svg className="w-7 h-7 text-coral" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M.513 1.513A1.75 1.75 0 011.75 1h3.5c.55 0 1.07.26 1.4.7l.9 1.2a.25.25 0 00.2.1H13a1 1 0 011 1v.5H2.75a.75.75 0 000 1.5h11.978a1 1 0 01.994 1.117L15 13.25A1.75 1.75 0 0113.25 15H1.75A1.75 1.75 0 010 13.25V2.75c0-.464.184-.91.513-1.237z"/>
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-primary mb-3">
                Dedicated Pages
              </h3>
              <p className="text-muted">
                Includes structured pages like Home, Login, Dashboard, Repositories, Repository Details, Issues, and Bookmarks.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
