'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import api from '@/lib/axios'

export default function MyIssues() {
  const router = useRouter()
  const [issues, setIssues] = useState([])
  const [loading, setLoading] = useState(true)
  const [editingIssue, setEditingIssue] = useState(null)
  const [editForm, setEditForm] = useState({ title: '', body: '' })

  useEffect(() => {
    fetchMyIssues()
  }, [])

  const fetchMyIssues = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        router.push('/auth')
        return
      }
      
      const { data } = await api.get('/myissues', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setIssues(data)
    } catch (error) {
      console.error('Failed to fetch issues:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateIssueState = async (issue) => {
    try {
      const token = localStorage.getItem('token')
      const newState = issue.state === 'open' ? 'closed' : 'open'
      await api.patch(`/issues/${issue.repoOwner}/${issue.repoName}/${issue.issueNumber}`, 
        { state: newState }, 
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setIssues(issues.map(i => 
        i._id === issue._id ? { ...i, state: newState } : i
      ))
    } catch (error) {
      console.error('Failed to update issue:', error)
      alert('Failed to update issue')
    }
  }

  const startEdit = (issue) => {
    setEditingIssue(issue._id)
    setEditForm({ title: issue.title, body: issue.body || '' })
  }

  const cancelEdit = () => {
    setEditingIssue(null)
    setEditForm({ title: '', body: '' })
  }

  const saveEdit = async (issue) => {
    try {
      const token = localStorage.getItem('token')
      await api.patch(`/issues/${issue.repoOwner}/${issue.repoName}/${issue.issueNumber}`, 
        editForm, 
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setIssues(issues.map(i => 
        i._id === issue._id ? { ...i, ...editForm } : i
      ))
      cancelEdit()
      alert('Issue updated successfully!')
    } catch (error) {
      console.error('Failed to update issue:', error)
      alert('Failed to update issue')
    }
  }

  const deleteIssue = async (issueId) => {
    if (!confirm('Delete this issue from your list?')) return
    const issue = issues.find(i => i._id === issueId)
    try {
      const token = localStorage.getItem('token')
      if (issue.state === 'open') {
        await api.patch(`/issues/${issue.repoOwner}/${issue.repoName}/${issue.issueNumber}`, 
          { state: 'closed' }, 
          { headers: { Authorization: `Bearer ${token}` } }
        )
      }
      await api.delete(`/myissues/${issueId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setIssues(issues.filter(i => i._id !== issueId))
    } catch (error) {
      console.error('Failed to delete issue:', error)
      alert('Failed to delete issue')
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-12 py-12 text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-coral"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 sm:px-8 md:px-12 py-8 sm:py-12">
      <div className="flex justify-between items-center gap-2 sm:gap-4 mb-8">
        <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-primary">My Created Issues</h1>
        <Link href="/issues" className="btn-coral whitespace-nowrap text-xs sm:text-sm md:text-base px-3 py-2 sm:px-4 sm:py-2">
          ← Back
        </Link>
      </div>
      
      {issues.length === 0 ? (
        <div className="text-center py-12 card-midnight">
          <p className="text-muted text-lg mb-6">You haven't created any issues yet.</p>
          <Link href="/issues" className="btn-coral">
            Create Your First Issue
          </Link>
        </div>
      ) : (
        <div className="space-y-3 sm:space-y-4">
          {issues.map((issue) => (
            <div key={issue._id} className="card-midnight relative p-5">
              <div className="flex justify-between items-start mb-1.5 sm:mb-2">
                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                  issue.state === 'open' ? 'text-primary' : 'text-muted'
                }`} style={{background: issue.state === 'open' ? 'var(--accent-coral)' : 'var(--bg-tertiary)'}}>
                  {issue.state === 'open' ? 'Open' : 'Closed'}
                </span>
                <button onClick={() => deleteIssue(issue._id)} className="p-1 text-coral hover:text-white hover:bg-coral rounded transition-all" title="Delete issue">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="flex items-center gap-2 flex-wrap mb-2 sm:mb-3">
                <span className="text-1.5xl text-primary font-semibold">#{issue.issueNumber}</span>
                <span className="text-muted text-1.5xl">•</span>
                <span className="text-1.5xl text-primary font-semibold">{issue.repoOwner}/{issue.repoName}</span>
              </div>
              {editingIssue === issue._id ? (
                <div className="space-y-2 sm:space-y-3 mb-2 sm:mb-3 pt-2 border-t border-midnight">
                  <input type="text" value={editForm.title} onChange={(e) => setEditForm({ ...editForm, title: e.target.value })} className="w-full px-4 py-2 border border-midnight rounded-lg text-primary focus:border-coral focus:outline-none" style={{background: 'var(--bg-tertiary)'}} placeholder="Issue title" />
                  <textarea value={editForm.body} onChange={(e) => setEditForm({ ...editForm, body: e.target.value })} className="w-full px-4 py-2 border border-midnight rounded-lg text-primary focus:border-coral focus:outline-none" style={{background: 'var(--bg-tertiary)'}} rows="4" placeholder="Issue description" />
                </div>
              ) : (
                <div className="pt-2 border-t border-midnight">
                  <a href={issue.htmlUrl} target="_blank" rel="noopener noreferrer" className="text-sm md:text-base font-bold text-coral hover:underline block break-words">
                    {issue.title}
                  </a>
                  {issue.body && <p className="text-muted text-sm mt-1.5 sm:mt-2 mb-2 sm:mb-3">{issue.body}</p>}
                </div>
              )}
              <div className="flex flex-wrap items-center gap-2 py-1.5 sm:py-2 border-midnight text-xs text-gray-400">
                {issue.createdBy && (
                  <span className="flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5 text-coral" fill="currentColor" viewBox="0 0 16 16">
                      <path d="M10.5 5a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0zm.061 3.073a4 4 0 10-5.123 0 6.004 6.004 0 00-3.431 5.142.75.75 0 001.498.07 4.5 4.5 0 018.99 0 .75.75 0 101.498-.07 6.005 6.005 0 00-3.432-5.142z"/>
                    </svg>
                    {issue.createdBy}
                  </span>
                )}
                <span className="flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5 text-coral" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M4.75 0a.75.75 0 01.75.75V2h5V.75a.75.75 0 011.5 0V2h1.25c.966 0 1.75.784 1.75 1.75v10.5A1.75 1.75 0 0113.25 16H2.75A1.75 1.75 0 011 14.25V3.75C1 2.784 1.784 2 2.75 2H4V.75A.75.75 0 014.75 0zm0 3.5h8.5a.25.25 0 01.25.25V6h-11V3.75a.25.25 0 01.25-.25h2.5zm-2.25 4v6.75c0 .138.112.25.25.25h10.5a.25.25 0 00.25-.25V7.5h-11z"/>
                  </svg>
                  {new Date(issue.createdAt).toLocaleDateString()}
                </span>
                <span className="flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5 text-coral" fill="currentColor" viewBox="0 0 16 16">
                    <path fillRule="evenodd" d="M8 0a8 8 0 110 16A8 8 0 018 0zM1.5 8a6.5 6.5 0 1113 0 6.5 6.5 0 01-13 0zm7-3.25v2.992l2.028.812a.75.75 0 01-.557 1.392l-2.5-1A.75.75 0 017 8.25v-3.5a.75.75 0 011.5 0z"/>
                  </svg>
                  {Math.floor((Date.now() - new Date(issue.createdAt)) / (1000 * 60 * 60 * 24))} days ago
                </span>
              </div>
              <div className="flex flex-row gap-1.5 mt-3 pt-3 border-t border-midnight -mb-2">
                {editingIssue === issue._id ? (
                  <>
                    <button onClick={() => saveEdit(issue)} className="flex-1 px-2.5 py-1.5 rounded text-xs font-medium transition-all btn-coral hover:scale-105">
                      Save
                    </button>
                    <button onClick={cancelEdit} className="flex-1 px-2.5 py-1.5 rounded text-xs font-medium transition-all btn-dark hover:scale-105">
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <button onClick={() => startEdit(issue)} className="flex-1 px-2.5 py-1.5 rounded text-xs font-medium transition-all btn-dark hover:scale-105">
                      Edit
                    </button>
                    <button onClick={() => updateIssueState(issue)} className="flex-1 px-2.5 py-1.5 rounded text-xs font-medium transition-all btn-dark hover:scale-105">
                      {issue.state === 'open' ? 'Close' : 'Reopen'}
                    </button>
                    <a href={issue.htmlUrl} target="_blank" rel="noopener noreferrer" className="flex-1 px-2.5 py-1.5 rounded text-xs font-medium transition-all border border-midnight hover:border-coral hover:scale-105 flex items-center justify-center" style={{background: 'var(--bg-tertiary)'}}>
                      GitHub
                    </a>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
