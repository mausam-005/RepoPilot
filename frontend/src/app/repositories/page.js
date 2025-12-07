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
  const [sortBy, setSortBy] = useState('stars')
  const [order, setOrder] = useState('desc')
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
      const { data } = await api.get(`/repos/search?q=${query}&sort=${sortBy}&order=${order}&page=${page}&per_page=20`)
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
      
      <form onSubmit={handleSearch} className="card-midnight mb-8">
        <div className="flex gap-3 mb-4">
          <div className="flex-1 relative">
            <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search repositories (e.g., react, python)..."
              className="w-full pl-10 pr-4 py-3 border border-midnight rounded-lg text-primary focus:border-coral focus:outline-none transition-colors"
              style={{background: 'var(--bg-tertiary)'}}
            />
          </div>
          <button type="submit" className="btn-coral px-8">
            Search
          </button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div>
            <label className="text-muted text-xs mb-1 flex items-center gap-1">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              Min Stars
            </label>
            <input
              type="number"
              value={minStars}
              onChange={(e) => setMinStars(e.target.value)}
              placeholder="0"
              className="w-full px-3 py-2 border border-midnight rounded-lg text-primary focus:border-coral focus:outline-none transition-colors"
              style={{background: 'var(--bg-tertiary)'}}
            />
          </div>
          <div>
            <label className="text-muted text-xs mb-1 flex items-center gap-1">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 16 16">
                <path fillRule="evenodd" d="M5 3.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm0 2.122a2.25 2.25 0 10-1.5 0v.878A2.25 2.25 0 005.75 8.5h1.5v2.128a2.251 2.251 0 101.5 0V8.5h1.5a2.25 2.25 0 002.25-2.25v-.878a2.25 2.25 0 10-1.5 0v.878a.75.75 0 01-.75.75h-4.5A.75.75 0 015 6.25v-.878zm3.75 7.378a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm3-8.75a.75.75 0 100-1.5.75.75 0 000 1.5z"/>
              </svg>
              Min Forks
            </label>
            <input
              type="number"
              value={minForks}
              onChange={(e) => setMinForks(e.target.value)}
              placeholder="0"
              className="w-full px-3 py-2 border border-midnight rounded-lg text-primary focus:border-coral focus:outline-none transition-colors"
              style={{background: 'var(--bg-tertiary)'}}
            />
          </div>
          <div>
            <label className="text-muted text-xs mb-1 block">Sort By</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-3 py-2 border border-midnight rounded-lg text-primary focus:border-coral focus:outline-none transition-colors cursor-pointer"
              style={{background: 'var(--bg-tertiary)'}}
            >
              <option value="stars">Stars</option>
              <option value="forks">Forks</option>
              <option value="updated">Updated</option>
            </select>
          </div>
          <div>
            <label className="text-muted text-xs mb-1 block">Order</label>
            <select
              value={order}
              onChange={(e) => setOrder(e.target.value)}
              className="w-full px-3 py-2 border border-midnight rounded-lg text-primary focus:border-coral focus:outline-none transition-colors cursor-pointer"
              style={{background: 'var(--bg-tertiary)'}}
            >
              <option value="desc">↓ High to Low</option>
              <option value="asc">↑ Low to High</option>
            </select>
          </div>
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
                      {repo.language && (
                        <span className="flex items-center gap-1">
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                          {repo.language}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        {repo.stargazers_count.toLocaleString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 16 16">
                          <path fillRule="evenodd" d="M5 3.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm0 2.122a2.25 2.25 0 10-1.5 0v.878A2.25 2.25 0 005.75 8.5h1.5v2.128a2.251 2.251 0 101.5 0V8.5h1.5a2.25 2.25 0 002.25-2.25v-.878a2.25 2.25 0 10-1.5 0v.878a.75.75 0 01-.75.75h-4.5A.75.75 0 015 6.25v-.878zm3.75 7.378a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm3-8.75a.75.75 0 100-1.5.75.75 0 000 1.5z"/>
                        </svg>
                        {repo.forks_count.toLocaleString()}
                      </span>
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