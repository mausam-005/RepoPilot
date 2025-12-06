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
    <div className="min-h-screen flex items-center justify-center px-12">
      <div className="card-midnight w-full max-w-md animate-fade-up">
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-lg flex items-center justify-center text-2xl glow-coral" style={{background: 'var(--accent-coral)'}}>
            {isLogin ? "🔑" : "🚀"}
          </div>
          <h1 className="text-3xl font-bold text-primary mb-2">
            {isLogin ? "Welcome Back" : "Join RepoPilot"}
          </h1>
          <p className="text-muted">
            {isLogin
              ? "Sign in to your account"
              : "Create your account to get started"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="border border-coral px-4 py-3 rounded-lg text-sm text-coral" style={{background: 'rgba(255, 107, 107, 0.1)'}}>
              {error}
            </div>
          )}

          <div>
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-4 border border-midnight rounded-lg focus:border-coral focus:outline-none transition-colors text-primary"
              style={{background: 'var(--bg-tertiary)'}}
              required
            />
          </div>

          <div>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-4 border border-midnight rounded-lg focus:border-coral focus:outline-none transition-colors text-primary"
              style={{background: 'var(--bg-tertiary)'}}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-coral p-4 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading
              ? "Please wait..."
              : isLogin
              ? "Sign In"
              : "Create Account"}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-muted">
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
