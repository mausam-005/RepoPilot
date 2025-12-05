'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import api from '@/lib/axios'

export default function Issues() {
  const router = useRouter()
  const [owner, setOwner] = useState('')
  const [repo, setRepo] = useState('')
  const [issues, setIssues] = useState([])
  const [myIssues, setMyIssues] = useState([])
  const [loading, setLoading] = useState(false)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newIssue, setNewIssue] = useState({ title: '', body: '' })

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/auth')
      return
    }
    fetchMyIssues()
  }, [])

  const fetchMyIssues = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) return
      const { data } = await api.get('/myissues', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setMyIssues(data)
    } catch (error) {
      console.error('Failed to fetch my issues:', error)
    }
  }

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
      fetchMyIssues()
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

  const deleteIssue = async (issueId) => {
    if (!confirm('Delete this issue from your list?')) return
    try {
      const token = localStorage.getItem('token')
      await api.delete(`/myissues/${issueId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      fetchMyIssues()
    } catch (error) {
      console.error('Failed to delete issue:', error)
      alert('Failed to delete issue')
    }
  }

  return (
    <div className="container mx-auto px-6 py-12">
      <h1 className="text-4xl font-bold text-white mb-8">Issue Tracker</h1>
      
      <div className="mb-6 p-4 bg-blue-900/20 border border-blue-800 rounded-lg">
        <p className="text-blue-300 text-sm">💡 Don't know repos? Visit <a href="/repositories" className="underline font-medium">Repositories</a> to search and explore GitHub projects!</p>
      </div>

      <form onSubmit={fetchIssues} className="mb-8">
        <div className="flex gap-3">
          <input
            type="text"
            value={owner}
            onChange={(e) => setOwner(e.target.value)}
            placeholder="Owner (e.g., facebook)"
            className="flex-1 px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
          />
          <input
            type="text"
            value={repo}
            onChange={(e) => setRepo(e.target.value)}
            placeholder="Repository (e.g., react)"
            className="flex-1 px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
          />
          <button type="submit" className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-medium">
            Fetch Issues
          </button>
        </div>
      </form>

      {owner && repo && (
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="mb-6 px-6 py-3 bg-green-600 hover:bg-green-700 rounded-lg text-white font-medium"
        >
          {showCreateForm ? 'Cancel' : '+ Create Issue'}
        </button>
      )}

      {showCreateForm && (
        <form onSubmit={createIssue} className="mb-8 bg-slate-800 border border-slate-700 p-6 rounded-lg">
          <h3 className="text-xl font-semibold text-white mb-4">Create New Issue</h3>
          <input
            type="text"
            value={newIssue.title}
            onChange={(e) => setNewIssue({ ...newIssue, title: e.target.value })}
            placeholder="Issue title"
            className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white mb-4 focus:border-blue-500 focus:outline-none"
            required
          />
          <textarea
            value={newIssue.body}
            onChange={(e) => setNewIssue({ ...newIssue, body: e.target.value })}
            placeholder="Issue description (optional)"
            className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white mb-4 focus:border-blue-500 focus:outline-none"
            rows="4"
          />
          <button type="submit" className="px-6 py-3 bg-green-600 hover:bg-green-700 rounded-lg text-white font-medium">
            Create Issue
          </button>
        </form>
      )}

      {loading ? (
        <div className="text-center py-20">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : issues.length > 0 ? (
        <>
          <h2 className="text-2xl font-semibold text-white mb-4">Issues ({issues.length})</h2>
          <div className="space-y-4">
            {issues.map((issue) => (
              <div key={issue.id} className="bg-slate-800 border border-slate-700 p-6 rounded-lg">
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        issue.state === 'open' ? 'bg-green-600' : 'bg-purple-600'
                      }`}>
                        {issue.state === 'open' ? '✓ Open' : '✗ Closed'}
                      </span>
                      <span className="text-slate-500">#{issue.number}</span>
                    </div>
                    <a href={issue.html_url} target="_blank" rel="noopener noreferrer" className="text-xl font-semibold text-blue-400 hover:underline">
                      {issue.title}
                    </a>
                    {issue.body && <p className="text-slate-300 text-sm mt-2">{issue.body}</p>}
                    <p className="text-slate-400 text-sm mt-2">Created by {issue.user.login} on {new Date(issue.created_at).toLocaleDateString()}</p>
                  </div>
                  <button
                    onClick={() => updateIssue(issue.number, issue.state === 'open' ? 'closed' : 'open')}
                    className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-white text-sm font-medium"
                  >
                    {issue.state === 'open' ? 'Close' : 'Reopen'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : owner && repo ? (
        <div className="text-center py-12 bg-slate-800 border border-slate-700 rounded-lg">
          <p className="text-slate-400 text-lg">No issues found. Click "Fetch Issues" to load or "Create New Issue" to add one.</p>
        </div>
      ) : null}

      {myIssues.length > 0 && (
        <div className="mt-8">
          <h2 className="text-2xl font-semibold text-white mb-4">My Created Issues ({myIssues.length})</h2>
          <div className="space-y-3">
            {myIssues.map((issue) => (
              <div key={issue._id} className="bg-slate-800 border border-slate-700 p-5 rounded-lg hover:border-slate-600 transition-colors">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      issue.state === 'open' ? 'bg-green-600' : 'bg-purple-600'
                    }`}>
                      {issue.state === 'open' ? '✓ Open' : '✗ Closed'}
                    </span>
                    <span className="text-slate-500 text-sm">#{issue.issueNumber}</span>
                    <span className="text-slate-400 text-sm font-medium">{issue.repoOwner}/{issue.repoName}</span>
                  </div>
                  <div className="flex gap-2">
                    <a 
                      href={issue.htmlUrl} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="px-3 py-1 bg-slate-700 hover:bg-slate-600 rounded text-xs text-white transition-colors"
                    >
                      View on GitHub →
                    </a>
                    <button
                      onClick={() => deleteIssue(issue._id)}
                      className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded text-xs text-white transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  {issue.title}
                </h3>
                {issue.body && (
                  <p className="text-slate-300 text-sm mt-2 line-clamp-2">{issue.body}</p>
                )}
                <div className="flex items-center gap-4 mt-3 text-xs text-slate-400">
                  {issue.createdBy && <span>👤 {issue.createdBy}</span>}
                  <span>📅 {new Date(issue.createdAt).toLocaleDateString()}</span>
                  <span>⏱️ {Math.floor((Date.now() - new Date(issue.createdAt)) / (1000 * 60 * 60 * 24))} days ago</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
