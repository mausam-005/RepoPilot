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
    <header className="bg-slate-900/95 backdrop-blur-sm border-b border-slate-800 sticky top-0 z-50">
      <nav className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-blue-400 hover:text-blue-300 transition-colors">
            RepoPilot
          </Link>
          
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/" className={`transition-colors ${
              isActivePage('/') ? 'text-blue-400 font-medium' : 'text-slate-300 hover:text-white'
            }`}>Home</Link>
            <Link href="/bookmarks" className={`transition-colors ${
              isActivePage('/bookmarks') || isActivePage('/dashboard') ? 'text-blue-400 font-medium' : 'text-slate-300 hover:text-white'
            }`}>Bookmarks</Link>
            <Link href="/repositories" className={`transition-colors ${
              isActivePage('/repositories') ? 'text-blue-400 font-medium' : 'text-slate-300 hover:text-white'
            }`}>Repositories</Link>
            <Link href="/issues" className={`transition-colors ${
              isActivePage('/issues') ? 'text-blue-400 font-medium' : 'text-slate-300 hover:text-white'
            }`}>Issues</Link>
            {isLoggedIn ? (
              <button onClick={handleLogout} className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg transition-colors">
                Sign Out
              </button>
            ) : (
              <Link href="/auth" className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors">
                Sign In
              </Link>
            )}
          </div>

          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden text-slate-300 hover:text-white"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
            </svg>
          </button>
        </div>

        {isMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-slate-800">
            <div className="flex flex-col space-y-4 pt-4">
              <Link href="/" className={`transition-colors ${
                isActivePage('/') ? 'text-blue-400 font-medium' : 'text-slate-300 hover:text-white'
              }`}>Home</Link>
              <Link href="/bookmarks" className={`transition-colors ${
                isActivePage('/bookmarks') || isActivePage('/dashboard') ? 'text-blue-400 font-medium' : 'text-slate-300 hover:text-white'
              }`}>Bookmarks</Link>
              <Link href="/repositories" className={`transition-colors ${
                isActivePage('/repositories') ? 'text-blue-400 font-medium' : 'text-slate-300 hover:text-white'
              }`}>Repositories</Link>
              <Link href="/issues" className={`transition-colors ${
                isActivePage('/issues') ? 'text-blue-400 font-medium' : 'text-slate-300 hover:text-white'
              }`}>Issues</Link>
              {isLoggedIn ? (
                <button onClick={handleLogout} className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg transition-colors text-center">
                  Sign Out
                </button>
              ) : (
                <Link href="/auth" className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors text-center">
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