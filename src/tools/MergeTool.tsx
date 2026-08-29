import { useState } from 'react'
import ToolShell from '../components/ToolShell'
import Dropzone from '../components/Dropzone'
import PageGrid from '../components/PageGrid'
import Button from '../components/Button'
import { usePdfDeck } from '../lib/usePdfDeck'
import { buildPdfFromDeck } from '../lib/pdfOps'
import { downloadBytes } from '../lib/files'
import { Loader2, Plus } from 'lucide-react'

export default function MergeTool({ onBack }: { onBack: () => void }) {
  const { sources, pages, loading, addFiles, reorder, rotate, remove } = usePdfDeck()
  const [working, setWorking] = useState(false)

  async function handleMerge() {
    setWorking(true)
    try {
      const bytes = await buildPdfFromDeck(
        sources,
        pages.map((p) => ({ sourceId: p.sourceId, pageIndex: p.pageIndex, rotation: p.rotation }))
      )
      downloadBytes(bytes, 'merged.pdf')
    } finally {
      setWorking(false)
    }
  }

  return (
    <ToolShell title="Merge PDF" subtitle="Combine multiple PDFs into one document" onBack={onBack}>
      {pages.length === 0 ? (
        <Dropzone accept="application/pdf" label="Drop PDFs here" sublabel="or click to browse — add as many as you like" onFiles={addFiles} />
      ) : (
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              Drag pages to reorder · {pages.length} page{pages.length === 1 ? '' : 's'} from {sources.length} file
              {sources.length === 1 ? '' : 's'}
            </p>
            <div className="flex gap-2">
              <label>
                <input
                  type="file"
                  accept="application/pdf"
                  multiple
                  className="hidden"
                  onChange={(e) => e.target.files && addFiles(Array.from(e.target.files))}
                />
                <span className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl bg-neutral-100 px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-700">
                  <Plus size={15} /> Add more
                </span>
              </label>
              <Button onClick={handleMerge} disabled={working || loading || pages.length < 1}>
                {working ? <Loader2 className="animate-spin" size={16} /> : null}
                Merge {pages.length} pages
              </Button>
            </div>
          </div>
          <PageGrid pages={pages} onReorder={reorder} onRotate={rotate} onDelete={remove} />
        </div>
      )}
    </ToolShell>
  )
}
