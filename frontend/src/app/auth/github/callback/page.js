'use client'
import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import api from '@/lib/axios'

function CallbackHandler() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState('Authenticating with GitHub...')

  useEffect(() => {
    const code = searchParams.get('code')
    if (!code) {
      setStatus('No authorization code provided.')
      setTimeout(() => router.push('/auth'), 2000)
      return
    }

    const exchangeCode = async () => {
      try {
        const { data } = await api.post('/auth/github/callback', { code })
        
        if (data.token) localStorage.setItem('token', data.token)
        if (data.refreshToken) localStorage.setItem('refreshToken', data.refreshToken)
        
        window.dispatchEvent(new Event('authChange'))
        
        setStatus('Authentication successful! Redirecting...')
        setTimeout(() => router.push('/dashboard'), 1500)
      } catch (error) {
        console.error('GitHub authentication error:', error)
        setStatus('Failed to authenticate with GitHub.')
        setTimeout(() => router.push('/auth'), 2500)
      }
    }

    exchangeCode()
  }, [searchParams, router])

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="card-midnight p-8 text-center max-w-md w-full">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-coral mb-6"></div>
        <h2 className="text-xl sm:text-2xl font-bold text-primary">{status}</h2>
      </div>
    </div>
  )
}

export default function GithubCallback() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-coral"></div>
      </div>
    }>
      <CallbackHandler />
    </Suspense>
  )
}
