import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await register(email, password)
      navigate('/')
    } catch (err: any) {
      setError(err?.response?.data?.error ?? 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <form onSubmit={onSubmit} className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-lg p-6 space-y-4">
        <h1 className="text-xl font-semibold text-slate-100">Create account</h1>
        {error && <p className="text-sm text-red-400">{error}</p>}
        <div>
          <label className="block text-sm text-slate-400 mb-1">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-slate-100"
          />
        </div>
        <div>
          <label className="block text-sm text-slate-400 mb-1">Password (min 8 chars)</label>
          <input
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-slate-100"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-violet-600 hover:bg-violet-500 disabled:opacity-50 rounded px-3 py-2 font-medium"
        >
          {loading ? 'Creating...' : 'Create account'}
        </button>
        <p className="text-sm text-slate-500 text-center">
          Already have an account? <Link to="/login" className="text-violet-400">Sign in</Link>
        </p>
      </form>
    </div>
  )
}
