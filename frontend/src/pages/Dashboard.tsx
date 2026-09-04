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
    <div className="min-h-screen max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-slate-100">Video Intelligence</h1>
          <p className="text-sm text-slate-500">{user?.email}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => navigate('/upload')}
            className="bg-violet-600 hover:bg-violet-500 rounded px-4 py-2 font-medium"
          >
            Upload video
          </button>
          <button onClick={logout} className="border border-slate-700 rounded px-4 py-2 text-slate-300">
            Log out
          </button>
        </div>
      </div>

      {loading ? (
        <p className="text-slate-500">Loading...</p>
      ) : videos.length === 0 ? (
        <div className="text-center py-24 text-slate-500">
          <p>No videos yet.</p>
          <button onClick={() => navigate('/upload')} className="text-violet-400 mt-2">
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
