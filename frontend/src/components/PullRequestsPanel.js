import { useState, useEffect } from 'react'
import api from '@/lib/axios'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

export default function PullRequestsPanel({ owner, repo }) {
  const [pulls, setPulls] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  // State for tracking AI reviews
  const [reviews, setReviews] = useState({}) // { pullNumber: string }
  const [reviewLoading, setReviewLoading] = useState({}) // { pullNumber: boolean }

  useEffect(() => {
    fetchPullRequests()
  }, [owner, repo])

  const fetchPullRequests = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      const headers = token ? { Authorization: `Bearer ${token}` } : {}
      const { data } = await api.get(`/repos/${owner}/${repo}/pulls?state=open`, { headers })
      setPulls(data)
    } catch (err) {
      console.error('Failed to fetch PRs:', err)
      setError('Failed to fetch pull requests.')
    } finally {
      setLoading(false)
    }
  }

  const generateReview = async (pullNumber) => {
    try {
      setReviewLoading(prev => ({ ...prev, [pullNumber]: true }))
      const token = localStorage.getItem('token')
      const headers = token ? { Authorization: `Bearer ${token}` } : {}
      const { data } = await api.post('/ai/review-pr', { owner, repo, pullNumber }, { headers })
      
      setReviews(prev => ({ ...prev, [pullNumber]: data.review }))
    } catch (err) {
      console.error('Failed to generate review:', err)
      setReviews(prev => ({ ...prev, [pullNumber]: '**Error:** Failed to generate AI Code Review.' }))
    } finally {
      setReviewLoading(prev => ({ ...prev, [pullNumber]: false }))
    }
  }

  if (loading) {
    return (
      <div className="card-midnight p-8 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-coral"></div>
        <p className="mt-4 text-muted">Loading pull requests...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="card-midnight p-8 text-center text-red-500 bg-red-500/10 border border-red-500/20">
        {error}
      </div>
    )
  }

  if (pulls.length === 0) {
    return (
      <div className="card-midnight p-12 text-center flex flex-col items-center">
        <svg className="w-16 h-16 text-muted mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" /></svg>
        <h3 className="text-xl font-semibold text-primary mb-2">No Open Pull Requests</h3>
        <p className="text-muted max-w-md">There are currently no open pull requests in this repository to review.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {pulls.map(pr => (
        <div key={pr.id} className="card-midnight p-6 overflow-hidden">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-midnight pb-4 mb-4">
            <div>
              <h3 className="text-xl font-semibold text-primary flex items-center gap-3">
                <a href={pr.html_url} target="_blank" rel="noopener noreferrer" className="hover:text-coral transition-colors flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" /></svg>
                  {pr.title} <span className="text-muted text-sm font-normal">#{pr.number}</span>
                </a>
              </h3>
              <p className="text-sm text-muted mt-2 flex items-center gap-2">
                <img src={pr.user?.avatar_url} alt={pr.user?.login} className="w-5 h-5 rounded-full" />
                <span>{pr.user?.login}</span> wants to merge into <code className="bg-tertiary px-1 py-0.5 rounded text-coral">{pr.base.ref}</code> from <code className="bg-tertiary px-1 py-0.5 rounded text-primary">{pr.head.ref}</code>
              </p>
            </div>
            
            <button 
              onClick={() => generateReview(pr.number)}
              disabled={reviewLoading[pr.number]}
              className={`${reviewLoading[pr.number] ? 'btn-dark opacity-70 cursor-not-allowed' : 'btn-coral'} flex items-center gap-2 whitespace-nowrap`}
            >
              <svg className={`w-4 h-4 ${reviewLoading[pr.number] ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
              {reviewLoading[pr.number] ? 'Generating Review...' : (reviews[pr.number] ? 'Regenerate Review' : 'AI Code Review')}
            </button>
          </div>

          {reviews[pr.number] && (
            <div className="bg-tertiary rounded-xl p-5 border border-midnight relative mt-4">
              <div className="absolute top-0 right-0 bg-coral text-white text-xs font-bold px-3 py-1 rounded-bl-xl rounded-tr-xl flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                AI REVIEW
              </div>
              <div className="prose prose-sm prose-invert max-w-none prose-h1:text-xl prose-h2:text-lg prose-h3:text-base prose-a:text-coral prose-pre:bg-secondary prose-pre:border prose-pre:border-midnight">
                <ReactMarkdown 
                  remarkPlugins={[remarkGfm]}
                  components={{
                    strong: ({node, children, ...props}) => {
                      const text = String(children);
                      if (text.includes('Approve')) return <strong className="text-green-400">{children}</strong>;
                      if (text.includes('Reject')) return <strong className="text-red-400">{children}</strong>;
                      if (text.includes('Request Changes')) return <strong className="text-yellow-400">{children}</strong>;
                      return <strong {...props} className="text-primary">{children}</strong>;
                    }
                  }}
                >
                  {reviews[pr.number]}
                </ReactMarkdown>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
