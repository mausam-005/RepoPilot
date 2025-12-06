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
              <div className="w-14 h-14 rounded-xl flex items-center justify-center mb-4 text-2xl glow-coral" style={{background: 'rgba(255, 107, 107, 0.1)'}}>🔐</div>
              <h3 className="text-xl font-semibold text-primary mb-3">
                Authentication
              </h3>
              <p className="text-muted">
                Secure login with JWT-based authentication and optional GitHub OAuth for fast, reliable access.
              </p>
            </div>

            <div className="card-midnight">
              <div className="w-14 h-14 rounded-xl flex items-center justify-center mb-4 text-2xl glow-coral" style={{background: 'rgba(255, 107, 107, 0.1)'}}>📁</div>
              <h3 className="text-xl font-semibold text-primary mb-3">
                Repository Explorer
              </h3>
              <p className="text-muted">
                Search, sort, and filter repositories using GitHub API integration with pagination support.
              </p>
            </div>

            <div className="card-midnight">
              <div className="w-14 h-14 rounded-xl flex items-center justify-center mb-4 text-2xl glow-coral" style={{background: 'rgba(255, 107, 107, 0.1)'}}>🐞</div>
              <h3 className="text-xl font-semibold text-primary mb-3">
                Issue Tracker
              </h3>
              <p className="text-muted">
                Create, update, and delete issues with filters and pagination — fully synced with GitHub issues.
              </p>
            </div>

            <div className="card-midnight">
              <div className="w-14 h-14 rounded-xl flex items-center justify-center mb-4 text-2xl glow-coral" style={{background: 'rgba(255, 107, 107, 0.1)'}}>📊</div>
              <h3 className="text-xl font-semibold text-primary mb-3">
                Dashboard Overview
              </h3>
              <p className="text-muted">
                Get a snapshot of open issues, recent repository activity, and overall project health in one place.
              </p>
            </div>

            <div className="card-midnight">
              <div className="w-14 h-14 rounded-xl flex items-center justify-center mb-4 text-2xl glow-coral" style={{background: 'rgba(255, 107, 107, 0.1)'}}>⭐</div>
              <h3 className="text-xl font-semibold text-primary mb-3">
                Bookmarks
              </h3>
              <p className="text-muted">
                Save your favorite repositories and access them instantly from a personalized bookmarks section.
              </p>
            </div>

            <div className="card-midnight">
              <div className="w-14 h-14 rounded-xl flex items-center justify-center mb-4 text-2xl glow-coral" style={{background: 'rgba(255, 107, 107, 0.1)'}}>🗂️</div>
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
