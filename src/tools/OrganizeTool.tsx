import { useState } from 'react'
import ToolShell from '../components/ToolShell'
import Dropzone from '../components/Dropzone'
import PageGrid from '../components/PageGrid'
import Button from '../components/Button'
import { usePdfDeck } from '../lib/usePdfDeck'
import { buildPdfFromDeck } from '../lib/pdfOps'
import { downloadBytes, baseName } from '../lib/files'
import { Loader2 } from 'lucide-react'

export default function OrganizeTool({ onBack }: { onBack: () => void }) {
  const { sources, pages, loading, addFiles, reorder, rotate, remove } = usePdfDeck()
  const [working, setWorking] = useState(false)

  async function handleSave() {
    setWorking(true)
    try {
      const bytes = await buildPdfFromDeck(
        sources,
        pages.map((p) => ({ sourceId: p.sourceId, pageIndex: p.pageIndex, rotation: p.rotation }))
      )
      const name = sources[0] ? `${baseName(sources[0].name)}-organized.pdf` : 'organized.pdf'
      downloadBytes(bytes, name)
    } finally {
      setWorking(false)
    }
  }

  return (
    <ToolShell title="Organize PDF" subtitle="Reorder, rotate, or delete pages" onBack={onBack}>
      {sources.length === 0 ? (
        <Dropzone accept="application/pdf" multiple={false} label="Drop a PDF here" sublabel="or click to browse" onFiles={(f) => addFiles(f.slice(0, 1))} />
      ) : (
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              Drag to reorder · rotate or delete individual pages · {pages.length} page{pages.length === 1 ? '' : 's'}
            </p>
            <Button onClick={handleSave} disabled={working || loading || pages.length < 1}>
              {working ? <Loader2 className="animate-spin" size={16} /> : null}
              Save changes
            </Button>
          </div>
          <PageGrid pages={pages} onReorder={reorder} onRotate={rotate} onDelete={remove} />
        </div>
      )}
    </ToolShell>
  )
}
