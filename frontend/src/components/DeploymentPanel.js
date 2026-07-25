import { useState, useEffect } from 'react'
import api from '@/lib/axios'

export default function DeploymentPanel({ owner, repo, htmlUrl }) {
  const [runs, setRuns] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    fetchCIRuns()
  }, [owner, repo, page])

  const fetchCIRuns = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      const headers = token ? { Authorization: `Bearer ${token}` } : {}
      const { data } = await api.get(`/ci/${owner}/${repo}/runs?page=${page}`, { headers })
      setRuns(data.workflow_runs || [])
      setTotalPages(Math.ceil((data.total_count || 0) / 5) || 1)
    } catch (err) {
      console.error('Failed to fetch CI runs:', err)
      setError('Failed to fetch CI workflow runs. Make sure GitHub Actions are enabled for this repository.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8">

      {/* CI/CD Pipeline Feed */}
      <div className="card-midnight p-6 sm:p-8">
        <h2 className="text-xl font-bold text-primary mb-6 flex items-center gap-3">
          <svg className="w-6 h-6 text-coral" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
          GitHub Actions Workflows
        </h2>

        {loading ? (
          <div className="flex justify-center p-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-coral"></div>
          </div>
        ) : error ? (
          <div className="text-center p-6 text-red-400 bg-red-400/10 rounded-xl border border-red-400/20">
            {error}
          </div>
        ) : runs.length === 0 ? (
          <div className="text-center p-8 text-muted border border-dashed border-midnight rounded-xl" style={{background: 'var(--bg-tertiary)'}}>
            <svg className="w-12 h-12 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
            <p>No CI/CD workflow runs found for this repository.</p>
          </div>
        ) : (
          <div>
            <div className="space-y-4">
              {runs.map((run) => (
                <div 
                  key={run.id} 
                  className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-4 rounded-xl border border-midnight" 
                  style={{background: 'var(--bg-tertiary)'}}
                >
                <div className="flex items-start gap-4">
                  <div className="mt-1">
                    {run.status === 'completed' ? (
                      run.conclusion === 'success' ? (
                        <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      ) : (
                        <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      )
                    ) : (
                      <div className="w-6 h-6 rounded-full border-2 border-yellow-500 border-t-transparent animate-spin"></div>
                    )}
                  </div>
                  <div>
                    <h3 className="text-primary font-semibold truncate max-w-[200px] sm:max-w-md">
                      <a href={run.html_url} target="_blank" rel="noopener noreferrer" className="hover:text-coral transition-colors">
                        {run.display_title || run.head_commit?.message || run.name}
                      </a>
                    </h3>
                    <p className="text-sm text-muted mt-1 flex items-center gap-2">
                      <span className="bg-secondary px-1.5 py-0.5 rounded text-white text-xs">{run.head_branch}</span>
                      {run.name}
                    </p>
                  </div>
                </div>
                
                <div className="text-sm text-muted whitespace-nowrap flex flex-col items-end">
                  <span className="flex items-center gap-1">
                    <img src={run.actor?.avatar_url} className="w-4 h-4 rounded-full" alt="" />
                    <a href={`https://github.com/${run.actor?.login}`} target="_blank" rel="noopener noreferrer" className="hover:text-coral transition-colors hover:underline">
                      {run.actor?.login}
                    </a>
                  </span>
                  <span className="mt-1 opacity-75">{new Date(run.created_at).toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 mt-6">
              <button 
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${page === 1 ? 'bg-secondary text-muted cursor-not-allowed' : 'bg-midnight text-primary hover:text-coral'}`}
              >
                Previous
              </button>
              <span className="text-muted text-sm font-medium">Page {page} of {totalPages}</span>
              <button 
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${page === totalPages ? 'bg-secondary text-muted cursor-not-allowed' : 'bg-midnight text-primary hover:text-coral'}`}
              >
                Next
              </button>
            </div>
          )}
          </div>
        )}
      </div>
    </div>
  )
}
