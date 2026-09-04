import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { getVideoDetail, type VideoDetail as VideoDetailT } from '../api/client'
import StatusBadge from '../components/StatusBadge'

export default function VideoDetail() {
  const { id } = useParams<{ id: string }>()
  const [detail, setDetail] = useState<VideoDetailT | null>(null)

  useEffect(() => {
    if (!id) return
    getVideoDetail(id).then(setDetail)
  }, [id])

  if (!detail) {
    return <div className="min-h-screen flex items-center justify-center text-slate-500">Loading...</div>
  }

  const { video, url } = detail

  return (
    <div className="min-h-screen max-w-4xl mx-auto px-4 py-8 space-y-6">
      <Link to="/" className="text-sm text-violet-400">&larr; Back to dashboard</Link>

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-100">{video.title}</h1>
        <StatusBadge status={video.status} />
      </div>

      {url ? (
        <video controls className="w-full rounded-lg bg-black" src={url} />
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 text-slate-400 text-sm">
          Upload still in progress...
        </div>
      )}
    </div>
  )
}
