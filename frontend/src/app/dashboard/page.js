'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import api from '@/lib/axios'
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip,
  LineChart, Line, XAxis, YAxis, CartesianGrid, Area, AreaChart
} from 'recharts'
import { io } from 'socket.io-client'

export default function Dashboard() {
  const router = useRouter()
  const [stats, setStats] = useState({ bookmarks: 0, issues: 0 })
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)
  const [liveEvents, setLiveEvents] = useState([])

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/auth')
      return
    }
    fetchStats()

    // Socket.io Connection for Live Webhooks
    const socketUrl = (process.env.NEXT_PUBLIC_API_BASE || 'https://repopilot-backend.onrender.com/api').replace('/api', '')
    const socket = io(socketUrl, {
      auth: { token }
    })

    socket.on('github_event', (event) => {
      // Prepend the new event to the live feed (keep last 20)
      setLiveEvents(prev => [event, ...prev].slice(0, 20))
    })

    return () => {
      socket.disconnect()
    }
  }, [])

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token')
      const [bookmarksRes, issuesRes, analyticsRes] = await Promise.all([
        api.get('/bookmarks', { headers: { Authorization: `Bearer ${token}` } }),
        api.get('/myissues', { headers: { Authorization: `Bearer ${token}` } }),
        api.get('/analytics', { headers: { Authorization: `Bearer ${token}` } })
      ])
      setStats({
        bookmarks: bookmarksRes.data.length,
        issues: issuesRes.data.length
      })
      setAnalytics(analyticsRes.data)
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const COLORS = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24', '#ff9ff3', '#54a0ff']

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-coral"></div>
      </div>
    )
  }

  const isNewUser = stats.bookmarks === 0 && stats.issues === 0

  return (
    <div className="container mx-auto my-auto px-4 sm:px-8 md:px-12 py-8 sm:py-12 md:py-16 flex justify-center">
      <div className="w-full max-w-7xl">
      <div className="mb-8 sm:mb-12">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-primary mb-3 flex items-center gap-3">
          {isNewUser && (
            <svg className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 text-coral" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
            </svg>
          )}
          {isNewUser ? 'Welcome to RepoPilot!' : 'Dashboard'}
        </h1>
        <p className="text-muted text-base sm:text-lg md:text-xl">{isNewUser ? 'Let\'s get started with exploring repositories!' : 'Welcome back! Here\'s your activity overview'}</p>
      </div>



      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8 sm:mb-12">
        <Link href="/bookmarks" className="group">
          <div className="card-midnight p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-lg flex items-center justify-center glow-coral" style={{background: 'rgba(255, 107, 107, 0.1)'}}>
                <svg className="w-6 h-6 text-coral" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" /></svg>
              </div>
            </div>
            <h3 className="text-3xl font-bold text-coral mb-1">{stats.bookmarks}</h3>
            <p className="text-muted text-sm font-semibold uppercase tracking-wider">Bookmarked Repos</p>
          </div>
        </Link>

        <Link href="/myissues" className="group">
          <div className="card-midnight p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-lg flex items-center justify-center glow-coral" style={{background: 'rgba(136, 136, 136, 0.1)'}}>
                <svg className="w-6 h-6 text-coral" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
            </div>
            <h3 className="text-3xl font-bold text-coral mb-1">{stats.issues}</h3>
            <p className="text-muted text-sm font-semibold uppercase tracking-wider">Authored Issues</p>
          </div>
        </Link>

        <div className="card-midnight p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-lg flex items-center justify-center glow-coral" style={{background: 'rgba(255, 204, 0, 0.1)'}}>
              <svg className="w-6 h-6 text-yellow-500" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
            </div>
          </div>
          <h3 className="text-3xl font-bold text-yellow-500 mb-1">{analytics?.metrics?.totalStars || 0}</h3>
          <p className="text-muted text-sm font-semibold uppercase tracking-wider">Combined Stars</p>
        </div>

        <div className="card-midnight p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-lg flex items-center justify-center glow-coral" style={{background: 'rgba(78, 205, 196, 0.1)'}}>
              <svg className="w-6 h-6 text-[#4ecdc4]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" /></svg>
            </div>
          </div>
          <h3 className="text-3xl font-bold text-[#4ecdc4] mb-1">{analytics?.metrics?.healthScore || 0}/10</h3>
          <p className="text-muted text-sm font-semibold uppercase tracking-wider">Avg Repo Health</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-8">
        <div className="card-midnight p-6">
          <h2 className="text-xl font-bold text-primary mb-6">Language Distribution</h2>
          {analytics?.languageData && analytics.languageData.length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={analytics.languageData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {analytics.languageData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip 
                    contentStyle={{ backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-midnight)', borderRadius: '8px' }}
                    itemStyle={{ color: 'var(--text-primary)' }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap justify-center gap-4 mt-4">
                {analytics.languageData.map((entry, index) => (
                  <div key={entry.name} className="flex items-center gap-2 text-sm text-muted">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                    {entry.name} ({entry.value})
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="h-64 flex flex-col items-center justify-center text-muted">
              <p>Not enough data to display.</p>
              <p className="text-sm mt-2">Bookmark some repositories to generate insights!</p>
            </div>
          )}
        </div>

        <div className="card-midnight p-6">
          <h2 className="text-xl font-bold text-primary mb-6">30-Day Activity Velocity</h2>
          {analytics?.activityTimeline && analytics.activityTimeline.length > 0 ? (
            <div className="h-64 mt-8">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={analytics.activityTimeline} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorActivity" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ff6b6b" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#ff6b6b" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" stroke="#4b5563" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#4b5563" fontSize={12} tickLine={false} axisLine={false} />
                  <RechartsTooltip 
                    contentStyle={{ backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-midnight)', borderRadius: '8px', color: 'var(--text-primary)' }}
                  />
                  <Area type="monotone" dataKey="activity" stroke="#ff6b6b" strokeWidth={3} fillOpacity={1} fill="url(#colorActivity)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 flex flex-col items-center justify-center text-muted">
              <p>No recent activity detected.</p>
            </div>
          )}
        </div>
      </div>

      {/* Live Activity Feed */}
      <div className="card-midnight p-6 mb-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-coral opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-coral"></span>
          </div>
          <h2 className="text-xl font-bold text-primary">Live Activity Feed</h2>
        </div>
        
        {liveEvents.length > 0 ? (
          <div className="space-y-4 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
            {liveEvents.map((ev, idx) => (
              <div key={idx} className="flex items-start gap-4 p-4 rounded-xl border border-midnight" style={{background: 'var(--bg-tertiary)'}}>
                <img src={ev.actorAvatar} alt={ev.actor} className="w-10 h-10 rounded-full shadow-md" />
                <div>
                  <p className="text-primary font-medium">
                    <span className="font-bold text-coral">{ev.actor}</span> triggered <span className="font-mono text-sm bg-secondary px-1 py-0.5 rounded text-white">{ev.type}</span>
                  </p>
                  <p className="text-sm text-muted mt-1">on <a href={`https://github.com/${ev.repo}`} target="_blank" rel="noopener noreferrer" className="text-[#4ecdc4] hover:underline">{ev.repo}</a></p>
                  <p className="text-xs text-muted mt-2 opacity-50">{new Date(ev.createdAt).toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="h-40 flex flex-col items-center justify-center text-muted border border-dashed border-midnight rounded-xl" style={{background: 'var(--bg-tertiary)'}}>
            <svg className="w-8 h-8 mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            <p>Waiting for live events...</p>
            <p className="text-xs mt-1">Listening to GitHub webhooks via WebSocket</p>
          </div>
        )}
      </div>

      </div>
    </div>
  )
}
