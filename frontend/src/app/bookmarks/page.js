'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import api from '@/lib/axios'

export default function Bookmarks() {
  const [bookmarks, setBookmarks] = useState([])
  const [loading, setLoading] = useState(true)
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-6 py-12">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">Your Bookmarks</h1>
          <p className="text-slate-400">{bookmarks.length} starred repositories</p>
        </div>
      </div>

      {bookmarks.length === 0 ? (
        <div className="bg-slate-800 border border-slate-700 p-16 rounded-lg text-center">
          <h3 className="text-2xl font-semibold text-white mb-3">No bookmarks yet</h3>
          <p className="text-slate-400 mb-6">Star repositories to keep track of projects</p>
          <a href="/repositories" className="inline-block px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-medium">
            Explore Repositories
          </a>
        </div>
      ) : (
        <div className="space-y-4">
          {bookmarks.map((bookmark) => (
            <div key={bookmark._id} className="bg-slate-800 border border-slate-700 p-6 rounded-lg hover:border-slate-600 transition-colors">
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1">
                  <a href={bookmark.repoUrl} target="_blank" rel="noopener noreferrer" className="text-xl font-semibold text-blue-400 hover:underline">
                    {bookmark.repoFullName}
                  </a>
                  <p className="text-slate-400 mt-2 mb-4">{bookmark.description || 'No description'}</p>
                  <div className="flex items-center gap-4 text-sm text-slate-500">
                    {bookmark.language && <span>💻 {bookmark.language}</span>}
                    {bookmark.stars && <span>⭐ {bookmark.stars.toLocaleString()}</span>}
                  </div>
                </div>
                <button
                  onClick={() => removeBookmark(bookmark.repoId)}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg text-white font-medium"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
