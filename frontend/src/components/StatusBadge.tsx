const STYLES: Record<string, string> = {
  uploading: 'bg-[#334155]/30 text-slate-300',
  uploaded: 'bg-[#10B981]/15 text-emerald-300',
}

const LABELS: Record<string, string> = {
  uploading: 'Uploading',
  uploaded: 'Uploaded',
}

export default function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`px-2.5 py-0.5 rounded-md text-[11px] font-bold ${STYLES[status] ?? 'bg-[#334155]/30 text-slate-300'}`}>
      {LABELS[status] ?? status}
    </span>
  )
}
