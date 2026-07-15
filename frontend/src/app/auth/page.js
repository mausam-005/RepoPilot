"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/axios";

const adjectives = ["Cool", "Super", "Happy", "Smart", "Brave", "Swift", "Cosmic", "Neon", "Cyber", "Ninja"];
const nouns = ["Coder", "Pilot", "Dev", "Hacker", "Fox", "Bear", "Wolf", "Owl", "Eagle", "Panda"];

export default function Auth() {
  const [isLogin, setIsLogin] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  
  useEffect(() => {
    // Wake up the backend server if it's sleeping (Render free tier)
    api.get("/health").catch(() => {
      // Ignore errors, we just want to trigger a wake-up
    });
  }, []);

  const handleGithubOAuth = () => {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8001/api';
    window.location.href = `${baseUrl}/auth/github`;
  };

  const suggestUsername = () => {
    if (name.trim()) {
      const num = Math.floor(Math.random() * 10000);
      const cleanName = name.split(' ')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
      setUsername(`${cleanName}${num}`);
    } else {
      const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
      const noun = nouns[Math.floor(Math.random() * nouns.length)];
      const num = Math.floor(Math.random() * 1000);
      setUsername(`${adj}${noun}${num}`);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const endpoint = isLogin ? "/auth/login" : "/auth/signup";
      const payload = isLogin ? { identifier: email, password } : { email, password, name, username };
      const response = await api.post(endpoint, payload);
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

          {!isLogin && (
            <>
              <div className="relative">
                <svg className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted" fill="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <input
                  type="text"
                  placeholder="Full Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onBlur={() => { if (!username) suggestUsername(); }}
                  className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-3 sm:py-4 border border-midnight rounded-lg focus:border-coral focus:outline-none transition-colors text-primary text-sm sm:text-base"
                  style={{background: 'var(--bg-tertiary)'}}
                  required
                />
              </div>

              <div className="relative flex items-center">
                <div className="relative flex-grow">
                  <svg className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted" fill="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <input
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-3 sm:py-4 border border-midnight rounded-lg focus:border-coral focus:outline-none transition-colors text-primary text-sm sm:text-base"
                    style={{background: 'var(--bg-tertiary)'}}
                    required
                  />
                </div>
                <button
                  type="button"
                  onClick={suggestUsername}
                  className="ml-2 p-3 sm:p-4 rounded-lg bg-midnight text-coral hover:bg-opacity-80 transition-colors border border-midnight focus:outline-none"
                  title="Suggest random username"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </button>
              </div>
            </>
          )}

          <div className="relative">
            <svg className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
              <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
            </svg>
            <input
              type={isLogin ? "text" : "email"}
              placeholder={isLogin ? "Email or Username" : "Email address"}
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

        <div className="mt-6 flex items-center">
          <div className="flex-grow border-t border-midnight"></div>
          <span className="flex-shrink-0 mx-4 text-muted text-sm">or</span>
          <div className="flex-grow border-t border-midnight"></div>
        </div>

        <div className="mt-6">
          <button 
            onClick={handleGithubOAuth} 
            className="w-full flex items-center justify-center gap-3 px-4 py-3 sm:py-4 rounded-lg bg-gray-800 hover:bg-gray-700 text-white font-medium transition-colors border border-gray-700 text-sm sm:text-base"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
            </svg>
            Continue with GitHub
          </button>
        </div>

        <div className="mt-6 sm:mt-8 text-center">
          <p className="text-sm sm:text-base text-muted">
            {isLogin ? "Don't have an account?" : "Already have an account?"}
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setError("");
                setEmail("");
                setPassword("");
                setName("");
                setUsername("");
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

