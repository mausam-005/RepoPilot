'use client'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import api from '@/lib/axios'

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userProfile, setUserProfile] = useState(null)
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
          setUserProfile(data)
        } catch (error) {
          setUserProfile(null)
        }
      } else {
        setUserProfile(null)
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
    setUserProfile(null)
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
        
        <div className="hidden md:flex items-center gap-6 xl:gap-8">
          <Link href="/" className={`transition-colors ${
            isActivePage('/') ? 'font-medium text-coral' : 'text-muted hover:text-primary'
          }`}>Home</Link>
          <Link href="/dashboard" className={`transition-colors ${
            isActivePage('/dashboard') ? 'font-medium text-coral' : 'text-muted hover:text-primary'
          }`}>Dashboard</Link>
          <Link href="/bookmarks" className={`transition-colors ${
            isActivePage('/bookmarks') ? 'font-medium text-coral' : 'text-muted hover:text-primary'
          }`}>Bookmarks</Link>
          <Link href="/repositories" className={`transition-colors ${
            isActivePage('/repositories') ? 'font-medium text-coral' : 'text-muted hover:text-primary'
          }`}>Repositories</Link>
          <Link href="/issues" className={`transition-colors ${
            isActivePage('/issues') ? 'font-medium text-coral' : 'text-muted hover:text-primary'
          }`}>Issues</Link>
          {isLoggedIn ? (
            <div className="hidden lg:block relative">
              <button 
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                className="focus:outline-none flex items-center"
              >
                {userProfile?.avatarUrl ? (
                  <img src={userProfile.avatarUrl} alt="Profile" className="w-10 h-10 rounded-full object-cover shadow-md hover:ring-2 hover:ring-coral transition-all" />
                ) : (
                  <div className="w-10 h-10 rounded-full flex items-center justify-center shadow-md hover:ring-2 hover:ring-coral transition-all" style={{background: 'var(--bg-tertiary)'}}>
                    <svg className="w-6 h-6 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                )}
              </button>
              
              {isProfileMenuOpen && (
                <div className="absolute right-0 mt-3 w-48 rounded-xl border border-midnight shadow-2xl py-2 z-50 overflow-hidden" style={{background: 'var(--bg-tertiary)'}}>
                  <Link 
                    href="/profile" 
                    onClick={() => setIsProfileMenuOpen(false)}
                    className="block px-4 py-2.5 text-sm text-primary hover:text-coral transition-colors"
                  >
                    Your Profile
                  </Link>
                  <button 
                    onClick={() => {
                      setIsProfileMenuOpen(false)
                      handleLogout()
                    }}
                    className="block w-full text-left px-4 py-2.5 text-sm text-red-400 hover:text-red-300 transition-colors border-t border-midnight mt-1"
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link href="/auth" className="hidden lg:inline-block px-5 py-2 rounded-lg font-semibold transition-all glow-coral" style={{background: 'var(--accent-coral)', color: 'var(--text-primary)'}}>
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
                isActivePage('/') ? 'font-medium text-coral' : 'text-muted hover:text-primary'
              }`}>Home</Link>
              <Link href="/dashboard" className={`transition-colors ${
                isActivePage('/dashboard') ? 'font-medium text-coral' : 'text-muted hover:text-primary'
              }`}>Dashboard</Link>
              <Link href="/bookmarks" className={`transition-colors ${
                isActivePage('/bookmarks') ? 'font-medium text-coral' : 'text-muted hover:text-primary'
              }`}>Bookmarks</Link>
              <Link href="/repositories" className={`transition-colors ${
                isActivePage('/repositories') ? 'font-medium text-coral' : 'text-muted hover:text-primary'
              }`}>Repositories</Link>
              <Link href="/issues" className={`transition-colors ${
                isActivePage('/issues') ? 'font-medium text-coral' : 'text-muted hover:text-primary'
              }`}>Issues</Link>
              {isLoggedIn ? (
                <>
                  <Link href="/profile" className={`flex items-center gap-2 transition-colors ${
                    isActivePage('/profile') ? 'font-medium text-coral' : 'text-muted hover:text-primary'
                  }`}>
                    {userProfile?.avatarUrl ? (
                      <img src={userProfile.avatarUrl} alt="Profile" className="w-6 h-6 rounded-full object-cover shadow-sm" />
                    ) : (
                      <div className="w-5 h-5 rounded-full flex items-center justify-center shadow-sm" style={{background: 'var(--bg-tertiary)'}}>
                        <svg className="w-3 h-3 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                    )}
                    <span>Profile</span>
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
