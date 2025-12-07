'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import api from '@/lib/axios'

export default function Profile() {
  const router = useRouter()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showUpdateForm, setShowUpdateForm] = useState(false)
  const [name, setName] = useState('')
  const [username, setUsername] = useState('')
  const [githubToken, setGithubToken] = useState('')

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
    } catch (error) {
      console.error('Failed to fetch profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdate = async () => {
    try {
      const token = localStorage.getItem('token')
      await api.patch('/user/profile', 
        { name, username, githubToken: githubToken || null },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      alert('Account updated successfully!')
      setShowUpdateForm(false)
      fetchProfile()
    } catch (error) {
      alert('Failed to update account')
    }
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
      router.push('/')
      setTimeout(() => alert('Account deleted successfully'), 100)
    } catch (error) {
      alert('Failed to delete account')
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
    <div className="container mx-auto px-4 sm:px-8 md:px-12 py-8 sm:py-12">
      <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary mb-6 sm:mb-8">Profile</h1>

      <div className="max-w-3xl space-y-4 sm:space-y-6">
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

        <div className="card-midnight p-4 sm:p-6">
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
                    <label className="text-muted text-xs sm:text-sm mb-1.5 block">GitHub Token</label>
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
            <button onClick={handleDelete} className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg text-left flex items-center gap-2 sm:gap-3 border border-red-900 hover:border-red-600 transition-all" style={{background: 'var(--bg-tertiary)'}}>
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-red-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              <span className="text-red-400 font-medium text-sm sm:text-base">Delete Account</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
