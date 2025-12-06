'use client'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('token')
      setIsLoggedIn(!!token)
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
    window.dispatchEvent(new Event('authChange'))
    router.push('/')
  }

  return (
    <header className="bg-secondary border-b border-midnight sticky top-0 z-50" style={{height: '70px', background: 'var(--bg-secondary)'}}>
      <nav className="container mx-auto px-12 h-full flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <img src="/repopilot.png" alt="RepoPilot" className="w-9 h-9 rounded-lg" />
          <span className="text-2xl font-bold text-primary" style={{textShadow: '0 0 10px rgba(255, 255, 255, 0.3)'}}>
            RepoPilot
          </span>
        </Link>
        
        <div className="hidden md:flex items-center space-x-8">
          <Link href="/" className={`transition-colors text-base ${
            isActivePage('/') ? 'text-primary font-medium text-coral' : 'text-muted hover:text-primary'
          }`}>Home</Link>
          <Link href="/dashboard" className={`transition-colors text-base ${
            isActivePage('/dashboard') ? 'text-primary font-medium text-coral' : 'text-muted hover:text-primary'
          }`}>Dashboard</Link>
          <Link href="/bookmarks" className={`transition-colors text-base ${
            isActivePage('/bookmarks') ? 'text-primary font-medium text-coral' : 'text-muted hover:text-primary'
          }`}>Bookmarks</Link>
          <Link href="/repositories" className={`transition-colors text-base ${
            isActivePage('/repositories') ? 'text-primary font-medium text-coral' : 'text-muted hover:text-primary'
          }`}>Repositories</Link>
          <Link href="/issues" className={`transition-colors text-base ${
            isActivePage('/issues') ? 'text-primary font-medium text-coral' : 'text-muted hover:text-primary'
          }`}>Issues</Link>
          {isLoggedIn ? (
            <button onClick={handleLogout} className="px-6 py-2.5 rounded-lg font-semibold transition-all border border-midnight hover:border-coral" style={{background: 'var(--bg-tertiary)', color: 'var(--text-primary)'}}>
              Sign Out
            </button>
          ) : (
            <Link href="/auth" className="px-6 py-2.5 rounded-lg font-semibold transition-all glow-coral" style={{background: 'var(--accent-coral)', color: 'var(--text-primary)', display: 'inline-block'}}>
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
                <button onClick={handleLogout} className="px-6 py-2.5 rounded-lg font-semibold transition-all border border-midnight hover:border-coral text-center w-full" style={{background: 'var(--bg-tertiary)', color: 'var(--text-primary)'}}>
                  Sign Out
                </button>
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
