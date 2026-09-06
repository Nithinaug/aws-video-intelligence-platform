import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { listVideos, type Video } from '../api/client'
import { useAuth } from '../context/AuthContext'
import VideoCard from '../components/VideoCard'

export default function Dashboard() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [videos, setVideos] = useState<Video[]>([])
  const [loading, setLoading] = useState(true)

  async function refresh() {
    const v = await listVideos()
    setVideos(v)
    setLoading(false)
  }

  useEffect(() => {
    refresh()
    const interval = setInterval(refresh, 5000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen max-w-5xl mx-auto px-4 py-8 bg-[#0d1117]">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-[0.01em] text-slate-100">
            Video <span className="text-sky-400">Intelligence</span>
          </h1>
          <p className="text-sm text-slate-400">{user?.email}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => navigate('/upload')}
            className="px-4 py-2 rounded-xl bg-slate-50 text-[#0d1117] text-sm font-semibold transition-colors hover:bg-slate-200"
          >
            Upload video
          </button>
          <button
            onClick={logout}
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-[#1a2233] border border-[#334155] text-slate-100 text-sm font-medium transition-colors hover:border-red-400/40 hover:bg-[#2a1a1f] hover:text-red-400"
          >
            Log out
          </button>
        </div>
      </div>

      {loading ? (
        <p className="text-slate-400">Loading...</p>
      ) : videos.length === 0 ? (
        <div className="text-center py-24 text-slate-400">
          <p>No videos yet.</p>
          <button onClick={() => navigate('/upload')} className="text-sky-400 mt-2">
            Upload your first video
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {videos.map((v) => (
            <VideoCard key={v.id} video={v} />
          ))}
        </div>
      )}
    </div>
  )
}
