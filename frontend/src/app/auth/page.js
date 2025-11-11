'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import api from '@/lib/axios'

export default function Auth() {
  const [isLogin, setIsLogin] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    
    try {
      const endpoint = isLogin ? '/auth/login' : '/auth/signup'
      const response = await api.post(endpoint, { email, password })
      localStorage.setItem('token', response.data.token)
      // Trigger auth change event
      window.dispatchEvent(new Event('authChange'))
      const redirectUrl = isLogin ? '/welcome' : '/welcome?new=true'
      router.push(redirectUrl)
    } catch (err) {
      setError(err.response?.data?.message || `${isLogin ? 'Login' : 'Signup'} failed`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="bg-slate-800/50 border border-slate-700 p-8 rounded-lg w-full max-w-md animate-slide-up">
        <div className="text-center mb-8">
          <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center text-2xl ${
            isLogin ? 'bg-blue-600/20 border border-blue-500/30' : 'bg-green-600/20 border border-green-500/30'
          }`}>
            {isLogin ? '🔑' : '🚀'}
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            {isLogin ? 'Welcome Back' : 'Join RepoPilot'}
          </h1>
          <p className="text-slate-400">
            {isLogin ? 'Sign in to your account' : 'Create your account to get started'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}
          
          <div>
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-4 bg-slate-900 border border-slate-600 rounded-lg focus:border-blue-500 focus:outline-none transition-colors text-white"
              required
            />
          </div>
          
          <div>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-4 bg-slate-900 border border-slate-600 rounded-lg focus:border-blue-500 focus:outline-none transition-colors text-white"
              required
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className={`w-full p-4 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
              isLogin ? 'bg-blue-600 hover:bg-blue-700' : 'bg-green-600 hover:bg-green-700'
            }`}
          >
            {loading ? 'Please wait...' : (isLogin ? 'Sign In' : 'Create Account')}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-slate-400">
            {isLogin ? "Don't have an account?" : 'Already have an account?'}
            <button
              onClick={() => {
                setIsLogin(!isLogin)
                setError('')
                setEmail('')
                setPassword('')
              }}
              className="text-blue-400 hover:text-blue-300 ml-2 font-medium transition-colors"
            >
              {isLogin ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}