'use client'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import api from '@/lib/axios'

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [githubProfile, setGithubProfile] = useState(null)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token')
      setIsLoggedIn(!!token)
      
      if (token) {
        try {
          const { data } = await api.get('/user/profile', {
            headers: { Authorization: `Bearer ${token}` }
          })
          setGithubProfile(data.githubProfile)
        } catch (error) {
          setGithubProfile(null)
        }
      } else {
        setGithubProfile(null)
      }
    }
    
    checkAuth()
    
    const handleAuthChange = () => checkAuth()
    window.addEventListener('authChange', handleAuthChange)
    window.addEventListener('storage', handleAuthChange)
    
    return () => {
      window.removeEventListener('authChange', handleAuthChange)
      window.removeEventListener('storage', handleAuthChange)
    }
  }, [])

  const isActivePage = (path) => pathname === path

  const handleLogout = () => {
    localStorage.removeItem('token')
    setIsLoggedIn(false)
    setGithubProfile(null)
    window.dispatchEvent(new Event('authChange'))
    router.push('/')
  }

  return (
    <header className="bg-secondary border-b border-midnight sticky top-0 z-50" style={{height: '70px', background: 'var(--bg-secondary)'}}>
      <nav className="container mx-auto px-4 md:px-6 lg:px-12 h-full flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <img src="/repopilot.png" alt="RepoPilot" className="w-9 h-9 rounded-lg" />
          <span className="text-2xl font-bold text-primary" style={{textShadow: '0 0 10px rgba(255, 255, 255, 0.3)'}}>
            RepoPilot
          </span>
        </Link>
        
        <div className="hidden md:flex items-center gap-6 lg:gap-8">
          <Link href="/" className={`transition-colors ${
            isActivePage('/') ? 'text-primary font-medium text-coral' : 'text-muted hover:text-primary'
          }`}>Home</Link>
          <Link href="/dashboard" className={`transition-colors ${
            isActivePage('/dashboard') ? 'text-primary font-medium text-coral' : 'text-muted hover:text-primary'
          }`}>Dashboard</Link>
          <Link href="/bookmarks" className={`transition-colors ${
            isActivePage('/bookmarks') ? 'text-primary font-medium text-coral' : 'text-muted hover:text-primary'
          }`}>Bookmarks</Link>
          <Link href="/repositories" className={`transition-colors ${
            isActivePage('/repositories') ? 'text-primary font-medium text-coral' : 'text-muted hover:text-primary'
          }`}>Repositories</Link>
          <Link href="/issues" className={`transition-colors ${
            isActivePage('/issues') ? 'text-primary font-medium text-coral' : 'text-muted hover:text-primary'
          }`}>Issues</Link>
          {isLoggedIn ? (
            <>
              <Link href="/profile" className="focus:outline-none">
                {githubProfile ? (
                  <img src={githubProfile.avatar_url} alt={githubProfile.login} className="w-9 h-9 rounded-full border-2 border-coral object-cover hover:border-opacity-80 transition-all" />
                ) : (
                  <div className="w-9 h-9 rounded-full border-2 border-coral flex items-center justify-center hover:border-opacity-80 transition-all" style={{background: 'var(--bg-tertiary)'}}>
                    <svg className="w-5 h-5 text-coral" fill="currentColor" viewBox="0 0 16 16">
                      <path d="M10.5 5a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0zm.061 3.073a4 4 0 10-5.123 0 6.004 6.004 0 00-3.431 5.142.75.75 0 001.498.07 4.5 4.5 0 018.99 0 .75.75 0 101.498-.07 6.005 6.005 0 00-3.432-5.142z"/>
                    </svg>
                  </div>
                )}
              </Link>
              <button 
                onClick={handleLogout} 
                className="px-5 py-2 rounded-lg font-semibold transition-all border border-midnight hover:border-coral" 
                style={{background: 'var(--bg-tertiary)', color: 'var(--text-primary)'}}
              >
                Sign Out
              </button>
            </>
          ) : (
            <Link href="/auth" className="px-5 py-2 rounded-lg font-semibold transition-all glow-coral" style={{background: 'var(--accent-coral)', color: 'var(--text-primary)', display: 'inline-block'}}>
              Sign In
            </Link>
          )}
        </div>

        <button 
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="md:hidden text-muted hover:text-primary"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
          </svg>
        </button>

        {isMenuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 border-b border-midnight" style={{background: 'var(--bg-secondary)'}}>
            <div className="flex flex-col space-y-4 p-6">
              <Link href="/" className={`transition-colors ${
                isActivePage('/') ? 'text-primary font-medium text-coral' : 'text-muted hover:text-primary'
              }`}>Home</Link>
              <Link href="/dashboard" className={`transition-colors ${
                isActivePage('/dashboard') ? 'text-primary font-medium text-coral' : 'text-muted hover:text-primary'
              }`}>Dashboard</Link>
              <Link href="/bookmarks" className={`transition-colors ${
                isActivePage('/bookmarks') ? 'text-primary font-medium text-coral' : 'text-muted hover:text-primary'
              }`}>Bookmarks</Link>
              <Link href="/repositories" className={`transition-colors ${
                isActivePage('/repositories') ? 'text-primary font-medium text-coral' : 'text-muted hover:text-primary'
              }`}>Repositories</Link>
              <Link href="/issues" className={`transition-colors ${
                isActivePage('/issues') ? 'text-primary font-medium text-coral' : 'text-muted hover:text-primary'
              }`}>Issues</Link>
              {isLoggedIn ? (
                <>
                  <Link href="/profile" className="mx-auto">
                    {githubProfile ? (
                      <img src={githubProfile.avatar_url} alt={githubProfile.login} className="w-14 h-14 rounded-full border-2 border-coral object-cover" />
                    ) : (
                      <div className="w-14 h-14 rounded-full border-2 border-coral flex items-center justify-center" style={{background: 'var(--bg-tertiary)'}}>
                        <svg className="w-7 h-7 text-coral" fill="currentColor" viewBox="0 0 16 16">
                          <path d="M10.5 5a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0zm.061 3.073a4 4 0 10-5.123 0 6.004 6.004 0 00-3.431 5.142.75.75 0 001.498.07 4.5 4.5 0 018.99 0 .75.75 0 101.498-.07 6.005 6.005 0 00-3.432-5.142z"/>
                        </svg>
                      </div>
                    )}
                  </Link>
                  <button 
                    onClick={handleLogout} 
                    className="px-6 py-2.5 rounded-lg font-semibold transition-all border border-midnight hover:border-coral text-center w-full" 
                    style={{background: 'var(--bg-tertiary)', color: 'var(--text-primary)'}}
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <Link href="/auth" className="px-6 py-2.5 rounded-lg font-semibold transition-all glow-coral text-center block" style={{background: 'var(--accent-coral)', color: 'var(--text-primary)'}}>
                  Sign In
                </Link>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  )
}
