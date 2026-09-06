import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function AuthForm({ mode }: { mode: 'login' | 'register' }) {
  const { login, register } = useAuth()
  const navigate = useNavigate()
  const isLogin = mode === 'login'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await (isLogin ? login : register)(email, password)
      navigate('/')
    } catch (err: any) {
      setError(err?.response?.data?.error ?? (isLogin ? 'Login failed' : 'Registration failed'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center h-screen bg-[#0d1117]">
      <form onSubmit={onSubmit} className="flex flex-col items-center gap-7" autoComplete="off">
        <h1 className="text-[50px] font-bold tracking-[0.01em] text-center text-slate-100 whitespace-nowrap mb-2">
          Video <span className="text-sky-400">Intelligence</span>
        </h1>
        <div className="flex flex-col gap-[22px] w-[440px] p-8 bg-[#131c27] border border-[#1e2d3d] rounded-2xl shadow-[0_12px_40px_#00000059]">
          <div className="flex flex-col gap-[9px]">
            <label className="text-[11px] font-bold tracking-[0.09em] text-slate-400">EMAIL</label>
            <div className="flex items-center px-3.5 bg-[#0d1117] border border-[#1e2d3d] rounded-[10px] transition-colors focus-within:border-slate-100">
              <input
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 min-w-0 bg-transparent border-none text-slate-100 text-sm py-3.5 outline-none"
              />
            </div>
          </div>

          <div className="flex flex-col gap-[9px]">
            <label className="text-[11px] font-bold tracking-[0.09em] text-slate-400">
              {isLogin ? 'PASSWORD' : 'PASSWORD (MIN 8 CHARS)'}
            </label>
            <div className="flex items-center px-3.5 bg-[#0d1117] border border-[#1e2d3d] rounded-[10px] transition-colors focus-within:border-slate-100">
              <input
                type="password"
                autoComplete={isLogin ? 'current-password' : 'new-password'}
                required
                minLength={isLogin ? undefined : 8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="flex-1 min-w-0 bg-transparent border-none text-slate-100 text-sm py-3.5 outline-none"
              />
            </div>
          </div>

          {error && <div className="text-xs text-red-400 text-center">{error}</div>}

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-1 py-3.5 rounded-xl bg-slate-50 text-[#0d1117] text-[15px] font-semibold cursor-pointer transition-colors hover:not-disabled:bg-slate-200 disabled:opacity-60 disabled:cursor-default"
          >
            {isLogin ? (loading ? 'Signing in...' : 'Sign in') : (loading ? 'Creating...' : 'Create account')}
          </button>

          <p className="text-sm text-slate-400 text-center">
            {isLogin ? (
              <>No account? <Link to="/register" className="text-sky-400">Register</Link></>
            ) : (
              <>Already have an account? <Link to="/login" className="text-sky-400">Sign in</Link></>
            )}
          </p>
        </div>
      </form>
    </div>
  )
}
