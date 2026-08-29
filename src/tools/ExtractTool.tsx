import { useState } from 'react'
import ToolShell from '../components/ToolShell'
import Dropzone from '../components/Dropzone'
import PageGrid from '../components/PageGrid'
import Button from '../components/Button'
import { usePdfDeck } from '../lib/usePdfDeck'
import { buildPdfFromDeck } from '../lib/pdfOps'
import { downloadBytes, baseName } from '../lib/files'
import { Loader2 } from 'lucide-react'

export default function ExtractTool({ onBack }: { onBack: () => void }) {
  const { sources, pages, loading, addFiles, reorder, toggleSelect, remove } = usePdfDeck()
  const [working, setWorking] = useState(false)

  const selectedCount = pages.filter((p) => p.selected).length

  async function handleExtract() {
    setWorking(true)
    try {
      const selected = pages.filter((p) => p.selected)
      const bytes = await buildPdfFromDeck(
        sources,
        selected.map((p) => ({ sourceId: p.sourceId, pageIndex: p.pageIndex, rotation: p.rotation }))
      )
      const name = sources[0] ? `${baseName(sources[0].name)}-extracted.pdf` : 'extracted.pdf'
      downloadBytes(bytes, name)
    } finally {
      setWorking(false)
    }
  }

  return (
    <ToolShell title="Extract Pages" subtitle="Select the pages you want and pull them into a new PDF" onBack={onBack}>
      {sources.length === 0 ? (
        <Dropzone accept="application/pdf" multiple={false} label="Drop a PDF here" sublabel="or click to browse" onFiles={(f) => addFiles(f.slice(0, 1))} />
      ) : (
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              Click pages to select · {selectedCount} of {pages.length} selected
            </p>
            <Button onClick={handleExtract} disabled={working || loading || selectedCount < 1}>
              {working ? <Loader2 className="animate-spin" size={16} /> : null}
              Extract {selectedCount} page{selectedCount === 1 ? '' : 's'}
            </Button>
          </div>
          <PageGrid pages={pages} onReorder={reorder} onToggleSelect={toggleSelect} onDelete={remove} selectable />
        </div>
      )}
    </ToolShell>
  )
}
