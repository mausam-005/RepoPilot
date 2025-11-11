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
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="text-center max-w-5xl animate-fade-up">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 text-white tracking-tight">
            RepoPilot
          </h1>
          <p className="text-xl md:text-2xl text-blue-400 mb-6 font-medium">
            GitHub Explorer & Issue Tracker
          </p>
          <p className="text-lg text-slate-300 mb-12 leading-relaxed max-w-3xl mx-auto">
            A unified dashboard to search repositories, track issues, bookmark repos, and manage project activity — all powered by GitHub API and real-time data.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-20">
            {isLoggedIn ? (
              <Link
                href="/bookmarks"
                className="bg-green-600 hover:bg-green-700 px-8 py-4 rounded-lg font-semibold text-lg text-white transition-colors shadow-lg shadow-green-900/30"
              >
                Go to Dashboard
              </Link>
            ) : (
              <Link
                href="/auth"
                className="bg-blue-600 hover:bg-blue-700 px-8 py-4 rounded-lg font-semibold text-lg text-white transition-colors shadow-lg shadow-blue-900/30"
              >
                Get Started Free
              </Link>
            )}
            <Link
              href="/repositories"
              className="bg-slate-800 hover:bg-slate-700 border border-slate-700 px-8 py-4 rounded-lg font-semibold text-lg text-slate-200 transition-colors"
            >
              View Demo
            </Link>
          </div>
        </div>
      </div>

      <div className="py-24 px-6 bg-gradient-to-b from-slate-950 to-slate-900 border-t border-slate-800">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">
              Key Features
            </h2>
            <p className="text-lg text-slate-400 max-w-3xl mx-auto">
              Designed for developers and project managers to manage multiple GitHub repositories, track issues, and stay organized.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-slate-800/50 border border-slate-700 p-8 rounded-2xl hover:bg-slate-800 transition-all">
              <div className="w-14 h-14 bg-blue-600 rounded-xl flex items-center justify-center mb-4 text-2xl">🔐</div>
              <h3 className="text-xl font-semibold text-white mb-3">
                Authentication
              </h3>
              <p className="text-slate-400">
                Secure login with JWT-based authentication and optional GitHub OAuth for fast, reliable access.
              </p>
            </div>

            <div className="bg-slate-800/50 border border-slate-700 p-8 rounded-2xl hover:bg-slate-800 transition-all">
              <div className="w-14 h-14 bg-blue-600 rounded-xl flex items-center justify-center mb-4 text-2xl">📁</div>
              <h3 className="text-xl font-semibold text-white mb-3">
                Repository Explorer
              </h3>
              <p className="text-slate-400">
                Search, sort, and filter repositories using GitHub API integration with pagination support.
              </p>
            </div>

            <div className="bg-slate-800/50 border border-slate-700 p-8 rounded-2xl hover:bg-slate-800 transition-all">
              <div className="w-14 h-14 bg-blue-600 rounded-xl flex items-center justify-center mb-4 text-2xl">🐞</div>
              <h3 className="text-xl font-semibold text-white mb-3">
                Issue Tracker
              </h3>
              <p className="text-slate-400">
                Create, update, and delete issues with filters and pagination — fully synced with GitHub issues.
              </p>
            </div>

            <div className="bg-slate-800/50 border border-slate-700 p-8 rounded-2xl hover:bg-slate-800 transition-all">
              <div className="w-14 h-14 bg-blue-600 rounded-xl flex items-center justify-center mb-4 text-2xl">📊</div>
              <h3 className="text-xl font-semibold text-white mb-3">
                Dashboard Overview
              </h3>
              <p className="text-slate-400">
                Get a snapshot of open issues, recent repository activity, and overall project health in one place.
              </p>
            </div>

            <div className="bg-slate-800/50 border border-slate-700 p-8 rounded-2xl hover:bg-slate-800 transition-all">
              <div className="w-14 h-14 bg-blue-600 rounded-xl flex items-center justify-center mb-4 text-2xl">⭐</div>
              <h3 className="text-xl font-semibold text-white mb-3">
                Bookmarks
              </h3>
              <p className="text-slate-400">
                Save your favorite repositories and access them instantly from a personalized bookmarks section.
              </p>
            </div>

            <div className="bg-slate-800/50 border border-slate-700 p-8 rounded-2xl hover:bg-slate-800 transition-all">
              <div className="w-14 h-14 bg-blue-600 rounded-xl flex items-center justify-center mb-4 text-2xl">🗂️</div>
              <h3 className="text-xl font-semibold text-white mb-3">
                Dedicated Pages
              </h3>
              <p className="text-slate-400">
                Includes structured pages like Home, Login, Dashboard, Repositories, Repository Details, Issues, and Bookmarks.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
