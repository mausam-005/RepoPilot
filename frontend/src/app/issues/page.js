'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import api from '@/lib/axios'
import toast from 'react-hot-toast'

export default function Issues() {
  const router = useRouter()
  const [searchInput, setSearchInput] = useState('')
  const [owner, setOwner] = useState('')
  const [repo, setRepo] = useState('')
  const [issues, setIssues] = useState([])
  const [loading, setLoading] = useState(false)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newIssue, setNewIssue] = useState({ title: '', body: '' })
  const [authError, setAuthError] = useState(null)
  const [manualToken, setManualToken] = useState('')
  const [hasGithubToken, setHasGithubToken] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/auth')
      return
    }

    api.get('/user/profile', { headers: { Authorization: `Bearer ${token}` } })
      .then(res => setHasGithubToken(!!res.data.githubToken))
      .catch(err => console.error('Failed to fetch profile', err))
  }, [])

  const handleGithubOAuth = () => {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8001/api';
    window.location.href = `${baseUrl}/auth/github`;
  }

  const saveManualToken = async () => {
    if (!manualToken.trim()) return;
    try {
      const token = localStorage.getItem('token');
      await api.patch('/user/profile', { githubToken: manualToken }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setHasGithubToken(true);
      setAuthError(null);
      setManualToken('');
      toast.success('GitHub Token saved successfully!');
    } catch (error) {
      toast.error('Failed to save token. Please try again.');
    }
  }

  const fetchIssues = async (e) => {
    e.preventDefault()
    if (!searchInput.trim()) return
    
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      let data
      
      if (searchInput.includes('/')) {
        const [ownerPart, repoPart] = searchInput.split('/')
        setOwner(ownerPart.trim())
        setRepo(repoPart.trim())
        const response = await api.get(`/repos/${ownerPart.trim()}/${repoPart.trim()}/issues`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        data = response.data
      } else {
        const response = await api.get(`/repos/user/${searchInput.trim()}/issues`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        data = response.data
        setOwner('')
        setRepo('')
      }
      
      setIssues(data)
    } catch (error) {
      console.error('Failed to fetch issues:', error)
      toast.error('Failed to fetch issues')
    } finally {
      setLoading(false)
    }
  }

  const createIssue = async (e) => {
    e.preventDefault()
    if (!newIssue.title) return

    try {
      setAuthError(null)
      const token = localStorage.getItem('token')
      if (!token) {
        setAuthError('Please login to create issues')
        return
      }

      await api.post(`/issues/${owner}/${repo}`, newIssue, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setNewIssue({ title: '', body: '' })
      setShowCreateForm(false)
      fetchIssues({ preventDefault: () => {} })
      toast.success('Issue created successfully!')
    } catch (error) {
      console.error('Failed to create issue:', error)
      const errorMsg = error.response?.data?.message || error.message || 'Failed to create issue'
      if (error.response?.status === 403 && errorMsg === 'GitHub connection required') {
        setAuthError('github_required')
      } else {
        setAuthError(errorMsg)
      }
    }
  }

  const updateIssue = async (issueNumber, state) => {
    try {
      setAuthError(null)
      const token = localStorage.getItem('token')
      if (!token) {
        setAuthError('Please login to update issues')
        return
      }

      await api.patch(`/issues/${owner}/${repo}/${issueNumber}`, { state }, {
        headers: { Authorization: `Bearer ${token}` }
      })
      fetchIssues({ preventDefault: () => {} })
      toast.success('Issue updated successfully!')
    } catch (error) {
      console.error('Failed to update issue:', error)
      const errorMsg = error.response?.data?.message || error.message || 'Failed to update issue'
      if (error.response?.status === 403 && errorMsg === 'GitHub connection required') {
        setAuthError('github_required')
      } else {
        setAuthError(errorMsg)
      }
    }
  }

  return (
    <div className="container mx-auto px-4 sm:px-8 md:px-12 py-8 sm:py-12 flex justify-center">
      <div className="w-full max-w-7xl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-primary">Issue Tracker</h1>
        <Link href="/myissues" className="btn-coral">
          View My Issues →
        </Link>
      </div>
      
      <div className="mb-6 p-4 border border-midnight rounded-lg glow-coral flex items-start gap-3" style={{background: 'rgba(255, 107, 107, 0.1)'}}>
        <svg className="w-5 h-5 text-coral flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
          <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
        </svg>
        <p className="text-muted text-sm">Don't know repos? Visit <a href="/repositories" className="underline font-medium text-coral">Repositories</a> to search and explore GitHub projects!</p>
      </div>

      {authError === 'github_required' ? (
        <div className="mb-6 p-5 rounded-xl border border-coral flex flex-col gap-4" style={{background: 'rgba(255, 107, 107, 0.05)'}}>
          <div className="flex items-start gap-3 text-coral">
            <svg className="w-6 h-6 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            <div>
              <h4 className="font-semibold text-lg mb-1">GitHub Connection Required</h4>
              <p className="text-sm text-primary opacity-90 leading-relaxed mb-2">
                To create or modify issues, you need to link your GitHub account. You have two options:
              </p>
              <ul className="list-disc pl-5 text-sm text-primary opacity-80 space-y-1 mb-4">
                <li><strong>Option 1:</strong> Quickly authenticate securely with GitHub using the button below.</li>
                <li><strong>Option 2:</strong> Manually paste a GitHub Personal Access Token (PAT). <a href="https://github.com/settings/tokens?type=beta" target="_blank" className="text-coral underline hover:text-white transition-colors">Generate one here</a> (Select 'Public Repositories' -&gt; Read-only).</li>
              </ul>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 w-full">
            <button 
              onClick={handleGithubOAuth} 
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-white font-medium transition-colors border border-gray-700 shadow-sm whitespace-nowrap"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" /></svg>
              Sign in with GitHub
            </button>
            <div className="flex-1 flex gap-2">
              <input 
                type="password"
                placeholder="Paste PAT (ghp_...)"
                value={manualToken}
                onChange={(e) => setManualToken(e.target.value)}
                className="flex-1 px-3 py-2.5 rounded-lg border border-midnight focus:border-coral outline-none text-sm text-primary"
                style={{background: 'var(--bg-tertiary)'}}
              />
              <button 
                onClick={saveManualToken}
                disabled={!manualToken.trim()}
                className="px-4 py-2.5 rounded-lg font-medium bg-coral text-white hover:bg-opacity-90 transition-colors disabled:opacity-50 text-sm whitespace-nowrap"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      ) : authError ? (
        <div className="mb-6 p-4 rounded-lg border border-coral text-coral flex items-center gap-2" style={{background: 'rgba(255, 107, 107, 0.1)'}}>
          <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
          <span className="text-sm font-medium">{authError}</span>
        </div>
      ) : null}

      <form onSubmit={fetchIssues} className="mb-8">
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Enter owner/repo (e.g -> facebook/react) or username (e.g -> mausam-005)"
            className="flex-1 px-4 py-3 border border-midnight rounded-lg text-primary focus:border-coral focus:outline-none"
            style={{background: 'var(--bg-tertiary)'}}
          />
          <button type="submit" className="btn-coral">
            <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            Search
          </button>
        </div>
      </form>

      {owner && repo && (
        <button
          onClick={() => {
            if (!hasGithubToken) {
              setAuthError('github_required')
              setShowCreateForm(false)
              return
            }
            setShowCreateForm(!showCreateForm)
            setAuthError(null)
          }}
          className="mb-6 btn-coral"
        >
          {showCreateForm ? 'Cancel' : '+ Create Issue'}
        </button>
      )}

      {showCreateForm && (
        <form onSubmit={createIssue} className="mb-8 card-midnight">
          <h3 className="text-xl font-semibold text-primary mb-4">Create New Issue</h3>
          <input
            type="text"
            value={newIssue.title}
            onChange={(e) => setNewIssue({ ...newIssue, title: e.target.value })}
            placeholder="Issue title"
            className="w-full px-4 py-3 border border-midnight rounded-lg text-primary mb-4 focus:border-coral focus:outline-none"
            style={{background: 'var(--bg-tertiary)'}}
            required
          />
          <textarea
            value={newIssue.body}
            onChange={(e) => setNewIssue({ ...newIssue, body: e.target.value })}
            placeholder="Issue description (optional)"
            className="w-full px-4 py-3 border border-midnight rounded-lg text-primary mb-4 focus:border-coral focus:outline-none"
            style={{background: 'var(--bg-tertiary)'}}
            rows="4"
          />
          <button type="submit" className="btn-coral">
            Create Issue
          </button>
        </form>
      )}

      {loading ? (
        <div className="text-center py-20">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-coral"></div>
        </div>
      ) : issues.length > 0 ? (
        <>
          <h2 className="text-2xl font-semibold text-primary mb-4">Issues ({issues.length})</h2>
          <div className="space-y-4">
            {issues.map((issue) => (
              <div key={issue.id} className="card-midnight">
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                  <div className="flex-1 w-full sm:w-auto">
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${
                        issue.state === 'open' ? 'bg-coral text-primary' : 'text-muted'
                      }`} style={{background: issue.state === 'open' ? 'var(--accent-coral)' : 'var(--bg-tertiary)'}}>
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 16 16">
                          {issue.state === 'open' ? (
                            <path d="M8 9.5a1.5 1.5 0 100-3 1.5 1.5 0 000 3z"/>
                          ) : (
                            <path fillRule="evenodd" d="M1.5 8a6.5 6.5 0 0113 0 6.5 6.5 0 01-13 0zM8 0a8 8 0 100 16A8 8 0 008 0zm.75 4.75a.75.75 0 00-1.5 0v2.5h-2.5a.75.75 0 000 1.5h2.5v2.5a.75.75 0 001.5 0v-2.5h2.5a.75.75 0 000-1.5h-2.5v-2.5z"/>
                          )}
                        </svg>
                        {issue.state === 'open' ? 'Open' : 'Closed'}
                      </span>
                      <span className="text-muted">#{issue.number}</span>
                    </div>
                    <a href={issue.html_url} target="_blank" rel="noopener noreferrer" className="text-lg sm:text-xl font-semibold text-coral hover:underline break-words">
                      {issue.title}
                    </a>
                    {issue.body && <p className="text-muted text-sm mt-2">{issue.body}</p>}
                    <p className="text-muted text-sm mt-2">Created by {issue.user.login} on {new Date(issue.created_at).toLocaleDateString()}</p>
                  </div>
                  {owner && repo && (
                    <button
                      onClick={() => updateIssue(issue.number, issue.state === 'open' ? 'closed' : 'open')}
                      className="btn-dark text-sm whitespace-nowrap w-full sm:w-auto"
                    >
                      {issue.state === 'open' ? 'Close' : 'Reopen'}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      ) : owner && repo ? (
        <div className="text-center py-12 card-midnight">
          <p className="text-muted text-lg">No issues found. Click "Fetch Issues" to load or "Create New Issue" to add one.</p>
        </div>
      ) : null}
      </div>
    </div>
  )
}
