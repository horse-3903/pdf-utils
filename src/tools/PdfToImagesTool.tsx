import { useState } from 'react'
import JSZip from 'jszip'
import ToolShell from '../components/ToolShell'
import Dropzone from '../components/Dropzone'
import PageGrid from '../components/PageGrid'
import Button from '../components/Button'
import { usePdfDeck } from '../lib/usePdfDeck'
import { renderPageToCanvas } from '../lib/pdfjs'
import { downloadBytes, downloadMultiple, baseName } from '../lib/files'
import { Loader2 } from 'lucide-react'

export default function PdfToImagesTool({ onBack }: { onBack: () => void }) {
  const { sources, pages, addFiles } = usePdfDeck()
  const [working, setWorking] = useState(false)
  const [scale, setScale] = useState(2)

  async function handleExport() {
    if (!sources[0]) return
    setWorking(true)
    try {
      const name = baseName(sources[0].name)
      const images: { name: string; data: Uint8Array }[] = []
      for (let i = 0; i < pages.length; i++) {
        const canvas = await renderPageToCanvas(sources[0].bytes, i, scale)
        const blob: Blob = await new Promise((resolve) => canvas.toBlob((b) => resolve(b!), 'image/png'))
        const buf = new Uint8Array(await blob.arrayBuffer())
        images.push({ name: `${name}-page${i + 1}.png`, data: buf })
      }

      if (images.length === 1) {
        downloadBytes(images[0].data, images[0].name, 'image/png')
        return
      }

      if ((window as any).desktop?.isElectron) {
        await downloadMultiple(images)
      } else {
        const zip = new JSZip()
        images.forEach((img) => zip.file(img.name, img.data))
        const zipped = await zip.generateAsync({ type: 'uint8array' })
        downloadBytes(zipped, `${name}-images.zip`, 'application/zip')
      }
    } finally {
      setWorking(false)
    }
  }

  return (
    <ToolShell title="PDF to Images" subtitle="Export every page as a PNG image" onBack={onBack}>
      {sources.length === 0 ? (
        <Dropzone accept="application/pdf" multiple={false} label="Drop a PDF here" sublabel="or click to browse" onFiles={(f) => addFiles(f.slice(0, 1))} />
      ) : (
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between rounded-2xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
            <label className="flex items-center gap-2 text-sm">
              Quality
              <select
                value={scale}
                onChange={(e) => setScale(Number(e.target.value))}
                className="rounded-md border border-neutral-300 px-2 py-1 dark:border-neutral-700 dark:bg-neutral-800"
              >
                <option value={1}>Standard</option>
                <option value={2}>High</option>
                <option value={3}>Very high</option>
              </select>
            </label>
            <Button onClick={handleExport} disabled={working || pages.length === 0}>
              {working ? <Loader2 className="animate-spin" size={16} /> : null}
              Export {pages.length} image{pages.length === 1 ? '' : 's'}
            </Button>
          </div>
          <PageGrid pages={pages} onReorder={() => {}} />
        </div>
      )}
    </ToolShell>
  )
}
