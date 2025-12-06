'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import api from '@/lib/axios'

export default function Repositories() {
  const router = useRouter()
  const [repos, setRepos] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [minStars, setMinStars] = useState('')
  const [minForks, setMinForks] = useState('')
  const [page, setPage] = useState(1)
  const [bookmarkedIds, setBookmarkedIds] = useState(new Set())

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/auth')
      return
    }
    fetchRepos()
    fetchBookmarks()
  }, [page])

  const fetchBookmarks = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) return
      const { data } = await api.get('/bookmarks', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setBookmarkedIds(new Set(data.map(b => b.repoId)))
    } catch (error) {
      console.error('Failed to fetch bookmarks:', error)
    }
  }

  const fetchRepos = async () => {
    try {
      setLoading(true)
      let query = search || 'stars:>1'
      if (minStars) {
        query = search ? `${search} stars:>=${minStars}` : `stars:>=${minStars}`
      }
      if (minForks) {
        query += ` forks:>=${minForks}`
      }
      const { data } = await api.get(`/repos/search?q=${query}&page=${page}&per_page=20`)
      setRepos(data.items || [])
    } catch (error) {
      console.error('Failed to fetch repos:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleBookmark = async (repo) => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        alert('Please login to bookmark repositories')
        return
      }

      if (bookmarkedIds.has(repo.id)) {
        await api.delete(`/bookmarks/${repo.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        setBookmarkedIds(prev => {
          const newSet = new Set(prev)
          newSet.delete(repo.id)
          return newSet
        })
      } else {
        await api.post('/bookmarks', {
          repoId: repo.id,
          repoName: repo.name,
          repoFullName: repo.full_name,
          repoUrl: repo.html_url,
          description: repo.description,
          language: repo.language,
          stars: repo.stargazers_count
        }, {
          headers: { Authorization: `Bearer ${token}` }
        })
        setBookmarkedIds(prev => new Set([...prev, repo.id]))
      }
    } catch (error) {
      console.error('Failed to toggle bookmark:', error)
    }
  }

  const handleSearch = (e) => {
    e.preventDefault()
    setPage(1)
    fetchRepos()
  }

  return (
    <div className="container mx-auto px-12 py-12">
      <h1 className="text-4xl font-bold text-primary mb-6">Explore Repositories</h1>
      
      <form onSubmit={handleSearch} className="mb-8">
        <div className="flex gap-3">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search repositories (e.g., react, python)..."
            className="flex-1 px-4 py-3 border border-midnight rounded-lg text-primary focus:border-coral focus:outline-none"
            style={{background: 'var(--bg-tertiary)'}}
          />
          <input
            type="number"
            value={minStars}
            onChange={(e) => setMinStars(e.target.value)}
            placeholder="Min stars"
            className="w-32 px-4 py-3 border border-midnight rounded-lg text-primary focus:border-coral focus:outline-none"
            style={{background: 'var(--bg-tertiary)'}}
          />
          <input
            type="number"
            value={minForks}
            onChange={(e) => setMinForks(e.target.value)}
            placeholder="Min forks"
            className="w-32 px-4 py-3 border border-midnight rounded-lg text-primary focus:border-coral focus:outline-none"
            style={{background: 'var(--bg-tertiary)'}}
          />
          <button type="submit" className="btn-coral">
            Search
          </button>
        </div>
      </form>

      {loading ? (
        <div className="text-center py-20">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-coral"></div>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {repos.map((repo) => (
              <div key={repo.id} className="card-midnight">
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <a href={repo.html_url} target="_blank" rel="noopener noreferrer" className="text-xl font-semibold text-coral hover:underline">
                      {repo.full_name}
                    </a>
                    <p className="text-muted mt-2 mb-4">{repo.description || 'No description'}</p>
                    <div className="flex items-center gap-4 text-sm text-muted">
                      {repo.language && <span>💻 {repo.language}</span>}
                      <span>⭐ {repo.stargazers_count.toLocaleString()}</span>
                      <span>🍴 {repo.forks_count.toLocaleString()}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => toggleBookmark(repo)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      bookmarkedIds.has(repo.id)
                        ? 'btn-coral'
                        : 'btn-dark'
                    }`}
                  >
                    {bookmarkedIds.has(repo.id) ? '★ Starred' : '☆ Star'}
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-center items-center gap-4 mt-8">
            <button 
              onClick={() => setPage(p => Math.max(1, p - 1))} 
              disabled={page === 1}
              className="btn-dark disabled:opacity-50"
            >
              Previous
            </button>
            <span className="text-muted">Page {page}</span>
            <button 
              onClick={() => setPage(p => p + 1)}
              className="btn-dark"
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  )
}
