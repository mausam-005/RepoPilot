'use client'
import { useState, useEffect } from 'react'
import api from '@/lib/axios'

export default function MyIssues() {
  const [issues, setIssues] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchMyIssues()
  }, [])

  const fetchMyIssues = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) return
      
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

  if (loading) {
    return (
      <div className="container mx-auto px-6 py-12 text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-6 py-12">
      <h1 className="text-4xl font-bold text-white mb-6">My Created Issues</h1>
      
      {issues.length === 0 ? (
        <div className="text-center py-12 bg-slate-800 border border-slate-700 rounded-lg">
          <p className="text-slate-400 text-lg">You haven't created any issues yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {issues.map((issue) => (
            <div key={issue._id} className="bg-slate-800 border border-slate-700 p-6 rounded-lg">
              <div className="flex items-center gap-3 mb-2">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  issue.state === 'open' ? 'bg-green-600' : 'bg-purple-600'
                }`}>
                  {issue.state === 'open' ? '✓ Open' : '✗ Closed'}
                </span>
                <span className="text-slate-500">#{issue.issueNumber}</span>
                <span className="text-slate-500">{issue.repoOwner}/{issue.repoName}</span>
              </div>
              <a href={issue.htmlUrl} target="_blank" rel="noopener noreferrer" className="text-xl font-semibold text-blue-400 hover:underline">
                {issue.title}
              </a>
              {issue.body && <p className="text-slate-300 text-sm mt-2">{issue.body}</p>}
              <p className="text-slate-400 text-xs mt-2">Created {new Date(issue.createdAt).toLocaleDateString()}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
