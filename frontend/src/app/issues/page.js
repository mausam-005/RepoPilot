'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import api from '@/lib/axios'

export default function Issues() {
  const router = useRouter()
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
    if (!owner || !repo) return
    
    try {
      setLoading(true)
      const { data } = await api.get(`/repos/${owner}/${repo}/issues`)
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
    <div className="container mx-auto px-12 py-12">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-primary">Issue Tracker</h1>
        <Link href="/myissues" className="btn-coral">
          View My Issues →
        </Link>
      </div>
      
      <div className="mb-6 p-4 border border-midnight rounded-lg glow-coral" style={{background: 'rgba(255, 107, 107, 0.1)'}}>
        <p className="text-muted text-sm">💡 Don't know repos? Visit <a href="/repositories" className="underline font-medium text-coral">Repositories</a> to search and explore GitHub projects!</p>
      </div>

      <form onSubmit={fetchIssues} className="mb-8">
        <div className="flex gap-3">
          <input
            type="text"
            value={owner}
            onChange={(e) => setOwner(e.target.value)}
            placeholder="Owner (e.g., facebook)"
            className="flex-1 px-4 py-3 border border-midnight rounded-lg text-primary focus:border-coral focus:outline-none"
            style={{background: 'var(--bg-tertiary)'}}
          />
          <input
            type="text"
            value={repo}
            onChange={(e) => setRepo(e.target.value)}
            placeholder="Repository (e.g., react)"
            className="flex-1 px-4 py-3 border border-midnight rounded-lg text-primary focus:border-coral focus:outline-none"
            style={{background: 'var(--bg-tertiary)'}}
          />
          <button type="submit" className="btn-coral">
            Fetch Issues
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
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        issue.state === 'open' ? 'bg-coral text-primary' : 'text-muted'
                      }`} style={{background: issue.state === 'open' ? 'var(--accent-coral)' : 'var(--bg-tertiary)'}}>
                        {issue.state === 'open' ? '✓ Open' : '✗ Closed'}
                      </span>
                      <span className="text-muted">#{issue.number}</span>
                    </div>
                    <a href={issue.html_url} target="_blank" rel="noopener noreferrer" className="text-xl font-semibold text-coral hover:underline">
                      {issue.title}
                    </a>
                    {issue.body && <p className="text-muted text-sm mt-2">{issue.body}</p>}
                    <p className="text-muted text-sm mt-2">Created by {issue.user.login} on {new Date(issue.created_at).toLocaleDateString()}</p>
                  </div>
                  <button
                    onClick={() => updateIssue(issue.number, issue.state === 'open' ? 'closed' : 'open')}
                    className="btn-dark text-sm"
                  >
                    {issue.state === 'open' ? 'Close' : 'Reopen'}
                  </button>
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
