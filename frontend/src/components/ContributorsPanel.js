import { useState, useEffect } from 'react'
import api from '@/lib/axios'

export default function ContributorsPanel({ owner, repo }) {
  const [contributors, setContributors] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  // Pagination
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)

  useEffect(() => {
    fetchContributors(page)
  }, [owner, repo, page])

  const fetchContributors = async (pageNumber) => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      const headers = token ? { Authorization: `Bearer ${token}` } : {}
      const { data } = await api.get(`/repos/${owner}/${repo}/contributors?page=${pageNumber}&per_page=24`, { headers })
      
      setContributors(data || [])
      setHasMore(data && data.length === 24)
    } catch (err) {
      console.error('Failed to fetch contributors:', err)
      setError('Failed to fetch contributors. Ensure the repository exists and you have access.')
    } finally {
      setLoading(false)
    }
  }

  if (loading && page === 1) {
    return (
      <div className="card-midnight p-8 text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-coral"></div>
        <p className="mt-4 text-muted">Loading contributors...</p>
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

  if (contributors.length === 0 && page === 1) {
    return (
      <div className="card-midnight p-12 text-center flex flex-col items-center">
        <svg className="w-16 h-16 text-muted mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
        <h3 className="text-xl font-semibold text-primary mb-2">No Contributors Found</h3>
        <p className="text-muted max-w-md">There are no contributors visible for this repository.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {contributors.map(contributor => (
          <a 
            key={contributor.id} 
            href={contributor.html_url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="card-midnight p-6 flex flex-col items-center text-center hover:border-coral transition-colors group"
          >
            <div className="relative mb-4">
              <img 
                src={contributor.avatar_url} 
                alt={contributor.login} 
                className="w-20 h-20 rounded-full border-2 border-transparent group-hover:border-coral transition-colors shadow-lg"
              />
              <div className="absolute -bottom-2 -right-2 bg-coral text-white text-xs font-bold px-2 py-1 rounded-lg shadow-md border border-midnight">
                {contributor.contributions}
              </div>
            </div>
            
            <h3 className="text-lg font-bold text-primary group-hover:text-coral transition-colors truncate w-full">
              {contributor.login}
            </h3>
            <p className="text-xs text-muted mt-1 uppercase tracking-wider font-semibold">
              Commits
            </p>
          </a>
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
