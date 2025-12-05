'use client'
import { useState, useEffect } from 'react'
import api from '@/lib/axios'
import Link from 'next/link'

export default function Repositories() {
  const [repos, setRepos] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [minStars, setMinStars] = useState('')
  const [minForks, setMinForks] = useState('')
  const [page, setPage] = useState(1)
  const [bookmarkedIds, setBookmarkedIds] = useState(new Set())

  useEffect(() => {
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
    <div className="container mx-auto px-6 py-12">
      <h1 className="text-4xl font-bold text-white mb-6">Explore Repositories</h1>
      
      <form onSubmit={handleSearch} className="mb-8">
        <div className="flex gap-3">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search repositories (e.g., react, python)..."
            className="flex-1 px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
          />
          <input
            type="number"
            value={minStars}
            onChange={(e) => setMinStars(e.target.value)}
            placeholder="Min stars"
            className="w-32 px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
          />
          <input
            type="number"
            value={minForks}
            onChange={(e) => setMinForks(e.target.value)}
            placeholder="Min forks"
            className="w-32 px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
          />
          <button type="submit" className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-medium">
            Search
          </button>
        </div>
      </form>

      {loading ? (
        <div className="text-center py-20">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {repos.map((repo) => (
              <div key={repo.id} className="bg-slate-800 border border-slate-700 p-6 rounded-lg hover:border-slate-600 transition-colors">
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <a href={repo.html_url} target="_blank" rel="noopener noreferrer" className="text-xl font-semibold text-blue-400 hover:underline">
                      {repo.full_name}
                    </a>
                    <p className="text-slate-400 mt-2 mb-4">{repo.description || 'No description'}</p>
                    <div className="flex items-center gap-4 text-sm text-slate-500">
                      {repo.language && <span>💻 {repo.language}</span>}
                      <span>⭐ {repo.stargazers_count.toLocaleString()}</span>
                      <span>🍴 {repo.forks_count.toLocaleString()}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => toggleBookmark(repo)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      bookmarkedIds.has(repo.id)
                        ? 'bg-yellow-600 hover:bg-yellow-700 text-white'
                        : 'bg-slate-700 hover:bg-slate-600 text-slate-300'
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
              className="px-6 py-2 bg-slate-800 border border-slate-700 rounded-lg hover:bg-slate-700 disabled:opacity-50"
            >
              Previous
            </button>
            <span className="text-slate-400">Page {page}</span>
            <button 
              onClick={() => setPage(p => p + 1)}
              className="px-6 py-2 bg-slate-800 border border-slate-700 rounded-lg hover:bg-slate-700"
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  )
}
