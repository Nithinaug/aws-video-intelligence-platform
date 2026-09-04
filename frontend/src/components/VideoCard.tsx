import { Link } from 'react-router-dom'
import type { Video } from '../api/client'
import StatusBadge from './StatusBadge'

export default function VideoCard({ video }: { video: Video }) {
  return (
    <Link
      to={`/videos/${video.id}`}
      className="block bg-slate-900 border border-slate-800 rounded-lg p-4 hover:border-violet-600 transition-colors"
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-medium text-slate-100 truncate">{video.title}</h3>
        <StatusBadge status={video.status} />
      </div>
      <p className="text-xs text-slate-500 mt-2">{new Date(video.created_at).toLocaleString()}</p>
    </Link>
  )
}
