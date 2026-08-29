import { useState } from 'react'
import ToolShell from '../components/ToolShell'
import Dropzone from '../components/Dropzone'
import Button from '../components/Button'
import { compressPdf } from '../lib/pdfOps'
import { fileToBytes, downloadBytes, baseName } from '../lib/files'
import { Loader2, FileText } from 'lucide-react'

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

export default function CompressTool({ onBack }: { onBack: () => void }) {
  const [file, setFile] = useState<{ name: string; bytes: Uint8Array } | null>(null)
  const [working, setWorking] = useState(false)
  const [result, setResult] = useState<{ bytes: Uint8Array; originalSize: number } | null>(null)

  async function onFiles(files: File[]) {
    const f = files[0]
    if (!f) return
    setResult(null)
    setFile({ name: f.name, bytes: await fileToBytes(f) })
  }

  async function handleCompress() {
    if (!file) return
    setWorking(true)
    try {
      const bytes = await compressPdf(file.bytes)
      setResult({ bytes, originalSize: file.bytes.byteLength })
    } finally {
      setWorking(false)
    }
  }

  return (
    <ToolShell title="Compress PDF" subtitle="Shrink file size by rebuilding the document and stripping metadata" onBack={onBack}>
      {!file ? (
        <Dropzone accept="application/pdf" multiple={false} label="Drop a PDF here" sublabel="or click to browse" onFiles={onFiles} />
      ) : (
        <div className="mx-auto flex max-w-xl flex-col gap-5">
          <div className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-white p-3 dark:border-neutral-800 dark:bg-neutral-900">
            <FileText className="text-accent" size={20} />
            <div>
              <p className="text-sm font-medium">{file.name}</p>
              <p className="text-xs text-neutral-500">{formatSize(file.bytes.byteLength)}</p>
            </div>
          </div>

          {result && (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300">
              Compressed from {formatSize(result.originalSize)} to {formatSize(result.bytes.byteLength)}
              {result.bytes.byteLength < result.originalSize && (
                <> · {Math.round((1 - result.bytes.byteLength / result.originalSize) * 100)}% smaller</>
              )}
            </div>
          )}

          <div className="flex gap-3">
            <Button size="lg" onClick={handleCompress} disabled={working} className="flex-1">
              {working ? <Loader2 className="animate-spin" size={16} /> : null}
              Compress
            </Button>
            {result && (
              <Button
                size="lg"
                variant="secondary"
                className="flex-1"
                onClick={() => downloadBytes(result.bytes, `${baseName(file.name)}-compressed.pdf`)}
              >
                Download
              </Button>
            )}
          </div>
        </div>
      )}
    </ToolShell>
  )
}
