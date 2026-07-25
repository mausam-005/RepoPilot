'use client'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import api from '@/lib/axios'
import SecurityPanel from '@/components/SecurityPanel'
import PullRequestsPanel from '@/components/PullRequestsPanel'
import DeploymentPanel from '@/components/DeploymentPanel'
import CommitsPanel from '@/components/CommitsPanel'
import ContributorsPanel from '@/components/ContributorsPanel'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

export default function RepoDetail() {
  const { owner, repo } = useParams()
  const router = useRouter()
  
  const [repoData, setRepoData] = useState(null)
  const [readme, setReadme] = useState('')
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview') // overview, security, pulls, deployments, commits, contributors

  useEffect(() => {
    fetchRepoData()
  }, [owner, repo])

  const fetchRepoData = async () => {
    try {
      const token = localStorage.getItem('token')
      const headers = token ? { Authorization: `Bearer ${token}` } : {}
      
      const { data } = await api.get(`/repos/${owner}/${repo}`, { headers })
      setRepoData(data)
      
      // Fetch README content natively via GitHub API for the overview
      const readmeRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/readme`, {
        headers: {
          'Accept': 'application/vnd.github.v3.raw'
        }
      })
      if (readmeRes.ok) {
        setReadme(await readmeRes.text())
      }
    } catch (error) {
      console.error('Failed to fetch repo details:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-coral"></div>
      </div>
    )
  }

  if (!repoData) {
    return (
      <div className="container mx-auto px-4 py-12 flex justify-center">
        <div className="w-full max-w-7xl text-center">
          <h1 className="text-2xl font-bold text-primary mb-4">Repository Not Found</h1>
          <button onClick={() => router.back()} className="btn-dark">Go Back</button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 sm:px-8 md:px-12 py-8 sm:py-12 flex justify-center">
      <div className="w-full max-w-7xl">
        {/* Header */}
        <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <button onClick={() => router.back()} className="text-muted hover:text-coral transition-colors flex items-center gap-1 text-sm font-semibold">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                Back
              </button>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-primary flex items-center gap-3 break-all">
              <svg className="w-8 h-8 text-muted hidden sm:block" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" /></svg>
              {owner} / <span className="text-coral">{repo}</span>
            </h1>
            <p className="text-muted mt-2 max-w-2xl">{repoData.description}</p>
          </div>
          
          <div className="flex gap-3">
            <a href={repoData.html_url} target="_blank" rel="noopener noreferrer" className="btn-dark flex items-center gap-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" /></svg>
              GitHub
            </a>
          </div>
        </div>

        {/* Stats Strip */}
        <div className="flex flex-wrap items-center gap-4 sm:gap-8 mb-8 pb-8 border-b border-midnight">
          <div className="flex items-center gap-2 text-primary">
            <svg className="w-5 h-5 text-coral" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
            <span className="font-bold text-lg">{repoData.stargazers_count?.toLocaleString()}</span>
            <span className="text-muted text-sm uppercase tracking-wider">Stars</span>
          </div>
          <div className="flex items-center gap-2 text-primary">
            <svg className="w-5 h-5 text-coral" fill="currentColor" viewBox="0 0 16 16"><path fillRule="evenodd" d="M5 3.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm0 2.122a2.25 2.25 0 10-1.5 0v.878A2.25 2.25 0 005.75 8.5h1.5v2.128a2.251 2.251 0 101.5 0V8.5h1.5a2.25 2.25 0 002.25-2.25v-.878a2.25 2.25 0 10-1.5 0v.878a.75.75 0 01-.75.75h-4.5A.75.75 0 015 6.25v-.878zm3.75 7.378a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm3-8.75a.75.75 0 100-1.5.75.75 0 000 1.5z"/></svg>
            <span className="font-bold text-lg">{repoData.forks_count?.toLocaleString()}</span>
            <span className="text-muted text-sm uppercase tracking-wider">Forks</span>
          </div>
          {repoData.language && (
            <div className="flex items-center gap-2 text-primary">
              <span className="w-3 h-3 rounded-full bg-coral inline-block"></span>
              <span className="font-bold text-lg">{repoData.language}</span>
            </div>
          )}
        </div>

        {/* Tab Navigation (Full Width) */}
        <div className="flex border-b border-midnight mb-6 overflow-x-auto hide-scrollbar">
          <button 
            onClick={() => setActiveTab('overview')}
            className={`px-6 py-3 font-semibold text-sm transition-colors whitespace-nowrap border-b-2 ${activeTab === 'overview' ? 'border-coral text-coral' : 'border-transparent text-muted hover:text-primary'}`}
          >
            Overview
          </button>
          <button 
            onClick={() => setActiveTab('security')}
            className={`px-6 py-3 font-semibold text-sm transition-colors whitespace-nowrap border-b-2 flex items-center gap-2 ${activeTab === 'security' ? 'border-coral text-coral' : 'border-transparent text-muted hover:text-primary'}`}
          >
            Security Scan
          </button>
          <button 
            onClick={() => setActiveTab('commits')}
            className={`px-6 py-3 font-semibold text-sm transition-colors whitespace-nowrap border-b-2 flex items-center gap-2 ${activeTab === 'commits' ? 'border-coral text-coral' : 'border-transparent text-muted hover:text-primary'}`}
          >
            Commits
          </button>
          <button 
            onClick={() => setActiveTab('pulls')}
            className={`px-6 py-3 font-semibold text-sm transition-colors whitespace-nowrap border-b-2 flex items-center gap-2 ${activeTab === 'pulls' ? 'border-coral text-coral' : 'border-transparent text-muted hover:text-primary'}`}
          >
            Pull Requests
          </button>
          <button 
            onClick={() => setActiveTab('deployments')}
            className={`px-6 py-3 font-semibold text-sm transition-colors whitespace-nowrap border-b-2 flex items-center gap-2 ${activeTab === 'deployments' ? 'border-coral text-coral' : 'border-transparent text-muted hover:text-primary'}`}
          >
            CI/CD & Deployments
          </button>
          <button 
            onClick={() => setActiveTab('contributors')}
            className={`px-6 py-3 font-semibold text-sm transition-colors whitespace-nowrap border-b-2 flex items-center gap-2 ${activeTab === 'contributors' ? 'border-coral text-coral' : 'border-transparent text-muted hover:text-primary'}`}
          >
            Contributors
          </button>
        </div>

        {/* Main Content Area (Full Width) */}
        <div className="w-full">
          <div className="min-w-0">
            {/* Tab Content */}
            <div className={activeTab === 'overview' ? 'block' : 'hidden'}>
              <div className="card-midnight p-6 sm:p-8">
                {readme ? (
                  <div>
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-4 border-b border-midnight">
                      <h3 className="text-xl font-semibold text-primary flex items-center gap-2">
                        <svg className="w-5 h-5 text-coral" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                        README.md
                      </h3>
                      <button 
                        onClick={() => window.dispatchEvent(new CustomEvent('trigger-ai-chat', { detail: 'Please summarize the README for this repository.' }))}
                        className="btn-coral flex items-center gap-2 text-sm"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                        Summarize with AI
                      </button>
                    </div>
                    <div className="prose prose-sm prose-invert max-w-none text-primary prose-h1:text-2xl prose-h1:font-bold prose-h2:text-xl prose-h2:font-semibold prose-h3:text-lg prose-a:text-coral prose-a:no-underline hover:prose-a:underline prose-pre:bg-tertiary prose-pre:border prose-pre:border-midnight prose-img:rounded-xl">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>{readme}</ReactMarkdown>
                    </div>
                  </div>
                ) : (
                  <p className="text-muted">No README available for this repository.</p>
                )}
              </div>
            </div>

            <div className={activeTab === 'security' ? 'block' : 'hidden'}>
              <SecurityPanel owner={owner} repo={repo} />
            </div>

            <div className={activeTab === 'pulls' ? 'block' : 'hidden'}>
              <PullRequestsPanel owner={owner} repo={repo} />
            </div>

            <div className={activeTab === 'deployments' ? 'block' : 'hidden'}>
              <DeploymentPanel owner={owner} repo={repo} htmlUrl={repoData.html_url} />
            </div>

            <div className={activeTab === 'commits' ? 'block' : 'hidden'}>
              <CommitsPanel owner={owner} repo={repo} />
            </div>

            <div className={activeTab === 'contributors' ? 'block' : 'hidden'}>
              <ContributorsPanel owner={owner} repo={repo} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
