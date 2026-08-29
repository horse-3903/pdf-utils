import { useState } from 'react'
import ToolShell from '../components/ToolShell'
import Dropzone from '../components/Dropzone'
import Button from '../components/Button'
import { imagesToPdf } from '../lib/pdfOps'
import { fileToBytes, downloadBytes, uid } from '../lib/files'
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import type { DragEndEvent } from '@dnd-kit/core'
import { SortableContext, rectSortingStrategy, useSortable, arrayMove } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Loader2, X } from 'lucide-react'
import clsx from 'clsx'

interface ImgItem {
  id: string
  name: string
  url: string
  type: 'png' | 'jpg'
  bytes: Uint8Array
}

export default function ImagesToPdfTool({ onBack }: { onBack: () => void }) {
  const [items, setItems] = useState<ImgItem[]>([])
  const [working, setWorking] = useState(false)
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }))

  async function addFiles(files: File[]) {
    const next: ImgItem[] = []
    for (const file of files) {
      if (!/image\/(png|jpe?g)/.test(file.type)) continue
      const bytes = await fileToBytes(file)
      next.push({
        id: uid(),
        name: file.name,
        url: URL.createObjectURL(file),
        type: file.type.includes('png') ? 'png' : 'jpg',
        bytes,
      })
    }
    setItems((prev) => [...prev, ...next])
  }

  function handleDragEnd(e: DragEndEvent) {
    const { active, over } = e
    if (!over || active.id === over.id) return
    setItems((prev) => {
      const oldIndex = prev.findIndex((p) => p.id === active.id)
      const newIndex = prev.findIndex((p) => p.id === over.id)
      return arrayMove(prev, oldIndex, newIndex)
    })
  }

  async function handleConvert() {
    setWorking(true)
    try {
      const bytes = await imagesToPdf(items.map((i) => ({ data: i.bytes, type: i.type })))
      downloadBytes(bytes, 'images.pdf')
    } finally {
      setWorking(false)
    }
  }

  return (
    <ToolShell title="Images to PDF" subtitle="Turn JPG or PNG images into a single PDF" onBack={onBack}>
      {items.length === 0 ? (
        <Dropzone accept="image/png,image/jpeg" label="Drop images here" sublabel="PNG or JPG — add as many as you like" onFiles={addFiles} />
      ) : (
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              Drag to reorder · {items.length} image{items.length === 1 ? '' : 's'}
            </p>
            <div className="flex gap-2">
              <label>
                <input type="file" accept="image/png,image/jpeg" multiple className="hidden" onChange={(e) => e.target.files && addFiles(Array.from(e.target.files))} />
                <span className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl bg-neutral-100 px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-700">
                  Add more
                </span>
              </label>
              <Button onClick={handleConvert} disabled={working}>
                {working ? <Loader2 className="animate-spin" size={16} /> : null}
                Create PDF
              </Button>
            </div>
          </div>

          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={items.map((i) => i.id)} strategy={rectSortingStrategy}>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {items.map((item) => (
                  <ImageCard key={item.id} item={item} onRemove={() => setItems((prev) => prev.filter((p) => p.id !== item.id))} />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </div>
      )}
    </ToolShell>
  )
}

function ImageCard({ item, onRemove }: { item: ImgItem; onRemove: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id })
  const style = { transform: CSS.Transform.toString(transform), transition }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={clsx(
        'group relative aspect-[3/4] overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm cursor-grab active:cursor-grabbing dark:border-neutral-800 dark:bg-neutral-900',
        isDragging && 'opacity-50 z-10'
      )}
    >
      <img src={item.url} alt={item.name} draggable={false} className="h-full w-full object-cover" />
      <button
        onPointerDown={(e) => e.stopPropagation()}
        onClick={(e) => {
          e.stopPropagation()
          onRemove()
        }}
        className="absolute right-1.5 top-1.5 rounded-full bg-black/50 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100"
      >
        <X size={13} />
      </button>
    </div>
  )
}
