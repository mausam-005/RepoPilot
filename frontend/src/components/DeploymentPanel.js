import { useState, useEffect } from 'react'
import api from '@/lib/axios'

export default function DeploymentPanel({ owner, repo, htmlUrl }) {
  const [runs, setRuns] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchCIRuns()
  }, [owner, repo])

  const fetchCIRuns = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      const headers = token ? { Authorization: `Bearer ${token}` } : {}
      const { data } = await api.get(`/ci/${owner}/${repo}/runs`, { headers })
      setRuns(data.workflow_runs || [])
    } catch (err) {
      console.error('Failed to fetch CI runs:', err)
      setError('Failed to fetch CI workflow runs. Make sure GitHub Actions are enabled for this repository.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      {/* Deploy Actions */}
      <div className="card-midnight p-6 sm:p-8 border border-midnight shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5">
          <svg className="w-48 h-48 text-coral" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L2 22h20L12 2zm0 4.2L18.8 20H5.2L12 6.2z" /></svg>
        </div>
        <h2 className="text-2xl font-bold text-primary mb-2 flex items-center gap-3">
          One-Click Deployments
        </h2>
        <p className="text-muted mb-8 max-w-2xl">Instantly deploy this repository to your favorite cloud platforms without leaving RepoPilot. We use secure magic URLs to hand off the deployment directly to the platform.</p>
        
        <div className="flex flex-col sm:flex-row gap-4 relative z-10">
          <a 
            href={`https://vercel.com/new/clone?repository-url=${encodeURIComponent(htmlUrl)}`}
            target="_blank" 
            rel="noopener noreferrer"
            className="flex-1 bg-white hover:bg-gray-100 text-black font-bold py-4 px-6 rounded-xl flex items-center justify-center gap-3 transition-colors group"
          >
            <svg className="w-6 h-6" viewBox="0 0 76 65" fill="currentColor"><path d="M37.5274 0L75.0548 65H0L37.5274 0Z"/></svg>
            Deploy to Vercel
            <svg className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
          </a>
          
          <a 
            href={`https://render.com/deploy?repo=${encodeURIComponent(htmlUrl)}`}
            target="_blank" 
            rel="noopener noreferrer"
            className="flex-1 bg-[#46E3B7] hover:bg-[#3bc29c] text-black font-bold py-4 px-6 rounded-xl flex items-center justify-center gap-3 transition-colors group"
          >
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 15c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z"/></svg>
            Deploy to Render
            <svg className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
          </a>
        </div>
      </div>

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
          <div className="space-y-4">
            {runs.map((run) => (
              <a 
                key={run.id} 
                href={run.html_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-4 rounded-xl border border-midnight hover:border-coral transition-colors" 
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
                    <h3 className="text-primary font-semibold truncate max-w-[200px] sm:max-w-md">{run.display_title || run.head_commit?.message || run.name}</h3>
                    <p className="text-sm text-muted mt-1 flex items-center gap-2">
                      <span className="bg-secondary px-1.5 py-0.5 rounded text-white text-xs">{run.head_branch}</span>
                      {run.name}
                    </p>
                  </div>
                </div>
                
                <div className="text-sm text-muted whitespace-nowrap flex flex-col items-end">
                  <span className="flex items-center gap-1">
                    <img src={run.actor?.avatar_url} className="w-4 h-4 rounded-full" alt={run.actor?.login} />
                    {run.actor?.login}
                  </span>
                  <span className="mt-1 opacity-75">{new Date(run.created_at).toLocaleString()}</span>
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
