'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'

export default function Welcome() {
  const [user, setUser] = useState(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const isNewUser = searchParams.get('new') === 'true'

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/auth')
      return
    }
    
    // Get user info from token or API
    setUser({ email: 'user@example.com' }) // Placeholder
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center max-w-2xl animate-slide-up">
        <div className="text-6xl mb-6">{isNewUser ? '🚀' : '👋'}</div>
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
          {isNewUser ? 'Welcome to RepoPilot!' : 'Welcome back!'}
        </h1>
        <p className="text-xl text-slate-300 mb-12">
          {isNewUser ? 'Let\'s start your first project and explore repositories!' : 'Ready to manage your repositories and track issues?'}
        </p>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          <Link 
            href="/bookmarks" 
            className="bg-slate-800/50 border border-slate-700 p-6 rounded-lg hover:bg-slate-800 transition-colors text-left"
          >
            <div className="text-2xl mb-2">⭐</div>
            <h3 className="font-semibold text-white mb-2">View Bookmarks</h3>
            <p className="text-slate-400 text-sm">Access your saved items</p>
          </Link>
          
          <Link 
            href="/repositories" 
            className="bg-slate-800/50 border border-slate-700 p-6 rounded-lg hover:bg-slate-800 transition-colors text-left"
          >
            <div className="text-2xl mb-2">📚</div>
            <h3 className="font-semibold text-white mb-2">Browse Repos</h3>
            <p className="text-slate-400 text-sm">Explore repositories</p>
          </Link>
          
          <Link 
            href="/issues" 
            className="bg-slate-800/50 border border-slate-700 p-6 rounded-lg hover:bg-slate-800 transition-colors text-left"
          >
            <div className="text-2xl mb-2">🎯</div>
            <h3 className="font-semibold text-white mb-2">Track Issues</h3>
            <p className="text-slate-400 text-sm">Manage your issues</p>
          </Link>
        </div>
        
        <Link 
          href="/bookmarks" 
          className="bg-blue-600 hover:bg-blue-700 px-8 py-3 rounded-lg font-semibold transition-colors inline-block"
        >
          Continue to Dashboard
        </Link>
      </div>
    </div>
  )
}