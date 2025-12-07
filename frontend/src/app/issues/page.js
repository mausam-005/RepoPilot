'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import api from '@/lib/axios'

export default function Issues() {
  const router = useRouter()
  const [searchInput, setSearchInput] = useState('')
  const [owner, setOwner] = useState('')
  const [repo, setRepo] = useState('')
  const [issues, setIssues] = useState([])
  const [loading, setLoading] = useState(false)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newIssue, setNewIssue] = useState({ title: '', body: '' })

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/auth')
      return
    }
  }, [])

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
      alert('Failed to fetch issues')
    } finally {
      setLoading(false)
    }
  }

  const createIssue = async (e) => {
    e.preventDefault()
    if (!newIssue.title) return

    try {
      const token = localStorage.getItem('token')
      if (!token) {
        alert('Please login to create issues')
        return
      }

      await api.post(`/issues/${owner}/${repo}`, newIssue, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setNewIssue({ title: '', body: '' })
      setShowCreateForm(false)
      fetchIssues({ preventDefault: () => {} })
      alert('Issue created successfully!')
    } catch (error) {
      console.error('Failed to create issue:', error)
      const errorMsg = error.response?.data?.message || error.message || 'Failed to create issue'
      alert(`Error: ${errorMsg}`)
    }
  }

  const updateIssue = async (issueNumber, state) => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        alert('Please login to update issues')
        return
      }

      await api.patch(`/issues/${owner}/${repo}/${issueNumber}`, { state }, {
        headers: { Authorization: `Bearer ${token}` }
      })
      fetchIssues({ preventDefault: () => {} })
      alert('Issue updated successfully!')
    } catch (error) {
      console.error('Failed to update issue:', error)
      alert('Failed to update issue')
    }
  }

  return (
    <div className="container mx-auto px-4 sm:px-8 md:px-12 py-8 sm:py-12">
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
          onClick={() => setShowCreateForm(!showCreateForm)}
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
  )
}
