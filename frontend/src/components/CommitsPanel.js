import { useState, useEffect } from 'react'
import api from '@/lib/axios'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

export default function CommitsPanel({ owner, repo }) {
  const [commits, setCommits] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  // Pagination
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)

  // AI Reviews state
  const [reviews, setReviews] = useState({})
  const [reviewLoading, setReviewLoading] = useState({})

  useEffect(() => {
    fetchCommits(page)
  }, [owner, repo, page])

  const fetchCommits = async (pageNumber) => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      const headers = token ? { Authorization: `Bearer ${token}` } : {}
      const { data } = await api.get(`/repos/${owner}/${repo}/commits?page=${pageNumber}&per_page=10`, { headers })
      
      setCommits(data || [])
      setHasMore(data && data.length === 10)
    } catch (err) {
      console.error('Failed to fetch commits:', err)
      setError('Failed to fetch commits. Ensure the repository exists and you have access.')
    } finally {
      setLoading(false)
    }
  }

  const generateReview = async (sha) => {
    try {
      setReviewLoading(prev => ({ ...prev, [sha]: true }))
      const token = localStorage.getItem('token')
      const headers = token ? { Authorization: `Bearer ${token}` } : {}
      const { data } = await api.post('/ai/review-commit', { owner, repo, sha }, { headers })
      
      setReviews(prev => ({ ...prev, [sha]: data.review }))
    } catch (err) {
      console.error('Failed to generate commit review:', err)
      setReviews(prev => ({ ...prev, [sha]: '**Error:** Failed to generate AI Code Review.' }))
    } finally {
      setReviewLoading(prev => ({ ...prev, [sha]: false }))
    }
  }

  if (loading && page === 1) {
    return (
      <div className="card-midnight p-8 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-coral"></div>
        <p className="mt-4 text-muted">Loading commit history...</p>
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

  if (commits.length === 0 && page === 1) {
    return (
      <div className="card-midnight p-12 text-center flex flex-col items-center">
        <svg className="w-16 h-16 text-muted mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" /></svg>
        <h3 className="text-xl font-semibold text-primary mb-2">No Commits Found</h3>
        <p className="text-muted max-w-md">There are no commits visible in this repository.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        {commits.map(commit => (
          <div key={commit.sha} className="card-midnight p-6 overflow-hidden">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-mono text-xs bg-tertiary px-2 py-1 rounded text-coral border border-midnight">
                    {commit.sha.substring(0, 7)}
                  </span>
                  <a href={commit.html_url} target="_blank" rel="noopener noreferrer" className="text-muted hover:text-primary transition-colors text-sm">
                    View on GitHub
                  </a>
                </div>
                <h3 className="text-lg font-semibold text-primary truncate whitespace-pre-wrap">
                  {commit.commit?.message?.split('\n')[0]}
                </h3>
                
                <div className="flex items-center gap-2 mt-3 text-sm text-muted">
                  {commit.author?.avatar_url ? (
                    <img src={commit.author.avatar_url} className="w-5 h-5 rounded-full" alt="" />
                  ) : (
                    <div className="w-5 h-5 rounded-full bg-secondary flex items-center justify-center text-xs text-white">
                      {commit.commit?.author?.name?.[0] || '?'}
                    </div>
                  )}
                  {commit.author?.login ? (
                    <a href={commit.author.html_url} target="_blank" rel="noopener noreferrer" className="hover:text-coral hover:underline transition-colors font-medium text-primary">
                      {commit.author.login}
                    </a>
                  ) : (
                    <span className="font-medium text-primary">{commit.commit?.author?.name}</span>
                  )}
                  <span className="opacity-75 hidden sm:inline">committed on {new Date(commit.commit?.author?.date).toLocaleDateString()}</span>
                </div>
              </div>
              
              <button 
                onClick={() => generateReview(commit.sha)}
                disabled={reviewLoading[commit.sha]}
                className={`${reviewLoading[commit.sha] ? 'btn-dark opacity-70 cursor-not-allowed' : 'btn-coral'} flex items-center gap-2 whitespace-nowrap self-start md:self-auto`}
              >
                <svg className={`w-4 h-4 ${reviewLoading[commit.sha] ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                {reviewLoading[commit.sha] ? 'Generating Review...' : (reviews[commit.sha] ? 'Regenerate Review' : 'AI Code Review')}
              </button>
            </div>

            {reviews[commit.sha] && (
              <div className="bg-tertiary rounded-xl p-5 border border-midnight relative mt-5">
                <div className="absolute top-0 right-0 bg-coral text-white text-xs font-bold px-3 py-1 rounded-bl-xl rounded-tr-xl flex items-center gap-1">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                  COMMIT AI REVIEW
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
                    {reviews[commit.sha]}
                  </ReactMarkdown>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
      
      {/* Pagination */}
      <div className="flex justify-center items-center gap-4 mt-8 pt-4">
        <button 
          onClick={() => setPage(p => Math.max(1, p - 1))}
          disabled={page === 1}
          className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${page === 1 ? 'bg-secondary text-muted cursor-not-allowed' : 'bg-midnight text-primary hover:text-coral'}`}
        >
          Previous
        </button>
        <span className="text-muted text-sm font-medium">Page {page}</span>
        <button 
          onClick={() => setPage(p => p + 1)}
          disabled={!hasMore}
          className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${!hasMore ? 'bg-secondary text-muted cursor-not-allowed' : 'bg-midnight text-primary hover:text-coral'}`}
        >
          Next
        </button>
      </div>
    </div>
  )
}
