'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import api from '@/lib/axios'
import toast from 'react-hot-toast'

export default function Profile() {
  const router = useRouter()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showUpdateForm, setShowUpdateForm] = useState(false)
  const [name, setName] = useState('')
  const [username, setUsername] = useState('')
  const [githubToken, setGithubToken] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/auth')
      return
    }
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token')
      const { data } = await api.get('/user/profile', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setProfile(data)
      setName(data.name || '')
      setUsername(data.username || '')
      setGithubToken(data.githubToken || '')
      setAvatarUrl(data.avatarUrl || '')
    } catch (error) {
      console.error('Failed to fetch profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleGithubOAuth = () => {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8001/api';
    window.location.href = `${baseUrl}/auth/github`;
  }

  const handleUpdate = async () => {
    try {
      const token = localStorage.getItem('token')
      await api.patch('/user/profile', 
        { name, username, githubToken: githubToken || null, avatarUrl },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      toast.success('Profile updated successfully!')
      setShowUpdateForm(false)
      fetchProfile()
    } catch (error) {
      toast.error('Failed to update profile')
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    window.dispatchEvent(new Event('authChange'))
    toast.success('Signed out successfully')
    router.push('/')
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete your account? This action cannot be undone.')) return
    try {
      const token = localStorage.getItem('token')
      await api.delete('/user/account', {
        headers: { Authorization: `Bearer ${token}` }
      })
      localStorage.removeItem('token')
      window.dispatchEvent(new Event('authChange'))
      toast.success('Profile deleted successfully')
      setTimeout(() => router.push('/'), 1000)
    } catch (error) {
      toast.error('Failed to delete profile')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-coral"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 sm:px-8 md:px-12 py-8 sm:py-12 flex justify-center">
      <div className="w-full max-w-7xl">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary mb-6 sm:mb-8 text-center sm:text-left">Profile</h1>
        
        <div className="space-y-4 sm:space-y-6">
        {profile?.githubProfile && (
          <div className="card-midnight p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-semibold text-primary mb-3 sm:mb-4">GitHub Profile</h2>
            <div className="flex items-center gap-3 sm:gap-4">
              <img src={profile.githubProfile.avatar_url} alt={profile.githubProfile.login} className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-2 border-coral object-cover" />
              <div className="flex-1 min-w-0">
                <h3 className="text-base sm:text-lg font-semibold text-primary truncate">{profile.githubProfile.name || profile.githubProfile.login}</h3>
                <p className="text-coral text-sm">@{profile.githubProfile.login}</p>
              </div>
            </div>
          </div>
        )}

        <div className="card-midnight p-4 sm:p-6 flex flex-col sm:flex-row items-center gap-6">
          <div className="relative group">
            <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl overflow-hidden border-2 border-midnight bg-tertiary flex items-center justify-center">
              {avatarUrl ? (
                <img 
                  src={avatarUrl} 
                  alt="Avatar" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <svg className="w-14 h-14 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              )}
            </div>
            {showUpdateForm && (
              <div className="mt-3 flex flex-col gap-2 w-full">
                <button 
                  onClick={() => setAvatarUrl(`https://picsum.photos/seed/${Math.random().toString(36).substring(7)}/200/200`)}
                  className="text-xs bg-coral text-white px-3 py-1.5 rounded font-medium hover:bg-opacity-90"
                >
                  Randomize
                </button>
                <button 
                  onClick={() => setAvatarUrl('')}
                  className="text-xs border border-midnight text-muted px-3 py-1.5 rounded hover:text-red-400"
                >
                  Remove
                </button>
              </div>
            )}
          </div>
          
          <div className="flex-1 w-full">
            <h2 className="text-lg sm:text-xl font-semibold text-primary mb-3 sm:mb-4">Account Information</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div className="p-3 rounded-lg border border-midnight" style={{background: 'var(--bg-tertiary)'}}>
              <label className="text-muted text-xs uppercase tracking-wide block mb-1">Email</label>
              <p className="text-primary text-sm font-medium truncate">{profile?.email}</p>
            </div>
            <div className="p-3 rounded-lg border border-midnight" style={{background: 'var(--bg-tertiary)'}}>
              <label className="text-muted text-xs uppercase tracking-wide block mb-1">Name</label>
              <p className="text-primary text-sm font-medium truncate">{profile?.name || 'Not set'}</p>
            </div>
            <div className="p-3 rounded-lg border border-midnight" style={{background: 'var(--bg-tertiary)'}}>
              <label className="text-muted text-xs uppercase tracking-wide block mb-1">Username</label>
              <p className="text-primary text-sm font-medium truncate">{profile?.username || 'Not set'}</p>
            </div>
            <div className="p-3 rounded-lg border border-midnight" style={{background: 'var(--bg-tertiary)'}}>
              <label className="text-muted text-xs uppercase tracking-wide block mb-1">GitHub Token</label>
              <p className="text-primary text-sm font-medium">{profile?.githubToken ? '••••••••••••' : 'Not configured'}</p>
            </div>
          </div>
        </div>
      </div>

        <div className="card-midnight p-4 sm:p-6">
          <h2 className="text-lg sm:text-xl font-semibold text-primary mb-3 sm:mb-4">Actions</h2>
          <div className="space-y-2 sm:space-y-3">
            <button onClick={() => setShowUpdateForm(!showUpdateForm)} className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg text-left flex items-center gap-2 sm:gap-3 border border-midnight hover:border-coral transition-all" style={{background: 'var(--bg-tertiary)'}}>
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-coral flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              <span className="text-primary font-medium text-sm sm:text-base">Update Account</span>
            </button>
            {showUpdateForm && (
              <div className="p-3 sm:p-4 rounded-lg border border-midnight" style={{background: 'var(--bg-tertiary)'}}>
                <div className="space-y-3 mb-3">
                  <div>
                    <label className="text-muted text-xs sm:text-sm mb-1.5 block">Name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your name"
                      className="w-full h-9 sm:h-10 px-3 sm:px-4 text-sm border border-midnight rounded-lg text-primary focus:border-coral focus:outline-none"
                      style={{background: 'var(--bg-secondary)'}}
                    />
                  </div>
                  <div>
                    <label className="text-muted text-xs sm:text-sm mb-1.5 block">Username</label>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Your username"
                      className="w-full h-9 sm:h-10 px-3 sm:px-4 text-sm border border-midnight rounded-lg text-primary focus:border-coral focus:outline-none"
                      style={{background: 'var(--bg-secondary)'}}
                    />
                  </div>
                  <div>
                    <label className="text-muted text-xs sm:text-sm mb-1.5 flex justify-between items-center">
                      <span>GitHub Personal Access Token (PAT)</span>
                      <a href="https://github.com/settings/tokens?type=beta" target="_blank" className="text-coral underline text-xs">Generate Token</a>
                    </label>
                    <p className="text-xs text-muted opacity-80 mb-2">Required for creating/managing issues. Select "Public Repositories" -&gt; "Read-only" (or higher) when generating.</p>
                    <input
                      type="password"
                      value={githubToken}
                      onChange={(e) => setGithubToken(e.target.value)}
                      placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                      className="w-full h-9 sm:h-10 px-3 sm:px-4 text-sm border border-midnight rounded-lg text-primary focus:border-coral focus:outline-none"
                      style={{background: 'var(--bg-secondary)'}}
                    />
                  </div>
                </div>
                <button onClick={handleUpdate} className="btn-coral w-full text-sm sm:text-base py-2">
                  Save Changes
                </button>
              </div>
            )}
            <button onClick={handleLogout} className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg text-left flex items-center gap-2 sm:gap-3 border border-midnight hover:border-gray-500 transition-all" style={{background: 'var(--bg-tertiary)'}}>
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-muted flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span className="text-primary font-medium text-sm sm:text-base">Sign Out</span>
            </button>
            <button onClick={handleDelete} className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg text-left flex items-center gap-2 sm:gap-3 border border-red-900 hover:border-red-600 transition-all" style={{background: 'var(--bg-tertiary)'}}>
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-red-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              <span className="text-red-400 font-medium text-sm sm:text-base">Delete Account</span>
            </button>
          </div>
        </div>

        <div className="card-midnight p-4 sm:p-6">
          <h2 className="text-lg sm:text-xl font-semibold text-primary mb-3 sm:mb-4">Integrations</h2>
          <div className="space-y-4">
            <p className="text-muted text-sm">
              Connect your GitHub account to enable creating and managing issues directly from RepoPilot.
            </p>
            <button 
              onClick={handleGithubOAuth} 
              className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-lg bg-gray-800 hover:bg-gray-700 text-white font-medium transition-colors border border-gray-700"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
              </svg>
              Sign in with GitHub
            </button>
          </div>
        </div>
        </div>
      </div>
    </div>
  )
}
