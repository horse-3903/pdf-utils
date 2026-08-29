import { useCallback, useState } from 'react'
import { fileToBytes, uid } from './files'
import { getPageCount, renderPageThumbnail } from './pdfjs'
import type { GridPage } from '../components/PageGrid'

export interface DeckSource {
  id: string
  name: string
  bytes: Uint8Array
}

export interface DeckPage extends GridPage {
  sourceId: string
  pageIndex: number
}

export function usePdfDeck() {
  const [sources, setSources] = useState<DeckSource[]>([])
  const [pages, setPages] = useState<DeckPage[]>([])
  const [loading, setLoading] = useState(false)

  const addFiles = useCallback(async (files: File[]) => {
    setLoading(true)
    for (const file of files) {
      const bytes = await fileToBytes(file)
      const sourceId = uid()
      setSources((prev) => [...prev, { id: sourceId, name: file.name, bytes }])

      let count = 0
      try {
        count = await getPageCount(bytes)
      } catch {
        continue
      }

      const stubPages: DeckPage[] = Array.from({ length: count }, (_, i) => ({
        id: `${sourceId}-${i}`,
        sourceId,
        pageIndex: i,
        thumbnail: null,
        label: `${file.name.replace(/\.pdf$/i, '')} · ${i + 1}`,
        rotation: 0,
        selected: true,
      }))
      setPages((prev) => [...prev, ...stubPages])

      stubPages.forEach((p) => {
        renderPageThumbnail(bytes, p.pageIndex)
          .then((thumb) => {
            setPages((prev) => prev.map((pg) => (pg.id === p.id ? { ...pg, thumbnail: thumb } : pg)))
          })
          .catch(() => {})
      })
    }
    setLoading(false)
  }, [])

  const reorder = useCallback((next: GridPage[]) => {
    setPages(next as DeckPage[])
  }, [])

  const toggleSelect = useCallback((id: string) => {
    setPages((prev) => prev.map((p) => (p.id === id ? { ...p, selected: !p.selected } : p)))
  }, [])

  const rotate = useCallback((id: string) => {
    setPages((prev) => prev.map((p) => (p.id === id ? { ...p, rotation: (p.rotation + 90) % 360 } : p)))
  }, [])

  const remove = useCallback((id: string) => {
    setPages((prev) => prev.filter((p) => p.id !== id))
  }, [])

  const clear = useCallback(() => {
    setSources([])
    setPages([])
  }, [])

  return { sources, pages, loading, addFiles, reorder, toggleSelect, rotate, remove, clear, setPages }
}
