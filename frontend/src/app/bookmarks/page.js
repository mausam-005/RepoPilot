'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import api from '@/lib/axios'
import toast from 'react-hot-toast'

export default function Bookmarks() {
  const [bookmarks, setBookmarks] = useState([])
  const [loading, setLoading] = useState(true)
  const [showIssueForm, setShowIssueForm] = useState(null)
  const [issueData, setIssueData] = useState({ title: '', body: '' })
  const [authErrorRepoId, setAuthErrorRepoId] = useState(null)
  const [hasGithubToken, setHasGithubToken] = useState(false)
  const router = useRouter()

  useEffect(() => {
    fetchBookmarks()
  }, [])

  const fetchBookmarks = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        router.push('/auth')
        return
      }
      const { data } = await api.get('/bookmarks', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setBookmarks(data)
      
      try {
        const profileRes = await api.get('/user/profile', {
          headers: { Authorization: `Bearer ${token}` }
        })
        setHasGithubToken(!!profileRes.data.githubToken)
      } catch (err) {
        console.error('Failed to fetch profile info', err)
      }
    } catch (error) {
      console.error('Failed to fetch bookmarks:', error)
    } finally {
      setLoading(false)
    }
  }

  const removeBookmark = async (repoId) => {
    try {
      const token = localStorage.getItem('token')
      await api.delete(`/bookmarks/${repoId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setBookmarks(bookmarks.filter(b => b.repoId !== repoId))
    } catch (error) {
      console.error('Failed to remove bookmark:', error)
    }
  }

  const removeAllBookmarks = async () => {
    if (!confirm('Are you sure you want to remove all bookmarks?')) return
    try {
      const token = localStorage.getItem('token')
      await Promise.all(bookmarks.map(b => 
        api.delete(`/bookmarks/${b.repoId}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ))
      setBookmarks([])
    } catch (error) {
      console.error('Failed to remove all bookmarks:', error)
    }
  }

  const createIssue = async (repoFullName) => {
    try {
      setAuthErrorRepoId(null)
      const token = localStorage.getItem('token')
      const [owner, repo] = repoFullName.split('/')
      await api.post(`/issues/${owner}/${repo}`, issueData, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setShowIssueForm(null)
      setIssueData({ title: '', body: '' })
      toast.success('Issue created successfully!')
    } catch (error) {
      console.error('Failed to create issue:', error)
      const errorMsg = error.response?.data?.message || error.message || 'Failed to create issue'
      if (error.response?.status === 403 && errorMsg === 'GitHub connection required') {
        setAuthErrorRepoId(repoFullName)
      } else {
        toast.error(errorMsg)
      }
    }
  }

  const handleGithubOAuth = () => {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8001/api';
    window.location.href = `${baseUrl}/auth/github`;
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold text-primary mb-2">Your Bookmarks</h1>
          <p className="text-muted"><span className="text-coral text-2xl">{bookmarks.length}</span> starred repositories</p>
        </div>
        {bookmarks.length > 0 && (
          <button onClick={removeAllBookmarks} className="btn-dark">
            Remove All
          </button>
        )}
      </div>

      {bookmarks.length === 0 ? (
        <div className="card-midnight p-16 text-center">
          <h3 className="text-2xl font-semibold text-primary mb-3">No bookmarks yet</h3>
          <p className="text-muted mb-6">Star repositories to keep track of projects</p>
          <a href="/repositories" className="btn-coral">
            Explore Repositories
          </a>
        </div>
      ) : (
        <div className="space-y-4">
          {bookmarks.map((bookmark) => (
            <div 
              key={bookmark._id} 
              onClick={() => router.push(`/repositories/${bookmark.repoFullName}`)}
              className="card-midnight cursor-pointer hover:border-coral transition-colors"
            >
              <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                <div className="flex-1 w-full sm:w-auto">
                  <span className="text-lg sm:text-xl font-semibold text-coral hover:underline break-words">
                    {bookmark.repoFullName}
                  </span>
                  <p className="text-muted mt-2 mb-4">{bookmark.description || 'No description'}</p>
                  <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs sm:text-sm text-muted">
                    {bookmark.language && (
                      <span className="flex items-center gap-1">
                        <svg className="w-3 h-3 text-coral" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                        {bookmark.language}
                      </span>
                    )}
                    {bookmark.stars && (
                      <span className="flex items-center gap-1">
                        <svg className="w-3 h-3 text-coral" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        {bookmark.stars.toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      if (!hasGithubToken) {
                        setAuthErrorRepoId(authErrorRepoId === bookmark.repoId ? null : bookmark.repoId)
                        setShowIssueForm(null)
                        return
                      }
                      setShowIssueForm(showIssueForm === bookmark.repoId ? null : bookmark.repoId)
                      setAuthErrorRepoId(null)
                    }}
                    className="px-3 sm:px-4 py-2 rounded-lg text-primary font-medium border border-midnight hover:border-coral transition-colors text-sm whitespace-nowrap"
                    style={{background: 'var(--bg-tertiary)'}}
                  >
                    {showIssueForm === bookmark.repoId || authErrorRepoId === bookmark.repoId ? 'Cancel' : 'Add Issue'}
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      removeBookmark(bookmark.repoId)
                    }}
                    className="px-3 sm:px-4 py-2 rounded-lg text-primary font-medium border border-midnight hover:border-coral transition-colors text-sm whitespace-nowrap"
                    style={{background: 'var(--bg-tertiary)'}}
                  >
                    Remove
                  </button>
                </div>
              </div>
              {authErrorRepoId === bookmark.repoId && (
                <div onClick={(e) => e.stopPropagation()} className="mt-4 pt-4 border-t border-midnight">
                  <div className="p-5 rounded-xl border border-coral flex flex-col gap-4" style={{background: 'rgba(255, 107, 107, 0.05)'}}>
                    <div className="flex items-start gap-3 text-coral">
                      <svg className="w-6 h-6 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                      <div>
                        <h4 className="font-semibold text-lg mb-1">GitHub Connection Required</h4>
                        <p className="text-sm text-primary opacity-90 leading-relaxed mb-2">
                          To create issues, you need to link your GitHub account. You have two options:
                        </p>
                        <ul className="list-disc pl-5 text-sm text-primary opacity-80 space-y-1 mb-4">
                          <li><strong>Option 1:</strong> Quickly authenticate securely with GitHub using the button below.</li>
                          <li><strong>Option 2:</strong> Go to your Profile and manually paste a GitHub Personal Access Token (PAT).</li>
                        </ul>
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <button 
                        onClick={handleGithubOAuth} 
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-white font-medium transition-colors border border-gray-700 shadow-sm"
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" /></svg>
                        Sign in with GitHub
                      </button>
                      <button 
                        onClick={() => router.push('/profile')} 
                        className="flex-1 px-4 py-2.5 rounded-lg font-medium border border-midnight hover:border-coral text-primary transition-colors"
                        style={{background: 'var(--bg-tertiary)'}}
                      >
                        Go to Profile Settings
                      </button>
                    </div>
                  </div>
                </div>
              )}
              {showIssueForm === bookmark.repoId && (
                <div onClick={(e) => e.stopPropagation()} className="mt-4 pt-4 border-t border-midnight">
                  <input
                    type="text"
                    placeholder="Issue title"
                    value={issueData.title}
                    onChange={(e) => setIssueData({ ...issueData, title: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-midnight focus:border-coral outline-none mb-3"
                    style={{background: 'var(--bg-tertiary)', color: 'var(--text-primary)'}}
                  />
                  <textarea
                    placeholder="Issue description"
                    value={issueData.body}
                    onChange={(e) => setIssueData({ ...issueData, body: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-midnight focus:border-coral outline-none mb-3 min-h-[100px]"
                    style={{background: 'var(--bg-tertiary)', color: 'var(--text-primary)'}}
                  />
                  <button
                    onClick={() => createIssue(bookmark.repoFullName)}
                    className="btn-coral"
                    disabled={!issueData.title}
                  >
                    Create Issue
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      </div>
    </div>
  )
}
