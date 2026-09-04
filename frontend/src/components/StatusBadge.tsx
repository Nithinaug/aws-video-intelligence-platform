const STYLES: Record<string, string> = {
  uploading: 'bg-slate-700 text-slate-200',
  uploaded: 'bg-emerald-900 text-emerald-200',
}

const LABELS: Record<string, string> = {
  uploading: 'Uploading',
  uploaded: 'Uploaded',
}

export default function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STYLES[status] ?? 'bg-slate-700 text-slate-200'}`}>
      {LABELS[status] ?? status}
    </span>
  )
}
