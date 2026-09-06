import { Link } from 'react-router-dom'
import type { Video } from '../api/client'
import StatusBadge from './StatusBadge'

export default function VideoCard({ video }: { video: Video }) {
  return (
    <Link
      to={`/videos/${video.id}`}
      className="block bg-[#131c27] border border-[#1e2d3d] rounded-2xl p-4 transition-colors hover:border-sky-400/50"
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-medium text-slate-100 truncate">{video.title}</h3>
        <StatusBadge status={video.status} />
      </div>
      <p className="text-xs text-slate-400 mt-2">{new Date(video.created_at).toLocaleString()}</p>
    </Link>
  )
}
