"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/axios";

export default function Auth() {
  const [isLogin, setIsLogin] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const endpoint = isLogin ? "/auth/login" : "/auth/signup";
      const response = await api.post(endpoint, { email, password });
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("refreshToken", response.data.refreshToken);

      window.dispatchEvent(new Event("authChange"));
      const redirectUrl = isLogin ? "/dashboard" : "/dashboard";
      router.push(redirectUrl);
    } catch (err) {
      setError(
        err.response?.data?.message || `${isLogin ? "Login" : "Signup"} failed`
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 sm:px-8 md:px-12 py-8">
      <div className="card-midnight w-full max-w-md animate-fade-up">
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-lg flex items-center justify-center glow-coral" style={{background: 'var(--accent-coral)'}}>
            {isLogin ? (
              <svg className="w-8 h-8 text-primary" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-8 h-8 text-primary" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
              </svg>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-primary mb-2">
            {isLogin ? "Welcome Back" : "Join RepoPilot"}
          </h1>
          <p className="text-sm sm:text-base text-muted">
            {isLogin
              ? "Sign in to your account"
              : "Create your account to get started"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          {error && (
            <div className="border border-coral px-3 sm:px-4 py-2 sm:py-3 rounded-lg text-xs sm:text-sm text-coral" style={{background: 'rgba(255, 107, 107, 0.1)'}}>
              {error}
            </div>
          )}

          <div className="relative">
            <svg className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
              <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
            </svg>
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-3 sm:py-4 border border-midnight rounded-lg focus:border-coral focus:outline-none transition-colors text-primary text-sm sm:text-base"
              style={{background: 'var(--bg-tertiary)'}}
              required
            />
          </div>

          <div className="relative">
            <svg className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
            </svg>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-3 sm:py-4 border border-midnight rounded-lg focus:border-coral focus:outline-none transition-colors text-primary text-sm sm:text-base"
              style={{background: 'var(--bg-tertiary)'}}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-coral py-3 sm:py-4 text-base sm:text-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading
              ? "Please wait..."
              : isLogin
              ? "Sign In"
              : "Create Account"}
          </button>
        </form>

        <div className="mt-6 sm:mt-8 text-center">
          <p className="text-sm sm:text-base text-muted">
            {isLogin ? "Don't have an account?" : "Already have an account?"}
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setError("");
                setEmail("");
                setPassword("");
              }}
              className="text-coral hover:underline ml-2 font-medium transition-colors"
            >
              {isLogin ? "Sign up" : "Sign in"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
