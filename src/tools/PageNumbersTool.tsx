import { useState } from 'react'
import ToolShell from '../components/ToolShell'
import Dropzone from '../components/Dropzone'
import Button from '../components/Button'
import { addPageNumbers } from '../lib/pdfOps'
import { fileToBytes, downloadBytes, baseName } from '../lib/files'
import { Loader2, FileText } from 'lucide-react'
import clsx from 'clsx'

type Position = 'bottom-left' | 'bottom-center' | 'bottom-right'

export default function PageNumbersTool({ onBack }: { onBack: () => void }) {
  const [file, setFile] = useState<{ name: string; bytes: Uint8Array } | null>(null)
  const [position, setPosition] = useState<Position>('bottom-center')
  const [startAt, setStartAt] = useState(1)
  const [working, setWorking] = useState(false)

  async function onFiles(files: File[]) {
    const f = files[0]
    if (!f) return
    setFile({ name: f.name, bytes: await fileToBytes(f) })
  }

  async function handleApply() {
    if (!file) return
    setWorking(true)
    try {
      const bytes = await addPageNumbers(file.bytes, { position, startAt })
      downloadBytes(bytes, `${baseName(file.name)}-numbered.pdf`)
    } finally {
      setWorking(false)
    }
  }

  const positions: { id: Position; label: string }[] = [
    { id: 'bottom-left', label: 'Bottom left' },
    { id: 'bottom-center', label: 'Bottom center' },
    { id: 'bottom-right', label: 'Bottom right' },
  ]

  return (
    <ToolShell title="Page Numbers" subtitle="Add page numbers to your document" onBack={onBack}>
      {!file ? (
        <Dropzone accept="application/pdf" multiple={false} label="Drop a PDF here" sublabel="or click to browse" onFiles={onFiles} />
      ) : (
        <div className="mx-auto flex max-w-xl flex-col gap-5">
          <div className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-white p-3 dark:border-neutral-800 dark:bg-neutral-900">
            <FileText className="text-accent" size={20} />
            <span className="text-sm font-medium">{file.name}</span>
          </div>

          <div>
            <p className="mb-2 text-sm font-medium">Position</p>
            <div className="flex gap-2">
              {positions.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setPosition(p.id)}
                  className={clsx(
                    'flex-1 rounded-lg border px-3 py-2 text-sm transition',
                    position === p.id
                      ? 'border-accent bg-accent/10 text-accent font-semibold'
                      : 'border-neutral-300 text-neutral-600 hover:border-neutral-400 dark:border-neutral-700 dark:text-neutral-300'
                  )}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <label className="flex flex-col gap-1.5 text-sm font-medium">
            Start numbering at
            <input
              type="number"
              min={0}
              value={startAt}
              onChange={(e) => setStartAt(Number(e.target.value))}
              className="w-28 rounded-lg border border-neutral-300 px-3 py-1.5 dark:border-neutral-700 dark:bg-neutral-800"
            />
          </label>

          <Button size="lg" onClick={handleApply} disabled={working}>
            {working ? <Loader2 className="animate-spin" size={16} /> : null}
            Add page numbers
          </Button>
        </div>
      )}
    </ToolShell>
  )
}
