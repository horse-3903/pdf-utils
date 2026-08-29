import { useMemo, useState } from 'react'
import ToolShell from '../components/ToolShell'
import Dropzone from '../components/Dropzone'
import PageGrid from '../components/PageGrid'
import Button from '../components/Button'
import { usePdfDeck } from '../lib/usePdfDeck'
import { splitPdf } from '../lib/pdfOps'
import { downloadMultiple, baseName } from '../lib/files'
import { Loader2 } from 'lucide-react'

type Mode = 'every-n' | 'custom'

function parseRanges(input: string, pageCount: number): [number, number][] {
  const ranges: [number, number][] = []
  for (const part of input.split(',')) {
    const trimmed = part.trim()
    if (!trimmed) continue
    const match = trimmed.match(/^(\d+)\s*-\s*(\d+)$/)
    if (match) {
      const start = Math.max(1, parseInt(match[1], 10))
      const end = Math.min(pageCount, parseInt(match[2], 10))
      if (start <= end) ranges.push([start - 1, end - 1])
    } else if (/^\d+$/.test(trimmed)) {
      const n = parseInt(trimmed, 10)
      if (n >= 1 && n <= pageCount) ranges.push([n - 1, n - 1])
    }
  }
  return ranges
}

function everyN(n: number, pageCount: number): [number, number][] {
  const ranges: [number, number][] = []
  for (let start = 0; start < pageCount; start += n) {
    ranges.push([start, Math.min(start + n - 1, pageCount - 1)])
  }
  return ranges
}

export default function SplitTool({ onBack }: { onBack: () => void }) {
  const { sources, pages, addFiles } = usePdfDeck()
  const [mode, setMode] = useState<Mode>('every-n')
  const [n, setN] = useState(1)
  const [customRanges, setCustomRanges] = useState('')
  const [working, setWorking] = useState(false)

  const ranges = useMemo(() => {
    if (pages.length === 0) return []
    return mode === 'every-n' ? everyN(Math.max(1, n), pages.length) : parseRanges(customRanges, pages.length)
  }, [mode, n, customRanges, pages.length])

  async function handleSplit() {
    if (!sources[0] || ranges.length === 0) return
    setWorking(true)
    try {
      const parts = await splitPdf(sources[0].bytes, ranges)
      const name = baseName(sources[0].name)
      await downloadMultiple(
        parts.map((data, i) => ({
          name: `${name}-part${i + 1}-p${ranges[i][0] + 1}-${ranges[i][1] + 1}.pdf`,
          data,
        }))
      )
    } finally {
      setWorking(false)
    }
  }

  return (
    <ToolShell title="Split PDF" subtitle="Break a PDF into separate files by page range" onBack={onBack}>
      {sources.length === 0 ? (
        <Dropzone accept="application/pdf" multiple={false} label="Drop a PDF here" sublabel="or click to browse" onFiles={(f) => addFiles(f.slice(0, 1))} />
      ) : (
        <div className="flex flex-col gap-6">
          <div className="flex flex-wrap items-end justify-between gap-4 rounded-2xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
            <div className="flex gap-6">
              <label className="flex cursor-pointer items-center gap-2 text-sm">
                <input type="radio" checked={mode === 'every-n'} onChange={() => setMode('every-n')} />
                Split every
                <input
                  type="number"
                  min={1}
                  max={pages.length}
                  value={n}
                  onChange={(e) => setN(parseInt(e.target.value || '1', 10))}
                  onFocus={() => setMode('every-n')}
                  className="w-16 rounded-md border border-neutral-300 px-2 py-1 dark:border-neutral-700 dark:bg-neutral-800"
                />
                pages
              </label>
              <label className="flex cursor-pointer items-center gap-2 text-sm">
                <input type="radio" checked={mode === 'custom'} onChange={() => setMode('custom')} />
                Custom ranges
                <input
                  type="text"
                  placeholder="e.g. 1-3, 4-9, 10"
                  value={customRanges}
                  onChange={(e) => setCustomRanges(e.target.value)}
                  onFocus={() => setMode('custom')}
                  className="w-56 rounded-md border border-neutral-300 px-2 py-1 dark:border-neutral-700 dark:bg-neutral-800"
                />
              </label>
            </div>
            <Button onClick={handleSplit} disabled={working || ranges.length === 0}>
              {working ? <Loader2 className="animate-spin" size={16} /> : null}
              Split into {ranges.length} file{ranges.length === 1 ? '' : 's'}
            </Button>
          </div>
          <PageGrid pages={pages} onReorder={() => {}} />
        </div>
      )}
    </ToolShell>
  )
}
