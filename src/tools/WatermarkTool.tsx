import { useState } from 'react'
import ToolShell from '../components/ToolShell'
import Dropzone from '../components/Dropzone'
import Button from '../components/Button'
import { addWatermark } from '../lib/pdfOps'
import { fileToBytes, downloadBytes, baseName } from '../lib/files'
import { Loader2, FileText } from 'lucide-react'

export default function WatermarkTool({ onBack }: { onBack: () => void }) {
  const [file, setFile] = useState<{ name: string; bytes: Uint8Array } | null>(null)
  const [text, setText] = useState('CONFIDENTIAL')
  const [opacity, setOpacity] = useState(0.3)
  const [fontSize, setFontSize] = useState(48)
  const [rotate, setRotate] = useState(45)
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
      const bytes = await addWatermark(file.bytes, text, { opacity, fontSize, rotate })
      downloadBytes(bytes, `${baseName(file.name)}-watermarked.pdf`)
    } finally {
      setWorking(false)
    }
  }

  return (
    <ToolShell title="Watermark" subtitle="Stamp text across every page" onBack={onBack}>
      {!file ? (
        <Dropzone accept="application/pdf" multiple={false} label="Drop a PDF here" sublabel="or click to browse" onFiles={onFiles} />
      ) : (
        <div className="mx-auto flex max-w-xl flex-col gap-5">
          <div className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-white p-3 dark:border-neutral-800 dark:bg-neutral-900">
            <FileText className="text-accent" size={20} />
            <span className="text-sm font-medium">{file.name}</span>
          </div>

          <label className="flex flex-col gap-1.5 text-sm font-medium">
            Watermark text
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="rounded-lg border border-neutral-300 px-3 py-2 dark:border-neutral-700 dark:bg-neutral-800"
            />
          </label>

          <div className="grid grid-cols-3 gap-4">
            <label className="flex flex-col gap-1.5 text-sm font-medium">
              Opacity
              <input type="range" min={0.05} max={1} step={0.05} value={opacity} onChange={(e) => setOpacity(Number(e.target.value))} />
            </label>
            <label className="flex flex-col gap-1.5 text-sm font-medium">
              Font size
              <input
                type="number"
                value={fontSize}
                min={8}
                max={200}
                onChange={(e) => setFontSize(Number(e.target.value))}
                className="rounded-lg border border-neutral-300 px-3 py-1.5 dark:border-neutral-700 dark:bg-neutral-800"
              />
            </label>
            <label className="flex flex-col gap-1.5 text-sm font-medium">
              Rotation
              <input
                type="number"
                value={rotate}
                min={-90}
                max={90}
                onChange={(e) => setRotate(Number(e.target.value))}
                className="rounded-lg border border-neutral-300 px-3 py-1.5 dark:border-neutral-700 dark:bg-neutral-800"
              />
            </label>
          </div>

          <Button size="lg" onClick={handleApply} disabled={working || !text}>
            {working ? <Loader2 className="animate-spin" size={16} /> : null}
            Apply watermark
          </Button>
        </div>
      )}
    </ToolShell>
  )
}
