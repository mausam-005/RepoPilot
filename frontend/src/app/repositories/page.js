'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import api from '@/lib/axios'

export default function Repositories() {
  const router = useRouter()
  const [repos, setRepos] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [searchType, setSearchType] = useState('repo')
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
      
      if (search) {
        if (searchType === 'user') {
          query = `user:${search}`
        } else if (searchType === 'language') {
          query = `language:${search}`
        } else if (searchType === 'org') {
          query = `org:${search}`
        } else if (searchType === 'topic') {
          query = `topic:${search}`
        }
      }
      
      if (minStars) {
        query += ` stars:>=${minStars}`
      }
      if (minForks) {
        query += ` forks:>=${minForks}`
      }
      const { data } = await api.get('/repos/search', {
        params: {
          q: query,
          sort: sortBy,
          order: order,
          page: page,
          per_page: 20
        }
      })
      console.log('API Response:', data)
      console.log('Setting repos:', data.items?.length, 'items')
      setRepos(data.items || [])
    } catch (error) {
      console.error('Failed to fetch repos:', error)
      alert('Error: ' + (error.response?.data?.message || error.message))
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
    <div className="container mx-auto px-4 sm:px-8 md:px-12 py-8 sm:py-12">
      <h1 className="text-3xl sm:text-4xl font-bold text-primary mb-6">Explore Repositories</h1>
      
      <form onSubmit={handleSearch} className="card-midnight mb-8">
        <div className="mb-4">
          <label className="text-muted text-xs mb-2 block">Search Type</label>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 mb-3">
            <button
              type="button"
              onClick={() => setSearchType('repo')}
              className={`h-10 px-3 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-1.5 hover:scale-105 ${
                searchType === 'repo' ? 'bg-coral text-primary' : 'bg-tertiary text-muted hover:text-primary'
              }`}
              style={{background: searchType === 'repo' ? 'var(--accent-coral)' : 'var(--bg-tertiary)'}}
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 16 16">
                <path d="M2 2.5A2.5 2.5 0 014.5 0h8.75a.75.75 0 01.75.75v12.5a.75.75 0 01-.75.75h-2.5a.75.75 0 110-1.5h1.75v-2h-8a1 1 0 00-.714 1.7.75.75 0 01-1.072 1.05A2.495 2.495 0 012 11.5v-9zm10.5-1V9h-8c-.356 0-.694.074-1 .208V2.5a1 1 0 011-1h8zM5 12.25v3.25a.25.25 0 00.4.2l1.45-1.087a.25.25 0 01.3 0L8.6 15.7a.25.25 0 00.4-.2v-3.25a.25.25 0 00-.25-.25h-3.5a.25.25 0 00-.25.25z"/>
              </svg>
              Repository
            </button>
            <button
              type="button"
              onClick={() => setSearchType('user')}
              className={`h-10 px-3 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-1.5 hover:scale-105 ${
                searchType === 'user' ? 'bg-coral text-primary' : 'bg-tertiary text-muted hover:text-primary'
              }`}
              style={{background: searchType === 'user' ? 'var(--accent-coral)' : 'var(--bg-tertiary)'}}
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 16 16">
                <path d="M10.5 5a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0zm.061 3.073a4 4 0 10-5.123 0 6.004 6.004 0 00-3.431 5.142.75.75 0 001.498.07 4.5 4.5 0 018.99 0 .75.75 0 101.498-.07 6.005 6.005 0 00-3.432-5.142z"/>
              </svg>
              User
            </button>
            <button
              type="button"
              onClick={() => setSearchType('org')}
              className={`h-10 px-3 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-1.5 hover:scale-105 ${
                searchType === 'org' ? 'bg-coral text-primary' : 'bg-tertiary text-muted hover:text-primary'
              }`}
              style={{background: searchType === 'org' ? 'var(--accent-coral)' : 'var(--bg-tertiary)'}}
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 16 16">
                <path d="M1.75 16A1.75 1.75 0 010 14.25V1.75C0 .784.784 0 1.75 0h8.5C11.216 0 12 .784 12 1.75v12.5c0 .085-.006.168-.018.25h2.268a.25.25 0 00.25-.25V8.285a.25.25 0 00-.111-.208l-1.055-.703a.75.75 0 11.832-1.248l1.055.703c.487.325.779.871.779 1.456v5.965A1.75 1.75 0 0114.25 16h-3.5a.75.75 0 01-.197-.026c-.099.017-.2.026-.303.026h-3a.75.75 0 01-.75-.75V14h-1v1.25a.75.75 0 01-.75.75h-3zM1.75 1.5a.25.25 0 00-.25.25v12.5c0 .138.112.25.25.25h2.5a.25.25 0 00.25-.25v-12.5a.25.25 0 00-.25-.25h-2.5zm4.5 0a.25.25 0 00-.25.25v12.5c0 .138.112.25.25.25h2.5a.25.25 0 00.25-.25v-12.5a.25.25 0 00-.25-.25h-2.5z"/>
              </svg>
              Organization
            </button>
            <button
              type="button"
              onClick={() => setSearchType('language')}
              className={`h-10 px-4 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-2 hover:scale-105 ${
                searchType === 'language' ? 'bg-coral text-primary' : 'bg-tertiary text-muted hover:text-primary'
              }`}
              style={{background: searchType === 'language' ? 'var(--accent-coral)' : 'var(--bg-tertiary)'}}
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
              Language
            </button>
            <button
              type="button"
              onClick={() => setSearchType('topic')}
              className={`h-10 px-3 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-1.5 hover:scale-105 ${
                searchType === 'topic' ? 'bg-coral text-primary' : 'bg-tertiary text-muted hover:text-primary'
              }`}
              style={{background: searchType === 'topic' ? 'var(--accent-coral)' : 'var(--bg-tertiary)'}}
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 16 16">
                <path d="M2.5 7.775V2.75a.25.25 0 01.25-.25h5.025a.25.25 0 01.177.073l6.25 6.25a.25.25 0 010 .354l-5.025 5.025a.25.25 0 01-.354 0l-6.25-6.25a.25.25 0 01-.073-.177zm-1.5 0V2.75C1 1.784 1.784 1 2.75 1h5.025c.464 0 .91.184 1.238.513l6.25 6.25a1.75 1.75 0 010 2.474l-5.026 5.026a1.75 1.75 0 01-2.474 0l-6.25-6.25A1.75 1.75 0 011 7.775zM6 5a1 1 0 100 2 1 1 0 000-2z"/>
              </svg>
              Topic
            </button>

          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 mb-3">
          <div className="flex-1 relative">
            <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={
                searchType === 'user' ? 'e.g -> facebook, google' :
                searchType === 'org' ? 'e.g -> microsoft, netflix, airbnb' :
                searchType === 'language' ? 'e.g -> javascript, python, rust' :
                searchType === 'topic' ? 'e.g -> machine-learning, blockchain' :
                'e.g -> react, vue, tensorflow'
              }
              className="w-full h-10 pl-10 pr-4 border border-midnight rounded-lg text-primary focus:border-coral focus:outline-none transition-colors"
              style={{background: 'var(--bg-tertiary)'}}
            />
          </div>
          <button type="submit" className="h-10 px-6 sm:px-8 font-semibold flex items-center justify-center w-full sm:w-auto rounded-lg" style={{background: 'var(--accent-coral)', color: 'var(--text-primary)', boxShadow: '0 0 15px rgba(255, 107, 107, 0.4)'}}>
            Search
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          <div>
            <label className="text-muted text-xs mb-1 flex items-center gap-1">
              <svg className="w-3 h-3 text-coral" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              Min Stars
            </label>
            <input
              type="number"
              value={minStars}
              onChange={(e) => setMinStars(e.target.value)}
              placeholder="0"
              className="w-full h-10 px-3 border border-midnight rounded-lg text-primary focus:border-coral focus:outline-none transition-colors"
              style={{background: 'var(--bg-tertiary)'}}
            />
          </div>
          <div>
            <label className="text-muted text-xs mb-1 flex items-center gap-1">
              <svg className="w-3 h-3 text-coral" fill="currentColor" viewBox="0 0 16 16">
                <path fillRule="evenodd" d="M5 3.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm0 2.122a2.25 2.25 0 10-1.5 0v.878A2.25 2.25 0 005.75 8.5h1.5v2.128a2.251 2.251 0 101.5 0V8.5h1.5a2.25 2.25 0 002.25-2.25v-.878a2.25 2.25 0 10-1.5 0v.878a.75.75 0 01-.75.75h-4.5A.75.75 0 015 6.25v-.878zm3.75 7.378a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm3-8.75a.75.75 0 100-1.5.75.75 0 000 1.5z"/>
              </svg>
              Min Forks
            </label>
            <input
              type="number"
              value={minForks}
              onChange={(e) => setMinForks(e.target.value)}
              placeholder="0"
              className="w-full h-10 px-3 border border-midnight rounded-lg text-primary focus:border-coral focus:outline-none transition-colors"
              style={{background: 'var(--bg-tertiary)'}}
            />
          </div>
          <div>
            <label className="text-muted text-xs mb-1 block">Sort By</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full h-10 px-3 border border-midnight rounded-lg text-primary focus:border-coral focus:outline-none transition-colors cursor-pointer"
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
              className="w-full h-10 px-3 border border-midnight rounded-lg text-primary focus:border-coral focus:outline-none transition-colors cursor-pointer"
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
      ) : repos.length === 0 ? (
        <div className="text-center py-20 card-midnight">
          <p className="text-muted text-lg">No repositories found. Try a different search.</p>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {repos.map((repo) => (
              <div key={repo.id} className="card-midnight">
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                  <div className="flex-1 w-full sm:w-auto">
                    <a href={repo.html_url} target="_blank" rel="noopener noreferrer" className="text-lg sm:text-xl font-semibold text-coral hover:underline break-words">
                      {repo.full_name}
                    </a>
                    <p className="text-muted mt-2 mb-4">{repo.description || 'No description'}</p>
                    <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs sm:text-sm text-muted">
                      {repo.language && (
                        <span className="flex items-center gap-1">
                          <svg className="w-3 h-3 text-coral" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                          {repo.language}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <svg className="w-3 h-3 text-coral" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        {repo.stargazers_count.toLocaleString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <svg className="w-3 h-3 text-coral" fill="currentColor" viewBox="0 0 16 16">
                          <path fillRule="evenodd" d="M5 3.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm0 2.122a2.25 2.25 0 10-1.5 0v.878A2.25 2.25 0 005.75 8.5h1.5v2.128a2.251 2.251 0 101.5 0V8.5h1.5a2.25 2.25 0 002.25-2.25v-.878a2.25 2.25 0 10-1.5 0v.878a.75.75 0 01-.75.75h-4.5A.75.75 0 015 6.25v-.878zm3.75 7.378a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm3-8.75a.75.75 0 100-1.5.75.75 0 000 1.5z"/>
                        </svg>
                        {repo.forks_count.toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => toggleBookmark(repo)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors text-sm whitespace-nowrap ${
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