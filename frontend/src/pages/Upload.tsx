import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { completeUpload, createVideo, uploadToPresignedUrl } from '../api/client'

export default function Upload() {
  const navigate = useNavigate()
  const [title, setTitle] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [progress, setProgress] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    if (!file) return
    setError(null)
    try {
      setProgress('Creating video record...')
      const { video, upload_url } = await createVideo(title || file.name, file.name, file.type || 'video/mp4')

      setProgress('Uploading file...')
      await uploadToPresignedUrl(upload_url, file)

      setProgress('Finalizing...')
      await completeUpload(video.id)

      navigate(`/videos/${video.id}`)
    } catch (err: any) {
      setError(err?.response?.data?.error ?? 'Upload failed')
      setProgress(null)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <form onSubmit={onSubmit} className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-lg p-6 space-y-4">
        <h1 className="text-xl font-semibold text-slate-100">Upload a video</h1>
        {error && <p className="text-sm text-red-400">{error}</p>}
        <div>
          <label className="block text-sm text-slate-400 mb-1">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Project Meeting.mp4"
            className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-slate-100"
          />
        </div>
        <div>
          <label className="block text-sm text-slate-400 mb-1">Video file</label>
          <input
            type="file"
            accept="video/*"
            required
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="w-full text-slate-300 text-sm"
          />
        </div>
        <button
          type="submit"
          disabled={!!progress}
          className="w-full bg-violet-600 hover:bg-violet-500 disabled:opacity-50 rounded px-3 py-2 font-medium"
        >
          {progress ?? 'Upload'}
        </button>
      </form>
    </div>
  )
}
