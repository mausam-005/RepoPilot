'use client'
import { useState, useEffect } from 'react'
import api from '@/lib/axios'

export default function SecurityPanel({ owner, repo }) {
  const [report, setReport] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const runScan = async () => {
    setLoading(true)
    setError(null)
    try {
      const token = localStorage.getItem('token')
      const headers = token ? { Authorization: `Bearer ${token}` } : {}
      
      const { data } = await api.post('/ai/security-scan', { owner, repo }, { headers })
      setReport(data)
    } catch (err) {
      console.error('Security scan error:', err)
      setError('Failed to complete security scan. The repository might be too large or the API encountered an error.')
    } finally {
      setLoading(false)
    }
  }

  if (!report && !loading && !error) {
    return (
      <div className="card-midnight p-8 text-center border border-midnight">
        <div className="w-16 h-16 rounded-full bg-tertiary flex items-center justify-center mx-auto mb-4 border border-midnight">
          <svg className="w-8 h-8 text-coral" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-primary mb-2">AI Security Audit</h3>
        <p className="text-muted mb-6 max-w-md mx-auto">
          Run an instant, AI-powered security scan on the repository's dependencies and security policies to identify potential vulnerabilities.
        </p>
        <button onClick={runScan} className="btn-coral">
          Run Security Scan
        </button>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="card-midnight p-12 text-center border border-midnight">
        <div className="inline-block relative w-16 h-16 mb-4">
          <div className="absolute inset-0 rounded-full border-4 border-midnight"></div>
          <div className="absolute inset-0 rounded-full border-4 border-coral border-t-transparent animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center text-coral">
            <svg className="w-6 h-6 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
        <h3 className="text-lg font-bold text-primary mb-2">Scanning Repository...</h3>
        <p className="text-muted text-sm animate-pulse">Analyzing dependencies and security policies</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="card-midnight p-6 border border-red-500/30 bg-red-500/5">
        <div className="flex items-start gap-3 text-red-400">
          <svg className="w-6 h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <h4 className="font-semibold mb-1">Scan Failed</h4>
            <p className="text-sm opacity-90">{error}</p>
            <button onClick={runScan} className="mt-4 text-xs font-semibold px-3 py-1.5 rounded-lg border border-red-500/50 hover:bg-red-500/20 transition-colors">
              Try Again
            </button>
          </div>
        </div>
      </div>
    )
  }

  const getRiskColor = (risk) => {
    switch (risk?.toLowerCase()) {
      case 'high': return 'text-red-500 bg-red-500/10 border-red-500/20'
      case 'medium': return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20'
      case 'low': return 'text-green-500 bg-green-500/10 border-green-500/20'
      default: return 'text-gray-400 bg-gray-500/10 border-gray-500/20'
    }
  }

  return (
    <div className="space-y-6">
      <div className="card-midnight p-6 border border-midnight flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-coral/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
        <div className="relative z-10 flex-1">
          <div className="flex items-center justify-between sm:justify-start gap-4 mb-3">
            <h2 className="text-2xl font-bold text-primary">Security Report</h2>
            <button onClick={runScan} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-midnight bg-black text-xs font-semibold text-muted hover:text-coral hover:border-coral/50 transition-all shadow-sm">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Re-run Scan
            </button>
          </div>
          <p className="text-sm text-muted max-w-lg leading-relaxed">{report.summary}</p>
        </div>
        <div className={`relative z-10 px-5 py-3 rounded-2xl border shadow-lg flex flex-col items-center backdrop-blur-md ${getRiskColor(report.riskScore)}`}>
          <div className="absolute inset-0 rounded-2xl bg-current opacity-5 mix-blend-overlay"></div>
          <span className="text-[10px] font-bold uppercase tracking-[0.1em] opacity-90 mb-0.5">Overall Risk</span>
          <span className="text-2xl font-black tracking-tight leading-none drop-shadow-md">{report.riskScore}</span>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="font-semibold text-primary px-1">Detailed Findings ({report.findings?.length || 0})</h3>
        
        {report.findings?.length === 0 ? (
          <div className="card-midnight p-6 text-center text-muted">
            No specific vulnerabilities found in the analyzed files.
          </div>
        ) : (
          report.findings?.map((finding, idx) => (
            <div key={idx} className="card-midnight p-5 border border-midnight">
              <div className="flex items-start gap-4">
                <span className={`px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider border ${getRiskColor(finding.severity)}`}>
                  {finding.severity}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-primary font-medium mb-3 text-base">{finding.description}</p>
                  
                  <div className="grid grid-cols-1 gap-4">
                    <div className="bg-coral/5 rounded-xl p-4 text-sm border border-coral/20 shadow-sm">
                      <div className="flex items-center gap-2 mb-2 text-coral">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        <span className="font-bold text-xs uppercase tracking-wider">Recommendation</span>
                      </div>
                      <span className="text-primary leading-relaxed">{finding.recommendation}</span>
                    </div>

                    {finding.howToFix && (
                      <div className="rounded-xl p-4 text-sm border border-midnight shadow-sm" style={{background: 'var(--bg-secondary)'}}>
                        <div className="flex items-center gap-2 mb-3 text-primary">
                          <svg className="w-4 h-4 text-coral" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>
                          <span className="font-bold text-xs uppercase tracking-wider">How to Fix</span>
                        </div>
                        <div className="text-muted font-mono text-[13px] leading-relaxed whitespace-pre-wrap p-3 rounded-lg border border-midnight bg-black/40">{finding.howToFix}</div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
