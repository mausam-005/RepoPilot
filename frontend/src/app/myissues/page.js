'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import api from '@/lib/axios'

export default function MyIssues() {
  const router = useRouter()
  const [issues, setIssues] = useState([])
  const [loading, setLoading] = useState(true)

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
    <div className="container mx-auto px-12 py-12">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-primary">My Created Issues</h1>
        <Link href="/issues" className="btn-coral">
          ← Back to Issues
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
        <div className="space-y-4">
          {issues.map((issue) => (
            <div key={issue._id} className="card-midnight">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold inline-block ${
                    issue.state === 'open' ? 'text-primary' : 'text-muted'
                  }`} style={{background: issue.state === 'open' ? 'var(--accent-coral)' : 'var(--bg-tertiary)'}}>
                    {issue.state === 'open' ? 'Open' : 'Closed'}
                  </span>
                  <div className="mt-4 text-xs text-primary">
                    <span className="font-semibold">#{issue.issueNumber}</span>
                    <span className="text-muted mx-1.5">•</span>
                    <span className="font-semibold">{issue.repoOwner}/{issue.repoName}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => updateIssueState(issue)}
                    className="px-4 py-2 rounded-lg text-xs font-medium transition-all btn-dark hover:scale-105"
                  >
                    {issue.state === 'open' ? 'Close' : 'Reopen'}
                  </button>
                  <a 
                    href={issue.htmlUrl} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="px-4 py-2 rounded-lg text-xs font-medium transition-all border border-midnight hover:border-coral hover:scale-105 flex items-center gap-1.5"
                    style={{background: 'var(--bg-tertiary)'}}
                  >
                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 16 16">
                      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>
                    </svg>
                    View on GitHub →
                  </a>
                  <button
                    onClick={() => deleteIssue(issue._id)}
                    className="px-4 py-2 text-coral rounded-lg text-xs font-medium transition-all hover:bg-coral hover:text-white hover:scale-105"
                    style={{background: 'rgba(255, 107, 107, 0.1)'}}
                  >
                    Delete
                  </button>
                </div>
              </div>
              <a href={issue.htmlUrl} target="_blank" rel="noopener noreferrer" className="text-lg font-bold text-coral hover:underline block mb-2">
                {issue.title}
              </a>
              {issue.body && <p className="text-muted text-sm mt-2">{issue.body}</p>}
              <div className="flex items-center gap-4 mt-3 text-xs text-gray-400">
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
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
