'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import api from '@/lib/axios'

export default function Bookmarks() {
  const [bookmarks, setBookmarks] = useState([])
  const [loading, setLoading] = useState(true)
  const [showIssueForm, setShowIssueForm] = useState(null)
  const [issueData, setIssueData] = useState({ title: '', body: '' })
  const router = useRouter()

  useEffect(() => {
    fetchBookmarks()
  }, [])

  const fetchBookmarks = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        router.push('/auth')
        return
      }
      const { data } = await api.get('/bookmarks', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setBookmarks(data)
    } catch (error) {
      console.error('Failed to fetch bookmarks:', error)
    } finally {
      setLoading(false)
    }
  }

  const removeBookmark = async (repoId) => {
    try {
      const token = localStorage.getItem('token')
      await api.delete(`/bookmarks/${repoId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setBookmarks(bookmarks.filter(b => b.repoId !== repoId))
    } catch (error) {
      console.error('Failed to remove bookmark:', error)
    }
  }

  const removeAllBookmarks = async () => {
    if (!confirm('Are you sure you want to remove all bookmarks?')) return
    try {
      const token = localStorage.getItem('token')
      await Promise.all(bookmarks.map(b => 
        api.delete(`/bookmarks/${b.repoId}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ))
      setBookmarks([])
    } catch (error) {
      console.error('Failed to remove all bookmarks:', error)
    }
  }

  const createIssue = async (repoFullName) => {
    try {
      const token = localStorage.getItem('token')
      await api.post(`/repos/${repoFullName}/issues`, issueData, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setShowIssueForm(null)
      setIssueData({ title: '', body: '' })
      alert('Issue created successfully!')
    } catch (error) {
      console.error('Failed to create issue:', error)
      alert('Failed to create issue')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-coral"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-12 py-12">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold text-primary mb-2">Your Bookmarks</h1>
          <p className="text-muted"><span className="text-coral">{bookmarks.length}</span> starred repositories</p>
        </div>
        {bookmarks.length > 0 && (
          <button onClick={removeAllBookmarks} className="btn-dark">
            Remove All
          </button>
        )}
      </div>

      {bookmarks.length === 0 ? (
        <div className="card-midnight p-16 text-center">
          <h3 className="text-2xl font-semibold text-primary mb-3">No bookmarks yet</h3>
          <p className="text-muted mb-6">Star repositories to keep track of projects</p>
          <a href="/repositories" className="btn-coral">
            Explore Repositories
          </a>
        </div>
      ) : (
        <div className="space-y-4">
          {bookmarks.map((bookmark) => (
            <div key={bookmark._id} className="card-midnight">
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1">
                  <a href={bookmark.repoUrl} target="_blank" rel="noopener noreferrer" className="text-xl font-semibold text-coral hover:underline">
                    {bookmark.repoFullName}
                  </a>
                  <p className="text-muted mt-2 mb-4">{bookmark.description || 'No description'}</p>
                  <div className="flex items-center gap-4 text-sm text-muted">
                    {bookmark.language && <span>💻 {bookmark.language}</span>}
                    {bookmark.stars && <span>⭐ {bookmark.stars.toLocaleString()}</span>}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowIssueForm(showIssueForm === bookmark.repoId ? null : bookmark.repoId)}
                    className="px-4 py-2 rounded-lg text-primary font-medium border border-midnight hover:border-coral transition-colors"
                    style={{background: 'var(--bg-tertiary)'}}
                  >
                    {showIssueForm === bookmark.repoId ? 'Cancel' : 'Add Issue'}
                  </button>
                  <button
                    onClick={() => removeBookmark(bookmark.repoId)}
                    className="px-4 py-2 rounded-lg text-primary font-medium border border-midnight hover:border-coral transition-colors"
                    style={{background: 'var(--bg-tertiary)'}}
                  >
                    Remove
                  </button>
                </div>
              </div>
              {showIssueForm === bookmark.repoId && (
                <div className="mt-4 pt-4 border-t border-midnight">
                  <input
                    type="text"
                    placeholder="Issue title"
                    value={issueData.title}
                    onChange={(e) => setIssueData({ ...issueData, title: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-midnight focus:border-coral outline-none mb-3"
                    style={{background: 'var(--bg-tertiary)', color: 'var(--text-primary)'}}
                  />
                  <textarea
                    placeholder="Issue description"
                    value={issueData.body}
                    onChange={(e) => setIssueData({ ...issueData, body: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-midnight focus:border-coral outline-none mb-3 min-h-[100px]"
                    style={{background: 'var(--bg-tertiary)', color: 'var(--text-primary)'}}
                  />
                  <button
                    onClick={() => createIssue(bookmark.repoFullName)}
                    className="btn-coral"
                    disabled={!issueData.title}
                  >
                    Create Issue
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
