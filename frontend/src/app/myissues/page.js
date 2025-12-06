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

  const deleteIssue = async (issueId) => {
    if (!confirm('Delete this issue from your list?')) return
    try {
      const token = localStorage.getItem('token')
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
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    issue.state === 'open' ? 'text-primary' : 'text-muted'
                  }`} style={{background: issue.state === 'open' ? 'var(--accent-coral)' : 'var(--bg-tertiary)'}}>
                    {issue.state === 'open' ? '✓ Open' : '✗ Closed'}
                  </span>
                  <span className="text-muted text-sm">#{issue.issueNumber}</span>
                  <span className="text-muted text-sm font-medium">{issue.repoOwner}/{issue.repoName}</span>
                </div>
                <div className="flex gap-2">
                  <a 
                    href={issue.htmlUrl} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="px-3 py-1 rounded text-xs text-primary transition-colors btn-dark"
                  >
                    View on GitHub →
                  </a>
                  <button
                    onClick={() => deleteIssue(issue._id)}
                    className="px-3 py-1 rounded text-xs text-primary transition-colors border border-midnight hover:border-coral"
                    style={{background: 'var(--bg-tertiary)'}}
                  >
                    Delete
                  </button>
                </div>
              </div>
              <a href={issue.htmlUrl} target="_blank" rel="noopener noreferrer" className="text-xl font-semibold text-coral hover:underline block mb-2">
                {issue.title}
              </a>
              {issue.body && <p className="text-muted text-sm mt-2">{issue.body}</p>}
              <div className="flex items-center gap-4 mt-3 text-xs text-muted">
                {issue.createdBy && <span>👤 {issue.createdBy}</span>}
                <span>📅 {new Date(issue.createdAt).toLocaleDateString()}</span>
                <span>⏱️ {Math.floor((Date.now() - new Date(issue.createdAt)) / (1000 * 60 * 60 * 24))} days ago</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
