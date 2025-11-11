'use client'
import { useState } from 'react'
import Link from 'next/link'

export default function Bookmarks() {
  const [bookmarks, setBookmarks] = useState([
    { id: 1, type: 'repository', name: 'awesome-project', url: 'https://github.com/user/awesome-project', description: 'A fantastic open source project', tags: ['javascript', 'react'] },
    { id: 2, type: 'issue', name: 'Bug: Login not working', url: 'https://github.com/user/project/issues/123', description: 'Critical login issue needs immediate attention', tags: ['bug', 'critical'] },
    { id: 3, type: 'repository', name: 'ml-algorithms', url: 'https://github.com/user/ml-algorithms', description: 'Machine learning algorithms implementation', tags: ['python', 'ai'] }
  ])

  return (
    <div className="container mx-auto px-4 py-8 animate-fade-in">
      <div className="bg-slate-800/50 border border-slate-700 p-6 md:p-8 rounded-lg">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
              Bookmarks
            </h1>
            <p className="text-slate-400">Your saved repositories, issues, and resources</p>
          </div>
          <div className="text-slate-400 text-sm">
            {bookmarks.length} items
          </div>
        </div>
        
        <div className="space-y-4">
          {bookmarks.map((bookmark) => (
            <div key={bookmark.id} className="bg-slate-900/50 border border-slate-600 p-4 md:p-6 rounded-lg hover:bg-slate-900 transition-colors">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-3 mb-3">
                    <span className="px-2 py-1 rounded text-xs font-medium bg-blue-600/20 text-blue-400">
                      {bookmark.type}
                    </span>
                    <h3 className="text-lg md:text-xl font-semibold text-white">
                      {bookmark.name}
                    </h3>
                  </div>
                  <p className="text-slate-300 mb-4 text-sm md:text-base">{bookmark.description}</p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {bookmark.tags.map((tag) => (
                      <span key={tag} className="px-2 py-1 bg-slate-700 text-slate-300 rounded text-xs">
                        #{tag}
                      </span>
                    ))}
                  </div>
                  <a 
                    href={bookmark.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300 text-sm transition-colors break-all"
                  >
                    {bookmark.url}
                  </a>
                </div>
                <button className="text-slate-400 hover:text-red-400 transition-colors p-2 self-start">
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
        
        {bookmarks.length === 0 && (
          <div className="text-center py-16">
            <div className="text-4xl md:text-6xl mb-4">📚</div>
            <h3 className="text-xl font-semibold text-white mb-2">No bookmarks yet</h3>
            <p className="text-slate-400 mb-6">Start bookmarking repositories and issues to see them here</p>
            <Link href="/repositories" className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg font-medium transition-colors inline-block">
              Browse Repositories
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}